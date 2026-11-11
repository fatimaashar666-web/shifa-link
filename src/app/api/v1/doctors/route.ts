/**
 * GET /api/v1/doctors
 *
 * Public search endpoint for verified doctors with multi-criteria filtering:
 * Query params:
 *   q              - text search (name, bio, specialty)
 *   specialty      - specialty slug (e.g. cardiology)
 *   city           - city name
 *   language       - language code (e.g. en, ur)
 *   isVirtual      - boolean (telehealth)
 *   maxFee         - number
 *   page, limit    - pagination
 */
import { NextRequest } from 'next/server'
import * as doctorService from '@/server/services/doctor.service'
import { internalError } from '@/lib/errors'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const query = searchParams.get('q') ?? undefined
    const specialtySlug = searchParams.get('specialty') ?? undefined
    const city = searchParams.get('city') ?? undefined
    const language = searchParams.get('language') ?? undefined
    const isVirtualParam = searchParams.get('isVirtual')
    const isVirtual = isVirtualParam !== null ? isVirtualParam === 'true' : undefined
    const maxFeeParam = searchParams.get('maxFee')
    const maxFee = maxFeeParam ? Number(maxFeeParam) : undefined
    const page = Number(searchParams.get('page') ?? '1')
    const limit = Number(searchParams.get('limit') ?? '10')

    const result = await doctorService.searchDoctors({
      query,
      specialtySlug,
      city,
      language,
      isVirtual,
      maxFee,
      page,
      limit,
    })

    return Response.json(result, { status: 200 })
  } catch (err) {
    console.error('[GET /api/v1/doctors]', err)
    return internalError()
  }
}
