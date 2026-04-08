---
layout: post 
title: SEO Machine 一个专门的 Claude Code 工作空间，用于为任何企业创建长篇幅、针对 SEO 优化的博客内容。该系统帮助您研究、撰写、分析和优化能够在搜索引擎中获得良好排名并服务目标受众的内容。
date: 2026-04-08 21:01:55 +0800
categories: [AI]
tags: [ai, llm, seo]
published: true
---

# SEO Machine

一个专门的 Claude Code 工作空间，用于为任何企业创建长篇幅、针对 SEO 优化的博客内容。该系统帮助您研究、撰写、分析和优化能够在搜索引擎中获得良好排名并服务目标受众的内容。

## 概述

SEO Machine 基于 Claude Code 构建，提供：
- **自定义命令**：`/research`、`/write`、`/rewrite`、`/analyze-existing`、`/optimize`、`/performance-review`、`/publish-draft`、`/article`、`/priorities`，以及专门的研究和着陆页命令
- **专业代理**：内容分析器、SEO 优化器、元元素创建器、内部链接构建器、关键词映射器、编辑器、性能分析器、标题生成器、CRO 分析器、着陆页优化器
- **营销技能**：26 项营销技能，涵盖文案撰写、CRO、A/B 测试、邮件序列、定价策略等
- **高级 SEO 分析**：搜索意图检测、关键词密度与聚类、内容长度对比、可读性评分、SEO 质量评级（0-100）
- **数据集成**：Google Analytics 4、Google Search Console、DataForSEO，提供实时效果洞察
- **上下文驱动**：品牌声音、风格指南、SEO 指南和示例指导所有内容的生成
- **工作流组织**：为话题、研究、草稿和已发布内容提供结构化的目录

## 快速开始

### 前置条件
- 已安装 [Claude Code](https://claude.com/claude-code)
- Anthropic API 账户

### 安装

1. 克隆此仓库：
```bash
git clone https://github.com/[your-username]/seomachine.git
cd seomachine
```

2. 安装分析模块所需的 Python 依赖：
```bash
pip install -r data_sources/requirements.txt
```

这会安装：
- Google Analytics / Search Console 集成
- DataForSEO API 客户端
- NLP 库（nltk、textstat）
- 机器学习库（scikit-learn）
- 网页抓取工具（beautifulsoup4）

3. 在 Claude Code 中打开：
```bash
claude-code .
```

4. **自定义上下文文件**（重要！）：

   所有上下文文件都以模板形式提供。请用您公司的信息填写：

   - `context/brand-voice.md` - 定义您的品牌声音和消息传递 *(参考 examples/castos/ 目录)*
   - `context/writing-examples.md` - 添加您网站上 3-5 篇优秀的博客文章作为示例
   - `context/features.md` - 列出您产品/服务的功能和优势
   - `context/internal-links-map.md` - 映射用于内部链接的关键页面
   - `context/style-guide.md` - 填写您的风格偏好
   - `context/target-keywords.md` - 添加您的关键词研究和话题集群
   - `context/competitor-analysis.md` - 添加竞争对手分析和洞察
   - `context/seo-guidelines.md` - 查看并调整 SEO 要求

   **快速上手**：查看 `examples/castos/` 目录，其中包含一个播客托管 SaaS 公司完整填写的所有上下文文件的实际示例。

## 工作流

### 创建新内容

#### 1. 从研究开始
```
/research [话题]
```

**功能**：
- 执行关键词研究
- 分析前 10 名竞争对手
- 识别内容差距
- 创建全面的研究简报
- 保存到 `/research/` 目录

**示例**：
```
/research B2B SaaS 的内容营销策略
```

#### 2. 撰写文章
```
/write [话题或研究简报]
```

**功能**：
- 创建 2000-3000+ 字的 SEO 优化文章
- 保持 `context/brand-voice.md` 中定义的品牌声音
- 自然整合关键词
- 包含内部和外部链接
- 提供元元素（标题、描述、关键词）
- 自动触发优化代理
- 保存到 `/drafts/` 目录

**示例**：
```
/write B2B SaaS 的内容营销策略
```

**代理自动执行**：
撰写后，这些代理会自动分析内容：
- **SEO 优化器**：页面 SEO 建议
- **元元素创建器**：多个元标题/描述选项
- **内部链接器**：具体的内部链接建议
- **关键词映射器**：关键词位置和密度分析

#### 3. 最终优化
```
/optimize [文章文件]
```

**功能**：
- 全面的 SEO 审计
- 验证所有元素符合要求
- 提供最终润色建议
- 生成发布就绪评分
- 创建优化报告

**示例**：
```
/optimize drafts/content-marketing-strategies-2025-10-29.md
```

### 更新现有内容

#### 1. 分析现有文章
```
/analyze-existing [URL 或文件路径]
```

**功能**：
- 获取并分析当前内容
- 评估 SEO 效果
- 识别过时信息
- 评估竞争定位
- 提供内容健康评分（0-100）
- 推荐更新优先级和范围
- 保存分析结果到 `/research/` 目录

**示例**：
```
/analyze-existing https://yoursite.com/blog/marketing-guide
/analyze-existing published/marketing-guide-2024-01-15.md
```

#### 2. 重写/更新内容
```
/rewrite [话题或分析文件]
```

**功能**：
- 基于分析结果更新内容
- 刷新统计数据和示例
- 改进 SEO 优化
- 添加新章节填补空白
- 保留原文中有效的部分
- 追踪所做的更改
- 保存到 `/rewrites/` 目录

**示例**：
```
/rewrite 营销指南
```

## 命令参考

### `/research [话题]`
针对新内容的全面关键词和竞争研究。

**输出**：`/research/brief-[话题]-[日期].md` 研究简报

**包含内容**：
- 主要和次要关键词
- 竞争对手分析（前 10 名）
- 内容差距和机会
- 推荐大纲
- 内部链接策略
- 元元素预览

---

### `/write [话题]`
创建长篇幅 SEO 优化文章（2000-3000+ 字）。

**输出**：`/drafts/[话题]-[日期].md` 文章

**包含内容**：
- 包含 H1/H2/H3 结构的完整文章
- SEO 优化内容
- 内部和外部链接
- 元元素（标题、描述、关键词）
- SEO 检查清单

**自动触发**：
- SEO 优化器代理
- 元元素创建器代理
- 内部链接器代理
- 关键词映射器代理

---

### `/rewrite [话题]`
更新并改进现有内容。

**输出**：`/rewrites/[话题]-rewrite-[日期].md` 更新后的文章

**包含内容**：
- 重写/更新的内容
- 更改摘要
- 修改前后对比
- 更新的 SEO 元素

---

### `/analyze-existing [URL 或文件]`
分析现有博客文章以发现改进机会。

**输出**：`/research/analysis-[话题]-[日期].md` 分析报告

**包含内容**：
- 内容健康评分（0-100）
- 速赢机会（可立即改进的项）
- 战略改进建议
- 重写优先级和范围
- 用于重写的研究简报

---

### `/optimize [文件]`
发布前的最终 SEO 优化。

**输出**：`/drafts/optimization-report-[话题]-[日期].md` 优化报告

**包含内容**：
- SEO 评分（0-100）
- 优先修复项
- 速赢机会
- 元元素选项
- 链接增强建议
- 发布就绪评估

---

### `/publish-draft [文件]`
通过 REST API 将文章发布到 WordPress，并附带 Yoast SEO 元数据。

---

### `/article [话题]`
简化的文章创建工作流。

---

### `/priorities`
使用分析数据识别影响力最高的内容任务的内容优先级矩阵。

---

### `/scrub [文件]`
从内容中移除 AI 水印和模式（长破折号、填充短语、机器人化模式）。

---

### 研究命令

| 命令 | 描述 |
|------|------|
| `/research-serp [关键词]` | 针对目标关键词的 SERP 分析 |
| `/research-gaps` | 竞争对手内容差距分析 |
| `/research-trending` | 热门话题机会 |
| `/research-performance` | 基于效果的内容优先级 |
| `/research-topics` | 话题集群研究 |

---

### 着陆页命令

| 命令 | 描述 |
|------|------|
| `/landing-write [话题]` | 创建以转化为优化目标的着陆页 |
| `/landing-audit [文件]` | 审计着陆页的 CRO 问题 |
| `/landing-research [话题]` | 研究竞争对手和定位 |
| `/landing-competitor [URL]` | 深度竞争对手着陆页分析 |
| `/landing-publish [文件]` | 发布着陆页到 WordPress |

## 代理

专门化的代理，自动分析内容并提供专家建议。

### 内容分析器（新！）
**目的**：使用 5 个专门模块进行全面的、数据驱动的内容分析

**分析内容**：
- 搜索意图分类（信息类/导航类/交易类/商业类）
- 关键词密度和聚类，附带话题检测
- 内容长度与 SERP 前几名竞争对手的对比
- 可读性评分（Flesch Reading Ease、Flesch-Kincaid Grade Level）
- SEO 质量评级（0-100 分，附带分类细分）
- 关键词堆砌风险检测
- 被动语态比例和句子复杂度
- 按章节展示关键词位置的分布热力图

**输出**：
- 包含发布就绪评估的执行摘要
- 优先级行动计划（关键/高优先级/优化）
- 竞争定位分析
- 每个分析领域的详细建议
- 用于改进的具体指标和基准

**由以下模块驱动**：
- `search_intent_analyzer.py` - 搜索意图检测
- `keyword_analyzer.py` - 关键词密度、聚类、LSI 关键词
- `content_length_comparator.py` - SERP 竞争对手分析
- `readability_scorer.py` - 多项可读性指标
- `seo_quality_rater.py` - 综合 SEO 评分

---

### SEO 优化器
**目的**：页面 SEO 分析和优化建议

**分析内容**：
- 关键词优化和密度
- 内容结构和标题层级
- 内部和外部链接
- 元元素
- 可读性和用户体验
- 精选摘要机会

**输出**：SEO 评分（0-100）及具体的改进建议

---

### 元元素创建器
**目的**：生成高转化率的元标题和描述

**创建内容**：
- 5 个元标题变体（50-60 字符）
- 5 个元描述变体（150-160 字符）
- 测试建议
- SERP 预览
- 以转化为导向的文案

**输出**：多个选项，附带推荐和理由

---

### 内部链接器
**目的**：战略性的内部链接建议

**提供内容**：
- 3-5 条具体的内部链接建议
- 精确的放置位置
- 锚文本建议
- 用户旅程映射
- SEO 影响预测

**参考**：`context/internal-links-map.md`

---

### 关键词映射器
**目的**：关键词位置和整合分析

**分析内容**：
- 关键词密度和分布
- 关键位置检查清单
- 自然语言整合质量
- LSI 关键词覆盖
- 关键词自相残杀风险

**输出**：分布图、差距分析、具体的修订建议

---

### 编辑器
**目的**：将技术上准确的内容转化为听起来像人写的、引人入胜的文章

**分析内容**：
- 声音和个性
- 示例的具体程度
- 可读性和流畅度
- 机器人化与人类化模式
- 互动性和故事性

**提供内容**：
- 人性化评分（0-100）
- 关键编辑建议（修改前后对比）
- 模式分析
- 注入个性的具体重写建议
- 可读性改进

**输出**：编辑报告，包含让内容听起来更像真人撰写的具体改进建议

---

### 性能分析器
**目的**：使用真实分析数据进行数据驱动的内容优先级排序

**分析内容**：
- Google Analytics 流量和趋势
- Google Search Console 排名和点击率
- DataForSEO 竞争数据
- 速赢机会（排名 11-20）
- 表现下滑的内容
- 低点击率机会
- 热门话题

**提供内容**：
- 内容任务优先级队列
- 机会评分（0-100）
- 影响和投入估算
- 逐周路线图
- 成功指标

**输出**：全面的性能报告，附带可执行的优先级

---

### 标题生成器
**目的**：生成高转化率的标题变体和 A/B 测试建议

**提供内容**：
- 10+ 个使用成熟公式的标题变体
- 转化潜力评分
- A/B 测试策略
- 针对特定受众的标题选项

---

### CRO 分析器
**目的**：针对着陆页的转化率优化分析

**分析内容**：
- 首屏效果
- CTA 质量和分布
- 信任信号存在性
- 转化阻力点
- 页面结构

---

### 着陆页优化器
**目的**：全面的着陆页优化建议

**提供内容**：
- CRO 评分（0-100），附带分类细分
- 首屏、CTA、信任信号、结构和 SEO 分析
- A/B 测试建议
- 优先级行动清单

## 营销技能

SEO Machine 包含 26 项可作为斜杠命令使用的营销技能：

| 类别 | 技能 |
|------|------|
| **文案撰写** | `/copywriting`、`/copy-editing` |
| **CRO** | `/page-cro`、`/form-cro`、`/signup-flow-cro`、`/onboarding-cro`、`/popup-cro`、`/paywall-upgrade-cro` |
| **策略** | `/content-strategy`、`/pricing-strategy`、`/launch-strategy`、`/marketing-ideas` |
| **渠道** | `/email-sequence`、`/social-content`、`/paid-ads` |
| **SEO** | `/seo-audit`、`/schema-markup`、`/programmatic-seo`、`/competitor-alternatives` |
| **分析** | `/analytics-tracking`、`/ab-test-setup` |
| **其他** | `/referral-program`、`/free-tool-strategy`、`/marketing-psychology` |

## 数据源

### 与分析工具的集成

SEO Machine 集成实时数据源，为内容策略提供信息：

**Google Analytics 4**：
- 流量和互动指标
- 转化跟踪
- 趋势分析
- 流量来源

**Google Search Console**：
- 关键词排名和位置
- 展示次数和点击次数
- 点击率分析
- 查询效果

**DataForSEO**：
- 竞争对手排名
- SERP 特性
- 关键词指标
- 竞争对手差距分析

### 高级 SEO 分析模块（新！）

SEO Machine 包含 5 个专门的 Python 模块，用于全面的内容分析：

**搜索意图分析器**（`search_intent_analyzer.py`）：
- 将查询分类为信息类、导航类、交易类或商业类意图
- 分析 SERP 特性和内容模式
- 提供置信度评分和内容对齐建议

**关键词分析器**（`keyword_analyzer.py`）：
- 计算精确的关键词密度和分布
- 检测关键词堆砌风险并发出警告
- 使用 TF-IDF 和 K-means 进行话题聚类
- 生成按章节分布的热力图
- 识别 LSI（语义相关）关键词

**SEO 质量评级器**（`seo_quality_rater.py`）：
- 根据 SEO 最佳实践对内容进行评分（0-100 分）
- 分类细分：内容、关键词、元数据、结构、链接、可读性
- 识别关键问题、警告和建议
- 确定发布就绪状态

**内容长度对比器**（`content_length_comparator.py`）：
- 获取并分析前 10-20 名 SERP 竞争对手的字数
- 计算中位数、第 75 百分位数和最佳长度
- 显示竞争定位和与目标的差距
- 提供数据驱动的扩展建议

**可读性评分器**（`readability_scorer.py`）：
- Flesch Reading Ease 和 Flesch-Kincaid Grade Level
- 句子和段落结构分析
- 被动语态检测和比例计算
- 复杂词汇识别
- 过渡词使用分析
- 整体可读性评分（0-100）

所有模块都可以直接在 Python 中使用，或通过内容分析器代理使用。

### CRO 分析模块

六个用于着陆页转化优化的 Python 模块：

- `above_fold_analyzer.py` - 首屏内容分析（标题、价值主张、CTA、信任）
- `cta_analyzer.py` - CTA 效果评分（质量、分布、目标对齐）
- `trust_signal_analyzer.py` - 信任信号检测（推荐信、社会证明、风险逆转）
- `landing_page_scorer.py` - 着陆页整体评分（0-100 分，附带分类细分）
- `landing_performance.py` - 通过 GA4/GSC 跟踪着陆页效果
- `cro_checker.py` - CRO 最佳实践检查清单验证

### 附加分析模块

- `opportunity_scorer.py` - 用于内容优先级的 8 因素机会评分
- `content_scorer.py` - 5 维内容质量评分（人性化、具体性、结构、SEO、可读性）
- `engagement_analyzer.py` - 内容互动模式分析
- `competitor_gap_analyzer.py` - 竞争内容差距识别
- `article_planner.py` - 数据驱动的文章规划
- `section_writer.py` - 章节级内容指导
- `social_research_aggregator.py` - 社交媒体研究聚合

### Python 研究脚本

从仓库根目录运行：

```bash
# 内容研究
python3 research_quick_wins.py
python3 research_competitor_gaps.py
python3 research_performance_matrix.py
python3 research_priorities_comprehensive.py
python3 research_serp_analysis.py
python3 research_topic_clusters.py
python3 research_trending.py

# SEO 分析（需配置 - 先在 config/competitors.json 中设置）
python3 seo_baseline_analysis.py
python3 seo_bofu_rankings.py
python3 seo_competitor_analysis.py

# 测试 API 连接
python3 test_dataforseo.py
```

**注意**：SEO 分析脚本从 `config/competitors.json` 加载竞争对手列表和关键词。复制 `config/competitors.example.json` 并根据您的业务进行自定义。

### WordPress 集成

发布功能使用 WordPress REST API，配合一个暴露 Yoast SEO 字段的自定义 MU 插件。

**设置步骤**：
1. 将 `wordpress/seo-machine-yoast-rest.php` 作为 MU 插件安装到您的 WordPress 站点
2. 将 `wordpress/functions-snippet.php` 添加到您主题的 functions.php 中
3. 在 `.env` 中配置 WordPress 凭据：
   ```
   WP_URL=https://yoursite.com
   WP_USERNAME=your_username
   WP_APP_PASSWORD=your_application_password
   ```

详细设置说明请参阅 `wordpress/README.md`。

分析设置说明请参阅 `data_sources/README.md`。

## 目录结构

```
seomachine/
├── .claude/
│   ├── commands/          # 自定义工作流命令
│   │   ├── analyze-existing.md
│   │   ├── research.md
│   │   ├── write.md
│   │   ├── rewrite.md
│   │   ├── optimize.md
│   │   ├── scrub.md
│   │   ├── performance-review.md
│   │   ├── publish-draft.md
│   │   ├── article.md
│   │   ├── priorities.md
│   │   ├── research-serp.md
│   │   ├── research-gaps.md
│   │   ├── research-trending.md
│   │   ├── research-performance.md
│   │   ├── research-topics.md
│   │   ├── landing-write.md
│   │   ├── landing-audit.md
│   │   ├── landing-research.md
│   │   ├── landing-competitor.md
│   │   └── landing-publish.md
│   ├── agents/            # 专门的分析代理
│   │   ├── content-analyzer.md
│   │   ├── seo-optimizer.md
│   │   ├── meta-creator.md
│   │   ├── internal-linker.md
│   │   ├── keyword-mapper.md
│   │   ├── editor.md
│   │   ├── performance.md
│   │   ├── headline-generator.md
│   │   ├── cro-analyst.md
│   │   └── landing-page-optimizer.md
│   └── skills/            # 26 项营销技能
├── data_sources/          # 分析集成
│   ├── modules/          # Python 分析模块
│   │   ├── google_analytics.py
│   │   ├── google_search_console.py
│   │   ├── dataforseo.py
│   │   ├── data_aggregator.py
│   │   ├── search_intent_analyzer.py
│   │   ├── keyword_analyzer.py
│   │   ├── seo_quality_rater.py
│   │   ├── content_length_comparator.py
│   │   ├── readability_scorer.py
│   │   ├── opportunity_scorer.py
│   │   ├── content_scorer.py
│   │   ├── engagement_analyzer.py
│   │   ├── social_research_aggregator.py
│   │   ├── competitor_gap_analyzer.py
│   │   ├── article_planner.py
│   │   ├── section_writer.py
│   │   ├── wordpress_publisher.py
│   │   ├── above_fold_analyzer.py
│   │   ├── cro_checker.py
│   │   ├── cta_analyzer.py
│   │   ├── landing_page_scorer.py
│   │   ├── landing_performance.py
│   │   └── trust_signal_analyzer.py
│   ├── config/           # API 凭据（不加入 git）
│   ├── utils/            # 辅助函数
│   ├── cache/            # 缓存的 API 响应
│   └── README.md         # 设置说明
├── config/                # 配置文件
│   └── competitors.example.json  # 竞争对手配置模板
├── context/               # 配置和指南
│   ├── brand-voice.md
│   ├── writing-examples.md
│   ├── style-guide.md
│   ├── seo-guidelines.md
│   ├── target-keywords.md
│   ├── internal-links-map.md
│   ├── competitor-analysis.md
│   └── cro-best-practices.md
├── wordpress/             # WordPress 集成
│   ├── seo-machine-yoast-rest.php
│   ├── functions-snippet.php
│   └── README.md
├── topics/                # 原始话题想法
├── research/              # 研究简报和分析报告
├── drafts/                # 进行中的文章
├── review-required/       # 待审阅的文章
├── published/             # 准备发布的最终版本
├── rewrites/              # 更新后的现有内容
├── landing-pages/         # 着陆页内容
├── audits/                # 审计报告
└── README.md              # 本文件
```

## 上下文文件（重要！）

内容的质量取决于正确配置的上下文文件：

### `context/brand-voice.md`
定义您的品牌声音、语调和消息传递框架。

**必须包含**：
- 声音支柱
- 按内容类型划分的语调指南
- 核心品牌信息
- 写作风格指南
- 术语偏好

**目的**：确保所有内容听起来都像您的品牌

---

### `context/writing-examples.md`
包含您网站上 3-5 篇优秀的博客文章。

**必须包含**：
- 完整文章内容
- 每个示例优秀之处
- 关于声音和结构的关键要点

**目的**：通过示例教会 AI 您特定的写作风格

---

### `context/style-guide.md`
编辑和格式标准。

**必须包含**：
- 语法和机制规则
- 大小写惯例
- 格式标准
- 首选术语

**目的**：保持所有内容的一致性

---

### `context/seo-guidelines.md`
SEO 最佳实践和要求。

**包含内容**：
- 内容长度要求
- 关键词优化规则
- 元元素标准
- 链接策略指南
- 可读性要求

**目的**：确保所有内容符合 SEO 标准

---

### `context/target-keywords.md`
按话题集群组织的关键词研究。

**必须包含**：
- 按集群划分的核心关键词
- 集群关键词（子话题）
- 长尾变体
- 搜索意图分类
- 当前排名

**目的**：指导新内容的关键词定位

---

### `context/internal-links-map.md`
用于内部链接的网站关键页面目录。

**必须包含**：
- 产品页面和功能
- 核心内容 URL
- 表现最佳的博客文章
- 话题集群映射
- 推荐的锚文本

**目的**：使每篇文章都能进行战略性内部链接

---

### `context/competitor-analysis.md`
竞争情报和内容差距。

**必须包含**：
- 主要竞争对手
- 他们的内容策略
- 关键词差距
- 差异化机会

**目的**：为内容策略和竞争定位提供信息

## 内容质量标准

每篇文章必须满足以下要求：

### 内容
- [ ] 最少 2,000 字（2,500-3,000+ 为佳）
- [ ] 与竞争对手相比提供独特价值
- [ ] 事实准确且与时俱进
- [ ] 为目标受众提供可操作的建议
- [ ] 保持品牌声音

### SEO
- [ ] 主要关键词密度 1-2%
- [ ] 关键词出现在 H1、前 100 字、2-3 个 H2 中
- [ ] 3-5 个内部链接，使用描述性锚文本
- [ ] 2-3 个外部权威链接
- [ ] 元标题 50-60 字符
- [ ] 元描述 150-160 字符
- [ ] 正确的 H1 > H2 > H3 层级

### 可读性
- [ ] 8-10 年级阅读水平
- [ ] 平均句长 15-20 词
- [ ] 段落 2-4 句
- [ ] 每 300-400 字设置小标题
- [ ] 使用列表和格式提高可扫读性

### 结构
- [ ] 引人入胜的引言（钩子、问题、承诺）
- [ ] 逻辑清晰的章节流程
- [ ] 明确的结论，包含行动呼吁
- [ ] 包含示例和数据

## 最佳实践

### 写作之前
1. **先做研究**：在 `/write` 之前始终运行 `/research`
2. **回顾上下文**：阅读 `brand-voice.md` 和相关的 `writing-examples.md`
3. **检查关键词**：在 `target-keywords.md` 中验证目标关键词
4. **规划内部链接**：查看 `internal-links-map.md` 寻找链接机会

### 写作过程中
1. **遵循简报**：使用研究简报作为大纲
2. **自然的关键词**：自然整合关键词，绝不强行堆砌
3. **增加价值**：每个章节都应提供可操作的洞察
4. **使用示例**：包含来自您行业的真实场景和用例
5. **引用来源**：链接到统计数据和数据源

### 写作之后
1. **审阅代理输出**：仔细阅读所有代理建议
2. **进行改进**：在优化之前解决高优先级问题
3. **运行优化**：使用 `/optimize` 进行最终润色
4. **自我编辑**：以目标读者的身份阅读文章
5. **检查质量**：验证所有检查清单项目是否满足

### 重写内容时
1. **先分析**：运行 `/analyze-existing` 了解范围
2. **确定策略**：轻量更新还是大幅重写？
3. **保留有效部分**：保留效果好的章节
4. **聚焦差距**：补充竞争对手内容中缺失的部分
5. **更新一切**：统计数据、示例、截图、链接

## 工作流示例

### 示例 1：从头创建新内容

```
# 步骤 1：添加话题想法
# 在 topics/ 目录中创建文件，记录初步想法

# 步骤 2：研究话题
/research content marketing strategies

# 步骤 3：审阅研究简报
# 阅读 research/brief-content-marketing-strategies-[日期].md

# 步骤 4：撰写文章
/write content marketing strategies

# 步骤 5：审阅代理反馈
# 阅读 drafts/ 中的所有代理报告

# 步骤 6：进行改进
# 根据代理建议编辑文章

# 步骤 7：最终优化
/optimize drafts/content-marketing-strategies-[日期].md

# 步骤 8：发布到 WordPress（可选）
/publish-draft drafts/content-marketing-strategies-[日期].md
```

### 示例 2：更新现有内容

```
# 步骤 1：分析现有文章
/analyze-existing https://yoursite.com/blog/product-comparison

# 步骤 2：审阅分析报告
# 阅读 research/analysis-product-comparison-2025-10-29.md
# 检查内容健康评分和优先级

# 步骤 3：重写内容
/rewrite product comparison

# 步骤 4：审阅更改
# 阅读 rewrites/product-comparison-rewrite-2025-10-29.md
# 查看更改摘要

# 步骤 5：优化
/optimize rewrites/product-comparison-rewrite-2025-10-29.md

# 步骤 6：发布
# 准备就绪后移动到 published/
```

### 示例 3：快速内容审计

```
# 分析多篇现有文章以确定更新优先级
/analyze-existing https://yoursite.com/blog/post-1
/analyze-existing https://yoursite.com/blog/post-2
/analyze-existing https://yoursite.com/blog/post-3

# 查看内容健康评分
# 根据以下条件确定重写优先级：
# - 最低的评分
# - 最高的流量潜力
# - 战略重要性
```

## 技巧与窍门

### 最大化内容质量
- **研究示例**：每次写作前阅读您的 `writing-examples.md`
- **使用数据**：始终包含最新的统计数据并引用来源
- **具体化**："提升 40%" 比 "显著提升" 更好
- **展示而非讲述**：使用您行业中的真实示例和场景
- **回答问题**：解答研究中发现的 "People Also Ask" 问题

### SEO 优化
- **关键词前置**：将主要关键词放在前 100 字内
- **自然整合**：大声朗读内容——如果关键词听起来生硬，就重写
- **变化锚文本**：不要对所有内部链接使用相同的锚文本
- **战略链接**：链接到核心内容和相关的集群文章
- **定期更新**：每 6-12 个月刷新表现最佳的内容

### 工作流效率
- **批量研究**：在一次会话中研究多个话题
- **遵循结构**：使用 `/write` 命令生成的一致文章结构
- **先处理高优先级**：在优化细节之前修复关键问题
- **明智使用代理**：让代理处理分析，您专注于写作
- **构建模板**：保存常用章节以便复用

### 避免常见错误
- ❌ 跳过研究阶段
- ❌ 忽略品牌声音指南
- ❌ 强行堆砌关键词
- ❌ 忘记内部链接
- ❌ 不引用数据来源
- ❌ 未经优化就发布
- ❌ 复制竞争对手内容而非差异化

## 维护

### 每周
- 向 `/topics/` 添加新的话题想法
- 用新的关键词机会更新 `target-keywords.md`
- 检查 `internal-links-map.md` 中的失效链接

### 每月
- 审查已发布内容的表现
- 如果有更好的示例出现，更新 `writing-examples.md`
- 将新发布的内容添加到 `internal-links-map.md`
- 在 `competitor-analysis.md` 中跟踪竞争对手活动

### 每季度
- 全面审计上下文文件
- 根据算法变化更新 SEO 指南
- 全面刷新竞争对手分析
- 审查并更新 `target-keywords.md` 中的话题集群

## 故障排除

### "内容听起来不像我的品牌"
- **解决方案**：用更具体的指导更新 `context/brand-voice.md`
- **解决方案**：向 `context/writing-examples.md` 添加更多样化的示例
- **解决方案**：在使用 `/write` 命令时引用具体示例

### "关键词密度过高/过低"
- **解决方案**：查看 `seo-guidelines.md` 中的目标密度（1-2%）
- **解决方案**：使用 `/optimize` 获取具体的关键词位置建议
- **解决方案**：使用关键词映射器代理进行分布分析

### "内部链接不相关"
- **解决方案**：用当前页面更新 `context/internal-links-map.md`
- **解决方案**：按话题集群组织，以便代理更容易匹配
- **解决方案**：提供更多关于每个页面内容的上下文

### "文章与竞争对手过于相似"
- **解决方案**：更新 `competitor-analysis.md` 中的差异化机会
- **解决方案**：将您的独特优势添加到 `brand-voice.md` 和 `features.md`
- **解决方案**：在 `/research` 命令中引用具体的差异化角度

## 支持与贡献

### 获取帮助
- 仔细阅读本 README
- 检查上下文文件是否正确配置
- 查阅 [Claude Code 文档](https://docs.claude.com/claude-code)

### 贡献
- 通过 GitHub Issues 报告问题
- 对命令或代理提出改进建议
- 分享成功的工作流或技巧

## 许可证

[在此添加您的许可证信息]

## 致谢

由 Anthropic 使用 [Claude Code](https://claude.com/claude-code) 构建。

最初为 Castos 开发，现作为开源工具提供给任何企业，以简化长篇幅 SEO 内容的创建。

## 示例与社区

**实际效果**：查看 `examples/castos/` 目录，了解一家播客托管 SaaS 公司如何使用 SEO Machine 的真实完整示例。

**欢迎贡献**：发现 bug？有功能需求？想分享您所在行业的示例？欢迎贡献代码和提交 PR！

---

**准备好开始创建了吗？**

1. 配置您的上下文文件（以模板为指南）
2. 运行 `/research [您的话题]`
3. 审阅简报
4. 运行 `/write [您的话题]`
5. 发布精彩内容！

祝写作愉快！📝


# 参考资料

* any list
{:toc}