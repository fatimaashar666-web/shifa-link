# M3 — Sanity CMS Integration Specification & Next.js Handoff

**Author:** Sanity CMS Agent  
**Milestone:** M3 (schemas & query contracts)  
**Status:** Ready for Next.js integration  

---

## 1. Summary of schemas created

All schemas reside under `sanity/schemas/`:
1. `portableText.ts` — reusable rich text block with safe link annotations.
2. `siteSettings.ts` — global metadata, logo, contact, default locale.
3. `homePage.ts` — localized hero, featured sections, SEO.
4. `page.ts` — general content pages with slug and localized portable text.
5. `faq.ts` — categorized FAQs with `reviewStatus` and locale support.
6. `article.ts` — health articles with categories and clinical review workflow.
7. `serviceInformation.ts` — diagnostic/consultation preparation guidance with mandatory clinical disclaimer review.
8. `navigation.ts` — main header and footer navigation items.
9. `legalPage.ts` — terms, privacy policy, and patient consent information with mandatory legal review status.

> **Crucial Rule:** No patient records, doctor private schedules, appointments, diagnostic bookings, or consent grants are modeled here. All operational and sensitive data remains strictly in PostgreSQL (ADR-03).

---

## 2. Next.js integration requirements

Once the Next.js shell (M1) is ready, the following packages must be installed:
```bash
npm install next-sanity @sanity/image-url @portabletext/react sanity-plugin-internationalization
```

### Server-only client (`src/lib/sanity/client.ts`)
```ts
import { createClient } from 'next-sanity'

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
  apiVersion: '2024-01-01',
  useCdn: process.env.NODE_ENV === 'production',
})
```

### Studio route (`src/app/studio/[[...tool]]/page.tsx`)
```tsx
import { NextStudio } from 'next-sanity/studio'
import config from '../../../../sanity/sanity.config'

export const dynamic = 'force-static'

export default function StudioPage() {
  return <NextStudio config={config} />
}
```

### Environment variables
```env
NEXT_PUBLIC_SANITY_PROJECT_ID="your_project_id"
NEXT_PUBLIC_SANITY_DATASET="production"
SANITY_API_WRITE_TOKEN="secret_write_token"     # Server-only
SANITY_WEBHOOK_SECRET="secret_webhook_secret"   # Server-only
```
