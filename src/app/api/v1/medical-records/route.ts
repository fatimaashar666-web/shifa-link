/**
 * /api/v1/medical-records
 *
 * GET  - List the authenticated patient's medical records
 * POST - Register a medical record after upload to object storage (Step 2)
 */
import { NextRequest } from 'next/server'
import { requireAuth } from '@/server/auth/rbac'
import * as recordService from '@/server/services/medical-record.service'
import { badRequest, internalError, forbidden } from '@/lib/errors'
import { MedicalRecordCategory } from '@prisma/client'

export async function GET(request: NextRequest) {
  const guard = await requireAuth(request)
  if (!guard.ok) return guard.response

  const { searchParams } = request.nextUrl
  const category = searchParams.get('category') as MedicalRecordCategory | null

  try {
    const records = await recordService.listMyRecords(
      guard.session.userId,
      category ?? undefined,
    )
    return Response.json({ records }, { status: 200 })
  } catch (err) {
    console.error('[GET /api/v1/medical-records]', err)
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

  const parsed = recordService.RegisterRecordSchema.safeParse(body)
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
    const record = await recordService.registerRecord(guard.session.userId, parsed.data, ipAddress)
    return Response.json(record, { status: 201 })
  } catch (err: unknown) {
    if (err instanceof recordService.MedicalRecordError) {
      if (err.code === 'FORBIDDEN') return forbidden(err.message)
    }
    console.error('[POST /api/v1/medical-records]', err)
    return internalError()
  }
}
