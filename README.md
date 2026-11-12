# ShifaLink — Responsive Multilingual Healthcare SaaS

> **Modern, Privacy-Conscious Digital Healthcare Platform**  
> Connecting patients, verified medical practitioners, and certified diagnostic centers across unified clinical workflows with guardrailed AI assistance.

---

## 🌟 Milestone Status Overview

| Milestone | Scope | Status | Commit |
|---|---|---|---|
| **M0** | Architecture, ADRs, AGENTS.md, Specifications | ✅ Approved | `cf1cb91` |
| **M1** | Next.js App Router UI Foundation, Tailwind, shadcn/ui, RTL, 6 Locales | ✅ Approved | `cf1cb91` |
| **M2** | PostgreSQL Schema, Auth.js / JWT Session, RBAC Guards, Audit Writer | ✅ Approved | `8867222` |
| **M3** | Sanity CMS Schemas (Public Editorial, FAQs, Legal, Health Articles) | ✅ Approved | `cf1cb91` |
| **M4** | Doctor Discovery, Availability Slot Generation, Appointment Booking | ✅ Approved | `8e947a7` |
| **M5** | Diagnostic Services, ShifaLink Drive (ADR-06 Object Storage), Records | ✅ Approved | `33e618f` |
| **M6** | Multilingual Polish (en/ur/de/ar/fr/ja), Sanity Article Integration | ✅ Approved | `17e01cc` |
| **M7** | AI Patient Support Agent, Safe Typed Tools, Clinical Pre-Triage | ✅ Approved | `1c8d5e4` |
| **M8** | Clinical AI Assistance, Patient Record Summarizer, Doctor Review Gate | ✅ Approved | `df79428` |
| **M9** | Admin Verification Queue, Security Audit Explorer, Invariant Tests | ✅ Approved | `1243d89` |
| **M10**| Railway Deployment Guide, Dockerfile, Final Topology & Docs | ✅ Completed | `Current` |

---

## 🏛️ Core Architectural Invariants

- **Sole Backend (ADR-01)**: Next.js App Router is the **only** backend. No NestJS or auxiliary backend servers.
- **Data Segregation (ADR-02 / ADR-03)**:
  - **PostgreSQL (Supabase)**: All operational, transactional, appointment, identity, and clinical metadata.
  - **Sanity CMS**: Public editorial health articles, FAQs, and marketing content only. **Zero patient or clinical data in Sanity**.
- **Medical File Storage (ADR-06)**: Medical files (PDF, DICOM, images) are **never stored as bytes in PostgreSQL**. Stored in private object storage (Cloudflare R2 / S3) with time-bounded presigned URLs.
- **Guardrailed AI Agents (ADR-05)**: AI agents use narrow typed tools only. **Zero direct database access** from AI modules.
- **Audit Trails (ADR-10)**: All sensitive identity, medical record, booking, and administrative actions write immutable audit logs to `audit_events`.

---

## 🚀 Quickstart & Local Setup

### 1. Prerequisites
- Node.js 20+
- PostgreSQL database (e.g. Supabase or local Postgres)

### 2. Installation
```bash
git clone https://github.com/Shifalink/shifalink.git
cd shifalink
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Configure your `DATABASE_URL` (pooled connection) and `DIRECT_URL` (direct migration connection).

### 4. Database Setup & Seed
```bash
# Push schema to database
npx prisma db push

# Populate synthetic reference data (roles, specialties, doctors, test accounts)
npm run db:seed
```

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Quality Gates & Verification

```bash
# TypeScript strict typecheck (0 errors)
npm run typecheck

# ESLint inspection (0 errors, 0 warnings)
npm run lint

# Security invariant regression test suite (§18 blueprint)
npx ts-node -T scripts/run-security-tests.ts

# Production build compilation
npm run build
```

---

## 👥 Demo Synthetic Accounts

All accounts seeded with synthetic data. Passwords are `Password1!` (or `AdminPass1!` / `DoctorPass1!` / `LabPass1!`):

| Role | Email | Capabilities |
|---|---|---|
| **Super Admin** | `admin@example.test` | Full admin queue, license verifications, security audit log search |
| **Doctor** | `doctor.gamma@example.test` | View appointments, clinical AI pre-consultation summary, patient-shared records |
| **Doctor** | `doctor.delta@example.test` | General medicine consultations and clinical schedules |
| **Patient Alpha** | `patient.alpha@example.test` | ShifaLink Drive records, book appointments, diagnostic test tracking |
| **Patient Beta** | `patient.beta@example.test` | Telehealth consultation booking and lab test management |
| **Lab Admin** | `lab.admin@example.test` | Diagnostic service management and lab sample updates |

---

## 📄 License & Compliance

Confidential & Proprietary. Built in accordance with healthcare privacy standards and clinical AI safety guardrails.
