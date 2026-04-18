import fs from 'fs/promises';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const root = process.cwd();
const envPath = path.join(root, '.env.local');
const transfersPath = path.join(root, 'app', 'transfers.json');

function parseEnv(content) {
  const out = {};
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    const value = line.slice(eq + 1).trim();
    out[key] = value;
  }
  return out;
}

function normalizeValue(v) {
  if (v == null) return null;
  if (typeof v === 'string' && v.trim() === '') return null;
  return v;
}

function rowKey(r) {
  return [
    r.player,
    r.from_team,
    r.to_team,
    r.fee,
    r.date,
    r.photo,
    r.fromLogo,
    r.toLogo,
    r.is_confirmed ? '1' : '0'
  ]
    .map((x) => String(x ?? ''))
    .join('|');
}

function toRow(t) {
  return {
    player: normalizeValue(t?.player),
    from_team: normalizeValue(t?.from),
    to_team: normalizeValue(t?.to),
    fee: normalizeValue(t?.fee),
    date: normalizeValue(t?.date),
    photo: normalizeValue(t?.photo),
    fromLogo: normalizeValue(t?.fromLogo),
    toLogo: normalizeValue(t?.toLogo),
    is_confirmed: t?.is_confirmed ?? true
  };
}

async function main() {
  const envRaw = await fs.readFile(envPath, 'utf8');
  const env = parseEnv(envRaw);
  const SUPABASE_URL = process.env.SUPABASE_URL || env.SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Chybí SUPABASE_URL nebo SUPABASE_SERVICE_ROLE_KEY.');
  }

  const sourceRaw = await fs.readFile(transfersPath, 'utf8');
  const source = JSON.parse(sourceRaw);
  if (!Array.isArray(source)) {
    throw new Error('app/transfers.json není pole.');
  }

  const rows = source.map(toRow).filter((r) => r.player && r.from_team && r.to_team);
  console.log(`Zdrojové záznamy: ${source.length}, validní pro import: ${rows.length}`);

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  const { data: existing, error: existingErr } = await supabase
    .from('transfers')
    .select('player,from_team,to_team,fee,date,photo,fromLogo,toLogo,is_confirmed');

  if (existingErr) {
    console.error('Supabase Transfer Error:', existingErr);
    throw new Error(existingErr.message || 'Select existing selhal.');
  }

  const existingKeys = new Set((Array.isArray(existing) ? existing : []).map(rowKey));
  const toInsert = rows.filter((r) => !existingKeys.has(rowKey(r)));

  console.log(`V DB už existuje: ${existingKeys.size}, k vložení: ${toInsert.length}`);
  if (toInsert.length === 0) {
    console.log('Není co migrovat.');
    return;
  }

  const chunkSize = 200;
  let inserted = 0;
  for (let i = 0; i < toInsert.length; i += chunkSize) {
    const chunk = toInsert.slice(i, i + chunkSize);
    const { error } = await supabase.from('transfers').insert(chunk);
    if (error) {
      console.error('Supabase Transfer Error:', error);
      throw new Error(error.message || 'Insert selhal.');
    }
    inserted += chunk.length;
    console.log(`Vloženo ${inserted}/${toInsert.length}`);
  }

  const { count, error: countErr } = await supabase.from('transfers').select('*', { count: 'exact', head: true });
  if (countErr) {
    console.error('Supabase Transfer Error:', countErr);
    throw new Error(countErr.message || 'Count selhal.');
  }
  console.log(`Hotovo. Počet řádků v transfers tabulce: ${count ?? 'unknown'}`);
}

main().catch((e) => {
  console.error('Migration failed:', e);
  process.exit(1);
});

