---
layout: post
title: Tree-sitter 是一个语法解析器生成工具以及一个增量解析库。
date: 2026-01-05 21:01:55 +0800
categories: [AI]
tags: [ai, ai-coding, sh]
published: true
---

# Tree-sitter

Tree-sitter 是一个**语法解析器生成工具**以及一个**增量解析库**。

它能够为源代码文件构建**具体语法树（Concrete Syntax Tree, CST）**，并且在源文件被编辑时，高效地对语法树进行更新。Tree-sitter 的设计目标包括：

* **通用性**：足够通用，可以解析任意编程语言
* **高性能**：性能足够高，能够在文本编辑器中做到**每一次按键输入都进行解析**
* **健壮性**：即使在存在语法错误的情况下，也能提供有价值的解析结果
* **无运行时依赖**：其运行时库使用纯 C 语言编写，可被嵌入到任何应用程序中


以下为**严格、结构对齐的中文翻译**，保持原有标题层级、段落结构与代码不变，仅对说明性文字进行翻译。

---

## 入门指南（Getting Started）

### 构建库（Building the Library）

在 POSIX 系统上构建该库，只需在 Tree-sitter 目录中运行 `make`。这将生成一个名为 **libtree-sitter.a** 的静态库，以及对应的动态库。

或者，你也可以将该库集成到更大型项目的构建系统中，只需将一个源文件加入构建即可。该源文件在编译时需要在 include 路径中包含两个目录：

**源文件：**

```
tree-sitter/lib/src/lib.c
```

**include 目录：**

```
tree-sitter/lib/src
tree-sitter/lib/include
```

---

### 基本对象（The Basic Objects）

在使用 Tree-sitter 时，主要涉及四种核心对象类型：**语言（languages）**、**解析器（parsers）**、**语法树（syntax trees）** 和 **语法节点（syntax nodes）**。

在 C 语言中，它们分别对应为 `TSLanguage`、`TSParser`、`TSTree` 和 `TSNode`。

* **TSLanguage**
  `TSLanguage` 是一个不透明对象，用于定义如何解析某一种特定的编程语言。每种 `TSLanguage` 的代码均由 Tree-sitter 生成。当前已有大量语言的实现，分布在 Tree-sitter GitHub 组织以及 Tree-sitter grammars GitHub 组织下的独立仓库中。关于如何创建新的语言，请参阅下一节。

* **TSParser**
  `TSParser` 是一个有状态的对象，可以被分配一个 `TSLanguage`，并基于给定的源代码生成一棵 `TSTree`。

* **TSTree**
  `TSTree` 表示整个源代码文件的语法树。它包含多个 `TSNode` 实例，用于描述源代码的结构。当源代码发生变化时，该语法树也可以被编辑，并用于生成新的 `TSTree`。

* **TSNode**
  `TSNode` 表示语法树中的单个节点。它会跟踪该节点在源代码中的起始和结束位置，以及它与其他节点之间的关系，例如父节点、兄弟节点和子节点。

---

### 示例程序（An Example Program）

下面是一个使用 Tree-sitter JSON 解析器的简单 C 语言示例程序。

```c
// Filename - test-json-parser.c

#include <assert.h>
#include <string.h>
#include <stdio.h>
#include <tree_sitter/api.h>

// Declare the `tree_sitter_json` function, which is
// implemented by the `tree-sitter-json` library.
const TSLanguage *tree_sitter_json(void);

int main() {
  // Create a parser.
  TSParser *parser = ts_parser_new();

  // Set the parser's language (JSON in this case).
  ts_parser_set_language(parser, tree_sitter_json());

  // Build a syntax tree based on source code stored in a string.
  const char *source_code = "[1, null]";
  TSTree *tree = ts_parser_parse_string(
    parser,
    NULL,
    source_code,
    strlen(source_code)
  );

  // Get the root node of the syntax tree.
  TSNode root_node = ts_tree_root_node(tree);

  // Get some child nodes.
  TSNode array_node = ts_node_named_child(root_node, 0);
  TSNode number_node = ts_node_named_child(array_node, 0);

  // Check that the nodes have the expected types.
  assert(strcmp(ts_node_type(root_node), "document") == 0);
  assert(strcmp(ts_node_type(array_node), "array") == 0);
  assert(strcmp(ts_node_type(number_node), "number") == 0);

  // Check that the nodes have the expected child counts.
  assert(ts_node_child_count(root_node) == 1);
  assert(ts_node_child_count(array_node) == 5);
  assert(ts_node_named_child_count(array_node) == 2);
  assert(ts_node_child_count(number_node) == 0);

  // Print the syntax tree as an S-expression.
  char *string = ts_node_string(root_node);
  printf("Syntax tree: %s\n", string);

  // Free all of the heap-allocated memory.
  free(string);
  ts_tree_delete(tree);
  ts_parser_delete(parser);
  return 0;
}
```

该程序在构建时需要以下三个组件：

1. **Tree-sitter 的 C API**（位于 `tree-sitter/api.h`，这要求在 include 路径中包含 `tree-sitter/lib/include`）
2. **Tree-sitter 库**（`libtree-sitter.a`）
3. **JSON 语法的源代码**，该代码会被直接编译进最终的二进制文件

使用如下命令进行编译：

```bash
clang                                   \
  -I tree-sitter/lib/include            \
  test-json-parser.c                    \
  tree-sitter-json/src/parser.c         \
  tree-sitter/libtree-sitter.a          \
  -o test-json-parser
```

运行程序：

```bash
./test-json-parser
```

当使用**动态链接**时，需要确保共享库可以通过 `LD_LIBRARY_PATH` 或系统等效的环境变量被正确加载。以下是使用动态链接进行编译的示例：

```bash
clang                                   \
  -I tree-sitter/lib/include            \
  test-json-parser.c                    \
  tree-sitter-json/src/parser.c         \
  -ltree-sitter                         \
  -o test-json-parser
```

运行程序：

```bash
./test-json-parser
```


# 参考资料

https://github.com/tree-sitter/tree-sitter


* any list
{:toc}