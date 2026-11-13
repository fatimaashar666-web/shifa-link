/**
 * Medical record service — ShifaLink Drive upload flow, metadata registration,
 * sharing, revocation, and secure download (ADR-06).
 *
 * File bytes are NEVER stored in PostgreSQL.
 * PostgreSQL stores only `FileObject` metadata + `MedicalRecord` rows.
 */
import 'server-only'

import { z } from 'zod'
import { MedicalRecordCategory } from '@prisma/client'
import * as recordRepo from '@/server/repositories/medical-record.repository'
import * as userRepo from '@/server/repositories/user.repository'
import * as doctorRepo from '@/server/repositories/doctor.repository'
import { createNotification } from '@/server/repositories/notification.repository'
import {
  generateStorageKey,
  validateMimeType,
  validateFileSize,
  createPresignedUploadUrl,
  createPresignedDownloadUrl,
  MAX_FILE_SIZE_BYTES,
  ALLOWED_MIME_TYPES,
} from '@/server/storage'
import { writeAuditEvent } from '@/server/audit'

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

export const GenerateUploadUrlSchema = z.object({
  fileName: z.string().min(1).max(255),
  mimeType: z.string().min(1),
  sizeBytes: z.number().int().positive().max(MAX_FILE_SIZE_BYTES),
  category: z.nativeEnum(MedicalRecordCategory),
})

export type GenerateUploadUrlInput = z.infer<typeof GenerateUploadUrlSchema>

export const RegisterRecordSchema = z.object({
  storageKey: z.string().min(1),
  fileName: z.string().min(1).max(255),
  mimeType: z.string().min(1),
  sizeBytes: z.number().int().positive(),
  title: z.string().min(1).max(255),
  category: z.nativeEnum(MedicalRecordCategory),
  description: z.string().max(1000).optional(),
  recordDate: z.string().datetime().optional(),
})

export type RegisterRecordInput = z.infer<typeof RegisterRecordSchema>

export const ShareRecordSchema = z.object({
  doctorId: z.string().uuid('Invalid doctor ID'),
  expiresInDays: z.number().int().min(1).max(365).default(30),
})

export type ShareRecordInput = z.infer<typeof ShareRecordSchema>

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

export class MedicalRecordError extends Error {
  constructor(
    public readonly code:
      | 'NOT_FOUND'
      | 'FORBIDDEN'
      | 'INVALID_MIME'
      | 'FILE_TOO_LARGE'
      | 'ALREADY_REVOKED',
    message: string,
  ) {
    super(message)
    this.name = 'MedicalRecordError'
  }
}

// ---------------------------------------------------------------------------
// Service layer
// ---------------------------------------------------------------------------

/**
 * Step 1 of two-step upload: validate file params, generate presigned PUT URL.
 * Returns the URL for the client to upload directly to object storage.
 */
export async function generateUploadUrl(
  userId: string,
  input: GenerateUploadUrlInput,
  ipAddress?: string,
) {
  const parsed = GenerateUploadUrlSchema.parse(input)

  if (!validateMimeType(parsed.mimeType)) {
    throw new MedicalRecordError(
      'INVALID_MIME',
      `Unsupported file type. Allowed: ${Array.from(ALLOWED_MIME_TYPES).join(', ')}`,
    )
  }

  if (!validateFileSize(parsed.sizeBytes)) {
    throw new MedicalRecordError(
      'FILE_TOO_LARGE',
      `File exceeds the ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB limit`,
    )
  }

  // Resolve patient ID for namespaced storage key
  const user = await userRepo.findById(userId)
  if (!user) throw new MedicalRecordError('FORBIDDEN', 'User not found')

  let patientId = user.patientProfile?.id
  if (!patientId) {
    const newProfile = await userRepo.createPatientProfile({
      userId,
      fullName: user.email.split('@')[0],
    })
    patientId = newProfile.id
  }

  const storageKey = generateStorageKey(patientId, parsed.category, parsed.fileName)

  const result = await createPresignedUploadUrl({
    storageKey,
    mimeType: parsed.mimeType,
    sizeBytes: parsed.sizeBytes,
  })

  writeAuditEvent({
    actorType: 'USER',
    actorId: userId,
    action: 'record.upload_url_requested',
    entityType: 'FileObject',
    metadata: {
      storageKey,
      mimeType: parsed.mimeType,
      sizeBytes: parsed.sizeBytes,
      category: parsed.category,
    },
    ipAddress,
  })

  return result
}

/**
 * Step 2 of two-step upload: register FileObject + MedicalRecord after
 * the client has completed the presigned PUT to object storage.
 */
export async function registerRecord(
  userId: string,
  input: RegisterRecordInput,
  ipAddress?: string,
) {
  const parsed = RegisterRecordSchema.parse(input)

  const user = await userRepo.findById(userId)
  if (!user) throw new MedicalRecordError('FORBIDDEN', 'User not found')

  let patientId = user.patientProfile?.id
  if (!patientId) {
    const newProfile = await userRepo.createPatientProfile({
      userId,
      fullName: user.email.split('@')[0],
    })
    patientId = newProfile.id
  }

  // Create the FileObject row (metadata only — no bytes)
  const record = await recordRepo.createFileObjectAndMedicalRecord({
    fileObject: {
      storageKey: parsed.storageKey,
      fileName: parsed.fileName,
      mimeType: parsed.mimeType,
      sizeBytes: parsed.sizeBytes,
      uploadedBy: userId,
    },
    record: {
      patientId,
      title: parsed.title,
      category: parsed.category,
      description: parsed.description,
      recordDate: parsed.recordDate ? new Date(parsed.recordDate) : new Date(),
    },
  })

  writeAuditEvent({
    actorType: 'USER',
    actorId: userId,
    action: 'record.upload',
    entityType: 'MedicalRecord',
    entityId: record.id,
    metadata: {
      fileObjectId: record.fileObjectId,
      storageKey: parsed.storageKey,
      category: parsed.category,
      sizeBytes: parsed.sizeBytes,
    },
    ipAddress,
  })

  return record
}

/**
 * List the authenticated patient's own medical records.
 */
export async function listMyRecords(userId: string, category?: MedicalRecordCategory) {
  const user = await userRepo.findById(userId)
  if (!user?.patientProfile) return []
  return recordRepo.listPatientMedicalRecords(user.patientProfile.id, category)
}

/**
 * Share a medical record with a specific doctor.
 * Only the record owner can share it.
 */
export async function shareRecord(
  userId: string,
  recordId: string,
  input: ShareRecordInput,
  ipAddress?: string,
) {
  const parsed = ShareRecordSchema.parse(input)

  // Fetch and verify record ownership
  const record = await recordRepo.getMedicalRecordById(recordId)
  if (!record) throw new MedicalRecordError('NOT_FOUND', 'Record not found')
  if (record.patient.user.id !== userId) {
    throw new MedicalRecordError('FORBIDDEN', 'You do not own this record')
  }

  // Verify doctor exists
  const doctorProfile = await doctorRepo.getDoctorById(parsed.doctorId)
  if (!doctorProfile) throw new MedicalRecordError('NOT_FOUND', 'Doctor not found')

  const expiresAt = new Date(Date.now() + parsed.expiresInDays * 86_400_000)

  const grant = await recordRepo.createAccessGrant({
    recordId,
    doctorId: parsed.doctorId,
    expiresAt,
  })

  writeAuditEvent({
    actorType: 'USER',
    actorId: userId,
    action: 'record.share',
    entityType: 'RecordAccessGrant',
    entityId: grant.id,
    metadata: {
      recordId,
      doctorId: parsed.doctorId,
      expiresAt: expiresAt.toISOString(),
    },
    ipAddress,
  })

  // Notify doctor of new shared record
  createNotification({
    userId: doctorProfile.userId,
    type: 'RECORD_SHARED',
    title: 'Patient shared a medical record',
    message: `A patient has shared their medical record "${record.title}" with you.`,
    entityType: 'RecordAccessGrant',
    entityId: grant.id,
  }).catch(() => void 0)

  return grant
}

/**
 * Revoke a sharing grant. Only the record owner can revoke.
 */
export async function revokeShare(
  userId: string,
  recordId: string,
  grantId: string,
  ipAddress?: string,
) {
  const record = await recordRepo.getMedicalRecordById(recordId)
  if (!record) throw new MedicalRecordError('NOT_FOUND', 'Record not found')
  if (record.patient.user.id !== userId) {
    throw new MedicalRecordError('FORBIDDEN', 'You do not own this record')
  }

  const grant = record.accessGrants.find((g) => g.id === grantId)
  if (!grant) throw new MedicalRecordError('NOT_FOUND', 'Grant not found')

  await recordRepo.revokeAccessGrant(grantId, userId)

  writeAuditEvent({
    actorType: 'USER',
    actorId: userId,
    action: 'record.revoke',
    entityType: 'RecordAccessGrant',
    entityId: grantId,
    metadata: { recordId, grantId },
    ipAddress,
  })
}

/**
 * Generate a presigned download URL.
 *
 * CRITICAL (ADR-06): Authorization is re-checked at download time,
 * not just at URL creation. The check happens inside this function.
 */
export async function getDownloadUrl(userId: string, recordId: string, ipAddress?: string) {
  const record = await recordRepo.getMedicalRecordById(recordId)
  if (!record) throw new MedicalRecordError('NOT_FOUND', 'Record not found')

  const isOwner = record.patient.user.id === userId

  if (!isOwner) {
    // Check if the user is a doctor with an active grant
    const user = await userRepo.findById(userId)
    const doctorProfile = user?.doctorProfile
    if (!doctorProfile) {
      throw new MedicalRecordError('FORBIDDEN', 'Access denied')
    }
    const hasGrant = await recordRepo.checkDoctorAccess(recordId, doctorProfile.id)
    if (!hasGrant) {
      throw new MedicalRecordError('FORBIDDEN', 'No active access grant for this record')
    }
  }

  // Generate presigned download URL only after auth check
  const downloadUrl = await createPresignedDownloadUrl(record.fileObject.storageKey)

  writeAuditEvent({
    actorType: 'USER',
    actorId: userId,
    action: 'record.download',
    entityType: 'MedicalRecord',
    entityId: recordId,
    metadata: {
      fileObjectId: record.fileObjectId,
      isOwner,
    },
    ipAddress,
  })

  return { downloadUrl, expiresAt: new Date(Date.now() + 10 * 60 * 1000) }
}
