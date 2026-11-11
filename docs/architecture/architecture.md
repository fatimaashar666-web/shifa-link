# ShifaLink — System Architecture

**Version:** 1.0  
**Date:** 2026-11-11  
**Status:** Approved  
**Author:** Architect Agent (Antigravity session)

---

## 1. System overview

ShifaLink is a responsive, browser-based healthcare SaaS platform connecting patients, doctors, and diagnostic providers. The platform centralises doctor discovery, appointment booking, diagnostic bookings, secure medical records, and AI-assisted support.

### Core constraints (non-negotiable)

- **Next.js App Router is the only application backend.** No NestJS, no second server process alongside the Next.js application.
- **PostgreSQL is the operational source of truth** for all sensitive, transactional, and user-owned data.
- **Sanity is for public editorial content only.** Patient records, bookings, consents, and support messages must never be stored in Sanity.
- **AI agents call narrow typed server tools only.** They never receive raw database credentials or Prisma client access.
- **Private object storage holds all medical file bytes.** PostgreSQL stores only metadata and storage references.

---

## 2. High-level architecture diagram

```
                         PATIENT / DOCTOR / LAB / ADMIN
                                      │
                                      ▼
                         Browser: Next.js + TypeScript
                     Tailwind + shadcn/ui + i18n + Theme
                                      │
                                   HTTPS
                                      │
                                      ▼
                    ╔══════════════════════════════════════╗
                    ║   NEXT.JS FULL-STACK APPLICATION     ║
                    ║  App Router / Route Handlers /       ║
                    ║  Server Actions / Server Components  ║
                    ╚══════════════════════════════════════╝
                                      │
              ┌───────────────────────┼────────────────────┐
              ▼                       ▼                    ▼
       Auth & Sessions          Domain Services       CMS Integration
       Auth.js + RBAC           Zod + Prisma          next-sanity
       server/auth/             server/services/           │
              │                 server/repositories/       ▼
              │                       │               Sanity CMS
              │              ┌────────┴────────┐    (editorial only)
              │              ▼        ▼        ▼
              │           Booking  Medical   AI Gateway
              │           Services Records  server/ai/
              │              │        │        │
              │              │        │     Narrow typed tools
              │              │        │     (call services only)
              └──────────────┴────────┴────────┘
                                      │
                                      ▼
                                PostgreSQL
                           Operational source of truth
                                      │
                                      ▼
                           Redis + BullMQ Worker
                           Notifications / AI jobs
                                      │
                              ┌───────┴───────┐
                              ▼               ▼
                         Email Service    AI Provider
                         (SMTP/SES)       (LLM API)

         Private Object Storage ◄── Medical file metadata in PostgreSQL
         Google Cloud Translation API ◄── server/translation/ only
```

---

## 3. Technology stack

| Layer | Technology | Version policy |
|---|---|---|
| Full-stack framework | Next.js App Router + TypeScript | Latest stable at start of M1 |
| UI | Tailwind CSS + shadcn/ui | Latest stable |
| Theme | CSS variables + next-themes | Latest stable |
| Database | PostgreSQL | 16+ |
| ORM | Prisma | Latest stable |
| CMS | Sanity + next-sanity | Latest stable |
| Validation | Zod | Latest stable |
| Authentication | Auth.js v5 | Latest stable |
| Localization | next-intl | Latest stable |
| Translation | Google Cloud Translation API | v3 (Advanced) |
| Background jobs | Redis + BullMQ | Latest stable |
| File storage | S3-compatible (provider TBD) | — |
| AI orchestration | Server-side, provider-agnostic adapter (provider TBD) | — |
| Testing | Vitest + Playwright | Latest stable |

> Version lock: commit `package-lock.json` / `pnpm-lock.yaml` after initial install. Document selected versions in `docs/decisions/versions.md`.

---

## 4. Repository structure

```
shifalink/
├── AGENTS.md                    ← Coding-agent ownership matrix
├── README.md
├── .env.example                 ← All env vars named, no secrets
├── package.json
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts                  ← Synthetic data only
├── sanity/
│   ├── sanity.config.ts
│   ├── sanity.cli.ts
│   └── schemas/
├── messages/
│   ├── en.json
│   ├── ur.json
│   ├── de.json
│   ├── ar.json
│   ├── fr.json
│   └── ja.json
├── public/
│   ├── fonts/
│   └── icons/
├── src/
│   ├── app/
│   │   ├── [locale]/
│   │   │   ├── (public)/        ← Home, About, Find Doctor, Lab Tests, Articles
│   │   │   ├── (auth)/          ← Login, Register, Onboarding
│   │   │   └── (dashboard)/     ← Patient / Doctor / Lab / Admin dashboards
│   │   ├── api/
│   │   │   └── v1/              ← All Route Handlers
│   │   └── studio/
│   │       └── [[...tool]]/     ← Embedded Sanity Studio
│   ├── components/
│   │   ├── ui/                  ← shadcn/ui primitives
│   │   ├── layout/              ← Header, Footer, Sidebar, ThemeToggle, LangSelector
│   │   ├── chat/                ← ChatWidget, MessageBubble, HandoffBanner
│   │   └── forms/               ← Reusable form components
│   ├── features/                ← Thin client feature modules
│   │   ├── auth/
│   │   ├── doctors/
│   │   ├── appointments/
│   │   ├── diagnostics/
│   │   ├── medical-records/
│   │   ├── support/
│   │   └── admin/
│   ├── server/                  ← Server-only. Must never be imported by client components.
│   │   ├── auth/                ← Auth.js config, session helpers, RBAC guards
│   │   ├── db/                  ← Prisma client singleton
│   │   ├── repositories/        ← Typed DB query functions per domain
│   │   ├── services/            ← Business logic, transactions, validation
│   │   ├── ai/                  ← AI orchestrator + agent definitions + tool schemas
│   │   ├── translation/         ← Google Cloud Translation API wrapper
│   │   ├── storage/             ← Signed-URL generation, file validation
│   │   ├── jobs/                ← BullMQ queue definitions and job handlers
│   │   └── audit/               ← Audit event writer
│   ├── i18n/                    ← next-intl config, routing, RTL helpers
│   ├── lib/                     ← Shared utilities, Zod schemas, error types
│   └── styles/                  ← Global CSS, design tokens, theme CSS variables
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
└── docs/
    ├── architecture/            ← This file + system diagrams
    ├── database/                ← ERD, schema notes, design rules
    ├── agent-specs/             ← AGENTS.md + runtime AI agent contracts
    ├── api/                     ← Route handler contracts (TypeScript types + OpenAPI)
    ├── security/                ← Threat model, findings, review records
    ├── decisions/               ← ADR files (ADR-01 … ADR-10)
    └── assets/                  ← Asset register (image sources, licenses)
```

---

## 5. Server / client boundary rules

| Location | Rule |
|---|---|
| `src/server/**` | **Never** imported by client components (`"use client"`). Add `server-only` package import at top of each file. |
| `src/app/api/**` | Route Handlers — server-only. All requests go through auth + Zod validation first. |
| `src/components/**` | UI only. No direct Prisma or server service imports. Receives data as props from Server Components. |
| `src/features/**` | Thin client modules. May call Route Handlers via `fetch`. No direct server imports. |
| `sanity/**` | Studio only. No patient data. Write tokens not imported in `src/`. |

---

## 6. Data boundary rules

| Data type | Storage location | Access pattern |
|---|---|---|
| User accounts, passwords, sessions | PostgreSQL | Auth.js session, server-side only |
| Patient / doctor profiles | PostgreSQL | Server Component or Route Handler with RBAC check |
| Appointments, bookings | PostgreSQL | Server-side services with transaction + constraint checks |
| Medical record metadata | PostgreSQL | Record-level ownership + consent check on every access |
| Medical file bytes | Private object storage | Presigned URL generated server-side, re-checked at download |
| Consent grants | PostgreSQL | Checked at moment of access, not cached client-side |
| Support conversations | PostgreSQL | Conversation ownership + role check |
| AI run records | PostgreSQL | Audit only; not exposed to end users directly |
| Public pages, FAQs, articles | Sanity | GROQ queries from Server Components only |
| UI strings | `messages/*.json` | next-intl, build-time |
| Translations of editorial content | Sanity (draft state) | Published only after human review |

---

## 7. Authentication and authorisation flow

```
Request arrives at Route Handler
         │
         ▼
1. Extract session (Auth.js)        → 401 if no valid session
         │
         ▼
2. Load user roles from DB          → 403 if insufficient role
         │
         ▼
3. Check organization membership    → 403 if org mismatch
         │
         ▼
4. Check record ownership / consent → 403 if not owner or no active grant
         │
         ▼
5. Validate input (Zod schema)      → 422 if invalid
         │
         ▼
6. Execute service function
         │
         ▼
7. Write audit event
         │
         ▼
8. Return typed response
```

Hiding a UI button is **not** authorisation. Every step above must run on the server for every protected request.

---

## 8. AI agent architecture

```
User message (validated, assigned conversation ID)
         │
         ▼
   Supervisor Agent
   (classifies intent, selects specialist)
         │
    ┌────┴────────────────────┐
    ▼                         ▼
Chat Support Agent      Appointment Support Agent
    │                         │
    ▼                         ▼
 Typed tools (read-only)   Typed tools (read-only)
  - searchFaqs()             - getMyBookingSummary()
  - createHandoffTicket()    - createChangeRequest()
    │
    ▼
Verifier / Safety Agent
(validates schema, safety constraints, escalation)
    │
    ▼
Response → user (in selected language)
```

**AI tool constraints:**
- Every tool re-checks `userId`, `role`, `organizationId`, `recordOwnership`, `consent`
- Tools are plain async TypeScript functions in `src/server/ai/tools/`
- No tool imports `PrismaClient` directly — calls `src/server/services/` only
- Every AI run writes to `agent_runs` and `agent_steps` tables

---

## 9. Background job architecture

```
Next.js Route Handler
    │  enqueue job
    ▼
BullMQ Queue (Redis)
    │
    ▼
BullMQ Worker (separate process)
    │
    ├── NotificationJob → Email service (SMTP/SES)
    ├── NotificationJob → In-app notification (PostgreSQL write)
    └── AIJob → AI orchestrator → typed tools → domain services
```

Workers call shared domain services. They do **not** bypass authorization rules.

---

## 10. Milestone sequence

| Milestone | Name | Prerequisite |
|---|---|---|
| M0 | Foundation Documents | Architect approval |
| M1 | Repository Shell & UI Foundation | M0 approved |
| M2 | PostgreSQL, Prisma & Authentication | M1 complete |
| M3 | Sanity CMS & Public Content | M1 complete (can parallel with M2) |
| M4 | Doctor Discovery & Appointment Workflows | M2 complete |
| M5 | Diagnostic Services & ShifaLink Drive | M4 complete |
| M6 | Multilingual Completion & Translation Service | M1 + M3 complete |
| M7 | AI Support Chat | M2 + M3 + M4 complete |
| M8 | Clinical AI Assistance | M5 + M7 complete |
| M9 | Administration, QA & Security Hardening | M7 + M8 complete |
| M10 | Deployment & Demonstration | M9 complete |

---

## 11. References

- Blueprint: `ShifaLink_Capstone_Blueprint.md`  
- ADRs: `docs/decisions/ADR-01.md` through `docs/decisions/ADR-10.md`  
- Database schema: `docs/database/schema-notes.md`  
- Agent ownership: `docs/agent-specs/AGENTS.md`  
- Env vars: `.env.example`
