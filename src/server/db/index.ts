/**
 * Prisma Client singleton — safe for Next.js hot-reload in development.
 * Import `db` wherever you need database access in server code.
 *
 * IMPORTANT: Never import this inside `src/server/ai/`.
 * AI agents must call service functions, not Prisma directly (ADR-05).
 */
import 'server-only'

import { PrismaClient } from '@prisma/client'

declare global {
  var prisma: PrismaClient | undefined
}

export const db: PrismaClient =
  globalThis.prisma ?? new PrismaClient({ log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'] })

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = db
}
