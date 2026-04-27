---
layout: post 
title: 面向真正工程师的 Agent Skills-mattpocock-skills
date: 2026-04-27 21:01:55 +0800
categories: [Ai]
tags: [skills, ai]
published: true
---

# 面向真正工程师的 Agent Skills

我每天在真实工程实践中使用的一组 agent skills——而不是那种“氛围式编程（vibe coding）”。

如果你想跟进这些 skills 的更新，以及我新创建的内容，可以加入我的 newsletter，目前已有约 60,000 名开发者订阅：

[订阅 Newsletter](https://www.aihero.dev/s/skills-newsletter)

---

## 规划与设计（Planning & Design）

这些 skills 用于在编写代码之前，帮助你系统性地思考问题。

* **to-prd** —— 将当前对话上下文转换为 PRD（产品需求文档），并提交为一个 GitHub issue。无需额外访谈——直接基于你已经讨论的内容进行综合整理。

  ```
  npx skills@latest add mattpocock/skills/to-prd
  ```

* **to-issues** —— 将任何计划、规格说明或 PRD 拆分为可独立认领（independently-grabbable）的 GitHub issues，采用垂直切片（vertical slices）的方式。

  ```
  npx skills@latest add mattpocock/skills/to-issues
  ```

* **grill-me** —— 围绕某个计划或设计对你进行持续、深入的“拷问式”提问，直到决策树中的每一个分支都被充分澄清。

  ```
  npx skills@latest add mattpocock/skills/grill-me
  ```

* **design-an-interface** —— 使用并行子 agent，为某个模块生成多个差异显著的接口设计方案。

  ```
  npx skills@latest add mattpocock/skills/design-an-interface
  ```

* **request-refactor-plan** —— 通过与用户访谈，生成一个包含细粒度提交（tiny commits）的详细重构计划，并以 GitHub issue 的形式提交。

  ```
  npx skills@latest add mattpocock/skills/request-refactor-plan
  ```

---

## 开发（Development）

这些 skills 用于帮助你编写代码、进行重构以及修复问题。

* **tdd** —— 基于红-绿-重构（red-green-refactor）循环的测试驱动开发。以垂直切片的方式逐步构建功能或修复 bug。

  ```
  npx skills@latest add mattpocock/skills/tdd
  ```

* **triage-issue** —— 通过探索代码库来分析 bug，定位根因，并创建一个包含基于 TDD 修复方案的 GitHub issue。

  ```
  npx skills@latest add mattpocock/skills/triage-issue
  ```

* **improve-codebase-architecture** —— 结合 `CONTEXT.md` 中的领域语言（domain language）以及 `docs/adr/` 中的架构决策（Architecture Decision Records），在代码库中寻找可持续演进（deepening）的优化机会。

  ```
  npx skills@latest add mattpocock/skills/improve-codebase-architecture
  ```

* **migrate-to-shoehorn** —— 将测试文件中的 `as` 类型断言迁移为使用 @total-typescript/shoehorn。

  ```
  npx skills@latest add mattpocock/skills/migrate-to-shoehorn
  ```

* **scaffold-exercises** —— 创建练习项目的目录结构，包括章节（sections）、问题（problems）、解答（solutions）以及解释说明（explainers）。

  ```
  npx skills@latest add mattpocock/skills/scaffold-exercises
  ```

---

## 工具与环境配置（Tooling & Setup）

* **setup-pre-commit** —— 配置 Husky 的 pre-commit 钩子，集成 lint-staged、Prettier、类型检查以及测试。

  ```
  npx skills@latest add mattpocock/skills/setup-pre-commit
  ```

* **git-guardrails-claude-code** —— 配置 Claude Code 的钩子，在执行危险的 git 命令（如 push、reset --hard、clean 等）之前进行拦截。

  ```
  npx skills@latest add mattpocock/skills/git-guardrails-claude-code
  ```

---

## 写作与知识（Writing & Knowledge）

* **write-a-skill** —— 创建新的 skills，具备规范的结构、渐进式信息展开（progressive disclosure）以及配套资源。

  ```
  npx skills@latest add mattpocock/skills/write-a-skill
  ```

* **edit-article** —— 通过重组章节结构、提升表达清晰度以及压缩冗余内容，对文章进行编辑和优化。

  ```
  npx skills@latest add mattpocock/skills/edit-article
  ```

* **ubiquitous-language** —— 从当前对话中提取符合 DDD（领域驱动设计）风格的通用语言（ubiquitous language）词汇表。

  ```
  npx skills@latest add mattpocock/skills/ubiquitous-language
  ```

* **obsidian-vault** —— 在 Obsidian 知识库中进行搜索、创建和管理笔记，支持 wikilinks 与索引笔记（index notes）。

  ```
  npx skills@latest add mattpocock/skills/obsidian-vault
  ```


# 参考资料

* any list
{:toc}