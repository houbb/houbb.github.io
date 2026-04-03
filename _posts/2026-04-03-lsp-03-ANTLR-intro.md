---
layout: post 
title: LSP（Language Server Protocol）-03-ANTLR（ANother Tool for Language Recognition）是一个语言解析器生成器（parser generator）
date: 2026-04-03 21:01:55 +0800
categories: [Web]
tags: [web, bun,j s]
published: true
---

# ANTLR

ANTLR（**ANother Tool for Language Recognition**）是一个**语言解析器生成器（parser generator）**，用来把“文本 → 结构化语法树（AST/Parse Tree）”。

👉 简单说：

> **ANTLR = 用语法规则（Grammar）生成词法分析器 + 语法分析器的工具**

---

# 一、ANTLR 是干什么的（本质定位）

它解决的是：

```text
一段文本（代码 / DSL / 配置）
        ↓
语法解析
        ↓
结构化数据（Parse Tree / AST）
```

常见用途：

* 编译器 / 解释器
* DSL（领域特定语言）
* SQL / 表达式解析
* 配置文件解析
* 代码分析工具（LSP 也会用）

---

# 二、ANTLR 的核心思想（Grammar 驱动）

ANTLR 的核心是：**用一套语法规则描述语言**

例如：

```antlr
grammar Expr;

expr: expr '+' expr
    | expr '*' expr
    | INT
    ;

INT: [0-9]+;
WS: [ \t\r\n]+ -> skip;
```

👉 你定义的是：

* 语法规则（parser rules）
* 词法规则（lexer rules）

---

# 三、ANTLR 会帮你生成什么？

ANTLR 会自动生成：

1️⃣ Lexer（词法分析器）

```text
输入： "1 + 2"
输出： INT '+' INT
```

---

2️⃣ Parser（语法分析器）

```text
输入：Token 流
输出：Parse Tree（语法树）
```

---

3️⃣ 访问 API（Visitor / Listener）

你可以：

* 遍历语法树
* 执行逻辑（解释 / 编译 / 分析）

---

# 四、ANTLR 的处理流程（完整 pipeline）

```text
输入文本
   ↓
Lexer（分词）
   ↓
Token Stream
   ↓
Parser（语法分析）
   ↓
Parse Tree
   ↓
Visitor / Listener
   ↓
你的业务逻辑
```

---

# 五、Parse Tree vs AST（关键区别）

ANTLR 默认生成的是：

👉 **Parse Tree（语法树）**

特点：

* 完全保留语法细节
* 层级较深
* 冗余较多

---

而很多系统（比如 LSP）需要：

👉 **AST（抽象语法树）**

特点：

* 去掉无关语法节点
* 更适合语义分析

---

👉 所以常见做法是：

```text
ANTLR Parse Tree → 自己转换为 AST → 语义分析
```

---

# 六、Visitor / Listener 模型（核心机制）

ANTLR 提供两种遍历方式：

---

## 1️⃣ Listener（事件驱动）

```java
enterExpr()
exitExpr()
```

👉 类似：

> “进入节点 / 离开节点” 的回调

---

## 2️⃣ Visitor（推荐）

```java
visitExpr()
```

👉 更像：

> 手动控制遍历 + 返回值

✔️ 更适合：

* 计算表达式
* 构建 AST
* 做语义分析

---

# 七、ANTLR vs tree-sitter（你刚刚的问题延伸）

这是一个非常关键的对比👇

| 维度   | ANTLR             | tree-sitter        |
| ---- | ----------------- | ------------------ |
| 类型   | Parser Generator  | Incremental Parser |
| 输入   | Grammar           | Grammar            |
| 输出   | Parser + Lexer 代码 | 解析引擎               |
| AST  | 需要自己构建            | 内置语法树              |
| 增量解析 | ❌（弱）              | ✔（强）               |
| 实时编辑 | 一般                | 非常适合               |
| 适用场景 | 编译器 / DSL         | 编辑器 / IDE          |

---

👉 一句话总结：

* **ANTLR 更适合“编译器 / DSL”**
* **tree-sitter 更适合“编辑器实时解析”**

---

# 八、ANTLR 的优势（为什么还在用）

## ✔️ 1. 语法表达能力强

支持：

* 左递归
* 优先级
* 复杂语言结构

---

## ✔️ 2. 多语言支持

可以生成：

* Java
* Python
* Go
* JavaScript
* C++

---

## ✔️ 3. 成熟稳定

ANTLR 是语言工具领域的“工业级工具”。

---

# 九、ANTLR 的局限

## ❗1. 不适合实时编辑

* 不支持高效增量解析
* 每次基本要重新 parse

---

## ❗2. Parse Tree 太重

* 需要自己转 AST

---

## ❗3. 学习成本较高

* Grammar 设计需要经验

---

# 十、ANTLR 在 LSP / 编译器中的位置

你可以这样理解：

```text
ANTLR → 负责“语法层”
       ↓
AST → 语义分析
       ↓
Symbol Table / Type System
       ↓
LSP 能力（跳转 / 补全）
```

---

👉 再强调一次：

> **ANTLR 只是“语法解析工具”，不是完整的语言智能系统**

---

# 十一、一个直观类比（帮助你建立模型）

如果把整个语言系统类比为一个公司：

| 角色    | 对应         |
| ----- | ---------- |
| ANTLR | 前台接待（识别输入） |
| AST   | 数据结构       |
| 语义分析  | 业务逻辑       |
| LSP   | 对外 API     |

---

# 十二、总结一句话

> **ANTLR 是一个通过 Grammar 自动生成“词法 + 语法解析器”的工具，用来把文本解析成结构化语法树，是构建编译器、DSL、代码分析工具的基础设施之一。**

# 参考资料

* any list
{:toc}