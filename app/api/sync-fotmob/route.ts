import { NextResponse } from 'next/server';
import { normalizeTeamName } from '../../lib/api-mapper';
import { getOverride, saveOverride } from '../../lib/overridesStorage';

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

function normalizeLooseKey(input: string) {
  return String(input || '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

function normalizeTeamKey(input: string) {
  const n = normalizeLooseKey(input);
  if (n.includes('wolverhampton') || n.includes('wolves')) return 'wolves';
  if (n.includes('westham')) return 'westham';
  if (n.includes('manchestercity') || n === 'mancity') return 'mancity';
  if (n.includes('manchesterunited') || n === 'manutd') return 'manutd';
  if (n.includes('tottenham') || n.includes('spurs')) return 'tottenham';
  if (n.includes('nottingham') && n.includes('forest')) return 'nottinghamforest';
  return n;
}

let cachedFplPhotoLookup: { getPhoto: (teamName: string, nameCandidates: string[]) => string | null } | null = null;
let cachedFplPhotoLookupAt = 0;

async function buildFplPhotoLookup() {
  if (cachedFplPhotoLookup && Date.now() - cachedFplPhotoLookupAt < 10 * 60 * 1000) {
    return cachedFplPhotoLookup;
  }
  const bootstrapRes = await fetch('https://fantasy.premierleague.com/api/bootstrap-static/', {
    cache: 'no-store',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  });
  if (!bootstrapRes.ok) throw new Error('FPL Bootstrap selhal');
  const bootstrapData = await bootstrapRes.json();

  const teamIdToKeys = new Map<number, string[]>();
  for (const t of bootstrapData.teams || []) {
    const keys = new Set<string>();
    keys.add(normalizeTeamKey(t.name));
    keys.add(normalizeTeamKey(t.short_name || ''));
    keys.add(normalizeTeamKey(t.name?.replace(' United', '') || ''));
    teamIdToKeys.set(t.id, Array.from(keys).filter(Boolean));
  }

  const byTeam = new Map<string, Map<string, string>>();
  const global = new Map<string, { url: string; count: number }>();

  for (const p of bootstrapData.elements || []) {
    const code = p.code;
    if (!code) continue;
    const photoUrl = `https://resources.premierleague.com/premierleague25/photos/players/110x140/${code}.png`;

    const fullNameKey = normalizeLooseKey(`${p.first_name || ''} ${p.second_name || ''}`);
    const webNameKey = normalizeLooseKey(p.web_name || '');
    const lastNameKey = normalizeLooseKey(p.second_name || '');

    const keys = Array.from(new Set([fullNameKey, webNameKey, lastNameKey].filter(Boolean)));
    const teamKeys = teamIdToKeys.get(p.team) || [];

    for (const tk of teamKeys) {
      if (!byTeam.has(tk)) byTeam.set(tk, new Map());
      const m = byTeam.get(tk)!;
      for (const k of keys) {
        if (!m.has(k)) m.set(k, photoUrl);
      }
    }

    for (const k of keys) {
      const prev = global.get(k);
      if (!prev) global.set(k, { url: photoUrl, count: 1 });
      else global.set(k, { url: prev.url, count: prev.count + 1 });
    }
  }

  const getPhoto = (teamName: string, nameCandidates: string[]) => {
    const teamKey = normalizeTeamKey(teamName);
    const teamMap = byTeam.get(teamKey);
    const keys = nameCandidates.map(normalizeLooseKey).filter(Boolean);
    if (teamMap) {
      for (const k of keys) {
        const u = teamMap.get(k);
        if (u) return u;
      }
    }
    for (const k of keys) {
      const g = global.get(k);
      if (g && g.count === 1) return g.url;
    }
    return null;
  };

  cachedFplPhotoLookup = { getPhoto };
  cachedFplPhotoLookupAt = Date.now();
  return cachedFplPhotoLookup;
}

function parseEspnStats(sumData: any, espnHomeId: string | null, espnAwayId: string | null) {
  const boxTeams = Array.isArray(sumData?.boxscore?.teams) ? sumData.boxscore.teams : [];
  if (!boxTeams.length) return null;

  const byId = (teamId: string | null) =>
    boxTeams.find((t: any) => String(t?.team?.id || t?.team?.uid || '') === String(teamId || ''));

  const homeEntry = byId(espnHomeId) || boxTeams[0];
  const awayEntry = byId(espnAwayId) || boxTeams[1];
  if (!homeEntry || !awayEntry) return null;

  const normalizeKey = (s: string) => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const toNumber = (value: any) => {
    if (value == null) return 0;
    if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
    const parsed = parseInt(String(value).replace('%', '').trim(), 10);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const statMap = (entry: any) => {
    const map = new Map<string, number>();
    const stats = Array.isArray(entry?.statistics) ? entry.statistics : [];
    for (const st of stats) {
      const key = normalizeKey(st?.name || st?.displayName || st?.label || st?.abbreviation || '');
      if (!key) continue;
      map.set(key, toNumber(st?.value ?? st?.displayValue ?? st?.stat));
    }
    return map;
  };

  const h = statMap(homeEntry);
  const a = statMap(awayEntry);

  const pick = (m: Map<string, number>, keys: string[]) => {
    for (const k of keys) {
      if (m.has(k)) return m.get(k) || 0;
    }
    return 0;
  };

  const stats = {
    possession: [pick(h, ['possession', 'ballpossession']), pick(a, ['possession', 'ballpossession'])],
    shots: [pick(h, ['shotstotal', 'totalshots', 'shots']), pick(a, ['shotstotal', 'totalshots', 'shots'])],
    shotsOnTarget: [pick(h, ['shotsongoal', 'shotsontarget', 'ontarget']), pick(a, ['shotsongoal', 'shotsontarget', 'ontarget'])],
    corners: [pick(h, ['cornerkicks', 'corners']), pick(a, ['cornerkicks', 'corners'])],
    fouls: [pick(h, ['foulscommitted', 'fouls']), pick(a, ['foulscommitted', 'fouls'])],
    yellowCards: [pick(h, ['yellowcards']), pick(a, ['yellowcards'])],
    redCards: [pick(h, ['redcards']), pick(a, ['redcards'])],
    offsides: [pick(h, ['offsides']), pick(a, ['offsides'])]
  };

  if (stats.possession[0] + stats.possession[1] <= 0 && stats.shots[0] + stats.shots[1] <= 0) return null;
  return stats;
}

function parseEspnLineups(
  sumData: any,
  espnHomeId: string | null,
  espnAwayId: string | null,
  getPhoto: ((teamName: string, nameCandidates: string[]) => string | null) | null
) {
  const rosters = Array.isArray(sumData?.rosters) ? sumData.rosters : [];
  if (!rosters.length) return null;

  const byId = (teamId: string | null) =>
    rosters.find((r: any) => String(r?.team?.id || r?.team?.uid || '') === String(teamId || ''));

  const homeRoster = byId(espnHomeId) || rosters[0];
  const awayRoster = byId(espnAwayId) || rosters[1];
  if (!homeRoster || !awayRoster) return null;

  const collectPlayers = (roster: any, teamName: string) => {
    const rosterList = Array.isArray(roster?.roster) ? roster.roster : [];
    const out: Array<{ id: string; name: string; number?: number; position?: string; teamName: string; starter: boolean; formationPlace?: number }> = [];
    const seen = new Set<string>();

    for (const item of rosterList) {
      const athlete = item?.athlete;
      const name = athlete?.displayName || athlete?.shortName || athlete?.fullName || athlete?.name;
      const id = String(athlete?.id || athlete?.uid || '');
      if (!id || !name) continue;
      if (seen.has(id)) continue;
      seen.add(id);

      const lastToken = String(name).trim().split(/\s+/).slice(-1)[0] || '';
      const photo = getPhoto ? getPhoto(teamName, [String(name), String(athlete?.shortName || ''), lastToken]) : null;

      const formationPlaceRaw = item?.formationPlace;
      const formationPlace = formationPlaceRaw != null ? parseInt(String(formationPlaceRaw), 10) : undefined;

      out.push({
        id,
        name: String(name),
        number: item?.jersey ? Number(item.jersey) : undefined,
        position: item?.position?.abbreviation || item?.position?.name || athlete?.position?.abbreviation || athlete?.position?.name || undefined,
        teamName,
        starter: item?.starter === true,
        formationPlace: Number.isFinite(formationPlace as any) ? (formationPlace as number) : undefined,
        photo
      });
    }

    const starterOrder = (p: any) => {
      if (typeof p.formationPlace === 'number') return p.formationPlace;
      const pos = String(p.position || '').toLowerCase();
      if (pos.includes('gk') || pos.includes('goal')) return 1;
      if (pos.includes('def') || pos === 'd') return 2;
      if (pos.includes('mid') || pos === 'm') return 3;
      if (pos.includes('for') || pos.includes('fwd') || pos === 'f') return 4;
      return 9;
    };

    const startingRaw = out.filter((p) => p.starter);
    const substitutesRaw = out.filter((p) => !p.starter);

    const starting =
      startingRaw.length > 0
        ? startingRaw.slice().sort((a, b) => starterOrder(a) - starterOrder(b))
        : out.slice().sort((a, b) => starterOrder(a) - starterOrder(b)).slice(0, 11);

    const subs = substitutesRaw.slice().sort((a, b) => starterOrder(a) - starterOrder(b));

    return { starting, substitutes: subs, all: out };
  };

  const homeTeamName = homeRoster?.team?.displayName || homeRoster?.team?.name || 'Home';
  const awayTeamName = awayRoster?.team?.displayName || awayRoster?.team?.name || 'Away';

  const home = collectPlayers(homeRoster, homeTeamName);
  const away = collectPlayers(awayRoster, awayTeamName);
  if (!home.all.length || !away.all.length) return null;

  const competitors = sumData?.header?.competitions?.[0]?.competitors || [];
  const homeComp = competitors.find((c: any) => c?.homeAway === 'home');
  const awayComp = competitors.find((c: any) => c?.homeAway === 'away');

  const homeFormation = homeRoster?.formation || homeComp?.formation || homeComp?.lineup || undefined;
  const awayFormation = awayRoster?.formation || awayComp?.formation || awayComp?.lineup || undefined;

  const mapOut = (p: any) => ({
    id: p.id,
    name: p.name,
    number: p.number,
    position: p.position,
    teamName: p.teamName,
    photo: p.photo || null
  });

  return {
    homeFormation,
    awayFormation,
    homePlayers: home.starting.map(mapOut),
    awayPlayers: away.starting.map(mapOut),
    lineups: {
      home: { teamName: homeTeamName, formation: homeFormation, starting: home.starting.map(mapOut), substitutes: home.substitutes.map(mapOut) },
      away: { teamName: awayTeamName, formation: awayFormation, starting: away.starting.map(mapOut), substitutes: away.substitutes.map(mapOut) }
    }
  };
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

    let photoLookup: { getPhoto: (teamName: string, nameCandidates: string[]) => string | null } | null = null;
    try {
      photoLookup = await buildFplPhotoLookup();
    } catch (e) {
      console.error('FPL photo lookup failed:', e);
    }

    const espnStats = parseEspnStats(sumData, espnHomeId, espnAwayId);
    const espnLineups = parseEspnLineups(sumData, espnHomeId, espnAwayId, photoLookup?.getPhoto || null);
    console.log('ESPN parsed payload:', {
      hasStats: Boolean(espnStats),
      hasLineups: Boolean(espnLineups),
      statsKeys: espnStats ? Object.keys(espnStats) : [],
      homePlayers: espnLineups?.homePlayers?.length || 0,
      awayPlayers: espnLineups?.awayPlayers?.length || 0
    });

    if (finalEvents.length === 0 && !espnStats && !espnLineups) {
      return NextResponse.json(
        { error: 'Synchronizace nenašla žádná data (události, statistiky ani sestavy).', debugData: { keys: Object.keys(sumData) } },
        { status: 404 }
      );
    }

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

      if (espnStats) {
        nextOverride.stats = {
          ...(existing.stats || {}),
          ...espnStats
        };
        nextOverride.lastStatsUpdate = new Date().toISOString();
      }

      if (espnLineups) {
        if (espnLineups.homeFormation) nextOverride.homeFormation = espnLineups.homeFormation;
        if (espnLineups.awayFormation) nextOverride.awayFormation = espnLineups.awayFormation;
        if (espnLineups.homePlayers) nextOverride.homePlayers = espnLineups.homePlayers;
        if (espnLineups.awayPlayers) nextOverride.awayPlayers = espnLineups.awayPlayers;
        nextOverride.lineups = espnLineups.lineups;
        nextOverride.lastLineupsUpdate = new Date().toISOString();
      }

      await saveOverride(String(fplMatchId), nextOverride);
    }

    return NextResponse.json({ success: true, events: finalEvents, stats: espnStats, lineups: espnLineups });

  } catch (error: any) {
    console.error('ESPN Sync Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
