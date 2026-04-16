import { NextResponse } from 'next/server';
import { normalizeTeamName } from '../../lib/api-mapper';
import { getOverride, saveOverride } from '../../lib/overridesStorage';

function normalizeTeamForMatch(name: string) {
  if (!name) return '';
  const lower = name.toLowerCase().trim();
  if (lower.includes('manchester united') || lower.includes('man utd')) return 'manutd';
  if (lower.includes('manchester city') || lower.includes('man city')) return 'mancity';
  if (lower.includes('tottenham') || lower.includes('spurs')) return 'tottenham';
  if (lower.includes('nott') && lower.includes('forest')) return 'nottingham';
  if (lower.includes('newcastle')) return 'newcastle';
  if (lower.includes('wolv') || lower.includes('wolves')) return 'wolves';
  if (lower.includes('bournemouth')) return 'bournemouth';
  if (lower.includes('brighton')) return 'brighton';
  if (lower.includes('west ham')) return 'westham';
  if (lower.includes('leeds')) return 'leeds';
  if (lower.includes('sunderland')) return 'sunderland';
  if (lower.includes('burnley')) return 'burnley';
  if (lower.includes('aston villa') || lower.includes('villa')) return 'villa';
  if (lower.includes('crystal palace') || lower.includes('palace')) return 'palace';
  if (lower.includes('arsenal')) return 'arsenal';
  if (lower.includes('brentford')) return 'brentford';
  if (lower.includes('chelsea')) return 'chelsea';
  if (lower.includes('everton')) return 'everton';
  if (lower.includes('fulham')) return 'fulham';
  if (lower.includes('liverpool')) return 'liverpool';
  if (lower.includes('ipswich')) return 'ipswich';
  if (lower.includes('leicester')) return 'leicester';
  if (lower.includes('southampton')) return 'southampton';
  return lower.replace(/[^a-z0-9]/g, '');
}

function mergeUniqueEvents(existing: any[], incoming: any[]) {
  const out: any[] = [];
  const seen = new Set<string>();
  const add = (ev: any) => {
    const key = `${ev.type || ''}-${ev.minute || ''}-${ev.displayMinute || ''}-${ev.team || ''}-${ev.player || ''}-${ev.playerIn || ''}-${ev.playerOut || ''}`;
    if (seen.has(key)) return;
    seen.add(key);
    out.push(ev);
  };
  (existing || []).forEach(add);
  (incoming || []).forEach(add);
  return out;
}

async function fetchApiFootballStats(homeTeam: string, awayTeam: string, isoDate: string) {
  const API_KEY = process.env.API_FOOTBALL_KEY || '';
  if (!API_KEY) return null;

  const API_URL = 'https://v3.football.api-sports.io';

  const fetchFixtures = async (season: string) => {
    const res = await fetch(`${API_URL}/fixtures?league=39&season=${season}&date=${isoDate}`, {
      headers: { 'x-apisports-key': API_KEY }
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.response || [];
  };

  const [fixtures2025, fixtures2024] = await Promise.all([fetchFixtures('2025'), fetchFixtures('2024')]);
  const allFixtures = [...fixtures2025, ...fixtures2024];

  const fplHome = normalizeTeamForMatch(homeTeam);
  const fplAway = normalizeTeamForMatch(awayTeam);

  const direct = allFixtures.find((m: any) => {
    const apiHome = normalizeTeamForMatch(m.teams?.home?.name || '');
    const apiAway = normalizeTeamForMatch(m.teams?.away?.name || '');
    return apiHome === fplHome && apiAway === fplAway;
  });
  const reverse = allFixtures.find((m: any) => {
    const apiHome = normalizeTeamForMatch(m.teams?.home?.name || '');
    const apiAway = normalizeTeamForMatch(m.teams?.away?.name || '');
    return apiHome === fplAway && apiAway === fplHome;
  });

  const fixture = direct || reverse;
  if (!fixture?.fixture?.id) return null;

  const statsRes = await fetch(`${API_URL}/fixtures/statistics?fixture=${fixture.fixture.id}`, {
    headers: { 'x-apisports-key': API_KEY }
  });
  if (!statsRes.ok) return null;
  const statsData = await statsRes.json();
  const statsResponse = statsData.response;
  if (!statsResponse || statsResponse.length !== 2) return null;

  const homeStats = statsResponse[0].statistics;
  const awayStats = statsResponse[1].statistics;

  const getValue = (arr: any[], type: string) => {
    const item = arr.find((s) => s.type === type);
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

  const poss = newStats.possession;
  if (!Array.isArray(poss) || poss.length !== 2 || poss[0] + poss[1] <= 0) return null;
  return newStats;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let { homeTeam, awayTeam, date, matchId: fplMatchId, password } = body;

    if (!homeTeam || !awayTeam || !date) {
        return NextResponse.json({ error: 'Chybí parametry (homeTeam, awayTeam, date)' }, { status: 400 });
    }

    // Normalize FPL names to standard/ESPN-friendly names
    homeTeam = normalizeTeamName(homeTeam);
    awayTeam = normalizeTeamName(awayTeam);


    // 1. Získání data ve formátu YYYYMMDD pro ESPN
    let dateStr = '';
    
    if (date) {
        if (date.includes('T')) {
            dateStr = date.split('T')[0].replace(/-/g, '');
        } else if (date.includes('.')) {
            // Czech format: 25. 2. 2026
            try {
                const parts = date.split(',')[0].split('.').map((s: string) => s.trim());
                const d = parts[0].padStart(2, '0');
                const m = parts[1].padStart(2, '0');
                const y = parts[2];
                dateStr = `${y}${m}${d}`;
            } catch (e) {
                console.error('Manual date parse failed', e);
            }
        } else {
            // Fallback
            dateStr = date.replace(/[-:T.\s,]/g, '').substring(0, 8);
        }
    }

    if (!dateStr || dateStr.length !== 8) {
         return NextResponse.json({ error: 'Neplatné datum. ESPN vyžaduje YYYYMMDD.' }, { status: 400 });
    }

    const isoDate = `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`;

    // 2. Najít zápas v ESPN Scoreboard
    const scoreboardUrl = `http://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard?dates=${dateStr}`;
    console.log(`Fetching ESPN Scoreboard: ${scoreboardUrl}`);

    const sbRes = await fetch(scoreboardUrl);
    if (!sbRes.ok) {
        throw new Error(`ESPN Scoreboard failed: ${sbRes.status}`);
    }
    const sbData = await sbRes.json();
    
    // Team Name Normalization & Aliases
    const teamAliases: Record<string, string[]> = {
        "Man City": ["Manchester City"],
        "Man Utd": ["Manchester United"],
        "Spurs": ["Tottenham Hotspur", "Tottenham"],
        "Wolves": ["Wolverhampton Wanderers"],
        "Nott'm Forest": ["Nottingham Forest"],
        "Sheffield Utd": ["Sheffield United"],
        "Luton": ["Luton Town"],
        "Brighton": ["Brighton & Hove Albion"]
    };

    let matchId = null;
    let espnHomeId = null;
    let espnAwayId = null;

    const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    // Rozšíříme target o aliasy
    let targetHTerms = [normalize(homeTeam)];
    let targetATerms = [normalize(awayTeam)];
    
    if (teamAliases[homeTeam]) {
        targetHTerms = [...targetHTerms, ...teamAliases[homeTeam].map(normalize)];
    }
    if (teamAliases[awayTeam]) {
        targetATerms = [...targetATerms, ...teamAliases[awayTeam].map(normalize)];
    }
    
    console.log(`Searching for: ${homeTeam} (${targetHTerms.join('|')}) vs ${awayTeam} (${targetATerms.join('|')})`);

    // Projít události (zápasy)
    for (const event of (sbData.events || [])) {
        const comp = event.competitions[0];
        const competitors = comp.competitors; 
        
        const homeComp = competitors.find((c: any) => c.homeAway === 'home');
        const awayComp = competitors.find((c: any) => c.homeAway === 'away');

        if (!homeComp || !awayComp) continue;

        const hName = normalize(homeComp.team.name || homeComp.team.displayName);
        const aName = normalize(awayComp.team.name || awayComp.team.displayName);
        const hShort = normalize(homeComp.team.shortDisplayName || '');
        const aShort = normalize(awayComp.team.shortDisplayName || '');
        
        // Check function
        const checkMatch = (espnNames: string[], targets: string[]) => {
            return targets.some(t => espnNames.some(e => e.includes(t) || t.includes(e)));
        };
        
        const homeMatch = checkMatch([hName, hShort], targetHTerms);
        const awayMatch = checkMatch([aName, aShort], targetATerms);

        if (homeMatch && awayMatch) {
            matchId = event.id;
            espnHomeId = homeComp.id;
            espnAwayId = awayComp.id;
            console.log(`MATCH MATCHED! ID: ${matchId} (${homeComp.team.displayName} vs ${awayComp.team.displayName})`);
            break;
        }
    }

    if (!matchId) {
         // Debug log available matches
         console.log('--- Available Matches on ESPN ---');
         if (sbData.events) {
             sbData.events.forEach((ev: any) => {
                 const competitors = ev.competitions[0].competitors;
                 const h = competitors.find((c: any) => c.homeAway === 'home').team.displayName;
                 const a = competitors.find((c: any) => c.homeAway === 'away').team.displayName;
                 console.log(`- ${h} vs ${a}`);
             });
         }
         
         return NextResponse.json({ 
            error: `Zápas '${homeTeam} vs ${awayTeam}' nenalezen na ESPN (datum: ${dateStr}).` 
        }, { status: 404 });
    }

    // 3. Získat detaily zápasu (Game Summary)
    const summaryUrl = `http://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/summary?event=${matchId}`;
    console.log(`Fetching ESPN Summary: ${summaryUrl}`);
    
    const sumRes = await fetch(summaryUrl);
    if (!sumRes.ok) {
        throw new Error(`ESPN Summary failed: ${sumRes.status}`);
    }
    const sumData = await sumRes.json();
    
    // DEBUG: Check what keys are available
    console.log('Summary Data Keys:', Object.keys(sumData));
    if (sumData.header?.competitions?.[0]) {
        console.log('Header Details Present:', !!sumData.header.competitions[0].details);
    }

    // 4. Parsovat události (Hrubá síla - Deep Scan)
    const allFoundEvents: any[] = [];
    const deepSearch = (obj: any) => {
        if (!obj || typeof obj !== 'object') return;
        
        // Pokud jsme narazili na objekt, který vypadá jako událost
        const text = (obj.text || obj.shortText || obj.type?.text || '').toLowerCase();
        if (text.includes('goal') || text.includes('yellow card') || text.includes('red card') || text.includes('substitution')) {
            // Kontrola, zda už tento objekt nemáme (podle ID)
            if (!allFoundEvents.some(e => e.id && e.id === obj.id)) {
                 allFoundEvents.push(obj);
            }
        }
        
        // Prohledávej dál všechny vnořené prvky
        Object.values(obj).forEach(val => {
            if (typeof val === 'object') deepSearch(val);
        });
    };

    // Spusť skenování celého summaryData
    deepSearch(sumData);

    const uniqueEvents = new Map();

    allFoundEvents.forEach((ke: any) => {
        const rawText = (ke.text || ke.shortText || ke.type?.text || '').toLowerCase();
        
        // FILTR: Ignorujeme chycené střely, penalty co nebyly gól, atd.
        if (rawText.includes('attempt saved') || rawText.includes('missed') || rawText.includes('blocked') || rawText.includes('foul')) return;
        
        let type = null;
        if (rawText.includes('own goal')) type = 'own_goal';
        else if (rawText.includes('penalty goal')) type = 'penalty';
        else if (rawText.includes('goal')) type = 'goal';
        else if (rawText.includes('yellow card')) type = 'yellow_card';
        else if (rawText.includes('red card')) type = 'red_card';
        else if (rawText.includes('substitution') || rawText.includes('replaces')) type = 'substitution';
        
        if (!type) return;

        // 1. OPRAVA ČASU (včetně 90+)
        let minuteDisplay = "";
        const timeMatch = String(ke.text || '').match(/^(\d+)'/);
        
        if (timeMatch) {
            minuteDisplay = timeMatch[1];
        } else {
            const clockStr = String(ke.clock?.displayValue || ke.time || '0');
            minuteDisplay = clockStr.replace(/[']/g, ''); // Odstraní apostrof
        }
        
        // Pokud je to např. 90+7, uložíme jako 97 pro řazení, ale zobrazíme 90+
        let sortMinute = 0;
        if (minuteDisplay.includes('+')) {
             const parts = minuteDisplay.split('+');
             sortMinute = parseInt(parts[0]) + (parseInt(parts[1]) || 0);
        } else {
             sortMinute = parseInt(minuteDisplay) || 0;
        }

        // FILTR: Vyhoď události s minutou 0 nebo 1 (pokud to není reálný gól v 1. minutě),
        // protože to jsou většinou duplicitní shrnutí zápasu na konci JSONu.
        if (sortMinute <= 1 && !String(ke.text || '').startsWith("1'")) return;
        if (sortMinute > 125) return;

        // Určení týmu (Home/Away)
        const teamId = ke.team?.id;
        let teamSide = 'home'; 
        if (teamId === espnAwayId) {
            teamSide = 'away';
        } else if (!teamId) {
            if (ke.participants?.[0]?.team?.id === espnAwayId) {
                teamSide = 'away';
            }
        }

        // 2. EXTRAKCE JMÉNA (vylepšená verze)
        let playerName = "";
        let playerOut = undefined;
        let assist = undefined;
        const cleanText = (ke.text || ke.shortText || '');

        if (type === 'substitution' && cleanText.includes('replaces')) {
            const parts = cleanText.split(/replaces/i);
            const playerIn = parts[0].replace(/^\d+'/g, '').replace(/Substitution,.*?\./g, '').trim();
            const playerOutClean = parts[1].replace(/\./g, '').trim();
            
            playerName = `${playerIn} (vystřídal: ${playerOutClean})`;
            playerOut = playerOutClean;
        } else {
            // Pokud text obsahuje "is shown the", vezmeme jen to, co je před tím (pro karty)
            if (cleanText.includes('is shown')) {
                playerName = cleanText.split(/is shown/i)[0].replace(/^\d+'/g, '').trim();
            } else {
                // Pro góly: odstraníme minutu a slova jako Goal, Penalty atd.
                playerName = cleanText
                    .replace(/^\d+'/g, '') // Odstraní minutu ze začátku
                    .split(/goal|yellow|red|penalty|sub|replac/i)[0] // Usekne text u klíčových slov
                    .trim();
            }
            
            // Asistence
            if (['goal', 'penalty', 'own_goal'].includes(type) && ke.participants && ke.participants.length > 1) {
                 assist = ke.participants[1].athlete?.displayName;
            }
        }
        
        // Pokud by po tom všem zůstalo jméno prázdné, zkusíme vzít jméno z athlete objektu (pokud existuje)
        if (!playerName || playerName.length < 2) {
            playerName = ke.participants?.[0]?.athlete?.displayName || ke.shortText || "Hráč";
        }

        // Normalizace typu pro frontend
        let finalType = type;
        let isOwnGoal = false;
        let isPenalty = false;
        
        if (type === 'own_goal') { finalType = 'goal'; isOwnGoal = true; }
        if (type === 'penalty') { finalType = 'goal'; isPenalty = true; }
        if (type === 'yellow_card') finalType = 'yellow';
        if (type === 'red_card') finalType = 'red';
        if (type === 'substitution') finalType = 'substitution';

        // Úprava jména
        if (isOwnGoal && !playerName.includes('vlastní')) playerName += ' (vlastní)';
        if (isPenalty && !playerName.includes('pen.')) playerName += ' (pen.)';

        // KLÍČ PRO UNIKÁTNOST (Typ + Minuta + první 3 písmena jména)
        const eventKey = `${finalType}-${sortMinute}-${playerName.substring(0,3).toLowerCase()}`;
        
        if (!uniqueEvents.has(eventKey)) {
            uniqueEvents.set(eventKey, {
                id: ke.id || Math.random().toString(36).substr(2, 9),
                type: finalType,
                minute: sortMinute,
                displayMinute: minuteDisplay + "'", // Tady zůstane to 90+7'
                team: teamSide,
                player: playerName.length > 40 ? playerName.substring(0, 40) : playerName,
                playerOut,
                playerIn: finalType === 'substitution' ? playerName.split(' (')[0] : undefined,
                assist,
                isOwnGoal,
                isPenalty
            });
        }
    });

    // Převod Mapy na pole a finální seřazení
    const finalEvents = Array.from(uniqueEvents.values())
        .map((event: any) => {
            // Převede čas typu "90+4" na číslo 94 pro přesné řazení
            const timeParts = String(event.displayMinute || event.minute).replace("'", "").split('+');
            const sortMin = parseInt(timeParts[0]) + (parseInt(timeParts[1]) || 0);
            
            let correctedType = event.type;
            // Pokud v textu nebo jménu vidíme "yellow", "red" nebo "goal", vynutíme správný typ pro ikonku
            const checkText = (event.player + event.type).toLowerCase();
            
            if (checkText.includes('yellow')) correctedType = 'yellow';
            else if (checkText.includes('red')) correctedType = 'red';
            else if (checkText.includes('goal')) correctedType = 'goal';

            return { 
                ...event, 
                type: correctedType,
                sortMin 
            };
        })
        // Seřadí od 1. do 120. minuty
        .sort((a, b) => a.sortMin - b.sortMin);

    if (finalEvents.length === 0) {
         return NextResponse.json({ 
             error: 'Ani hloubkový sken nenašel žádné události. Zkus jiný zápas, tento pravděpodobně nemá na ESPN data.',
             debugData: { keys: Object.keys(sumData) }
         }, { status: 404 });
    }

    const apiFootballStats = await fetchApiFootballStats(homeTeam, awayTeam, isoDate);

    if (fplMatchId) {
      const envPassword = process.env.ADMIN_PASSWORD?.trim() || '';
      const providedPassword = String(password || '').trim();
      if (!envPassword) {
        return NextResponse.json(
          { error: 'Na serveru není nastaveno ADMIN_PASSWORD. Nastavte ho v prostředí (Environment Variables).' },
          { status: 500 }
        );
      }
      if (providedPassword !== envPassword) {
        return NextResponse.json({ error: 'Unauthorized: Nesprávné heslo' }, { status: 401 });
      }

      const existing = (await getOverride(String(fplMatchId))) || {};
      const mergedEvents = mergeUniqueEvents(existing.events || [], finalEvents);

      const nextOverride: any = {
        ...existing,
        events: mergedEvents,
        lastSync: new Date().toISOString()
      };

      if (apiFootballStats) {
        nextOverride.stats = {
          ...(existing.stats || {}),
          ...apiFootballStats
        };
        nextOverride.lastStatsUpdate = new Date().toISOString();
      }

      await saveOverride(String(fplMatchId), nextOverride);
    }

    return NextResponse.json({ success: true, events: finalEvents, stats: apiFootballStats });

  } catch (error: any) {
    console.error('ESPN Sync Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
