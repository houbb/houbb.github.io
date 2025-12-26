---
layout: post
title: AI SDD 开发规范-21-Agent Skills 规范
date: 2025-11-20 14:12:33 +0800
categories: [AI]
tags: [ai, sdd, sh]
published: true
---

# Agent Skills 规范

以下定义了 **Agent Skills（智能体技能）** 的完整格式规范。([代理技能][1])

---

## 目录结构

一个 Skill 必须是一个目录，该目录至少包含一个 **SKILL.md** 文件：

```
skill-name/
└── SKILL.md          # 必需
```

你也可以选择在技能目录下包含额外的支持性子目录，例如：

* `scripts/`
* `references/`
* `assets/` ([代理技能][1])

---

## SKILL.md 格式

`SKILL.md` 文件必须从一个 **YAML Frontmatter** 开始，后面跟随 **Markdown 正文内容**。([代理技能][1])

### Frontmatter（必需字段）

Frontmatter 必须用 `---` 包裹，并至少包括两个必需字段：

```yaml
---
name: skill-name
description: 这个技能做什么以及何时使用它。
---
```

也可以包含以下可选字段：

```yaml
---
name: pdf-processing
description: Extract text and tables from PDF files, fill forms, merge documents.
license: Apache-2.0
metadata:
  author: example-org
  version: "1.0"
---
```

Frontmatter 字段说明如下：([代理技能][1])

#### name 字段（必需）

* 必须长度 **1–64 个字符**
* 仅允许使用 **小写字母、数字和短横线（`-`）**
* 不允许以短横线开头或结尾
* 不允许包含连续两个短横线 (`--`)
* 必须与父目录名称匹配

示例（有效）：

```yaml
name: pdf-processing
```

示例（无效）：

````yaml
name: PDF-Processing       # 大写不允许  
name: -pdf                 # 不能以 - 开头  
name: pdf--processing      # 不能有连续 --
``` :contentReference[oaicite:4]{index=4}

---

#### description 字段（必需）

- 必须是 **非空字符串**，长度最多 **1024 字符**
- 应该描述技能“做什么”和“何时使用”

**好例子**：

```yaml
description: 提取 PDF 文件中的文本和表格、填写表单并合并多个 PDF。 当处理 PDF 文档或用户提及 PDF、表单或文档提取时使用。
````

**差例子**：

````yaml
description: 帮助处理 PDF 文件。
``` :contentReference[oaicite:5]{index=5}

---

#### 可选字段说明

**license**（可选）

- 指定技能适用的许可证
- 推荐使用简短的许可证名称或包括许可证文件名

示例：

```yaml
license: Apache-2.0
``` :contentReference[oaicite:6]{index=6}

**compatibility**（可选）

- 如果技能有特定的运行环境要求，可在此描述
- 最多 **500 字符**
- 例如指定目标产品、系统依赖、网络访问需求等

示例：

```yaml
compatibility: Designed for Claude Code (or similar products)
``` :contentReference[oaicite:7]{index=7}

**metadata**（可选）

- 一组自定义键值对
- 用于存放规范之外的附加属性（如作者、版本等）

示例：

```yaml
metadata:
  author: example-org
  version: "1.0"
``` :contentReference[oaicite:8]{index=8}

**allowed-tools**（可选/实验性）

- 以空格分隔的工具清单，表示此技能可以使用的 tool 集合  
- 注意：不是所有智能体实现都支持此字段

示例：

```yaml
allowed-tools: Bash(git:*) Bash(jq:*) Read
``` :contentReference[oaicite:9]{index=9}

---

### Markdown 正文内容

Frontmatter 之后的 Markdown 部分包含技能的实际执行指令。此部分**没有格式上的强制要求**，可根据需要编写，推荐包含：

- 步骤化指令
- 输入输出示例
- 处理常见边界情况的提示

建议把详细参考资料拆分到 `references/` 子目录，以减少主 Markdown 文件的长度。:contentReference[oaicite:10]{index=10}

---

## 可选子目录

### scripts/

放置可执行脚本代码（例如 Python、Bash、JavaScript 等）。:contentReference[oaicite:11]{index=11}

**要求或建议**：

- 脚本应尽量自包含或明确声明依赖
- 提供有用的错误信息
- 优雅处理边界情形

---

### references/

用于放置附加文档，例如更详细的参考内容或结构化模板：

- `REFERENCE.md` — 详细技术参考
- `FORMS.md` — 表单模板
- Domain-specific 文件（如 `finance.md`, `legal.md` 等） :contentReference[oaicite:12]{index=12}

---

### assets/

放置静态资源文件，例如：

- 文档模板
- 图像示例
- 数据文件（查找表、架构示例） :contentReference[oaicite:13]{index=13}

---

## 渐进式信息披露

为了高效利用上下文（降低 Token 使用量），建议 Skill 结构遵循如下渐进式加载策略：:contentReference[oaicite:14]{index=14}

1. **元数据阶段**：在启动时读取所有技能的 `name` 和 `description`（大约 ~100 tokens）  
2. **指令阶段**：当技能被激活时加载完整的 `SKILL.md` 正文（建议不超过 ~5000 tokens）  
3. **资源阶段**：按需加载其他文件（如 `scripts/`, `references/`, `assets/`）

建议保持主 `SKILL.md` 文件在 500 行以内，将详细资料放到辅助文件以优化上下文使用。:contentReference[oaicite:15]{index=15}

---

## 文件引用

在 Skill 内引用其他文件时，应使用从 Skill 根目录开始的**相对路径**：

```markdown
See [the reference guide](references/REFERENCE.md) for details.
Run the extraction script:
scripts/extract.py
``` :contentReference[oaicite:16]{index=16}

避免过多的嵌套路径引用，这会增加 Skill 被加载时的上下文占用。:contentReference[oaicite:17]{index=17}

---

## 验证（Validation）

你可以使用官方提供的 **skills-ref** 工具来验证 Skill 是否符合规范：

```bash
skills-ref validate ./my-skill
````

该命令将检查 `SKILL.md` frontmatter 是否有效，并确保符合命名规范等规则。([代理技能][1])

# 参考资料


[1]: https://agentskills.io/specification "Specification - Agent Skills"



* any list
{:toc}