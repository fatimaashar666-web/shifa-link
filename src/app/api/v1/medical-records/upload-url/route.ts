/**
 * POST /api/v1/medical-records/upload-url
 *
 * Step 1 of two-step file upload.
 * Returns a presigned PUT URL the client uses to upload directly to object storage.
 * After upload, the client calls POST /api/v1/medical-records to register metadata.
 */
import { NextRequest } from 'next/server'
import { requireRole } from '@/server/auth/rbac'
import * as recordService from '@/server/services/medical-record.service'
import { badRequest, internalError, forbidden } from '@/lib/errors'

export async function POST(request: NextRequest) {
  const guard = await requireRole(request, 'patient')
  if (!guard.ok) return guard.response

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return badRequest('Request body must be valid JSON.')
  }

  const parsed = recordService.GenerateUploadUrlSchema.safeParse(body)
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
    const result = await recordService.generateUploadUrl(
      guard.session.userId,
      parsed.data,
      ipAddress,
    )
    return Response.json(
      {
        uploadUrl: result.uploadUrl,
        storageKey: result.storageKey,
        expiresAt: result.expiresAt.toISOString(),
      },
      { status: 200 },
    )
  } catch (err: unknown) {
    if (err instanceof recordService.MedicalRecordError) {
      if (err.code === 'INVALID_MIME' || err.code === 'FILE_TOO_LARGE')
        return badRequest(err.message)
      if (err.code === 'FORBIDDEN') return forbidden(err.message)
    }
    console.error('[POST /api/v1/medical-records/upload-url]', err)
    return internalError()
  }
}
