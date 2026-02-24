import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { 
  mapExternalMatchToInternal, 
  mapExternalStandingToInternal, 
  ExternalMatch, 
  ExternalStanding, 
  mapStatoriumMatchToInternal, 
  mapStatoriumStandingToInternal,
  StatoriumMatchItem,
  StatoriumStandingItem
} from '../../lib/api-mapper';
import { Match } from '@/types';
import { TEAM_LOGOS } from '@/lib/constants';
import { computeStandings } from '@/lib/standings';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Real-data source: fixturedownload.com (publicly viewable JSON embedded in HTML)
async function fetchFixtureDownloadRaw(): Promise<string | null> {
  try {
    const res = await fetch('https://fixturedownload.com/view/json/epl-2025', {
      headers: { 'accept': 'text/html' },
      next: { revalidate: 60 }
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

function htmlDecodeEntities(input: string): string {
  return input
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function extractJsonFromHtmlTextarea(html: string): unknown[] | null {
  const match = html.match(/<textarea[^>]*>([\s\S]*?)<\/textarea>/i);
  if (!match) return null;
  const decoded = htmlDecodeEntities(match[1].trim());
  try {
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

type FDItem = {
  MatchNumber: number;
  RoundNumber: number;
  DateUtc: string;
  Location: string;
  HomeTeam: string;
  AwayTeam: string;
  Group: string | null;
  HomeTeamScore: number | null;
  AwayTeamScore: number | null;
};

function mapFDItemToInternal(m: FDItem): Match {
  const homeLogo = TEAM_LOGOS[m.HomeTeam] || '';
  const awayLogo = TEAM_LOGOS[m.AwayTeam] || '';
  const dateObj = new Date(m.DateUtc.replace(' ', 'T'));
  const finished = typeof m.HomeTeamScore === 'number' && typeof m.AwayTeamScore === 'number';
  
  return {
    id: `fd-${m.MatchNumber}`,
    homeTeam: m.HomeTeam,
    awayTeam: m.AwayTeam,
    homeScore: finished && m.HomeTeamScore !== null ? m.HomeTeamScore : undefined,
    awayScore: finished && m.AwayTeamScore !== null ? m.AwayTeamScore : undefined,
    date: dateObj.toLocaleDateString('cs-CZ', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }),
    timestamp: dateObj.getTime(),
    round: m.RoundNumber,
    stadium: m.Location,
    homeLogo,
    awayLogo,
    status: finished ? 'finished' : 'upcoming'
  };
}

async function fetchRealMatchesFromFD(): Promise<Match[] | null> {
  const html = await fetchFixtureDownloadRaw();
  if (!html) return null;
  const arr = extractJsonFromHtmlTextarea(html);
  if (!arr || !Array.isArray(arr)) return null;
  
  // Validate items look like FDItem before mapping (basic check or just cast)
  const mapped = (arr as FDItem[]).map(mapFDItemToInternal);
  mapped.sort((a, b) => {
    return (a.timestamp ?? 0) - (b.timestamp ?? 0);
  });
  return mapped;
}

// This function would contain the logic to fetch from a real API like football-data.org or api-football.com
// Since we don't have an API key, we return null to signal fallback to local data.
async function fetchFromExternalAPI(endpoint: string) {
  const apiKey = process.env.FOOTBALL_API_KEY;
  if (!apiKey) return null;

  try {
    // Example: API-Football (RapidAPI)
    const res = await fetch(`https://v3.football.api-sports.io/${endpoint}`, {
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': 'v3.football.api-sports.io'
      },
      next: { revalidate: 60 }, // Cache for 60 seconds
    });
    
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.error("External API call failed", e);
    return null;
  }
}

async function fetchFromStatorium(endpoint: 'matches' | 'standings') {
  const apiKey = process.env.STATORIUM_API_KEY;
  const leagueId = process.env.STATORIUM_LEAGUE_ID;
  const seasonId = process.env.STATORIUM_SEASON_ID;
  if (!apiKey || !leagueId || !seasonId) return null;
  const url = `https://api.statorium.com/api/v1/${endpoint}/?league_id=${leagueId}&season_id=${seasonId}&apikey=${apiKey}`;
  try {
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const detail = searchParams.get('detail') === '1';

  try {
    if (type === 'matches') {
      // 1. Try Statorium
      const stMatches = await fetchFromStatorium('matches');
      if (stMatches) {
        const rawList = (Array.isArray(stMatches.matches) ? stMatches.matches : (Array.isArray(stMatches) ? stMatches : [])) as unknown[];
        if (rawList.length > 0) {
          const mapped = rawList.map((m) => mapStatoriumMatchToInternal(m as StatoriumMatchItem));
          mapped.sort((a, b) => (a.timestamp ?? 0) - (b.timestamp ?? 0));
          return NextResponse.json(mapped);
        }
      }

      // 2. Try external API (if key present)
      const externalData = await fetchFromExternalAPI('fixtures?league=39&season=2025');
      if (externalData && externalData.response) {
        let base = externalData.response as ExternalMatch[];
        if (detail) {
          const detailed = await Promise.all(base.map(async (m: any) => {
            const id = m.fixture?.id;
            if (!id) return m;
            const [eventsRes, lineupsRes, statsRes] = await Promise.all([
              fetchFromExternalAPI(`fixtures/events?fixture=${id}`),
              fetchFromExternalAPI(`fixtures/lineups?fixture=${id}`),
              fetchFromExternalAPI(`fixtures/statistics?fixture=${id}`)
            ]);
            const events = Array.isArray(eventsRes?.response) ? eventsRes.response : [];
            const lineups = Array.isArray(lineupsRes?.response) ? lineupsRes.response : [];
            const statistics = Array.isArray(statsRes?.response) ? statsRes.response : [];
            return { ...m, events, lineups, statistics };
          }));
          base = detailed as ExternalMatch[];
        }
        const mappedMatches = base.map((m: ExternalMatch) => mapExternalMatchToInternal(m));
        return NextResponse.json(mappedMatches);
      }

      // 3. Try FixtureDownload real data source (no key required)
      const fdMatches = await fetchRealMatchesFromFD();
      if (fdMatches) {
        return NextResponse.json(fdMatches);
      }

      // 4. Fallback to local data (completed + upcoming) if present
      const completedPath = path.join(process.cwd(), 'app', 'completed.json');
      const upcomingPath = path.join(process.cwd(), 'app', 'upcoming.json');
      
      let completed: Match[] = [];
      let upcoming: Match[] = [];

      if (fs.existsSync(completedPath)) {
        completed = JSON.parse(fs.readFileSync(completedPath, 'utf8'));
      }
      if (fs.existsSync(upcomingPath)) {
        upcoming = JSON.parse(fs.readFileSync(upcomingPath, 'utf8'));
      }

      const localMatches = [...completed, ...upcoming];
      if (Array.isArray(localMatches) && localMatches.length > 0) {
        return NextResponse.json(localMatches);
      }

      // 5. Final empty fallback
      return NextResponse.json([]);
    } else if (type === 'standings') {
      // 1. Try Statorium
      const stStandings = await fetchFromStatorium('standings');
      if (stStandings) {
        const rawList = (Array.isArray(stStandings.standings)
          ? stStandings.standings
          : (Array.isArray(stStandings.table)
            ? stStandings.table
            : (Array.isArray(stStandings) ? stStandings : []))) as unknown[];
        if (rawList.length > 0) {
          const mappedStandings = rawList.map((s) => mapStatoriumStandingToInternal(s as StatoriumStandingItem));
          mappedStandings.sort((a, b) => a.pos - b.pos);
          return NextResponse.json(mappedStandings);
        }
      }

      // 2. Try external API
      const externalData = await fetchFromExternalAPI('standings?league=39&season=2025');
      if (externalData && externalData.response && externalData.response[0] && externalData.response[0].league?.standings) {
        const standingsRaw = externalData.response[0].league.standings[0];
        const mappedStandings = standingsRaw.map((s: ExternalStanding) => mapExternalStandingToInternal(s));
        return NextResponse.json(mappedStandings);
      }

      // 3. Compute standings from FixtureDownload results (Real Data Priority)
      const fdMatches = await fetchRealMatchesFromFD();
      if (fdMatches && fdMatches.length > 0) {
        const standings = computeStandings(fdMatches);
        return NextResponse.json(standings);
      }

      // 4. Prefer local standings file if present
      const standingsPath = path.join(process.cwd(), 'app', 'standings.json');
      if (fs.existsSync(standingsPath)) {
        try {
          const localStandings = JSON.parse(fs.readFileSync(standingsPath, 'utf8'));
          if (Array.isArray(localStandings) && localStandings.length > 0) {
            return NextResponse.json(localStandings);
          }
        } catch {}
      }

      // 5. Compute standings from local matches if available
      const completedPath = path.join(process.cwd(), 'app', 'completed.json');
      const upcomingPath = path.join(process.cwd(), 'app', 'upcoming.json');
      let completed: Match[] = [];
      let upcoming: Match[] = [];
      if (fs.existsSync(completedPath)) {
        completed = JSON.parse(fs.readFileSync(completedPath, 'utf8'));
      }
      if (fs.existsSync(upcomingPath)) {
        upcoming = JSON.parse(fs.readFileSync(upcomingPath, 'utf8'));
      }
      const localMatches = [...completed, ...upcoming];
      if (localMatches.length > 0) {
        const standings = computeStandings(localMatches);
        return NextResponse.json(standings);
      }
      
      // 6. Final empty fallback
      return NextResponse.json([]);
    } else {
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    }
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
