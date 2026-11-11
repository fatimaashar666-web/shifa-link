/**
 * Contract types for the Medical Records (ShifaLink Drive) API.
 */

export type MedicalRecordCategory =
  | 'LAB_REPORT'
  | 'RADIOLOGY_IMAGE'
  | 'PRESCRIPTION'
  | 'DISCHARGE_SUMMARY'
  | 'VACCINATION'
  | 'OTHER'

export interface FileObjectDto {
  id: string
  storageKey: string
  fileName: string
  mimeType: string
  sizeBytes: number
  uploadedAt: string
}

export interface AccessGrantDto {
  id: string
  doctorId: string
  doctorName: string
  expiresAt: string
  revokedAt: string | null
}

export interface MedicalRecordDto {
  id: string
  title: string
  category: MedicalRecordCategory
  description: string | null
  recordDate: string
  createdAt: string
  fileObject: FileObjectDto
  accessGrants: AccessGrantDto[]
}

// ── Request bodies ──────────────────────────────────────────────────────────

export interface GenerateUploadUrlBody {
  fileName: string
  mimeType: string
  sizeBytes: number
  category: MedicalRecordCategory
}

export interface RegisterRecordBody {
  storageKey: string
  fileName: string
  mimeType: string
  sizeBytes: number
  title: string
  category: MedicalRecordCategory
  description?: string
  /** ISO 8601 date string */
  recordDate?: string
}

export interface ShareRecordBody {
  doctorId: string
  expiresInDays?: number
}

// ── Responses ───────────────────────────────────────────────────────────────

export interface GenerateUploadUrlResponse {
  uploadUrl: string
  storageKey: string
  expiresAt: string
}

export interface ListMedicalRecordsResponse {
  records: MedicalRecordDto[]
}

export interface GetDownloadUrlResponse {
  downloadUrl: string
  expiresAt: string
}
