module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[project]/app/lib/api-mapper.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "mapExternalMatchToInternal",
    ()=>mapExternalMatchToInternal,
    "mapExternalStandingToInternal",
    ()=>mapExternalStandingToInternal,
    "mapStatoriumMatchToInternal",
    ()=>mapStatoriumMatchToInternal,
    "mapStatoriumStandingToInternal",
    ()=>mapStatoriumStandingToInternal
]);
function mapExternalStandingToInternal(ext) {
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
        form: ext.form.split('').map((char)=>{
            // Map W/D/L to internal FormResult if needed, or keep as string
            // Internal expects: 'W' | 'V' | 'D' | 'R' | 'L' | 'P'
            // Assuming 'V' is Win (Vitězství in Czech?), 'R' is Draw (Remíza?), 'P' is Loss (Prohra?)
            // Standard API is W, D, L.
            if (char === 'W') return 'V';
            if (char === 'D') return 'R';
            if (char === 'L') return 'P';
            return 'P'; // Default
        }),
        logo: ext.team.logo
    };
}
function mapExternalMatchToInternal(ext) {
    const homeTeam = ext.teams.home.name;
    const awayTeam = ext.teams.away.name;
    // Map Status
    let status = 'upcoming';
    if ([
        'FT',
        'AET',
        'PEN'
    ].includes(ext.fixture.status.short)) {
        status = 'finished';
    } else if ([
        '1H',
        'HT',
        '2H',
        'ET',
        'P',
        'LIVE'
    ].includes(ext.fixture.status.short)) {
        status = 'live';
    }
    // Map Stats
    const stats = {
        possession: [
            50,
            50
        ],
        shots: [
            0,
            0
        ],
        shotsOnTarget: [
            0,
            0
        ],
        corners: [
            0,
            0
        ],
        fouls: [
            0,
            0
        ],
        yellowCards: [
            0,
            0
        ],
        redCards: [
            0,
            0
        ],
        offsides: [
            0,
            0
        ]
    };
    const detailedStats = [];
    if (ext.statistics && ext.statistics.length === 2) {
        const homeStats = ext.statistics[0].team.id === ext.teams.home.id ? ext.statistics[0].statistics : ext.statistics[1].statistics;
        const awayStats = ext.statistics[0].team.id === ext.teams.home.id ? ext.statistics[1].statistics : ext.statistics[0].statistics;
        const getStat = (s, type)=>{
            const found = s.find((item)=>item.type === type);
            return found ? typeof found.value === 'number' ? found.value : parseInt(found.value || '0') : 0;
        };
        stats.possession = [
            getStat(homeStats, 'Ball Possession'),
            getStat(awayStats, 'Ball Possession')
        ];
        stats.shots = [
            getStat(homeStats, 'Total Shots'),
            getStat(awayStats, 'Total Shots')
        ];
        stats.shotsOnTarget = [
            getStat(homeStats, 'Shots on Goal'),
            getStat(awayStats, 'Shots on Goal')
        ];
        stats.corners = [
            getStat(homeStats, 'Corner Kicks'),
            getStat(awayStats, 'Corner Kicks')
        ];
        stats.fouls = [
            getStat(homeStats, 'Fouls'),
            getStat(awayStats, 'Fouls')
        ];
        stats.yellowCards = [
            getStat(homeStats, 'Yellow Cards'),
            getStat(awayStats, 'Yellow Cards')
        ];
        stats.redCards = [
            getStat(homeStats, 'Red Cards'),
            getStat(awayStats, 'Red Cards')
        ];
        stats.offsides = [
            getStat(homeStats, 'Offsides'),
            getStat(awayStats, 'Offsides')
        ];
        // Build DetailedStats if needed
        // Example: Expected Goals
        const homeXG = homeStats.find((s)=>s.type === 'expected_goals')?.value || 0;
        const awayXG = awayStats.find((s)=>s.type === 'expected_goals')?.value || 0;
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
    const goals = [];
    const events = [];
    if (ext.events) {
        ext.events.forEach((e)=>{
            const team = e.team.id === ext.teams.home.id ? 'home' : 'away';
            const minute = e.time.elapsed + (e.time.extra || 0);
            if (e.type === 'Goal') {
                goals.push({
                    minute,
                    team,
                    scorer: e.player.name,
                    score: '?-?',
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
    const homePlayers = {
        gk: [],
        def: [],
        mid: [],
        fwd: []
    };
    const awayPlayers = {
        gk: [],
        def: [],
        mid: [],
        fwd: []
    };
    // Helper to map pos to category
    const mapPos = (pos)=>{
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
        homeL.startXI.forEach((p)=>{
            const cat = mapPos(p.player.pos);
            homePlayers[cat].push(p.player.name);
        });
        awayL.startXI.forEach((p)=>{
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
        date: new Date(ext.fixture.date).toLocaleDateString('cs-CZ', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }),
        timestamp: ext.fixture.timestamp,
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
function mapStatoriumStandingToInternal(item) {
    const pos = item.position ?? item.rank ?? 0;
    const teamName = item.team?.name ?? item.name ?? '';
    const logo = item.team?.logo ?? item.logo ?? '';
    const played = item.played ?? 0;
    const won = item.win ?? 0;
    const drawn = item.draw ?? 0;
    const lost = item.lose ?? 0;
    const gf = item.goals_for ?? 0;
    const ga = item.goals_against ?? 0;
    const gd = item.goalsDiff ?? gf - ga;
    const points = item.points ?? 0;
    const formStr = item.form ?? '';
    const formArr = formStr.split('').map((c)=>{
        if (c === 'W') return 'V';
        if (c === 'D') return 'R';
        if (c === 'L') return 'P';
        return 'P';
    });
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
function mapStatoriumMatchToInternal(m) {
    const id = `st-${m.id ?? m.match_id ?? ''}`;
    const dateIso = m.date_start ?? m.date ?? '';
    const dateObj = dateIso ? new Date(dateIso) : new Date();
    const roundRaw = typeof m.round === 'string' ? parseInt(m.round) : m.round ?? m.matchday?.number ?? 0;
    const venueName = typeof m.venue === 'string' ? m.venue : m.venue?.name ?? m.stadium ?? '';
    const statusCode = m.status_id ?? m.status ?? 0;
    let status = 'upcoming';
    if (statusCode === 1) status = 'finished';
    else if (statusCode === -1) status = 'live';
    const team1Name = typeof m.team1 === 'string' ? m.team1 : m.team1?.name ?? '';
    const team2Name = typeof m.team2 === 'string' ? m.team2 : m.team2?.name ?? '';
    const team1Logo = typeof m.team1 === 'string' ? '' : m.team1?.logo ?? '';
    const team2Logo = typeof m.team2 === 'string' ? '' : m.team2?.logo ?? '';
    const s1 = m.score1;
    const s2 = m.score2;
    const homeScore = typeof s1 === 'string' ? parseInt(s1) : s1 ?? undefined;
    const awayScore = typeof s2 === 'string' ? parseInt(s2) : s2 ?? undefined;
    return {
        id,
        homeTeam: team1Name,
        awayTeam: team2Name,
        homeScore: status !== 'upcoming' ? homeScore : undefined,
        awayScore: status !== 'upcoming' ? awayScore : undefined,
        date: dateObj.toLocaleDateString('cs-CZ', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }),
        timestamp: dateObj.getTime(),
        stadium: venueName,
        homeLogo: team1Logo,
        awayLogo: team2Logo,
        round: roundRaw,
        status
    };
}
}),
"[project]/app/lib/constants.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "TEAM_LOGOS",
    ()=>TEAM_LOGOS
]);
const TEAM_LOGOS = {
    'Arsenal': 'https://resources.premierleague.com/premierleague/badges/t3.svg',
    'Aston Villa': 'https://resources.premierleague.com/premierleague/badges/t7.svg',
    'Bournemouth': 'https://resources.premierleague.com/premierleague/badges/t91.svg',
    'Brentford': 'https://resources.premierleague.com/premierleague/badges/t94.svg',
    'Brighton': 'https://resources.premierleague.com/premierleague/badges/t36.svg',
    'Brighton & Hove Albion': 'https://resources.premierleague.com/premierleague/badges/t36.svg',
    'Burnley': 'https://resources.premierleague.com/premierleague/badges/t90.svg',
    'Chelsea': 'https://resources.premierleague.com/premierleague/badges/t8.svg',
    'Crystal Palace': 'https://resources.premierleague.com/premierleague/badges/t31.svg',
    'Everton': 'https://resources.premierleague.com/premierleague/badges/t11.svg',
    'Fulham': 'https://resources.premierleague.com/premierleague/badges/t54.svg',
    'Leeds': 'https://resources.premierleague.com/premierleague/badges/t2.svg',
    'Leeds United': 'https://resources.premierleague.com/premierleague/badges/t2.svg',
    'Liverpool': 'https://resources.premierleague.com/premierleague/badges/t14.svg',
    'Man City': 'https://resources.premierleague.com/premierleague/badges/t43.svg',
    'Manchester City': 'https://resources.premierleague.com/premierleague/badges/t43.svg',
    'Man Utd': 'https://resources.premierleague.com/premierleague/badges/t1.svg',
    'Manchester United': 'https://resources.premierleague.com/premierleague/badges/t1.svg',
    'Newcastle': 'https://resources.premierleague.com/premierleague/badges/t4.svg',
    'Newcastle United': 'https://resources.premierleague.com/premierleague/badges/t4.svg',
    "Nott'm Forest": 'https://resources.premierleague.com/premierleague/badges/t17.svg',
    'Nottingham Forest': 'https://resources.premierleague.com/premierleague/badges/t17.svg',
    'Spurs': 'https://resources.premierleague.com/premierleague/badges/t6.svg',
    'Tottenham': 'https://resources.premierleague.com/premierleague/badges/t6.svg',
    'Tottenham Hotspur': 'https://resources.premierleague.com/premierleague/badges/t6.svg',
    'Sunderland': 'https://resources.premierleague.com/premierleague/badges/t56.svg',
    'West Ham': 'https://resources.premierleague.com/premierleague/badges/t21.svg',
    'West Ham United': 'https://resources.premierleague.com/premierleague/badges/t21.svg',
    'Wolves': 'https://resources.premierleague.com/premierleague/badges/t39.svg',
    'Wolverhampton': 'https://resources.premierleague.com/premierleague/badges/t39.svg',
    'Wolverhampton Wanderers': 'https://resources.premierleague.com/premierleague/badges/t39.svg'
};
}),
"[project]/app/lib/standings.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "computeStandings",
    ()=>computeStandings
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/constants.ts [app-route] (ecmascript)");
;
function computeStandings(matches) {
    const table = {};
    // Sort matches by date to calculate form correctly
    const sortedMatches = [
        ...matches
    ].sort((a, b)=>(a.timestamp ?? 0) - (b.timestamp ?? 0));
    sortedMatches.forEach((m)=>{
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
                logo: m.homeLogo || __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TEAM_LOGOS"][ht] || ''
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
                logo: m.awayLogo || __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TEAM_LOGOS"][at] || ''
            };
        }
        // Ensure logos are set (in case they were missing in the first match encountered)
        if (!table[ht].logo) table[ht].logo = m.homeLogo || __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TEAM_LOGOS"][ht] || '';
        if (!table[at].logo) table[at].logo = m.awayLogo || __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TEAM_LOGOS"][at] || '';
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
    const standingsArray = Object.values(table).sort((a, b)=>{
        if (b.points !== a.points) return b.points - a.points;
        if (b.gd !== a.gd) return b.gd - a.gd;
        if (b.gf !== a.gf) return b.gf - a.gf;
        return a.team.localeCompare(b.team);
    });
    // Assign positions and slice form
    standingsArray.forEach((t, i)=>{
        t.pos = i + 1;
        t.form = t.form.slice(-5);
    });
    return standingsArray;
}
}),
"[project]/app/api/football/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "dynamic",
    ()=>dynamic,
    "runtime",
    ()=>runtime
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs [external] (fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$api$2d$mapper$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/api-mapper.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/constants.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$standings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/standings.ts [app-route] (ecmascript)");
;
;
;
;
;
;
const runtime = 'nodejs';
const dynamic = 'force-dynamic';
// Real-data source: fixturedownload.com (publicly viewable JSON embedded in HTML)
async function fetchFixtureDownloadRaw() {
    try {
        const res = await fetch('https://fixturedownload.com/view/json/epl-2025', {
            headers: {
                'accept': 'text/html'
            },
            next: {
                revalidate: 60
            }
        });
        if (!res.ok) return null;
        return await res.text();
    } catch  {
        return null;
    }
}
function htmlDecodeEntities(input) {
    return input.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&apos;/g, "'").replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
}
function extractJsonFromHtmlTextarea(html) {
    const match = html.match(/<textarea[^>]*>([\s\S]*?)<\/textarea>/i);
    if (!match) return null;
    const decoded = htmlDecodeEntities(match[1].trim());
    try {
        return JSON.parse(decoded);
    } catch  {
        return null;
    }
}
function mapFDItemToInternal(m) {
    const homeLogo = __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TEAM_LOGOS"][m.HomeTeam] || '';
    const awayLogo = __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TEAM_LOGOS"][m.AwayTeam] || '';
    const dateObj = new Date(m.DateUtc.replace(' ', 'T'));
    const finished = typeof m.HomeTeamScore === 'number' && typeof m.AwayTeamScore === 'number';
    return {
        id: `fd-${m.MatchNumber}`,
        homeTeam: m.HomeTeam,
        awayTeam: m.AwayTeam,
        homeScore: finished && m.HomeTeamScore !== null ? m.HomeTeamScore : undefined,
        awayScore: finished && m.AwayTeamScore !== null ? m.AwayTeamScore : undefined,
        date: dateObj.toLocaleDateString('cs-CZ', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }),
        timestamp: dateObj.getTime(),
        round: m.RoundNumber,
        stadium: m.Location,
        homeLogo,
        awayLogo,
        status: finished ? 'finished' : 'upcoming'
    };
}
async function fetchRealMatchesFromFD() {
    const html = await fetchFixtureDownloadRaw();
    if (!html) return null;
    const arr = extractJsonFromHtmlTextarea(html);
    if (!arr || !Array.isArray(arr)) return null;
    // Validate items look like FDItem before mapping (basic check or just cast)
    const mapped = arr.map(mapFDItemToInternal);
    mapped.sort((a, b)=>{
        return (a.timestamp ?? 0) - (b.timestamp ?? 0);
    });
    return mapped;
}
// This function would contain the logic to fetch from a real API like football-data.org or api-football.com
// Since we don't have an API key, we return null to signal fallback to local data.
async function fetchFromExternalAPI(endpoint) {
    const apiKey = process.env.FOOTBALL_API_KEY;
    if (!apiKey) return null;
    try {
        // Example: API-Football (RapidAPI)
        const res = await fetch(`https://v3.football.api-sports.io/${endpoint}`, {
            headers: {
                'x-rapidapi-key': apiKey,
                'x-rapidapi-host': 'v3.football.api-sports.io'
            },
            next: {
                revalidate: 60
            }
        });
        if (!res.ok) return null;
        return await res.json();
    } catch (e) {
        console.error("External API call failed", e);
        return null;
    }
}
async function fetchFromStatorium(endpoint) {
    const apiKey = process.env.STATORIUM_API_KEY;
    const leagueId = process.env.STATORIUM_LEAGUE_ID;
    const seasonId = process.env.STATORIUM_SEASON_ID;
    if (!apiKey || !leagueId || !seasonId) return null;
    const url = `https://api.statorium.com/api/v1/${endpoint}/?league_id=${leagueId}&season_id=${seasonId}&apikey=${apiKey}`;
    try {
        const res = await fetch(url, {
            next: {
                revalidate: 60
            }
        });
        if (!res.ok) return null;
        return await res.json();
    } catch  {
        return null;
    }
}
async function GET(request) {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const detail = searchParams.get('detail') === '1';
    try {
        if (type === 'matches') {
            // 1. Try Statorium
            const stMatches = await fetchFromStatorium('matches');
            if (stMatches) {
                const rawList = Array.isArray(stMatches.matches) ? stMatches.matches : Array.isArray(stMatches) ? stMatches : [];
                if (rawList.length > 0) {
                    const mapped = rawList.map((m)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$api$2d$mapper$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["mapStatoriumMatchToInternal"])(m));
                    mapped.sort((a, b)=>(a.timestamp ?? 0) - (b.timestamp ?? 0));
                    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(mapped);
                }
            }
            // 2. Try external API (if key present)
            const externalData = await fetchFromExternalAPI('fixtures?league=39&season=2025');
            if (externalData && externalData.response) {
                let base = externalData.response;
                if (detail) {
                    const detailed = await Promise.all(base.map(async (m)=>{
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
                        return {
                            ...m,
                            events,
                            lineups,
                            statistics
                        };
                    }));
                    base = detailed;
                }
                const mappedMatches = base.map((m)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$api$2d$mapper$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["mapExternalMatchToInternal"])(m));
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(mappedMatches);
            }
            // 3. Try FixtureDownload real data source (no key required)
            const fdMatches = await fetchRealMatchesFromFD();
            if (fdMatches) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(fdMatches);
            }
            // 4. Fallback to local data (completed + upcoming) if present
            const completedPath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(process.cwd(), 'app', 'completed.json');
            const upcomingPath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(process.cwd(), 'app', 'upcoming.json');
            let completed = [];
            let upcoming = [];
            if (__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(completedPath)) {
                completed = JSON.parse(__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readFileSync(completedPath, 'utf8'));
            }
            if (__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(upcomingPath)) {
                upcoming = JSON.parse(__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readFileSync(upcomingPath, 'utf8'));
            }
            const localMatches = [
                ...completed,
                ...upcoming
            ];
            if (Array.isArray(localMatches) && localMatches.length > 0) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(localMatches);
            }
            // 5. Final empty fallback
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json([]);
        } else if (type === 'standings') {
            // 1. Try Statorium
            const stStandings = await fetchFromStatorium('standings');
            if (stStandings) {
                const rawList = Array.isArray(stStandings.standings) ? stStandings.standings : Array.isArray(stStandings.table) ? stStandings.table : Array.isArray(stStandings) ? stStandings : [];
                if (rawList.length > 0) {
                    const mappedStandings = rawList.map((s)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$api$2d$mapper$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["mapStatoriumStandingToInternal"])(s));
                    mappedStandings.sort((a, b)=>a.pos - b.pos);
                    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(mappedStandings);
                }
            }
            // 2. Try external API
            const externalData = await fetchFromExternalAPI('standings?league=39&season=2025');
            if (externalData && externalData.response && externalData.response[0] && externalData.response[0].league?.standings) {
                const standingsRaw = externalData.response[0].league.standings[0];
                const mappedStandings = standingsRaw.map((s)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$api$2d$mapper$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["mapExternalStandingToInternal"])(s));
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(mappedStandings);
            }
            // 3. Prefer local standings file if present
            const standingsPath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(process.cwd(), 'app', 'standings.json');
            if (__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(standingsPath)) {
                try {
                    const localStandings = JSON.parse(__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readFileSync(standingsPath, 'utf8'));
                    if (Array.isArray(localStandings) && localStandings.length > 0) {
                        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(localStandings);
                    }
                } catch  {}
            }
            // 4. Compute standings from local matches if available
            const completedPath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(process.cwd(), 'app', 'completed.json');
            const upcomingPath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(process.cwd(), 'app', 'upcoming.json');
            let completed = [];
            let upcoming = [];
            if (__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(completedPath)) {
                completed = JSON.parse(__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readFileSync(completedPath, 'utf8'));
            }
            if (__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(upcomingPath)) {
                upcoming = JSON.parse(__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readFileSync(upcomingPath, 'utf8'));
            }
            const localMatches = [
                ...completed,
                ...upcoming
            ];
            if (localMatches.length > 0) {
                const standings = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$standings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["computeStandings"])(localMatches);
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(standings);
            }
            // 5. Compute standings from FixtureDownload results
            const fdMatches = await fetchRealMatchesFromFD();
            if (fdMatches && fdMatches.length > 0) {
                const standings = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$standings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["computeStandings"])(fdMatches);
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(standings);
            }
            // 6. Final empty fallback
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json([]);
        } else {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Invalid type parameter'
            }, {
                status: 400
            });
        }
    } catch (error) {
        console.error("API Error:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Internal Server Error'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__cf739dd3._.js.map