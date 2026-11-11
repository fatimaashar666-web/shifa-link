# ShifaLink — ADR-07: next-intl for Locale Routing; Google Cloud Translation API Server-Side Only

**Date:** 2026-11-11  
**Status:** Accepted

## Decision

**Locale routing and UI string management:** `next-intl` with locale-prefixed routes (`/en/`, `/ur/`, `/ar/`, etc.). Six supported locales: `en`, `ur`, `de`, `ar`, `fr`, `ja`. RTL direction (`dir="rtl"`) applied for `ur` and `ar`.

**Translation service:** Google Cloud Translation API v3 (Advanced) accessed exclusively through `src/server/translation/`. API credentials are server-only environment variables. The deprecated Google Website Translator widget must not be used (Google discontinued it from October 1, 2026).

## Locale persistence

User locale preference is stored in:
1. A cookie for anonymous users
2. The `user_preferences.locale` field in PostgreSQL for authenticated users

## Content translation workflow

1. Editor creates/updates content in Sanity (source language)
2. Authorised server-side translation task calls `src/server/translation/`
3. Result saved as a **draft** in Sanity with `translationStatus: "machine_draft"`
4. Human editor reviews and publishes — machine draft never auto-published for clinical/legal content
5. If published translation is missing, application falls back to source language with a visible notice

## Consequences

- Localization Agent owns `src/server/translation/`, `src/i18n/`, and `messages/*.json`
- Google Cloud credentials must not appear in any file under `src/app/` or `src/components/`
- RTL layout is a first-class concern from M1; not retrofitted later
- Machine-translated medical, emergency, or legal content requires mandatory human review before publication
