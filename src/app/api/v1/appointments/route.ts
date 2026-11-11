/**
 * /api/v1/appointments
 *
 * GET  - List appointments for authenticated user
 * POST - Book new appointment (requires auth, transactional conflict check)
 */
import { NextRequest } from 'next/server'
import { requireAuth } from '@/server/auth/rbac'
import * as appointmentService from '@/server/services/appointment.service'
import { validationError, conflict, internalError, badRequest } from '@/lib/errors'

export async function GET(request: NextRequest) {
  const guard = await requireAuth(request)
  if (!guard.ok) return guard.response

  try {
    const list = await appointmentService.getUserAppointments(guard.session.userId)
    return Response.json({ appointments: list }, { status: 200 })
  } catch (err) {
    console.error('[GET /api/v1/appointments]', err)
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

  const parsed = appointmentService.CreateAppointmentSchema.safeParse(body)
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
    const appointment = await appointmentService.bookAppointment(
      guard.session.userId,
      parsed.data,
      ipAddress,
    )
    return Response.json(appointment, { status: 201 })
  } catch (err: unknown) {
    if (err instanceof appointmentService.AppointmentError && err.code === 'SLOT_CONFLICT') {
      return conflict(err.message)
    }
    console.error('[POST /api/v1/appointments]', err)
    return internalError()
  }
}
