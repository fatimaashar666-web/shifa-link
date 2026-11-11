/**
 * POST /api/v1/auth/logout
 *
 * Invalidate the current session by clearing the cookie.
 *
 * Success 200: { ok: true }
 * Error 401:   Not authenticated
 */
import { type NextRequest } from 'next/server'

import { requireAuth } from '@/server/auth/rbac'
import { logout } from '@/server/services/auth.service'
import { clearSessionCookie } from '@/server/auth/session'
import { internalError } from '@/lib/errors'

export async function POST(request: NextRequest) {
  // 1. Require a valid session
  const guard = await requireAuth(request)
  if (!guard.ok) return guard.response

  const ipAddress = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? undefined

  // 2. Write audit event (non-blocking)
  try {
    await logout(guard.session.userId, ipAddress)
  } catch (err) {
    console.error('[POST /api/v1/auth/logout] logout service error', err)
    return internalError()
  }

  // 3. Clear cookie
  return Response.json(
    { ok: true },
    {
      status: 200,
      headers: { 'Set-Cookie': clearSessionCookie() },
    },
  )
}
