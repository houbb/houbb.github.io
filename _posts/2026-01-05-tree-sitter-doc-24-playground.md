---
layout: post
title: Tree-sitter 文档-24-Playground 交互式测试环境
date: 2026-01-05 21:01:55 +0800
categories: [AST]
tags: [ast, tree-sitter, sh]
published: true
---

# Playground

`tree-sitter playground` 命令允许你启动一个**本地 Playground（交互式测试环境）**，用于以交互方式测试你的解析器。

```bash
tree-sitter playground [OPTIONS]
```

别名：

```bash
play
pg
web-ui
```

---

## 前提条件

要使用 Playground，你必须已经将解析器构建为 **Wasm 模块**。

可以通过以下命令完成构建：

```bash
tree-sitter build --wasm
```

只有在生成 Wasm 版本解析器后，Playground 才能运行。 ([tree-sitter.github.io][1])

---

## Playground 的作用

Playground 提供一个 Web UI，用于：

* 输入源代码
* 查看解析后的语法树
* 编写并测试 queries
* 实时观察 grammar 行为

它主要用于：

* grammar 调试
* query 编写
* parser 行为验证

---

## 启动 Playground

运行：

```bash
tree-sitter playground
```

默认行为：

* 启动本地 Web 服务器
* 自动在默认浏览器中打开 Playground 页面

---

## 命令选项（Options）

---

### `-e / --export <EXPORT_PATH>`

将 Playground 导出为**静态文件**到指定目录，而不是启动本地服务器。

示例：

```bash
tree-sitter playground --export ./playground
```

---

### `-q / --quiet`

启动 Playground 时：

* 不自动打开浏览器。

---

### `--grammar-path <GRAMMAR_PATH>`

指定包含以下内容的目录路径：

* grammar
* wasm 文件

用于在非当前目录下运行 Playground。

---

## 使用方式

在 Playground 页面中通常包含以下区域：

### 1️⃣ Source Code（源码区域）

用于输入或粘贴待解析代码。

---

### 2️⃣ Syntax Tree（语法树）

实时显示解析生成的语法树。

选择树节点时：

* 对应源码区域会高亮
* 反向选择同样生效

---

### 3️⃣ Query Editor（查询编辑器）

允许输入 Tree-sitter 查询：

```
(identifier) @name
```

匹配结果会立即在源码中高亮显示。

---

### 4️⃣ Log（日志）

启用 Log 后：

* 解析日志会输出到浏览器开发者控制台。

---

## 典型用途

Playground 通常用于：

* 调试 grammar 规则
* 验证节点结构
* 编写 highlights 查询
* 编写 tags 查询
* 理解语法树结构

开发 grammar 时，Playground 是最核心的调试工具之一。 ([parsiya.net][2])

---

（翻译完毕）


# 参考资料

[1]: https://tree-sitter.github.io/tree-sitter/cli/playground.html?utm_source=chatgpt.com "Playground - Tree-sitter"
[2]: https://parsiya.net/blog/knee-deep-tree-sitter-queries/?utm_source=chatgpt.com "Knee Deep in tree-sitter Queries"

* any list
{:toc}