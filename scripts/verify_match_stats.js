async function main() {
  const base = 'http://localhost:3000';

  const matchesRes = await fetch(`${base}/api/football?type=matches&detail=1`);
  if (!matchesRes.ok) {
    throw new Error(`Failed to fetch matches: ${matchesRes.status} ${matchesRes.statusText}`);
  }
  const matches = await matchesRes.json();

  const sampleReturning =
    matches.find((m) => m.homeTeam === 'Arsenal' && m.awayTeam === 'Liverpool') ||
    matches.find((m) => m.status === 'finished');

  const samplePromoted = matches.find(
    (m) =>
      ['Burnley', 'Leeds', 'Sunderland'].includes(m.homeTeam) ||
      ['Burnley', 'Leeds', 'Sunderland'].includes(m.awayTeam)
  );

  async function fetchStatsForMatch(match, label) {
    if (!match) {
      console.log(`${label}: none`);
      return;
    }

    const date = (match.kickoff_time || '').split('T')[0];
    const params = new URLSearchParams({
      matchId: String(match.id),
      date,
      homeTeam: match.homeTeam,
      awayTeam: match.awayTeam
    });

    const res = await fetch(`${base}/api/match-stats?${params.toString()}`);
    const json = await res.json();

    console.log(`${label}: ${match.homeTeam} vs ${match.awayTeam}`);
    console.log(json);
  }

  await fetchStatsForMatch(sampleReturning, 'RETURNING');
  await fetchStatsForMatch(samplePromoted, 'PROMOTED');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
