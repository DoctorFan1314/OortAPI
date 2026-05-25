import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { validateUserFromCookie } from '@/lib/api-gateway';
import { generateApiKey, hashApiKey } from '@/lib/auth';
import type { DBApiKey } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const auth = validateUserFromCookie(request.headers.get('cookie'));
    if (!auth.valid || !auth.user) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 });
    }

    const keys = db.prepare(
      'SELECT id, name, key_value, permissions, rate_limit, enabled, created_at, last_used_at, total_calls, expires_at FROM api_keys WHERE user_id = ? ORDER BY created_at DESC'
    ).all(auth.user.id);

    return NextResponse.json({ keys });
  } catch (error) {
    console.error('API keys list error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = validateUserFromCookie(request.headers.get('cookie'));
    if (!auth.valid || !auth.user) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 });
    }

    const { name, rate_limit, permissions, expires_at } = await request.json();

    const keyValue = generateApiKey();
    const keyHash = hashApiKey(keyValue);
    const maskedValue = keyValue.slice(0, 10) + '****';
    const safeRateLimit = Math.min(Math.max(Math.floor(rate_limit || 60), 1), 10000);
    const result = db.prepare(
      'INSERT INTO api_keys (user_id, key_value, key_hash, name, permissions, rate_limit, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(auth.user.id, maskedValue, keyHash, name || 'Default', JSON.stringify(permissions || { models: ['*'] }), safeRateLimit, expires_at || null);

    const key = db.prepare(
      'SELECT id, name, key_value, permissions, rate_limit, enabled, created_at, expires_at FROM api_keys WHERE id = ?'
    ).get(result.lastInsertRowid);

    // Return full key only on creation (never shown again)
    return NextResponse.json({ key, full_key: keyValue });
  } catch (error) {
    console.error('API key create error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = validateUserFromCookie(request.headers.get('cookie'));
    if (!auth.valid || !auth.user) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 });
    }

    const { id, name, enabled, rate_limit, permissions, expires_at, action } = await request.json();
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

    const key = db.prepare('SELECT * FROM api_keys WHERE id = ? AND user_id = ?').get(id, auth.user.id) as { id: number; key_value: string } | undefined;
    if (!key) return NextResponse.json({ error: 'Key not found' }, { status: 404 });

    // Key rotation: generate new key, disable old one, return new value
    if (action === 'rotate') {
      const newKey = generateApiKey();
      const hashed = hashApiKey(newKey);
      db.prepare('UPDATE api_keys SET key_value = ?, enabled = 1 WHERE id = ?').run(hashed, id);
      return NextResponse.json({ key: { id, full_key: newKey, key_value: `sk-oort-${newKey.slice(7, 17)}...` } });
    }

    const updates: string[] = [];
    const values: unknown[] = [];
    if (name !== undefined) { updates.push('name = ?'); values.push(name); }
    if (enabled !== undefined) { updates.push('enabled = ?'); values.push(enabled ? 1 : 0); }
    if (rate_limit !== undefined) { updates.push('rate_limit = ?'); values.push(Math.min(Math.max(Math.floor(rate_limit), 1), 10000)); }
    if (permissions !== undefined) { updates.push('permissions = ?'); values.push(JSON.stringify(permissions)); }
    if (expires_at !== undefined) { updates.push('expires_at = ?'); values.push(expires_at); }

    if (updates.length > 0) {
      values.push(id);
      db.prepare(`UPDATE api_keys SET ${updates.join(', ')} WHERE id = ?`).run(...values);
    }

    const updated = db.prepare('SELECT id, name, key_value, permissions, rate_limit, enabled, created_at, last_used_at, total_calls, expires_at FROM api_keys WHERE id = ?').get(id);
    return NextResponse.json({ key: updated });
  } catch (error) {
    console.error('API key update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = validateUserFromCookie(request.headers.get('cookie'));
    if (!auth.valid || !auth.user) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 });
    }

    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

    const key = db.prepare('SELECT * FROM api_keys WHERE id = ? AND user_id = ?').get(id, auth.user.id);
    if (!key) return NextResponse.json({ error: 'Key not found' }, { status: 404 });

    db.prepare('DELETE FROM api_keys WHERE id = ?').run(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API key delete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
