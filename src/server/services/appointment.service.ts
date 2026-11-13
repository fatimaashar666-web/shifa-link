/**
 * Appointment service — transactional appointment creation, status lifecycle,
 * authorization checks, and audit logging.
 */
import 'server-only'

import { z } from 'zod'
import { AppointmentStatus, AppointmentType } from '@prisma/client'
import * as appointmentRepo from '@/server/repositories/appointment.repository'
import * as userRepo from '@/server/repositories/user.repository'
import { createNotification } from '@/server/repositories/notification.repository'
import { writeAuditEvent } from '@/server/audit'

export const CreateAppointmentSchema = z.object({
  doctorId: z.string().uuid('Invalid doctor ID'),
  // Location IDs are application identifiers stored as strings. Some seeded
  // locations use stable human-readable IDs rather than UUIDs.
  locationId: z.string().trim().min(1, 'Invalid location ID'),
  scheduledAt: z.string().datetime('Must be a valid ISO datetime'),
  appointmentType: z.enum(['IN_PERSON', 'VIDEO']).default('IN_PERSON'),
  reason: z.string().max(500).optional(),
  symptoms: z.string().max(1000).optional(),
})

export type CreateAppointmentInput = z.infer<typeof CreateAppointmentSchema>

export class AppointmentError extends Error {
  constructor(
    public readonly code: 'SLOT_CONFLICT' | 'NOT_FOUND' | 'FORBIDDEN' | 'INVALID_STATE',
    message: string,
  ) {
    super(message)
    this.name = 'AppointmentError'
  }
}

/**
 * Book an appointment transactionally.
 */
export async function bookAppointment(
  userId: string,
  input: CreateAppointmentInput,
  ipAddress?: string,
) {
  // 1. Resolve patient profile
  const user = await userRepo.findById(userId)
  if (!user) throw new AppointmentError('FORBIDDEN', 'User not found')

  let patientId = user.patientProfile?.id
  if (!patientId) {
    const newProfile = await userRepo.createPatientProfile({
      userId: user.id,
      fullName: user.email.split('@')[0],
    })
    patientId = newProfile.id
  }

  const scheduledAt = new Date(input.scheduledAt)
  // Default appointment duration 30 minutes
  const endAt = new Date(scheduledAt.getTime() + 30 * 60 * 1000)

  // 2. Transactional creation with conflict prevention
  try {
    const appointment = await appointmentRepo.createAppointment({
      patientId,
      doctorId: input.doctorId,
      locationId: input.locationId,
      appointmentType: input.appointmentType as AppointmentType,
      scheduledAt,
      endAt,
      reason: input.reason,
      symptoms: input.symptoms,
    })

    // 3. Audit logging (ADR-10)
    writeAuditEvent({
      actorType: 'USER',
      actorId: userId,
      action: 'appointment.created',
      entityType: 'Appointment',
      entityId: appointment.id,
      ipAddress,
      metadata: {
        doctorId: input.doctorId,
        scheduledAt: input.scheduledAt,
        type: input.appointmentType,
      },
    })

    // 4. In-app notifications
    await createNotification({
      userId,
      title: 'Appointment Booked',
      message: `Your appointment with ${appointment.doctor.fullName} is confirmed for ${scheduledAt.toUTCString()}.`,
      type: 'APPOINTMENT_CONFIRMED',
      entityType: 'Appointment',
      entityId: appointment.id,
    })

    if (appointment.doctor.userId) {
      await createNotification({
        userId: appointment.doctor.userId,
        title: 'New Appointment Booking',
        message: `New booking received for ${scheduledAt.toUTCString()}.`,
        type: 'APPOINTMENT_REQUESTED',
        entityType: 'Appointment',
        entityId: appointment.id,
      })
    }

    return appointment
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'SLOT_CONFLICT') {
      throw new AppointmentError('SLOT_CONFLICT', 'This time slot is already booked. Please choose another time.')
    }
    throw err
  }
}

/**
 * Fetch all appointments belonging to the authenticated user (as patient or doctor).
 */
export async function getUserAppointments(userId: string) {
  const user = await userRepo.findById(userId)
  if (!user) return []

  if (user.patientProfile) {
    const list = await appointmentRepo.findAppointmentsByPatient(user.patientProfile.id)
    return list.map((apt) => ({
      id: apt.id,
      status: apt.status,
      appointmentType: apt.appointmentType,
      scheduledAt: apt.scheduledAt.toISOString(),
      endAt: apt.endAt.toISOString(),
      reason: apt.reason,
      doctor: {
        id: apt.doctor.id,
        fullName: apt.doctor.fullName,
        consultationFee: Number(apt.doctor.consultationFee),
        primarySpecialty: apt.doctor.specialties[0]?.specialty.name,
      },
      location: {
        id: apt.location.id,
        name: apt.location.name,
        address: apt.location.address,
        city: apt.location.city,
        isVirtual: apt.location.isVirtual,
      },
      cancellationReason: apt.cancellationReason,
      createdAt: apt.createdAt.toISOString(),
    }))
  }

  if (user.doctorProfile) {
    const list = await appointmentRepo.findAppointmentsByDoctor(user.doctorProfile.id)
    return list.map((apt) => ({
      id: apt.id,
      status: apt.status,
      appointmentType: apt.appointmentType,
      scheduledAt: apt.scheduledAt.toISOString(),
      endAt: apt.endAt.toISOString(),
      reason: apt.reason,
      patient: {
        id: apt.patient.id,
        fullName: apt.patient.fullName,
      },
      location: {
        id: apt.location.id,
        name: apt.location.name,
        city: apt.location.city,
        isVirtual: apt.location.isVirtual,
      },
      createdAt: apt.createdAt.toISOString(),
    }))
  }

  return []
}

/**
 * Cancel an appointment with authorization check and audit record.
 */
export async function cancelAppointment(
  appointmentId: string,
  userId: string,
  reason: string,
  ipAddress?: string,
) {
  const appointment = await appointmentRepo.findAppointmentById(appointmentId)
  if (!appointment) throw new AppointmentError('NOT_FOUND', 'Appointment not found')

  const user = await userRepo.findById(userId)
  const isPatientOwner = user?.patientProfile?.id === appointment.patientId
  const isDoctorOwner = user?.doctorProfile?.id === appointment.doctorId
  const isAdmin = user?.userRoles.some((r) => r.role.name === 'super_admin')

  if (!isPatientOwner && !isDoctorOwner && !isAdmin) {
    throw new AppointmentError('FORBIDDEN', 'You do not have permission to cancel this appointment')
  }

  if (appointment.status === AppointmentStatus.CANCELLED) {
    throw new AppointmentError('INVALID_STATE', 'This appointment has already been cancelled')
  }

  if (appointment.status === AppointmentStatus.COMPLETED) {
    throw new AppointmentError('INVALID_STATE', 'Completed appointments cannot be cancelled')
  }

  const updated = await appointmentRepo.updateAppointmentStatus(
    appointmentId,
    AppointmentStatus.CANCELLED,
    {
      cancellationReason: reason,
      cancelledBy: userId,
    },
  )

  writeAuditEvent({
    actorType: 'USER',
    actorId: userId,
    action: 'appointment.cancelled',
    entityType: 'Appointment',
    entityId: appointmentId,
    ipAddress,
    metadata: { reason },
  })

  // Notify counterparty
  const notifyRecipient = isPatientOwner ? appointment.doctor.userId : appointment.patient.userId
  if (notifyRecipient) {
    await createNotification({
      userId: notifyRecipient,
      title: 'Appointment Cancelled',
      message: `The appointment scheduled for ${appointment.scheduledAt.toUTCString()} has been cancelled.`,
      type: 'APPOINTMENT_CANCELLED',
      entityType: 'Appointment',
      entityId: appointmentId,
    })
  }

  return updated
}
