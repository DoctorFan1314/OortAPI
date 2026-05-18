import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { validateUserFromCookie } from '@/lib/api-gateway';
import { logAdminAction } from '@/lib/billing-engine';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const auth = validateUserFromCookie(request.headers.get('cookie'));
    if (!auth.valid || !auth.user) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 });
    }

    const action = request.nextUrl.searchParams.get('action');

    // Export all config (admin only)
    if (action === 'export' && auth.user.role === 'admin') {
      const settings = db.prepare('SELECT key, value FROM system_settings').all() as { key: string; value: string }[];
      const channels = db.prepare('SELECT id, name, type, base_url, weight, enabled, models, model_mapping, priority FROM channels').all();
      const modelRates = db.prepare('SELECT model_name, display_name, provider, input_rate, output_rate, cache_rate, cache_creation_rate, credit_rate, enabled, tags FROM model_rates').all();
      const plans = db.prepare('SELECT name, display_name, tagline, tier, monthly_price, yearly_price, currency, monthly_credits, first_purchase_discount, overage_rate_multiplier, max_concurrency, route_priority, off_peak_discount, support_level, popular FROM subscription_plans').all();

      const exportData = {
        version: '1.0',
        exported_at: new Date().toISOString(),
        settings: Object.fromEntries(settings.map(s => [s.key, s.value])),
        channels,
        model_rates: modelRates,
        subscription_plans: plans,
      };

      return NextResponse.json(exportData);
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

    return NextResponse.json({ settings, preferences: auth.user.preferences ? JSON.parse(auth.user.preferences) : {} });
  } catch (error) {
    console.error('Settings get error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = validateUserFromCookie(request.headers.get('cookie'));
    if (!auth.valid || !auth.user) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Handle user budget (available to all authenticated users)
    if (body.monthly_budget !== undefined) {
      let prefs: Record<string, unknown> = {};
      try { prefs = JSON.parse(auth.user.preferences || '{}'); } catch {}
      if (body.monthly_budget === null || body.monthly_budget === '') {
        delete prefs.monthly_budget;
      } else {
        prefs.monthly_budget = Number(body.monthly_budget);
      }
      db.prepare('UPDATE users SET preferences = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .run(JSON.stringify(prefs), auth.user.id);
      return NextResponse.json({ success: true, preferences: prefs });
    }

    // System settings (admin only)
    if (auth.user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

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

export async function POST(request: NextRequest) {
  try {
    const auth = validateUserFromCookie(request.headers.get('cookie'));
    if (!auth.valid || !auth.user || auth.user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();

    if (body.action === 'import' && body.data) {
      const { settings, model_rates } = body.data;
      const stmt = db.prepare('INSERT OR REPLACE INTO system_settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)');

      if (settings && typeof settings === 'object') {
        const txn = db.transaction(() => {
          for (const [key, value] of Object.entries(settings)) {
            if (typeof key === 'string' && typeof value === 'string') {
              stmt.run(key, value);
            }
          }
        });
        txn();
      }

      if (Array.isArray(model_rates)) {
        const upsert = db.prepare(
          `INSERT INTO model_rates (model_name, display_name, provider, input_rate, output_rate, cache_rate, cache_creation_rate, credit_rate, enabled, tags)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT(model_name) DO UPDATE SET display_name=excluded.display_name, provider=excluded.provider, input_rate=excluded.input_rate, output_rate=excluded.output_rate, cache_rate=excluded.cache_rate, cache_creation_rate=excluded.cache_creation_rate, credit_rate=excluded.credit_rate, tags=excluded.tags`
        );
        const txn = db.transaction(() => {
          for (const m of model_rates) {
            upsert.run(m.model_name, m.display_name || m.model_name, m.provider || 'unknown', m.input_rate || 0, m.output_rate || 0, m.cache_rate || 0, m.cache_creation_rate || 0, m.credit_rate || 1.0, m.enabled ?? 1, m.tags || '[]');
          }
        });
        txn();
      }

      logAdminAction(auth.user.id, 'import_config', 'settings', undefined, undefined, request.headers.get('x-forwarded-for')?.split(',')[0]?.trim());

      return NextResponse.json({ success: true, imported: { settings: settings ? Object.keys(settings).length : 0, model_rates: model_rates?.length || 0 } });
    }

    return NextResponse.json({ error: 'Invalid import data' }, { status: 400 });
  } catch (error) {
    console.error('Settings import error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
