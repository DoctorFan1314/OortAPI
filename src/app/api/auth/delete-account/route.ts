import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { validateUserFromCookie } from '@/lib/api-gateway';

export const dynamic = 'force-dynamic';

export async function DELETE(request: NextRequest) {
  try {
    const auth = validateUserFromCookie(request.headers.get('cookie'));
    if (!auth.valid || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { password } = await request.json();
    if (!password) {
      return NextResponse.json({ error: '请输入密码' }, { status: 400 });
    }

    // Verify password
    const user = db.prepare('SELECT password_hash, salt FROM users WHERE id = ?').get(auth.user.id) as { password_hash: string; salt: string } | undefined;
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const passwordHash = hashPassword(password, user.salt);
    if (passwordHash !== user.password_hash) {
      return NextResponse.json({ error: '密码错误' }, { status: 403 });
    }

    // Prevent last admin from deleting themselves
    if (auth.user.role === 'admin') {
      const adminCount = (db.prepare('SELECT COUNT(*) as count FROM users WHERE role = ?').get('admin') as { count: number }).count;
      if (adminCount <= 1) {
        return NextResponse.json({ error: '不能删除最后一个管理员账户' }, { status: 403 });
      }
    }

    // Delete user and all related data
    const txn = db.transaction(() => {
      db.prepare('DELETE FROM usage_logs WHERE user_id = ?').run(auth.user!.id);
      db.prepare('DELETE FROM billing_records WHERE user_id = ?').run(auth.user!.id);
      db.prepare('DELETE FROM api_keys WHERE user_id = ?').run(auth.user!.id);
      db.prepare('DELETE FROM sessions WHERE user_id = ?').run(auth.user!.id);
      db.prepare('DELETE FROM users WHERE id = ?').run(auth.user!.id);
    });
    txn();

    // Clear cookie
    const response = NextResponse.json({ success: true });
    response.headers.set('Set-Cookie', 'oortapi_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0');
    return response;
  } catch (error) {
    console.error('Delete account error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
