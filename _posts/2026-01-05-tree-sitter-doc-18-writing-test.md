---
layout: post
title: Tree-sitter 文档-18-编写测试（Writing Tests）
date: 2026-01-05 21:01:55 +0800
categories: [AST]
tags: [ast, tree-sitter, sh]
published: true
---

# 编写测试（Writing Tests）

对于你在 grammar 中添加的每一条规则，都应首先创建一个测试，用于描述在解析该规则时语法树应当呈现的结构。

这些测试使用**特定格式的文本文件**编写，并存放在解析器根目录下的：

```
test/corpus/
```

目录中。

例如，你可以创建一个名为：

```
test/corpus/statements.txt
```

的文件，其内容包含如下测试条目：

```
==================
Return statements
==================

func x() int {
  return 1;
}

---

(source_file
  (function_definition
    (identifier)
    (parameter_list)
    (primitive_type)
    (block
      (return_statement (number)))))
```

---

## 测试文件格式

* 每个测试的名称写在两行仅包含 `=` 字符的分隔线之间。
* 接下来写入输入的源代码。
* 然后是一行包含三个或更多 `-` 字符的分隔线。
* 最后写入**期望输出的语法树**，格式为 **S-expression**。

S-expression 中空白字符的具体位置并不重要，但建议保持语法树具有良好的可读性。

---

## 提示

S-expression **不会显示**如下语法节点：

* `func`
* `(`
* `;`

这些内容在 grammar 中以字符串或正则表达式表示。

测试输出中只显示**命名节点（named nodes）**。

---

## 在测试中包含字段名

期望输出部分也可以显示子节点关联的字段名。

若要包含字段名，需要在节点前添加：

```
字段名:
```

示例：

```
(source_file
  (function_definition
    name: (identifier)
    parameters: (parameter_list)
    result: (primitive_type)
    body: (block
      (return_statement (number)))))
```

---

## 解决分隔符冲突

如果你的语言语法本身与测试分隔符 `===` 或 `---` 冲突，可以添加一个任意但一致的后缀进行区分，例如：

```
==================|||
Basic module
==================|||

---- MODULE Test ----
increment(n) == n + 1
====

---|||

(source_file
  (module (identifier)
    (operator (identifier)
      (parameter_list (identifier))
      (plus (identifier_ref) (number)))))
```

---

## 测试的重要性

这些测试非常重要：

* 它们充当了解析器的 **API 文档**
* 在修改 grammar 后可用于验证解析结果是否仍然正确

默认情况下：

```
tree-sitter test
```

命令会运行 `test/corpus/` 目录中的全部测试。

若只运行指定测试：

```
tree-sitter test -i 'Return statements'
```

---

## 测试编写建议

建议尽可能全面地添加测试。

原则：

* 只要是可见节点，就应添加测试
* 应测试语言结构的各种排列组合

这样不仅能提高测试覆盖率，还能帮助读者理解语言结构的边界情况。

---

# Attributes（属性）

测试可以添加若干 **属性（attributes）**。

属性必须：

* 写在测试头部
* 位于测试名称下方
* 以 `:` 开头

部分属性需要参数，参数使用括号表示。

---

## 提示

若需要提供多个参数（例如多个平台或语言），可以重复同一属性多次。

---

## 可用属性

### `:cst`

指定期望输出为 **CST（Concrete Syntax Tree）** 格式，而不是默认的 S-expression。

该格式与：

```
parse --cst
```

输出一致。

---

### `:error`

断言解析结果中包含错误节点。

用于验证输入非法的情况。

使用该属性时，应省略 `---` 之后的语法树内容。

---

### `:fail-fast`

当该测试失败时，立即停止后续测试执行。

---

### `:language(LANG)`

指定使用某个语言解析器运行测试。

适用于多解析器仓库，例如：

* XML / DTD
* Typescript / TSX

默认使用：

```
tree-sitter.json
```

中 `grammars` 字段的第一个解析器。

---

### `:platform(PLATFORM)`

指定测试运行的平台。

用于测试平台相关行为（例如 Windows 与 Unix 的换行差异）。

该值必须与 Rust 常量：

```
std::env::consts::OS
```

一致。

---

### `:skip`

在执行 `tree-sitter test` 时跳过该测试。

适用于临时禁用测试而不删除测试内容。

---

## 属性示例

```
=========================
Test that will be skipped
:skip
=========================

int main() {}

-------------------------
```

```
====================================
Test that will run on Linux or macOS
:platform(linux)
:platform(macos)
====================================

int main() {}

------------------------------------
```

```
========================================================================
Test that expects an error, and will fail fast if there's no parse error
:fail-fast
:error
========================================================================

int main ( {}

------------------------------------------------------------------------
```

```
=================================================
Test that will parse with both Typescript and TSX
:language(typescript)
:language(tsx)
=================================================

console.log('Hello, world!');

-------------------------------------------------
```

---

## 自动编译（Automatic Compilation）

你可能会注意到，在重新生成 parser 后第一次运行：

```
tree-sitter test
```

会花费额外时间。

原因是：

Tree-sitter 会自动将 C 代码编译为**可动态加载的库**。

当出现以下情况时，解析器会自动重新编译：

* 重新执行 `tree-sitter generate`
* 修改外部扫描器文件（external scanner）


# 参考资料

[1]: https://tree-sitter.github.io/tree-sitter/creating-parsers/5-writing-tests.html?utm_source=chatgpt.com "Writing Tests - Tree-sitter"


* any list
{:toc}