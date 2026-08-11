import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Allowed MIME types
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp']);

// Magic byte signatures for image validation
const IMAGE_SIGNATURES: Record<string, number[][]> = {
  'image/jpeg': [[0xff, 0xd8, 0xff]],
  'image/png':  [[0x89, 0x50, 0x4e, 0x47]],
  'image/gif':  [[0x47, 0x49, 0x46, 0x38]],
  'image/webp': [[0x52, 0x49, 0x46, 0x46]], // RIFF header
};

function checkMagicBytes(buffer: Uint8Array, mimeType: string): boolean {
  const sigs = IMAGE_SIGNATURES[mimeType];
  if (!sigs) return false;
  return sigs.some((sig) => sig.every((byte, i) => buffer[i] === byte));
}

async function validateImageFile(
  file: File,
  maxSizeMB: number,
  fieldName: string
): Promise<{ valid: boolean; error?: string; buffer?: Uint8Array }> {
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return { valid: false, error: `${fieldName}: ประเภทไฟล์ไม่อนุญาต (JPG/PNG/GIF/WebP เท่านั้น)` };
  }
  if (file.size > maxSizeMB * 1024 * 1024) {
    return { valid: false, error: `${fieldName}: ขนาดไฟล์เกิน ${maxSizeMB}MB` };
  }
  // Check real file signature (magic bytes) — not just MIME type claim
  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  if (!checkMagicBytes(bytes, file.type)) {
    return { valid: false, error: `${fieldName}: ไฟล์ไม่ใช่รูปภาพจริง (Magic bytes mismatch)` };
  }
  return { valid: true, buffer: bytes };
}

async function fileToDataUrl(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  return `data:${file.type};base64,${buffer.toString('base64')}`;
}

export async function POST(request: NextRequest) {
  // ── Auth Guard ────────────────────────────────────────────────────────────
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบก่อนอัพโหลดไฟล์' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const result: Record<string, string> = {};
    const hasBlobToken = !!process.env.BLOB_READ_WRITE_TOKEN;

    // ── QR Image ─────────────────────────────────────────────────────────
    const qrFile = formData.get('qr_image') as File | null;
    if (qrFile && qrFile.size > 0) {
      const check = await validateImageFile(qrFile, 2, 'รูป QR');
      if (!check.valid) {
        return NextResponse.json({ error: check.error }, { status: 400 });
      }
      if (hasBlobToken) {
        try {
          const blob = await put(`qr/${Date.now()}-${qrFile.name}`, qrFile, { access: 'public', contentType: qrFile.type });
          result.qr_image_url = blob.url;
        } catch {
          result.qr_image_url = await fileToDataUrl(qrFile);
        }
      } else {
        result.qr_image_url = await fileToDataUrl(qrFile);
      }
    }

    // ── Cover Image ───────────────────────────────────────────────────────
    const coverFile = formData.get('cover_image') as File | null;
    if (coverFile && coverFile.size > 0) {
      const check = await validateImageFile(coverFile, 5, 'รูปปก');
      if (!check.valid) {
        return NextResponse.json({ error: check.error }, { status: 400 });
      }
      if (hasBlobToken) {
        try {
          const blob = await put(`covers/${Date.now()}-${coverFile.name}`, coverFile, { access: 'public', contentType: coverFile.type });
          result.cover_image_url = blob.url;
        } catch {
          result.cover_image_url = await fileToDataUrl(coverFile);
        }
      } else {
        result.cover_image_url = await fileToDataUrl(coverFile);
      }
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error('[Upload] handler error:', err);
    return NextResponse.json({ error: 'อัพโหลดไฟล์ไม่สำเร็จ กรุณาลองใหม่' }, { status: 500 });
  }
}
