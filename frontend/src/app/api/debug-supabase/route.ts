import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getCloudGames } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const envCheck = {
    SUPABASE_URL: !!process.env.SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    SUPABASE_ANON_KEY: !!process.env.SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };

  let serviceQuery: any = null;
  let anonQuery: any = null;
  let cloudGames: any = null;
  let dbError: any = null;

  try {
    cloudGames = await getCloudGames();
  } catch (e: any) {
    dbError = e?.message || String(e);
  }

  if (url && serviceKey) {
    try {
      const sb = createClient(url, serviceKey, { auth: { persistSession: false } });
      const { data, error } = await sb.from('games').select('*');
      serviceQuery = { count: data?.length ?? 0, error: error?.message || null, data };
    } catch (e: any) {
      serviceQuery = { error: e?.message };
    }
  }

  if (url && anonKey) {
    try {
      const sb = createClient(url, anonKey, { auth: { persistSession: false } });
      const { data, error } = await sb.from('games').select('*');
      anonQuery = { count: data?.length ?? 0, error: error?.message || null, data };
    } catch (e: any) {
      anonQuery = { error: e?.message };
    }
  }

  return NextResponse.json({
    envCheck,
    cloudGamesCount: cloudGames?.length ?? 0,
    cloudGames,
    dbError,
    serviceQuery,
    anonQuery,
  });
}
