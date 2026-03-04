---
layout: post
title: Tree-sitter 文档-20-语法高亮
date: 2026-01-05 21:01:55 +0800
categories: [AST]
tags: [ast, tree-sitter, sh]
published: true
---


# 语法高亮

语法高亮是处理代码的应用程序中非常常见的功能。Tree-sitter 通过 `tree-sitter-highlight` 库内建支持语法高亮，这个库目前用于 GitHub.com 对多种语言代码进行高亮显示。你也可以使用命令行工具 `tree-sitter highlight` 执行语法高亮。([tree-sitter.github.io][1])

本文件说明 Tree-sitter 语法高亮系统如何工作，重点使用命令行界面。如果你使用 `tree-sitter-highlight` 库（无论是 C 还是 Rust），所有概念依然适用，但配置数据是以内存对象而不是文件的形式提供。([tree-sitter.github.io][1])

---

## 概览

用于高亮特定语言的所有文件通常包含在该语言的 Tree-sitter grammar 仓库中（例如 `tree-sitter-javascript`、`tree-sitter-ruby`）。要从命令行运行语法高亮，需要三类文件：

1. 用户配置：位于 `~/.config/tree-sitter/config.json` 的 per-user 配置文件（参见 init-config 文档）。
2. 语言配置：位于 grammar 仓库的 `tree-sitter.json` 文件中（参见 init 文档）。
3. 查询文件：位于 grammar 仓库的 `queries` 目录中。([tree-sitter.github.io][1])

---

## 语言配置（Language Configuration）

Tree-sitter CLI 使用 `tree-sitter.json` 文件。在这个文件中，CLI 会查找顶层 `"grammars"` 键，其值应包含一个对象数组，对象具有以下键：([tree-sitter.github.io][1])

### 基础字段（Basics）

这些字段指定解析器的基本信息：([tree-sitter.github.io][1])

* `scope`（必需） — 字符串，如 `"source.js"`，用于标识语言。该值努力匹配常见的 TextMate grammar 和 Linguist 库中使用的 scope 名称。
* `path`（可选） — 从包含 `tree-sitter.json` 的目录到包含实际 parser 的 `src/` 文件夹的相对路径。默认值为 `"."`。
* `external-files`（可选） — 一个相对路径数组，列出在 recompilation 时应检查修改的文件。([tree-sitter.github.io][1])

### 语言检测字段（Language Detection）

这些字段帮助决定某文件是否属于该语言：([tree-sitter.github.io][1])

* `file-types` — 文件名后缀数组。grammar 用于以这些后缀结尾的文件。
* `first-line-regex` — 正则匹配第一行以检测语言。
* `content-regex` — 在多个 grammar 匹配时，内容正则可用于打破优先级。
* `injection-regex` — 用于检测是否应对嵌入语言启用 language injection（注入语言）。([tree-sitter.github.io][1])

### 查询路径（Query Paths）

以下键指定语法高亮相关的查询文件路径：([tree-sitter.github.io][1])

* `highlights` — 高亮查询路径，默认 `queries/highlights.scm`
* `locals` — 局部变量查询路径，默认 `queries/locals.scm`
* `injections` — 注入查询路径，默认 `queries/injections.scm`([tree-sitter.github.io][1])

---

## 查询（Queries）

Tree-sitter 的语法高亮系统基于 **tree queries**，这是一种对语法树模式匹配的通用系统。语法高亮由三种查询文件控制，通常放在 `queries` 目录下：([tree-sitter.github.io][1])

---

### Highlights（高亮查询）

最重要的查询是 highlights 查询。它使用 captures 为语法树中的不同节点赋予**任意高亮名称**，这些名称可映射为颜色。常用的高亮名称包括：

* `keyword`
* `function`
* `type`
* `property`
* `string`

名称也可以是点分隔形式，如 `function.builtin`。([tree-sitter.github.io][1])

例如，假设我们要将 Go 代码按如下规则着色：([tree-sitter.github.io][1])

* 关键字 `func`、`return` 用紫色
* 函数名 `increment` 用蓝色
* 类型 `int` 用绿色
* 数字 `5` 用棕色([tree-sitter.github.io][1])

可以写成 highlights 查询：

```
; highlights.scm

"func" @keyword
"return" @keyword
(type_identifier) @type
(int_literal) @number
(function_declaration name: (identifier) @function)
```

然后在配置文件中映射各高亮名称到颜色：([tree-sitter.github.io][1])

```
{
  "theme": {
    "keyword": "purple",
    "function": "blue",
    "type": "green",
    "number": "brown"
  }
}
```

([tree-sitter.github.io][1])

---

### Local Variables（局部变量查询）

良好的语法高亮有助于快速区分代码中的不同实体。Tree-sitter 的局部变量查询通过固定的 capture 名称来帮助追踪作用域与变量：([tree-sitter.github.io][1])

* `@local.scope` — 表示语法节点引入新的本地作用域
* `@local.definition` — 表示节点包含当前作用域内的定义名称
* `@local.reference` — 表示节点包含可能引用先前定义的名称([tree-sitter.github.io][1])

此外可以使用 `@ignore` capture 忽略某些节点，这在模式前置时非常有用。([tree-sitter.github.io][1])

---

### Language Injection（语言注入）

某些源文件包含多种语言，例如：([tree-sitter.github.io][1])

* HTML 中的 `<script>`（JavaScript）与 `<style>`（CSS）
* ERB 文件内嵌 Ruby
* JavaScript 中的正则字面量
* Ruby heredoc 内可能包含指定语言内容([tree-sitter.github.io][1])

通过 `@injection.content` 和 `@injection.language` capture，可以指定节点内容按其他语言重新解析，以及指定语言名称。额外属性如 `injection.combined`、`injection.include-children`、`injection.self`、`injection.parent` 用于控制注入行为。([tree-sitter.github.io][1])

---

## 单元测试（Unit Testing）

Tree-sitter 内建了验证语法高亮结果的方法，基于 Sublime Text 的测试系统。测试文件放在 `test/highlight` 目录下，并通过特殊注释断言高亮类别。例如：([tree-sitter.github.io][2])

```js
var abc = function(d) {
  // <- keyword
  //          ^ keyword
  //               ^ variable.parameter
  // ^ function
```

此类测试使用两种断言方式：

* 插入符号 `^`：测试最接近的上一非测试注释行指定列的高亮作用域
* 箭头 `←`：测试注释字符所在列的高亮作用域([tree-sitter.github.io][2])

注意：感叹号 `!` 可用于否定选择器（例如 `!keyword` 表示不匹配关键词类）。([tree-sitter.github.io][2])

---

（翻译完毕）([tree-sitter.github.io][1])


# 参考资料

[1]: https://tree-sitter.github.io/tree-sitter/3-syntax-highlighting.html?utm_source=chatgpt.com "Syntax Highlighting - Tree-sitter"
[2]: https://tree-sitter.github.io/tree-sitter/3-syntax-highlighting.html "Syntax Highlighting - Tree-sitter"

* any list
{:toc}