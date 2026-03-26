const fs = require('fs');
const path = require('path');

async function main() {
  const overridesPath = path.join(process.cwd(), 'app', 'admin_overrides.json');
  const overrides = JSON.parse(fs.readFileSync(overridesPath, 'utf8'));

  const [fixturesRes, bootstrapRes] = await Promise.all([
    fetch('https://fantasy.premierleague.com/api/fixtures/'),
    fetch('https://fantasy.premierleague.com/api/bootstrap-static/')
  ]);

  const fixtures = await fixturesRes.json();
  const bootstrap = await bootstrapRes.json();

  const idToName = new Map(bootstrap.teams.map((t) => [t.id, t.name]));
  const promoted = new Set(['Burnley', 'Leeds', 'Sunderland']);

  let promotedFinished = 0;
  let promotedWithStats = 0;
  let promotedWithNonZeroPossession = 0;

  for (const m of fixtures.filter((f) => f.finished)) {
    const home = idToName.get(m.team_h);
    const away = idToName.get(m.team_a);
    if (!home || !away) continue;

    if (!promoted.has(home) && !promoted.has(away)) continue;

    promotedFinished++;
    const o = overrides[String(m.id)];
    if (!o || !o.stats) continue;
    promotedWithStats++;

    const poss = o.stats.possession;
    if (Array.isArray(poss) && poss.length === 2 && (poss[0] + poss[1] > 0)) {
      promotedWithNonZeroPossession++;
    }
  }

  console.log(JSON.stringify({ promotedFinished, promotedWithStats, promotedWithNonZeroPossession }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
