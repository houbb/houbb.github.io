---
layout: post
title: Tree-sitter 文档-04-基础解析（Basic Parsing）
date: 2026-01-05 21:01:55 +0800
categories: [AST]
tags: [ast, tree-sitter, sh]
published: true
---

# 基础解析（Basic Parsing）

---

## 提供源代码（Providing the Code）

在上一章节的示例中，我们使用 `ts_parser_parse_string` 函数解析存储在普通字符串中的源代码：

```c
TSTree *ts_parser_parse_string(
  TSParser *self,
  const TSTree *old_tree,
  const char *string,
  uint32_t length
);
```

在某些情况下，你可能需要解析存储在自定义数据结构中的源码，例如：

* piece table
* rope

此时可以使用更通用的 `ts_parser_parse` 函数：

```c
TSTree *ts_parser_parse(
  TSParser *self,
  const TSTree *old_tree,
  TSInput input
);
```

`TSInput` 结构允许你提供自定义函数，用于在指定的字节偏移量以及行列位置读取文本片段。

该函数可以返回：

* UTF-8 编码文本
* UTF-16 编码文本

这种接口允许 Tree-sitter 高效解析存储在自定义数据结构中的文本。

```c
typedef struct {
  void *payload;
  const char *(*read)(
    void *payload,
    uint32_t byte_offset,
    TSPoint position,
    uint32_t *bytes_read
  );
  TSInputEncoding encoding;
  TSDecodeFunction decode;
} TSInput;
```

如果文本既不是 UTF-8 也不是 UTF-16 编码，可以通过设置 `decode` 字段提供自定义解码函数。

`TSDecodeFunction` 的定义如下：

```c
typedef uint32_t (*TSDecodeFunction)(
  const uint8_t *string,
  uint32_t length,
  int32_t *code_point
);
```

注意：

必须将 `TSInputEncoding` 设置为 `TSInputEncodingCustom`，否则不会调用 `decode` 函数。 ([Tree-sitter][1])

---

## 语法节点（Syntax Nodes）

Tree-sitter 提供类似 DOM 的接口用于检查语法树。

每个语法节点都有一个类型字符串，用于表示其对应的语法规则：

```c
const char *ts_node_type(TSNode);
```

语法节点同时记录其在源码中的位置，包括：

* 字节偏移位置
* 行 / 列坐标

行和列均从 **0 开始计数**。

```c
uint32_t ts_node_start_byte(TSNode);
uint32_t ts_node_end_byte(TSNode);

typedef struct {
  uint32_t row;
  uint32_t column;
} TSPoint;

TSPoint ts_node_start_point(TSNode);
TSPoint ts_node_end_point(TSNode);
```

其中：

* `row` 表示当前位置之前的换行数量
* `column` 表示该行起始位置到当前点的字节数

换行符被视为单个 `\n` 字符。 ([Tree-sitter][1])

---

## 获取节点（Retrieving Nodes）

每棵语法树都包含一个根节点：

```c
TSNode ts_tree_root_node(const TSTree *);
```

获取节点后，可以访问其子节点：

```c
uint32_t ts_node_child_count(TSNode);
TSNode ts_node_child(TSNode, uint32_t);
```

也可以访问：

* 兄弟节点
* 父节点

```c
TSNode ts_node_next_sibling(TSNode);
TSNode ts_node_prev_sibling(TSNode);
TSNode ts_node_parent(TSNode);
```

当节点不存在时，这些函数可能返回空节点。

可通过以下函数判断：

```c
bool ts_node_is_null(TSNode);
```

([Tree-sitter][1])

---

## 命名节点与匿名节点（Named vs Anonymous Nodes）

Tree-sitter 生成的是 **具体语法树（Concrete Syntax Tree）**。

这意味着语法树包含源码中的所有 token，例如：

* 逗号
* 括号
* 关键字

这对于语法高亮等场景非常重要。

但在某些代码分析场景中，更适合使用类似抽象语法树（AST）的结构。因此 Tree-sitter 区分：

* **命名节点（Named Nodes）**
* **匿名节点（Anonymous Nodes）**

例如语法规则：

```js
if_statement: $ => seq("if", "(", $._expression, ")", $._statement);
```

对应节点将包含 5 个子节点：

* expression（命名）
* statement（命名）
* `"if"`（匿名）
* `"("`（匿名）
* `")"`（匿名）

判断节点是否为命名节点：

```c
bool ts_node_is_named(TSNode);
```

遍历语法树时，也可以跳过匿名节点，使用 `_named_` 系列函数：

```c
TSNode ts_node_named_child(TSNode, uint32_t);
uint32_t ts_node_named_child_count(TSNode);
TSNode ts_node_next_named_sibling(TSNode);
TSNode ts_node_prev_named_sibling(TSNode);
```

使用这些方法时，语法树的行为类似抽象语法树。 ([Tree-sitter][1])

---

## 节点字段名（Node Field Names）

为了便于分析语法节点，许多语法会为特定子节点分配唯一的字段名称。

如果节点定义了字段，可以通过字段名访问子节点：

```c
TSNode ts_node_child_by_field_name(
  TSNode self,
  const char *field_name,
  uint32_t field_name_length
);
```

字段同时具有数值 ID，可避免重复字符串比较。

可通过 `TSLanguage` 在字段名与字段 ID 之间转换：

```c
uint32_t ts_language_field_count(const TSLanguage *);
const char *ts_language_field_name_for_id(
  const TSLanguage *,
  TSFieldId
);
TSFieldId ts_language_field_id_for_name(
  const TSLanguage *,
  const char *,
  uint32_t
);
```

随后可使用字段 ID 获取子节点：

```c
TSNode ts_node_child_by_field_id(TSNode, TSFieldId);
```


# 参考资料

([Tree-sitter][1])

[1]: https://tree-sitter.github.io/tree-sitter/using-parsers/2-basic-parsing.html?utm_source=chatgpt.com "Basic Parsing - Tree-sitter"

* any list
{:toc}