import { NextResponse } from 'next/server';
import { getOverrides, saveOverrides } from '../../lib/overridesStorage';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { matchId, event, events, status, stats, homeFormation, awayFormation, homePlayers, awayPlayers } = body;

    // 1. Načtení hesla z requestu
    const providedPassword = body?.password?.trim() || '';
    // 2. Načtení hesla z prostředí (ENV)
    const envPassword = process.env.ADMIN_PASSWORD?.trim() || '';

    // 4. Samotná kontrola
    if (!envPassword) {
      return NextResponse.json(
        { error: 'Na serveru není nastaveno ADMIN_PASSWORD. Nastavte ho v prostředí (Environment Variables).' },
        { status: 500 }
      );
    }

    if (providedPassword !== envPassword) {
      return NextResponse.json({ error: 'Unauthorized: Nesprávné heslo' }, { status: 401 });
    }

    if (!matchId) {
      return NextResponse.json({ error: 'Chybí ID zápasu' }, { status: 400 });
    }

    // 2. Načtení stávajících overridů
    const overrides = getOverrides();
    
    if (!overrides[matchId]) {
      overrides[matchId] = {};
    }

    const matchOverrides = overrides[matchId];

    // 3. Aktualizace dat
    
    // Status
    if (status) {
      matchOverrides.status = status;
    }

    // Události - pokud posíláme celé pole 'events' (pro editaci/mazání), přepíšeme vše
    if (events && Array.isArray(events)) {
        matchOverrides.events = events;
    } 
    // Zpětná kompatibilita pro přidání jedné události
    else if (event) {
      if (!matchOverrides.events) {
        matchOverrides.events = [];
      }
      // Generujeme ID pokud chybí
      if (!event.id) event.id = Date.now().toString(); 
      matchOverrides.events.push(event);
    }

    // Statistiky
    if (stats) {
      matchOverrides.stats = stats;
    }

    // Formace a hráči
    if (homeFormation) matchOverrides.homeFormation = homeFormation;
    if (awayFormation) matchOverrides.awayFormation = awayFormation;
    if (homePlayers) matchOverrides.homePlayers = homePlayers;
    if (awayPlayers) matchOverrides.awayPlayers = awayPlayers;

    // 4. Uložení
    const saveResult = saveOverrides(overrides);

    if (!saveResult.ok) {
      return NextResponse.json({ error: 'Chyba při ukládání souboru', details: saveResult.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Data uložena', overrides: matchOverrides });

  } catch (error) {
    console.error('Admin API Error:', error);
    return NextResponse.json({ error: 'Interní chyba serveru' }, { status: 500 });
  }
}
