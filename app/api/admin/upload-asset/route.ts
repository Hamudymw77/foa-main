import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../lib/db';

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function getExtFromMime(mime: string) {
  if (mime === 'image/webp') return 'webp';
  if (mime === 'image/jpeg') return 'jpg';
  if (mime === 'image/png') return 'png';
  return 'bin';
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get('file');
    const kind = String(form.get('kind') || '').trim();
    const entityId = String(form.get('entityId') || '').trim();
    const password = String(form.get('password') || '').trim();

    const envPassword = process.env.ADMIN_PASSWORD?.trim() || '';
    if (!envPassword) {
      return NextResponse.json(
        { error: 'Na serveru není nastaveno ADMIN_PASSWORD. Nastavte ho v prostředí (Environment Variables).' },
        { status: 500 }
      );
    }
    if (password !== envPassword) {
      return NextResponse.json({ error: 'Unauthorized: Nesprávné heslo' }, { status: 401 });
    }

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Chybí soubor (file)' }, { status: 400 });
    }
    if (!kind) return NextResponse.json({ error: 'Chybí kind' }, { status: 400 });
    if (!entityId) return NextResponse.json({ error: 'Chybí entityId' }, { status: 400 });

    const mime = file.type || 'application/octet-stream';
    if (!mime.startsWith('image/')) {
      return NextResponse.json({ error: 'Soubor musí být obrázek' }, { status: 400 });
    }

    const bucket = 'kickgoal-assets';
    const ext = getExtFromMime(mime);
    const safeEntity = slugify(entityId);

    let folder = 'misc';
    let baseName = safeEntity || 'asset';
    if (kind === 'player_photo') folder = 'players';
    else if (kind === 'transfer_photo') folder = 'transfers';
    else if (kind === 'club_logo') folder = 'clubs';
    else if (kind === 'team_logo') folder = 'clubs';
    else if (kind === 'transfer_from_logo') folder = 'clubs';
    else if (kind === 'transfer_to_logo') folder = 'clubs';

    if (kind === 'transfer_photo') baseName = `${safeEntity}-player`;
    if (kind === 'transfer_from_logo') baseName = `${safeEntity}-from`;
    if (kind === 'transfer_to_logo') baseName = `${safeEntity}-to`;

    const objectPath = `${folder}/${baseName}.${ext}`;
    const supabase = getSupabaseAdmin();

    const bytes = new Uint8Array(await file.arrayBuffer());
    const { error } = await supabase.storage.from(bucket).upload(objectPath, bytes as any, {
      contentType: mime,
      upsert: true,
      cacheControl: '31536000'
    });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(objectPath);
    return NextResponse.json({ ok: true, path: objectPath, url: data.publicUrl });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}

