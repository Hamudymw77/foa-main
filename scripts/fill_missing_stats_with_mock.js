const fs = require('fs');
const path = require('path');

function seededRandom(seed) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let x = t;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(input) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function getMockOverrideStats(seedKey) {
  const rand = seededRandom(hashString(seedKey));

  const homePossession = 45 + Math.floor(rand() * 11);
  const awayPossession = 100 - homePossession;

  const shotsHome = Math.floor(rand() * 10) + 6;
  const shotsAway = Math.floor(rand() * 10) + 6;
  const shotsOnTargetHome = Math.floor(rand() * 5) + 2;
  const shotsOnTargetAway = Math.floor(rand() * 5) + 2;
  const cornersHome = Math.floor(rand() * 7) + 2;
  const cornersAway = Math.floor(rand() * 7) + 2;
  const foulsHome = Math.floor(rand() * 10) + 5;
  const foulsAway = Math.floor(rand() * 10) + 5;
  const yellowCardsHome = Math.floor(rand() * 4);
  const yellowCardsAway = Math.floor(rand() * 4);
  const offsidesHome = Math.floor(rand() * 5);
  const offsidesAway = Math.floor(rand() * 5);

  return {
    possession: [homePossession, awayPossession],
    shots: [shotsHome, shotsAway],
    shotsOnTarget: [shotsOnTargetHome, shotsOnTargetAway],
    corners: [cornersHome, cornersAway],
    fouls: [foulsHome, foulsAway],
    yellowCards: [yellowCardsHome, yellowCardsAway],
    redCards: [0, 0],
    offsides: [offsidesHome, offsidesAway]
  };
}

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

  let updated = 0;
  let skipped = 0;
  const updatedIds = [];

  for (const m of fixtures.filter((f) => f.finished)) {
    const matchId = String(m.id);
    const current = overrides[matchId] || {};

    const homeTeamName = idToName.get(m.team_h) || '';
    const awayTeamName = idToName.get(m.team_a) || '';

    const hasStats =
      current.stats &&
      Array.isArray(current.stats.possession) &&
      current.stats.possession.length === 2 &&
      current.stats.possession[0] + current.stats.possession[1] > 0;

    if (hasStats) {
      skipped++;
      continue;
    }

    overrides[matchId] = {
      ...current,
      stats: getMockOverrideStats(`${matchId}:${homeTeamName}:${awayTeamName}`),
      lastStatsUpdate: new Date().toISOString(),
      statsChecked: true
    };
    updated++;
    if (updatedIds.length < 20) updatedIds.push(matchId);
  }

  fs.writeFileSync(overridesPath, JSON.stringify(overrides, null, 2), 'utf8');
  console.log(JSON.stringify({ updated, skipped, sampleUpdatedIds: updatedIds }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
