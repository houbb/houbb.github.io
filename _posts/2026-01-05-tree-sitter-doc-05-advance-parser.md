---
layout: post
title: Tree-sitter 文档-05-高级解析（Advanced Parsing）
date: 2026-01-05 21:01:55 +0800
categories: [AST]
tags: [ast, tree-sitter, sh]
published: true
---

# 高级解析（Advanced Parsing）

## 编辑（Editing）

在文本编辑器等应用中，当源代码发生变化后，通常需要重新解析文件。

Tree-sitter 专门针对这种场景进行了高效设计。

该过程需要两个步骤。

---

### 第一步：编辑语法树

首先，需要编辑已有的语法树，使节点的范围与修改后的源码保持同步。

```c
typedef struct {
  uint32_t start_byte;
  uint32_t old_end_byte;
  uint32_t new_end_byte;
  TSPoint start_point;
  TSPoint old_end_point;
  TSPoint new_end_point;
} TSInputEdit;

void ts_tree_edit(TSTree *, const TSInputEdit *);
```

---

### 第二步：重新解析

随后再次调用 `ts_parser_parse`，并传入旧语法树。

这样生成的新语法树会在内部复用旧树的结构，从而实现 **增量解析**。

---

当语法树被编辑后，节点的位置也会发生变化。

如果你在 `TSTree` 外部保存了某些 `TSNode` 实例，则必须使用相同的 `TSInputEdit` 对这些节点进行更新：

```c
void ts_node_edit(TSNode *, const TSInputEdit *);
```

仅当满足以下情况时才需要调用 `ts_node_edit`：

* 在编辑语法树之前获取了 `TSNode`
* 并希望在编辑之后继续使用这些节点实例

通常情况下，可以直接从更新后的语法树重新获取节点，此时无需调用该函数。 ([Tree-sitter][1])

---

## 多语言文档（Multi-language Documents）

有时，一个文件中的不同部分可能使用不同语言编写。

例如：

* EJS
* ERB

这类模板语言通常将 HTML 与 JavaScript 或 Ruby 混合使用。

Tree-sitter 允许只针对文件中的 **特定范围** 创建语法树。

```c
typedef struct {
  TSPoint start_point;
  TSPoint end_point;
  uint32_t start_byte;
  uint32_t end_byte;
} TSRange;

void ts_parser_set_included_ranges(
  TSParser *self,
  const TSRange *ranges,
  uint32_t range_count
);
```

---

例如，一个 ERB 文档在概念上可以表示为多个具有重叠范围的语法树：

* ERB 语法树
* HTML 语法树
* Ruby 语法树

处理流程通常为：

1. 先使用 ERB 解析整个文档
2. 在 ERB 语法树中找出：

   * HTML 内容区域
   * Ruby 代码区域
3. 将这些区域转换为 `TSRange`
4. 分别使用对应语言重新解析这些范围

最终即可同时获得多个语言的语法树。 ([Tree-sitter][1])

---

## 并发（Concurrency）

Tree-sitter 支持多线程使用场景，因为语法树的复制成本非常低。

```c
TSTree *ts_tree_copy(const TSTree *);
```

在内部，实现复制仅仅是增加一个 **原子引用计数**。

从概念上讲，这会生成一棵新的语法树，你可以在新的线程中：

* 查询
* 编辑
* 重新解析
* 删除

同时仍然在其他线程中继续使用原始语法树。

---

⚠️ 注意：

单个 `TSTree` 实例 **不是线程安全的**。
如果需要在多个线程中同时使用语法树，必须先进行复制。 ([Tree-sitter][1])


# 参考资料

[1]: https://tree-sitter.github.io/tree-sitter/using-parsers/3-advanced-parsing.html?utm_source=chatgpt.com "Advanced Parsing - Tree-sitter"

* any list
{:toc}