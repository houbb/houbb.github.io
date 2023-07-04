---
layout: post
title:  Idea Plugin Dev-15-01-PsiMethod 中进一步学习
date:  2017-10-13 10:24:52 +0800
categories: [Java]
tags: [java, idea, idea-plugin]
published: true
---

# 详细介绍一下 PsiCodeBlock

`PsiCodeBlock` 是 IDEA 插件开发中的一个接口，表示 Java 代码中的代码块，即由大括号 `{}` 包围的一组语句。

它是 `PsiElement` 接口的子接口之一，用于表示方法、构造函数、初始化块等中的代码块。

`PsiCodeBlock` 接口提供了许多方法来访问和处理代码块中的语句和元素。以下是一些常用的方法：

- `PsiCodeBlock.getLBrace()` 和 `PsiCodeBlock.getRBrace()`：
  - `getLBrace()` 方法返回代码块的左大括号（`{`）对应的 `PsiJavaToken` 对象。
  - `getRBrace()` 方法返回代码块的右大括号（`}`）对应的 `PsiJavaToken` 对象。

- `PsiCodeBlock.getStatements()`：
  - `getStatements()` 方法返回代码块中的语句列表，以 `PsiStatement` 数组的形式表示。
  - 可以使用此方法遍历代码块中的每个语句，并对它们进行进一步处理。

- `PsiCodeBlock.add()` 和 `PsiCodeBlock.addAfter()`：
  - 这些方法用于向代码块中添加新的语句或元素。
  - 例如，你可以使用 `add()` 方法将一个新的语句添加到代码块的末尾，或使用 `addAfter()` 方法在指定的语句之后插入一个新的语句。

- `PsiCodeBlock.delete()`：
  - `delete()` 方法用于删除代码块中的语句或元素。
  - 你可以使用此方法删除不需要的语句或进行代码重构。

- `PsiCodeBlock.replace()`：
  - `replace()` 方法用于替换代码块中的语句或元素。
  - 你可以使用此方法将一个语句替换为另一个语句，或者替换为其他类型的元素。

通过使用 `PsiCodeBlock` 接口提供的方法，你可以在 IDEA 插件中对代码块进行操作和处理。这使你能够分析、修改和生成代码，以满足你的需求，例如插入新的语句、删除无用的代码、进行代码重构等。


# 详细介绍一下 PsiStatement

`PsiStatement` 是 IDEA 插件开发中的一个接口，表示 Java 代码中的语句。它是 `PsiElement` 接口的子接口之一，用于表示代码中的各种语句，例如赋值语句、条件语句、循环语句等。

`PsiStatement` 接口提供了一些常用的方法来访问和处理语句的内容和属性。以下是一些常见的方法：

- `PsiStatement.getText()`：
  - `getText()` 方法返回语句的文本表示形式，即代码中的实际文本。
  - 通过此方法，你可以获取语句的源代码。

- `PsiStatement.getParent()`：
  - `getParent()` 方法返回包含该语句的父元素，通常是 `PsiCodeBlock`。
  - 通过此方法，你可以访问包含当前语句的代码块。

- `PsiStatement.replace()`：
  - `replace()` 方法用于替换当前语句。
  - 你可以使用此方法将当前语句替换为另一个语句，或者替换为其他类型的元素。

- `PsiStatement.delete()`：
  - `delete()` 方法用于删除当前语句。
  - 你可以使用此方法删除不需要的语句。

通过使用 `PsiStatement` 接口提供的方法，你可以在 IDEA 插件中对语句进行操作和处理。

这使你能够分析、修改和生成代码，以满足你的需求，例如修改语句、删除无用的代码、进行代码重构等。

需要注意的是，`PsiStatement` 是一个抽象接口，具体的语句类型会实现该接口，例如 `PsiExpressionStatement` 表示表达式语句，`PsiIfStatement` 表示条件语句，`PsiWhileStatement` 表示循环语句等。根据实际的语句类型，你可能需要转换为相应的具体类型以访问特定的属性和方法。



# 参考资料

https://plugins.jetbrains.com/docs/intellij/psi.html

* any list
{:toc}