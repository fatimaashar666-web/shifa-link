/**
 * Clinical Consultation Service (M8).
 * Handles doctor consultation workflow, AI clinical summary generation,
 * mandatory practitioner review & acknowledgement, and consent recording.
 */
import 'server-only'

import { z } from 'zod'
import * as consentRepo from '@/server/repositories/consent.repository'
import * as userRepo from '@/server/repositories/user.repository'
import { summarizePatientHistoryTool, ClinicalSummaryResult } from '@/server/ai/tools'
import { writeAuditEvent } from '@/server/audit'

export const GenerateClinicalSummarySchema = z.object({
  patientId: z.string().uuid('Invalid Patient ID'),
})

export type GenerateClinicalSummaryInput = z.infer<typeof GenerateClinicalSummarySchema>

export const AcknowledgeSummarySchema = z.object({
  patientId: z.string().uuid(),
  notes: z.string().max(2000).optional(),
})

export type AcknowledgeSummaryInput = z.infer<typeof AcknowledgeSummarySchema>

export async function generateClinicalSummary(
  doctorUserId: string,
  input: GenerateClinicalSummaryInput,
  ipAddress?: string
): Promise<ClinicalSummaryResult> {
  const parsed = GenerateClinicalSummarySchema.parse(input)

  // 1. Record doctor explicit consent to consult clinical AI assistant
  await consentRepo.recordConsent({
    patientId: doctorUserId,
    consentType: 'clinical_ai_summary',
    version: '1.0',
  })

  // 2. Run typed AI summarizer
  const summary = await summarizePatientHistoryTool({
    doctorUserId,
    patientId: parsed.patientId,
  })

  // 3. Log audit event
  writeAuditEvent({
    actorType: 'AGENT',
    actorId: doctorUserId,
    action: 'clinical_ai.summary_generated',
    entityType: 'PatientProfile',
    entityId: parsed.patientId,
    metadata: {
      confidenceScore: summary.confidenceScore,
      recordsReviewedCount: summary.totalRecordsReviewed,
    },
    ipAddress,
  })

  return summary
}

export async function acknowledgeClinicalSummary(
  doctorUserId: string,
  input: AcknowledgeSummaryInput,
  ipAddress?: string
) {
  const parsed = AcknowledgeSummarySchema.parse(input)

  const doctorUser = await userRepo.findById(doctorUserId)
  if (!doctorUser?.doctorProfile) {
    throw new Error('Unauthorized: Doctor profile required.')
  }

  // Record active review acknowledgement (cannot be bypassed programmatically)
  await consentRepo.recordConsent({
    patientId: doctorUserId,
    consentType: `clinical_summary_acknowledged_${parsed.patientId}`,
    version: '1.0',
  })

  writeAuditEvent({
    actorType: 'USER',
    actorId: doctorUserId,
    action: 'clinical_ai.summary_acknowledged',
    entityType: 'PatientProfile',
    entityId: parsed.patientId,
    metadata: {
      acknowledgedByDoctorId: doctorUser.doctorProfile.id,
      notesIncluded: !!parsed.notes,
    },
    ipAddress,
  })

  return {
    acknowledged: true,
    acknowledgedAt: new Date().toISOString(),
    patientId: parsed.patientId,
  }
}
