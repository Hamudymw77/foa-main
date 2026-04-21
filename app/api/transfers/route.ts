import { NextResponse } from 'next/server';
import { getSupabaseAdmin, isSupabaseConfigured } from '../../lib/db';
import { resolveTeamLogoUrl } from '../../lib/constants';

export const dynamic = 'force-dynamic';

function transfersTable() {
  const supabase = getSupabaseAdmin();
  return supabase.from('transfers') as any;
}

function sanitizeUrl(value: any, field: string) {
  if (value == null || value === '') return null;
  if (typeof value === 'string') return value;
  console.error('Transfers invalid payload field:', { field, valueType: typeof value, valuePreview: String(value).slice(0, 120) });
  return null;
}

function resolveTeamLogo(teamName: string, providedUrl: string | null | undefined) {
  const provided = sanitizeUrl(providedUrl, 'teamLogo');
  return resolveTeamLogoUrl(teamName, provided) ?? null;
}

function sanitizePlayerPhoto(photoUrl: string | null | undefined) {
  const safe = sanitizeUrl(photoUrl, 'photo');
  if (!safe) return null;
  // Prevent team badges/logos from being rendered as player avatars.
  if (/\/badges\/t\d+\.(svg|png)/i.test(safe)) return null;
  if (/upload\.wikimedia\.org/i.test(safe) && /logo|crest|icon/i.test(safe)) return null;
  return safe;
}

function mapDbRowToFrontend(row: any) {
  if (!row || typeof row !== 'object') return row;
  const out = { ...row } as any;
  if (out.from_team !== undefined) {
    out.from = out.from_team;
    delete out.from_team;
  }
  if (out.to_team !== undefined) {
    out.to = out.to_team;
    delete out.to_team;
  }
  out.fromLogo = resolveTeamLogo(out.from, out.fromLogo);
  out.toLogo = resolveTeamLogo(out.to, out.toLogo);
  out.photo = sanitizePlayerPhoto(out.photo);
  return out;
}

function inferWindowFromRow(t: any): 'summer_25' | 'winter_26' {
  const window = String(t?.window || '').trim();
  if (window === 'summer_25' || window === 'winter_26') return window;

  const rawDate = String(t?.date || '').trim();
  if (rawDate) {
    const parsed = new Date(rawDate);
    if (!Number.isNaN(parsed.getTime())) {
      const year = parsed.getUTCFullYear();
      const month = parsed.getUTCMonth() + 1;
      if (year === 2026 && month <= 2) return 'winter_26';
      return 'summer_25';
    }

    const m = rawDate.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (m) {
      const year = parseInt(m[1], 10);
      const month = parseInt(m[2], 10);
      if (year === 2026 && month <= 2) return 'winter_26';
      return 'summer_25';
    }
  }

  return 'summer_25';
}

function normalizeTransferPayload(transfer: any) {
  const row: Record<string, any> = {
    player: transfer?.player ?? transfer?.name ?? null,
    from_team: transfer?.from ?? transfer?.from_team ?? null,
    to_team: transfer?.to ?? transfer?.to_team ?? null,
    fee: transfer?.fee ?? null,
    date: transfer?.date ?? null,
    photo: sanitizeUrl(transfer?.photo, 'photo'),
    fromLogo: sanitizeUrl(transfer?.fromLogo, 'fromLogo'),
    toLogo: sanitizeUrl(transfer?.toLogo, 'toLogo'),
    is_confirmed: transfer?.is_confirmed ?? true
  };

  // Keep existing app fields when present (frontend currently uses these).
  if (transfer?.window !== undefined) row.window = transfer.window;
  if (transfer?.type !== undefined) row.type = transfer.type;
  if (transfer?.deleted !== undefined) row.deleted = Boolean(transfer.deleted);

  return row;
}

function ensureSupabaseOrError() {
  if (!isSupabaseConfigured()) {
    console.error('Supabase Transfer Error:', 'Supabase není nakonfigurovaný (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).');
    return NextResponse.json({ error: 'Supabase není nakonfigurovaný.' }, { status: 500 });
  }
  return null;
}

export async function GET(request: Request) {
  try {
    const configError = ensureSupabaseOrError();
    if (configError) return configError;

    const { searchParams } = new URL(request.url);
    const includeDeleted = searchParams.get('includeDeleted') === 'true';
    const { data, error } = await transfersTable().select('*');
    if (error) {
      console.error('Supabase Transfer Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const transfers = (Array.isArray(data) ? data : []).map(mapDbRowToFrontend);
    const visibleTransfers = includeDeleted ? transfers : transfers.filter((t: any) => !t.deleted);

    const withWindow = visibleTransfers.map((t: any) => ({ ...t, window: inferWindowFromRow(t) }));
    const summer = withWindow.filter((t: any) => t.window === 'summer_25');
    const winter = withWindow.filter((t: any) => t.window === 'winter_26');

    console.log('Transfers GET debug:', {
      total: transfers.length,
      visible: visibleTransfers.length,
      summer: summer.length,
      winter: winter.length
    });

    // If fetching deleted specifically (e.g. for trash view), we might want a flat list or separated
    // For now, returning standard structure but filtered is consistent.
    // If includeDeleted is true, we return ALL. The frontend can filter by t.deleted if it wants to show ONLY deleted.

    return NextResponse.json({
        summer,
        winter,
        all: withWindow // Returning flat list too might be helpful for admin
    });

  } catch (error) {
    console.error('Transfers API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch transfers' }, { status: 500 });
  }
}

export async function POST(req: Request) {
    try {
        const configError = ensureSupabaseOrError();
        if (configError) return configError;

        const body = await req.json();
        const { action, transfer } = body;
        console.log('Transfers POST payload:', {
            action,
            transferId: transfer?.id,
            player: transfer?.player || transfer?.name,
            fromType: typeof transfer?.from,
            toType: typeof transfer?.to,
            photoType: typeof transfer?.photo,
            fromLogoType: typeof transfer?.fromLogo,
            toLogoType: typeof transfer?.toLogo
        });

        if (action === 'add') {
            const row = { ...normalizeTransferPayload(transfer), deleted: false };
            const { error } = await transfersTable().insert(row);
            if (error) {
                console.error('Supabase Transfer Error:', error);
                return NextResponse.json({ error: error.message }, { status: 500 });
            }
            return NextResponse.json({ success: true });
        }
        
        if (action === 'delete') {
            if (!transfer?.id) {
              return NextResponse.json({ error: 'Chybí transfer.id pro delete' }, { status: 400 });
            }
            const { error } = await transfersTable().update({ deleted: true }).eq('id', transfer.id);
            if (error) {
                console.error('Supabase Transfer Error:', error);
                return NextResponse.json({ error: error.message }, { status: 500 });
            }
            return NextResponse.json({ success: true });
        }

        if (action === 'restore') {
            if (!transfer?.id) {
              return NextResponse.json({ error: 'Chybí transfer.id pro restore' }, { status: 400 });
            }
            const { error } = await transfersTable().update({ deleted: false }).eq('id', transfer.id);
            if (error) {
                console.error('Supabase Transfer Error:', error);
                return NextResponse.json({ error: error.message }, { status: 500 });
            }
            return NextResponse.json({ success: true });
        }

        if (action === 'hard_delete') {
            if (!transfer?.id) {
              return NextResponse.json({ error: 'Chybí transfer.id pro hard_delete' }, { status: 400 });
            }
            const { error } = await transfersTable().delete().eq('id', transfer.id);
            if (error) {
                console.error('Supabase Transfer Error:', error);
                return NextResponse.json({ error: error.message }, { status: 500 });
            }
            return NextResponse.json({ success: true });
        }

        if (action === 'update') {
            if (!transfer?.id) {
              return NextResponse.json({ error: 'Chybí transfer.id pro update' }, { status: 400 });
            }
            const patch: Record<string, any> = {};
            if (transfer?.photo !== undefined) patch.photo = sanitizeUrl(transfer.photo, 'photo');
            if (transfer?.fromLogo !== undefined) patch.fromLogo = sanitizeUrl(transfer.fromLogo, 'fromLogo');
            if (transfer?.toLogo !== undefined) patch.toLogo = sanitizeUrl(transfer.toLogo, 'toLogo');

            const { error } = await transfersTable().update(patch).eq('id', transfer.id);
            if (error) {
                console.error('Supabase Transfer Error:', error);
                return NextResponse.json({ error: error.message }, { status: 500 });
            }
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        console.error('Supabase Transfer Error:', error);
        return NextResponse.json({ error: 'Failed to update transfers' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
  try {
    const configError = ensureSupabaseOrError();
    if (configError) return configError;

    const body = await req.json();
    const id = String(body?.id || body?.transfer?.id || '').trim();
    if (!id) return NextResponse.json({ error: 'Chybí id pro update' }, { status: 400 });

    const input = body?.transfer ?? body;
    const patch: Record<string, any> = {};
    if (input?.player !== undefined) patch.player = input.player;
    if (input?.name !== undefined && input?.player === undefined) patch.player = input.name;
    if (input?.from !== undefined) patch.from_team = input.from;
    if (input?.from_team !== undefined) patch.from_team = input.from_team;
    if (input?.to !== undefined) patch.to_team = input.to;
    if (input?.to_team !== undefined) patch.to_team = input.to_team;
    if (input?.fee !== undefined) patch.fee = input.fee;
    if (input?.date !== undefined) patch.date = input.date;
    if (input?.photo !== undefined) patch.photo = sanitizeUrl(input.photo, 'photo');
    if (input?.fromLogo !== undefined) patch.fromLogo = sanitizeUrl(input.fromLogo, 'fromLogo');
    if (input?.toLogo !== undefined) patch.toLogo = sanitizeUrl(input.toLogo, 'toLogo');
    if (input?.is_confirmed !== undefined) patch.is_confirmed = input.is_confirmed;
    if (input?.window !== undefined) patch.window = input.window;
    if (input?.type !== undefined) patch.type = input.type;
    if (input?.deleted !== undefined) patch.deleted = Boolean(input.deleted);

    const { error } = await transfersTable().update(patch).eq('id', id);
    if (error) {
      console.error('Supabase Transfer Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Supabase Transfer Error:', error);
    return NextResponse.json({ error: 'Failed to update transfers' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const configError = ensureSupabaseOrError();
    if (configError) return configError;

    const { searchParams } = new URL(req.url);
    const id = String(searchParams.get('id') || '').trim();
    const hard = searchParams.get('hard') === 'true';
    if (!id) return NextResponse.json({ error: 'Chybí id pro delete' }, { status: 400 });

    if (hard) {
      const { error } = await transfersTable().delete().eq('id', id);
      if (error) {
        console.error('Supabase Transfer Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    } else {
      const { error } = await transfersTable().update({ deleted: true }).eq('id', id);
      if (error) {
        console.error('Supabase Transfer Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Supabase Transfer Error:', error);
    return NextResponse.json({ error: 'Failed to update transfers' }, { status: 500 });
  }
}
