/**
 * PATCH /api/v1/diagnostic-bookings/:id — Cancel a diagnostic booking.
 */
import { NextRequest } from 'next/server'
import { requireAuth } from '@/server/auth/rbac'
import * as diagService from '@/server/services/diagnostic.service'
import { badRequest, internalError, forbidden, notFound } from '@/lib/errors'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireAuth(request)
  if (!guard.ok) return guard.response

  const { id } = await params

  let body: unknown
  try {
    body = await request.json()
  } catch {
    body = {}
  }

  const reason = typeof body === 'object' && body !== null && 'reason' in body
    ? String((body as Record<string, unknown>).reason)
    : undefined

  const ipAddress =
    request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? undefined

  try {
    const updated = await diagService.cancelDiagnosticBooking(
      id,
      guard.session.userId,
      reason,
      ipAddress,
    )
    return Response.json(updated, { status: 200 })
  } catch (err: unknown) {
    if (err instanceof diagService.DiagnosticError) {
      if (err.code === 'FORBIDDEN') return forbidden(err.message)
      if (err.code === 'NOT_FOUND') return notFound(err.message)
      if (err.code === 'INVALID_STATE')
        return badRequest(err.message)
    }
    console.error('[PATCH /api/v1/diagnostic-bookings/:id]', err)
    return internalError()
  }
}
