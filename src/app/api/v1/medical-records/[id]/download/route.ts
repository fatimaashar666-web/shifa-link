/**
 * GET /api/v1/medical-records/:id/download
 *
 * Returns a presigned download URL for an authorized user.
 * CRITICAL (ADR-06): Authorization is re-verified inside getDownloadUrl()
 * at request time — not just at the time the URL was generated.
 */
import { NextRequest } from 'next/server'
import { requireAuth } from '@/server/auth/rbac'
import * as recordService from '@/server/services/medical-record.service'
import { internalError, forbidden, notFound } from '@/lib/errors'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireAuth(request)
  if (!guard.ok) return guard.response

  const { id: recordId } = await params

  const ipAddress =
    request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? undefined

  try {
    const result = await recordService.getDownloadUrl(guard.session.userId, recordId, ipAddress)
    return Response.json(
      { downloadUrl: result.downloadUrl, expiresAt: result.expiresAt.toISOString() },
      { status: 200 },
    )
  } catch (err: unknown) {
    if (err instanceof recordService.MedicalRecordError) {
      if (err.code === 'FORBIDDEN') return forbidden(err.message)
      if (err.code === 'NOT_FOUND') return notFound(err.message)
    }
    console.error('[GET /api/v1/medical-records/:id/download]', err)
    return internalError()
  }
}
