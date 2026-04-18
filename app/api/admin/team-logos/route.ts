import { NextResponse } from 'next/server';
import { getSupabaseAdmin, isSupabaseConfigured } from '../../../lib/db';

function getPasswordFromRequest(request: Request) {
  const headerPw = request.headers.get('x-admin-password') || '';
  if (headerPw) return headerPw.trim();
  const { searchParams } = new URL(request.url);
  const queryPw = searchParams.get('password') || '';
  return queryPw.trim();
}

function requireAuthOrThrow(providedPassword: string) {
  const envPassword = process.env.ADMIN_PASSWORD?.trim() || '';
  if (!envPassword) {
    return { ok: false as const, res: NextResponse.json({ error: 'Na serveru není nastaveno ADMIN_PASSWORD.' }, { status: 500 }) };
  }
  if (providedPassword !== envPassword) {
    return { ok: false as const, res: NextResponse.json({ error: 'Unauthorized: Nesprávné heslo' }, { status: 401 }) };
  }
  return { ok: true as const };
}

export async function GET(request: Request) {
  const providedPassword = getPasswordFromRequest(request);
  const auth = requireAuthOrThrow(providedPassword);
  if (!auth.ok) return auth.res;

  try {
    if (!isSupabaseConfigured()) {
      console.error('team_logos: Supabase není nakonfigurovaný (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).');
      return NextResponse.json({ error: 'Supabase není nakonfigurovaný.' }, { status: 500 });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('team_logos')
      .select('team_name,url,updated_at')
      .order('team_name', { ascending: true });
    if (error) {
      console.error('team_logos: DB select error', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const rows = (data || []).map((r: any) => ({
      teamName: r.team_name,
      url: r.url,
      updatedAt: r.updated_at || null
    }));
    return NextResponse.json({ ok: true, logos: rows });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const providedPassword = String(body?.password || '').trim();
    const auth = requireAuthOrThrow(providedPassword);
    if (!auth.ok) return auth.res;

    const action = String(body?.action || 'upsert').trim();
    const teamName = String(body?.teamName || '').trim();
    const url = String(body?.url || '').trim();

    if (!teamName) return NextResponse.json({ error: 'Chybí teamName' }, { status: 400 });

    if (action === 'delete') {
      if (!isSupabaseConfigured()) {
        console.error('team_logos: Supabase není nakonfigurovaný (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).');
        return NextResponse.json({ error: 'Supabase není nakonfigurovaný.' }, { status: 500 });
      }

      const supabase = getSupabaseAdmin();
      const { error } = await supabase.from('team_logos').delete().eq('team_name', teamName);
      if (error) {
        console.error('team_logos: DB delete error', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ ok: true });
    }

    if (!url) return NextResponse.json({ error: 'Chybí url' }, { status: 400 });

    if (!isSupabaseConfigured()) {
      console.error('team_logos: Supabase není nakonfigurovaný (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).');
      return NextResponse.json({ error: 'Supabase není nakonfigurovaný.' }, { status: 500 });
    }

    const supabase = getSupabaseAdmin();
    const { error } = await (supabase.from('team_logos') as any).upsert(
      { team_name: teamName, url },
      { onConflict: 'team_name' }
    );
    if (error) {
      console.error('team_logos: DB upsert error', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
