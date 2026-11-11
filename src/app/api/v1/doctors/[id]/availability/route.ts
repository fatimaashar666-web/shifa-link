/**
 * GET /api/v1/doctors/:id/availability?date=YYYY-MM-DD
 *
 * Compute discrete free consultation time slots for a given doctor and date.
 */
import { NextRequest } from 'next/server'
import * as doctorService from '@/server/services/doctor.service'
import { badRequest, internalError } from '@/lib/errors'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const dateStr = searchParams.get('date')

    if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return badRequest('Query parameter "date" in format YYYY-MM-DD is required.')
    }

    const availability = await doctorService.getDoctorAvailableSlots(id, dateStr)
    return Response.json(availability, { status: 200 })
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'INVALID_DATE') {
      return badRequest('Invalid date string provided.')
    }
    console.error('[GET /api/v1/doctors/:id/availability]', err)
    return internalError()
  }
}
