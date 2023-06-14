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

# chat

## 详细解释下 idea 插件开发中的 PSI file

在 IntelliJ IDEA 插件开发中，PSI（Program Structure Interface）文件是一种核心概念，它代表了源代码的抽象语法树（Abstract Syntax Tree，AST）。

PSI 文件提供了一种统一的方式来解析、访问和修改源代码，无论是 Java、Kotlin、JavaScript 还是其他语言。

PSI 文件包含了代码的结构和语义信息，可以表示类、方法、变量、注释等各种代码元素。通过使用 PSI 文件，插件可以深入理解代码的结构和含义，并对其进行分析、操作和扩展。

在 IntelliJ IDEA 插件开发中，可以使用 PSI 文件来完成许多任务，例如：

1. 导航和查找：通过分析 PSI 文件，可以实现跳转到定义、查找引用等导航功能。插件可以定位代码中的特定元素，并在编辑器中进行高亮显示或进行其他操作。

2. 代码分析：通过遍历 PSI 树，可以执行静态代码分析。插件可以检测代码中的错误、潜在问题或编码风格违规，并提供相应的警告或建议。

3. 重构和代码生成：PSI 文件提供了修改代码结构的能力。插件可以使用 PSI 文件来执行重构操作，例如重命名变量、提取方法、内联方法等。此外，还可以基于代码模板生成新的代码。

4. 代码生成和自动完成：插件可以利用 PSI 文件生成代码片段，并将其插入到编辑器中。这对于自动完成功能非常有用，可以根据上下文为用户提供代码补全建议。

要在 IntelliJ IDEA 插件中使用 PSI 文件，通常需要使用该插件提供的 API 来访问和操作 PSI 树。IntelliJ IDEA 提供了丰富的 PSI API，可以让开发者轻松地处理源代码的结构和语义信息。

总而言之，PSI 文件是 IntelliJ IDEA 插件开发中的关键组件，它提供了一种统一的方式来解析、访问和修改源代码。通过使用 PSI 文件，插件可以实现各种功能，包括导航、代码分析、重构和代码生成等。

## java 文件 PSI file 的使用入门例子

```java
package com.github.houbb.database.migrate.idea.plugin.action;

import com.intellij.execution.MethodListDlg;
import com.intellij.openapi.actionSystem.AnAction;
import com.intellij.openapi.actionSystem.AnActionEvent;
import com.intellij.openapi.actionSystem.CommonDataKeys;
import com.intellij.openapi.diagnostic.Logger;
import com.intellij.openapi.editor.Editor;
import com.intellij.openapi.project.Project;
import com.intellij.openapi.util.Condition;
import com.intellij.openapi.vfs.VirtualFile;
import com.intellij.psi.*;

public class GenerateTestAction extends AnAction {

    private static final Logger LOG = Logger.getInstance(GenerateTestAction.class);


    @Override
    public void actionPerformed(AnActionEvent event) {
        Project project = event.getProject();
        VirtualFile file = event.getDataContext().getData(CommonDataKeys.VIRTUAL_FILE);

        if (project != null && file != null && file.getName().endsWith(".java")) {
            PsiFile psiFile = PsiManager.getInstance(project).findFile(file);
            if (psiFile instanceof PsiJavaFile) {
                PsiJavaFile javaFile = (PsiJavaFile) psiFile;

                // 访问类和方法
                PsiClass[] classes = javaFile.getClasses();
                for (PsiClass psiClass : classes) {
                    System.out.println("Class: " + psiClass.getName());
                    PsiMethod[] methods = psiClass.getMethods();
                    for (PsiMethod method : methods) {
                        System.out.println("Method: " + method.getName());
                    }

                    PsiField[] psiFields = psiClass.getFields();
                    for (PsiField psiField : psiFields) {
                        System.out.println("Field: " + psiField.getName());
                    }
                }
            }


        }

    }
}
```

## 展示方法列表弹框

```java
Editor editor = event.getDataContext().getData(CommonDataKeys.EDITOR);

MethodListDlg methodListDlg = new MethodListDlg(psiClass, new Condition<PsiMethod>() {
                        @Override
                        public boolean value(PsiMethod psiMethod) {
                            return true;
                        }
                    }, editor.getComponent());
                    methodListDlg.show();
```

# 详细介绍一下 PsiCodeBlock

`PsiCodeBlock` 是 IntelliJ IDEA 插件开发中用于表示代码块的 PSI 元素。它代表了一段代码的范围，通常是在方法、构造函数或其他语句块中使用。

`PsiCodeBlock` 继承自 `PsiElement`，它是 PSI 树中的一个节点，可以包含其他 PSI 元素作为其子元素。代码块可以包含多个语句、局部变量、内部类、注释等。

下面是一些常见的操作，可以通过 `PsiCodeBlock` 进行操作和获取信息：

1. 获取代码块中的语句：
   ```java
   PsiCodeBlock codeBlock = ...; // 获取 PsiCodeBlock 对象
   PsiStatement[] statements = codeBlock.getStatements(); // 获取代码块中的语句数组
   ```

2. 遍历代码块中的语句：
   ```java
   PsiCodeBlock codeBlock = ...; // 获取 PsiCodeBlock 对象
   for (PsiStatement statement : codeBlock.getStatements()) {
       // 在此处处理每个语句
   }
   ```

3. 获取代码块的起始位置和结束位置：
   ```java
   PsiCodeBlock codeBlock = ...; // 获取 PsiCodeBlock 对象
   int startOffset = codeBlock.getTextRange().getStartOffset(); // 获取代码块的起始偏移量
   int endOffset = codeBlock.getTextRange().getEndOffset(); // 获取代码块的结束偏移量
   ```

4. 获取代码块的父元素：
   ```java
   PsiCodeBlock codeBlock = ...; // 获取 PsiCodeBlock 对象
   PsiElement parent = codeBlock.getParent(); // 获取代码块的父元素，例如方法或构造函数
   ```

5. 在代码块中插入语句：
   ```java
   PsiCodeBlock codeBlock = ...; // 获取 PsiCodeBlock 对象
   PsiElementFactory elementFactory = JavaPsiFacade.getElementFactory(project); // 获取 PsiElementFactory
   PsiStatement newStatement = elementFactory.createStatementFromText("System.out.println(\"Hello, World!\");", codeBlock); // 创建新的语句
   codeBlock.add(newStatement); // 在代码块末尾添加新的语句
   ```

这些只是 `PsiCodeBlock` 提供的一些常见操作和用法示例。根据您的需求，您还可以使用其他方法和组合操作来处理和修改代码块的内容。

请注意，在使用 `PsiCodeBlock` 时，需要了解 PSI 元素树的结构和相关的 PSI 类。可以使用 PSI Viewer 或调试器来检查代码块的结构，以便更好地了解如何操作和获取所需的信息。

# 详细介绍一下 PsiStatement

`PsiStatement` 是 IntelliJ IDEA 插件开发中的一个 PSI 元素，用于表示 Java 代码中的语句。

它是 `PsiCodeBlock` 中的子元素，代表了一个独立的语句，可以是表达式、声明、控制流语句等。

`PsiStatement` 继承自 `PsiElement`，因此它是 PSI 树中的一个节点。它提供了一些方法来访问和操作语句的内容和属性。

下面是一些常见的操作，可以通过 `PsiStatement` 进行操作和获取信息：

1. 获取语句的文本：
   ```java
   PsiStatement statement = ...; // 获取 PsiStatement 对象
   String text = statement.getText(); // 获取语句的文本
   ```

2. 获取语句的类型：
   ```java
   PsiStatement statement = ...; // 获取 PsiStatement 对象
   if (statement instanceof PsiExpressionStatement) {
       // 处理表达式语句
   } else if (statement instanceof PsiDeclarationStatement) {
       // 处理声明语句
   } else if (statement instanceof PsiIfStatement) {
       // 处理 if 语句
   } else {
       // 处理其他类型的语句
   }
   ```

3. 获取语句的父元素：
   ```java
   PsiStatement statement = ...; // 获取 PsiStatement 对象
   PsiElement parent = statement.getParent(); // 获取语句的父元素，例如代码块或循环语句
   ```

4. 获取语句所在的方法或构造函数：
   ```java
   PsiStatement statement = ...; // 获取 PsiStatement 对象
   PsiMethod containingMethod = PsiTreeUtil.getParentOfType(statement, PsiMethod.class); // 获取包含语句的方法或构造函数
   ```

5. 在语句之前或之后插入新的语句：
   ```java
   PsiStatement statement = ...; // 获取 PsiStatement 对象
   PsiElementFactory elementFactory = JavaPsiFacade.getElementFactory(project); // 获取 PsiElementFactory
   PsiStatement newStatement = elementFactory.createStatementFromText("System.out.println(\"Hello, World!\");", statement); // 创建新的语句
   statement.getParent().addBefore(newStatement, statement); // 在语句之前插入新的语句
   ```

这些只是 `PsiStatement` 提供的一些常见操作和用法示例。根据您的需求，您还可以使用其他方法和组合操作来处理和修改语句的内容。

请注意，在使用 `PsiStatement` 时，需要了解 PSI 元素树的结构和相关的 PSI 类。可以使用 PSI Viewer 或调试器来检查语句的结构，以便更好地了解如何操作和获取所需的信息。

## 更多

这里其实理解每一个方法的每一句话在执行什么。

# 意外发现 PsiDocComment

可以拿到文档，所以直接生成对应的文档，非常的方便。

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