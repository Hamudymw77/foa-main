async function main() {
  const id = Number(process.argv[2]);
  if (!id) {
    console.error('Usage: node scripts/check_fixture_status.js <matchId>');
    process.exit(1);
  }

  const fixtures = await fetch('https://fantasy.premierleague.com/api/fixtures/').then((r) => r.json());
  const f = fixtures.find((x) => x.id === id);
  console.log(f ? { id: f.id, finished: f.finished, started: f.started, kickoff_time: f.kickoff_time } : null);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
