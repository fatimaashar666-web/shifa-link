import { defineType, defineField } from 'sanity'

export const legalPage = defineType({
  name: 'legalPage',
  title: 'Legal & Policy Page',
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
      name: 'pageType',
      title: 'Policy Type',
      type: 'string',
      options: {
        list: [
          { title: 'Privacy Policy', value: 'privacy-policy' },
          { title: 'Terms of Service', value: 'terms-of-service' },
          { title: 'Patient Consent Information', value: 'consent-information' },
          { title: 'Cookie Policy', value: 'cookie-policy' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'body',
      title: 'Policy Body',
      type: 'portableText',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'effectiveDate',
      title: 'Effective Date',
      type: 'date',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'version',
      title: 'Document Version',
      type: 'string',
      validation: (Rule) => Rule.required(),
      initialValue: '1.0',
    }),
    defineField({
      name: 'reviewStatus',
      title: 'Legal Review Status',
      type: 'string',
      options: {
        list: [
          { title: 'Draft', value: 'draft' },
          { title: 'Under Legal Review', value: 'legal-review' },
          { title: 'Approved by Legal', value: 'approved' },
          { title: 'Published', value: 'published' },
        ],
      },
      initialValue: 'draft',
      validation: (Rule) => Rule.required(),
      description: 'Mandatory legal approval required before publishing.',
    }),
    defineField({
      name: 'locale',
      title: 'Source Locale',
      type: 'string',
      options: {
        list: [
          { title: 'English', value: 'en' },
          { title: 'Urdu', value: 'ur' },
          { title: 'German', value: 'de' },
          { title: 'Arabic', value: 'ar' },
          { title: 'French', value: 'fr' },
          { title: 'Japanese', value: 'ja' },
        ],
      },
      initialValue: 'en',
    }),
  ],
})
