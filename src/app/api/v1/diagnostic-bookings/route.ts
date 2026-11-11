/**
 * /api/v1/diagnostic-bookings
 *
 * GET  - List the authenticated patient's diagnostic bookings
 * POST - Create a new diagnostic booking
 */
import { NextRequest } from 'next/server'
import { requireAuth } from '@/server/auth/rbac'
import * as diagService from '@/server/services/diagnostic.service'
import { badRequest, internalError, forbidden, notFound } from '@/lib/errors'

export async function GET(request: NextRequest) {
  const guard = await requireAuth(request)
  if (!guard.ok) return guard.response

  try {
    const bookings = await diagService.getUserDiagnosticBookings(guard.session.userId)
    return Response.json({ bookings }, { status: 200 })
  } catch (err) {
    console.error('[GET /api/v1/diagnostic-bookings]', err)
    return internalError()
  }
}

export async function POST(request: NextRequest) {
  const guard = await requireAuth(request)
  if (!guard.ok) return guard.response

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return badRequest('Request body must be valid JSON.')
  }

  const parsed = diagService.BookDiagnosticSchema.safeParse(body)
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {}
    for (const issue of parsed.error.issues) {
      const key = issue.path.join('.') || '_'
      fieldErrors[key] = [...(fieldErrors[key] ?? []), issue.message]
    }
    return Response.json(
      { code: 'VALIDATION_ERROR', message: 'Validation failed', fieldErrors },
      { status: 422 },
    )
  }

  const ipAddress =
    request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? undefined

  try {
    const booking = await diagService.bookDiagnosticTest(
      guard.session.userId,
      parsed.data,
      ipAddress,
    )
    return Response.json(booking, { status: 201 })
  } catch (err: unknown) {
    if (err instanceof diagService.DiagnosticError) {
      if (err.code === 'FORBIDDEN') return forbidden(err.message)
      if (err.code === 'NOT_FOUND') return notFound(err.message)
      if (err.code === 'UNAVAILABLE') return Response.json({ code: 'UNAVAILABLE', message: err.message }, { status: 409 })
    }
    console.error('[POST /api/v1/diagnostic-bookings]', err)
    return internalError()
  }
}
