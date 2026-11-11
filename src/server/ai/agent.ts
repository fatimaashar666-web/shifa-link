/**
 * Orchestrator for the ShifaLink AI Patient Support & Triage Agent.
 *
 * Rules (ADR-05 & AGENTS.md):
 * - Restricted to narrow typed tools only.
 * - Never receives direct database credentials or PrismaClient.
 * - Enforces strict medical safety guardrails:
 *     1. Never provides definitive diagnoses or prescribing instructions.
 *     2. Immediately flags red-flag symptoms with urgent emergency routing.
 *     3. Directs patients to book verified practitioners or diagnostic tests.
 *     4. Always presents the Clinical Safety Notice disclaimer.
 */
import 'server-only'

import {
  evaluateSymptomsTool,
  searchDoctorsTool,
  searchDiagnosticsTool,
  searchArticlesTool,
  DoctorSummary,
  DiagnosticServiceSummary,
  ArticleSummary,
  TriageResult,
} from './tools'

export interface AgentChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface SupportAgentResponse {
  reply: string
  triage?: TriageResult
  suggestedDoctors?: DoctorSummary[]
  suggestedDiagnostics?: DiagnosticServiceSummary[]
  suggestedArticles?: ArticleSummary[]
  isEmergency: boolean
  disclaimer: string
}

const CLINICAL_DISCLAIMER =
  'Notice: ShifaLink AI is an automated guidance and scheduling assistant. It does not provide medical diagnoses or prescriptions. In an emergency, call your local ambulance service (112, 911, or 15) immediately.'

export async function runSupportAgent(params: {
  messages: AgentChatMessage[]
  locale?: string
  userId?: string
}): Promise<SupportAgentResponse> {
  const lastUserMessage =
    [...params.messages].reverse().find((m) => m.role === 'user')?.content || ''

  // 1. Clinical Symptom & Triage Evaluation
  const triage = await evaluateSymptomsTool({
    symptoms: lastUserMessage,
  })

  // If acute red-flag emergency, halt tool exploration and return emergency protocol immediately
  if (triage.isEmergency) {
    return {
      reply: `⚠️ EMERGENCY SAFETY ALERT\n\n${triage.safetyAdvisory}\n\nOur system has identified potential acute emergency symptoms. Please do not wait for a chat or scheduled appointment. Seek emergency medical attention at your nearest hospital or call emergency services immediately.`,
      triage,
      isEmergency: true,
      disclaimer: CLINICAL_DISCLAIMER,
    }
  }

  // 2. Parallel typed tool invocations based on triage recommendation
  const [doctorResult, diagnosticResult, articleResult] = await Promise.all([
    triage.recommendedSpecialtySlug
      ? searchDoctorsTool({ specialtySlug: triage.recommendedSpecialtySlug })
      : searchDoctorsTool({ query: lastUserMessage.slice(0, 40) }),
    triage.recommendedDiagnosticCategory
      ? searchDiagnosticsTool({ category: triage.recommendedDiagnosticCategory })
      : searchDiagnosticsTool({ query: lastUserMessage.slice(0, 30) }),
    searchArticlesTool({
      topic: triage.recommendedSpecialtySlug ?? 'health',
      locale: params.locale ?? 'en',
    }),
  ])

  // 3. Compose structured, safe guidance reply
  const specialtyName = triage.recommendedSpecialtyName ?? 'Primary Care'
  let reply = `Based on what you've described, an evaluation with a **${specialtyName}** specialist is recommended.\n\n`
  reply += `${triage.safetyAdvisory}\n\n`

  if (doctorResult.doctors.length > 0) {
    reply += `**Recommended Verified Specialists:**\n`
    for (const doc of doctorResult.doctors.slice(0, 3)) {
      const city = doc.locations[0]?.city ?? 'Clinic'
      reply += `• **Dr. ${doc.fullName}** — ${doc.primarySpecialty ?? specialtyName} (${city}) · Fee: Rs. ${doc.consultationFee.toLocaleString()}\n`
    }
    reply += `\n`
  }

  if (diagnosticResult.services.length > 0) {
    reply += `**Relevant Diagnostic Tests:**\n`
    for (const s of diagnosticResult.services.slice(0, 2)) {
      reply += `• **${s.name}** (${s.category}) · Rs. ${s.basePrice.toLocaleString()}\n`
    }
    reply += `\n`
  }

  if (articleResult.articles.length > 0) {
    reply += `**Recommended Reading:**\n`
    for (const art of articleResult.articles.slice(0, 2)) {
      reply += `• ${art.title}\n`
    }
  }

  return {
    reply,
    triage,
    suggestedDoctors: doctorResult.doctors.slice(0, 3),
    suggestedDiagnostics: diagnosticResult.services.slice(0, 2),
    suggestedArticles: articleResult.articles.slice(0, 2),
    isEmergency: false,
    disclaimer: CLINICAL_DISCLAIMER,
  }
}
