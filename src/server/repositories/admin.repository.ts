/**
 * Admin repository (M9) — Queries for verification queue, audit search, and role updates.
 */
import 'server-only'

import { db } from '@/server/db'
import { VerificationStatus, OrgStatus } from '@prisma/client'

export async function getPendingDoctorVerifications() {
  return db.doctorProfile.findMany({
    where: {
      verificationStatus: 'PENDING',
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          status: true,
          createdAt: true,
        },
      },
      specialties: {
        include: {
          specialty: true,
        },
      },
      qualifications: true,
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function updateDoctorVerificationStatus(
  doctorProfileId: string,
  status: VerificationStatus
) {
  return db.doctorProfile.update({
    where: { id: doctorProfileId },
    data: {
      verificationStatus: status,
    },
    include: {
      user: true,
    },
  })
}

export async function getPendingOrganizationVerifications() {
  return db.organization.findMany({
    where: {
      status: 'PENDING_VERIFICATION',
    },
    include: {
      members: {
        include: {
          user: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function updateOrganizationStatus(
  organizationId: string,
  status: OrgStatus
) {
  return db.organization.update({
    where: { id: organizationId },
    data: { status },
  })
}

export interface SearchAuditEventsParams {
  actorId?: string
  action?: string
  entityType?: string
  limit?: number
}

export async function searchAuditEvents(params: SearchAuditEventsParams) {
  return db.auditEvent.findMany({
    where: {
      actorId: params.actorId || undefined,
      action: params.action ? { contains: params.action, mode: 'insensitive' } : undefined,
      entityType: params.entityType ? { equals: params.entityType, mode: 'insensitive' } : undefined,
    },
    orderBy: { createdAt: 'desc' },
    take: params.limit ?? 50,
  })
}
