import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// --- CONFIGURATION ---
const API_KEY = '8496f0aae44a16dd9510b570c68fef47';
const API_URL = 'https://v3.football.api-sports.io';
const OVERRIDES_FILE = path.join(process.cwd(), 'app', 'admin_overrides.json');

// --- TEAM MAPPING ---
// Maps FPL Team Name -> API-Football Team Name
const teamMap: Record<string, string> = { 
  "Arsenal": "Arsenal", 
  "Aston Villa": "Aston Villa", 
  "Bournemouth": "Bournemouth", 
  "Brentford": "Brentford", 
  "Brighton": "Brighton", 
  "Burnley": "Burnley",
  "Chelsea": "Chelsea", 
  "Crystal Palace": "Crystal Palace", 
  "Everton": "Everton", 
  "Fulham": "Fulham", 
  "Ipswich": "Ipswich", 
  "Leicester": "Leicester", 
  "Liverpool": "Liverpool", 
  "Luton": "Luton Town",
  "Man City": "Manchester City", 
  "Man Utd": "Manchester United", 
  "Newcastle": "Newcastle", 
  "Nott'm Forest": "Nottingham Forest", 
  "Sheffield Utd": "Sheffield United",
  "Southampton": "Southampton", 
  "Spurs": "Tottenham", 
  "West Ham": "West Ham", 
  "Wolves": "Wolverhampton Wanderers" 
};

// --- HELPER FUNCTIONS ---

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
    // We assume current season is 2024 or 2025 based on FPL data
    // Let's fetch both to be safe
    const fixtures2024 = await fetchSeasonFixtures('2024');
    const fixtures2025 = await fetchSeasonFixtures('2025');
    const allApiFixtures = [...fixtures2024, ...fixtures2025];

    console.log(`Loaded ${allApiFixtures.length} API-Football fixtures.`);

    // 4. Iterate through finished matches
    // Sort by date descending to prioritize recent matches if script times out?
    // Or ascending to fill history first? Let's do ascending.
    const finishedMatches = fplFixtures.filter((f: any) => f.finished);

    for (const match of finishedMatches) {
        const matchId = match.id.toString();
        const currentOverride = overrides[matchId] || {};

        // Check if stats are already populated
        const hasStats = currentOverride.stats && 
                         currentOverride.stats.possession && 
                         (currentOverride.stats.possession[0] + currentOverride.stats.possession[1] > 0);

        if (hasStats) {
            skippedCount++;
            continue;
        }

        console.log(`Processing match ${matchId}...`);

        const homeTeamName = fplTeamsMap.get(match.team_h);
        const awayTeamName = fplTeamsMap.get(match.team_a);

        if (!homeTeamName || !awayTeamName) {
            console.warn(`Could not resolve team names for match ${matchId}`);
            failedCount++;
            continue;
        }

        // Map to API-Football names
        const mappedHome = teamMap[homeTeamName] || homeTeamName;
        const mappedAway = teamMap[awayTeamName] || awayTeamName;

        // Find match in API-Football list
        // We match by checking if the names are included in each other
        const apiMatch = allApiFixtures.find((m: any) => {
            const apiHome = m.teams.home.name;
            const apiAway = m.teams.away.name;
            
            // Normalize for comparison
            const norm = (s: string) => s.toLowerCase().replace(/fc|cf/g, '').trim();
            
            const homeMatch = norm(apiHome).includes(norm(mappedHome)) || norm(mappedHome).includes(norm(apiHome));
            const awayMatch = norm(apiAway).includes(norm(mappedAway)) || norm(mappedAway).includes(norm(apiAway));

            // Also check date proximity if possible? (Optional but safer)
            // For now, rely on names as they are usually unique per season per matchup
            return homeMatch && awayMatch;
        });

        if (apiMatch) {
            const fixtureId = apiMatch.fixture.id;
            
            // Rate limiting: Sleep 1s before request
            await new Promise(resolve => setTimeout(resolve, 1000));

            const statsResponse = await fetchFixtureStats(fixtureId);
            
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
                    // Re-read to ensure we don't overwrite concurrent changes (though unlikely in this context)
                    overrides = getOverrides(); 
                }

                console.log(`Updated stats for match ${matchId} (${homeTeamName} vs ${awayTeamName})`);

            } else {
                console.warn(`No detailed stats found for fixture ${fixtureId}`);
                failedCount++;
                // Mark as checked so we don't retry immediately?
                overrides[matchId] = {
                     ...currentOverride,
                     statsChecked: true
                };
            }
        } else {
            console.warn(`Match not found in API-Football: ${mappedHome} vs ${mappedAway}`);
            failedCount++;
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