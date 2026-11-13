/**
 * POST /api/v1/auth/register-doctor
 *
 * Creates an immediately usable doctor account. Credential review remains
 * pending and controls public verification/provider visibility.
 */
import { NextRequest } from 'next/server'

import {
  AuthError,
  createSession,
  DoctorRegisterSchema,
  registerDoctor,
} from '@/server/services/auth.service'
import { buildSessionCookie } from '@/server/auth/session'
import { conflict, internalError, validationError } from '@/lib/errors'

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ code: 'BAD_REQUEST', message: 'Request body must be valid JSON.' }, { status: 400 })
  }

  const parsed = DoctorRegisterSchema.safeParse(body)
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {}
    for (const issue of parsed.error.issues) {
      const key = issue.path.join('.') || '_'
      fieldErrors[key] = [...(fieldErrors[key] ?? []), issue.message]
    }
    return validationError(fieldErrors)
  }

  const ipAddress = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? undefined

  try {
    const { userId, email } = await registerDoctor(parsed.data, ipAddress)
    const { token } = await createSession({
      userId,
      email,
      roles: ['doctor'],
      organizationId: null,
    })

    return Response.json(
      { userId, email, verificationRequired: false, roles: ['doctor'] },
      { status: 201, headers: { 'Set-Cookie': buildSessionCookie(token) } },
    )
  } catch (err) {
    if (err instanceof AuthError && err.code === 'EMAIL_TAKEN') {
      return conflict(err.message)
    }
    console.error('[POST /api/v1/auth/register-doctor]', err)
    return internalError()
  }
}
