/**
 * Contract types for the Diagnostic Services and Bookings API.
 */

export interface DiagnosticServiceLocationDto {
  id: string
  organizationId: string
  organizationName: string
  price: number | null
  isAvailable: boolean
  turnaroundDays: number | null
}

export interface DiagnosticServiceDto {
  id: string
  name: string
  type: 'LAB' | 'RADIOLOGY'
  category: string
  description: string | null
  basePrice: number
  locations: DiagnosticServiceLocationDto[]
}

export interface DiagnosticBookingEventDto {
  id: string
  status: string
  note: string | null
  createdAt: string
}

export interface DiagnosticBookingDto {
  id: string
  bookingNumber: string
  status: string
  serviceId: string
  serviceName: string
  organizationId: string
  organizationName: string
  scheduledAt: string
  isHomeCollection: boolean
  collectionAddress: string | null
  notes: string | null
  totalAmount: number
  cancellationReason: string | null
  cancelledAt: string | null
  createdAt: string
  events?: DiagnosticBookingEventDto[]
}

// ── Request bodies ──────────────────────────────────────────────────────────

export interface BookDiagnosticBody {
  serviceId: string
  organizationId: string
  /** ISO 8601 datetime */
  scheduledAt: string
  isHomeCollection?: boolean
  collectionAddress?: string
  notes?: string
}

export interface CancelDiagnosticBookingBody {
  reason?: string
}

// ── Responses ───────────────────────────────────────────────────────────────

export interface ListDiagnosticServicesResponse {
  services: DiagnosticServiceDto[]
}

export interface ListDiagnosticBookingsResponse {
  bookings: DiagnosticBookingDto[]
}
