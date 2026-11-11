/**
 * Doctor service — business logic for discovery, public profile projection,
 * and dynamic slot calculation.
 */
import 'server-only'

import { DayOfWeek } from '@prisma/client'
import * as doctorRepo from '@/server/repositories/doctor.repository'

// Helper to map JavaScript Date.getDay() (0=Sunday..6=Saturday) to DayOfWeek enum
const JS_DAY_TO_ENUM: Record<number, DayOfWeek> = {
  0: DayOfWeek.SUNDAY,
  1: DayOfWeek.MONDAY,
  2: DayOfWeek.TUESDAY,
  3: DayOfWeek.WEDNESDAY,
  4: DayOfWeek.THURSDAY,
  5: DayOfWeek.FRIDAY,
  6: DayOfWeek.SATURDAY,
}

export async function searchDoctors(params: doctorRepo.SearchDoctorsParams) {
  const result = await doctorRepo.searchDoctors(params)

  const doctors = result.doctors.map((doc) => ({
    id: doc.id,
    fullName: doc.fullName,
    licenseNumber: doc.licenseNumber,
    consultationFee: Number(doc.consultationFee),
    bio: doc.bio,
    specialties: doc.specialties.map((ds) => ({
      id: ds.specialty.id,
      name: ds.specialty.name,
      slug: ds.specialty.slug,
      icon: ds.specialty.icon,
      isPrimary: ds.isPrimary,
    })),
    qualifications: doc.qualifications.map((q) => ({
      degree: q.degree,
      institution: q.institution,
      year: q.year,
    })),
    languages: doc.languages.map((l) => l.languageCode),
    locations: doc.locations.map((loc) => ({
      id: loc.id,
      name: loc.name,
      address: loc.address,
      city: loc.city,
      isVirtual: loc.isVirtual,
    })),
  }))

  return {
    doctors,
    total: result.total,
    page: result.page,
    totalPages: result.totalPages,
  }
}

export async function getDoctorProfile(doctorId: string) {
  const doc = await doctorRepo.getDoctorById(doctorId)
  if (!doc) return null

  return {
    id: doc.id,
    fullName: doc.fullName,
    licenseNumber: doc.licenseNumber,
    consultationFee: Number(doc.consultationFee),
    bio: doc.bio,
    specialties: doc.specialties.map((ds) => ({
      id: ds.specialty.id,
      name: ds.specialty.name,
      slug: ds.specialty.slug,
      icon: ds.specialty.icon,
      isPrimary: ds.isPrimary,
    })),
    qualifications: doc.qualifications.map((q) => ({
      degree: q.degree,
      institution: q.institution,
      year: q.year,
    })),
    languages: doc.languages.map((l) => l.languageCode),
    locations: doc.locations.map((loc) => ({
      id: loc.id,
      name: loc.name,
      address: loc.address,
      city: loc.city,
      isVirtual: loc.isVirtual,
      organizationName: loc.organization?.name,
    })),
  }
}

export async function getDoctorAvailableSlots(doctorId: string, dateStr: string) {
  const targetDate = new Date(`${dateStr}T00:00:00Z`)
  if (isNaN(targetDate.getTime())) {
    throw new Error('INVALID_DATE')
  }

  // 1. Check for day-off exception
  const exception = await doctorRepo.getDoctorExceptionForDate(doctorId, targetDate)
  if (exception && !exception.isAvailable) {
    return { doctorId, date: dateStr, slots: [] }
  }

  // 2. Fetch recurring schedule for this day of week
  const dayOfWeek = JS_DAY_TO_ENUM[targetDate.getUTCDay()]
  const schedules = await doctorRepo.getDoctorAvailabilityForDay(doctorId, dayOfWeek)
  if (schedules.length === 0) {
    return { doctorId, date: dateStr, slots: [] }
  }

  // 3. Fetch existing appointments for the day
  const startOfDay = new Date(targetDate)
  const endOfDay = new Date(targetDate)
  endOfDay.setUTCDate(endOfDay.getUTCDate() + 1)

  const existingBookings = await doctorRepo.getDoctorBookedAppointments(doctorId, startOfDay, endOfDay)
  const bookedTimeSet = new Set(
    existingBookings.map((b) => b.scheduledAt.toISOString()),
  )

  // 4. Generate discrete time slots
  interface SlotItem {
    startTime: string
    endTime: string
    isAvailable: boolean
    locationId: string
    locationName: string
    isVirtual: boolean
  }

  const slots: SlotItem[] = []

  for (const schedule of schedules) {
    const [startHour, startMin] = schedule.startTime.split(':').map(Number)
    const [endHour, endMin] = schedule.endTime.split(':').map(Number)
    const duration = schedule.slotDurationMinutes || 30

    let currentMinutes = startHour * 60 + startMin
    const endMinutes = endHour * 60 + endMin

    while (currentMinutes + duration <= endMinutes) {
      const slotStart = new Date(targetDate)
      slotStart.setUTCHours(Math.floor(currentMinutes / 60), currentMinutes % 60, 0, 0)

      const slotEnd = new Date(slotStart)
      slotEnd.setUTCMinutes(slotEnd.getUTCMinutes() + duration)

      const isBooked = bookedTimeSet.has(slotStart.toISOString())

      slots.push({
        startTime: slotStart.toISOString(),
        endTime: slotEnd.toISOString(),
        isAvailable: !isBooked,
        locationId: schedule.locationId,
        locationName: schedule.location.name,
        isVirtual: schedule.location.isVirtual,
      })

      currentMinutes += duration
    }
  }

  return {
    doctorId,
    date: dateStr,
    slots,
  }
}

export async function getAllSpecialties() {
  return doctorRepo.listAllSpecialties()
}
