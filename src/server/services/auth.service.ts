/**
 * Auth service — register, login, logout, getMe.
 *
 * This is the only place that orchestrates:
 *   - Zod input validation schemas
 *   - bcryptjs password hashing / verification
 *   - User + profile + role creation
 *   - Audit event writing
 *   - Session token creation
 *
 * Route handlers call these functions; they never call db or repositories directly.
 */
import 'server-only'

import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { createHash, randomBytes } from 'node:crypto'

import {
  createPasswordResetToken,
  createSession,
  type SessionPayload,
  verifyPasswordResetToken,
} from '@/server/auth/session'
import * as userRepo from '@/server/repositories/user.repository'
import * as emailVerificationRepo from '@/server/repositories/email-verification.repository'
import { writeAuditEvent } from '@/server/audit'

// ---------------------------------------------------------------------------
// Zod schemas (exported so route handlers can reuse them)
// ---------------------------------------------------------------------------

export const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be at most 128 characters'),
  dateOfBirth: z.string().date('Date of birth must be a valid date').optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).optional(),
  bloodGroup: z
    .enum([
      'A_POSITIVE',
      'A_NEGATIVE',
      'B_POSITIVE',
      'B_NEGATIVE',
      'AB_POSITIVE',
      'AB_NEGATIVE',
      'O_POSITIVE',
      'O_NEGATIVE',
      'UNKNOWN',
    ])
    .optional(),
  phone: z.string().trim().min(7, 'Phone number must be at least 7 characters').max(30).optional(),
  locale: z.string().optional().default('en'),
})

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const ForgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
  locale: z.string().optional(),
})

export const ResetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be at most 128 characters'),
})

export type RegisterInput = z.infer<typeof RegisterSchema>
export type LoginInput = z.infer<typeof LoginSchema>
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>

// ---------------------------------------------------------------------------
// Error types
// ---------------------------------------------------------------------------

export class AuthError extends Error {
  constructor(
    public readonly code: 'EMAIL_TAKEN' | 'INVALID_CREDENTIALS' | 'ACCOUNT_DISABLED' | 'EMAIL_NOT_VERIFIED',
    message: string,
  ) {
    super(message)
    this.name = 'AuthError'
  }
}

// ---------------------------------------------------------------------------
// Service functions
// ---------------------------------------------------------------------------

const BCRYPT_ROUNDS = 12

/**
 * Register a new patient.
 *
 * Steps:
 * 1. Check email uniqueness.
 * 2. Hash password.
 * 3. Create user, patient profile, role assignment, and preferences.
 * 4. Write audit event.
 * 5. Create a one-time email verification token.
 */
export async function registerPatient(
  input: RegisterInput,
  ipAddress?: string,
): Promise<{ userId: string; email: string; verificationToken: string }> {
  // Uniqueness check
  const existing = await userRepo.findByEmail(input.email)
  if (existing) throw new AuthError('EMAIL_TAKEN', 'An account with this email already exists.')

  // Hash password
  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS)

  // Persist — name lives in PatientProfile.fullName
  const user = await userRepo.createUser({
    displayName: input.name,
    email: input.email,
    passwordHash,
  })
  await userRepo.createPatientProfile({
    userId: user.id,
    fullName: input.name,
    dateOfBirth: input.dateOfBirth ? new Date(`${input.dateOfBirth}T00:00:00.000Z`) : undefined,
    gender: input.gender,
    bloodGroup: input.bloodGroup,
    phone: input.phone,
  })
  await userRepo.assignRole(user.id, 'patient')
  await userRepo.upsertPreferences(user.id, input.locale, 'system')

  const verificationToken = randomBytes(32).toString('hex')
  const tokenHash = createHash('sha256').update(verificationToken).digest('hex')
  await emailVerificationRepo.replaceForUser(user.id, tokenHash, new Date(Date.now() + 24 * 60 * 60 * 1000))

  // Audit
  writeAuditEvent({
    actorType: 'USER',
    actorId: user.id,
    action: 'auth.register',
    entityType: 'User',
    entityId: user.id,
    ipAddress,
  })

  return { userId: user.id, email: user.email, verificationToken }
}

/** Create or replace the signed-in user's email verification request. */
export async function createEmailVerificationRequest(userId: string) {
  const user = await userRepo.findById(userId)
  if (!user || user.emailVerifiedAt) return null

  const verificationToken = randomBytes(32).toString('hex')
  const tokenHash = createHash('sha256').update(verificationToken).digest('hex')
  await emailVerificationRepo.replaceForUser(
    user.id,
    tokenHash,
    new Date(Date.now() + 24 * 60 * 60 * 1000),
  )

  writeAuditEvent({
    actorType: 'USER',
    actorId: user.id,
    action: 'auth.email_verification_requested',
    entityType: 'User',
    entityId: user.id,
  })

  return {
    email: user.email,
    name: user.patientProfile?.fullName ?? user.doctorProfile?.fullName ?? user.email.split('@')[0],
    verificationToken,
  }
}

/**
 * Authenticate a user with email + password.
 *
 * Returns the session payload on success.
 * Throws `AuthError('INVALID_CREDENTIALS')` on bad credentials.
 */
export async function login(
  input: LoginInput,
  ipAddress?: string,
): Promise<{ session: SessionPayload; userId: string }> {
  const user = await userRepo.findByEmail(input.email)

  // Always run bcrypt compare to prevent timing attacks.
  const dummyHash = '$2b$12$invalidhashfortimingnormalization000000000000000000000000'
  const passwordMatch = await bcrypt.compare(
    input.password,
    user?.passwordHash ?? dummyHash,
  )

  if (!user || !passwordMatch) {
    writeAuditEvent({
      actorType: 'SYSTEM',
      action: 'auth.login_failed',
      entityType: 'User',
      metadata: { email: input.email },
      ipAddress,
    })
    throw new AuthError('INVALID_CREDENTIALS', 'Invalid email or password.')
  }

  if (user.status !== 'ACTIVE') {
    throw new AuthError('ACCOUNT_DISABLED', 'Your account has been disabled. Please contact support.')
  }

  const roles = user.userRoles.map((ur) => ur.role.name)

  writeAuditEvent({
    actorType: 'USER',
    actorId: user.id,
    action: 'auth.login',
    entityType: 'User',
    entityId: user.id,
    ipAddress,
  })

  const session: SessionPayload = {
    userId: user.id,
    email: user.email,
    roles,
    organizationId: null, // Will be populated once org membership is modelled in M4+
  }

  return { session, userId: user.id }
}

/** Verify a one-time email token and mark the associated account as verified. */
export async function verifyEmailAddress(token: string): Promise<boolean> {
  const tokenHash = createHash('sha256').update(token).digest('hex')
  const verification = await emailVerificationRepo.findValidByHash(tokenHash)
  if (!verification) return false

  const consumed = await emailVerificationRepo.consume(verification.id)
  if (consumed.count !== 1) return false

  await userRepo.setEmailVerified(verification.userId)
  await emailVerificationRepo.deleteForUser(verification.userId)
  writeAuditEvent({
    actorType: 'USER',
    actorId: verification.userId,
    action: 'auth.email_verified',
    entityType: 'User',
    entityId: verification.userId,
  })

  return true
}

/** Create a reset token without revealing whether an email is registered. */
export async function requestPasswordReset(email: string): Promise<string | null> {
  const user = await userRepo.findByEmail(email)
  if (!user || !user.passwordHash) return null

  return createPasswordResetToken(user.id)
}

/** Set a new password when the reset token is valid and has not been superseded. */
export async function resetPassword(input: ResetPasswordInput): Promise<boolean> {
  const tokenPayload = await verifyPasswordResetToken(input.token)
  if (!tokenPayload) return false

  const user = await userRepo.findById(tokenPayload.userId)
  if (!user || !user.passwordHash || user.updatedAt.getTime() > tokenPayload.issuedAt * 1000) {
    return false
  }

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS)
  await userRepo.updatePasswordHash(user.id, passwordHash)
  writeAuditEvent({
    actorType: 'USER',
    actorId: user.id,
    action: 'auth.password_reset',
    entityType: 'User',
    entityId: user.id,
  })

  return true
}

/**
 * Record a logout event (session invalidation is handled by clearing the cookie).
 */
export async function logout(userId: string, ipAddress?: string): Promise<void> {
  writeAuditEvent({
    actorType: 'USER',
    actorId: userId,
    action: 'auth.logout',
    entityType: 'User',
    entityId: userId,
    ipAddress,
  })
}

/**
 * Fetch the current user's public profile (no password hash).
 * Returns `null` if the user record no longer exists.
 */
export async function getMe(userId: string) {
  const user = await userRepo.findById(userId)
  if (!user) return null

  const isEmailVerified = user.emailVerifiedAt !== null

  return {
    userId: user.id,
    name: user.patientProfile?.fullName ?? user.doctorProfile?.fullName ?? '',
    email: user.email,
    isEmailVerified,
    roles: user.userRoles.map((ur) => ur.role.name),
    patientProfile: user.patientProfile
      ? { id: user.patientProfile.id }
      : null,
    doctorProfile: user.doctorProfile
      ? {
          id: user.doctorProfile.id,
          verificationStatus: user.doctorProfile.verificationStatus,
        }
      : null,
  }
}

// ---------------------------------------------------------------------------
// Re-export session creator so route handlers don't import jose directly
// ---------------------------------------------------------------------------
export { createSession }
