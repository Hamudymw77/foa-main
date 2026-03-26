const fs = require('fs');
const path = require('path');

async function main() {
  const matchId = String(process.argv[2] || '');
  if (!matchId) {
    console.error('Usage: node scripts/check_match_override_exists.js <matchId>');
    process.exit(1);
  }

  const overridesPath = path.join(process.cwd(), 'app', 'admin_overrides.json');
  const overrides = JSON.parse(fs.readFileSync(overridesPath, 'utf8'));

  const fixtures = await fetch('https://fantasy.premierleague.com/api/fixtures/').then((r) => r.json());
  const fixture = fixtures.find((f) => String(f.id) === matchId);

  const o = overrides[matchId];

  console.log(
    JSON.stringify(
      {
        matchId,
        fixture: fixture ? { id: fixture.id, finished: fixture.finished, kickoff_time: fixture.kickoff_time } : null,
        overrideHasStats: Boolean(o && o.stats),
        override: o ?? null
      },
      null,
      2
    )
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
