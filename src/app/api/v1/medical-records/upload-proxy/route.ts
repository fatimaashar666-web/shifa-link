/**
 * POST /api/v1/medical-records/upload-proxy
 *
 * Same-origin upload fallback for environments where browser PUT requests to
 * the S3-compatible bucket are blocked by bucket CORS configuration.
 */
import { NextRequest } from 'next/server'

import { requireRole } from '@/server/auth/rbac'
import { badRequest, forbidden, internalError } from '@/lib/errors'
import { uploadObjectToStorage, validateFileSize, validateMimeType } from '@/server/storage'
import * as userRepo from '@/server/repositories/user.repository'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const guard = await requireRole(request, 'patient')
  if (!guard.ok) return guard.response

  try {
    const formData = await request.formData()
    const file = formData.get('file')
    const storageKey = formData.get('storageKey')

    if (!(file instanceof File) || typeof storageKey !== 'string' || !storageKey) {
      return badRequest('A file and storage key are required.')
    }

    if (!validateMimeType(file.type)) {
      return badRequest('Unsupported file type.')
    }

    if (!validateFileSize(file.size)) {
      return badRequest('File exceeds the 50MB limit.')
    }

    const user = await userRepo.findById(guard.session.userId)
    const patientId = user?.patientProfile?.id
    if (!patientId || !storageKey.startsWith(`records/${patientId}/`)) {
      return forbidden('You cannot upload to this storage location.')
    }

    await uploadObjectToStorage({
      storageKey,
      mimeType: file.type,
      body: Buffer.from(await file.arrayBuffer()),
    })

    return Response.json({ uploaded: true }, { status: 200 })
  } catch (err) {
    console.error('[POST /api/v1/medical-records/upload-proxy]', err)
    return internalError()
  }
}
