export const ARTICLES_QUERY = `
  *[_type == "article" && reviewStatus == "published"] | order(publishedAt desc) {
    _id,
    title,
    slug,
    excerpt,
    category,
    coverImage,
    publishedAt,
    authorDisplay,
    tags
  }
`

export const ARTICLE_BY_SLUG_QUERY = `
  *[_type == "article" && slug.current == $slug && reviewStatus == "published"][0] {
    _id,
    title,
    slug,
    excerpt,
    body,
    category,
    coverImage,
    publishedAt,
    authorDisplay,
    tags,
    seoTitle,
    seoDescription
  }
`
