---
layout: post
title: Tree-sitter 文档-02-使用解析器（Using Parsers）
date: 2026-01-05 21:01:55 +0800
categories: [AST]
tags: [ast, tree-sitter, sh]
published: true
---

# Tree-sitter

# 使用解析器（Using Parsers）

本指南介绍 Tree-sitter 的核心使用概念，这些概念适用于所有编程语言。

虽然本文档包含一些仅与 C 语言相关的细节（这些内容对于直接使用 C API 或创建新的语言绑定非常重要），但其核心思想在所有语言绑定中都是一致的。

---

## 解析功能的实现方式

Tree-sitter 的解析功能通过 C API 提供。

所有 API 函数都定义在以下头文件中：

```
tree_sitter/api.h
```

如果你使用其他编程语言，则可以通过相应语言的绑定来访问 Tree-sitter 的功能。

这些绑定通常提供更加符合该语言使用习惯的 API 封装。

---

## 官方语言绑定文档

官方语言绑定均提供各自独立的 API 文档，包括：

* Go
* Java
* JavaScript（Node.js）
* Kotlin
* Python
* Rust
* Zig


# 参考资料

https://tree-sitter.github.io/tree-sitter/using-parsers/index.html

* any list
{:toc}