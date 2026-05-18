# OortAPI — 统一 AI API 中转平台

> **[English](README.md)**

> 一个 API Key 访问 OpenAI、Anthropic、Google、Meta、DeepSeek 等主流 AI 服务。OpenAI 兼容格式，智能路由，按量计费。

---

## 快速开始

### 1. 环境要求

| 依赖 | 最低版本 |
|------|---------|
| Node.js | >= 18.0 |
| npm | >= 9.0 |

### 2. 安装与运行

```bash
# 克隆仓库
git clone https://github.com/yourname/oortapi.git
cd oortapi

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

打开浏览器访问 http://localhost:3000 即可查看。

### 3. 构建生产版本

```bash
npm run build
npm start
```

---

## API 使用

所有端点均兼容 OpenAI 格式。将 `https://api.openai.com` 替换为 OortAPI 基础地址，使用你的 OortAPI Key 即可。

### 聊天补全（流式）

```bash
curl https://your-domain.com/api/v1/chat/completions \
  -H "Authorization: Bearer sk-oort-your-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o",
    "messages": [{"role": "user", "content": "你好！"}],
    "stream": true
  }'
```

### 使用 OpenAI SDK（Python）

```python
from openai import OpenAI

client = OpenAI(
    api_key="sk-oort-your-key",
    base_url="https://your-domain.com/api/v1"
)

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "你好！"}]
)
print(response.choices[0].message.content)
```

### 使用 OpenAI SDK（Node.js）

```javascript
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: "sk-oort-your-key",
  baseURL: "https://your-domain.com/api/v1",
});

const response = await client.chat.completions.create({
  model: "gpt-4o",
  messages: [{ role: "user", content: "你好！" }],
});
console.log(response.choices[0].message.content);
```

### 获取模型列表

```bash
curl https://your-domain.com/api/v1/models \
  -H "Authorization: Bearer sk-oort-your-key"
```

### 查询余额

```bash
curl https://your-domain.com/api/v1/billing/balance \
  -H "Authorization: Bearer sk-oort-your-key"
```

### Anthropic Messages API（工具调用）

```bash
curl https://your-domain.com/api/v1/messages \
  -H "x-api-key: sk-oort-your-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-sonnet-4-20250514",
    "max_tokens": 1024,
    "messages": [{"role": "user", "content": "东京天气怎么样？"}],
    "tools": [{"name": "get_weather", "description": "获取城市天气", "input_schema": {"type": "object", "properties": {"city": {"type": "string"}}}}]
  }'
```

支持 Anthropic 与 OpenAI 格式间的 `tool_use` / `tool_result` 完整转换。

---

## 支持的模型

| 服务商 | 模型 |
|--------|------|
| OpenAI | gpt-4o, gpt-4o-mini, gpt-4-turbo, gpt-3.5-turbo |
| Anthropic | claude-3.5-sonnet, claude-3-opus, claude-3-haiku |
| Google | gemini-pro, gemini-pro-vision |
| Meta | llama-3.1-70b, llama-3.1-8b |
| DeepSeek | deepseek-chat, deepseek-coder |

> 模型可用性取决于已配置的渠道。管理员可通过控制台添加/移除模型。

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | Next.js 16 (App Router) |
| 语言 | TypeScript |
| 数据库 | SQLite (better-sqlite3) |
| 认证 | JWT + httpOnly cookie |
| 样式 | Tailwind CSS v4 |
| 组件库 | shadcn/ui (Base UI) |
| 图表 | Recharts + ECharts (echarts-for-react) |
| 密码哈希 | PBKDF2 |
| 部署 | Vercel / Docker / VPS |

---

## 核心特性

- **OpenAI 兼容 API** — 可直接替换 OpenAI、Anthropic、Google 等服务
- **智能路由** — 加权渠道路由，自动故障转移（最多重试 3 次）
- **按量计费** — 三级缓存感知定价（输入、缓存读、缓存写、输出）
- **Token Plan 订阅** — 4 个套餐，按比例升级/降级
- **工具调用** — 完整透传 `tools`/`tool_choice`，支持 OpenAI 和 Anthropic 格式
- **安全** — JWT 认证、AES-256-GCM 加密渠道 Key、限流、输入验证、禁用用户拦截、管理员审计日志
- **中间件鉴权** — 控制台路由受 Next.js 中间件保护
- **X-Request-Id** — 每个响应头包含唯一请求 ID，用于链路追踪
- **限流响应头** — 所有 v1 API 响应包含 `X-RateLimit-Limit/Remaining/Reset` 头
- **安全响应头** — HSTS、X-Frame-Options、X-Content-Type-Options、CORS 支持
- **OpenAPI 规范** — `GET /api/v1/openapi` 返回完整 API 文档
- **健康检查** — `GET /api/health` 用于监控和可用性检测
- **实时统计** — 首页展示真实平台指标（调用量、可用率、延迟、模型数）
- **智能渠道选择** — 延迟感知负载均衡，自动优先选择低延迟渠道
- **订阅自动续费** — 到期订阅自动续费（余额充足时）
- **Webhook 支持** — 管理员可配置 Webhook，在关键事件后发送 HMAC 签名通知
- **数据库备份** — `GET /api/dashboard/backup` 生成 SQLite 一致备份
- **会话管理** — 登录追踪、最多 10 并发会话、登出清理
- **模型别名与弃用** — 支持模型别名路由和弃用警告头
- **API Key 权限** — 解析 permissions JSON，强制执行模型白名单
- **限流持久化** — SQLite 持久化限流计数器，重启不丢失
- **无障碍** — 所有图标按钮添加 aria-label，Dialog 替换原生 confirm
- **Docker 部署** — 一条命令 `docker compose up -d`，SQLite 数据持久化
- **自动管理员** — 第一个注册的用户自动成为管理员
- **删除账户** — 用户可删除账户，需密码验证 + 输入确认
- **用量趋势图** — ECharts 柱状图，支持费用/Token/调用切换，与筛选联动
- **系统监控** — 管理员仪表盘：QPS、错误率、P50/P95 延迟、按供应商健康状态
- **API 测试场** — 交互式测试：选择模型 + Key，流式响应
- **渠道路由矩阵** — 可视化模型到渠道映射，含优先级/权重
- **预算管理** — 月度消费上限，阈值提醒
- **Key 用量分析** — 每个 API Key 的 7 天统计（调用、费用、Tokens、延迟、错误率）

---

## 项目结构

```
oortapi/
├── src/
│   ├── app/
│   │   ├── api/                        # 后端 API 路由
│   │   │   ├── v1/
│   │   │   │   ├── chat/completions/   # 聊天补全（流式）
│   │   │   │   ├── messages/           # Anthropic Messages API（工具调用转换）
│   │   │   │   ├── completions/        # 文本补全
│   │   │   │   ├── images/generations/ # 图像生成
│   │   │   │   ├── embeddings/         # 文本嵌入
│   │   │   │   ├── models/             # 模型列表
│   │   │   │   └── billing/            # 余额与用量
│   │   │   ├── auth/                   # 登录、注册、个人信息
│   │   │   ├── dashboard/              # 统计、密钥、渠道、用户、兑换码、模型、倍率、设置 CRUD
│   │   │   ├── subscribe/              # 订阅 API（新订/升级/降级）
│   │   │   ├── plans/                  # 套餐列表 API
│   │   │   ├── stats/                  # 平台统计（公开）
│   │   │   └── docs/                   # OpenAPI 规范端点
│   │   ├── middleware.ts               # 鉴权中间件 + X-Request-Id
│   │   ├── token-plan/                 # Token Plan 订阅页面
│   │   ├── models/                     # 模型市场（独立页面）
│   │   │   └── page.tsx               # 卡片网格，搜索、供应商筛选、货币切换、四价展示
│   │   ├── profile/                    # 个人中心（概览 + 设置）
│   │   ├── dashboard/                  # 用户控制台页面
│   │   │   ├── page.tsx                # 概览（统计 + ECharts 模型分析）
│   │   │   ├── keys/page.tsx           # API 密钥管理
│   │   │   ├── usage/page.tsx          # 用量分析（含缓存列、货币感知、时区正确）
│   │   │   ├── billing/page.tsx        # 账单与余额
│   │   │   ├── channels/page.tsx       # 渠道管理（管理员）
│   │   │   ├── users/page.tsx          # 用户管理（管理员）+ 密码重置
│   │   │   ├── redeem/page.tsx         # 兑换码管理（管理员）
│   │   │   └── settings/page.tsx       # 账户设置
│   │   ├── docs/                       # API 文档（Swagger UI）
│   │   ├── resources/                  # 技能、模板、分类
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── layout.tsx
│   ├── lib/
│   │   ├── db.ts                       # SQLite 连接（延迟初始化）
│   │   ├── schema.sql                  # 数据库 Schema
│   │   ├── auth.ts                     # JWT + 密码哈希 + AES-256-GCM 加密
│   │   ├── api-gateway.ts              # 统一网关逻辑
│   │   ├── channel-manager.ts          # 智能渠道路由
│   │   ├── billing-engine.ts           # 按量计费引擎（三级缓存定价）
│   │   ├── rate-limiter.ts             # 速率限制
│   ├── components/
│   │   ├── dashboard/                  # 控制台 UI 组件
│   │   ├── home/                       # 首页组件
│   │   └── ...
│   └── contexts/
│       ├── auth-context.tsx            # 基于 JWT 的认证
│       ├── currency-context.tsx        # USD/CNY 货币切换
│       └── ...
├── data/                               # SQLite 数据库（已 gitignore）
├── package.json
└── ...
```

---

## 控制台

注册后用户可访问完整控制台：

- **概览** — 今日调用数、成功率、花费、延迟、ECharts 模型消耗分析（堆叠柱状图、饼状图、趋势折线图）
- **Token Plan** — 订阅页面 `/token-plan`，4 个套餐（Spark/Flare/Pulse/Nova），月付/年付切换，USD/CNY 货币切换，按比例升级/降级
- **模型市场** — 独立页面 `/models`，卡片网格布局，支持搜索、供应商筛选、排序（名称/价格）、USD/CNY 货币切换、四价展示（输入/补全/缓存读/缓存写）
- **API 密钥** — 创建/管理密钥，支持独立速率限制
- **用量分析** — 详细调用历史，含 ECharts 趋势图、API Key 筛选、全量汇总统计、Token 分拆（输入、输出、缓存命中、缓存创建），货币感知费用展示，时区正确的时间戳
- **账单** — 余额展示（USD/CNY）、交易历史、兑换码充值
- **渠道管理** — 管理员配置 AI 服务商渠道，支持智能路由、连接测试、模型同步、健康监控（24h 成功率、延迟、调用次数）、搜索筛选、批量操作、路由矩阵
- **用户管理** — 管理员管理用户，角色控制、余额调整、启用/禁用、密码重置、近期活动时间线
- **兑换码** — 管理员批量生成兑换码，用户即时兑换充值
- **套餐管理** — 管理员在 `/dashboard/admin/plans` 管理订阅套餐，支持货币切换和套餐-模型绑定
- **倍率规则** — 管理员配置按模型和按时段的定价倍率，支持生效价格显示和批量编辑
- **系统监控** — 管理员实时平台健康 `/dashboard/admin/monitor`（QPS、错误率、P50/P95 延迟、按供应商统计）
- **API 测试场** — 交互式 API 测试 `/dashboard/playground`，模型选择、流式响应
- **预算管理** — 月度消费上限，进度条和阈值提醒
- **审计日志** — 管理员全文搜索、CSV 导出、日期范围筛选

---

## 渠道管理（管理员）

管理员可配置上游 AI 服务商渠道：

- **多服务商支持** — 添加 OpenAI、Anthropic、Google、DeepSeek、阿里等作为渠道
- **加权路由** — 按权重分配流量，实现负载均衡
- **自动故障切换** — 连续失败 3 次的渠道自动临时禁用；网关遇到 5xx 错误时自动重试最多 3 个渠道
- **模型映射** — 将请求的模型名映射到实际服务商模型名
- **优先级系统** — 高优先级渠道优先使用
- **连接测试** — 验证上游连通性并测量延迟
- **模型同步** — 一键将渠道模型同步到模型市场
- **获取模型** — 从上游 `/v1/models` 获取可用模型列表，弹框勾选后自动填入
- **限流检测** — 上游 429 响应自动标记为 `rate_limited`
- **健康监控** — 24 小时成功率、平均延迟、调用次数
- **API Key 加密** — 所有渠道 API Key 使用 AES-256-GCM 加密存储

---

## 计费与兑换码

- **按量计费** — 按模型费率计费，三级缓存感知定价（输入、缓存读、缓存写、输出）
- **缓存 Token 追踪** — 分别追踪缓存命中和缓存创建 Token，支持独立费率配置
- **货币支持** — USD/CNY 切换，管理员可配置汇率
- **兑换码** — 管理员批量生成兑换码，用户即时兑换到账
- **用量分析** — 控制台展示完整 Token 分拆（含缓存列），货币感知费用展示

---

## 环境变量

```bash
# 可选
DATABASE_PATH=./data/oortapi.db    # SQLite 数据库路径
JWT_SECRET=your-secret-key          # JWT 签名密钥（未设置则自动生成）
ENCRYPTION_KEY=your-encryption-key  # AES-256 渠道 API Key 加密密钥
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

---

## 部署

### Docker 一键部署（推荐）

本地构建：

```bash
git clone https://github.com/DoctorFan1314/OortAPI.git
cd OortAPI
docker compose up -d
```

或使用预构建镜像（更快，无需构建工具）：

```bash
curl -O https://raw.githubusercontent.com/DoctorFan1314/OortAPI/main/docker-compose.yml
# 编辑 docker-compose.yml：注释掉 'build: .'，取消注释 'image: ...'
docker compose up -d
```

打开 http://localhost:3000 即可访问。

常用命令：

```bash
docker compose logs -f          # 查看日志
docker compose down             # 停止服务
docker compose up -d --build    # 代码更新后重新构建
```

SQLite 数据库通过 volume 挂载到 `./data` 目录，备份只需复制此目录。

自定义端口或站点 URL，编辑 `docker-compose.yml`：

```yaml
ports:
  - "8080:3000"        # 修改宿主机端口
environment:
  - NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### Vercel

> 注意：SQLite 需要持久化文件系统。Vercel 环境建议使用 VPS 或 Docker 部署。

### VPS 手动部署

```bash
npm ci
npm run build
npm start
```

使用 PM2 进行生产环境管理：

```bash
npm install -g pm2
pm2 start npm --name oortapi -- start
pm2 save
pm2 startup
```

完整部署指南（Nginx 反向代理、环境变量等）见 [docs/deploy.md](docs/deploy.md)。

---

## 资源中心

资源中心枢纽页 `/resources/` 提供快捷入口：

- Agent 技能市场
- Prompt 模板
- 分类、排行榜、标签云
- 提交模板

---

## 许可证

本项目基于 [Apache License 2.0](LICENSE) 许可。

---

## 免责声明

**OortAPI 是一个用于学习现代全栈 Web 开发技术的教育项目。本项目不是生产环境服务，不应用于任何商业或关键业务场景。**

本软件按"原样"提供，不附带任何形式的担保。详见 [Apache License 2.0](LICENSE) 完整条款。
