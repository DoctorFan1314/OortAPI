# 贡献指南

感谢你对 AI Skills Hub 的关注！我们欢迎任何形式的贡献。

---

## 如何贡献

### 提交技能模板（最推荐！）

这是最简单也最有价值的贡献方式：

1. 直接在网站上使用「提交模板」功能
2. 或者 Fork 本仓库，在 `src/lib/mock-data.ts` 中添加新的 Skill 对象，然后提交 PR

#### Skill 模板标准

每个模板必须包含：

- **标题**：清晰描述功能，包含版本号（如 `v2.1`）
- **一句话描述**：不超过 50 字
- **在线版 Prompt**：适用于 ChatGPT/Claude/Grok 等平台
- **本地版 Prompt**：适用于 LM Studio/Ollama 等本地工具
- **变量定义**：用户需要填写的变量（如 `{{主题}}`）
- **Before/After 示例**：至少一个真实的输入输出对比
- **推荐模型**：注明推荐的模型和适用场景
- **使用步骤**：在线和本地分别说明

#### 质量要求

- Prompt 必须经过至少 2 个不同模型实测
- 输出效果自然，无明显 AI 味
- 覆盖真实生产力场景，而非纯演示

### 报告 Bug

在 [Issues](../../issues) 中提交 Bug 报告，请包含：

- 问题描述
- 复现步骤
- 预期行为 vs 实际行为
- 浏览器和操作系统信息
- 截图（如有）

### 功能建议

在 [Issues](../../issues) 中提交功能建议，请描述：

- 你希望实现什么功能
- 为什么需要这个功能
- 你设想的使用场景

### 代码贡献

1. Fork 本仓库
2. 创建你的功能分支：`git checkout -b feature/your-feature`
3. 提交你的修改：`git commit -m 'feat: add some feature'`
4. 推送到分支：`git push origin feature/your-feature`
5. 提交 Pull Request

---

## 开发环境

```bash
# 克隆你的 Fork
git clone https://github.com/你的用户名/ai-skills-hub.git
cd ai-skills-hub

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

浏览器打开 http://localhost:3000 查看效果。

---

## 项目结构简述

```
src/
├── app/              # 页面路由
├── components/       # 组件
│   ├── ui/           # shadcn/ui 基础组件
│   ├── layout/       # 布局组件（Navbar, Footer）
│   ├── home/         # 首页组件
│   └── skill/        # 技能相关组件
└── lib/
    ├── types.ts      # 类型定义
    ├── mock-data.ts  # 数据源（添加新模板改这里）
    └── categories.ts # 分类定义
```

---

## 提交规范

使用 [Conventional Commits](https://www.conventionalcommits.org/) 格式：

- `feat:` 新功能
- `fix:` Bug 修复
- `docs:` 文档更新
- `style:` 代码格式调整（不影响逻辑）
- `refactor:` 重构
- `perf:` 性能优化
- `test:` 测试相关
- `chore:` 构建/工具链相关

示例：
```
feat: 添加「短视频脚本生成器」技能模板
fix: 修复移动端导航菜单无法关闭的问题
docs: 更新 README 添加部署说明
```

---

## 行为准则

- 尊重每一位贡献者
- 使用友善和包容的语言
- 接受建设性批评
- 专注于对社区最有利的事情

---

## 联系方式

- GitHub Issues: 提交 Bug 或建议
- Email: [待补充]

---

## License

本项目使用 [MIT License](./LICENSE)。提交贡献即表示你同意你的代码以 MIT 协议开源。
