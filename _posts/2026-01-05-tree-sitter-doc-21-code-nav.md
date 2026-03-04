---
layout: post
title: Tree-sitter 文档-21-代码导航系统（Code Navigation Systems）
date: 2026-01-05 21:01:55 +0800
categories: [AST]
tags: [ast, tree-sitter, sh]
published: true
---


# 代码导航系统（Code Navigation Systems）

Tree-sitter 可以结合其查询语言（query language）用于构建代码导航系统。

此类系统的一个示例是：

```
tree-sitter tags
```

命令，该命令会输出指定文件中**重要语法节点的文本列表**。

GitHub 的基于搜索的代码导航功能就是一个典型应用。

本文档用于说明：

* 如何与此类系统集成
* 如何将该功能扩展到任何具有 Tree-sitter grammar 的语言 ([tree-sitter.github.io][1])

---

## Tagging 与 Capture

**Tagging（标记）** 指的是：

> 识别程序中可以被命名的实体。

这些实体通过 **Tree-sitter 查询（queries）** 来查找。

找到实体后，需要使用 **syntax capture** 对其进行标记。

一个 tag 的核心由两部分组成：

1. **实体角色（role）**

   * 表示该实体的语义角色
   * 例如：定义（definition）或引用（reference）

2. **实体类型（kind）**

   * 描述实体用途
   * 例如：

     * 类定义
     * 函数调用
     * 变量引用

---

### Capture 命名约定

推荐使用如下格式：

```
@role.kind
```

并额外包含一个内部 capture：

```
@name
```

用于提取标识符名称。

---

### 文档字符串（Docstring）

可以选择添加：

```
@doc
```

capture，用于绑定文档注释。

Tag 系统提供两个内建函数：

#### `#strip!`

用于移除注释语法。

参数：

```
(#strip! capture regex)
```

匹配正则表达式的文本将被删除。

---

#### `#select-adjacent!`

```
(#select-adjacent! capture_a capture_b)
```

仅保留与第二个 capture 相邻的文本。

该功能常用于避免匹配过多注释内容。 ([tree-sitter.github.io][1])

---

## 示例

---

### 示例 1：Python 函数定义

以下查询识别 Python 函数定义并捕获函数名：

```
(function_definition
  name: (identifier) @name) @definition.function
```

其中：

* `function_definition` 为 Python grammar 中定义的语法节点。

---

### 示例 2：JavaScript 函数定义

```
(assignment_expression
  left: [
    (identifier) @name
    (member_expression
      property: (property_identifier) @name)
  ]
  right: [(arrow_function) (function)]
) @definition.function
```

---

### 示例 3：Ruby 类定义（包含 docstring）

```
(
  (comment)* @doc
  .
  [
    (class
      name: [
        (constant) @name
        (scope_resolution name: (_) @name)
      ]) @definition.class
    (singleton_class
      value: [
        (constant) @name
        (scope_resolution name: (_) @name)
      ]) @definition.class
  ]
  (#strip! @doc "^#\\s*")
  (#select-adjacent! @doc @definition.class)
)
```

该查询：

* 提取类定义
* 清理 Ruby 注释符 `#`
* 仅绑定邻接的文档注释 ([tree-sitter.github.io][1])

---

## 标准 Tag 词汇表

| 分类        | Tag                         |
| --------- | --------------------------- |
| 类定义       | `@definition.class`         |
| 函数定义      | `@definition.function`      |
| 接口定义      | `@definition.interface`     |
| 方法定义      | `@definition.method`        |
| 模块定义      | `@definition.module`        |
| 函数 / 方法调用 | `@reference.call`           |
| 类引用       | `@reference.class`          |
| 接口实现      | `@reference.implementation` |

应用程序可以扩展该集合，但建议遵循上述命名规范。 ([tree-sitter.github.io][1])

---

## 命令行使用

可以使用：

```
tree-sitter tags <file>
```

测试 tags 查询文件。

示例代码：

```
module Foo
  class Bar
    # won't be included

    # is adjacent, will be
    def baz
    end
  end
end
```

执行：

```
tree-sitter tags test.rb
```

输出：

```
test.rb
    Foo | module def (0,7)-(0,10) `module Foo`
    Bar | class  def (1,8)-(1,11) `class Bar`
    baz | method def (2,8)-(2,11) `def baz` "is adjacent, will be"
```

输出内容包括：

* 名称
* 角色
* 位置
* 首行代码
* 文档字符串 ([tree-sitter.github.io][1])

---

## Tags 查询文件位置

对于某语言，其 tag 查询通常位于：

```
queries/tags.scm
```

---

## 单元测试（Unit Testing）

Tags 查询可以通过：

```
tree-sitter test
```

进行测试。

测试文件放置于：

```
test/tags/
```

测试方式与 syntax highlighting 相同，使用注释断言：

```
module Foo
  #     ^ definition.module
  class Bar
    #    ^ definition.class

    def baz
      #  ^ definition.method
    end
  end
end
```

用于验证节点是否被正确标记。 ([tree-sitter.github.io][1])

---

（翻译完毕）



# 参考资料

[1]: https://tree-sitter.github.io/tree-sitter/4-code-navigation.html?utm_source=chatgpt.com "Code Navigation - Tree-sitter"



* any list
{:toc}