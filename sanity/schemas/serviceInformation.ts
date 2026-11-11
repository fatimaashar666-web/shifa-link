import { defineType, defineField } from 'sanity'

export const serviceInformation = defineType({
  name: 'serviceInformation',
  title: 'Service Information',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Service Title',
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
      name: 'serviceType',
      title: 'Service Type',
      type: 'string',
      options: {
        list: [
          { title: 'Laboratory Test', value: 'lab' },
          { title: 'Radiology Test', value: 'radiology' },
          { title: 'Consultation Overview', value: 'consultation' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'portableText',
    }),
    defineField({
      name: 'preparationGuidance',
      title: 'Preparation Guidance',
      type: 'portableText',
      description: 'Instructions for patients prior to test (e.g. fasting, clothing, medication holds)',
    }),
    defineField({
      name: 'disclaimer',
      title: 'Medical Disclaimer',
      type: 'internationalizedArrayText',
      description: 'Legal and medical disclaimer. Mandatory human review before publishing.',
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Image',
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
    defineField({
      name: 'reviewStatus',
      title: 'Clinical Review Status',
      type: 'string',
      options: {
        list: [
          { title: 'Draft', value: 'draft' },
          { title: 'Under Clinical Review', value: 'reviewed' },
          { title: 'Approved for Publication', value: 'approved' },
        ],
      },
      initialValue: 'draft',
      validation: (Rule) => Rule.required(),
    }),
  ],
})
