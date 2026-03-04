import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('https://fantasy.premierleague.com/api/bootstrap-static/', {
      next: { revalidate: 3600 },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!res.ok) throw new Error('FPL API Error');
    const data = await res.json();

    const players = data.elements.map((p: any) => ({
      id: p.id,
      code: p.code,
      name: p.web_name,
      fullName: `${p.first_name} ${p.second_name}`,
      team: data.teams.find((t: any) => t.id === p.team)?.name
    }));

    return NextResponse.json(players);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch players' }, { status: 500 });
  }
}
