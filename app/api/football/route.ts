import { NextResponse } from 'next/server';
import { getOverrides } from '../../lib/overridesStorage';

const stadiums: Record<string, string> = { 
  "Arsenal": "Emirates Stadium, London", 
  "Aston Villa": "Villa Park, Birmingham", 
  "Bournemouth": "Vitality Stadium, Bournemouth", 
  "Brentford": "Gtech Community Stadium, London", 
  "Brighton": "Amex Stadium, Falmer", 
  "Burnley": "Turf Moor, Burnley", 
  "Chelsea": "Stamford Bridge, London", 
  "Crystal Palace": "Selhurst Park, London", 
  "Everton": "Goodison Park, Liverpool", 
  "Fulham": "Craven Cottage, London", 
  "Ipswich": "Portman Road, Ipswich", 
  "Leeds Utd": "Elland Road, Leeds", 
  "Leeds United": "Elland Road, Leeds", 
  "Leicester": "King Power Stadium, Leicester", 
  "Liverpool": "Anfield, Liverpool", 
  "Man City": "Etihad Stadium, Manchester", 
  "Manchester City": "Etihad Stadium, Manchester", 
  "Man Utd": "Old Trafford, Manchester", 
  "Manchester United": "Old Trafford, Manchester", 
  "Newcastle": "St. James' Park, Newcastle", 
  "Newcastle United": "St. James' Park, Newcastle", 
  "Nott'm Forest": "City Ground, Nottingham", 
  "Nottingham Forest": "City Ground, Nottingham", 
  "Southampton": "St Mary's Stadium, Southampton", 
  "Sunderland": "Stadium of Light, Sunderland", 
  "Spurs": "Tottenham Hotspur Stadium, London", 
  "Tottenham": "Tottenham Hotspur Stadium, London", 
  "West Ham": "London Stadium, London", 
  "West Ham United": "London Stadium, London", 
  "Wolves": "Molineux Stadium, Wolverhampton", 
  "Wolverhampton Wanderers": "Molineux Stadium, Wolverhampton" 
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'matches';

  try {
    // 0. Načtení overrides
    const overrides = getOverrides();

    // 1. Stáhnutí základních dat (týmy, hráči)
    const bootstrapRes = await fetch('https://fantasy.premierleague.com/api/bootstrap-static/', { 
        cache: 'no-store',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
    });
    if (!bootstrapRes.ok) throw new Error('FPL Bootstrap selhal');
    const bootstrapData = await bootstrapRes.json();

    const teamsMap = new Map(bootstrapData.teams.map((t: any) => [t.id, { name: t.name, code: t.code }]));
    const playersMap = new Map(bootstrapData.elements.map((p: any) => [p.id, `${p.first_name} ${p.second_name}`]));

    // 2. Stáhnutí zápasů
    const fixturesRes = await fetch('https://fantasy.premierleague.com/api/fixtures/', { 
        next: { revalidate: 60 },
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        cache: 'no-store'
    });
    if (!fixturesRes.ok) throw new Error('FPL Fixtures selhalo');
    const fixturesData = await fixturesRes.json();

    // --- ZPRACOVÁNÍ HRÁČŮ ---
    if (type === 'players') {
       const playersByTeam: any[] = [];
       // Iterujeme přes týmy
       bootstrapData.teams.forEach((t: any) => {
           // Najdeme hráče pro tento tým
           const teamPlayers = bootstrapData.elements
               .filter((p: any) => p.team === t.id)
               .map((p: any) => ({
                   id: p.id,
                   name: `${p.first_name} ${p.second_name}`,
                   position: p.element_type === 1 ? 'GKP' : p.element_type === 2 ? 'DEF' : p.element_type === 3 ? 'MID' : 'FWD',
                   photo: `https://resources.premierleague.com/premierleague25/photos/players/110x140/${p.photo.replace('.jpg', '.png')}`
               }));
           
           playersByTeam.push({
               teamId: t.id,
               teamName: t.name,
               players: teamPlayers
           });
       });
       return NextResponse.json(playersByTeam);
    }

    // --- ZPRACOVÁNÍ ZÁPASŮ ---
    if (type === 'matches') {
      const matches = fixturesData.map((f: any) => {
        const homeTeamData = teamsMap.get(f.team_h) || { name: 'Neznámý', code: 0 };
        const awayTeamData = teamsMap.get(f.team_a) || { name: 'Neznámý', code: 0 };
        const homeTeam = (homeTeamData as any).name;
        const awayTeam = (awayTeamData as any).name;
        
        // Získání override dat pro tento zápas
        const matchId = f.id.toString();
        const matchOverride = overrides[matchId] || {};

        if (matchOverride.hidden) return null;

        // --- MIGRACE STARÝCH FOTEK NA NOVÝ FORMÁT ---
        // Projdeme formace v overrides a opravíme URL fotek, pokud jsou staré
        if (matchOverride) {
            const fixPlayerPhoto = (p: any) => {
                if (p && p.code && !p.customPhoto) {
                    // Nový formát: premierleague25 bez 'p'
                    p.photo = `https://resources.premierleague.com/premierleague25/photos/players/110x140/${p.code}.png`;
                    // Pokud se používá i photoUrl, aktualizujeme ji taky
                    if (p.photoUrl) p.photoUrl = p.photo;
                }
                return p;
            };

            if (matchOverride.homePlayers && Array.isArray(matchOverride.homePlayers)) {
                matchOverride.homePlayers = matchOverride.homePlayers.map(fixPlayerPhoto);
            }
            if (matchOverride.awayPlayers && Array.isArray(matchOverride.awayPlayers)) {
                matchOverride.awayPlayers = matchOverride.awayPlayers.map(fixPlayerPhoto);
            }
            // Poznámka: Změny v matchOverride se zde neukládají zpět do souboru (to dělá jen POST),
            // ale projeví se v odpovědi na frontend, což stačí pro zobrazení.
        }

        let status = matchOverride.status || 'upcoming'; // Override status nebo default
        if (!matchOverride.status) {
           if (f.finished) status = 'finished';
           else if (f.started) status = 'live';
        }

        // Zpracování událostí (jen góly a karty, ignorujeme 'bps', 'saves' atd.)
        let events: any[] = [];
        
        // Pokud má admin vlastní události, použijeme POUZE ty (podle zadání)
        if (matchOverride.events && Array.isArray(matchOverride.events) && matchOverride.events.length > 0) {
           events = matchOverride.events;
        } else if (matchOverride.events && Array.isArray(matchOverride.events) && matchOverride.events.length === 0) {
            // Pokud je v override prázdné pole, znamená to, že admin smazal všechny události (a nechce FPL)
            // Nebo chce prostě prázdné události.
            // Pokud override existuje (i když prázdný), použijeme ho.
            events = [];
        } else {
            // Jinak použijeme FPL
            if (f.stats && f.stats.length > 0) {
              f.stats.forEach((statObj: any) => {
                const identifier = statObj.identifier;
                if (['goals_scored', 'yellow_cards', 'red_cards', 'own_goals'].includes(identifier)) {
                  let eventType = 'goal';
                  if (identifier === 'yellow_cards') eventType = 'yellow';
                  if (identifier === 'red_cards') eventType = 'red';
                  if (identifier === 'own_goals') eventType = 'goal'; // Vlastňák
                  
                  const processStat = (teamStats: any[], teamSide: string) => {
                     teamStats.forEach((s: any) => {
                       // Pokud dal hráč 2 góly (value: 2), přidáme událost dvakrát
                       for(let i=0; i<s.value; i++) {
                          events.push({
                            type: eventType,
                            team: teamSide,
                            player: playersMap.get(s.element) || 'Neznámý hráč',
                            minute: null // FPL neposílá minuty, frontend si s null poradí
                          });
                       }
                     });
                  };
                  
                  processStat(statObj.h, 'home');
                  processStat(statObj.a, 'away');
                }
              });
            }
        }

        // Statistiky - merge s override
        // Defaultní mock stats
        let stats = { possession: [50, 50], shots: [0, 0], shotsOnTarget: [0, 0], corners: [0, 0], fouls: [0, 0] };
        if (matchOverride.stats) {
            stats = { ...stats, ...matchOverride.stats };
        }

        return {
          id: matchId,
          homeTeam,
          awayTeam,
          homeScore: f.team_h_score ?? 0,
          awayScore: f.team_a_score ?? 0,
          date: new Date(f.kickoff_time).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
          kickoff_time: f.kickoff_time, // Raw ISO date for sync
          timestamp: new Date(f.kickoff_time).getTime(),
          matchweek: f.event || 0, // Map event (gameweek) to matchweek
          round: f.event || 0,
          stadium: f.venue ? `${f.venue.city}, ${f.venue.name}` : (stadiums[homeTeam] || 'Premier League'), // Use real venue or fallback to dictionary
          homeLogo: `https://resources.premierleague.com/premierleague/badges/100/t${(homeTeamData as any).code}.png`,
          awayLogo: `https://resources.premierleague.com/premierleague/badges/100/t${(awayTeamData as any).code}.png`,
          status,
          events,
          stats,
          // Další override fields
          homeFormation: matchOverride.homeFormation,
          awayFormation: matchOverride.awayFormation,
          homePlayers: matchOverride.homePlayers,
          awayPlayers: matchOverride.awayPlayers
        };
      }).filter(Boolean);
      return NextResponse.json(matches);
    }

    // --- ZPRACOVÁNÍ STATISTIK (TOP SCORERS atd.) ---
    if (type === 'stats') {
       const players = bootstrapData.elements.map((p: any) => {
         const team = teamsMap.get(p.team);
         // Získání URL loga týmu a kódu země
         // p.team_code (tým), p.code (hráč), p.element_type (pozice)
         
         // Převod stats
         return {
           id: p.id,
           code: p.code,
           name: `${p.first_name} ${p.second_name}`,
           web_name: p.web_name,
           team: (team as any)?.name || 'Unknown',
           team_code: (team as any)?.code,
           position: p.element_type, // 1=GKP, 2=DEF, 3=MID, 4=FWD
           goals: p.goals_scored,
           assists: p.assists,
           clean_sheets: p.clean_sheets,
           expected_goals: parseFloat(p.expected_goals),
           expected_assists: parseFloat(p.expected_assists),
           total_points: p.total_points,
           minutes: p.minutes,
           photo: `https://resources.premierleague.com/premierleague25/photos/players/110x140/${p.code}.png`,
           team_logo: `https://resources.premierleague.com/premierleague/badges/100/t${(team as any)?.code}.png`
         };
       });

       return NextResponse.json(players);
    }

    // --- ZPRACOVÁNÍ TABULKY (počítá se dynamicky ze zápasů) ---
    if (type === 'standings') {
       const table = new Map();
       
       bootstrapData.teams.forEach((t: any) => {
         table.set(t.id, {
           id: t.id, pos: 0, team: t.name, logo: `https://resources.premierleague.com/premierleague/badges/100/t${t.code}.png`,
           played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, points: 0, form: []
         });
       });

       fixturesData.filter((f: any) => f.finished).forEach((f: any) => {
          const home = table.get(f.team_h);
          const away = table.get(f.team_a);
          
          if (home && away) {
              home.played++; away.played++;
              home.gf += f.team_h_score; home.ga += f.team_a_score;
              away.gf += f.team_a_score; away.ga += f.team_h_score;
              
              if (f.team_h_score > f.team_a_score) {
                 home.won++; home.points += 3; home.form.push('W');
                 away.lost++; away.form.push('L');
              } else if (f.team_h_score < f.team_a_score) {
                 away.won++; away.points += 3; away.form.push('W');
                 home.lost++; home.form.push('L');
              } else {
                 home.drawn++; home.points += 1; home.form.push('D');
                 away.drawn++; away.points += 1; away.form.push('D');
              }
          }
       });

       const standingsList = Array.from(table.values()).map(t => {
         t.gd = t.gf - t.ga;
         t.form = t.form.slice(-5).reverse(); // Posledních 5 zápasů
         return t;
       });

       standingsList.sort((a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf);
       standingsList.forEach((t, i) => t.pos = i + 1);

       return NextResponse.json(standingsList);
    }

    return NextResponse.json({ error: 'Neznámý dotaz' }, { status: 400 });

  } catch (error) {
    console.error('FPL API Error:', error);
    return NextResponse.json({ error: 'Chyba serveru při FPL' }, { status: 500 });
  }
}
