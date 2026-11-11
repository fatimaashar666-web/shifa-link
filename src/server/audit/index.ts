/**
 * Audit event writer — ADR-10.
 *
 * Every sensitive operation MUST call `writeAuditEvent`.
 * This function is intentionally non-blocking (fire-and-forget) but
 * logs failures so they are visible in monitoring.
 */
import { db } from '@/server/db'

/** Maps to the Prisma `ActorType` enum. */
export type AuditActorType = 'USER' | 'AGENT' | 'SYSTEM' | 'WORKER'

export interface WriteAuditEventParams {
  /** Type of entity performing the action — matches Prisma ActorType enum. */
  actorType: AuditActorType
  /** UUID of the user, if known. */
  actorId?: string
  /**
   * Dot-namespaced action identifier, e.g. `auth.login`, `booking.cancel`.
   * Follow the pattern <domain>.<verb>[.<qualifier>].
   */
  action: string
  /** The type of entity being acted on, e.g. `User`, `Appointment`. */
  entityType: string
  /** The UUID of the entity being acted on, if applicable. */
  entityId?: string
  /** UUID of the organization context, if applicable. */
  organizationId?: string
  /** Free-form JSON metadata (non-PII only). */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: Record<string, any>
  /** Caller IP address, used for security investigations. */
  ipAddress?: string
}

/**
 * Write a structured audit event to PostgreSQL.
 *
 * Usage:
 * ```ts
 * writeAuditEvent({ actorType: 'user', actorId: userId, action: 'auth.login', entityType: 'User', entityId: userId })
 * ```
 */
export function writeAuditEvent(params: WriteAuditEventParams): void {
  db.auditEvent
    .create({
      data: {
        actorType: params.actorType,
        actorId: params.actorId ?? null,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId ?? null,
        organizationId: params.organizationId ?? null,
        metadata: params.metadata ?? {},
        ipAddress: params.ipAddress ?? null,
      },
    })
    .catch((err: unknown) => {
      // Audit failures must never crash the caller — log and continue.
      console.error('[audit] Failed to write audit event', {
        action: params.action,
        entityType: params.entityType,
        error: err instanceof Error ? err.message : String(err),
      })
    })
}
