---
layout: post
title: Tree-sitter 文档-19-发布（Publishing）
date: 2026-01-05 21:01:55 +0800
categories: [AST]
tags: [ast, tree-sitter, sh]
published: true
---

# 发布（Publishing）

当你认为你的解析器已经达到稳定状态并可供用户使用时，你可以将其发布到多个注册中心。

强烈建议将 grammar 发布到以下平台：

* GitHub
* crates.io（Rust）
* npm（JavaScript）
* PyPI（Python）

这样可以使其他用户更容易发现并使用你的 grammar。 ([Tree-sitter][1])

---

## 从开始到发布的完整流程

要发布一个新的 grammar（或发布第一个版本），应执行以下步骤：

### 1️⃣ 更新版本号

使用以下命令将版本号更新为目标版本：

```bash
tree-sitter version 1.0.0
```

例如，上述命令用于发布 `1.0.0` 版本。

---

### 2️⃣ 提交变更

确保当前工作目录是干净状态，然后提交：

```bash
git commit -am "Release 1.0.0"
```

（提交信息可自行决定）

---

### 3️⃣ 创建 Git Tag

```bash
git tag -- v1.0.0
```

---

### 4️⃣ 推送提交与标签

```bash
git push --tags origin main
```

假设：

* 当前分支为 `main`
* 远程仓库名为 `origin`

---

### 5️⃣ （可选）自动发布

如果你的 grammar 已配置 GitHub 工作流（workflows）：

发布流程将自动执行，包括：

* 重新生成 parser
* 发布到 GitHub
* 发布到 crates.io
* 发布到 npm
* 发布到 PyPI

前提是已正确配置各平台注册所需的访问令牌（tokens）。 ([Tree-sitter][1])

---

## 遵循语义化版本（Semantic Versioning）

在发布 grammar 新版本时，必须遵循 **语义化版本规范（SemVer）**。

这可以确保：

* 使用者能够安全升级依赖
* 现有 Tree-sitter 集成代码继续正常工作，例如：

  * queries
  * 语法树遍历逻辑
  * 节点类型判断

---

### 版本号规则

#### Major 版本（主版本）

当发生以下情况时递增：

* 对 grammar 的节点类型或结构进行了**不兼容修改**

---

#### Minor 版本（次版本）

当发生以下情况时递增：

* 新增节点类型或模式
* 同时保持向后兼容

---

#### Patch 版本（修订版本）

当发生以下情况时递增：

* 修复 bug
* 未改变 grammar 结构

---

## 0.y.z 版本阶段说明

对于 `0.y.z`（尚未达到 1.0）的 grammar：

语义化版本规则在技术上可以放宽。

但如果 grammar 已经被用户使用，建议采用更保守策略：

* 将 **patch（z）版本变更** 视为 minor 级变更
* 将 **minor（y）版本变更** 视为 major 级变更

这样可以在 1.0 之前阶段仍然保持对用户的稳定性。

---

遵循上述版本管理规范，可以确保下游用户在升级时不会因为 grammar 变化而导致已有 query 或解析逻辑失效。 ([Tree-sitter][1])

# 参考资料

[1]: https://tree-sitter.github.io/tree-sitter/creating-parsers/6-publishing.html?utm_source=chatgpt.com "Publishing Parsers - Tree-sitter"


* any list
{:toc}