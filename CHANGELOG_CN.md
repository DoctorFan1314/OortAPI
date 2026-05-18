# 更新日志

> **[English](CHANGELOG.md)**

本项目的所有重要变更记录。

---

## [v3.3.4.10] — 2026-05-18

### 数据一致性
- **成本精度统一** — 全站统一使用 `formatPrice` 上下文，统一小数位
- **货币系统统一** — 模型市场改用共享 `useCurrency()` 上下文
- **Token 单位** — 全站统一 `/1M tokens`
- **日期时区** — 修复兑换码和 API Key 过期日期的 +Z 后缀缺失
- **搜索标签** — 统一为 "Input"/"Output"
- **Profile 统计** — 改用服务端聚合数据，不再仅取最近 10 条

### 管理面板 UX
- **删除确认** — 对话框显示被删除对象的实际名称/码值
- **updated_at 展示** — Webhook 和套餐显示最后修改时间
- **设置确认** — 汇率变更前弹出确认对话框
- **对话框焦点** — 所有创建/编辑弹窗自动聚焦首个输入框
- **URL 提示** — 截断的 Webhook URL 悬停显示完整地址
- **调用次数格式化** — API Key 列表使用 locale 数字格式
- **渠道测试结果** — 每个渠道独立维护测试状态
- **总数角标** — API Keys 和兑换码列表显示总数

### 共享组件
- **StatCard** — 可复用统计卡片组件（8 种颜色）
- **StatusBadge** — 可复用状态徽标（成功/错误/警告/信息/静默）
- **ConfirmDialog** — 可复用确认对话框（支持危险操作变体）
- **LoadingSkeleton** — 可复用加载骨架屏

---

## [v3.3.4.9] — 2026-05-18

### 控制台
- **Token 明细拆分** — 概览卡片将月 Token 拆分为：普通输入、缓存命中、缓存创建、输出
- **登录/注册校验** — 邮箱格式、密码长度、必填字段即时校验
- **翻页跳转** — 调用日志页码可手动输入跳转
- **Curl 修正** — 占位符改为 `sk-oort-xxxxxxxxxxxx`，hydration 前不渲染

### 无障碍
- **aria-labels** — 模型链接、排序下拉、Key 开关/删除按钮等 10+ 修复
- **表格标签** — 所有数据表 th 添加 `scope="col"`
- **焦点状态** — hover-only 按钮添加 focus 可见性（键盘/触屏）

### SEO
- **Sitemap** — 补充 /docs、/models、/changelog、/faq、/token-plan 等缺失页面
- **JSON-LD** — 品牌名从 "AI Skills Hub" 修正为 "OortAPI"
- **文档元数据** — 扩展 docs layout 描述

### 视觉与交互
- **FAQ 动画** — 平滑展开/收起过渡
- **监控图标** — PhoneCall 改为 Activity
- **图表颜色** — 费用指标从红色改为紫色
- **订阅跳转** — 使用 `router.replace` 而非 `push`
- **主题按钮** — aria-label 动态反映当前模式
- **禁用链接** — 添加 tabIndex={-1} 避免聚焦
- **渠道 URL** — 新增 http/https 格式校验
- **审计搜索** — 300ms 防抖，减少 API 请求
- **版本日志** — fetch 添加 10s 超时 + 失败重试

---

## [v3.3.4.8] — 2026-05-18

### 新功能
- **密码重置** — 新增忘记密码流程（`/forgot-password` + `/reset-password`）
- **记住我** — 登录页添加「记住我」复选框
- **API Key 过期** — 支持设置 Key 过期日期，显示倒计时/已过期状态
- **创建套餐** — 管理员可在后台直接创建订阅套餐
- **套餐对比表** — Token Plan 页新增功能对比表格

### 体验改进
- **Playground** — 多轮对话历史、可配置参数（temperature/max_tokens/top_p）、系统提示词、响应复制按钮
- **调用日志** — 表头点击排序（Token、费用、延迟、时间）
- **模型详情** — 未登录用户显示「注册使用」CTA，已登录用户显示「在线测试」
- **模型市场** — 添加「加载更多」分页（每批 20 个）
- **API Key 搜索** — 按名称/Key 值搜索，删除对话框显示 Key 名称
- **渠道密钥显隐** — 密钥输入框添加眼睛切换按钮
- **渠道费用统计** — 渠道健康数据增加 24h 费用显示
- **Webhook 状态** — 显示最后触发时间和状态码
- **用户 CSV 导出** — 管理员可导出用户列表
- **兑换码搜索** — 按码值搜索，单行复制按钮
- **SDK 文档** — 动态 Base URL，不再硬编码 localhost
- **文档搜索** — 文档首页添加搜索输入框
- **快捷键** — Ctrl+K 快捷键现在可用

### 控制台增强
- **概览页** — 错误状态+重试、手动刷新、上次更新时间
- **系统监控** — 30 秒自动刷新、手动刷新、ECharts 24h 趋势图
- **账单页** — 余额刷新按钮
- **设置页** — 预算超限时 Toast 通知

### 其他
- **GitHub 链接** — 页脚 GitHub 链接指向实际仓库
- **注册页** — 显示「更多登录方式即将上线」提示

---

## [v3.3.4.7] — 2026-05-18

### 重大 — 文档全面重构
- **多页文档体系** — 将单页 920 行文档拆分为 10 个子页面，带侧边栏导航：快速开始、认证方式、API 端点、SDK 集成、流式响应、定价说明、错误码、速率限制、部署指南、集成指南
- **文档侧边栏** — 分组折叠导航，客户端搜索过滤，移动端适配
- **文档首页** — 分类卡片导航布局，替代原有单页堆叠
- **共享组件** — 提取 CodeBlock、BaseUrlDisplay、EndpointRow、DocsSidebar 为可复用组件
- **i18n 扩展** — apiDocs 命名空间从 ~20 键扩展到 ~90 键，完整双语支持

### 新页面
- **版本日志** — `/changelog` 从 GitHub 加载 CHANGELOG 渲染版本历史
- **常见问题** — `/faq` 10 条常见问题（展开式，双语）
- **速率限制** — `/docs/rate-limits` 含重试策略代码示例（Python/Node.js）
- **集成指南** — `/docs/integrations` 逐应用配置指南

### 改进
- **页脚** — 新增 FAQ 链接、系统运行状态指示器（轮询 `/api/health`）
- **导航栏** — 移除 changelog/FAQ（仅保留在页脚）
- **构建** — 项目现在生成 181 个静态页面（原 169）

---

## [v3.3.4.6] — 2026-05-18

### 新功能
- **用量趋势图** — 调用日志上方新增 ECharts 柱状图，支持切换「费用/Token/调用次数」维度，与筛选联动
- **用量汇总统计** — 顶部汇总卡片改为全量聚合（不再只统计当前页），新增每日趋势数据
- **按 API Key 筛选** — 调用日志支持按 API Key 下拉筛选
- **Key 速率限制** — API Key 卡片显示并支持行内编辑 RPM 速率限制
- **Key 用量分析** — 每个 Key 可展开查看 7 天统计：调用次数、费用、Tokens、平均延迟、错误率
- **预算管理** — 设置页新增月度预算上限，带进度条和阈值提醒
- **系统监控** — 管理员新增 `/dashboard/admin/monitor` 页面：QPS、错误率、P50/P95 延迟、按供应商健康状态（自动刷新）
- **API 测试场** — 新增 `/dashboard/playground` 页面：选择模型 + API Key，发送消息，流式显示响应
- **渠道搜索筛选** — 渠道列表支持名称搜索、按状态（在线/离线/启用/禁用）和供应商类型筛选
- **渠道批量操作** — 多选 checkbox，支持批量启用/禁用/删除
- **渠道路由矩阵** — 可切换视图，展示模型到渠道的映射关系及优先级/权重
- **乘数生效价格** — 表格展示生效输入/输出价（基础费率 × 倍率），支持批量编辑
- **审计日志导出** — 新增 CSV 导出按钮，搜索扩展到 action + details 全文搜索
- **用户活动时间线** — 管理员用户详情页新增最近 20 条调用记录

### 改进
- **模型详情汇率** — 使用系统汇率设置，不再硬编码 7.3
- **搜索结果跳转** — 搜索结果链接改为模型详情页 `/models/{id}`，而非列表页
- **首页服务商** — ModelWall 从 API 动态获取实际供应商列表，不再硬编码
- **充值按钮提示** — 充值按钮下方显示可见提示文字，引导使用兑换码
- **Toast 位置** — 移至 bottom-20，避免与回到顶部按钮重叠

---

## [v3.3.4.5] — 2026-05-15

### 新功能
- **获取上游模型** — 渠道管理新增"获取模型"按钮，调用上游 `/v1/models` 接口，弹框展示可用模型列表（带复选框），勾选后自动填入。新建和编辑渠道均可使用。

---

## [v3.3.4.4] — 2026-05-15

### 修复 — 全站闪烁与体验优化（16 项）
- **主题 FOUC** — 移除 `<html>` 硬编码 `dark` 类，改用同步内联脚本避免亮色模式闪烁
- **双重 applyTheme** — 修复主题切换时两次 DOM 突变 + transition 重叠导致的过渡闪烁
- **首次 mount transition** — 修复 ThemeProvider 初始化时错误播放 transition 动画
- **UsageChart 加载逻辑** — 修复加载时先显示 "No data" 再显示图表（检查顺序倒置）
- **AuthGuard 空白闪烁** — 修复未认证时 skeleton → null → redirect 三态跳转
- **use-collections 竞态** — 修复 skipPersistRef 竞态条件导致切换用户时 localStorage 数据交叉污染
- **use-follows 竞态** — 同上
- **hooks 依赖 user 引用** — 修复 use-notifications/use-collections/use-follows 依赖整个 user 对象引用导致级联 re-render
- **Navbar 骨架屏** — 骨架屏去掉 animate-pulse，用静态占位符减少视觉干扰
- **Dashboard SWR 交错刷新** — 添加 `keepPreviousData: true` 避免切换标签页时 skeleton 闪烁
- **翻页骨架屏** — Usage/Billing 翨页时保留旧数据，不再整表消失显示骨架屏
- **glass-card 骨架屏** — 骨架屏不用 backdrop-filter，减少 GPU 合成抖动
- **Navbar backdrop-blur** — 降低 blur-xl 为 blur-md，减少滚动时 GPU 开销
- **ScrollToTop 节流** — 添加 rAF 节流 + 迟滞阈值（400/300px），防止按钮在阈值附近闪烁
- **Search blur timeout** — 用 ref 追踪 blur timeout，focus 时清除旧 timeout，防止下拉闪烁
- **reduced-motion** — 添加全局 catch-all 覆盖所有内联动画（包括 `animate-[fadeIn_...]`）

### 修复 — 业务逻辑
- **总 tokens 统计错误** — 修复总 tokens 重复计算缓存命中（tokens_in 已含 tokens_in_cache）
- **Credit 倍率计算** — 修复额度明细总计未乘 credit_rate，始终用当前倍率重新计算
- **系统默认货币不生效** — CurrencyProvider 现在从服务器读取系统默认货币设置
- **设置页面货币同步** — 管理员修改默认货币后立即同步到 localStorage，其他页面实时生效

---

## [v3.3.4.3] — 2026-05-15

### 新功能
- **Docker 一键部署** — 新增 `Dockerfile`（多阶段构建）和 `docker-compose.yml`，一条命令部署，SQLite 数据持久化
- **首注册自动管理员** — 第一个注册的用户自动成为管理员，管理员可在用户管理中提升其他用户
- **删除账户** — 个人中心支持删除账户，需密码验证 + 输入 "DELETE" 确认
- **修改密码移至个人中心** — 修改密码从控制台设置移至个人中心设置 tab，更符合用户直觉

### 修复
- **调用日志 SQL 错误** — 修复 COUNT 查询别名不匹配（`u.user_id` → `user_id`）导致日志为空
- **调用日志筛选** — 添加手动筛选按钮，筛选仅在点击时生效，进入页面默认显示全部记录
- **日期范围筛选** — 修复"截止日期"不包含当天记录的问题（`created_at < date(?, '+1 day')`）
- **Docker schema.sql** — 修复 `schema.sql` 未复制到 Docker 镜像导致注册失败

### 变更
- **控制台设置精简** — 移除账户设置（用户名/简介）和修改密码（已移至个人中心）；控制台设置仅保留 API 端点 + 系统设置（管理员）

---

## [v3.3.4.2] — 2026-05-14

### 关键修复
- **渠道延迟统计 BUG** — 修复 SQL 查询引用错误列 `api_key_id` → `channel_id`
- **登录暴力破解防护** — 添加 IP 级别速率限制（60 秒内 5 次尝试，超限后锁定 15 分钟）
- **API Key 哈希存储** — API Key 现在以 SHA-256 哈希存储，旧 Key 首次使用时自动迁移

### 新功能 — 开发者体验
- **用量日志筛选** — 调用日志页添加模型搜索、状态筛选、日期范围选择器
- **CSV 导出** — 用量日志支持 `?format=csv` 导出 CSV，UI 添加下载按钮
- **模型详情页** — 每个模型现在有独立页面展示定价、7 天统计、可用渠道（`/models/[model]`）
- **模型标签** — 模型支持分类标签（如 `vision`、`reasoning`），模型页可按标签筛选
- **OpenAPI Spec 统一** — `/api/v1/openapi` 和 `/api/docs/openapi.json` 现在使用同一份完整规范

### 新功能 — 平台能力
- **审计日志 UI** — `/dashboard/admin/audit` 完整审计日志页面，支持按操作类型、目标类型、日期筛选
- **Webhook 管理** — `/dashboard/admin/webhooks` CRUD 管理，支持事件配置和测试发送
- **渠道健康监控** — 渠道页新增 24h 成功率、平均延迟、状态总览卡片
- **渠道健康历史** — 新增 `channel_health_log` 表，记录状态变化，支持 7 天趋势展示
- **用户活跃度统计** — `/dashboard/users/[id]` 用户详情页展示总调用、总 Token、总消费、常用模型、7 天趋势
- **套餐分析面板** — 管理员套餐页新增各套餐订阅人数、月收入、Credits 使用率
- **配置导出/导入** — 设置页支持导出完整配置（设置 + 渠道 + 模型 + 套餐）为 JSON 并导入
- **兑换码批量操作** — 支持复选框多选兑换码，批量启用/禁用/删除
- **用户批量操作** — 支持多选用户，批量启用/禁用和批量发放余额
- **API 调用实时日志** — 调用日志页每 30 秒自动刷新，显示实时指示器、暂停按钮、新行高亮
- **计划升级/降级** — 用户可更换套餐，剩余天数额度按比例折算到新套餐
- **订阅到期提醒** — 仪表盘在订阅到期前 3 天（自动续费关闭时）显示警告横幅

### 数据库迁移
- `model_rates.tags` — 新增 TEXT 列用于模型分类标签
- `usage_logs.is_stream` — 新增 INTEGER 列记录流式请求
- `usage_logs.request_size_bytes` — 新增 INTEGER 列记录请求体大小
- `channel_health_log` — 新表，记录渠道健康历史

---

## [v3.3.4.1] — 2026-05-14

### 关键修复
- **引导链接** — 修复错误链接 `/dashboard/api-keys` → `/dashboard/keys`
- **API Key 创建 toast** — 修复错误消息（显示"已复制"而非"API Key 创建成功"）
- **渠道 PATCH 存在性检查** — 更新不存在的渠道现在返回 404 而非静默 200
- **渠道 API Key 掩码** — 渠道列表现在显示 `••••••••abcd` 而非泄露前 10 位

### 用户体验改进
- **用量图表货币** — tooltip 现在使用货币上下文而非硬编码 `$`
- **兑换 toast** — 兑换成功消息现在使用动态货币符号
- **统计卡片标签** — "Total Spent" 更名为 "Monthly Cost" 以匹配实际数据
- **API Key 最后使用** — 现在显示相对时间（"3 小时前"）而非原始 ISO 字符串
- **用量展开行** — 添加关闭 (X) 按钮用于折叠详情行
- **倍率删除确认** — 删除现在需要确认对话框
- **用户页确认** — 取消订阅、赠送、添加额度现在需要确认
- **用户搜索防抖** — 搜索输入现在 300ms 防抖而非每次按键都发请求
- **兑换表单验证** — 空/无效金额现在显示错误而非提交
- **账单历史分页** — 现在分页（每页 20 条）而非加载全部记录
- **账单 API 分页** — `/api/dashboard/billing` 现在支持 `limit` 和 `offset` 参数

### 国际化
- **Hero 统计** — "30+ AI Models"、"< 200ms Latency"、"99.9% Uptime" 现在双语
- **文档 CopyButton** — 复制按钮 title 从硬编码"复制"改为双语
- **仪表盘快速开始** — 代码块现在有复制按钮（hover 显示）

### UI/交互
- **侧边栏活跃状态** — 修复过宽匹配（如 `/dashboard/settings` 不再为 `/dashboard/setting` 高亮）
- **Footer 定价链接** — 修复"Pricing"链接指向 `/models` 而非 `/token-plan`
- **导航栏 Dashboard 链接** — 未登录用户不再看到 Dashboard 链接
- **移动端 Sheet 切换** — 移动端导航 Sheet 现在包含语言和主题切换
- **仪表盘面包屑** — 根据 URL 路径自动生成面包屑导航
- **用量图表骨架屏** — 加载状态现在显示动画卡片骨架而非空白
- **侧边栏移动端折叠** — 移动端导航菜单现在可折叠，带箭头切换按钮
- **原生 select 样式** — 所有 `<select>` 元素（设置、倍率）现在使用统一的表单输入样式

### 国际化（第二批）
- **文档页完整 i18n** — 所有章节标题、端点描述、错误码、定价层级、认证描述现在双语（通过 DOCS_LABELS）

### 后端/安全
- **邮箱验证** — 注册现在服务端验证邮箱格式
- **渠道 PATCH** — 无字段时返回 400，渠道不存在时返回 404
- **用户名长度** — 个人资料用户名限制统一为 2-32 字符（原为 2-50）

---

## [v3.3.4] — 2026-05-14

### 用户体验与产品改进

#### 新用户引导
- **仪表盘 onboarding** — 新用户（无 API Key + 无订阅）现在看到 3 步引导卡片：创建 Key → 选择套餐 → 开始调用

#### 移动端适配
- **用量表格响应式** — 14 列用量表格在移动端自动隐藏次要列（缓存 token、倍率、延迟、备注），仅显示核心信息（模型、总量、费用、状态、时间）

#### 错误反馈
- **管理员页面错误提示** — multiplier、channel-card、admin/plans 页面的所有 CRUD 操作现在显示成功/失败 toast 通知（之前静默吞掉错误）

#### 文档改进
- **代码块复制按钮** — 文档页面所有代码块右上角添加复制按钮（hover 显示）

#### 表单与交互
- **注册密码提示** — 密码输入框下方显示"至少 8 个字符"提示（输入前可见）
- **充值按钮** — 充值按钮改为 disabled + tooltip 提示"即将上线，请使用兑换码"（之前点击弹 toast）

#### 国际化
- **Hero 徽章** — 首页"Unified AI API Gateway"徽章现在支持中英文切换
- **Auth 错误边界** — 错误回退界面同时显示中英文提示

#### 按钮一致性
- **删除确认按钮** — 所有删除对话框统一使用 `bg-red-600` 样式（之前部分用 `variant="destructive"`，样式不一致）

---

## [v3.3.3] — 2026-05-14

### 安全修复、竞态补丁、限流头、审计日志与性能优化

#### 关键安全修复
- **禁用用户拦截** — 登录现在对已禁用账号返回 403；`/api/auth/me` 和 Cookie 验证检查 `enabled = 1`
- **兑换码竞态** — 原子 `UPDATE ... WHERE current_uses < max_uses` 防止兑换码双重消费
- **积分竞态** — 原子 `UPDATE ... WHERE credits_remaining >= ?` 防止订阅积分扣除的 TOCTOU 竞态
- **错误消息脱敏** — 网关不再向客户端泄露上游错误详情

#### 网关改进
- **上游请求超时** — 为上游 fetch 添加 180 秒 `AbortSignal.timeout`；超时返回 504 而非挂起
- **限流响应头** — 所有 v1 API 响应现在包含 `X-RateLimit-Limit`、`X-RateLimit-Remaining`、`X-RateLimit-Reset` 头
- **输入验证** — Chat Completions 现在验证 `temperature`（0-2）、`max_tokens`（1-1M）和非空 messages 数组

#### 安全头与 CORS
- **安全响应头** — 中间件现在设置 `X-Content-Type-Options`、`X-Frame-Options`、`Referrer-Policy` 和 `HSTS`（生产环境）
- **CORS 配置** — API 路由支持通过 `CORS_ORIGINS` 环境变量配置允许的源；预检 OPTIONS 请求已处理

#### 管理员审计日志
- **审计日志系统** — 新增 `audit_log` 表跟踪所有管理员操作（用户/渠道/套餐/兑换管理）
- **审计日志 API** — `GET /api/dashboard/audit` 返回分页审计记录（仅管理员）
- **审计日志记录** — 用户更新/删除、渠道 CRUD、套餐费率 CRUD、兑换码 CRUD 全部记录

#### 新端点
- **健康检查** — `GET /api/health` 返回服务状态、数据库延迟、渠道数、活跃用户数

#### 数据完整性
- **套餐种子不再覆盖管理员配置** — 订阅套餐的 `ON CONFLICT DO UPDATE` 改为 `ON CONFLICT DO NOTHING`；`plan_models` 种子改用 `INSERT OR IGNORE` 替代 `DELETE + INSERT`

#### 性能
- **新增数据库索引** — 添加 `model_rates(model_name)`、`user_subscriptions(user_id, status, current_period_end)`、`channels(enabled, priority)`、`usage_logs(api_key_id)`、`audit_log(admin_id, created_at)`

#### UI 修复
- **余额显示精度** — 所有余额/价格显示现在使用货币上下文的 `formatPrice()`（统一 USD/CNY 格式）
- **账单历史自动刷新** — 账单历史组件改用 SWR 替代手动 `useState` + `useEffect`
- **用量日志分页** — 用量页面新增上一页/下一页分页（每页 50 条）

#### 中间件
- **请求体大小限制** — API 路由现在拒绝 `Content-Length > 10MB` 的请求（返回 413）

#### v3.3.3 追加改进

#### 确认对话框与无障碍
- **确认对话框替换** — `api-key-table.tsx` 和 `token-plan/page.tsx` 中的原生 `confirm()` 替换为 UI Dialog 组件
- **aria-label 无障碍** — 为所有仅图标的交互按钮添加 `aria-label`（7 个文件，15 处）

#### 智能渠道选择
- **延迟感知负载均衡** — 渠道选择现在基于近期平均延迟动态调整权重，低延迟渠道优先

#### 订阅自动续费
- **自动续费逻辑** — `processAutoRenewals()` 函数自动续费到期订阅（余额充足时扣费并重置周期）
- **维护端点** — `POST /api/dashboard/maintenance` 支持 `action=auto_renew` 手动触发续费

#### Webhook 支持
- **Webhook 表** — 新增 `webhooks` 表存储 URL、密钥和事件订阅
- **Webhook API** — `GET/POST/PATCH/DELETE /api/dashboard/webhooks` 管理 webhook
- **Webhook 分发** — `dispatchWebhook()` 在关键事件后异步发送 HMAC 签名的 POST 请求

#### 优雅降级
- **503 + Retry-After** — 所有渠道失败时返回 503 状态码和 `Retry-After: 5` 头
- **错误头转发** — 网关响应头（如 `Retry-After`）现在正确传递到客户端

#### OpenAPI 规范补全
- **新增端点文档** — 添加 `/v1/messages`、`/v1/billing/redeem`、`/api/dashboard/models`、`/api/dashboard/users`、`/api/dashboard/audit`、`/api/dashboard/webhooks`、`/api/health`、`/api/plans` 的 OpenAPI 定义

#### 会话管理
- **会话追踪** — 登录创建会话记录，最多 10 个并发会话/用户
- **登出清理** — `DELETE /api/auth/me` 删除当前会话

#### 数据库备份与维护
- **备份端点** — `GET /api/dashboard/backup` 使用 `VACUUM INTO` 生成 SQLite 一致备份
- **维护端点** — `POST /api/dashboard/maintenance` 支持日志清理和 VACUUM

#### 模型别名与弃用
- **模型别名** — `model_rates` 表支持 `alias_for` 字段，请求自动路由到别名目标
- **弃用警告** — 弃用模型在响应头中返回 `X-Deprecation-Warning`

#### API Key 权限
- **权限检查** — 网关现在解析 API Key 的 `permissions` JSON，强制执行模型白名单

#### 限流持久化
- **SQLite 持久化** — 限流器使用 `rate_limit_counters` 表持久化，重启后不丢失
- **内存缓存** — 内存缓存 + 定期同步到 DB（每 5 次递增同步一次）

---

## [v3.3.2] — 2026-05-14

### 安全加固、网关故障转移、中间件鉴权与功能升级

#### 安全修复
- **Auth 验证** — completions 和 images 路由在处理请求前显式验证 API Key
- **设置访问控制** — 普通用户只能读取公开设置（currency、exchange_rate、timezone）；管理员专属 key 被过滤
- **余额竞态** — `addBalance` 使用原子 SQL（`balance = balance + ?`）防止并发充值的 TOCTOU 竞态
- **解密失败** — `decrypt()` 现在解密失败时抛出异常，而非静默返回密文
- **错误消息脱敏** — 兑换路由不再向客户端泄露内部错误详情

#### 网关改进
- **渠道故障转移重试** — 网关遇到 5xx 上游错误时自动重试最多 3 个渠道
- **流式健康上报** — `reportChannelSuccess` 延迟到流完成时调用，而非流开始
- **JSON 解析错误处理** — 非 JSON 上游响应被捕获并返回 502，不再崩溃
- **工具调用透传** — `tools`、`tool_choice`、`functions`、`function_call` 等 OpenAI 参数现在正确转发到上游
- **跨天倍率修复** — 时间倍率现在正确处理跨天范围（如 22:00-06:00）
- **限流器修复** — 被拒绝的请求不再递增计数器（先检查后递增）

#### 新功能
- **X-Request-Id** — 中间件为每个请求生成唯一 ID，添加到响应头用于链路追踪
- **仪表盘鉴权中间件** — `/dashboard/*` 路由现在受中间件保护；未认证用户重定向到登录页
- **OpenAPI 3.0 规范** — `GET /api/v1/openapi` 返回所有端点的完整 API 规范
- **模型排序** — 模型市场新增排序下拉框（名称 A-Z/Z-A、输入价格、补全价格）
- **动态首页统计** — 平台统计（总调用量、可用率、延迟、模型数）现在从 `/api/stats` 获取真实数据

#### 代码质量
- **estimateTokens 去重** — 从 3 个文件中移除重复函数，从 `api-gateway.ts` 导出
- **React 反模式修复** — `api-key-table.tsx` 将 `useState` 初始化器改为 `useEffect`
- **alert() → toast** — 用户管理和兑换页面的所有 `alert()` 调用替换为 toast 通知
- **Profile 输入验证** — 用户名（2-50 字符）、头像（最大 1MB）、简介（最大 500 字符）的 PATCH 验证
- **API Key 边界** — `rate_limit` 创建/更新时限制在 1-10000
- **倍率 try/catch** — POST/DELETE 处理器包裹 try/catch 防止畸形 JSON
- **Schema 安全** — `schema.sql` 使用 `INSERT OR IGNORE` 替代 `DELETE FROM` 以保留现有数据
- **套餐去重修复** — 给 plan name 添加 UNIQUE 约束；种子代码改用 ON CONFLICT upsert 代替 DELETE+INSERT（外键约束导致 DELETE 静默失败）

#### 导航与 UI 修复
- **资源中心枢纽** — `/resources` 页面现在作为正式枢纽页，展示所有资源分区（Agent 技能、Prompt 模板、分类浏览、排行榜、标签云、提交模板）
- **导航栏链接修复** — "资源中心" 导航链接现在指向 `/resources` 枢纽页，而非直接跳转 `/skills`
- **页脚清理** — 删除页脚中的"新手指南"链接（指南页已删除）；资源分区现列出 Agent 技能、Prompt 模板、分类浏览
- **Swagger UI 修复** — 为 `/docs/api-reference` 页面添加缺失的 CSS 导入和 Tailwind preflight 重置
- **导航栏清理** — 删除重复的"管理面板"菜单项；搜索框重定向到 `/search`
- **个人中心套餐显示** — 最近调用对套餐用户显示 credits 消耗而非美元费用
- **搜索重写** — 搜索页改为搜索 AI 模型和文档，替代原来的 Agent 技能和 Prompt 模板
- **订阅 credits BUG** — 升级套餐时正确继承已消耗的 credits，不再重置为全额
- **SWR 自动刷新** — 控制台统计、调用日志、API Key、模型分析、个人中心现在每 30 秒自动刷新，切回页面也会立即刷新

---

## [v3.3.1] — 2026-05-13

### Token Plan 订阅系统、货币切换、VIP 卡片特效与数字格式修复

#### 新功能
- **Token Plan 订阅系统** — 全新 `/token-plan` 页面，展示 4 个订阅套餐（Spark/Flare/Pulse/Nova），支持月付/年付切换和 USD/CNY 货币切换
- **订阅逻辑** — 支持新订阅、升级（按剩余天数比例计费）和降级（已消耗 Credits 不能超过目标套餐上限的保护机制）
- **SubscriptionCard 组件** — 4 层主题特效（spark 蓝紫渐变、flare 绿色、pulse 橙色、nova 紫色），CSS box-shadow 发光效果 + 装饰性背景圆
- **管理员套餐管理** — `/dashboard/admin/plans` 页面，统一货币切换按钮，编辑对话框增大为 `max-w-4xl`
- **时区配置** — 系统设置新增时区选项（默认 Asia/Shanghai），管理员可在设置页配置
- **系统设置 API** — `timezone` 加入 `ALLOWED_KEYS`

#### UI 改进
- **数字格式修复** — 所有 Token 数量统一使用 `toLocaleString()` 千分位格式（如 473,600），不再使用 K/M 缩写
- **订阅仪表盘卡片** — 我的订阅中使用紧凑版 SubscriptionCard，删除并发数和 Credits 详情
- **Token Plan 页面** — 首页展示带特效的 4 张套餐卡片，根据当前订阅状态显示不同按钮（当前套餐/升级/切换/立即订阅）
- **降级保护** — 已消耗 Credits 超过目标套餐月额度时阻止降级，返回 409 错误

#### Bug 修复
- **年付切换无响应** — Token Plan 页面点击年付按钮无反应，修复 billingCycle 传递
- **编辑对话框 Credits 显示不全** — Credits 字段显示 "7000" 而非 "70000000"，增大对话框并拆分布局

---

## [v3.3.0] — 2026-05-12

### 模型分析图表、工具调用修复、个人中心重设计与 UX 改进

#### 新功能
- **ECharts 模型消耗分析** — 概览页嵌入全新模型分析模块：堆叠柱状图（按天/按小时模型 **Token 用量**）、饼状图（调用分布）、折线趋势图（调用次数）。所有图表按模型分配颜色，保持一致
- **独立模型市场** — 模型市场从 `/dashboard/models` 移至 `/models` 作为独立页面（无侧边栏）。顶部导航栏更新为：首页 → 控制台 → 模型市场 → 文档 → 资源中心
- **文档页面重写** — `/docs` 页面完全重写：快速开始（3 步 + Base URL 配置）、AI 应用集成（ChatBox、Cherry Studio、Open WebUI 等）、SDK 集成、cURL 示例、流式响应、API 端点、计费说明、错误码
- **个人中心重设计** — 重写个人中心页面：概览标签页（余额、总调用、总 Token、总花费统计卡片 + 控制台快捷链接 + 最近调用表格）和设置标签页（资料编辑、主题偏好）
- **Anthropic Messages API** — 新增 `/api/v1/messages` 端点，支持 Anthropic 原生格式，实现 OpenAI 与 Anthropic 格式间的 tool_use/tool_result 完整转换
- **倍率规则** — 新增 `/api/dashboard/multiplier` 端点，支持按模型和按时段的定价倍率

#### 关键 Bug 修复
- **工具调用透传** — 修复网关未转发 `tools`、`tool_choice`、`functions`、`function_call`、`response_format`、`stop`、`seed`、`presence_penalty`、`frequency_penalty` 到上游服务商的问题。此前模型会输出原始 `<tool_code>` 文本而非正确的工具调用
- **时间戳时区修复** — SQLite 通过 `CURRENT_TIMESTAMP` 存储 UTC 时间，但前端直接显示未做时区转换。所有 `new Date(timestamp)` 调用现在追加 `"Z"` 后缀，让 JavaScript 正确识别 UTC 并转换为用户本地时区
- **模型价格编辑 Bug** — 模型市场编辑表单显示人民币值但标签为美元，保存时将人民币价格当作美元存储。已修复为在显示和保存时正确进行货币转换

#### UI 改进
- **控制台布局加宽** — 控制台和模型市场页面从 `max-w-7xl` 改为 `max-w-[1600px]`，大屏体验更佳
- **OortAPI 页脚** — 替换旧版"AI Skills Hub"页脚为 OortAPI 品牌页脚：产品、功能、资源、社区四个板块，支持平台列表（OpenAI、Anthropic、Google、DeepSeek、Qwen）
- **资源中心更新** — 从 2 张卡片（Prompt 模板 + Agent 技能）更新为 3 张（Agent 技能 + Prompt 模板 + API 文档）
- **用量页货币展示** — 费用列和费用明细跟随货币设置（USD/CNY），不再硬编码 `$`

#### 分析图表交互
- **时间维度重构** — "按天"模式：7/14/30 按钮控制 X 轴日期范围。"按小时"模式：X 轴固定显示 24 小时刻度（00:00~23:00），范围按钮自动隐藏
- **完整 X 轴刻度** — 即使某天/某小时无调用数据，X 轴也显示该时刻，确保所选范围始终完整呈现
- **按钮高亮修复** — 选中的范围和粒度按钮使用 `bg-primary text-primary-foreground` 明确高亮
- **Y 轴单位标签** — 柱状图 Y 轴显示"tokens"单位，趋势图显示"次"单位（此前两者展示相同指标）
- **环形图修复** — 图例移至底部水平排列，添加引线，消除标签重叠

#### 导航重构
- **顶部导航栏** — 新顺序：首页、控制台、模型市场（→ /models）、文档、资源中心
- **控制台侧边栏** — 模型市场移出侧边栏（改为顶级页面）。侧边栏保留：概览、API Keys、用量分析、账单中心、渠道管理、用户管理、兑换码、设置
- **旧路由重定向** — `/dashboard/models` 自动重定向至 `/models`

#### Bug 修复
- **crypto.randomUUID** — 替换为 `Math.random()` + `Date.now()`，修复局域网 HTTP 访问时的兼容性问题

#### 文档
- **文档页面** — 结构化分节：快速开始、认证、SDK 集成、API 端点、流式响应、计费、错误码
- **README / README_CN** — 更新项目结构（模型市场在 `/models`）、控制台描述，新增 Anthropic Messages API 和倍率规则说明
- **CHANGELOG / CHANGELOG_CN** — 新增 v3.3.0 条目

---

## [v3.2.0] — 2026-05-12

### UI 重新设计、安全加固与计费增强

#### 新功能
- **Recharts 用量图表** — 用真实交互式图表替换纯 CSS 条形图（柱状图显示调用次数 + 折线图显示花费趋势）
- **缓存创建定价** — model_rates 表新增 `cache_creation_rate`，支持缓存写入操作的独立定价（之前硬编码为 1.25x input_rate）。模型 API 完整 CRUD 支持
- **货币切换 (USD/CNY)** — 用户可在模型市场、用量、账单页面切换美元 ($) 和人民币 (¥)。汇率由管理员通过系统设置配置（默认 7.3）。用户偏好存入 localStorage
- **系统设置 API** — 新增 `GET/PATCH /api/dashboard/settings` 端点，管理员管理全局设置（currency、exchange_rate 等）
- **管理员重置密码** — 管理员可在用户管理页面为任意用户重置密码，生成安全的 12 位随机密码，仅显示一次，支持一键复制
- **渠道 API Key 加密** — 所有渠道 API Key 使用 AES-256-GCM 加密存储。旧版明文 Key 透明解密，向后兼容。控制台显示掩码 Key（前 10 位 + "..."）

#### 模型市场重新设计
- **卡片网格布局** — 用响应式卡片网格（1-3 列）替换表格列表，支持供应商筛选按钮和搜索
- **四价展示** — 每张模型卡片显示：输入、补全、缓存读取、缓存创建价格
- **货币切换** — 直接在模型市场页面切换 USD/CNY
- **侧边栏重排** — 模型市场移至第 2 位（概览 → 模型市场 → API Keys → 用量 → ...）

#### 渠道健康监控
- **健康 API** — `GET /api/dashboard/channels?action=health` 返回各渠道 24 小时统计：成功率、平均延迟、调用次数
- **内联健康指标** — 渠道卡片显示 24h 成功率（颜色编码：绿色 ≥95%、黄色 ≥80%、红色 <80%）、平均延迟和调用次数

#### Bug 修复
- **用量日志缓存列** — 修复 `/api/v1/billing/usage` SELECT 缺少 `tokens_in_cache` 和 `tokens_cache_creation`，导致控制台表格显示 "-"

#### 数据库
- **新列** `model_rates.cache_creation_rate` — REAL DEFAULT 0（安全迁移）
- **新设置** `system_settings`：`currency`（默认 USD）、`exchange_rate`（默认 7.3）

#### 安全
- **AES-256-GCM 加密** — 渠道 API Key 使用 `ENCRYPTION_KEY` 环境变量派生密钥加密。旧版明文 Key 优雅回退
- **API Key 显示掩码** — GET /api/dashboard/channels 返回掩码 Key（前 10 位）而非完整加密值

---

## [v3.1.0] — 2026-05-11

### 管理员与计费增强

#### 新功能
- **用户管理** (`/dashboard/users`) — 管理员专属页面：列表、搜索、筛选用户；编辑角色（user/admin）；充值/扣费；启用/禁用用户；级联删除用户及关联数据
- **兑换码系统** — 管理员批量生成兑换码（`RC-XXXXXXXX`），用户在账单页兑换即可即时到账。支持最大使用次数、过期时间、启用/禁用切换
- **模型市场** (`/dashboard/models`) — 管理员定价管理，按模型设置输入/输出/缓存费率；从渠道一键同步模型
- **API 文档** (`/docs`) — Swagger UI 交互式文档，包含完整 OpenAPI 3.0 规范（18+ 端点）

#### 流式响应与 Token 追踪
- **缓存 Token 追踪** — 用量日志和计费中分别追踪 `cached_tokens` 和 `cache_creation_input_tokens`（三级定价：普通输入、缓存命中 cache_rate、缓存写入 1.25x input_rate）
- **流式 Token 计数** — 解析 SSE 分块，从上游 `stream_options.include_usage` 获取准确的输入/输出/缓存 Token 数
- **用量页面缓存列** — 用量日志表格新增"缓存命中"和"缓存创建"列

#### 渠道管理（Phase 1）
- **内联编辑** — 编辑渠道名称、类型、API Key、base_url、权重、优先级、模型列表
- **连接测试** — 对上游执行 `GET /v1/models` 测试，返回成功/失败 + 延迟
- **模型映射** — 键值对 UI 配置请求模型名到上游模型名的映射
- **同步模型** — 一键将渠道模型同步到 model_rates 表
- **删除确认** — 删除前弹出确认对话框，防止误删
- **限流状态** — 上游返回 429 时设为 `rate_limited` 而非 `offline`

#### 安全
- **JWT Secret 强制检查** — 生产环境使用默认密钥时直接抛出错误
- **Anthropic 认证修复** — 使用正确的 `x-api-key` + `anthropic-version` 请求头；路由到 `/v1/messages` 端点
- **移除不安全密码重置** — 删除 `/api/auth/reset-password`（无需认证即可重置任意用户密码）。用户必须登录后通过设置页修改密码
- **移除旧版 Admin** — 删除 `/admin` 页面（基于 localStorage，来自 AI Skills Hub 时代）。所有管理功能已迁移至 `/dashboard` 并启用角色控制

#### 数据库
- **新表** `redeem_codes` — code、amount、enabled、max_uses、current_uses、created_by、expires_at
- **新列** `users.enabled` — INTEGER DEFAULT 1（安全迁移）

#### OpenAPI 规范
- **新增端点**：`/api/dashboard/users`、`/api/dashboard/redeem`、`/api/v1/billing/redeem`、`/api/dashboard/models`
- **更新 Schema**：UsageLog 包含 `tokens_in_cache` 和 `tokens_cache_creation`；Channel 包含 `rate_limited` 状态

#### API 路由（22 个端点）
- 新增：`GET/PATCH/DELETE /api/dashboard/users`、`GET/POST/PATCH/DELETE /api/dashboard/redeem`、`POST /api/v1/billing/redeem`、`GET/POST/PATCH/DELETE /api/dashboard/models`
- 移除：`POST /api/auth/reset-password`

---

## [v3.0.0] — 2026-05-11

### 战略转型：AI API 中转站平台

**OortAPI**（原 AI Skills Hub）现已升级为全栈 AI API 中转平台。资源聚合功能（技能、模板、分类）保留在 `/resources/` 路径下。

#### 后端（全新）
- **SQLite 数据库** — 使用 `better-sqlite3`，7 张表：users、api_keys、channels、model_rates、usage_logs、billing_records、system_settings
- **JWT 认证** — 服务端认证 + httpOnly cookie，PBKDF2 密码哈希（替代 localStorage 认证）
- **统一 API 网关** — OpenAI 兼容接口，路径 `/api/v1/`：
  - `POST /api/v1/chat/completions` — 聊天补全，支持流式响应
  - `POST /api/v1/completions` — 文本补全
  - `POST /api/v1/images/generations` — 图像生成
  - `POST /api/v1/embeddings` — 文本嵌入
  - `GET /api/v1/models` — 可用模型及定价
  - `GET /api/v1/billing/balance` — 查询余额
  - `GET /api/v1/billing/usage` — 用量历史（分页）
- **智能渠道路由** — 加权随机选择 + 自动故障切换（连续失败 3 次 → 5 分钟冷却）
- **按量计费** — 按模型费率计费，预付费余额系统，每次调用后自动扣费
- **速率限制** — 内存滑动窗口（默认 60 次/分钟/API Key）
- **API Key 管理** — `sk-oort-` 前缀，支持独立速率限制和权限配置

#### 控制台（全新）
- **概览** (`/dashboard`) — 今日统计（调用数、成功率、花费、延迟）、月度汇总、7 天用量趋势图、热门模型
- **API 密钥** (`/dashboard/keys`) — 创建、启用/禁用、删除 API Key，一键复制
- **用量分析** (`/dashboard/usage`) — 详细用量数据，分页展示
- **账单** (`/dashboard/billing`) — 余额展示和账单历史
- **渠道管理** (`/dashboard/channels`) — 仅管理员可用，渠道增删改查 + 连接测试
- **设置** (`/dashboard/settings`) — 个人资料编辑和密码修改

#### API 路由（16 个端点）
- 认证：`/api/auth/login`、`/api/auth/register`、`/api/auth/me`、`/api/auth/profile`、`/api/auth/reset-password`、`/api/auth/change-password`
- 控制台：`/api/dashboard/stats`、`/api/dashboard/keys`（CRUD）、`/api/dashboard/channels`（CRUD）
- API v1：`/api/v1/chat/completions`、`/api/v1/completions`、`/api/v1/images/generations`、`/api/v1/embeddings`、`/api/v1/models`、`/api/v1/billing/balance`、`/api/v1/billing/usage`

#### 首页重构
- 全新 Hero 区域，聚焦 API 中转站核心价值
- 核心功能卡片（统一接口、智能路由、精细计费、安全管控）
- AI 服务商 Logo 墙（OpenAI、Anthropic、Google、Meta、DeepSeek 等）
- 平台实时数据展示
- 资源中心入口（降为辅助定位）

#### 基础设施
- **项目改名** — ai-skills-hub → OortAPI，版本号 3.0.0
- **数据库** — SQLite + better-sqlite3，延迟初始化 Proxy 模式
- **认证迁移** — localStorage → JWT + httpOnly cookie
- **密码哈希** — SHA-256 → PBKDF2
- **资源迁移** — 现有页面移至 `/resources/` 前缀
- **国际化** — 新增 `dashboard`、`apiDocs`、`resources` 翻译区块（约 130 个新键）
- **依赖** — 新增 better-sqlite3、nanoid、zod、recharts

---

## [v2.8.1] — 2026-05-11

### 功能：导航栏头像下拉菜单

- **头像下拉菜单** — 将直接链接替换为下拉菜单，包含：用户中心、设置、管理面板（仅管理员）、退出登录
- **键盘导航** — ArrowUp/Down/Escape 支持，`role="menu"` 和 `role="menuitem"` 无障碍属性
- **外部点击关闭** — 点击菜单外部自动关闭
- **视觉指示器** — 头像旁 ChevronDown 箭头在展开时旋转
- **i18n** — 使用现有键（`t.common.profile`、`t.profile.settings`、`t.admin.title`、`t.common.logout`）

---

## [v2.8.0] — 2026-05-10

### 全站审计 — 30 项 Bug 修复

#### 严重问题（4 项）
- **submit/status 缺少 Suspense** — `useSearchParams()` 组件未包裹 `<Suspense>`，生产环境运行时报错
- **prompt-versions.ts SSR 崩溃** — `localStorage` 在无 SSR 守卫的服务端渲染中抛出异常
- **use-notifications.ts 闭包过期** — `markAsRead`/`markAllRead`/`clearAll`/`addNotification` 捕获过期 `user` 引用，登出后调用会抛异常；改用 `userEmailRef`
- **use-follows.ts 持久化竞态** — `skipPersistRef` 在 persist effect 运行前就被重置为 false，导致中间状态被写入 localStorage；改用 `requestAnimationFrame` 延迟重置

#### 内存泄漏与资源清理（3 项）
- **头像裁剪 Object URL 泄漏** — `URL.createObjectURL()` 创建后从未 `revokeObjectURL`，每次裁剪泄漏内存
- **GitHub 导入超时泄漏** — 1500ms `setTimeout` 未清理，关闭对话框后仍触发状态更新；添加 `useRef` + `useEffect` cleanup
- **Lightbox setTimeout 未清理** — 焦点设置的 `setTimeout` 在快速切换截图时可能聚焦错误元素

#### 数据完整性（4 项）
- **评论删除 activity 不匹配** — 创建 activity 时使用 `crypto.randomUUID()` 作为 `id`，删除时用 `commentId` 匹配 `a.id` 永远不匹配；添加 `commentId` 字段
- **settings-tab 清除数据不完整** — `handleClearData` 漏掉了 `likes`、`bookmarks`、`submissions`、`comments`、`activity` 等用户级键
- **Date.now() ID 碰撞** — 4 个文件使用 `Date.now()` 生成 ID，改为 `crypto.randomUUID()`：`create-from-github.tsx`、`create-from-upload-prompt.tsx`、`skills/[id]/client.tsx`、`prompts/[id]/client.tsx`
- **剪贴板 API 无错误处理** — `navigator.clipboard.writeText()` 未 await/catch，失败时仍显示"已复制"；改为 `.then().catch()`

#### 水合不匹配（3 项）
- **tags/loading.tsx `Math.random()`** — 骨架屏宽度在 SSR 和客户端不同，改为确定性计算 `40 + ((i * 17) % 60)``
- **theme-context.tsx 初始状态** — `useState` 初始化器读取 localStorage，在客户端产生与 SSR 不同的初始值
- **use-user-local-storage.ts SSR 崩溃** — `crypto.randomUUID()` 在 SSR 中可能不可用；添加 `typeof window === "undefined"` 守卫
- **use-user-storage.ts 访客键不匹配** — SSR 返回 `"ssr-guest"`，客户端返回真实 UUID，导致水合不匹配；添加 SSR 守卫

#### 无障碍（6 项）
- **notification-tab.tsx div 无键盘支持** — 通知项使用 `<div onClick>` 但无 `role="button"`、`tabIndex`、`onKeyDown`
- **notification-bell.tsx 按钮无 aria-label** — `markAllRead` 和 `clearAll` 按钮只有 `title`，改为 `aria-label`
- **admin 删除按钮无 aria-label** — 评论删除按钮仅有图标，屏幕阅读器无法识别
- **command-palette.tsx Ctrl+K 拦截输入框** — 全局快捷键不检查 `e.target`，在输入框中按 Ctrl+K 也会打开命令面板
- **comment-section 删除确认无 aria-live** — 删除确认 UI 未设置 `role="alert"` 和 `aria-live="polite"`
- **notification-bell handleKeyDown 闭包过期** — `handleNotificationClick` 未包含在 `useCallback` 依赖中

#### 样式与 UI（2 项）
- **tag-chip.tsx `inline-block` + `flex` 冲突** — `flex` 覆盖 `inline-block`，改为 `inline-flex`
- **markdown-renderer.tsx sanitize 不一致** — 服务端用正则、客户端用 DOMPurify，产生不同输出；统一为纯正则实现，移除 DOMPurify 依赖

#### useEffect 依赖（4 项）
- **my-comments-tab.tsx** — `useEffect` 依赖 `user` 对象（每次渲染新引用），改为 `user?.email`
- **activity-timeline.tsx** — 同上
- **usage-history-tab.tsx** — 同上
- **stats-dashboard.tsx** — 同上

#### 死代码清理（2 项）
- **use-keyboard-shortcuts.ts** — 空文件，无导出，已删除
- **theme-context.tsx `isInitialRef`** — 设置后从未读取，已移除

#### 硬编码字符串（2 项）
- **notification-tab.tsx "unread"** — 硬编码英文，改为 locale 感知显示
- **theme-context.tsx 初始化** — 移除无用的 `isInitialRef` 赋值

---

## [v2.7.1] — 2026-05-10

### Agent 技能清理
- **移除 21 个非技能条目** — LangChain、CrewAI、FastAPI 等不包含 SKILL.md 的条目已从技能市场移除（29→8 个）
- **添加 SKILL.md** — 为所有 8 个剩余技能的 files 对象添加 SKILL.md 文件，明确技能触发条件和功能描述
- **修复 mock-agent-skills.ts** — 清除编辑残留的孤立代码，恢复文件有效性
- **更新文档** — README/README_CN 技能数量回退为 8

---

## [v2.7.0] — 2026-05-09

### Agent 技能市场（21 个新技能）
- **21 个真实开源技能** 新增（8→29 个），全部 MIT/Apache-2.0 许可证：
  - **AI 框架**：LangChain、CrewAI、LlamaIndex、Semantic Kernel、Pydantic AI、Guidance、Haystack、Letta
  - **数据工具**：Vanna、Plotly Dash、Chroma、Qdrant
  - **ML 工具**：HuggingFace Transformers、Mem0、Gradio、Streamlit
  - **研究工具**：GPT Researcher、Jina Reader
  - **Web 框架**：FastAPI、Screenshot-to-Code
  - **开发工具**：Aider
- 每个技能包含：完整 README、文件模板、安装命令、演示输入/输出、标签、许可证信息
- 分类：研究、数据分析、生产力、Web 开发、DevOps、设计、内容创作
- 合集：AI 框架、数据工具、研究工具、ML 工具、ML 模型、Web 框架、AI 基础设施、企业 SDK、开发工具、内容工具

### Hooks 可靠性（4 项修复）
- **useUserLocalStorage SSR 修复** — `crypto.randomUUID()` 延迟初始化避免 SSR 崩溃
- **useCollections 持久化修复** — localStorage 写入从 setState 更新器移至 `useEffect` 监听器
- **useFollows 持久化修复** — 同一模式 + `skipPersistRef` 跨标签页同步保护
- **useUserLocalStorage 反序列化** — 包裹在 `useRef` 中，从 useEffect 依赖中移除

### Hooks 规则（2 项修复）
- **prompts/[id] hooks 顺序** — 所有 hooks 移至 `if (!skill) return` 早返回之前
- **skills/[id] hooks 顺序** — 同一修复，另将假的 mockVersions 回退替换为"暂无版本历史"

### 用户体验（5 项修复）
- **404 页真实 ID** — 用 mock 数据中的真实 ID 替换了损坏的 POPULAR_SKILLS/PROMPTS
- **CommentSection replyMap** — `useMemo` Map 替代三次 filter，O(1) 回复查找
- **CommentSection locale 冒号** — `：` → 通过 `locale.startsWith("zh")` 实现 locale 感知
- **SkillCard React.memo** — 使用 `React.memo()` 包裹提升网格渲染性能
- **AgentSkillCard React.memo** — 同样的优化

### 性能（4 项修复）
- **SkillCard 记忆化** — `React.memo()` 防止网格中不必要的重渲染
- **AgentSkillCard 记忆化** — 同样的优化
- **CommentSection replyMap** — 通过 `useMemo` 预计算 `Map<parentId, Comment[]>`
- **FeaturedSection tabIndex** — 两个 tabpanel div 现在可聚焦支持键盘用户

### 无障碍（6 项修复）
- **Lightbox 焦点陷阱** — 通过 close/prev/next 按钮 ref 实现正确的循环焦点
- **CopyButton 超时清理** — useRef + useEffect cleanup 防止内存泄漏
- **SettingsTab 清除数据** — 同时清除 notificationPrefs、follows、collections、notifications
- **SettingsTab focus-visible** — 通知切换开关添加焦点环
- **Navbar aria-current** — 活动导航链接标记 `aria-current="page"`
- **Navbar 主题图标** — 纯 CSS `dark:block`/`dark:hidden` 替代 JS 三元（避免水合不匹配）

### 国际化（2 项修复）
- **formatRelativeTime locale** — 接受 `locale` 参数，使用 `Intl.RelativeTimeFormat`
- **AgentSkillCard locale** — 从 `useLocale()` 传入 `locale` 到 `formatRelativeTime`

### 基础设施
- **template.tsx 已删除** — `"use client"` 导致首次导航 1-2 秒黑屏；完全移除
- **proxy.ts 重命名** — `middleware.ts` → `proxy.ts`，符合 Next.js 16 规范
- **layout.tsx 滚动** — `<html>` 上使用 `data-scroll-behavior="smooth"` 替代 CSS 属性
- **categories 映射提取** — `categoryToAgentCategorySlugs` 移至 `src/lib/categories.ts`
- **users/[username] siteUrl** — 硬编码 URL 替换为 `getSiteUrl()`

---

## [v2.6.0] — 2026-05-09

### 安全
- **明文密码回退移除** — 认证仅使用哈希比对；移除迁移前账户的明文密码回退
- **安全响应头** — `next.config.ts` 添加 X-Frame-Options、X-Content-Type-Options、Referrer-Policy
- **中间件路由保护** — 新建 `src/middleware.ts`，为 admin/profile 路由设置 cache-control 头
- **开放重定向修复（增强）** — 登录和注册页面通过 `safeReturnUrl()` 验证 `returnUrl`，防止通过查询参数中的 `://` 进行开放重定向
- **Admin 变量遮蔽修复（增强）** — `.map((t)=>` 重命名为 `.map((tabItem)=>`，避免遮蔽 i18n 函数 `t`
- **Admin localStorage 错误反馈（增强）** — localStorage 加载失败显示错误横幅，不再静默吞掉

### 无障碍（22 项修复）
- **安装命令键盘支持** — `role="button"`、`tabIndex`、`onKeyDown` 支持 Enter/Space 激活
- **移动端文件标签 ARIA** — `role="tab"`、`aria-selected`、活动视觉指示器
- **变量输入标签关联** — 标签和输入框通过 `htmlFor` + `id` 关联
- **版本历史展开状态** — 版本历史按钮添加 `aria-expanded`
- **标签搜索输入** — `role="searchbox"` + `aria-label`
- **指南复制按钮焦点** — 触摸设备键盘焦点时可见 `focus:opacity-100`
- **搜索清除按钮** — 正确的 `aria-label`
- **StarRating 键盘导航** — ArrowLeft/ArrowRight 导航、focus-visible 环、hover 缩放
- **CollectionPicker 无障碍** — 外部点击关闭、Escape 键、Input 组件
- **灯箱改进** — 44px 触摸目标、页面滚动锁定、i18n 标签通过 props 传入
- **SettingsTab 标签关联** — label 添加 `htmlFor`、主题按钮添加 `aria-pressed`
- **CreateFromUpload 无障碍** — 图标选择器 `aria-label`、公开/私有 `role="radiogroup"`/`role="radio"`
- **导航栏搜索** — `<form role="search">` 包裹、头像 `role="img"`
- **Hero 地标** — Hero 地标添加 `aria-labelledby`
- **Footer 禁用链接** — 禁用链接显示可见的"(即将推出)"文本
- **AgentSkillCard 按钮** — 从 `<div role="button">` 改为语义化 `<button>`
- **CreateDropdown 触摸修复** — 移除 `onMouseEnter` 处理器（触摸设备不兼容）
- **NotificationBell 自动关闭** — 路由切换时自动关闭下拉框
- **ScrollToTop 动画** — `translate-y` 滑入动画

### 国际化（15 项修复）
- **ErrorFallback 完整 i18n** — 所有错误文本使用 `t.error.*` 键
- **NotificationTab i18n** — 筛选标签、带 locale 参数的 timeAgo、空状态
- **MySubmissionsTab 删除确认** — i18n 确认对话框
- **CommentSection Markdown 提示** — i18n 提示文本，移除 `setTick` 反模式
- **Lightbox i18n 标签** — 标签通过 props 传入实现完整本地化
- **Categories slug "查看全部"** — "查看全部" 字符串 i18n
- **Admin 回退字符串** — 始终使用 i18n 替代硬编码回退值
- **技能详情版本更新日志** — 版本更新日志文本 i18n
- **中文冒号修复** — 技能开发者标签 `：` → `: `
- **中文括号修复** — prompts 和 tags 页面 `（）` → `()`
- **Agent 技能分类 i18n** — 添加 `nameI18nKey`/`descI18nKey` 字段
- **tFormat 优化** — `new RegExp()` 替换为 `replaceAll()`，开发模式下对未解析变量发出警告
- **新增 i18n 键** — 17+ 新键，包括 `clearSearch`、`viewAllItems`、`comingSoon`、`notFound`、`backToList`、`skillNotFound`、`promptNotFound`、`markdownHint`、`notificationFilters.*`、`currentVersion`、`initialRelease`、`deleteSubmissionConfirm`

### 用户体验（20 项修复）
- **技能/模板未找到消息** — 双语消息 + 返回链接替代 `return null`
- **对比页错误具体化** — 显示具体缺失的技能 ID
- **安装命令主题感知颜色** — `bg-zinc-900 dark:bg-zinc-950`
- **移动端文件标签活动指示器** — 活动标签下划线指示器
- **提交成功链接** — 链接到 `/submit/status`
- **NotificationBell 自动关闭** — 路由切换时关闭下拉框
- **SkillCard formatNumber** — 使用次数使用 `formatNumber()` 格式化大数字
- **AgentSkillCard 相对时间** — 显示相对时间（如"3 个月前"）
- **FeaturedSection 条件渲染** — 条件渲染替代 `hidden` 类（非活动标签 DOM 减半）
- **CommandPalette useMemo** — 命令项记忆化
- **Profile 标签 localStorage** — 移至 `useEffect`+`useState`（render 中无同步 I/O）
- **StatsDashboard 过渡动画** — 数值变化时动画过渡
- **MarkdownRenderer 引用块 + 链接** — 引用块支持、链接 `[text](url)` 渲染
- **骨架屏确定性宽度** — 不使用 `Math.random()`（避免水合不匹配）
- **404 页包体积缩减** — 内联数组替代 mock 导入
- **排行页悬停优化** — 悬停项添加 `will-change-transform`
- **Profile 缓存保护** — 通过中间件设置 `Cache-Control: no-store`
- **useCopyToClipboard 清理** — 组件卸载时清理超时
- **useLocalStorage initialValue** — 包裹在 `useRef` 中防止重复订阅
- **useNotifications 闭包修复** — `userEmailRef` 避免回调中的过期闭包

### Hooks（8 项修复）
- **useCopyToClipboard 超时清理** — 组件卸载时清除计时器
- **useLocalStorage useRef** — `initialValue` 包裹在 `useRef` 中避免重复订阅
- **useUserLocalStorage 改进** — 每会话访客 ID（无冲突）、`set()` 返回布尔值
- **useCollections loaded 状态** — 添加 `loaded` 状态追踪初始化
- **useFollows 跨标签页同步** — 通过 `storage` 事件跨浏览器标签页同步
- **useNotifications 闭包修复** — `userEmailRef` 避免回调中的过期闭包

### 性能
- **FeaturedSection 条件渲染** — 条件渲染非活动标签 DOM 减半
- **CommandPalette useMemo** — 命令项记忆化，加快重渲染
- **Profile 标签 localStorage** — 读取移至 `useEffect`（render 中无同步 I/O）
- **LazySyntaxHighlighter 去重** — 代码主题从 markdown-renderer 导入
- **globals.css 修复** — `::selection` 修复（十六进制兼容）、`animate-pulse` 在 reduced-motion 中

### 配置
- **依赖清理** — `@types/dompurify` 和 `shadcn` 移至 `devDependencies`
- **tsconfig 目标升级** — `ES2017` → `ES2022`
- **中间件缓存头** — `src/middleware.ts` 用于 admin/profile 路由
- **.env.example 创建** — 环境变量模板文件
- **安全响应头** — 添加到 `next.config.ts`

### SEO
- **搜索/对比页 noindex** — `/search` 和 `/skills/compare` 添加 `robots: { index: false }`
- **模板 OG 截断** — `/prompts/[id]` OG 描述截断至 160 字符
- **用户 canonical URL** — `/users/[username]` 添加 canonical URL
- **排行页 JSON-LD** — `/trending` 添加 ItemList 结构化数据
- **移除 alternates.languages** — 此前将两个 locale 映射到同一 URL

---

## [v2.5.1] — 2026-05-09

### 安全
- **开放重定向修复** — 登录和注册页面现在清理 `returnUrl`，防止通过查询参数中的 `://` 进行开放重定向
- **Admin 变量遮蔽** — 将 `.map((t) => ...)` 重命名为 `.map((tabItem) => ...)`，避免遮蔽 i18n 函数 `t`
- **Admin 错误反馈** — localStorage 加载失败现在显示错误消息，不再静默吞掉

### 无障碍
- **安装命令键盘支持** — 技能详情页安装命令区域现在支持 Enter/Space 键激活，添加 `role="button"`、`tabIndex` 和 `onKeyDown`
- **移动端文件标签 ARIA** — 技能详情页移动端文件标签现在使用 `role="tab"`、`aria-selected`，带活动指示器样式
- **变量标签关联** — 模板详情页变量输入现在通过 `htmlFor`/`id` 关联标签和输入框
- **版本历史展开状态** — 模板详情页版本历史按钮现在有 `aria-expanded` 属性
- **标签搜索输入** — 标签页搜索输入添加 `role="searchbox"` 和 `aria-label`
- **指南复制按钮焦点** — 指南页复制按钮现在在键盘焦点时可见（`focus:opacity-100`）

### 国际化
- **中文冒号修复（技能）** — 技能详情页开发者标签的 `：` 改为 `: `
- **中文括号修复（模板）** — 模板详情页模型标题的 `（）` 改为 `()`
- **中文括号修复（标签）** — 标签详情页加载更多按钮的 `（）` 改为 `()`

### 用户体验
- **未找到消息** — 技能和模板详情页现在显示双语"未找到"消息，而非返回 null
- **硬编码颜色移除** — 安装命令背景从 `bg-[#0d1117]` 改为 `bg-zinc-900 dark:bg-zinc-950`，支持主题切换
- **对比错误具体化** — 技能对比页现在显示具体缺失的技能 ID，而非泛泛的错误消息
- **提交状态链接** — 提交成功页现在包含指向 `/submit/status` 的链接

### SEO
- **搜索页 noindex** — 添加 `robots: { index: false }` 防止搜索结果页被索引
- **对比页 noindex** — 添加 `robots: { index: false }` 防止对比页被索引
- **模板 OG 描述截断** — 模板详情页 OG 描述现在限制在 160 字符以内
- **用户页 canonical URL** — 用户主页现在通过 `alternates` 包含 canonical URL
- **排行页 JSON-LD** — 排行页现在包含 ItemList 结构化数据，支持富搜索结果

### 性能
- **骨架屏确定性宽度** — 加载骨架屏现在使用确定性宽度，而非 `Math.random()`，避免水合不匹配
- **404 页包体积** — 用内联数组替代 `mock-data` 和 `mock-agent-skills` 导入，减小包体积
- **排行页悬停优化** — 排行列表项添加 `will-change-transform`，优化悬停动画流畅度

### Bug 修复
- **agent-skill-card 闭合标签** — 修复了 `</div>` 应为 `</button>` 的闭合标签不匹配问题
- **错误页 backHref 移除** — 所有 error.tsx 文件不再传递不存在的 `backHref` 属性给 `<ErrorFallback>`

---

## [v2.5.0] — 2026-05-09

### 新功能
- **最近浏览区** — 个人中心活动时间线新增"最近浏览"模块，展示最近 10 个浏览过的技能/模板
- **"最多点赞"排序** — 模板列表新增按点赞数排序选项
- **Toast 自动消失** — Toast 通知自动消失（成功/信息 3 秒，错误 5 秒），追踪超时 ID，卸载时清理
- **Toast 入场动画** — Toast 项添加 fade-in + slide-up 入场动画
- **i18n 插值工具 (tFormat)** — 新增 `tFormat(key, {count: 5})` 占位符替换辅助函数
- **共享 ErrorFallback 组件** — 10 个 error.tsx 文件统一使用一个可复用 `<ErrorFallback>` 组件
- **共享 CopyButton 组件** — 统一的剪贴板复制按钮，带 i18n aria-label
- **密码重置频率限制** — 重置尝试之间 60 秒冷却
- **密码重置确认步骤** — 重置流程改为邮箱 → 确认 → 新密码三步 UI
- **对比相同技能警告** — 两个对比槽位相同时显示 i18n 警告
- **管理面板删除评论对话框** — `window.confirm()` 替换为样式化 `<Dialog>` 组件
- **所有按钮加载动画** — 登录、注册、提交按钮显示 `<Loader2>` 旋转器替代 "..."
- **useUserLocalStorage Hook** — 新通用 Hook，合并用户级 localStorage 与跨标签页同步
- **Viewport 导出** — 根布局按 Next.js 16 API 导出 `viewport`（含亮/暗 themeColor）
- **暗色模式滚动条样式** — 自定义细滚动条匹配暗色主题
- **Z-index CSS 变量** — `--z-dropdown: 50`、`--z-overlay: 100`、`--z-toast: 110`、`--z-command: 120`
- **亮色模式代码高亮** — 代码块适配亮/暗主题，不再始终使用暗色背景
- **StarRating hover 预览** — 交互式星级评分鼠标悬停时显示预览

### 安全
- **密码重置身份验证** — 重置流程要求确认邮箱归属后才允许设新密码
- **Admin 检查加固** — 管理页面重定向非管理员用户；`ADMIN_EMAILS` 改为命名常量

### SEO
- **统一站点 URL** — 新建 `getSiteUrl()` 辅助函数替代 8+ 文件中的硬编码 URL
- **Viewport meta** — 添加独立 `viewport` 导出，含亮/暗 `themeColor`
- **Robots.txt 屏蔽 /admin** — 管理和 API 路由禁止爬虫
- **Sitemap 清理** — 移除需认证的 `/submit/status`
- **JSON-LD 使用环境变量** — Organization 和 WebSite 结构化数据使用 `getSiteUrl()`

### Bug 修复
- **useLocalStorage 配额错误** — `QuotaExceededError` 记录警告而非静默导致 state/localStorage 不一致
- **useLocalStorage 跨标签页删除** — 另一标签删除 key 后重置为 `initialValue`
- **useLocalStorage SSR 保护** — 添加 `typeof window !== "undefined"` 检查防止 SSR 闪现
- **useUserStorage 访客隔离** — 访客用户通过 sessionStorage 获取会话级 key，而非共享全局 key
- **useCollections 登出清空** — 登出时 collections 状态重置
- **useFollows 登出清空** — 登出时 following 状态重置
- **useNotifications 闭包修复** — `addNotification` 使用 ref 避免过期闭包
- **useNotifications 用户隔离偏好** — 通知偏好改为按用户存储
- **useFilteredList 初始值** — 不再用 `useMemo([], [])` 冻结；URL 变化时更新
- **formatDate 无效日期** — 返回原始字符串而非 "Invalid Date"
- **频率限制 key 命名空间化** — 前缀改为 `"ai-skills-hub-rate-"` 替代裸 `"rate_limit_"`
- **STORAGE_KEYS null 守卫** — 用户级 key 函数处理 null/undefined email
- **theme.ts 分类颜色回退** — 未知分类 slug 使用默认颜色而非 undefined
- **template.tsx hash 检查** — 带 hash 的路由切换不再滚到顶部
- **分类 slug 映射** — `categoryToAgentCategory` 使用 slug 匹配替代硬编码中文
- **非空断言移除** — 技能/模板详情页用 null 检查 + 提前返回替代 `!`
- **mock 文件存储键** — 使用 `STORAGE_KEYS` 替代硬编码字符串
- **i18n `<html lang>` 更新** — 语言切换更新 `document.documentElement.lang`
- **主题 SSR 不匹配修复** — 初始主题状态使用 localStorage 延迟初始化

### 无障碍
- **TagChip 触摸目标** — 增加到 44px 最小高度
- **通知"刚刚"** — < 60 秒显示本地化"刚刚"/"just now"
- **ScrollToTop 隐藏状态** — 隐藏时添加 `aria-hidden` 和 `tabIndex={-1}`
- **粒子背景 aria-hidden** — 装饰性 canvas 标记 `aria-hidden="true"`
- **Newsletter 错误 alert** — 错误消息添加 `role="alert"`
- **头像回退 aria-label** — 字母头像添加 `aria-label={username}`
- **移动端 Sheet nav aria-label** — 移动端导航添加 `aria-label`
- **Footer aria-label 修复** — 移除误导性 "Browse:" 前缀
- **分类卡片焦点样式** — 内层 div 传播 focus-visible 环
- **排行页 ARIA Tab** — 内容类型和排序按钮添加完整 Tab 语义
- **灯箱无障碍** — 添加 `role="dialog"`、`aria-modal`、焦点陷阱、Escape 关闭
- **评论用户名可链接** — 评论作者名链接到 `/users/[username]`
- **Toast aria-live 修复** — 移除单项 `role="alert"`（与容器 `aria-live="polite"` 冲突）
- **通知下拉焦点陷阱** — Tab/Shift+Tab 在下拉菜单项中循环

### 性能
- **Provider 记忆化** — 4 个 Context Provider 全部用 `useMemo` 记忆化 value
- **unreadCount 改用 useMemo** — useNotifications 中替换 `useState` + `useEffect`
- **useCommandPalette 死代码移除** — 删除未使用的 Hook
- **getCommandItems 移至 lib/commands.ts** — 从 hooks 文件分离

### UI 改进
- **Toast 使用设计令牌** — `text-red-400` → `text-destructive`，颜色适配亮/暗主题
- **Button default variant hover** — 所有按钮有 hover 反馈
- **Dialog closeLabel 属性** — 关闭按钮文本可配置
- **Testimonials 使用 StarRating** — 手动星星渲染替换为可复用组件
- **版本历史 i18n** — "Latest" 和 "by" 字符串使用 i18n 键
- **CSS ::selection 样式** — 自定义选中高亮使用主色调
- **CSS scroll-padding-top** — 锚点不再落在固定导航栏下方
- **合并 reduced-motion** — 3 个独立的 `@media (prefers-reduced-motion)` 块合并为 1 个
- **glass-card blur 一致性** — 亮暗模式统一使用 `blur(16px)`
- **错误状态 i18n 键** — `error.somethingWentWrong`、`error.tryAgain`、`error.backToHome`
- **Suspense 包裹** — 分类、排行、标签页添加 Suspense + 骨架屏

---

## [v2.4.0] — 2026-05-08

### 新功能
- **登录/注册返回 URL** — 登录或注册后自动跳转回原始页面（通过 `returnUrl` 查询参数），无参数时回退到首页
- **Tab 键盘导航** — 技能详情页 Tab 支持 ArrowLeft/Right/Home/End 键（与个人中心一致）
- **管理面板 ARIA Tab** — 管理面板 Tab 添加 `role="tablist"`、`role="tab"`、`aria-selected` 和完整键盘导航
- **提交分类 radio 语义** — 分类选择按钮添加 `role="radiogroup"` + `role="radio"` + `aria-checked` + 方向键支持
- **可复用 StarRating 组件** — 提取 `<StarRating>` 组件，支持交互和只读模式，评论区使用
- **可复用 TagChip 组件** — 统一技能卡片和 Agent 技能卡片的标签渲染
- **可复用 useCopyToClipboard Hook** — 合并剪贴板+Toast+已复制状态为单一 Hook
- **AgentSkill 难度徽章** — 8 个技能全部添加难度级别（初级/中级/高级），带颜色编码徽章
- **上传表单分类下拉** — 技能创建使用预定义分类 `<select>` 替代自由文本输入
- **收藏集视觉标识** — `UserCollection` 类型新增 `coverImage` 和 `color` 字段
- **登录会话过期** — 登录会话 30 天后自动过期清除
- **未保存更改守卫** — 设置表单跟踪修改状态，离开前警告用户

### SEO
- **分类页元数据** — 添加 `generateMetadata`，包含标题、描述、OG、Twitter 卡片和 canonical URL
- **对比页元数据** — 添加 metadata 导出，包含标题和描述
- **标签详情 OG** — 标签详情页添加 `openGraph`、`twitter` 和 `alternates.canonical`
- **分类详情 JSON-LD** — 分类详情页添加 BreadcrumbList 结构化数据
- **统一英文元数据** — 8 个中文元数据页面（登录、注册、提交、管理、标签、排行、指南等）全部改为英文标题

### Bug 修复
- **排行榜数据过期** — `allItems` 依赖数组添加 `agentSkills.length` 和 `skills.length`
- **搜索数据过期** — `allAgentSkills` 和 `allPrompts` 依赖数组添加数据长度
- **嵌套交互 ARIA** — 最近搜索项不再在 `role="option"` 内嵌套 `<button>`（改为 `role="listitem"`）
- **死代码清理** — 移除技能详情和模板详情中不可达的客户端 not-found 分支
- **Comment.editedAt 类型** — Comment 接口添加 `editedAt?: string`，移除 comment-section 中的类型断言
- **categorySlug 匹配** — 上传表单使用预定义 slug 替代从自由文本生成
- **通知偏好用户隔离** — 偏好设置改为用户级存储键
- **useLocalStorage 跨标签页同步** — 添加 `storage` 事件监听
- **useFollows 闭包过期** — `isFollowing` 直接读取 localStorage 替代依赖 state
- **useFilteredList 数据变化重置** — 源数据变化时重置筛选状态
- **焦点环溢出修复** — `overflow-hidden` 容器添加 `box-shadow` 回退
- **Toast 去重过严** — 允许 500ms 后的重复消息
- **CollectionPicker 空状态** — 无收藏集时显示 FolderOpen 图标和"创建第一个收藏集"操作引导

### 无障碍
- **忘记密码错误 role="alert"** — 忘记密码错误消息添加 `role="alert"`
- **页面过渡 reduced-motion** — `animate-page-fade-in` 尊重减弱动画偏好
- **命令面板 reduced-motion** — `slideDown` 和 `fadeIn` 动画尊重减弱动画
- **路由切换 scrollTo** — 路由切换滚动尊重减弱动画（平滑 vs 即时）

### UI 改进
- **主题切换平滑过渡** — 切换主题时背景色和文字颜色平滑过渡（0.3s）
- **Prose 暗色模式覆写** — 评论 Markdown 使用项目设计令牌（`--foreground`、`--primary` 等）
- **模板页骨架屏增强** — 模板列表 Suspense fallback 改为完整卡片网格骨架屏（与技能页一致）

### 基础设施
- **7 个新 error.tsx** — 分类、排行、标签、搜索、个人中心、指南、用户页添加错误边界
- **3 个新 loading.tsx** — 模板、分类、标签/[tag] 添加加载骨架屏
- **16 个新 i18n 键** — loading、copy、copied、noResults、install、未保存更改、登录重定向、会话过期、收藏集管理、通知偏好
- **元数据语言标准化** — 全站使用统一英文元数据

---

## [v2.3.0] — 2026-05-08

### 新功能
- **评论回复/楼中楼** — 评论区支持回复功能，回复嵌套显示在父评论下方，带左侧缩进边框和 @提及提示
- **通知 Tab 页** — 个人中心新增"通知"Tab，展示所有通知，支持按类型筛选（全部/评论/技能/提交/系统）、标记已读、加载更多
- **提交编辑/删除** — 个人中心提交列表支持删除待审核提交和编辑 pending 状态的提交
- **管理面板评论分页** — 评论管理默认显示 20 条，支持"加载更多"
- **管理面板删除确认** — 删除评论前弹出确认对话框
- **举报弹窗无障碍** — 举报弹窗添加 `role="dialog"`、`aria-modal`、焦点陷阱和 Escape 关闭
- **导航栏键盘提示** — 搜索按钮旁显示 `Ctrl+K` 快捷键提示（仅桌面端）
- **路由切换回顶** — 页面导航时自动滚动到顶部
- **引导完成守卫** — 新手引导完成后不再挂载组件，节省性能
- **对比模式卡片点击修复** — 对比模式下整张卡片可点击选中，而非仅复选框按钮

### 性能优化
- **MarkdownRenderer 懒加载** — SyntaxHighlighter 和 12 个语言模块改为动态导入，减少 ~150KB 首屏包体积
- **头像自动压缩** — 裁剪后超过 200KB 自动压缩为 128×128、60% JPEG
- **搜索输入防抖** — URL 更新添加 500ms 防抖，避免按键频繁触发路由替换

### Bug 修复
- **Error Boundary API 统一** — skills 和 prompts 的 `unstable_retry` 改为标准 `reset()`，兼容 Next.js 16 稳定版
- **首页嵌套 `<main>`** — 移除 page.tsx 中重复的 `<main>` 标签，修复无效 HTML
- **技能 Not Found 硬编码** — "Trending Skills"、"Search" 按钮文字改为 i18n
- **Prompt 详情温度全角冒号** — `：0.7` 改为 `:0.7`，英文界面下不再突兀
- **搜索页 "Load more" 硬编码** — 改为 i18n 键 `t.common.loadMore`
- **对比模式点击失效** — 卡片内部 `<Link>` 拦截点击事件，改为对比模式下阻止 Link 导航

### UI 改进
- **Prompt Not Found 页增强** — 添加搜索图标、双按钮（返回列表 + 搜索），与技能详情页风格一致
- **Prompt 页按钮统一** — 原生 `<button>` 改为 `<Button>` 组件
- **分享剪贴板回退** — Prompt 详情分享失败时回退到复制 URL 到剪贴板
- **OAuth 按钮移除** — 登录/注册页移除未实现的 Google/GitHub 按钮，避免误导
- **用户主页头像优化** — `<img>` 改为 Next.js `<Image>` 组件
- **下拉菜单焦点样式** — 移除 `outline-none`，恢复全局 `focus-visible` 样式
- **星级评分键盘焦点** — 添加 `.star-rating-btn:focus-visible` 样式

---

## [v2.2.0] — 2026-05-08

### 新功能
- **忘记密码** — 登录页"忘记密码"弹出对话框，输入邮箱后直接重置密码（邮箱查找 + 新密码表单）。使用 per-user salt 哈希
- **密码哈希改进** — 每个用户独立随机 salt，旧用户登录时自动迁移。明文密码回退兼容迁移前账户
- **Admin 面板安全** — 管理员访问需同时满足邮箱匹配和 `role === "admin"`，新增生产环境服务端验证提示
- **`<html lang>` 初始化脚本** — `<head>` 中新增内联脚本，首次渲染前从 localStorage 读取语言偏好，消除英文用户语言闪烁
- **XSS 消毒** — `MarkdownRenderer` 通过 DOMPurify（客户端）或正则回退（SSR）消毒 HTML 输出，防止评论/简介/README 中的脚本注入
- **频率限制** — 客户端冷却：评论 3 秒、提交 10 秒、举报 5 秒。违规时显示 i18n Toast
- **Profile Tab 键盘导航** — Tab 列表支持 ArrowLeft/Right 和 Home/End 键，符合 WAI-ARIA Tabs 规范
- **Profile 分页** — 活动时间线、使用历史、我的评论、我的收藏全部添加"加载更多"按钮（每页 10-20 条）
- **清除数据确认** — 设置页"清除数据"按钮弹出确认对话框后才执行
- **Premium / 预览限制** — 4 个高级技能标记为 premium，带 `previewLimit: 100`。Premium 模板显示截断内容 + 模糊遮罩 + 锁图标
- **技能对比** — 技能列表新增"对比模式"开关，选择 2 个技能后跳转 `/skills/compare` 并排对比
- **通知偏好** — 设置页新增 6 种通知类型的开关控制，关闭的类型不再生成通知
- **移动端 Sheet 头像 + 通知** — 移动端导航抽屉登录后显示用户头像 + 用户名 + 通知铃铛
- **评论系统统一** — Agent 技能详情页用共享 `<CommentSection>` 替换内联评论系统。评论现在会出现在"我的评论"Profile Tab 中
- **详情页骨架屏** — 评论区 Suspense fallback 从纯文本改为动画骨架屏

### Bug 修复
- **Footer 死链接** — 移除禁用链接的删除线样式。Changelog 链接到 `#`。其余链接显示"即将上线"tooltip

---

## [v2.1.1] — 2026-05-08

### 严重 Bug 修复
- **夜间模式失效** — `:root body` 亮色渐变与 `.dark body` 特异性相同且在样式表中靠后，始终覆盖暗色样式。所有仅亮色模式选择器（`:root`、`:root .glass-card`、`:root .glass-card-hover:hover`、`:root body`）统一改为 `:root:not(.dark)`
- **新手引导空框** — 第 2/3 步显示不可见框，因为 `positionTooltip` 在目标元素不可见时静默返回。新增 `scrollIntoView` + `requestAnimationFrame` 确保可靠定位，元素未找到时回退到屏幕中央
- **Toast 硬编码颜色** — 将 `#00d4ff`、`#8b949e`、`text-white` 替换为主题令牌（`text-primary`、`text-muted-foreground`、`text-foreground`），确保亮暗主题下均可读

### Bug 修复
- **头像裁剪对话框** — `getContext("2d")!` 非空断言在 canvas 不可用时可能导致 Promise 永远挂起。添加正确的 null 检查和 reject。catch 块改为记录错误而非静默吞没
- **导航栏键盘导航** — "更多"下拉菜单的箭头键导航在菜单项列表为空时可能因除零 `% 0` 崩溃。添加 `items.length === 0` 守卫
- **通知铃铛焦点** — 通知在菜单打开时被删除后 `activeIdx` 可能超过 `items.length`。添加边界检查

---

## [v2.1.0] — 2026-05-08

### 修复
- **`error.tsx` 废弃 API** — `unstable_retry` 替换为 `reset()`（Next.js 16 breaking change）
- **认证密码迁移** — 旧密码不再以明文存入 `passwordHash`；迁移时立即通过 `hashPassword()` 哈希
- **通知 `unreadCount` 同步** — 移除在 `setNotifications` updater 内部调用 `setUnreadCount` 的反模式；改为 `useEffect` 派生
- **Prompt Playground `{var}` 修复** — `buildPrompt` 现在同时替换 `{{var}}` 和 `{var}` 两种格式；之前 `{var}` 变量被识别但不会被替换
- **Sitemap Agent 分类** — 为 Agent 技能分类添加 sitemap 条目（`/skills?category=...`）

### 新功能
- **首页 RSC 化** — 移除 `page.tsx` 的 `"use client"`；tab 状态移至新的 `HomeContent` 客户端组件；`ParticleBackground` 通过 `dynamic({ ssr: false })` 延迟加载，减少初始 JS 包体积
- **移动端 Sheet 搜索** — 导航栏移动端抽屉顶部新增搜索输入框，路由到 `/search?q=...`
- **搜索分页** — 搜索结果初始显示 8 条，带"加载更多"按钮；查询变化时重置
- **模糊搜索** — 搜索页将查询拆分为多个单词，全部匹配（AND 逻辑），提供拼写容错
- **无限滚动准备** — 技能页"加载更多"按钮配合 Intersection Observer 模式
- **Prompts 活跃筛选标签** — Prompt 列表页现在在结果上方显示可移除的筛选标签，与技能页一致
- **评论"已编辑"标记** — 编辑后的评论在时间戳旁显示"已编辑"标记
- **评论活动同步** — 删除评论时同步清理对应的活动记录
- **评论分页** — 评论区初始显示 10 条，带"加载更多"按钮
- **指南代码复制** — 新手指南的代码示例右上角新增一键复制按钮
- **登录忘记密码 Toast** — "忘记密码"文字点击后显示"即将上线"Toast 提示
- **密码强度指示器** — 注册页密码输入框下方显示 5 格强度条（长度、大写、小写、数字、特殊字符）
- **复制安装命令 Toast** — Agent 技能卡片复制安装命令后显示 Toast 通知
- **Lightbox 键盘导航** — 截图灯箱支持 Escape 关闭和左右箭头键切换图片
- **举报弹窗 ESC** — 举报弹窗支持 Escape 键关闭并实现焦点陷阱
- **Tab CSS hidden** — 精选区 Tab 面板改用 CSS `hidden` 切换，替代 `key={tab}` 强制 remount，减少 DOM 开销
- **Markdown 多语言高亮** — `MarkdownRenderer` 新增 Python、Bash、YAML、CSS、HTML、SQL、Java、Go、Rust 高亮（共 14 种语言）
- **引导焦点陷阱** — 引导弹窗现在捕获焦点；Tab 在弹窗内循环；跳过/完成时恢复焦点
- **主题 `color-scheme` 同步** — `applyTheme` 现在设置 `document.documentElement.style.colorScheme`，确保浏览器原生控件一致性
- **CSS `scroll-behavior: smooth`** — 锚点链接现在平滑滚动而非跳转
- **CSS glow 亮色修复** — `.glow-text` 和 `.glow-border` 改用 `hsl(var(--primary))`，适配亮暗主题
- **Toast `warning` 类型** — 新增黄色警告类型；最多强制 5 个 Toast
- **收藏集 `updateCollection`** — `useCollections` hook 支持编辑收藏集名称、描述和可见性
- **收藏集 `isInCollection`** — 新增查询函数，检查某技能是否在收藏集中
- **分类页 i18n** — 分类列表页标题和副标题改用 i18n 键替代硬编码英文
- **注册 i18n** — 密码强度标签改用 i18n 键（`passwordWeak`/`Fair`/`Good`/`Strong`/`VeryStrong`）

### 重构
- **`useFilteredList` Hook** — 提取通用过滤列表 hook（查询防抖、URL 同步、分页、活跃筛选），技能页和模板页共用
- **技能详情页子组件** — 将 900 行的 `skills/[id]/client.tsx` 拆分为 4 个聚焦组件：`ReportModal`、`Lightbox`、`CollectionPicker`、`VersionTimeline`

### 国际化
- **新增 i18n 键** — `common.edited`、`common.passwordWeak`、`common.passwordFair`、`common.passwordGood`、`common.passwordStrong`、`common.passwordVeryStrong`、`common.loadMore`、`common.remaining`

### 新文件
- `src/components/home/home-content.tsx` — 首页 Tab 状态客户端组件
- `src/components/shared/lazy-particle-bg.tsx` — ParticleBackground 动态导入包装
- `src/components/skill/report-modal.tsx` — 提取的举报弹窗组件
- `src/components/skill/lightbox.tsx` — 提取的截图灯箱（含键盘导航）
- `src/components/skill/collection-picker.tsx` — 提取的收藏集选择器
- `src/components/skill/version-timeline.tsx` — 提取的版本历史时间线
- `src/hooks/use-filtered-list.ts` — 通用过滤列表 Hook

---

## [v2.0.7] — 2026-05-08

### 新功能
- **统一搜索页面** (`/search`) — 跨市场搜索 Agent 技能和 Prompt 模板；自动补全下拉框最多显示 6 个建议（技能、模板、标签）带类型图标；最近搜索历史持久化到 localStorage（最多 8 条）；键盘导航（ArrowUp/Down、Enter、Escape）；ARIA combobox 模式
- **通知系统** — 导航栏铃铛图标带未读计数徽章（9+ 溢出）；通知下拉框带类型图标；标记已读、全部已读、清空操作；通过 `useNotifications` hook 按用户 localStorage 持久化
- **公开用户主页** (`/users/[username]`) — 公开个人主页，展示头像、简介、加入日期、已发布技能、下载/星标统计；面包屑导航
- **JSON-LD 结构化数据** — 技能页 SoftwareApplication schema，模板页 CreativeWork，详情页 BreadcrumbList，首页 Organization + WebSite
- **技能详情页增强** — 分享按钮（`navigator.share()` + 剪贴板回退）；截图画廊带灯箱放大；侧边栏依赖项区域；认证徽章（BadgeCheck 图标）；举报模态框（单选按钮原因）；关注作者按钮；"添加到收藏集"下拉框；第 4 个 Tab"版本历史"带垂直时间线；增强 404 带热门推荐
- **技能页 URL 同步筛选** — 所有筛选条件（q、collection、category、license、sort）同步到 URL 查询参数；防抖查询（300ms）；许可证单选筛选；交叉筛选结果计数；活跃筛选条件摘要栏带可移除标签
- **导航栏"更多"下拉菜单** — 快速访问分类、排行榜、标签、指南；ArrowDown/ArrowUp/Escape 键盘导航；`role="menu"` / `role="menuitem"` ARIA
- **CSS 增强** — glass-card-hover 添加 `prefers-reduced-motion` 保护；亮色模式毛玻璃 `backdrop-filter: blur(16px)`；打印样式；全局 `focus-visible` 样式；亮色模式渐变背景
- **Hero 交错入场动画** — `@keyframes heroSlideUp` 配合 `.hero-animate-1` 到 `.hero-animate-4` 类；装饰元素标记 `aria-hidden="true"`
- **Tab 渐变动画** — `@keyframes tabFadeIn` 配合精选区 tabpanel 的 `.tab-panel-enter` 类
- **评论 Markdown 渲染** — 评论内容通过延迟加载的 `MarkdownRenderer` 渲染；辅助文字显示支持的语法
- **Footer 无障碍** — 禁用链接标记 `aria-disabled="true"` 带删除线；每个区块用 `<nav>` 包裹带 `aria-label`
- **收藏集系统** — `useCollections` hook 用于创建/管理技能收藏集，localStorage 持久化
- **关注系统** — `useFollows` hook 用于关注/取消关注技能作者，localStorage 持久化

### 国际化
- **30+ 新 i18n 键** — `report`、`reportSubmitted`、`reportReason`、`reportSpam`、`reportAbuse`、`reportCopyright`、`reportOther`、`following`、`follow`、`unfollow`、`collections`、`myCollections`、`newCollection`、`collectionName`、`collectionDesc`、`addToCollection`、`noResults`、`tryDifferent`、`notifications`、`markAllRead`、`noNotifications`、`clearAll`、`viewMore`、`ago`、`filters`、`clearFilters`、`activeFilters`、`verified`、`official`、`screenshots`、`versionHistory`、`changelog`、`dependencies`、`noDependencies`
- **`userProfile` 区块** — `userNotFound`、`goBack`、`publishedSkills`、`noPublishedSkills`、`noPublishedSkillsDesc`、`totalDownloads`、`totalStars`、`publishedCount`、`joinedAt`
- **`search` 区块** — `title`、`subtitle`、`placeholder`、`recentSearches`、`clearRecent`、`noResults`、`noResultsDesc`、`agentSkills`、`promptTemplates`、`viewAllSkills`、`viewAllPrompts`、`suggestions`、`removeRecent`

### 新文件
- `src/app/search/page.tsx` — 服务器组件含 Suspense 边界
- `src/app/search/client.tsx` — 统一搜索带自动补全
- `src/app/users/[username]/page.tsx` — 公开主页服务器组件
- `src/app/users/[username]/client.tsx` — 公开主页客户端组件
- `src/components/shared/json-ld.tsx` — JSON-LD 生成器组件
- `src/components/shared/notification-bell.tsx` — 通知铃铛下拉框
- `src/components/shared/onboarding-tooltip.tsx` — 新用户 3 步引导
- `src/hooks/use-notifications.ts` — 通知 CRUD hook
- `src/hooks/use-collections.ts` — 收藏集管理 hook
- `src/hooks/use-follows.ts` — 关注管理 hook
- `src/app/skills/[id]/loading.tsx` — 技能详情骨架屏

---

## [v2.0.6] — 2026-05-08

### 新功能
- **新用户引导** — 首次访问的用户会看到 3 步引导流程（欢迎 → 浏览技能 → 搜索功能），包含半透明遮罩、高亮目标区域和提示卡片；通过 `localStorage` 记录完成状态
- **空状态优化** — `/prompts`、`/trending`、`/tags` 页面在筛选无结果时显示友好的空状态提示，包含图标、文案和操作按钮

### 国际化
- **新增 i18n 键** — `onboarding.skip`、`onboarding.next`、`onboarding.finish`、`onboarding.step1Title`、`onboarding.step1Desc`、`onboarding.step2Title`、`onboarding.step2Desc`、`onboarding.step3Title`、`onboarding.step3Desc`

---

## [v2.0.5] — 2026-05-08

### 新功能
- **交互式 Prompt 试用 Playground** — Prompt 详情页新增"详情 / 试用"双 Tab 架构；试用 Tab 让用户直接在浏览器中填写 `{{variable}}` 占位符并预览组装后的完整 Prompt（纯客户端，无 API 调用）
- **变量自动识别** — Playground 解析 Prompt 模板中的 `{{var}}` 和 `{var}` 两种语法，去重后生成带标签的 Textarea 输入框
- **在线版/本地版切换** — Playground 内可切换在线版和本地版 Prompt，各自独立管理变量输入
- **重置与复制操作** — Playground 包含重置（清空所有输入）、复制结果和生成预览按钮

### 国际化
- **新增 i18n 键** — `common.detail`、`common.reset`、`common.generatePreview`、`common.previewPrompt`；`common.runPrompt` 更新为 "运行 Prompt" / "Run Prompt"

---

## [v2.0.4] — 2026-05-07

### 无障碍
- **Skills 页面添加 Suspense 边界** — `SkillsClient` 使用 `useSearchParams()` 但未包裹 `<Suspense>`，Next.js 16 会报运行时错误；添加 Suspense + 骨架屏 fallback
- **Skip Navigation Link** — 根布局添加"跳转到主内容"链接（WCAG 2.4.1 Level A），`<main>` 添加 `id="main-content"`
- **CreateDropdown ARIA** — 触发按钮添加 `aria-expanded`、`aria-haspopup="menu"`、`aria-label`；下拉菜单添加 `role="menu"`，选项添加 `role="menuitem"`
- **CommentSection 按钮无障碍** — 点赞按钮添加 `aria-label` + `aria-pressed`；编辑/删除按钮添加 `aria-label`
- **Prompts 筛选按钮添加 `role="radiogroup"`** — 分类、难度、排序三组筛选按钮各包裹在 `role="radiogroup"` 容器中
- **AgentSkillCard 修复嵌套交互** — 移除覆盖整个卡片的 `<Link>` overlay，改为标题/头像/描述各自独立 `<Link>`，使复制按钮可键盘访问
- **手写模态框添加 ARIA** — `CreateFromUpload` 和 `CreateFromUploadPrompt` 添加 `role="dialog"`、`aria-modal="true"`、`aria-label`

### 国际化
- **统一元数据语言** — 根布局 `title`、`description`、`openGraph` 全部改为英文，与 Twitter 卡片一致
- **硬编码英文字符串 i18n** — AgentSkillCard 的 "Popular" 改用 `t.agentSkills.trending`；Settings 删除确认支持输入"删除"（中文）或"DELETE"（英文）；Footer "Coming soon"、Login "Coming soon" 改用 i18n 键
- **Footer 键名改用稳定标识** — `footerLinks` 从 `Record<translatedKey, links>` 改为 `Array<{id, title, links}>`，避免语言切换时 `key` 变化导致 DOM 重建
- **Tags 变量名修复** — `filteredTags.map((t) => ...)` 改为 `(tagItem)`，避免遮蔽 `useI18n()` 的 `t`
- **新增 i18n 键** — `common.popular`、`agentSkills.trending`、`footer.comingSoon`、`auth.comingSoon`

### 性能优化
- **MarkdownRenderer 添加 `React.memo`** — 重型 Markdown 解析组件现在用 `memo()` 包裹，避免父组件重渲染时重复解析
- **动态导入添加 loading fallback** — `CreateFromGithub`、`CreateFromUpload`、`CreateFromUploadPrompt` 的 `dynamic()` 调用添加 spinner loading 回退
- **glass-card-hover 优化** — `transition: all` 改为 `transition: transform, border-color, box-shadow`，避免对所有属性做过渡

### 用户体验
- **OG 图片** — 根布局添加 `openGraph.images` 和 `twitter.images`（`/og.png`），社交分享不再空白
- **统一骨架屏主题令牌** — Prompt 详情 loading 页面的 `bg-white/5` 改为 `bg-secondary`，亮色模式下不再不可见
- **ScrollToTop 不再从 DOM 移除** — 改用 `opacity-0 pointer-events-none` + CSS 过渡，避免布局跳动和屏幕阅读器找不到按钮
- **Submit 表单 loading 状态** — 提交按钮在提交中显示 `disabled` + "..."，防止重复提交
- **AgentSkillCard 标签可交互** — 标签从 `<span>` 改为 `<Link href="/tags/...">`，与 SkillCard 行为一致
- **Forgot Password tooltip i18n** — title 属性从硬编码 "Coming soon" 改用 i18n 键
- **Profile Stats 读取修复** — `StatsDashboard` 从 render body 直读 localStorage 改为 `useEffect` + `useState`，避免数据过期

### 性能
- **glass-card-hover 专项过渡** — 从 `transition: all` 改为仅过渡 `transform, border-color, box-shadow`，减少不必要的重绘

### 修改文件
- `src/app/skills/page.tsx` — 添加 Suspense 边界 + 骨架屏
- `src/app/layout.tsx` — Skip nav link、id="main-content"、统一英文元数据、OG 图片
- `src/app/prompts/client.tsx` — 动态导入 loading fallback、筛选按钮 role=radiogroup
- `src/app/prompts/[id]/loading.tsx` — 骨架屏令牌统一为 bg-secondary
- `src/app/skills/client.tsx` — 动态导入 loading fallback
- `src/app/submit/client.tsx` — 提交按钮 loading 状态
- `src/app/login/client.tsx` — Forgot password tooltip i18n
- `src/app/tags/client.tsx` — 变量名 t → tagItem
- `src/app/globals.css` — glass-card-hover 专项过渡
- `src/components/skills/create-dropdown.tsx` — ARIA 属性
- `src/components/skills/create-from-upload.tsx` — modal ARIA
- `src/components/skills/create-from-upload-prompt.tsx` — modal ARIA
- `src/components/skill/comment-section.tsx` — 按钮 aria-label + aria-pressed
- `src/components/agent-skill/agent-skill-card.tsx` — 移除 overlay、标签可交互、i18n
- `src/components/layout/footer.tsx` — 稳定键名、comingSoon i18n
- `src/components/shared/scroll-to-top.tsx` — CSS 过渡替代条件渲染
- `src/components/shared/markdown-renderer.tsx` — React.memo
- `src/components/profile/settings-tab.tsx` — 删除确认支持"删除"
- `src/components/profile/stats-dashboard.tsx` — useEffect 读取 localStorage
- `src/lib/i18n/types.ts` — 新增 popular、trending、comingSoon 键
- `src/lib/i18n/zh.ts` — 新增中文翻译
- `src/lib/i18n/en.ts` — 新增英文翻译

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
