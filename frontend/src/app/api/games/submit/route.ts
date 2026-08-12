import { NextRequest, NextResponse } from 'next/server';
import { addGame, scrapeUrl } from '../store';
import { auth } from '@/lib/auth';
import { GameDocument } from '@/types/game';

export const dynamic = 'force-dynamic';

// Allowed URL protocols
const ALLOWED_PROTOCOLS = ['https:', 'http:'];
// Fields max length
const MAX_TITLE_LEN = 200;
const MAX_DESC_LEN = 1000;
const MAX_URL_LEN = 2048;

function sanitizeText(text: unknown, maxLen: number): string {
  if (typeof text !== 'string') return '';
  return text.trim().slice(0, maxLen).replace(/[<>]/g, ''); // strip basic HTML injection
}

function sanitizeUrl(url: unknown, maxLen = 2048): string {
  if (typeof url !== 'string') return '';
  const trimmed = url.trim();
  // ❌ Reject Base64 data URLs entirely — they break KV storage and cause 413 errors
  if (trimmed.startsWith('data:')) return '';
  // ❌ Reject blob: URLs — browser-only, not usable server-side
  if (trimmed.startsWith('blob:')) return '';
  return trimmed.slice(0, maxLen);
}

function validateUrl(raw: unknown): { valid: boolean; url?: string; error?: string } {
  if (typeof raw !== 'string' || !raw.trim()) {
    return { valid: false, error: 'URL จำเป็นต้องระบุ' };
  }
  if (raw.length > MAX_URL_LEN) {
    return { valid: false, error: 'URL ยาวเกินไป (max 2048 chars)' };
  }
  let parsed: URL;
  try {
    parsed = new URL(raw.trim());
  } catch {
    return { valid: false, error: 'URL ไม่ถูกต้อง' };
  }
  if (!ALLOWED_PROTOCOLS.includes(parsed.protocol)) {
    return { valid: false, error: `Protocol "${parsed.protocol}" ไม่อนุญาต — ต้องเป็น https:// หรือ http:// เท่านั้น` };
  }
  // Block local/internal network access (SSRF guard)
  const host = parsed.hostname.toLowerCase();
  const blocked = ['localhost', '127.0.0.1', '0.0.0.0', '::1', '169.254.169.254'];
  if (blocked.includes(host) || host.startsWith('192.168.') || host.startsWith('10.') || host.startsWith('172.')) {
    return { valid: false, error: 'ไม่อนุญาต URL ภายในเครือข่าย (SSRF protection)' };
  }
  return { valid: true, url: parsed.href };
}

export async function POST(request: NextRequest) {
  // ── Auth Guard ───────────────────────────────────────────────────────────
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบก่อนส่งผลงาน' }, { status: 401 });
  }

  // ── Body Size Guard (reject if > 200KB — no Base64 images allowed) ──────
  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > 200 * 1024) {
    return NextResponse.json(
      { error: 'ข้อมูลที่ส่งมาใหญ่เกินไป — กรุณาใช้ URL รูปภาพจากภายนอกแทนการอัปโหลดไฟล์โดยตรง' },
      { status: 413 }
    );
  }

  try {
    const body = await request.json();

    // ── URL Validation ────────────────────────────────────────────────────
    const urlCheck = validateUrl(body.url);
    if (!urlCheck.valid) {
      return NextResponse.json({ error: urlCheck.error }, { status: 400 });
    }

    // ── Sanitize inputs ───────────────────────────────────────────────────
    const customTitle = sanitizeText(body.custom_title, MAX_TITLE_LEN);
    const customDesc = sanitizeText(body.custom_description, MAX_DESC_LEN);

    const scraped = await scrapeUrl(urlCheck.url!);

    const newGame: GameDocument = {
      id: `user-${Date.now()}`,
      title: customTitle || scraped.title,
      description: customDesc || scraped.description,
      original_url: urlCheck.url!,
      url: urlCheck.url!,
      embed_code: typeof body.embed_code === 'string' ? body.embed_code.slice(0, 4000) : scraped.embed_code,
      thumbnail_url: sanitizeUrl(body.cover_image_url || body.custom_thumbnail_url) || scraped.thumbnail_url,
      cover_image_url: sanitizeUrl(body.cover_image_url || body.custom_thumbnail_url) || scraped.thumbnail_url,
      // Bind creator info from verified session, not from client-supplied body
      creator_id: session.user.email,
      creator_email: session.user.email,
      creator_name: session.user.name || session.user.email,
      display_mode: scraped.display_mode,
      metrics: { views: 0, likes: 0, rating: 5.0 },
      tags: Array.isArray(body.custom_tags) ? (body.custom_tags as string[]).slice(0, 10).map((t) => String(t).slice(0, 50)) : scraped.tags,
      created_at: new Date().toISOString(),
      qr_image_url: body.qr_image_url ? sanitizeUrl(body.qr_image_url) : undefined,
      pdf_drive_url: body.pdf_drive_url ? sanitizeUrl(body.pdf_drive_url) : undefined,
      pdf_title: sanitizeText(body.pdf_title, 200) || undefined,
    };

    await addGame(newGame);

    return NextResponse.json({ message: 'ส่งผลงานสำเร็จ', game: newGame });
  } catch (err: unknown) {
    // Only expose safe error messages; don't leak internals
    const msg = err instanceof Error ? err.message : null;
    const safeMsg = msg && msg.startsWith('⚠️') ? msg : 'ส่งผลงานไม่สำเร็จ กรุณาลองใหม่';
    return NextResponse.json({ error: safeMsg }, { status: 500 });
  }
}
