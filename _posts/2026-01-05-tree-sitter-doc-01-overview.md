---
layout: post
title: Tree-sitter 文档-01-Tree-sitter 简介（Introduction）
date: 2026-01-05 21:01:55 +0800
categories: [AST]
tags: [ast, tree-sitter, sh]
published: true
---

# Tree-sitter 简介（Introduction）

**Tree-sitter** 是一个 **解析器生成工具（parser generator）** 与 **增量解析库（incremental parsing library）**。

它能够：

* 为源代码文件构建 **具体语法树（Concrete Syntax Tree，CST）**
* 并在源代码被编辑时，高效地更新语法树

Tree-sitter 的设计目标包括：

* ✅ 足够通用 —— 可以解析任意编程语言
* ✅ 足够快速 —— 能够在文本编辑器的每一次按键输入时执行解析
* ✅ 足够健壮 —— 即使存在语法错误，也能产生有用的解析结果
* ✅ 无运行时依赖 —— 运行时库使用 **纯 C11** 编写，可嵌入任意应用程序

---

## 语言绑定（Language Bindings）

Tree-sitter 提供多种语言绑定，使其可以在不同编程语言中使用。

### 官方支持（Official）

* C#
* Go
* Haskell
* Java（JDK 22+）
* JavaScript（Node.js）
* JavaScript（Wasm）
* Kotlin
* Python
* Rust
* Swift
* Zig

---

### 第三方绑定（Third-party）

* C# (.NET)
* C++
* Crystal
* D
* Delphi
* ELisp
* Go
* Guile
* Janet
* Java（JDK 8+）
* Java（JDK 11+）
* Julia
* Lua
* OCaml
* Odin
* Perl
* Pharo
* PHP
* R
* Ruby

> 注意：部分绑定可能不完整或已过时。

---

## 解析器（Parsers）

在官方组织中可以找到以下语言的解析器：

* Agda
* Bash
* C
* C++
* C#
* CSS
* ERB / EJS
* Go
* Haskell
* HTML
* Java
* JavaScript
* JSDoc
* JSON
* Julia
* OCaml
* PHP
* Python
* Regex
* Ruby
* Rust
* Scala
* TypeScript
* Verilog

完整解析器列表可在 Wiki 中查看。

---

## Tree-sitter 相关演讲（Talks）

* Strange Loop 2018
* FOSDEM 2018
* GitHub Universe 2017

---

## 底层研究基础（Underlying Research）

Tree-sitter 的设计深受以下研究论文影响：

* Practical Algorithms for Incremental Software Development Environments
* Context Aware Scanning for Parsing Extensible Languages
* Efficient and Flexible Incremental Parsing
* Incremental Analysis of Real Programming Languages
* Error Detection and Recovery in LR Parsers
* Error Recovery for LR Parsers

# 参考资料

https://tree-sitter.github.io/tree-sitter/index.html

* any list
{:toc}