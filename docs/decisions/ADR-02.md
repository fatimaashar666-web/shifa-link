# ShifaLink — ADR-02: PostgreSQL + Prisma as the Operational Source of Truth

**Date:** 2026-11-11  
**Status:** Accepted

## Decision

PostgreSQL is the authoritative store for all operational, sensitive, and transactional data. Prisma ORM provides typed, migratable access.

**Stored in PostgreSQL:** user accounts, roles, sessions, patient/doctor profiles, appointments, diagnostic bookings, medical record metadata, consent grants, support conversations, AI run records, audit events, notifications.

**Not stored in PostgreSQL:** medical file bytes (object storage), editorial website content (Sanity), UI strings (locale JSON files).

## Rationale

- ACID transactions prevent double-booking and partial consent updates
- Prisma migrations provide a reproducible, version-controlled schema history
- Row-level ownership and organization-scoped queries are enforced at the query layer
- UUID primary keys prevent enumeration attacks on sensitive records

## Consequences

- Every schema change requires a Prisma migration file — no ad-hoc `ALTER TABLE` in production
- Money fields use `Decimal` (PostgreSQL `NUMERIC`), not `Float`
- All timestamps stored in UTC; application converts to user locale for display
- Database Agent owns `prisma/schema.prisma`; no other agent modifies it without coordination
