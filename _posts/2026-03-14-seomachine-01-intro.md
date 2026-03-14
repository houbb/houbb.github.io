---
layout: post
title: SEO Machine 用于自动创建 SEO 优化的长篇博客内容
date: 2026-03-13 21:01:55 +0800
categories: [AI]
tags: [ai, sh]
published: true
---

# SEO Machine

**SEO Machine** 是一个基于 **Claude Code** 的专用工作空间，用于自动创建 **SEO 优化的长篇博客内容**。

它提供完整的内容生产流程：

* 研究（Research）
* 写作（Writing）
* 分析（Analysis）
* SEO 优化（Optimization）

目标是帮助企业和创作者创建 **能够在搜索引擎中排名更高的内容**。 ([Trendshift][1])

---

# 项目定位

SEO Machine 的核心理念：

> 用 AI Agent 自动完成整个 SEO 内容生产流程。

传统流程：

```
关键词研究
→ 竞品分析
→ 内容规划
→ 写作
→ SEO优化
→ 数据分析
```

SEO Machine 会将这些步骤 **全部自动化**。

---

# 核心功能

## 1 自动 SEO 研究

使用 `/research` 命令可以自动进行：

* 关键词研究
* SERP 分析
* 竞品内容分析
* 搜索意图分析

系统会分析 Google 搜索结果前 10 名内容，包括：

* 内容结构
* 文章长度
* SERP 特性
* 搜索意图

从而生成 **完整的内容 brief**。 ([mdgrok][2])

---

## 2 自动写作

使用命令：

```
/write [topic]
```

系统会生成：

* **2000–3000 字 SEO 文章**
* 包含完整结构

例如：

```
H1 标题
引言
H2/H3 章节
FAQ
总结
CTA
```

并自动包含：

* 关键词优化
* 内链
* 外链
* Meta 标签。 ([Telegram][3])

---

## 3 文章优化

命令：

```
/optimize
```

功能：

* SEO评分
* 关键词密度分析
* 可读性评分
* 内容长度对比

评分范围：

```
0 - 100
```

---

## 4 内容更新

命令：

```
/rewrite
```

作用：

* 更新旧文章
* 优化排名下降的内容
* 根据最新 SERP 重新写作

---

## 5 数据驱动 SEO

SEO Machine 可以连接真实数据源：

* Google Analytics 4
* Google Search Console
* DataForSEO

系统可以自动分析：

* 流量趋势
* CTR
* 排名变化
* 内容机会

然后生成 **优化任务列表**。 ([mdgrok][2])

---

# AI Agent 工作流程

SEO Machine 实际上是一个 **多 Agent SEO 系统**：

```
Research Agent
      ↓
Content Planner
      ↓
Writer Agent
      ↓
SEO Optimizer
      ↓
Meta Generator
      ↓
Internal Link Agent
```

每个 Agent 负责不同任务。

---

# 内容生成流程

完整文章生成流程：

```
STEP 1
SERP 分析

STEP 2
社交媒体研究
(Reddit / YouTube)

STEP 3
文章规划
(章节结构)

STEP 4
逐章节写作
```

这样可以避免 AI 写出 **空洞、重复的内容**。 ([mdgrok][2])

---

# SEO 内容标准

SEO Machine 生成的文章默认遵循以下标准：

### 文章长度

```
2000 – 3000+ 字
```

### 文章结构

* H1 标题
* 4–7 个 H2
* 多个 H3

### SEO要求

* 关键词密度 1–2%
* 3–5 个内部链接
* 2–3 个外部权威链接
* Meta title
* Meta description

---

# 性能分析功能

命令：

```
/performance-review
```

系统会自动：

1. 从 Google Analytics 获取流量
2. 从 Search Console 获取排名
3. 从 DataForSEO 获取关键词数据
4. 分析机会

输出内容包括：

* 快速优化机会
* 排名下降内容
* CTR 低的页面
* 新趋势关键词

---

# 内容分类分析

命令：

```
/research-performance
```

系统会将所有内容分为四类：

| 类型                 | 含义        |
| ------------------ | --------- |
| ⭐ Stars            | 高流量 + 高排名 |
| 🚀 Overperformers  | 高流量 + 排名低 |
| ⚠️ Underperformers | 低流量 + 排名高 |
| 📉 Declining       | 流量下降      |

用于确定 **优化优先级**。

---

# 技术栈

项目主要使用：

* Python
* BeautifulSoup
* scikit-learn
* textstat
* NLTK

并支持：

* SERP API
* Google API

依赖安装：

```
pip install -r data_sources/requirements.txt
```

---

# 安装方式

1️⃣ 克隆仓库

```
git clone https://github.com/TheCraigHewitt/seomachine.git
cd seomachine
```

2️⃣ 安装依赖

```
pip install -r data_sources/requirements.txt
```

3️⃣ 启动 Claude Code

```
claude-code .
```

---

# 上下文配置（非常重要）

SEO Machine 需要配置企业信息。

主要文件：

```
context/
```

包括：

```
brand-voice.md
writing-examples.md
features.md
style-guide.md
internal-links-map.md
target-keywords.md
```

这些文件定义：

* 品牌语气
* 写作风格
* 产品信息
* SEO策略。 ([DEV Community][4])

---

# 项目总结

SEO Machine 本质是：

> **AI SEO 内容生产系统**

核心能力：

* AI 自动 SEO 研究
* 自动长文写作
* 自动 SEO 优化
* 数据驱动内容策略
* 多 Agent 内容生产流程

适合：

* SaaS 公司
* 内容营销团队
* SEO 团队
* 博客站点运营

---

如果你愿意，我可以再给你一个 **更深层的技术分析**（其实这个项目背后是一个很大的趋势）：

我可以给你拆出来：

**AI SEO 工厂架构（Content Factory）**

很多公司现在都在做：

```
AI Keyword Research
       ↓
AI Content Planner
       ↓
AI Article Generator
       ↓
AI SEO Optimizer
       ↓
AI Content Distribution
```

我可以顺便给你一张 **“AI内容工厂架构图”**（这其实是未来 SaaS 的一个重要方向）。

[1]: https://trendshift.io/repositories/22092?utm_source=chatgpt.com "Trendshift - Trending Repository Details"
[2]: https://mdgrok.com/repos/TheCraigHewitt/seomachine?utm_source=chatgpt.com "TheCraigHewitt/seomachine - mdgrok"
[3]: https://t.me/s/githubtrending/15537?utm_source=chatgpt.com "GitHub Trends – Telegram"
[4]: https://dev.to/gary_yan_86eb77d35e0070f5/claude-code-seomachineai-xie-seo-wen-zhang-de-zheng-que-zi-shi-20kf?utm_source=chatgpt.com "Claude Code + SEOMachine：AI 写 SEO 文章的正确姿势 - DEV Community"


# 参考资料

* any list
{:toc}