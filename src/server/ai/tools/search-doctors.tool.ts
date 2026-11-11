/**
 * AI Tool 1: Doctor Specialty & Directory Lookup.
 * Rule: ADR-05 compliant — strictly typed Zod input/output, calls services layer, never direct DB.
 */
import 'server-only'

import { z } from 'zod'
import * as doctorService from '@/server/services/doctor.service'

export const SearchDoctorsToolInputSchema = z.object({
  specialtySlug: z.string().optional().describe('Specialty slug, e.g. "cardiology", "general-medicine", "pediatrics", "dermatology"'),
  query: z.string().optional().describe('Keyword or doctor name to match'),
  city: z.string().optional().describe('City name, e.g. "Lahore", "Karachi", "Islamabad"'),
  isVirtual: z.boolean().optional().describe('Whether telehealth video consultation is available'),
})

export type SearchDoctorsToolInput = z.infer<typeof SearchDoctorsToolInputSchema>

export const DoctorSummarySchema = z.object({
  id: z.string(),
  fullName: z.string(),
  primarySpecialty: z.string().nullable(),
  consultationFee: z.number(),
  bio: z.string().nullable(),
  locations: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      city: z.string(),
      isVirtual: z.boolean(),
    })
  ),
})

export type DoctorSummary = z.infer<typeof DoctorSummarySchema>

export async function searchDoctorsTool(input: SearchDoctorsToolInput): Promise<{
  doctors: DoctorSummary[]
  total: number
}> {
  const parsed = SearchDoctorsToolInputSchema.parse(input)

  const result = await doctorService.searchDoctors({
    specialtySlug: parsed.specialtySlug,
    query: parsed.query,
    city: parsed.city,
    isVirtual: parsed.isVirtual,
    limit: 6,
  })

  const summaries: DoctorSummary[] = result.doctors.map((d) => ({
    id: d.id,
    fullName: d.fullName,
    primarySpecialty: d.specialties.find((s) => s.isPrimary)?.name ?? null,
    consultationFee: Number(d.consultationFee),
    bio: d.bio,
    locations: d.locations.map((loc) => ({
      id: loc.id,
      name: loc.name,
      city: loc.city,
      isVirtual: loc.isVirtual,
    })),
  }))

  return {
    doctors: summaries,
    total: result.total,
  }
}
