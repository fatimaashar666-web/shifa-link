/**
 * User repository — the ONLY place that queries User, PatientProfile,
 * DoctorProfile, Role, and UserPreference from Prisma.
 *
 * Route handlers and services MUST NOT import `db` directly;
 * they call these repository functions instead.
 */
import 'server-only'

import { db } from '@/server/db'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CreateUserData {
  /** Display name stored in PatientProfile/DoctorProfile fullName. */
  displayName: string
  email: string
  passwordHash: string
}

export interface CreatePatientProfileData {
  userId: string
  fullName: string
  dateOfBirth?: Date
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY'
  bloodGroup?:
    | 'A_POSITIVE'
    | 'A_NEGATIVE'
    | 'B_POSITIVE'
    | 'B_NEGATIVE'
    | 'AB_POSITIVE'
    | 'AB_NEGATIVE'
    | 'O_POSITIVE'
    | 'O_NEGATIVE'
    | 'UNKNOWN'
  phone?: string
}

export interface CreateDoctorProfileData {
  userId: string
  fullName: string
  licenseNumber: string
  specialtySlug?: string
  /** Defaults to 0.00 — updated later in the doctor onboarding flow. */
  consultationFee?: number
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/** Look up a user by email (case-insensitive). Returns null if not found. */
export async function findByEmail(email: string) {
  return db.user.findUnique({
    where: { email: email.toLowerCase().trim() },
    include: {
      userRoles: { include: { role: true } },
    },
  })
}

/** Look up a user by primary key. Returns null if not found. */
export async function findById(userId: string) {
  return db.user.findUnique({
    where: { id: userId },
    include: {
      userRoles: { include: { role: true } },
      patientProfile: true,
      doctorProfile: true,
    },
  })
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

/**
 * Create a new user record.
 *
 * Always stores the email in lower-case for consistent lookups.
 * The caller is responsible for hashing the password before passing it here.
 */
export async function createUser(data: CreateUserData) {
  return db.user.create({
    data: {
      email: data.email.toLowerCase().trim(),
      passwordHash: data.passwordHash,
      status: 'ACTIVE',
      // Email verification is intentionally disabled for the current MVP flow.
      emailVerifiedAt: new Date(),
    },
  })
}

/** Attach a PatientProfile to an existing user. */
export async function createPatientProfile(data: CreatePatientProfileData) {
  return db.patientProfile.create({
    data: {
      userId: data.userId,
      fullName: data.fullName,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      bloodGroup: data.bloodGroup,
      phone: data.phone,
    },
  })
}

/** Attach a DoctorProfile to an existing user. */
export async function createDoctorProfile(data: CreateDoctorProfileData) {
  const doctor = await db.doctorProfile.create({
    data: {
      userId: data.userId,
      fullName: data.fullName,
      licenseNumber: data.licenseNumber,
      consultationFee: data.consultationFee ?? 0,
      verificationStatus: 'PENDING',
    },
  })

  if (data.specialtySlug) {
    const specialty = await db.specialty.findUnique({ where: { slug: data.specialtySlug } })
    if (specialty) {
      await db.doctorSpecialty.create({
        data: { doctorId: doctor.id, specialtyId: specialty.id, isPrimary: true },
      })
    }
  }

  return doctor
}

/** Mark a user's email address as verified. */
export async function setEmailVerified(userId: string) {
  return db.user.update({
    where: { id: userId },
    data: { emailVerifiedAt: new Date() },
  })
}

/** Replace the stored password hash after a valid password-reset token. */
export async function updatePasswordHash(userId: string, passwordHash: string) {
  return db.user.update({
    where: { id: userId },
    data: { passwordHash },
  })
}

/** Assign a named role to a user (idempotent). */
export async function assignRole(userId: string, roleName: string) {
  const role = await db.role.findUnique({ where: { name: roleName } })
  if (!role) throw new Error(`Role "${roleName}" not found in database`)
  // The unique constraint is (userId, roleId, organizationId); for global roles, organizationId = null
  const existing = await db.userRole.findFirst({
    where: { userId, roleId: role.id, organizationId: null },
  })
  if (existing) return existing
  return db.userRole.create({
    data: { userId, roleId: role.id, organizationId: null },
  })
}

/** Create or update user locale/theme preferences. */
export async function upsertPreferences(userId: string, locale: string, theme: string) {
  return db.userPreference.upsert({
    where: { userId },
    create: { userId, locale, theme },
    update: { locale, theme },
  })
}
