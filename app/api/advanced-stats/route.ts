import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const matchId = searchParams.get('matchId');

  if (!matchId) {
    return NextResponse.json({ error: 'Match ID is required' }, { status: 400 });
  }

  // TODO: Replace this mock object with actual fetch() from Goaloo/API-Football using process.env.STATS_API_KEY.
  
  // Return realistic mock JSON response
  const stats = { 
    possession: { home: 55, away: 45 }, 
    shotsOnTarget: { home: 6, away: 2 }, 
    shotsOffTarget: { home: 4, away: 3 }, 
    corners: { home: 7, away: 2 }, 
    fouls: { home: 10, away: 12 } 
  };

  return NextResponse.json(stats);
}