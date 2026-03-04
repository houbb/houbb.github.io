---
layout: post
title: Tree-sitter 文档-06-遍历语法树（Walking Trees）
date: 2026-01-05 21:01:55 +0800
categories: [AST]
tags: [ast, tree-sitter, sh]
published: true
---

# 遍历语法树（Walking Trees）

---

## 使用 Tree Cursor 遍历语法树

虽然可以使用前面介绍的 `TSNode` API 访问语法树中的每一个节点，但当需要访问大量节点时，**最高效的方法是使用 Tree Cursor（树游标）**。

Tree Cursor 是一个 **有状态对象**，用于以最高效率遍历语法树。 ([Tree-sitter][1])

---

## Cursor 的作用范围

创建 Cursor 时传入的节点会被视为 Cursor 的根节点。

Cursor **无法移动到该节点范围之外**：

* 移动到根节点的父节点 → 始终返回 `false`
* 移动到根节点的兄弟节点 → 始终返回 `false`

如果传入的是整棵树的真正根节点，则不会产生额外影响；
但当 Cursor 从子节点创建时，需要特别注意这一限制。 ([Tree-sitter][1])

---

## 创建 Tree Cursor

可以从任意节点创建 Cursor：

```c
TSTreeCursor ts_tree_cursor_new(TSNode);
```

---

## 在语法树中移动 Cursor

Cursor 提供三种基础移动操作：

```c
bool ts_tree_cursor_goto_first_child(TSTreeCursor *);
bool ts_tree_cursor_goto_next_sibling(TSTreeCursor *);
bool ts_tree_cursor_goto_parent(TSTreeCursor *);
```

返回值说明：

* `true`：移动成功
* `false`：目标节点不存在 ([Tree-sitter][1])

---

## 获取当前节点信息

无论 Cursor 位于何处，都可以获取当前节点：

```c
TSNode ts_tree_cursor_current_node(const TSTreeCursor *);
```

同时还可以获取当前节点关联的字段信息：

```c
const char *ts_tree_cursor_current_field_name(const TSTreeCursor *);
TSFieldId ts_tree_cursor_current_field_id(const TSTreeCursor *);
```

这些字段名称对应语法规则中定义的 field。 ([Tree-sitter][1])

# 参考资料

[1]: https://tree-sitter.github.io/tree-sitter/using-parsers/4-walking-trees.html?utm_source=chatgpt.com "Walking Trees - Tree-sitter"


* any list
{:toc}