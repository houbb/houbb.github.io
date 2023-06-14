---
layout: post
title:  Idea Plugin Dev-15-03-PSI cookbook
date:  2017-10-13 10:24:52 +0800
categories: [Java]
tags: [java, idea, idea-plugin]
published: true
---

# PSI Cookbook

此页面提供了使用 PSI（程序结构接口）的最常见操作的方法。

与开发自定义语言插件不同，它是关于使用现有语言（例如 Java）的 PSI。

# 一般

如果我知道文件的名称但不知道路径，如何找到文件？

FilenameIndex.getFilesByName()

我如何找到使用特定 PSI 元素的位置？

ReferencesSearch.search()

如何重命名 PSI 元素？

RefactoringFactory.createRename()

如何使虚拟文件的 PSI 重建？

FileContentUtil.reparseFiles()

# Java Specific

- How do I find all inheritors of a class?

ClassInheritorsSearch.search()

- How do I find a class by qualified name?

JavaPsiFacade.findClass()

- How do I find a class by short name?

PsiShortNamesCache.getClassesByName()

- How do I find a superclass of a Java class?

PsiClass.getSuperClass()

- How do I get a reference to the containing package of a Java class?

```java
PsiJavaFile javaFile = (PsiJavaFile)psiClass.getContainingFile();
PsiPackage psiPackage = JavaPsiFacade.getInstance(project)
      .findPackage(javaFile.getPackageName());
```

or

```java
PsiUtil.getPackageName()
```

- How do I find the methods overriding a specific method?

OverridingMethodsSearch.search()

- How do I check the presence of a JVM library?

Use dedicated (and heavily cached) methods from JavaLibraryUtil:

hasLibraryClass() to check presence via known library class FQN

hasLibraryJar() using Maven coordinates (for example, io.micronaut:micronaut-core).

# PSI Performance

## 避免 PsiElement 的昂贵方法

避免 PsiElement 的方法，这些方法对于深树来说是昂贵的。

getText() 遍历给定元素下的整棵树并连接字符串，请考虑改用 textMatches()。

getTextRange()、getContainingFile() 和 getProject() 遍历树直到文件，这在非常嵌套的树中可能很长。 

如果您只需要 PSI 元素长度，请使用 getTextLength()。

getContainingFile() 和 getProject() 通常可以为每个任务计算一次，然后存储在字段中或通过参数传递。

此外，getText()、getNode() 或 getTextRange() 等方法需要 AST，获取 AST 可能是一项非常昂贵的操作，请参阅下一节。

## 避免使用许多 PSI 树/文件

避免同时将太多已解析的树或文档加载到内存中。 

理想情况下，只有来自在编辑器中打开的文件的 AST 节点应该出现在内存中。 

其他一切，即使是解析/突出显示所需的，都可以通过 PSI 接口访问，但其实现应使用下面的存根，这对 CPU 和内存消耗较少。

如果存根不适合您的情况（例如，您需要的信息很多和/或很少需要，或者您正在为一种您无法控制其 PSI 的语言开发插件），您可以创建自定义索引 或要点。

为确保您不会意外加载 AST，您可以在生产中使用 AstLoadingFilter，在测试中使用 PsiManagerEx.setAssertOnFileLoadingFilter()。

这同样适用于文档：只应加载在编辑器中打开的文档。 通常，您不需要文档内容（因为大多数信息都可以从 PSI 中检索）。 

如果您仍然需要文档，请考虑将您需要提供的信息保存在自定义索引或要点中，以便以后以更便宜的方式获取。 

如果你仍然需要文档，那么至少确保你一个一个地加载它们并且不要将它们放在强引用上让 GC 尽快释放内存。

## 大量计算的缓存结果

诸如 PsiElement.getReference()（和 getReferences()）、PsiReference.resolve()（以及 multiResolve() 和其他等价物）或表达式类型计算、类型推断结果、控制流图等方法调用可能很昂贵。 

为了避免多次支付此成本，可以缓存和重用此类计算的结果。 

通常，使用 CachedValueManager 创建的 CachedValue 可以很好地用于此目的。

如果您缓存的信息仅依赖于当前 PSI 元素的子树（没有别的：没有解析结果或其他文件），您可以将其缓存在 PsiElement 实现中的一个字段中，并在 ASTDelegatePsiElement.subtreeChanged 的覆盖中删除缓存 ().

# 参考资料

https://plugins.jetbrains.com/docs/intellij/psi-cookbook.html

* any list
{:toc}