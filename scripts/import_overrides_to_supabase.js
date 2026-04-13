const fs = require('fs');
const path = require('path');

function parseArgs(argv) {
  const args = new Set(argv.slice(2));
  return {
    commit: args.has('--commit'),
    dryRun: args.has('--dry-run') || !args.has('--commit')
  };
}

function loadEnvLocalIfPresent() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) return;

  const raw = fs.readFileSync(envPath, 'utf8');
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;

    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!key) continue;
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

function chunk(array, size) {
  const out = [];
  for (let i = 0; i < array.length; i += size) out.push(array.slice(i, i + size));
  return out;
}

async function main() {
  const { commit, dryRun } = parseArgs(process.argv);
  loadEnvLocalIfPresent();

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Chybí SUPABASE_URL nebo SUPABASE_SERVICE_ROLE_KEY v prostředí (ENV).');
    console.error('Přidej je do .env.local nebo do Netlify Environment Variables a spusť znovu.');
    process.exit(1);
  }

  const overridesPath = path.join(process.cwd(), 'app', 'admin_overrides.json');
  if (!fs.existsSync(overridesPath)) {
    console.error(`Soubor nenalezen: ${overridesPath}`);
    process.exit(1);
  }

  const overrides = JSON.parse(fs.readFileSync(overridesPath, 'utf8'));
  const entries = Object.entries(overrides || {}).map(([matchId, data]) => ({
    match_id: String(matchId),
    data: data ?? {}
  }));

  console.log(JSON.stringify({ totalInJson: entries.length, mode: dryRun ? 'dry-run' : 'commit' }, null, 2));

  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  const batchSize = 500;
  const batches = chunk(entries, batchSize);

  let processed = 0;
  for (let i = 0; i < batches.length; i++) {
    const payload = batches[i];

    if (dryRun) {
      processed += payload.length;
      continue;
    }

    const { error } = await supabase.from('match_overrides').upsert(payload, { onConflict: 'match_id' });
    if (error) {
      console.error(`Chyba při upsert batch ${i + 1}/${batches.length}: ${error.message}`);
      process.exit(1);
    }

    processed += payload.length;
    if ((i + 1) % 5 === 0 || i === batches.length - 1) {
      console.log(`OK: ${processed}/${entries.length}`);
    }
  }

  if (dryRun) {
    console.log('Dry-run hotovo. Pro skutečný import spusť: node scripts/import_overrides_to_supabase.js --commit');
    return;
  }

  console.log('Import hotový.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
