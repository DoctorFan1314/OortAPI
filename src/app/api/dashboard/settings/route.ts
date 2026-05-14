import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { validateUserFromCookie } from '@/lib/api-gateway';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const auth = validateUserFromCookie(request.headers.get('cookie'));
    if (!auth.valid || !auth.user) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 });
    }

    const rows = db.prepare('SELECT key, value FROM system_settings').all() as { key: string; value: string }[];
    const settings: Record<string, string> = {};

    // Public settings available to all authenticated users
    const PUBLIC_KEYS = ['currency', 'exchange_rate', 'timezone'];

    for (const row of rows) {
      if (auth.user.role === 'admin' || PUBLIC_KEYS.includes(row.key)) {
        settings[row.key] = row.value;
      }
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Settings get error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = validateUserFromCookie(request.headers.get('cookie'));
    if (!auth.valid || !auth.user || auth.user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const ALLOWED_KEYS = ['site_name', 'registration_enabled', 'default_rate_limit', 'default_balance', 'maintenance_mode', 'currency', 'exchange_rate', 'timezone'];
    const stmt = db.prepare('INSERT OR REPLACE INTO system_settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)');

    const txn = db.transaction(() => {
      for (const [key, value] of Object.entries(body)) {
        if (typeof key === 'string' && typeof value === 'string' && ALLOWED_KEYS.includes(key)) {
          stmt.run(key, value);
        }
      }
    });
    txn();

    const rows = db.prepare('SELECT key, value FROM system_settings').all() as { key: string; value: string }[];
    const settings: Record<string, string> = {};
    for (const row of rows) {
      settings[row.key] = row.value;
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Settings update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
