/**
 * POST /api/v1/auth/login
 *
 * Authenticate with email + password.
 *
 * Request body: { email: string; password: string }
 * Success 200:  { userId: string; email: string; roles: string[] }
 * Error 401:    Invalid credentials
 * Error 422:    Zod validation failure
 */
import { type NextRequest } from 'next/server'

import { LoginSchema, login, createSession, AuthError } from '@/server/services/auth.service'
import { buildSessionCookie } from '@/server/auth/session'
import { validationError, unauthorized, internalError } from '@/lib/errors'

export async function POST(request: NextRequest) {
  // 1. Parse body
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ code: 'BAD_REQUEST', message: 'Request body must be valid JSON.' }, { status: 400 })
  }

  // 2. Validate
  const parsed = LoginSchema.safeParse(body)
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {}
    for (const issue of parsed.error.issues) {
      const key = issue.path.join('.') || '_'
      fieldErrors[key] = [...(fieldErrors[key] ?? []), issue.message]
    }
    return validationError(fieldErrors)
  }

  const ipAddress = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? undefined

  // 3. Authenticate
  try {
    const { session, userId } = await login(parsed.data, ipAddress)

    // 4. Issue session cookie
    const { token } = await createSession(session)
    return Response.json(
      { userId, email: session.email, roles: session.roles },
      {
        status: 200,
        headers: { 'Set-Cookie': buildSessionCookie(token) },
      },
    )
  } catch (err) {
    if (err instanceof AuthError) {
      return unauthorized(err.message)
    }
    console.error('[POST /api/v1/auth/login]', err)
    return internalError()
  }
}
