import { Match, TeamStanding, DetailedStat, MatchStats, MatchGoal, MatchEvent, TeamPlayers, MatchStatus, FormResult } from '../types';

// --- External API Interfaces (inspired by API-Football / Football-Data.org) ---

export interface ExternalTeam {
  id: number;
  name: string;
  logo: string;
  winner?: boolean;
}

export interface ExternalGoals {
  home: number | null;
  away: number | null;
}

export interface ExternalFixture {
  id: number;
  date: string;
  timestamp: number;
  venue: {
    name: string;
    city: string;
  };
  status: {
    long: string;
    short: string;
    elapsed: number;
  };
}

export interface ExternalMatch {
  fixture: ExternalFixture;
  league: {
    id: number;
    name: string;
    season: number;
    round: string;
  };
  teams: {
    home: ExternalTeam;
    away: ExternalTeam;
  };
  goals: ExternalGoals;
  score: {
    halftime: ExternalGoals;
    fulltime: ExternalGoals;
    extratime: ExternalGoals;
    penalty: ExternalGoals;
  };
  events?: ExternalEvent[];
  lineups?: ExternalLineup[];
  statistics?: ExternalStatistic[];
  players?: unknown[]; // Detailed player stats if available
}

export interface ExternalEvent {
  time: {
    elapsed: number;
    extra?: number;
  };
  team: {
    id: number;
    name: string;
    logo: string;
  };
  player: {
    id: number;
    name: string;
  };
  assist: {
    id: number;
    name: string;
  };
  type: string; // "Goal", "Card", "subst"
  detail: string; // "Normal Goal", "Yellow Card", etc.
}

export interface ExternalLineup {
  team: {
    id: number;
    name: string;
    logo: string;
  };
  formation: string;
  startXI: { player: { id: number; name: string; number: number; pos: string; grid: string } }[];
  substitutes: { player: { id: number; name: string; number: number; pos: string; grid: string } }[];
}

export interface ExternalStatistic {
  team: {
    id: number;
    name: string;
    logo: string;
  };
  statistics: { type: string; value: any }[];
}

export interface ExternalStanding {
  rank: number;
  team: ExternalTeam;
  points: number;
  goalsDiff: number;
  group: string;
  form: string;
  status: string;
  description: string;
  all: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: {
      for: number;
      against: number;
    };
  };
}

// --- Mapper Functions ---

export interface StatoriumStandingItem {
  position?: number;
  rank?: number;
  points?: number;
  played?: number;
  win?: number;
  draw?: number;
  lose?: number;
  goals_for?: number;
  goals_against?: number;
  goalsDiff?: number;
  team?: { name?: string; shortName?: string; logo?: string };
  name?: string;
  logo?: string;
  form?: string;
}

export interface StatoriumMatchItem {
  id?: string | number;
  match_id?: string | number;
  date_start?: string;
  date?: string;
  round?: number | string;
  matchday?: { number?: number };
  venue?: { name?: string } | string;
  stadium?: string;
  status_id?: number;
  status?: number;
  team1?: { name?: string; logo?: string } | string;
  team2?: { name?: string; logo?: string } | string;
  score1?: number | string | null;
  score2?: number | string | null;
}

export function mapExternalStandingToInternal(ext: ExternalStanding): TeamStanding {
  return {
    pos: ext.rank,
    team: ext.team.name,
    played: ext.all.played,
    won: ext.all.win,
    drawn: ext.all.draw,
    lost: ext.all.lose,
    gf: ext.all.goals.for,
    ga: ext.all.goals.against,
    gd: ext.goalsDiff,
    points: ext.points,
    form: ext.form.split('').map(char => {
        // Map W/D/L to internal FormResult if needed, or keep as string
        // Internal expects: 'W' | 'V' | 'D' | 'R' | 'L' | 'P'
        // Assuming 'V' is Win (Vitězství in Czech?), 'R' is Draw (Remíza?), 'P' is Loss (Prohra?)
        // Standard API is W, D, L.
        if (char === 'W') return 'V';
        if (char === 'D') return 'R';
        if (char === 'L') return 'P';
        return 'P'; // Default
    }) as FormResult[],
    logo: ext.team.logo,
  };
}

export function mapExternalMatchToInternal(ext: ExternalMatch): Match {
  const homeTeam = ext.teams.home.name;
  const awayTeam = ext.teams.away.name;
  
  // Map Status
  let status: MatchStatus = 'upcoming';
  if (['FT', 'AET', 'PEN'].includes(ext.fixture.status.short)) {
    status = 'finished';
  } else if (['1H', 'HT', '2H', 'ET', 'P', 'LIVE'].includes(ext.fixture.status.short)) {
    status = 'live';
  }

  // Map Stats
  const stats: MatchStats = {
    possession: [50, 50],
    shots: [0, 0],
    shotsOnTarget: [0, 0],
    corners: [0, 0],
    fouls: [0, 0],
    yellowCards: [0, 0],
    redCards: [0, 0],
    offsides: [0, 0],
  };
  
  const detailedStats: DetailedStat[] = [];

  if (ext.statistics && ext.statistics.length === 2) {
    const homeStats = ext.statistics[0].team.id === ext.teams.home.id ? ext.statistics[0].statistics : ext.statistics[1].statistics;
    const awayStats = ext.statistics[0].team.id === ext.teams.home.id ? ext.statistics[1].statistics : ext.statistics[0].statistics;

    const getStat = (s: { type: string; value: any }[], type: string) => {
        const found = s.find(item => item.type === type);
        return found ? (typeof found.value === 'number' ? found.value : parseInt(found.value || '0')) : 0;
    };

    stats.possession = [getStat(homeStats, 'Ball Possession'), getStat(awayStats, 'Ball Possession')];
    stats.shots = [getStat(homeStats, 'Total Shots'), getStat(awayStats, 'Total Shots')];
    stats.shotsOnTarget = [getStat(homeStats, 'Shots on Goal'), getStat(awayStats, 'Shots on Goal')];
    stats.corners = [getStat(homeStats, 'Corner Kicks'), getStat(awayStats, 'Corner Kicks')];
    stats.fouls = [getStat(homeStats, 'Fouls'), getStat(awayStats, 'Fouls')];
    stats.yellowCards = [getStat(homeStats, 'Yellow Cards'), getStat(awayStats, 'Yellow Cards')];
    stats.redCards = [getStat(homeStats, 'Red Cards'), getStat(awayStats, 'Red Cards')];
    stats.offsides = [getStat(homeStats, 'Offsides'), getStat(awayStats, 'Offsides')];

    // Build DetailedStats if needed
    // Example: Expected Goals
    const homeXG = homeStats.find(s => s.type === 'expected_goals')?.value || 0;
    const awayXG = awayStats.find(s => s.type === 'expected_goals')?.value || 0;
    if (homeXG || awayXG) {
        detailedStats.push({
            label: 'Očekávané góly (xG)',
            home: parseFloat(homeXG),
            away: parseFloat(awayXG),
            homeDisplay: homeXG.toString(),
            awayDisplay: awayXG.toString(),
            color: 'bg-blue-500',
            raw: true
        });
    }
  }

  // Map Goals & Events
  const goals: MatchGoal[] = [];
  const events: MatchEvent[] = [];

  if (ext.events) {
    ext.events.forEach(e => {
        const team = e.team.id === ext.teams.home.id ? 'home' : 'away';
        const minute = e.time.elapsed + (e.time.extra || 0);
        
        if (e.type === 'Goal') {
            goals.push({
                minute,
                team,
                scorer: e.player.name,
                score: '?-?', // Real score at that time requires calculation or tracking
                assist: e.assist.name
            });
            events.push({
                minute,
                type: 'goal',
                team,
                player: e.player.name,
                assist: e.assist.name
            });
        } else if (e.type === 'Card') {
            events.push({
                minute,
                type: e.detail.includes('Yellow') ? 'yellow' : 'red',
                team,
                player: e.player.name
            });
        } else if (e.type === 'subst') {
            events.push({
                minute,
                type: 'substitution',
                team,
                playerOut: e.player.name,
                playerIn: e.assist.name // usually assist field holds player in for subst
            });
        }
    });
  }

  // Map Lineups
  let homeFormation = '';
  let awayFormation = '';
  const homePlayers: TeamPlayers = { gk: [], def: [], mid: [], fwd: [] };
  const awayPlayers: TeamPlayers = { gk: [], def: [], mid: [], fwd: [] };
  
  // Helper to map pos to category
  const mapPos = (pos: string): keyof TeamPlayers => {
      if (pos === 'G') return 'gk';
      if (pos === 'D') return 'def';
      if (pos === 'M') return 'mid';
      if (pos === 'F') return 'fwd';
      return 'mid';
  };

  if (ext.lineups && ext.lineups.length >= 2) {
      const homeL = ext.lineups[0].team.id === ext.teams.home.id ? ext.lineups[0] : ext.lineups[1];
      const awayL = ext.lineups[0].team.id === ext.teams.home.id ? ext.lineups[1] : ext.lineups[0];
      
      homeFormation = homeL.formation;
      awayFormation = awayL.formation;

      homeL.startXI.forEach(p => {
          const cat = mapPos(p.player.pos);
          homePlayers[cat].push(p.player.name);
      });
      awayL.startXI.forEach(p => {
          const cat = mapPos(p.player.pos);
          awayPlayers[cat].push(p.player.name);
      });
  }

  // If status is upcoming, these might be predicted players
  const predictedHomePlayers = status === 'upcoming' ? homePlayers : undefined;
  const predictedAwayPlayers = status === 'upcoming' ? awayPlayers : undefined;

  return {
    id: `api-${ext.fixture.id}`,
    homeTeam,
    awayTeam,
    homeScore: ext.goals.home ?? undefined,
    awayScore: ext.goals.away ?? undefined,
    date: new Date(ext.fixture.date).toLocaleDateString('cs-CZ', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }),
    timestamp: ext.fixture.timestamp, // Added timestamp mapping
    stadium: ext.fixture.venue.name,
    homeLogo: ext.teams.home.logo,
    awayLogo: ext.teams.away.logo,
    status,
    stats: status === 'finished' || status === 'live' ? stats : undefined,
    detailedStats,
    goals,
    events,
    homeFormation,
    awayFormation,
    homePlayers: status !== 'upcoming' ? homePlayers : undefined,
    awayPlayers: status !== 'upcoming' ? awayPlayers : undefined,
    predictedHomePlayers,
    predictedAwayPlayers
  };
}

export function mapStatoriumStandingToInternal(item: StatoriumStandingItem): TeamStanding {
  const pos = (item.position ?? item.rank ?? 0) as number;
  const teamName = item.team?.name ?? item.name ?? '';
  const logo = item.team?.logo ?? item.logo ?? '';
  const played = (item.played ?? 0) as number;
  const won = (item.win ?? 0) as number;
  const drawn = (item.draw ?? 0) as number;
  const lost = (item.lose ?? 0) as number;
  const gf = (item.goals_for ?? 0) as number;
  const ga = (item.goals_against ?? 0) as number;
  const gd = (item.goalsDiff ?? (gf - ga)) as number;
  const points = (item.points ?? 0) as number;
  const formStr = item.form ?? '';
  const formArr = formStr.split('').map(c => {
    if (c === 'W') return 'V';
    if (c === 'D') return 'R';
    if (c === 'L') return 'P';
    return 'P';
  }) as FormResult[];
  return {
    pos,
    team: teamName,
    played,
    won,
    drawn,
    lost,
    gf,
    ga,
    gd,
    points,
    form: formArr,
    logo
  };
}

export function mapStatoriumMatchToInternal(m: StatoriumMatchItem): Match {
  const id = `st-${(m.id ?? m.match_id ?? '')}`;
  const dateIso = (m.date_start ?? m.date ?? '') as string;
  const dateObj = dateIso ? new Date(dateIso) : new Date();
  const roundRaw = (typeof m.round === 'string' ? parseInt(m.round) : (m.round ?? m.matchday?.number ?? 0)) as number;
  const venueName = typeof m.venue === 'string' ? m.venue : (m.venue?.name ?? m.stadium ?? '');
  const statusCode = (m.status_id ?? m.status ?? 0) as number;
  let status: MatchStatus = 'upcoming';
  if (statusCode === 1) status = 'finished';
  else if (statusCode === -1) status = 'live';
  const team1Name = typeof m.team1 === 'string' ? m.team1 : (m.team1?.name ?? '');
  const team2Name = typeof m.team2 === 'string' ? m.team2 : (m.team2?.name ?? '');
  const team1Logo = typeof m.team1 === 'string' ? '' : (m.team1?.logo ?? '');
  const team2Logo = typeof m.team2 === 'string' ? '' : (m.team2?.logo ?? '');
  const s1 = m.score1;
  const s2 = m.score2;
  const homeScore = typeof s1 === 'string' ? parseInt(s1) : (s1 ?? undefined);
  const awayScore = typeof s2 === 'string' ? parseInt(s2) : (s2 ?? undefined);
  return {
    id,
    homeTeam: team1Name,
    awayTeam: team2Name,
    homeScore: status !== 'upcoming' ? homeScore : undefined,
    awayScore: status !== 'upcoming' ? awayScore : undefined,
    date: dateObj.toLocaleDateString('cs-CZ', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }),
    timestamp: dateObj.getTime(),
    stadium: venueName,
    homeLogo: team1Logo,
    awayLogo: team2Logo,
    round: roundRaw,
    status
  };
}
