---
layout: post
title:  Idea Plugin Dev-10-03-Multiple Carets
date:  2017-10-13 10:24:52 +0800
categories: [Java]
tags: [java, idea, idea-plugin]
published: true
---

# Multiple Carets

大多数编辑器操作（键盘导航、文本插入和删除等）将独立应用于每个插入符号。 

每个插入符号都有自己的关联选择，它是文档字符的连续范围（可以为空）。 

在执行某些操作后，当两个或多个插入符最终出现在相同的视觉位置时，它们将合并为一个插入符，并将其关联的选择合并为一个。 

当多个插入符的选择重叠时，也会发生类似的事情：只有一个插入符会保留，并且选择会被合并。

有一个主插入符的概念——非多插入符感知操作和需要单点文档上下文（如代码完成）的操作将在其上运行。 

目前，最近的插入符被认为是主要的插入符。

# 核心功能

与多插入符实现相关的核心逻辑，例如访问当前存在的插入符、添加和删除插入符，可通过 CaretModel 获得。 有关文本选择，请参阅 SelectionModel。

CaretModel 和 SelectionModel 中查询和修改插入符和选择位置的方法默认在主插入符上工作。 但是，在 CaretModel.runForEachCaret() 方法的上下文中，它们对当前插入符进行操作。

SelectionModel.getBlockSelectionStarts() 方法

# 编辑器操作

## EditorAction 和 EditorActionHandler

调用 EditorActionHandler 时，将向其传递一个附加参数：它应在其上操作的插入符实例，如果在没有任何插入符上下文的情况下调用它，则为 null。 

如果处理程序调用另一个处理程序（同一 actionId 的委托处理程序或完全不相关的处理程序），该参数通常应原封不动地传递给委托（除非没有向处理程序提供上下文插入符号，但它需要调用另一个处理程序 一个特定的插入符）。 

当然，如果处理程序的功能与插入符/选择位置无关，则处理程序可以忽略插入符参数。

如果处理程序需要实现多插入符功能，它可以在重写的 doExecute 方法中显式地实现，但如果它只需要为每个插入符调用该方法，则只需将参数传递给 EditorActionHandler 构造函数，以便为每个插入符调用 doExecute 在没有特定插入符上下文的情况下调用处理程序时的插入符。

## 编辑器动作代表

编辑器行动代表，以下代表可用：

EnterHandlerDelegate

BackspaceHandlerDelegate

JoinLinesHandlerDelegate

EditorNavigationDelegate

SmartEnterProcessor

CommentCompleteHandler

StatementUpDownMover

CodeBlockProvider

# Typing Actions

TypedActionHandler, TypedHandlerDelegate

TypedActionHandler 和 TypedHandlerDelegate 实现只为每个键入的字符调用一次。

如果这些处理程序需要支持多个插入符，则它们将需要显式实现。

EditorModificationUtil。 typeInStringAtCaretHonorMultipleCarets() 方法可用于在这种情况下执行最常见的任务：将相同的文本插入所有插入符位置和/或将所有插入符相对于其当前位置移动。 

其用法示例：

TypedAction。

XmlGtTypedHandler。


# 代码洞察操作

从 CodeInsightAction 继承的现有操作将仅适用于主要插入符号。 

要支持多个插入符，应该改为继承 MultiCaretCodeInsightAction。 

每个插入符可能有不同的编辑器和 PSI 实例，因此无法使用旧的 API。

# 参考资料

https://plugins.jetbrains.com/docs/intellij/multiple-carets.html

* any list
{:toc}