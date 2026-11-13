/**
 * Email verification token repository.
 * Only a SHA-256 hash of the one-time token is stored.
 */
import 'server-only'

import { db } from '@/server/db'

export async function replaceForUser(userId: string, tokenHash: string, expiresAt: Date) {
  await db.emailVerificationToken.deleteMany({ where: { userId } })
  return db.emailVerificationToken.create({ data: { userId, tokenHash, expiresAt } })
}

export async function findValidByHash(tokenHash: string) {
  return db.emailVerificationToken.findFirst({
    where: { tokenHash, consumedAt: null, expiresAt: { gt: new Date() } },
    include: { user: true },
  })
}

export async function consume(id: string) {
  return db.emailVerificationToken.updateMany({
    where: { id, consumedAt: null },
    data: { consumedAt: new Date() },
  })
}

export async function deleteForUser(userId: string) {
  return db.emailVerificationToken.deleteMany({ where: { userId } })
}
