import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tool, args, config } = body as {
      tool: string;
      args: Record<string, unknown>;
      config: { tavilyApiKey?: string };
    };

    switch (tool) {
      case 'web_search':
        return await handleWebSearch(args, config);
      case 'fetch_url':
        return await handleFetchUrl(args);
      default:
        return NextResponse.json({ error: `Unknown tool: ${tool}` }, { status: 400 });
    }
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Tool execution failed' }, { status: 500 });
  }
}

async function handleWebSearch(
  args: Record<string, unknown>,
  config: { tavilyApiKey?: string },
) {
  const query = String(args.query || '');
  const count = Math.min(10, Math.max(1, Number(args.count) || 5));

  if (!config.tavilyApiKey) {
    return NextResponse.json({ result: '请先在工具设置中配置 Tavily API Key。' });
  }

  try {
    const res = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: config.tavilyApiKey, query, search_depth: 'basic', include_answer: true, max_results: count }),
    });
    if (!res.ok) return NextResponse.json({ result: `Tavily search failed: HTTP ${res.status}` });

    const data = await res.json();
    const formatted = data.answer ? `Answer: ${data.answer}\n\n` : '';
    const results = (data.results || []).map((r: { title: string; url: string; content: string }, i: number) =>
      `${i + 1}. [${r.title}](${r.url})\n   ${r.content.slice(0, 500)}`
    ).join('\n\n');
    return NextResponse.json({ result: formatted + results || 'No results found.' });
  } catch (err) {
    return NextResponse.json({ result: `Search failed: ${err instanceof Error ? err.message : 'Unknown error'}` });
  }
}

async function handleFetchUrl(args: Record<string, unknown>) {
  const url = String(args.url || '');
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
  }

  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; OortAPI/1.0)' },
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) {
    return NextResponse.json({ error: `HTTP ${res.status}` }, { status: 502 });
  }

  const html = await res.text();

  // Simple HTML-to-text extraction
  const text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n')
    .trim()
    .slice(0, 8000);

  return NextResponse.json({ result: text || 'No readable content found.' });
}
