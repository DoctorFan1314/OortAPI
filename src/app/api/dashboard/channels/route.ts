import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { validateUserFromCookie } from '@/lib/api-gateway';
import { encrypt, decrypt } from '@/lib/auth';
import { logAdminAction } from '@/lib/billing-engine';
import type { DBChannel } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const auth = validateUserFromCookie(request.headers.get('cookie'));
    if (!auth.valid || !auth.user) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 });
    }

    // Only admins can manage channels
    if (auth.user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const action = request.nextUrl.searchParams.get('action');

    if (action === 'health') {
      // Return health stats per channel from usage_logs (last 24h)
      const stats = db.prepare(`
        SELECT
          channel_id,
          COUNT(*) as total_calls,
          SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as success_calls,
          AVG(CASE WHEN success = 1 THEN latency_ms ELSE NULL END) as avg_latency
        FROM usage_logs
        WHERE channel_id IS NOT NULL AND created_at >= datetime('now', '-1 day')
        GROUP BY channel_id
      `).all() as { channel_id: number; total_calls: number; success_calls: number; avg_latency: number | null }[];

      const channels = db.prepare('SELECT id, name, status, fail_count, last_fail_at FROM channels').all() as Pick<DBChannel, 'id' | 'name' | 'status' | 'fail_count' | 'last_fail_at'>[];

      const healthMap = new Map(stats.map(s => [s.channel_id, s]));
      const health = channels.map(ch => {
        const s = healthMap.get(ch.id);
        return {
          channel_id: ch.id,
          name: ch.name,
          status: ch.status,
          fail_count: ch.fail_count,
          last_fail_at: ch.last_fail_at,
          total_calls_24h: s?.total_calls ?? 0,
          success_rate_24h: s ? (s.success_calls / s.total_calls * 100) : null,
          avg_latency_24h: s?.avg_latency ? Math.round(s.avg_latency) : null,
        };
      });

      return NextResponse.json({ health });
    }

    const channels = db.prepare('SELECT * FROM channels ORDER BY priority DESC, created_at DESC').all();
    // Return masked API keys for security
    const masked = (channels as DBChannel[]).map(ch => ({
      ...ch,
      api_key_encrypted: ch.api_key_encrypted ? '••••••••' + decrypt(ch.api_key_encrypted).slice(-4) : '',
    }));
    return NextResponse.json({ channels: masked });
  } catch (error) {
    console.error('Channels list error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = validateUserFromCookie(request.headers.get('cookie'));
    if (!auth.valid || !auth.user || auth.user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();

    // Handle test connection action
    if (body.action === 'test') {
      const { id } = body;
      if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

      const channel = db.prepare('SELECT * FROM channels WHERE id = ?').get(id) as DBChannel | undefined;
      if (!channel) return NextResponse.json({ error: 'Channel not found' }, { status: 404 });

      const baseUrl = channel.base_url || 'https://api.openai.com';
      const start = Date.now();
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);
        const res = await fetch(`${baseUrl.replace(/\/$/, '')}/v1/models`, {
          headers: { 'Authorization': `Bearer ${decrypt(channel.api_key_encrypted)}` },
          signal: controller.signal,
        });
        clearTimeout(timeout);
        const latency_ms = Date.now() - start;
        if (res.ok) {
          return NextResponse.json({ success: true, latency_ms });
        }
        const text = await res.text().catch(() => '');
        return NextResponse.json({ success: false, latency_ms, error: `HTTP ${res.status}: ${text.slice(0, 200)}` });
      } catch (err: unknown) {
        const latency_ms = Date.now() - start;
        const msg = err instanceof Error ? err.message : 'Unknown error';
        return NextResponse.json({ success: false, latency_ms, error: msg });
      }
    }

    // Handle sync-models action: sync channel models to model_rates table
    if (body.action === 'sync-models') {
      const { id } = body;
      if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

      const channel = db.prepare('SELECT * FROM channels WHERE id = ?').get(id) as DBChannel | undefined;
      if (!channel) return NextResponse.json({ error: 'Channel not found' }, { status: 404 });

      const models: string[] = JSON.parse(channel.models || '[]');
      if (models.length === 0) {
        return NextResponse.json({ error: 'Channel has no models configured. Please set models first.', synced: 0 }, { status: 400 });
      }

      const provider = channel.type;
      let synced = 0;
      const insertStmt = db.prepare(
        'INSERT OR IGNORE INTO model_rates (model_name, display_name, provider, input_rate, output_rate, cache_rate) VALUES (?, ?, ?, 0, 0, 0)'
      );
      for (const modelName of models) {
        if (modelName === '*') continue;
        const result = insertStmt.run(modelName, modelName, provider);
        if (result.changes > 0) synced++;
      }

      return NextResponse.json({ success: true, synced, total: models.length });
    }

    const { name, type, api_key_encrypted, base_url, weight, models, model_mapping, priority } = body;

    if (!name || !type || !api_key_encrypted) {
      return NextResponse.json({ error: 'name, type, and api_key_encrypted are required' }, { status: 400 });
    }

    const result = db.prepare(
      'INSERT INTO channels (name, type, api_key_encrypted, base_url, weight, models, model_mapping, priority) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(name, type, encrypt(api_key_encrypted), base_url || null, weight || 1.0, JSON.stringify(models || []), JSON.stringify(model_mapping || {}), priority || 0);

    const channel = db.prepare('SELECT * FROM channels WHERE id = ?').get(result.lastInsertRowid);

    logAdminAction(auth.user.id, 'create_channel', 'channel', Number(result.lastInsertRowid), `name=${name}, type=${type}`, request.headers.get('x-forwarded-for')?.split(',')[0]?.trim());

    return NextResponse.json({ channel });
  } catch (error) {
    console.error('Channel create error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = validateUserFromCookie(request.headers.get('cookie'));
    if (!auth.valid || !auth.user || auth.user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { id, name, type, api_key_encrypted, base_url, weight, enabled, models, model_mapping, priority } = await request.json();
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

    const updates: string[] = [];
    const values: unknown[] = [];
    if (name !== undefined) { updates.push('name = ?'); values.push(name); }
    if (type !== undefined) { updates.push('type = ?'); values.push(type); }
    if (api_key_encrypted !== undefined) { updates.push('api_key_encrypted = ?'); values.push(encrypt(api_key_encrypted)); }
    if (base_url !== undefined) { updates.push('base_url = ?'); values.push(base_url); }
    if (weight !== undefined) { updates.push('weight = ?'); values.push(weight); }
    if (enabled !== undefined) { updates.push('enabled = ?'); values.push(enabled ? 1 : 0); }
    if (models !== undefined) { updates.push('models = ?'); values.push(JSON.stringify(models)); }
    if (model_mapping !== undefined) { updates.push('model_mapping = ?'); values.push(JSON.stringify(model_mapping)); }
    if (priority !== undefined) { updates.push('priority = ?'); values.push(priority); }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    // Check channel exists
    const existing = db.prepare('SELECT id FROM channels WHERE id = ?').get(id) as { id: number } | undefined;
    if (!existing) {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);
    db.prepare(`UPDATE channels SET ${updates.join(', ')} WHERE id = ?`).run(...values);

    const channel = db.prepare('SELECT * FROM channels WHERE id = ?').get(id);

    logAdminAction(auth.user.id, 'update_channel', 'channel', id, `fields: ${updates.length - 1}`, request.headers.get('x-forwarded-for')?.split(',')[0]?.trim());

    return NextResponse.json({ channel });
  } catch (error) {
    console.error('Channel update error:', error);
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
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

    db.prepare('DELETE FROM channels WHERE id = ?').run(id);

    logAdminAction(auth.user.id, 'delete_channel', 'channel', id, undefined, request.headers.get('x-forwarded-for')?.split(',')[0]?.trim());

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Channel delete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
