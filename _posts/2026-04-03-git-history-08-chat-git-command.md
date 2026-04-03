---
layout: post 
title: 代码知识库之 git history-08-git 命令
date: 2026-04-03 21:01:55 +0800
categories: [AI]
tags: [ai, git, harness, coe-graph]
published: true
---

# chat

## 背景

```
整个设计中，会涉及到哪些 git 命令

给出这些命令的解释+例子
```

## 设计

## 推荐的三个 Git 命令（分开获取）

### 命令1：获取近一年所有提交的 hash 列表（正序）

```bash
git rev-list --since="1 year ago" --reverse HEAD
```

**输出格式**：每行一个完整的 commit SHA-1（40 字符），按提交时间**从旧到新**排序。

**用途**：作为遍历的主列表，保证增量处理时按时间顺序。

---

### 命令2：获取单个提交的结构化元信息（易解析）

```bash
git log --format="%H|%an|%ae|%at|%s" -n 1 <hash>
```

**输出格式**：单行，字段之间用竖线 `|` 分隔，例如：
```
a1b2c3d4e5f6...|Alice|alice@example.com|1700000000|fix login timeout
```

**字段说明**：
- `%H`：完整 commit hash
- `%an`：作者名（author name）
- `%ae`：作者邮箱
- `%at`：作者时间戳（Unix 秒）
- `%s`：提交消息的第一行（subject）

**为什么只选这5个字段？**
- 图数据库中的 `GitHistoryCommit` 还需要 `committer`、`parentHashes`、`isMerge` 等，但这些可以从命令1+其他命令单独获取（例如用 `git rev-parse <hash>^@` 获取父 hash），或者在解析 diff 时通过 `git show` 的默认输出也能获得。为了保持命令最简单且输出稳定，这里只取最核心且不会包含分隔符的字段。  
- 实际脚本中可以再调用一次 `git log --format="%P|%cn|%ce|%ct" -n 1 <hash>` 获取其他字段，但为了“最少命令”，建议将这5个字段作为基础，其余字段按需扩展。

---

### 命令3：获取单个提交的纯净 diff（无提交信息）

```bash
git show --unified=0 --format="" <hash>
```

**输出格式**：标准的 Git diff 格式，但**不包含 commit header、Author、Date、message**（因为 `--format=""`），且 `--unified=0` 使得每个 hunk 只显示变更行及其行号，没有上下文行。

**示例输出**：
```diff
diff --git a/src/auth.py b/src/auth.py
index 83db48f..8e3c5b7 100644
--- a/src/auth.py
+++ b/src/auth.py
@@ -10,7 +10,8 @@ def login():
     username = input()
-    password = input()
+    password = getpass.getpass()
     return authenticate(username, password)
```

**解析要点**：
- 文件路径：取 `diff --git a/... b/...` 中的路径（去掉 `a/` 和 `b/` 前缀）
- 变更类型：
  - 新增文件：出现 `new file mode`
  - 删除文件：出现 `deleted file mode`
  - 修改文件：同时有 `--- a/...` 和 `+++ b/...`
  - 重命名：出现 `rename from` 和 `rename to`
- 变更块行号：从 `@@ -a,b +c,d @@` 中提取
- 具体代码行：以 `-` 开头的行（旧版删除）、`+` 开头的行（新版新增）

## 为什么这是“最少+科学”的组合？

- **命令1** 只做一件事：列出需要处理的 commit，支持时间过滤和正序。
- **命令2** 以竖线分隔输出，无歧义，程序可直接 `split('|')`。
- **命令3** 只输出 diff 内容，无额外信息，解析简单。
- 总共 **3 个命令**，每个命令职责单一，管道清晰，易于并行处理。

如果你需要更丰富的元信息（如 committer、父 hash），可以在命令2中增加字段，但会面临分隔符冲突风险。

建议保持这 3 个命令作为基础，其他信息通过额外命令按需获取（例如 `git rev-parse $hash^@`）。

# 参考资料

* any list
{:toc}