export const SITE_SETTINGS_QUERY = `
  *[_type == "siteSettings"][0] {
    siteName,
    logo,
    contactEmail,
    contactPhone,
    address,
    socialLinks,
    defaultLocale,
    metaDescription
  }
`
