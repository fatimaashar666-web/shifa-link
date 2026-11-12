/** POST /api/v1/auth/forgot-password */
import { type NextRequest } from 'next/server'

import { ForgotPasswordSchema, requestPasswordReset } from '@/server/services/auth.service'
import { internalError, validationError } from '@/lib/errors'

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ code: 'BAD_REQUEST', message: 'Request body must be valid JSON.' }, { status: 400 })
  }

  const parsed = ForgotPasswordSchema.safeParse(body)
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {}
    for (const issue of parsed.error.issues) {
      const key = issue.path.join('.') || '_'
      fieldErrors[key] = [...(fieldErrors[key] ?? []), issue.message]
    }
    return validationError(fieldErrors)
  }

  try {
    const token = await requestPasswordReset(parsed.data.email)
    const response: { message: string; resetUrl?: string } = {
      message: 'If an account exists for that email, password reset instructions have been prepared.',
    }

    // Until SMTP/email delivery is configured, expose a local-only link for development testing.
    if (token && process.env.NODE_ENV !== 'production') {
      const locale = parsed.data.locale ?? 'en'
      const resetUrl = new URL(`/${locale}/reset-password`, request.url)
      resetUrl.searchParams.set('token', token)
      response.resetUrl = resetUrl.toString()
      console.info('[password-reset] Development reset URL:', response.resetUrl)
    }

    return Response.json(response, { status: 200 })
  } catch (error) {
    console.error('[POST /api/v1/auth/forgot-password]', error)
    return internalError()
  }
}
