/** POST /api/v1/auth/reset-password */
import { type NextRequest } from 'next/server'

import { ResetPasswordSchema, resetPassword } from '@/server/services/auth.service'
import { badRequest, internalError, validationError } from '@/lib/errors'

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ code: 'BAD_REQUEST', message: 'Request body must be valid JSON.' }, { status: 400 })
  }

  const parsed = ResetPasswordSchema.safeParse(body)
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {}
    for (const issue of parsed.error.issues) {
      const key = issue.path.join('.') || '_'
      fieldErrors[key] = [...(fieldErrors[key] ?? []), issue.message]
    }
    return validationError(fieldErrors)
  }

  try {
    const updated = await resetPassword(parsed.data)
    if (!updated) return badRequest('This password reset link is invalid or has expired.')
    return Response.json({ message: 'Your password has been reset successfully.' }, { status: 200 })
  } catch (error) {
    console.error('[POST /api/v1/auth/reset-password]', error)
    return internalError()
  }
}
