---
layout: post 
title: 项目：TaxHacker  一个自托管的 AI 会计应用，用 LLM 自动分析发票、收据和交易数据
date: 2026-04-01 21:01:55 +0800
categories: [AI]
tags: [ai, LLM]
published: true
---

# 📦 项目：TaxHacker

## 🧠 一句话（翻译）

> **一个自托管的 AI 会计应用，用 LLM 自动分析发票、收据和交易数据** ([GitHub][1])

---

# 📌 项目定位（核心翻译）

TaxHacker 是一个面向：

* 自由职业者（freelancer）
* 独立开发者（indie hacker）
* 小型企业

的工具，用来：

> **自动化记账 + 报税准备 + 发票管理**

---

# 🎯 解决的核心问题

👉 传统痛点：

* 手动录入收据（极其耗时）
* 多币种换算复杂
* 分类混乱
* 报税准备繁琐

👉 TaxHacker 的目标：

```text
拍照 → AI解析 → 自动结构化 → 可导出报税
```

---

# ⚙️ 核心能力（翻译）

## 1️⃣ AI 发票/收据解析（最核心）

上传：

* 收据照片
* 发票 PDF
* 银行账单

系统会自动提取：

* 商家（merchant）
* 金额（amount）
* 日期（date）
* 商品明细（items）
* 税（tax）

并存入结构化数据库 ([GitHub][1])

---

### ✨ 关键能力

* 自动分类（Auto-categorization）
* 拆分明细（item splitting）
* 多语言识别（甚至手写）

👉 本质：

```text
OCR + LLM 语义解析
```

---

## 2️⃣ 多币种 & 加密货币支持

支持：

* 170+ 法币
* BTC / ETH 等加密货币

能力：

* 自动识别币种
* 按交易日期汇率转换（历史汇率） ([GitHub][1])

---

👉 这个点非常关键：

> 不用当前汇率，而是**交易当天汇率（符合税务要求）**

---

## 3️⃣ 完全自定义数据模型（非常重要）

你可以：

* 自定义字段（类似 Excel 列）
* 自定义分类（categories）
* 自定义项目（projects）

---

### 🔥 更强的是：

> 每个字段都可以绑定一个 AI Prompt

例如：

```text
字段：风险评估
Prompt：这个发票是否可能被税务局拒绝？
```

---

👉 本质：

```text
数据库字段 = AI 可计算字段
```

---

## 4️⃣ 可自定义 AI Prompt（核心亮点）

你可以修改：

* 系统 Prompt
* 字段 Prompt
* 分类规则

👉 甚至可以：

```text
完全控制 AI 的行为
```

---

这点非常关键：

> TaxHacker ≠ 固定产品
> TaxHacker = 可编程 AI 会计系统

---

## 5️⃣ 数据过滤 & 导出

支持：

* 按时间 / 分类 / 项目过滤
* 全文搜索
* CSV 导出
* 报税报告

👉 可直接交给会计师

---

## 6️⃣ 自托管（核心卖点）

* 本地部署（Docker）
* 数据完全私有
* 无厂商锁定

```bash
docker compose up
```

---

👉 本质：

```text
你的财务数据 = 完全归你
```

---

# 🏗️ 技术架构（翻译）

## 技术栈

* 前端：Next.js 15+
* 数据库：PostgreSQL
* ORM：Prisma
* AI：OpenAI / Gemini / Mistral
* PDF处理：Ghostscript / GraphicsMagick ([GitHub][1])

---

## 部署结构（Docker）

包含：

* App 容器
* PostgreSQL
* 持久化存储

---

## 核心数据流

```text
上传文件
   ↓
AI解析（LLM）
   ↓
结构化数据（DB）
   ↓
过滤 / 导出 / 报表
```

---

# 🧠 核心设计思想（非常关键）

## 🔥 1️⃣ “AI + 结构化数据”的结合

不是简单 OCR：

```text
传统：图片 → 文本
TaxHacker：图片 → 语义结构
```

---

## 🔥 2️⃣ 用户完全控制 AI

传统 SaaS：

> AI 是黑盒

TaxHacker：

> AI 是可配置系统

---

## 🔥 3️⃣ Excel 化数据模型

```text
交易表 = 可扩展表结构
```

👉 非常像：

* Airtable
* Notion DB

但加了 AI

---

## 🔥 4️⃣ 自托管优先

目标用户：

> 技术人 / 独立开发者

👉 核心价值：

* 隐私
* 可控
* 可扩展

---

# 🚀 和传统工具的区别

| 维度   | 传统记账软件 | TaxHacker |
| ---- | ------ | --------- |
| 数据输入 | 手动     | AI 自动     |
| 数据结构 | 固定     | 可自定义      |
| AI能力 | 无/弱    | 强         |
| 可扩展性 | 低      | 极高        |
| 数据控制 | SaaS   | 自托管       |

---

# 🧩 本质抽象（非常重要）

你可以这样理解：

```text
TaxHacker = AI + 可配置数据表 + 工作流
```

或者更本质：

```text
TaxHacker = 面向财务的 AI ETL 系统
```

---

# 🔥 Reddit 用户真实反馈（有价值）

> “it saves me a lot of time and nerves” ([Reddit][2])

> “I gave up paid bookkeeping” ([Reddit][2])

👉 说明：

* 对 freelancer 非常实用
* 可以替代部分会计服务

---

# 🚀 对你当前方向的价值（重点）

你在做：

> IM + 推荐 + AI 根因分析平台

这个项目对你启发很大👇

---

## 🧠 1️⃣ “数据 + AI Prompt”模型

你可以直接套：

```text
日志 / 报警
   ↓
AI解析（Prompt可配）
   ↓
结构化数据
```

---

👉 类似：

```text
字段：root_cause
Prompt：分析根因
```

---

## 🧠 2️⃣ “用户可编程 AI”

TaxHacker：

> 用户定义 AI 行为

你可以做：

```text
运维工程师定义分析规则（Prompt）
```

---

👉 这比写规则引擎更强：

* 更灵活
* 更快上线
* 更易迭代

---

## 🧠 3️⃣ “AI ETL”能力

TaxHacker 本质是：

```text
非结构化数据 → AI → 结构化数据
```

你可以做：

```text
日志 / Trace → AI → 根因数据
```

---

## 🧠 4️⃣ Skill + TaxHacker 思想融合

你之前看的：

* Skills → SOP
* Agent Lightning → 学习系统

这个项目补上：

👉 **数据层**

---

## 🧩 可以组合成完整体系：

```text
Skill（规则）
 + TaxHacker（数据结构化）
 + Lightning（学习）
```

👉 = 可进化 AI 平台

---

# 🧩 一句话总结

> TaxHacker 本质是：
>
> **一个“让 AI 参与数据结构化和业务建模”的通用平台（只是应用在财务场景）**


# 参考资料

* any list
{:toc}