# ShifaLink

ShifaLink is a responsive, multilingual healthcare platform built with Next.js. It connects patients with doctors and diagnostic providers through doctor discovery, appointment booking, laboratory and radiology services, secure medical records, and guarded AI-assisted support workflows.

> This capstone application uses synthetic development data. It is not a substitute for professional medical advice, diagnosis, or emergency care.

## Features

- Patient registration, login, email verification, password reset, and password changes
- Role-based access for patients, doctors, diagnostic providers, support workflows, and administrators
- Doctor search, public profiles, availability, and appointment booking
- Laboratory and radiology service catalogs backed by PostgreSQL
- Diagnostic cart and configurable external checkout handoff
- Secure ShifaLink Drive metadata and private S3-compatible file storage
- Patient-controlled sharing of medical records with doctors
- Sanity CMS for public pages, FAQs, legal content, articles, navigation, and service information
- Six locales: English, Urdu, German, Arabic, French, and Japanese
- RTL layout support for Urdu and Arabic
- Light, dark, and system theme modes
- Server-side AI support and clinical-summary workflows with permission-checked tools
- Audit logging for sensitive account, booking, record, and administrative actions

## Technology

- Next.js App Router 16 and React 19
- TypeScript
- PostgreSQL with Prisma ORM
- Supabase-compatible PostgreSQL deployment
- Sanity CMS with next-sanity
- Tailwind CSS 4 and Radix UI primitives
- next-intl for localization
- S3-compatible object storage for medical files
- Zod for runtime validation
- Railway and Docker for deployment

## Architecture

PostgreSQL is the source of truth for operational and sensitive data:

- users, roles, permissions, and audit events
- doctor profiles and availability
- appointments and diagnostic bookings
- laboratory and radiology catalogs, pricing, and translations
- medical-record metadata, sharing grants, and report status

Sanity stores editorial website content only:

- home page and site settings
- pages, navigation, FAQs, articles, legal pages, and service information
- localized editorial content

Medical files are stored in private S3-compatible object storage. PostgreSQL stores file metadata and storage keys; downloads use permission-checked, short-lived URLs.

## Project structure

~~~text
shifa-link/
├── messages/                 # UI translation messages
├── prisma/                   # Prisma schema, migrations, seeds, catalog CSV
├── sanity/                   # Sanity configuration and editorial schemas
├── scripts/                  # CMS runner and security/storage checks
├── src/app/                  # Next.js routes and API route handlers
├── src/components/           # Shared UI and layout components
├── src/features/             # Feature-specific client workflows
├── src/i18n/                 # Locale routing and request configuration
├── src/lib/                  # Shared application and Sanity helpers
├── src/server/               # Auth, services, repositories, storage, AI, audit
├── Dockerfile                # Railway production image
├── railway.toml              # Railway build and deployment configuration
└── .env.example              # Environment variable template
~~~

## Prerequisites

- Node.js 20 or later
- npm
- PostgreSQL 15 or later, Supabase, or another compatible PostgreSQL provider
- A Sanity project for CMS content
- S3-compatible object storage if using ShifaLink Drive uploads

Optional integrations include SMTP, Google Cloud Translation, Redis/BullMQ, an AI provider, and an approved payment-provider checkout URL.

## Local setup

### 1. Clone and install

~~~bash
git clone https://github.com/fatimaashar666-web/shifa-link.git
cd shifa-link
npm install
~~~

### 2. Configure environment variables

Copy the template:

~~~bash
cp .env.example .env.local
~~~

On Windows PowerShell:

~~~powershell
Copy-Item .env.example .env.local
~~~

At minimum, configure:

~~~env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/shifalink?schema=public&pgbouncer=true"
DIRECT_URL="postgresql://USER:PASSWORD@HOST:5432/shifalink?schema=public"
SESSION_SECRET="a-random-secret-at-least-32-characters-long"
AUTH_SECRET="another-random-secret"
NEXTAUTH_URL="http://localhost:3000"

NEXT_PUBLIC_SANITY_PROJECT_ID="your-sanity-project-id"
NEXT_PUBLIC_SANITY_DATASET="production"
~~~

The complete list of optional integrations and server-only secrets is documented in [.env.example](./.env.example). Never commit .env.local, service-account JSON files, database URLs, API tokens, or payment credentials.

### 3. Generate Prisma Client and apply migrations

For a normal development database:

~~~bash
npm run db:generate
npm run db:migrate
~~~

For a hosted database where migrations are already committed:

~~~bash
npx prisma migrate deploy
~~~

Use Prisma db push only for intentional prototyping or a disposable database. Production schema changes should use committed Prisma migrations.

### 4. Seed development data

~~~bash
npm run db:seed
npm run db:seed:diagnostics
npm run db:seed:diagnostic-translations
~~~

The catalog source file is [prisma/shifalink_karachi_lab_test_catalog.csv](./prisma/shifalink_karachi_lab_test_catalog.csv). Seed data is synthetic and intended for development/demo environments.

### 5. Start the application

~~~bash
npm run dev
~~~

Open [http://localhost:3000/en](http://localhost:3000/en). Other supported locale prefixes are /ur, /de, /ar, /fr, and /ja.

## Sanity CMS

The application contains an embedded Sanity Studio at /studio.

Run the Next.js development server and open http://localhost:3000/studio:

~~~bash
npm run dev
~~~

CMS commands:

~~~bash
npm run cms:dev       # Run Sanity CLI development mode
npm run cms:build     # Build the standalone Sanity bundle
npm run cms:deploy    # Deploy a Sanity-hosted Studio when desired
~~~

The deployed Railway Studio is available at [https://shifa-link-production.up.railway.app/studio](https://shifa-link-production.up.railway.app/studio).

Configure the application URL as a Sanity CORS origin with credentials enabled. The embedded Studio base path is /studio, and the Sanity project ID and dataset must be available during the Next.js build because public environment variables are bundled into browser code.

## Payment configuration

The diagnostic cart uses NEXT_PUBLIC_DIAGNOSTIC_CHECKOUT_URL as an external checkout handoff. Set it to the approved JazzCash merchant checkout/integration URL supplied for the deployment:

~~~env
NEXT_PUBLIC_DIAGNOSTIC_CHECKOUT_URL="https://your-approved-jazzcash-checkout.example"
~~~

The public JazzCash homepage is not a payment integration. Production payment processing requires merchant credentials, callback/webhook verification, transaction reconciliation, and security review. Never put merchant secrets in public environment variables.

## Database migrations

Create a migration after changing [prisma/schema.prisma](./prisma/schema.prisma):

~~~bash
npm run db:migrate
~~~

Review the generated SQL before committing it. Deploy committed migrations with:

~~~bash
npx prisma migrate deploy
~~~

Do not edit an already-applied migration; create a new migration for a correction.

## Quality checks

Run these checks before opening a pull request:

~~~bash
npm run typecheck
npm run lint
npx ts-node -T scripts/run-security-tests.ts
npm run build
~~~

Storage-specific checks are available through:

~~~bash
node scripts/test-storage.mjs
~~~

## Demo data

The seed scripts create synthetic accounts and catalog records for local testing. Use the credentials defined by the current seed implementation and change them before sharing a deployed environment. Do not use seeded demo passwords for real users or production data.

## Security and privacy

- Keep database, storage, email, translation, AI, and Sanity write credentials server-side.
- Do not store patient files directly in PostgreSQL.
- Do not expose another patient's records, appointments, reports, or sharing grants.
- Enforce authorization on the server; hiding frontend controls is not authorization.
- Use private object storage and short-lived, permission-checked download URLs.
- Do not send passwords, OTPs, payment-card data, or unnecessary medical details to support chat.
- AI features must not diagnose, prescribe, or replace qualified clinical care.
- Use synthetic data during development and complete appropriate legal, security, and clinical reviews before handling real patient data.

## Deployment on Railway

The repository includes [Dockerfile](./Dockerfile) and [railway.toml](./railway.toml) for Railway deployment.

Configure these variables in the Railway service:

~~~env
NEXT_PUBLIC_SANITY_PROJECT_ID=your-sanity-project-id
NEXT_PUBLIC_SANITY_DATASET=production
NEXTAUTH_URL=https://your-production-domain.example
~~~

After changing a public environment variable, trigger a fresh deployment so Next.js rebuilds the browser bundle with the new value. The Dockerfile declares the Sanity variables as build arguments for this reason.

Verify the health route, application pages, database connectivity, and /studio after each deployment.

## Localization

Supported locales:

| Locale | Language | Direction |
|---|---|---|
| en | English | LTR |
| ur | Urdu | RTL |
| de | German | LTR |
| ar | Arabic | RTL |
| fr | French | LTR |
| ja | Japanese | LTR |

UI translations are stored in [messages](./messages). Editorial translations are managed in Sanity. Operational diagnostic names and descriptions are stored with the PostgreSQL catalog and localized through the diagnostic translation seed/data model.

## License

This project is confidential and proprietary unless a separate license is provided. Do not redistribute source code, credentials, patient data, or third-party assets without authorization.
