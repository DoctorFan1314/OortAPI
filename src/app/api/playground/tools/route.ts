import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tool, args, config } = body as {
      tool: string;
      args: Record<string, unknown>;
      config: { tavilyApiKey?: string; githubToken?: string };
    };

    switch (tool) {
      // Built-in tools
      case 'web_search':
        return await handleWebSearch(args, config);
      case 'fetch_url':
        return await handleFetchUrl(args);
      case 'sequential_thinking':
        return handleSequentialThinking(args);

      // MCP tools — real execution where possible, demo fallback
      case 'google_search':
        return await handleGoogleSearch(args, config);
      case 'google_news':
        return await handleGoogleNews(args, config);
      case 'fetch_content':
        return await handleFetchContent(args);
      case 'search_code':
        return await handleSearchCode(args, config);
      case 'create_issue':
        return await handleCreateIssue(args, config);
      case 'query_validator':
        return handleQueryValidator(args);
      case 'schema_fetch':
        return handleSchemaFetch(args);
      case 'geocode':
      case 'route_planning':
      case 'bing_search':
      case 'supabase_query':
      case 'supabase_insert':
      case 'search_hotels':
      case 'extract_video_text':
      case 'get_video_materials':
      case 'generate_ppt':
      case 'browse_menu':
      case 'place_order':
      case 'search_trains':
      case 'navigate_url':
      case 'evaluate_js':
      case 'get_console_logs':
      case 'generate_chart':
      case 'store_memory':
      case 'recall_memory':
      case 'get_book_notes':
      case 'search_books':
        return handleMcpToolDemo(tool, args);

      default:
        return NextResponse.json({ error: `Unknown tool: ${tool}` }, { status: 400 });
    }
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Tool execution failed' }, { status: 500 });
  }
}

// ── Built-in Tools ──────────────────────────────────────

async function handleWebSearch(
  args: Record<string, unknown>,
  config: { tavilyApiKey?: string },
) {
  const query = String(args.query || '').trim();
  const count = Math.min(10, Math.max(1, Number(args.count) || 5));

  if (!query) {
    return NextResponse.json({ result: 'Error: No search query provided. Please provide a query parameter.' });
  }

  if (!config.tavilyApiKey) {
    return NextResponse.json({ result: 'Please configure a Tavily API Key in tool settings first.' });
  }

  try {
    // Auto-detect time-sensitive queries and limit to recent results
    const isTimeSensitive = /今天|今日|today|latest|最新|recent|breaking/i.test(query);
    const tavilyBody: Record<string, unknown> = { api_key: config.tavilyApiKey, query, search_depth: 'basic', include_answer: true, max_results: count };
    if (isTimeSensitive) tavilyBody.days = 1; // Limit to last 24 hours

    const res = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tavilyBody),
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

function handleSequentialThinking(args: Record<string, unknown>) {
  const thought = String(args.thought || '').trim();
  const nextThought = String(args.nextThought || '').trim();
  const thoughtNumber = Number(args.thoughtNumber) || 1;
  const totalThoughts = Number(args.totalThoughts) || 1;

  // If model sent empty arguments, tell it to proceed without the tool
  if (!thought && !nextThought) {
    return NextResponse.json({
      result: 'No reasoning data received. Proceed with the original task using your own knowledge and provide a direct answer to the user.',
    });
  }

  const isNearEnd = thoughtNumber >= totalThoughts - 1;
  const guidance = isNearEnd
    ? '\n\nYou have enough information now. Please synthesize your analysis and provide a complete answer to the user.'
    : '\n\nContinue to the next thinking step.';

  return NextResponse.json({
    result: `Step ${thoughtNumber}/${totalThoughts}: ${thought}\n\nNext: ${nextThought}${guidance}`,
  });
}

// ── MCP Tools with Real Execution ──────────────────────

async function handleGoogleSearch(
  args: Record<string, unknown>,
  config: { tavilyApiKey?: string },
) {
  // Use Tavily API for real search (same backend as web_search)
  const query = String(args.query || '');
  const count = Math.min(10, Math.max(1, Number(args.num_results) || 5));

  if (!config.tavilyApiKey) {
    return NextResponse.json({
      result: `⚠️ Demo mode — no Tavily API key configured.\n\nTo enable real search, add your Tavily API key in the Playground tool settings.\n\nDemo results for "${query}":\n1. ${query} — Wikipedia\n2. ${query} — Latest News\n3. ${query} — Technical Documentation`,
      demo: true,
    });
  }

  try {
    const isTimeSensitive = /今天|今日|today|latest|最新|recent|breaking/i.test(query);
    const tavilyBody: Record<string, unknown> = { api_key: config.tavilyApiKey, query, search_depth: 'basic', include_answer: true, max_results: count };
    if (isTimeSensitive) tavilyBody.days = 1;

    const res = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tavilyBody),
    });
    if (!res.ok) return NextResponse.json({ result: `Search failed: HTTP ${res.status}`, demo: false });

    const data = await res.json();
    const formatted = data.answer ? `Answer: ${data.answer}\n\n` : '';
    const results = (data.results || []).map((r: { title: string; url: string; content: string }, i: number) =>
      `${i + 1}. [${r.title}](${r.url})\n   ${r.content.slice(0, 500)}`
    ).join('\n\n');
    return NextResponse.json({ result: formatted + results || 'No results found.', demo: false });
  } catch (err) {
    return NextResponse.json({ result: `Search failed: ${err instanceof Error ? err.message : 'Unknown error'}`, demo: false });
  }
}

async function handleGoogleNews(
  args: Record<string, unknown>,
  config: { tavilyApiKey?: string },
) {
  const query = String(args.query || '');

  if (!config.tavilyApiKey) {
    return NextResponse.json({
      result: `⚠️ Demo mode — no Tavily API key configured.\n\nDemo news results for "${query}":\n1. Breaking: Major development in ${query}\n2. ${query} sees record growth this quarter`,
      demo: true,
    });
  }

  try {
    const res = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: config.tavilyApiKey, query: `${query} news`, search_depth: 'basic', include_answer: true, max_results: 5 }),
    });
    if (!res.ok) return NextResponse.json({ result: `News search failed: HTTP ${res.status}`, demo: false });

    const data = await res.json();
    const results = (data.results || []).map((r: { title: string; url: string; content: string }, i: number) =>
      `${i + 1}. [${r.title}](${r.url})\n   ${r.content.slice(0, 300)}`
    ).join('\n\n');
    return NextResponse.json({ result: results || 'No news found.', demo: false });
  } catch (err) {
    return NextResponse.json({ result: `News search failed: ${err instanceof Error ? err.message : 'Unknown error'}`, demo: false });
  }
}

async function handleFetchContent(args: Record<string, unknown>) {
  // Real URL fetch — same as handleFetchUrl
  const url = String(args.url || '');
  const maxLength = Number(args.max_length) || 8000;

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return NextResponse.json({ error: 'Invalid URL', demo: false }, { status: 400 });
  }

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; OortAPI/1.0)' },
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) return NextResponse.json({ result: `HTTP ${res.status}`, demo: false });

    const html = await res.text();
    const text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, maxLength);

    return NextResponse.json({ result: text || 'No readable content found.', demo: false });
  } catch (err) {
    return NextResponse.json({ result: `Fetch failed: ${err instanceof Error ? err.message : 'Unknown error'}`, demo: false });
  }
}

async function handleSearchCode(
  args: Record<string, unknown>,
  config: { githubToken?: string },
) {
  const query = String(args.query || '');
  const repo = String(args.repo || '');
  const language = String(args.language || '');

  // Try real GitHub code search API
  let searchQuery = query;
  if (language) searchQuery += ` language:${language}`;
  if (repo) searchQuery += ` repo:${repo}`;

  const headers: Record<string, string> = { 'Accept': 'application/vnd.github.v3+json', 'User-Agent': 'OortAPI' };
  if (config.githubToken) headers['Authorization'] = `token ${config.githubToken}`;

  try {
    const res = await fetch(`https://api.github.com/search/code?q=${encodeURIComponent(searchQuery)}&per_page=5`, {
      headers,
      signal: AbortSignal.timeout(10000),
    });

    if (res.status === 403) {
      return NextResponse.json({
        result: `⚠️ GitHub API rate limit exceeded. Add a GitHub token for higher limits.\n\nDemo results for "${query}":\n1. src/utils/helpers.ts:42 — matching code\n2. lib/core/engine.ts:128 — matching code`,
        demo: true,
      });
    }

    if (!res.ok) {
      return NextResponse.json({
        result: `⚠️ GitHub search returned ${res.status}. ${!config.githubToken ? 'Add a GitHub token for better results.' : ''}\n\nDemo results for "${query}":\n1. src/main.ts:42 — matching code snippet\n2. lib/core.ts:128 — matching code snippet`,
        demo: !config.githubToken,
      });
    }

    const data = await res.json();
    if (data.items && data.items.length > 0) {
      const results = data.items.slice(0, 5).map((item: { name: string; path: string; repository: { full_name: string }; html_url: string }, i: number) =>
        `${i + 1}. **${item.path}** in ${item.repository.full_name}\n   ${item.html_url}`
      ).join('\n\n');
      return NextResponse.json({ result: `Code search results for "${query}":\n\n${results}`, demo: false });
    }
    return NextResponse.json({ result: `No code results found for "${query}".`, demo: false });
  } catch {
    return NextResponse.json({
      result: `⚠️ GitHub API unreachable. Demo results for "${query}":\n1. src/utils/helpers.ts:42\n2. lib/core/engine.ts:128`,
      demo: true,
    });
  }
}

async function handleCreateIssue(
  args: Record<string, unknown>,
  config: { githubToken?: string },
) {
  const repo = String(args.repo || '');
  const title = String(args.title || 'Untitled Issue');
  const body = String(args.body || '');
  const labels = args.labels as string[] || [];

  if (!config.githubToken) {
    const issueNum = Math.floor(Math.random() * 200) + 1;
    return NextResponse.json({
      result: `⚠️ Demo mode — no GitHub token configured.\n\nDemo: Created issue #${issueNum} in ${repo}:\n**Title:** ${title}\n**URL:** https://github.com/${repo}/issues/${issueNum}\n**Status:** Open\n**Labels:** ${labels.join(', ') || 'none'}`,
      demo: true,
    });
  }

  try {
    const res = await fetch(`https://api.github.com/repos/${repo}/issues`, {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `token ${config.githubToken}`,
        'Content-Type': 'application/json',
        'User-Agent': 'OortAPI',
      },
      body: JSON.stringify({ title, body, labels }),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return NextResponse.json({ result: `GitHub API error: ${res.status} — ${(errData as Record<string, string>).message || 'Unknown error'}`, demo: false });
    }

    const data = await res.json() as { number: number; html_url: string; state: string };
    return NextResponse.json({
      result: `Successfully created issue #${data.number} in ${repo}:\n\n**Title:** ${title}\n**URL:** ${data.html_url}\n**Status:** ${data.state}\n**Labels:** ${labels.join(', ') || 'none'}`,
      demo: false,
    });
  } catch (err) {
    return NextResponse.json({ result: `Failed to create issue: ${err instanceof Error ? err.message : 'Unknown error'}`, demo: false });
  }
}

function handleQueryValidator(args: Record<string, unknown>) {
  // SQL validation is inherently local/demo — no external API
  const sql = String(args.sql_query || '');
  const upper = sql.toUpperCase();

  if (!sql.trim()) {
    return NextResponse.json({ result: 'Please provide a SQL query to validate.', demo: true });
  }

  if (upper.includes('DROP') || upper.includes('DELETE') || upper.includes('TRUNCATE')) {
    return NextResponse.json({
      result: `SQL Validation Result:\n\n⚠️ **Warning:** Destructive operation detected.\nQuery: \`${sql}\`\n\nRecommendation: Use WHERE clause to limit scope, or wrap in a transaction.`,
      demo: true,
    });
  }

  return NextResponse.json({
    result: `SQL Validation Result:\n\n✅ **Status:** Valid\nQuery: \`${sql}\`\n\n- Syntax: OK\n- Tables referenced: exist in schema\n- Column types: compatible\n- Estimated rows affected: ~150`,
    demo: true,
  });
}

function handleSchemaFetch(args: Record<string, unknown>) {
  const table = String(args.table_name || 'unknown');
  return NextResponse.json({
    result: `Schema for table "${table}":\n\n| Column | Type | Nullable | Default |\n|--------|------|----------|---------|\n| id | INTEGER | NO | autoincrement |\n| name | VARCHAR(255) | NO | — |\n| email | VARCHAR(255) | YES | NULL |\n| status | VARCHAR(50) | NO | 'active' |\n| created_at | TIMESTAMP | NO | NOW() |\n| updated_at | TIMESTAMP | YES | NULL |\n\n**Indexes:**\n- PRIMARY KEY (id)\n- UNIQUE INDEX idx_email (email)\n- INDEX idx_status (status)`,
    demo: true,
  });
}

// ── MCP Demo Fallback ──────────────────────────────────

const MCP_DEMO_RESPONSES: Record<string, (args: Record<string, unknown>) => string> = {
  geocode: (a) => `⚠️ Demo mode — Amap API not configured.\n\nGeocode result for "${a.address}":\n- Latitude: 39.9042\n- Longitude: 116.4074\n- Formatted: Beijing, China`,
  route_planning: (a) => `⚠️ Demo mode — Amap API not configured.\n\nRoute from "${a.origin}" to "${a.destination}":\n- Distance: 12.5 km\n- Duration: 25 minutes\n- Mode: ${a.mode || 'driving'}`,
  bing_search: (a) => `⚠️ Demo mode — Bing API not configured.\n\nSearch results for "${a.query}":\n1. Example Result — https://example.com\n2. Another Result — https://example.org`,
  supabase_query: (a) => `⚠️ Demo mode — Supabase not connected.\n\nQuery result from "${a.table}":\n[\n  { "id": 1, "name": "Example", "status": "active" },\n  { "id": 2, "name": "Demo", "status": "active" }\n]`,
  supabase_insert: (a) => `⚠️ Demo mode — Supabase not connected.\n\nInserted into "${a.table}": ${JSON.stringify(a.data, null, 2)}`,
  search_hotels: (a) => `⚠️ Demo mode — RollingGo API not configured.\n\nHotels in "${a.location}" (${a.check_in} to ${a.check_out}):\n1. Grand Hotel — $120/night, 4.5★\n2. City Inn — $85/night, 4.2★\n3. Budget Lodge — $45/night, 3.8★`,
  extract_video_text: (a) => `⚠️ Demo mode — Douyin API not configured.\n\nExtracted text from ${a.video_url}:\n"这是一个示例视频文案，展示了抖音内容创作的技巧和方法..."`,
  get_video_materials: (a) => `⚠️ Demo mode — Douyin API not configured.\n\nVideo metadata:\n- Title: 示例视频\n- Likes: 12.5k\n- Comments: 342\n- Tags: #创作 #技巧 #分享`,
  generate_ppt: (a) => `⚠️ Demo mode — ChatPPT API not configured.\n\nGenerated presentation: "${a.topic}"\n- Slides: ${a.slides || 10}\n- Style: ${a.style || 'business'}\n- Status: Demo preview only`,
  browse_menu: () => `⚠️ Demo mode — McDonald's API not configured.\n\nMenu items:\n- Big Mac — ¥24.5\n- McChicken — ¥15.0\n- French Fries (L) — ¥12.5\n- Coca-Cola (M) — ¥9.0`,
  place_order: () => `⚠️ Demo mode — McDonald's API not configured.\n\nDemo order placed:\n- Order #M20260528001\n- Status: Preparing\n- ETA: 25 minutes`,
  search_trains: (a) => `⚠️ Demo mode — 12306 API not configured.\n\nTrains from "${a.from}" to "${a.to}" on ${a.date}:\n- G1234  08:00→12:30  ¥553.0  二等座\n- G5678  09:30→14:00  ¥553.0  二等座\n- D1234  10:15→15:45  ¥388.0  二等座`,
  navigate_url: (a) => `⚠️ Demo mode — Chrome DevTools not connected.\n\nNavigated to: ${a.url}\nStatus: Page loaded successfully`,
  evaluate_js: (a) => `⚠️ Demo mode — Chrome DevTools not connected.\n\nJS evaluation result:\n${a.expression} → undefined`,
  get_console_logs: () => `⚠️ Demo mode — Chrome DevTools not connected.\n\nConsole logs:\n[INFO] Page loaded\n[LOG] React DevTools connected\n[WARN] Deprecated API usage detected`,
  generate_chart: (a) => `⚠️ Demo mode — AntVis not configured.\n\nGenerated ${a.chart_type} chart: "${a.title}"\n- Data points: ${Object.keys((a.data as Record<string, unknown>) || {}).length}\n- Status: Demo preview only`,
  store_memory: (a) => `⚠️ Demo mode — MemOS not connected.\n\nStored memory:\n- Content: "${a.content}"\n- Tags: ${(a.tags as string[] || []).join(', ') || 'none'}\n- ID: mem-${Date.now()}`,
  recall_memory: (a) => `⚠️ Demo mode — MemOS not connected.\n\nRecalled memories for "${a.query}":\n1. [2026-05-20] Related memory entry\n2. [2026-05-15] Another relevant memory`,
  get_book_notes: () => `⚠️ Demo mode — WeRead not connected.\n\nBook notes:\n- "这是划线内容 1" — Page 42\n- "这是划线内容 2" — Page 87\n- "这是笔记内容" — Page 103`,
  search_books: (a) => `⚠️ Demo mode — WeRead not connected.\n\nBooks matching "${a.query}":\n1. 《示例书籍》— 作者名 — 156 条笔记\n2. 《另一本书》— 作者名 — 89 条笔记`,
};

function handleMcpToolDemo(tool: string, args: Record<string, unknown>) {
  const handler = MCP_DEMO_RESPONSES[tool];
  if (handler) return NextResponse.json({ result: handler(args), demo: true });
  return NextResponse.json({ result: `Tool "${tool}" is not yet implemented. This is a demo response.`, demo: true });
}
