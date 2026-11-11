/**
 * /api/v1/clinical/summary
 *
 * GET  - Generate source-linked clinical AI summary for a patient's shared records.
 * POST - Mandatory clinician review & acknowledgement submission.
 */
import { NextRequest } from 'next/server'
import { requireAuth } from '@/server/auth/rbac'
import * as clinicalService from '@/server/services/clinical-ai.service'
import { badRequest, internalError, forbidden } from '@/lib/errors'

export async function GET(request: NextRequest) {
  const guard = await requireAuth(request)
  if (!guard.ok) return guard.response

  // Check role: doctor or super_admin
  const hasDoctorRole = guard.session.roles.includes('doctor') || guard.session.roles.includes('super_admin')
  if (!hasDoctorRole) {
    return forbidden('Doctor authorization required to access clinical AI tools.')
  }

  const { searchParams } = request.nextUrl
  const patientId = searchParams.get('patientId')
  if (!patientId) {
    return badRequest('patientId query parameter is required.')
  }

  const ipAddress =
    request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? undefined

  try {
    const summary = await clinicalService.generateClinicalSummary(
      guard.session.userId,
      { patientId },
      ipAddress
    )
    return Response.json(summary, { status: 200 })
  } catch (err: unknown) {
    console.error('[GET /api/v1/clinical/summary] Error:', err)
    return internalError(err instanceof Error ? err.message : 'Failed to generate summary.')
  }
}

export async function POST(request: NextRequest) {
  const guard = await requireAuth(request)
  if (!guard.ok) return guard.response

  const hasDoctorRole = guard.session.roles.includes('doctor') || guard.session.roles.includes('super_admin')
  if (!hasDoctorRole) {
    return forbidden('Doctor authorization required.')
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return badRequest('Request body must be valid JSON.')
  }

  const parsed = clinicalService.AcknowledgeSummarySchema.safeParse(body)
  if (!parsed.success) {
    return badRequest('Invalid acknowledgement payload.')
  }

  const ipAddress =
    request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? undefined

  try {
    const ack = await clinicalService.acknowledgeClinicalSummary(
      guard.session.userId,
      parsed.data,
      ipAddress
    )
    return Response.json(ack, { status: 200 })
  } catch (err: unknown) {
    console.error('[POST /api/v1/clinical/summary] Error:', err)
    return internalError(err instanceof Error ? err.message : 'Failed to acknowledge summary.')
  }
}
