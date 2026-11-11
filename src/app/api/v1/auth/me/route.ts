/**
 * GET /api/v1/auth/me
 *
 * Return the current user's profile.
 *
 * Success 200: { userId, name, email, isEmailVerified, roles, patientProfile?, doctorProfile? }
 * Error 401:   Not authenticated
 * Error 404:   Session references a deleted user
 */
import { type NextRequest } from 'next/server'

import { requireAuth } from '@/server/auth/rbac'
import { getMe } from '@/server/services/auth.service'
import { notFound, internalError } from '@/lib/errors'

export async function GET(request: NextRequest) {
  // 1. Require a valid session
  const guard = await requireAuth(request)
  if (!guard.ok) return guard.response

  // 2. Fetch profile
  try {
    const profile = await getMe(guard.session.userId)
    if (!profile) return notFound('User account not found.')
    return Response.json(profile, { status: 200 })
  } catch (err) {
    console.error('[GET /api/v1/auth/me]', err)
    return internalError()
  }
}
