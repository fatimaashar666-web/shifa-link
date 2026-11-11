import { defineType, defineField } from 'sanity'

export const page = defineType({
  name: 'page',
  title: 'Content Page',
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
      name: 'body',
      title: 'Body Content',
      type: 'portableText',
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
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Draft', value: 'draft' },
          { title: 'In Review', value: 'review' },
          { title: 'Published', value: 'published' },
        ],
      },
      initialValue: 'draft',
    }),
  ],
})
