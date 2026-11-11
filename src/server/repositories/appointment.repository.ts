/**
 * Appointment repository — Prisma queries and mutations for appointments.
 */
import 'server-only'

import { db } from '@/server/db'
import { AppointmentStatus, AppointmentType } from '@prisma/client'

export interface CreateAppointmentInput {
  patientId: string
  doctorId: string
  locationId: string
  organizationId?: string | null
  appointmentType: AppointmentType
  scheduledAt: Date
  endAt: Date
  reason?: string | null
  symptoms?: string | null
}

/**
 * Check if a doctor already has an active appointment that overlaps with the requested time.
 */
export async function checkSlotConflict(
  doctorId: string,
  scheduledAt: Date,
  endAt: Date,
) {
  return db.appointment.findFirst({
    where: {
      doctorId,
      status: {
        in: [AppointmentStatus.CONFIRMED, AppointmentStatus.REQUESTED],
      },
      AND: [
        { scheduledAt: { lt: endAt } },
        { endAt: { gt: scheduledAt } },
      ],
    },
  })
}

/**
 * Create appointment inside a transaction with double-booking prevention.
 */
export async function createAppointment(data: CreateAppointmentInput) {
  return db.$transaction(async (tx) => {
    // 1. Conflict verification
    const existing = await tx.appointment.findFirst({
      where: {
        doctorId: data.doctorId,
        status: {
          in: [AppointmentStatus.CONFIRMED, AppointmentStatus.REQUESTED],
        },
        AND: [
          { scheduledAt: { lt: data.endAt } },
          { endAt: { gt: data.scheduledAt } },
        ],
      },
    })

    if (existing) {
      throw new Error('SLOT_CONFLICT')
    }

    // 2. Insert record
    return tx.appointment.create({
      data: {
        patientId: data.patientId,
        doctorId: data.doctorId,
        locationId: data.locationId,
        organizationId: data.organizationId ?? null,
        appointmentType: data.appointmentType,
        status: AppointmentStatus.CONFIRMED,
        scheduledAt: data.scheduledAt,
        endAt: data.endAt,
        reason: data.reason ?? null,
        symptoms: data.symptoms ?? null,
      },
      include: {
        doctor: {
          include: {
            specialties: { include: { specialty: true } },
          },
        },
        location: true,
        patient: true,
      },
    })
  })
}

/**
 * Retrieve appointment by ID with related doctor, location, and patient profile.
 */
export async function findAppointmentById(id: string) {
  return db.appointment.findUnique({
    where: { id },
    include: {
      doctor: {
        include: {
          specialties: { include: { specialty: true } },
        },
      },
      location: true,
      patient: true,
    },
  })
}

/**
 * List all appointments for a patient, ordered by schedule date descending.
 */
export async function findAppointmentsByPatient(patientId: string) {
  return db.appointment.findMany({
    where: { patientId },
    include: {
      doctor: {
        include: {
          specialties: { include: { specialty: true } },
        },
      },
      location: true,
    },
    orderBy: { scheduledAt: 'desc' },
  })
}

/**
 * List all appointments for a doctor.
 */
export async function findAppointmentsByDoctor(doctorId: string) {
  return db.appointment.findMany({
    where: { doctorId },
    include: {
      patient: true,
      location: true,
    },
    orderBy: { scheduledAt: 'desc' },
  })
}

/**
 * Update appointment status (e.g. Cancel, Complete, No Show).
 */
export async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus,
  metadata?: {
    cancellationReason?: string
    cancelledBy?: string
    notes?: string
  },
) {
  return db.appointment.update({
    where: { id },
    data: {
      status,
      cancellationReason: metadata?.cancellationReason,
      cancelledBy: metadata?.cancelledBy,
      cancelledAt: status === AppointmentStatus.CANCELLED ? new Date() : undefined,
      notes: metadata?.notes,
    },
    include: {
      doctor: true,
      patient: true,
      location: true,
    },
  })
}
