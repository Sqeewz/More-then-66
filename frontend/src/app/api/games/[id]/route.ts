import { NextRequest, NextResponse } from 'next/server';
import { getStore, deleteGameByEmail } from '../store';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const store = await getStore();
  const game = store.find((g) => g.id === params.id);
  if (!game) {
    return NextResponse.json({ error: 'ไม่พบเกมที่ระบุ' }, { status: 404 });
  }
  return NextResponse.json({ game });
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบก่อน' }, { status: 401 });
  }

  const deleted = await deleteGameByEmail(params.id, session.user.email);
  if (deleted) {
    return NextResponse.json({ message: 'ลบเกมเรียบร้อยแล้ว' });
  }
  return NextResponse.json({ error: 'ไม่มีสิทธิ์ลบเกมนี้ หรือไม่พบเกม' }, { status: 403 });
}
