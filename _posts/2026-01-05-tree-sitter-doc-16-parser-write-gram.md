---
layout: post
title: Tree-sitter 文档-16-parser 编写语法（Writing the Grammar）
date: 2026-01-05 21:01:55 +0800
categories: [AST]
tags: [ast, tree-sitter, sh]
published: true
---

# 编写语法（Writing the Grammar）

---

编写 Tree-sitter 语法需要一定的设计取舍。

对于任意一种语言，都存在无限多种上下文无关文法（CFG）可以描述它。

但要生成一个高质量的 Tree-sitter 解析器，语法必须满足两个关键特性：

1. **结构直观**
2. **尽量符合 LR(1) 文法特性**

Tree-sitter 生成的是**具体语法树（Concrete Syntax Tree）**，因此语法规则应尽量与语言中的真实结构一一对应，而不是简单照搬语言规范中的 CFG 定义。([Tree-sitter][1])

---

## 前期语法结构设计

通常应先参考目标语言的正式语法规范，但**不要直接翻译规范中的 CFG**。

更推荐的方式是：

先建立语言的核心结构骨架，例如：

* Declaration（声明）
* Definition（定义）
* Statement（语句）
* Expression（表达式）
* Type（类型）
* Pattern（模式）

示例结构：

```js
rules: {
  source_file: $ => repeat($._definition),

  _definition: $ => choice(
    $.function_definition
  ),

  function_definition: $ => seq(
    'func',
    $.identifier,
    $.parameter_list,
    $._type,
    $.block
  )
}
```

初始阶段的目标：

> 先覆盖主要语法类别，而不是精确复刻语言规范。 ([Tree-sitter][1])

随后可以逐步扩展子系统，例如先实现类型系统：

```js
_type: $ => choice(
  $.primitive_type,
  $.array_type,
  $.pointer_type
)
```

开发过程中建议持续使用：

```bash
tree-sitter parse
```

解析真实代码验证结果，并为每条规则添加测试。 ([Tree-sitter][1])

---

## 规则结构设计原则

如果直接按照语言规范建模，语法树通常会出现**过深嵌套**。

例如：

```js
return x + y;
```

语言规范可能包含十几层表达式中间规则（如 `LogicalORExpression`、`ShiftExpression` 等），导致语法树层级极深且难以分析。

Tree-sitter 推荐：

> 使用更扁平（flat）的表达式结构。

示例：

```js
expression: $ => choice(
  $.identifier,
  $.unary_expression,
  $.binary_expression
)
```

但这种写法会产生歧义，需要额外处理。 ([Tree-sitter][1])

---

## 使用优先级（Precedence）

表达式歧义示例：

```
-a * b
```

解析器无法判断：

* `(-a) * b`
* `-(a * b)`

可通过 `prec` 指定绑定强度：

```js
unary_expression: $ =>
  prec(2,
    choice(
      seq("-", $.expression),
      seq("!", $.expression)
    )
  )
```

优先级越高，绑定越紧。 ([Tree-sitter][1])

---

## 使用 conflicts（显式冲突）

某些语法本身存在合法歧义，例如：

```
[x, y]
```

可能表示：

* 数组字面量
* 解构模式

此时应显式声明冲突：

```js
conflicts: $ => [
  [$.array, $.array_pattern],
]
```

这允许 Tree-sitter 同时探索多种解析路径。 ([Tree-sitter][1])

---

## 隐藏规则（Hiding Rules）

以 `_` 开头的规则不会出现在语法树中：

```js
_expression
_type
```

适用于：

* 仅作结构包装
* 始终只有单子节点的规则

可显著减少语法树噪声。 ([Tree-sitter][1])

---

## 使用字段（Fields）

通过 `field` 为子节点命名：

```js
function_definition: $ =>
  seq(
    "func",
    field("name", $.identifier),
    field("parameters", $.parameter_list),
    field("return_type", $._type),
    field("body", $.block),
  )
```

优势：

* 按名称访问子节点
* 避免依赖位置索引

便于后续 Query 与代码分析。 ([Tree-sitter][1])

---

## Extras（可出现于任意位置的 Token）

用于定义：

* 空白
* 注释

```js
extras: $ => [
  /\s/,
  $.comment,
]
```

推荐将复杂 token 定义为规则再引用，而不是直接内联，否则会导致解析器体积显著增大。 ([Tree-sitter][1])

---

## Supertypes（超类型）

抽象类别规则（如 expression）通常只是多个规则的集合：

```js
expression: $ => choice(
  $.identifier,
  $.binary_expression
)
```

若不处理，会生成额外节点层级。

可加入：

```js
supertypes: $ => [
  $.expression
]
```

这样：

* 不生成可见节点
* 仍可在 Query 中使用

从而保持语法树简洁。 ([Tree-sitter][1])

---

## 词法分析（Lexing）

Tree-sitter 解析分为两阶段：

1. **Lexing（词法分析）**
2. **Parsing（语法分析）**

其词法分析具有两个关键特性：

### 1️⃣ 上下文感知词法分析

Lexer 只尝试匹配当前语法位置合法的 token。

---

### 2️⃣ 词法优先级

当多个 token 可匹配同一文本时：

```js
token(prec(N, rule))
```

用于决定 lexer 选择哪个 token。

多数难以解决的问题本质上属于：

> lexical precedence 问题。 ([Tree-sitter][1])

---

## 关键字处理（word token）

语言通常同时存在：

* keyword（如 `if`）
* identifier

通过指定：

```js
word: $ => $.identifier
```

Tree-sitter 会自动提取关键字集合，从而避免：

```
instanceofSomething
```

被错误拆分为：

```
instanceof + Something
```

同时还能提升解析性能。 ([Tree-sitter][1])

---

## 核心设计原则总结

Tree-sitter Grammar 的本质目标：

```
语言规范 CFG
        ↓（重构）
可分析的 Concrete Syntax Tree
        ↓
高效 LR(1) 解析
```

重点不是“正确翻译语言规范”，而是：

> **设计一个既易解析，又易分析的语法结构。**


# 参考资料


[1]: https://tree-sitter.github.io/tree-sitter/creating-parsers/3-writing-the-grammar.html?utm_source=chatgpt.com "Writing the Grammar - Tree-sitter"


* any list
{:toc}