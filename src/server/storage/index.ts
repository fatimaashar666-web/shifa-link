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
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

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

function getStorageConfig() {
  const endpoint = process.env.STORAGE_ENDPOINT?.trim()
  const bucket = process.env.STORAGE_BUCKET_NAME?.trim()
  const accessKeyId = process.env.STORAGE_ACCESS_KEY_ID?.trim()
  const secretAccessKey = process.env.STORAGE_SECRET_ACCESS_KEY?.trim()

  if (!endpoint || !bucket || !accessKeyId || !secretAccessKey) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'Object storage is not configured. Set STORAGE_ENDPOINT, STORAGE_BUCKET_NAME, STORAGE_ACCESS_KEY_ID, and STORAGE_SECRET_ACCESS_KEY.',
      )
    }

    return null
  }

  return {
    endpoint,
    bucket,
    accessKeyId,
    secretAccessKey,
    region: process.env.STORAGE_REGION?.trim() || 'auto',
    forcePathStyle:
      process.env.STORAGE_FORCE_PATH_STYLE === 'true' ||
      process.env.STORAGE_URL_STYLE?.trim().toLowerCase() === 'path',
  }
}

function createStorageClient(config: NonNullable<ReturnType<typeof getStorageConfig>>) {
  return new S3Client({
    region: config.region,
    endpoint: config.endpoint,
    forcePathStyle: config.forcePathStyle,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  })
}

/**
 * Generate a real S3-compatible presigned upload URL.
 * When storage is not configured in development, use the authenticated
 * direct-upload fallback so local development can still exercise the DB flow.
 */
export async function createPresignedUploadUrl(params: {
  storageKey: string
  mimeType: string
  sizeBytes: number
}): Promise<PresignedUploadResult> {
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

  const config = getStorageConfig()

  if (config) {
    const client = createStorageClient(config)
    const command = new PutObjectCommand({
      Bucket: config.bucket,
      Key: params.storageKey,
      ContentType: params.mimeType,
    })
    const uploadUrl = await getSignedUrl(client, command, { expiresIn: 15 * 60 })

    return {
      uploadUrl,
      storageKey: params.storageKey,
      expiresAt,
      requiredHeaders: { 'Content-Type': params.mimeType },
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
  const config = getStorageConfig()

  if (config) {
    const client = createStorageClient(config)
    const command = new GetObjectCommand({
      Bucket: config.bucket,
      Key: storageKey,
    })

    return getSignedUrl(client, command, { expiresIn: 10 * 60 })
  }

  // Fallback direct stream endpoint
  return `/api/v1/medical-records/file?key=${encodeURIComponent(storageKey)}`
}
