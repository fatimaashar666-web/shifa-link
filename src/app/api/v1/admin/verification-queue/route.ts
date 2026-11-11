/**
 * /api/v1/admin/verification-queue
 *
 * GET  - List unverified doctors and organizations.
 * POST - Verify or reject a doctor/organization.
 */
import { NextRequest } from 'next/server'
import { requireAuth } from '@/server/auth/rbac'
import * as adminService from '@/server/services/admin.service'
import { badRequest, internalError, forbidden } from '@/lib/errors'

export async function GET(request: NextRequest) {
  const guard = await requireAuth(request)
  if (!guard.ok) return guard.response

  if (!guard.session.roles.includes('super_admin')) {
    return forbidden('Super admin privileges required.')
  }

  try {
    const queue = await adminService.listVerificationQueue()
    return Response.json(queue, { status: 200 })
  } catch (err) {
    console.error('[GET /api/v1/admin/verification-queue] Error:', err)
    return internalError()
  }
}

export async function POST(request: NextRequest) {
  const guard = await requireAuth(request)
  if (!guard.ok) return guard.response

  if (!guard.session.roles.includes('super_admin')) {
    return forbidden('Super admin privileges required.')
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return badRequest('Request body must be valid JSON.')
  }

  const ipAddress =
    request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? undefined

  try {
    // Discriminate doctor vs org verification
    if (typeof body === 'object' && body !== null && 'doctorProfileId' in body) {
      const result = await adminService.processDoctorVerification(
        guard.session.userId,
        body as adminService.VerifyDoctorInput,
        ipAddress
      )
      return Response.json(result, { status: 200 })
    } else if (typeof body === 'object' && body !== null && 'organizationId' in body) {
      const result = await adminService.processOrgVerification(
        guard.session.userId,
        body as adminService.VerifyOrgInput,
        ipAddress
      )
      return Response.json(result, { status: 200 })
    }

    return badRequest('Payload must contain either doctorProfileId or organizationId.')
  } catch (err: unknown) {
    console.error('[POST /api/v1/admin/verification-queue] Error:', err)
    return internalError(err instanceof Error ? err.message : 'Processing error.')
  }
}
