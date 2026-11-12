export const LEGAL_PAGE_BY_TYPE_QUERY = `
  *[
    _type == "legalPage" &&
    pageType == $pageType &&
    reviewStatus == "published"
  ] | order(locale == $locale desc, effectiveDate desc)[0] {
    _id,
    title,
    slug,
    pageType,
    body,
    effectiveDate,
    version,
    reviewStatus,
    locale
  }
`
