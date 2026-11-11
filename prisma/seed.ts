/**
 * Prisma seed — M2 & M4 development fixtures.
 *
 * IMPORTANT:
 * - ALL names, emails, and IDs are synthetic. No real patient data.
 * - Run only against a local/staging database — never production.
 *
 * Usage:
 *   npm run db:seed
 *   # or directly:
 *   npx ts-node -T prisma/seed.ts
 */

import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import {
  PrismaClient,
  DayOfWeek,
  AppointmentStatus,
  AppointmentType,
  DiagnosticBookingStatus,
  MedicalRecordCategory,
} from '@prisma/client'
import bcrypt from 'bcryptjs'

// Simple .env.local loader for ts-node script
const envPath = resolve(process.cwd(), '.env.local')
if (existsSync(envPath)) {
  const content = readFileSync(envPath, 'utf-8')
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx).trim()
      let val = trimmed.slice(eqIdx + 1).trim()
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1)
      }
      process.env[key] = val
    }
  }
}

const connectionString = process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const db = new PrismaClient({ adapter })

async function main() {
  console.log('🌱  Starting M2 + M4 seed...')

  // -------------------------------------------------------------------------
  // 1. Roles — must run first
  // -------------------------------------------------------------------------

  const roleNames = [
    'patient',
    'doctor',
    'lab_admin',
    'radiology_admin',
    'support_agent',
    'content_editor',
    'super_admin',
  ]

  for (const name of roleNames) {
    await db.role.upsert({
      where: { name },
      create: { name, description: `System role: ${name}` },
      update: {},
    })
  }
  console.log(`  ✅  Roles: ${roleNames.join(', ')}`)

  // -------------------------------------------------------------------------
  // 2. Organizations (OrgType enum: CLINIC | LAB | RADIOLOGY)
  // -------------------------------------------------------------------------

  const clinicOrg = await db.organization.upsert({
    where: { id: 'org-seed-cln-00000000-0000-0000-0000-000000000000' },
    create: {
      id: 'org-seed-cln-00000000-0000-0000-0000-000000000000',
      name: 'Shifa Central Clinic',
      type: 'CLINIC',
      status: 'ACTIVE',
    },
    update: {},
  })

  const labOrg = await db.organization.upsert({
    where: { id: 'org-seed-lab-00000000-0000-0000-0000-000000000001' },
    create: {
      id: 'org-seed-lab-00000000-0000-0000-0000-000000000001',
      name: 'Synthetic Lab Center',
      type: 'LAB',
      status: 'ACTIVE',
    },
    update: {},
  })

  const radioOrg = await db.organization.upsert({
    where: { id: 'org-seed-rad-00000000-0000-0000-0000-000000000002' },
    create: {
      id: 'org-seed-rad-00000000-0000-0000-0000-000000000002',
      name: 'Synthetic Radiology Hub',
      type: 'RADIOLOGY',
      status: 'ACTIVE',
    },
    update: {},
  })

  console.log(`  ✅  Organizations: ${clinicOrg.name}, ${labOrg.name}, ${radioOrg.name}`)

  // -------------------------------------------------------------------------
  // 3. Specialties (M4)
  // -------------------------------------------------------------------------

  const specialtiesData = [
    { name: 'General Medicine', slug: 'general-medicine', description: 'Primary care, fever, routine checkups', icon: 'Stethoscope' },
    { name: 'Cardiology', slug: 'cardiology', description: 'Heart, blood pressure, and cardiovascular health', icon: 'HeartPulse' },
    { name: 'Dermatology', slug: 'dermatology', description: 'Skin, hair, allergies, and cosmetic dermatology', icon: 'Sparkles' },
    { name: 'Pediatrics', slug: 'pediatrics', description: 'Infant, child, and adolescent healthcare', icon: 'Baby' },
    { name: 'Orthopedics', slug: 'orthopedics', description: 'Bones, joints, spine, and fracture management', icon: 'Bone' },
    { name: 'Neurology', slug: 'neurology', description: 'Brain, nerves, headaches, and neuromuscular disorders', icon: 'Brain' },
  ]

  const specialtiesMap = new Map<string, string>()

  for (const s of specialtiesData) {
    const spec = await db.specialty.upsert({
      where: { slug: s.slug },
      create: s,
      update: { name: s.name, description: s.description, icon: s.icon },
    })
    specialtiesMap.set(s.slug, spec.id)
  }
  console.log(`  ✅  Specialties seeded (${specialtiesData.length})`)

  // -------------------------------------------------------------------------
  // 4. Helper — create a user with hashed password, role, and preferences
  // -------------------------------------------------------------------------

  const BCRYPT_ROUNDS = 10

  async function seedUser(params: {
    fullName: string
    email: string
    password: string
    role: string
    emailVerified?: boolean
    profileType: 'patient' | 'doctor' | 'staff'
    licenseNumber?: string
    bio?: string
    fee?: number
  }) {
    const passwordHash = await bcrypt.hash(params.password, BCRYPT_ROUNDS)

    const user = await db.user.upsert({
      where: { email: params.email },
      create: {
        email: params.email,
        passwordHash,
        status: 'ACTIVE',
        emailVerifiedAt: params.emailVerified ? new Date() : null,
      },
      update: {},
    })

    const role = await db.role.findUniqueOrThrow({ where: { name: params.role } })

    const existing = await db.userRole.findFirst({
      where: { userId: user.id, roleId: role.id, organizationId: null },
    })
    if (!existing) {
      await db.userRole.create({
        data: { userId: user.id, roleId: role.id, organizationId: null },
      })
    }

    await db.userPreference.upsert({
      where: { userId: user.id },
      create: { userId: user.id, locale: 'en', theme: 'system' },
      update: {},
    })

    let patientProf = null
    let doctorProf = null

    if (params.profileType === 'patient') {
      patientProf = await db.patientProfile.upsert({
        where: { userId: user.id },
        create: { userId: user.id, fullName: params.fullName },
        update: { fullName: params.fullName },
      })
    } else if (params.profileType === 'doctor') {
      doctorProf = await db.doctorProfile.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          fullName: params.fullName,
          licenseNumber: params.licenseNumber ?? `SYNTH-${user.id.slice(0, 8)}`,
          consultationFee: params.fee ?? 1500,
          verificationStatus: params.emailVerified ? 'VERIFIED' : 'PENDING',
          bio: params.bio ?? 'Licensed medical practitioner providing evidence-based patient consultations.',
        },
        update: {
          fullName: params.fullName,
          consultationFee: params.fee ?? 1500,
          verificationStatus: params.emailVerified ? 'VERIFIED' : 'PENDING',
        },
      })
    }

    return { user, patientProf, doctorProf }
  }

  // -------------------------------------------------------------------------
  // 5. Patients
  // -------------------------------------------------------------------------

  const patientAlpha = await seedUser({
    fullName: 'Test Patient Alpha',
    email: 'patient.alpha@example.test',
    password: 'Password1!',
    role: 'patient',
    emailVerified: true,
    profileType: 'patient',
  })

  const patientBeta = await seedUser({
    fullName: 'Test Patient Beta',
    email: 'patient.beta@example.test',
    password: 'Password2!',
    role: 'patient',
    emailVerified: false,
    profileType: 'patient',
  })

  console.log(`  ✅  Patients: ${patientAlpha.user.email}, ${patientBeta.user.email}`)

  // -------------------------------------------------------------------------
  // 6. Doctors (M4 full profiles: qualifications, specialties, locations, slots)
  // -------------------------------------------------------------------------

  const doctorGamma = await seedUser({
    fullName: 'Dr. Sarah Jenkins, MD',
    email: 'doctor.gamma@example.test',
    password: 'Password3!',
    role: 'doctor',
    emailVerified: true,
    profileType: 'doctor',
    licenseNumber: 'PMC-92041-A',
    fee: 2500,
    bio: 'Senior Consultant Cardiologist with over 12 years of clinical experience in non-invasive cardiology, heart disease prevention, and hypertension management.',
  })

  const doctorDelta = await seedUser({
    fullName: 'Dr. Tariq Mahmood, MBBS',
    email: 'doctor.delta@example.test',
    password: 'Password4!',
    role: 'doctor',
    emailVerified: true,
    profileType: 'doctor',
    licenseNumber: 'PMC-81190-B',
    fee: 1800,
    bio: 'Specialist General Physician focusing on adult acute illness, preventive health assessments, and chronic condition management.',
  })

  // Doctor Specialties
  if (doctorGamma.doctorProf) {
    const cardId = specialtiesMap.get('cardiology')!
    const genId = specialtiesMap.get('general-medicine')!

    await db.doctorSpecialty.upsert({
      where: { doctorId_specialtyId: { doctorId: doctorGamma.doctorProf.id, specialtyId: cardId } },
      create: { doctorId: doctorGamma.doctorProf.id, specialtyId: cardId, isPrimary: true },
      update: {},
    })

    await db.doctorSpecialty.upsert({
      where: { doctorId_specialtyId: { doctorId: doctorGamma.doctorProf.id, specialtyId: genId } },
      create: { doctorId: doctorGamma.doctorProf.id, specialtyId: genId, isPrimary: false },
      update: {},
    })

    // Qualifications
    await db.doctorQualification.createMany({
      data: [
        { doctorId: doctorGamma.doctorProf.id, degree: 'MBBS', institution: 'King Edward Medical University', year: 2012 },
        { doctorId: doctorGamma.doctorProf.id, degree: 'FCPS (Cardiology)', institution: 'College of Physicians & Surgeons', year: 2018 },
      ],
      skipDuplicates: true,
    })

    // Languages
    for (const lang of ['en', 'ur']) {
      await db.doctorLanguage.upsert({
        where: { doctorId_languageCode: { doctorId: doctorGamma.doctorProf.id, languageCode: lang } },
        create: { doctorId: doctorGamma.doctorProf.id, languageCode: lang },
        update: {},
      })
    }

    // Locations
    const physLocation = await db.doctorLocation.upsert({
      where: { id: 'loc-gamma-clinic-0000-0000-000000000001' },
      create: {
        id: 'loc-gamma-clinic-0000-0000-000000000001',
        doctorId: doctorGamma.doctorProf.id,
        organizationId: clinicOrg.id,
        name: 'Shifa Central Clinic - Suite 402',
        address: '14-C Main Boulevard, Gulberg III',
        city: 'Lahore',
        isVirtual: false,
      },
      update: {},
    })

    const virtLocation = await db.doctorLocation.upsert({
      where: { id: 'loc-gamma-video-0000-0000-000000000002' },
      create: {
        id: 'loc-gamma-video-0000-0000-000000000002',
        doctorId: doctorGamma.doctorProf.id,
        name: 'Telehealth Secure Video Consultation',
        city: 'Virtual',
        isVirtual: true,
      },
      update: {},
    })

    // Recurring Availability: Mon, Wed, Fri (physical); Tue, Thu (video)
    const scheduleDays: { day: DayOfWeek; locId: string; start: string; end: string }[] = [
      { day: DayOfWeek.MONDAY, locId: physLocation.id, start: '09:00', end: '13:00' },
      { day: DayOfWeek.WEDNESDAY, locId: physLocation.id, start: '09:00', end: '13:00' },
      { day: DayOfWeek.FRIDAY, locId: physLocation.id, start: '14:00', end: '18:00' },
      { day: DayOfWeek.TUESDAY, locId: virtLocation.id, start: '10:00', end: '15:00' },
      { day: DayOfWeek.THURSDAY, locId: virtLocation.id, start: '10:00', end: '15:00' },
    ]

    for (const s of scheduleDays) {
      const existing = await db.doctorAvailability.findFirst({
        where: { doctorId: doctorGamma.doctorProf.id, locationId: s.locId, dayOfWeek: s.day },
      })
      if (!existing) {
        await db.doctorAvailability.create({
          data: {
            doctorId: doctorGamma.doctorProf.id,
            locationId: s.locId,
            dayOfWeek: s.day,
            startTime: s.start,
            endTime: s.end,
            slotDurationMinutes: 30,
            isActive: true,
          },
        })
      }
    }
  }

  if (doctorDelta.doctorProf) {
    const genId = specialtiesMap.get('general-medicine')!
    await db.doctorSpecialty.upsert({
      where: { doctorId_specialtyId: { doctorId: doctorDelta.doctorProf.id, specialtyId: genId } },
      create: { doctorId: doctorDelta.doctorProf.id, specialtyId: genId, isPrimary: true },
      update: {},
    })

    await db.doctorQualification.createMany({
      data: [
        { doctorId: doctorDelta.doctorProf.id, degree: 'MBBS', institution: 'Allama Iqbal Medical College', year: 2016 },
      ],
      skipDuplicates: true,
    })

    for (const lang of ['en', 'ur', 'ar']) {
      await db.doctorLanguage.upsert({
        where: { doctorId_languageCode: { doctorId: doctorDelta.doctorProf.id, languageCode: lang } },
        create: { doctorId: doctorDelta.doctorProf.id, languageCode: lang },
        update: {},
      })
    }

    const deltaLoc = await db.doctorLocation.upsert({
      where: { id: 'loc-delta-clinic-0000-0000-000000000003' },
      create: {
        id: 'loc-delta-clinic-0000-0000-000000000003',
        doctorId: doctorDelta.doctorProf.id,
        name: 'Community Care OPD',
        address: '88 Jail Road',
        city: 'Lahore',
        isVirtual: false,
      },
      update: {},
    })

    for (const day of [DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.THURSDAY, DayOfWeek.SATURDAY]) {
      const existing = await db.doctorAvailability.findFirst({
        where: { doctorId: doctorDelta.doctorProf.id, locationId: deltaLoc.id, dayOfWeek: day },
      })
      if (!existing) {
        await db.doctorAvailability.create({
          data: {
            doctorId: doctorDelta.doctorProf.id,
            locationId: deltaLoc.id,
            dayOfWeek: day,
            startTime: '16:00',
            endTime: '20:00',
            slotDurationMinutes: 20,
            isActive: true,
          },
        })
      }
    }
  }

  console.log(`  ✅  Doctors & schedules: ${doctorGamma.user.email} (Cardiology), ${doctorDelta.user.email} (General Medicine)`)

  // -------------------------------------------------------------------------
  // 7. Sample Appointments (M4)
  // -------------------------------------------------------------------------

  if (patientAlpha.patientProf && doctorGamma.doctorProf) {
    const loc = await db.doctorLocation.findFirst({ where: { doctorId: doctorGamma.doctorProf.id } })
    if (loc) {
      // Future appointment (next Monday 10:00 AM UTC)
      const nextWeek = new Date()
      nextWeek.setDate(nextWeek.getDate() + 7)
      nextWeek.setUTCHours(10, 0, 0, 0)
      const nextWeekEnd = new Date(nextWeek)
      nextWeekEnd.setUTCMinutes(30)

      await db.appointment.upsert({
        where: {
          doctorId_scheduledAt: {
            doctorId: doctorGamma.doctorProf.id,
            scheduledAt: nextWeek,
          },
        },
        create: {
          patientId: patientAlpha.patientProf.id,
          doctorId: doctorGamma.doctorProf.id,
          locationId: loc.id,
          appointmentType: AppointmentType.IN_PERSON,
          status: AppointmentStatus.CONFIRMED,
          scheduledAt: nextWeek,
          endAt: nextWeekEnd,
          reason: 'Routine cardiac health review and blood pressure check.',
        },
        update: {},
      })
      console.log('  ✅  Sample appointment created for patient alpha')
    }
  }

  // -------------------------------------------------------------------------
  // 8. Staff Accounts
  // -------------------------------------------------------------------------

  await seedUser({
    fullName: 'Seed Super Admin',
    email: 'admin@example.test',
    password: 'AdminPass1!',
    role: 'super_admin',
    emailVerified: true,
    profileType: 'staff',
  })

  await seedUser({
    fullName: 'Seed Support Agent',
    email: 'support@example.test',
    password: 'SupportPass1!',
    role: 'support_agent',
    emailVerified: true,
    profileType: 'staff',
  })

  const labAdminUser = await seedUser({
    fullName: 'Seed Lab Admin',
    email: 'lab.admin@example.test',
    password: 'LabPass1!',
    role: 'lab_admin',
    emailVerified: true,
    profileType: 'staff',
  })

  await db.organizationMember.upsert({
    where: {
      organizationId_userId: {
        organizationId: labOrg.id,
        userId: labAdminUser.user.id,
      },
    },
    create: {
      organizationId: labOrg.id,
      userId: labAdminUser.user.id,
      membershipRole: 'admin',
      status: 'ACTIVE',
    },
    update: {},
  })

  // -------------------------------------------------------------------------
  // 9. M5 — Diagnostic Services (LAB + RADIOLOGY)
  // -------------------------------------------------------------------------

  const labServicesData = [
    {
      id: 'svc-seed-lab-cbc-00000000-0000-0000-000000000001',
      name: 'Complete Blood Count (CBC)',
      slug: 'complete-blood-count',
      type: 'LAB' as const,
      category: 'Haematology',
      description: 'Comprehensive panel measuring white blood cells, red blood cells, hemoglobin, and platelets.',
      basePrice: 950,
    },
    {
      id: 'svc-seed-lab-lip-00000000-0000-0000-000000000002',
      name: 'Lipid Profile (Cholesterol Panel)',
      slug: 'lipid-profile',
      type: 'LAB' as const,
      category: 'Biochemistry',
      description: 'Evaluates cardiovascular risk: Total Cholesterol, HDL, LDL, and Triglycerides.',
      basePrice: 1400,
    },
    {
      id: 'svc-seed-lab-hba-00000000-0000-0000-000000000003',
      name: 'HbA1c (Glycated Haemoglobin)',
      slug: 'hba1c',
      type: 'LAB' as const,
      category: 'Endocrinology',
      description: 'Standard monitoring panel for diabetes and pre-diabetic metabolic health.',
      basePrice: 1600,
    },
  ]

  const radioServicesData = [
    {
      id: 'svc-seed-rad-xry-00000000-0000-0000-000000000004',
      name: 'Chest X-Ray (PA & Lateral)',
      slug: 'chest-xray',
      type: 'RADIOLOGY' as const,
      category: 'Radiography',
      description: 'Standard diagnostic imaging for lung fields, cardiac silhouette, and thoracic skeletal structures.',
      basePrice: 1500,
    },
    {
      id: 'svc-seed-rad-usg-00000000-0000-0000-000000000005',
      name: 'Abdominal & Pelvic Ultrasound',
      slug: 'abdominal-ultrasound',
      type: 'RADIOLOGY' as const,
      category: 'Ultrasound',
      description: 'High-resolution sonography of liver, gallbladder, kidneys, spleen, pancreas, and bladder.',
      basePrice: 2800,
    },
    {
      id: 'svc-seed-rad-mri-00000000-0000-0000-000000000006',
      name: 'Brain MRI (Without Contrast)',
      slug: 'brain-mri',
      type: 'RADIOLOGY' as const,
      category: 'MRI',
      description: 'Detailed soft-tissue neuroimaging for headaches, neurological symptoms, or cranial trauma evaluation.',
      basePrice: 9500,
    },
  ]

  for (const svc of labServicesData) {
    await db.diagnosticService.upsert({
      where: { id: svc.id },
      create: { ...svc, slug: svc.slug ?? svc.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') },
      update: { basePrice: svc.basePrice },
    })

    await db.diagnosticServiceLocation.upsert({
      where: { serviceId_organizationId: { serviceId: svc.id, organizationId: labOrg.id } },
      create: {
        serviceId: svc.id,
        organizationId: labOrg.id,
        price: svc.basePrice,
        isAvailable: true,
      },
      update: {},
    })
  }

  for (const svc of radioServicesData) {
    await db.diagnosticService.upsert({
      where: { id: svc.id },
      create: { ...svc, slug: svc.slug ?? svc.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') },
      update: { basePrice: svc.basePrice },
    })

    await db.diagnosticServiceLocation.upsert({
      where: { serviceId_organizationId: { serviceId: svc.id, organizationId: radioOrg.id } },
      create: {
        serviceId: svc.id,
        organizationId: radioOrg.id,
        price: svc.basePrice,
        isAvailable: true,
      },
      update: {},
    })
  }

  console.log(`  ✅  Diagnostic Services: ${labServicesData.length} lab + ${radioServicesData.length} radiology`)

  // -------------------------------------------------------------------------
  // 10. M5 — Sample DiagnosticBooking for patientAlpha
  // -------------------------------------------------------------------------

  const cbcService = labServicesData[0]
  const existingBooking = await db.diagnosticBooking.findFirst({
    where: { bookingNumber: 'DIAG-SEED-001' },
  })

  if (!existingBooking && patientAlpha.patientProf) {
    const booking = await db.diagnosticBooking.create({
      data: {
        bookingNumber: 'DIAG-SEED-001',
        patientId: patientAlpha.patientProf.id,
        serviceId: cbcService.id,
        organizationId: labOrg.id,
        scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        isHomeCollection: true,
        notes: 'Fasting sample — 10h pre-collection. Synthetic seed booking.',
        totalAmount: cbcService.basePrice,
        status: DiagnosticBookingStatus.CONFIRMED,
      },
    })

    await db.diagnosticBookingEvent.create({
      data: {
        bookingId: booking.id,
        status: DiagnosticBookingStatus.CONFIRMED,
        note: 'Seed booking confirmed',
        actorId: patientAlpha.patientProf.id,
      },
    })
    console.log('  ✅  DiagnosticBooking DIAG-SEED-001 created for patient.alpha')
  } else {
    console.log('  ⏭   DiagnosticBooking DIAG-SEED-001 already exists, skipping')
  }

  // -------------------------------------------------------------------------
  // 11. M5 — Sample MedicalRecord (FileObject) for patientAlpha
  // -------------------------------------------------------------------------

  const existingRecord = await db.medicalRecord.findFirst({
    where: { title: 'Seed CBC Report — Alpha' },
  })

  if (!existingRecord && patientAlpha.patientProf) {
    const fileObj = await db.fileObject.create({
      data: {
        storageKey: `records/${patientAlpha.patientProf.id}/lab_report/seed-cbc-report.pdf`,
        fileName: 'seed-cbc-report.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 204800,
        uploadedBy: patientAlpha.user.id,
      },
    })

    await db.medicalRecord.create({
      data: {
        patientId: patientAlpha.patientProf.id,
        fileObjectId: fileObj.id,
        title: 'Seed CBC Report — Alpha',
        category: MedicalRecordCategory.LAB_REPORT,
        description: 'Synthetic seed record. File does not exist in object storage.',
        recordDate: new Date(),
      },
    })
    console.log('  ✅  MedicalRecord: Seed CBC Report created for patient.alpha')
  } else {
    console.log('  ⏭   MedicalRecord already exists, skipping')
  }

  console.log('\n🎉  M2 + M4 + M5 Seed complete!\n')
}

main()
  .catch((e) => {
    console.error('❌  Seed failed:', e)
    process.exit(1)
  })
  .finally(() => {
    void db.$disconnect()
    void pool.end()
  })
