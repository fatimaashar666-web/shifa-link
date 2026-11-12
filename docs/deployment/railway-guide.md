# ShifaLink — Railway Production Deployment Guide

This guide details the step-by-step production deployment of **ShifaLink** to [Railway](https://railway.com) using containerized Next.js and Supabase PostgreSQL.

---

## Architecture Topology

```
                  [ Internet Users / Patients / Clinicians ]
                                    │
                                    ▼ (HTTPS / Custom Domain)
                    ┌───────────────────────────────┐
                    │      Railway Next.js App      │
                    │  (Sole Full-Stack Backend)    │
                    └───────────────┬───────────────┘
                                    │
          ┌─────────────────────────┼─────────────────────────┐
          ▼                         ▼                         ▼
┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│   PostgreSQL     │      │  Cloudflare R2   │      │    Sanity CMS    │
│  (Supabase DB)   │      │ (Medical Files)  │      │(Editorial/Blog)  │
│ - Transaction    │      │ - Encrypted at   │      │ - Public articles│
│   Pooler (Port   │      │   Rest (ADR-06)  │      │ - Multilingual   │
│   6543)          │      │ - Presigned URLs │      │   FAQ documents  │
│ - Direct Session │      │ - Never raw DB   │      │ - No PHI / PII   │
│   (Port 5432)    │      └──────────────────┘      └──────────────────┘
└──────────────────┘
```

---

## 1. Prerequisites

1. A Railway account ([railway.com](https://railway.com)).
2. A PostgreSQL database (e.g., Supabase, Railway Postgres, or Neon).
3. Cloudflare R2 bucket (or AWS S3 bucket) for medical file storage (ADR-06).
4. Sanity project credentials (`NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`).

---

## 2. Environment Variables Configuration

Configure the following environment variables in the Railway dashboard:

### Database & Connections
| Variable | Example Value | Description |
|---|---|---|
| `DATABASE_URL` | `postgresql://postgres.[ref]:[pass]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true` | Transaction pooled connection |
| `DIRECT_URL` | `postgresql://postgres:[pass]@db.[ref].supabase.co:5432/postgres` | Session migration connection |

### Authentication & Secrets
| Variable | Description |
|---|---|
| `AUTH_SECRET` | 32+ character random hex string (`openssl rand -hex 32`) |
| `JWT_SECRET` | 32+ character random secret for jose JWT verification |

### Object Storage (Cloudflare R2 / AWS S3)
| Variable | Description |
|---|---|
| `STORAGE_ENDPOINT` | `https://[account-id].r2.cloudflarestorage.com` |
| `STORAGE_BUCKET_NAME` | `shifalink-medical-records` |
| `STORAGE_ACCESS_KEY_ID` | R2/S3 access key |
| `STORAGE_SECRET_ACCESS_KEY` | R2/S3 secret key |

### AI Assistant & Runtime Model
| Variable | Description |
|---|---|
| `AI_PROVIDER_API_KEY` | Gemini API key for clinical pre-triage agent |
| `AI_PROVIDER_MODEL` | e.g. `gemini-1.5-flash` or `gemini-2.0-flash` |
| `FEATURE_AI_CHAT` | `true` |

---

## 3. Deployment Procedure

### Option A: Railway GitHub Integration (Recommended)
1. Link your GitHub repository in Railway.
2. Select the repository root.
3. Railway will detect `railway.toml` and `Dockerfile`.
4. Add the environment variables from Section 2.
5. Deploy. The `startCommand` will automatically run `npx prisma db push` before starting the Next.js production server.

### Option B: Railway CLI
```bash
# Login to Railway
railway login

# Link existing project
railway link

# Deploy current branch
railway up
```

---

## 4. Post-Deployment Database Seed

Once the production database schema is deployed, seed synthetic reference data:

```bash
# From local or via Railway CLI
npm run db:seed
```

This populates:
- Core RBAC system roles (`patient`, `doctor`, `lab_admin`, `radiology_admin`, `super_admin`)
- 6 medical specialties
- Diagnostic lab and radiology catalog
- Synthetic test accounts (all passwords `Password1!` or role-specific seed credentials)
