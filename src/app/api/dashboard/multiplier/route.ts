import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { validateUserFromCookie } from '@/lib/api-gateway';

export const dynamic = 'force-dynamic';

// GET — list multiplier rules + time settings
export async function GET(request: NextRequest) {
  const auth = validateUserFromCookie(request.headers.get('cookie'));
  if (!auth.valid || !auth.user || auth.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const rules = db.prepare(
    `SELECT m.*, r.input_rate, r.output_rate
     FROM multiplier_rules m
     LEFT JOIN model_rates r ON m.model_name = r.model_name
     ORDER BY m.model_name`
  ).all() as Array<{ id: number; model_name: string; multiplier: number; enabled: number; description: string | null; input_rate: number | null; output_rate: number | null }>;
  const timeSettings = db.prepare('SELECT * FROM time_multiplier_settings WHERE id = 1').get() || {
    id: 1, day_start: '08:00', day_end: '22:00', day_rate: 1.0, night_rate: 0.5, timezone: 'Asia/Shanghai', enabled: 0,
  };

  return NextResponse.json({ rules, time_settings: timeSettings });
}

// POST — create or update a multiplier rule
export async function POST(request: NextRequest) {
  const auth = validateUserFromCookie(request.headers.get('cookie'));
  if (!auth.valid || !auth.user || auth.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await request.json();

    if (body.type === 'time_settings') {
      const { day_start, day_end, day_rate, night_rate, timezone, enabled } = body;
      db.prepare(
        `INSERT INTO time_multiplier_settings (id, day_start, day_end, day_rate, night_rate, timezone, enabled)
         VALUES (1, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET day_start=excluded.day_start, day_end=excluded.day_end, day_rate=excluded.day_rate, night_rate=excluded.night_rate, timezone=excluded.timezone, enabled=excluded.enabled`
      ).run(day_start || '08:00', day_end || '22:00', day_rate ?? 1.0, night_rate ?? 0.5, timezone || 'Asia/Shanghai', enabled ? 1 : 0);
      return NextResponse.json({ success: true });
    }

    const { model_name, multiplier, enabled, description } = body;
    if (!model_name || typeof model_name !== 'string') {
      return NextResponse.json({ error: 'model_name is required' }, { status: 400 });
    }

    const mult = Number(multiplier ?? 1.0);
    if (isNaN(mult) || mult < 0.01 || mult > 100) {
      return NextResponse.json({ error: 'multiplier must be between 0.01 and 100' }, { status: 400 });
    }

    db.prepare(
      `INSERT INTO multiplier_rules (model_name, multiplier, enabled, description)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(model_name) DO UPDATE SET multiplier=excluded.multiplier, enabled=excluded.enabled, description=excluded.description`
    ).run(model_name, mult, enabled ? 1 : 0, description || null);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Multiplier POST error:', error);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

// DELETE — remove a multiplier rule
export async function DELETE(request: NextRequest) {
  const auth = validateUserFromCookie(request.headers.get('cookie'));
  if (!auth.valid || !auth.user || auth.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { model_name } = await request.json();
    if (!model_name) {
      return NextResponse.json({ error: 'model_name is required' }, { status: 400 });
    }

    db.prepare('DELETE FROM multiplier_rules WHERE model_name = ?').run(model_name);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Multiplier DELETE error:', error);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
