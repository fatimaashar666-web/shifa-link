/** POST /api/v1/auth/change-password */
import { type NextRequest } from 'next/server'

import { requireAuth } from '@/server/auth/rbac'
import {
  AuthError,
  ChangePasswordSchema,
  changePassword,
} from '@/server/services/auth.service'
import { badRequest, internalError, validationError } from '@/lib/errors'

export async function POST(request: NextRequest) {
  const guard = await requireAuth(request)
  if (!guard.ok) return guard.response

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return badRequest('Request body must be valid JSON.')
  }

  const parsed = ChangePasswordSchema.safeParse(body)
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
    await changePassword(guard.session.userId, parsed.data, ipAddress)
    return Response.json({ message: 'Your password has been changed successfully.' }, { status: 200 })
  } catch (error) {
    if (error instanceof AuthError && error.code === 'INVALID_CURRENT_PASSWORD') {
      return badRequest(error.message)
    }
    console.error('[POST /api/v1/auth/change-password]', error)
    return internalError()
  }
}
