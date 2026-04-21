import { Match, TeamStanding } from '@/types';
import { resolveTeamLogoUrl } from '@/lib/constants';

export function computeStandings(matches: Match[]): TeamStanding[] {
  const table: Record<string, TeamStanding> = {};

  // Sort matches by date to calculate form correctly
  const sortedMatches = [...matches].sort((a, b) => (a.timestamp ?? 0) - (b.timestamp ?? 0));

  sortedMatches.forEach((m) => {
    // Only count finished matches
    if (m.status !== 'finished') return;

    const ht = m.homeTeam;
    const at = m.awayTeam;

    if (!table[ht]) {
      table[ht] = {
        pos: 0,
        team: ht,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        gf: 0,
        ga: 0,
        gd: 0,
        points: 0,
        form: [],
        logo: resolveTeamLogoUrl(ht, m.homeLogo) || '',
      };
    }

    if (!table[at]) {
      table[at] = {
        pos: 0,
        team: at,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        gf: 0,
        ga: 0,
        gd: 0,
        points: 0,
        form: [],
        logo: resolveTeamLogoUrl(at, m.awayLogo) || '',
      };
    }

    // Ensure logos are set (in case they were missing in the first match encountered)
    if (!table[ht].logo) table[ht].logo = resolveTeamLogoUrl(ht, m.homeLogo) || '';
    if (!table[at].logo) table[at].logo = resolveTeamLogoUrl(at, m.awayLogo) || '';

    const homeScore = m.homeScore ?? 0;
    const awayScore = m.awayScore ?? 0;

    table[ht].played++;
    table[at].played++;

    table[ht].gf += homeScore;
    table[ht].ga += awayScore;
    table[ht].gd = table[ht].gf - table[ht].ga;

    table[at].gf += awayScore;
    table[at].ga += homeScore;
    table[at].gd = table[at].gf - table[at].ga;

    if (homeScore > awayScore) {
      table[ht].won++;
      table[ht].points += 3;
      table[ht].form.push('V');
      table[at].lost++;
      table[at].form.push('P');
    } else if (homeScore < awayScore) {
      table[at].won++;
      table[at].points += 3;
      table[at].form.push('V');
      table[ht].lost++;
      table[ht].form.push('P');
    } else {
      table[ht].drawn++;
      table[ht].points += 1;
      table[ht].form.push('R');
      table[at].drawn++;
      table[at].points += 1;
      table[at].form.push('R');
    }
  });

  const standingsArray = Object.values(table).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.gd !== a.gd) return b.gd - a.gd;
    if (b.gf !== a.gf) return b.gf - a.gf;
    return a.team.localeCompare(b.team);
  });

  // Assign positions and slice form
  standingsArray.forEach((t, i) => {
    t.pos = i + 1;
    t.form = t.form.slice(-5);
  });

  return standingsArray;
}
