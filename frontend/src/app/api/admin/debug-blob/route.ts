import { NextRequest, NextResponse } from 'next/server';
import { put, list, get } from '@vercel/blob';

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

  if (token) {
    // 1. List blobs
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

    // 2. Test blob write (tries private, then public)
    const testData = JSON.stringify([{ id: 'test-1', title: 'Test Game', created_at: new Date().toISOString() }]);
    let writeSuccess = false;
    let writeUrl = '';
    let writeError = '';

    try {
      // @ts-ignore
      const blob = await put('data/cs67_games.json', testData, {
        access: 'private',
        addRandomSuffix: false,
        allowOverwrite: true,
        token,
      });
      writeSuccess = true;
      writeUrl = blob.url;
    } catch (e1) {
      try {
        // @ts-ignore
        const blob = await put('data/cs67_games.json', testData, {
          access: 'public',
          addRandomSuffix: false,
          allowOverwrite: true,
          token,
        });
        writeSuccess = true;
        writeUrl = blob.url;
      } catch (e2) {
        writeError = `Private failed: ${String(e1)} | Public failed: ${String(e2)}`;
      }
    }

    result.blob_write = writeSuccess
      ? { success: true, url: writeUrl }
      : { success: false, error: writeError };

    // 3. Test blob read
    if (writeSuccess) {
      try {
        const getRes = await get(writeUrl, { token });
        if (getRes && getRes.stream) {
          const text = await new Response(getRes.stream).text();
          result.blob_read = { success: true, content: JSON.parse(text) };
        }
      } catch (readErr) {
        result.blob_read = { success: false, error: String(readErr) };
      }
    }
  } else {
    result.blob_write = { success: false, error: 'BLOB_READ_WRITE_TOKEN not set' };
  }

  return NextResponse.json(result, { status: 200 });
}
