import type { ToolDefinition } from "./playground-tools";

// ─── Resource Type System ─────────────────────────────────
// Three strictly separated dimensions:
// 1. prompt-template: pure text strings injected into systemPrompt
// 2. mcp: Cloud MCP servers with requiredTools for Tool Loop
// 3. client-skill: JSON config for local agent clients (copy only)

export type ResourceType = "prompt-template" | "mcp" | "client-skill";

export interface ResourceItem {
  id: string;
  type: ResourceType;
  name: string;
  nameZh: string;
  description: string;
  descriptionZh: string;
  category: "production" | "development" | "marketing" | "analytics";
  tags: string[];
  pricing: "pricingFree" | "pricingPlatformDeduct" | "pricingClientOnly";
  featured: boolean;
  // Type-specific (mutually exclusive):
  promptContent?: string;           // prompt-template only
  requiredTools?: ToolDefinition[];  // mcp only
  clientConfigJson?: string;         // client-skill only
}

// ─── MCP Tool Definitions ─────────────────────────────────

const googleSearchTools: ToolDefinition[] = [
  {
    type: "function",
    function: {
      name: "google_search",
      description: "Search Google for web pages, news, and real-time information. Returns ranked results with titles, URLs, and snippets.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "The search query string" },
          num_results: { type: "number", description: "Number of results to return (1-10)", default: 5 },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "google_news",
      description: "Search Google News for recent articles and breaking news on a topic.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "News search query" },
          time_period: { type: "string", description: "Time range: 'day', 'week', or 'month'", default: "week" },
        },
        required: ["query"],
      },
    },
  },
];

const githubAssistantTools: ToolDefinition[] = [
  {
    type: "function",
    function: {
      name: "search_code",
      description: "Search code across GitHub repositories. Returns matching file paths, line numbers, and code snippets.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Code search query (supports GitHub code search syntax)" },
          language: { type: "string", description: "Filter by programming language (e.g. 'typescript', 'python')" },
          repo: { type: "string", description: "Limit search to a specific repo (e.g. 'owner/repo')" },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_issue",
      description: "Create a new issue in a GitHub repository.",
      parameters: {
        type: "object",
        properties: {
          repo: { type: "string", description: "Repository in 'owner/repo' format" },
          title: { type: "string", description: "Issue title" },
          body: { type: "string", description: "Issue body content (Markdown supported)" },
          labels: { type: "array", items: { type: "string" }, description: "Labels to attach to the issue" },
        },
        required: ["repo", "title", "body"],
      },
    },
  },
];

const postgresContextTools: ToolDefinition[] = [
  {
    type: "function",
    function: {
      name: "query_validator",
      description: "Validate a SQL query against the connected PostgreSQL database schema. Checks for syntax errors, missing tables, and type mismatches.",
      parameters: {
        type: "object",
        properties: {
          sql_query: { type: "string", description: "The SQL query to validate" },
          db_type: { type: "string", description: "Database dialect: 'postgresql', 'mysql', or 'sqlite'", default: "postgresql" },
        },
        required: ["sql_query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "schema_fetch",
      description: "Fetch the schema metadata of a database table including columns, types, indexes, and foreign keys.",
      parameters: {
        type: "object",
        properties: {
          table_name: { type: "string", description: "Name of the table to inspect" },
          include_indexes: { type: "boolean", description: "Whether to include index information", default: true },
        },
        required: ["table_name"],
      },
    },
  },
];

// ─── Resource Registry ────────────────────────────────────

export const RESOURCE_ITEMS: ResourceItem[] = [
  // ── Cloud MCP Servers ──
  {
    id: "mcp-google-search",
    type: "mcp",
    name: "Google Search MCP",
    nameZh: "谷歌高级联网搜索",
    description: "Real-time web search and news retrieval powered by Google. Gives AI models live internet access for up-to-date answers.",
    descriptionZh: "基于谷歌的实时网页搜索与新闻检索。赋予大模型实时联网能力，获取最新资讯。",
    category: "production",
    tags: ["search", "web", "news", "real-time"],
    pricing: "pricingPlatformDeduct",
    featured: true,
    requiredTools: googleSearchTools,
  },
  {
    id: "mcp-github-assistant",
    type: "mcp",
    name: "GitHub Assistant MCP",
    nameZh: "GitHub 自动化助手",
    description: "Search code across repos, create issues, and manage GitHub workflows directly from the AI conversation.",
    descriptionZh: "跨仓库搜索代码、创建 Issue、管理 GitHub 工作流，直接在 AI 对话中完成。",
    category: "development",
    tags: ["github", "code-search", "issues", "automation"],
    pricing: "pricingPlatformDeduct",
    featured: true,
    requiredTools: githubAssistantTools,
  },
  {
    id: "mcp-postgres-context",
    type: "mcp",
    name: "PostgreSQL Context MCP",
    nameZh: "PostgreSQL 数据库直连",
    description: "Validate SQL queries and fetch table schemas from PostgreSQL databases. Helps AI write correct, schema-aware SQL.",
    descriptionZh: "验证 SQL 查询语句、抓取数据库表结构元数据。帮助大模型生成正确的、感知 Schema 的 SQL。",
    category: "development",
    tags: ["database", "postgresql", "sql", "schema"],
    pricing: "pricingPlatformDeduct",
    featured: true,
    requiredTools: postgresContextTools,
  },

  // ── Prompt Templates ──
  {
    id: "prompt-code-review",
    type: "prompt-template",
    name: "Code Review Expert",
    nameZh: "代码审查专家",
    description: "A senior code reviewer prompt that catches bugs, security issues, and style violations. Outputs structured feedback with severity levels.",
    descriptionZh: "资深代码审查专家提示词，捕获 Bug、安全漏洞和风格违规。输出带严重等级的结构化反馈。",
    category: "development",
    tags: ["code-review", "security", "best-practices"],
    pricing: "pricingFree",
    featured: true,
    promptContent: `You are a senior code reviewer with 15+ years of experience across multiple languages and frameworks. When reviewing code:

1. **Security**: Check for injection vulnerabilities, auth bypasses, data exposure, and OWASP Top 10 issues.
2. **Correctness**: Identify logic errors, race conditions, off-by-one errors, and unhandled edge cases.
3. **Performance**: Flag N+1 queries, unnecessary allocations, missing indexes, and algorithmic inefficiencies.
4. **Maintainability**: Evaluate naming, function length, coupling, and adherence to SOLID principles.

Output format:
- Severity: 🔴 Critical / 🟡 Warning / 🔵 Suggestion
- File and line number
- Description of the issue
- Suggested fix with code example

Be thorough but constructive. Prioritize critical issues first.`,
  },
  {
    id: "prompt-data-analyst",
    type: "prompt-template",
    name: "Data Analyst Pro",
    nameZh: "数据分析专家",
    description: "An expert data analyst prompt for exploring datasets, finding patterns, and generating insights with clear visualizations.",
    descriptionZh: "专业数据分析专家提示词，用于探索数据集、发现规律并生成可视化洞察。",
    category: "analytics",
    tags: ["data-analysis", "visualization", "statistics"],
    pricing: "pricingFree",
    featured: false,
    promptContent: `You are an expert data analyst. When analyzing data:

1. **Understand the context**: Ask about the business goal before diving into numbers.
2. **Explore systematically**: Start with summary statistics, distributions, and outliers.
3. **Find patterns**: Look for correlations, trends, seasonality, and anomalies.
4. **Visualize effectively**: Suggest the right chart type for each insight (bar, line, scatter, heatmap).
5. **Actionable insights**: Always end with "So what?" — what should the stakeholder do based on this data?

When given a dataset:
- Describe the shape, types, and quality of the data
- Identify missing values and suggest handling strategies
- Provide 3-5 key insights with supporting evidence
- Suggest next steps for deeper analysis`,
  },
  {
    id: "prompt-creative-writer",
    type: "prompt-template",
    name: "Creative Writing Coach",
    nameZh: "创意写作教练",
    description: "A creative writing coach that helps with storytelling, character development, and prose polishing across genres.",
    descriptionZh: "创意写作教练提示词，协助故事叙述、角色塑造和跨体裁文案打磨。",
    category: "production",
    tags: ["writing", "creative", "storytelling"],
    pricing: "pricingFree",
    featured: false,
    promptContent: `You are a creative writing coach with an MFA in Fiction and experience editing for major literary magazines. Your approach:

1. **Voice first**: Help writers find and strengthen their unique voice, not impose yours.
2. **Show, don't tell**: Guide toward sensory details and action over exposition.
3. **Structure**: Help with pacing, tension arcs, and scene construction.
4. **Character**: Push for specificity — what makes THIS character different from any other?
5. **Revision**: Focus on cutting flab, sharpening dialogue, and strengthening verbs.

When reviewing writing:
- Open with what's working (be specific)
- Identify the 2-3 highest-impact improvements
- Provide a rewritten example of one key passage
- End with an encouraging, specific next step`,
  },

  // ── Agent Client Skills ──
  {
    id: "skill-file-manager",
    type: "client-skill",
    name: "Local File Manager",
    nameZh: "本地文件管理器",
    description: "A client-side skill for reading, writing, and managing local files. Works with Claude Code, Cursor, and other agent clients.",
    descriptionZh: "客户端技能，用于读取、写入和管理本地文件。兼容 Claude Code、Cursor 等客户端。",
    category: "development",
    tags: ["filesystem", "local", "file-operations"],
    pricing: "pricingClientOnly",
    featured: false,
    clientConfigJson: JSON.stringify({
      name: "file-manager",
      version: "1.0.0",
      description: "Local file system access for reading, writing, and listing files",
      tools: [
        { name: "read_file", description: "Read the contents of a file at the given path" },
        { name: "write_file", description: "Write content to a file, creating directories as needed" },
        { name: "list_directory", description: "List files and directories at a given path" },
      ],
    }, null, 2),
  },
  {
    id: "skill-git-workflow",
    type: "client-skill",
    name: "Git Workflow",
    nameZh: "Git 工作流助手",
    description: "Automate git operations: commit, branch, merge, rebase, and conflict resolution. For local terminal agent clients.",
    descriptionZh: "自动化 Git 操作：提交、分支、合并、变基和冲突解决。适用于本地终端客户端。",
    category: "development",
    tags: ["git", "version-control", "workflow"],
    pricing: "pricingClientOnly",
    featured: false,
    clientConfigJson: JSON.stringify({
      name: "git-workflow",
      version: "1.0.0",
      description: "Git operations automation for agent clients",
      tools: [
        { name: "git_status", description: "Show working tree status" },
        { name: "git_commit", description: "Create a commit with a message" },
        { name: "git_branch", description: "List, create, or switch branches" },
        { name: "git_log", description: "Show commit history" },
      ],
    }, null, 2),
  },
  {
    id: "skill-system-monitor",
    type: "client-skill",
    name: "System Monitor",
    nameZh: "系统监控工具",
    description: "Monitor CPU, memory, disk, and network usage on the local machine. Useful for performance debugging.",
    descriptionZh: "监控本机 CPU、内存、磁盘和网络使用情况。适用于性能调试场景。",
    category: "analytics",
    tags: ["monitoring", "system", "performance"],
    pricing: "pricingClientOnly",
    featured: false,
    clientConfigJson: JSON.stringify({
      name: "system-monitor",
      version: "1.0.0",
      description: "System resource monitoring for agent clients",
      tools: [
        { name: "cpu_usage", description: "Get current CPU usage percentage and top processes" },
        { name: "memory_usage", description: "Get RAM and swap usage statistics" },
        { name: "disk_usage", description: "Get disk space usage for all mounted volumes" },
      ],
    }, null, 2),
  },
];

// ─── Helper Functions ─────────────────────────────────────

export function getResourceById(id: string): ResourceItem | undefined {
  return RESOURCE_ITEMS.find((r) => r.id === id);
}

export function getResourcesByType(type: ResourceType): ResourceItem[] {
  return RESOURCE_ITEMS.filter((r) => r.type === type);
}
