# ShifaLink — AGENTS.md (Root Reference)

This file is a quick reference for coding agents working in this repository.  
Full specification: [`docs/agent-specs/AGENTS.md`](docs/agent-specs/AGENTS.md)

---

## Hard constraints — read before writing a single line of code

1. **Next.js App Router is the ONLY application backend.** No NestJS. No second HTTP server.
2. **Sanity stores editorial content only.** Patient records, bookings, consents, support messages → PostgreSQL.
3. **AI agents use typed tools only.** No `PrismaClient` import inside `src/server/ai/`.
4. **Medical file bytes go in object storage.** PostgreSQL stores metadata only. No `BYTEA` for files.
5. **Every protected request runs: session check → role check → org check → ownership/consent check → Zod validation.**
6. **Audit events are written for every sensitive operation.**
7. **No real patient data in seed files, demos, or Git history.**
8. **Machine translations are drafts. Clinical/legal content requires human review before publish.**

---

## Coding-agent ownership summary

| Agent | Owns |
|---|---|
| **Architect** | `docs/architecture/`, `docs/decisions/`, `AGENTS.md` |
| **UI Agent** | `src/app/[locale]/`, `src/components/`, `src/features/`, `src/styles/`, `public/` |
| **Backend Agent** | `src/app/api/`, `src/server/auth/`, `src/server/services/`, `src/server/storage/`, `src/server/jobs/`, `src/server/audit/` |
| **Database Agent** | `prisma/`, `src/server/db/`, `src/server/repositories/`, `docs/database/` |
| **Sanity CMS Agent** | `sanity/`, `src/app/studio/`, `src/lib/sanity*` |
| **Localization Agent** | `src/i18n/`, `messages/`, `src/server/translation/` |
| **AI Agent Engineer** | `src/server/ai/`, `docs/agent-specs/` |
| **QA / Security Agent** | `tests/`, `docs/security/` |
| **Integration / Docs Agent** | `README.md`, `docs/api/`, `docs/assets/` |

**Before crossing a boundary: raise a coordination request to the Architect.**

---

## Milestone gate order

M0 → M1 → M2 ⟶ M4 → M5 → M7 → M8 → M9 → M10  
                M3 ↗ (can run parallel with M2)  
                M6 ↗ (can start after M1 + M3)

Each milestone requires human approval before the next begins.
