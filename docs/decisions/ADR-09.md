# ShifaLink — ADR-09: UUID Primary Keys for All Externally Referenced Records

**Date:** 2026-11-11  
**Status:** Accepted

## Decision

All PostgreSQL tables whose primary keys are exposed in URLs, API responses, or used in record-sharing workflows must use UUID (`@id @default(uuid())` in Prisma) as the primary key type. Sequential integer IDs must not be used for `users`, `patient_profiles`, `doctor_profiles`, `appointments`, `diagnostic_bookings`, `medical_records`, `record_access_grants`, `support_conversations`, `support_tickets`, `agent_runs`, or `audit_events`.

Internal lookup tables with no external exposure (e.g., `roles`, `specialties`) may use auto-increment integers at the Database Agent's discretion.

## Rationale

- Sequential IDs enable enumeration attacks (IDOR): an attacker can iterate `GET /api/v1/appointments/1`, `/2`, `/3` to probe for data
- UUIDs make IDs unpredictable, forcing authorisation checks to be the security boundary rather than ID obscurity
- UUIDs are required for distributed or future-sharded data models

## Consequences

- Prisma models for sensitive tables use `String @id @default(uuid())`
- URL parameters are UUIDs; Route Handlers validate UUID format with Zod before any DB query
- Database Agent enforces this rule in the initial schema; no migration may change sensitive PKs to integers
