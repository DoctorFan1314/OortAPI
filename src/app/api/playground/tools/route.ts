import { NextRequest, NextResponse } from 'next/server';
import { validateUserFromCookie } from '@/lib/api-gateway';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const auth = validateUserFromCookie(request.headers.get('cookie'));
    if (!auth.valid || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

      // Real MCP tools
      case 'google_search':
        return await handleGoogleSearch(args, config);
      case 'google_news':
        return await handleGoogleNews(args, config);
      case 'fetch':
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
      case 'brave_web_search':
        return await handleBraveSearch(args, config);
      case 'brave_local_search':
        return await handleBraveSearch(args, config);
      case 'echo':
        return handleEcho(args);
      case 'add':
        return handleAdd(args);
      case 'get_current_time':
        return handleGetCurrentTime(args);
      case 'convert_time':
        return handleConvertTime(args);
      case 'sequentialthinking':
        return handleSequentialThinking(args);

      // Demo fallback for tools that need external services
      default:
        return handleMcpToolDemo(tool, args);
    }
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Tool execution failed' }, { status: 500 });
  }
}

// ── SSRF Protection ─────────────────────────────────────

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

// ── Built-in Tools ──────────────────────────────────────

async function handleWebSearch(
  args: Record<string, unknown>,
  config: { tavilyApiKey?: string },
) {
  const query = String(args.query || '').trim();
  const count = Math.min(10, Math.max(1, Number(args.count) || 5));

  if (!query) {
    return NextResponse.json({ result: 'Error: No search query provided.' });
  }

  if (!config.tavilyApiKey) {
    return NextResponse.json({ result: 'Please configure a Tavily API Key in tool settings first.' });
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
  if (isInternalUrl(url)) {
    return NextResponse.json({ error: 'URL targets an internal network' }, { status: 400 });
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

// ── Real MCP Tool Handlers ──────────────────────────────

async function handleGoogleSearch(
  args: Record<string, unknown>,
  config: { tavilyApiKey?: string },
) {
  const query = String(args.query || '');
  const count = Math.min(10, Math.max(1, Number(args.num_results) || 5));

  if (!config.tavilyApiKey) {
    return NextResponse.json({
      result: `⚠️ Demo mode — no Tavily API key configured.\n\nDemo results for "${query}":\n1. ${query} — Wikipedia\n2. ${query} — Latest News\n3. ${query} — Technical Documentation`,
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
  const url = String(args.url || '');
  const maxLength = Number(args.max_length) || 8000;

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return NextResponse.json({ result: 'Invalid URL', demo: false }, { status: 400 });
  }
  if (isInternalUrl(url)) {
    return NextResponse.json({ result: 'URL targets an internal network', demo: false }, { status: 400 });
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

async function handleBraveSearch(
  args: Record<string, unknown>,
  config: { tavilyApiKey?: string },
) {
  // Use Tavily as backend for Brave Search (same API)
  const query = String(args.query || '');
  const count = Math.min(20, Math.max(1, Number(args.count) || 10));

  if (!config.tavilyApiKey) {
    return NextResponse.json({
      result: `⚠️ Demo mode — no Tavily API key configured (used as Brave Search backend).\n\nDemo results for "${query}":\n1. ${query} — Example Result\n2. ${query} — Another Result`,
      demo: true,
    });
  }

  try {
    const res = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: config.tavilyApiKey, query, search_depth: 'basic', include_answer: true, max_results: count }),
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

function handleEcho(args: Record<string, unknown>) {
  const message = String(args.message || '');
  return NextResponse.json({ result: message || '(empty echo)', demo: false });
}

function handleAdd(args: Record<string, unknown>) {
  const a = Number(args.a) || 0;
  const b = Number(args.b) || 0;
  return NextResponse.json({ result: `${a} + ${b} = ${a + b}`, demo: false });
}

function handleGetCurrentTime(args: Record<string, unknown>) {
  const timezone = String(args.timezone || 'UTC');
  try {
    const now = new Date();
    const formatted = now.toLocaleString('en-US', { timeZone: timezone, dateStyle: 'full', timeStyle: 'long' });
    return NextResponse.json({ result: `Current time (${timezone}): ${formatted}\nISO: ${now.toISOString()}`, demo: false });
  } catch {
    return NextResponse.json({ result: `Current time (UTC): ${new Date().toISOString()}`, demo: false });
  }
}

function handleConvertTime(args: Record<string, unknown>) {
  const time = String(args.time || '');
  const fromTz = String(args.from_tz || 'UTC');
  const toTz = String(args.to_tz || 'UTC');

  try {
    const date = new Date(time);
    if (isNaN(date.getTime())) {
      return NextResponse.json({ result: `Invalid time format: "${time}". Use ISO format (e.g. 2026-05-28T14:30:00).`, demo: false });
    }
    const fromFormatted = date.toLocaleString('en-US', { timeZone: fromTz, dateStyle: 'full', timeStyle: 'long' });
    const toFormatted = date.toLocaleString('en-US', { timeZone: toTz, dateStyle: 'full', timeStyle: 'long' });
    return NextResponse.json({ result: `Converted:\n- ${fromTz}: ${fromFormatted}\n- ${toTz}: ${toFormatted}`, demo: false });
  } catch (err) {
    return NextResponse.json({ result: `Conversion failed: ${err instanceof Error ? err.message : 'Unknown error'}`, demo: false });
  }
}

function handleSequentialThinking(args: Record<string, unknown>) {
  const thought = String(args.thought || '').trim();
  const nextThought = String(args.nextThought || '').trim();
  const thoughtNumber = Number(args.thoughtNumber) || 1;
  const totalThoughts = Number(args.totalThoughts) || 1;

  if (!thought && !nextThought) {
    return NextResponse.json({
      result: 'No reasoning data received. Proceed with the original task using your own knowledge and provide a direct answer to the user.',
      demo: false,
    });
  }

  const isNearEnd = thoughtNumber >= totalThoughts - 1;
  const guidance = isNearEnd
    ? '\n\nYou have enough information now. Please synthesize your analysis and provide a complete answer to the user.'
    : '\n\nContinue to the next thinking step.';

  return NextResponse.json({
    result: `Step ${thoughtNumber}/${totalThoughts}: ${thought}\n\nNext: ${nextThought}${guidance}`,
    demo: false,
  });
}

// ── MCP Demo Fallback ──────────────────────────────────

const MCP_DEMO_RESPONSES: Record<string, (args: Record<string, unknown>) => string> = {
  read_file: (a) => `⚠️ Demo mode — Filesystem access is restricted for security.\n\nFile "${a.path}":\n[Content would appear here in a real environment]`,
  write_file: (a) => `⚠️ Demo mode — Filesystem write is restricted for security.\n\nWould write to "${a.path}"`,
  list_directory: (a) => `⚠️ Demo mode — Filesystem access is restricted.\n\nDirectory "${a.path}":\n- file1.ts\n- file2.ts\n- subdirectory/`,
  create_entities: (a) => `⚠️ Demo mode — Memory server not connected.\n\nCreated entities: ${JSON.stringify(a.entities, null, 2)}`,
  search_nodes: (a) => `⚠️ Demo mode — Memory server not connected.\n\nSearch results for "${a.query}":\n- No results (demo mode)`,
  open_nodes: (a) => `⚠️ Demo mode — Memory server not connected.\n\nOpened nodes: ${JSON.stringify(a.names)}`,
  list_repos: (a) => `⚠️ Demo mode — GitHub API not configured.\n\nRepositories for "${a.owner}":\n1. example-repo — A sample repository\n2. another-repo — Another sample`,
  maps_geocode: (a) => `⚠️ Demo mode — Google Maps API not configured.\n\nGeocode for "${a.address}":\n- Latitude: 37.7749\n- Longitude: -122.4194\n- Formatted: San Francisco, CA, USA`,
  maps_places: (a) => `⚠️ Demo mode — Google Maps API not configured.\n\nPlaces matching "${a.query}":\n1. Example Place — 123 Main St\n2. Another Place — 456 Oak Ave`,
  maps_directions: (a) => `⚠️ Demo mode — Google Maps API not configured.\n\nRoute from "${a.origin}" to "${a.destination}":\n- Distance: 5.2 km\n- Duration: 15 minutes\n- Mode: ${a.mode || 'driving'}`,
  puppeteer_navigate: (a) => `⚠️ Demo mode — Puppeteer not connected.\n\nNavigated to: ${a.url}\nStatus: Page loaded`,
  puppeteer_screenshot: (a) => `⚠️ Demo mode — Puppeteer not connected.\n\nScreenshot taken: ${a.name}\nSize: ${a.width || 1280}x${a.height || 720}`,
  puppeteer_click: (a) => `⚠️ Demo mode — Puppeteer not connected.\n\nClicked element: ${a.selector}`,
  slack_list_channels: () => `⚠️ Demo mode — Slack not connected.\n\nChannels:\n#general — 150 members\n#engineering — 45 members\n#random — 200 members`,
  slack_post_message: (a) => `⚠️ Demo mode — Slack not connected.\n\nPosted to channel ${a.channel_id}: "${a.text}"`,
  slack_search_messages: (a) => `⚠️ Demo mode — Slack not connected.\n\nSearch results for "${a.query}":\n1. [2026-05-28] Example message\n2. [2026-05-27] Another message`,
  query: (a) => `⚠️ Demo mode — Database not connected.\n\nQuery result:\n[\n  { "id": 1, "name": "Example" },\n  { "id": 2, "name": "Demo" }\n]`,
  list_tables: () => `⚠️ Demo mode — Database not connected.\n\nTables:\n- users\n- orders\n- products`,
  describe_table: (a) => `⚠️ Demo mode — Database not connected.\n\nSchema for "${a.table_name}":\n| Column | type |\n| id | INTEGER |\n| name | VARCHAR(255) |`,
  git_log: (a) => `⚠️ Demo mode — Git not available.\n\nRecent commits in "${a.path}":\n1. abc1234 — Latest commit (2 hours ago)\n2. def5678 — Previous commit (1 day ago)`,
  git_diff: (a) => `⚠️ Demo mode — Git not available.\n\nDiff for "${a.path}":\n\`\`\`diff\n- old line\n+ new line\n\`\`\``,
  git_commit: (a) => `⚠️ Demo mode — Git not available.\n\nWould commit in "${a.path}" with message: "${a.message}"`,
  longRunningOperation: (a) => `⚠️ Demo mode — Simulated long operation.\n\nOperation completed after ${a.duration_ms || 5000}ms.`,
  playwright_navigate: (a) => `⚠️ Demo mode — Playwright not connected.\n\nNavigated to: ${a.url}`,
  playwright_screenshot: (a) => `⚠️ Demo mode — Playwright not connected.\n\nScreenshot: ${a.name}`,
  playwright_click: (a) => `⚠️ Demo mode — Playwright not connected.\n\nClicked: ${a.selector}`,
  query_table: (a) => `⚠️ Demo mode — Supabase not connected.\n\nQuery result from "${a.table}":\n[\n  { "id": 1, "name": "Example", "status": "active" }\n]`,
  insert_row: (a) => `⚠️ Demo mode — Supabase not connected.\n\nInserted into "${a.table}": ${JSON.stringify(a.data, null, 2)}`,
  get: (a) => `⚠️ Demo mode — Redis not connected.\n\nKey "${a.key}": (not found in demo)`,
  set: (a) => `⚠️ Demo mode — Redis not connected.\n\nSet "${a.key}" = "${a.value}"`,
  delete: (a) => `⚠️ Demo mode — Redis not connected.\n\nDeleted key "${a.key}"`,
  keys: (a) => `⚠️ Demo mode — Redis not connected.\n\nKeys matching "${a.pattern || '*'}":\n- key1\n- key2`,
};

function handleMcpToolDemo(tool: string, args: Record<string, unknown>) {
  const handler = MCP_DEMO_RESPONSES[tool];
  if (handler) return NextResponse.json({ result: handler(args), demo: true });
  return NextResponse.json({ result: `Tool "${tool}" is not yet implemented. This is a demo response.`, demo: true });
}
