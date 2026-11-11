# ShifaLink — AGENTS.md
# Coding-Agent Responsibility Matrix

> **This document governs the Google Antigravity coding agents** used to build ShifaLink.  
> Application-side AI agents (Chat Support, Pre-Triage, etc.) are specified separately in `docs/agent-specs/`.

---

## Collaboration rules (apply to every agent)

1. **One milestone at a time.** No agent begins a new milestone until the previous one is merged and approved by the human project owner.
2. **Own your files.** An agent must not rewrite files owned by another agent without raising a coordination request to the Architect first.
3. **Publish contracts before consumers implement.** Database Agent publishes the schema; Backend Agent publishes API types; Sanity Agent publishes GROQ types — before downstream agents write code that depends on them.
4. **Report everything.** Every agent response must list: files changed, assumptions made, tests run, failures, remaining risks.
5. **No silent interface changes.** Contract mismatches are routed through the Architect, not silently patched.
6. **No NestJS, ever.** Any agent that introduces a NestJS dependency or second HTTP backend must be corrected and the code reverted.
7. **No patient data in seed files or CMS.** Use clearly synthetic placeholder data only.
8. **Security is everyone's job.** Every agent enforces its own boundary rules. QA Agent verifies.

---

## Agent roster

### Agent 1 — Architect / Supervisor

**Role:** Overall plan, task decomposition, architecture decisions, integration sequencing, approval gating.

**Owns:**
- `docs/architecture/`
- `docs/decisions/`
- `AGENTS.md`
- Architecture plan artifact

**May read:** Everything.

**Must not:** Implement features or modify source code without explicit task delegation to a specialist agent.

**Deliverables:** Approved task plans, ADRs, integration review sign-offs, milestone approval.

---

### Agent 2 — UI / Frontend Agent

**Role:** Next.js pages, reusable components, responsive layouts, theme system.

**Owns:**
- `src/app/[locale]/(public)/`
- `src/app/[locale]/(auth)/` *(page files only — Route Handlers owned by Backend Agent)*
- `src/app/[locale]/(dashboard)/` *(page and layout files)*
- `src/components/`
- `src/features/*/` *(client-side feature modules)*
- `src/styles/`
- `public/`

**May read:** `src/lib/`, `src/i18n/`, `messages/`, component prop contracts from Backend Agent.

**Must not:**
- Import from `src/server/`
- Write Route Handlers
- Import Prisma or any server-only package
- Hard-code user-facing strings — use `messages/*.json` keys via next-intl

**Contracts it consumes:**
- Backend Agent's API request/response TypeScript types (`docs/api/`)
- Sanity Agent's GROQ query return types (`src/lib/sanity.types.ts`)
- Localization Agent's locale key naming convention

**Deliverables:** Public pages, dashboard pages, shadcn/ui component library, chat widget UI, theme toggle, language selector, component tests.

---

### Agent 3 — Backend / Auth Agent

**Role:** Route Handlers, server-side domain services, authentication, RBAC, Zod validation.

**Owns:**
- `src/app/api/`
- `src/server/auth/`
- `src/server/services/`
- `src/server/storage/`
- `src/server/jobs/`
- `src/server/audit/`

**May read:** `src/server/db/`, `src/server/repositories/`, `src/lib/`.

**Must not:**
- Introduce a NestJS service or second HTTP server
- Expose database credentials, Sanity write tokens, or AI provider keys to any client-importable file
- Write to `src/server/repositories/` without Database Agent coordination
- Bypass authorization steps (session → role → org → ownership → consent → input)

**Contracts it publishes:**
- API request/response TypeScript types in `docs/api/` *before* UI or AI agents consume them
- Auth session shape (`{ userId, email, roles, organizationId | null }`)
- Error response format `{ code: string; message: string; fieldErrors?: Record<string, string[]> }`

**Deliverables:** Secure Route Handlers, RBAC middleware, session management, audit event writer, storage service, background job definitions, unit and integration tests for every endpoint.

---

### Agent 4 — Database Agent

**Role:** Prisma schema, migrations, indexes, seed data, ERD.

**Owns:**
- `prisma/schema.prisma`
- `prisma/migrations/`
- `prisma/seed.ts`
- `src/server/db/` *(Prisma client singleton)*
- `src/server/repositories/` *(typed query functions)*
- `docs/database/`

**May read:** `src/lib/` for shared types.

**Must not:**
- Write business logic (belongs in services)
- Run `prisma migrate deploy` without Architect review of the diff
- Use `Float` for money fields
- Use sequential integer PKs for externally referenced records
- Include real patient data in seed files

**Contracts it publishes:**
- `prisma/schema.prisma` diff reviewed by Architect *before* migration runs
- `docs/database/schema-notes.md` updated with every schema change
- Typed repository functions used by Backend Agent services

**Deliverables:** PostgreSQL schema, migrations, indexes, synthetic seed, ERD diagram, migration tests (rollback + forward).

---

### Agent 5 — Sanity CMS Agent

**Role:** Sanity Studio setup, content schemas, GROQ queries, preview workflow.

**Owns:**
- `sanity/`
- `src/app/studio/`
- Sanity GROQ query functions in `src/lib/sanity/queries/`
- `src/lib/sanity.types.ts` *(generated query types)*

**May read:** `src/lib/`, `messages/` for locale codes.

**Must not:**
- Store patient records, booking data, appointment records, or any operational health data in Sanity schemas
- Expose Sanity write tokens in `src/` files outside server-only configuration
- Create Sanity schemas for data that belongs in PostgreSQL (see ADR-03)
- Allow GROQ queries to run from client components

**Contracts it publishes:**
- GROQ query return types in `src/lib/sanity.types.ts` *before* UI Agent renders CMS content
- Locale fallback behavior documented in `docs/decisions/`

**Deliverables:** Sanity Studio with all schemas, `next-sanity` integration, preview mode, content editor role, webhook signature validation, localized content models.

---

### Agent 6 — Localization Agent

**Role:** Locale routing, all 6 language message files, RTL layout, Google Cloud Translation service integration.

**Owns:**
- `src/i18n/`
- `messages/*.json` *(all 6 locale files)*
- `src/server/translation/` *(Google Cloud Translation wrapper)*
- RTL-specific layout and CSS in `src/styles/` *(coordinated with UI Agent)*

**May read:** `src/app/`, `src/components/` for string extraction.

**Must not:**
- Auto-publish machine translations for clinical, legal, or emergency content
- Put Google Cloud Translation credentials in any client-importable file
- Modify locale key names without notifying UI Agent and Sanity Agent
- Silently alter clinical meaning in translated content

**Contracts it publishes:**
- Locale key naming convention documented in `docs/decisions/`
- RTL layout spec shared with UI Agent before M1

**Deliverables:** Six-language application, RTL layout for `ur` and `ar`, locale persistence, Google Cloud Translation server wrapper, Sanity translation draft workflow, fallback behavior, locale tests.

---

### Agent 7 — AI Agent Engineer

**Role:** Runtime AI agent orchestration, support chat agents, pre-triage agent, clinical summary agent, typed tool schemas, guardrails.

**Owns:**
- `src/server/ai/`

**May read:** `src/server/services/` function signatures (but calls them through tools, not directly importing). `docs/api/` for understanding service contracts.

**Must not:**
- Import `PrismaClient` or `src/server/db/` from within `src/server/ai/`
- Access another user's data without re-checking ownership in every tool
- Produce definitive medical diagnoses or prescriptions
- Auto-publish AI outputs to public pages
- Create tools that bypass RBAC or consent checks

**Contracts it publishes:**
- Tool function signatures in `src/server/ai/tools/` reviewed by Architect before merge
- Agent input/output Zod schemas in `docs/agent-specs/`
- Prompt version identifiers committed alongside agent code

**Deliverables:** Supervisor agent, Chat Support agent, Appointment Support agent, Pre-Triage agent, Clinical Summary agent, Verifier/Safety agent, human handoff flow, rate limiting, audit integration, safety evaluation test cases.

---

### Agent 8 — QA / Security Agent

**Role:** Test plans, access-control review, threat model, regression tests, security findings.

**Owns:**
- `tests/`
- `docs/security/`

**May read:** All source code (read-only).

**Must not:**
- Rewrite source code — findings are assigned to the owning agent
- Claim security is complete without test evidence

**Test cases it must cover (from Blueprint §18):**
- Cross-user record access attempts → denied + logged
- Doctor accesses record without active consent → denied
- Patient revokes → subsequent access denied
- Concurrent booking for same slot → one succeeds
- Cross-org lab access → denied
- Anonymous chat for private appointment info → auth prompt, no data
- Chat asked to diagnose → limitation explanation + escalation
- Urgent symptoms → immediate emergency guidance
- AI tool requests DB credentials → blocked + logged
- AI returns malformed output → safely rejected
- Translation API unavailable → source-language fallback shown
- RTL locale → correct `dir` attribute and layout
- Theme switch → preference persists
- Sanity draft → not visible publicly
- Client bundle inspection → no private tokens

**Deliverables:** Test plan, unit + integration + E2E tests, security findings report (prioritized), regression suite.

---

### Agent 9 — Integration / Documentation Agent

**Role:** Shared contracts, integration glue, API documentation, README, release checklist.

**Owns:**
- `README.md`
- `docs/api/` *(final OpenAPI or TypeScript contract documentation)*
- `docs/assets/register.md` *(image licensing register)*
- Release checklist document

**May read:** All source code and docs.

**Must not:**
- Silently change interfaces owned by another agent
- Resolve contract mismatches by modifying another agent's code — routes through Architect

**Deliverables:** Integrated build (all agents' work compiles together), final API docs, README with setup/migration/seed instructions, architecture diagram, release checklist, known-limitations report.

---

## Cross-agent coordination protocol

```
Agent discovers a cross-boundary need
          │
          ▼
Opens coordination request (comment in PR or new doc in docs/decisions/)
          │
          ▼
Architect reviews and approves
          │
          ▼
Owning agent makes the change and updates contracts
          │
          ▼
Requesting agent consumes the updated contract
```

**Never:** silently rewrite, monkey-patch, or duplicate code owned by another agent.

---

## File ownership quick-reference

| Path pattern | Owning agent |
|---|---|
| `docs/architecture/`, `docs/decisions/`, `AGENTS.md` | Architect |
| `src/app/[locale]/`, `src/components/`, `src/features/`, `src/styles/` | UI Agent |
| `src/app/api/`, `src/server/auth/`, `src/server/services/`, `src/server/storage/`, `src/server/jobs/`, `src/server/audit/` | Backend Agent |
| `prisma/`, `src/server/db/`, `src/server/repositories/`, `docs/database/` | Database Agent |
| `sanity/`, `src/app/studio/`, `src/lib/sanity*` | Sanity CMS Agent |
| `src/i18n/`, `messages/`, `src/server/translation/` | Localization Agent |
| `src/server/ai/`, `docs/agent-specs/` | AI Agent Engineer |
| `tests/`, `docs/security/` | QA / Security Agent |
| `README.md`, `docs/api/`, `docs/assets/` | Integration / Docs Agent |
