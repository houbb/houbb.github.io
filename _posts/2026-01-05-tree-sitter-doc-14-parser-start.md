---
layout: post
title: Tree-sitter 文档-14-parser 开始使用（Getting Started）
date: 2026-01-05 21:01:55 +0800
categories: [AST]
tags: [ast, tree-sitter, sh]
published: true
---

# 开始使用（Getting Started）

---

## 依赖项（Dependencies）

要开发一个 Tree-sitter 解析器，需要安装以下两个依赖：

* **JavaScript 运行时**
  Tree-sitter 的语法（grammar）使用 JavaScript 编写，并通过 JavaScript 运行时（默认是 Node.js）进行解释。因此需要保证运行时命令（默认 `node`）存在于系统的 `PATH` 中。

* **C 编译器**
  Tree-sitter 生成的解析器是用 C 语言编写的。
  若要使用 `tree-sitter parse` 或 `tree-sitter test` 运行和测试解析器，系统中必须安装 C/C++ 编译器。Tree-sitter 会在各平台的标准路径中查找这些编译器。 ([Tree-sitter][1])

---

## 安装（Installation）

创建 Tree-sitter 解析器需要使用 **tree-sitter CLI**，可以通过以下方式安装：

* 使用 Rust 包管理器 `cargo` 从源码构建 `tree-sitter-cli`
* 使用 `cargo` 从 crates.io 安装：

```bash
cargo install tree-sitter-cli --locked
```

* 使用 Node.js 的 npm 安装（依赖预编译二进制，仅部分平台支持）：

```bash
npm install -g tree-sitter-cli
```

* 从 GitHub Release 下载对应平台的二进制文件，并放入 `PATH` 目录中。 ([Tree-sitter][1])

---

## 项目初始化（Project Setup）

推荐将解析器仓库命名为：

```
tree-sitter-<language-name>
```

语言名称应使用小写形式。

```bash
mkdir tree-sitter-${LOWER_PARSER_NAME}
cd tree-sitter-${LOWER_PARSER_NAME}
```

---

## 初始化项目（Init）

安装 CLI 后，可以执行：

```bash
tree-sitter init
```

该命令会通过交互方式创建项目文件。

生成的项目中将包含一个 `grammar.js` 文件，例如：

```javascript
/**
 * @file PARSER_DESCRIPTION
 * @author PARSER_AUTHOR_NAME PARSER_AUTHOR_EMAIL
 * @license PARSER_LICENSE
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

export default grammar({
  name: 'LOWER_PARSER_NAME',

  rules: {
    source_file: $ => 'hello'
  }
});
```

其中占位符会被 `init` 命令输入的信息替换。 ([Tree-sitter][1])

---

## 生成解析器（Generate）

运行：

```bash
tree-sitter generate
```

该命令会根据 `grammar.js` 生成用于解析语言的 C 代码。 ([Tree-sitter][1])

---

## 测试解析器（Test Parser）

创建测试文件：

```bash
echo 'hello' > example-file
tree-sitter parse example-file
```

Windows PowerShell：

```powershell
"hello" | Out-File example-file -Encoding utf8
tree-sitter parse example-file
```

输出结果应为：

```
(source_file [0, 0] - [1, 0])
```

这表示解析器已经可以正常工作。 ([Tree-sitter][1])

---

## 编辑器类型支持

`grammar.js` 中的：

```javascript
/// <reference types="tree-sitter-cli/dsl" />
// @ts-check
```

用于让编辑器提供类型提示与文档支持。

要启用该功能，需要在项目中安装 Tree-sitter 的 TypeScript API：

```bash
npm install
```

这将在项目中生成 `node_modules` 目录，从而启用类型检查与自动补全。 

# 参考资料

([Tree-sitter][1])

[1]: https://tree-sitter.github.io/tree-sitter/creating-parsers/1-getting-started.html?utm_source=chatgpt.com "Getting Started - Tree-sitter"


* any list
{:toc}