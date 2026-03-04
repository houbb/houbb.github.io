---
layout: post
title: Tree-sitter 文档-12-静态节点类型（Static Node Types）
date: 2026-01-05 21:01:55 +0800
categories: [AST]
tags: [ast, tree-sitter, sh]
published: true
---

# 静态节点类型（Static Node Types）

---

在具有**静态类型**的编程语言中，让语法树提供关于各个语法节点的具体类型信息通常是非常有用的。
Tree-sitter 通过一个自动生成的文件 **`node-types.json`** 提供这些信息。

该文件包含语法中**所有可能的语法节点类型的结构化数据**。
你可以利用这些数据在静态类型语言中生成类型声明。 ([tree-sitter.github.io][1])

---

## 基本信息（Basic Info）

`node-types.json` 文件是一个对象数组，其中每个对象描述一种语法节点类型。

每个对象都包含以下两个字段：

* `"type"` —— 表示节点对应的语法规则名称
* `"named"` —— 布尔值，表示该节点是否对应语法规则名称，而不是字符串字面量

示例：

```json
{
  "type": "string_literal",
  "named": true
}
{
  "type": "+",
  "named": false
}
```

`"type"` 与 `"named"` 两个字段共同构成节点类型的唯一标识；
在 `node-types.json` 中，不会存在这两个字段值完全相同的两个节点定义。 ([tree-sitter.github.io][1])

---

## 内部节点（Internal Nodes）

许多语法节点可以包含子节点。
节点类型对象通过以下字段描述其可能的子节点：

* `"fields"` —— 描述节点可能包含的字段子节点
* `"children"` —— 描述所有未通过字段命名的具名子节点

---

### 子节点类型对象

子节点集合通过如下结构描述：

* `"required"` —— 是否至少必须存在一个该类型节点
* `"multiple"` —— 是否允许多个节点
* `"types"` —— 可能出现的节点类型列表

每个类型对象包含：

```json
{
  "type": "...",
  "named": true | false
}
```

---

### 示例：包含 fields 的节点

```json
{
  "type": "method_definition",
  "named": true,
  "fields": {
    "body": {
      "multiple": false,
      "required": true,
      "types": [
        { "type": "statement_block", "named": true }
      ]
    },
    "decorator": {
      "multiple": true,
      "required": false,
      "types": [
        { "type": "decorator", "named": true }
      ]
    }
  }
}
```

---

### 示例：使用 children 的节点

```json
{
  "type": "array",
  "named": true,
  "fields": {},
  "children": {
    "multiple": true,
    "required": false,
    "types": [
      { "type": "_expression", "named": true },
      { "type": "spread_element", "named": true }
    ]
  }
}
```

---

## 超类型节点（Supertype Nodes）

在 Tree-sitter 语法中，通常存在一些表示**抽象语法类别**的规则，例如：

* `expression`
* `type`
* `declaration`

这些规则通常在 `grammar.js` 中作为隐藏规则定义，并由多个符号组成的 `choice` 表达式构成。

默认情况下，这些隐藏规则不会出现在 `node-types.json` 中，因为它们不会直接出现在语法树里。

但如果将某个隐藏规则加入 grammar 的 `supertypes` 列表，它就会出现在节点类型文件中，并包含一个特殊字段：

* `"subtypes"` —— 表示该超类型可包含的子类型列表

示例：

```json
{
  "type": "_declaration",
  "named": true,
  "subtypes": [
    { "type": "class_declaration", "named": true },
    { "type": "function_declaration", "named": true },
    { "type": "variable_declaration", "named": true }
  ]
}
```

---

超类型节点也会在其他节点定义中作为子节点出现，从而用一个超类型替代多个具体子类型，使节点定义更加简洁易读。 

# 参考资料

 ([tree-sitter.github.io][1])

[1]: https://tree-sitter.github.io/tree-sitter/using-parsers/6-static-node-types?utm_source=chatgpt.com "Static Node Types - Tree-sitter"

* any list
{:toc}