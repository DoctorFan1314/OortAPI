import type { Skill, Testimonial } from "./types";

export const skills: Skill[] = [
  {
    id: "xiaohongshu-notes",
    title: "小红书爆款笔记生成器（去AI味专业版 v2.1）",
    subtitle: "输入主题，几秒生成自然、接地气的高质量小红书笔记，大幅去除AI味。",
    description: "专为小红书平台优化的内容生成工具。通过深度学习小红书爆款笔记的语言风格和结构模式，生成自然流畅、高互动率的笔记内容。",
    category: "语言与内容生产",
    categorySlug: "content",
    difficulty: "beginner",
    rating: 4.9,
    usageCount: 3248,
    lastUpdated: "2026.04",
    version: "v2.1",
    tags: ["小红书", "内容创作", "去AI味", "爆款"],
    featured: true,
    trending: true,
    beginner: true,
    promptOnline: `你是一位资深小红书内容创作者。请根据以下要求生成一篇高质量的小红书笔记：

【主题】：{{主题}}
【风格偏好】：{{风格}}
【目标人群】：{{目标人群}}

请严格遵循以下规则：

1. 标题要求：使用emoji开头，包含数字或利益点，控制在20字以内
2. 正文要求：个人经历代入 → 核心干货分点列举 → 行动号召，使用口语化表达
3. 去AI味技巧：加入"说实话"、"踩过坑才知道"等个人化表达，使用不完美句式
4. 标签：生成5-8个相关话题标签`,
    promptLocal: `[系统指令]
你是一位小红书资深博主。根据用户提供的主题，生成一篇自然的笔记。

[输入参数]
- 主题：{topic}
- 风格：{style}
- 目标人群：{audience}

[约束]
- 全文口语化，像真人聊天
- 避免AI常见的排比句和过度修饰
- 控制总字数在500-800字`,
    variables: [
      { name: "主题", placeholder: "例如：春季穿搭、护肤心得、旅行攻略", required: true },
      { name: "风格", placeholder: "例如：轻松活泼、专业干货", required: false },
      { name: "目标人群", placeholder: "例如：大学生、职场新人", required: false },
    ],
    beforeAfter: {
      input: "主题：分享我的极简生活心得",
      outputs: [
        {
          model: "Claude Opus 4.7",
          text: `🏠 极简生活3年，我扔掉了80%的东西，却活得更自由了

说实话，3年前的我是个"囤货狂"。衣柜塞满衣服却总觉得没衣服穿，护肤品摆了一桌子过期了大半。

直到有次搬家，看着满屋子的东西我突然就崩溃了...

🌟 我的极简生活实践：

1️⃣ 衣橱断舍离 — 只留下真正穿的、喜欢的，现在衣橱只有30件单品
2️⃣ 护肤做减法 — 从十几瓶精简到3瓶，皮肤反而比以前好了
3️⃣ 数字极简 — 卸载不用的APP，手机屏幕时间减半
4️⃣ 消费降级不降质 — 买贵的但耐用的，不买便宜但凑合的

极简不是苦行，是把时间和精力留给真正重要的事。

#极简生活 #断舍离 #生活方式 #自律 #成长`,
        },
        {
          model: "Qwen 3.6",
          text: `🏠 极简生活两年，我的人生像开了挂

姐妹们！今天必须跟你们聊聊极简生活。

两年前我还是个月光族，工资发下来就各种买买买，月底吃土...后来实在受不了了，决定改变。

🧹 我做了这些事：
✨ 衣服从200+件减到35件
✨ 护肤从15瓶减到4瓶
✨ 退出了10+个群聊
✨ 每月强制存30%

极简不是不花钱，是把钱花在刀刃上。试试看，你会爱上这种轻盈感～

#极简生活 #理性消费 #生活感悟`,
        },
      ],
    },
    recommendedModels: [
      { name: "Claude Opus 4.7 / Sonnet 4.6", strengths: "文字最自然、复杂推理强", useCase: "高质量内容创作", audience: "追求极致内容质量的创作者" },
      { name: "Grok 4.20", strengths: "创意强、指令跟随优秀", useCase: "脚本、标题、突破性想法", audience: "需要创意灵感的用户" },
      { name: "Qwen 3.6 / DeepSeek V4", strengths: "中文理解极佳、速度快", useCase: "小红书、营销、日常写作", audience: "中文内容创作者" },
      { name: "Llama 3.1/4 系列（本地）", strengths: "隐私安全、完全离线", useCase: "高频使用、隐私敏感场景", audience: "注重隐私的用户" },
    ],
    usageStepsOnline: ["点击「复制完整 Prompt」", "打开 ChatGPT / Claude 等平台", "粘贴 Prompt，替换变量", "发送后等待 AI 生成", "微调输出后使用"],
    usageStepsLocal: ["安装 LM Studio 或 Ollama", "下载推荐模型", "复制本地版 Prompt", "粘贴并运行", "调整 Temperature 参数（推荐 0.7）"],
    advancedTips: ["多轮迭代：要求AI「更口语化」或「加入更多个人经历」", "风格迁移：提供你喜欢的博主笔记作为参考", "A/B测试：生成3-5个版本选最佳"],
    likes: 892,
  },
  {
    id: "weekly-report",
    title: "职场周报一键生成器（结构化专业版 v1.5）",
    subtitle: "输入本周工作要点，自动生成结构清晰、重点突出的专业周报。",
    description: "帮助职场人士将零散工作内容整理成结构化周报，突出成果和价值。",
    category: "思考与工作流",
    categorySlug: "thinking",
    difficulty: "beginner",
    rating: 4.8,
    usageCount: 2156,
    lastUpdated: "2026.04",
    version: "v1.5",
    tags: ["周报", "职场", "汇报", "结构化"],
    featured: true,
    trending: true,
    beginner: true,
    promptOnline: `你是一位职场写作专家。请根据以下信息生成一份专业的周报：

【本周工作内容】：{{工作内容}}
【遇到的问题】：{{遇到的问题}}
【下周计划】：{{下周计划}}

按以下结构输出：
📊 本周工作总结（1-2句话概括）
✅ 重点完成事项（按重要性排序，包含产出和价值）
⚠️ 问题与挑战（问题 + 原因 + 解决方案）
📅 下周工作计划（按优先级，注明时间节点）
🤝 需要的支持

要求：语言专业但不生硬，突出成果和价值，控制在500字以内。`,
    promptLocal: `[系统指令] 你是职场写作专家，帮助用户生成专业周报。
[输入] 本周工作：{work} 问题：{issues} 下周计划：{plan}
[输出] 📊总结 ✅完成事项 ⚠️问题 📅计划 🤝支持`,
    variables: [
      { name: "工作内容", placeholder: "例如：完成用户系统重构、处理15个Bug", required: true },
      { name: "遇到的问题", placeholder: "例如：接口响应慢、需求变更频繁", required: false },
      { name: "下周计划", placeholder: "例如：完成支付模块开发", required: true },
    ],
    beforeAfter: {
      input: "工作内容：完成用户登录模块重构，修复8个Bug\n问题：第三方登录接口文档不清晰\n下周计划：开始购物车模块开发",
      outputs: [{
        model: "Claude Opus 4.7",
        text: `📊 本周工作总结
本周聚焦用户系统优化，完成登录模块重构并修复8个Bug，系统稳定性显著提升。

✅ 重点完成事项
1. 用户登录模块重构 — 完成OAuth 2.0集成，登录成功率从92%提升至99.5%
2. Bug修复（8个） — 修复3个P0级Bug，线上投诉量下降60%

⚠️ 问题与挑战
问题：第三方登录接口文档不清晰
解决方案：已联系技术支持获取最新文档并完成适配

📅 下周工作计划
1. 购物车模块开发（周一-周三）
2. 购物车与商品模块联调（周四-周五）

🤝 需要的支持
本周暂无额外支持需求。`,
      }],
    },
    recommendedModels: [
      { name: "Claude Opus 4.7 / Sonnet 4.6", strengths: "文字最自然、结构化输出强", useCase: "高质量周报", audience: "追求专业表达的职场人" },
      { name: "Qwen 3.6", strengths: "中文理解极佳、速度快", useCase: "日常周报", audience: "需要快速完成周报的职场人" },
    ],
    usageStepsOnline: ["复制 Prompt", "打开 AI 平台", "替换变量", "获取周报", "微调后使用"],
    usageStepsLocal: ["安装模型", "复制本地版 Prompt", "填入工作内容", "运行生成"],
    likes: 654,
  },
  {
    id: "code-review",
    title: "AI代码审查专家（全方位安全版 v2.0）",
    subtitle: "粘贴代码，获得专业审查报告，包含安全漏洞、性能优化、最佳实践。",
    description: "专业AI代码审查工具，帮助开发者快速发现潜在问题。",
    category: "编程与技术任务",
    categorySlug: "coding",
    difficulty: "intermediate",
    rating: 4.9,
    usageCount: 1876,
    lastUpdated: "2026.04",
    version: "v2.0",
    tags: ["代码审查", "安全", "性能优化"],
    featured: true,
    trending: true,
    beginner: false,
    promptOnline: `你是资深代码审查专家。请审查以下代码：

【编程语言】：{{语言}}
【代码用途】：{{用途}}
【代码内容】：
{{代码}}

从以下维度审查：
🔒 安全性（SQL注入、XSS、敏感信息泄露）
⚡ 性能（复杂度、瓶颈、资源泄漏）
📐 代码质量（命名、职责单一、可读性）
✅ 最佳实践（设计模式、错误处理）

输出格式：总体评分（1-10）→ 问题列表（🔴严重 🟡警告 🔵建议）→ 优化后代码 → 改进建议`,
    promptLocal: `[系统指令] 你是代码审查专家。
[输入] 语言：{language} 代码：{code}
[输出] 评分 → 问题列表 → 优化代码 → 建议`,
    variables: [
      { name: "语言", placeholder: "例如：Python、JavaScript", required: true },
      { name: "用途", placeholder: "例如：用户认证、数据处理", required: false },
      { name: "代码", placeholder: "粘贴你的代码", required: true },
    ],
    beforeAfter: {
      input: "Python登录函数：\ndef login(username, password):\n    query = f\"SELECT * FROM users WHERE username='{username}' AND password='{password}'\"\n    result = db.execute(query)\n    return bool(result)",
      outputs: [{
        model: "Claude Opus 4.7",
        text: `📊 总体评分：3/10

🔴 严重问题：
1. SQL注入漏洞（Critical）— 直接使用f-string拼接SQL，攻击者可绕过验证
   修复：使用参数化查询
2. 明文存储密码 — 密码应哈希存储
   修复：使用bcrypt

🟡 警告：
1. 无错误处理 — 数据库操作未使用try-except

📝 优化后代码：
import bcrypt

def login(username: str, password: str) -> Optional[dict]:
    if not username or not password:
        return None
    try:
        result = db.execute("SELECT * FROM users WHERE username = %s", (username,))
        if result and bcrypt.checkpw(password.encode(), result['password_hash'].encode()):
            return result
        return None
    except Exception as e:
        logger.error(f"Login error: {e}")
        return None`,
      }],
    },
    recommendedModels: [
      { name: "Claude Opus 4.7", strengths: "代码理解强、安全分析深入", useCase: "复杂代码审查", audience: "专业开发者" },
      { name: "Grok 4.20", strengths: "快速响应、创意方案", useCase: "快速审查", audience: "需要快速反馈的开发者" },
    ],
    usageStepsOnline: ["复制 Prompt", "指定语言和用途", "粘贴代码", "获取审查报告"],
    usageStepsLocal: ["安装代码模型", "复制本地版 Prompt", "粘贴代码后运行"],
    likes: 567,
  },
  {
    id: "english-to-chinese",
    title: "英译中自然化翻译器（去机翻味 v3.0）",
    subtitle: "将英文翻译成自然流畅的中文，完全去除机翻味。",
    description: "专为英译中优化，生成地道中文表达。",
    category: "语言与内容生产",
    categorySlug: "content",
    difficulty: "beginner",
    rating: 4.8,
    usageCount: 2890,
    lastUpdated: "2026.03",
    version: "v3.0",
    tags: ["翻译", "英译中", "去机翻味"],
    featured: false,
    trending: true,
    beginner: true,
    promptOnline: `你是资深翻译专家。将以下英文翻译成自然流畅的中文：

【英文原文】：{{英文内容}}
【翻译场景】：{{场景}}

要求：忠实传达含义，使用地道中文表达，避免翻译腔，适当意译。直接输出翻译结果。`,
    promptLocal: `[系统指令] 你是专业翻译，将英文翻译成自然的中文。
[输入] 原文：{text} 场景：{context}
[要求] 准确、自然、避免翻译腔`,
    variables: [
      { name: "英文内容", placeholder: "粘贴需要翻译的英文内容", required: true },
      { name: "场景", placeholder: "例如：商务邮件、学术论文、技术文档", required: false },
    ],
    beforeAfter: {
      input: "The implementation of this feature requires careful consideration of various factors, including performance implications and maintainability.",
      outputs: [
        { model: "Claude Opus 4.7", text: "实现这一功能需要综合考量多方面因素，包括性能影响和代码可维护性。" },
        { model: "Qwen 3.6", text: "要落地这个功能，得从性能、可维护性等多个维度仔细权衡。" },
      ],
    },
    recommendedModels: [
      { name: "Claude Opus 4.7", strengths: "翻译最自然、语境理解深", useCase: "高质量翻译", audience: "追求翻译质量的用户" },
      { name: "Qwen 3.6", strengths: "中文表达地道、速度快", useCase: "日常翻译", audience: "需要快速翻译的用户" },
    ],
    usageStepsOnline: ["复制 Prompt 并填入原文", "指定场景", "获取翻译"],
    usageStepsLocal: ["安装中英双语模型", "复制本地版 Prompt", "填入原文后运行"],
    likes: 723,
  },
  {
    id: "email-writer",
    title: "商务邮件撰写助手（专业得体版 v1.8）",
    subtitle: "输入邮件目的和要点，生成专业得体的商务邮件。",
    description: "帮助职场人士快速撰写各类商务邮件。",
    category: "思考与工作流",
    categorySlug: "thinking",
    difficulty: "beginner",
    rating: 4.7,
    usageCount: 1543,
    lastUpdated: "2026.04",
    version: "v1.8",
    tags: ["邮件", "商务", "职场"],
    featured: false,
    trending: false,
    beginner: true,
    promptOnline: `你是商务写作专家。请撰写一封商务邮件：

【邮件目的】：{{邮件目的}}
【收件人关系】：{{收件人关系}}
【核心内容】：{{核心内容}}

包含主题行、称呼、正文（目的→内容→行动）、落款。直接输出完整邮件。`,
    promptLocal: `[系统指令] 你是商务邮件专家。
[输入] 目的：{purpose} 收件人：{recipient} 内容：{content}
[输出] Subject: [主题行] + 完整邮件`,
    variables: [
      { name: "邮件目的", placeholder: "例如：项目进度汇报、会议邀请", required: true },
      { name: "收件人关系", placeholder: "例如：上级领导、客户、同事", required: true },
      { name: "核心内容", placeholder: "例如：本周项目进展顺利，预计下周完成", required: true },
    ],
    beforeAfter: {
      input: "目的：向领导汇报项目进度\n收件人：直属上级\n内容：完成用户系统开发，下周开始测试",
      outputs: [{
        model: "Claude Opus 4.7",
        text: `Subject: 【项目进度】用户系统开发完成，下周进入测试阶段

尊敬的领导：

您好！现就本周项目进展向您汇报：

本周已完成用户系统的核心开发工作，包括注册、登录、权限管理等模块。经初步自测，各功能运行稳定。

下周计划进入系统测试阶段，预计测试周期为一周。

此致
敬礼`,
      }],
    },
    recommendedModels: [
      { name: "Claude Opus 4.7", strengths: "措辞最得体", useCase: "正式商务邮件", audience: "需要高质量邮件的职场人" },
      { name: "Qwen 3.6", strengths: "中文自然、速度快", useCase: "日常邮件", audience: "需要快速写邮件的职场人" },
    ],
    usageStepsOnline: ["复制 Prompt", "填入邮件信息", "获取完整邮件", "调整后发送"],
    usageStepsLocal: ["安装中文模型", "复制本地版 Prompt", "填入信息后运行"],
    likes: 432,
  },
  {
    id: "api-generator",
    title: "RESTful API 代码生成器（全栈版 v2.3）",
    subtitle: "描述API需求，自动生成完整接口代码。",
    description: "快速生成符合RESTful规范的API代码，支持多种后端框架。",
    category: "编程与技术任务",
    categorySlug: "coding",
    difficulty: "intermediate",
    rating: 4.8,
    usageCount: 1234,
    lastUpdated: "2026.04",
    version: "v2.3",
    tags: ["API", "后端", "RESTful"],
    featured: false,
    trending: true,
    beginner: false,
    promptOnline: `你是全栈开发专家。请根据需求生成API代码：

【功能描述】：{{功能描述}}
【技术栈】：{{技术栈}}
【数据库】：{{数据库}}

输出：API设计文档（端点、参数、响应格式）→ 完整代码（路由、控制器、验证、错误处理）→ 测试用例`,
    promptLocal: `[系统指令] 你是后端开发专家，生成RESTful API代码。
[输入] 功能：{feature} 技术栈：{stack} 数据库：{database}
[输出] 1.API设计 2.完整代码 3.测试用例`,
    variables: [
      { name: "功能描述", placeholder: "例如：用户注册登录系统", required: true },
      { name: "技术栈", placeholder: "例如：Node.js + Express", required: true },
      { name: "数据库", placeholder: "例如：PostgreSQL、MongoDB", required: false },
    ],
    beforeAfter: {
      input: "功能：用户注册和登录API\n技术栈：Node.js + Express\n数据库：PostgreSQL",
      outputs: [{
        model: "Claude Opus 4.7",
        text: `## API端点

| 方法 | 端点 | 描述 |
|------|------|------|
| POST | /api/auth/register | 用户注册 |
| POST | /api/auth/login | 用户登录 |

## 代码实现

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();

router.post('/register', async (req, res) => {
  const { email, password, name } = req.body;
  const hashedPassword = await bcrypt.hash(password, 12);
  const result = await db.query(
    'INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name',
    [email, hashedPassword, name]
  );
  const token = jwt.sign({ userId: result.rows[0].id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.status(201).json({ user: result.rows[0], token });
});`,
      }],
    },
    recommendedModels: [
      { name: "Claude Opus 4.7", strengths: "代码质量高、架构设计强", useCase: "复杂API设计", audience: "专业后端开发者" },
      { name: "Grok 4.20", strengths: "快速生成", useCase: "快速原型", audience: "需要快速实现的开发者" },
    ],
    usageStepsOnline: ["复制 Prompt", "描述API需求", "获取代码", "调整后使用"],
    usageStepsLocal: ["安装代码模型", "复制本地版 Prompt", "描述需求后运行"],
    likes: 345,
  },
  {
    id: "structured-thinking",
    title: "结构化思考与决策分析器（深度版 v1.6）",
    subtitle: "将复杂问题分解为清晰的结构化框架，辅助理性决策。",
    description: "帮助用户将模糊问题转化为结构化思考框架。",
    category: "思考与工作流",
    categorySlug: "thinking",
    difficulty: "intermediate",
    rating: 4.9,
    usageCount: 987,
    lastUpdated: "2026.03",
    version: "v1.6",
    tags: ["思考", "决策", "分析"],
    featured: false,
    trending: false,
    beginner: false,
    promptOnline: `你是管理顾问和思维教练。请分析以下问题：

【问题/决策】：{{问题描述}}
【背景信息】：{{背景信息}}
【约束条件】：{{约束条件}}
【期望目标】：{{期望目标}}

使用以下框架：
📊 问题定义 → 🔍 根因分析（5 Whys）→ 📋 方案矩阵（成本/效果/风险/时间）→ 🎯 推荐方案 → 📈 行动计划`,
    promptLocal: `[系统指令] 你是结构化思考专家。
[输入] 问题：{problem} 背景：{background} 约束：{constraints} 目标：{goal}
[输出] 1.问题定义 2.根因分析 3.方案矩阵 4.推荐方案 5.行动计划`,
    variables: [
      { name: "问题描述", placeholder: "例如：团队效率低下、产品转化率不高", required: true },
      { name: "背景信息", placeholder: "例如：15人研发团队，2周迭代", required: false },
      { name: "约束条件", placeholder: "例如：不能增加人手", required: false },
      { name: "期望目标", placeholder: "例如：降低50%的线上Bug率", required: true },
    ],
    beforeAfter: {
      input: "问题：团队代码质量不高，Bug率持续上升\n背景：15人研发团队，2周迭代\n约束：不能增加人手\n目标：降低50%线上Bug率",
      outputs: [{
        model: "Claude Opus 4.7",
        text: `📊 问题定义
核心问题：代码质量控制体系不完善

🔍 根因分析
1. Bug多？→ 代码审查不充分
2. 审查不充分？→ 没有强制CR流程
3. 没有流程？→ 快速扩张，流程滞后
根本原因：缺乏质量文化和自动化保障

📋 方案矩阵
| 方案 | 成本 | 效果 | 风险 | 总分 |
|------|------|------|------|------|
| A. 强制CR+自动化测试 | 中 | 高 | 低 | 8.5 |
| B. 引入AI代码审查 | 低 | 中 | 低 | 7.0 |
| C. 增加QA团队 | 高 | 高 | 中 | 6.5 |

🎯 推荐：A+B组合
1. 第1周：ESLint + Prettier
2. 第2周：强制CR流程
3. 第3周：AI辅助审查
4. 第4周：复盘优化`,
      }],
    },
    recommendedModels: [
      { name: "Claude Opus 4.7", strengths: "逻辑推理强", useCase: "复杂决策分析", audience: "管理者、决策者" },
      { name: "Grok 4.20", strengths: "创意视角", useCase: "创新方案", audience: "需要创新思路的用户" },
    ],
    usageStepsOnline: ["复制 Prompt", "描述问题", "获取分析", "制定方案"],
    usageStepsLocal: ["安装推理模型", "复制本地版 Prompt", "描述问题后运行"],
    likes: 289,
  },
  {
    id: "xiaohongshu-title",
    title: "小红书爆款标题生成器（高点击率版 v1.9）",
    subtitle: "输入主题关键词，批量生成高点击率小红书标题。",
    description: "基于大量爆款标题模式，生成高点击率标题。",
    category: "语言与内容生产",
    categorySlug: "content",
    difficulty: "beginner",
    rating: 4.7,
    usageCount: 2567,
    lastUpdated: "2026.04",
    version: "v1.9",
    tags: ["小红书", "标题", "点击率"],
    featured: false,
    trending: true,
    beginner: true,
    promptOnline: `你是小红书爆款标题专家。根据以下信息生成10个高点击率标题：

【主题/关键词】：{{主题}}
【内容类型】：{{内容类型}}

规则：包含emoji、使用数字、制造好奇心、突出利益点、20字以内、口语化。
直接输出10个标题，每个一行。`,
    promptLocal: `[系统指令] 你是小红书标题专家。
[输入] 主题：{topic} 类型：{type}
[输出] 10个标题，每行一个，含emoji`,
    variables: [
      { name: "主题", placeholder: "例如：护肤、穿搭、减肥", required: true },
      { name: "内容类型", placeholder: "例如：教程、测评、经验分享", required: false },
    ],
    beforeAfter: {
      input: "主题：极简护肤\n类型：经验分享",
      outputs: [{
        model: "Claude Opus 4.7",
        text: `1. 🧴 极简护肤3年｜皮肤反而变好了的5个真相
2. 💰 学生党护肤｜月均50元搞定全套护肤
3. ✨ 后悔没早知道！精简护肤的3个核心原则
4. 🔥 护肤做减法后，我的烂脸居然好了
5. 📦 从15瓶到3瓶｜我的极简护肤之路
6. 💡 大学生必看｜便宜又好用的护肤方案
7. 🌟 极简护肤100天｜素颜也能自信出门
8. 🧪 踩过无数坑后，我只留下这3瓶
9. 📝 护肤小白必看｜少花钱多办事的秘诀
10. 🏆 极简护肤挑战｜30天后皮肤状态惊人`,
      }],
    },
    recommendedModels: [
      { name: "Claude Opus 4.7", strengths: "创意丰富", useCase: "高质量标题", audience: "追求创意的创作者" },
      { name: "Qwen 3.6", strengths: "中文理解好、速度快", useCase: "批量生成", audience: "需要快速出标题的用户" },
    ],
    usageStepsOnline: ["复制 Prompt", "填入主题", "获取10个标题", "选择使用"],
    usageStepsLocal: ["安装中文模型", "复制本地版 Prompt", "填入主题后运行"],
    likes: 567,
  },
  {
    id: "bug-fixer",
    title: "智能Bug修复助手（快速定位版 v2.1）",
    subtitle: "描述Bug现象或粘贴错误信息，快速获得定位思路和修复方案。",
    description: "帮助开发者快速定位和修复Bug。",
    category: "编程与技术任务",
    categorySlug: "coding",
    difficulty: "intermediate",
    rating: 4.8,
    usageCount: 1678,
    lastUpdated: "2026.04",
    version: "v2.1",
    tags: ["Bug修复", "调试", "错误分析"],
    featured: false,
    trending: false,
    beginner: false,
    promptOnline: `你是调试专家。请分析以下Bug：

【技术栈】：{{技术栈}}
【Bug描述】：{{Bug描述}}
【错误信息】：{{错误信息}}
【相关代码】：{{相关代码}}

输出：🔍 错误解读 → 🎯 定位思路 → ✅ 修复方案 → 🛡️ 预防措施`,
    promptLocal: `[系统指令] 你是调试专家。
[输入] 技术栈：{stack} Bug：{description} 错误：{error} 代码：{code}
[输出] 1.错误解读 2.定位思路 3.修复方案 4.预防措施`,
    variables: [
      { name: "技术栈", placeholder: "例如：React + TypeScript", required: true },
      { name: "Bug描述", placeholder: "例如：页面白屏、接口报错", required: true },
      { name: "错误信息", placeholder: "粘贴错误信息", required: false },
      { name: "相关代码", placeholder: "粘贴相关代码", required: false },
    ],
    beforeAfter: {
      input: "技术栈：React + TypeScript\nBug：页面白屏\n错误：Cannot read properties of undefined (reading 'map')\n代码：const items = data.items.map(item => ...)",
      outputs: [{
        model: "Claude Opus 4.7",
        text: `🔍 错误解读
data.items 是 undefined，可能是API返回数据结构不符或数据未加载完成。

🎯 定位思路
1. 检查API返回值
2. 检查组件渲染时机
3. 检查状态初始值

✅ 修复方案
// 方案1：可选链 + 默认值
const items = data?.items?.map(item => ...) ?? [];

// 方案2：加载状态
if (loading) return <Loading />;
if (!data?.items) return <Empty />;

🛡️ 预防措施
- TypeScript定义完整数据类型
- 使用可选链处理可能为undefined的属性`,
      }],
    },
    recommendedModels: [
      { name: "Claude Opus 4.7", strengths: "代码理解深入", useCase: "复杂Bug定位", audience: "遇到疑难Bug的开发者" },
      { name: "Grok 4.20", strengths: "快速响应", useCase: "快速修复", audience: "需要快速解决的开发者" },
    ],
    usageStepsOnline: ["复制 Prompt", "描述Bug", "粘贴错误和代码", "获取修复方案"],
    usageStepsLocal: ["安装代码模型", "复制本地版 Prompt", "描述Bug后运行"],
    likes: 432,
  },
  {
    id: "research-assistant",
    title: "深度研究助手（学术级 v1.4）",
    subtitle: "输入研究主题，获得结构化的深度分析报告。",
    description: "帮助用户进行深度研究，生成结构化报告。",
    category: "思考与工作流",
    categorySlug: "thinking",
    difficulty: "advanced",
    rating: 4.9,
    usageCount: 765,
    lastUpdated: "2026.03",
    version: "v1.4",
    tags: ["研究", "分析", "报告"],
    featured: false,
    trending: false,
    beginner: false,
    promptOnline: `你是研究分析师。请对以下主题进行深度研究：

【研究主题】：{{研究主题}}
【研究目的】：{{研究目的}}
【关注重点】：{{关注重点}}

输出结构：
📋 研究摘要 → 🔍 研究背景 → 📊 现状分析 → 📈 趋势洞察 → 💡 核心发现 → 🎯 结论与建议`,
    promptLocal: `[系统指令] 你是研究分析师。
[输入] 主题：{topic} 目的：{purpose} 重点：{focus}
[输出] 1.摘要 2.背景 3.现状 4.趋势 5.发现 6.结论`,
    variables: [
      { name: "研究主题", placeholder: "例如：2026年AI行业趋势", required: true },
      { name: "研究目的", placeholder: "例如：为投资决策提供参考", required: false },
      { name: "关注重点", placeholder: "例如：市场规模、技术趋势", required: false },
    ],
    beforeAfter: {
      input: "研究主题：2026年中国AI大模型行业现状\n目的：了解行业格局\n重点：市场规模、主要玩家",
      outputs: [{
        model: "Claude Opus 4.7",
        text: `📋 研究摘要
2026年中国AI大模型市场进入成熟期，市场规模预计突破500亿元。多模态、Agent、端侧部署成为三大趋势。

📊 现状分析
- 2025年市场规模约380亿元，2026年预计520亿元
- 第一梯队：百度文心、阿里通义、字节豆包
- 通用大模型竞争白热化，垂直领域成为新增长点

📈 趋势洞察
1. 多模态融合 — 文本、图像、视频统一理解
2. Agent生态爆发 — 从问答到复杂任务执行
3. 端侧部署普及 — 手机PC本地运行大模型

🎯 建议
- 避开通用大模型赛道
- 选择有壁垒的垂直领域
- 重视Agent和工作流能力`,
      }],
    },
    recommendedModels: [
      { name: "Claude Opus 4.7", strengths: "分析深入、逻辑严密", useCase: "深度研究报告", audience: "需要专业分析的用户" },
      { name: "Grok 4.20", strengths: "信息量大、视角独特", useCase: "快速调研", audience: "需要快速了解行业的用户" },
    ],
    usageStepsOnline: ["复制 Prompt", "描述研究主题", "获取研究报告"],
    usageStepsLocal: ["安装知识量大的模型", "复制本地版 Prompt", "描述主题后运行"],
    likes: 234,
  },
  // ─── 数据分析 (data) ───────────────────────────────────
  {
    id: "sql-optimizer",
    title: "SQL查询优化助手（高性能版 v1.0）",
    subtitle: "粘贴慢查询SQL，获得索引建议、重写方案和执行计划解读。",
    description: "帮助DBA和后端开发者快速优化慢查询，提供索引策略和SQL重写建议。",
    category: "数据分析",
    categorySlug: "data",
    difficulty: "intermediate",
    rating: 4.8,
    usageCount: 1432,
    lastUpdated: "2026.05",
    version: "v1.0",
    tags: ["SQL", "性能优化", "数据库", "索引"],
    featured: false,
    trending: true,
    beginner: false,
    promptOnline: `你是资深DBA和SQL优化专家。请分析以下SQL查询：

【数据库类型】：{{数据库类型}}
【SQL语句】：{{SQL语句}}
【表结构/索引】：{{表结构}}
【数据量级】：{{数据量级}}

请按以下维度分析：
🔍 执行计划解读（扫描方式、连接方式）
⚡ 性能瓶颈识别（全表扫描、临时表、文件排序）
📊 索引建议（缺失索引、冗余索引、覆盖索引）
📝 优化后SQL（重写后的查询）
📈 预估提升效果

直接输出优化报告。`,
    promptLocal: `[系统指令] 你是SQL优化专家。
[输入] 数据库：{db_type} SQL：{sql} 表结构：{schema} 数据量：{volume}
[输出] 1.执行计划 2.瓶颈 3.索引建议 4.优化SQL 5.预估效果`,
    variables: [
      { name: "数据库类型", placeholder: "例如：MySQL 8.0、PostgreSQL 16", required: true },
      { name: "SQL语句", placeholder: "粘贴需要优化的SQL查询", required: true },
      { name: "表结构", placeholder: "相关表的CREATE TABLE语句或字段说明", required: false },
      { name: "数据量级", placeholder: "例如：用户表500万行，订单表2000万行", required: false },
    ],
    beforeAfter: {
      input: "数据库：MySQL 8.0\nSQL：SELECT * FROM orders WHERE user_id = 123 AND status != 'cancelled' ORDER BY created_at DESC\n数据量：orders表2000万行",
      outputs: [{
        model: "Claude Opus 4.7",
        text: `🔍 执行计划解读
当前：全表扫描（type: ALL），rows: 2000万，Using filesort
原因：缺少 (user_id, status, created_at) 复合索引

⚡ 性能瓶颈
1. 无索引导致全表扫描2000万行
2. ORDER BY created_at DESC 触发文件排序
3. SELECT * 回表查询所有字段

📊 索引建议
CREATE INDEX idx_orders_user_status_created
ON orders(user_id, status, created_at DESC);

使用覆盖索引减少回表：
CREATE INDEX idx_orders_covering
ON orders(user_id, status, created_at DESC)
INCLUDE (amount, product_id);

📝 优化后SQL
SELECT id, amount, product_id, created_at
FROM orders
WHERE user_id = 123 AND status != 'cancelled'
ORDER BY created_at DESC
LIMIT 50;

📈 预估提升
- 扫描行数：2000万 → ~50行
- 响应时间：3.2秒 → <10毫秒
- 提升约300倍`,
      }],
    },
    recommendedModels: [
      { name: "Claude Opus 4.7", strengths: "SQL理解深入、优化建议全面", useCase: "复杂查询优化", audience: "DBA和高级后端开发者" },
      { name: "DeepSeek V4", strengths: "代码理解强、速度快", useCase: "快速SQL审查", audience: "需要快速优化的开发者" },
    ],
    usageStepsOnline: ["复制 Prompt", "填入SQL和表结构", "获取优化报告", "应用索引建议"],
    usageStepsLocal: ["安装代码模型", "复制本地版 Prompt", "粘贴SQL后运行"],
    advancedTips: ["提供EXPLAIN输出结果可获得更精准的建议", "对于复杂JOIN查询，拆解为子查询逐步优化", "结合慢查询日志找出TOP 10热点SQL优先优化"],
    likes: 456,
  },
  {
    id: "data-cleaner",
    title: "数据清洗与预处理专家（规范化版 v1.0）",
    subtitle: "描述数据质量问题，获得清洗代码和规范化方案。",
    description: "帮助数据分析师和工程师快速编写数据清洗脚本，处理缺失值、异常值和格式不一致。",
    category: "数据分析",
    categorySlug: "data",
    difficulty: "intermediate",
    rating: 4.7,
    usageCount: 987,
    lastUpdated: "2026.05",
    version: "v1.0",
    tags: ["数据清洗", "ETL", "数据质量", "Python"],
    featured: false,
    trending: false,
    beginner: false,
    promptOnline: `你是数据工程专家。请为以下数据清洗需求编写代码：

【编程语言】：{{编程语言}}
【数据描述】：{{数据描述}}
【数据质量问题】：{{质量问题}}
【目标格式】：{{目标格式}}

输出：
🧹 问题诊断（逐项列出数据质量问题）
📝 清洗代码（完整可运行的脚本）
✅ 数据验证（清洗后的质量检查）
📊 前后对比（清洗效果统计）`,
    promptLocal: `[系统指令] 你是数据清洗专家。
[输入] 语言：{language} 数据：{data_desc} 问题：{issues} 目标：{target}
[输出] 1.问题诊断 2.清洗代码 3.验证脚本 4.前后对比`,
    variables: [
      { name: "编程语言", placeholder: "例如：Python (pandas)、SQL、R", required: true },
      { name: "数据描述", placeholder: "例如：电商订单数据，含user_id/amount/date/status等字段", required: true },
      { name: "质量问题", placeholder: "例如：日期格式不统一、金额有负数、状态字段有空值", required: true },
      { name: "目标格式", placeholder: "例如：统一为YYYY-MM-DD格式、金额保留2位小数", required: false },
    ],
    beforeAfter: {
      input: "语言：Python (pandas)\n数据：用户注册数据，含phone/email/birthday/gender字段\n问题：手机号格式不统一（有+86前缀、有空格、有横线）、邮箱有拼写错误、生日格式混乱、性别字段中英文混用",
      outputs: [{
        model: "Claude Opus 4.7",
        text: `🧹 问题诊断
1. 手机号：存在+86前缀、空格、横线等格式差异
2. 邮箱：部分拼写错误（gmial.com → gmail.com）
3. 生日：格式不统一（YYYY/MM/DD、DD-MM-YYYY、时间戳混用）
4. 性别：中英文混用（男/M/1、女/F/0）

📝 清洗代码
import pandas as pd
import re

def clean_phone(phone):
    if pd.isna(phone): return None
    digits = re.sub(r'[^0-9]', '', str(phone))
    if digits.startswith('86'): digits = digits[2:]
    return digits if len(digits) == 11 else None

def fix_email(email):
    if pd.isna(email): return None
    fixes = {'gmial.com':'gmail.com','gmal.com':'gmail.com','hotmal.com':'hotmail.com'}
    for wrong, right in fixes.items():
        email = email.replace(wrong, right)
    return email.lower().strip()

df['phone'] = df['phone'].apply(clean_phone)
df['email'] = df['email'].apply(fix_email)
df['birthday'] = pd.to_datetime(df['birthday'], errors='coerce').dt.strftime('%Y-%m-%d')
df['gender'] = df['gender'].map({'男':'男','M':'男','1':'男','女':'女','F':'女','0':'女'})

✅ 验证：print(df.isnull().sum()) 检查清洗后空值情况`,
      }],
    },
    recommendedModels: [
      { name: "Claude Opus 4.7", strengths: "代码质量高、边界处理完善", useCase: "复杂数据清洗", audience: "数据工程师" },
      { name: "DeepSeek V4", strengths: "Python代码能力强", useCase: "快速清洗脚本", audience: "数据分析师" },
    ],
    usageStepsOnline: ["复制 Prompt", "描述数据和问题", "获取清洗代码", "在本地运行测试"],
    usageStepsLocal: ["安装代码模型", "复制本地版 Prompt", "描述问题后运行"],
    likes: 321,
  },
  {
    id: "chart-advisor",
    title: "数据可视化图表推荐器（最佳实践版 v1.0）",
    subtitle: "描述数据特征和展示目的，获得最佳图表类型推荐和实现代码。",
    description: "帮助分析师选择最合适的图表类型，并生成可视化代码。",
    category: "数据分析",
    categorySlug: "data",
    difficulty: "beginner",
    rating: 4.6,
    usageCount: 1567,
    lastUpdated: "2026.05",
    version: "v1.0",
    tags: ["数据可视化", "图表", "报表", "ECharts"],
    featured: false,
    trending: true,
    beginner: true,
    promptOnline: `你是数据可视化专家。请根据以下信息推荐最佳图表：

【数据特征】：{{数据特征}}
【展示目的】：{{展示目的}}
【目标受众】：{{目标受众}}
【技术环境】：{{技术环境}}

输出：
📊 推荐图表类型（含理由）
🎨 设计要点（配色、标注、交互）
📝 实现代码（完整可运行）
💡 优化建议（可读性、美观度）`,
    promptLocal: `[系统指令] 你是数据可视化专家。
[输入] 数据：{data} 目的：{purpose} 受众：{audience} 环境：{tech}
[输出] 1.图表推荐 2.设计要点 3.代码 4.优化建议`,
    variables: [
      { name: "数据特征", placeholder: "例如：6个月的销售额时间序列，含产品类别维度", required: true },
      { name: "展示目的", placeholder: "例如：展示趋势变化、对比不同类别、展示占比", required: true },
      { name: "目标受众", placeholder: "例如：管理层汇报、技术团队内部、客户演示", required: false },
      { name: "技术环境", placeholder: "例如：React + ECharts、Python + Matplotlib、Excel", required: false },
    ],
    beforeAfter: {
      input: "数据：5个产品线6个月的销售额\n目的：展示各产品线的增长趋势对比\n受众：管理层月度汇报\n环境：React + ECharts",
      outputs: [{
        model: "Claude Opus 4.7",
        text: `📊 推荐图表：多系列折线图
理由：时间序列对比趋势，折线图最直观；5条线不拥挤，管理层一眼看懂

🎨 设计要点
- 配色：使用对比色系，避免相近色
- Y轴：从0开始，标注千分位
- 交互：hover显示具体数值，点击图例隐藏/显示
- 标注：在最新数据点旁显示当前值

📝 ECharts配置
const option = {
  tooltip: { trigger: 'axis' },
  legend: { data: products },
  xAxis: { type: 'category', data: months },
  yAxis: { type: 'value', axisLabel: { formatter: '¥{value}' } },
  series: products.map(p => ({
    name: p, type: 'line', smooth: true,
    data: getData(p), label: { show: true, position: 'right' }
  }))
};

💡 优化建议
- 添加同比/环比增长率副标题
- 突出增长最快的产品线（加粗+阴影）`,
      }],
    },
    recommendedModels: [
      { name: "Claude Opus 4.7", strengths: "可视化设计经验丰富", useCase: "专业报表设计", audience: "数据分析师" },
      { name: "Qwen 3.6", strengths: "ECharts配置熟练", useCase: "快速图表代码", audience: "前端开发者" },
    ],
    usageStepsOnline: ["复制 Prompt", "描述数据和目的", "获取推荐和代码", "调整后集成"],
    usageStepsLocal: ["安装代码模型", "复制本地版 Prompt", "描述数据后运行"],
    likes: 234,
  },
  {
    id: "data-insight",
    title: "数据洞察报告生成器（叙事版 v1.0）",
    subtitle: "输入数据摘要或关键指标，生成有故事性的数据洞察报告。",
    description: "将枯燥的数据转化为有叙事感的洞察报告，适合向非技术人员汇报。",
    category: "数据分析",
    categorySlug: "data",
    difficulty: "advanced",
    rating: 4.9,
    usageCount: 678,
    lastUpdated: "2026.05",
    version: "v1.0",
    tags: ["数据分析", "洞察", "业务报告", "数据叙事"],
    featured: true,
    trending: false,
    beginner: false,
    promptOnline: `你是数据叙事专家，擅长将数据转化为有洞察力的商业故事。请分析以下数据：

【业务背景】：{{业务背景}}
【关键数据】：{{关键数据}}
【分析目的】：{{分析目的}}

输出结构：
📖 数据故事摘要（一段话概括核心发现）
📊 关键指标解读（每个指标的含义和变化原因）
🔍 深层洞察（数据背后的原因和规律）
⚠️ 风险预警（需要关注的异常信号）
🎯 行动建议（基于数据的具体建议）

要求：用业务语言而非技术术语，让非技术人员也能看懂。`,
    promptLocal: `[系统指令] 你是数据叙事专家。
[输入] 背景：{background} 数据：{data} 目的：{purpose}
[输出] 1.故事摘要 2.指标解读 3.深层洞察 4.风险预警 5.行动建议`,
    variables: [
      { name: "业务背景", placeholder: "例如：某电商平台Q1运营数据回顾", required: true },
      { name: "关键数据", placeholder: "例如：GMV 2.3亿(+15%)、复购率32%(-3%)、客单价280元(+8%)", required: true },
      { name: "分析目的", placeholder: "例如：向CEO汇报Q1运营表现，制定Q2策略", required: true },
    ],
    beforeAfter: {
      input: "背景：某教育平台Q1数据回顾\n数据：新用户50万(+20%)、付费转化率8%(-2%)、课程完课率45%(+5%)、退款率12%(+3%)、NPS 42(-8)\n目的：找出问题并制定改进方案",
      outputs: [{
        model: "Claude Opus 4.7",
        text: `📖 数据故事摘要
Q1用户增长强劲，但"繁荣"背后暗藏隐忧：新增用户质量下滑导致转化率和NPS双降，退款率上升侵蚀了增长红利。

📊 关键指标解读
- 新用户+20%：增长引擎正常，但需关注来源质量
- 转化率-2%：新增用户中低质量流量占比上升
- 完课率+5%：老用户体验在改善，产品迭代有效
- 退款率+3%：新用户预期管理不到位
- NPS -8：用户满意度显著下降，需紧急关注

🔍 深层洞察
增长与体验的剪刀差正在扩大。花钱买来的用户没有被好好服务，形成"高获客-低转化-高退款"的恶性循环。

⚠️ 风险预警
NPS连续2个季度下降，若Q2不改善，可能出现口碑塌方。

🎯 行动建议
1. 立即：优化新用户引导流程，减少信息差
2. 短期：调整获客渠道，砍掉低质量投放
3. 中期：建立用户分层运营体系`,
      }],
    },
    recommendedModels: [
      { name: "Claude Opus 4.7", strengths: "分析深入、叙事能力强", useCase: "管理层汇报", audience: "数据分析师、运营负责人" },
      { name: "Grok 4.20", strengths: "视角独特、创意表达", useCase: "创新洞察", audience: "需要新视角的分析师" },
    ],
    usageStepsOnline: ["复制 Prompt", "填入业务数据", "获取洞察报告", "调整后汇报"],
    usageStepsLocal: ["安装推理强的模型", "复制本地版 Prompt", "描述数据后运行"],
    advancedTips: ["提供同比和环比数据可获得更精准的趋势分析", "加入竞品数据可获得竞争视角的洞察", "指定汇报对象（CEO/产品/运营）会调整语言风格"],
    likes: 289,
  },
  // ─── 效率工具 (productivity) ─────────────────────────────
  {
    id: "meeting-summary",
    title: "会议纪要智能生成器（结构化版 v1.0）",
    subtitle: "粘贴会议记录或要点，自动生成结构化会议纪要。",
    description: "将零散的会议记录整理成专业的会议纪要，提取行动项和决策。",
    category: "效率工具",
    categorySlug: "productivity",
    difficulty: "beginner",
    rating: 4.8,
    usageCount: 2345,
    lastUpdated: "2026.05",
    version: "v1.0",
    tags: ["会议纪要", "效率", "职场", "记录"],
    featured: false,
    trending: true,
    beginner: true,
    promptOnline: `你是会议记录专家。请将以下会议内容整理成结构化纪要：

【会议主题】：{{会议主题}}
【参会人员】：{{参会人员}}
【会议记录】：{{会议记录}}

输出格式：
📋 会议基本信息（主题、时间、参会人）
🎯 核心议题（本次会议讨论的主要问题）
✅ 决议事项（达成共识的决定）
📝 行动项（谁、做什么、截止时间）
📅 下次会议安排

要求：简洁明了，突出行动项和责任人。`,
    promptLocal: `[系统指令] 你是会议纪要专家。
[输入] 主题：{topic} 参会人：{attendees} 记录：{notes}
[输出] 1.基本信息 2.核心议题 3.决议 4.行动项 5.下次安排`,
    variables: [
      { name: "会议主题", placeholder: "例如：Q2产品规划讨论会", required: true },
      { name: "参会人员", placeholder: "例如：产品-张三、开发-李四、设计-王五", required: false },
      { name: "会议记录", placeholder: "粘贴会议记录或口述要点", required: true },
    ],
    beforeAfter: {
      input: "主题：Q2产品规划会\n参会人：张三(产品)、李四(开发)、王五(设计)\n记录：讨论了三个需求，用户反馈说搜索不好用要优化，李四说需要2周，王五出设计方案3天。还有会员体系要重构，这个比较大要一个月。下周三之前张三出PRD。",
      outputs: [{
        model: "Claude Opus 4.7",
        text: `📋 会议基本信息
主题：Q2产品规划讨论会
参会人：张三(产品)、李四(开发)、王五(设计)

🎯 核心议题
1. 搜索功能优化 — 用户反馈搜索体验差
2. 会员体系重构 — Q2重点工程

✅ 决议事项
1. 搜索优化纳入Q2优先级
2. 会员体系重构正式启动

📝 行动项
| 责任人 | 事项 | 截止时间 |
|--------|------|----------|
| 张三 | 输出搜索优化PRD | 下周三前 |
| 王五 | 搜索结果页设计方案 | PRD后3天 |
| 李四 | 搜索优化开发 | 设计确认后2周 |
| 张三 | 会员体系重构PRD | 待排期 |

📅 下次会议
待定（PRD完成后召开评审会）`,
      }],
    },
    recommendedModels: [
      { name: "Claude Opus 4.7", strengths: "结构化输出最佳", useCase: "正式会议纪要", audience: "项目经理、行政人员" },
      { name: "Qwen 3.6", strengths: "中文理解好、速度快", useCase: "快速整理", audience: "需要快速出纪要的职场人" },
    ],
    usageStepsOnline: ["复制 Prompt", "粘贴会议记录", "获取结构化纪要", "发送给参会人"],
    usageStepsLocal: ["安装中文模型", "复制本地版 Prompt", "粘贴记录后运行"],
    likes: 567,
  },
  {
    id: "task-planner",
    title: "智能任务分解与排期助手（敏捷版 v1.0）",
    subtitle: "描述项目目标，自动分解为可执行任务并生成排期计划。",
    description: "将大目标拆解为具体可执行的任务清单，估算工时并生成甘特图式排期。",
    category: "效率工具",
    categorySlug: "productivity",
    difficulty: "intermediate",
    rating: 4.8,
    usageCount: 1234,
    lastUpdated: "2026.05",
    version: "v1.0",
    tags: ["任务管理", "排期", "项目管理", "敏捷"],
    featured: true,
    trending: true,
    beginner: false,
    promptOnline: `你是项目管理专家。请将以下项目目标分解为可执行任务：

【项目目标】：{{项目目标}}
【团队规模】：{{团队规模}}
【截止日期】：{{截止日期}}
【技术约束】：{{技术约束}}

输出：
🎯 项目概览（一句话定义成功标准）
📋 任务分解（WBS，按模块/功能拆分）
⏱️ 工时估算（每个任务的预估工时）
📅 排期计划（按Sprint排列，标注里程碑）
⚠️ 风险点（可能的延期风险和应对）`,
    promptLocal: `[系统指令] 你是项目管理专家。
[输入] 目标：{goal} 团队：{team} 截止：{deadline} 约束：{constraints}
[输出] 1.概览 2.任务分解 3.工时估算 4.排期 5.风险点`,
    variables: [
      { name: "项目目标", placeholder: "例如：上线电商小程序MVP版本", required: true },
      { name: "团队规模", placeholder: "例如：3前端+2后端+1设计", required: true },
      { name: "截止日期", placeholder: "例如：6周后上线", required: true },
      { name: "技术约束", placeholder: "例如：使用React Native、对接现有后端API", required: false },
    ],
    beforeAfter: {
      input: "目标：开发一个内部工单系统MVP\n团队：2前端+2后端+1设计\n截止：4周\n约束：使用React + Node.js + PostgreSQL",
      outputs: [{
        model: "Claude Opus 4.7",
        text: `🎯 项目概览
4周内交付工单系统MVP，支持创建、分配、处理、关闭工单全流程。

📋 任务分解 & 排期

Sprint 1（第1-2周）— 基础功能
| 任务 | 负责 | 工时 |
|------|------|------|
| 数据库设计 | 后端A | 1天 |
| 用户认证API | 后端A | 2天 |
| 工单CRUD API | 后端B | 3天 |
| UI设计稿 | 设计 | 3天 |
| 登录/注册页面 | 前端A | 2天 |
| 工单列表/详情页 | 前端B | 3天 |

Sprint 2（第3-4周）— 核心流程
| 任务 | 负责 | 工时 |
|------|------|------|
| 工单流转API | 后端A | 2天 |
| 通知系统 | 后端B | 2天 |
| 工单创建/处理表单 | 前端A | 3天 |
| 筛选/搜索/统计 | 前端B | 3天 |
| 联调测试 | 全员 | 2天 |
| Bug修复+上线 | 全员 | 2天 |

⚠️ 风险点
1. 通知系统复杂度可能超预期 → 预留1天buffer
2. 前后端联调可能发现接口不一致 → Sprint1结束前对齐接口文档`,
      }],
    },
    recommendedModels: [
      { name: "Claude Opus 4.7", strengths: "结构化规划能力强", useCase: "复杂项目排期", audience: "项目经理、技术负责人" },
      { name: "Grok 4.20", strengths: "视角全面", useCase: "风险评估", audience: "需要风险分析的PM" },
    ],
    usageStepsOnline: ["复制 Prompt", "描述项目信息", "获取排期计划", "导入项目管理工具"],
    usageStepsLocal: ["安装推理模型", "复制本地版 Prompt", "描述项目后运行"],
    advancedTips: ["提供团队成员的技能特长可获得更精准的任务分配", "加入历史项目数据可提高工时估算准确度", "指定使用的项目管理工具（Jira/飞书/Notion）可生成对应格式"],
    likes: 456,
  },
  {
    id: "email-drafter-v2",
    title: "商务邮件批量生成器（多场景版 v2.0）",
    subtitle: "选择场景，输入要点，批量生成多封专业商务邮件。",
    description: "支持多种商务场景的邮件批量生成，一次搞定一周的邮件。",
    category: "效率工具",
    categorySlug: "productivity",
    difficulty: "beginner",
    rating: 4.7,
    usageCount: 1876,
    lastUpdated: "2026.05",
    version: "v2.0",
    tags: ["邮件", "商务沟通", "效率", "批量"],
    featured: false,
    trending: false,
    beginner: true,
    promptOnline: `你是商务邮件专家。请根据以下场景生成邮件：

【邮件场景】：{{邮件场景}}
【收件人】：{{收件人}}
【核心要点】：{{核心要点}}
【语气风格】：{{语气风格}}
【邮件数量】：{{邮件数量}}

每封邮件包含：
Subject: 主题行
称呼 + 正文（目的→内容→行动号召）+ 落款

要求：每封邮件风格和措辞要有差异，避免重复。`,
    promptLocal: `[系统指令] 你是商务邮件专家，批量生成邮件。
[输入] 场景：{scene} 收件人：{recipient} 要点：{points} 风格：{tone} 数量：{count}
[输出] 多封邮件，每封含Subject+正文+落款`,
    variables: [
      { name: "邮件场景", placeholder: "例如：客户跟进、项目汇报、会议邀请", required: true },
      { name: "收件人", placeholder: "例如：客户张总、团队成员、合作伙伴", required: true },
      { name: "核心要点", placeholder: "例如：产品Demo邀请、项目进度更新", required: true },
      { name: "语气风格", placeholder: "例如：正式、友好、轻松", required: false },
      { name: "邮件数量", placeholder: "例如：3封", required: false },
    ],
    beforeAfter: {
      input: "场景：新客户首次跟进\n收件人：科技公司CTO\n要点：上周展会认识，介绍我们的数据分析产品\n风格：专业但不死板\n数量：3封",
      outputs: [{
        model: "Claude Opus 4.7",
        text: `--- 邮件1：展会回忆 ---
Subject: 展会一别，关于数据分析的后续讨论

李总您好！

上周在数字峰会上与您交流数据分析的话题，受益匪浅。您提到贵司正在寻找实时数据看板的解决方案，这恰好是我们的专长领域。

附上一份我们为同行业客户做的案例简报，供您参考。如果方便，这周找个时间线上聊15分钟？

期待您的回复。

--- 邮件2：价值切入 ---
Subject: 帮助贵司数据团队提效30%的方案

李总好！

继展会之后，我整理了一份针对贵司业务场景的数据分析方案。核心价值：
- 实时看板：数据延迟从小时级降到秒级
- 自助分析：业务人员无需写SQL即可出报表
- 成本节约：预计降低40%的数据处理人力

方便的话发您详细方案？

--- 邮件3：轻量提醒 ---
Subject: 简短跟进 — 数据分析方案

李总好！

简短跟进一下，之前发的数据分析方案您看了吗？有任何疑问随时联系我，也可以安排一个15分钟的快速Demo。

祝工作顺利！`,
      }],
    },
    recommendedModels: [
      { name: "Claude Opus 4.7", strengths: "措辞得体、风格多变", useCase: "高质量商务邮件", audience: "销售、BD、商务" },
      { name: "Qwen 3.6", strengths: "中文自然、批量快", useCase: "快速批量生成", audience: "需要大量邮件的职场人" },
    ],
    usageStepsOnline: ["复制 Prompt", "填入场景和要点", "获取多封邮件", "选择合适的使用"],
    usageStepsLocal: ["安装中文模型", "复制本地版 Prompt", "描述场景后运行"],
    likes: 345,
  },
  {
    id: "workflow-automator",
    title: "工作流自动化方案设计器（n8n/Make版 v1.0）",
    subtitle: "描述重复性工作流程，获得自动化方案和实现步骤。",
    description: "帮助用户识别可自动化的工作环节，设计自动化方案。",
    category: "效率工具",
    categorySlug: "productivity",
    difficulty: "advanced",
    rating: 4.8,
    usageCount: 567,
    lastUpdated: "2026.05",
    version: "v1.0",
    tags: ["自动化", "工作流", "n8n", "效率"],
    featured: false,
    trending: true,
    beginner: false,
    promptOnline: `你是工作流自动化专家。请为以下流程设计自动化方案：

【当前流程】：{{当前流程}}
【涉及工具】：{{涉及工具}}
【痛点】：{{痛点}}
【期望效果】：{{期望效果}}

输出：
🔍 流程分析（哪些环节可自动化）
🏗️ 自动化架构（触发→处理→输出的完整链路）
📝 实现步骤（具体操作指南）
⚙️ 工具配置（推荐工具和配置参数）
📊 ROI估算（节省时间/人力）`,
    promptLocal: `[系统指令] 你是自动化专家。
[输入] 流程：{process} 工具：{tools} 痛点：{pain_points} 目标：{goal}
[输出] 1.流程分析 2.架构设计 3.实现步骤 4.工具配置 5.ROI`,
    variables: [
      { name: "当前流程", placeholder: "例如：每天手动从3个平台导出数据→合并→生成报表→发邮件", required: true },
      { name: "涉及工具", placeholder: "例如：Google Sheets、飞书、邮件、CRM", required: true },
      { name: "痛点", placeholder: "例如：每天花2小时、容易出错、经常忘记", required: true },
      { name: "期望效果", placeholder: "例如：全自动运行、出异常自动告警", required: false },
    ],
    beforeAfter: {
      input: "流程：每周从GitHub收集PR数据→统计代码量→生成周报→发到飞书群\n工具：GitHub、飞书、Google Sheets\n痛点：每周花2小时手动整理，数据容易遗漏\n目标：全自动、周一早上自动发",
      outputs: [{
        model: "Claude Opus 4.7",
        text: `🔍 流程分析
可自动化环节：数据采集(100%)、统计计算(100%)、报告生成(90%)、发送(100%)
需人工环节：异常数据复核(偶尔)

🏗️ 自动化架构
触发器：Cron定时（每周一8:00）
→ GitHub API：获取上周所有PR
→ 数据处理：统计代码行数、PR数量、review数
→ 模板渲染：生成Markdown周报
→ 飞书Webhook：推送到指定群

📝 n8n实现步骤
1. 新建Workflow，添加Schedule节点（Mon 8:00）
2. HTTP Request节点调GitHub API：GET /repos/{owner}/{repo}/pulls?state=all&since=7d
3. Function节点：统计merged/closed/新增PR数量和代码行数
4. Markdown节点：套用周报模板
5. HTTP Request节点：POST飞书Webhook

⚙️ 飞书Webhook配置
URL: https://open.feishu.cn/open-apis/bot/v2/hook/{token}
Content-Type: application/json
Body: {"msg_type":"text","content":{"text":"{markdown_report}"}}

📊 ROI
- 每周节省2小时 → 年省104小时
- 数据准确性：人工95% → 自动化99.9%`,
      }],
    },
    recommendedModels: [
      { name: "Claude Opus 4.7", strengths: "架构设计全面", useCase: "复杂工作流设计", audience: "运营、技术负责人" },
      { name: "DeepSeek V4", strengths: "代码和API理解强", useCase: "API集成方案", audience: "需要技术实现的用户" },
    ],
    usageStepsOnline: ["复制 Prompt", "描述当前流程", "获取自动化方案", "按步骤实施"],
    usageStepsLocal: ["安装代码模型", "复制本地版 Prompt", "描述流程后运行"],
    advancedTips: ["提供现有工具的API文档可获得更精确的实现代码", "描述异常场景可获得更完善的容错方案", "先自动化最痛的环节，再逐步扩展"],
    likes: 234,
  },
  {
    id: "daily-planner",
    title: "智能日程规划器（时间块版 v1.0）",
    subtitle: "输入今天的待办事项和约束，生成最优时间块安排。",
    description: "根据任务优先级、精力曲线和时间约束，生成科学的日程安排。",
    category: "效率工具",
    categorySlug: "productivity",
    difficulty: "beginner",
    rating: 4.6,
    usageCount: 2100,
    lastUpdated: "2026.05",
    version: "v1.0",
    tags: ["日程", "时间管理", "效率", "规划"],
    featured: false,
    trending: false,
    beginner: true,
    promptOnline: `你是时间管理专家。请为今天安排最优日程：

【今日待办】：{{今日待办}}
【固定安排】：{{固定安排}}
【精力状态】：{{精力状态}}
【工作时间】：{{工作时间}}

输出：
📅 今日时间表（时间块排列）
🎯 优先级排序（为什么这样排）
💡 效率建议（基于任务特点的执行建议）
⚠️ 缓冲时间（预留的弹性时间）`,
    promptLocal: `[系统指令] 你是时间管理专家。
[输入] 待办：{todos} 固定：{fixed} 精力：{energy} 工作时间：{hours}
[输出] 1.时间表 2.排序理由 3.效率建议 4.缓冲时间`,
    variables: [
      { name: "今日待办", placeholder: "例如：写周报、代码review、产品需求讨论、学习React", required: true },
      { name: "固定安排", placeholder: "例如：10:00站会、14:00客户电话", required: false },
      { name: "精力状态", placeholder: "例如：上午精力最好、下午容易犯困", required: false },
      { name: "工作时间", placeholder: "例如：9:00-18:00", required: false },
    ],
    beforeAfter: {
      input: "待办：写Q2规划PPT、代码review 3个PR、产品需求评审准备、回复10封邮件、学习TypeScript泛型\n固定：10:00站会15分钟、15:00客户电话30分钟\n精力：上午最清醒、午后犯困\n时间：9:00-18:00",
      outputs: [{
        model: "Claude Opus 4.7",
        text: `📅 今日时间表

09:00-09:50  📝 写Q2规划PPT（高专注）
09:50-10:00  ☕ 休息
10:00-10:15  📢 站会
10:15-11:15  💻 代码Review（3个PR）
11:15-11:30  📧 回复邮件（批量处理）
11:30-12:00  📋 产品需求评审准备
12:00-13:00  🍽️ 午餐+午休
13:00-13:30  📧 继续回复邮件
13:30-14:30  📝 继续写PPT（低精力时段做整理性工作）
14:30-15:00  📞 准备客户电话要点
15:00-15:30  📞 客户电话
15:30-16:30  📚 学习TypeScript泛型
16:30-17:30  📝 PPT收尾
17:30-18:00  📧 邮件收尾+明日计划

🎯 排序理由
- PPT最重要且需要创造力 → 放在精力高峰
- 代码Review需要专注 → 上午第二优先
- 邮件可以批量处理 → 穿插在碎片时间
- 学习放在下午 → 犯困时换换脑子

💡 效率建议
- PPT先写大纲再填内容，避免边写边想
- Review按PR大小排序，先小后大
- 邮件用2分钟法则：能立刻回复的马上回`,
      }],
    },
    recommendedModels: [
      { name: "Claude Opus 4.7", strengths: "规划合理、考虑全面", useCase: "日程优化", audience: "需要管理时间的职场人" },
      { name: "Qwen 3.6", strengths: "响应快", useCase: "快速排日程", audience: "每天使用的效率达人" },
    ],
    usageStepsOnline: ["复制 Prompt", "填入今日待办", "获取时间表", "按计划执行"],
    usageStepsLocal: ["安装中文模型", "复制本地版 Prompt", "描述待办后运行"],
    likes: 456,
  },
  // ─── 创意写作 (creative) ──────────────────────────────
  {
    id: "story-outliner",
    title: "小说故事大纲生成器（多类型版 v1.0）",
    subtitle: "输入题材和核心设定，生成完整的故事大纲和章节规划。",
    description: "帮助网文作者和创意写作者快速生成故事框架，解决卡文问题。",
    category: "创意写作",
    categorySlug: "creative",
    difficulty: "beginner",
    rating: 4.8,
    usageCount: 1890,
    lastUpdated: "2026.05",
    version: "v1.0",
    tags: ["小说", "故事", "创意写作", "大纲"],
    featured: true,
    trending: true,
    beginner: true,
    promptOnline: `你是资深故事架构师和创意写作教练。请根据以下设定生成故事大纲：

【题材类型】：{{题材类型}}
【核心设定】：{{核心设定}}
【主角设定】：{{主角设定}}
【故事长度】：{{故事长度}}
【风格偏好】：{{风格偏好}}

输出：
📖 一句话故事线（Logline）
🏗️ 三幕结构大纲（开端→发展→高潮→结局）
👤 人物关系图（主角、对手、盟友）
📋 章节规划（每章核心事件和冲突）
💡 故事亮点（3个让人想读下去的钩子）`,
    promptLocal: `[系统指令] 你是故事架构师。
[输入] 题材：{genre} 设定：{setting} 主角：{protagonist} 长度：{length} 风格：{style}
[输出] 1.Logline 2.三幕结构 3.人物关系 4.章节规划 5.故事亮点`,
    variables: [
      { name: "题材类型", placeholder: "例如：都市悬疑、仙侠修真、科幻末日、言情", required: true },
      { name: "核心设定", placeholder: "例如：2045年AI觉醒后的世界、古代修仙门派", required: true },
      { name: "主角设定", placeholder: "例如：失忆的AI研究员、被逐出师门的天才弟子", required: true },
      { name: "故事长度", placeholder: "例如：10万字中篇、50万字长篇", required: false },
      { name: "风格偏好", placeholder: "例如：轻松幽默、严肃深刻、爽文节奏", required: false },
    ],
    beforeAfter: {
      input: "题材：都市悬疑\n设定：一个能通过梦境预见凶案的心理咨询师\n主角：30岁女心理咨询师，有创伤后应激障碍\n长度：20万字\n风格：悬疑为主，心理分析穿插",
      outputs: [{
        model: "Claude Opus 4.7",
        text: `📖 Logline
心理咨询师林晚每次治愈一个患者，就会梦到下一个受害者——直到她发现，凶手就坐在她的咨询室里。

🏗️ 三幕结构

第一幕：入局（1-5章）
- 林晚治疗PTSD患者时，梦到一起凶杀案
- 第二天新闻报道：梦境成真
- 连续三次后，她确信自己有预知能力
- 警方注意到她"巧合"地出现在案发现场附近

第二幕：深入（6-15章）
- 林晚主动协助警方，用梦境线索破案
- 发现受害者都是某心理咨询APP的用户
- 凶手似乎了解心理学，作案手法专业
- 林晚的PTSD开始恶化，梦境越来越清晰

第三幕：真相（16-22章）
- 林晚意识到凶手是她的同行——一位知名心理学教授
- 教授利用咨询关系筛选受害者
- 最终对决在心理咨询室展开
- 林晚用心理学技巧拖延时间等待警方

👤 核心人物
林晚：主角，30岁，PTSD患者，梦境能力
方远：刑警队长，务实，从怀疑到信任
陆教授：反派，50岁，慈祥外表下的连环杀手

💡 三个钩子
1. 第一章结尾：梦中的受害者第二天真的死了
2. 中期反转：受害者都曾是凶手的"成功案例"
3. 高潮：林晚成为下一个目标`,
      }],
    },
    recommendedModels: [
      { name: "Claude Opus 4.7", strengths: "叙事结构最强、创意丰富", useCase: "长篇小说大纲", audience: "网文作者、编剧" },
      { name: "Grok 4.20", strengths: "创意天马行空", useCase: "脑暴灵感", audience: "需要突破思路的作者" },
    ],
    usageStepsOnline: ["复制 Prompt", "填入设定信息", "获取完整大纲", "按章节规划写作"],
    usageStepsLocal: ["安装创意强的模型", "复制本地版 Prompt", "描述设定后运行"],
    advancedTips: ["提供你喜欢的作品作为参考，AI会模仿其结构风格", "先生成大纲再逐章展开，避免写到一半卡住", "让AI为每个角色写一段内心独白，加深人物理解"],
    likes: 678,
  },
  {
    id: "character-builder",
    title: "角色深度塑造器（心理学版 v1.0）",
    subtitle: "输入角色基本信息，获得完整的心理档案和行为逻辑。",
    description: "用心理学框架塑造立体角色，让人物不再脸谱化。",
    category: "创意写作",
    categorySlug: "creative",
    difficulty: "intermediate",
    rating: 4.8,
    usageCount: 1234,
    lastUpdated: "2026.05",
    version: "v1.0",
    tags: ["角色塑造", "人物", "创意写作", "心理学"],
    featured: false,
    trending: false,
    beginner: false,
    promptOnline: `你是角色设计专家和心理学顾问。请为以下角色创建深度档案：

【角色基本信息】：{{角色基本信息}}
【在故事中的定位】：{{定位}}
【核心冲突】：{{核心冲突}}

输出：
👤 角色概览（姓名、年龄、外貌、职业）
🧠 心理档案（MBTI、依恋类型、核心恐惧、深层欲望）
📖 人物弧光（从故事开始到结束的心理变化轨迹）
💬 语言风格（口头禅、说话习惯、用词偏好）
🔗 关系网络（与其他角色的动态关系）
⚡ 关键场景（3个最能展现角色深度的场景设计）`,
    promptLocal: `[系统指令] 你是角色设计专家。
[输入] 基本信息：{info} 定位：{role} 冲突：{conflict}
[输出] 1.概览 2.心理档案 3.人物弧光 4.语言风格 5.关系网络 6.关键场景`,
    variables: [
      { name: "角色基本信息", placeholder: "例如：28岁程序员，内向，童年缺爱", required: true },
      { name: "在故事中的定位", placeholder: "例如：主角、反派、导师、红颜知己", required: true },
      { name: "核心冲突", placeholder: "例如：渴望被爱但害怕亲密关系", required: true },
    ],
    beforeAfter: {
      input: "基本信息：35岁女刑警队长，离婚，有一个8岁女儿\n定位：悬疑小说主角\n核心冲突：职业使命感和母亲角色的撕裂",
      outputs: [{
        model: "Claude Opus 4.7",
        text: `👤 角色概览
姓名：沈若晴 | 年龄：35 | 职业：市刑警队副队长
外貌：短发利落，左手无名指有戒痕，习惯性皱眉

🧠 心理档案
- MBTI：ISTJ（实际、负责、但内心有柔软角落）
- 核心恐惧：女儿长大后恨自己"总是不在"
- 深层欲望：证明自己不需要任何人也能活得好
- 防御机制：工作狂——用忙碌回避情感空洞
- 依恋类型：回避型（前夫说"你什么都好，就是不会示弱"）

📖 人物弧光
开篇：高效冷酷的"破案机器"，女儿由母亲带
中段：一个涉及儿童的案件触动她，开始反思
高潮：女儿被卷入危险，她第一次在同事面前崩溃
结局：学会求助，重新定义"强大"不是独自扛

💬 语言风格
- 简短直接："说重点。""几点的事？"
- 紧张时会摸左手无名指
- 对女儿会不自觉放软声音
- 从不说"我害怕"，会说"这个情况有点复杂"

⚡ 关键场景
1. 凌晨3点结案后，坐在车里看女儿的语音消息，没有点开
2. 嫌疑人说"你连自己的家都顾不好"，她手抖但声音稳
3. 女儿画的全家福里没有妈妈，她把画压在办公桌玻璃下`,
      }],
    },
    recommendedModels: [
      { name: "Claude Opus 4.7", strengths: "心理学理解深、角色立体", useCase: "深度角色塑造", audience: "小说作者、编剧" },
      { name: "Grok 4.20", strengths: "创意视角独特", useCase: "角色灵感", audience: "需要新角度的作者" },
    ],
    usageStepsOnline: ["复制 Prompt", "描述角色信息", "获取完整档案", "用于写作参考"],
    usageStepsLocal: ["安装创意模型", "复制本地版 Prompt", "描述角色后运行"],
    likes: 456,
  },
  {
    id: "world-builder",
    title: "世界观架构师（系统化版 v1.0）",
    subtitle: "描述故事背景设定，获得完整的世界观体系文档。",
    description: "系统化构建虚构世界的政治、经济、文化、魔法/科技体系。",
    category: "创意写作",
    categorySlug: "creative",
    difficulty: "advanced",
    rating: 4.9,
    usageCount: 567,
    lastUpdated: "2026.05",
    version: "v1.0",
    tags: ["世界观", "设定", "奇幻", "科幻"],
    featured: false,
    trending: false,
    beginner: false,
    promptOnline: `你是世界观架构师。请根据以下核心设定构建完整世界观：

【核心设定】：{{核心设定}}
【世界类型】：{{世界类型}}
【故事基调】：{{故事基调}}

输出：
🌍 世界概况（地理、气候、文明程度）
🏛️ 政治体系（势力划分、权力结构）
💰 经济体系（货币、贸易、资源）
⚔️ 力量体系（魔法/科技的规则和限制）
📜 历史大事记（影响当前世界格局的关键事件）
🎭 文化与信仰（宗教、习俗、禁忌）
🗺️ 重要地标（5个关键地点及特色）

要求：体系之间要有内在逻辑，不能自相矛盾。`,
    promptLocal: `[系统指令] 你是世界观架构师。
[输入] 核心设定：{core} 类型：{type} 基调：{tone}
[输出] 1.概况 2.政治 3.经济 4.力量体系 5.历史 6.文化 7.地标`,
    variables: [
      { name: "核心设定", placeholder: "例如：灵气复苏后的现代都市、太空殖民时代", required: true },
      { name: "世界类型", placeholder: "例如：东方仙侠、西方奇幻、赛博朋克、末日废土", required: true },
      { name: "故事基调", placeholder: "例如：热血少年、权谋暗黑、轻松日常", required: false },
    ],
    beforeAfter: {
      input: "核心设定：末日核战后200年，人类在地下城重建文明\n世界类型：末日废土+蒸汽朋克\n基调：生存与希望",
      outputs: [{
        model: "Claude Opus 4.7",
        text: `🌍 世界概况
地表：辐射荒漠，白天50°C，夜晚-20°C，变异生物横行
地下：7座地下城通过隧道网络相连，总人口约200万
文明程度：蒸汽动力+回收科技，相当于工业革命初期

🏛️ 政治体系
每座地下城由"城主议会"统治（3-5人）
七城联盟名义统一，实际各自为政
最大的势力：铁壁城（军事）、绿洲城（农业）、齿轮城（工业）

💰 经济体系
货币："齿轮币"（金属铸造）
核心资源：净水、燃料、可种植土壤
贸易：绿洲城的粮食换齿轮城的机械，铁壁城提供军事保护

⚔️ 力量体系："蒸汽核心"
从旧世界残骸中发掘的能源晶体
能驱动蒸汽机甲、增强人体、甚至短暂控制天气
限制：核心能量会腐蚀使用者身体（代价体系）
最强战力："核心骑士"——与蒸汽核心融合的战士

📜 历史大事记
- 核战（200年前）：文明毁灭，幸存者转入地下
- 大隧道（150年前）：七城连通，联盟成立
- 核心发现（80年前）：蒸汽核心被发掘，科技跃进
- 第一次城战（30年前）：绿洲城与铁壁城争夺水源

🎭 文化信仰
信奉"大地之母"——认为地表终将恢复
禁忌：不可在地表过夜（传说会被辐射变成怪物）`,
      }],
    },
    recommendedModels: [
      { name: "Claude Opus 4.7", strengths: "体系设计最完善、逻辑自洽", useCase: "复杂世界观构建", audience: "长篇小说作者、游戏策划" },
      { name: "Grok 4.20", strengths: "创意独特、设定新颖", useCase: "世界观灵感", audience: "需要突破套路的创作者" },
    ],
    usageStepsOnline: ["复制 Prompt", "描述核心设定", "获取世界观文档", "作为写作参考"],
    usageStepsLocal: ["安装创意模型", "复制本地版 Prompt", "描述设定后运行"],
    advancedTips: ["先确定力量体系的'限制'比确定'能力'更重要——限制产生冲突", "让AI检查世界观的自洽性：'这个世界有什么逻辑漏洞？'", "为每个势力写一段宣传语，能快速理解其价值观"],
    likes: 345,
  },
  {
    id: "dialogue-polisher",
    title: "对白润色与优化器（自然化版 v1.0）",
    subtitle: "粘贴生硬的对话，获得自然流畅、有个性的对白改写。",
    description: "让小说或剧本中的对话更像真人说话，增加角色个性。",
    category: "创意写作",
    categorySlug: "creative",
    difficulty: "beginner",
    rating: 4.7,
    usageCount: 1456,
    lastUpdated: "2026.05",
    version: "v1.0",
    tags: ["对白", "对话", "自然化", "润色"],
    featured: false,
    trending: false,
    beginner: true,
    promptOnline: `你是剧本医生和对白专家。请优化以下对话：

【原始对白】：{{原始对白}}
【角色描述】：{{角色描述}}
【场景氛围】：{{场景氛围}}
【优化方向】：{{优化方向}}

输出：
✅ 优化后对白（保持原意但更自然）
📝 修改说明（每处改动的理由）
💡 增强建议（如何通过动作、停顿、潜台词增加张力）`,
    promptLocal: `[系统指令] 你是对白优化专家。
[输入] 原文：{dialogue} 角色：{characters} 氛围：{mood} 方向：{direction}
[输出] 1.优化对白 2.修改说明 3.增强建议`,
    variables: [
      { name: "原始对白", placeholder: "粘贴需要优化的对话内容", required: true },
      { name: "角色描述", placeholder: "例如：A是严厉的父亲，B是叛逆的18岁女儿", required: true },
      { name: "场景氛围", placeholder: "例如：深夜厨房、紧张对峙、雨天车站", required: false },
      { name: "优化方向", placeholder: "例如：更口语化、增加潜台词、加强冲突感", required: false },
    ],
    beforeAfter: {
      input: "原始对白：\n父亲：你为什么不好好学习？你这样以后怎么办？\n女儿：你从来都不理解我！你只关心成绩！\n父亲：我这都是为了你好！\n女儿：为我好？你从来不问我想要什么！",
      outputs: [{
        model: "Claude Opus 4.7",
        text: `✅ 优化后对白

父亲：（放下筷子）成绩单我看了。
女儿：（没抬头，继续扒饭）嗯。
父亲：嗯？就一个嗯？
女儿：你想让我说什么？
父亲：（压着火）我想让你说说，数学怎么又不及格。
女儿：（放下碗）你终于问了。不对，你不是问我，你是审我。
父亲：我供你吃供你穿——
女儿：（站起来）你从来不问我开不开心。

📝 修改说明
- 删掉"你为什么不好好学习"→用动作和沉默替代说教
- "你从来都不理解我"太直白→改为"你终于问了"的反讽
- 增加动作描写（放筷子、没抬头、站起来）增强画面感
- 用短句和打断模拟真实争吵节奏

💡 增强建议
- 父亲说话时可以加"手指敲桌子"的紧张动作
- 女儿最后一句话后可以加"门砰地关上"的结尾
- 中间可以插入一段沉默，用环境音（冰箱嗡嗡声）填充`,
      }],
    },
    recommendedModels: [
      { name: "Claude Opus 4.7", strengths: "对白自然、潜台词处理好", useCase: "高质量对白优化", audience: "小说作者、编剧" },
      { name: "Qwen 3.6", strengths: "中文口语化表达好", useCase: "日常对话优化", audience: "需要自然口语的作者" },
    ],
    usageStepsOnline: ["复制 Prompt", "粘贴原始对白", "获取优化版本", "对比学习改进"],
    usageStepsLocal: ["安装中文模型", "复制本地版 Prompt", "粘贴对白后运行"],
    likes: 345,
  },
  // ─── 现有分类补充 ─────────────────────────────────────
  {
    id: "seo-blog-optimizer",
    title: "SEO博客优化助手（排名提升版 v1.0）",
    subtitle: "输入博客主题和目标关键词，获得SEO优化的文章结构和内容建议。",
    description: "帮助内容创作者写出搜索引擎友好的高质量博客文章。",
    category: "语言与内容生产",
    categorySlug: "content",
    difficulty: "intermediate",
    rating: 4.7,
    usageCount: 1234,
    lastUpdated: "2026.05",
    version: "v1.0",
    tags: ["SEO", "博客", "内容营销", "搜索排名"],
    featured: false,
    trending: true,
    beginner: false,
    promptOnline: `你是SEO内容专家。请为以下博客主题生成SEO优化方案：

【博客主题】：{{博客主题}}
【目标关键词】：{{目标关键词}}
【目标受众】：{{目标受众}}
【文章长度】：{{文章长度}}

输出：
🔍 关键词策略（主词+长尾词+语义相关词）
📋 文章大纲（H1/H2/H3结构，含关键词分布）
📝 开头段落（含Hook+关键词，150字左右）
💡 SEO建议（标题标签、meta描述、内链策略）
📊 竞品分析思路（如何做得比排名前10更好）`,
    promptLocal: `[系统指令] 你是SEO内容专家。
[输入] 主题：{topic} 关键词：{keywords} 受众：{audience} 长度：{length}
[输出] 1.关键词策略 2.文章大纲 3.开头段落 4.SEO建议 5.竞品分析`,
    variables: [
      { name: "博客主题", placeholder: "例如：2026年最佳项目管理工具对比", required: true },
      { name: "目标关键词", placeholder: "例如：项目管理工具、PM软件推荐", required: true },
      { name: "目标受众", placeholder: "例如：中小企业管理者、创业团队", required: false },
      { name: "文章长度", placeholder: "例如：3000字", required: false },
    ],
    beforeAfter: {
      input: "主题：React性能优化指南\n关键词：React性能优化\n受众：前端开发者\n长度：2500字",
      outputs: [{
        model: "Claude Opus 4.7",
        text: `🔍 关键词策略
- 主词：React性能优化
- 长尾词：React渲染优化、React memo使用、useCallback优化、React虚拟列表
- 语义相关词：reconciliation、fiber架构、批量更新

📋 文章大纲
H1: React性能优化完全指南（2026版）
  H2: 为什么React会变慢？（渲染机制解析）
  H2: 5个立竿见影的优化技巧
    H3: 1. React.memo — 避免无意义重渲染
    H3: 2. useMemo/useCallback — 缓存计算和函数
    H3: 3. 虚拟列表 — 万级列表不卡顿
    H3: 4. 代码分割 — 首屏加载提速50%
    H3: 5. 状态下沉 — 减少影响范围
  H2: 性能分析工具实战（React DevTools Profiler）
  H2: 常见误区（过度优化的坑）
  H2: 总结与最佳实践清单

📝 开头段落
你的React应用是不是越来越卡？列表一长就掉帧，表单一复杂就卡顿？
别急着怪React——90%的性能问题，都不是框架的锅。
本文总结了2026年最有效的5个React性能优化技巧，每个都附带真实案例和代码。无论你是新手还是老鸟，读完就能用。

💡 SEO建议
- 标题含年份（2026版）增加时效性点击
- Meta描述控制在155字内，含主词
- 每个H2下放一个代码示例（增加停留时间）
- 文末加"相关阅读"内链3-5篇`,
      }],
    },
    recommendedModels: [
      { name: "Claude Opus 4.7", strengths: "SEO策略全面、内容质量高", useCase: "专业SEO文章", audience: "内容营销人员" },
      { name: "Qwen 3.6", strengths: "中文SEO经验丰富", useCase: "中文博客优化", audience: "中文内容创作者" },
    ],
    usageStepsOnline: ["复制 Prompt", "填入主题和关键词", "获取SEO方案", "按大纲写作"],
    usageStepsLocal: ["安装中文模型", "复制本地版 Prompt", "描述主题后运行"],
    advancedTips: ["用Ahrefs或SEMrush查看竞品的关键词布局", "文章发布后用Google Search Console监控排名变化", "每3个月更新一次文章内容，保持时效性"],
    likes: 234,
  },
  {
    id: "social-media-strategy",
    title: "社交媒体内容策略生成器（全平台版 v1.0）",
    subtitle: "输入品牌/个人定位，获得完整的社交媒体内容规划。",
    description: "为品牌或个人IP制定系统化的社交媒体内容策略。",
    category: "语言与内容生产",
    categorySlug: "content",
    difficulty: "beginner",
    rating: 4.7,
    usageCount: 1567,
    lastUpdated: "2026.05",
    version: "v1.0",
    tags: ["社交媒体", "内容策略", "运营", "营销"],
    featured: false,
    trending: true,
    beginner: true,
    promptOnline: `你是社交媒体运营专家。请制定内容策略：

【品牌/个人定位】：{{定位}}
【目标平台】：{{目标平台}}
【目标受众】：{{目标受众}}
【内容目标】：{{内容目标}}

输出：
🎯 账号定位（一句话人设）
📋 内容矩阵（4-5种内容类型及比例）
📅 一周内容日历（每天发什么、几点发）
📝 爆款内容模板（3个可直接套用的内容框架）
📊 数据指标（关注什么、怎么优化）`,
    promptLocal: `[系统指令] 你是社交媒体运营专家。
[输入] 定位：{positioning} 平台：{platform} 受众：{audience} 目标：{goal}
[输出] 1.账号定位 2.内容矩阵 3.内容日历 4.爆款模板 5.数据指标`,
    variables: [
      { name: "定位", placeholder: "例如：独立开发者分享编程干货、美食博主", required: true },
      { name: "目标平台", placeholder: "例如：小红书、抖音、B站、微信公众号", required: true },
      { name: "目标受众", placeholder: "例如：18-30岁大学生和职场新人", required: true },
      { name: "内容目标", placeholder: "例如：3个月涨粉1万、提升品牌认知", required: false },
    ],
    beforeAfter: {
      input: "定位：独立开发者，分享前端技术+远程工作生活\n平台：小红书+B站\n受众：25-35岁前端开发者\n目标：建立个人品牌，接技术咨询",
      outputs: [{
        model: "Claude Opus 4.7",
        text: `🎯 账号定位
"写代码的数字游民"——前端技术+远程生活方式的结合体

📋 内容矩阵
| 类型 | 比例 | 示例 |
|------|------|------|
| 技术干货 | 40% | "3个React性能优化技巧" |
| 远程生活 | 25% | "在巴厘岛写代码的一天" |
| 工具推荐 | 20% | "我离不开的5个开发工具" |
| 个人故事 | 10% | "从大厂辞职做独立开发的心路" |
| 互动话题 | 5% | "你觉得远程办公最爽的是？" |

📅 一周日历
周一 12:00 — 技术干货（小红书图文）
周二 20:00 — 远程生活vlog（B站）
周三 12:00 — 工具推荐（小红书）
周五 20:00 — 技术教程（B站）
周日 10:00 — 个人故事/互动（小红书）

📝 爆款模板：技术干货
标题：{{数字}}个{{技能}} {{场景}} 必知的{{类型}}
开头：我用了X年{{技能}}，踩过无数坑，总结出这N个最实用的技巧...
正文：每点一个技巧+代码截图+一句话总结
结尾：你最常用哪个？评论区聊聊～`,
      }],
    },
    recommendedModels: [
      { name: "Claude Opus 4.7", strengths: "策略全面、内容框架好", useCase: "完整内容策略", audience: "自媒体运营者" },
      { name: "Qwen 3.6", strengths: "中文社交平台理解深", useCase: "平台适配建议", audience: "国内社交媒体运营" },
    ],
    usageStepsOnline: ["复制 Prompt", "描述定位和目标", "获取完整策略", "按日历执行"],
    usageStepsLocal: ["安装中文模型", "复制本地版 Prompt", "描述定位后运行"],
    likes: 345,
  },
  {
    id: "react-component-gen",
    title: "React组件代码生成器（Hooks版 v1.0）",
    subtitle: "描述组件需求，生成完整的React组件代码和使用示例。",
    description: "快速生成符合最佳实践的React组件，含TypeScript类型和样式。",
    category: "编程与技术任务",
    categorySlug: "coding",
    difficulty: "intermediate",
    rating: 4.8,
    usageCount: 1678,
    lastUpdated: "2026.05",
    version: "v1.0",
    tags: ["React", "组件", "TypeScript", "Hooks"],
    featured: false,
    trending: true,
    beginner: false,
    promptOnline: `你是React专家。请根据需求生成组件代码：

【组件功能】：{{组件功能}}
【技术栈】：{{技术栈}}
【样式方案】：{{样式方案}}
【特殊要求】：{{特殊要求}}

输出：
📝 组件代码（完整TypeScript组件）
🎨 样式代码（CSS/样式方案）
📖 使用示例（在父组件中如何调用）
💡 设计说明（为什么这样实现）`,
    promptLocal: `[系统指令] 你是React开发专家。
[输入] 功能：{function} 技术栈：{stack} 样式：{styling} 要求：{requirements}
[输出] 1.组件代码 2.样式 3.使用示例 4.设计说明`,
    variables: [
      { name: "组件功能", placeholder: "例如：带搜索的下拉选择器、可拖拽的看板", required: true },
      { name: "技术栈", placeholder: "例如：React 18 + TypeScript + Next.js", required: true },
      { name: "样式方案", placeholder: "例如：Tailwind CSS、CSS Modules、styled-components", required: false },
      { name: "特殊要求", placeholder: "例如：支持键盘导航、无障碍访问", required: false },
    ],
    beforeAfter: {
      input: "功能：支持搜索和多选的标签选择器\n技术栈：React 18 + TypeScript\n样式：Tailwind CSS\n要求：支持键盘导航，可创建新标签",
      outputs: [{
        model: "Claude Opus 4.7",
        text: `interface TagSelectorProps {
  options: string[];
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  allowCreate?: boolean;
}

export function TagSelector({ options, value, onChange, placeholder = "搜索标签...", allowCreate = true }: TagSelectorProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);

  const filtered = options.filter(
    (o) => o.includes(query) && !value.includes(o)
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") setHighlightIndex((i) => Math.min(i + 1, filtered.length - 1));
    else if (e.key === "ArrowUp") setHighlightIndex((i) => Math.max(i - 1, 0));
    else if (e.key === "Enter" && filtered[highlightIndex]) {
      onChange([...value, filtered[highlightIndex]]);
      setQuery("");
    } else if (e.key === "Backspace" && !query && value.length) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-1 p-2 border rounded-lg">
        {value.map((tag) => (
          <span key={tag} className="px-2 py-0.5 bg-cyan-100 text-cyan-800 rounded text-sm flex items-center gap-1">
            {tag}
            <button onClick={() => onChange(value.filter((t) => t !== tag))} className="hover:text-red-500">×</button>
          </span>
        ))}
        <input value={query} onChange={(e) => { setQuery(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)} onKeyDown={handleKeyDown} placeholder={placeholder} className="flex-1 min-w-[100px] outline-none bg-transparent" />
      </div>
      {open && filtered.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-auto">
          {filtered.map((option, i) => (
            <li key={option} onClick={() => { onChange([...value, option]); setQuery(""); }} className={\`px-3 py-2 cursor-pointer \${i === highlightIndex ? "bg-cyan-50" : ""}\`}>{option}</li>
          ))}
        </ul>
      )}
    </div>
  );
}`,
      }],
    },
    recommendedModels: [
      { name: "Claude Opus 4.7", strengths: "代码质量高、类型安全", useCase: "复杂组件开发", audience: "React开发者" },
      { name: "DeepSeek V4", strengths: "代码生成快", useCase: "快速原型", audience: "需要快速出代码的开发者" },
    ],
    usageStepsOnline: ["复制 Prompt", "描述组件需求", "获取完整代码", "复制到项目中使用"],
    usageStepsLocal: ["安装代码模型", "复制本地版 Prompt", "描述需求后运行"],
    advancedTips: ["提供设计稿截图可获得更精确的样式代码", "指定组件的使用场景可获得更合理的API设计", "要求生成Storybook故事文件方便测试"],
    likes: 456,
  },
  {
    id: "incident-responder",
    title: "生产事故响应助手（SRE版 v1.0）",
    subtitle: "描述线上故障现象，获得标准化的应急响应流程和排查步骤。",
    description: "帮助SRE和运维工程师快速响应生产事故，减少MTTR。",
    category: "编程与技术任务",
    categorySlug: "coding",
    difficulty: "advanced",
    rating: 4.9,
    usageCount: 876,
    lastUpdated: "2026.05",
    version: "v1.0",
    tags: ["SRE", "故障排查", "运维", "应急响应"],
    featured: false,
    trending: true,
    beginner: false,
    promptOnline: `你是资深SRE工程师。请协助处理以下生产事故：

【故障现象】：{{故障现象}}
【影响范围】：{{影响范围}}
【系统架构】：{{系统架构}}
【已采取措施】：{{已采取措施}}

输出：
🚨 严重等级评估（P0-P3）
🔍 排查思路（按优先级的检查清单）
🛠️ 应急处理（止血方案）
📊 根因分析（5 Whys）
📝 事后复盘模板（改进项+Owner+截止时间）`,
    promptLocal: `[系统指令] 你是SRE专家。
[输入] 故障：{symptoms} 影响：{impact} 架构：{architecture} 已做：{actions}
[输出] 1.等级评估 2.排查思路 3.应急处理 4.根因分析 5.复盘模板`,
    variables: [
      { name: "故障现象", placeholder: "例如：API响应时间从200ms飙升到5秒", required: true },
      { name: "影响范围", placeholder: "例如：全站用户受影响、仅华东区域", required: true },
      { name: "系统架构", placeholder: "例如：Nginx→Node.js→PostgreSQL→Redis", required: false },
      { name: "已采取措施", placeholder: "例如：已重启应用服务、已扩容2台机器", required: false },
    ],
    beforeAfter: {
      input: "现象：用户反馈下单失败，支付成功率从99%降到60%\n影响：全站，约影响30%的交易\n架构：Next.js→API Gateway→订单服务→支付网关\n已做：重启了订单服务Pod",
      outputs: [{
        model: "Claude Opus 4.7",
        text: `🚨 严重等级：P1（核心交易链路受损）

🔍 排查思路（按优先级）
1. 支付网关状态：curl检查支付网关健康接口
2. 订单服务日志：kubectl logs查看超时和异常
3. 数据库连接池：检查连接数是否耗尽
4. API Gateway：检查限流和熔断配置
5. 第三方支付：确认支付宝/微信支付接口正常

🛠️ 应急处理（止血方案）
1. 立即：切流到备用支付通道（如有）
2. 5分钟内：扩大订单服务Pod数量
3. 10分钟内：检查并清理数据库死锁
4. 持续：每5分钟通报一次恢复进展

📊 根因分析
1. 支付成功率为什么降？→ 订单服务响应超时
2. 为什么超时？→ 数据库连接池满
3. 为什么连接池满？→ 慢查询占用连接不释放
4. 为什么有慢查询？→ 今天上线的新功能缺少索引
5. 为什么没发现？→ 上线前没有做SQL审查

根本原因：新功能上线缺少SQL审查环节

📝 复盘改进
| 事项 | Owner | 截止 |
|------|-------|------|
| 添加缺失索引 | 开发A | 今天 |
| 上线流程增加SQL审查 | SRE B | 本周 |
| 支付链路添加慢查询告警 | SRE C | 本周 |
| 建立支付降级方案 | 架构师 | 下周 |`,
      }],
    },
    recommendedModels: [
      { name: "Claude Opus 4.7", strengths: "排查逻辑严密、方案全面", useCase: "复杂事故处理", audience: "SRE工程师、技术负责人" },
      { name: "DeepSeek V4", strengths: "技术理解深", useCase: "快速排查", audience: "需要快速止血的运维" },
    ],
    usageStepsOnline: ["复制 Prompt", "描述故障现象", "获取响应方案", "按步骤执行"],
    usageStepsLocal: ["安装代码模型", "复制本地版 Prompt", "描述故障后运行"],
    advancedTips: ["提供监控截图（Grafana等）可获得更精准的分析", "附上最近的代码变更记录可加速定位", "每次事故后用这个模板生成复盘文档，逐步完善应急预案"],
    likes: 345,
  },
  {
    id: "swot-analyzer",
    title: "SWOT深度分析器（商业版 v1.0）",
    subtitle: "输入企业或项目信息，获得全面的SWOT分析和战略建议。",
    description: "超越简单的四象限，提供有深度的商业分析和可执行战略。",
    category: "思考与工作流",
    categorySlug: "thinking",
    difficulty: "intermediate",
    rating: 4.7,
    usageCount: 987,
    lastUpdated: "2026.05",
    version: "v1.0",
    tags: ["SWOT", "商业分析", "战略", "竞争分析"],
    featured: false,
    trending: false,
    beginner: false,
    promptOnline: `你是商业战略顾问。请进行深度SWOT分析：

【分析对象】：{{分析对象}}
【行业背景】：{{行业背景}}
【核心业务】：{{核心业务}}
【面临挑战】：{{面临挑战}}

输出：
📊 SWOT矩阵（每项3-5个要点，含数据支撑）
🔗 交叉分析（SO/WO/ST/WT四种组合战略）
🎯 战略建议（3条可执行的短期+长期建议）
⚠️ 盲点提醒（容易忽略的风险因素）`,
    promptLocal: `[系统指令] 你是商业战略顾问。
[输入] 对象：{subject} 行业：{industry} 业务：{business} 挑战：{challenges}
[输出] 1.SWOT矩阵 2.交叉分析 3.战略建议 4.盲点提醒`,
    variables: [
      { name: "分析对象", placeholder: "例如：某在线教育创业公司、个人IP", required: true },
      { name: "行业背景", placeholder: "例如：在线教育行业，年增长15%", required: true },
      { name: "核心业务", placeholder: "例如：K12在线辅导、编程培训", required: true },
      { name: "面临挑战", placeholder: "例如：获客成本高、竞品多", required: false },
    ],
    beforeAfter: {
      input: "对象：一家专注AI技能培训的在线教育公司\n行业：在线教育+AI培训\n业务：录播课程+训练营+企业内训\n挑战：大厂入局AI培训、获客成本上升",
      outputs: [{
        model: "Claude Opus 4.7",
        text: `📊 SWOT矩阵

优势 (S)
1. 先发优势：已积累5万+AI培训学员
2. 内容壁垒：课程由一线AI工程师开发
3. 口碑效应：NPS 58，转介绍率35%
4. 多元收入：录播+训练营+企业三条线

劣势 (W)
1. 品牌知名度有限，依赖SEO和口碑
2. 缺乏认证体系，完课证书含金量低
3. 技术团队小，平台功能迭代慢
4. 企业客户占比低（15%），收入不稳定

机会 (O)
1. AI人才缺口持续扩大（2026年预计500万）
2. 企业AI培训预算年增40%
3. 海外市场空白（东南亚、中东）

威胁 (T)
1. 大厂（百度/阿里）推出免费AI课程
2. AI自动培训工具可能替代部分课程
3. 政策监管收紧（在线教育资质）

🔗 交叉分析
SO战略（用优势抓机会）：用先发优势+口碑，快速拓展企业AI培训
WO战略（补劣势抓机会）：引入认证体系，提升证书含金量
ST战略（用优势抗威胁）：深耕垂直领域，做大厂不愿做的细分方向
WT战略（补劣势抗威胁）：加快平台功能迭代，提升技术壁垒

🎯 战略建议
短期（3个月）：推出"AI工程师认证"体系，联合行业协会背书
中期（6个月）：组建企业销售团队，目标企业客户占比提升到30%
长期（1年）：启动东南亚市场，与当地教育机构合作

⚠️ 盲点提醒
- 大厂免费课程质量在提升，不能只靠"收费=优质"的定位
- AI培训可能被AI本身替代（学编程不如学用AI）`,
      }],
    },
    recommendedModels: [
      { name: "Claude Opus 4.7", strengths: "分析深度高、建议可执行", useCase: "商业战略分析", audience: "创业者、管理者" },
      { name: "Grok 4.20", strengths: "视角独特、善于发现盲点", useCase: "竞争分析", audience: "需要全面视角的战略决策者" },
    ],
    usageStepsOnline: ["复制 Prompt", "描述分析对象", "获取SWOT报告", "制定行动计划"],
    usageStepsLocal: ["安装推理模型", "复制本地版 Prompt", "描述对象后运行"],
    advancedTips: ["提供财务数据可获得更量化的分析", "加入竞品信息可获得对比维度的洞察", "让AI从不同利益相关者（客户/员工/投资人）角度重做SWOT"],
    likes: 289,
  },
];

export const testimonials: Testimonial[] = [
  { id: "1", name: "小林", role: "小红书博主 · 5万粉丝", avatar: "XL", content: "用小红书笔记生成器之后，创作效率提升了3倍！关键是生成的内容真的不像AI写的。", rating: 5 },
  { id: "2", name: "张工", role: "全栈开发工程师", avatar: "ZG", content: "代码审查工具太实用了，帮我发现了好几个潜在的安全漏洞。每次提交前都会用它过一遍。", rating: 5 },
  { id: "3", name: "王经理", role: "产品经理", avatar: "WJ", content: "周报生成器救了我！以前写周报要花1小时，现在5分钟搞定，结构比自己写的清晰多了。", rating: 5 },
  { id: "4", name: "李同学", role: "大四学生", avatar: "LX", content: "作为AI新手，这个平台的模板真的很友好。复制粘贴就能用，不用学复杂的Prompt技巧。", rating: 4 },
  { id: "5", name: "陈老师", role: "高中英语教师", avatar: "CL", content: "翻译工具的去机翻味功能很厉害，翻译出来的中文非常自然。", rating: 5 },
  { id: "6", name: "赵总", role: "创业公司CEO", avatar: "ZZ", content: "结构化思考工具帮我理清了很多复杂的业务问题，做决策前都会先用它分析一下。", rating: 5 },
  { id: "7", name: "刘分析师", role: "数据分析师 · 3年经验", avatar: "LA", content: "数据洞察报告生成器太强了！把枯燥的数据变成有故事性的报告，向领导汇报再也不用对着表格发愁了。", rating: 5 },
  { id: "8", name: "孙编辑", role: "网络小说作者", avatar: "SB", content: "故事大纲生成器帮我解决了卡文问题。有时候脑子里有画面但写不出来，用它一梳理，大纲就出来了。", rating: 5 },
  { id: "9", name: "周PM", role: "项目经理 · PMP认证", avatar: "ZP", content: "任务分解助手每次给我排的Sprint都很合理，比我自己排的还准。现在开规划会都先用它出一版初稿。", rating: 5 },
  { id: "10", name: "吴老师", role: "在线教育从业者", avatar: "WL", content: "会议纪要生成器太实用了！以前开完会还要花1小时整理纪要，现在粘贴录音转文字就能出结构化纪要。", rating: 4 },
];

export function getSkillById(id: string): Skill | undefined {
  return skills.find((s) => s.id === id);
}
export function getSkillsByCategory(slug: string): Skill[] {
  return skills.filter((s) => s.categorySlug === slug);
}
export function getTrendingSkills(): Skill[] {
  return skills.filter((s) => s.trending);
}
export function getNewestSkills(): Skill[] {
  return [...skills].sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated)).slice(0, 6);
}
export function getBeginnerSkills(): Skill[] {
  return skills.filter((s) => s.beginner);
}
export function getFeaturedSkills(): Skill[] {
  return skills.filter((s) => s.featured);
}
export function getPublishedPrompts(): Skill[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem("ai-skills-hub-published-prompts");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}
