/**
 * DELETE /api/v1/medical-records/:id/share/:grantId — Revoke a doctor's access grant.
 */
import { NextRequest } from 'next/server'
import { requireAuth } from '@/server/auth/rbac'
import * as recordService from '@/server/services/medical-record.service'
import { internalError, forbidden, notFound } from '@/lib/errors'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; grantId: string }> },
) {
  const guard = await requireAuth(request)
  if (!guard.ok) return guard.response

  const { id: recordId, grantId } = await params

  const ipAddress =
    request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? undefined

  try {
    await recordService.revokeShare(guard.session.userId, recordId, grantId, ipAddress)
    return new Response(null, { status: 204 })
  } catch (err: unknown) {
    if (err instanceof recordService.MedicalRecordError) {
      if (err.code === 'FORBIDDEN') return forbidden(err.message)
      if (err.code === 'NOT_FOUND') return notFound(err.message)
    }
    console.error('[DELETE /api/v1/medical-records/:id/share/:grantId]', err)
    return internalError()
  }
}
