/**
 * AI Tool 3: Editorial Health Articles & Sanity FAQ Lookup.
 * Rule: ADR-05 compliant — strictly typed Zod input/output.
 */
import 'server-only'

import { z } from 'zod'
import { getPublishedArticles, getFaqs } from '@/lib/sanity/client'

export const SearchArticlesToolInputSchema = z.object({
  topic: z.string().describe('Health topic or keyword, e.g. "hypertension", "fasting", "telehealth", "blood test"'),
  locale: z.string().default('en').describe('Preferred language code: en, ur, ar, de, fr, ja'),
})

export type SearchArticlesToolInput = z.infer<typeof SearchArticlesToolInputSchema>

export const ArticleSummarySchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  category: z.string(),
  excerpt: z.string().optional(),
})

export type ArticleSummary = z.infer<typeof ArticleSummarySchema>

export async function searchArticlesTool(input: SearchArticlesToolInput): Promise<{
  articles: ArticleSummary[]
  faqs: Array<{ question: string; answerText: string }>
}> {
  const parsed = SearchArticlesToolInputSchema.parse(input)
  const q = parsed.topic.toLowerCase()

  const [articles, faqs] = await Promise.all([
    getPublishedArticles(),
    getFaqs(),
  ])

  const matchingArticles: ArticleSummary[] = articles
    .filter((a) => {
      const enTitle = a.title.en?.toLowerCase() ?? ''
      const enExcerpt = a.excerpt?.en?.toLowerCase() ?? ''
      const tags = (a.tags ?? []).map((t) => t.toLowerCase()).join(' ')
      return enTitle.includes(q) || enExcerpt.includes(q) || tags.includes(q)
    })
    .map((a) => {
      const title = (a.title as Record<string, string>)[parsed.locale] || a.title.en || 'Article'
      const excerpt = a.excerpt ? ((a.excerpt as Record<string, string>)[parsed.locale] || a.excerpt.en) : undefined
      return {
        id: a._id,
        title,
        slug: a.slug.current,
        category: a.category,
        excerpt,
      }
    })

  const matchingFaqs = faqs
    .filter((f) => {
      const enQ = f.question.en?.toLowerCase() ?? ''
      return enQ.includes(q) || f.category.toLowerCase().includes(q)
    })
    .map((f) => {
      const question = (f.question as Record<string, string>)[parsed.locale] || f.question.en || ''
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const answerBlocks = (f.answer as any)[parsed.locale] || (f.answer as any).en || []
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const answerText = answerBlocks.map((b: any) => b.children?.map((c: any) => c.text).join('')).join('\n')
      return {
        question,
        answerText,
      }
    })

  return {
    articles: matchingArticles,
    faqs: matchingFaqs,
  }
}
