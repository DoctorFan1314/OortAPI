# 更新日志

> **[English](CHANGELOG.md)**

本项目的所有重要变更记录。

---

## [v2.0.3] — 2026-05-07

### 国际化
- **Skill.difficulty 枚举改为英文值** — `difficulty` 从中文（`"新手友好" | "进阶" | "高级"`）改为英文（`"beginner" | "intermediate" | "advanced"`），涉及类型定义、模拟数据、筛选选项和创建表单。新增 `getDifficultyLabel()` 辅助函数用于运行时 i18n 显示

### 性能优化
- **动态导入重型库** — 技能详情页的 `react-syntax-highlighter`、`JSZip`、`file-saver` 现在使用 `lazy()` / 动态 `import()` 减少初始包体积
- **Suspense 包裹** — SyntaxHighlighter 渲染用 `<Suspense>` 包裹并显示加载占位符

### 修改文件
- `src/lib/types.ts` — `difficulty` 类型改为英文枚举值
- `src/lib/mock-data.ts` — 全部 28 个技能的 difficulty 值转换为英文
- `src/lib/utils.ts` — 新增 `getDifficultyLabel()` 辅助函数
- `src/app/prompts/client.tsx` — 难度筛选键改为英文
- `src/components/skills/create-from-upload-prompt.tsx` — 难度键和状态类型改为英文
- `src/components/skill/skill-card.tsx` — 使用 `getDifficultyLabel()` 做 i18n 显示
- `src/app/prompts/[id]/client.tsx` — Badge 使用 `getDifficultyLabel()` 显示
- `src/app/skills/[id]/client.tsx` — 动态导入 SyntaxHighlighter、JSZip、file-saver

## [v2.0.2] — 2026-05-07

### 无障碍
- **prefers-reduced-motion 现在响应式** — 粒子背景通过 `matchMedia.addEventListener("change")` 监听运行时 `prefers-reduced-motion` 变化；切换系统设置可立即暂停/恢复动画

### 国际化
- **OG 元数据双语回退** — Twitter 卡片描述改为英文；`openGraph.alternateLocale` 设为 `en_US`；`alternates.languages` 声明 `zh-CN` 和 `en-US`；`metadataBase` 读取 `NEXT_PUBLIC_SITE_URL` 环境变量

### 用户体验
- **删除评论确认** — 点击删除按钮后显示"确定要删除？"行内确认，确认后才实际删除
- **新增 i18n 键** — `comments.deleteConfirm`、`comments.commentEdited` 添加到中英文字典

### 修改文件
- `src/components/shared/particle-bg.tsx` — 响应式 `prefers-reduced-motion` 监听器
- `src/app/layout.tsx` — OG/Twitter 元数据双语，`metadataBase` 读取环境变量
- `src/components/skill/comment-section.tsx` — 删除确认 UI
- `src/lib/i18n/types.ts` — 新增 `comments.deleteConfirm`、`comments.commentEdited`
- `src/lib/i18n/zh.ts` — 新增键中文翻译
- `src/lib/i18n/en.ts` — 新增键英文翻译

## [v2.0.1] — 2026-05-07

### 性能优化
- **粒子背景仅在首页运行** — `ParticleBackground` 从根布局移至 `page.tsx`；其他页面不再运行 canvas 动画，节省 CPU/GPU
- **技能/模板页过滤逻辑完全 memoize** — `filtered` 结果现在用 `useMemo` 包裹并带有正确的依赖数组；避免每次渲染都重新过滤
- **排行榜页数据 memoize** — `allItems`、`filtered`、`sorted`、`list` 全部用 `useMemo`；消除无关状态变更时的重复排序
- **精选区数据 memoize** — `trendingAgents` 和 `trendingPrompts` 现在用 `useMemo` 避免父组件重渲染时重复计算

### 无障碍
- **精选区键盘导航** — ArrowLeft/ArrowRight 键现在可切换 Agent/Prompt Tab
- **评论星级评分 ARIA** — 评分按钮现在有 `role="radio"`、`aria-checked` 和 `aria-label`，屏幕阅读器可正确播报
- **搜索输入框标签** — 技能和模板搜索输入框现在有 `aria-label` 匹配 placeholder 文本
- **创建模态框 Dialog 模式** — GitHub 导入和上传模态框现在有 `role="dialog"`、`aria-modal="true"`、`aria-label`
- **创建模态框 Escape 关闭** — 两个模态框现在都支持按 Escape 键关闭
- **技能排序按钮 radiogroup** — 排序按钮现在包裹在 `role="radiogroup"` 中，带 `aria-label`

### 国际化
- **动态 `<html lang>` 属性** — 新增 `HtmlLangUpdater` 组件，在语言切换时更新 `document.documentElement.lang`；不再固定为 `zh-CN`
- **分类详情页 i18n 修复** — `categoryToAgentCategory` 映射现在使用英文 `categorySlug` 而非硬编码中文分类名
- **排行榜"加载更多"括号修复** — 中文 `（）` 在三个列表页统一替换为 ASCII `()`，跨语言显示更一致
- **GitHub 导入分类修复** — 默认分类从硬编码中文 "Skills 管理" 改为 `t.create.skillTypeOther`

### 新功能
- **评论编辑/删除** — 作者现在可以在技能详情页编辑和删除自己的评论
- **头像自动压缩** — 头像裁剪对话框现在对超过 500KB 的图片自动压缩为 128x128、60% JPEG 质量，避免超出 localStorage 限制
- **新手指南目录** — 新增目录导航区，包含 7 个章节的锚点链接；每个章节带 `id` 和 `scroll-mt-20` 实现平滑滚动

### 修复
- **ID 生成改用 `crypto.randomUUID()`** — 评论、提交、Toast 和自定义技能现在使用 UUID 而非 `Date.now().toString(36)`，消除碰撞风险

### 修改文件
- `src/app/layout.tsx` — 移除 `ParticleBackground`；新增 `HtmlLangUpdater`
- `src/app/page.tsx` — 新增 `ParticleBackground`；仅在首页渲染
- `src/components/shared/html-lang-updater.tsx` — **新文件**：语言切换时更新 `<html lang>`
- `src/components/home/featured-section.tsx` — `trendingAgents`/`trendingPrompts` 添加 `useMemo`；`handleKeyDown` 添加 ArrowLeft/Right
- `src/app/skills/client.tsx` — `filtered` 用 `useMemo` 包裹；搜索框添加 `aria-label`；括号修复
- `src/app/prompts/client.tsx` — `filtered` 用 `useMemo` 包裹；搜索框添加 `aria-label`；括号修复
- `src/app/trending/client.tsx` — `allItems`、`filtered`、`sorted`、`list` 全部添加 `useMemo`；括号修复
- `src/components/skill/comment-section.tsx` — 星级评分添加 `role="radio"`、`aria-checked`、`aria-label`；ID 改用 `crypto.randomUUID()`；作者可编辑/删除评论
- `src/components/skills/create-from-github.tsx` — 添加 `role="dialog"`、`aria-modal`、`aria-label`；Escape 键关闭；默认分类使用 i18n 键
- `src/components/skills/create-from-upload.tsx` — Escape 键关闭；ID 改用 `crypto.randomUUID()`
- `src/app/categories/[slug]/client.tsx` — `categoryToAgentCategory` 映射改为英文 `categorySlug`
- `src/contexts/toast-context.tsx` — Toast ID 改用 `crypto.randomUUID()`
- `src/app/submit/client.tsx` — 提交 ID 改用 `crypto.randomUUID()`
- `src/app/guide/client.tsx` — 新增目录导航带锚点链接；所有章节添加 `id` + `scroll-mt-20`
- `src/components/profile/avatar-crop-dialog.tsx` — 超过 500KB 的头像自动压缩为 128x128、60% JPEG 质量
- `src/app/skills/client.tsx` — 排序按钮包裹 `role="radiogroup"` 加 `aria-label`

## [v1.9.0] — 2026-05-07

### 修复
- **我的点赞/收藏页现在显示 Agent 技能** — 之前只解析 Prompt 技能，Agent 技能 ID 被静默过滤；现在两个标签页分别渲染 `AgentSkillCard` 和 `SkillCard`
- **我的评论删除同步 skillComments** — 从个人中心删除评论时同时清理 `skillComments` localStorage，技能详情页不再显示孤立评论
- **使用历史链接路由修复** — Agent 技能的浏览/复制记录现在正确链接到 `/skills/[id]`，不再一律跳转到 `/prompts/[id]`
- **`formatNumber()` 支持百万级** — `1000000` 现在显示 "1M" 而非 "1000.0k"
- **`formatDate()` 解析点分隔日期** — Mock 数据中的 `"2026.04"` 格式现在先转为 ISO 格式再解析，修复 "Invalid Date" 错误
- **技能/模板页 `setRefresh` 生效** — `useMemo` 依赖数组现在包含 `refresh` 计数器，新建技能/模板后无需手动刷新页面
- **Agent 技能卡片安装命令不再触发跳转** — 添加 `e.stopPropagation()`，点击安装命令只复制不跳转
- **GitHub 导入模态框不再同时显示表单和加载动画** — 解析状态下隐藏表单输入，避免视觉重叠
- **Sitemap 使用真实 lastUpdated 日期** — Agent 技能页面使用 `s.lastUpdated` 而非始终为"今天"的 `new Date()`；Prompt 日期解析更健壮
- **Sitemap 基础 URL 从环境变量读取** — `NEXT_PUBLIC_SITE_URL` 环境变量可覆盖硬编码的 Vercel URL

### 变更
- **Profile Tab 使用 URL 参数** — `?tab=settings` 深度链接生效；刷新页面保持当前 Tab；使用 `useSearchParams` + `router.replace`
- **Profile Tab 添加 ARIA 角色** — `role="tablist"`、`role="tab"`、`aria-selected`、`aria-controls`、`aria-labelledby`、`tabIndex` 管理
- **技能详情页 Tab 添加 ARIA 角色** — 三栏布局（介绍/文件/反馈）应用相同 ARIA Tab 模式
- **面包屑 i18n** — "Home" 标签改用 `t.common.home`；最后一项添加 `aria-current="page"`；装饰箭头添加 `aria-hidden="true"`
- **滚动到顶部按钮 i18n** — `aria-label` 改用 `t.common.backToTop`，不再硬编码英文
- **Loading 骨架屏无障碍** — 添加 `role="status"`、`aria-busy="true"`、`aria-label`
- **Error Boundary 装饰图标** — `AlertTriangle` 装饰图标添加 `aria-hidden="true"`
- **登录页 loading 状态** — 提交按钮显示 "..."；错误消息添加 `role="alert"`
- **注册页确认密码** — 新增"确认密码"字段，含密码不匹配验证
- **注册页 loading 状态** — 提交按钮显示 "..."；错误消息添加 `role="alert"`
- **新增 i18n 键** — `common.backToTop`、`auth.confirmPassword`、`auth.confirmPasswordPlaceholder`、`auth.passwordMismatch`

### 修改文件
- `src/components/profile/my-likes-tab.tsx` — 导入 `getAgentSkillById` + `AgentSkillCard`；同时渲染 Agent 和 Prompt 技能
- `src/components/profile/my-favorites-tab.tsx` — 同上双渲染模式
- `src/components/profile/my-comments-tab.tsx` — `handleDelete` 新增 `skillId` 参数，同步清理 `skillComments` 存储
- `src/components/profile/usage-history-tab.tsx` — 导入 `getAgentSkillById`；Agent 技能链接到 `/skills/`
- `src/lib/utils.ts` — `formatNumber` 支持 M；`formatDate` 规范化点分隔日期
- `src/app/skills/client.tsx` — `useMemo` 依赖 `refresh` 计数器
- `src/app/prompts/client.tsx` — 同上 `useMemo` 修复
- `src/components/agent-skill/agent-skill-card.tsx` — `e.stopPropagation()` + clipboard `.catch()`
- `src/components/skills/create-from-github.tsx` — 解析中隐藏表单
- `src/app/sitemap.ts` — 真实日期 + 环境变量基础 URL
- `src/app/profile/client.tsx` — URL 参数路由 Tab，ARIA Tab 角色
- `src/components/shared/breadcrumb.tsx` — i18n、`aria-current`、`aria-hidden`
- `src/components/shared/scroll-to-top.tsx` — `aria-label` i18n
- `src/app/loading.tsx` — `role="status"`、`aria-busy`、`aria-label`
- `src/app/error.tsx` — 图标 `aria-hidden`
- `src/app/skills/error.tsx` — 图标 `aria-hidden`
- `src/app/prompts/error.tsx` — 图标 `aria-hidden`
- `src/app/skills/[id]/client.tsx` — 详情页 Tab ARIA 角色
- `src/app/login/client.tsx` — Loading 状态、`role="alert"`
- `src/app/register/client.tsx` — 确认密码字段、loading 状态、`role="alert"`
- `src/lib/i18n/types.ts` — 新增 `common.backToTop`、`auth.confirmPassword/confirmPasswordPlaceholder/passwordMismatch`
- `src/lib/i18n/zh.ts` — 新增键中文翻译
- `src/lib/i18n/en.ts` — 新增键英文翻译

---

## [v1.8.0] — 2026-05-07

### 新增
- **根级 Error Boundary** — `src/app/error.tsx` 使用 `unstable_retry`（Next.js 16 API）重写，玻璃卡片 UI、重试 + 回首页按钮、i18n 支持
- **根级 Loading 骨架屏** — `src/app/loading.tsx` 使用 `animate-pulse` 模拟 Hero + Tab 区 + 6 卡片骨架
- **嵌套路由 Error Boundary** — `src/app/skills/error.tsx` 和 `src/app/prompts/error.tsx`，带路由专属"返回列表"链接
- **`useLocale()` 钩子** — `src/hooks/use-locale.ts` 从 `useI18n().lang` 派生 `"zh-CN"` / `"en-US"`
- **`formatDate()` 工具函数** — `src/lib/utils.ts` 导出 `formatDate(dateStr, locale)` 统一日期格式化
- **导航栏"更多"下拉菜单** — "模板"链接后新增下拉菜单，包含分类、排行榜、标签、指南；点击外部和路由切换自动关闭
- **导航栏 `aria-expanded`** — 搜索切换和移动端 Sheet 触发按钮添加 `aria-expanded` 属性

### 变更
- **日期 locale 修复** — 9 个文件中 11 处硬编码 `"zh-CN"` 替换为 `useLocale()`，支持中英文日期格式
- **Toast 无障碍** — 容器添加 `aria-live="polite"` + `role="status"`；每个 toast 项添加 `role="alert"`
- **精选区 ARIA Tab** — Tab 容器使用 `role="tablist"`，按钮使用 `role="tab"` + `aria-selected` + `aria-controls`，内容区使用 `role="tabpanel"` + `aria-labelledby`
- **命令面板无障碍** — 添加 `role="dialog"`、`aria-modal="true"`、`aria-label`、背景遮罩 `aria-hidden`、Tab 焦点陷阱
- **页脚禁用链接** — 5 个禁用链接（Changelog、API、GitHub、Discord、Twitter）添加 `title="Coming soon"` 提示
- **页脚冒号修复** — 全角 `：` 替换为半角 `:`
- **MarkdownRenderer 提取** — 从 `skills/[id]/client.tsx` 移至 `src/components/shared/markdown-renderer.tsx` 作为可复用组件；标题添加 `id` 属性支持锚点链接，添加 `scroll-mt-20` 滚动偏移
- **分类 i18n 集中化** — `getCategoryI18n()` 和 `getAgentCategoryI18n()` 从 `category-cards.tsx` 移至 `src/lib/categories.ts`，供多组件复用
- **react-easy-crop 动态导入** — `avatar-crop-dialog.tsx` 使用 `React.lazy` + `Suspense` 实现代码分割
- **`@types/react-syntax-highlighter`** — 从 `dependencies` 移至 `devDependencies`

### 修改文件
- `src/app/admin/client.tsx` — 3 处 `toLocaleDateString` 使用 `useLocale()`
- `src/app/submit/client.tsx` — `toLocaleDateString` 使用 `useLocale()`
- `src/app/submit/status/client.tsx` — `toLocaleDateString` 使用 `useLocale()`
- `src/components/skill/comment-section.tsx` — `toLocaleDateString` 使用 `useLocale()`
- `src/components/profile/my-comments-tab.tsx` — `toLocaleDateString` 使用 `useLocale()`
- `src/components/profile/my-submissions-tab.tsx` — `toLocaleDateString` 使用 `useLocale()`
- `src/components/profile/usage-history-tab.tsx` — `toLocaleDateString` 使用 `useLocale()`
- `src/components/profile/activity-timeline.tsx` — `toLocaleDateString` 使用 `useLocale()`
- `src/components/profile/profile-header.tsx` — `toLocaleDateString` 使用 `useLocale()`
- `src/components/ui/toast.tsx` — `aria-live`、`role="status"`、`role="alert"`
- `src/components/home/featured-section.tsx` — 完整 ARIA Tab 模式
- `src/components/shared/command-palette.tsx` — Dialog ARIA + 焦点陷阱
- `src/components/layout/navbar.tsx` — "更多"下拉菜单、`aria-expanded` 属性
- `src/components/layout/footer.tsx` — 禁用链接 title、冒号修复
- `src/components/home/category-cards.tsx` — 导入集中化 i18n 函数
- `src/app/categories/[slug]/client.tsx` — 使用集中化 i18n 函数，移除未使用的 `Dictionary` 导入
- `src/app/skills/[id]/client.tsx` — 从共享组件导入 `MarkdownRenderer`、`CopyButton`、`codeTheme`
- `src/components/profile/avatar-crop-dialog.tsx` — `React.lazy` + `Suspense` 加载 Cropper
- `src/lib/categories.ts` — 新增 `getCategoryI18n()` 和 `getAgentCategoryI18n()`
- `src/lib/utils.ts` — 新增 `formatDate()` 导出
- `package.json` — `@types/react-syntax-highlighter` 移至 devDependencies

### 新文件
- `src/app/error.tsx` — 根级 Error Boundary，使用 `unstable_retry`
- `src/app/loading.tsx` — 根级 Loading 骨架屏
- `src/app/skills/error.tsx` — 技能路由 Error Boundary
- `src/app/prompts/error.tsx` — 模板路由 Error Boundary
- `src/hooks/use-locale.ts` — Locale 派生钩子
- `src/components/shared/markdown-renderer.tsx` — 提取的 MarkdownRenderer 组件

### 移除
- `src/components/ui/card.tsx` — 未使用组件（0 imports）
- `src/components/ui/select.tsx` — 未使用组件（0 imports）
- `src/components/ui/separator.tsx` — 未使用组件（0 imports）
- `src/components/shared/premium-gate.tsx` — 未使用组件（0 imports）
- `src/components/home/skill-section.tsx` — 未使用组件（0 imports）
- `src/components/skills/create-from-github-prompt.tsx` — 未使用组件（0 imports）
- `public/file.svg` — Next.js 模板残留（0 引用）
- `public/globe.svg` — Next.js 模板残留（0 引用）
- `public/next.svg` — Next.js 模板残留（0 引用）
- `public/vercel.svg` — Next.js 模板残留（0 引用）
- `public/window.svg` — Next.js 模板残留（0 引用）

---

## [v1.7.0] — 2026-05-07

### 新增
- **自定义头像** — 用户可在个人中心头部和设置页面上传、裁剪、设置自定义头像；使用 `react-easy-crop` 库，圆形裁剪、缩放滑块、256×256 JPEG 输出；头像以 base64 data URL 持久化到 localStorage
- **导航栏头像** — 导航栏用户图标现在显示自定义头像（通过 `next/image`），无头像时回退为首字母
- **头像 i18n** — 新增 8 个头像相关 i18n 键（`avatar.changeAvatar`、`avatar.uploadHint`、`avatar.fileTooLarge`、`avatar.zoomIn`、`avatar.zoomOut`、`avatar.confirm`、`avatar.cancel`、`avatar.dragToAdjust`）

### 变更
- **指南页示例 i18n** — 硬编码 "春季穿搭心得" 替换为 `t.guide.promptExampleTopic` 键
- **Prompt 创建难度 i18n** — `create-from-upload-prompt.tsx` 难度下拉框改用 i18n 标签（`t.create.difficultyEasy/Medium/Hard`）
- **登录页"忘记密码"** — 禁用链接添加 `title="Coming soon"` 提示
- **分享错误处理** — `prompts/[id]/client.tsx` 空 catch 块添加注释说明为用户取消操作

### 修改文件
- `src/components/profile/profile-header.tsx` — Camera 图标遮罩、文件输入、AvatarCropDialog 集成
- `src/components/profile/settings-tab.tsx` — 头像上传区块含预览、Camera 按钮和裁剪对话框
- `src/components/layout/navbar.tsx` — 使用 `next/image` 显示自定义头像
- `src/app/guide/client.tsx` — 示例主题文本改用 i18n 键
- `src/components/skills/create-from-upload-prompt.tsx` — `DIFFICULTIES` 移入组件内部，使用 `{ key, label }` + i18n
- `src/app/prompts/[id]/client.tsx` — 分享 catch 块添加注释
- `src/app/login/client.tsx` — 忘记密码链接添加 title 属性
- `src/lib/i18n/types.ts` — 新增 `avatar` 区块（8 个键）+ `guide.promptExampleTopic`
- `src/lib/i18n/zh.ts` — 头像 + promptExampleTopic 中文翻译
- `src/lib/i18n/en.ts` — 头像 + promptExampleTopic 英文翻译

### 新文件
- `src/components/profile/avatar-crop-dialog.tsx` — 可复用头像裁剪对话框，基于 react-easy-crop，Canvas 裁剪导出

### 依赖
- 新增 `react-easy-crop` — 轻量级图片裁剪组件，支持触摸操作

---

## [v1.6.7] — 2026-05-07

### 变更
- **allowedDevOrigins 动态化** — 硬编码 `192.168.31.125` 替换为通配符模式（`http://192.168.*`、`http://10.*`、`http://172.*`），覆盖所有 RFC 1918 私有网段；任意局域网 IP 自动生效
- **Agent 技能评论持久化** — 技能详情页评论写入 `localStorage`（`skillComments` 键），刷新不再丢失
- **我的评论链接修复** — 评论链接现在正确区分 Agent 技能和 Prompt 模板，链接到对应详情页
- **Sitemap 补全标签页** — `/tags/[tag]` 路由现在纳入 sitemap 生成
- **Admin stale closure 修复** — `handleReview` 先读 localStorage 再更新 state，避免引用过期数据
- **Premium Gate i18n** — `premium-gate.tsx` 全面 i18n（高级技能标签、描述、解锁/注册按钮）
- **分类详情页 i18n** — `categories/[slug]/client.tsx` 所有硬编码中文替换为 i18n 键
- **Prompt 模型表格 i18n** — 表头（模型、优势、适用场景、适用人群）和 ARIA 标签本地化
- **提交页匿名用户 i18n** — 回退值 "匿名用户" 替换为 `t.submit.anonymousUser`

### 修改文件
- `next.config.ts` — 通配符 `allowedDevOrigins` 覆盖所有私有网段
- `src/lib/storage-keys.ts` — 新增 `skillComments` 键用于评论持久化
- `src/app/skills/[id]/client.tsx` — 评论从 localStorage 读取和保存；使用 `useAuth` 获取用户信息
- `src/components/profile/my-comments-tab.tsx` — 链接正确区分 Agent 和 Prompt
- `src/app/sitemap.ts` — 导入 `getAllTags()`；生成标签页条目
- `src/app/admin/client.tsx` — `handleReview` 先读 localStorage 再更新 state
- `src/components/shared/premium-gate.tsx` — 通过 `useI18n()` 实现完整 i18n
- `src/app/categories/[slug]/client.tsx` — 所有 UI 字符串改用 i18n 键
- `src/app/prompts/[id]/client.tsx` — 模型表头和 ARIA 标签 i18n
- `src/app/submit/client.tsx` — 匿名用户回退值 i18n
- `src/lib/i18n/types.ts` — 新增 12 个键（`premiumSkill`、`premiumDesc`、`catNotFound`、`modelsTableLabel` 等）
- `src/lib/i18n/zh.ts` — 新增 12 个中文翻译
- `src/lib/i18n/en.ts` — 新增 12 个英文翻译

---

## [v1.6.6] — 2026-05-07

### 变更
- **开发跨域修复** — `next.config.ts` 添加 `allowedDevOrigins: ['192.168.31.125']`，允许局域网访问开发服务器
- **图标选择器布局修复** — 自定义创建技能的图标选择器不再重叠，从 `absolute` 定位改为正常文档流
- **命令面板 ARIA** — 添加 `role="listbox"`、`role="option"`、`aria-selected`、`aria-activedescendant`、`role="combobox"`、`aria-expanded`，完整屏幕阅读器支持
- **分类数据 i18n** — 分类名称和描述（6 个 Prompt 分类 + 8 个 Agent 技能分类）从数据文件硬编码中文移至 i18n 翻译键

### 修改文件
- `next.config.ts` — 添加 `allowedDevOrigins`
- `src/components/skills/create-from-upload.tsx` — 图标选择器从 absolute 改为文档流布局
- `src/components/shared/command-palette.tsx` — listbox/option/combobox 完整 ARIA 属性
- `src/components/home/category-cards.tsx` — 使用 `getPromptCategoryI18n()` 和 `getAgentCategoryI18n()` 工厂函数
- `src/lib/i18n/types.ts` — 新增 22 个分类 i18n 键
- `src/lib/i18n/zh.ts` — 新增 22 个分类翻译
- `src/lib/i18n/en.ts` — 新增 22 个分类翻译

---

## [v1.6.5] — 2026-05-07

### 变更
- **无障碍：筛选按钮** — 技能页（合集、分类、排序）和模板页（分类、难度、排序）的所有筛选按钮添加 `role="radio"` + `aria-checked`
- **无障碍：Agent 技能卡片** — 安装命令按钮新增 `role="button"`、`tabIndex={0}`、动态 `aria-label`（显示"已复制"或"复制 {name} 的安装命令"），支持键盘操作（`Enter`/`Space`）
- **404 页面增强** — 新增搜索框（路由到 `/skills?q=`）、热门技能（3 个 AgentSkill）、热门模板（3 个 Prompt）、浏览按钮
- **删除账号二次确认** — 危险区域要求输入 "DELETE" 才能激活删除按钮，输入不匹配时显示错误 Toast

### 修改文件
- `src/app/skills/client.tsx` — 合集、分类、排序按钮添加 `role="radio"` + `aria-checked`
- `src/app/prompts/client.tsx` — 分类、难度、排序按钮添加 `role="radio"` + `aria-checked`
- `src/components/agent-skill/agent-skill-card.tsx` — 安装命令按钮无障碍：`role`、`tabIndex`、`aria-label`、`onKeyDown`
- `src/app/not-found.tsx` — 全面重写：搜索框、热门技能/模板、浏览按钮
- `src/components/profile/settings-tab.tsx` — 删除账号前需输入 DELETE 确认
- `src/lib/i18n/types.ts` — `notFound.*`（5 个新键）、`settings.deleteConfirmPrompt`、`settings.deleteConfirmMismatch`
- `src/lib/i18n/zh.ts` — 新增 7 个翻译键
- `src/lib/i18n/en.ts` — 新增 7 个翻译键

---

## [v1.6.4] — 2026-05-06

### 变更
- **扩展 i18n 覆盖** — 新增 12 个组件改用 `useI18n()`：提交页面、提交状态页、活动时间线、评论/点赞/收藏/提交/使用历史标签页、Toast 组件、页脚商标声明
- **i18n 键扩展** — 在 `submit`、`profile`、`footer`、`common`、`settings`、`comments`、`prompts`、`agentSkills` 部分新增约 50 个翻译键，实现完整双语支持
- **技能卡片徽章重叠修复** — `AgentSkillCard`：名称行新增 `pr-20` 右侧内边距，防止 `Official` 徽章与右上角 `Popular` 徽章重叠
- **评论区全面 i18n** — `CommentSection` 所有硬编码字符串替换为 `t.comments.*` 键（Toast 消息、标题、占位符、按钮、空状态）
- **技能页合集 i18n** — 合集名称（"全部"、"社区精选"、"开发者工具"等）改用 `t.agentSkills.collection*` 键
- **模板页难度 i18n** — 难度筛选标签（"新手友好"、"进阶"、"高级"）改用 `t.prompts.difficultyEasy/Medium/Hard` 键，使用稳定的 `__all__` 哨兵值
- **死代码清理** — 移除未使用的 `agent-skill-section.tsx` 和 `trust-bar.tsx` 文件
- **粒子背景无障碍** — `ParticleBackground` 检测 `prefers-reduced-motion: reduce` 并跳过动画

### 修改文件
- `src/app/submit/client.tsx` — 表单、验证消息、成功状态全面 i18n
- `src/app/submit/status/client.tsx` — 状态标签、按钮、空状态 i18n
- `src/components/profile/activity-timeline.tsx` — 活动类型标签通过 `getTypeConfig(t)` 工厂函数
- `src/components/profile/my-comments-tab.tsx` — 空状态文本
- `src/components/profile/my-likes-tab.tsx` — 空状态文本
- `src/components/profile/my-favorites-tab.tsx` — 空状态文本
- `src/components/profile/my-submissions-tab.tsx` — 状态标签通过 `getStatusConfig(t)` 工厂函数
- `src/components/profile/usage-history-tab.tsx` — 活动标签、空状态
- `src/components/ui/toast.tsx` — 关闭按钮本地化 aria-label
- `src/components/layout/footer.tsx` — 商标声明改用 i18n
- `src/components/agent-skill/agent-skill-card.tsx` — 徽章重叠修复
- `src/components/skill/comment-section.tsx` — 全部 UI 字符串 i18n
- `src/components/shared/particle-bg.tsx` — prefers-reduced-motion 检测
- `src/app/skills/client.tsx` — 合集筛选标签 i18n
- `src/app/prompts/client.tsx` — 难度筛选标签 i18n，稳定哨兵键
- `src/lib/i18n/types.ts` — 新增约 50 个键
- `src/lib/i18n/zh.ts` — 新增约 50 个键
- `src/lib/i18n/en.ts` — 新增约 50 个键

### 移除
- `src/components/home/trust-bar.tsx` — 未使用的死代码
- `src/components/home/agent-skill-section.tsx` — 未使用的死代码

---

## [v1.6.3] — 2026-05-06

### 变更
- **全面 i18n 修复** — 14 个包含硬编码中文字符串的组件全部改用 `useI18n()` 钩子，实现完整中英文支持。涉及：登录、注册、404、错误页、个人中心（标签/头部/统计/设置）、管理后台、新手指南、订阅表单、命令面板、导航栏 aria-labels、创建技能类型、快捷键命令项
- **新手指南页拆分** — `guide/page.tsx` 从服务器组件拆分为 `page.tsx`（服务器组件，仅 metadata）+ `client.tsx`（客户端组件，i18n 渲染）
- **无障碍：aria-labels** — 导航栏搜索、主题切换、语言切换、移动端菜单按钮均已添加本地化 `aria-label`
- **命令面板 i18n** — 导航项和分类标签已本地化；`getCommandItems()` 接受 `t` 字典参数

### 修改文件
- `src/app/login/client.tsx` — 表单标签和验证消息 i18n
- `src/app/register/client.tsx` — 表单标签和验证消息 i18n
- `src/app/not-found.tsx` — 添加 `"use client"` + i18n
- `src/app/error.tsx` — 标题/描述/重试按钮 i18n
- `src/app/profile/client.tsx` — 标签页标签使用 `useI18n()`
- `src/components/profile/profile-header.tsx` — 加入日期、角色标签
- `src/components/profile/stats-dashboard.tsx` — 统计标签
- `src/components/profile/settings-tab.tsx` — 全部 32 个 UI 字符串
- `src/app/admin/client.tsx` — 全部管理后台 UI 字符串
- `src/app/guide/page.tsx` — 服务器组件，仅保留 metadata
- `src/app/guide/client.tsx` — **新建** — 客户端组件，完整 i18n 指南内容
- `src/components/shared/newsletter-form.tsx` — 错误消息、按钮标签
- `src/components/shared/command-palette.tsx` — 搜索占位符、提示文字
- `src/components/layout/navbar.tsx` — 6 个 aria-label + SheetTitle
- `src/components/skills/create-from-upload.tsx` — SKILL_TYPES 数组改用 i18n
- `src/hooks/use-keyboard-shortcuts.ts` — `getCommandItems()` 接受 `t` 参数，标签本地化
- `src/lib/i18n/types.ts` — 新增 `create.skillType*` 键
- `src/lib/i18n/zh.ts` — 新增 7 个技能类型翻译
- `src/lib/i18n/en.ts` — 新增 7 个技能类型翻译

---

## [v1.6.2] — 2026-05-06

### 变更
- **许可证切换为 Apache-2.0** — 从 MIT 切换；提供明确的专利授权保护
- **免责声明重写** — 移除"仅供学习"的表述；新增与 Apache 2.0 关联的无担保声明；分离模拟数据声明、AI 输出免责和商标声明
- **布局加宽至 1440px** — 技能列表和精选区域从 `max-w-7xl`（1280px）改为 `max-w-[1440px]`，减少大屏两侧空白
- **xl 屏幕 4 列网格** — 技能卡片、精选区域和首页分类卡片在 1440px+ 屏幕显示 4 列（`xl:grid-cols-4`）
- **表格 hydration 修复** — MarkdownRenderer 表格行包裹在 `<thead>` 和 `<tbody>` 中，消除 React hydration 警告
- **MarkdownRenderer 重写** — 技能详情页 README 渲染修复：表格分隔行跳过、表格用 `<table>` 渲染带表头区分、列表和表格单元格内支持内联粗体和代码格式化
- **Agent 技能分类系统** — 新建 `agent-skill-categories.ts`，8 个独立分类；`skills/client.tsx` 改用集中定义的分类
- **首页双分类** — `CategoryCards` 根据当前 Tab 动态显示 Agent 技能分类或 Prompt 分类
- **Tab 状态提升** — `FeaturedSection` 和 `CategoryCards` 通过 `page.tsx` 共享 tab 状态
- **URL 分类筛选** — `/skills?category=Web开发` 自动选中对应分类

### 修改文件
- `src/app/skills/[id]/client.tsx` — MarkdownRenderer 全面重写：`InlineMarkdown` 辅助函数、表格检测和渲染
- `src/app/skills/client.tsx` — 使用 `agentSkillCategories`，支持 URL `category` 参数
- `src/app/page.tsx` — 提升 tab 状态，传递给子组件
- `src/components/home/featured-section.tsx` — 改为接收 `tab`/`onTabChange` props
- `src/components/home/category-cards.tsx` — 根据 tab 动态渲染不同分类

### 新文件
- `src/lib/agent-skill-categories.ts` — Agent 技能分类定义（8 个分类）

---

## [v1.6.1] — 2026-05-06

### 变更
- **新手指南重写** — 现在同时介绍 Agent 技能和 Prompt 模板，包含双轨快速上手和双 CTA 按钮
- **排行榜页** — 现在同时展示 Agent 技能和 Prompt 模板，新增内容类型筛选 Tab（全部 / Agent / Prompt）；链接指向正确的详情页
- **标签系统** — `tag-utils.ts` 现在同时索引 Agent 技能标签；标签详情页分区域渲染 AgentSkillCard 和 SkillCard
- **分类详情页** — 每个分类同时展示 Agent 技能和 Prompt 模板
- **分类列表页** — 每个分类预览同时显示两种内容类型
- **页脚** — 重组为 4 组：Agent 技能 + Prompt（顶级）、浏览（分类/排行榜/标签）、资源、社区
- **提交页** — 更新 metadata，提示 Agent 技能提交请前往技能市场页面

### 修改文件
- `src/app/guide/page.tsx` — 全面重写，覆盖双轨内容
- `src/app/trending/client.tsx` — 统一 Agent + Prompt 数据，新增内容类型筛选
- `src/app/categories/[slug]/client.tsx` — 新增 Agent 技能展示
- `src/app/categories/page.tsx` — 每个分类展示两种内容类型
- `src/app/tags/[tag]/page.tsx` — 传递 prompts 和 agents 两组数据
- `src/app/tags/[tag]/client.tsx` — 分区域渲染两种卡片
- `src/app/submit/page.tsx` — 更新 metadata
- `src/lib/tag-utils.ts` — 索引 Agent 技能标签
- `src/lib/i18n/types.ts` — footer 新增 `browse` 键
- `src/lib/i18n/zh.ts` — 新增 `browse` 翻译
- `src/lib/i18n/en.ts` — 新增 `browse` 翻译
- `src/components/layout/footer.tsx` — 重组链接分组

---

## [v1.6.0] — 2026-05-06

### 变更
- **首页重构** — 将 6 个零散区块 + 4 个分隔线替换为紧凑的 4 区块布局：
  1. **Hero 区** — 融入信任统计数据（技能数量、模板数量、平台兼容）；主 CTA 改为平滑滚动到 Tab 区，而非跳转页面
  2. **核心 Tab 切换区** — 新增 "Agent 技能" | "Prompt 模板" 双 Tab 切换（pill 按钮）；每个 Tab 展示 6 张热门卡片 + "查看全部" 链接；替代原 `AgentSkillSection` 和两个 `SkillSection` 区块
  3. **分类卡片** — 标题改为 "探索核心方向"；去掉硬编码营销描述，直接使用 `category.description`
  4. **用户评价** — 从 10 条精简为 6 条，布局更紧凑
- **TrustBar** 从首页移除（统计数据融入 Hero 底部）；文件保留但不再渲染
- **i18n** — `home` section 新增 `featuredTitle`、`featuredSubtitle`、`tabAgent`、`tabPrompt`、`exploreDirections`

### 修改文件
- `src/app/page.tsx` — 重写：4 个区块替代 6+4 个
- `src/components/home/hero.tsx` — 内联信任统计，CTA 使用 `scrollIntoView` 平滑滚动到 `#featured-section`
- `src/components/home/category-cards.tsx` — 去掉硬编码 `descriptions`，标题改用 `t.home.exploreDirections`
- `src/components/home/testimonials.tsx` — `.slice(0, 6)` 显示 6 条
- `src/lib/i18n/types.ts` — `home` 新增 5 个键
- `src/lib/i18n/zh.ts` — 新增中文翻译
- `src/lib/i18n/en.ts` — 新增英文翻译

### 新文件
- `src/components/home/featured-section.tsx` — Tab 切换组件，Agent/Prompt 双 Tab，6 卡片网格，淡入过渡

---

## [v1.5.2] — 2026-05-06

### 新增
- **评论回复** — 技能详情页每条评论下方新增「回复」按钮；点击后设置 `replyTo` 状态，输入框预填 `@用户名`，显示「正在回复」视觉指示器，支持取消回复
- **标签云搜索** — `/tags` 页面顶部新增实时搜索输入框，按名称过滤标签；新增标签计数显示
- **Newsletter 取消订阅** — 页脚订阅成功后显示「管理偏好」链接；点击后展示「取消订阅」/「取消」选项；取消订阅状态通过 localStorage 持久化
- **面包屑导航** — 可复用 `Breadcrumb` 组件；技能详情、分类详情、标签详情页替换返回链接
- **移动端原生分享** — Prompt 详情页分享按钮在移动端使用 `navigator.share()`，桌面端回退到剪贴板复制
- **命令面板改进** — 关闭时恢复焦点，新增淡入/下滑动画
- **页面过渡动画** — 通过 `src/app/template.tsx` 实现路由切换时 200ms 透明度渐变
- **OG 图片 + 规范链接** — 根布局及所有详情页（技能、Prompt、分类）新增 `openGraph`、`twitter`、`alternates.canonical`
- **加载骨架屏** — 技能列表、技能详情、分类详情、排行榜、标签云、个人中心页面新增加载状态

### 变更
- **粒子背景优化** — 缓存 `getComputedStyle`，通过 `MutationObserver` 在主题变化时失效；移动端粒子数减半（15 vs 30）；不再每帧读取 CSS 变量
- **用户头像** — `<img>` 替换为 `next/image` 的 `Image` 组件，优化加载

### 修改文件
- `src/app/skills/[id]/client.tsx` — 新增回复功能
- `src/app/tags/client.tsx` — 新增搜索输入框和标签计数
- `src/components/shared/newsletter-form.tsx` — 新增管理偏好/取消订阅流程
- `src/components/shared/particle-bg.tsx` — 缓存 CSS 变量读取、移动端粒子减半、MutationObserver 清理
- `src/components/profile/profile-header.tsx` — `<img>` → `<Image>` from next/image
- `src/app/layout.tsx` — 新增 `metadataBase`、`openGraph`、`twitter`、`alternates`
- `src/app/skills/[id]/page.tsx` — 新增 OG、twitter、canonical
- `src/app/prompts/[id]/page.tsx` — 新增 OG、twitter、canonical
- `src/app/categories/[slug]/page.tsx` — 新增 OG、twitter、canonical
- `src/lib/i18n/types.ts` — `comments` 新增 `reply`、`cancelReply`、`replyingTo`；`tags` 新增 `searchPlaceholder`、`tagCount`；`footer` 新增 `unsubscribe`、`unsubscribeDesc`、`managePreferences`
- `src/lib/i18n/zh.ts` — 新键的中文翻译
- `src/lib/i18n/en.ts` — 新键的英文翻译
- `README.md` / `README_CN.md` — 更新功能清单

### 新文件
- `src/app/template.tsx` — 页面过渡动画包装组件（CSS 渐变）
- `src/components/shared/breadcrumb.tsx` — 可复用面包屑导航组件
- `src/app/skills/loading.tsx` — 技能列表骨架屏
- `src/app/skills/[id]/loading.tsx` — 技能详情骨架屏
- `src/app/categories/[slug]/loading.tsx` — 分类详情骨架屏
- `src/app/trending/loading.tsx` — 排行榜骨架屏
- `src/app/tags/loading.tsx` — 标签云骨架屏
- `src/app/profile/loading.tsx` — 个人中心骨架屏

---

## [v1.5.1] — 2026-05-06

### 新增
- **回到顶部按钮** — 滚动超过 400px 后显示浮动按钮，点击平滑滚动回顶部
- **上下文感知导航栏搜索** — 在技能页面搜索时自动路由到 `/skills?q=...`，其他页面路由到 `/prompts?q=...`（基于 `usePathname()`）

### 修改文件
- `src/app/layout.tsx` — 导入并渲染 `<ScrollToTop />`
- `src/components/layout/navbar.tsx` — 新增 `usePathname()`，搜索根据当前路径路由

### 新文件
- `src/components/shared/scroll-to-top.tsx` — 回到顶部浮动按钮组件

---

## [v1.5.0] — 2026-05-06

### 新增
- **Agent 技能页「新建 Skill」按钮** — hover 弹出下拉菜单，包含两种创建方式：
  - **快速创建（Github 导入）**：3 步向导 — 输入 Github 仓库地址 → 模拟解析 Skills → 选择并确认。保存 `AgentSkill` 到 localStorage
  - **自定义创建（本地上传）**：表单包含英文名称、展示名称、来源地址、所有者、是否公开、描述、Skill 类型、标签、图标选择、文件上传。保存 `AgentSkill` 到 localStorage
- **Prompt 模板页「新建模板」按钮** — hover 弹出下拉菜单，包含两种 Prompt 专用创建方式：
  - **快速创建（Github 导入）**：3 步向导解析 Github 仓库为 `Skill` 模板。保存到 `publishedPrompts` localStorage
  - **自定义创建（手动填写）**：表单包含 Prompt 专用字段（标题、副标题、描述、分类、难度、在线/本地 Prompt、版本、标签）。保存 `Skill` 到 `publishedPrompts` localStorage
- `storage-keys.ts` 新增 `publishedPrompts` 存储键
- `mock-data.ts` 新增 `getPublishedPrompts()` 辅助函数
- i18n 新增 Prompt 创建专用键（templateTitle、templateSubtitle、templateCategory、templateDifficulty、promptOnline、promptLocal 等）
- 可复用的 `CreateDropdown` 组件，两个页面共用

### 变更
- **删除 `/publish` 独立页面** — 改为页面内创建按钮
- **导航栏回到 3 项** — 去掉「发布技能」
- **Footer** — 去掉「发布技能」链接
- **Sitemap** — 去掉 `/publish` 路由
- **键盘快捷键** — 去掉「发布技能」命令
- **技能详情页介绍 Tab 布局** — 从 `[280px_1fr]` 改为 `[1fr_280px]`：左侧 80% README，右侧 20% 来源/安装侧边栏
- **i18n** — `publish` section 替换为 `create` section，新增 Prompt 创建专用键
- **README.md 和 README_CN.md** — 更新项目结构、页面说明和功能清单

### 修改文件
- `src/app/skills/client.tsx` — 新头部布局含创建按钮，渲染模态框
- `src/app/prompts/client.tsx` — 新头部含创建按钮，合并已发布模板
- `src/app/skills/[id]/client.tsx` — 介绍 Tab 布局翻转（左 README，右侧边栏）
- `src/components/layout/navbar.tsx` — 去掉第 4 个导航链接
- `src/components/layout/footer.tsx` — 去掉「发布技能」链接
- `src/app/sitemap.ts` — 去掉 `/publish`
- `src/hooks/use-keyboard-shortcuts.ts` — 去掉「发布技能」命令
- `src/lib/i18n/types.ts` — `publish` → `create`，新增 Prompt 创建键
- `src/lib/i18n/zh.ts` — 更新翻译
- `src/lib/i18n/en.ts` — 更新翻译
- `src/lib/storage-keys.ts` — 新增 `publishedPrompts`
- `src/lib/mock-data.ts` — 新增 `getPublishedPrompts()`
- `README.md` — 更新结构、页面、功能
- `README_CN.md` — 更新结构、页面、功能

### 新文件
- `src/components/skills/create-dropdown.tsx` — 可复用新建按钮+下拉菜单
- `src/components/skills/create-from-github.tsx` — Github 导入向导（Agent Skill）
- `src/components/skills/create-from-upload.tsx` — 本地上传表单（Agent Skill）
- `src/components/skills/create-from-github-prompt.tsx` — Github 导入向导（Prompt）
- `src/components/skills/create-from-upload-prompt.tsx` — 本地上传表单（Prompt）

### 移除
- `src/app/publish/page.tsx` — 独立发布页面
- `src/app/publish/client.tsx` — 发布表单组件

---

## [v1.4.0] — 2026-05-05

### 新增
- **发布技能页面** (`/publish`) — 完整的 Agent 技能发布表单，包含：名称、标题、描述、分类、开发者、安装命令、版本、许可证、README 编辑器（Markdown）、动态文件列表（添加/删除/折叠）、演示输入/输出、标签
- 已发布技能保存到 localStorage，可在技能详情页和技能列表页查看
- `mock-agent-skills.ts` 新增 `getPublishedSkills()` 和 `getAllAgentSkills()` 辅助函数
- `storage-keys.ts` 新增 `publishedSkills` 存储键
- **Footer 重新分组** — 4 个区块：Agent 技能（含 /publish 链接）、Prompt 模板（含分类/排行榜/标签云）、资源、社区
- **导航栏** — 新增「发布技能」作为第 4 个导航链接
- sitemap 和键盘命令面板新增 `/publish` 路由
- i18n 新增 `publish` section，支持中英文完整翻译

### 变更
- **README.md 和 README_CN.md** — 重写，反映双内容架构（Agent 技能市场 + Prompt 模板平台）
- Footer 网格从 4 列调整为 5 列
- `getAgentSkillById` 现在同时搜索 mock 数据和 localStorage 中用户发布的技能
- 技能列表页通过 `getPublishedSkills()` 包含用户发布的技能

### 修改文件
- `README.md` — 双内容架构全面重写
- `README_CN.md` — 双内容架构全面重写
- `src/components/layout/navbar.tsx` — 新增「发布技能」导航链接
- `src/components/layout/footer.tsx` — 重新分组链接，5 列网格
- `src/lib/i18n/types.ts` — Dictionary 新增 `publish` section
- `src/lib/i18n/zh.ts` — 新增 `publish` 中文翻译
- `src/lib/i18n/en.ts` — 新增 `publish` 英文翻译
- `src/lib/mock-agent-skills.ts` — 新增 `getPublishedSkills()`、`getAllAgentSkills()`，更新 `getAgentSkillById`
- `src/lib/storage-keys.ts` — 新增 `publishedSkills` 键
- `src/app/skills/client.tsx` — 列表包含已发布技能
- `src/app/sitemap.ts` — 新增 `/publish` 路由
- `src/hooks/use-keyboard-shortcuts.ts` — 新增「发布技能」命令

### 新文件
- `src/app/publish/page.tsx` — 服务端组件，含 metadata
- `src/app/publish/client.tsx` — 发布技能表单组件

---

## [v1.3.0] — 2026-05-05

### 新增
- **3 个新分类** — 数据分析（📊）、效率工具（⚡）、创意写作（✍️），从 3 个扩展到 6 个分类
- **18 个新技能模板** — 共 28 个技能，覆盖 SQL 优化、数据清洗、图表推荐、数据洞察、会议纪要、任务分解、邮件批量生成、工作流自动化、日程规划、故事大纲、角色塑造、世界观搭建、对白优化、SEO 博客优化、社交媒体策略、React 组件生成、事故响应、SWOT 分析
- **4 条新评价** — 来自数据分析师、网络小说作者、项目经理和在线教育从业者
- **分页加载** — 技能市场每页 12 个，"加载更多"按钮
- **Prompt 工程技巧** — 新手指南新增 Chain-of-Thought、Few-Shot、角色扮演、结构化输出、自我反思等技巧章节
- **获得更好结果的秘诀** — 实用的前后对比示例

### 变更
- **分类卡片** — 从硬编码 3 个改为从数据动态渲染 6 个，响应式网格
- **Hero 标语** — 更新为提及六大核心领域
- **全局 Metadata** — description 更新覆盖六大分类
- **技能详情页点赞/收藏** — 修复为 localStorage 持久化（之前刷新即失）
- **CONTRIBUTING.md** — 翻译为英文

### 修改文件
- `src/lib/theme.ts` — 新增 3 个分类颜色（琥珀、红、粉）
- `src/lib/categories.ts` — 新增 3 个分类定义
- `src/lib/mock-data.ts` — 新增 18 个技能 + 4 条评价（约 1800 行）
- `src/components/home/category-cards.tsx` — 从分类数据动态渲染
- `src/components/home/hero.tsx` — 更新标语
- `src/app/layout.tsx` — 更新 metadata description
- `src/app/skills/client.tsx` — 新增分页
- `src/app/skills/[id]/client.tsx` — 修复点赞/收藏持久化
- `src/app/guide/page.tsx` — 新增 Prompt 工程技巧章节
- `README.md` — 更新为 28 个技能、6 个分类
- `README_CN.md` — 更新为 28 个技能、6 个分类
- `CONTRIBUTING.md` — 翻译为英文

---

## [v1.2.0] — 2026-05-05

### 新增
- **用户认证系统** — 基于 localStorage 的登录/注册/登出，会话持久化
- **Toast 通知系统** — 自动消失通知，含去重逻辑
- **点赞/收藏持久化** — 技能点赞和收藏保存到 localStorage，刷新后保持
- **提交表单验证与持久化** — 必填字段验证、最小长度检查，提交数据保存到 localStorage 并显示历史列表
- **URL 同步筛选** — 技能市场筛选条件（分类、难度、排序、搜索）同步到 URL 查询参数；可分享，支持浏览器前进/后退
- **Navbar 登录态** — 已登录显示用户名+退出，未登录显示登录/注册；移动端 Sheet 菜单同步
- **OAuth "即将推出" 提示** — Google/GitHub 登录按钮点击显示 toast 通知
- **404 处理** — 技能详情 (`/skills/[id]`) 和分类详情 (`/categories/[slug]`) 不存在时调用 `notFound()`

### 修复
- **数据不一致** — 移除 categories 中硬编码的 `skillCount`（15/12/13）；Hero 徽章和 Trust Bar 现在显示动态 `skills.length` 而非 "1284+"
- **死链** — Footer "使用条款"和"隐私政策"链接置灰不可点击；登录页"忘记密码？"链接禁用
- **Toast 去重** — 快速连续点击按钮不再叠加重复的 toast 通知

### 新文件
- `src/hooks/use-local-storage.ts` — 泛型 localStorage Hook，含 SSR 安全加载状态
- `src/contexts/toast-context.tsx` — ToastProvider + useToast Hook
- `src/contexts/auth-context.tsx` — AuthProvider + useAuth Hook
- `src/components/ui/toast.tsx` — Toaster 浮层组件

---

## [v1.1.0] — 2026-05-04

### 新增
- **自定义 404 页面** — 匹配站点深色主题，带"返回首页"按钮
- **Sitemap** (`/sitemap.xml`) — 自动生成，覆盖静态页面、所有技能和分类
- **Robots.txt** (`/robots.txt`) — 搜索引擎爬取规则
- **页面级 Metadata** — `/skills/[id]`、`/categories/[slug]`、`/guide`、`/login`、`/register`、`/submit` 使用 `generateMetadata`
- **JSON-LD 结构化数据** — 技能详情页添加 Article schema + AggregateRating
- **可访问性改进** — 筛选按钮添加 `role="radio"` + `aria-checked`，图标按钮添加 `aria-label`，模型表格添加 `<caption>`
- **剪贴板容错** — 所有 `navigator.clipboard.writeText` 调用包裹 try/catch
- **加载骨架屏** — 技能详情页加载状态
- **错误边界** — 全局 `error.tsx` 含重试按钮

### 变更
- **粒子动画优化** — `visibilitychange` 监听，Tab 不可见时暂停；粒子数从 50 降至 30；连线使用距离平方优化
- **Navbar 搜索** — 绑定 Enter 键跳转搜索，按钮添加 `aria-label`
- **颜色常量** — 集中到 `src/lib/theme.ts`
- **响应式筛选栏** — 移动端优先堆叠布局，`md:` 断点切换
- **Before/After 区域** — 氰色渐变背景增强视觉对比
- **技能卡片标签** — 副标题下方显示最多 3 个标签
- **首页"查看全部"链接** — 技能区块链接到 `/skills`
- **Trust Bar 统计** — 语义化高亮数值
- **分类卡片悬停** — Emoji 图标悬停缩放
- **技能详情表格** — `min-w-[600px]` 防止窄屏下列压缩

### 修复
- **类型安全** — 移除页面参数中的 `as string` 类型断言
- **CSS 重复** — 合并 globals.css 中重复的 `body` 规则
- **死代码** — 删除 mock-data 中未使用的 `searchSkills` 函数

---

## [v1.0.0] — 2026-05-03

### 新增
- 初始发布
- 首页：Hero、Trust Bar、分类卡片、技能区块、用户评价
- 技能市场：搜索、分类/难度筛选、排序
- 技能详情页：一键复制、变量填充、Before/After 对比、使用步骤、推荐模型
- 分类浏览和详情页
- 新手指南页
- 提交模板页
- 登录和注册页面（纯 UI）
- 粒子背景动画
- 响应式设计（移动端优先）
- shadcn/ui 组件库集成
- 10 个 Mock 技能模板，覆盖 3 个分类
- 6 条 Mock 用户评价
