---
layout: post
title: Tree-sitter 文档-17-外部扫描器（External Scanners）
date: 2026-01-05 21:01:55 +0800
categories: [AST]
tags: [ast, tree-sitter, sh]
published: true
---

# 外部扫描器（External Scanners）

许多编程语言中存在一些 **token**，其结构**无法**或**不方便**使用正则表达式描述。

例如：

* Python 中的缩进（indent）与反缩进（dedent）token
* Bash 与 Ruby 中的 heredoc
* Ruby 中的 percent string

Tree-sitter 允许你使用 **外部扫描器（external scanner）** 来处理这类 token。

外部扫描器是一组 **由语法作者手写的 C 函数**，用于添加自定义逻辑，以识别某些 token。 ([Tree-sitter][1])

---

## 使用外部扫描器的步骤

### 1️⃣ 在 grammar 中声明 externals

首先，在 grammar 中添加 `externals` 字段。

该字段列出所有外部 token 的名称，这些名称随后可以在 grammar 的其他位置使用。

```js
grammar({
  name: "my_language",

  externals: $ => [$.indent, $.dedent, $.newline],

  // ...
});
```

---

### 2️⃣ 添加 scanner.c 文件

在项目中新增一个 C 源文件：

```
src/scanner.c
```

该路径是 CLI 自动识别外部扫描器的固定位置。

同时需要：

* 将该文件加入 `binding.gyp` 的 sources
* 在 `bindings/rust/build.rs` 中取消对应注释
  （以便 Rust crate 编译时包含该文件）

---

### 3️⃣ 定义外部 Token 枚举

在 `scanner.c` 中定义一个 `enum`，包含所有外部 token。

⚠️ **枚举顺序必须与 grammar 的 externals 数组一致**
（名称本身无关紧要）。

```c
#include "tree_sitter/parser.h"
#include "tree_sitter/alloc.h"
#include "tree_sitter/array.h"

enum TokenType {
  INDENT,
  DEDENT,
  NEWLINE
};
```

---

## 必须实现的五个函数

你必须定义以下五个函数，其名称基于：

```
tree_sitter_<language>_external_scanner_<action>
```

动作包括：

* create
* destroy
* serialize
* deserialize
* scan

---

## Create

```c
void * tree_sitter_my_language_external_scanner_create() {
  // ...
}
```

该函数用于创建扫描器对象。

特点：

* 当 parser 设置语言时仅调用一次
* 通常在堆上分配内存并返回指针
* 若无需状态，可返回 `NULL`

---

## Destroy

```c
void tree_sitter_my_language_external_scanner_destroy(void *payload) {
  // ...
}
```

用于释放扫描器使用的内存。

调用时机：

* parser 被删除
* parser 切换语言

参数为 create 返回的同一指针。

若未分配内存，可为空实现。

---

## Serialize

```c
unsigned tree_sitter_my_language_external_scanner_serialize(
  void *payload,
  char *buffer
) {
  // ...
}
```

作用：

将扫描器的**完整状态**写入字节缓冲区。

返回：

```
写入的字节数
```

调用时机：

> 每当外部扫描器成功识别一个 token 时。

最大可写大小：

```
TREE_SITTER_SERIALIZATION_BUFFER_SIZE
```

（定义于 `tree_sitter/parser.h`）

这些数据会被存入语法树，用于：

* 编辑后恢复状态
* 处理歧义解析

⚠️ serialize 必须保存全部状态
⚠️ deserialize 必须完整恢复状态

为了性能，应尽量使状态：

* 序列化快速
* 数据紧凑

---

## Deserialize

```c
void tree_sitter_my_language_external_scanner_deserialize(
  void *payload,
  const char *buffer,
  unsigned length
) {
  // ...
}
```

作用：

根据 serialize 写入的数据恢复扫描器状态。

良好实践：

在恢复前显式清空状态变量。

---

## Scan（核心函数）

典型流程：

* 多次调用 `lexer->advance`
* 可选调用 `lexer->mark_end`
* 设置 `lexer->result_symbol`
* 返回 `true`

```c
bool tree_sitter_my_language_external_scanner_scan(
  void *payload,
  TSLexer *lexer,
  const bool *valid_symbols
) {
  // ...
}
```

成功时：

* Tree-sitter 将节点压入解析栈
* 输入位置停留在 `mark_end` 标记处

---

## TSLexer 结构

### lookahead

```
int32_t lookahead
```

当前字符（Unicode code point）。

---

### result_symbol

```
TSSymbol result_symbol
```

识别出的 token 类型。

---

### advance

```c
void (*advance)(TSLexer *, bool skip)
```

推进到下一个字符。

* `skip=true` → 视为空白字符

---

### mark_end

```c
void (*mark_end)(TSLexer *)
```

标记 token 结束位置。

允许：

* 向前查看字符
* 不扩大 token 长度

可多次调用。

---

### get_column

```c
uint32_t (*get_column)(TSLexer *)
```

返回当前列号（从行首开始的 codepoint 数）。

---

### is_at_included_range_start

用于检测：

解析器是否跳转到了文档的另一段范围。

常见于多语言嵌入解析。

---

### eof

```c
bool (*eof)(const TSLexer *)
```

判断是否到达文件结束。

⚠️ 不要直接检查 `lookahead == 0`

---

## valid_symbols 参数

该布尔数组表示：

> 当前 parser **期望的外部 token**

只能在 token 有效时尝试识别。

示例：

```c
if (valid_symbols[INDENT] || valid_symbols[DEDENT]) {

  if (valid_symbols[INDENT]) {
    lexer->result_symbol = INDENT;
    return true;
  }
}
```

---

# 外部扫描器辅助工具

---

## Allocator（内存分配）

应使用：

```
ts_malloc
ts_calloc
ts_realloc
ts_free
```

而非 libc 的 malloc/free。

原因：

允许 Tree-sitter 使用自定义 allocator。 ([Tree-sitter][1])

示例：

```c
void* tree_sitter_my_language_external_scanner_create() {
  return ts_calloc(100, 1);
}
```

---

## Arrays（数组工具）

若需要：

* 缩进栈
* 标签栈
* 字符缓存

应使用：

```
tree_sitter/array.h
```

⚠️ 不要使用以下划线开头的内部函数。

示例（缩进栈）：

```c
Array(int) *stack = payload;

array_push(stack, lexer->get_column(lexer));
array_pop(stack);
```

---

# 其他外部扫描器细节

---

## 优先级

外部扫描器 **优先于默认词法分析器**。

当 externals token 在当前位置有效时：

> 外部扫描器会首先执行。

---

## 错误恢复（Error Recovery）

错误恢复阶段：

Tree-sitter 会调用 scan，并将所有 token 标记为 valid。

常见方案：

添加 sentinel token：

```js
externals: $ => [
  $.token1,
  $.token2,
  $.error_sentinel
]
```

然后检测：

```c
if (valid_symbols[ERROR_SENTINEL]) {
  return false;
}
```

---

## 外部关键字（External Keywords）

例如：

```js
externals: $ => ['if', 'then', 'else']
```

流程：

1. 外部扫描器先尝试识别
2. 成功 → 使用该 token
3. 失败 → 回退到内部 lexer

但如果 externals 中引用规则而 grammar 未定义：

👉 外部扫描器必须完全负责识别。

---

## ⚠️ Danger（重要警告）

* 外部扫描器容易造成 **无限循环**
* 对 **零宽 token** 必须极其谨慎
* 循环读取字符时始终使用 `eof`


# 参考资料

[1]: https://tree-sitter.github.io/tree-sitter/creating-parsers/4-external-scanners.html?utm_source=chatgpt.com "External Scanners - Tree-sitter"


* any list
{:toc}