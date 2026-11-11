/**
 * M4: Doctor Discovery & Appointments API Contract Types.
 *
 * Endpoints:
 *   GET   /api/v1/doctors                  — Search and filter doctors
 *   GET   /api/v1/doctors/:id              — Doctor public profile details
 *   GET   /api/v1/doctors/:id/availability — Computed free slots for date
 *   POST  /api/v1/appointments             — Book appointment (transactional slot locking)
 *   GET   /api/v1/appointments            — List authenticated user's appointments
 *   GET   /api/v1/appointments/:id         — Appointment details
 *   PATCH /api/v1/appointments/:id         — Cancel or update status
 */

export interface SpecialtySummary {
  id: string
  name: string
  slug: string
  icon?: string | null
  isPrimary?: boolean
}

export interface QualificationSummary {
  degree: string
  institution: string
  year: number
}

export interface LocationSummary {
  id: string
  name: string
  address?: string | null
  city: string
  isVirtual: boolean
}

export interface DoctorCardSummary {
  id: string
  fullName: string
  licenseNumber: string
  consultationFee: number
  bio?: string | null
  specialties: SpecialtySummary[]
  languages: string[]
  locations: LocationSummary[]
}

export interface DoctorSearchResponse {
  doctors: DoctorCardSummary[]
  total: number
  page: number
  totalPages: number
}

export interface TimeSlot {
  startTime: string // ISO UTC or HH:mm
  endTime: string   // ISO UTC or HH:mm
  isAvailable: boolean
  locationId: string
  locationName: string
  isVirtual: boolean
}

export interface DoctorAvailabilityResponse {
  doctorId: string
  date: string // YYYY-MM-DD
  slots: TimeSlot[]
}

export interface CreateAppointmentRequest {
  doctorId: string
  locationId: string
  scheduledAt: string // ISO-8601 UTC string
  appointmentType: 'IN_PERSON' | 'VIDEO'
  reason?: string
  symptoms?: string
}

export interface AppointmentSummary {
  id: string
  status: 'REQUESTED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
  appointmentType: 'IN_PERSON' | 'VIDEO'
  scheduledAt: string
  endAt: string
  reason?: string | null
  doctor: {
    id: string
    fullName: string
    consultationFee: number
    primarySpecialty?: string
  }
  location: {
    id: string
    name: string
    address?: string | null
    city: string
    isVirtual: boolean
  }
  cancellationReason?: string | null
  createdAt: string
}
