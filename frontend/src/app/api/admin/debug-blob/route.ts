import { NextRequest, NextResponse } from 'next/server';
import { put, list } from '@vercel/blob';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  const result: Record<string, unknown> = {
    env: {
      BLOB_TOKEN_SET: !!token,
      BLOB_TOKEN_PREFIX: token?.slice(0, 25) || 'NOT SET',
      KV_URL_SET: !!kvUrl,
      KV_TOKEN_SET: !!kvToken,
    },
  };

  // Test blob list
  if (token) {
    try {
      const blobs = await list({ prefix: 'data/', token });
      result.blob_list = {
        success: true,
        count: blobs.blobs.length,
        files: blobs.blobs.map((b) => ({ url: b.url, size: b.size, pathname: b.pathname })),
      };
    } catch (e) {
      result.blob_list = { success: false, error: String(e) };
    }

    // Test blob write
    try {
      const testData = JSON.stringify({ test: true, time: Date.now() });
      // @ts-ignore - allowOverwrite exists at runtime even if types don't expose it
      const blob = await put('data/cs67_games.json', testData, {
        access: 'public',
        addRandomSuffix: false,
        allowOverwrite: true,
        token,
      });
      result.blob_write = { success: true, url: blob.url };
    } catch (e) {
      result.blob_write = { success: false, error: String(e) };
    }
  } else {
    result.blob_write = { success: false, error: 'BLOB_READ_WRITE_TOKEN not set' };
  }

  return NextResponse.json(result, { status: 200 });
}
