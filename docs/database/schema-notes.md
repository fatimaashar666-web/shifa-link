# ShifaLink — Database Schema Notes

**Version:** 1.0 — M0 planning document  
**Owner:** Database Agent  
**Status:** Approved for M2 implementation  

> This document describes the intended schema at a planning level. The Database Agent translates this into `prisma/schema.prisma` with all enums, relations, indexes, constraints, and cascades defined. No migration runs until the Architect reviews the Prisma schema diff.

---

## 1. Design rules

| Rule | Detail |
|---|---|
| **UUIDs** | All externally referenced PKs are UUID (`String @id @default(uuid())`) |
| **Money** | Stored as `Decimal` (PostgreSQL `NUMERIC`) — never `Float` |
| **Timestamps** | All `DateTime` fields stored in UTC; use `@default(now())` for creation time |
| **Soft deletes** | Sensitive records use `deletedAt DateTime?` rather than hard delete where audit history matters |
| **Organization scope** | Every provider-owned record includes `organizationId`; every query filters by it |
| **No PHI in audit metadata** | `audit_events.metadata` holds IDs and event context, never clinical detail |
| **File bytes** | Never in PostgreSQL — `file_objects` holds only metadata and `storage_key` |
| **Indexes** | All foreign keys indexed; frequently filtered fields (status, scheduledAt, createdAt) indexed |

---

## 2. Entity groups and milestone delivery

### Group A — M2 (Authentication & Identity)

| Table | Key fields | Notes |
|---|---|---|
| `users` | `id` UUID, `email` unique, `passwordHash?`, `emailVerifiedAt?`, `status`, `createdAt`, `updatedAt` | Auth.js may replace `passwordHash` with provider references |
| `roles` | `id` int, `name` unique, `description` | Seeded: `patient`, `doctor`, `lab_admin`, `support_agent`, `content_editor`, `super_admin` |
| `user_roles` | `userId`, `roleId`, `organizationId?`, `assignedAt`, `assignedBy` | Composite unique `(userId, roleId, organizationId)` |
| `organizations` | `id` UUID, `name`, `type` enum(`clinic`,`lab`,`radiology`), `status`, `createdAt` | — |
| `organization_members` | `organizationId`, `userId`, `membershipRole`, `status`, `joinedAt` | Composite PK |
| `patient_profiles` | `id` UUID, `userId` unique, `fullName`, `dateOfBirth?`, `gender?`, `bloodGroup?`, `phone?`, `createdAt` | 1:1 with users |
| `doctor_profiles` | `id` UUID, `userId` unique, `fullName`, `licenseNumber` unique, `consultationFee` Decimal, `verificationStatus` enum, `bio?`, `createdAt` | 1:1 with users |
| `user_preferences` | `userId` PK, `locale`, `theme`, `updatedAt` | 1:1 with users |
| `audit_events` | See ADR-10 | Append-only |
| `consent_records` | `id` UUID, `patientId`, `consentType`, `version`, `grantedAt`, `withdrawnAt?` | — |

### Group B — M4 (Doctor Discovery & Appointments)

| Table | Key fields | Notes |
|---|---|---|
| `specialties` | `id` int, `name` unique, `slug` unique, `isActive` | Seeded with common medical specialties |
| `doctor_specialties` | `doctorId`, `specialtyId` | Composite PK |
| `doctor_qualifications` | `id` UUID, `doctorId`, `qualification`, `institution`, `year?` | — |
| `doctor_languages` | `doctorId`, `localeCode` | Composite PK |
| `doctor_locations` | `id` UUID, `doctorId`, `organizationId?`, `address`, `city`, `isActive` | — |
| `doctor_availability` | `id` UUID, `doctorId`, `locationId`, `weekday` int(0-6), `startTime`, `endTime`, `slotMinutes` | — |
| `availability_exceptions` | `id` UUID, `doctorId`, `startsAt` DateTime, `endsAt` DateTime, `reason?` | Blocks recurring slots |
| `appointments` | `id` UUID, `patientId`, `doctorId`, `locationId?`, `appointmentType` enum, `scheduledAt` DateTime, `status` enum, `meetingReference?`, `createdAt` | Status enum: `requested`, `confirmed`, `completed`, `cancelled`, `rejected`, `no_show` |
| `notifications` | `id` UUID, `userId`, `type`, `title`, `body`, `readAt?`, `createdAt` | No PHI in `body` |

### Group C — M5 (Diagnostics & Medical Records)

| Table | Key fields | Notes |
|---|---|---|
| `diagnostic_services` | `id` UUID, `organizationId`, `serviceType` enum(`lab`,`radiology`), `name`, `description?`, `price` Decimal, `isActive` | — |
| `diagnostic_service_locations` | `id` UUID, `serviceId`, `locationId`, `availabilityDetails?` | — |
| `diagnostic_bookings` | `id` UUID, `patientId`, `serviceId`, `organizationId`, `bookingAt` DateTime, `status` enum, `collectionType` enum | Status enum: `pending`, `confirmed`, `sample_collected`, `processing`, `completed`, `cancelled` |
| `diagnostic_booking_events` | `id` UUID, `bookingId`, `status`, `actorId`, `createdAt`, `notes?` | Audit trail for booking transitions |
| `file_objects` | `id` UUID, `storageKey`, `fileName`, `mimeType`, `sizeBytes` bigint, `checksum`, `uploadedBy`, `createdAt` | Never BYTEA |
| `medical_records` | `id` UUID, `patientId`, `fileObjectId`, `category` enum, `title`, `uploadedAt`, `visibility` enum(`private`,`shared`) | Category enum: `prescription`, `lab_report`, `radiology_report`, `scan_image`, `consultation_note`, `other` |
| `record_access_grants` | `id` UUID, `patientId`, `doctorId`, `medicalRecordId?`, `grantedAt`, `expiresAt?`, `revokedAt?` | null `medicalRecordId` = all-records grant |
| `diagnostic_reports` | `id` UUID, `bookingId`, `fileObjectId`, `publishedBy`, `publishedAt`, `status` enum | — |
| `prescriptions` | `id` UUID, `appointmentId`, `patientId`, `doctorId`, `createdAt`, `status` enum | — |
| `prescription_items` | `id` UUID, `prescriptionId`, `medicineName`, `instructions`, `duration?` | — |

### Group D — M7 (Support Chat & AI)

| Table | Key fields | Notes |
|---|---|---|
| `support_conversations` | `id` UUID, `userId?`, `visitorSessionId?`, `locale`, `status` enum, `assignedTo?`, `createdAt` | — |
| `support_messages` | `id` UUID, `conversationId`, `senderType` enum(`user`,`agent`,`human_agent`), `senderId?`, `messageText`, `createdAt` | — |
| `support_tickets` | `id` UUID, `conversationId`, `createdBy?`, `assignedTo?`, `category`, `priority`, `status` enum, `resolvedAt?` | — |
| `agent_runs` | `id` UUID, `conversationId?`, `agentName`, `modelProvider`, `promptVersion`, `status`, `startedAt`, `finishedAt?` | — |
| `agent_steps` | `id` UUID, `agentRunId`, `stepName`, `toolName?`, `status`, `inputReference?`, `outputReference?`, `createdAt` | inputReference/outputReference are storage keys, not raw data |
| `ai_feedback` | `id` UUID, `agentRunId`, `userId?`, `rating` int, `feedbackText?`, `createdAt` | — |

### Group E — M9 (Administration)

| Table | Key fields | Notes |
|---|---|---|
| `verification_requests` | `id` UUID, `userId`, `organizationId?`, `verificationType` enum, `status` enum, `reviewedBy?`, `reviewedAt?`, `documents?` JSON | JSON holds storage keys, not file bytes |

---

## 3. Key indexes (minimum required)

```
appointments: (doctorId, scheduledAt, status)
appointments: (patientId, scheduledAt)
diagnostic_bookings: (patientId, status)
diagnostic_bookings: (organizationId, status)
medical_records: (patientId, uploadedAt)
record_access_grants: (doctorId, patientId, revokedAt)
audit_events: (actorId, createdAt)
audit_events: (entityType, entityId, createdAt)
support_conversations: (userId, status)
agent_runs: (conversationId, startedAt)
```

---

## 4. Double-booking prevention

The `appointments` table must have a database-level unique partial index preventing two non-cancelled appointments for the same `(doctorId, scheduledAt)` pair:

```sql
CREATE UNIQUE INDEX appointments_no_double_book
  ON appointments (doctor_id, scheduled_at)
  WHERE status NOT IN ('cancelled', 'rejected');
```

The booking service also uses a serializable transaction or `SELECT FOR UPDATE` on the slot row to prevent race conditions at the application layer.

---

## 5. Synthetic seed data (M2 delivery)

| Entity | Count | Purpose |
|---|---|---|
| Patients | 3 | Cover profile, booking, and record scenarios |
| Doctors | 3 | Different specialties; 1 unverified |
| Lab organisation | 1 | 2 services |
| Radiology organisation | 1 | 1 service |
| Super Admin user | 1 | Admin workflow testing |
| Support Agent user | 1 | Handoff workflow testing |

**Rule:** No real personal data, real names, or real medical records in seed files. Use clearly synthetic names (e.g., "Test Patient Alpha").

---

## 6. Prisma schema review checklist (Database Agent pre-migration)

- [ ] All externally referenced tables use UUID PK
- [ ] All `Decimal` fields used for money (not `Float`)
- [ ] All `DateTime` fields have `@default(now())` or explicit UTC semantics documented
- [ ] Every foreign key has `@relation` with explicit `onDelete` behavior
- [ ] Unique constraints match business rules (email, licenseNumber, slot uniqueness)
- [ ] `audit_events` has no updateable fields
- [ ] `file_objects` has no `Bytes` / `BYTEA` field
- [ ] Architect reviews diff before `prisma migrate deploy` runs
