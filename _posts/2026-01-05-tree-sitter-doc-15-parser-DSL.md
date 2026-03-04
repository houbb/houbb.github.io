---
layout: post
title: Tree-sitter 文档-15-parser 语法 DSL（The Grammar DSL）
date: 2026-01-05 21:01:55 +0800
categories: [AST]
tags: [ast, tree-sitter, sh]
published: true
---

# 语法 DSL（The Grammar DSL）

---

以下内容列出了可在 `grammar.js` 中用于定义语法规则的**内置函数完整集合**。这些函数用于描述语言的语法结构。([Tree-sitter][1])

---

## 符号（Symbols）

每一条语法规则都是一个 JavaScript 函数，该函数接收一个通常命名为 `$` 的参数。

```js
$.identifier
```

这种写法用于在规则中引用其他语法符号。

名称以 `$.MISSING` 或 `$.UNEXPECTED` 开头应避免使用，因为这些名称在 `tree-sitter test` 中具有特殊含义。([Tree-sitter][1])

---

## 字符串与正则字面量（String and Regex Literals）

终结符可以使用：

* JavaScript 字符串
* 正则表达式

Tree-sitter 不会直接使用 JavaScript 的正则引擎，而是在生成解析器时基于 **Rust 正则语法**生成匹配逻辑。

可以通过 `RustRegex` 使用 Rust 风格正则：

```js
new RustRegex('(?i)[a-z_][a-z0-9_]*')
```

支持的特性包括：

* 字符类
* 字符范围
* 分组
* 量词
* 选择
* Unicode 转义
* Unicode 属性匹配

不支持如 lookahead / lookaround 等特性。([Tree-sitter][1])

---

## 顺序（Sequences）

```js
seq(rule1, rule2, ...)
```

匹配多个规则按顺序出现。

等价于 EBNF 中的顺序定义。([Tree-sitter][1])

---

## 选择（Alternatives）

```js
choice(rule1, rule2, ...)
```

匹配多个规则中的任意一个。

等价于 EBNF 中的 `|` 运算符。([Tree-sitter][1])

---

## 重复（Repetitions）

### 零次或多次

```js
repeat(rule)
```

### 一次或多次

```js
repeat1(rule)
```

用于匹配重复结构。([Tree-sitter][1])

---

## 可选（Optional）

```js
optional(rule)
```

匹配零次或一次出现。

等价于 EBNF `[x]`。([Tree-sitter][1])

---

## 优先级（Precedence）

```js
prec(number, rule)
```

为规则设置数值优先级，用于解决 LR(1) 冲突。

当多个规则产生歧义时：

> 优先匹配优先级更高的规则。

默认优先级为 `0`。([Tree-sitter][1])

---

### 词法优先级

```js
token(prec(1, 'foo'))
```

表示 token `foo` 具有词法优先级 1。

用于多个 token 能匹配相同文本时的选择问题。([Tree-sitter][1])

---

## 左结合（Left Associativity）

```js
prec.left([number], rule)
```

在优先级相同时：

> 优先匹配**更早结束**的规则。([Tree-sitter][1])

---

## 右结合（Right Associativity）

```js
prec.right([number], rule)
```

优先匹配**更晚结束**的规则。([Tree-sitter][1])

---

## 动态优先级（Dynamic Precedence）

```js
prec.dynamic(number, rule)
```

运行时应用优先级。

仅在真实语法歧义并结合 `conflicts` 使用时需要。([Tree-sitter][1])

---

## Token

```js
token(rule)
```

将复杂规则压缩为**单个 token**。

注意：

```
token($.foo) ❌
```

仅接受终结规则。([Tree-sitter][1])

---

## 即时 Token（Immediate Token）

```js
token.immediate(rule)
```

要求 token 前**不能存在空白字符**。([Tree-sitter][1])

---

## 别名（Alias）

```js
alias(rule, name)
```

改变语法树中的节点名称。

* `alias($.foo, $.bar)` → 生成具名节点 `bar`
* `alias($.foo, 'bar')` → 生成匿名节点([Tree-sitter][1])

---

## 字段名（Field Names）

```js
field(name, rule)
```

为子节点分配字段名称，使其在语法树中可按字段访问。([Tree-sitter][1])

---

## 保留关键字（Reserved）

```js
reserved(wordset, rule)
```

覆盖全局关键字集合。

用于上下文关键字场景（如 JavaScript 中某些关键字）。([Tree-sitter][1])

---

## Grammar 的可选配置字段

除 `name` 与 `rules` 外，还支持以下字段：

---

### extras

```js
extras: $ => [...]
```

定义可在任意位置出现的 token（通常为空白或注释）。

默认允许空白字符。([Tree-sitter][1])

---

### inline

```js
inline: $ => [...]
```

内联规则，不生成语法树节点。([Tree-sitter][1])

---

### conflicts

```js
conflicts: $ => [...]
```

声明预期存在的 LR(1) 冲突。

运行时使用 GLR 算法处理歧义。([Tree-sitter][1])

---

### externals

```js
externals: $ => [...]
```

声明由外部扫描器（C 代码）生成的 token。([Tree-sitter][1])

---

### precedences

定义命名优先级组，用于相对优先级控制。([Tree-sitter][1])

---

### word

指定用于关键字提取优化的 token。([Tree-sitter][1])

---

### supertypes

```js
supertypes: $ => [...]
```

定义超类型节点，用于将多个节点归类为抽象类别（如 expression）。([Tree-sitter][1])



# 参考资料

[1]: https://tree-sitter.github.io/tree-sitter/creating-parsers/2-the-grammar-dsl.html?utm_source=chatgpt.com "The Grammar DSL - Tree-sitter"


* any list
{:toc}