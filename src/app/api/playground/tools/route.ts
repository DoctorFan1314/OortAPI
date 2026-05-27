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
      // ── MCP tool handlers (resource hub) ──
      case 'google_search':
      case 'google_news':
      case 'search_code':
      case 'create_issue':
      case 'query_validator':
      case 'schema_fetch':
        return handleMcpTool(tool, args);
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

// ── MCP Tool Mock Handlers ─────────────────────────────
// In production these would proxy to actual MCP servers.
// For now, return realistic mock responses.

const MCP_MOCK_HANDLERS: Record<string, (args: Record<string, unknown>) => string> = {
  google_search: (a) => {
    const query = String(a.query || '');
    const results = [
      `1. **${query} - Wikipedia**\n   https://en.wikipedia.org/wiki/${encodeURIComponent(query)}\n   Comprehensive overview of ${query} with references and external links.`,
      `2. **Understanding ${query} - Tech Blog**\n   https://dev.to/posts/${encodeURIComponent(query)}\n   A deep dive into ${query} covering fundamentals and advanced topics.`,
      `3. **${query} Latest News**\n   https://news.example.com/${encodeURIComponent(query)}\n   Breaking developments and recent updates on ${query}.`,
    ];
    return `Search results for "${query}":\n\n${results.join('\n\n')}`;
  },
  google_news: (a) => {
    const query = String(a.query || '');
    return `News results for "${query}":\n\n1. **Breaking: Major development in ${query}** — Reuters, 2 hours ago\n   Key stakeholders announce significant changes affecting the ${query} landscape.\n\n2. **${query} sees record growth this quarter** — Bloomberg, 5 hours ago\n   Industry analysts report unprecedented expansion in ${query} related sectors.`;
  },
  search_code: (a) => {
    const query = String(a.query || '');
    const repo = String(a.repo || 'all repositories');
    return `Code search results for "${query}" in ${repo}:\n\n1. **src/utils/helpers.ts:42**\n   \`\`\`typescript\n   export function processQuery(query: string): Result {\n     // matches: ${query}\n     return transform(normalize(query));\n   }\n   \`\`\`\n\n2. **lib/core/engine.ts:128**\n   \`\`\`typescript\n   const result = await executeSearch({\n     pattern: "${query}",\n     scope: 'workspace'\n   });\n   \`\`\``;
  },
  create_issue: (a) => {
    const repo = String(a.repo || 'owner/repo');
    const title = String(a.title || 'Untitled Issue');
    const issueNum = Math.floor(Math.random() * 200) + 1;
    return `Successfully created issue #${issueNum} in ${repo}:\n\n**Title:** ${title}\n**URL:** https://github.com/${repo}/issues/${issueNum}\n**Status:** Open\n**Labels:** ${(a.labels as string[] || []).join(', ') || 'none'}`;
  },
  query_validator: (a) => {
    const sql = String(a.sql_query || '');
    const upper = sql.toUpperCase();
    if (upper.includes('DROP') || upper.includes('DELETE') || upper.includes('TRUNCATE')) {
      return `SQL Validation Result:\n\n⚠️ **Warning:** Destructive operation detected.\nQuery: \`${sql}\`\n\nRecommendation: Use WHERE clause to limit scope, or wrap in a transaction.`;
    }
    return `SQL Validation Result:\n\n✅ **Status:** Valid\nQuery: \`${sql}\`\n\n- Syntax: OK\n- Tables referenced: exist in schema\n- Column types: compatible\n- Estimated rows affected: ~150`;
  },
  schema_fetch: (a) => {
    const table = String(a.table_name || 'unknown');
    return `Schema for table "${table}":\n\n| Column | Type | Nullable | Default |\n|--------|------|----------|---------|\n| id | INTEGER | NO | autoincrement |\n| name | VARCHAR(255) | NO | — |\n| email | VARCHAR(255) | YES | NULL |\n| status | VARCHAR(50) | NO | 'active' |\n| created_at | TIMESTAMP | NO | NOW() |\n| updated_at | TIMESTAMP | YES | NULL |\n\n**Indexes:**\n- PRIMARY KEY (id)\n- UNIQUE INDEX idx_email (email)\n- INDEX idx_status (status)`;
  },
};

function handleMcpTool(tool: string, args: Record<string, unknown>) {
  const handler = MCP_MOCK_HANDLERS[tool];
  if (handler) return NextResponse.json({ result: handler(args) });
  return NextResponse.json({ error: `Unknown MCP tool: ${tool}` }, { status: 400 });
}
