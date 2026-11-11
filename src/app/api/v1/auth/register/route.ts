/**
 * POST /api/v1/auth/register
 *
 * Register a new patient account.
 *
 * Request body: { name: string; email: string; password: string }
 * Success 201:  { userId: string; email: string }
 * Error 409:    Email already registered
 * Error 422:    Zod validation failure
 */
import { type NextRequest } from 'next/server'

import { RegisterSchema, registerPatient, createSession, AuthError } from '@/server/services/auth.service'
import { buildSessionCookie } from '@/server/auth/session'
import { validationError, conflict, internalError } from '@/lib/errors'

export async function POST(request: NextRequest) {
  // 1. Parse body
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ code: 'BAD_REQUEST', message: 'Request body must be valid JSON.' }, { status: 400 })
  }

  // 2. Validate with Zod
  const parsed = RegisterSchema.safeParse(body)
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {}
    for (const issue of parsed.error.issues) {
      const key = issue.path.join('.') || '_'
      fieldErrors[key] = [...(fieldErrors[key] ?? []), issue.message]
    }
    return validationError(fieldErrors)
  }

  const ipAddress = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? undefined

  // 3. Register
  try {
    const { session, userId } = await registerPatient(parsed.data, ipAddress)

    // 4. Issue session cookie
    const { token } = await createSession(session)
    return Response.json(
      { userId, email: session.email },
      {
        status: 201,
        headers: { 'Set-Cookie': buildSessionCookie(token) },
      },
    )
  } catch (err) {
    if (err instanceof AuthError && err.code === 'EMAIL_TAKEN') {
      return conflict(err.message)
    }
    console.error('[POST /api/v1/auth/register]', err)
    return internalError()
  }
}
