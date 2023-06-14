---
layout: post
title:  Idea Plugin Dev-15-05-Element Patterns
date:  2017-10-13 10:24:52 +0800
categories: [Java]
tags: [java, idea, idea-plugin]
published: true
---

# Element Patterns

元素模式提供了一种通用的方式来指定对象的条件。

插件作者使用它们来检查 PSI 元素是否匹配特定结构。 

正如字符串的正则表达式测试（子）字符串是否与特定模式匹配一样，元素模式用于对 PSI 元素的嵌套结构设置条件。 

它们在 IntelliJ 平台中的两个主要应用程序是：

指定在为自定义语言实现完成贡献者时应在何处进行自动完成。

指定通过 PSI 参考贡献者提供进一步参考的 PSI 元素。

然而，插件作者很少直接实现 ElementPattern 接口。

相反，我们建议使用 IntelliJ 平台提供的高级模式类：

| Class | Main Contents |  Notable Examples |
|:----|:----|:----|
| StandardPatterns | 字符串和字符模式的工厂（见下文）； 与、或、非等逻辑运算 | LogbackReferenceContributor, RegExpCompletionContributor |
| PlatformPatterns | Factory for PSI-, IElement-, and VirtualFile-patterns | FxmlReferencesContributor, PyDataclassCompletionContributor |
| PsiElementPattern | Patterns for PSI; Checks for children, parents, or neighboring leaves | XmlCompletionContributor |
| CollectionPattern | Filter and check pattern collections; Mainly used to provide functionality for other high-level pattern classes | PsiElementPattern |
| TreeElementPattern | Patterns specifically for checking (PSI) tree structure |  PyMetaClassCompletionContributor |
| StringPattern | Check if strings match, have a certain length, have a specific beginning or ending, or are one of a collection of strings | AbstractGradleCompletionContributor |
| CharPattern | Check if characters are whitespace, digits, or Java identifier parts | CompletionUtil |

IntelliJ 平台中的一些内置语言实现了它们自己的模式类，并且可以提供额外的示例：

XmlPatterns 为 XML 属性、值、实体和文本提供模式。

PythonPatterns 为 Python 的文字、字符串、参数和函数/方法参数提供模式。

DomPatterns 建立在 XmlPatterns 的基础上，并作为包装器为 DOM-API 提供更多模式。

## 例子

元素模式的一个很好的起点是自定义语言支持教程。 它们用于本教程的完成和参考贡献者部分。 

但是，IntelliJ 平台源代码为内置语言（如 JSON、XML、Groovy、Markdown 等）提供了更多元素模式示例。 

检查上表中的参考资料或搜索高级模式类的用法将提供一个综合列表，显示如何在生产代码中使用元素模式。

例如，可以在 JavaFX 插件 FxmlReferencesContributor 中找到一个示例，该示例测试给定的 PSI 元素是否是 *.fxml 文件中的 XML 属性值。

```java
XmlAttributeValuePattern attributeValueInFxml =
  XmlPatterns.xmlAttributeValue().inVirtualFile(
    virtualFile().withExtension(JavaFxFileTypeFactory.FXML_EXTENSION));
```

如上面的代码所示，可以堆叠和组合元素模式以创建更复杂的条件。 

JsonCompletionContributor 包含另一个对 PSI 元素有更多要求的示例。

```java
PsiElementPattern.Capture<PsiElement> AFTER_COMMA_OR_BRACKET_IN_ARRAY =
  psiElement().
  afterLeaf("[", ",").
  withSuperParent(2, JsonArray.class).
  andNot(
    psiElement().
    withParent(JsonStringLiteral.class)
  );
```

上述模式确保 PSI 元素：

出现在左括号或逗号之后，通过对相邻叶元素施加限制来表示。

将 JsonArray 作为二级父级，这表明 PSI 元素必须位于 JSON 数组内。

没有 JsonStringLiteral 作为父级，这可以防止数组中带有方括号或逗号的字符串给出误报匹配的情况。

最后一个例子表明，即使对于简单的模式，也需要仔细考虑极端情况。

# 工具和调试

使用元素模式可能很棘手，插件作者需要对底层 PSI 结构有深入的了解才能正确使用。 

因此，建议使用 PsiViewer 插件或内置 PSI 查看器并验证元素确实具有预期的结构和属性。

## 调试

对于本节，假定插件作者对如何使用调试器、如何设置断点以及如何在断点上设置条件有基本的了解。

在调试元素模式时，插件作者需要记住元素模式实例化的地方与它们实际使用的地方无关。 

例如，虽然完成贡献者的模式在注册贡献者时被实例化，但在键入时完成时会检查模式。 

因此，在 IntelliJ 平台中找到用于调试元素模式的正确位置是第一个重要步骤。

但是，在 ElementPattern 内部设置断点将导致许多误报，因为元素模式在整个 IDE 中被广泛使用。 

过滤掉这些误报的一种方法是在断点上使用条件。 以下步骤可以帮助您调查检查模式的位置：

在 ElementPattern.accepts() 方法中设置断点。

在断点上设置一个条件，检查模式的字符串表示是否包含模式的可识别部分。

调试，当断点触发时，确保它是正确的模式并调查调用堆栈以找到使用模式检查的相关方法。

调试相关方法，例如 填充完成变体或查找引用的方法。

请注意，通过在实例化模式的位置设置断点并检查其字符串表示形式，可以找到模式的可识别部分。

## Debugging Example

使用上面的 Markdown 代码示例，我们注意到元素模式中使用了 MarkdownLinkDestinationImpl 类。 

现在，在以下位置设置断点：

```java
com.intellij.patterns.ElementPattern#accepts(
  java.lang.Object,
  com.intellij.util.ProcessingContext
)
```

右键单击断点并将以下设置为条件：

```java
toString().contains("MarkdownLinkDestinationImpl")
```

现在开始调试会话并打开 Markdown 文件。 

当断点命中时，调试工具窗口中的调用堆栈显示在 ReferenceProvidersRegistryImpl 的 doGetReferencesFromProviders 方法中检查了引用提供者。 

这为进一步调查提供了一个良好的起点。

# 参考资料

https://plugins.jetbrains.com/docs/intellij/element-patterns.html

* any list
{:toc}