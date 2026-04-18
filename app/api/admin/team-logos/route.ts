import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { getSupabaseAdmin, isSupabaseConfigured } from '../../../lib/db';

const DB_PATH = path.join(process.cwd(), 'app', 'team_logos.json');

function shouldFallbackToLocal(errorMessage: string) {
  const msg = (errorMessage || '').toLowerCase();
  return (
    msg.includes('team_logos') &&
    (msg.includes('does not exist') ||
      msg.includes('could not find') ||
      msg.includes('relation') ||
      msg.includes('schema cache'))
  );
}

async function readLocal() {
  try {
    const raw = await fs.readFile(DB_PATH, 'utf8');
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

async function writeLocal(rows: any[]) {
  await fs.writeFile(DB_PATH, JSON.stringify(rows, null, 2));
}

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
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdmin();
      const { data, error } = await supabase
        .from('team_logos')
        .select('team_name,url,updated_at')
        .order('team_name', { ascending: true });
      if (error) {
        if (shouldFallbackToLocal(error.message)) {
          console.log('team_logos: Supabase table missing, falling back to local JSON');
        } else {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
      } else {
        const rows = (data || []).map((r: any) => ({
          teamName: r.team_name,
          url: r.url,
          updatedAt: r.updated_at || null
        }));
        return NextResponse.json({ ok: true, logos: rows });
      }
    }

    const rows = await readLocal();
    rows.sort((a: any, b: any) => String(a.teamName || '').localeCompare(String(b.teamName || ''), 'cs'));
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
      if (isSupabaseConfigured()) {
        const supabase = getSupabaseAdmin();
        const { error } = await supabase.from('team_logos').delete().eq('team_name', teamName);
        if (error) {
          if (shouldFallbackToLocal(error.message)) {
            console.log('team_logos: Supabase table missing on delete, falling back to local JSON');
          } else {
            return NextResponse.json({ error: error.message }, { status: 500 });
          }
        } else {
          return NextResponse.json({ ok: true });
        }
      }

      const rows = await readLocal();
      const next = rows.filter((r: any) => String(r.teamName || '') !== teamName);
      await writeLocal(next);
      return NextResponse.json({ ok: true });
    }

    if (!url) return NextResponse.json({ error: 'Chybí url' }, { status: 400 });

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdmin();
      const { error } = await supabase
        .from('team_logos')
        .upsert({ team_name: teamName, url, updated_at: new Date().toISOString() }, { onConflict: 'team_name' });
      if (error) {
        if (shouldFallbackToLocal(error.message)) {
          console.log('team_logos: Supabase table missing on upsert, falling back to local JSON');
        } else {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
      } else {
        return NextResponse.json({ ok: true });
      }
    }

    const rows = await readLocal();
    const existingIdx = rows.findIndex((r: any) => String(r.teamName || '') === teamName);
    const row = { teamName, url, updatedAt: new Date().toISOString() };
    if (existingIdx >= 0) rows[existingIdx] = row;
    else rows.unshift(row);
    await writeLocal(rows);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
