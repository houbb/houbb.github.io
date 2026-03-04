---
layout: post
title: Tree-sitter 文档-08-查询语法
date: 2026-01-05 21:01:55 +0800
categories: [AST]
tags: [ast, tree-sitter, sh]
published: true
---

# 查询语法

一个查询由一个或多个模式组成，其中每个模式都是一个 S 表达式，用于匹配语法树中的一组节点。

用于匹配某个节点的表达式由一对括号构成，其中包含两部分内容：节点类型，以及（可选的）一系列用于匹配该节点子节点的其他 S 表达式。

例如，以下模式将匹配任意一个 `binary_expression` 节点，并且其两个子节点均为 `number_literal` 节点：

```
(binary_expression (number_literal) (number_literal))
```

子节点也可以被省略。

例如，以下模式将匹配任意一个至少包含一个 `string_literal` 子节点的 `binary_expression`：

```
(binary_expression (string_literal))
```

---

## 字段（Fields）

通常，通过指定子节点关联的字段名称，可以使模式更加精确。实现方式是在子模式前添加字段名，并以冒号分隔。

例如，以下模式将匹配一个 `assignment_expression` 节点，其中 `left` 子节点是一个 `member_expression`，并且其 `object` 是一个 `call_expression`：

```
(assignment_expression
  left: (member_expression
    object: (call_expression)))
```

---

## 否定字段（Negated Fields）

你也可以限制模式，使其仅匹配**不包含某个字段**的节点。
实现方式是在父模式中添加以 `!` 前缀标记的字段名。

例如，以下模式将匹配**没有类型参数**的类声明：

```
(class_declaration
  name: (identifier) @class_name
  !type_parameters)
```

---

## 匿名节点（Anonymous Nodes）

使用括号的节点写法仅适用于**具名节点**。
若要匹配特定的匿名节点，需要将其名称写在双引号中。

例如，以下模式将匹配操作符为 `!=` 且右侧为 `null` 的 `binary_expression`：

```
(binary_expression
  operator: "!="
  right: (null))
```

---

## 特殊节点（Special Nodes）

### 通配符节点（Wildcard Node）

通配符节点使用下划线 `_` 表示，可匹配任意节点，类似正则表达式中的 `.`。

存在两种形式：

* `(_)` —— 匹配任意**具名节点**
* `_` —— 匹配任意**具名或匿名节点**

例如，以下模式将匹配调用表达式中的任意节点：

```
(call (_) @call.inner)
```

---

### `ERROR` 节点

当解析器遇到无法识别的文本时，会在语法树中生成 `(ERROR)` 节点。这些节点可以像普通节点一样被查询：

```
(ERROR) @error-node
```

---

### `MISSING` 节点

当解析器通过插入缺失 token 来从错误中恢复时，如果该方式具有最低错误代价，则会在最终语法树中插入缺失节点。

这些缺失节点在树中看起来像普通节点，但其宽度为零，并且在内部作为终结节点的属性存在，而不像 `ERROR` 那样是独立节点。

可以使用 `(MISSING)` 进行查询：

```
(MISSING) @missing-node
```

这在检测语法错误时非常有用，因为 `(ERROR)` 查询不会捕获这些节点。

也可以查询特定类型的缺失节点：

```
(MISSING identifier) @missing-identifier
(MISSING ";") @missing-semicolon
```

---

### 超类型节点（Supertype Nodes）

某些语法中的节点类型被标记为**超类型（supertype）**。
超类型表示包含多个子类型的节点类别。

例如，在 JavaScript 语法中，`expression` 是一个超类型，它可以表示 `binary_expression`、`call_expression` 或 `identifier` 等多种表达式。

在查询中可以直接使用超类型，而无需枚举所有子类型：

```
(expression) @any-expression
```

即使该节点在语法树中不可见，也可以被匹配。

若要匹配超类型下的特定子类型，可以使用：

```
supertype/subtype
```

例如：

```
(expression/binary_expression) @binary-expression
```

该模式仅在 `binary_expression` 是 `expression` 子类型时匹配。

此规则同样适用于匿名节点，例如：

```
(expression/"()") @empty-expression
```



# 参考资料

([tree-sitter.github.io][1])

[1]: https://tree-sitter.github.io/tree-sitter/using-parsers/queries/1-syntax.html?utm_source=chatgpt.com "Basic Syntax - Tree-sitter"



* any list
{:toc}