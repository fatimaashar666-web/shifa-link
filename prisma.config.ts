import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";
import { defineConfig, env } from "prisma/config";

if (existsSync(".env.local")) {
  loadEnvFile(".env.local");
}

const directUrl = env("DIRECT_URL");
const runtimeUrl = process.env.DATABASE_URL;

// Supabase direct database hosts may be IPv6-only. When the runtime URL uses
// Supabase's IPv4 pooler, use its session mode for Prisma migrations too.
const migrationUrl = (() => {
  if (!runtimeUrl) return directUrl;

  try {
    const direct = new URL(directUrl);
    const runtime = new URL(runtimeUrl);

    if (
      direct.hostname.endsWith(".supabase.co") &&
      runtime.hostname.endsWith(".pooler.supabase.com")
    ) {
      direct.username = runtime.username;
      direct.hostname = runtime.hostname;
      direct.port = "5432";
      direct.searchParams.set("sslmode", "require");
      return direct.toString();
    }
  } catch {
    // Fall back to DIRECT_URL so Prisma reports the original connection error.
  }

  return directUrl;
})();

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: migrationUrl,
  },
});
