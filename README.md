# ShifaLink

A responsive, browser-based healthcare SaaS platform connecting patients, doctors, and diagnostic providers.

**Tech stack:** Next.js App Router · TypeScript · PostgreSQL · Prisma · Sanity CMS · Tailwind CSS · shadcn/ui · next-intl · Redis · BullMQ

---

## Project status

| Milestone | Status |
|---|---|
| M0 — Foundation Documents | ✅ Complete |
| M1 — Repository Shell & UI Foundation | ✅ Complete |
| M2 — PostgreSQL, Prisma & Authentication | ⏳ Ready to start |
| M3 — Sanity CMS & Public Content | ✅ Complete (Schemas & Contracts) |
| M4 — Doctor Discovery & Appointments | ⏳ Awaiting M2 |
| M5 — Diagnostic Services & ShifaLink Drive | ⏳ Awaiting M4 |
| M6 — Multilingual Completion & Translation | ⏳ Awaiting M1 + M3 |
| M7 — AI Support Chat | ⏳ Awaiting M2 + M3 + M4 |
| M8 — Clinical AI Assistance | ⏳ Awaiting M5 + M7 |
| M9 — Administration, QA & Security | ⏳ Awaiting M7 + M8 |
| M10 — Deployment & Demonstration | ⏳ Awaiting M9 |

---

## Architecture summary

- **Only backend:** Next.js App Router — no NestJS, no second server
- **Operational data:** PostgreSQL via Prisma
- **Editorial content:** Sanity CMS (public pages, FAQs, articles only)
- **Medical files:** Private S3-compatible object storage (PostgreSQL stores metadata only)
- **Background jobs:** Redis + BullMQ
- **Localisation:** 6 languages (en, ur, de, ar, fr, ja); RTL for Urdu and Arabic

Full architecture: [`docs/architecture/architecture.md`](docs/architecture/architecture.md)

---

## Prerequisites

- Node.js 20+
- pnpm (or npm)
- PostgreSQL 16+
- Redis 7+

---

## Local setup (available after M1)

```bash
# 1. Clone the repository
git clone <repo-url>
cd shifalink

# 2. Install dependencies
pnpm install

# 3. Configure environment
cp .env.example .env.local
# Edit .env.local with your local credentials

# 4. Run database migrations
pnpm prisma migrate dev

# 5. Seed synthetic data
pnpm prisma db seed

# 6. Start development server
pnpm dev
```

---

## Key documentation

| Document | Purpose |
|---|---|
| [`AGENTS.md`](AGENTS.md) | Coding-agent ownership matrix and hard constraints |
| [`docs/agent-specs/AGENTS.md`](docs/agent-specs/AGENTS.md) | Full agent specification |
| [`docs/architecture/architecture.md`](docs/architecture/architecture.md) | System architecture |
| [`docs/database/schema-notes.md`](docs/database/schema-notes.md) | Database entity design |
| [`docs/decisions/`](docs/decisions/) | Architecture Decision Records (ADR-01 – ADR-10) |
| [`.env.example`](.env.example) | Required environment variables |

---

## Important rules

- Do **not** store patient records, booking data, or consent records in Sanity
- Do **not** introduce NestJS or a second HTTP backend
- Do **not** commit real patient data or secrets to Git
- Do **not** auto-publish machine-translated clinical or legal content
- Run `pnpm lint && pnpm typecheck && pnpm test` before every commit

---

## Supported languages

English · اردو · Deutsch · العربية · Français · 日本語

---

## Licence

*(To be determined — do not assume open source until a licence is chosen and committed.)*
