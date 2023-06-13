---
layout: post
title:  Idea Plugin Dev-10-02-文本选择
date:  2017-10-13 10:24:52 +0800
categories: [Java]
tags: [java, idea, idea-plugin]
published: true
---

# 扩展/缩小文本选择

实施 ExtendWordSelectionHandler 并将其注册为 com.intellij.extendWordSelectionHandler EP 在您的 plugin.xml 中允许您提供额外的文本范围以在扩展或缩小选择时使用。 

对于要为其提供额外文本范围的 PSI 元素，从 canSelect(PsiElement) 返回 true。 

IntelliJ 平台将为这些元素调用 select(PsiElement, CharSequence, int, Editor)，您可以在其中计算额外的文本范围并将它们作为 `List<TextRange>` 返回。

# 概述

IntelliJ 平台 IDE 中的扩展选择和收缩选择这两个操作可让您根据源代码的结构调整所选文本。 

这使得不仅可以轻松选择表达式、块和函数定义，还可以轻松选择 JavaDoc 注释中的整行或标记等代码。

在实现自定义语言时，IntelliJ 平台提供了此 EP 的基本实现，允许您根据 PSI 结构选择代码并选择整行。 

在许多情况下，这足以提供良好的用户体验。 但是，有时提供用户可能希望在扩展或缩小选择时能够选择的附加区域是有利的。

这个EP有两个方法需要实现：

- canSelect(PsiElement) 在每个 PSI 元素上调用，从光标处的元素开始，向上遍历其每个父元素。 为特定元素返回 true 以指示应该为 PSI 元素包含更多文本范围。

- select(PsiElement, CharSequence, int, Editor) 返回计算并返回感兴趣的 PSI 元素内的文本范围。

# 示例用例

自定义语言开发人员的一个可能用例是函数调用 f(a, b)，其中函数调用节点将其两个参数作为子节点。 

如果光标位于参数 a 处，则扩展选择将首先选择参数 a 本身，然后在下一步中增长以覆盖整个函数调用。 

但是，您可能希望选择所有参数的列表作为中间步骤。 

这可以通过以下方式实施本 EP 来实现：

创建一个实现 ExtendWordSelectionHandler 接口的类，并将其注册为 plugin.xml 中的 com.intellij.extendWordSelectionHandler EP。

canSelect(PsiElement) 方法应该为函数调用节点返回 true。 这表示将为函数调用节点调用 select(PsiElement, CharSequence, int, Editor)。

当调用 select() 方法时，您可以使用函数调用 PSI 元素或编辑器文本来提取跨越参数 a 和 b 的文本范围，并将其作为包含一个元素的 `List<TextRange>` 返回。

# 进一步的洞察和调试

查看其他实现可能是更好地了解此 EP 工作原理的有效方法。 要进一步了解此 EP，您可能需要查看 DocTagSelectioner。 它提供了在 JavaDoc 注释中选择诸如 @param 之类的标记名称的能力。 此外，IntelliJ Platform Explorer 提供了一个开源插件列表，其中包含 com.intellij.extendWordSelectionHandler EP 的实现。

IntelliJ Platform 中也有一些重要的地方可以在调试时加断点。 当用户调用 Extend Selection 时，它由 SelectWordHandler 处理。 然而，大部分工作随后在 SelectWordUtil 内部完成，其中 processElement() 检查此 EP 的哪些实现适用于当前 PSI 元素。 如果其中之一从其 canSelect() 方法返回 true，则会在 askSelectioner() 函数中提取其他文本范围。 这些地方很适合在调试期间设置断点和进行调查。


# 参考资料

https://plugins.jetbrains.com/docs/intellij/text-selection.html#further-insight-and-debugging

* any list
{:toc}