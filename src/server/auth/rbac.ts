/**
 * RBAC guards — session check → role check → org check.
 *
 * Every protected route handler MUST call the appropriate guard before
 * touching any data. Guard call order:
 *   requireAuth → requireRole (optional) → requireOrgMember (optional)
 *
 * Guards throw never — they return a Response on failure.
 * Callers should check `instanceof Response` or use the `guard()` helper.
 */
import 'server-only'

import { getSession, type SessionPayload } from '@/server/auth/session'
import { unauthorized, forbidden } from '@/lib/errors'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Discriminated union returned by guards. */
export type GuardResult<T = SessionPayload> =
  | { ok: true; session: T }
  | { ok: false; response: Response }

// ---------------------------------------------------------------------------
// Guards
// ---------------------------------------------------------------------------

/**
 * Verify that the request carries a valid session.
 * Returns `{ ok: false, response: 401 }` if not authenticated.
 */
export async function requireAuth(request: Request): Promise<GuardResult> {
  const session = await getSession(request)
  if (!session) return { ok: false, response: unauthorized() }
  return { ok: true, session }
}

/**
 * Verify that the authenticated user holds at least one of the required roles.
 * Returns `{ ok: false, response: 403 }` if the role is absent.
 *
 * @param roles  One role name or an array of acceptable role names (OR logic).
 */
export async function requireRole(
  request: Request,
  roles: string | string[],
): Promise<GuardResult> {
  const authResult = await requireAuth(request)
  if (!authResult.ok) return authResult

  const required = Array.isArray(roles) ? roles : [roles]
  const hasRole = required.some((r) => authResult.session.roles.includes(r))
  if (!hasRole) {
    return { ok: false, response: forbidden() }
  }
  return authResult
}

/**
 * Verify that the authenticated user belongs to the specified organization.
 * Returns `{ ok: false, response: 403 }` if the org does not match.
 */
export async function requireOrgMember(
  request: Request,
  organizationId: string,
): Promise<GuardResult> {
  const authResult = await requireAuth(request)
  if (!authResult.ok) return authResult

  if (authResult.session.organizationId !== organizationId) {
    return { ok: false, response: forbidden('You are not a member of this organization') }
  }
  return authResult
}
