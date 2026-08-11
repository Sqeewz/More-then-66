import { NextRequest, NextResponse } from 'next/server';
import { scrapeUrl } from '../store';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const MAX_URL_LEN = 2048;
const ALLOWED_PROTOCOLS = ['https:', 'http:'];

function validateUrl(raw: unknown): { valid: boolean; url?: string; error?: string } {
  if (typeof raw !== 'string' || !raw.trim()) {
    return { valid: false, error: 'URL จำเป็นต้องระบุ' };
  }
  if (raw.length > MAX_URL_LEN) {
    return { valid: false, error: 'URL ยาวเกินไป' };
  }
  let parsed: URL;
  try {
    parsed = new URL(raw.trim());
  } catch {
    return { valid: false, error: 'URL ไม่ถูกต้อง' };
  }
  if (!ALLOWED_PROTOCOLS.includes(parsed.protocol)) {
    return { valid: false, error: `Protocol "${parsed.protocol}" ไม่อนุญาต` };
  }
  // SSRF protection: block internal hosts
  const host = parsed.hostname.toLowerCase();
  const blocked = ['localhost', '127.0.0.1', '0.0.0.0', '::1', '169.254.169.254'];
  if (blocked.includes(host) || host.startsWith('192.168.') || host.startsWith('10.') || host.startsWith('172.')) {
    return { valid: false, error: 'ไม่อนุญาต URL ภายในเครือข่าย' };
  }
  return { valid: true, url: parsed.href };
}

export async function POST(request: NextRequest) {
  // ── Auth Guard ────────────────────────────────────────────────────────────
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบก่อนใช้งาน' }, { status: 401 });
  }

  try {
    const body = await request.json();

    const urlCheck = validateUrl(body.url);
    if (!urlCheck.valid) {
      return NextResponse.json({ error: urlCheck.error }, { status: 400 });
    }

    const scraped = await scrapeUrl(urlCheck.url!);
    return NextResponse.json(scraped);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : null;
    const safeMsg = msg && msg.startsWith('⚠️') ? msg : 'ดึงข้อมูลจาก URL ไม่สำเร็จ';
    return NextResponse.json({ error: safeMsg }, { status: 500 });
  }
}
