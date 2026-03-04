---
layout: post
title: Tree-sitter 文档-22-实现（Implementation）
date: 2026-01-05 21:01:55 +0800
categories: [AST]
tags: [ast, tree-sitter, sh]
published: true
---

# 实现（Implementation）

Tree-sitter 由两个组件组成：

* 一个 C 库（`libtree-sitter`）
* 一个命令行工具（`tree-sitter` CLI）

`libtree-sitter` 库与 CLI 生成的解析器配合使用，用于：

* 从源代码生成语法树
* 在源代码发生变化时保持语法树为最新状态

`libtree-sitter` 被设计为可嵌入到应用程序中使用，并使用纯 C 语言编写。其接口定义在头文件：

```
tree_sitter/api.h
```

中。

CLI 用于根据描述语言的**上下文无关文法（context-free grammar）**生成解析器。

CLI 本质上是一个构建工具；一旦解析器生成完成，运行时不再需要 CLI。

CLI 使用 Rust 编写，并可通过以下方式获取：

* crates.io
* npm
* GitHub 预编译二进制文件 ([tree-sitter.github.io][1])

---

## CLI

`tree-sitter` CLI 最重要的功能是：

```
generate
```

子命令。

该命令会：

1. 从 `grammar.js` 文件读取上下文无关文法
2. 生成一个解析器
3. 输出为 C 源文件：

```
parser.c
```

`cli/src` 目录中的源码共同参与生成 `parser.c` 的过程。

本节将介绍该过程中的关键阶段。

---

## 解析 Grammar（Parsing a Grammar）

首先，Tree-sitter 需要执行 `grammar.js` 中的 JavaScript 代码，并将 grammar 转换为 JSON 格式。

实现方式为：

> 调用 Node.js 执行 grammar 文件。

grammar 的格式由：

```
grammar.schema.json
```

中的 JSON Schema 正式定义。

该解析过程实现于：

```
parse_grammar.rs
```

([tree-sitter.github.io][1])

---

## Grammar Rules（文法规则）

Tree-sitter grammar 由一组 **规则（rules）** 组成。

这些规则用于描述：

> 语法节点如何由其他语法节点构成。

规则类型包括：

* symbol（符号）
* string（字符串）
* regex（正则表达式）
* sequence（序列）
* choice（选择）
* repetition（重复）
* 以及其他规则类型

在内部实现中，这些规则统一表示为一个枚举类型：

```
Rule
```

([tree-sitter.github.io][1])

---

## Grammar 预处理（Preparing a Grammar）

grammar 被解析之后，在生成解析器之前必须进行多步转换。

每一步转换：

* 由 `prepare_grammar` 目录中的独立文件实现
* 最终在：

```
prepare_grammar/mod.rs
```

中组合执行。

---

在转换结束时，原始 grammar 会被拆分为两个部分：

### 1️⃣ Syntax Grammar（语法文法）

描述：

> 非终结符如何由其他 grammar 符号构建。

---

### 2️⃣ Lexical Grammar（词法文法）

描述：

> 终结符（字符串与正则表达式）如何由字符组成。

---

## 构建解析表（Building Parse Tables）

（本节内容仍在编写中）

---

## Runtime（运行时）

（本节内容仍在编写中） ([tree-sitter.github.io][1])

---

（翻译完毕）


# 参考资料

[1]: https://tree-sitter.github.io/tree-sitter/5-implementation.html?utm_source=chatgpt.com "Implementation - Tree-sitter"


* any list
{:toc}