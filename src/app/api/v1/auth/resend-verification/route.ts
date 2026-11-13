import { type NextRequest } from 'next/server'

import { requireAuth } from '@/server/auth/rbac'
import { createEmailVerificationRequest, getMe } from '@/server/services/auth.service'
import { isEmailDeliveryConfigured, sendVerificationEmail } from '@/server/email/mailer'
import { internalError, badRequest } from '@/lib/errors'
import { locales, type Locale } from '@/i18n/routing'

export async function POST(request: NextRequest) {
  const guard = await requireAuth(request)
  if (!guard.ok) return guard.response

  if (!isEmailDeliveryConfigured()) {
    return badRequest('Email verification is not configured. Please contact support.')
  }

  let body: { locale?: string } = {}
  try {
    body = (await request.json()) as { locale?: string }
  } catch {
    // The locale is optional, so an empty request body is valid.
  }

  try {
    const requestData = await createEmailVerificationRequest(guard.session.userId)
    if (!requestData) {
      const profile = await getMe(guard.session.userId)
      if (!profile) return badRequest('User account not found.')
      return Response.json({ sent: false, alreadyVerified: true }, { status: 200 })
    }

    const locale: Locale = locales.includes(body.locale as Locale)
      ? (body.locale as Locale)
      : 'en'
    const verificationUrl = new URL(
      `/${locale}/verify-email?token=${encodeURIComponent(requestData.verificationToken)}`,
      request.url,
    ).toString()

    await sendVerificationEmail({
      to: requestData.email,
      name: requestData.name,
      verificationUrl,
    })

    return Response.json({ sent: true }, { status: 200 })
  } catch (err) {
    console.error('[POST /api/v1/auth/resend-verification]', err)
    return internalError('Unable to send the verification email. Please try again.')
  }
}
