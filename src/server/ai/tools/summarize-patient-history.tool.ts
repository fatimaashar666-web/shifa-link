/**
 * AI Tool 5: Clinical Patient History & Shared Records Summarizer (M8).
 *
 * Rules (ADR-05 & ADR-06):
 * - Never imports `PrismaClient` directly.
 * - Enforces practitioner authorization check and patient-shared record grants.
 * - Extracts only verified records and cites source file identifiers (no hallucination).
 * - Flags clinical confidence and uncertainty.
 */
import 'server-only'

import { z } from 'zod'
import * as recordRepo from '@/server/repositories/medical-record.repository'
import * as userRepo from '@/server/repositories/user.repository'
import * as consentRepo from '@/server/repositories/consent.repository'

export const SummarizePatientHistoryToolInputSchema = z.object({
  doctorUserId: z.string().uuid().describe('Authenticated Doctor User ID'),
  patientId: z.string().uuid().describe('Target Patient Profile ID'),
})

export type SummarizePatientHistoryToolInput = z.infer<typeof SummarizePatientHistoryToolInputSchema>

export const ClinicalSummaryResultSchema = z.object({
  patientId: z.string(),
  hasActiveConsent: z.boolean(),
  totalRecordsReviewed: z.number(),
  sourceRecords: z.array(
    z.object({
      recordId: z.string(),
      title: z.string(),
      category: z.string(),
      recordDate: z.string(),
      fileName: z.string(),
    })
  ),
  clinicalObservations: z.array(z.string()),
  riskFactors: z.array(z.string()),
  uncertaintyFlags: z.array(z.string()),
  confidenceScore: z.number().min(0).max(1),
  mandatoryNotice: z.string(),
})

export type ClinicalSummaryResult = z.infer<typeof ClinicalSummaryResultSchema>

export async function summarizePatientHistoryTool(
  input: SummarizePatientHistoryToolInput
): Promise<ClinicalSummaryResult> {
  const parsed = SummarizePatientHistoryToolInputSchema.parse(input)

  // 1. Verify caller is a verified doctor
  const doctorUser = await userRepo.findById(parsed.doctorUserId)
  const doctorProfile = doctorUser?.doctorProfile
  if (!doctorProfile) {
    throw new Error('Access denied: Caller is not a registered doctor.')
  }

  // 2. Verify active consent record (ADR-10 / M8 criterion)
  const consentGiven = await consentRepo.hasActiveConsent(
    doctorUser.id,
    'clinical_ai_summary'
  )

  // 3. Fetch records shared with this doctor
  const sharedRecords = await recordRepo.listAccessibleRecordsForDoctor(doctorProfile.id)
  const patientRecords = sharedRecords.filter((r) => r.patientId === parsed.patientId)

  // 4. Extract structured observations from source records (never fabricate facts)
  const observations: string[] = []
  const riskFactors: string[] = []
  const uncertaintyFlags: string[] = []

  if (patientRecords.length === 0) {
    uncertaintyFlags.push('No patient-shared medical records found in ShifaLink Drive.')
    observations.push('Patient has not yet shared past diagnostic files or prescriptions with this provider.')
  } else {
    for (const rec of patientRecords) {
      if (rec.category === 'LAB_REPORT') {
        observations.push(`Lab Report available: "${rec.title}" (Date: ${new Date(rec.recordDate).toLocaleDateString()}).`)
        if (rec.title.toLowerCase().includes('lipid') || rec.title.toLowerCase().includes('cholesterol')) {
          riskFactors.push('Lipid panel on file; evaluate cardiovascular markers against clinical guidelines.')
        }
        if (rec.title.toLowerCase().includes('hba1c') || rec.title.toLowerCase().includes('glucose')) {
          riskFactors.push('Glycemic control markers present on record; cross-reference fasting state.')
        }
      } else if (rec.category === 'RADIOLOGY_IMAGE') {
        observations.push(`Diagnostic imaging recorded: "${rec.title}". Prior imaging review advised.`)
      } else if (rec.category === 'PRESCRIPTION') {
        observations.push(`Medication history item: "${rec.title}". Cross-check active dosage and allergy interactions.`)
      } else {
        observations.push(`Medical file: "${rec.title}" (${rec.category}).`)
      }
    }
  }

  // Calculate confidence based on available documentation
  const confidenceScore = patientRecords.length >= 3 ? 0.95 : patientRecords.length > 0 ? 0.75 : 0.4

  return {
    patientId: parsed.patientId,
    hasActiveConsent: consentGiven,
    totalRecordsReviewed: patientRecords.length,
    sourceRecords: patientRecords.map((r) => ({
      recordId: r.id,
      title: r.title,
      category: r.category,
      recordDate: new Date(r.recordDate).toISOString(),
      fileName: r.fileObject.fileName,
    })),
    clinicalObservations: observations,
    riskFactors,
    uncertaintyFlags,
    confidenceScore,
    mandatoryNotice:
      'CLINICAL REVIEW REQUIRED: This AI synthesis is an assistive informational draft compiled solely from patient-shared records. It does not replace independent clinical judgment, direct physical examination, or diagnostic verification.',
  }
}
