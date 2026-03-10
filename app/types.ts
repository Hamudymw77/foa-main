export interface DetailedStat {
  label: string;
  home: number;
  away: number;
  homeDisplay: string;
  awayDisplay: string;
  total?: number;
  color: string;
  raw: boolean;
  rawHome?: string;
  rawAway?: string;
}

export interface MatchStats {
  possession: number[];
  shots: number[];
  shotsOnTarget: number[];
  corners: number[];
  fouls: number[];
  yellowCards: number[];
  redCards: number[];
  offsides: number[];
}

export interface MatchGoal {
  minute: number;
  team: 'home' | 'away';
  scorer: string;
  score: string;
  assist?: string;
}

export interface MatchEvent {
  minute: number;
  displayMinute?: string;
  type: 'goal' | 'yellow' | 'red' | 'substitution' | 'injury' | 'yellow_card' | 'red_card';
  team: 'home' | 'away';
  player?: string;
  assist?: string;
  playerOut?: string;
  playerIn?: string;
  score?: string;
}

export interface TeamPlayers {
  gk: string[];
  def: string[];
  mid: string[];
  fwd: string[];
}

export type MatchStatus = 'finished' | 'live' | 'upcoming';

export interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
  date: string;
  kickoff_time?: string;
  timestamp: number;
  matchweek?: number;
  homeLogo: string;
  awayLogo: string;
  round?: number;
  status?: MatchStatus;
  stats?: MatchStats;
  detailedStats?: DetailedStat[];
  goals?: MatchGoal[];
  events?: MatchEvent[];
  homeFormation?: string;
  awayFormation?: string;
  homePlayers?: any;
  awayPlayers?: any;
  stadium?: string;
}

export type FormResult = 'W' | 'V' | 'D' | 'R' | 'L' | 'P';

export interface TeamStanding {
  pos: number;
  team: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
  form: FormResult[];
  logo: string;
}

export interface PlayerStat {
  id: number;
  code: number;
  name: string;
  web_name: string;
  team: string;
  team_code: number;
  position: number;
  goals: number;
  assists: number;
  clean_sheets: number;
  expected_goals: number;
  expected_assists: number;
  total_points: number;
  minutes: number;
  photo: string;
  team_logo: string;
}

export interface Scorer {
  id: string;
  name: string;
  team: string;
  goals: number;
  assists: number;
  countryCode: string; // ISO 2-letter code
  matchesPlayed: number;
  minutesPlayed: number;
  goalsPerMatch: number;
  flag?: string; // Kept for backward compatibility if needed, but preferred usage is countryCode
}

export interface Defense {
  team: string;
  logo: string;
  goalsAgainst: number;
  cleanSheets: number;
  goalsFor?: number;
  possession?: number;
}

export interface Transfer {
  id: string;
  player: string;
  photo?: string;
  position?: string;
  age?: number;
  oldClub: string;
  oldClubLogo?: string;
  newClub: string;
  newClubLogo?: string;
  date: string;
  type: 'permanent' | 'loan' | 'free';
  fee?: string;
  feeEUR?: string;
  feeDisplay?: string;
  contractLength?: string;
  notes?: string;
  deleted?: boolean;
}
