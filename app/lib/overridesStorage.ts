import fs from 'fs';
import path from 'path';
import { dbGetAllMatchOverrides, dbGetMatchOverride, dbUpsertManyMatchOverrides, dbUpsertMatchOverride, isSupabaseConfigured } from './db';

const bundledOverridesPath = path.join(process.cwd(), 'app', 'admin_overrides.json');

function readJsonFile(filePath: string) {
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw);
}

function writeJsonFile(filePath: string, data: any) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

let cachedOverrides: any | null = null;
let cachedAt = 0;
const CACHE_MS = 30_000;

export async function getOverrides() {
  if (cachedOverrides && Date.now() - cachedAt < CACHE_MS) return cachedOverrides;

  if (isSupabaseConfigured()) {
    const data = await dbGetAllMatchOverrides();
    cachedOverrides = data;
    cachedAt = Date.now();
    return data;
  }

  try {
    const data = readJsonFile(bundledOverridesPath);
    cachedOverrides = data;
    cachedAt = Date.now();
    return data;
  } catch {
    cachedOverrides = {};
    cachedAt = Date.now();
    return {};
  }
}

export async function getOverride(matchId: string) {
  if (isSupabaseConfigured()) {
    return await dbGetMatchOverride(matchId);
  }

  const all = await getOverrides();
  return all?.[matchId] ?? null;
}

export async function saveOverride(matchId: string, data: any) {
  if (isSupabaseConfigured()) {
    await dbUpsertMatchOverride(matchId, data);
    if (cachedOverrides) cachedOverrides[matchId] = data;
    return { ok: true as const };
  }

  const all = await getOverrides();
  all[matchId] = data;
  return await saveOverrides(all);
}

export async function saveOverrides(data: any) {
  cachedOverrides = data;
  cachedAt = Date.now();

  if (isSupabaseConfigured()) {
    const items = Object.entries<any>(data || {}).map(([matchId, row]) => ({ matchId, data: row }));
    await dbUpsertManyMatchOverrides(items);
    return { ok: true as const };
  }

  try {
    writeJsonFile(bundledOverridesPath, data);
    return { ok: true as const, path: bundledOverridesPath };
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : String(e) };
  }
}
