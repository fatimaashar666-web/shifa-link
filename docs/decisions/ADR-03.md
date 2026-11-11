# ShifaLink — ADR-03: Sanity for Public Editorial Content Only

**Date:** 2026-11-11  
**Status:** Accepted

## Decision

Sanity CMS manages only public, editorial website content. It is explicitly **prohibited** from storing any of the following: patient records, doctor private profile fields, appointment data, booking records, medical record metadata, support messages, consent grants, AI run records, or any other operational healthcare data.

**Sanity content types:** `siteSettings`, `homePage`, `page`, `faq`, `article`, `serviceInformation`, `navigation`, `legalPage`.

## Rationale

- Clear data boundary prevents accidental HIPAA/privacy violations from CMS misconfiguration
- Editorial content benefits from draft/publish workflow and rich-text editing that Sanity provides well
- Operational data benefits from ACID transactions and row-level security that PostgreSQL provides

## Consequences

- Sanity Agent must enforce this boundary in schema design and document it in every schema file
- QA Agent must test that no Route Handler writes operational health data to Sanity
- Sanity write tokens must never appear in `src/` files outside server-only configuration
- Doctor availability and pricing shown on public pages come from PostgreSQL via Server Components — Sanity content provides descriptions and static context only
