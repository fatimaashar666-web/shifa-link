# ShifaLink — ADR-06: Private Object Storage for Medical Files

**Date:** 2026-11-11  
**Status:** Accepted

## Decision

All uploaded medical file bytes are stored in a private S3-compatible object storage bucket. PostgreSQL stores only file metadata (`file_objects` table: `storage_key`, `file_name`, `mime_type`, `size_bytes`, `checksum`, `uploaded_by`). No `BYTEA` column will ever be used for medical files.

Download access is provided via short-lived presigned URLs generated server-side **after** an authorisation check at the moment of the download request — not at the time the URL was created.

## Rationale

- Prevents medical files from inflating PostgreSQL storage and degrading query performance
- Presigned URLs allow direct client-to-storage download without proxying bytes through Next.js
- Re-checking authorisation at download time prevents stale URL reuse after consent is revoked

## File validation requirements (enforced before upload URL is issued)

- Allowed MIME types: `application/pdf`, `image/jpeg`, `image/png`, `image/webp`, `image/dicom`
- Maximum file size: 50 MB (configurable via env var)
- File extension must match declared MIME type
- Uploader must be authenticated and authorised to upload for the target patient

## Consequences

- Storage service implementation lives in `src/server/storage/`
- Object storage provider credentials are environment variables, never in source code
- Storage Agent (Backend Agent) must implement virus/malware scanning hook where the provider supports it
- All uploads, views, downloads, and consent changes must be written to `audit_events`
