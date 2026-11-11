import { defineType, defineField } from 'sanity'

export const homePage = defineType({
  name: 'homePage',
  title: 'Home Page',
  type: 'document',
  fields: [
    defineField({
      name: 'hero',
      title: 'Hero Section',
      type: 'object',
      fields: [
        defineField({
          name: 'title',
          title: 'Title',
          type: 'internationalizedArrayString',
        }),
        defineField({
          name: 'subtitle',
          title: 'Subtitle',
          type: 'internationalizedArrayText',
        }),
        defineField({
          name: 'ctaLabel',
          title: 'CTA Label',
          type: 'internationalizedArrayString',
        }),
        defineField({
          name: 'ctaUrl',
          title: 'CTA URL',
          type: 'string',
        }),
        defineField({
          name: 'backgroundImage',
          title: 'Background Image',
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({
              name: 'alt',
              title: 'Alt Text',
              type: 'string',
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'featuredSections',
      title: 'Featured Sections',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'sectionTitle',
              title: 'Section Title',
              type: 'internationalizedArrayString',
            }),
            defineField({
              name: 'sectionBody',
              title: 'Section Body',
              type: 'internationalizedArrayText',
            }),
            defineField({
              name: 'icon',
              title: 'Icon Name (Lucide)',
              type: 'string',
            }),
          ],
        },
      ],
    }),
    defineField({
      name: 'seoTitle',
      title: 'SEO Title',
      type: 'internationalizedArrayString',
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO Description',
      type: 'internationalizedArrayText',
    }),
  ],
})
