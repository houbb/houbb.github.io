---
layout: post
title: UI UX Pro Max-01-UI UX Pro Max 是一个可搜索的设计数据库，包含 UI 风格、配色方案、字体搭配、图表类型、产品设计建议、UX 指南以及针对不同技术栈的最佳实践
date: 2026-03-17 21:01:55 +0800
categories: [AI]
tags: [ai, sh]
published: true
---


# 实际安装时

```
npm install -g uipro-cli

added 23 packages in 586ms

17 packages are looking for funding
  run `npm fund` for details
PS C:\Users\dh>
PS C:\Users\dh>
PS C:\Users\dh>
PS C:\Users\dh> cd D:\aicode\openim-plateform
PS D:\aicode\openim-plateform>
PS D:\aicode\openim-plateform>
PS D:\aicode\openim-plateform>
PS D:\aicode\openim-plateform> uipro init --ai claude
uipro : 无法将“uipro”项识别为 cmdlet、函数、脚本文件或可运行程序的名称。请检查名称的拼写，如果包括路径，请确保路径正确，然后再试一次。
所在位置 行:1 字符: 1
+ uipro init --ai claude
+ ~~~~~
    + CategoryInfo          : ObjectNotFound: (uipro:String) [], CommandNotFoundException
    + FullyQualifiedErrorId : CommandNotFoundException
```

报错：

改为：

```
npx uipro-cli init --ai claude
```


# 运行报错

```
cd d:/aicode/openim-plateform/.claude/skills/ui-ux-pro-max && python3 skills/ui-ux-pro-max/scripts/search.py "sticker store emoji marketplace professional" --design-system -p "StickerStore" -f markdown
```

需要安装 python3

# [UI UX Pro Max](https://uupm.cc)

## v2.0 新特性

### 智能设计系统生成

v2.0 的旗舰功能是 **设计系统生成器（Design System Generator）** —— 一个由 AI 驱动的推理引擎，可以分析你的项目需求，并在几秒内生成完整且定制化的设计系统。

```
+----------------------------------------------------------------------------------------+
|  目标：Serenity Spa - 推荐设计系统                                                     |
+----------------------------------------------------------------------------------------+
|                                                                                        |
|  模式：Hero 主导 + 社会证明                                                            |
|     转化方式：情绪驱动 + 信任元素                                                      |
|     CTA：首屏可见（Above the fold），并在评价之后重复出现                               |
|     页面结构：                                                                         |
|       1. Hero                                                                          |
|       2. 服务                                                                          |
|       3. 用户评价                                                                      |
|       4. 预约                                                                          |
|       5. 联系方式                                                                      |
|                                                                                        |
|  风格：Soft UI Evolution（柔和 UI 演进风格）                                           |
|     关键词：柔和阴影、细腻层次、平静氛围、高级感、有机形态                             |
|     适用：健康、医疗美容、生活方式品牌、高端服务                                       |
|     性能：优秀 | 可访问性：WCAG AA                                                     |
|                                                                                        |
|  配色：                                                                               |
|     主色：    #E8B4B8（柔粉）                                                          |
|     辅助色：  #A8D5BA（鼠尾草绿）                                                      |
|     CTA：     #D4AF37（金色）                                                          |
|     背景：    #FFF5F5（暖白）                                                          |
|     文本：    #2D3436（炭黑）                                                          |
|     说明：使用带金色点缀的柔和配色，营造奢华感                                         |
|                                                                                        |
|  字体：Cormorant Garamond / Montserrat                                                 |
|     氛围：优雅、宁静、精致                                                             |
|     适用：奢侈品牌、健康、美容、内容编辑类                                             |
|     Google Fonts: https://fonts.google.com/share?selection.family=...                  |
|                                                                                        |
|  核心效果：                                                                           |
|     柔和阴影 + 平滑过渡（200-300ms） + 细腻 Hover 状态                                 |
|                                                                                        |
|  避免（反模式）：                                                                     |
|     高亮霓虹色 + 强烈动画 + 深色模式 + AI 常见紫粉渐变                                 |
|                                                                                        |
|  交付前检查清单：                                                                     |
|     [ ] 不使用 emoji 作为图标（使用 SVG：Heroicons/Lucide）                            |
|     [ ] 所有可点击元素使用 cursor-pointer                                              |
|     [ ] Hover 状态带平滑过渡（150-300ms）                                              |
|     [ ] 浅色模式：文本对比度 ≥ 4.5:1                                                   |
|     [ ] 键盘导航可见焦点状态                                                           |
|     [ ] 遵循 prefers-reduced-motion                                                    |
|     [ ] 响应式：375px、768px、1024px、1440px                                           |
|                                                                                        |
+----------------------------------------------------------------------------------------+
```

---

### 设计系统生成流程

```
┌─────────────────────────────────────────────────────────────────┐
│  1. 用户请求                                                    │
│     “为我的美容 SPA 构建一个落地页”                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  2. 多领域搜索（5 个并行搜索）                                  │
│     • 产品类型匹配（161 类）                                    │
│     • 风格推荐（67 种）                                         │
│     • 配色方案（161 套）                                        │
│     • 落地页模式（24 种）                                       │
│     • 字体搭配（57 种组合）                                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  3. 推理引擎                                                    │
│     • 产品 → UI 分类规则匹配                                    │
│     • 风格优先级（BM25 排序）                                   │
│     • 行业反模式过滤                                            │
│     • 决策规则处理（JSON 条件）                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  4. 完整设计系统输出                                            │
│     模式 + 风格 + 配色 + 字体 + 效果                            │
│     + 反模式规避 + 交付前检查清单                               │
└─────────────────────────────────────────────────────────────────┘
```

---

### 161 条行业专用推理规则

推理引擎内置针对以下领域的专用规则：

| 分类            | 示例                                               |
| ------------- | ------------------------------------------------ |
| **科技 & SaaS** | SaaS、微型 SaaS、B2B 服务、开发工具 / IDE、AI/聊天机器人平台、网络安全平台 |
| **金融**        | 金融科技/加密货币、银行、保险、个人理财工具、发票与账单系统                   |
| **医疗健康**      | 诊所、药店、牙科、宠物医疗、心理健康、用药提醒                          |
| **电商**        | 综合电商、奢侈品、电商市场（P2P）、订阅盒、外卖                        |
| **服务**        | 美容/SPA、餐厅、酒店、法律服务、家政服务、预约系统                      |
| **创意**        | 作品集、机构、摄影、游戏、音乐流媒体、图片/视频编辑                       |
| **生活方式**      | 习惯追踪、食谱烹饪、冥想、天气、日记、情绪记录                          |
| **前沿科技**      | Web3/NFT、空间计算、量子计算、自主无人机集群                       |

每条规则包含：

* **推荐模式**：落地页结构
* **风格优先级**：最匹配的 UI 风格
* **配色情绪**：行业适配的色彩方案
* **字体情绪**：字体风格匹配
* **关键效果**：动画与交互设计
* **反模式**：应避免的设计（例如：银行类避免“AI 紫粉渐变”）

---

## 功能特性

* **67 种 UI 风格**：Glassmorphism、Claymorphism、极简主义、野兽派、拟物、Bento Grid、暗黑模式、AI 原生 UI 等
* **161 套配色方案**：与 161 种产品类型一一对应
* **57 种字体组合**：精选 Google Fonts 字体搭配
* **25 种图表类型**：用于仪表盘和数据分析推荐
* **13 种技术栈支持**：React、Next.js、Astro、Vue、Nuxt.js、Svelte、SwiftUI、Flutter 等
* **99 条 UX 规范**：最佳实践、反模式与可访问性规则
* **161 条推理规则**：行业级设计系统生成（v2.0 新增）

---

## 安装

### 使用 Claude Marketplace（Claude Code）

使用以下命令直接安装：

```
claude plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill
claude plugin install ui-ux-pro-max@ui-ux-pro-max-skill
```

---

### 使用 CLI（推荐）

```bash
# 全局安装 CLI
npm install -g uipro-cli

# 进入项目目录
cd /path/to/your/project

# 为 AI 助手安装
uipro init --ai claude
uipro init --ai cursor
uipro init --ai windsurf
uipro init --ai antigravity
uipro init --ai copilot
uipro init --ai kiro
uipro init --ai codex
uipro init --ai qoder
uipro init --ai roocode
uipro init --ai gemini
uipro init --ai trae
uipro init --ai opencode
uipro init --ai continue
uipro init --ai codebuddy
uipro init --ai droid
uipro init --ai all
```

---

### 其他 CLI 命令

```bash
uipro versions   # 查看可用版本
uipro update     # 更新到最新版本
uipro init --offline  # 离线初始化（跳过 GitHub 下载）
```

---

## 前置要求

需要 Python 3.x 用于搜索脚本。

```bash
# 检查 Python
python3 --version

# macOS
brew install python3

# Ubuntu/Debian
sudo apt update && sudo apt install python3

# Windows
winget install Python.Python.3.12
```

---

## 使用方式

### Skill 模式（自动激活）

支持：Claude Code、Cursor、Windsurf、Antigravity、Codex CLI、Continue、Gemini CLI、OpenCode、Qoder、CodeBuddy、Droid

当你请求 UI/UX 相关任务时自动激活：

```
为我的 SaaS 产品构建一个落地页
```

> **Trae**：需先切换到 **SOLO 模式**

---

### 工作流模式（Slash 命令）

支持：Kiro、GitHub Copilot、Roo Code

```
/ui-ux-pro-max 为我的 SaaS 产品构建一个落地页
```

---

### 示例提示词

```
构建一个 SaaS 落地页

创建一个医疗分析仪表盘

设计一个暗黑模式作品集网站

设计一个电商移动端 UI

构建一个金融银行类应用（暗色主题）
```

---

### 工作原理

1. **用户提出需求**
2. **自动生成设计系统**
3. **智能推荐风格/配色/字体**
4. **生成 UI 代码**
5. **执行交付前校验（反模式检查）**

---

## 支持技术栈

| 分类        | 技术栈                     |
| --------- | ----------------------- |
| Web（HTML） | HTML + Tailwind（默认）     |
| React 生态  | React、Next.js、shadcn/ui |
| Vue 生态    | Vue、Nuxt.js、Nuxt UI     |
| 其他 Web    | Svelte、Astro            |
| iOS       | SwiftUI                 |
| Android   | Jetpack Compose         |
| 跨平台       | React Native、Flutter    |

---

## 设计系统命令（高级）

```bash
# 生成设计系统（ASCII）
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "beauty spa wellness" --design-system -p "Serenity Spa"

# Markdown 输出
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "fintech banking" --design-system -f markdown

# 领域搜索
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "glassmorphism" --domain style
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "elegant serif" --domain typography

# 技术栈规则
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "form validation" --stack react
```

---

## 设计系统持久化（Master + Override 模式）

```bash
python3 ... --design-system --persist -p "MyApp"
```

生成结构：

```
design-system/
├── MASTER.md
└── pages/
    └── dashboard.md
```

规则：

1. 优先读取页面级配置
2. 若不存在，则使用 MASTER

---

## 架构与贡献

### 用户

始终使用 CLI 安装：

```bash
npm install -g uipro-cli
uipro init --ai <platform>
```

---

### 贡献者

```bash
git clone https://github.com/nextlevelbuilder/ui-ux-pro-max-skill.git
cd ui-ux-pro-max-skill
```

修改：

* `data/*.csv` 数据
* `scripts/*.py` 引擎
* `templates/` 模板

构建测试：

```bash
cd cli && bun run build
node dist/index.js init --ai claude --offline
```

提交 PR（不要直接推 main）

---

## Star 历史

（Star 趋势图）

---

## 许可证

本项目基于 MIT License 开源。



# 参考资料

* any list
{:toc}