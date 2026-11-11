/**
 * Consent repository — manages user and patient consent tracking (M8 / ADR-10).
 * Every AI symptom intake and clinical review requires explicit consent recording.
 */
import 'server-only'

import { db } from '@/server/db'

export interface RecordConsentInput {
  patientId: string
  consentType: string
  version?: string
}

export async function recordConsent(data: RecordConsentInput) {
  return db.consentRecord.create({
    data: {
      patientId: data.patientId,
      consentType: data.consentType,
      version: data.version ?? '1.0',
    },
  })
}

export async function hasActiveConsent(patientId: string, consentType: string): Promise<boolean> {
  const record = await db.consentRecord.findFirst({
    where: {
      patientId,
      consentType,
      withdrawnAt: null,
    },
    orderBy: { grantedAt: 'desc' },
  })
  return !!record
}

export async function withdrawConsent(consentId: string, patientId: string) {
  return db.consentRecord.updateMany({
    where: {
      id: consentId,
      patientId,
    },
    data: {
      withdrawnAt: new Date(),
    },
  })
}

export async function getPatientConsents(patientId: string) {
  return db.consentRecord.findMany({
    where: { patientId },
    orderBy: { grantedAt: 'desc' },
  })
}
