/**
 * /api/v1/admin/audit-logs
 *
 * GET - Filter and search structured system audit events (ADR-10).
 * Restricted strictly to `super_admin`.
 */
import { NextRequest } from 'next/server'
import { requireAuth } from '@/server/auth/rbac'
import * as adminService from '@/server/services/admin.service'
import { internalError, forbidden } from '@/lib/errors'

export async function GET(request: NextRequest) {
  const guard = await requireAuth(request)
  if (!guard.ok) return guard.response

  if (!guard.session.roles.includes('super_admin')) {
    return forbidden('Super admin privileges required to access audit records.')
  }

  const { searchParams } = request.nextUrl
  const action = searchParams.get('action') ?? undefined
  const entityType = searchParams.get('entityType') ?? undefined
  const actorId = searchParams.get('actorId') ?? undefined
  const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : 50

  const ipAddress =
    request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? undefined

  try {
    const events = await adminService.getAuditEvents(
      guard.session.userId,
      { action, entityType, actorId, limit },
      ipAddress
    )
    return Response.json({ events }, { status: 200 })
  } catch (err) {
    console.error('[GET /api/v1/admin/audit-logs] Error:', err)
    return internalError()
  }
}
