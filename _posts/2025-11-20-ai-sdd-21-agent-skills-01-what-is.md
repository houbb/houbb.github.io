---
layout: post
title: AI SDD 开发规范-21-AGENT SKILLS
date: 2025-11-20 14:12:33 +0800
categories: [AI]
tags: [ai, sdd, sh]
published: true
---


## 什么是 Skills？

**Agent Skills（智能体技能）** 是一种轻量级、开放格式，用于通过专业知识和工作流来扩展 AI 智能体能力。

从本质上讲，一个 skill 就是一个包含 **SKILL.md** 文件的文件夹。
该文件至少包含**元数据**（名称和描述）以及**指导智能体如何执行特定任务的指令**。
Skills 还可以捆绑脚本、模板和参考资料。

```text
my-skill/
├── SKILL.md          # 必需：指令 + 元数据
├── scripts/          # 可选：可执行代码
├── references/       # 可选：文档资料
└── assets/           # 可选：模板、资源
```

---

## Skills 的工作原理

Skills 通过**渐进式信息披露（progressive disclosure）** 来高效管理上下文：

1. **发现（Discovery）**
   在启动时，智能体只加载每个可用 skill 的名称和描述，这些信息刚好足以判断该 skill 在什么情况下可能有用。

2. **激活（Activation）**
   当任务与某个 skill 的描述匹配时，智能体会将完整的 **SKILL.md** 指令加载到上下文中。

3. **执行（Execution）**
   智能体按照指令执行任务，并根据需要加载被引用的文件或执行随 skill 打包的代码。

这种方式既能保持智能体的高性能，又能在需要时按需获取更多上下文信息。

---

## SKILL.md 文件

每个 skill 都以一个 **SKILL.md** 文件开始，该文件包含 **YAML Frontmatter** 和 **Markdown 指令内容**：

```yaml
---
name: pdf-processing
description: Extract text and tables from PDF files, fill forms, merge documents.
---
```

```markdown
# PDF Processing

## When to use this skill
Use this skill when the user needs to work with PDF files...

## How to extract text
1. Use pdfplumber for text extraction...

## How to fill forms
...
```

### SKILL.md 顶部必须包含以下 Frontmatter 字段：

* **name**：一个简短的标识符
* **description**：描述在什么情况下应使用该 skill

Markdown 正文部分包含实际的操作指令，对结构和内容没有特定限制。

---

## 这种简单格式的关键优势

* **自解释（Self-documenting）**
  Skill 的作者或使用者只需阅读 SKILL.md，就能理解其功能，使 skill 易于审计和改进。

* **可扩展（Extensible）**
  Skill 的复杂度可以从纯文本指令，逐步扩展到包含可执行代码、资源文件和模板。

* **可移植（Portable）**
  Skills 本质上只是文件，因此非常容易编辑、版本管理和共享。

---

## 后续步骤（Next steps）

* 查看规范（Specification），以了解完整的格式定义
* 为你的智能体添加 skills 支持，构建一个兼容的客户端
* 在 GitHub 上查看示例 skills
* 阅读编写高质量 skills 的最佳实践
* 使用参考库来校验 skills 并生成 Prompt XML

# 参考资料


https://agentskills.io/what-are-skills

* any list
{:toc}