
const https = require('https');

const url = 'https://fixturedownload.com/feed/json/epl-2025';

https.get(url, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const matches = JSON.parse(data);
      const standings = {};

      matches.forEach((match) => {
        if (!match.HomeTeamScore && match.HomeTeamScore !== 0) return; // Skip unplayed matches

        const homeTeam = match.HomeTeam;
        const awayTeam = match.AwayTeam;
        const homeScore = match.HomeTeamScore;
        const awayScore = match.AwayTeamScore;

        if (!standings[homeTeam]) standings[homeTeam] = { name: homeTeam, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0 };
        if (!standings[awayTeam]) standings[awayTeam] = { name: awayTeam, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0 };

        standings[homeTeam].p++;
        standings[awayTeam].p++;
        standings[homeTeam].gf += homeScore;
        standings[homeTeam].ga += awayScore;
        standings[awayTeam].gf += awayScore;
        standings[awayTeam].ga += homeScore;
        standings[homeTeam].gd = standings[homeTeam].gf - standings[homeTeam].ga;
        standings[awayTeam].gd = standings[awayTeam].gf - standings[awayTeam].ga;

        if (homeScore > awayScore) {
          standings[homeTeam].w++;
          standings[homeTeam].pts += 3;
          standings[awayTeam].l++;
        } else if (awayScore > homeScore) {
          standings[awayTeam].w++;
          standings[awayTeam].pts += 3;
          standings[homeTeam].l++;
        } else {
          standings[homeTeam].d++;
          standings[homeTeam].pts += 1;
          standings[awayTeam].d++;
          standings[awayTeam].pts += 1;
        }
      });

      const table = Object.values(standings).sort((a, b) => {
        if (b.pts !== a.pts) return b.pts - a.pts;
        if (b.gd !== a.gd) return b.gd - a.gd;
        return b.gf - a.gf;
      });

      console.log('Pos | Team | P | W | D | L | GF | GA | GD | Pts');
      table.forEach((team, index) => {
        console.log(`${index + 1}. ${team.name}: ${team.p} | ${team.w} | ${team.d} | ${team.l} | ${team.gf} | ${team.ga} | ${team.gd} | ${team.pts}`);
      });

    } catch (error) {
      console.error('Error parsing JSON:', error);
    }
  });

}).on('error', (err) => {
  console.error('Error fetching data:', err);
});
