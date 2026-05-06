# AI Skills Hub — Agent 技能市场 + Prompt 模板平台

> **[English](README.md)**

> 发现可执行的 Agent 技能和高质量 Prompt 模板 · 一键安装 · 赋予 AI 真正的行动力

完美适配 ChatGPT · Claude · Grok · DeepSeek · Qwen · LM Studio · Ollama 等主流平台。

---

## 快速开始

### 1. 环境要求

| 依赖 | 最低版本 |
|------|---------|
| Node.js | >= 18.0 |
| npm | >= 9.0 |

### 2. 安装与运行

```bash
# 进入项目目录
cd ai-skills-hub

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

打开浏览器访问 http://localhost:3000 即可查看。

### 3. 构建生产版本

```bash
# 构建
npm run build

# 启动生产服务器
npm start
```

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | Next.js 16 (App Router) |
| 语言 | TypeScript |
| 样式 | Tailwind CSS v4 |
| 组件库 | shadcn/ui (基于 Base UI) |
| 图标 | Lucide React |
| 代码高亮 | react-syntax-highlighter |
| 文件下载 | JSZip + file-saver |
| 数据 | 本地 Mock 数据（可迁移至 Supabase） |
| 部署 | Vercel（推荐） |

---

## 项目结构

```
ai-skills-hub/
├── src/
│   ├── app/                          # Next.js App Router 页面
│   │   ├── layout.tsx                # 根布局（字体、Navbar、Footer、粒子背景）
│   │   ├── page.tsx                  # 首页（技能优先）
│   │   ├── globals.css               # 全局样式 + CSS 变量 + 工具类
│   │   ├── skills/                   # Agent 技能市场
│   │   │   ├── page.tsx              # 技能列表（搜索、筛选、排序）
│   │   │   └── [id]/page.tsx         # 技能详情（介绍/文件/反馈三栏）
│   │   ├── prompts/                  # Prompt 模板
│   │   │   ├── page.tsx              # 模板列表
│   │   │   └── [id]/page.tsx         # 模板详情
│   │   ├── categories/
│   │   │   ├── page.tsx              # 分类浏览（Prompt）
│   │   │   └── [slug]/page.tsx       # 分类详情
│   │   ├── trending/page.tsx         # 排行榜（Prompt）
│   │   ├── tags/                     # 标签云（Prompt）
│   │   ├── guide/page.tsx            # 新手指南
│   │   ├── submit/page.tsx           # 提交 Prompt 模板
│   │   ├── login/page.tsx            # 登录
│   │   └── register/page.tsx         # 注册
│   ├── components/
│   │   ├── ui/                       # shadcn/ui 组件
│   │   ├── layout/
│   │   │   ├── navbar.tsx            # 顶部导航栏
│   │   │   └── footer.tsx            # 页脚
│   │   ├── home/
│   │   │   ├── hero.tsx              # Hero 区域
│   │   │   ├── trust-bar.tsx         # 信任条
│   │   │   ├── category-cards.tsx    # 六大入口卡片
│   │   │   ├── skill-section.tsx     # Prompt 技能区块
│   │   │   ├── agent-skill-section.tsx # Agent 技能区块
│   │   │   └── testimonials.tsx      # 用户评价
│   │   ├── agent-skill/
│   │   │   └── agent-skill-card.tsx  # Agent 技能卡片
│   │   ├── skills/
│   │   │   ├── create-dropdown.tsx   # 新建按钮+下拉菜单
│   │   │   ├── create-from-github.tsx # Github 导入向导（技能）
│   │   │   ├── create-from-upload.tsx # 本地上传表单（技能）
│   │   │   ├── create-from-github-prompt.tsx # Github 导入向导（模板）
│   │   │   └── create-from-upload-prompt.tsx # 本地上传表单（模板）
│   │   └── shared/
│   │       ├── particle-bg.tsx       # 粒子背景动画
│   │       └── scroll-to-top.tsx     # 回到顶部浮动按钮
│   ├── contexts/
│   │   ├── toast-context.tsx         # Toast 通知系统
│   │   ├── auth-context.tsx          # 认证上下文（基于 localStorage）
│   │   ├── theme-context.tsx         # 主题上下文（暗色/亮色）
│   │   └── i18n-context.tsx          # 国际化上下文（中/英）
│   ├── hooks/
│   │   └── use-keyboard-shortcuts.ts # 命令面板快捷键
│   └── lib/
│       ├── types.ts                  # TypeScript 类型定义
│       ├── mock-data.ts              # Prompt 模板数据（28个模板 + 10条评价）
│       ├── mock-agent-skills.ts      # Agent 技能数据（8个技能）
│       ├── categories.ts             # Prompt 分类定义（6个分类）
│       ├── agent-skill-categories.ts  # Agent 技能分类定义（8个分类）
│       ├── i18n/
│       │   ├── types.ts              # Dictionary 类型
│       │   ├── zh.ts                 # 中文翻译
│       │   └── en.ts                 # 英文翻译
│       ├── theme.ts                  # 颜色/主题常量
│       └── utils.ts                  # 工具函数
├── public/                           # 静态资源
├── package.json
├── tsconfig.json
└── components.json                   # shadcn/ui 配置
```

---

## 页面说明

### 首页 `/`
- Hero 区域：技能优先的标题 + 内联信任统计 + CTA 平滑滚动到 Tab 区
- **核心 Tab 切换区**：「Agent 技能」|「Prompt 模板」双 Tab，每个展示 6 张热门卡片
- 探索核心方向：六大入口卡片
- 用户真实反馈（6 条精选评价）

### Agent 技能市场 `/skills`
- 全文搜索（名称、标题、描述、触发词、标签）
- 按下载量 / 星标 / 最新排序
- 按合集和分类筛选
- 市场级卡片：头像、作者、描述、标签、统计、安装命令
- **新建 Skill** 按钮，hover 弹出下拉菜单：快速创建（Github 导入）或自定义创建（本地上传）

### Agent 技能详情 `/skills/[id]`
- **Tab 1 — 技能介绍**：左侧 80% README 渲染 + 右侧 20% 来源/安装侧边栏（安装命令、下载、元数据表）
- **Tab 2 — 技能文件**：左侧文件树（含文件大小）、右侧语法高亮代码查看器、单文件下载、全部打包下载
- **Tab 3 — 交流反馈**：评论输入 + 社区评价（星评、点赞、回复）

### Prompt 模板 `/prompts`
- 搜索、筛选、排序 Prompt 模板
- 分类、难度、排序选项

### Prompt 详情 `/prompts/[id]`
- 在线版/本地版 Prompt
- 变量填充表单
- Before/After 对比
- 使用说明

### 其他页面
- `/categories` — 分类浏览（Prompt）
- `/categories/[slug]` — 分类详情
- `/trending` — 排行榜
- `/tags` — 标签云（支持搜索）
- `/guide` — 新手指南 + Prompt 工程技巧
- `/submit` — 提交 Prompt 模板
- `/login` / `/register` — 认证（基于 localStorage）

---

## 功能清单

| 功能 | 状态 | 说明 |
|------|------|------|
| Agent 技能市场 | ✅ | 搜索、筛选、排序、市场卡片 |
| 技能详情页 | ✅ | 三栏布局：介绍、文件、反馈 |
| 文件下载 | ✅ | 单文件 + zip 打包下载（JSZip） |
| 代码高亮 | ✅ | react-syntax-highlighter 暗色主题 |
| 快速创建（Github） | ✅ | 从 Github 仓库导入技能/模板 |
| 自定义创建（上传） | ✅ | 本地文件上传或手动填写表单 |
| Prompt 模板 | ✅ | 28个模板，搜索、筛选、排序 |
| 一键复制 Prompt | ✅ | 在线/本地版本，剪贴板 API |
| 变量填充 | ✅ | 实时 Prompt 模板更新 |
| 用户认证 | ✅ | 基于 localStorage 的登录/注册/登出 |
| 点赞/收藏 | ✅ | localStorage 持久化 |
| 国际化 | ✅ | 中文/英文，基于 Context |
| 暗色/亮色主题 | ✅ | 系统默认 + 手动切换 |
| SEO | ✅ | 页面级 metadata、OG、canonical URL、sitemap、robots.txt、JSON-LD |
| 响应式设计 | ✅ | 移动端优先、Sheet 抽屉导航 |
| 加载骨架屏 | ✅ | 技能列表、详情、分类、排行榜、标签、个人中心骨架屏 |
| 面包屑导航 | ✅ | 可复用面包屑组件，详情页使用 |
| 移动端原生分享 | ✅ | 移动端 navigator.share()，桌面端剪贴板回退 |
| 页面过渡动画 | ✅ | 路由切换时 CSS 渐入动画 |
| 评论回复 | ✅ | 回复评论，支持 @提及 和视觉指示器 |
| 标签云搜索 | ✅ | 按名称实时过滤标签，显示计数 |
| Newsletter 取消订阅 | ✅ | 页脚 Newsletter 管理偏好 / 取消订阅 |
| 命令面板 | ✅ | 键盘快捷键，焦点恢复 + 动画 |

---

## 数据结构

### AgentSkill

```typescript
interface AgentSkill {
  id: string;              // 唯一标识
  name: string;            // 技能名称（如 "web-scraper"）
  title: string;           // 显示标题
  description: string;     // 一句话描述
  avatar: string;          // 头像 emoji/图标
  author: string;          // 作者名
  developer: string;       // 开发者名
  downloads: number;       // 下载量
  stars: number;           // 星标数
  lastUpdated: string;     // 最后更新日期
  collection: string;      // 合集名
  category: string;        // 分类名
  installCommand: string;  // CLI 安装命令
  readme: string;          // Markdown README
  license: string;         // 许可证（MIT、Apache-2.0 等）
  version: string;         // 版本号
  files: Record<string, string>;  // 文件名 → 内容
  demoInput: string;       // 演示输入
  demoOutput: string;      // 演示输出
  triggers: string[];      // 触发示例
  tags: string[];          // 标签
  featured: boolean;       // 精选标记
  trending: boolean;       // 热门标记
}
```

### Skill（Prompt 模板）

```typescript
interface Skill {
  id: string;              // 唯一标识
  title: string;           // 标题
  subtitle: string;        // 一句话描述
  category: string;        // 分类名称
  difficulty: "新手友好" | "进阶" | "高级";
  rating: number;          // 评分 (0-5)
  usageCount: number;      // 使用次数
  promptOnline: string;    // 在线版 Prompt
  promptLocal: string;     // 本地版 Prompt
  // ... 更多字段见 src/lib/types.ts
}
```

---

## 部署

### Vercel（推荐）

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel
```

或直接将 GitHub 仓库连接到 [Vercel](https://vercel.com) 自动部署。

---

## License

MIT

---

## 免责声明

**本项目仅供学习、教学和个人研究使用，不构成任何形式的商业服务或专业建议。**

### 项目性质

AI Skills Hub 是一个前端学习项目，旨在演示如何使用 Next.js、Tailwind CSS、shadcn/ui 等现代 Web 技术栈构建全栈应用。项目中的所有数据均为模拟数据（Mock Data），不代表真实用户、真实评价或真实业务。

### AI 输出免责

- 本项目提供的 Prompt 模板和 Agent 技能仅为示例参考，不保证 AI 模型输出的准确性、安全性或适用性
- AI 生成的内容可能包含错误、偏见或不当信息，使用者应自行判断和甄别
- 使用任何 Prompt 模板或 Agent 技能所产生的后果，由使用者自行承担，本项目不承担任何责任

### 商标声明

ChatGPT（OpenAI）、Claude（Anthropic）、Grok（xAI）、DeepSeek、Qwen / 通义千问（阿里巴巴）、Llama（Meta）等均为各自公司的注册商标。本项目与其所有者之间不存在任何隶属、授权、赞助或合作关系，提及这些名称仅用于技术说明和学习目的。

### 第三方服务

本项目在开发过程中可能涉及第三方 API 或服务的调用，使用者应自行遵守相关服务的使用条款（Terms of Service）。本项目不为任何第三方服务的行为或可用性负责。

### 内容合规

- 项目中包含的所有文本内容（包括但不限于 Prompt 模板、示例输出、用户评价）均为虚构，如有雷同纯属巧合
- 本项目不鼓励将 AI 生成内容直接用于任何可能涉及法律、医疗、金融等专业领域的场景
- 使用者应确保其对本项目的使用符合所在地区的法律法规

---

> 如果本项目对你有帮助，欢迎 Star 支持。仅此而已，不构成任何明示或暗示的担保。

### 致谢

本项目由 **MiMo V2.5-pro** 模型通过 **Claude Code** 辅助生成。

特别感谢 **Xiaomi MiMo Orbit-百万亿 Token 创作者激励计划** 对本项目的支持。MiMo 模型强大的推理能力与代码生成效率为本项目的快速构建提供了核心动力。期待未来能继续探索 AI 驱动的开发新范式。
