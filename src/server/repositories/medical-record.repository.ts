/**
 * Medical record repository — Prisma queries for ShifaLink Drive records,
 * file objects, and doctor access grants (ADR-06).
 */
import 'server-only'

import { db } from '@/server/db'
import { MedicalRecordCategory } from '@prisma/client'

export interface CreateFileObjectData {
  storageKey: string
  fileName: string
  mimeType: string
  sizeBytes: number
  checksum?: string
  uploadedBy: string
}

export interface CreateMedicalRecordData {
  patientId: string
  fileObjectId: string
  title: string
  category: MedicalRecordCategory
  description?: string
  recordDate?: Date
}

export async function createFileObject(data: CreateFileObjectData) {
  return db.fileObject.create({
    data: {
      storageKey: data.storageKey,
      fileName: data.fileName,
      mimeType: data.mimeType,
      sizeBytes: data.sizeBytes,
      checksum: data.checksum ?? null,
      uploadedBy: data.uploadedBy,
    },
  })
}

export async function createMedicalRecord(data: CreateMedicalRecordData) {
  return db.medicalRecord.create({
    data: {
      patientId: data.patientId,
      fileObjectId: data.fileObjectId,
      title: data.title,
      category: data.category,
      description: data.description ?? null,
      recordDate: data.recordDate ?? new Date(),
    },
    include: {
      fileObject: true,
      patient: true,
    },
  })
}

export async function getMedicalRecordById(id: string) {
  return db.medicalRecord.findUnique({
    where: { id },
    include: {
      fileObject: true,
      patient: {
        include: { user: true },
      },
      accessGrants: {
        include: {
          doctor: {
            include: { user: true },
          },
        },
      },
    },
  })
}

export async function listPatientMedicalRecords(patientId: string, category?: MedicalRecordCategory) {
  return db.medicalRecord.findMany({
    where: {
      patientId,
      category: category ? category : undefined,
    },
    include: {
      fileObject: true,
      accessGrants: {
        where: {
          revokedAt: null,
          expiresAt: { gt: new Date() },
        },
        include: {
          doctor: true,
        },
      },
    },
    orderBy: { recordDate: 'desc' },
  })
}

export async function createAccessGrant(params: {
  recordId: string
  doctorId: string
  expiresAt: Date
}) {
  return db.recordAccessGrant.create({
    data: {
      recordId: params.recordId,
      grantedToDoctorId: params.doctorId,
      expiresAt: params.expiresAt,
    },
    include: {
      doctor: true,
      record: true,
    },
  })
}

export async function revokeAccessGrant(grantId: string, userId: string) {
  return db.recordAccessGrant.update({
    where: { id: grantId },
    data: {
      revokedAt: new Date(),
      revokedBy: userId,
    },
  })
}

/**
 * Mid-request consent check: Verifies if a doctor has an active, unrevoked grant for a record.
 */
export async function checkDoctorAccess(recordId: string, doctorId: string): Promise<boolean> {
  const grant = await db.recordAccessGrant.findFirst({
    where: {
      recordId,
      grantedToDoctorId: doctorId,
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
  })
  return !!grant
}

/**
 * List all patient records currently shared with a doctor.
 */
export async function listAccessibleRecordsForDoctor(doctorId: string) {
  const grants = await db.recordAccessGrant.findMany({
    where: {
      grantedToDoctorId: doctorId,
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
    include: {
      record: {
        include: {
          fileObject: true,
          patient: true,
        },
      },
    },
  })

  return grants.map((g) => ({
    ...g.record,
    grantId: g.id,
    grantExpiresAt: g.expiresAt,
  }))
}
