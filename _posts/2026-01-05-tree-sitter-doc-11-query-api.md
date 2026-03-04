---
layout: post
title: Tree-sitter 文档-11-查询 API（Query API）
date: 2026-01-05 21:01:55 +0800
categories: [AST]
tags: [ast, tree-sitter, sh]
published: true
---

# 查询 API（Query API）

---

可以通过指定一个包含一个或多个模式的字符串来创建查询：

```c
TSQuery *ts_query_new(
  const TSLanguage *language,
  const char *source,
  uint32_t source_len,
  uint32_t *error_offset,
  TSQueryError *error_type
);
```

如果查询中存在错误：

* `error_offset` 会被设置为错误所在的字节偏移位置
* `error_type` 会被设置为表示错误类型的值

```c
typedef enum {
  TSQueryErrorNone = 0,
  TSQueryErrorSyntax,
  TSQueryErrorNodeType,
  TSQueryErrorField,
  TSQueryErrorCapture,
} TSQueryError;
```

([tree-sitter.github.io][1])

---

`TSQuery` 对象是**不可变的（immutable）**，因此可以安全地在多个线程之间共享。

为了执行查询，需要创建一个 `TSQueryCursor`，它用于保存查询执行过程中所需的状态。

查询游标 **不应在线程之间共享**，但可以被重复用于多次查询执行。

```c
TSQueryCursor *ts_query_cursor_new(void);
```

([tree-sitter.github.io][1])

---

随后，可以在指定的语法节点上执行查询：

```c
void ts_query_cursor_exec(
  TSQueryCursor *,
  const TSQuery *,
  TSNode
);
```

([tree-sitter.github.io][1])

---

接下来可以遍历匹配结果：

```c
typedef struct {
  TSNode node;
  uint32_t index;
} TSQueryCapture;

typedef struct {
  uint32_t id;
  uint16_t pattern_index;
  uint16_t capture_count;
  const TSQueryCapture *captures;
} TSQueryMatch;

bool ts_query_cursor_next_match(
  TSQueryCursor *,
  TSQueryMatch *match
);
```

当没有更多匹配结果时，该函数返回 `false`。
否则，它会将匹配到的模式信息以及被捕获的节点数据写入 `match` 结构体中。

# 参考资料

 ([tree-sitter.github.io][1])

[1]: https://tree-sitter.github.io/tree-sitter/using-parsers/queries/4-api.html?utm_source=chatgpt.com "API - Tree-sitter"


* any list
{:toc}