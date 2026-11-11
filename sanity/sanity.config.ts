import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { internationalizedArray } from 'sanity-plugin-internationalized-array'
import { schemaTypes } from './schemas'

export default defineConfig({
  name: 'shifalink',
  title: 'ShifaLink CMS',
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'placeholder-project-id',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
  plugins: [
    structureTool(),
    visionTool(),
    internationalizedArray({
      languages: [
        { id: 'en', title: 'English' },
        { id: 'ur', title: 'اردو' },
        { id: 'de', title: 'Deutsch' },
        { id: 'ar', title: 'العربية' },
        { id: 'fr', title: 'Français' },
        { id: 'ja', title: '日本語' },
      ],
      defaultLanguages: ['en'],
      fieldTypes: ['string', 'text'],
    }),
  ],
  schema: { types: schemaTypes },
})
