/**
 * Doctor repository — Prisma queries for DoctorProfile, Specialties,
 * Locations, and Availability.
 */
import 'server-only'

import { db } from '@/server/db'
import { DayOfWeek, Prisma } from '@prisma/client'

export interface SearchDoctorsParams {
  query?: string
  specialtySlug?: string
  city?: string
  language?: string
  isVirtual?: boolean
  maxFee?: number
  page?: number
  limit?: number
}

/**
 * Search doctors with multi-criteria filtering.
 * Strictly filters by VERIFIED status for public discovery.
 */
export async function searchDoctors(params: SearchDoctorsParams) {
  const page = Math.max(1, params.page ?? 1)
  const limit = Math.min(50, Math.max(1, params.limit ?? 10))
  const skip = (page - 1) * limit

  const where: Prisma.DoctorProfileWhereInput = {
    verificationStatus: 'VERIFIED',
  }

  if (params.query) {
    const q = params.query.trim()
    where.OR = [
      { fullName: { contains: q, mode: 'insensitive' } },
      { bio: { contains: q, mode: 'insensitive' } },
      {
        specialties: {
          some: {
            specialty: {
              name: { contains: q, mode: 'insensitive' },
            },
          },
        },
      },
    ]
  }

  if (params.specialtySlug) {
    where.specialties = {
      some: {
        specialty: {
          slug: params.specialtySlug,
        },
      },
    }
  }

  if (params.city) {
    where.locations = {
      some: {
        city: { equals: params.city, mode: 'insensitive' },
      },
    }
  }

  if (params.isVirtual !== undefined) {
    where.locations = {
      some: {
        isVirtual: params.isVirtual,
      },
    }
  }

  if (params.language) {
    where.languages = {
      some: {
        languageCode: params.language.toLowerCase(),
      },
    }
  }

  if (params.maxFee !== undefined) {
    where.consultationFee = {
      lte: params.maxFee,
    }
  }

  const [doctors, total] = await Promise.all([
    db.doctorProfile.findMany({
      where,
      skip,
      take: limit,
      include: {
        specialties: {
          include: { specialty: true },
        },
        qualifications: {
          orderBy: { year: 'desc' },
        },
        languages: true,
        locations: true,
      },
      orderBy: { fullName: 'asc' },
    }),
    db.doctorProfile.count({ where }),
  ])

  return {
    doctors,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  }
}

/**
 * Fetch verified doctor by ID including all public professional credentials.
 */
export async function getDoctorById(doctorId: string) {
  return db.doctorProfile.findFirst({
    where: {
      id: doctorId,
      verificationStatus: 'VERIFIED',
    },
    include: {
      specialties: {
        include: { specialty: true },
      },
      qualifications: {
        orderBy: { year: 'desc' },
      },
      languages: true,
      locations: {
        include: { organization: true },
      },
      availabilities: true,
    },
  })
}

/**
 * Fetch a doctor's active recurring availability for a given day of week.
 */
export async function getDoctorAvailabilityForDay(doctorId: string, day: DayOfWeek) {
  return db.doctorAvailability.findMany({
    where: {
      doctorId,
      dayOfWeek: day,
      isActive: true,
    },
    include: {
      location: true,
    },
  })
}

/**
 * Check if the doctor has an exception or time-off for a specific date.
 */
export async function getDoctorExceptionForDate(doctorId: string, date: Date) {
  return db.availabilityException.findFirst({
    where: {
      doctorId,
      date,
    },
  })
}

/**
 * Fetch all booked/confirmed appointments for a doctor within a date range (UTC).
 */
export async function getDoctorBookedAppointments(doctorId: string, start: Date, end: Date) {
  return db.appointment.findMany({
    where: {
      doctorId,
      scheduledAt: {
        gte: start,
        lt: end,
      },
      status: {
        in: ['CONFIRMED', 'REQUESTED'],
      },
    },
    select: {
      scheduledAt: true,
      endAt: true,
    },
  })
}

/**
 * List all clinical specialties for search navigation and filters.
 */
export async function listAllSpecialties() {
  return db.specialty.findMany({
    orderBy: { name: 'asc' },
  })
}
