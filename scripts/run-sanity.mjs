import { existsSync } from "node:fs";
import { spawn } from "node:child_process";
import { loadEnvFile } from "node:process";

const envFile = existsSync(".env.local") ? ".env.local" : ".env";

try {
  loadEnvFile(envFile);
} catch {
  // The Sanity CLI will report a clear project configuration error if no env file is present.
}

const sanityCommand = process.platform === "win32" ? "sanity.cmd" : "sanity";
const child = spawn(sanityCommand, process.argv.slice(2), {
  cwd: process.cwd(),
  stdio: "inherit",
  shell: process.platform === "win32",
});

child.on("error", (error) => {
  console.error(error.message);
  process.exitCode = 1;
});

child.on("exit", (code, signal) => {
  process.exitCode = code ?? (signal ? 1 : 0);
});
