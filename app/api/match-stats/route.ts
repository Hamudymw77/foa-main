import { NextResponse } from 'next/server';

// 1. Exhaustive Team Name Mapper
const teamMap: Record<string, string> = { 
  "Arsenal": "Arsenal", 
  "Aston Villa": "Aston Villa", 
  "Bournemouth": "Bournemouth", 
  "Brentford": "Brentford", 
  "Brighton": "Brighton", 
  "Chelsea": "Chelsea", 
  "Crystal Palace": "Crystal Palace", 
  "Everton": "Everton", 
  "Fulham": "Fulham", 
  "Ipswich": "Ipswich Town", // Corrected
  "Leicester": "Leicester City", // Corrected
  "Liverpool": "Liverpool", 
  "Man City": "Manchester City", 
  "Man Utd": "Manchester United", 
  "Newcastle": "Newcastle", 
  "Nott'm Forest": "Nottingham Forest", 
  "Southampton": "Southampton", 
  "Spurs": "Tottenham", 
  "West Ham": "West Ham United", // Corrected
  "Wolves": "Wolverhampton Wanderers" 
};

// Global cache for fixture lists to avoid hammering the API
let fixturesCache: { [key: string]: { data: any[], timestamp: number } } = {};
const CACHE_DURATION = 3600 * 1000; // 1 hour

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fplMatchId = searchParams.get('matchId');
  const dateParam = searchParams.get('date');
  const homeTeam = searchParams.get('homeTeam');
  const awayTeam = searchParams.get('awayTeam');

  if (!fplMatchId) {
    return NextResponse.json({ error: 'Match ID is required' }, { status: 400 });
  }

  const API_KEY = '8496f0aae44a16dd9510b570c68fef47';
  const API_URL = 'https://v3.football.api-sports.io';

  try {
    // 2. Determine Season Year (Bulletproof Logic)
    let seasonYear = '2025'; // Default
    if (dateParam) {
        // Simple logic: if date is late 2024 or 2025, it's 2024 season. 
        // If it's late 2025 or 2026, it's 2025 season.
        // FPL usually runs Aug-May.
        const year = parseInt(dateParam.split('-')[0]);
        const month = parseInt(dateParam.split('-')[1]);
        
        // If date is Jan-Jun 2026, season is 2025.
        // If date is Aug-Dec 2025, season is 2025.
        if (year === 2026 || (year === 2025 && month >= 7)) {
            seasonYear = '2025';
        } else {
            seasonYear = '2024';
        }
    }
    
    // Override for safety during development if needed
    // seasonYear = '2025'; 

    // -------------------------------------------------------------------------
    // 2. The Bulletproof Fixture Search (Bypass Dates)
    // -------------------------------------------------------------------------
    let allFixtures = [];
    const cacheKey = `PL_${seasonYear}`;

    if (fixturesCache[cacheKey] && (Date.now() - fixturesCache[cacheKey].timestamp < CACHE_DURATION)) {
        console.log(`[Match Stats] Using cached fixtures for season ${seasonYear}`);
        allFixtures = fixturesCache[cacheKey].data;
    } else {
        console.log(`[Match Stats] Fetching ALL fixtures for season ${seasonYear}`);
        const fixturesRes = await fetch(`${API_URL}/fixtures?league=39&season=${seasonYear}`, {
            headers: {
                'x-apisports-key': API_KEY
            }
        });

        if (!fixturesRes.ok) {
            console.error(`[Match Stats] Fixture list fetch failed: ${fixturesRes.status}`);
            return NextResponse.json(getEmptyStats());
        }

        const fixturesData = await fixturesRes.json();
        
        if (fixturesData.errors && Object.keys(fixturesData.errors).length > 0) {
            console.error('[Match Stats] API Errors:', fixturesData.errors);
            return NextResponse.json(getEmptyStats());
        }

        allFixtures = fixturesData.response || [];
        fixturesCache[cacheKey] = { data: allFixtures, timestamp: Date.now() };
    }

    // -------------------------------------------------------------------------
    // 3. Match by Team Names
    // -------------------------------------------------------------------------
    const mappedHome = teamMap[homeTeam || ''] || homeTeam;
    const mappedAway = teamMap[awayTeam || ''] || awayTeam;

    console.log(`[Match Stats] Searching for: ${mappedHome} vs ${mappedAway}`);

    const realMatch = allFixtures.find((m: any) => 
        m.teams.home.name === mappedHome && 
        m.teams.away.name === mappedAway 
    );

    if (!realMatch) {
        console.warn(`[Match Stats] Match NOT found in API-Football list. Season: ${seasonYear}, Teams: ${mappedHome} vs ${mappedAway}`);
        return NextResponse.json(getEmptyStats());
    }

    const realFixtureId = realMatch.fixture.id;
    console.log(`[Match Stats] Found Match ID: ${realFixtureId}`);

    // -------------------------------------------------------------------------
    // 4. Fetch Stats and Handle Rate Limits
    // -------------------------------------------------------------------------
    const statsRes = await fetch(`${API_URL}/fixtures/statistics?fixture=${realFixtureId}`, {
        headers: {
            'x-apisports-key': API_KEY
        },
        next: { revalidate: 300 } // Cache stats for 5 minutes
    });

    if (!statsRes.ok) {
        console.error(`[Match Stats] Stats fetch failed: ${statsRes.status}`);
        return NextResponse.json(getEmptyStats());
    }

    const statsData = await statsRes.json();

    // CRITICAL LOGGING
    if (statsData.errors && Object.keys(statsData.errors).length > 0) {
        console.error('[Match Stats] API Stats Errors:', statsData.errors);
        // Often rate limit or access denied
        return NextResponse.json(getEmptyStats());
    }

    const stats = statsData.response; // Array of 2 objects (Team A, Team B)

    if (!stats || stats.length < 2) {
        console.log('[Match Stats] No stats available for this match (yet).');
        return NextResponse.json(getEmptyStats());
    }

    // Map API-Football format to our UI format
    const mappedStats = mapApiStatsToUi(stats);
    return NextResponse.json(mappedStats);

  } catch (error) {
    console.error("Error fetching match stats:", error);
    return NextResponse.json(getEmptyStats());
  }
}

// Helper to map API-Football response (Array of 2 teams) to our UI Object
function mapApiStatsToUi(apiResponse: any[]) {
    // apiResponse[0] is usually Home, apiResponse[1] is Away (but check .team.id if possible)
    const homeStats = apiResponse[0]?.statistics || [];
    const awayStats = apiResponse[1]?.statistics || [];

    const getValue = (statsArr: any[], type: string) => {
        const stat = statsArr.find(s => s.type === type);
        if (!stat || stat.value === null) return 0;
        
        // Handle percentage strings like "55%"
        if (typeof stat.value === 'string' && stat.value.includes('%')) {
            return parseInt(stat.value.replace('%', ''));
        }
        return stat.value;
    };

    return {
        possession: { 
            home: getValue(homeStats, 'Ball Possession'), 
            away: getValue(awayStats, 'Ball Possession') 
        },
        shotsOnTarget: { 
            home: getValue(homeStats, 'Shots on Goal'), 
            away: getValue(awayStats, 'Shots on Goal') 
        },
        shotsOffTarget: { 
            home: getValue(homeStats, 'Shots off Goal'), 
            away: getValue(awayStats, 'Shots off Goal') 
        },
        corners: { 
            home: getValue(homeStats, 'Corner Kicks'), 
            away: getValue(awayStats, 'Corner Kicks') 
        },
        fouls: { 
            home: getValue(homeStats, 'Fouls'), 
            away: getValue(awayStats, 'Fouls') 
        },
        yellowCards: { 
            home: getValue(homeStats, 'Yellow Cards'), 
            away: getValue(awayStats, 'Yellow Cards') 
        }
    };
}

function getEmptyStats() {
    return { 
        possession: { home: 0, away: 0 }, 
        shotsOnTarget: { home: 0, away: 0 }, 
        shotsOffTarget: { home: 0, away: 0 }, 
        corners: { home: 0, away: 0 }, 
        fouls: { home: 0, away: 0 },
        yellowCards: { home: 0, away: 0 }
    };
}