import { existsSync, readFileSync } from "fs";
import { dirname, resolve } from "path";

function applyEnvFile(filePath: string): void {
  for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    process.env[key] = val;
  }
}

/** Directory that contains nest-cli.json (apps/api). */
function findApiRoot(startDir: string): string | undefined {
  let dir = startDir;
  for (let i = 0; i < 12; i++) {
    if (existsSync(resolve(dir, "nest-cli.json"))) {
      return dir;
    }
    const parent = dirname(dir);
    if (parent === dir) {
      break;
    }
    dir = parent;
  }
  return undefined;
}

const apiRoot = findApiRoot(__dirname);
if (apiRoot) {
  // Later files override earlier — keep a committed `.env.development`, let `.env` / `.env.local` win
  for (const name of [".env.development", ".env", ".env.local"] as const) {
    const p = resolve(apiRoot, name);
    if (existsSync(p)) {
      applyEnvFile(p);
    }
  }
}
