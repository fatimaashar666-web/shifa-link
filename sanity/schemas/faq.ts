import { defineType, defineField } from 'sanity'

export const faq = defineType({
  name: 'faq',
  title: 'FAQ',
  type: 'document',
  fields: [
    defineField({
      name: 'question',
      title: 'Question',
      type: 'internationalizedArrayString',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'answer',
      title: 'Answer',
      type: 'portableText',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Registration & Account', value: 'registration' },
          { title: 'Appointments & Consultations', value: 'appointments' },
          { title: 'Diagnostic Tests & Labs', value: 'diagnostics' },
          { title: 'Medical Records & Privacy', value: 'records' },
          { title: 'Billing & Fees', value: 'billing' },
          { title: 'Technical Support', value: 'technical' },
          { title: 'Other', value: 'other' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'sortOrder',
      title: 'Sort Order',
      type: 'number',
      initialValue: 0,
    }),
    defineField({
      name: 'reviewStatus',
      title: 'Review Status',
      type: 'string',
      options: {
        list: [
          { title: 'Draft', value: 'draft' },
          { title: 'Reviewed', value: 'reviewed' },
          { title: 'Approved', value: 'approved' },
        ],
      },
      initialValue: 'draft',
      validation: (Rule) => Rule.required(),
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
