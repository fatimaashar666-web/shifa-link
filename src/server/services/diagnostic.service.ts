/**
 * Diagnostic service — lab/radiology service search and booking lifecycle.
 */
import 'server-only'

import { z } from 'zod'
import { DiagnosticBookingStatus } from '@prisma/client'
import * as diagRepo from '@/server/repositories/diagnostic.repository'
import * as userRepo from '@/server/repositories/user.repository'
import { createNotification } from '@/server/repositories/notification.repository'
import { writeAuditEvent } from '@/server/audit'

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

export const BookDiagnosticSchema = z.object({
  serviceId: z.string().uuid('Invalid service ID'),
  organizationId: z.string().uuid('Invalid organization ID'),
  scheduledAt: z.string().datetime('Must be a valid ISO datetime'),
  isHomeCollection: z.boolean().default(false),
  collectionAddress: z.string().max(500).optional(),
  notes: z.string().max(1000).optional(),
})

export type BookDiagnosticInput = z.infer<typeof BookDiagnosticSchema>

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

export class DiagnosticError extends Error {
  constructor(
    public readonly code: 'NOT_FOUND' | 'FORBIDDEN' | 'INVALID_STATE' | 'UNAVAILABLE',
    message: string,
  ) {
    super(message)
    this.name = 'DiagnosticError'
  }
}

// ---------------------------------------------------------------------------
// Service layer
// ---------------------------------------------------------------------------

/**
 * Search diagnostic services — public, no auth required.
 */
export async function searchServices(params: diagRepo.SearchServicesParams) {
  return diagRepo.searchDiagnosticServices(params)
}

/**
 * Book a diagnostic test for the authenticated user.
 * Auto-provisions a PatientProfile if the user doesn't have one yet.
 */
export async function bookDiagnosticTest(
  userId: string,
  input: BookDiagnosticInput,
  ipAddress?: string,
) {
  // 1. Validate input
  const parsed = BookDiagnosticSchema.parse(input)

  // 2. Resolve patient profile
  const user = await userRepo.findById(userId)
  if (!user) throw new DiagnosticError('FORBIDDEN', 'User not found')

  let patientId = user.patientProfile?.id
  if (!patientId) {
    const newProfile = await userRepo.createPatientProfile({
      userId,
      fullName: user.email.split('@')[0],
    })
    patientId = newProfile.id
  }

  // 3. Verify service exists
  const service = await diagRepo.getDiagnosticServiceById(parsed.serviceId)
  if (!service) throw new DiagnosticError('NOT_FOUND', 'Diagnostic service not found')

  // 4. Check org-service availability linkage
  const locationLink = service.locations.find(
    (loc) => loc.organizationId === parsed.organizationId && loc.isAvailable,
  )
  if (!locationLink) {
    throw new DiagnosticError('UNAVAILABLE', 'Service not available at the selected organization')
  }

  // 5. Create booking
  const booking = await diagRepo.createDiagnosticBooking({
    patientId,
    serviceId: parsed.serviceId,
    organizationId: parsed.organizationId,
    scheduledAt: new Date(parsed.scheduledAt),
    isHomeCollection: parsed.isHomeCollection,
    collectionAddress: parsed.collectionAddress ?? null,
    notes: parsed.notes ?? null,
    totalAmount: Number(locationLink.price ?? service.basePrice),
  })

  // 6. Fire audit event
  writeAuditEvent({
    actorType: 'USER',
    actorId: userId,
    action: 'diagnostic.booked',
    entityType: 'DiagnosticBooking',
    entityId: booking.id,
    metadata: {
      bookingNumber: booking.bookingNumber,
      serviceId: parsed.serviceId,
      organizationId: parsed.organizationId,
    },
    ipAddress,
  })

  // 7. Send in-app notification
  createNotification({
    userId,
    type: 'DIAGNOSTIC_BOOKED',
    title: 'Diagnostic test booked',
    message: `Your booking for "${service.name}" has been confirmed. Ref: ${booking.bookingNumber}`,
    entityType: 'DiagnosticBooking',
    entityId: booking.id,
  }).catch(() => void 0)

  return booking
}

/**
 * Cancel a diagnostic booking (patient, org admin, or super_admin).
 */
export async function cancelDiagnosticBooking(
  bookingId: string,
  userId: string,
  reason?: string,
  ipAddress?: string,
) {
  const booking = await diagRepo.getDiagnosticBookingById(bookingId)
  if (!booking) throw new DiagnosticError('NOT_FOUND', 'Booking not found')

  // Ownership check: patient or admin
  const isPatientOwner = booking.patient.userId === userId
  if (!isPatientOwner) {
    throw new DiagnosticError('FORBIDDEN', 'You do not have permission to cancel this booking')
  }

  if (booking.status === DiagnosticBookingStatus.CANCELLED) {
    throw new DiagnosticError('INVALID_STATE', 'Booking is already cancelled')
  }

  if (booking.status === DiagnosticBookingStatus.COMPLETED) {
    throw new DiagnosticError('INVALID_STATE', 'Cannot cancel a completed booking')
  }

  const updated = await diagRepo.updateDiagnosticBookingStatus(
    bookingId,
    DiagnosticBookingStatus.CANCELLED,
    reason ?? 'Cancelled by patient',
    userId,
  )

  writeAuditEvent({
    actorType: 'USER',
    actorId: userId,
    action: 'diagnostic.cancelled',
    entityType: 'DiagnosticBooking',
    entityId: bookingId,
    metadata: { reason: reason ?? 'Cancelled by patient' },
    ipAddress,
  })

  createNotification({
    userId,
    type: 'DIAGNOSTIC_BOOKED',
    title: 'Diagnostic booking cancelled',
    message: `Your booking for "${booking.service.name}" has been cancelled.`,
    entityType: 'DiagnosticBooking',
    entityId: bookingId,
  }).catch(() => void 0)

  return updated
}

/**
 * List diagnostic bookings for the authenticated user (patient view).
 */
export async function getUserDiagnosticBookings(userId: string) {
  const user = await userRepo.findById(userId)
  if (!user?.patientProfile) return []
  return diagRepo.listPatientDiagnosticBookings(user.patientProfile.id)
}
