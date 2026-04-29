---
layout: post 
title: quarkdown 是一个基于 Markdown 的现代排版系统，核心设计目标是**高通用性（versatility）
date: 2026-04-29 21:01:55 +0800
categories: [AI]
tags: [ai, claude]
published: true
---
 
# 关于

**Quarkdown** 是一个基于 Markdown 的现代排版系统，核心设计目标是**高通用性（versatility）**。

它允许你使用**同一个项目**，无缝编译为：

* 可打印书籍
* 学术论文
* 知识库
* 交互式演示

这一切都通过对 Markdown 的**图灵完备扩展**实现，使你的内容可以自动流转到最终输出。

---

<p align="center">
  <img src="https://raw.githubusercontent.com/iamgio/quarkdown/project-files/images/paged-demo.png" alt="Paper demo">
  <p align="center"><em>原始引用：<a href="https://arxiv.org/abs/1706.03762v7">Attention Is All You Need</a></em></p>
</p>

---

Quarkdown 基于 CommonMark 和 GFM 扩展而来，其核心能力之一是：**为 Markdown 引入函数机制**。

示例：

```
.somefunction {arg1} {arg2}
    Body argument
```

---

借助不断扩展的[标准库](quarkdown-stdlib/src/main/kotlin/com/quarkdown/stdlib)，你可以获得：

* 布局构建
* I/O 操作
* 数学能力
* 条件语句
* 循环

---

你还可以：

* 自定义函数
* 定义变量
* 构建自己的库

示例：

```
.function {greet}
    to from:
    **Hello, .to** from .from!

.greet {world} from:{iamgio}
```

输出：

> **Hello, world** from iamgio!

---

这种内置脚本能力，使得你可以构建：

👉 动态内容
👉 复杂结构
👉 普通 Markdown 无法实现的能力

---

结合：

* 实时预览（Live Preview）
* ⚡ 高速编译
* 强大的 VS Code 插件
  [https://marketplace.visualstudio.com/items?itemName=quarkdown.quarkdown-vscode](https://marketplace.visualstudio.com/items?itemName=quarkdown.quarkdown-vscode)

Quarkdown 可以高效支持：

* 学术论文
* 书籍
* 知识库
* 演示文稿

---

<p align="center">
<img src="https://raw.githubusercontent.com/quarkdown-labs/quarkdown-vscode/refs/heads/project-files/live-preview.gif" alt="Live preview" />
</p>

---

<h2 align="center">在找什么？</h2>
<p align="center">
  <strong>
    查看 <a href="https://quarkdown.com/wiki" target="_blank">Wiki 文档</a>
  </strong>
  以快速上手并深入了解语言特性
</p>

---

## 简单如你所想...

---

<h2 align="right">……复杂如你所需。</h2>

---

# 输出目标（Targets）

* **HTML**

  * Plain（连续流式，类似 Notion/Obsidian）
  * Paged（分页文档，通过 [https://pagedjs.org）](https://pagedjs.org）)
  * Slides（演示文稿，通过 [https://revealjs.com）](https://revealjs.com）)
  * Docs（文档 / Wiki）

* **PDF**

  * 支持所有 HTML 特性

* **纯文本**

通过 `.doctype` 设置类型：

```
.doctype {plain}
.doctype {paged}
.doctype {slides}
.doctype {docs}
```

---

# 对比（Comparison）

（表格结构保持不变，仅语义理解）

👉 Quarkdown 在：

* 可读性
* 可扩展性
* 输出能力

上对标：

* LaTeX
* Typst
* AsciiDoc
* MDX

---

# 快速开始（Getting started）

## 安装（Installation）

### Linux / macOS

```bash
curl -fsSL https://raw.githubusercontent.com/quarkdown-labs/get-quarkdown/refs/heads/main/install.sh | sudo env "PATH=$PATH" bash
```

👉 自动安装：

* Java 17
* Node.js
* npm

---

### Homebrew

```bash
brew install quarkdown-labs/quarkdown/quarkdown
```

---

### Windows

```powershell
irm https://raw.githubusercontent.com/quarkdown-labs/get-quarkdown/refs/heads/main/install.ps1 | iex
```

---

### Scoop

```bash
scoop bucket add java
scoop bucket add quarkdown https://github.com/quarkdown-labs/scoop-quarkdown
scoop install quarkdown
```

---

### GitHub Actions

👉 [https://github.com/quarkdown-labs/setup-quarkdown](https://github.com/quarkdown-labs/setup-quarkdown)

---

## 快速入门（Quickstart）

👉 [https://quarkdown.com/wiki/quickstart](https://quarkdown.com/wiki/quickstart)

---

## 创建项目

```bash
quarkdown create [directory]
```

👉 自动生成：

* 项目结构
* 元数据
* 初始内容

---

## 编译

```bash
quarkdown c file.qd
```

常用参数：

* `-p`：预览
* `-w`：监听文件变化
* `--pdf`：导出 PDF

👉 组合：

```
-p -w = 实时预览
```

---

## 示例文档（Mock）

👉 源码：`mock/`
👉 编译：

```bash
quarkdown c mock/main.qd -p
```

👉 生成结果：
[https://github.com/quarkdown-labs/generated](https://github.com/quarkdown-labs/generated)

---

## 贡献（Contributing）

👉 [CONTRIBUTING.md](CONTRIBUTING.md)

---

## 赞助（Sponsors）

感谢所有支持者：

👉 [https://github.com/sponsors/iamgio](https://github.com/sponsors/iamgio)

---

## 设计理念（Concept）

Logo 基于：

👉 [https://github.com/dcurtis/markdown-mark](https://github.com/dcurtis/markdown-mark)

核心概念：

> **Quark（夸克）**

一种构成物质的基本粒子：

* 极小
* 极基础
* 构建一切复杂结构

👉 Quarkdown 的设计哲学正是如此：

> 用最小的语法构建最复杂的表达能力

---

## 许可证（License）

* 主体：GNU GPLv3
* CLI / LSP：GNU AGPLv3

# 参考资料

* any list
{:toc}