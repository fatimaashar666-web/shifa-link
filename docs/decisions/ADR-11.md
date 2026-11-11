# ShifaLink — ADR-11: Technology Selections

**Date:** 2026-11-11  
**Status:** Accepted  
**Deciders:** Project owner

## Decisions recorded

| Decision | Choice | Rationale |
|---|---|---|
| Package manager | **npm** | Standard, no extra tooling required |
| Authentication library | **Auth.js v5** | Official Next.js-compatible library; session handling + credential provider |
| Object storage | **Cloudflare R2** | S3-compatible, no egress fees, global CDN |
| AI model/provider (runtime agents) | **Google Gemini** (via Gemini API) | Supports 6 languages natively; replaces placeholder AI_PROVIDER vars |
| Deployment target | **Railway** | Supports Next.js, PostgreSQL, Redis, and workers in one platform |
| M1 + M3 parallelism | **Yes** — run simultaneously | M3 Sanity schemas are independent of Next.js scaffold; saves calendar time |
| Git repository | **GitHub — repo name: Shifalink** | Version control and PR review |

## Env var updates from these decisions

```
# Cloudflare R2
STORAGE_ENDPOINT="https://<ACCOUNT_ID>.r2.cloudflarestorage.com"
STORAGE_REGION="auto"

# Gemini
AI_PROVIDER_API_KEY="<GEMINI_API_KEY>"
AI_PROVIDER_MODEL="gemini-1.5-pro"   # confirm at M7
```

## Consequences

- Database Agent uses `postgresql://` from Railway's managed Postgres in M10
- Redis from Railway's managed Redis in M10
- BullMQ worker deployed as a Railway service alongside the Next.js app
- Gemini SDK (`@google/generative-ai` or `@ai-sdk/google`) added to `src/server/ai/` only — not client-importable
- Cloudflare R2 SDK (`@aws-sdk/client-s3` — R2 is S3-compatible) used in `src/server/storage/` only
