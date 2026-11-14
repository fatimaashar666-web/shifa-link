import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const envPath = resolve(process.cwd(), '.env.local')
if (existsSync(envPath)) {
  const content = readFileSync(envPath, 'utf-8')
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx <= 0) continue
    const key = trimmed.slice(0, eqIdx).trim()
    let value = trimmed.slice(eqIdx + 1).trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    process.env[key] = value
  }
}

type CatalogRow = {
  id: string
  code: string
  name: string
  slug: string
  type: 'LAB' | 'RADIOLOGY'
  category: string
  sampleType: string
  description: string | null
  fastingRequired: boolean
  fastingHours: number | null
  turnaroundHours: number
  shortDescription: string | null
  searchKeywords: string[]
  isPopular: boolean
  isFeatured: boolean
  isActive: boolean
  basePrice: number | null
  imageUrl: string | null
}

function parseCsvLine(line: string): string[] {
  const values: string[] = []
  let value = ''
  let inQuotes = false

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index]
    if (character === '"') {
      if (inQuotes && line[index + 1] === '"') {
        value += '"'
        index += 1
      } else {
        inQuotes = !inQuotes
      }
    } else if (character === ',' && !inQuotes) {
      values.push(value)
      value = ''
    } else {
      value += character
    }
  }

  if (inQuotes) throw new Error('Invalid catalog CSV row: unmatched quote')
  values.push(value)
  return values
}

function parseBoolean(value: string, field: string, rowNumber: number): boolean {
  const normalized = value.toLowerCase()
  if (normalized === 'true') return true
  if (normalized === 'false') return false
  throw new Error(`Invalid ${field} on catalog row ${rowNumber}: ${value}`)
}

function parseOptionalNumber(value: string, field: string, rowNumber: number): number | null {
  if (!value.trim()) return null
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) throw new Error(`Invalid ${field} on catalog row ${rowNumber}: ${value}`)
  return parsed
}

function readCatalog(): CatalogRow[] {
  const csvPath = resolve(process.cwd(), 'prisma/shifalink_karachi_lab_test_catalog.csv')
  const lines = readFileSync(csvPath, 'utf-8')
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0)
  const headers = parseCsvLine(lines.shift() ?? '')
  const requiredHeaders = [
    'code', 'name', 'slug', 'type', 'category', 'sampleType', 'description',
    'fastingRequired', 'fastingHours', 'turnaroundHours', 'shortDescription',
    'searchKeywords', 'isPopular', 'isFeatured', 'isActive', 'basePrice', 'imageUrl',
  ]
  if (requiredHeaders.some((header) => !headers.includes(header))) {
    throw new Error(`Catalog CSV must include: ${requiredHeaders.join(',')}`)
  }

  return lines.map((line, index) => {
    const rowNumber = index + 2
    const values = parseCsvLine(line)
    const row = Object.fromEntries(headers.map((header, headerIndex) => [header, values[headerIndex] ?? '']))
    if (!row.code || !row.name || !row.slug || !row.category || !row.sampleType) {
      throw new Error(`Catalog row ${rowNumber} is missing a required value`)
    }
    if (row.type !== 'LAB' && row.type !== 'RADIOLOGY') {
      throw new Error(`Catalog row ${rowNumber} has unsupported type: ${row.type}`)
    }
    return {
      id: `svc-catalog-${row.code}`,
      code: row.code,
      name: row.name,
      slug: row.slug,
      type: row.type,
      category: row.category,
      sampleType: row.sampleType,
      description: row.description || null,
      fastingRequired: parseBoolean(row.fastingRequired, 'fastingRequired', rowNumber),
      fastingHours: parseOptionalNumber(row.fastingHours, 'fastingHours', rowNumber),
      turnaroundHours: Number(row.turnaroundHours),
      shortDescription: row.shortDescription || null,
      searchKeywords: row.searchKeywords.split(';').map((keyword) => keyword.trim()).filter(Boolean),
      isPopular: parseBoolean(row.isPopular, 'isPopular', rowNumber),
      isFeatured: parseBoolean(row.isFeatured, 'isFeatured', rowNumber),
      isActive: parseBoolean(row.isActive, 'isActive', rowNumber),
      basePrice: parseOptionalNumber(row.basePrice, 'basePrice', rowNumber),
      imageUrl: row.imageUrl || null,
    }
  })
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const db = new PrismaClient({ adapter: new PrismaPg(pool) })

async function main() {
  const catalog = readCatalog()
  const labOrgId = 'org-seed-lab-00000000-0000-0000-000000000001'
  const radioOrgId = 'org-seed-rad-00000000-0000-0000-000000000002'
  const legacySlugByCode = new Map([['cbc', 'complete-blood-count']])

  const labCount = catalog.filter((row) => row.type === 'LAB').length
  const radiologyCount = catalog.filter((row) => row.type === 'RADIOLOGY').length
  console.log(`Importing ${labCount} lab and ${radiologyCount} radiology catalog rows...`)

  for (const row of catalog) {
    const organizationId = row.type === 'LAB' ? labOrgId : radioOrgId
    const existing =
      (await db.diagnosticService.findUnique({ where: { code: row.code } })) ??
      (await db.diagnosticService.findUnique({ where: { slug: legacySlugByCode.get(row.code) ?? row.slug } }))

    const service = existing
      ? await db.diagnosticService.update({ where: { id: existing.id }, data: row })
      : await db.diagnosticService.create({ data: row })

    if (row.basePrice === null) continue

    const existingLink = await db.diagnosticServiceLocation.findFirst({
      where: { serviceId: service.id, organizationId },
    })
    if (existingLink) {
      await db.diagnosticServiceLocation.update({
        where: { id: existingLink.id },
        data: { price: row.basePrice, isAvailable: row.isActive },
      })
    } else {
      await db.diagnosticServiceLocation.create({
        data: { serviceId: service.id, organizationId, price: row.basePrice, isAvailable: row.isActive },
      })
    }
  }

  const counts = await db.diagnosticService.groupBy({ by: ['type'], _count: { _all: true } })
  const importedServices = await db.diagnosticService.findMany({
    where: { code: { in: catalog.map((row) => row.code) } },
    select: { code: true, type: true, basePrice: true },
    orderBy: { code: 'asc' },
  })
  console.log(`CSV-coded services present: ${importedServices.length}/${catalog.length}`)
  console.log(`Catalog import complete. Service counts: ${JSON.stringify(counts)}`)
}

main()
  .catch((error) => {
    console.error('Catalog import failed:', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await db.$disconnect()
    await pool.end()
  })
