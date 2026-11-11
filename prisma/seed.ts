/**
 * Prisma seed — M2 development fixtures.
 *
 * IMPORTANT:
 * - ALL names, emails, and IDs are synthetic. No real patient data.
 * - Run only against a local/staging database — never production.
 *
 * Usage:
 *   npm run db:seed
 *   # or directly:
 *   npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const db = new PrismaClient()

async function main() {
  console.log('🌱  Starting seed...')

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

  console.log(`  ✅  Organizations: ${labOrg.name}, ${radioOrg.name}`)

  // -------------------------------------------------------------------------
  // 3. Helper — create a user with hashed password, role, and preferences
  // -------------------------------------------------------------------------

  const BCRYPT_ROUNDS = 10 // Lower rounds for seeding speed

  async function seedUser(params: {
    fullName: string
    email: string
    password: string
    role: string
    emailVerified?: boolean
    profileType: 'patient' | 'doctor' | 'staff'
    licenseNumber?: string
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

    if (params.profileType === 'patient') {
      await db.patientProfile.upsert({
        where: { userId: user.id },
        create: { userId: user.id, fullName: params.fullName },
        update: {},
      })
    } else if (params.profileType === 'doctor') {
      await db.doctorProfile.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          fullName: params.fullName,
          licenseNumber: params.licenseNumber ?? `SYNTH-${user.id.slice(0, 8)}`,
          consultationFee: 0,
          verificationStatus: params.emailVerified ? 'VERIFIED' : 'PENDING',
        },
        update: {},
      })
    }

    return user
  }

  // -------------------------------------------------------------------------
  // 4. Patients
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

  console.log(`  ✅  Patients: ${patientAlpha.email}, ${patientBeta.email}`)

  // -------------------------------------------------------------------------
  // 5. Doctors
  // -------------------------------------------------------------------------

  const doctorGamma = await seedUser({
    fullName: 'Test Doctor Gamma',
    email: 'doctor.gamma@example.test',
    password: 'Password3!',
    role: 'doctor',
    emailVerified: true,
    profileType: 'doctor',
    licenseNumber: 'SYNTH-LIC-001',
  })

  const doctorDelta = await seedUser({
    fullName: 'Test Doctor Delta',
    email: 'doctor.delta@example.test',
    password: 'Password4!',
    role: 'doctor',
    emailVerified: false,
    profileType: 'doctor',
    licenseNumber: 'SYNTH-LIC-002',
  })

  console.log(`  ✅  Doctors: ${doctorGamma.email} (VERIFIED), ${doctorDelta.email} (PENDING)`)

  // -------------------------------------------------------------------------
  // 6. Super admin & support agent (staff — no patient/doctor profile)
  // -------------------------------------------------------------------------

  const admin = await seedUser({
    fullName: 'Seed Super Admin',
    email: 'admin@example.test',
    password: 'AdminPass1!',
    role: 'super_admin',
    emailVerified: true,
    profileType: 'staff',
  })

  const support = await seedUser({
    fullName: 'Seed Support Agent',
    email: 'support@example.test',
    password: 'SupportPass1!',
    role: 'support_agent',
    emailVerified: true,
    profileType: 'staff',
  })

  console.log(`  ✅  Super admin: ${admin.email}`)
  console.log(`  ✅  Support agent: ${support.email}`)

  // -------------------------------------------------------------------------
  // 7. Lab admin with org membership
  // -------------------------------------------------------------------------

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
        userId: labAdminUser.id,
      },
    },
    create: {
      organizationId: labOrg.id,
      userId: labAdminUser.id,
      membershipRole: 'admin',
      status: 'ACTIVE',
    },
    update: {},
  })

  console.log(`  ✅  Lab admin: ${labAdminUser.email} → ${labOrg.name}`)

  console.log('\n🎉  Seed complete!\n')
  console.log('  Seed accounts (use only in local/staging):')
  console.log('  patient.alpha@example.test  / Password1!')
  console.log('  patient.beta@example.test   / Password2!')
  console.log('  doctor.gamma@example.test   / Password3!')
  console.log('  doctor.delta@example.test   / Password4!')
  console.log('  admin@example.test          / AdminPass1!')
  console.log('  support@example.test        / SupportPass1!')
  console.log('  lab.admin@example.test      / LabPass1!')
}

main()
  .catch((e) => {
    console.error('❌  Seed failed:', e)
    process.exit(1)
  })
  .finally(() => {
    void db.$disconnect()
  })
