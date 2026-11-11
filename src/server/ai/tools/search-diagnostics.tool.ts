/**
 * AI Tool 2: Diagnostic Services & Labs Lookup.
 * Rule: ADR-05 compliant — strictly typed Zod input/output, calls services layer, never direct DB.
 */
import 'server-only'

import { z } from 'zod'
import * as diagService from '@/server/services/diagnostic.service'

export const SearchDiagnosticsToolInputSchema = z.object({
  type: z.enum(['LAB', 'RADIOLOGY']).optional().describe('Type of diagnostic service: "LAB" or "RADIOLOGY"'),
  category: z.string().optional().describe('Clinical category, e.g. "Haematology", "Radiography", "Endocrinology", "Ultrasound"'),
  query: z.string().optional().describe('Test name or keyword, e.g. "CBC", "X-Ray", "Lipid", "HbA1c"'),
})

export type SearchDiagnosticsToolInput = z.infer<typeof SearchDiagnosticsToolInputSchema>

export const DiagnosticServiceSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  category: z.string(),
  description: z.string().nullable(),
  basePrice: z.number(),
  turnaroundHours: z.number(),
  homeCollection: z.boolean(),
  availableLocations: z.array(z.string()),
})

export type DiagnosticServiceSummary = z.infer<typeof DiagnosticServiceSummarySchema>

export async function searchDiagnosticsTool(input: SearchDiagnosticsToolInput): Promise<{
  services: DiagnosticServiceSummary[]
  total: number
}> {
  const parsed = SearchDiagnosticsToolInputSchema.parse(input)

  const services = await diagService.searchServices({
    type: parsed.type,
    category: parsed.category,
    query: parsed.query,
    limit: 6,
  })

  const summaries: DiagnosticServiceSummary[] = services.map((s) => ({
    id: s.id,
    name: s.name,
    type: s.type,
    category: s.category,
    description: s.description,
    basePrice: Number(s.basePrice),
    turnaroundHours: s.turnaroundHours,
    homeCollection: s.homeCollection,
    availableLocations: s.locations
      .filter((loc) => loc.isAvailable)
      .map((loc) => loc.organization.name),
  }))

  return {
    services: summaries,
    total: summaries.length,
  }
}
