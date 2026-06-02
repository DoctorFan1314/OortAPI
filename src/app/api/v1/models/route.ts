import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import type { DBModelRate, DBChannel } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Collect models from enabled channels
    const channels = db.prepare(
      'SELECT models, type FROM channels WHERE enabled = 1'
    ).all() as Pick<DBChannel, 'models' | 'type'>[];

    const channelModels = new Set<string>();
    let hasWildcard = false;

    for (const ch of channels) {
      const models: string[] = JSON.parse(ch.models || '[]');
      if (models.length === 0) {
        hasWildcard = true; // empty = supports all, fall back to model_rates
      } else {
        for (const m of models) {
          if (m === '*') {
            hasWildcard = true;
          } else {
            channelModels.add(m);
          }
        }
      }
    }

    // If any channel supports all models, also include enabled model_rates
    if (hasWildcard) {
      const rates = db.prepare(
        'SELECT model_name, display_name, provider, input_rate, output_rate, cache_rate, created_at, tags FROM model_rates WHERE enabled = 1'
      ).all() as DBModelRate[];
      for (const r of rates) {
        channelModels.add(r.model_name);
      }
    }

    // Build response with pricing info where available
    const rateMap = new Map<string, DBModelRate>();
    const allRates = db.prepare(
      'SELECT model_name, display_name, provider, input_rate, output_rate, cache_rate, created_at, tags FROM model_rates WHERE enabled = 1'
    ).all() as DBModelRate[];
    for (const r of allRates) {
      rateMap.set(r.model_name, r);
    }

    const data = [...channelModels].map(modelName => {
      const rate = rateMap.get(modelName);
      return {
        id: modelName,
        object: 'model',
        created: rate ? Math.floor(new Date(rate.created_at + "Z").getTime() / 1000) : Math.floor(Date.now() / 1000),
        owned_by: rate?.provider || 'unknown',
        display_name: rate?.display_name || modelName,
        pricing: rate ? {
          input: rate.input_rate,
          output: rate.output_rate,
          cache: rate.cache_rate,
        } : null,
        tags: rate?.tags ? JSON.parse(rate.tags) : [],
      };
    });

    return NextResponse.json({
      object: 'list',
      data,
    }, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
    });
  } catch (error) {
    console.error('Models list error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', type: 'server_error' } },
      { status: 500 }
    );
  }
}
