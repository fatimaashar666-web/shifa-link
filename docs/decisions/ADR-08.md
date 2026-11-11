# ShifaLink — ADR-08: Modular Monolith Structure

**Date:** 2026-11-11  
**Status:** Accepted

## Decision

ShifaLink is built as a **modular monolith** — a single Next.js application with clearly separated feature modules under `src/features/` and server-side domain modules under `src/server/`. No microservices split is introduced for the initial capstone.

## Module boundaries

| Module | Directory | Boundary rule |
|---|---|---|
| Auth | `src/server/auth/` | Owns session, RBAC guards; no business logic |
| Database client | `src/server/db/` | Single Prisma singleton; no query logic here |
| Repositories | `src/server/repositories/` | Typed DB query functions; no business logic |
| Services | `src/server/services/` | Business logic + transactions; calls repositories |
| AI | `src/server/ai/` | Agents + tools; calls services only |
| Translation | `src/server/translation/` | GCP wrapper; no DB access |
| Storage | `src/server/storage/` | Presigned URLs + file validation; no DB access |
| Jobs | `src/server/jobs/` | BullMQ definitions; calls services |
| Audit | `src/server/audit/` | Writes audit events; no reads outside admin |

## Rationale

- Avoids network latency, distributed transaction complexity, and dual deployment overhead that microservices introduce
- Module boundaries are enforced by TypeScript imports and code ownership rules rather than network contracts
- Can be extracted into separate services later if measured need arises

## Consequences

- Agents must not import across forbidden module boundaries (enforced by ESLint `no-restricted-imports` rules added in M1)
- If a service boundary needs to change, the Architect must approve it as an ADR amendment
- Performance bottlenecks are addressed with caching and query optimisation before considering service extraction
