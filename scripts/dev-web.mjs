/**
 * Run Next.js dev from apps/web (webpack bundler — avoids Turbopack + stale .next mismatches).
 * Opt-in Turbopack: pnpm --filter web dev:turbopack
 */
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const webDir = join(root, "apps", "web");
const isWin = process.platform === "win32";

const child = spawn("npx", ["next", "dev"], {
  cwd: webDir,
  stdio: "inherit",
  env: process.env,
  shell: isWin,
});

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 1);
});
