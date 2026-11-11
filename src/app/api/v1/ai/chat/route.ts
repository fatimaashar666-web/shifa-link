/**
 * POST /api/v1/ai/chat
 *
 * Endpoint for conversational patient support and pre-triage.
 * Executes through ADR-05 safe typed tools without direct database access.
 */
import { NextRequest } from 'next/server'
import { z } from 'zod'
import { runSupportAgent } from '@/server/ai/agent'
import { getSession } from '@/server/auth/session'
import { writeAuditEvent } from '@/server/audit'
import { badRequest, internalError } from '@/lib/errors'

export const ChatRequestSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant', 'system']),
      content: z.string().min(1).max(2000),
    })
  ).min(1),
  locale: z.string().optional().default('en'),
})

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return badRequest('Request body must be valid JSON.')
  }

  const parsed = ChatRequestSchema.safeParse(body)
  if (!parsed.success) {
    return badRequest('Invalid message payload.')
  }

  // Session is optional: authenticated or guest visitors can both use pre-triage
  const session = await getSession(request)
  const userId = session?.userId
  const ipAddress =
    request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? undefined

  try {
    const response = await runSupportAgent({
      messages: parsed.data.messages,
      locale: parsed.data.locale,
      userId,
    })

    // Log AI interaction audit event
    writeAuditEvent({
      actorType: 'AGENT',
      actorId: userId ?? undefined,
      action: 'ai.chat_interaction',
      entityType: 'AiSession',
      metadata: {
        isEmergency: response.isEmergency,
        urgencyLevel: response.triage?.urgencyLevel,
        specialtyRecommended: response.triage?.recommendedSpecialtySlug,
        messageCount: parsed.data.messages.length,
      },
      ipAddress,
    })

    return Response.json(response, { status: 200 })
  } catch (err) {
    console.error('[POST /api/v1/ai/chat] Error:', err)
    return internalError('AI support is temporarily unavailable.')
  }
}
