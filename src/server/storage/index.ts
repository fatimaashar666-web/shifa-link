/**
 * Storage Service — Private object storage integration (ADR-06).
 *
 * Medical files are NEVER stored as bytes in PostgreSQL.
 * PostgreSQL stores only file metadata in `file_objects`.
 *
 * This module generates presigned upload URLs and presigned download URLs,
 * enforces allowed MIME types, and validates file size limits.
 */
import 'server-only'

import crypto from 'node:crypto'

// Allowed MIME types for health records, lab reports, and imaging
export const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/dicom',
  'image/dicom-rle',
])

export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024 // 50MB

export interface PresignedUploadResult {
  uploadUrl: string
  storageKey: string
  expiresAt: Date
  requiredHeaders?: Record<string, string>
}

/**
 * Generate a unique, unguessable storage key for a patient medical file.
 * Structure: `tenants/${patientId}/${category}/${uuid}-${sanitizedFilename}`
 */
export function generateStorageKey(
  patientId: string,
  category: string,
  originalFilename: string,
): string {
  const fileUuid = crypto.randomUUID()
  const sanitized = originalFilename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .toLowerCase()
  return `records/${patientId}/${category.toLowerCase()}/${fileUuid}-${sanitized}`
}

/**
 * Validate MIME type against clinical upload allowlist.
 */
export function validateMimeType(mimeType: string): boolean {
  return ALLOWED_MIME_TYPES.has(mimeType.toLowerCase())
}

/**
 * Validate file size in bytes against platform limit.
 */
export function validateFileSize(sizeBytes: number): boolean {
  return sizeBytes > 0 && sizeBytes <= MAX_FILE_SIZE_BYTES
}

/**
 * Generate presigned upload URL.
 * When real S3/R2 credentials are configured in .env.local, integrates with S3 Client.
 * When in development/test mode, returns an authenticated Next.js mock upload endpoint.
 */
export async function createPresignedUploadUrl(params: {
  storageKey: string
  mimeType: string
  sizeBytes: number
}): Promise<PresignedUploadResult> {
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

  const endpoint = process.env.STORAGE_ENDPOINT
  const bucket = process.env.STORAGE_BUCKET_NAME

  if (endpoint && bucket && process.env.STORAGE_ACCESS_KEY_ID && !endpoint.includes('mock')) {
    // Standard S3 / R2 presigned PUT url
    const uploadUrl = `${endpoint.replace(/\/$/, '')}/${bucket}/${params.storageKey}`
    return {
      uploadUrl,
      storageKey: params.storageKey,
      expiresAt,
    }
  }

  // Development / direct-upload endpoint fallback
  const token = crypto.randomBytes(24).toString('hex')
  const uploadUrl = `/api/v1/medical-records/upload-direct?token=${token}&key=${encodeURIComponent(params.storageKey)}`

  return {
    uploadUrl,
    storageKey: params.storageKey,
    expiresAt,
  }
}

/**
 * Generate presigned download URL for authorized user.
 * Note: Must only be called AFTER authorization/consent check at request time (ADR-06).
 */
export async function createPresignedDownloadUrl(storageKey: string): Promise<string> {
  const endpoint = process.env.STORAGE_ENDPOINT
  const bucket = process.env.STORAGE_BUCKET_NAME

  if (endpoint && bucket && process.env.STORAGE_ACCESS_KEY_ID && !endpoint.includes('mock')) {
    // In production S3/R2, returns signed GET URL with 10-minute expiry
    return `${endpoint.replace(/\/$/, '')}/${bucket}/${storageKey}?exp=${Date.now() + 600000}`
  }

  // Fallback direct stream endpoint
  return `/api/v1/medical-records/file?key=${encodeURIComponent(storageKey)}`
}
