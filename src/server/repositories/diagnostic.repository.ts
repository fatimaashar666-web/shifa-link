/**
 * Diagnostic repository — queries for lab/radiology services and test bookings.
 */
import 'server-only'

import { db } from '@/server/db'
import { DiagnosticBookingStatus, OrgType, Prisma } from '@prisma/client'

export interface SearchServicesParams {
  type?: OrgType
  category?: string
  query?: string
  limit?: number
}

export async function searchDiagnosticServices(params: SearchServicesParams) {
  const where: Prisma.DiagnosticServiceWhereInput = {}

  if (params.type) {
    where.type = params.type
  }

  if (params.category) {
    where.category = { equals: params.category, mode: 'insensitive' }
  }

  if (params.query) {
    const q = params.query.trim()
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
      { category: { contains: q, mode: 'insensitive' } },
    ]
  }

  return db.diagnosticService.findMany({
    where,
    include: {
      locations: {
        include: { organization: true },
        where: { isAvailable: true },
      },
    },
    take: params.limit ?? 50,
    orderBy: { name: 'asc' },
  })
}

export async function getDiagnosticServiceById(id: string) {
  return db.diagnosticService.findUnique({
    where: { id },
    include: {
      locations: {
        include: { organization: true },
        where: { isAvailable: true },
      },
    },
  })
}

export interface CreateBookingData {
  patientId: string
  serviceId: string
  organizationId: string
  scheduledAt: Date
  isHomeCollection?: boolean
  collectionAddress?: string | null
  notes?: string | null
  totalAmount: number
}

export async function createDiagnosticBooking(data: CreateBookingData) {
  const bookingNumber = `DIAG-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`

  return db.$transaction(async (tx) => {
    const booking = await tx.diagnosticBooking.create({
      data: {
        bookingNumber,
        patientId: data.patientId,
        serviceId: data.serviceId,
        organizationId: data.organizationId,
        scheduledAt: data.scheduledAt,
        isHomeCollection: data.isHomeCollection ?? false,
        collectionAddress: data.collectionAddress ?? null,
        notes: data.notes ?? null,
        totalAmount: data.totalAmount,
        status: DiagnosticBookingStatus.CONFIRMED,
      },
      include: {
        service: true,
        organization: true,
        patient: true,
      },
    })

    await tx.diagnosticBookingEvent.create({
      data: {
        bookingId: booking.id,
        status: DiagnosticBookingStatus.CONFIRMED,
        note: 'Booking confirmed by patient',
        actorId: data.patientId,
      },
    })

    return booking
  })
}

export async function getDiagnosticBookingById(id: string) {
  return db.diagnosticBooking.findUnique({
    where: { id },
    include: {
      service: true,
      organization: true,
      patient: true,
      events: { orderBy: { createdAt: 'asc' } },
      reports: { include: { fileObject: true } },
    },
  })
}

export async function listPatientDiagnosticBookings(patientId: string) {
  return db.diagnosticBooking.findMany({
    where: { patientId },
    include: {
      service: true,
      organization: true,
      reports: { include: { fileObject: true } },
    },
    orderBy: { scheduledAt: 'desc' },
  })
}

export async function listOrganizationDiagnosticBookings(organizationId: string) {
  return db.diagnosticBooking.findMany({
    where: { organizationId },
    include: {
      service: true,
      patient: true,
      reports: { include: { fileObject: true } },
    },
    orderBy: { scheduledAt: 'desc' },
  })
}

export async function updateDiagnosticBookingStatus(
  bookingId: string,
  status: DiagnosticBookingStatus,
  note?: string,
  actorId?: string,
) {
  return db.$transaction(async (tx) => {
    const updated = await tx.diagnosticBooking.update({
      where: { id: bookingId },
      data: {
        status,
        cancellationReason: status === DiagnosticBookingStatus.CANCELLED ? note : undefined,
        cancelledAt: status === DiagnosticBookingStatus.CANCELLED ? new Date() : undefined,
        cancelledBy: status === DiagnosticBookingStatus.CANCELLED ? actorId : undefined,
      },
      include: {
        service: true,
        patient: true,
        organization: true,
      },
    })

    await tx.diagnosticBookingEvent.create({
      data: {
        bookingId,
        status,
        note: note ?? null,
        actorId: actorId ?? null,
      },
    })

    return updated
  })
}
