/**
 * POST /api/v1/medical-records/:id/share — Grant a doctor access to a record.
 */
import { NextRequest } from 'next/server'
import { requireAuth } from '@/server/auth/rbac'
import * as recordService from '@/server/services/medical-record.service'
import { badRequest, internalError, forbidden, notFound } from '@/lib/errors'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireAuth(request)
  if (!guard.ok) return guard.response

  const { id: recordId } = await params

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return badRequest('Request body must be valid JSON.')
  }

  const parsed = recordService.ShareRecordSchema.safeParse(body)
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
    const grant = await recordService.shareRecord(
      guard.session.userId,
      recordId,
      parsed.data,
      ipAddress,
    )
    return Response.json(grant, { status: 201 })
  } catch (err: unknown) {
    if (err instanceof recordService.MedicalRecordError) {
      if (err.code === 'FORBIDDEN') return forbidden(err.message)
      if (err.code === 'NOT_FOUND') return notFound(err.message)
    }
    console.error('[POST /api/v1/medical-records/:id/share]', err)
    return internalError()
  }
}
