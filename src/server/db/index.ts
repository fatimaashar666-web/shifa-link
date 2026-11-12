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

function getRuntimeConnectionString() {
  const value = process.env.DATABASE_URL
  if (!value) return value

  try {
    const url = new URL(value)

    // Supabase's shared pooler on port 6543 uses transaction pooling.
    // Prisma must disable prepared statements for this connection mode.
    if (url.hostname.endsWith('.pooler.supabase.com') && url.port === '6543') {
      url.searchParams.set('pgbouncer', 'true')
    }

    return url.toString()
  } catch {
    return value
  }
}

const connectionString = getRuntimeConnectionString()

const pool = globalThis.pgPool ?? new Pool({
  connectionString,
  max: 5,
  connectionTimeoutMillis: 10_000,
  idleTimeoutMillis: 30_000,
  keepAlive: true,
})
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
