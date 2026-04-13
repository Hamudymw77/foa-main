import { createClient } from '@supabase/supabase-js';

type SupabaseAdminClient = ReturnType<typeof createClient>;

let supabaseAdminClient: SupabaseAdminClient | null = null;

export function isSupabaseConfigured() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function getSupabaseAdmin() {
  if (!process.env.SUPABASE_URL) {
    throw new Error('SUPABASE_URL is not set');
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
  }
  if (!supabaseAdminClient) {
    supabaseAdminClient = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { 'X-Client-Info': 'kickgoal-server' } }
    });
  }
  return supabaseAdminClient;
}

export async function dbGetAllMatchOverrides() {
  const supabase = getSupabaseAdmin();

  const result: Record<string, any> = {};
  const pageSize = 1000;
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from('match_overrides')
      .select('match_id,data')
      .order('match_id', { ascending: true })
      .range(from, from + pageSize - 1);

    if (error) {
      throw new Error(error.message);
    }

    for (const row of data || []) {
      result[String((row as any).match_id)] = (row as any).data ?? {};
    }

    if (!data || data.length < pageSize) break;
    from += pageSize;
  }

  return result;
}

export async function dbGetMatchOverride(matchId: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from('match_overrides').select('match_id,data').eq('match_id', matchId).maybeSingle();
  if (error) throw new Error(error.message);
  return (data as any)?.data ?? null;
}

export async function dbUpsertMatchOverride(matchId: string, overrideData: any) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('match_overrides').upsert({ match_id: matchId, data: overrideData }, { onConflict: 'match_id' });
  if (error) throw new Error(error.message);
}

export async function dbUpsertManyMatchOverrides(items: Array<{ matchId: string; data: any }>) {
  if (items.length === 0) return;
  const supabase = getSupabaseAdmin();
  const payload = items.map((i) => ({ match_id: i.matchId, data: i.data }));
  const { error } = await supabase.from('match_overrides').upsert(payload, { onConflict: 'match_id' });
  if (error) throw new Error(error.message);
}
