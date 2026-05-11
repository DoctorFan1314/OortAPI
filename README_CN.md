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
│   │   │   ├── category-cards.tsx    # 六大入口卡片（i18n）
│   │   │   ├── featured-section.tsx  # Tab 切换区（Agent/Prompt）
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
| 安全响应头 | ✅ | next.config.ts 添加 X-Frame-Options、X-Content-Type-Options、Referrer-Policy |
| 代理路由保护 | ✅ | src/proxy.ts 为 admin/profile 路由设置 cache-control 头（Next.js 16 规范） |
| 开放重定向修复 | ✅ | safeReturnUrl() 验证防止 `://` 开放重定向 |
| 明文密码移除 | ✅ | 认证仅使用哈希比对，移除明文密码回退 |
| StarRating 键盘导航 | ✅ | ArrowLeft/ArrowRight 导航、focus-visible 环、hover 缩放 |
| CollectionPicker 无障碍 | ✅ | 外部点击关闭、Escape 键、Input 组件 |
| 灯箱滚动锁定 | ✅ | 44px 触摸目标、页面滚动锁定、i18n 标签 |
| MarkdownRenderer 升级 | ✅ | 引用块支持、链接 `[text](url)` 渲染 |
| NotificationBell 自动关闭 | ✅ | 路由切换时自动关闭下拉框 |
| 条件标签渲染 | ✅ | FeaturedSection 条件渲染非活动标签 DOM 减半 |
| 跨标签页同步 (useFollows) | ✅ | 通过 storage 事件跨浏览器标签页同步关注状态 |
| 每会话访客 ID | ✅ | useUserLocalStorage 每会话生成唯一访客 ID |
| formatRelativeTime | ✅ | AgentSkillCard 显示相对时间（如"3 个月前"） |
| 新 i18n 键 (17+) | ✅ | clearSearch、viewAllItems、comingSoon、notFound、backToList、markdownHint 等 |
| 骨架屏确定性宽度 | ✅ | 不使用 Math.random()，避免水合不匹配 |
| tFormat 优化 | ✅ | replaceAll() 替代 RegExp；开发模式未解析变量警告 |
| CreateDropdown 触摸修复 | ✅ | 移除 onMouseEnter（触摸设备不兼容） |
| AgentSkillCard 语义按钮 | ✅ | 从 `<div role="button">` 改为 `<button>` |
| Profile 缓存保护 | ✅ | 通过 proxy 为 profile/admin 路由设置 Cache-Control: no-store |
| useCollections loaded 状态 | ✅ | 添加 loaded 状态追踪初始化 |
| .env.example | ✅ | 创建环境变量模板文件 |
| ES2022 目标 | ✅ | tsconfig.json 目标从 ES2017 升级到 ES2022 |
| Agent 技能市场 | ✅ | 搜索、筛选、排序、市场卡片 |
| 技能详情页 | ✅ | 三栏布局：介绍、文件、反馈 |
| 文件下载 | ✅ | 单文件 + zip 打包下载（JSZip） |
| 代码高亮 | ✅ | react-syntax-highlighter 暗色主题 |
| 快速创建（Github） | ✅ | 从 Github 仓库导入技能/模板 |
| 自定义创建（上传） | ✅ | 本地文件上传或手动填写表单 |
| Prompt 模板 | ✅ | 28个模板，搜索、筛选、排序 |
| 一键复制 Prompt | ✅ | 在线/本地版本，剪贴板 API |
| 变量填充 | ✅ | 实时 Prompt 模板更新 |
| 交互式 Prompt 试用 | ✅ | 填写变量并在浏览器中预览组装后的完整 Prompt（纯客户端） |
| 用户认证 | ✅ | 基于 localStorage 的登录/注册/登出 |
| 点赞/收藏 | ✅ | localStorage 持久化 |
| 国际化 | ✅ | 中文/英文，基于 Context |
| 暗色/亮色主题 | ✅ | 系统默认 + 手动切换 |
| SEO | ✅ | 页面级 metadata、OG、canonical URL、sitemap、robots.txt、JSON-LD |
| 响应式设计 | ✅ | 移动端优先、Sheet 抽屉导航 |
| 技能评论持久化 | ✅ | 每个技能的评论独立持久化到 localStorage |
| 动态局域网访问 | ✅ | 开发服务器通过通配符 `allowedDevOrigins` 自动支持任意私有 IP |
| 加载骨架屏 | ✅ | 技能列表、详情、分类、排行榜、标签、个人中心骨架屏 |
| 面包屑导航 | ✅ | 可复用面包屑组件，详情页使用 |
| 移动端原生分享 | ✅ | 移动端 navigator.share()，桌面端剪贴板回退 |
| 页面过渡动画 | ✅ | 路由切换时 CSS 渐入动画 |
| 评论回复 | ✅ | 回复评论，支持 @提及 和视觉指示器 |
| 标签云搜索 | ✅ | 按名称实时过滤标签，显示计数 |
| Newsletter 取消订阅 | ✅ | 页脚 Newsletter 管理偏好 / 取消订阅 |
| 命令面板 | ✅ | 键盘快捷键，焦点恢复 + 动画 |
| 动态导入 | ✅ | 创建模态框通过 next/dynamic 延迟加载；SyntaxHighlighter、JSZip、file-saver 动态导入 |
| 404 页面增强 | ✅ | 搜索框 + 热门链接 + 浏览按钮 |
| 删除账号确认 | ✅ | 需输入 DELETE 确认删除 |
| 完整无障碍 | ✅ | ARIA 角色、标签、键盘支持、动画减弱 |
| 完整国际化 | ✅ | 100% 中英文，300+ 翻译键 |
| 分类数据 i18n | ✅ | 14 个分类名称/描述完全本地化 |
| 自定义头像 | ✅ | 上传、裁剪（react-easy-crop）、设置头像；base64 持久化到 localStorage |
| Error Boundary | ✅ | 根级 + 嵌套路由错误边界，支持重试、i18n、玻璃卡片 UI |
| 根级 Loading 骨架屏 | ✅ | 首次导航时显示根级骨架屏 |
| 日期 locale | ✅ | `useLocale()` 钩子，所有组件正确显示中英文日期格式 |
| MarkdownRenderer（共享） | ✅ | 提取为可复用组件，支持标题锚点链接和滚动偏移 |
| 导航栏"更多"下拉菜单 | ✅ | 快速访问分类、排行榜、标签、指南 |
| Profile Tab URL 路由 | ✅ | `?tab=settings` 深度链接，刷新保持当前 Tab |
| 注册确认密码 | ✅ | 注册时密码不匹配验证 |
| 登录/注册 loading 状态 | ✅ | 提交按钮显示加载指示器 |
| 点赞/收藏显示 Agent 技能 | ✅ | 点赞和收藏页同时显示 Agent 技能和 Prompt 模板 |
| 评论删除同步 | ✅ | 删除评论同步用户、全局和单技能存储 |
| 使用历史正确路由 | ✅ | Agent 技能历史链接到 `/skills/[id]` |
| formatNumber 百万级 | ✅ | `1000000` → "1M" 而非 "1000.0k" |
| Sitemap 真实日期 | ✅ | 使用真实 lastUpdated 日期；基础 URL 从环境变量读取 |
| 粒子背景仅首页 | ✅ | Canvas 动画仅在首页运行，其他页面跳过，节省 CPU/GPU |
| 过滤逻辑 Memoize | ✅ | 技能/模板/排行榜/精选区过滤数据全部 useMuse |
| 动态 `<html lang>` | ✅ | 语言切换时自动更新 HTML lang 属性 |
| 精选区键盘导航 | ✅ | ArrowLeft/ArrowRight 切换 Agent/Prompt Tab |
| 评论星级评分 ARIA | ✅ | 评分按钮带 `role="radio"`、`aria-checked`、`aria-label` |
| 创建模态框无障碍 | ✅ | `role="dialog"`、`aria-modal`、`aria-label`、Escape 关闭 |
| 搜索输入框标签 | ✅ | 技能/模板搜索框带 `aria-label` |
| UUID 生成 | ✅ | 评论、提交、Toast 使用 `crypto.randomUUID()` |
| 分类详情 i18n | ✅ | Agent 分类匹配使用英文 slug 而非硬编码中文 |
| 统一括号风格 | ✅ | "加载更多"按钮统一使用 ASCII `()` |
| 评论编辑/删除 | ✅ | 作者可在技能详情页编辑和删除自己的评论 |
| 头像自动压缩 | ✅ | 裁剪对话框自动压缩超过 500KB 的图片为 128×128、60% JPEG |
| 新手指南目录 | ✅ | 目录导航区带锚点链接，可快速跳转到任意章节 |
| Skip 导航链接 | ✅ | WCAG 2.4.1 Level A — 根布局中"跳转到主内容"链接 |
| OG 图片 | ✅ | 所有页面添加 `openGraph.images` 和 `twitter.images` 社交分享图片 |
| 统一元数据语言 | ✅ | 根布局 title、description、OG 全部改为英文，全站一致 |
| 骨架屏主题一致 | ✅ | 所有 loading 骨架屏统一使用 `bg-secondary` 令牌，亮暗色均可用 |
| 动态导入加载指示器 | ✅ | 创建模态框 `dynamic()` 加载中显示 spinner |
| 硬编码字符串 i18n | ✅ | AgentSkillCard "热门"、删除确认、Footer "即将推出" 全部 i18n |
| CreateDropdown 无障碍 | ✅ | `aria-expanded`、`aria-haspopup`、`role="menu"`、`role="menuitem"` |
| 评论按钮无障碍 | ✅ | 点赞按钮有 `aria-label` + `aria-pressed`；编辑/删除有 `aria-label` |
| Prompts 筛选 radiogroup | ✅ | 分类、难度、排序筛选按钮包裹在 `role="radiogroup"` 容器中 |
| AgentSkillCard 无障碍修复 | ✅ | 移除全卡片 overlay Link；标题、头像、描述各自独立 `<Link>` |
| 创建模态框 ARIA | ✅ | `CreateFromUpload` 和 `CreateFromUploadPrompt` 有 `role="dialog"`、`aria-modal`、`aria-label` |
| MarkdownRenderer memo | ✅ | `React.memo` 包裹，避免父组件重渲染时重复解析 |
| 提交表单 loading 状态 | ✅ | 提交按钮在提交中显示 disabled + "..."，防止重复提交 |
| 技能卡片标签可交互 | ✅ | 标签改为 `<Link href="/tags/...">`，与 SkillCard 行为一致 |
| Footer 稳定键名 | ✅ | 使用稳定 `id` 键替代翻译字符串，语言切换不重建 DOM |
| ScrollToTop CSS 过渡 | ✅ | 使用 `opacity-0 pointer-events-none` 替代从 DOM 移除 |
| Profile Stats 响应式 | ✅ | `StatsDashboard` 使用 `useEffect` + `useState` 替代 render 中直接读取 |
| glass-card-hover 优化 | ✅ | `transition: all` 改为仅过渡 `transform, border-color, box-shadow` |
| 删除确认 i18n | ✅ | 支持输入 "DELETE"（英文）或 "删除"（中文）确认删除 |
| Profile 页面 Suspense | ✅ | `ProfileClient` 包裹在 `<Suspense>` + 骨架屏 fallback 中 |
| 统一搜索页面 | ✅ | `/search` 跨市场搜索，自动补全、最近搜索、键盘导航、ARIA combobox |
| 通知系统 | ✅ | 铃铛图标带未读徽章、下拉框、标记已读、按用户 localStorage 持久化 |
| 导航栏头像下拉菜单 | ✅ | 点击头像弹出菜单：用户中心、设置、管理面板（仅管理员）、退出登录 |
| 公开用户主页 | ✅ | `/users/[username]` 展示头像、简介、统计、已发布技能 |
| JSON-LD 结构化数据 | ✅ | SoftwareApplication、CreativeWork、BreadcrumbList、Organization、WebSite |
| 技能详情页：分享 | ✅ | 移动端 navigator.share()，桌面端剪贴板回退 |
| 技能详情页：截图 | ✅ | 截图画廊带灯箱放大 |
| 技能详情页：依赖项 | ✅ | 侧边栏依赖项列表 |
| 技能详情页：认证徽章 | ✅ | BadgeCheck 图标标记已认证技能 |
| 技能详情页：举报 | ✅ | 举报模态框带单选按钮原因 |
| 技能详情页：关注作者 | ✅ | 关注/取消关注技能作者 |
| 技能详情页：收藏集 | ✅ | 添加到用户自建收藏集 |
| 技能详情页：版本历史 | ✅ | 第 4 个 Tab 带垂直时间线 |
| URL 同步筛选 | ✅ | 技能页筛选条件同步到 URL 查询参数 |
| Hero 交错入场动画 | ✅ | 带交错延迟的滑入入场动画 |
| Tab 渐变动画 | ✅ | Tab 面板切换时渐入 |
| 评论 Markdown | ✅ | 评论支持 Markdown 语法渲染 |
| 收藏集系统 | ✅ | 创建、管理、浏览技能收藏集 |
| 关注系统 | ✅ | 关注/取消关注作者，localStorage 持久化 |
| 新用户引导 | ✅ | 首次访问 3 步引导流程 |
| 打印样式 | ✅ | 打印优化 CSS，隐藏装饰元素 |
| CSS focus-visible | ✅ | 全局键盘焦点环样式 |
| reduced-motion 保护 | ✅ | 所有 CSS 动画尊重 prefers-reduced-motion |
| 亮色模式毛玻璃 | ✅ | 背景模糊配合正确的亮色模式配色 |
| 首页 RSC 化 | ✅ | Server Component + 延迟加载粒子 + 客户端 Tab 状态 |
| 模糊搜索 | ✅ | 多词 AND 匹配，拼写容错 |
| 搜索分页 | ✅ | 搜索结果"加载更多"按钮 |
| Prompts 活跃筛选标签 | ✅ | Prompt 列表页可移除的筛选标签 |
| 评论分页 | ✅ | 评论区"加载更多" |
| 评论"已编辑"标记 | ✅ | 编辑后的评论显示已编辑标记 |
| 密码强度指示器 | ✅ | 注册页 5 格强度条 |
| 移动端 Sheet 搜索 | ✅ | 移动端导航抽屉搜索入口 |
| 指南代码复制 | ✅ | 新手指南代码示例一键复制 |
| Toast warning 类型 | ✅ | 黄色警告 Toast；最多 5 个 |
| 主题 color-scheme 同步 | ✅ | 设置 `document.documentElement.style.colorScheme` 确保原生控件一致 |
| CSS scroll-behavior | ✅ | 锚点链接平滑滚动 |
| Glow 主题自适应 | ✅ | 发光效果使用 CSS 变量适配亮暗主题 |
| 14 种语言高亮 | ✅ | Python、Bash、YAML、CSS、HTML、SQL、Java、Go、Rust 等 |
| 技能详情页重构 | ✅ | 拆分为 ReportModal、Lightbox、CollectionPicker、VersionTimeline |
| useFilteredList Hook | ✅ | 技能页和模板页共用的通用过滤列表 Hook |
| 引导焦点陷阱 | ✅ | Modal 焦点陷阱，Tab 循环，焦点恢复 |
| Lightbox 键盘导航 | ✅ | Escape 关闭 + 左右箭头切换 |
| 举报弹窗 ESC | ✅ | Escape 关闭举报弹窗 |
| 收藏集编辑 | ✅ | updateCollection 和 isInCollection 函数 |
| 认证密码哈希修复 | ✅ | 迁移时立即哈希，不存明文 |
| 通知状态修复 | ✅ | unreadCount 通过 useEffect 派生，避免 stale state |
| 夜间模式级联修复 | ✅ | 所有仅亮色 CSS 选择器统一使用 `:root:not(.dark)` |
| 引导回退定位 | ✅ | scrollIntoView + 目标未找到时屏幕中央回退 |
| Toast 主题令牌 | ✅ | 硬编码十六进制色替换为主题令牌，适配亮暗模式 |
| 头像裁剪安全 | ✅ | Canvas null 检查 + reject；错误日志记录 |
| 导航栏空菜单守卫 | ✅ | 空菜单项时箭头键导航安全守卫 |
| 通知边界检查 | ✅ | 焦点索引限制在 items 长度范围内 |
| 忘记密码 | ✅ | 内联重置对话框，邮箱查找 + 新密码表单 |
| 数据导入 | ✅ | 导入 JSON 备份，验证结构，去重合并 |
| Per-user 密码盐 | ✅ | 随机 16 字节 hex salt，登录时自动迁移 |
| Admin 双重验证 | ✅ | 邮箱 + role 角色双重检查 |
| html lang 初始化 | ✅ | 内联脚本首次渲染前读取 localStorage 语言偏好 |
| XSS 消毒 | ✅ | DOMPurify 消毒 Markdown 内容，防止脚本注入 |
| 频率限制 | ✅ | 评论 3 秒、提交 10 秒、举报 5 秒冷却 |
| Profile 键盘导航 | ✅ | ArrowLeft/Right/Home/End 切换 Tab |
| Profile 分页 | ✅ | 活动、历史、评论、收藏"加载更多" |
| 清除数据确认 | ✅ | 清除前弹出确认对话框 |
| Premium 预览限制 | ✅ | 4 个技能带模糊预览和升级提示 |
| 技能对比 | ✅ | /skills/compare 并排对比 |
| 通知偏好 | ✅ | 6 种通知类型独立开关 |
| 移动端 Sheet 头像 | ✅ | 移动端导航显示头像 + 通知铃铛 |
| 评论系统统一 | ✅ | Agent 技能使用共享 CommentSection 组件 |
| 详情页骨架屏 | ✅ | 懒加载 MarkdownRenderer 动画骨架屏 |
| 评论回复/楼中楼 | ✅ | 回复评论，嵌套显示，左侧缩进边框 |
| 通知 Tab 页 | ✅ | 个人中心通知 Tab，按类型筛选，标记已读，分页 |
| 提交编辑/删除 | ✅ | 个人中心删除或编辑待审核提交 |
| 管理面板评论分页 | ✅ | 默认 20 条，支持加载更多 |
| 管理面板删除确认 | ✅ | 删除评论前弹出确认对话框 |
| 举报弹窗无障碍 | ✅ | `role="dialog"`、焦点陷阱、Escape 关闭 |
| 导航栏键盘提示 | ✅ | 搜索按钮旁 `Ctrl+K` 提示 |
| 路由切换回顶 | ✅ | 页面导航自动滚动到顶部 |
| 引导完成守卫 | ✅ | 已完成引导不再挂载组件 |
| 对比模式修复 | ✅ | 整张卡片可点击选中 |
| MarkdownRenderer 懒加载 | ✅ | 动态导入，首屏减少 ~150KB |
| 头像自动压缩 | ✅ | 超过 200KB 压缩为 128×128、60% JPEG |
| 搜索输入防抖 | ✅ | URL 更新 500ms 防抖 |
| Error Boundary API 修复 | ✅ | `unstable_retry` → `reset()`，兼容 Next.js 16 稳定版 |
| 首页嵌套 main 修复 | ✅ | 移除重复 `<main>` 标签 |
| Prompt Not Found 增强 | ✅ | 搜索图标、双按钮、glass-card 风格 |
| 分享剪贴板回退 | ✅ | 分享失败时回退到复制 URL |
| OAuth 按钮移除 | ✅ | 移除未实现的登录/注册 OAuth |
| 用户头像优化 | ✅ | `<img>` → Next.js `<Image>` 组件 |
| 下拉菜单焦点样式 | ✅ | 移除 `outline-none`，恢复 focus-visible |
| 星级评分键盘焦点 | ✅ | `.star-rating-btn:focus-visible` CSS 规则 |
| 登录/注册返回 URL | ✅ | 登录/注册后自动跳转回原始页面 |
| 技能详情 Tab 键盘导航 | ✅ | ArrowLeft/Right/Home/End 键切换 Tab |
| 管理面板 ARIA Tab | ✅ | 完整 ARIA tab 模式 + 键盘导航 |
| 提交分类 radio 语义 | ✅ | `role="radiogroup"` + `role="radio"` + 方向键 |
| 可复用 StarRating 组件 | ✅ | 交互/只读模式，评论区共用 |
| 可复用 TagChip 组件 | ✅ | 统一标签渲染 |
| useCopyToClipboard Hook | ✅ | 合并剪贴板+Toast+已复制状态 |
| AgentSkill 难度徽章 | ✅ | 初级/中级/高级，颜色编码 |
| 上传表单分类下拉 | ✅ | 预定义分类替代自由文本 |
| 收藏集视觉标识 | ✅ | `coverImage` 和 `color` 字段 |
| 登录会话过期 | ✅ | 30 天自动过期清除 |
| 未保存更改守卫 | ✅ | 设置页离开前警告 |
| 分类页 SEO | ✅ | 完整元数据、OG、canonical URL |
| 对比页 SEO | ✅ | metadata 导出 |
| 标签详情 OG + canonical | ✅ | openGraph、twitter、canonical |
| 分类详情 JSON-LD | ✅ | BreadcrumbList 结构化数据 |
| 统一英文元数据 | ✅ | 全站 8 个中文页面改为英文标题 |
| 通知偏好用户隔离 | ✅ | 用户级存储键 |
| useLocalStorage 跨标签页同步 | ✅ | storage 事件监听 |
| 焦点环溢出修复 | ✅ | box-shadow 回退 |
| 主题切换平滑过渡 | ✅ | 0.3s 颜色过渡动画 |
| Prose 暗色模式覆写 | ✅ | Markdown 使用设计令牌 |
| 7 个新错误边界 | ✅ | 分类、排行、标签、搜索、个人中心、指南、用户 |
| 3 个新加载骨架屏 | ✅ | 模板、分类、标签/[tag] |
| 最近浏览区 | ✅ | 个人中心活动时间线展示最近 10 个浏览项 |
| 最多点赞排序 | ✅ | 模板列表新增按点赞数排序 |
| Toast 自动消失 | ✅ | 3 秒/5 秒自动消失，卸载时清理超时 |
| Toast 入场动画 | ✅ | fade-in + slide-up 入场动画 |
| i18n 插值工具 | ✅ | `tFormat(key, {count})` 占位符替换 |
| 共享 ErrorFallback | ✅ | 10 个 error.tsx 统一可复用组件 |
| 共享 CopyButton | ✅ | 统一剪贴板复制按钮，带 i18n aria-label |
| 密码重置频率限制 | ✅ | 60 秒冷却期 |
| 对比相同技能警告 | ✅ | 两个槽位相同时显示警告 |
| 管理面板删除对话框 | ✅ | window.confirm() 替换为 Dialog 组件 |
| 按钮加载动画 | ✅ | Loader2 旋转器替代 "..." |
| useUserLocalStorage Hook | ✅ | 通用用户级 localStorage + 跨标签页同步 |
| Viewport 导出 | ✅ | 独立 viewport + 亮/暗 themeColor |
| 暗色滚动条 | ✅ | 自定义细滚动条匹配暗色主题 |
| Z-index CSS 变量 | ✅ | --z-dropdown、--z-overlay、--z-toast、--z-command |
| 亮色代码高亮 | ✅ | 代码块适配亮/暗主题 |
| StarRating hover 预览 | ✅ | 鼠标悬停预览评分 |
| 密码重置身份验证 | ✅ | 要求确认邮箱归属 |
| 统一站点 URL | ✅ | getSiteUrl() 替代 8+ 处硬编码 |
| Robots.txt 屏蔽 /admin | ✅ | 管理和 API 路由禁止爬虫 |
| Toast aria-live 修复 | ✅ | 移除 role="alert" 与 aria-live="polite" 冲突 |
| TagChip 44px 目标 | ✅ | WCAG 合规移动端触摸目标 |
| 通知"刚刚" | ✅ | < 60 秒显示本地化文本 |
| ScrollToTop 无障碍 | ✅ | 隐藏时 aria-hidden + tabIndex=-1 |
| 评论用户名可链接 | ✅ | 作者名链接到 /users/[username] |
| 灯箱无障碍 | ✅ | role="dialog"、焦点陷阱、Escape 关闭 |
| 排行页 ARIA Tab | ✅ | role="tablist"、role="tab"、aria-selected |
| 4 个 Provider 记忆化 | ✅ | auth、i18n、toast、theme 全部 useMemo |
| glass-card blur 一致 | ✅ | 亮暗模式统一 blur(16px) |
| 合并 reduced-motion | ✅ | 3 个 @media 块合并为 1 个 |
| CSS ::selection | ✅ | 自定义选中高亮 |
| CSS scroll-padding-top | ✅ | 锚点不再落在导航栏下方 |

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
  difficulty: "beginner" | "intermediate" | "advanced";
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

## 许可证

本项目基于 [Apache License 2.0](LICENSE) 许可。

---

## 免责声明

**AI Skills Hub 是一个用于学习现代 Web 开发技术的学习型教育项目。本项目不是生产环境服务，不提供真实的商业功能，不应用于任何专业、商业或关键业务场景。**

### 无担保声明

本软件按"原样"提供，不附带任何形式的明示或暗示担保。详见 [Apache License 2.0](LICENSE) 完整条款（特别是第 7 条"免责声明"和第 8 条"责任限制"）。

### 项目性质

本项目是一个**前端学习项目**，旨在演示如何使用 Next.js、Tailwind CSS、shadcn/ui 等现代 Web 技术栈构建全栈应用。所有功能仅供演示目的。

### 模拟数据声明

**本项目中展示的所有数据均为虚构的自动生成数据。** 包括但不限于：

- Prompt 模板、Agent 技能及其描述
- 用户评价、推荐语、评论和评分
- 下载量、星标数、使用统计
- 作者名称、开发者名称和头像
- 合集名称和分类描述
- 演示输入/输出示例

**以上数据不代表真实用户、真实产品、真实评价或真实业务指标。** 如与实际人物、产品或事件雷同，纯属巧合。

### 第三方商标声明

以下为各自公司的注册商标。本项目与其所有者之间不存在任何隶属、授权、赞助、背书或合作关系。提及这些名称仅用于识别和教育目的：

- ChatGPT、OpenAI — OpenAI, Inc.
- Claude、Anthropic — Anthropic, PBC
- Grok、xAI — xAI Corp.
- DeepSeek — DeepSeek
- Qwen、阿里巴巴 — 阿里巴巴集团
- Llama、Meta — Meta Platforms, Inc.
- Vercel、Next.js — Vercel Inc.
- GitHub、npm — GitHub, Inc.（Microsoft）

模拟数据中使用的任何品牌名称、产品名称或公司名称（包括但不限于作者字段、合集名称、安装命令和演示输出）**均为虚构，不代表真实的背书或关联**。模拟安装命令（如 `npx skills add @...`）为非功能性命令，不应执行。

### AI 输出免责

- 本项目提供的 Prompt 模板和 Agent 技能**仅为学习参考**，不保证 AI 模型输出的准确性、安全性或适用性
- AI 生成的内容可能包含错误、偏见或不当信息，使用者应自行判断和甄别
- 使用任何 Prompt 模板或 Agent 技能所产生的后果，由使用者自行承担

### 第三方服务

本项目可能引用或涉及第三方 API 或服务。使用者应自行遵守相关服务的使用条款。本项目不为任何第三方服务的行为、可用性或准确性负责。

### 无数据收集

本项目不会在外部服务器上收集、传输或存储任何用户数据。所有用户交互（包括登录、收藏、点赞和邮件订阅）仅存储在浏览器的 `localStorage` 中，不会发送至任何服务器。

### 责任限制

在任何情况下，作者、贡献者或版权持有者均不对因使用本软件而产生的任何直接、间接、附带、特殊、惩罚性或后果性损害承担责任。

---

> 如果本项目对你有帮助，欢迎 Star 支持。仅此而已，不构成任何明示或暗示的担保。

### 致谢

本项目由 **MiMo V2.5-pro** 模型通过 **Claude Code** 辅助生成。

特别感谢 **Xiaomi MiMo Orbit-百万亿 Token 创作者激励计划** 对本项目的支持。MiMo 模型强大的推理能力与代码生成效率为本项目的快速构建提供了核心动力。期待未来能继续探索 AI 驱动的开发新范式。
