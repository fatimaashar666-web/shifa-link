/**
 * AI Tool 4: Safe Clinical Pre-Triage Rule Engine.
 * Rule: ADR-05 compliant — strictly typed Zod input/output.
 * IMPORTANT: NEVER produces definitive medical diagnoses. Evaluates red-flag symptoms and routes safely.
 */
import 'server-only'

import { z } from 'zod'

export const EvaluateSymptomsToolInputSchema = z.object({
  symptoms: z.string().describe('Patient reported symptoms, concerns, or sensations'),
  durationDays: z.number().int().min(0).optional().describe('Approximate duration of symptoms in days'),
  severity: z.enum(['MILD', 'MODERATE', 'SEVERE']).optional().describe('Self-reported severity'),
})

export type EvaluateSymptomsToolInput = z.infer<typeof EvaluateSymptomsToolInputSchema>

export const RED_FLAG_SYMPTOMS = [
  'chest pain',
  'crushing chest pressure',
  'shortness of breath',
  'difficulty breathing',
  'sudden weakness',
  'slurred speech',
  'loss of consciousness',
  'uncontrolled bleeding',
  'severe head trauma',
  'facial droop',
  'sudden vision loss',
  'coughing blood',
]

export const TriageResultSchema = z.object({
  isEmergency: z.boolean(),
  urgencyLevel: z.enum(['EMERGENCY', 'URGENT', 'ROUTINE', 'SELF_CARE']),
  recommendedSpecialtySlug: z.string().nullable(),
  recommendedSpecialtyName: z.string().nullable(),
  recommendedDiagnosticCategory: z.string().nullable(),
  safetyAdvisory: z.string(),
  reasoning: z.string(),
})

export type TriageResult = z.infer<typeof TriageResultSchema>

export async function evaluateSymptomsTool(input: EvaluateSymptomsToolInput): Promise<TriageResult> {
  const parsed = EvaluateSymptomsToolInputSchema.parse(input)
  const lower = parsed.symptoms.toLowerCase()

  // 1. Red-flag emergency screening
  const matchedRedFlags = RED_FLAG_SYMPTOMS.filter((rf) => lower.includes(rf))

  if (matchedRedFlags.length > 0) {
    return {
      isEmergency: true,
      urgencyLevel: 'EMERGENCY',
      recommendedSpecialtySlug: null,
      recommendedSpecialtyName: null,
      recommendedDiagnosticCategory: null,
      safetyAdvisory:
        'RED-FLAG EMERGENCY DETECTED: Symptoms may indicate an acute life-threatening emergency. Do not wait for a scheduled appointment. Please immediately proceed to the nearest emergency department or call your national emergency ambulance service (112, 911, or 15).',
      reasoning: `Identified critical emergency keywords: ${matchedRedFlags.join(', ')}.`,
    }
  }

  // 2. Specialty mapping
  if (
    lower.includes('heart') ||
    lower.includes('palpitation') ||
    lower.includes('high blood pressure') ||
    lower.includes('hypertension') ||
    lower.includes('pulse')
  ) {
    return {
      isEmergency: false,
      urgencyLevel: parsed.severity === 'SEVERE' ? 'URGENT' : 'ROUTINE',
      recommendedSpecialtySlug: 'cardiology',
      recommendedSpecialtyName: 'Cardiology',
      recommendedDiagnosticCategory: 'Biochemistry',
      safetyAdvisory:
        'Please schedule an evaluation with a Cardiologist. If you experience radiating chest tightness, jaw pain, or shortness of breath, seek emergency care immediately.',
      reasoning: 'Cardiovascular symptoms reported without acute red flags.',
    }
  }

  if (
    lower.includes('skin') ||
    lower.includes('rash') ||
    lower.includes('itching') ||
    lower.includes('allergy') ||
    lower.includes('mole') ||
    lower.includes('eczema')
  ) {
    return {
      isEmergency: false,
      urgencyLevel: 'ROUTINE',
      recommendedSpecialtySlug: 'dermatology',
      recommendedSpecialtyName: 'Dermatology',
      recommendedDiagnosticCategory: null,
      safetyAdvisory:
        'Schedule a consultation with a Dermatologist. Avoid applying unverified topical medications prior to clinical examination.',
      reasoning: 'Dermatological condition reported.',
    }
  }

  if (
    lower.includes('headache') ||
    lower.includes('migraine') ||
    lower.includes('dizziness') ||
    lower.includes('numbness') ||
    lower.includes('tingling')
  ) {
    return {
      isEmergency: false,
      urgencyLevel: parsed.severity === 'SEVERE' ? 'URGENT' : 'ROUTINE',
      recommendedSpecialtySlug: 'neurology',
      recommendedSpecialtyName: 'Neurology',
      recommendedDiagnosticCategory: 'MRI',
      safetyAdvisory:
        'A Neurology consultation or initial General Medicine assessment is recommended. If severe sudden "thunderclap" headache or neurological deficit occurs, visit an ER immediately.',
      reasoning: 'Neurological symptoms reported without acute focal stroke signs.',
    }
  }

  if (
    lower.includes('bone') ||
    lower.includes('joint') ||
    lower.includes('knee') ||
    lower.includes('back pain') ||
    lower.includes('sprain') ||
    lower.includes('fracture')
  ) {
    return {
      isEmergency: false,
      urgencyLevel: parsed.severity === 'SEVERE' ? 'URGENT' : 'ROUTINE',
      recommendedSpecialtySlug: 'orthopedics',
      recommendedSpecialtyName: 'Orthopedics',
      recommendedDiagnosticCategory: 'Radiography',
      safetyAdvisory:
        'Schedule an Orthopedic review. If severe deformity or inability to bear weight after trauma is present, visit urgent care.',
      reasoning: 'Musculoskeletal concerns reported.',
    }
  }

  if (
    lower.includes('child') ||
    lower.includes('baby') ||
    lower.includes('infant') ||
    lower.includes('toddler')
  ) {
    return {
      isEmergency: false,
      urgencyLevel: parsed.severity === 'SEVERE' ? 'URGENT' : 'ROUTINE',
      recommendedSpecialtySlug: 'pediatrics',
      recommendedSpecialtyName: 'Pediatrics',
      recommendedDiagnosticCategory: 'Haematology',
      safetyAdvisory:
        'Please arrange an evaluation with a Pediatrician. Monitor hydration and alert responsiveness closely.',
      reasoning: 'Pediatric care indication.',
    }
  }

  // Default to General Medicine
  return {
    isEmergency: false,
    urgencyLevel: 'ROUTINE',
    recommendedSpecialtySlug: 'general-medicine',
    recommendedSpecialtyName: 'General Medicine',
    recommendedDiagnosticCategory: 'Haematology',
    safetyAdvisory:
      'We recommend booking an initial consultation with a General Practitioner / Family Medicine specialist for comprehensive clinical evaluation and directed lab workup.',
    reasoning: 'General medical symptoms reported; appropriate for primary care triage.',
  }
}
