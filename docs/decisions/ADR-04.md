# ShifaLink — ADR-04: Redis + BullMQ for Background Jobs

**Date:** 2026-11-11  
**Status:** Accepted

## Decision

Redis and BullMQ handle all asynchronous, retryable background work: email notifications, in-app notification writes, long-running AI tasks, and report-processing jobs. BullMQ workers run as a separate Node.js process deployed alongside the Next.js application.

## Rationale

- Notifications and AI tasks must not block HTTP response time
- BullMQ provides built-in retry with backoff, dead-letter queues, and job monitoring
- Redis is a battle-tested, low-latency broker well-suited to this workload

## Consequences

- Workers call shared domain services (`src/server/services/`) — they do **not** bypass authorization
- Job payloads must not contain sensitive medical detail beyond the minimum needed to execute the task (e.g., a record ID, not the full record content)
- Job definitions live in `src/server/jobs/`; queue names and job types are typed constants
- A second process means a second `Dockerfile` target or a process manager entry in deployment
