---
layout: post
title: Tree-sitter 文档-10-谓词与指令（Predicates and Directives）
date: 2026-01-05 21:01:55 +0800
categories: [AST]
tags: [ast, tree-sitter, sh]
published: true
---

# 谓词与指令（Predicates and Directives）

---

查询中的**谓词（Predicates）**和**指令（Directives）**类似于过程式语言中的函数。

* **谓词**用于根据特定条件过滤匹配结果
* **指令**用于向查询执行环境传递操作指令（例如设置元数据）

Tree-sitter 核心库本身**并未内置具体的谓词或指令实现**。
相反，一些工具和编辑器约定并实现了一组通用谓词与指令。([Nova][1])

---

## 谓词语法

谓词写在模式内部，形式如下：

```text
(#predicate-name arguments...)
```

参数可以是：

* 捕获（capture）
* 字符串（string）

例如：

```text
(#eq? @attr "border:")
(#not-eq? @tag.name div)
```

其中：

* `@attr`、`@tag.name` 是捕获节点引用
* `"border:"` 或 `div` 是常量字符串
  （仅包含字母、数字、下划线、连字符或点的字符串可以省略引号）([Nova][1])

---

## 常见谓词

---

### `#eq?`

判断捕获节点的文本是否等于指定字符串。

```text
(
  (identifier) @name
  (#eq? @name "main")
)
```

仅匹配名称为 `main` 的 identifier。

---

### `#not-eq?`

判断捕获节点文本**不等于**指定字符串。

```text
(#not-eq? @name "test")
```

---

### `#match?`

使用正则表达式匹配捕获节点文本。

```text
(
  (identifier) @constant
  (#match? @constant "^[A-Z_]+$")
)
```

匹配全大写常量名称。

---

### `#not-match?`

正则表达式不匹配时成立。

```text
(#not-match? @name "^_")
```

匹配不以下划线开头的名称。

---

### `#any-of?`

当捕获文本属于给定集合之一时匹配。

```text
(
  (identifier) @keyword
  (#any-of? @keyword "if" "for" "while")
)
```

---

## 多捕获比较

谓词也可以比较两个捕获节点：

```text
(
  (pair
    key: (property_identifier) @key
    value: (identifier) @value)
  (#eq? @key @value)
)
```

仅当 key 与 value 文本相同时匹配。

---

## 指令（Directives）

指令与谓词语法类似，但用于**修改匹配结果的元信息**或影响后续处理。

语法形式：

```text
(#directive-name! arguments...)
```

注意：

* 指令名称以 `!` 结尾
* 不用于过滤匹配，而是执行操作

---

### 示例：`#set!`

为捕获节点设置元数据属性：

```text
(
  (identifier) @variable
  (#set! highlight "variable.special")
)
```

该指令可被编辑器或工具读取，用于语法高亮等用途。

---

### 示例：`#offset!`

用于调整捕获范围（常见于编辑器实现中）：

```text
(#offset! @capture 0 1 0 -1)
```

具体行为取决于宿主工具实现。

---

## 关键点总结

1. 查询模式负责**结构匹配**
2. 捕获负责**命名节点**
3. 谓词负责**条件过滤**
4. 指令负责**附加行为或元数据**

即：

```
Pattern → Capture → Predicate → Directive
```

形成 Tree-sitter Query 的完整匹配流程。


# 参考资料

[1]: https://docs.nova.app/syntax-reference/tree-sitter/?utm_source=chatgpt.com "Tree-sitter - Nova"

* any list
{:toc}