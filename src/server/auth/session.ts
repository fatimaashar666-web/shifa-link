/**
 * Session management — JWT in HTTP-only cookie (ADR-04).
 *
 * Uses `jose` for signing/verification; no Auth.js for custom credentials flow.
 * Cookie name: `shifalink-session`
 * Algorithm: HS256 (symmetric — SESSION_SECRET, AUTH_SECRET, or JWT_SECRET)
 * Max-Age: 7 days
 */
import 'server-only'

import { SignJWT, jwtVerify } from 'jose'

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const COOKIE_NAME = 'shifalink-session'
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7 // 7 days
const PASSWORD_RESET_MAX_AGE_SECONDS = 60 * 15 // 15 minutes

function getSecret(): Uint8Array {
  // Railway's deployment guide historically used AUTH_SECRET/JWT_SECRET,
  // while local development uses SESSION_SECRET. Accept all supported names
  // so a valid deployment secret cannot silently break dashboard sessions.
  const secret = [process.env.SESSION_SECRET, process.env.AUTH_SECRET, process.env.JWT_SECRET]
    .map((value) => value?.trim())
    .find((value): value is string => Boolean(value))
  if (!secret || secret.length < 32) {
    throw new Error('A session secret is missing or too short (minimum 32 characters). Set SESSION_SECRET or AUTH_SECRET.')
  }
  return new TextEncoder().encode(secret)
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SessionPayload {
  userId: string
  email: string
  roles: string[]
  organizationId: string | null
}

export interface SignedSession {
  token: string
  expiresAt: Date
}

// ---------------------------------------------------------------------------
// Token operations
// ---------------------------------------------------------------------------

/**
 * Sign a new JWT session token.
 */
export async function createSession(payload: SessionPayload): Promise<SignedSession> {
  const expiresAt = new Date(Date.now() + MAX_AGE_SECONDS * 1000)
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(getSecret())
  return { token, expiresAt }
}

/**
 * Verify and decode a JWT token string.
 * Returns `null` if the token is invalid, expired, or tampered with.
 */
export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), { algorithms: ['HS256'] })
    return payload as unknown as SessionPayload
  } catch {
    return null
  }
}

/** Create a short-lived token used only for resetting a password. */
export async function createPasswordResetToken(userId: string): Promise<string> {
  return new SignJWT({ purpose: 'password-reset' })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${PASSWORD_RESET_MAX_AGE_SECONDS}s`)
    .sign(getSecret())
}

/** Verify a password-reset token and return its user id when valid. */
export async function verifyPasswordResetToken(
  token: string,
): Promise<{ userId: string; issuedAt: number } | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), { algorithms: ['HS256'] })
    if (payload.purpose !== 'password-reset' || typeof payload.sub !== 'string' || typeof payload.iat !== 'number') {
      return null
    }

    return { userId: payload.sub, issuedAt: payload.iat }
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// Cookie helpers (for use in Route Handlers / Server Actions)
// ---------------------------------------------------------------------------

/**
 * Build a `Set-Cookie` header string for the session token.
 */
export function buildSessionCookie(token: string): string {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  return `${COOKIE_NAME}=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${MAX_AGE_SECONDS}${secure}`
}

/**
 * Build a `Set-Cookie` header string that clears the session cookie.
 */
export function clearSessionCookie(): string {
  return `${COOKIE_NAME}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`
}

/**
 * Extract and verify the session from an incoming `Request`.
 * Returns `null` if no cookie is present or the JWT is invalid.
 */
export async function getSession(request: Request): Promise<SessionPayload | null> {
  const cookieHeader = request.headers.get('cookie') ?? ''
  const token = parseCookie(cookieHeader, COOKIE_NAME)
  if (!token) return null
  return verifySession(token)
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function parseCookie(cookieHeader: string, name: string): string | null {
  const match = cookieHeader
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${name}=`))
  return match ? match.slice(name.length + 1) : null
}
