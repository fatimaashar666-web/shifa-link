# ShifaLink — ADR-10: Mandatory Audit Logging for Sensitive Operations

**Date:** 2026-11-11  
**Status:** Accepted

## Decision

An audit event must be written to the `audit_events` table for every operation in the following categories:

| Category | Events |
|---|---|
| Authentication | Login (success + failure), logout, password reset, email verification |
| Account | Role assignment, role removal, account status change, organization membership change |
| Medical records | Upload, metadata view, file download (URL generated), share grant created, share grant revoked |
| Appointments | Created, confirmed, cancelled, rejected, rescheduled, no-show marked |
| Diagnostic bookings | Created, status changed, report published |
| Consent | Consent granted, consent withdrawn |
| AI | Agent run started, tool call made, agent run completed, escalation triggered |
| Administration | Verification approved/rejected, audit log searched, admin action on another user's account |
| Support | Ticket created, assigned, resolved, human handoff triggered |

## Audit event fields

```
id            UUID
actor_type    "user" | "agent" | "system" | "worker"
actor_id      UUID | null (null for anonymous/system)
action        string  (e.g. "medical_record.download_url_generated")
entity_type   string  (e.g. "medical_record")
entity_id     UUID | null
organization_id UUID | null
metadata      JSON    (non-sensitive context only — no PHI in this field)
ip_address    string | null
created_at    DateTime (UTC)
```

## Consequences

- `src/server/audit/` exports a single `writeAuditEvent(params)` function used by all services
- Audit writes are non-blocking but must not silently fail — errors are logged separately
- Audit log is append-only; no service or agent may delete or update audit rows
- Admin access to audit log search is restricted by RBAC (`Super Administrator` role only)
- PHI must not appear in the `metadata` JSON field — use entity IDs to reference records
