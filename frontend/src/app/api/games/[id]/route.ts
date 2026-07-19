import { NextRequest, NextResponse } from 'next/server';
import { deleteGame, getStore } from '../store';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const game = getStore().find((g) => g.id === params.id);
  if (!game) {
    return NextResponse.json({ error: `Game with id '${params.id}' not found` }, { status: 404 });
  }
  return NextResponse.json({ game });
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const adminPass = request.headers.get('x-admin-pass') || new URL(request.url).searchParams.get('pass') || '';
  const deleted = deleteGame(params.id, adminPass);

  if (!deleted) {
    return NextResponse.json({ error: 'รหัสผ่านแอดมินไม่ถูกต้อง หรือไม่พบเกมที่ต้องการลบ' }, { status: 401 });
  }

  return NextResponse.json({ message: 'ลบผลงานเกมออกจากระบบเรียบร้อยแล้ว' });
}
