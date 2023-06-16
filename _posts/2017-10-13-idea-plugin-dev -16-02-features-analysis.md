---
layout: post
title:  Idea Plugin Dev-16-02-Analyzing
date:  2017-10-13 10:24:52 +0800
categories: [Java]
tags: [java, idea, idea-plugin]
published: true
---

# Syntax Errors

IntelliJ 平台提供了一种用于分析 PSI 树和突出显示开箱即用的语法错误的机制。

在构建代码的 PSI 树时，解析器会尝试根据语言语法使用标记。 

当它遇到语法错误时，如意外标记，将创建一个 PsiErrorElement 并将其添加到 PSI 树中，并附上适当的错误描述。 

在代码分析守护进程中，IDE 访问树中的每个 PSI 元素，当遇到 PsiErrorElement 时，收集有关它的信息并在编辑器中突出显示代码时使用。

## 控制语法错误突出显示

在某些情况下，突出显示语法错误是不够的，甚至是不必要的：

错误可以以更易于理解的方式呈现给用户。

实际的错误原因在代码中的不同位置，在查看语法错误时不容易看到。

在给定的上下文中可以安全地忽略错误，例如，在 Markdown 代码块中注入不完整的代码片段。

语法错误并不严重，可以被视为警告甚至信息。

IntelliJ 平台允许插件禁用突出显示特定语法错误。 如果需要，可以选择由其他注释器或检查器处理这些错误。

要控制应该报告哪些 PsiErrorElements 以及哪些可以忽略，插件必须提供 HighlightErrorFilter 的实现并将其注册到 com.intellij.highlightErrorFilter 扩展点。 

它包含一个抽象方法 shouldHighlightErrorElement() 如果给定的 PsiErrorElement 不应在编辑器中突出显示，则该方法应返回 false。

# Code Inspections

IntelliJ 平台提供专为静态代码分析而设计的工具，称为代码检查，可帮助用户维护和清理代码，而无需实际执行代码。 

自定义代码检查可以作为 IntelliJ 平台插件实现。 

插件方法的一个示例是 [comparing_string_references_inspection](https://github.com/JetBrains/intellij-sdk-code-samples/tree/main/comparing_string_references_inspection) 代码示例。

请参阅 IntelliJ 平台 UI 指南中的检查主题，了解检查的命名、编写描述和消息文本。

## 创建检查插件

comparing_string_references_inspection 代码示例将新检查添加到 Java | Inspections 列表中的 Probable Bugs 组。 

当在 String 表达式之间使用 == 或 != 运算符时，检查报告。

它说明了自定义检查插件的组件：

描述插件配置文件中的检查。

实现本地检查类以在编辑器中检查 Java 代码。

创建一个访问者来遍历正在编辑的 Java 文件的 PSI 树，检查有问题的语法。

通过根据需要更改 PSI 树，实现快速修复类以更正语法问题。 像意图一样向用户显示快速修复。

编写检查首选项面板中显示的 HTML 描述。

为已实施的检查和快速修复创建测试。

尽管代码示例说明了这些组件的实现，但查看在 IntelliJ 社区代码库中实现的检查示例通常很有用。 

要识别给定检查的实现类，请尝试按名称或 UI 文本查找检查。 还可以考虑在 IntelliJ Platform Explorer 中搜索现有实现。

# Inspection Options

一些代码检查提供影响其行为的配置选项。 

例如，`Java | Code style issues | 'size() == 0' can be replaced with isEmpty()`，允许忽略定义列表或表达式中的类，这将替换为 !isEmpty()。

目前，有两种方式提供检查选项：

声明性的

基于用户界面

声明

# Controlling Highlighting

通过 IntelliJ 平台提供的几种机制（语法错误、注释器、检查）分析代码的结果被转换为用于在编辑器中突出显示代码的突出显示信息。 

然而，在某些情况下，提供的突出显示信息是无效的或不必要的。

考虑一个工具，它允许通过在构建期间为带注释的字段隐式生成 getter 和 setter 来更改 Java 语言的语法，以便可以在类实现中省略它们：

```java
class Person {
    @GetterSetter
    private int age;
}

// usage:
person.setAge(47); // valid at runtime
```

IntelliJ IDEA 中的 Java 支持会将上述 setter 用法报告为未解析的代码符号。 

生成的错误注释从 Java 语言的角度来看是有效的，但在使用此类工具的项目中无效。

另一种不需要突出显示代码问题的情况是来自 VCS 的旧文件修订。 

例如，可以在不同的项目上下文中创建文件的旧版本，并配置其他库。 

如果旧文件版本使用了项目当前未使用的库，则会导致报告误报代码问题。

IntelliJ 平台公开扩展点，允许插件决定哪些突出显示信息将在编辑器中可见。 

为此，插件必须提供 HighlightInfoFilter 的实现并将其注册到 com.intellij.daemon.highlightInfoFilter 扩展点。 

它包含一个方法 accept()，如果给定的 HighlightInfo 应该在编辑器中可见，该方法应该返回 true，如果忽略它则返回 false。

# 参考资料

https://plugins.jetbrains.com/docs/intellij/analyzing.html

* any list
{:toc}