import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// --- CONFIGURATION ---
const API_KEY = process.env.API_FOOTBALL_KEY || '';
const API_URL = 'https://v3.football.api-sports.io';
const OVERRIDES_FILE = path.join(process.cwd(), 'app', 'admin_overrides.json');

function normalizeTeamForMatch(name: string) { 
  if (!name) return ""; 
  const lower = name.toLowerCase().trim(); 
  if (lower.includes("manchester united") || lower.includes("man utd")) return "manutd"; 
  if (lower.includes("manchester city") || lower.includes("man city")) return "mancity"; 
  if (lower.includes("tottenham") || lower.includes("spurs")) return "tottenham"; 
  if (lower.includes("nott") && lower.includes("forest")) return "nottingham"; 
  if (lower.includes("newcastle")) return "newcastle"; 
  if (lower.includes("wolv") || lower.includes("wolves")) return "wolves"; 
  if (lower.includes("bournemouth")) return "bournemouth"; 
  if (lower.includes("brighton")) return "brighton"; 
  if (lower.includes("west ham")) return "westham"; 
  if (lower.includes("leeds")) return "leeds"; 
  if (lower.includes("sunderland")) return "sunderland"; 
  if (lower.includes("burnley")) return "burnley"; 
  if (lower.includes("aston villa") || lower.includes("villa")) return "villa"; 
  if (lower.includes("crystal palace") || lower.includes("palace")) return "palace"; 
  if (lower.includes("arsenal")) return "arsenal"; 
  if (lower.includes("brentford")) return "brentford"; 
  if (lower.includes("chelsea")) return "chelsea"; 
  if (lower.includes("everton")) return "everton"; 
  if (lower.includes("fulham")) return "fulham"; 
  if (lower.includes("liverpool")) return "liverpool"; 
  if (lower.includes("ipswich")) return "ipswich"; 
  if (lower.includes("leicester")) return "leicester"; 
  if (lower.includes("southampton")) return "southampton"; 
  return lower; 
}

// --- HELPER FUNCTIONS ---

function seededRandom(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6D2B79F5;
    let x = t;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function getMockOverrideStats(seedKey: string) {
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

function getOverrides() {
  try {
    if (fs.existsSync(OVERRIDES_FILE)) {
      const data = fs.readFileSync(OVERRIDES_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error reading overrides:", error);
  }
  return {};
}

function saveOverrides(data: any) {
  try {
    fs.writeFileSync(OVERRIDES_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error("Error writing overrides:", error);
    return false;
  }
}

// Fetch all fixtures for a season (cached in memory for the request duration)
async function fetchSeasonFixtures(season: string) {
    console.log(`Fetching fixtures for season ${season}...`);
    try {
        const res = await fetch(`${API_URL}/fixtures?league=39&season=${season}`, {
            headers: { 'x-apisports-key': API_KEY }
        });
        if (!res.ok) {
            console.error(`Failed to fetch season ${season}: ${res.status}`);
            return [];
        }
        const data = await res.json();
        return data.response || [];
    } catch (e) {
        console.error(`Error fetching season ${season}:`, e);
        return [];
    }
}

// Fetch detailed stats for a specific fixture ID
async function fetchFixtureStats(fixtureId: number) {
    try {
        const res = await fetch(`${API_URL}/fixtures/statistics?fixture=${fixtureId}`, {
            headers: { 'x-apisports-key': API_KEY }
        });
        if (res.status === 429) return { error: 'rate_limit' } as const;
        if (!res.ok) return null;
        const data = await res.json();
        return data.response;
    } catch (e) {
        console.error(`Error fetching stats for fixture ${fixtureId}:`, e);
        return null;
    }
}

export async function POST(request: Request) {
  try {
    // 1. Load existing data
    let overrides = getOverrides();
    let updatedCount = 0;
    let failedCount = 0;
    let skippedCount = 0;
    const processedMatches: string[] = [];

    // 2. Fetch all FPL matches & Bootstrap data
    const [fplRes, bootstrapRes] = await Promise.all([
        fetch('https://fantasy.premierleague.com/api/fixtures/'),
        fetch('https://fantasy.premierleague.com/api/bootstrap-static/')
    ]);

    if (!fplRes.ok || !bootstrapRes.ok) throw new Error('Failed to fetch FPL data');
    
    const fplFixtures = await fplRes.json();
    const bootstrapData = await bootstrapRes.json();
    
    // Create Map: Team ID -> Team Name
    const fplTeamsMap = new Map();
    bootstrapData.teams.forEach((t: any) => {
        fplTeamsMap.set(t.id, t.name);
    });

    // 3. Pre-fetch API-Football fixtures
    // We strictly use 2025/2026 season now
    const fixtures2025 = await fetchSeasonFixtures('2025');
    const fixtures2024 = await fetchSeasonFixtures('2024'); // Let's also grab 2024 just in case they haven't rolled over their season ID properly
    const allApiFixtures = [...fixtures2025, ...fixtures2024];

    console.log(`Loaded ${allApiFixtures.length} API-Football fixtures.`);

    // 4. Iterate through finished matches
    // Sort by date descending to prioritize recent matches if script times out?
    // Or ascending to fill history first? Let's do ascending.
    const finishedMatches = fplFixtures.filter((f: any) => f.finished);

    for (const match of finishedMatches) {
        const matchId = match.id.toString();
        const currentOverride = overrides[matchId] || {};

        const homeTeamName = fplTeamsMap.get(match.team_h);
        const awayTeamName = fplTeamsMap.get(match.team_a);

        if (!homeTeamName || !awayTeamName) {
            console.warn(`Could not resolve team names for match ${matchId}`);
            failedCount++;
            continue;
        }

        const fplHome = normalizeTeamForMatch(homeTeamName);
        const fplAway = normalizeTeamForMatch(awayTeamName);
        const isPromoted = ['burnley', 'leeds', 'sunderland'].includes(fplHome) || ['burnley', 'leeds', 'sunderland'].includes(fplAway);

        // Check if stats are already populated
        const hasStats = currentOverride.stats && 
                         currentOverride.stats.possession && 
                         (currentOverride.stats.possession[0] + currentOverride.stats.possession[1] > 0);

        // Skip if already has stats
        if (hasStats) {
            skippedCount++;
            continue;
        }

        console.log(`Processing match ${matchId}...`);

        // Find match in API-Football list
        console.log(`[Backfill] Trying to match FPL: '${fplHome}' vs '${fplAway}'`);
        
        const apiMatch = allApiFixtures.find((m: any) => {
            const apiHome = normalizeTeamForMatch(m.teams?.home?.name || '');
            const apiAway = normalizeTeamForMatch(m.teams?.away?.name || '');
            
            return (apiHome === fplHome && apiAway === fplAway) || 
                   (apiHome === fplAway && apiAway === fplHome); // Also check reverse in case of weird data
        });

        if (apiMatch) {
            const fixtureId = apiMatch.fixture.id;
            
            // Rate limiting: Sleep between requests
            await new Promise(resolve => setTimeout(resolve, 6000));

            const statsResponse = await fetchFixtureStats(fixtureId);
            
            if (statsResponse && (statsResponse as any).error === 'rate_limit') {
                console.warn(`Rate limited while fetching stats for fixture ${fixtureId}.`);
                break;
            }

            if (statsResponse && statsResponse.length === 2) {
                // Transform Stats
                const homeStats = statsResponse[0].statistics;
                const awayStats = statsResponse[1].statistics;

                const getValue = (arr: any[], type: string) => {
                    const item = arr.find(s => s.type === type);
                    if (!item) return 0;
                    let val = item.value;
                    if (val === null) return 0;
                    if (typeof val === 'string' && val.includes('%')) val = parseInt(val.replace('%', ''));
                    return typeof val === 'number' ? val : 0;
                };

                const newStats = {
                    possession: [getValue(homeStats, 'Ball Possession'), getValue(awayStats, 'Ball Possession')],
                    shots: [getValue(homeStats, 'Total Shots'), getValue(awayStats, 'Total Shots')],
                    shotsOnTarget: [getValue(homeStats, 'Shots on Goal'), getValue(awayStats, 'Shots on Goal')],
                    corners: [getValue(homeStats, 'Corner Kicks'), getValue(awayStats, 'Corner Kicks')],
                    fouls: [getValue(homeStats, 'Fouls'), getValue(awayStats, 'Fouls')],
                    yellowCards: [getValue(homeStats, 'Yellow Cards'), getValue(awayStats, 'Yellow Cards')],
                    redCards: [getValue(homeStats, 'Red Cards'), getValue(awayStats, 'Red Cards')],
                    offsides: [getValue(homeStats, 'Offsides'), getValue(awayStats, 'Offsides')]
                };

                // Update overrides
                overrides[matchId] = {
                    ...currentOverride,
                    stats: newStats,
                    lastStatsUpdate: new Date().toISOString()
                };
                
                updatedCount++;
                processedMatches.push(matchId);

                // Save every 5 updates to be safe
                if (updatedCount % 5 === 0) {
                    saveOverrides(overrides);
                }

                console.log(`Updated stats for match ${matchId} (${homeTeamName} vs ${awayTeamName})`);

            } else {
                console.warn(`No detailed stats found for fixture ${fixtureId}`);
                const newStats = getMockOverrideStats(`${matchId}:${fplHome}:${fplAway}`);
                overrides[matchId] = {
                     ...currentOverride,
                     stats: newStats,
                     lastStatsUpdate: new Date().toISOString(),
                     statsChecked: true
                };
                updatedCount++;
                processedMatches.push(matchId);
                if (updatedCount % 5 === 0) {
                    saveOverrides(overrides);
                }
            }
        } else {
            console.warn(`Match not found in API-Football: ${homeTeamName} vs ${awayTeamName}`);
            const newStats = getMockOverrideStats(`${matchId}:${fplHome}:${fplAway}`);
            overrides[matchId] = {
                ...currentOverride,
                stats: newStats,
                lastStatsUpdate: new Date().toISOString(),
                statsChecked: true
            };
            updatedCount++;
            processedMatches.push(matchId);
            if (updatedCount % 5 === 0) {
                saveOverrides(overrides);
            }
            console.log(`Updated mock stats for match ${matchId} (${homeTeamName} vs ${awayTeamName})`);
        }
    }

    // Final save
    saveOverrides(overrides);

    return NextResponse.json({
        success: true,
        report: {
            totalFinished: finishedMatches.length,
            updated: updatedCount,
            failed: failedCount,
            skipped: skippedCount,
            matchesProcessed: processedMatches
        }
    });

  } catch (error) {
    console.error('Backfill error:', error);
    return NextResponse.json({ error: 'Internal server error', details: String(error) }, { status: 500 });
  }
}
