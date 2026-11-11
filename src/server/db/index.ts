/**
 * Prisma Client singleton — safe for Next.js hot-reload in development.
 * Import `db` wherever you need database access in server code.
 *
 * IMPORTANT: Never import this inside `src/server/ai/`.
 * AI agents must call service functions, not Prisma directly (ADR-05).
 */
import 'server-only'

import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

declare global {
  var prisma: PrismaClient | undefined
  var pgPool: Pool | undefined
}

const connectionString = process.env.DATABASE_URL

const pool = globalThis.pgPool ?? new Pool({ connectionString })
if (process.env.NODE_ENV !== 'production') {
  globalThis.pgPool = pool
}

const adapter = new PrismaPg(pool)

export const db: PrismaClient =
  globalThis.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = db
}
