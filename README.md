# AI Skills Hub — 高质量LLM技能模板库

> 高质量LLM技能模板 · 复制即用，去AI味 · 把强大AI真正变成你的生产力武器

完美适配 ChatGPT · Claude · Grok · DeepSeek · Qwen · LM Studio · Ollama 等主流平台。

---

## 项目截图

- 深蓝至黑色渐变背景 + 粒子动画
- 毛玻璃卡片 + 氰色霓虹边框
- 响应式设计，移动端优先

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
| 数据 | 本地 Mock 数据（可迁移至 Supabase） |
| 部署 | Vercel（推荐） |

---

## 项目结构

```
ai-skills-hub/
├── src/
│   ├── app/                          # Next.js App Router 页面
│   │   ├── layout.tsx                # 根布局（字体、Navbar、Footer、粒子背景）
│   │   ├── page.tsx                  # 首页
│   │   ├── globals.css               # 全局样式 + CSS 变量 + 工具类
│   │   ├── skills/
│   │   │   ├── page.tsx              # 技能市场（搜索、筛选、排序）
│   │   │   └── [id]/page.tsx         # 技能详情页
│   │   ├── categories/
│   │   │   ├── page.tsx              # 分类浏览
│   │   │   └── [slug]/page.tsx       # 分类详情
│   │   ├── guide/page.tsx            # 新手指南
│   │   ├── submit/page.tsx           # 提交模板
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
│   │   │   ├── category-cards.tsx    # 三大入口卡片
│   │   │   ├── skill-section.tsx     # 技能列表区块
│   │   │   └── testimonials.tsx      # 用户评价
│   │   ├── skill/
│   │   │   └── skill-card.tsx        # 技能卡片
│   │   └── shared/
│   │       └── particle-bg.tsx       # 粒子背景动画
│   └── lib/
│       ├── types.ts                  # TypeScript 类型定义
│       ├── mock-data.ts              # Mock 数据（10个技能模板 + 6条评价）
│       ├── categories.ts             # 分类定义
│       └── utils.ts                  # 工具函数
├── public/                           # 静态资源
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── components.json                   # shadcn/ui 配置
```

---

## 页面说明

### 首页 `/`
- Hero 区域：标题 + 副标题 + CTA 按钮
- 信任条：统计数据展示
- 三大入口卡片：语言与内容 / 编程与技术 / 思考与工作流
- 热门技能 / 最新模板 / 新手推荐：横向滚动卡片列表
- 用户评价轮播

### 技能市场 `/skills`
- 全局搜索（标题、描述、标签）
- 分类筛选、难度筛选、排序（最热/评分/最新）
- 响应式网格布局

### 技能详情 `/skills/[id]`
- 标题 + 元信息（分类、难度、评分、使用次数）
- **一键复制使用**：在线版 / 本地版 Tab 切换
- **变量填充表单**：填写变量后 Prompt 自动更新
- **Before/After 对比**：多模型输出 Tab 切换
- 使用步骤（在线 / 本地分别说明）
- 推荐模型表格
- 进阶玩法
- 互动按钮（点赞、收藏、分享）

### 其他页面
- `/categories` — 分类浏览
- `/categories/[slug]` — 分类详情
- `/guide` — 新手指南
- `/submit` — 提交模板
- `/login` — 登录
- `/register` — 注册

---

## 设计系统

### 配色

| 用途 | 颜色值 |
|------|--------|
| 主色（Cyan） | `#00d4ff` |
| 背景 | `#0a0e1a` → `#000000` 渐变 |
| 卡片背景 | `rgba(255,255,255,0.03)` 毛玻璃 |
| 卡片边框 | `rgba(0,212,255,0.12)` |
| 正文 | `#e6edf3` |
| 辅助文字 | `#8b949e` |

### CSS 工具类

```css
.glass-card          /* 毛玻璃卡片 */
.glass-card-hover    /* 悬浮上浮效果 */
.glow-text           /* 文字发光 */
.glow-border         /* 边框发光 */
.gradient-text       /* 渐变文字 */
.scrollbar-hide      /* 隐藏滚动条 */
```

---

## 数据结构

### Skill（技能模板）

```typescript
interface Skill {
  id: string;              // 唯一标识
  title: string;           // 标题
  subtitle: string;        // 一句话描述
  category: string;        // 分类名称
  categorySlug: string;    // 分类 slug
  difficulty: "新手友好" | "进阶" | "高级";
  rating: number;          // 评分 (0-5)
  usageCount: number;      // 使用次数
  promptOnline: string;    // 在线版 Prompt
  promptLocal: string;     // 本地版 Prompt
  variables: SkillVariable[];           // 变量列表
  beforeAfter: BeforeAfterExample;      // 效果对比
  recommendedModels: RecommendedModel[];// 推荐模型
  // ... 更多字段见 src/lib/types.ts
}
```

### 添加新技能

编辑 `src/lib/mock-data.ts`，在 `skills` 数组中添加新的 Skill 对象即可。

---

## 下一步（TODO）

- [ ] 接入 Supabase（Auth + PostgreSQL + pgvector 向量搜索）
- [ ] 实现真实用户系统（登录/注册/收藏）
- [ ] Prompt 版本管理
- [ ] 模板使用反馈评分系统
- [ ] 支付系统（Freemium + Pro 订阅）
- [ ] 用户提交模板审核流程
- [ ] SEO 优化
- [ ] 移动端细节打磨

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

- 本项目提供的 Prompt 模板仅为示例参考，不保证 AI 模型输出的准确性、安全性或适用性
- AI 生成的内容可能包含错误、偏见或不当信息，使用者应自行判断和甄别
- 使用任何 Prompt 模板所产生的后果，由使用者自行承担，本项目不承担任何责任

### 商标声明

ChatGPT（OpenAI）、Claude（Anthropic）、Grok（xAI）、DeepSeek、Qwen / 通义千问（阿里巴巴）、Llama（Meta）等均为各自公司的注册商标。本项目与其所有者之间不存在任何隶属、授权、赞助或合作关系，提及这些名称仅用于技术说明和学习目的。

### 第三方服务

本项目在开发过程中可能涉及第三方 API 或服务的调用，使用者应自行遵守相关服务的使用条款（Terms of Service）。本项目不为任何第三方服务的行为或可用性负责。

### 内容合规

- 项目中包含的所有文本内容（包括但不限于 Prompt 模板、示例输出、用户评价）均为虚构，如有雷同纯属巧合
- 本项目不鼓励将 AI 生成内容直接用于任何可能涉及法律、医疗、金融等专业领域的场景
- 使用者应确保其对本项目的使用符合所在地区的法律法规

---

> 如果本项目对你有帮助，欢迎 Star ⭐ 支持。仅此而已，不构成任何明示或暗示的担保。

###  致谢

本项目由 **MiMo 2.5-pro** 模型通过 **Claude Code** 辅助生成。

特别感谢 **Xiaomi MiMo Orbit-百万亿 Token 创作者激励计划** 对本项目的支持与认可。MiMo 模型强大的推理能力与代码生成效率为本项目的快速构建提供了核心动力。期待未来能继续探索 AI 驱动的开发新范式。
