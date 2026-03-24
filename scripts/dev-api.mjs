/**
 * Run Nest API in watch mode from apps/api (no nested `pnpm` in PATH required).
 * Usage: node scripts/dev-api.mjs  OR  pnpm dev:api  OR  npx pnpm dev:api
 */
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const apiDir = join(root, "apps", "api");
const isWin = process.platform === "win32";

const child = spawn("npx", ["nest", "start", "--watch"], {
  cwd: apiDir,
  stdio: "inherit",
  env: process.env,
  shell: isWin,
});

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 1);
});
