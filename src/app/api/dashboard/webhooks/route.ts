import { NextRequest, NextResponse } from 'next/server';
import { validateUserFromCookie } from '@/lib/api-gateway';
import { logAdminAction } from '@/lib/billing-engine';
import db from '@/lib/db';
import { randomBytes } from 'crypto';

export const dynamic = 'force-dynamic';

function isInternalUrl(urlStr: string): boolean {
  try {
    const url = new URL(urlStr);
    const host = url.hostname;
    if (host === 'localhost' || host === '[::1]' || host === '0.0.0.0') return true;
    if (host.startsWith('127.') || host.startsWith('10.')) return true;
    if (host.startsWith('172.')) { const o = parseInt(host.split('.')[1], 10); if (o >= 16 && o <= 31) return true; }
    if (host.startsWith('192.168.')) return true;
    if (host.startsWith('169.254.')) return true;
    return false;
  } catch { return true; }
}

export async function GET(request: NextRequest) {
  try {
    const auth = validateUserFromCookie(request.headers.get('cookie'));
    if (!auth.valid || !auth.user || auth.user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const webhooks = db.prepare('SELECT * FROM webhooks ORDER BY created_at DESC').all() as Record<string, unknown>[];
    const safeWebhooks = webhooks.map(({ secret, ...rest }) => rest);
    return NextResponse.json({ webhooks: safeWebhooks });
  } catch (error) {
    console.error('Webhooks GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = validateUserFromCookie(request.headers.get('cookie'));
    if (!auth.valid || !auth.user || auth.user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { url, events } = await request.json();
    if (!url || !events || !Array.isArray(events)) {
      return NextResponse.json({ error: 'url and events[] are required' }, { status: 400 });
    }
    if (isInternalUrl(url)) {
      return NextResponse.json({ error: 'Webhook URL targets an internal network' }, { status: 400 });
    }

    const secret = randomBytes(32).toString('hex');
    const result = db.prepare('INSERT INTO webhooks (url, secret, events) VALUES (?, ?, ?)').run(url, secret, JSON.stringify(events));

    logAdminAction(auth.user.id, 'webhook_create', 'webhook', result.lastInsertRowid as number, `url=${url}`, request.headers.get('x-forwarded-for')?.split(',')[0]?.trim());

    return NextResponse.json({ id: result.lastInsertRowid, url, secret, events });
  } catch (error) {
    console.error('Webhooks POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = validateUserFromCookie(request.headers.get('cookie'));
    if (!auth.valid || !auth.user || auth.user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { id, url, events, enabled } = await request.json();
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const webhook = db.prepare('SELECT * FROM webhooks WHERE id = ?').get(id);
    if (!webhook) return NextResponse.json({ error: 'Webhook not found' }, { status: 404 });

    if (url !== undefined && isInternalUrl(url)) {
      return NextResponse.json({ error: 'Webhook URL targets an internal network' }, { status: 400 });
    }

    const updates: string[] = [];
    const params: unknown[] = [];
    if (url !== undefined) { updates.push('url = ?'); params.push(url); }
    if (events !== undefined) { updates.push('events = ?'); params.push(JSON.stringify(events)); }
    if (enabled !== undefined) { updates.push('enabled = ?'); params.push(enabled ? 1 : 0); }
    updates.push('updated_at = CURRENT_TIMESTAMP');

    if (updates.length > 1) {
      db.prepare(`UPDATE webhooks SET ${updates.join(', ')} WHERE id = ?`).run(...params, id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhooks PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = validateUserFromCookie(request.headers.get('cookie'));
    if (!auth.valid || !auth.user || auth.user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    db.prepare('DELETE FROM webhooks WHERE id = ?').run(id);
    logAdminAction(auth.user.id, 'webhook_delete', 'webhook', id, undefined, request.headers.get('x-forwarded-for')?.split(',')[0]?.trim());

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhooks DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
