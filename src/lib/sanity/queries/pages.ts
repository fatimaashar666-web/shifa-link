export const PAGE_BY_SLUG_QUERY = `
  *[_type == "page" && slug.current == $slug && status == "published"][0] {
    _id,
    title,
    slug,
    body,
    seoTitle,
    seoDescription,
    publishedAt
  }
`
