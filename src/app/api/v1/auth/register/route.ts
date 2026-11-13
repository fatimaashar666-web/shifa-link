/**
 * POST /api/v1/auth/register
 *
 * Register a new patient account.
 *
 * Request body: { name, email, password, dateOfBirth?, gender?, bloodGroup?, phone? }
 * Success 201:  { userId: string; email: string }
 * Error 409:    Email already registered
 * Error 422:    Zod validation failure
 */
import { type NextRequest } from 'next/server'

import { RegisterSchema, registerPatient, AuthError } from '@/server/services/auth.service'
import { isEmailDeliveryConfigured, sendVerificationEmail } from '@/server/email/mailer'
import { validationError, conflict, internalError } from '@/lib/errors'
import { locales, type Locale } from '@/i18n/routing'

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

  if (!isEmailDeliveryConfigured()) {
    return Response.json(
      {
        code: 'EMAIL_NOT_CONFIGURED',
        message: 'Email verification is temporarily unavailable. Please configure the SMTP email settings.',
      },
      { status: 503 },
    )
  }

  // 3. Register
  try {
    const { userId, email, verificationToken } = await registerPatient(parsed.data, ipAddress)
    const locale: Locale = locales.includes(parsed.data.locale as Locale)
      ? (parsed.data.locale as Locale)
      : 'en'
    const verificationUrl = new URL(
      `/${locale}/verify-email?token=${encodeURIComponent(verificationToken)}`,
      request.url,
    ).toString()

    await sendVerificationEmail({ to: email, name: parsed.data.name, verificationUrl })

    return Response.json({ userId, email, verificationRequired: true }, { status: 201 })
  } catch (err) {
    if (err instanceof AuthError && err.code === 'EMAIL_TAKEN') {
      return conflict(err.message)
    }
    console.error('[POST /api/v1/auth/register]', err)
    return internalError()
  }
}
