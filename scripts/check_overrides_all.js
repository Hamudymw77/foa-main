const fs = require('fs');
const path = require('path');

async function main() {
  const overridesPath = path.join(process.cwd(), 'app', 'admin_overrides.json');
  const overrides = JSON.parse(fs.readFileSync(overridesPath, 'utf8'));

  const fixturesRes = await fetch('https://fantasy.premierleague.com/api/fixtures/');
  const fixtures = await fixturesRes.json();

  const finished = fixtures.filter((f) => f.finished);
  let finishedWithStats = 0;
  let finishedWithNonZeroPossession = 0;
  const missingSample = [];

  for (const m of finished) {
    const o = overrides[String(m.id)];
    if (!o || !o.stats) {
      if (missingSample.length < 20) missingSample.push(String(m.id));
      continue;
    }
    finishedWithStats++;
    const poss = o.stats.possession;
    if (Array.isArray(poss) && poss.length === 2 && poss[0] + poss[1] > 0) {
      finishedWithNonZeroPossession++;
    }
  }

  console.log(
    JSON.stringify(
      {
        totalFinished: finished.length,
        finishedWithStats,
        finishedWithNonZeroPossession,
        missingSample
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
