import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return NextResponse.json({
      ok: false,
      error: 'Missing env vars',
      SUPABASE_URL: url ? '✅ set' : '❌ missing',
      SUPABASE_SERVICE_ROLE_KEY: key ? '✅ set' : '❌ missing',
    });
  }

  try {
    const sb = createClient(url, key, { auth: { persistSession: false } });
    const { data, error, count } = await sb
      .from('games')
      .select('*', { count: 'exact', head: true });

    if (error) {
      return NextResponse.json({ ok: false, supabase_error: error.message, code: error.code });
    }

    return NextResponse.json({
      ok: true,
      message: 'Supabase connected!',
      total_games: count ?? 0,
      SUPABASE_URL: url.slice(0, 40) + '...',
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Unknown error' });
  }
}
