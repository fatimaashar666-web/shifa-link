import { defineType, defineField } from 'sanity'

export const article = defineType({
  name: 'article',
  title: 'Health Article',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'internationalizedArrayString',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title.0.value',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'internationalizedArrayText',
    }),
    defineField({
      name: 'body',
      title: 'Body Content',
      type: 'portableText',
    }),
    defineField({
      name: 'authorDisplay',
      title: 'Author Display Name',
      type: 'string',
      description: 'Public author attribution only (no internal user references)',
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'General Health', value: 'general-health' },
          { title: 'Nutrition & Diet', value: 'nutrition' },
          { title: 'Mental Health', value: 'mental-health' },
          { title: 'Chronic Conditions', value: 'chronic-conditions' },
          { title: 'Preventive Care', value: 'preventive-care' },
          { title: 'Diagnostic Guides', value: 'diagnostic-guides' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Image (shown on cards and article page)',
      type: 'image',
      description: 'Upload the article image that appears in the homepage section, article listing, and article detail page.',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
          validation: (Rule) => Rule.required(),
        }),
      ],
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
    }),
    defineField({
      name: 'reviewStatus',
      title: 'Review Status',
      type: 'string',
      options: {
        list: [
          { title: 'Draft', value: 'draft' },
          { title: 'Under Clinical Review', value: 'clinical-review' },
          { title: 'Approved', value: 'approved' },
          { title: 'Published', value: 'published' },
        ],
      },
      initialValue: 'draft',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
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
