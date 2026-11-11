# ShifaLink — ADR-05: AI Agents Use Narrow Typed Tools Only — No Direct Database Access

**Date:** 2026-11-11  
**Status:** Accepted

## Decision

Application-side AI agents (Chat Support, Pre-Triage, Clinical Summary, etc.) must never receive database credentials, a Prisma client instance, or unrestricted access to any data store. All data access from an AI agent goes through a predefined, typed tool function in `src/server/ai/tools/`. Each tool calls `src/server/services/` functions and re-checks user identity, role, organization scope, record ownership, and consent before returning data.

## Rationale

- Prevents prompt-injection attacks from escalating to arbitrary data access
- Enforces least-privilege: each agent tool exposes only the minimum data needed for its purpose
- Keeps authorization logic in one place (services layer) rather than scattered across agent prompts
- Makes AI tool surface auditable — every tool call is logged in `agent_steps`

## AI tool contract requirements

Every tool must:
1. Accept a typed input validated by Zod
2. Accept the calling `userId` and re-verify permissions server-side (not from the prompt context)
3. Return a typed output validated by Zod
4. Write to `agent_steps` on completion or failure
5. Not import `PrismaClient` — call a service function instead

## Consequences

- AI Agent Engineer must not add `import { db } from "@/server/db"` to any file in `src/server/ai/`
- QA Agent must verify this boundary in security review (M9)
- Each new tool requires Architect review before merge
