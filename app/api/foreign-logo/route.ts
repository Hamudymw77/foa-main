import { NextResponse } from 'next/server';

// Common non-PL teams to avoid API calls
const commonLogos: Record<string, string> = {
  // Spain
  "Real Madrid": "https://media.api-sports.io/football/teams/541.png",
  "Barcelona": "https://media.api-sports.io/football/teams/529.png",
  "Atletico Madrid": "https://media.api-sports.io/football/teams/530.png",
  "Sevilla": "https://media.api-sports.io/football/teams/536.png",
  "Real Sociedad": "https://media.api-sports.io/football/teams/548.png",
  "Girona": "https://media.api-sports.io/football/teams/547.png",
  "Villarreal": "https://media.api-sports.io/football/teams/533.png",
  "Real Betis": "https://media.api-sports.io/football/teams/543.png",

  // Germany
  "Bayern Munich": "https://media.api-sports.io/football/teams/157.png",
  "Borussia Dortmund": "https://media.api-sports.io/football/teams/165.png",
  "Bayer Leverkusen": "https://media.api-sports.io/football/teams/168.png",
  "RB Leipzig": "https://media.api-sports.io/football/teams/173.png",
  "Eintracht Frankfurt": "https://media.api-sports.io/football/teams/169.png",
  "Stuttgart": "https://media.api-sports.io/football/teams/172.png",

  // Italy
  "Juventus": "https://media.api-sports.io/football/teams/496.png",
  "Napoli": "https://media.api-sports.io/football/teams/492.png",
  "AC Milan": "https://media.api-sports.io/football/teams/489.png",
  "Inter": "https://media.api-sports.io/football/teams/505.png",
  "Roma": "https://media.api-sports.io/football/teams/497.png",
  "Lazio": "https://media.api-sports.io/football/teams/487.png",
  "Atalanta": "https://media.api-sports.io/football/teams/499.png",
  "Bologna": "https://media.api-sports.io/football/teams/500.png",

  // France
  "Paris SG": "https://media.api-sports.io/football/teams/85.png",
  "PSG": "https://media.api-sports.io/football/teams/85.png",
  "Marseille": "https://media.api-sports.io/football/teams/81.png",
  "Monaco": "https://media.api-sports.io/football/teams/91.png",
  "Lyon": "https://media.api-sports.io/football/teams/80.png",
  "Lille": "https://media.api-sports.io/football/teams/79.png",

  // Other Major
  "Ajax": "https://media.api-sports.io/football/teams/194.png",
  "PSV": "https://media.api-sports.io/football/teams/197.png",
  "Feyenoord": "https://media.api-sports.io/football/teams/193.png",
  "Benfica": "https://media.api-sports.io/football/teams/211.png",
  "Porto": "https://media.api-sports.io/football/teams/212.png",
  "Sporting CP": "https://media.api-sports.io/football/teams/228.png",
  "Celtic": "https://media.api-sports.io/football/teams/247.png",
  "Rangers": "https://media.api-sports.io/football/teams/252.png",
  "Galatasaray": "https://media.api-sports.io/football/teams/645.png",
  "Fenerbahce": "https://media.api-sports.io/football/teams/600.png",
  "Besiktas": "https://media.api-sports.io/football/teams/607.png",
  "Al-Nassr": "https://media.api-sports.io/football/teams/2522.png",
  "Al-Hilal": "https://media.api-sports.io/football/teams/2523.png",
  "Al-Ahli": "https://media.api-sports.io/football/teams/2524.png",
  "Inter Miami": "https://media.api-sports.io/football/teams/3572.png",
  "Gremio": "https://media.api-sports.io/football/teams/130.png",
  "Metz": "https://media.api-sports.io/football/teams/112.png",
  "Gil Vicente": "https://media.api-sports.io/football/teams/235.png",
  "Club Brugge": "https://media.api-sports.io/football/teams/569.png",
  "Cadiz": "https://media.api-sports.io/football/teams/724.png"
};

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const teamName = searchParams.get('team');

    if (!teamName) {
        return NextResponse.json({ error: 'Team name is required' }, { status: 400 });
    }

    // 1. Check Cache / Hardcoded Dictionary
    if (commonLogos[teamName]) {
        return NextResponse.json({ logo: commonLogos[teamName], source: 'cache' });
    }

    // 2. Fallback to API-Football Search (Expensive, limited rate)
    try {
        const apiKey = process.env.NEXT_PUBLIC_API_FOOTBALL_KEY;
        if (!apiKey) {
            console.error('API Key missing');
            return NextResponse.json({ error: 'API Key missing' }, { status: 500 });
        }

        const res = await fetch(`https://v3.football.api-sports.io/teams?search=${encodeURIComponent(teamName)}`, {
            headers: {
                'x-rapidapi-host': 'v3.football.api-sports.io',
                'x-rapidapi-key': apiKey
            }
        });

        if (!res.ok) {
            throw new Error(`API Error: ${res.status}`);
        }

        const data = await res.json();
        
        if (data.response && data.response.length > 0) {
            // Return first match
            return NextResponse.json({ 
                logo: data.response[0].team.logo,
                source: 'api' 
            });
        }

        return NextResponse.json({ error: 'Team not found' }, { status: 404 });

    } catch (error) {
        console.error('Foreign Logo API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch logo' }, { status: 500 });
    }
}
