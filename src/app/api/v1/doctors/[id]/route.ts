/**
 * GET /api/v1/doctors/:id
 *
 * Public details endpoint for a verified doctor.
 */
import { NextRequest } from 'next/server'
import * as doctorService from '@/server/services/doctor.service'
import { notFound, internalError } from '@/lib/errors'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const doctor = await doctorService.getDoctorProfile(id)

    if (!doctor) {
      return notFound('Doctor profile not found or not yet verified.')
    }

    return Response.json(doctor, { status: 200 })
  } catch (err) {
    console.error('[GET /api/v1/doctors/:id]', err)
    return internalError()
  }
}
