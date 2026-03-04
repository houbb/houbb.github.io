---
layout: post
title: Tree-sitter 文档-03-入门（Getting Started）
date: 2026-01-05 21:01:55 +0800
categories: [AST]
tags: [ast, tree-sitter, sh]
published: true
---

# ps

这里可以跳过，因为很多项目存在编译好的包。

# 入门（Getting Started）

---

## 构建库（Building the Library）

在 POSIX 系统上构建 Tree-sitter 库，只需在 Tree-sitter 目录中运行：

```
make
```

该命令将生成：

* 一个静态库 `libtree-sitter.a`
* 以及对应的动态库文件

或者，你也可以将该库集成到更大的项目构建系统中，只需在构建中加入一个源文件。

需要加入的源文件：

```
tree-sitter/lib/src/lib.c
```

编译时需要包含以下目录：

```
tree-sitter/lib/src
tree-sitter/lib/include
```

---

## 基础对象（The Basic Objects）

在使用 Tree-sitter 时，涉及四种核心对象：

| 对象   | C 类型         | 说明           |
| ---- | ------------ | ------------ |
| 语言   | `TSLanguage` | 定义如何解析某种编程语言 |
| 解析器  | `TSParser`   | 执行解析过程       |
| 语法树  | `TSTree`     | 表示整个源码文件的语法树 |
| 语法节点 | `TSNode`     | 表示语法树中的单个节点  |

---

### `TSLanguage`

`TSLanguage` 是一个不透明对象，用于定义某种编程语言的解析方式。

每个语言对应的代码均由 Tree-sitter 自动生成。

许多语言的实现已经存在于 Tree-sitter 官方 GitHub 组织中的独立仓库中。

---

### `TSParser`

`TSParser` 是一个 **有状态对象**。

它可以被设置为某种 `TSLanguage`，并基于输入的源代码生成语法树（`TSTree`）。

---

### `TSTree`

`TSTree` 表示整个源代码文件的语法结构。

它内部包含多个 `TSNode`，用于描述源码结构。

当源代码发生变化时，该语法树可以被编辑，并用于生成新的语法树（增量解析）。

---

### `TSNode`

`TSNode` 表示语法树中的单个节点。

它记录：

* 在源码中的起始位置
* 结束位置
* 与其他节点的关系，例如：

  * 父节点
  * 兄弟节点
  * 子节点

---

## 示例程序（An Example Program）

下面是一个使用 Tree-sitter JSON 解析器的简单 C 程序示例。

```c
// Filename - test-json-parser.c

#include <assert.h>
#include <string.h>
#include <stdio.h>
#include <tree_sitter/api.h>

// 声明 tree_sitter_json 函数
const TSLanguage *tree_sitter_json(void);

int main() {
  // 创建解析器
  TSParser *parser = ts_parser_new();

  // 设置解析语言
  ts_parser_set_language(parser, tree_sitter_json());

  // 解析字符串形式的源码
  const char *source_code = "[1, null]";
  TSTree *tree = ts_parser_parse_string(
    parser,
    NULL,
    source_code,
    strlen(source_code)
  );

  // 获取根节点
  TSNode root_node = ts_tree_root_node(tree);

  // 获取子节点
  TSNode array_node = ts_node_named_child(root_node, 0);
  TSNode number_node = ts_node_named_child(array_node, 0);

  // 校验节点类型
  assert(strcmp(ts_node_type(root_node), "document") == 0);
  assert(strcmp(ts_node_type(array_node), "array") == 0);
  assert(strcmp(ts_node_type(number_node), "number") == 0);

  // 校验子节点数量
  assert(ts_node_child_count(root_node) == 1);
  assert(ts_node_child_count(array_node) == 5);
  assert(ts_node_named_child_count(array_node) == 2);
  assert(ts_node_child_count(number_node) == 0);

  // 以 S-expression 格式打印语法树
  char *string = ts_node_string(root_node);
  printf("Syntax tree: %s\n", string);

  // 释放内存
  free(string);
  ts_tree_delete(tree);
  ts_parser_delete(parser);
  return 0;
}
```

---

## 构建该程序所需组件

构建该程序需要以下三个部分：

1. Tree-sitter C API
   （来自 `tree-sitter/api.h`，需要将 `tree-sitter/lib/include` 加入 include 路径）

2. Tree-sitter 库
   (`libtree-sitter.a`)

3. JSON 语言语法源码
   （直接编译进可执行文件）

---

### 静态链接编译示例

```
clang \
  -I tree-sitter/lib/include \
  test-json-parser.c \
  tree-sitter-json/src/parser.c \
  tree-sitter/libtree-sitter.a \
  -o test-json-parser

./test-json-parser
```

---

### 动态链接编译示例

使用动态链接时，需要确保共享库可被系统发现（例如通过 `LD_LIBRARY_PATH`）。

```
clang \
  -I tree-sitter/lib/include \
  test-json-parser.c \
  tree-sitter-json/src/parser.c \
  -ltree-sitter \
  -o test-json-parser

./test-json-parser
```

([tree-sitter.github.io][1])

[1]: https://tree-sitter.github.io/tree-sitter/using-parsers/1-getting-started.html?utm_source=chatgpt.com "Getting Started - Tree-sitter"


# 参考资料

https://tree-sitter.github.io/tree-sitter/using-parsers/index.html

* any list
{:toc}