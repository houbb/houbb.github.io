---
layout: post
title: AI SDD 开发规范-21-将 Skills 集成到你的智能体
date: 2025-11-20 14:12:33 +0800
categories: [AI]
tags: [ai, sdd, sh]
published: true
---

# 将 Skills 集成到你的智能体

（Integrate skills into your agent）

本指南说明如何向你的 AI 智能体或开发工具添加 **Agent Skills** 支持。([代理技能][1])

---

## 集成方法（Integration approaches）

集成 Skills 有两种主要方式：

1. **基于文件系统的智能体（Filesystem-based agents）**
   这种智能体在一个计算机环境中运行（例如 bash/unix）。

   * 当模型发出如 `cat /path/to/my-skill/SKILL.md` 这样的 shell 命令时，相关技能会被激活。
   * 随技能捆绑的资源（如脚本、参考文件等）也通过 shell 命令访问。
     这是**最强大的集成方法**。([代理技能][1])

2. **基于工具的智能体（Tool-based agents）**
   这种智能体不依赖于完整的计算机环境。

   * 它通过定义“工具”（tools）来触发技能和访问技能内的资源。
   * 具体如何实现由开发者根据平台自行决定。([代理技能][1])

---

## 总览（Overview）

一个支持 Skills 的智能体**需要具备以下能力**：

1. 在配置目录中发现技能（Skill discovery）。
2. 在启动时仅加载技能的元数据（名称和描述）。
3. 匹配用户任务与相关技能。
4. 在匹配到技能时激活该技能并加载完整的指令。
5. 在执行过程中按需运行脚本或访问资源。([代理技能][1])

---

## 技能发现（Skill discovery）

Skills 是包含 `SKILL.md` 文件的文件夹。你的智能体应扫描**配置的目录**以查找有效的技能。([代理技能][1])

---

## 加载元数据（Loading metadata）

在智能体启动时，应**只解析每个 `SKILL.md` 文件的 frontmatter**（即 YAML 元数据），以**保持初始上下文占用尽可能低**。([代理技能][1])

---

### 解析 frontmatter（Parsing frontmatter）

示例伪代码：

```
function parseMetadata(skillPath):
    content = readFile(skillPath + "/SKILL.md")
    frontmatter = extractYAMLFrontmatter(content)

    return {
        name: frontmatter.name,
        description: frontmatter.description,
        path: skillPath
    }
```

这里读取 YAML frontmatter 并将其转换为结构化的元数据对象。([代理技能][1])

---

## 注入到上下文（Injecting into context）

将技能的元数据包含在智能体的系统提示中，让模型知道有哪些技能可用。

按照你所使用平台的推荐方式注入系统提示。

例如，为 Claude 系列模型，推荐使用如下 XML 格式：

```xml
<available_skills>
  <skill>
    <name>pdf-processing</name>
    <description>Extracts text and tables from PDF files, fills forms, merges documents.</description>
    <location>/path/to/skills/pdf-processing/SKILL.md</location>
  </skill>
  <skill>
    <name>data-analysis</name>
    <description>Analyzes datasets, generates charts, and creates summary reports.</description>
    <location>/path/to/skills/data-analysis/SKILL.md</location>
  </skill>
</available_skills>
```

* 对于基于文件系统的智能体，应当在 metadata 中包含 `location` 字段，使用指向 `SKILL.md` 的绝对路径。
* 对于基于工具的智能体，可以不包含 `location` 字段。
* 保持元数据尽量简洁：每个技能添加的内容大约 **50–100 tokens**。([代理技能][1])

---

## 安全注意事项（Security considerations）

执行技能中的脚本可能存在安全风险，因此应该采取防护措施：

* **沙箱隔离（Sandboxing）**：在隔离环境中运行脚本，避免对主系统造成影响。
* **白名单机制（Allowlisting）**：只执行来自可信技能的脚本。
* **确认机制（Confirmation）**：在运行潜在危险操作前征询用户确认。
* **日志记录（Logging）**：记录所有脚本执行行为以便审计。([代理技能][1])

---

## 参考实现（Reference implementation）

官方提供的 **skills-ref** 库提供了处理 Skills 的 Python 工具和 CLI。例如：

### 验证技能目录：

```
skills-ref validate <path>
```

该命令会检查 `SKILL.md` frontmatter 是否有效，并验证命名规范等。([代理技能][1])

### 生成 Prompts（skills-ref 支持将 skills 元数据转换为提示格式，例如 XML）：

```
skills-ref to-prompt <path>...
```

这一功能可用于生成适合注入进系统提示的技能 metadata。([代理技能][1])

# 参考资料

https://chatgpt.com/c/694df079-52ac-8322-acf2-2ba5116913ea

* any list
{:toc}