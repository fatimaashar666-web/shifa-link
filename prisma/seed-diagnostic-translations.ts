import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { DIAGNOSTIC_TRANSLATIONS } from "../src/lib/diagnostics/localization.ts";

const envPath = resolve(process.cwd(), ".env.local");
if (existsSync(envPath)) {
  const content = readFileSync(envPath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separator = trimmed.indexOf("=");
    if (separator <= 0) continue;
    const key = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required to seed diagnostic translations.");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  let updated = 0;
  let missing = 0;

  for (const [catalogKey, translations] of Object.entries(DIAGNOSTIC_TRANSLATIONS)) {
    const service = await db.diagnosticService.findFirst({
      where: { OR: [{ code: catalogKey }, { slug: catalogKey }] },
      select: { id: true, name: true },
    });

    if (!service) {
      missing += 1;
      console.warn(`Diagnostic service not found for translation key: ${catalogKey}`);
      continue;
    }

    await db.diagnosticService.update({
      where: { id: service.id },
      data: { translations },
    });
    updated += 1;
  }

  console.log(`Seeded translations for ${updated} diagnostic services.${missing ? ` Missing: ${missing}.` : ""}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
    await pool.end();
  });
