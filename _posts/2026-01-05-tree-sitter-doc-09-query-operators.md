---
layout: post
title: Tree-sitter 文档-09-运算符（Operators）
date: 2026-01-05 21:01:55 +0800
categories: [AST]
tags: [ast, tree-sitter, sh]
published: true
---

# 运算符（Operators）

---

## 捕获节点（Capturing Nodes）

在匹配模式时，你可能希望处理模式中的特定节点。
**捕获（Capture）** 允许你为模式中的特定节点关联名称，从而在后续处理中通过该名称引用这些节点。

捕获名称写在所引用节点之后，并以 `@` 字符开头。

例如，以下模式将匹配把一个 `function` 赋值给某个 `identifier` 的语句，并将该标识符命名为 `the-function-name`：

```text
(assignment_expression
  left: (identifier) @the-function-name
  right: (function))
```

以下模式将匹配所有方法定义，并分别捕获：

* 方法名 → `@the-method-name`
* 所属类名 → `@the-class-name`

```text
(class_declaration
  name: (identifier) @the-class-name
  body: (class_body
    (method_definition
      name: (property_identifier) @the-method-name)))
```

---

## 数量运算符（Quantification Operators）

可以使用后缀重复运算符来匹配重复出现的兄弟节点，其行为类似正则表达式：

* `+` ：匹配 **一个或多个**
* `*` ：匹配 **零个或多个**

例如，以下模式匹配一个或多个注释节点：

```text
(comment)+
```

以下模式匹配类声明，并捕获所有（如果存在）装饰器：

```text
(class_declaration
  (decorator)* @the-decorator
  name: (identifier) @the-name)
```

---

### 可选运算符

使用 `?` 可将节点标记为可选。

例如，以下模式匹配所有函数调用，并在存在字符串参数时进行捕获：

```text
(call_expression
  function: (identifier) @the-function
  arguments: (arguments (string)? @the-string-arg))
```

---

## 兄弟节点分组（Grouping Sibling Nodes）

可以使用括号对一组兄弟节点进行分组。

例如，以下模式匹配：

> 一个注释后紧跟一个函数声明

```text
(
  (comment)
  (function_declaration)
)
```

数量运算符（`+`、`*`、`?`）同样可以作用于分组。

例如，以下模式匹配逗号分隔的一系列数字：

```text
(
  (number)
  ("," (number))*
)
```

---

## 备选匹配（Alternations）

备选模式使用方括号 `[]` 表示，其中包含多个可选模式，类似正则表达式中的字符集合。

例如，以下模式匹配函数调用：

* 若为变量调用 → 捕获为 `@function`
* 若为对象方法调用 → 捕获为 `@method`

```text
(call_expression
  function: [
    (identifier) @function
    (member_expression
      property: (property_identifier) @method)
  ])
```

以下模式匹配多个关键字 token，并统一捕获为 `@keyword`：

```text
[
  "break"
  "delete"
  "else"
  "for"
  "function"
  "if"
  "return"
  "try"
  "while"
] @keyword
```

---

## 锚点运算符（Anchors）

锚点运算符 `.` 用于限制子模式的匹配方式，其行为取决于所在位置。

---

### 1️⃣ 位于第一个子节点之前

表示该子节点必须是父节点中的**第一个具名子节点**。

```text
(array . (identifier) @the-element)
```

该模式只匹配数组中的第一个 `identifier`。

若没有该锚点，则每个 identifier 都会被匹配。 ([Tree-sitter][1])

---

### 2️⃣ 位于最后一个子节点之后

表示该子节点必须是父节点中的**最后一个具名子节点**。

```text
(block (_) @last-expression .)
```

该模式仅匹配 block 中最后的节点。 ([Tree-sitter][1])

---

### 3️⃣ 位于两个子节点之间

表示两个模式必须是**相邻兄弟节点**。

例如，对于 `a.b.c.d`：

```text
(dotted_name
  (identifier) @prev-id
  .
  (identifier) @next-id)
```

只会匹配连续对：

```
a,b
b,c
c,d
```

不会匹配：

```
a,c
b,d
```

---

锚点施加的限制会**忽略匿名节点**。 

# 参考资料

([Tree-sitter][1])

[1]: https://tree-sitter.github.io/tree-sitter/using-parsers/queries/2-operators.html?utm_source=chatgpt.com "Operators - Tree-sitter"


* any list
{:toc}