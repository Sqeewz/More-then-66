import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

async function fileToDataUrl(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  return `data:${file.type || 'image/png'};base64,${buffer.toString('base64')}`;
}

export async function POST(request: NextRequest) {
  // Check session - must be authenticated
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบก่อนอัพโหลดไฟล์' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const result: Record<string, string> = {};
    const hasBlobToken = !!process.env.BLOB_READ_WRITE_TOKEN;

    // Upload QR image
    const qrFile = formData.get('qr_image') as File | null;
    if (qrFile && qrFile.size > 0) {
      if (qrFile.size > 2 * 1024 * 1024) {
        return NextResponse.json({ error: 'รูป QR ต้องมีขนาดไม่เกิน 2MB' }, { status: 400 });
      }
      if (hasBlobToken) {
        try {
          const blob = await put(`qr/${Date.now()}-${qrFile.name}`, qrFile, {
            access: 'public',
            contentType: qrFile.type,
          });
          result.qr_image_url = blob.url;
        } catch (e) {
          result.qr_image_url = await fileToDataUrl(qrFile);
        }
      } else {
        result.qr_image_url = await fileToDataUrl(qrFile);
      }
    }

    // Upload cover image
    const coverFile = formData.get('cover_image') as File | null;
    if (coverFile && coverFile.size > 0) {
      if (coverFile.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: 'รูปปกต้องมีขนาดไม่เกิน 5MB' }, { status: 400 });
      }
      if (hasBlobToken) {
        try {
          const blob = await put(`covers/${Date.now()}-${coverFile.name}`, coverFile, {
            access: 'public',
            contentType: coverFile.type,
          });
          result.cover_image_url = blob.url;
        } catch (e) {
          result.cover_image_url = await fileToDataUrl(coverFile);
        }
      } else {
        result.cover_image_url = await fileToDataUrl(coverFile);
      }
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error('Upload handler error:', err);
    return NextResponse.json({ error: 'อัพโหลดไฟล์ไม่สำเร็จ' }, { status: 500 });
  }
}
