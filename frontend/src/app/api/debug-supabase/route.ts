import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

function getSupabase() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function GET() {
  const sb = getSupabase();
  if (!sb) {
    return NextResponse.json({ ok: false, error: 'getSupabase returned null' });
  }

  // Query 1: plain select
  const q1 = await sb.from('games').select('*');

  // Query 2: ordered select
  const q2 = await sb.from('games').select('*').order('created_at', { ascending: false });

  return NextResponse.json({
    ok: true,
    q1_count: q1.data?.length ?? 0,
    q1_error: q1.error?.message || null,
    q2_count: q2.data?.length ?? 0,
    q2_error: q2.error?.message || null,
    data: q1.data,
  });
}
