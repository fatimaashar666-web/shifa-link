/**
 * GET /api/v1/diagnostic-services
 * Public endpoint — search lab/radiology diagnostic services.
 * Query params: ?type=LAB|RADIOLOGY&category=&q=
 */
import { NextRequest } from 'next/server'
import { searchServices } from '@/server/services/diagnostic.service'
import { internalError } from '@/lib/errors'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const type = searchParams.get('type') as 'LAB' | 'RADIOLOGY' | null
  const category = searchParams.get('category') ?? undefined
  const q = searchParams.get('q') ?? undefined

  try {
    const services = await searchServices({ type: type ?? undefined, category, query: q })
    return Response.json({ services }, { status: 200 })
  } catch (err) {
    console.error('[GET /api/v1/diagnostic-services]', err)
    return internalError()
  }
}
