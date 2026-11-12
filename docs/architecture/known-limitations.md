# ShifaLink — Known Limitations & Operational Considerations

This document records architectural boundaries, current trade-offs, and scaling considerations for ShifaLink as of Milestone M10.

---

## 1. Storage & Large File Ingestion (ADR-06)
- **Direct-Upload Fallback in Development**: In development mode when AWS/R2 credentials are not set, `/api/v1/medical-records/upload-url` returns a synthetic storage key without executing a live PUT stream to object storage. For production environments, valid Cloudflare R2 or S3 bucket keys must be configured.
- **Large DICOM Volumes**: Currently individual DICOM slices (`.dcm` up to 50MB) are supported. Multi-gigabyte full volumetric CT/MRI sequence bundles (DICOM series ZIPs) are planned for chunked multipart upload in v2.

---

## 2. Telehealth Video Signaling
- The appointment system tracks `IN_PERSON` vs `VIDEO` appointments and verifies doctor availability on dedicated telehealth slots.
- Direct WebRTC/Daily.co signaling token issuance can be integrated into the appointment detail view; currently, virtual location URLs are stored and displayed.

---

## 3. Clinical AI Disclaimers & Regulatory Scope
- **Non-Diagnostic Scope**: As mandated by ADR-05, the AI Support Agent and Pre-Triage tools operate purely as scheduling assistants and educational guides. They **never** output definitive diagnoses, prescription dosages, or therapy recommendations.
- **Mandatory Clinician Acknowledgment**: Clinical AI summaries generated for physicians require explicit active review before any clinical note can be finalized. This requirement is enforced server-side.

---

## 4. Email / SMS Notification Delivery
- In development/staging, notifications are written synchronously to the `notifications` table and queryable via patient dashboards. For production scale, SMTP credentials (`EMAIL_SMTP_HOST`, `EMAIL_SMTP_USER`, etc.) should be connected to a transactional provider such as Resend, Amazon SES, or SendGrid.
