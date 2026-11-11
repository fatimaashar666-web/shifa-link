/**
 * Admin Service (M9) — Provider verification, audit searching, and administrative operations.
 */
import 'server-only'

import { z } from 'zod'
import { VerificationStatus, OrgStatus } from '@prisma/client'
import * as adminRepo from '@/server/repositories/admin.repository'
import { createNotification } from '@/server/repositories/notification.repository'
import { writeAuditEvent } from '@/server/audit'

export const VerifyDoctorSchema = z.object({
  doctorProfileId: z.string().uuid(),
  status: z.enum(['VERIFIED', 'REJECTED', 'SUSPENDED']),
  reason: z.string().optional(),
})

export type VerifyDoctorInput = z.infer<typeof VerifyDoctorSchema>

export const VerifyOrgSchema = z.object({
  organizationId: z.string().uuid(),
  status: z.enum(['ACTIVE', 'SUSPENDED']),
})

export type VerifyOrgInput = z.infer<typeof VerifyOrgSchema>

export async function listVerificationQueue() {
  const [doctors, organizations] = await Promise.all([
    adminRepo.getPendingDoctorVerifications(),
    adminRepo.getPendingOrganizationVerifications(),
  ])

  return {
    doctors,
    organizations,
  }
}

export async function processDoctorVerification(
  adminUserId: string,
  input: VerifyDoctorInput,
  ipAddress?: string
) {
  const parsed = VerifyDoctorSchema.parse(input)

  const updated = await adminRepo.updateDoctorVerificationStatus(
    parsed.doctorProfileId,
    parsed.status as VerificationStatus
  )

  writeAuditEvent({
    actorType: 'USER',
    actorId: adminUserId,
    action: `admin.doctor_verification.${parsed.status.toLowerCase()}`,
    entityType: 'DoctorProfile',
    entityId: parsed.doctorProfileId,
    metadata: {
      newStatus: parsed.status,
      doctorUserId: updated.userId,
      reason: parsed.reason,
    },
    ipAddress,
  })

  // Notify doctor
  createNotification({
    userId: updated.userId,
    type: 'SYSTEM',
    title: `Licensure Verification ${parsed.status === 'VERIFIED' ? 'Approved' : 'Status Updated'}`,
    message:
      parsed.status === 'VERIFIED'
        ? 'Your clinical medical license has been verified. Your profile is now visible to patients.'
        : `Your verification status was updated to ${parsed.status}. ${parsed.reason ?? ''}`,
    entityType: 'DoctorProfile',
    entityId: parsed.doctorProfileId,
  }).catch(() => void 0)

  return updated
}

export async function processOrgVerification(
  adminUserId: string,
  input: VerifyOrgInput,
  ipAddress?: string
) {
  const parsed = VerifyOrgSchema.parse(input)

  const updated = await adminRepo.updateOrganizationStatus(
    parsed.organizationId,
    parsed.status as OrgStatus
  )

  writeAuditEvent({
    actorType: 'USER',
    actorId: adminUserId,
    action: `admin.org_status.${parsed.status.toLowerCase()}`,
    entityType: 'Organization',
    entityId: parsed.organizationId,
    metadata: {
      newStatus: parsed.status,
    },
    ipAddress,
  })

  return updated
}

export async function getAuditEvents(
  adminUserId: string,
  params: adminRepo.SearchAuditEventsParams,
  ipAddress?: string
) {
  const events = await adminRepo.searchAuditEvents(params)

  writeAuditEvent({
    actorType: 'USER',
    actorId: adminUserId,
    action: 'admin.audit_log_searched',
    entityType: 'AuditEvent',
    metadata: {
      queryAction: params.action,
      queryEntityType: params.entityType,
      resultsCount: events.length,
    },
    ipAddress,
  })

  return events
}
