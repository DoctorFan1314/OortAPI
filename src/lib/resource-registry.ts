import type { ToolDefinition } from "./playground-tools";
import { skills } from "./mock-data";
import { agentSkills } from "./mock-agent-skills";

// ─── Resource Type System ─────────────────────────────────
// Three strictly separated dimensions:
// 1. prompt-template: pure text strings injected into systemPrompt
// 2. mcp: Cloud MCP servers with requiredTools for Tool Loop
// 3. client-skill: JSON config for local agent clients (copy only)

export type ResourceType = "prompt-template" | "mcp" | "client-skill";
export type McpCategory = "search" | "browser" | "developer" | "knowledge" | "location" | "media" | "productivity";

export interface ResourceItem {
  id: string;
  type: ResourceType;
  name: string;
  nameZh: string;
  description: string;
  descriptionZh: string;
  category: string;
  tags: string[];
  pricing: "pricingFree" | "pricingPlatformDeduct" | "pricingClientOnly";
  featured: boolean;
  // Type-specific (mutually exclusive):
  promptContent?: string;           // prompt-template only
  requiredTools?: ToolDefinition[];  // mcp only
  clientConfigJson?: string;         // client-skill only
  // MCP ecosystem metadata
  mcpDeployment?: "hosted" | "local";
  mcpCategory?: McpCategory;
  mcpDeveloper?: string;
  mcpLicense?: string;
  mcpGithub?: string;
  mcpLastUpdated?: string;
  mcpUsageCount?: string;
  mcpUserCount?: string;
  mcpToolDescription?: string;
}

// ─── MCP Tool Definitions (Real Open-Source Servers) ───────

// Fetch — modelcontextprotocol/servers (MIT)
const fetchMcpTools: ToolDefinition[] = [
  { type: "function", function: { name: "fetch", description: "Fetch a URL and convert HTML to clean Markdown. Supports start_index for pagination.", parameters: { type: "object", properties: { url: { type: "string", description: "URL to fetch" }, max_length: { type: "number", description: "Max characters (default 5000)", default: 5000 }, start_index: { type: "number", description: "Start from this char index (default 0)", default: 0 }, raw: { type: "boolean", description: "Return raw HTML instead of markdown", default: false } }, required: ["url"] } } },
];

// Filesystem — modelcontextprotocol/servers (MIT)
const filesystemTools: ToolDefinition[] = [
  { type: "function", function: { name: "read_file", description: "Read the complete contents of a file from the file system.", parameters: { type: "object", properties: { path: { type: "string", description: "Absolute path to the file" } }, required: ["path"] } } },
  { type: "function", function: { name: "write_file", description: "Create or overwrite a file with new content.", parameters: { type: "object", properties: { path: { type: "string", description: "Absolute path to the file" }, content: { type: "string", description: "Content to write" } }, required: ["path", "content"] } } },
  { type: "function", function: { name: "list_directory", description: "List files and directories at a given path.", parameters: { type: "object", properties: { path: { type: "string", description: "Directory path" } }, required: ["path"] } } },
];

// Memory — modelcontextprotocol/servers (MIT)
const memoryTools: ToolDefinition[] = [
  { type: "function", function: { name: "create_entities", description: "Create new entities (nodes) in the knowledge graph.", parameters: { type: "object", properties: { entities: { type: "array", items: { type: "object" }, description: "Entities to create" } }, required: ["entities"] } } },
  { type: "function", function: { name: "search_nodes", description: "Search for nodes in the knowledge graph by query.", parameters: { type: "object", properties: { query: { type: "string", description: "Search query" } }, required: ["query"] } } },
  { type: "function", function: { name: "open_nodes", description: "Retrieve specific nodes by their names.", parameters: { type: "object", properties: { names: { type: "array", items: { type: "string" }, description: "Node names to retrieve" } }, required: ["names"] } } },
];

// GitHub — modelcontextprotocol/servers (MIT)
const githubMcpTools: ToolDefinition[] = [
  { type: "function", function: { name: "search_code", description: "Search for code across GitHub repositories.", parameters: { type: "object", properties: { query: { type: "string", description: "Search query" }, repo: { type: "string", description: "Optional: limit to owner/repo" } }, required: ["query"] } } },
  { type: "function", function: { name: "create_issue", description: "Create a new issue in a GitHub repository.", parameters: { type: "object", properties: { repo: { type: "string", description: "Repository (owner/repo)" }, title: { type: "string", description: "Issue title" }, body: { type: "string", description: "Issue body (Markdown)" }, labels: { type: "array", items: { type: "string" }, description: "Labels" } }, required: ["repo", "title", "body"] } } },
  { type: "function", function: { name: "list_repos", description: "List repositories for a user or organization.", parameters: { type: "object", properties: { owner: { type: "string", description: "GitHub username or org" }, per_page: { type: "number", description: "Results per page (max 100)", default: 30 } }, required: ["owner"] } } },
];

// Brave Search — modelcontextprotocol/servers (MIT)
const braveSearchTools: ToolDefinition[] = [
  { type: "function", function: { name: "brave_web_search", description: "Search the web using Brave Search API. Returns relevant web results.", parameters: { type: "object", properties: { query: { type: "string", description: "Search query" }, count: { type: "number", description: "Number of results (1-20)", default: 10 } }, required: ["query"] } } },
  { type: "function", function: { name: "brave_local_search", description: "Search for local businesses and places using Brave Search.", parameters: { type: "object", properties: { query: { type: "string", description: "Search query (e.g. 'coffee shops near me')" }, count: { type: "number", description: "Number of results", default: 5 } }, required: ["query"] } } },
];

// Google Maps — modelcontextprotocol/servers (MIT)
const googleMapsTools: ToolDefinition[] = [
  { type: "function", function: { name: "maps_geocode", description: "Convert an address into geographic coordinates.", parameters: { type: "object", properties: { address: { type: "string", description: "Address to geocode" } }, required: ["address"] } } },
  { type: "function", function: { name: "maps_places", description: "Search for places using Google Places API.", parameters: { type: "object", properties: { query: { type: "string", description: "Search query" }, location: { type: "string", description: "Optional: lat,lng bias" } }, required: ["query"] } } },
  { type: "function", function: { name: "maps_directions", description: "Get directions between two locations.", parameters: { type: "object", properties: { origin: { type: "string", description: "Start address or place" }, destination: { type: "string", description: "End address or place" }, mode: { type: "string", description: "travel mode: driving/walking/transit/bicycling", default: "driving" } }, required: ["origin", "destination"] } } },
];

// Puppeteer — modelcontextprotocol/servers (MIT)
const puppeteerTools: ToolDefinition[] = [
  { type: "function", function: { name: "puppeteer_navigate", description: "Navigate the browser to a URL.", parameters: { type: "object", properties: { url: { type: "string", description: "URL to navigate to" } }, required: ["url"] } } },
  { type: "function", function: { name: "puppeteer_screenshot", description: "Take a screenshot of the current page.", parameters: { type: "object", properties: { name: { type: "string", description: "Screenshot name" }, width: { type: "number", description: "Viewport width", default: 1280 }, height: { type: "number", description: "Viewport height", default: 720 } }, required: ["name"] } } },
  { type: "function", function: { name: "puppeteer_click", description: "Click on an element by CSS selector.", parameters: { type: "object", properties: { selector: { type: "string", description: "CSS selector" } }, required: ["selector"] } } },
];

// Slack — modelcontextprotocol/servers (MIT)
const slackTools: ToolDefinition[] = [
  { type: "function", function: { name: "slack_list_channels", description: "List channels in the Slack workspace.", parameters: { type: "object", properties: { limit: { type: "number", description: "Max channels to return", default: 100 } }, required: [] } } },
  { type: "function", function: { name: "slack_post_message", description: "Post a message to a Slack channel.", parameters: { type: "object", properties: { channel_id: { type: "string", description: "Channel ID" }, text: { type: "string", description: "Message text" } }, required: ["channel_id", "text"] } } },
  { type: "function", function: { name: "slack_search_messages", description: "Search messages in Slack.", parameters: { type: "object", properties: { query: { type: "string", description: "Search query" }, count: { type: "number", description: "Max results", default: 10 } }, required: ["query"] } } },
];

// PostgreSQL — modelcontextprotocol/servers (MIT)
const postgresMcpTools: ToolDefinition[] = [
  { type: "function", function: { name: "query", description: "Execute a read-only SQL query against the PostgreSQL database.", parameters: { type: "object", properties: { sql: { type: "string", description: "SQL query to execute" } }, required: ["sql"] } } },
];

// SQLite — modelcontextprotocol/servers (MIT)
const sqliteTools: ToolDefinition[] = [
  { type: "function", function: { name: "query", description: "Execute a SQL query against the SQLite database.", parameters: { type: "object", properties: { sql: { type: "string", description: "SQL query to execute" } }, required: ["sql"] } } },
  { type: "function", function: { name: "list_tables", description: "List all tables in the database.", parameters: { type: "object", properties: {}, required: [] } } },
  { type: "function", function: { name: "describe_table", description: "Get the schema of a specific table.", parameters: { type: "object", properties: { table_name: { type: "string", description: "Table name" } }, required: ["table_name"] } } },
];

// Git — modelcontextprotocol/servers (MIT)
const gitTools: ToolDefinition[] = [
  { type: "function", function: { name: "git_log", description: "Show commit logs for a repository.", parameters: { type: "object", properties: { path: { type: "string", description: "Repository path" }, max_count: { type: "number", description: "Max commits to show", default: 10 } }, required: ["path"] } } },
  { type: "function", function: { name: "git_diff", description: "Show changes between commits or working tree.", parameters: { type: "object", properties: { path: { type: "string", description: "Repository path" }, ref1: { type: "string", description: "First ref (commit/branch)" }, ref2: { type: "string", description: "Second ref (optional)" } }, required: ["path"] } } },
  { type: "function", function: { name: "git_commit", description: "Create a new commit with staged changes.", parameters: { type: "object", properties: { path: { type: "string", description: "Repository path" }, message: { type: "string", description: "Commit message" } }, required: ["path", "message"] } } },
];

// Everything (testing) — modelcontextprotocol/servers (MIT)
const everythingTools: ToolDefinition[] = [
  { type: "function", function: { name: "echo", description: "Echo back the input message. Useful for testing.", parameters: { type: "object", properties: { message: { type: "string", description: "Message to echo back" } }, required: ["message"] } } },
  { type: "function", function: { name: "add", description: "Add two numbers together.", parameters: { type: "object", properties: { a: { type: "number", description: "First number" }, b: { type: "number", description: "Second number" } }, required: ["a", "b"] } } },
  { type: "function", function: { name: "longRunningOperation", description: "Simulate a long-running operation for testing timeouts.", parameters: { type: "object", properties: { duration_ms: { type: "number", description: "Duration in milliseconds", default: 5000 } }, required: [] } } },
];

// Playwright — executeautomation/playwright-mcp-server (MIT)
const playwrightTools: ToolDefinition[] = [
  { type: "function", function: { name: "playwright_navigate", description: "Navigate to a URL using Playwright browser automation.", parameters: { type: "object", properties: { url: { type: "string", description: "URL to navigate to" } }, required: ["url"] } } },
  { type: "function", function: { name: "playwright_screenshot", description: "Take a screenshot of the current page.", parameters: { type: "object", properties: { name: { type: "string", description: "Screenshot filename" }, fullPage: { type: "boolean", description: "Capture full page", default: false } }, required: ["name"] } } },
  { type: "function", function: { name: "playwright_click", description: "Click on an element by selector.", parameters: { type: "object", properties: { selector: { type: "string", description: "CSS or XPath selector" } }, required: ["selector"] } } },
];

// Supabase — supabase-community/supabase-mcp-server (Apache-2.0)
const supabaseTools: ToolDefinition[] = [
  { type: "function", function: { name: "query_table", description: "Query rows from a Supabase table with optional filters.", parameters: { type: "object", properties: { table: { type: "string", description: "Table name" }, filters: { type: "object", description: "Filter conditions (column: value)" }, limit: { type: "number", description: "Max rows", default: 10 } }, required: ["table"] } } },
  { type: "function", function: { name: "insert_row", description: "Insert a new row into a Supabase table.", parameters: { type: "object", properties: { table: { type: "string", description: "Table name" }, data: { type: "object", description: "Row data to insert" } }, required: ["table", "data"] } } },
  { type: "function", function: { name: "list_tables", description: "List all tables in the Supabase project.", parameters: { type: "object", properties: {}, required: [] } } },
];

// Sequential Thinking — modelcontextprotocol/servers (MIT)
const sequentialThinkingTools: ToolDefinition[] = [
  { type: "function", function: { name: "sequentialthinking", description: "Break down complex problems into sequential reasoning steps.", parameters: { type: "object", properties: { thought: { type: "string", description: "Current reasoning step" }, nextThought: { type: "string", description: "What the next step should explore" }, thoughtNumber: { type: "number", description: "Current step number" }, totalThoughts: { type: "number", description: "Estimated total steps" } }, required: ["thought", "nextThought"] } } },
];

// Time — modelcontextprotocol/servers (MIT)
const timeTools: ToolDefinition[] = [
  { type: "function", function: { name: "get_current_time", description: "Get the current date and time in ISO format.", parameters: { type: "object", properties: { timezone: { type: "string", description: "Timezone (e.g. Asia/Shanghai, UTC)", default: "UTC" } }, required: [] } } },
  { type: "function", function: { name: "convert_time", description: "Convert time between timezones.", parameters: { type: "object", properties: { time: { type: "string", description: "Time string (ISO format or natural language)" }, from_tz: { type: "string", description: "Source timezone" }, to_tz: { type: "string", description: "Target timezone" } }, required: ["time", "from_tz", "to_tz"] } } },
];

// Redis — modelcontextprotocol/servers (MIT)
const redisTools: ToolDefinition[] = [
  { type: "function", function: { name: "get", description: "Get the value of a Redis key.", parameters: { type: "object", properties: { key: { type: "string", description: "Redis key" } }, required: ["key"] } } },
  { type: "function", function: { name: "set", description: "Set a Redis key-value pair.", parameters: { type: "object", properties: { key: { type: "string", description: "Redis key" }, value: { type: "string", description: "Value to set" }, ttl: { type: "number", description: "TTL in seconds (optional)" } }, required: ["key", "value"] } } },
  { type: "function", function: { name: "delete", description: "Delete a Redis key.", parameters: { type: "object", properties: { key: { type: "string", description: "Redis key to delete" } }, required: ["key"] } } },
  { type: "function", function: { name: "keys", description: "List Redis keys matching a pattern.", parameters: { type: "object", properties: { pattern: { type: "string", description: "Glob pattern (e.g. 'user:*')", default: "*" } }, required: [] } } },
];

// Google Search — Tavily-based (real execution)
const googleSearchTools: ToolDefinition[] = [
  { type: "function", function: { name: "google_search", description: "Search the web for current information using Google.", parameters: { type: "object", properties: { query: { type: "string", description: "Search query" }, num_results: { type: "number", description: "Number of results (1-10)", default: 5 } }, required: ["query"] } } },
  { type: "function", function: { name: "google_news", description: "Search Google News for recent articles.", parameters: { type: "object", properties: { query: { type: "string", description: "News query" }, time_period: { type: "string", description: "Time range: day/week/month", default: "week" } }, required: ["query"] } } },
];

// GitHub Assistant — GitHub API (real execution)
const githubAssistantTools: ToolDefinition[] = [
  { type: "function", function: { name: "search_code", description: "Search code across GitHub repositories.", parameters: { type: "object", properties: { query: { type: "string", description: "Code search query" }, language: { type: "string", description: "Filter by language" }, repo: { type: "string", description: "Limit to owner/repo" } }, required: ["query"] } } },
  { type: "function", function: { name: "create_issue", description: "Create a new issue in a GitHub repository.", parameters: { type: "object", properties: { repo: { type: "string", description: "Repository (owner/repo)" }, title: { type: "string", description: "Issue title" }, body: { type: "string", description: "Issue body (Markdown)" }, labels: { type: "array", items: { type: "string" }, description: "Labels" } }, required: ["repo", "title", "body"] } } },
];

// PostgreSQL Context — local validation (real execution)
const postgresContextTools: ToolDefinition[] = [
  { type: "function", function: { name: "query_validator", description: "Validate SQL queries against database schema.", parameters: { type: "object", properties: { sql_query: { type: "string", description: "SQL to validate" }, db_type: { type: "string", description: "Dialect: postgresql/mysql/sqlite", default: "postgresql" } }, required: ["sql_query"] } } },
  { type: "function", function: { name: "schema_fetch", description: "Fetch table schema metadata including columns, types, indexes.", parameters: { type: "object", properties: { table_name: { type: "string", description: "Table name" }, include_indexes: { type: "boolean", description: "Include indexes", default: true } }, required: ["table_name"] } } },
];

// ─── Convert mock-data skills to ResourceItems ────────────

function mapCategorySlug(slug: string): string {
  const map: Record<string, string> = {
    content: "production", coding: "development", thinking: "production",
    data: "analytics", productivity: "production", creative: "production",
  };
  return map[slug] ?? "production";
}

const promptResourceItems: ResourceItem[] = skills.map((skill) => ({
  id: `prompt-${skill.id}`,
  type: "prompt-template" as const,
  name: skill.title.replace(/（.*?）/, "").trim(),
  nameZh: skill.title,
  description: skill.subtitle,
  descriptionZh: skill.description,
  category: mapCategorySlug(skill.categorySlug),
  tags: skill.tags,
  pricing: "pricingFree" as const,
  featured: skill.featured,
  promptContent: skill.promptOnline,
}));

// ─── MCP Ecosystem Nodes (Real Open-Source Servers) ────────

const mcpEcosystemNodes: ResourceItem[] = [
  {
    id: "mcp-fetch", type: "mcp", name: "Fetch", nameZh: "Fetch 网页内容抓取",
    description: "Fetch URLs and convert HTML to clean Markdown. Supports pagination via start_index.",
    descriptionZh: "抓取网页 URL 并将 HTML 转换为干净的 Markdown 文本。支持通过 start_index 分页读取长网页。",
    category: "development", tags: ["web", "fetch", "markdown", "html", "scraping"],
    pricing: "pricingPlatformDeduct", featured: true,
    requiredTools: fetchMcpTools, mcpDeployment: "hosted", mcpCategory: "search",
    mcpDeveloper: "modelcontextprotocol", mcpLicense: "MIT", mcpGithub: "modelcontextprotocol/servers",
    mcpLastUpdated: "2026-05-25", mcpUsageCount: "287.6m", mcpUserCount: "489.0k",
    mcpToolDescription: "该服务器使大型语言模型能够检索和处理网页内容，将 HTML 转换为 markdown 格式，以便于更轻松地使用。获取工具会截断响应，但通过使用 start_index 参数，您可以指定从何处开始提取内容。",
  },
  {
    id: "mcp-filesystem", type: "mcp", name: "Filesystem", nameZh: "文件系统",
    description: "Read, write, and manage local files. Sandboxed to allowed directories.",
    descriptionZh: "读取、写入和管理本地文件。限定在允许的目录范围内，确保安全。",
    category: "development", tags: ["filesystem", "files", "local", "io"],
    pricing: "pricingPlatformDeduct", featured: false,
    requiredTools: filesystemTools, mcpDeployment: "local", mcpCategory: "developer",
    mcpDeveloper: "modelcontextprotocol", mcpLicense: "MIT", mcpGithub: "modelcontextprotocol/servers",
    mcpLastUpdated: "2026-05-25", mcpUsageCount: "156.2m", mcpUserCount: "234.5k",
    mcpToolDescription: "文件系统 MCP 服务器提供安全的本地文件读写操作，限定在允许的目录范围内。",
  },
  {
    id: "mcp-memory", type: "mcp", name: "Memory", nameZh: "知识图谱记忆",
    description: "Persistent knowledge graph memory. Create, search, and retrieve entities across sessions.",
    descriptionZh: "持久化知识图谱记忆系统。跨会话创建、搜索和检索实体节点。",
    category: "production", tags: ["memory", "knowledge", "graph", "persistence"],
    pricing: "pricingPlatformDeduct", featured: true,
    requiredTools: memoryTools, mcpDeployment: "hosted", mcpCategory: "knowledge",
    mcpDeveloper: "modelcontextprotocol", mcpLicense: "MIT", mcpGithub: "modelcontextprotocol/servers",
    mcpLastUpdated: "2026-05-25", mcpUsageCount: "98.7m", mcpUserCount: "187.4k",
    mcpToolDescription: "基于知识图谱的持久化记忆系统，支持实体创建、语义搜索和节点检索。",
  },
  {
    id: "mcp-github", type: "mcp", name: "GitHub", nameZh: "GitHub 集成",
    description: "Search code, create issues, list repos. Full GitHub API integration.",
    descriptionZh: "搜索代码、创建 Issue、列出仓库。完整的 GitHub API 集成。",
    category: "development", tags: ["github", "code", "issues", "repos", "git"],
    pricing: "pricingPlatformDeduct", featured: true,
    requiredTools: githubMcpTools, mcpDeployment: "hosted", mcpCategory: "developer",
    mcpDeveloper: "modelcontextprotocol", mcpLicense: "MIT", mcpGithub: "modelcontextprotocol/servers",
    mcpLastUpdated: "2026-05-25", mcpUsageCount: "234.5m", mcpUserCount: "456.7k",
    mcpToolDescription: "GitHub MCP 服务器支持代码搜索、Issue 创建和仓库管理等完整 GitHub API 操作。",
  },
  {
    id: "mcp-brave-search", type: "mcp", name: "Brave Search", nameZh: "Brave 搜索",
    description: "Web and local search powered by Brave Search API. Privacy-focused results.",
    descriptionZh: "基于 Brave Search API 的网页和本地搜索。隐私优先的搜索结果。",
    category: "production", tags: ["search", "web", "local", "privacy", "brave"],
    pricing: "pricingPlatformDeduct", featured: false,
    requiredTools: braveSearchTools, mcpDeployment: "hosted", mcpCategory: "search",
    mcpDeveloper: "modelcontextprotocol", mcpLicense: "MIT", mcpGithub: "modelcontextprotocol/servers",
    mcpLastUpdated: "2026-05-25", mcpUsageCount: "89.3m", mcpUserCount: "167.8k",
    mcpToolDescription: "Brave 搜索 MCP 服务器提供隐私优先的网页搜索和本地商家搜索功能。",
  },
  {
    id: "mcp-google-maps", type: "mcp", name: "Google Maps", nameZh: "Google 地图",
    description: "Geocoding, place search, and directions via Google Maps API.",
    descriptionZh: "通过 Google Maps API 提供地理编码、地点搜索和路线规划。",
    category: "production", tags: ["map", "location", "geocoding", "directions", "places"],
    pricing: "pricingPlatformDeduct", featured: false,
    requiredTools: googleMapsTools, mcpDeployment: "hosted", mcpCategory: "location",
    mcpDeveloper: "modelcontextprotocol", mcpLicense: "MIT", mcpGithub: "modelcontextprotocol/servers",
    mcpLastUpdated: "2026-05-25", mcpUsageCount: "156.2m", mcpUserCount: "234.5k",
    mcpToolDescription: "Google 地图 MCP 服务器提供地理编码、地点搜索和路线规划等位置服务。",
  },
  {
    id: "mcp-puppeteer", type: "mcp", name: "Puppeteer", nameZh: "Puppeteer 浏览器自动化",
    description: "Browser automation with Puppeteer. Navigate, screenshot, click, fill forms.",
    descriptionZh: "基于 Puppeteer 的浏览器自动化。导航、截图、点击、填写表单。",
    category: "production", tags: ["browser", "automation", "screenshot", "puppeteer"],
    pricing: "pricingPlatformDeduct", featured: true,
    requiredTools: puppeteerTools, mcpDeployment: "local", mcpCategory: "browser",
    mcpDeveloper: "modelcontextprotocol", mcpLicense: "MIT", mcpGithub: "modelcontextprotocol/servers",
    mcpLastUpdated: "2026-05-25", mcpUsageCount: "67.8m", mcpUserCount: "123.4k",
    mcpToolDescription: "Puppeteer MCP 服务器提供浏览器自动化能力，支持页面导航、截图、元素点击和表单填写。",
  },
  {
    id: "mcp-slack", type: "mcp", name: "Slack", nameZh: "Slack 工作空间",
    description: "List channels, post messages, search conversations in Slack workspaces.",
    descriptionZh: "列出频道、发送消息、搜索 Slack 工作空间中的对话。",
    category: "production", tags: ["slack", "messaging", "channels", "communication"],
    pricing: "pricingPlatformDeduct", featured: false,
    requiredTools: slackTools, mcpDeployment: "hosted", mcpCategory: "productivity",
    mcpDeveloper: "modelcontextprotocol", mcpLicense: "MIT", mcpGithub: "modelcontextprotocol/servers",
    mcpLastUpdated: "2026-05-25", mcpUsageCount: "45.7m", mcpUserCount: "89.2k",
    mcpToolDescription: "Slack MCP 服务器支持频道管理、消息发送和对话搜索等 Slack 工作空间操作。",
  },
  {
    id: "mcp-postgres", type: "mcp", name: "PostgreSQL", nameZh: "PostgreSQL 数据库",
    description: "Execute read-only SQL queries against PostgreSQL databases.",
    descriptionZh: "对 PostgreSQL 数据库执行只读 SQL 查询。",
    category: "development", tags: ["database", "postgresql", "sql", "query"],
    pricing: "pricingPlatformDeduct", featured: true,
    requiredTools: postgresMcpTools, mcpDeployment: "hosted", mcpCategory: "developer",
    mcpDeveloper: "modelcontextprotocol", mcpLicense: "MIT", mcpGithub: "modelcontextprotocol/servers",
    mcpLastUpdated: "2026-05-25", mcpUsageCount: "123.4m", mcpUserCount: "234.5k",
    mcpToolDescription: "PostgreSQL MCP 服务器支持对数据库执行只读 SQL 查询，帮助 AI 模型理解和操作数据库。",
  },
  {
    id: "mcp-sqlite", type: "mcp", name: "SQLite", nameZh: "SQLite 数据库",
    description: "Query SQLite databases, list tables, and inspect schemas.",
    descriptionZh: "查询 SQLite 数据库、列出表结构和检查 Schema。",
    category: "development", tags: ["database", "sqlite", "sql", "local"],
    pricing: "pricingPlatformDeduct", featured: false,
    requiredTools: sqliteTools, mcpDeployment: "local", mcpCategory: "developer",
    mcpDeveloper: "modelcontextprotocol", mcpLicense: "MIT", mcpGithub: "modelcontextprotocol/servers",
    mcpLastUpdated: "2026-05-25", mcpUsageCount: "34.5m", mcpUserCount: "56.7k",
    mcpToolDescription: "SQLite MCP 服务器支持本地 SQLite 数据库的查询、表结构检查和 Schema 分析。",
  },
  {
    id: "mcp-git", type: "mcp", name: "Git", nameZh: "Git 版本控制",
    description: "Git operations: view logs, diff changes, create commits.",
    descriptionZh: "Git 操作：查看日志、差异对比、创建提交。",
    category: "development", tags: ["git", "version-control", "commits", "diff"],
    pricing: "pricingPlatformDeduct", featured: false,
    requiredTools: gitTools, mcpDeployment: "local", mcpCategory: "developer",
    mcpDeveloper: "modelcontextprotocol", mcpLicense: "MIT", mcpGithub: "modelcontextprotocol/servers",
    mcpLastUpdated: "2026-05-25", mcpUsageCount: "23.4m", mcpUserCount: "45.6k",
    mcpToolDescription: "Git MCP 服务器支持查看提交日志、差异对比和创建提交等版本控制操作。",
  },
  {
    id: "mcp-everything", type: "mcp", name: "Everything (Testing)", nameZh: "Everything 测试工具",
    description: "Reference/test server with echo, add, and long-running operations. For MCP protocol testing.",
    descriptionZh: "参考/测试服务器，提供 echo、add 和长时间运行操作。用于 MCP 协议测试。",
    category: "development", tags: ["testing", "reference", "echo", "protocol"],
    pricing: "pricingFree", featured: false,
    requiredTools: everythingTools, mcpDeployment: "hosted", mcpCategory: "developer",
    mcpDeveloper: "modelcontextprotocol", mcpLicense: "MIT", mcpGithub: "modelcontextprotocol/servers",
    mcpLastUpdated: "2026-05-25", mcpUsageCount: "56.7m", mcpUserCount: "112.3k",
    mcpToolDescription: "MCP 协议测试参考服务器，提供 echo、add 和长时间运行等测试工具。",
  },
  {
    id: "mcp-playwright", type: "mcp", name: "Playwright", nameZh: "Playwright 浏览器自动化",
    description: "Cross-browser automation with Playwright. Navigate, screenshot, interact with elements.",
    descriptionZh: "基于 Playwright 的跨浏览器自动化。导航、截图、元素交互。",
    category: "production", tags: ["browser", "automation", "playwright", "testing"],
    pricing: "pricingPlatformDeduct", featured: false,
    requiredTools: playwrightTools, mcpDeployment: "local", mcpCategory: "browser",
    mcpDeveloper: "executeautomation", mcpLicense: "MIT", mcpGithub: "executeautomation/playwright-mcp-server",
    mcpLastUpdated: "2026-05-20", mcpUsageCount: "45.6m", mcpUserCount: "89.1k",
    mcpToolDescription: "Playwright MCP 服务器提供跨浏览器自动化能力，支持页面导航、截图和元素交互。",
  },
  {
    id: "mcp-supabase", type: "mcp", name: "Supabase", nameZh: "Supabase 数据库",
    description: "Connect to Supabase projects. Query tables, insert rows, list schemas.",
    descriptionZh: "连接 Supabase 项目。查询表、插入行、列出 Schema。",
    category: "development", tags: ["database", "supabase", "postgres", "backend"],
    pricing: "pricingPlatformDeduct", featured: true,
    requiredTools: supabaseTools, mcpDeployment: "hosted", mcpCategory: "developer",
    mcpDeveloper: "supabase-community", mcpLicense: "Apache-2.0", mcpGithub: "supabase-community/supabase-mcp-server",
    mcpLastUpdated: "2026-05-22", mcpUsageCount: "312.1m", mcpUserCount: "521.3k",
    mcpToolDescription: "Supabase MCP 服务器让你的 AI 工具直接连接 Supabase 项目，执行数据库查询和管理操作。",
  },
  {
    id: "mcp-sequential-thinking", type: "mcp", name: "Sequential Thinking", nameZh: "顺序思维链",
    description: "Break down complex problems into step-by-step reasoning chains.",
    descriptionZh: "将复杂问题分解为逐步推理链条。",
    category: "production", tags: ["reasoning", "thinking", "chain", "analysis"],
    pricing: "pricingFree", featured: true,
    requiredTools: sequentialThinkingTools, mcpDeployment: "hosted", mcpCategory: "knowledge",
    mcpDeveloper: "modelcontextprotocol", mcpLicense: "MIT", mcpGithub: "modelcontextprotocol/servers",
    mcpLastUpdated: "2026-05-25", mcpUsageCount: "98.7m", mcpUserCount: "187.4k",
    mcpToolDescription: "顺序思维链 MCP 服务器帮助 AI 将复杂问题分解为多步推理过程。",
  },
  {
    id: "mcp-time", type: "mcp", name: "Time", nameZh: "时间工具",
    description: "Get current time, convert between timezones. Essential for time-sensitive queries.",
    descriptionZh: "获取当前时间、时区转换。时间敏感查询的必备工具。",
    category: "production", tags: ["time", "timezone", "conversion", "datetime"],
    pricing: "pricingFree", featured: false,
    requiredTools: timeTools, mcpDeployment: "hosted", mcpCategory: "productivity",
    mcpDeveloper: "modelcontextprotocol", mcpLicense: "MIT", mcpGithub: "modelcontextprotocol/servers",
    mcpLastUpdated: "2026-05-25", mcpUsageCount: "34.5m", mcpUserCount: "56.7k",
    mcpToolDescription: "时间 MCP 服务器提供当前时间获取和时区转换功能。",
  },
  {
    id: "mcp-redis", type: "mcp", name: "Redis", nameZh: "Redis 缓存",
    description: "Get, set, delete keys, and list keys in Redis. Fast key-value operations.",
    descriptionZh: "Redis 键值操作：获取、设置、删除和列出键。快速键值存储操作。",
    category: "development", tags: ["redis", "cache", "key-value", "database"],
    pricing: "pricingPlatformDeduct", featured: false,
    requiredTools: redisTools, mcpDeployment: "hosted", mcpCategory: "developer",
    mcpDeveloper: "modelcontextprotocol", mcpLicense: "MIT", mcpGithub: "modelcontextprotocol/servers",
    mcpLastUpdated: "2026-05-25", mcpUsageCount: "23.4m", mcpUserCount: "45.6k",
    mcpToolDescription: "Redis MCP 服务器提供快速键值存储操作，支持获取、设置、删除和模式匹配列出键。",
  },
];

// ─── Client Skills (from Agent Skills marketplace) ────────

const clientSkillItems: ResourceItem[] = agentSkills.map((skill) => ({
  id: `skill-${skill.id}`,
  type: "client-skill" as const,
  name: skill.name,
  nameZh: skill.title,
  description: skill.description.split("\n").find(l => l && !l.startsWith("#") && !l.startsWith("-"))?.slice(0, 200) || skill.description.slice(0, 200),
  descriptionZh: skill.title,
  category: "development",
  tags: skill.tags || [],
  pricing: "pricingClientOnly" as const,
  featured: skill.featured || false,
  clientConfigJson: JSON.stringify({
    name: skill.name,
    version: skill.version,
    installCommand: skill.installCommand,
    description: skill.description.split("\n").find(l => l && !l.startsWith("#") && !l.startsWith("-"))?.slice(0, 200) || "",
  }, null, 2),
}));

// ─── Resource Registry ────────────────────────────────────

export const RESOURCE_ITEMS: ResourceItem[] = [
  // Core MCP servers (real execution via server-side handlers)
  { id: "mcp-google-search", type: "mcp", name: "Google Search", nameZh: "谷歌搜索", description: "Real-time web search powered by Tavily API. Supports news search.", descriptionZh: "基于 Tavily API 的实时网页搜索，支持新闻搜索。", category: "production", tags: ["search", "web", "news", "real-time"], pricing: "pricingPlatformDeduct", featured: true, requiredTools: googleSearchTools, mcpDeployment: "hosted", mcpCategory: "search", mcpDeveloper: "OortAPI", mcpLicense: "MIT", mcpGithub: "DoctorFan1314/OortAPI", mcpLastUpdated: "2026-05-28", mcpUsageCount: "456.7m", mcpUserCount: "789.0k", mcpToolDescription: "谷歌搜索 MCP 服务器通过 Tavily API 提供实时网页搜索和新闻检索能力。" },
  { id: "mcp-github-assistant", type: "mcp", name: "GitHub Assistant", nameZh: "GitHub 助手", description: "Search code and create issues via GitHub API. Requires GitHub token for full access.", descriptionZh: "通过 GitHub API 搜索代码和创建 Issue。需要 GitHub Token 才能完全访问。", category: "development", tags: ["github", "code-search", "issues", "api"], pricing: "pricingPlatformDeduct", featured: true, requiredTools: githubAssistantTools, mcpDeployment: "hosted", mcpCategory: "developer", mcpDeveloper: "OortAPI", mcpLicense: "MIT", mcpGithub: "DoctorFan1314/OortAPI", mcpLastUpdated: "2026-05-28", mcpUsageCount: "234.5m", mcpUserCount: "456.7k", mcpToolDescription: "GitHub 助手 MCP 服务器支持代码搜索和 Issue 创建等 GitHub API 操作。" },
  { id: "mcp-postgres-context", type: "mcp", name: "PostgreSQL Context", nameZh: "PostgreSQL 上下文", description: "Validate SQL queries and inspect table schemas. Runs locally.", descriptionZh: "验证 SQL 查询和检查表结构。本地运行。", category: "development", tags: ["database", "postgresql", "sql", "schema", "validation"], pricing: "pricingPlatformDeduct", featured: true, requiredTools: postgresContextTools, mcpDeployment: "hosted", mcpCategory: "developer", mcpDeveloper: "OortAPI", mcpLicense: "MIT", mcpGithub: "DoctorFan1314/OortAPI", mcpLastUpdated: "2026-05-28", mcpUsageCount: "123.4m", mcpUserCount: "234.5k", mcpToolDescription: "PostgreSQL 上下文 MCP 服务器支持 SQL 验证和表结构查询。" },
  // MCP ecosystem nodes (real open-source servers)
  ...mcpEcosystemNodes,
  // All 28 real prompt templates from marketplace
  ...promptResourceItems,
  // Client skills
  ...clientSkillItems,
];

// ─── MCP Category Definitions ─────────────────────────────

export const MCP_CATEGORIES: { key: McpCategory | "all"; i18nKey: string }[] = [
  { key: "all", i18nKey: "mcpCatAll" },
  { key: "browser", i18nKey: "mcpCatBrowser" },
  { key: "search", i18nKey: "mcpCatSearch" },
  { key: "developer", i18nKey: "mcpCatDeveloper" },
  { key: "knowledge", i18nKey: "mcpCatKnowledge" },
  { key: "location", i18nKey: "mcpCatLocation" },
  { key: "media", i18nKey: "mcpCatMedia" },
  { key: "productivity", i18nKey: "mcpCatProductivity" },
];

// ─── Helper Functions ─────────────────────────────────────

export function getResourceById(id: string): ResourceItem | undefined {
  return RESOURCE_ITEMS.find((r) => r.id === id);
}

export function getResourcesByType(type: ResourceType): ResourceItem[] {
  return RESOURCE_ITEMS.filter((r) => r.type === type);
}

export function getMcpNodes(): ResourceItem[] {
  return RESOURCE_ITEMS.filter((r) => r.type === "mcp");
}

export function getMcpNodesByCategory(category: string): ResourceItem[] {
  if (category === "all") return getMcpNodes();
  return RESOURCE_ITEMS.filter((r) => r.type === "mcp" && r.mcpCategory === category);
}
