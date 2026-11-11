export const FAQS_QUERY = `
  *[_type == "faq" && reviewStatus == "approved"] | order(sortOrder asc) {
    _id,
    question,
    answer,
    category,
    sortOrder,
    reviewStatus,
    locale
  }
`

export const FAQS_BY_CATEGORY_QUERY = `
  *[_type == "faq" && reviewStatus == "approved" && category == $category] | order(sortOrder asc) {
    _id,
    question,
    answer,
    category
  }
`
