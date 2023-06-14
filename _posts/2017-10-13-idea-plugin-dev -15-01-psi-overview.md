---
layout: post
title:  Idea Plugin Dev-15-01-什么是 PSI？ Program Structure Interface (PSI)
date:  2017-10-13 10:24:52 +0800
categories: [Java]
tags: [java, idea, idea-plugin]
published: true
---

# PSI

程序结构接口，通常简称为 PSI，是 IntelliJ 平台中的一个层，负责解析文件和创建语法和语义代码模型，为平台的许多功能提供支持。

# PSI files

PSI（程序结构接口）文件是结构的根，将文件内容表示为特定编程语言中元素的层次结构。

PsiFile 类是所有 PSI 文件的公共基类，而特定语言的文件通常由其子类表示。 

例如，PsiJavaFile 类表示一个 Java 文件，而 XmlFile 类表示一个 XML 文件。

与Virtual Files和Documents有应用范围（即使打开多个项目，每个文件都由同一个VirtualFile实例表示）不同，PSI有项目范围：

如果文件属于多个项目，则同一个文件由多个PsiFile实例表示 同时打开。

# How do I get a PSI file?

| Context | API |
|:----|:----|
| Action | AnActionEvent.getData(CommonDataKeys.PSI_FILE) |
| Document | PsiDocumentManager.getPsiFile() |
| PSI Element | PsiElement.getContainingFile() (may return null if the PSI element is not contained in a file) |
| Virtual File | PsiManager.findFile(), PsiUtilCore.toPsiFiles() |
| File Name | FilenameIndex.getVirtualFilesByName() and locate via PsiManager.findFile() or PsiUtilCore.toPsiFiles() |

# 我可以用 PSI 文件做什么？

大多数有趣的修改操作是在单个 PSI 元素的级别上执行的，而不是作为一个整体的文件。

要遍历文件中的元素，请使用

```java
psiFile.accept(new PsiRecursiveElementWalkingVisitor() {
  // visitor implementation ...
});
```

# PSI 文件来自哪里？

由于 PSI 依赖于语言，因此 PSI 文件是使用 Language 实例创建的：

```java
LanguageParserDefinitions.INSTANCE
    .forLanguage(MyLanguage.INSTANCE)
    .createFile(fileViewProvider);
```

> [Language](https://github.com/JetBrains/intellij-community/blob/idea/231.9011.34/platform/core-api/src/com/intellij/lang/Language.java)

# PSI 文件保留多长时间？

与文档一样，PSI 文件是从相应的 VirtualFile 实例中弱引用的，如果没有被任何人引用，则可以被垃圾收集。

# 如何创建 PSI 文件？

PsiFileFactory.createFileFromText() 创建具有指定内容的内存中 PSI 文件。

要将 PSI 文件保存到磁盘，请使用 PsiDirectory.add()。

# 当 PSI 文件更改时，我如何收到通知？

PsiManager.addPsiTreeChangeListener() 允许您接收有关项目 PSI 树的所有更改的通知。 

或者，在 com.intellij.psi.treeChangeListener 扩展点中注册 PsiTreeChangeListener。

# 如何扩展 PSI？

可以通过自定义语言插件扩展 PSI 以支持其他语言。 有关开发自定义语言插件的更多详细信息，请参阅自定义语言支持参考指南。

# 与 PSI 合作有哪些规则？

对 PSI 文件内容所做的任何更改都会反映在文档中，因此所有处理文档的规则（读/写操作、命令、只读状态处理）都有效。

# 参考资料

https://plugins.jetbrains.com/docs/intellij/psi.html

* any list
{:toc}