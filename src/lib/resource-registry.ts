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
  mcpToolDescription?: string; // detailed description for detail page
}

// ─── MCP Tool Definitions ─────────────────────────────────

const googleSearchTools: ToolDefinition[] = [
  { type: "function", function: { name: "google_search", description: "Search Google for web pages, news, and real-time information.", parameters: { type: "object", properties: { query: { type: "string", description: "The search query string" }, num_results: { type: "number", description: "Number of results (1-10)", default: 5 } }, required: ["query"] } } },
  { type: "function", function: { name: "google_news", description: "Search Google News for recent articles and breaking news.", parameters: { type: "object", properties: { query: { type: "string", description: "News search query" }, time_period: { type: "string", description: "Time range: 'day', 'week', or 'month'", default: "week" } }, required: ["query"] } } },
];

const githubAssistantTools: ToolDefinition[] = [
  { type: "function", function: { name: "search_code", description: "Search code across GitHub repositories.", parameters: { type: "object", properties: { query: { type: "string", description: "Code search query" }, language: { type: "string", description: "Filter by language" }, repo: { type: "string", description: "Limit to repo (owner/repo)" } }, required: ["query"] } } },
  { type: "function", function: { name: "create_issue", description: "Create a new issue in a GitHub repository.", parameters: { type: "object", properties: { repo: { type: "string", description: "Repository (owner/repo)" }, title: { type: "string", description: "Issue title" }, body: { type: "string", description: "Issue body (Markdown)" }, labels: { type: "array", items: { type: "string" }, description: "Labels" } }, required: ["repo", "title", "body"] } } },
];

const postgresContextTools: ToolDefinition[] = [
  { type: "function", function: { name: "query_validator", description: "Validate SQL queries against database schema.", parameters: { type: "object", properties: { sql_query: { type: "string", description: "SQL to validate" }, db_type: { type: "string", description: "Dialect: postgresql/mysql/sqlite", default: "postgresql" } }, required: ["sql_query"] } } },
  { type: "function", function: { name: "schema_fetch", description: "Fetch table schema metadata including columns, types, indexes.", parameters: { type: "object", properties: { table_name: { type: "string", description: "Table name" }, include_indexes: { type: "boolean", description: "Include indexes", default: true } }, required: ["table_name"] } } },
];

const fetchContentTools: ToolDefinition[] = [
  { type: "function", function: { name: "fetch_content", description: "Fetch a URL and convert HTML to clean Markdown text.", parameters: { type: "object", properties: { url: { type: "string", description: "URL to fetch" }, max_length: { type: "number", description: "Max characters", default: 8000 } }, required: ["url"] } } },
];

const amapTools: ToolDefinition[] = [
  { type: "function", function: { name: "geocode", description: "Convert address to coordinates (reverse geocoding).", parameters: { type: "object", properties: { address: { type: "string", description: "Address to geocode" } }, required: ["address"] } } },
  { type: "function", function: { name: "route_planning", description: "Plan routes between two points with driving/walking/transit options.", parameters: { type: "object", properties: { origin: { type: "string", description: "Start point" }, destination: { type: "string", description: "End point" }, mode: { type: "string", description: "driving/walking/transit", default: "driving" } }, required: ["origin", "destination"] } } },
];

const bingSearchTools: ToolDefinition[] = [
  { type: "function", function: { name: "bing_search", description: "Search Bing for web results, optimized for Chinese content.", parameters: { type: "object", properties: { query: { type: "string", description: "Search query" }, count: { type: "number", description: "Results count", default: 5 } }, required: ["query"] } } },
];

const supabaseTools: ToolDefinition[] = [
  { type: "function", function: { name: "supabase_query", description: "Query Supabase database tables with filters.", parameters: { type: "object", properties: { table: { type: "string", description: "Table name" }, filters: { type: "object", description: "Query filters" }, limit: { type: "number", description: "Max rows", default: 10 } }, required: ["table"] } } },
  { type: "function", function: { name: "supabase_insert", description: "Insert rows into a Supabase table.", parameters: { type: "object", properties: { table: { type: "string", description: "Table name" }, data: { type: "object", description: "Row data" } }, required: ["table", "data"] } } },
];

const hotelBookingTools: ToolDefinition[] = [
  { type: "function", function: { name: "search_hotels", description: "Search hotels by location, date, and preferences using natural language.", parameters: { type: "object", properties: { location: { type: "string", description: "City or area" }, check_in: { type: "string", description: "Check-in date" }, check_out: { type: "string", description: "Check-out date" }, guests: { type: "number", description: "Number of guests", default: 2 } }, required: ["location", "check_in", "check_out"] } } },
];

const douyinTools: ToolDefinition[] = [
  { type: "function", function: { name: "extract_video_text", description: "Extract transcript/copywriting from a Douyin video URL.", parameters: { type: "object", properties: { video_url: { type: "string", description: "Douyin video URL" } }, required: ["video_url"] } } },
  { type: "function", function: { name: "get_video_materials", description: "Get video metadata: title, tags, likes, comments count.", parameters: { type: "object", properties: { video_url: { type: "string", description: "Douyin video URL" } }, required: ["video_url"] } } },
];

const chatpptTools: ToolDefinition[] = [
  { type: "function", function: { name: "generate_ppt", description: "Generate a PowerPoint presentation from a topic outline.", parameters: { type: "object", properties: { topic: { type: "string", description: "Presentation topic" }, slides: { type: "number", description: "Number of slides", default: 10 }, style: { type: "string", description: "Style: business/academic/creative", default: "business" } }, required: ["topic"] } } },
];

const mcdonaldsTools: ToolDefinition[] = [
  { type: "function", function: { name: "browse_menu", description: "Browse McDonald's menu items with prices and nutrition info.", parameters: { type: "object", properties: { category: { type: "string", description: "Menu category: burger/drink/dessert/side" } }, required: [] } } },
  { type: "function", function: { name: "place_order", description: "Place a McDonald's order for delivery or pickup.", parameters: { type: "object", properties: { items: { type: "array", items: { type: "object" }, description: "Order items" }, delivery_address: { type: "string", description: "Delivery address (empty for pickup)" } }, required: ["items"] } } },
];

const train12306Tools: ToolDefinition[] = [
  { type: "function", function: { name: "search_trains", description: "Search 12306 train tickets between two stations.", parameters: { type: "object", properties: { from: { type: "string", description: "Departure station" }, to: { type: "string", description: "Arrival station" }, date: { type: "string", description: "Travel date (YYYY-MM-DD)" } }, required: ["from", "to", "date"] } } },
];

const chromeDevTools: ToolDefinition[] = [
  { type: "function", function: { name: "navigate_url", description: "Navigate the Chrome browser to a URL.", parameters: { type: "object", properties: { url: { type: "string", description: "URL to navigate to" } }, required: ["url"] } } },
  { type: "function", function: { name: "evaluate_js", description: "Execute JavaScript in the browser context and return results.", parameters: { type: "object", properties: { expression: { type: "string", description: "JS expression to evaluate" } }, required: ["expression"] } } },
  { type: "function", function: { name: "get_console_logs", description: "Retrieve browser console logs.", parameters: { type: "object", properties: { limit: { type: "number", description: "Max log entries", default: 50 } }, required: [] } } },
];

const antvisTools: ToolDefinition[] = [
  { type: "function", function: { name: "generate_chart", description: "Generate a data visualization chart (25+ types supported).", parameters: { type: "object", properties: { chart_type: { type: "string", description: "Chart type: line/bar/pie/scatter/heatmap/..." }, data: { type: "object", description: "Chart data" }, title: { type: "string", description: "Chart title" } }, required: ["chart_type", "data"] } } },
];

const memosTools: ToolDefinition[] = [
  { type: "function", function: { name: "store_memory", description: "Store a long-term memory entry with tags and metadata.", parameters: { type: "object", properties: { content: { type: "string", description: "Memory content" }, tags: { type: "array", items: { type: "string" }, description: "Tags" } }, required: ["content"] } } },
  { type: "function", function: { name: "recall_memory", description: "Search and recall stored memories by query.", parameters: { type: "object", properties: { query: { type: "string", description: "Search query" }, limit: { type: "number", description: "Max results", default: 5 } }, required: ["query"] } } },
];

const wereadTools: ToolDefinition[] = [
  { type: "function", function: { name: "get_book_notes", description: "Get highlights and notes from a WeRead book.", parameters: { type: "object", properties: { book_id: { type: "string", description: "WeRead book ID" } }, required: ["book_id"] } } },
  { type: "function", function: { name: "search_books", description: "Search books in WeRead library.", parameters: { type: "object", properties: { query: { type: "string", description: "Search keyword" } }, required: ["query"] } } },
];

// ─── Convert mock-data skills to ResourceItems ────────────

function mapCategorySlug(slug: string): string {
  const map: Record<string, string> = {
    content: "production", coding: "development", thinking: "development",
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

// ─── MCP Ecosystem Nodes ──────────────────────────────────

const mcpEcosystemNodes: ResourceItem[] = [
  { id: "mcp-fetch-content", type: "mcp", name: "Fetch Content MCP", nameZh: "Fetch 网页内容抓取", description: "Fetch URLs and convert HTML to clean Markdown. Essential for web scraping and content extraction.", descriptionZh: "一个提供网页内容抓取功能的模型上下文协议服务器。此服务器使大型语言模型能够从网页中检索和处理内容，并将 HTML 转换为 markdown 以便更容易地使用。获取工具会截断响应，但通过使用 start_index 参数，您可以指定从何处开始提取内容。这让模型可以分块读取网页，直到找到所需的信息。", category: "development", tags: ["web", "scraping", "markdown", "html"], pricing: "pricingPlatformDeduct", featured: false, requiredTools: fetchContentTools, mcpDeployment: "hosted", mcpCategory: "search", mcpDeveloper: "modelcontextprotocol", mcpLicense: "MIT License", mcpGithub: "modelcontextprotocol/servers", mcpLastUpdated: "2026-05-25", mcpUsageCount: "287.6m", mcpUserCount: "489.0k", mcpToolDescription: "该服务器使大型语言模型能够检索和处理网页内容，将HTML转换为markdown格式，以便于更轻松地使用。" },
  { id: "mcp-amap", type: "mcp", name: "Amap (Gaode Map) MCP", nameZh: "高德地图", description: "Location services with reverse geocoding and route planning. Powered by Amap API.", descriptionZh: "高德地图 MCP 服务提供逆地理编码、路线规划、POI 搜索等位置服务。基于高德地图 Web API，支持驾车、步行、公交等多种出行方式的路线规划，以及周边搜索和地理编码功能。", category: "production", tags: ["map", "location", "geocoding", "route"], pricing: "pricingPlatformDeduct", featured: true, requiredTools: amapTools, mcpDeployment: "hosted", mcpCategory: "location", mcpDeveloper: "amap-team", mcpLicense: "Apache-2.0", mcpGithub: "amap/amap-mcp-server", mcpLastUpdated: "2026-05-20", mcpUsageCount: "156.2m", mcpUserCount: "234.5k", mcpToolDescription: "高德地图 MCP 服务器提供地理位置服务，包括逆地理编码、路线规划和 POI 搜索。" },
  { id: "mcp-bing-search", type: "mcp", name: "Bing Search (Chinese)", nameZh: "必应搜索中文版", description: "Search Bing for web results, optimized for Chinese language content retrieval.", descriptionZh: "获取必应搜索结果页面，针对中文内容检索深度优化。支持网页搜索、图片搜索、新闻搜索等多种搜索类型，返回结构化的搜索结果。", category: "production", tags: ["search", "bing", "chinese", "web"], pricing: "pricingPlatformDeduct", featured: false, requiredTools: bingSearchTools, mcpDeployment: "hosted", mcpCategory: "search", mcpDeveloper: "microsoft", mcpLicense: "MIT License", mcpGithub: "microsoft/bing-mcp", mcpLastUpdated: "2026-05-18", mcpUsageCount: "89.3m", mcpUserCount: "167.8k", mcpToolDescription: "必应搜索 MCP 服务器针对中文内容进行了深度优化，提供高质量的中文搜索结果。" },
  { id: "mcp-supabase", type: "mcp", name: "Supabase MCP", nameZh: "supabase-mcp", description: "Connect Supabase projects to Cursor/Claude. Query, insert, and manage your database directly.", descriptionZh: "连接 Supabase 项目至 Cursor/Claude，直接查询、插入和管理数据库。支持表结构查询、数据 CRUD 操作、实时订阅等功能，让 AI 编程工具直接操作你的 Supabase 后端。", category: "development", tags: ["database", "supabase", "backend", "postgres"], pricing: "pricingPlatformDeduct", featured: true, requiredTools: supabaseTools, mcpDeployment: "hosted", mcpCategory: "developer", mcpDeveloper: "supabase", mcpLicense: "Apache-2.0", mcpGithub: "supabase/supabase-mcp", mcpLastUpdated: "2026-05-22", mcpUsageCount: "312.1m", mcpUserCount: "521.3k", mcpToolDescription: "Supabase MCP 服务器让你的 AI 编程工具直接连接 Supabase 项目，执行数据库查询和管理操作。" },
  { id: "mcp-hotel-booking", type: "mcp", name: "RollingGo Hotel Booking", nameZh: "RollingGo全球酒店预订", description: "Natural language hotel search and booking worldwide. Smart filtering by price, rating, and location.", descriptionZh: "自然语言交互，实现全球酒店智能筛选与预订。按价格、评分、位置智能推荐，支持全球 200+ 国家和地区的酒店搜索与预订。", category: "production", tags: ["hotel", "travel", "booking", "nlp"], pricing: "pricingPlatformDeduct", featured: false, requiredTools: hotelBookingTools, mcpDeployment: "hosted", mcpCategory: "productivity", mcpDeveloper: "rollinggo", mcpLicense: "Proprietary", mcpGithub: "", mcpLastUpdated: "2026-05-15", mcpUsageCount: "45.7m", mcpUserCount: "89.2k", mcpToolDescription: "RollingGo 全球酒店预订 MCP 服务器支持自然语言交互，智能筛选和预订全球酒店。" },
  { id: "mcp-douyin", type: "mcp", name: "Douyin Assistant", nameZh: "抖音运营小助手", description: "Extract video transcripts and marketing materials from Douyin videos. Content repurposing made easy.", descriptionZh: "提取抖音视频文案与素材，轻松实现内容二次创作与分发。支持视频文案提取、评论分析、热门话题追踪等功能。", category: "production", tags: ["douyin", "video", "transcript", "content"], pricing: "pricingPlatformDeduct", featured: false, requiredTools: douyinTools, mcpDeployment: "hosted", mcpCategory: "media", mcpDeveloper: "douyin-team", mcpLicense: "Proprietary", mcpGithub: "", mcpLastUpdated: "2026-05-10", mcpUsageCount: "67.8m", mcpUserCount: "123.4k", mcpToolDescription: "抖音运营小助手 MCP 服务器帮助内容创作者提取视频文案、分析评论和追踪热门话题。" },
  { id: "mcp-chatppt", type: "mcp", name: "ChatPPT MCP", nameZh: "ChatPPT-MCP", description: "Full-lifecycle PowerPoint generation and editing. Create professional presentations from text prompts.", descriptionZh: "演示文档生成与编辑全链路，从文本提示一键创建专业 PPT。支持多种模板风格、自动排版、图表生成等功能。", category: "production", tags: ["ppt", "presentation", "slides", "office"], pricing: "pricingPlatformDeduct", featured: false, requiredTools: chatpptTools, mcpDeployment: "hosted", mcpCategory: "productivity", mcpDeveloper: "chatppt", mcpLicense: "Proprietary", mcpGithub: "", mcpLastUpdated: "2026-05-08", mcpUsageCount: "34.5m", mcpUserCount: "67.8k", mcpToolDescription: "ChatPPT MCP 服务器提供全链路的演示文档生成和编辑能力，从文本描述一键创建专业 PPT。" },
  { id: "mcp-mcdonalds", type: "mcp", name: "McDonald's MCP Server", nameZh: "麦当劳 MCP Server", description: "Real McDonald's ordering: browse menu, check coupons, place delivery orders via natural language.", descriptionZh: "覆盖点餐、券查询等真实外卖场景，自然语言下单麦当劳。支持菜单浏览、优惠券查询、订单追踪等功能。", category: "production", tags: ["food", "delivery", "ordering", "mcdonalds"], pricing: "pricingPlatformDeduct", featured: false, requiredTools: mcdonaldsTools, mcpDeployment: "hosted", mcpCategory: "productivity", mcpDeveloper: "mcdonalds-cn", mcpLicense: "Proprietary", mcpGithub: "", mcpLastUpdated: "2026-05-12", mcpUsageCount: "23.4m", mcpUserCount: "45.6k", mcpToolDescription: "麦当劳 MCP 服务器支持自然语言点餐、优惠券查询和订单追踪等真实外卖场景。" },
  { id: "mcp-12306", type: "mcp", name: "12306 Train Ticket MCP", nameZh: "12306-MCP车票查询", description: "Real-time search 12306 train ticket data. Check schedules, prices, and availability.", descriptionZh: "实时搜索 12306 车票数据，查询时刻表、票价与余票信息。支持车次查询、余票监控、票价对比等功能。", category: "production", tags: ["train", "12306", "ticket", "travel"], pricing: "pricingPlatformDeduct", featured: true, requiredTools: train12306Tools, mcpDeployment: "hosted", mcpCategory: "productivity", mcpDeveloper: "12306-community", mcpLicense: "MIT License", mcpGithub: "12306-mcp/server", mcpLastUpdated: "2026-05-23", mcpUsageCount: "178.9m", mcpUserCount: "345.6k", mcpToolDescription: "12306 车票查询 MCP 服务器实时获取中国铁路 12306 的车次、票价和余票信息。" },
  { id: "mcp-chrome-devtools", type: "mcp", name: "Chrome DevTools MCP", nameZh: "Chrome 开发者工具 MCP", description: "Let AI control and inspect active Chrome browser tabs. Navigate, execute JS, read console logs.", descriptionZh: "让大模型直接控制和检查活动的 Chrome 浏览器，导航、执行 JS、读取控制台日志。支持页面导航、JavaScript 执行、DOM 检查、网络请求监控等功能。", category: "development", tags: ["chrome", "browser", "devtools", "debugging"], pricing: "pricingPlatformDeduct", featured: true, requiredTools: chromeDevTools, mcpDeployment: "local", mcpCategory: "browser", mcpDeveloper: "chrome-team", mcpLicense: "Apache-2.0", mcpGithub: "chrome/devtools-mcp", mcpLastUpdated: "2026-05-21", mcpUsageCount: "56.7m", mcpUserCount: "112.3k", mcpToolDescription: "Chrome 开发者工具 MCP 服务器让 AI 直接控制和检查活动的 Chrome 浏览器标签页。" },
  { id: "mcp-antvis", type: "mcp", name: "AntVis Chart MCP", nameZh: "antvis 可视化图表", description: "Automatically generate 25+ types of data visualization charts. Powered by AntV.", descriptionZh: "自动化生成 25+ 种数据图表，基于 AntV 可视化引擎。支持折线图、柱状图、饼图、散点图、热力图等常见图表类型。", category: "analytics", tags: ["chart", "visualization", "data", "antv"], pricing: "pricingPlatformDeduct", featured: false, requiredTools: antvisTools, mcpDeployment: "hosted", mcpCategory: "developer", mcpDeveloper: "antvis-team", mcpLicense: "MIT License", mcpGithub: "antvis/chart-mcp", mcpLastUpdated: "2026-05-19", mcpUsageCount: "45.6m", mcpUserCount: "89.1k", mcpToolDescription: "AntVis 可视化图表 MCP 服务器基于 AntV 引擎，支持自动生成 25+ 种数据图表。" },
  { id: "mcp-memos", type: "mcp", name: "MemOS Memory MCP", nameZh: "MemOS 记忆操作系统", description: "Long-term memory management for AI. Store, recall, and organize persistent memories across sessions.", descriptionZh: "AI 长期记忆管理，跨会话存储、召回和组织持久化记忆。支持记忆存储、语义搜索、标签管理等功能，让 AI 拥有跨会话的持久化记忆能力。", category: "production", tags: ["memory", "knowledge", "persistence", "ai"], pricing: "pricingPlatformDeduct", featured: true, requiredTools: memosTools, mcpDeployment: "hosted", mcpCategory: "knowledge", mcpDeveloper: "memos-labs", mcpLicense: "Apache-2.0", mcpGithub: "memos/memos-mcp", mcpLastUpdated: "2026-05-24", mcpUsageCount: "98.7m", mcpUserCount: "187.4k", mcpToolDescription: "MemOS 记忆操作系统 MCP 服务器为 AI 提供长期记忆管理能力，支持跨会话的记忆存储和语义检索。" },
  { id: "mcp-weread", type: "mcp", name: "WeRead MCP", nameZh: "微信读书 MCP", description: "Sync reading notes and highlights from WeRead. Search your book library.", descriptionZh: "同步微信读书阅读笔记与划线数据，搜索个人书库。支持获取书籍列表、笔记同步、划线导出等功能。", category: "production", tags: ["reading", "notes", "books", "weread"], pricing: "pricingPlatformDeduct", featured: false, requiredTools: wereadTools, mcpDeployment: "hosted", mcpCategory: "knowledge", mcpDeveloper: "weread-community", mcpLicense: "MIT License", mcpGithub: "weread/mcp-server", mcpLastUpdated: "2026-05-17", mcpUsageCount: "34.5m", mcpUserCount: "56.7k", mcpToolDescription: "微信读书 MCP 服务器同步你的阅读笔记和划线数据，支持搜索个人书库和导出笔记。" },
];

// ─── Client Skills (from Agent Skills marketplace) ───────

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
  // Core MCP servers (original 3)
  { id: "mcp-google-search", type: "mcp", name: "Google Search MCP", nameZh: "谷歌高级联网搜索", description: "Real-time web search and news retrieval powered by Google.", descriptionZh: "基于谷歌的实时网页搜索与新闻检索。赋予大模型实时联网能力，支持网页搜索和新闻搜索两种工具，返回结构化的搜索结果。", category: "production", tags: ["search", "web", "news", "real-time"], pricing: "pricingPlatformDeduct", featured: true, requiredTools: googleSearchTools, mcpDeployment: "hosted", mcpCategory: "search", mcpDeveloper: "google", mcpLicense: "Apache-2.0", mcpGithub: "google/search-mcp", mcpLastUpdated: "2026-05-24", mcpUsageCount: "456.7m", mcpUserCount: "789.0k", mcpToolDescription: "谷歌高级联网搜索 MCP 服务器提供实时网页搜索和新闻检索能力，让 AI 模型获取最新信息。" },
  { id: "mcp-github-assistant", type: "mcp", name: "GitHub Assistant MCP", nameZh: "GitHub 自动化助手", description: "Search code, create issues, and manage GitHub workflows from AI conversation.", descriptionZh: "跨仓库搜索代码、创建 Issue、管理 GitHub 工作流。支持代码搜索、Issue 创建、仓库管理等功能，直接在 AI 对话中完成 GitHub 操作。", category: "development", tags: ["github", "code-search", "issues", "automation"], pricing: "pricingPlatformDeduct", featured: true, requiredTools: githubAssistantTools, mcpDeployment: "hosted", mcpCategory: "developer", mcpDeveloper: "github", mcpLicense: "MIT License", mcpGithub: "github/github-mcp", mcpLastUpdated: "2026-05-23", mcpUsageCount: "234.5m", mcpUserCount: "456.7k", mcpToolDescription: "GitHub 自动化助手 MCP 服务器支持代码搜索、Issue 创建和 GitHub 工作流管理。" },
  { id: "mcp-postgres-context", type: "mcp", name: "PostgreSQL Context MCP", nameZh: "PostgreSQL 数据库直连", description: "Validate SQL queries and fetch table schemas from PostgreSQL databases.", descriptionZh: "验证 SQL 查询语句、抓取数据库表结构元数据。支持 SQL 验证、表结构查询、索引信息获取等功能，帮助大模型生成正确的 SQL。", category: "development", tags: ["database", "postgresql", "sql", "schema"], pricing: "pricingPlatformDeduct", featured: true, requiredTools: postgresContextTools, mcpDeployment: "hosted", mcpCategory: "developer", mcpDeveloper: "postgres-community", mcpLicense: "PostgreSQL License", mcpGithub: "postgres/mcp-server", mcpLastUpdated: "2026-05-20", mcpUsageCount: "123.4m", mcpUserCount: "234.5k", mcpToolDescription: "PostgreSQL 数据库直连 MCP 服务器支持 SQL 验证和表结构查询，帮助生成正确的数据库操作。" },
  // MCP ecosystem nodes (14 new)
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
