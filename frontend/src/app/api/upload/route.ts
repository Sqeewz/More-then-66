import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']);

const IMAGE_SIGNATURES: Record<string, number[][]> = {
  'image/jpeg': [[0xff, 0xd8, 0xff]],
  'image/png':  [[0x89, 0x50, 0x4e, 0x47]],
  'image/gif':  [[0x47, 0x49, 0x46, 0x38]],
  'image/webp': [[0x52, 0x49, 0x46, 0x46]],
};

function detectMimeType(buffer: Uint8Array): string | null {
  for (const [mime, sigs] of Object.entries(IMAGE_SIGNATURES)) {
    if (sigs.some((sig) => sig.every((byte, i) => buffer[i] === byte))) {
      return mime;
    }
  }
  return null;
}

async function validateImageFile(
  file: File,
  maxSizeMB: number,
  fieldName: string
): Promise<{ valid: boolean; error?: string; detectedType?: string }> {
  if (file.size > maxSizeMB * 1024 * 1024) {
    return { valid: false, error: `${fieldName}: ขนาดไฟล์เกิน ${maxSizeMB}MB` };
  }

  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  const detectedType = detectMimeType(bytes) || (ALLOWED_MIME_TYPES.has(file.type) ? file.type : null);

  if (!detectedType || !ALLOWED_MIME_TYPES.has(detectedType)) {
    return { valid: false, error: `${fieldName}: กรุณาใช้ไฟล์รูปภาพประเภท JPG, PNG, WebP หรือ GIF เท่านั้น` };
  }

  return { valid: true, detectedType };
}

export async function POST(request: NextRequest) {
  // ── Auth Guard ────────────────────────────────────────────────────────────
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบก่อนอัพโหลดไฟล์' }, { status: 401 });
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: 'ยังไม่ได้ตั้งค่า BLOB_READ_WRITE_TOKEN ใน Environment Variables กรุณาใส่ URL รูปภาพโดยตรงในแท็บ "ใส่ URL"' },
      { status: 400 }
    );
  }

  try {
    const formData = await request.formData();
    const result: Record<string, string> = {};

    // ── QR Image ─────────────────────────────────────────────────────────
    const qrFile = formData.get('qr_image') as File | null;
    if (qrFile && qrFile.size > 0) {
      const check = await validateImageFile(qrFile, 2, 'รูป QR');
      if (!check.valid) {
        return NextResponse.json({ error: check.error }, { status: 400 });
      }
      try {
        let blob;
        try {
          blob = await put(`qr/${Date.now()}-${qrFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`, qrFile, {
            access: 'private',
            token: token,
            contentType: check.detectedType,
          });
        } catch (e1) {
          blob = await put(`qr/${Date.now()}-${qrFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`, qrFile, {
            access: 'public',
            token: token,
            contentType: check.detectedType,
          });
        }
        result.qr_image_url = blob.url;
      } catch (e) {
        console.error('[Blob Error QR]:', e);
        return NextResponse.json({ error: `อัปโหลด QR Code ไม่สำเร็จ: ${(e as Error).message}` }, { status: 500 });
      }
    }

    // ── Cover Image ───────────────────────────────────────────────────────
    const coverFile = formData.get('cover_image') as File | null;
    if (coverFile && coverFile.size > 0) {
      const check = await validateImageFile(coverFile, 5, 'รูปปก');
      if (!check.valid) {
        return NextResponse.json({ error: check.error }, { status: 400 });
      }
      try {
        let blob;
        try {
          blob = await put(`covers/${Date.now()}-${coverFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`, coverFile, {
            access: 'private',
            token: token,
            contentType: check.detectedType,
          });
        } catch (e1) {
          blob = await put(`covers/${Date.now()}-${coverFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`, coverFile, {
            access: 'public',
            token: token,
            contentType: check.detectedType,
          });
        }
        result.cover_image_url = blob.url;
      } catch (e) {
        console.error('[Blob Error Cover]:', e);
        return NextResponse.json({ error: `อัปโหลดรูปปกไม่สำเร็จ: ${(e as Error).message}` }, { status: 500 });
      }
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error('[Upload API Error]:', err);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการอัปโหลดไฟล์' }, { status: 500 });
  }
}
