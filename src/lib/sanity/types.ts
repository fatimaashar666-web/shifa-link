// TypeScript interfaces representing the GROQ query projections consumed by the application

export type LocalizedString = Record<string, string>
export type LocalizedText = Record<string, string>
export type LocalizedPortableText = Record<string, unknown[]>

export interface SanityImageSource {
  asset: {
    _ref: string
    _type: 'reference'
  }
  alt?: string
}

export interface SiteSettings {
  siteName: string
  contactEmail?: string
  contactPhone?: string
  address?: string
  defaultLocale: string
  metaDescription?: string
}

export interface FaqDocument {
  _id: string
  question: LocalizedString
  answer: LocalizedPortableText
  category: string
  sortOrder?: number
  reviewStatus: 'draft' | 'reviewed' | 'approved'
  locale?: string
}

export interface ArticleDocument {
  _id: string
  title: LocalizedString
  slug: { current: string }
  excerpt?: LocalizedText
  body?: LocalizedPortableText
  authorDisplay?: string
  category: string
  coverImage?: SanityImageSource
  publishedAt?: string
  reviewStatus: 'draft' | 'clinical-review' | 'approved' | 'published'
  tags?: string[]
  seoTitle?: LocalizedString
  seoDescription?: LocalizedText
}

export interface PageDocument {
  _id: string
  title: LocalizedString
  slug: { current: string }
  body?: LocalizedPortableText
  seoTitle?: LocalizedString
  seoDescription?: LocalizedText
  status: 'draft' | 'review' | 'published'
  publishedAt?: string
}

export interface ServiceInformationDocument {
  _id: string
  title: LocalizedString
  slug: { current: string }
  serviceType: 'lab' | 'radiology' | 'consultation'
  description?: LocalizedPortableText
  preparationGuidance?: LocalizedPortableText
  disclaimer?: LocalizedText
  coverImage?: SanityImageSource
  reviewStatus: 'draft' | 'reviewed' | 'approved'
}

export interface LegalPageDocument {
  _id: string
  title: LocalizedString
  slug: { current: string }
  pageType: 'privacy-policy' | 'terms-of-service' | 'consent-information' | 'cookie-policy'
  body: LocalizedPortableText
  effectiveDate: string
  version: string
  reviewStatus: 'draft' | 'legal-review' | 'approved' | 'published'
  locale: string
}
