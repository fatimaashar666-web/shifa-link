# ShifaLink — ADR-01: Next.js App Router as the Only Application Backend

**Date:** 2026-11-11  
**Status:** Accepted  
**Deciders:** Project owner, Architect Agent

## Context

ShifaLink requires a full-stack web application serving a browser UI, authenticated APIs, background-job triggers, and server-side AI orchestration. Two common patterns exist: (a) a Next.js frontend calling a separate NestJS or Express backend, or (b) Next.js App Router handling both UI and backend concerns in a single codebase.

## Decision

**Next.js App Router is the only application backend.** No NestJS service, Express server, or second HTTP backend will be introduced.

Backend concerns are handled via:
- **Route Handlers** (`src/app/api/v1/**`) for REST-style API endpoints consumed by browser clients
- **Server Components** for data-fetched page rendering
- **Server Actions** for form mutations where appropriate
- **Server-only service layer** (`src/server/`) for domain logic, accessed only from Route Handlers and Server Components

## Consequences

**Positive:**
- Single deployment unit; simpler CI/CD, secrets management, and CORS configuration
- TypeScript types shared between frontend and backend without a generated client
- Prisma and server services are co-located and never exposed to the browser
- Aligns exactly with the blueprint constraint (§1.1, §4)

**Negative:**
- Background workers (BullMQ) run as a separate process; must be deployed alongside the Next.js application
- Some advanced backend patterns (e.g., WebSocket servers) require additional configuration or adapters

## Compliance

Any pull request that adds a NestJS dependency or a second HTTP server process must be rejected and referred to the Architect.
