/**
 * /api/v1/appointments/:id
 *
 * PATCH - Cancel appointment
 */
import { NextRequest } from 'next/server'
import { z } from 'zod'
import { requireAuth } from '@/server/auth/rbac'
import * as appointmentService from '@/server/services/appointment.service'
import { validationError, notFound, forbidden, badRequest, internalError } from '@/lib/errors'

const CancelSchema = z.object({
  action: z.literal('cancel'),
  reason: z.string().min(3, 'Cancellation reason is required').max(500),
})

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
    return badRequest('Request body must be valid JSON.')
  }

  const parsed = CancelSchema.safeParse(body)
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {}
    for (const issue of parsed.error.issues) {
      const key = issue.path.join('.') || '_'
      fieldErrors[key] = [...(fieldErrors[key] ?? []), issue.message]
    }
    return validationError(fieldErrors)
  }

  const ipAddress = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? undefined

  try {
    const updated = await appointmentService.cancelAppointment(
      id,
      guard.session.userId,
      parsed.data.reason,
      ipAddress,
    )
    return Response.json(updated, { status: 200 })
  } catch (err: unknown) {
    if (err instanceof appointmentService.AppointmentError) {
      if (err.code === 'NOT_FOUND') return notFound(err.message)
      if (err.code === 'FORBIDDEN') return forbidden(err.message)
      if (err.code === 'INVALID_STATE') return badRequest(err.message)
    }
    console.error('[PATCH /api/v1/appointments/:id]', err)
    return internalError()
  }
}
