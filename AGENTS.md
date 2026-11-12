# SHIFALINK

## Capstone Blueprint & Implementation Guide

**Project type:** Responsive, browser-based healthcare SaaS platform\
**Document version:** 1.0\
**Architecture decision:** Next.js full-stack application with
PostgreSQL and Prisma\
**Development approach:** Google Antigravity with task-specific AI
coding agents\
**Content management:** Sanity CMS\
**Supported languages:** English, Urdu, German, Arabic, French,
Japanese\
**Theme support:** Light and dark

------------------------------------------------------------------------

## Document purpose and how to use it

This document is the master specification for planning and implementing
ShifaLink. It defines the product vision, users, functional modules,
architecture, technology stack, application-side AI agents, database
schema, multilingual strategy, security controls, implementation phases,
testing plan, and capstone deliverables.

Do not ask one coding agent to generate the entire application in a
single prompt. Implement the system in small, approved milestones. Each
milestone must be planned, reviewed, tested, documented, and committed
before the next one begins.

## Project at a glance

  -----------------------------------------------------------------------
  Item                                Definition
  ----------------------------------- -----------------------------------
  Project                             ShifaLink

  Product format                      Responsive browser-based healthcare
                                      SaaS

  Target users                        Patients, doctors,
                                      laboratory/radiology providers,
                                      support staff, platform
                                      administrators

  Primary objective                   Connect healthcare users and
                                      providers through appointments,
                                      diagnostics, medical records, and
                                      controlled AI assistance

  Frontend and backend                Next.js App Router + TypeScript

  Database                            PostgreSQL

  ORM and migrations                  Prisma ORM

  CMS                                 Sanity

  Background jobs                     Redis + BullMQ (for asynchronous
                                      notifications and AI tasks)

  Application AI                      Server-side AI orchestration layer
                                      with specialized agents and typed
                                      tools

  Coding environment                  Google Antigravity with separate
                                      coding-agent responsibilities

  Languages                           English, Urdu, German, Arabic,
                                      French, Japanese

  Translation                         Application localization plus
                                      Google Cloud Translation API

  Theme                               Light and dark, with system
                                      preference support

  Data safety                         Synthetic data during development;
                                      real patient data only after
                                      security, legal, and clinical
                                      review
  -----------------------------------------------------------------------

## Learning outcomes

-   Convert a healthcare product idea into requirements, user stories,
    and acceptance criteria.
-   Design a Next.js full-stack application with clear server/client
    boundaries.
-   Model healthcare workflows in PostgreSQL and Prisma.
-   Use Sanity for structured website content and editorial workflows.
-   Implement authentication, role-based access control, and
    record-level authorization.
-   Build multilingual and right-to-left interfaces.
-   Coordinate separate AI coding agents through task ownership and
    shared contracts.
-   Build application-side AI assistants with restricted tools,
    structured outputs, and human escalation.
-   Test, document, deploy, and demonstrate a secure healthcare
    application.

------------------------------------------------------------------------

# 1. Product vision and scope

ShifaLink is a responsive healthcare platform connecting patients,
doctors, and diagnostic laboratories/radiology centers. It centralizes
doctor discovery, consultation bookings, diagnostic bookings, secure
medical records, and AI-assisted support.

The platform includes an AI-powered chat support system for answering
general platform questions, guiding users through workflows, and handing
complex or clinical questions to an appropriate human. A separate
clinical-support workflow may summarize patient-provided symptoms and
records for clinician review. AI must not replace a qualified healthcare
professional.

## 1.1 Core product principles

-   **Web-first:** Primary workflows operate in a responsive browser
    interface.
-   **One full-stack application:** Next.js provides the frontend, route
    handlers/server actions where appropriate, and server-side domain
    services. Do not introduce NestJS as a second backend.
-   **Human accountability:** AI may explain, summarize, classify, and
    recommend. Clinical decisions and sensitive account actions remain
    under authorized human control.
-   **Patient privacy:** Medical records are private by default and
    shared only through explicit, revocable permissions.
-   **Least privilege:** Users, staff, and agents receive only the data
    and tools needed for their task.
-   **Traceability:** Sensitive access, booking changes, consent
    changes, and AI runs are auditable.
-   **Separation of concerns:** PostgreSQL is the source of truth for
    operational and sensitive records; Sanity manages editorial website
    content.
-   **Incremental delivery:** Build secure core workflows before
    advanced AI automation.

## 1.2 In scope

-   Public healthcare website and content-managed pages
-   Patient, doctor, diagnostic-provider, support, and administrator
    accounts
-   Doctor directory and search
-   Doctor availability and appointment booking
-   Video and in-person consultation workflows
-   Laboratory and radiology service catalogs and bookings
-   Medical record uploads and patient-controlled sharing
-   AI-powered website/account support chat
-   AI pre-triage and clinician-facing summaries with strict boundaries
-   Notifications and support handoff
-   Six-language interface and content strategy
-   Light/dark theme
-   Admin and content-management workflows
-   Audit logs and role/tenant isolation

## 1.3 Out of scope for the initial capstone

-   AI making definitive diagnoses or issuing prescriptions
    independently
-   AI replacing emergency services or a clinician
-   Autonomous changes to medical records or appointment records without
    authorization
-   Direct integration with hospital systems or national health
    registries unless separately approved
-   Real payment processing until a compliant provider and approval
    workflow are selected
-   Claiming legal or regulatory compliance without a
    jurisdiction-specific assessment
-   Copying or hotlinking copyrighted Practo images without permission
    or a valid license

------------------------------------------------------------------------

# 2. Users, roles and permissions

  -----------------------------------------------------------------------
  Role                                Main responsibilities
  ----------------------------------- -----------------------------------
  **Patient**                         Search doctors and diagnostic
                                      centers; book appointments and
                                      tests; upload and view own records;
                                      manage sharing consent; use support
                                      chat.

  **Doctor**                          Manage profile and availability;
                                      review assigned appointments; view
                                      records shared by the patient;
                                      conduct consultations; create
                                      prescriptions and clinician notes.

  **Lab / Radiology Admin**           Manage organization profile,
                                      service catalog, schedules,
                                      bookings, test statuses, and
                                      diagnostic reports.

  **Support Agent**                   View assigned support
                                      conversations, respond to platform
                                      questions, and escalate issues
                                      under a defined support policy.
                                      Access to medical records is not
                                      granted by default.

  **Content Editor**                  Manage approved public pages, FAQs,
                                      articles, service descriptions, and
                                      translations in Sanity. No access
                                      to patient records.

  **Super Administrator**             Manage platform configuration,
                                      user/provider verification, role
                                      assignments, system monitoring, and
                                      authorized audit access.
  -----------------------------------------------------------------------

Implement RBAC and record-level authorization on the server. Hiding a
button in the frontend is not authorization. Every protected request
must verify identity, role, organization scope, record ownership, and
any required patient consent.

------------------------------------------------------------------------

# 3. Functional modules and requirements

## 3.1 Public website and navigation

Public navigation should include:

-   Home
-   About ShifaLink
-   Find a Doctor
-   Video Consultation
-   Lab Tests
-   Radiology Tests
-   Health Articles / Health Library
-   Contact / Support
-   Login / Patient Signup
-   Register as Doctor
-   Register as Diagnostic Provider
-   Language selector
-   Light/dark theme selector

Public page content should be editable through Sanity. Operational
provider availability, booking status, and patient-specific information
must come from PostgreSQL-backed application services.

## 3.2 Authentication and onboarding

-   Patient registration, login, logout, and password reset
-   Doctor onboarding and credential submission
-   Diagnostic organization onboarding
-   Email verification and account status
-   Secure sessions using vetted authentication patterns
-   Role and organization assignment
-   Doctor verification and approval workflow
-   Profile completion and account settings

## 3.3 Doctor discovery

-   Search by name, specialty, location, language, and availability
-   Filters for consultation type and fee range
-   Doctor profile with verified status, qualifications, experience,
    languages, and consultation fee
-   Display only approved public profile fields
-   Availability sourced from PostgreSQL
-   Do not treat CMS content as the authoritative source for schedules
    or bookings

## 3.4 Appointment management

-   Video and in-person appointment types
-   Doctor availability and time-slot management
-   Patient booking, rescheduling, and cancellation
-   Doctor accept/reject workflow where required
-   Appointment statuses: requested, confirmed, completed, cancelled,
    rejected, no-show
-   Protected video meeting links
-   Notifications for booking lifecycle events
-   Conflict prevention for overlapping appointments

## 3.5 Laboratory and radiology services

-   Lab and radiology provider directory
-   Search by location, service, modality, and availability
-   Service catalog with preparation instructions and pricing
    information where supplied
-   Booking and rescheduling
-   Sample collection or center-visit options where supported
-   Booking status tracking
-   Report upload and patient notification
-   Patient access to their own published results

## 3.6 ShifaLink Drive --- secure medical records

-   Private object storage; do not store uploaded binary files directly
    in PostgreSQL.
-   Store file metadata and storage keys in PostgreSQL.
-   Short-lived, permission-checked download URLs.
-   Validate file size, MIME type, extension, and upload authorization.
-   Categories: prescription, lab report, radiology report, scan/image,
    consultation note, other.
-   Patient-controlled sharing with a named doctor and defined expiry.
-   Revoke access when appropriate.
-   Audit uploads, views, downloads, and consent changes.
-   Use malware scanning where feasible.

## 3.7 AI-powered chat support

The chat support feature is available from public pages and
authenticated dashboards, with different permissions based on user
context.

**Core capabilities**

-   Answer FAQs about registration, account access, appointments,
    cancellations, diagnostic bookings, records, and platform
    navigation.
-   Search approved ShifaLink knowledge-base content from Sanity.
-   Guide users through workflows without bypassing authorization.
-   Detect when a request is account-specific and ask the user to sign
    in.
-   Create a support ticket or hand off the conversation to a human
    support agent.
-   Preserve conversation context and show when a human has taken over.
-   Support the six interface languages where the selected AI model
    supports them; otherwise use the translation service for language
    mediation.
-   Display a clear AI-assistant disclosure.

**Strict boundaries**

-   The support agent is not a diagnostic agent.
-   Do not expose patient records, doctor-only notes, private reports,
    or another user's booking details through public chat.
-   For account-specific answers, use authenticated backend tools that
    re-check the user's permissions.
-   Do not ask users to enter passwords, OTPs, payment-card details, or
    unnecessary sensitive medical information in chat.
-   Medical questions that require clinical judgment must be escalated.
    The support agent must not diagnose or prescribe.
-   Urgent/emergency symptoms must trigger clear advice to seek local
    emergency care immediately; the chatbot must not delay care or
    attempt to manage emergencies.
-   Human handoff must create a support queue item with the minimum
    necessary context.

## 3.8 AI pre-triage and clinician assistance

-   Collect structured symptom information only with clear user notice
    and consent.
-   Summarize patient-provided symptoms and selected records for a
    clinician.
-   Provide source references and indicate uncertainty or missing
    information.
-   Use read-only tools for the initial release.
-   A qualified clinician reviews all clinical summaries.
-   Do not produce a definitive diagnosis, prescribe medication, or
    autonomously change treatment.
-   Separate clinical AI records from general support-chat records.

## 3.9 Notifications

-   Email notifications for verification, appointment lifecycle,
    diagnostic booking, and published reports.
-   In-app notifications.
-   Background processing through Redis/BullMQ for retryable
    asynchronous work.
-   Do not include sensitive medical details in notification previews
    unless explicitly justified and protected.

## 3.10 Administration and audit

-   User and provider verification
-   Role and organization management
-   Support queue management
-   Service and category oversight
-   Audit log search for authorized administrators
-   AI run status and error monitoring
-   Operational dashboards with aggregate data only where possible

------------------------------------------------------------------------

# 4. Recommended technology stack

  -----------------------------------------------------------------------
  Layer                   Technology              Purpose
  ----------------------- ----------------------- -----------------------
  Full-stack framework    Next.js App Router +    UI, server components,
                          TypeScript              route handlers, server
                                                  actions, server-side
                                                  application services

  UI                      Tailwind CSS +          Accessible reusable
                          shadcn/ui               components

  Theme                   CSS variables +         Light, dark, and system
                          next-themes (or         themes
                          equivalent)             

  Database                PostgreSQL              Operational source of
                                                  truth

  ORM                     Prisma                  Typed data access and
                                                  migrations

  CMS                     Sanity + `next-sanity`  Public website content
                                                  and editorial workflows

  Validation              Zod                     Runtime validation at
                                                  trust boundaries

  Authentication          Auth.js or another      Secure sessions and
                          vetted                  identity
                          Next.js-compatible      
                          solution                

  Localization            next-intl (or           Locale routing, message
                          equivalent)             catalogs, formatting,
                                                  RTL support

  Translation             Google Cloud            Translation
                          Translation API         assistance/fallback for
                                                  approved content

  Background jobs         Redis + BullMQ          Notifications, report
                                                  processing, and
                                                  long-running AI
                                                  workflows

  File storage            Private S3-compatible   Medical records and
                          object storage or       report files
                          managed equivalent      

  AI orchestration        Server-side             Specialized application
                          orchestration service   agents
                          with provider adapter   
                          and typed tools         

  Testing                 Vitest/Jest, Playwright Unit, integration, and
                                                  browser tests

  API documentation       OpenAPI where useful    Document route-handler
                                                  contracts

  Version control         Git + GitHub            Branches, pull
                                                  requests, and
                                                  milestones

  Coding environment      Google Antigravity      AI-assisted planning,
                                                  coding, and review
  -----------------------------------------------------------------------

**Important architecture distinction:** Google Antigravity is the
development environment for coding agents. It is not assumed to be a
deployable application-side AI SDK. The production AI layer must use a
separately selected and verified model/API or agent framework behind
server-side interfaces. Keep that provider replaceable.

Use current official documentation and compatible stable package
versions when implementation begins. Commit the lockfile and document
selected versions.

------------------------------------------------------------------------

# 5. High-level system architecture

``` text
                         PATIENT / DOCTOR / LAB / ADMIN
                                      |
                                      v
                         Browser: Next.js + TypeScript
                     Tailwind + shadcn/ui + i18n + Theme
                                      |
                                  HTTPS
                                      |
                                      v
                    NEXT.JS FULL-STACK APPLICATION
                 App Router / Route Handlers / Server Actions
                                      |
              +-----------------------+-----------------------+
              |                       |                       |
              v                       v                       v
       Authentication &          Domain Services         CMS Integration
       Authorization              and Validation         next-sanity
       RBAC / Sessions            Zod / Prisma                 |
              |                       |                        v
              |                       |                  Sanity CMS
              |                       |
              |             +---------+----------+
              |             |         |          |
              |             v         v          v
              |          Booking   Medical     Support /
              |          Services  Records     AI Gateway
              |             |         |          |
              +-------------+---------+----------+
                                    |
                                    v
                              PostgreSQL
                         Operational source of truth
                                    |
                                    v
                         Redis + BullMQ Worker
                         Notifications / AI jobs
                                    |
                                    v
                         Application AI Orchestrator
                         +---------+----------+
                         |         |          |
                         v         v          v
                      Support  Pre-triage  Verification /
                       Agent     Agent       Safety checks
                         |
                         v
                 Typed, permission-checked tools
                         |
                         v
                 Next.js domain services only

        Private Object Storage <---- Medical file metadata in PostgreSQL
        Google Cloud Translation API <---- Server-side translation service
```

**Architecture rules**

1.  Next.js is the only application backend in this blueprint. Do not
    create a parallel NestJS service.
2.  Browser code must never receive database credentials, CMS write
    tokens, AI provider secrets, or Google Cloud service credentials.
3.  AI agents must not connect directly to PostgreSQL. They use narrow,
    typed backend tools.
4.  Sanity stores editorial content, not operational healthcare records.
5.  PostgreSQL remains authoritative for users, permissions,
    appointments, bookings, records metadata, consent, support cases,
    and AI audit data.
6.  Background workers call shared domain services or authenticated
    internal job handlers; they must not bypass authorization rules.
7.  Medical record access is checked at the moment of access, not only
    when a URL is created.

## 5.1 Suggested repository structure

``` text
shifalink/
├── AGENTS.md
├── README.md
├── .env.example
├── package.json
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
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
│   │   ├── api/
│   │   └── studio/
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   ├── chat/
│   │   └── forms/
│   ├── features/
│   │   ├── auth/
│   │   ├── doctors/
│   │   ├── appointments/
│   │   ├── diagnostics/
│   │   ├── medical-records/
│   │   ├── support/
│   │   └── admin/
│   ├── server/
│   │   ├── auth/
│   │   ├── db/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── ai/
│   │   ├── translation/
│   │   ├── storage/
│   │   ├── jobs/
│   │   └── audit/
│   ├── i18n/
│   ├── lib/
│   └── styles/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
└── docs/
    ├── architecture/
    ├── requirements/
    ├── database/
    ├── agent-specs/
    ├── security/
    └── decisions/
```

This is a suggested modular monolith structure. Do not split into
microservices for the initial capstone unless a measured requirement
justifies it.

------------------------------------------------------------------------

# 6. Sanity CMS and website content management

Sanity is the content-entry and editorial system for public website
content. Editors should be able to update approved content without
changing application code.

## 6.1 Content managed in Sanity

-   Home page sections, hero text, banners, and calls to action
-   About ShifaLink and contact information
-   Public FAQs and help articles
-   Health education articles after appropriate clinical review
-   Public service descriptions and preparation instructions
-   Static page content, navigation labels, footer links, and policy
    pages
-   Public promotional images and image captions
-   Translated versions of editorial content

## 6.2 Data that must remain in PostgreSQL

-   User accounts, passwords/session references, roles, and permissions
-   Patient and doctor private profile fields
-   Doctor availability and appointment records
-   Lab/radiology operational catalogs where availability/pricing is
    transactional
-   Diagnostic bookings and reports
-   Medical record metadata and consent grants
-   Support conversations and private messages
-   AI runs, tool calls, approvals, and audit events

## 6.3 Sanity schemas to create

  -----------------------------------------------------------------------
  Sanity document type                Main fields
  ----------------------------------- -----------------------------------
  `siteSettings`                      Site name, logo, contact details,
                                      social links, default locale

  `homePage`                          Localized hero, sections, CTA
                                      labels, featured content references

  `page`                              Slug, localized title, localized
                                      body, SEO fields, publication
                                      status

  `faq`                               Question, answer, category, locale,
                                      sort order, review status

  `article`                           Title, slug, excerpt, body, author
                                      display, category, locale, review
                                      status

  `serviceInformation`                Service title, description,
                                      preparation guidance, disclaimer,
                                      locale

  `navigation`                        Localized navigation items and
                                      ordering

  `legalPage`                         Terms, privacy notice, consent
                                      information, locale, effective date
  -----------------------------------------------------------------------

Sanity should not be used as a shortcut for storing protected patient
data. Apply editor roles, draft/publish review, and secure tokens.

## 6.4 Next.js integration

Use the official `next-sanity` integration. Configure the Sanity client
server-side, define schemas, query content with typed GROQ queries, and
use preview/draft mode for editors. Validate webhook signatures if using
webhook-based cache revalidation. Never expose write tokens in client
bundles.

------------------------------------------------------------------------

# 7. Multilingual and translation architecture

ShifaLink must support the following six languages:

  Language   Locale code   Direction
  ---------- ------------- -----------
  English    `en`          LTR
  Urdu       `ur`          RTL
  German     `de`          LTR
  Arabic     `ar`          RTL
  French     `fr`          LTR
  Japanese   `ja`          LTR

## 7.1 User experience requirements

-   Provide a persistent language selector.
-   Store the selected locale in a cookie or user preference.
-   Use locale-prefixed routes such as `/en/doctors`, `/ur/doctors`,
    `/ar/doctors`.
-   Set the correct HTML `lang` and `dir` attributes.
-   Support RTL layout for Urdu and Arabic, including navigation, forms,
    icons where directional, and text alignment.
-   Use appropriate fonts and test Urdu/Arabic shaping and Japanese
    glyph coverage.
-   Format dates, times, numbers, and currency according to locale.
-   Keep language choice consistent across public pages and
    authenticated areas.

## 7.2 Google translation integration

Use **Google Cloud Translation API** through a server-side translation
service. Do not put API keys or service-account credentials in browser
code.

Recommended content workflow:

1.  Editors create and maintain the source content in Sanity.
2.  A translation task sends approved text fields to the translation
    service.
3.  The translated output is saved as a draft or proposed localized
    Sanity content.
4.  A qualified editor reviews important content before publication.
5.  The website renders the published localized version.
6.  If a translation is missing, show a clear fallback to the source
    language rather than silently presenting potentially unsafe machine
    translation.

Use a glossary for healthcare terms where supported. Clinical
instructions, consent text, medication-related content, emergency
messages, and legal notices require human review. Machine translation
must not be treated as clinically authoritative.

**Important:** Do not build the project around the old Google Translate
Website Translator widget. Google's published notice states that the
widget is no longer supported from October 1, 2026. Use the Cloud
Translation API for application-controlled translation instead.

## 7.3 Translation boundaries

-   UI labels and validation messages: maintained in version-controlled
    locale message files.
-   Public editorial content: localized in Sanity.
-   User-generated chat messages: retain original text; translate only
    when needed for the support workflow and disclose translated content
    to the human agent.
-   Medical records: do not automatically translate entire records
    without explicit authorization and a defined privacy workflow.
-   AI outputs: identify the output language and preserve uncertainty
    and safety warnings during translation.

------------------------------------------------------------------------

# 8. Light and dark theme

-   Provide Light, Dark, and System options.
-   Use design tokens/CSS variables so both themes cover all components
    consistently.
-   Persist the preference in a cookie or user profile where
    appropriate.
-   Avoid a flash of the wrong theme during page load.
-   Respect system preference when System is selected.
-   Ensure readable contrast, visible focus states, form errors, charts,
    dialogs, and chat bubbles in both themes.
-   Theme preference must not change access control or application
    behavior.

------------------------------------------------------------------------

# 9. Practo-inspired visual direction and image sourcing

Use Practo as a **visual reference for healthcare UX patterns**, such as
clear doctor discovery, service cards, booking calls to action,
reassuring information hierarchy, and accessible navigation.

**Image licensing rule:** Do not scrape, download, hotlink, or reuse
Practo's website images, doctor photographs, logos, or other copyrighted
assets unless ShifaLink has written permission or a license that
explicitly allows the intended use. The fact that an image is publicly
visible does not make it free to reuse.

Approved image strategy:

-   Prefer original ShifaLink photography and commissioned
    illustrations.
-   Use properly licensed stock images with documented usage rights.
-   Use provider-uploaded profile images only after consent and
    verification.
-   Keep image source, license, attribution requirements, and approval
    status in the asset register.
-   Use Sanity image assets for approved public editorial images.
-   Use private storage for sensitive patient-uploaded images and scans.
-   Do not use real patient images in demos without explicit consent.

The design should feel modern and trustworthy without copying Practo's
brand identity or protected visual assets.

------------------------------------------------------------------------

# 10. Application-side AI agent design

Application agents are separate from the coding agents used in Google
Antigravity. Application agents run server-side after deployment and use
only approved tools.

  -------------------------------------------------------------------------
  Agent             Purpose            Permitted work     Restricted
                                                          actions
  ----------------- ------------------ ------------------ -----------------
  **Supervisor /    Classify requests  Select an approved Cannot bypass
  Orchestrator      and delegate       specialist, track  permissions or
  Agent**           bounded tasks      workflow state,    execute arbitrary
                                       combine validated  database writes
                                       results            

  **Chat Support    Answer general     Retrieve approved  No unrestricted
  Agent**           platform questions Sanity FAQs/help   medical record
                                       content, explain   access,
                                       workflows, create  diagnosis, or
                                       a support handoff  prescription

  **Appointment     Help users         Read the signed-in Must use booking
  Support Agent**   understand         user's permitted   service checks;
                    appointment        booking summary;   cannot override
                    workflows          explain booking    availability or
                                       steps; prepare a   role rules
                                       change request     

  **Diagnostic      Guide              Search published   Cannot fabricate
  Booking Support   lab/radiology      service            slots, publish
  Agent**           booking            information and    results, or
                                       authorized         access another
                                       availability;      patient's data
                                       prepare booking    
                                       request            

  **Pre-Triage      Structure          Ask approved       No definitive
  Agent**           patient-provided   intake questions,  diagnosis,
                    symptoms for       summarize reported prescribing, or
                    clinician review   symptoms, identify autonomous
                                       missing            treatment
                                       information, flag  decision
                                       urgent language    
                                       for escalation     

  **Clinical        Summarize          Produce            Cannot infer
  Summary Agent**   authorized records source-linked      missing facts or
                    for a doctor       summaries from     modify source
                                       records the        records
                                       clinician is       
                                       permitted to       
                                       access             

  **Translation     Assist with        Translate approved Must preserve
  Agent**           multilingual       support text and   safety warnings;
                    support            user messages      cannot silently
                                       through the        publish
                                       server-side        clinical/legal
                                       translation        translations
                                       service            

  **Verifier /      Check agent        Validate schema,   Does not replace
  Safety Agent**    outputs            citations/source   deterministic
                                       IDs, policy        authorization or
                                       constraints, and   clinical review
                                       required           
                                       escalation         
  -------------------------------------------------------------------------

## 10.1 Agent contract

-   Each agent has one documented purpose, input schema, output schema,
    and tool allowlist.
-   Every tool validates the current user, role, tenant, ownership,
    consent, and input.
-   Agents return structured output validated by Zod.
-   Agents do not receive unrestricted database credentials.
-   Every run records agent name, model/provider, prompt version,
    status, timing, and source references.
-   Use timeouts, usage limits, retry limits, and cancellation for
    long-running jobs.
-   Treat user messages, uploaded files, and retrieved CMS content as
    untrusted input.
-   Protect against prompt injection and tool misuse.
-   Human handoff is available when the agent is uncertain, the request
    is clinical, or policy requires it.

## 10.2 Example chat workflow

1.  User opens the ShifaLink chat widget.
2.  The application determines whether the visitor is anonymous or
    authenticated.
3.  The user message is validated and assigned a conversation ID.
4.  The Supervisor routes general questions to the Chat Support Agent.
5.  The agent retrieves relevant approved FAQs/help content from Sanity.
6.  If the user asks about their own appointment, the agent calls an
    authenticated, read-only appointment tool.
7.  The backend re-checks ownership and permissions before returning
    minimal data.
8.  The verifier checks output structure and safety requirements.
9.  The answer is returned in the selected language.
10. If the question requires a human or clinician, create a
    handoff/ticket and show its status.
11. Persist the conversation and audit metadata according to the
    retention policy.

## 10.3 Safe autonomy levels

  -----------------------------------------------------------------------
  Level                   Allowed behavior        Example
  ----------------------- ----------------------- -----------------------
  0 --- Read only         Retrieve and summarize  Explain clinic hours or
                          authorized information  a user's own booking
                                                  status

  1 --- Draft             Prepare a request for   Draft a rescheduling
                          user review             request

  2 --- Recommend /       Suggest a safe next     Transfer a clinical
  escalate                step and route to a     question to a clinician
                          human                   

  3 --- Approved          Execute a narrowly      Submit a validated
  execution               defined action after    cancellation request
                          explicit user           
                          confirmation and        
                          backend authorization   

  Prohibited              Bypass authorization or Diagnose, prescribe,
                          make independent        expose another
                          clinical decisions      patient's record
  -----------------------------------------------------------------------

------------------------------------------------------------------------

# 11. PostgreSQL data model blueprint

PostgreSQL is the source of truth for application operations. The
following schema is a planning-level table blueprint, not a final
migration. Final Prisma models must define all relations, indexes,
unique constraints, enum values, deletion behavior, and timestamps.

## 11.1 Core identity and organizations

  -------------------------------------------------------------------------
  Table                     Key fields              Purpose
  ------------------------- ----------------------- -----------------------
  `users`                   `id`, `email`,          Authentication identity
                            `password_hash` or      
                            identity reference,     
                            `status`, `created_at`  

  `roles`                   `id`, `name`,           Platform role
                            `description`           definitions

  `user_roles`              `user_id`, `role_id`,   Role assignments and
                            `organization_id`       organization scope
                            nullable                

  `organizations`           `id`, `name`, `type`,   Clinics, labs, and
                            `status`, `created_at`  radiology organizations

  `organization_members`    `organization_id`,      User membership in
                            `user_id`,              provider organizations
                            `membership_role`,      
                            `status`                

  `patient_profiles`        `id`, `user_id`,        Patient profile
                            `full_name`,            
                            `date_of_birth`,        
                            `gender`, `blood_group` 
                            nullable                

  `doctor_profiles`         `id`, `user_id`,        Doctor profile
                            `full_name`,            
                            `specialization`,       
                            `license_number`,       
                            `consultation_fee`,     
                            `verification_status`   

  `doctor_qualifications`   `id`, `doctor_id`,      Doctor qualifications
                            `qualification`,        
                            `institution`, `year`   

  `doctor_languages`        `doctor_id`,            Languages spoken by a
                            `locale_code`           doctor
  -------------------------------------------------------------------------

## 11.2 Provider catalog and scheduling

  ---------------------------------------------------------------------------
  Table                       Key fields              Purpose
  --------------------------- ----------------------- -----------------------
  `specialties`               `id`, `name`, `slug`,   Doctor specialties
                              `is_active`             

  `doctor_specialties`        `doctor_id`,            Many-to-many doctor
                              `specialty_id`          specialty mapping

  `doctor_locations`          `id`, `doctor_id`,      Consultation locations
                              `organization_id`,      
                              `address`, `is_active`  

  `doctor_availability`       `id`, `doctor_id`,      Recurring availability
                              `location_id`,          
                              `weekday`,              
                              `start_time`,           
                              `end_time`,             
                              `slot_minutes`          

  `availability_exceptions`   `id`, `doctor_id`,      Leave and blocked slots
                              `starts_at`, `ends_at`, 
                              `reason`                

  `appointments`              `id`, `patient_id`,     Appointment lifecycle
                              `doctor_id`,            
                              `location_id`,          
                              `appointment_type`,     
                              `scheduled_at`,         
                              `status`,               
                              `meeting_reference`     
  ---------------------------------------------------------------------------

## 11.3 Diagnostic services and bookings

  ---------------------------------------------------------------------------------
  Table                            Key fields               Purpose
  -------------------------------- ------------------------ -----------------------
  `diagnostic_services`            `id`, `organization_id`, Lab/radiology service
                                   `service_type`, `name`,  catalog
                                   `description`, `price`,  
                                   `is_active`              

  `diagnostic_service_locations`   `id`, `service_id`,      Where a service is
                                   `location_id`,           offered
                                   `availability_details`   

  `diagnostic_bookings`            `id`, `patient_id`,      Patient diagnostic
                                   `service_id`,            booking
                                   `organization_id`,       
                                   `booking_at`, `status`,  
                                   `collection_type`        

  `diagnostic_booking_events`      `id`, `booking_id`,      Booking status history
                                   `status`, `actor_id`,    
                                   `created_at`, `notes`    
  ---------------------------------------------------------------------------------

## 11.4 Medical records and consent

  ------------------------------------------------------------------------
  Table                    Key fields              Purpose
  ------------------------ ----------------------- -----------------------
  `file_objects`           `id`, `storage_key`,    Private file metadata
                           `file_name`,            
                           `mime_type`,            
                           `size_bytes`,           
                           `checksum`,             
                           `uploaded_by`,          
                           `created_at`            

  `medical_records`        `id`, `patient_id`,     Patient medical record
                           `file_object_id`,       metadata
                           `category`, `title`,    
                           `uploaded_at`,          
                           `visibility`            

  `record_access_grants`   `id`, `patient_id`,     Patient-controlled
                           `doctor_id`,            sharing
                           `medical_record_id`     
                           nullable, `granted_at`, 
                           `expires_at`,           
                           `revoked_at`            

  `diagnostic_reports`     `id`, `booking_id`,     Diagnostic result
                           `file_object_id`,       metadata
                           `published_by`,         
                           `published_at`,         
                           `status`                

  `prescriptions`          `id`, `appointment_id`, Clinician-issued
                           `patient_id`,           prescription record
                           `doctor_id`,            
                           `created_at`, `status`  

  `prescription_items`     `id`,                   Prescription line items
                           `prescription_id`,      
                           `medicine_name`,        
                           `instructions`,         
                           `duration`              
  ------------------------------------------------------------------------

## 11.5 Support chat and AI operations

  -------------------------------------------------------------------------
  Table                     Key fields              Purpose
  ------------------------- ----------------------- -----------------------
  `support_conversations`   `id`, `user_id`         Chat/support
                            nullable,               conversation
                            `visitor_session_id`    
                            nullable, `locale`,     
                            `status`,               
                            `assigned_to`,          
                            `created_at`            

  `support_messages`        `id`,                   Conversation messages
                            `conversation_id`,      
                            `sender_type`,          
                            `sender_id` nullable,   
                            `message_text`,         
                            `created_at`            

  `support_tickets`         `id`,                   Human support handoff
                            `conversation_id`,      
                            `created_by`,           
                            `assigned_to`,          
                            `category`, `priority`, 
                            `status`, `resolved_at` 

  `agent_runs`              `id`, `conversation_id` AI execution record
                            nullable, `agent_name`, 
                            `model_provider`,       
                            `prompt_version`,       
                            `status`, `started_at`, 
                            `finished_at`           

  `agent_steps`             `id`, `agent_run_id`,   Agent workflow trace
                            `step_name`,            
                            `tool_name`, `status`,  
                            `input_reference`,      
                            `output_reference`,     
                            `created_at`            

  `ai_feedback`             `id`, `agent_run_id`,   User feedback on AI
                            `user_id` nullable,     responses
                            `rating`,               
                            `feedback_text`,        
                            `created_at`            
  -------------------------------------------------------------------------

## 11.6 Platform operations

  -------------------------------------------------------------------------
  Table                     Key fields              Purpose
  ------------------------- ----------------------- -----------------------
  `notifications`           `id`, `user_id`,        In-app notification
                            `type`, `title`,        
                            `body`, `read_at`,      
                            `created_at`            

  `verification_requests`   `id`, `user_id`,        Doctor/provider
                            `organization_id`       verification
                            nullable,               
                            `verification_type`,    
                            `status`,               
                            `reviewed_by`,          
                            `reviewed_at`           

  `audit_events`            `id`, `actor_type`,     Security and business
                            `actor_id`, `action`,   audit
                            `entity_type`,          
                            `entity_id`,            
                            `organization_id`       
                            nullable, `metadata`,   
                            `created_at`            

  `user_preferences`        `user_id`, `locale`,    Locale and theme
                            `theme`, `updated_at`   preference

  `consent_records`         `id`, `patient_id`,     Explicit consent
                            `consent_type`,         history
                            `version`,              
                            `granted_at`,           
                            `withdrawn_at`          
  -------------------------------------------------------------------------

## 11.7 Database design rules

-   Use UUID primary keys for externally referenced records.
-   Add unique constraints to normalized user email, doctor license
    number, and other business identifiers.
-   Index foreign keys and frequently filtered fields such as
    appointment time/status and booking status.
-   Store money as PostgreSQL `NUMERIC`, not JavaScript floating-point
    values.
-   Use timezone-aware timestamps and store event instants in UTC.
-   Use transactions for booking creation, slot reservation, and status
    transitions.
-   Prevent double booking with database-backed constraints/locking and
    server-side availability checks.
-   Keep uploaded file bytes in private object storage; PostgreSQL
    stores metadata and references.
-   Define retention, deletion, and legal-hold rules before handling
    real health records.
-   Use organization scope for provider-managed records and enforce it
    in every query.
-   Do not store translations of private medical records unless the
    feature has a defined consent, security, and retention design.

------------------------------------------------------------------------

# 12. API design outline

These are illustrative Next.js Route Handler endpoints. Final routes
should be versioned consistently and documented with request/response
schemas.

  ----------------------------------------------------------------------------------------
  Area                                Example routes
  ----------------------------------- ----------------------------------------------------
  Authentication                      `POST /api/v1/auth/register`,
                                      `POST /api/v1/auth/login`,
                                      `POST /api/v1/auth/logout`, `GET /api/v1/auth/me`

  Patient profile                     `GET /api/v1/patients/me`,
                                      `PATCH /api/v1/patients/me`

  Doctors                             `GET /api/v1/doctors`, `GET /api/v1/doctors/:id`,
                                      `POST /api/v1/doctors/profile`

  Availability                        `GET /api/v1/doctors/:id/availability`,
                                      `POST /api/v1/doctor/availability`

  Appointments                        `GET /api/v1/appointments`,
                                      `POST /api/v1/appointments`,
                                      `PATCH /api/v1/appointments/:id`

  Diagnostics                         `GET /api/v1/diagnostic-services`,
                                      `POST /api/v1/diagnostic-bookings`,
                                      `GET /api/v1/diagnostic-bookings/:id`

  Medical records                     `GET /api/v1/medical-records`,
                                      `POST /api/v1/medical-records/upload-url`,
                                      `POST /api/v1/medical-records`,
                                      `POST /api/v1/medical-records/:id/share`

  Support chat                        `POST /api/v1/support/conversations`,
                                      `GET /api/v1/support/conversations/:id`,
                                      `POST /api/v1/support/conversations/:id/messages`,
                                      `POST /api/v1/support/conversations/:id/handoff`

  AI                                  `POST /api/v1/ai/pre-triage`,
                                      `GET /api/v1/ai/runs/:id`

  Translation                         `POST /api/v1/translation/drafts` (authorized
                                      server-side use only)

  Notifications                       `GET /api/v1/notifications`,
                                      `PATCH /api/v1/notifications/:id/read`

  Admin                               `GET /api/v1/admin/audit-events`,
                                      `PATCH /api/v1/admin/verifications/:id`
  ----------------------------------------------------------------------------------------

Every endpoint must define authentication requirements, role
requirements, ownership checks, input schemas, output schemas,
pagination, error formats, and audit requirements.

------------------------------------------------------------------------

# 13. Security, privacy and clinical safety

-   Use HTTPS in deployment and secure, HTTP-only, SameSite cookies
    where cookie sessions are used.
-   Hash passwords using a modern password-hashing algorithm; never
    store plaintext passwords.
-   Enforce RBAC, organization isolation, patient ownership, and
    record-level access on every protected backend operation.
-   Validate and normalize all inputs with Zod at trust boundaries.
-   Keep database, Sanity write, AI provider, storage, and Google Cloud
    credentials server-side.
-   Use private object storage and short-lived signed URLs after
    authorization checks.
-   Apply rate limits and abuse protection to login, chat, uploads,
    booking, and AI endpoints.
-   Protect against prompt injection, malicious uploads, insecure direct
    object references, and excessive tool permissions.
-   Log access to sensitive records and administrative actions.
-   Do not include sensitive health information in prompts unless
    necessary, consented, and authorized.
-   Separate support content from clinical records.
-   Use synthetic patient data in development and demonstrations.
-   Establish backup, recovery, retention, and incident-response
    procedures.
-   Obtain appropriate legal, privacy, security, and clinical review for
    the jurisdictions where the service will operate.

**Clinical safety:** ShifaLink is not an emergency service. AI support
must not delay urgent care. The application must provide locally
appropriate emergency guidance and make clear that clinical decisions
belong to qualified professionals.

------------------------------------------------------------------------

# 14. Non-functional requirements

  -----------------------------------------------------------------------
  Area                                Minimum capstone expectation
  ----------------------------------- -----------------------------------
  Responsive design                   Usable on mobile, tablet, and
                                      desktop

  Accessibility                       Keyboard navigation, labels,
                                      visible focus, contrast,
                                      screen-reader-friendly controls

  Theme                               Light, dark, and system preference
                                      without theme flash

  Localization                        Six locales; correct language
                                      metadata and RTL for Urdu/Arabic

  Performance                         Paginated lists, optimized images,
                                      server-side data fetching where
                                      appropriate

  Reliability                         Graceful errors, safe retries,
                                      idempotency for booking and
                                      upload-finalization operations

  Privacy                             Private-by-default medical records
                                      and consent-aware sharing

  Security                            RBAC, ownership checks, tenant
                                      isolation, secret management, audit
                                      logs

  Observability                       Structured logs, request IDs, AI
                                      run IDs, error monitoring, health
                                      checks

  Maintainability                     Modular domain services, typed
                                      interfaces, linting, formatting,
                                      documented decisions

  AI quality                          Structured outputs, source
                                      references, evaluation examples,
                                      human escalation

  CMS                                 Editorial draft/review/publish
                                      workflow and secure preview

  Translation quality                 Human review for clinical, legal,
                                      and safety-critical content
  -----------------------------------------------------------------------

------------------------------------------------------------------------

# 15. Student implementation roadmap

## Phase 0 --- Discovery and architecture

-   Confirm requirements, user stories, roles, workflows, and acceptance
    criteria.
-   Confirm Next.js as the only application backend.
-   Define PostgreSQL entities and relationships.
-   Define Sanity content boundaries.
-   Define coding-agent ownership and review rules.
-   Define AI safety and privacy requirements.

**Deliverables:** `requirements.md`, `architecture.md`,
`database-schema.md`, `AGENTS.md`.

## Phase 1 --- Repository and UI foundation

-   Initialize Next.js App Router with TypeScript.
-   Configure Tailwind and shadcn/ui.
-   Build responsive public layout and dashboard shell.
-   Add light/dark/system theme.
-   Add locale routing and six locale message files.
-   Build placeholder pages using approved/licensed images.

**Deliverable:** Responsive multilingual UI shell.

## Phase 2 --- PostgreSQL and authentication

-   Configure PostgreSQL and Prisma.
-   Create initial migrations and seed synthetic data.
-   Implement secure authentication and session handling.
-   Implement roles, organization membership, and protected routes.
-   Add authorization tests.

**Deliverable:** Secure role-aware full-stack foundation.

## Phase 3 --- Sanity CMS and public content

-   Configure Sanity project and schemas.
-   Implement public page queries using `next-sanity`.
-   Add preview/draft workflow and content editor roles.
-   Add localized content models and editorial review.
-   Add approved image assets and licensing records.

**Deliverable:** Content-managed public website.

## Phase 4 --- Patient and doctor workflows

-   Implement patient and doctor profiles.
-   Add doctor discovery and filters.
-   Add availability management.
-   Implement appointment booking and status lifecycle.
-   Add booking notifications and conflict tests.

**Deliverable:** Working doctor discovery and appointment workflows.

## Phase 5 --- Diagnostic workflows and ShifaLink Drive

-   Implement provider and service catalogs.
-   Implement lab/radiology bookings.
-   Integrate private object storage.
-   Implement medical record metadata, upload, download, consent, and
    revocation.
-   Add diagnostic report publication and patient access.

**Deliverable:** Diagnostic booking and secure medical record workflows.

## Phase 6 --- Multilingual and translation service

-   Complete all six UI locale files.
-   Implement RTL layout for Urdu and Arabic.
-   Integrate Google Cloud Translation API server-side.
-   Add translation drafts and review workflow for Sanity content.
-   Test locale persistence and translated-content fallback.

**Deliverable:** Six-language application with reviewed content
workflow.

## Phase 7 --- AI-powered support chat

-   Build chat UI and conversation persistence.
-   Implement the support agent with read-only knowledge-base tools.
-   Add authenticated booking lookup tools with ownership checks.
-   Add translation mediation where needed.
-   Add human handoff, ticket queue, rate limits, and audit logging.
-   Test prompt injection and unauthorized data requests.

**Deliverable:** Safe AI support chat with human escalation.

## Phase 8 --- Clinical AI assistance

-   Implement consent-aware symptom intake.
-   Add pre-triage and clinician summary agents.
-   Keep initial tools read-only.
-   Add source references, uncertainty, urgent escalation, and clinician
    review.
-   Evaluate outputs using synthetic cases.

**Deliverable:** Clinician-reviewed AI assistance workflow.

## Phase 9 --- Administration, QA and security

-   Complete provider verification and admin workflows.
-   Run unit, integration, and end-to-end tests.
-   Test cross-user and cross-organization access.
-   Review file handling, translation, chat, and AI controls.
-   Test backups, recovery, monitoring, and failure handling.

**Deliverable:** Tested capstone release candidate.

## Phase 10 --- Deployment and demonstration

-   Configure production environment and secrets.
-   Deploy Next.js application, worker, PostgreSQL, Redis, and storage.
-   Configure Sanity production dataset and approved origins.
-   Configure domain, HTTPS, monitoring, and backups.
-   Prepare synthetic demo accounts and final presentation.

**Deliverable:** Deployed or production-style capstone demonstration.

------------------------------------------------------------------------

# 16. Google Antigravity multi-agent development plan

These are **coding agents**, not the AI agents that will serve ShifaLink
users.

  -----------------------------------------------------------------------
  Coding agent            Ownership               Main deliverables
  ----------------------- ----------------------- -----------------------
  **1. Architect /        Overall plan, task      Approved task plans,
  Supervisor**            decomposition,          architecture decision
                          architecture decisions, records, integration
                          integration sequence    review

  **2. UI / Frontend      Next.js pages, reusable Public pages,
  Agent**                 components, responsive  dashboards, chat
                          layouts, themes         interface, component
                                                  tests

  **3. Backend / Auth     Route handlers, server  Secure APIs, domain
  Agent**                 services, sessions,     services, auth tests
                          RBAC, validation        

  **4. Database Agent**   Prisma schema,          Database schema and
                          migrations, indexes,    migration tests
                          seed data, ERD          

  **5. Sanity CMS Agent** Sanity schemas, Studio, CMS content models and
                          content queries,        Next.js integration
                          preview                 

  **6. Localization       Locale routing,         Six-language UI and
  Agent**                 translations, RTL,      translation service
                          Google Cloud            
                          Translation integration 

  **7. AI Agent           Runtime agent           AI agents, tool
  Engineer**              orchestration, support  schemas, safety tests
                          chat, typed tools,      
                          guardrails              

  **8. QA / Security      Test plans,             Test evidence and
  Agent**                 access-control review,  prioritized security
                          threat review,          findings
                          regression tests        

  **9. Integration /      Shared contracts,       Integrated build, API
  Documentation Agent**   integration, docs,      docs, README, release
                          release notes           checklist
  -----------------------------------------------------------------------

## 16.1 Agent collaboration rules

-   The Architect/Supervisor creates small tasks with explicit inputs,
    outputs, files, dependencies, and acceptance criteria.
-   Each specialist owns its assigned files. Agents must not rewrite
    another agent's module without coordination.
-   Database Agent publishes schema changes and migration notes before
    dependent agents implement against them.
-   Backend Agent publishes request/response contracts before UI and AI
    agents consume endpoints.
-   CMS Agent owns Sanity schemas and content query contracts; it does
    not store private patient data.
-   Localization Agent coordinates locale keys with UI and CMS agents;
    it does not silently alter clinical meaning.
-   AI Agent Engineer consumes approved backend tools; it does not
    create direct database access.
-   QA/Security Agent tests completed work and reports findings; fixes
    are assigned to the owning agent.
-   Integration Agent resolves contract mismatches through the
    Architect, not by silently changing interfaces.
-   Every agent must report changed files, assumptions, tests run,
    failures, and remaining risks.
-   The human project owner approves architecture changes, sensitive
    data workflows, and release milestones.

------------------------------------------------------------------------

# 17. Google Antigravity prompt pack

Use one prompt at a time. Require a plan before implementation, inspect
diffs, run tests, and commit working milestones.

## Prompt 1 --- Architect and plan

Act as the ShifaLink system architect. Read the project blueprint and
repository. Next.js App Router is the only application backend;
PostgreSQL and Prisma are the operational data layer; Sanity is for
public editorial content. Do not introduce NestJS. Break the project
into small milestones, define module boundaries, coding-agent ownership,
contracts, risks, and acceptance criteria. Do not implement the whole
system. Ask for approval before changing architecture.

## Prompt 2 --- Next.js UI foundation

Build only the approved Next.js TypeScript UI foundation. Use accessible
reusable components, Tailwind CSS, and the approved theme system.
Implement light, dark, and system modes. Add the six locale route
structure and RTL support for Urdu and Arabic. Use placeholder content
and only approved image assets. Do not implement authentication,
database access, or AI. Run lint, typecheck, and build.

## Prompt 3 --- PostgreSQL and Prisma foundation

Implement the approved PostgreSQL data model using Prisma. Create
migrations, indexes, foreign keys, enums, and synthetic seed data. Do
not invent relationships or fields beyond the approved schema without
documenting the proposal. Add database setup instructions and migration
tests. Never place real patient data in seed files.

## Prompt 4 --- Secure Next.js backend

Implement the approved Next.js Route Handlers and server-side domain
services. Add authentication, session checks, Zod validation, role
checks, ownership checks, consistent errors, and audit events. Do not
create a NestJS service or expose database credentials to the browser.
Add unit and API integration tests.

## Prompt 5 --- Sanity CMS integration

Set up Sanity Studio and the official Next.js integration. Implement
approved schemas for public pages, FAQs, articles, service information,
navigation, and localized content. Keep patient records, bookings,
private messages, and operational provider availability in PostgreSQL.
Configure secure preview and content publishing. Never expose write
tokens to the client.

## Prompt 6 --- Six-language support

Implement English, Urdu. Add
locale routing, language selection, locale persistence, date/number
formatting, and correct `lang` and `dir` attributes. Ensure Urdu use RTL layout. Integrate Google Cloud Translation only through a
server-side service. Store machine translations as drafts for review; do
not auto-publish clinical or legal translations.

## Prompt 7 --- Booking workflows

Implement doctor search, availability, appointment booking, and
diagnostic bookings using approved Prisma models and server-side
services. Prevent overlapping bookings with transactional checks and
database constraints. Enforce patient, doctor, and organization
authorization. Add tests for concurrent booking attempts and
unauthorized record access.

## Prompt 8 --- AI support chat

Build a server-side support chat workflow. The agent may retrieve
approved Sanity FAQs and call narrowly scoped backend tools for the
authenticated user's own permitted booking information. It must not
access raw PostgreSQL, private medical records by default, or another
user's data. Add rate limits, prompt-injection defenses, structured
outputs, conversation persistence, audit events, human handoff, and
tests for clinical/urgent questions.

## Prompt 9 --- Clinical assistance

Implement the consent-aware pre-triage and clinician-summary workflow
using synthetic test cases. Tools are read-only. Return source
references, uncertainty, and escalation flags. Do not diagnose
definitively, prescribe, or modify medical records. Require clinician
review. Add safety evaluations and failure tests.

## Prompt 10 --- Security review

Review authentication, RBAC, organization isolation, patient ownership,
consent, file storage, signed URLs, prompt injection, translation,
Sanity tokens, secrets, audit logs, and AI tool permissions. Test
unauthorized access paths. Produce a prioritized findings report. Do not
claim security is complete without test evidence.

## Prompt 11 --- Release readiness

Run lint, typecheck, unit tests, integration tests, browser end-to-end
tests, and production build. Verify migrations, locale routes, RTL,
themes, Sanity preview, Google Translation configuration, AI handoff,
storage permissions, environment variables, monitoring, and backup
procedures. Produce a release checklist and known-limitations report.

------------------------------------------------------------------------

# 18. Testing strategy and acceptance criteria

  -----------------------------------------------------------------------
  Test case                           Expected result
  ----------------------------------- -----------------------------------
  Patient requests another patient's  Request denied; denial is logged
  medical record                      

  Doctor opens a record without       Request denied
  active patient consent              

  Patient revokes a doctor's record   Subsequent access is denied
  access                              

  Two patients attempt the same       Only one valid booking is created
  doctor slot concurrently            

  Lab staff attempt to edit another   Request denied
  organization's booking              

  Anonymous chat asks for private     Agent asks user to authenticate; no
  appointment information             private data disclosed

  Support agent is asked to diagnose  Agent explains limitation and
  symptoms                            escalates appropriately

  User describes urgent symptoms      Clear urgent-care guidance; chatbot
                                      does not delay care

  AI tool requests unrestricted       Tool unavailable; attempt is
  database access                     blocked and logged

  AI returns malformed structured     Response rejected or safely
  output                              retried; no unsafe action

  Translation API is unavailable      Source-language fallback is shown;
                                      application remains usable

  Urdu or Arabic locale is selected   RTL layout and correct language
                                      metadata are applied

  User switches theme                 Selected theme is applied and
                                      preference persists

  Sanity editor changes a draft page  Draft preview updates; unpublished
                                      content is not public

  Client bundle is inspected          No private credentials or server
                                      tokens are exposed

  Unauthorized user requests admin    Request denied
  audit logs                          
  -----------------------------------------------------------------------

## 18.1 Definition of done for each feature

-   Requirement and acceptance criteria are documented.
-   Loading, empty, success, and error states are implemented.
-   Server validates input and authorization.
-   Database constraints and migrations are included where required.
-   Unit and integration tests pass.
-   Audit requirements are implemented.
-   Accessibility and responsive behavior are checked.
-   Documentation is updated.
-   Code is reviewed and committed.

------------------------------------------------------------------------

# 19. Final capstone deliverables

1.  Working responsive ShifaLink website.
2.  Next.js full-stack application with no parallel NestJS backend.
3.  GitHub repository with meaningful commit history.
4.  README and environment setup instructions.
5.  Architecture diagram and decision records.
6.  PostgreSQL ERD, Prisma schema, and migrations.
7.  API route and validation documentation.
8.  Sanity Studio with public content schemas.
9.  Six-language interface with RTL support.
10. Light/dark/system theme support.
11. Doctor, appointment, laboratory, and radiology workflows.
12. Secure medical record storage and consent management.
13. AI-powered support chat with human handoff.
14. Clinical pre-triage/summary workflow with clinician review.
15. Coding-agent responsibility matrix and `AGENTS.md`.
16. Runtime-agent specifications, tool schemas, and prompt/version
    documentation.
17. Automated test evidence and security review.
18. Deployment guide, known limitations, and final demonstration.

------------------------------------------------------------------------

# 20. Risks and common mistakes

  -----------------------------------------------------------------------
  Common mistake                      Better approach
  ----------------------------------- -----------------------------------
  Building the entire platform with   Use small approved tasks and
  one mega-prompt                     specialist agents

  Adding NestJS alongside Next.js     Keep Next.js as the single
  without need                        application backend

  Storing patient records in Sanity   Store operational/private records
                                      in PostgreSQL and files in private
                                      object storage

  Giving AI agents database           Expose narrow, permission-checked
  credentials                         application tools

  Treating support chat as a doctor   Keep support and clinical
                                      assistance separate; escalate
                                      clinical questions

  Letting AI prescribe or diagnose    Require clinician judgment and
                                      review

  Auto-publishing machine-translated  Use draft translation and qualified
  clinical content                    review

  Using the old Google Website        Use Google Cloud Translation API
  Translator widget                   server-side

  Reusing Practo images without       Use licensed, commissioned, or
  permission                          original assets

  Ignoring RTL                        Test Urdu and Arabic across the
                                      complete interface

  Protecting only frontend routes     Enforce authorization on every
                                      backend request

  Using public URLs for medical files Use private storage and short-lived
                                      authorized access

  Skipping audit logs                 Record sensitive access, consent,
                                      admin actions, and AI runs

  Assuming generated code is correct  Run tests, inspect diffs, and
                                      review security boundaries
  -----------------------------------------------------------------------

------------------------------------------------------------------------

# 21. Glossary

  -----------------------------------------------------------------------
  Term                                Meaning
  ----------------------------------- -----------------------------------
  RBAC                                Role-based access control

  Tenant isolation                    Preventing one organization from
                                      accessing another organization's
                                      records

  Sanity CMS                          Structured content management
                                      platform for editorial website
                                      content

  Prisma ORM                          Typed database access and
                                      schema/migration toolkit

  Route Handler                       Next.js server endpoint implemented
                                      in the App Router

  Agent orchestration                 Coordinating specialist AI agents
                                      through controlled tasks and
                                      handoffs

  Supervisor pattern                  An orchestrator routes work to
                                      specialist agents and combines
                                      validated results

  Human-in-the-loop                   A required human review or approval
                                      step

  RTL                                 Right-to-left text and layout
                                      direction

  Cloud Translation API               Google Cloud service for
                                      programmatic text translation

  Prompt injection                    Malicious or untrusted content
                                      attempting to change an AI system's
                                      instructions

  Audit trail                         Record of who or what performed an
                                      action, when, and on which resource
  -----------------------------------------------------------------------

------------------------------------------------------------------------

# 22. Official documentation to consult

Check current official documentation before implementation because APIs,
SDKs, and supported versions can change.

-   Next.js: https://nextjs.org/docs
-   PostgreSQL: https://www.postgresql.org/docs/
-   Prisma: https://www.prisma.io/docs
-   Sanity + Next.js: https://www.sanity.io/docs/nextjs
-   Sanity localization: https://www.sanity.io/docs/studio/localization
-   Google Cloud Translation: https://cloud.google.com/translate/docs
-   Google Cloud Translation language support:
    https://cloud.google.com/translate/docs/languages
-   Tailwind CSS: https://tailwindcss.com/docs
-   shadcn/ui: https://ui.shadcn.com/
-   next-intl: https://next-intl.dev/
-   OWASP ASVS:
    https://owasp.org/www-project-application-security-verification-standard/

------------------------------------------------------------------------

# 23. Final instruction

**YOUR MISSION:** Build a secure, responsive, multilingual healthcare
platform that connects patients, doctors, and diagnostic providers. Use
Next.js as the only application backend, PostgreSQL as the operational
source of truth, Sanity for editorial content, and carefully controlled
AI agents for support and clinician assistance. Deliver a working,
explainable, tested, privacy-conscious system---not merely a large
amount of generated code.

Before implementation, obtain approval for the architecture, database
schema, agent responsibilities, privacy boundaries, and first milestone.
Keep the repository buildable and document every important technical
decision.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
