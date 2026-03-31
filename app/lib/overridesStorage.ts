import fs from 'fs';
import path from 'path';

const bundledOverridesPath = path.join(process.cwd(), 'app', 'admin_overrides.json');

const tmpBaseDir = process.env.TMPDIR || process.env.TEMP || process.env.TMP || '/tmp';
const tmpOverridesPath = path.join(tmpBaseDir, 'admin_overrides.json');

let inMemoryOverrides: any | null = null;
let tmpInitialized = false;

function readJsonFile(filePath: string) {
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw);
}

function writeJsonFile(filePath: string, data: any) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function ensureTmpInitialized() {
  if (tmpInitialized) return;
  tmpInitialized = true;

  try {
    if (fs.existsSync(tmpOverridesPath)) return;
    if (fs.existsSync(bundledOverridesPath)) {
      const data = readJsonFile(bundledOverridesPath);
      writeJsonFile(tmpOverridesPath, data);
    } else {
      writeJsonFile(tmpOverridesPath, {});
    }
  } catch {
    return;
  }
}

export function getOverrides() {
  ensureTmpInitialized();

  try {
    if (fs.existsSync(tmpOverridesPath)) {
      const data = readJsonFile(tmpOverridesPath);
      inMemoryOverrides = data;
      return data;
    }
  } catch {
    return inMemoryOverrides || {};
  }

  try {
    if (fs.existsSync(bundledOverridesPath)) {
      const data = readJsonFile(bundledOverridesPath);
      inMemoryOverrides = data;
      return data;
    }
  } catch {
    return inMemoryOverrides || {};
  }

  return inMemoryOverrides || {};
}

export function saveOverrides(data: any) {
  inMemoryOverrides = data;

  try {
    writeJsonFile(bundledOverridesPath, data);
    return { ok: true as const, path: bundledOverridesPath };
  } catch {
    try {
      ensureTmpInitialized();
      writeJsonFile(tmpOverridesPath, data);
      return { ok: true as const, path: tmpOverridesPath };
    } catch (e) {
      return { ok: false as const, error: e instanceof Error ? e.message : String(e) };
    }
  }
}
