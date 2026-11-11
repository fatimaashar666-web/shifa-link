/**
 * Auth API — TypeScript contract types.
 *
 * These interfaces describe the exact request bodies and response shapes
 * for the four auth endpoints. They are documentation-only; they are NOT
 * imported by route handlers (which use Zod schemas).
 *
 * Endpoints:
 *   POST  /api/v1/auth/register  → RegisterResponse | ErrorResponse
 *   POST  /api/v1/auth/login     → LoginResponse    | ErrorResponse
 *   POST  /api/v1/auth/logout    → LogoutResponse   | ErrorResponse
 *   GET   /api/v1/auth/me        → MeResponse       | ErrorResponse
 */

// ---------------------------------------------------------------------------
// Shared error shape
// ---------------------------------------------------------------------------

export interface ErrorResponse {
  code: string
  message: string
  /** Present on 422 responses. Maps field path → array of error messages. */
  fieldErrors?: Record<string, string[]>
}

// ---------------------------------------------------------------------------
// POST /api/v1/auth/register
// ---------------------------------------------------------------------------

export interface RegisterRequest {
  name: string
  email: string
  /** Min 8, max 128 characters. */
  password: string
}

export interface RegisterResponse {
  userId: string
  email: string
}

/*
 * Status codes:
 *   201 — created; Set-Cookie: shifalink-session
 *   409 — email already registered
 *   422 — validation error
 *   500 — server error
 */

// ---------------------------------------------------------------------------
// POST /api/v1/auth/login
// ---------------------------------------------------------------------------

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  userId: string
  email: string
  roles: string[]
}

/*
 * Status codes:
 *   200 — authenticated; Set-Cookie: shifalink-session
 *   401 — invalid credentials or account disabled
 *   422 — validation error
 *   500 — server error
 */

// ---------------------------------------------------------------------------
// POST /api/v1/auth/logout
// ---------------------------------------------------------------------------

// No request body required.

export interface LogoutResponse {
  ok: true
}

/*
 * Status codes:
 *   200 — logged out; Set-Cookie clears session
 *   401 — no active session
 *   500 — server error
 */

// ---------------------------------------------------------------------------
// GET /api/v1/auth/me
// ---------------------------------------------------------------------------

export interface PatientProfileSummary {
  id: string
}

export interface DoctorProfileSummary {
  id: string
  verificationStatus: 'pending' | 'approved' | 'rejected' | 'suspended'
}

export interface MeResponse {
  userId: string
  name: string
  email: string
  isEmailVerified: boolean
  roles: string[]
  patientProfile: PatientProfileSummary | null
  doctorProfile: DoctorProfileSummary | null
}

/*
 * Status codes:
 *   200 — user profile
 *   401 — not authenticated
 *   404 — session references a deleted user
 *   500 — server error
 */
