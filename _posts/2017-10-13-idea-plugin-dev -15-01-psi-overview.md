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

# GlobalSearchScope

## 入门

详细解释一下

```java
GlobalSearchScope searchScope = GlobalSearchScope.fileScope(psiClass.getContainingFile());
```

在 IDEA 插件开发中，`GlobalSearchScope` 是一个类，用于指定搜索的范围。

`searchScope` 是一个变量，其类型为 `GlobalSearchScope`，用于表示搜索的范围。

在给定的代码片段中，`searchScope` 被初始化为 `GlobalSearchScope.fileScope(psiClass.getContainingFile())`。

让我们逐步解释这段代码的含义：

1. 首先，`psiClass` 是一个代表代码中的类的 `PsiClass` 对象。它是 PSI 的一种元素类型，用于表示源代码中的类。

2. `psiClass.getContainingFile()` 是 `PsiClass` 接口中的一个方法，用于获取包含该类的文件的 `PsiFile` 对象。`PsiFile` 是 PSI 的另一种元素类型，用于表示源代码文件。

3. `GlobalSearchScope.fileScope(psiClass.getContainingFile())` 是一个静态方法调用，用于创建一个表示特定文件范围的 `GlobalSearchScope` 对象。它接受一个 `PsiFile` 参数，表示要搜索的文件。在这种情况下，我们使用 `psiClass.getContainingFile()` 返回的文件作为搜索范围。

综上所述，`GlobalSearchScope.fileScope(psiClass.getContainingFile())` 的作用是创建一个搜索范围，该范围限定在包含给定 `PsiClass` 的文件中。这意味着在后续的代码中，使用 `searchScope` 变量进行搜索操作时，将仅在包含该类的文件中进行搜索，而不是整个项目或其他范围。这有助于提高搜索效率并减少不必要的搜索结果。

# SearchUtils

## 问题

详细解释一下 

```java
Iterable<PsiReference> psiReferenceIterable = SearchUtils.findAllReferences(psiMethod, searchScope)`;
```

在这段代码中，`Iterable<PsiReference> psiReferenceIterable` 是一个变量，用于存储搜索到的对给定 `psiMethod` 的引用。

`SearchUtils.findAllReferences(psiMethod, searchScope)` 是一个方法调用，用于执行搜索操作。

让我们逐步解释这段代码的含义：

1. `psiMethod` 是一个代表代码中方法的 `PsiMethod` 对象。它是 PSI 的一种元素类型，用于表示源代码中的方法。

2. `searchScope` 是一个 `GlobalSearchScope` 对象，用于指定搜索的范围。它确定了搜索操作在哪些文件或区域中进行。

3. `SearchUtils.findAllReferences(psiMethod, searchScope)` 是一个方法调用，它调用名为 `findAllReferences` 的方法，并传入 `psiMethod` 和 `searchScope` 作为参数。`SearchUtils` 是一个自定义的工具类或实用程序类，其中定义了执行搜索操作的逻辑。

4. `findAllReferences` 方法执行搜索操作，查找给定方法 `psiMethod` 的所有引用。它使用 `searchScope` 来限定搜索范围。

5. 返回的结果是一个 `Iterable<PsiReference>` 对象，表示搜索到的对给定方法的引用。`Iterable` 是 Java 中的一个接口，表示可迭代的集合。`PsiReference` 是 PSI 的元素类型之一，表示代码中的引用关系。

因此，`Iterable<PsiReference> psiReferenceIterable = SearchUtils.findAllReferences(psiMethod, searchScope);` 的作用是执行搜索操作，查找给定方法 `psiMethod` 的所有引用，并将结果存储在 `psiReferenceIterable` 变量中。

开发者可以使用 `psiReferenceIterable` 对象来遍历和处理这些引用，进一步分析代码或执行其他操作。

# PsiTreeUtil

## 详细解释一下 PsiTreeUtil.getParentOfType(psiElement, PsiMethod.class) 

在 IDEA 插件开发中，`PsiTreeUtil.getParentOfType(psiElement, PsiMethod.class)` 是一个方法调用，用于查找给定 `psiElement` 的父级中的特定类型的元素（在这种情况下是 `PsiMethod`）。

让我们逐步解释这段代码的含义：

1. `psiElement` 是一个代表代码中某个元素的 `PsiElement` 对象。`PsiElement` 是 PSI 的基本元素类型，用于表示源代码中的不同部分，例如类、方法、语句等。

2. `PsiMethod.class` 是一个表示 `PsiMethod` 类的对象。`PsiMethod` 是 PSI 的元素类型，用于表示源代码中的方法。

3. `PsiTreeUtil.getParentOfType(psiElement, PsiMethod.class)` 是一个静态方法调用，它调用名为 `getParentOfType` 的方法，并传入 `psiElement` 和 `PsiMethod.class` 作为参数。`PsiTreeUtil` 是 IDEA 提供的一个实用程序类，其中定义了许多用于处理 PSI 树的工具方法。

4. `getParentOfType` 方法执行向上遍历父级的操作，查找给定 `psiElement` 的父级中的特定类型的元素（在这种情况下是 `PsiMethod`）。它会沿着 PSI 树从 `psiElement` 开始向上遍历，直到找到满足条件的父级元素，或者到达树的顶部（例如文件级别）。

5. 返回的结果是找到的满足条件的父级元素，如果没有找到，则返回 `null`。

因此，`PsiTreeUtil.getParentOfType(psiElement, PsiMethod.class)` 的作用是在给定 `psiElement` 的父级中查找特定类型（`PsiMethod`）的元素。

这对于需要根据代码结构进行导航、查找或修改的插件功能非常有用。开发者可以根据实际需求使用返回的父级元素进行进一步的操作。

# 把搜索范围限定在一个 JavaFile 中

要将搜索范围限定在一个 `JavaFile` 中，你可以使用 `LocalSearchScope` 类来创建一个本地搜索范围。以下是实现的步骤：

1. 获取目标 `JavaFile` 对应的 `PsiFile` 对象。

   ```java
   PsiFile psiFile = ...; // 获取目标 JavaFile 对应的 PsiFile 对象
   ```

2. 创建一个 `LocalSearchScope` 对象，将目标 `PsiFile` 作为参数传递进去。

   ```java
   LocalSearchScope searchScope = new LocalSearchScope(psiFile);
   ```

   `LocalSearchScope` 是 PSI 中的一个类，用于表示局部搜索范围，即限定在特定文件内的范围。

3. 使用 `PsiSearchHelper` 类的 `findReferencesTo` 方法来搜索对目标 `PsiField` 的引用，并将搜索结果存储在一个数组或列表中。

   ```java
   PsiSearchHelper searchHelper = PsiSearchHelper.getInstance(project);
   PsiReference[] references = searchHelper.findReferencesTo(psiField, searchScope);
   ```

   这里的 `project` 是指插件的项目对象，你需要替换成你实际的项目对象。

4. 遍历搜索结果，筛选出引用所在的 `PsiMethod` 对象。

   ```java
   for (PsiReference reference : references) {
       PsiElement referenceElement = reference.getElement();
       PsiMethod psiMethod = PsiTreeUtil.getParentOfType(referenceElement, PsiMethod.class);
       // 对获取到的 PsiMethod 进行处理
   }
   ```

   在遍历结果时，可以使用 `PsiTreeUtil.getParentOfType` 方法获取引用所在的父级元素，即 `PsiMethod` 对象。对获取到的 `PsiMethod` 进行处理，如记录、打印或执行其他操作，根据你的具体需求进行处理。

通过以上步骤，你可以将搜索范围限定在一个 `JavaFile` 中，并获取到 `PsiField` 被哪些 `PsiMethod` 引用，并对这些引用进行进一步的操作或分析。



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

# 如何系统的学习 psi 接口。给出学习资料，包含网址

要系统地学习 PSI（Program Structure Interface）接口以及相关概念和使用方法，以下是一些建议的学习资料和资源：

1. JetBrains 官方文档：IntelliJ Platform SDK Documentation - PSI (https://www.jetbrains.org/intellij/sdk/docs/reference_guide/custom_language_support/psi.html) 是 JetBrains 官方提供的关于 PSI 的详细文档。它包含了 PSI 的概述、基本概念、API 文档和示例代码，是学习 PSI 的权威参考资料。

2. IntelliJ IDEA 插件开发教程：如果你想结合实际开发来学习 PSI，可以参考 IntelliJ IDEA 插件开发的相关教程和示例。官方提供了一系列教程和示例，帮助你了解如何使用 PSI 来开发功能丰富的插件。可以从官方插件开发文档（https://plugins.jetbrains.com/docs/intellij/welcome.html）开始，逐步学习插件开发和 PSI 的相关内容。

3. 书籍和博客文章：有一些书籍和博客文章专门介绍了 IntelliJ IDEA 插件开发和 PSI 的使用。例如，《IntelliJ IDEA插件开发权威指南》（IntelliJ IDEA Plugin Development: Beginner's Guide）一书涵盖了 PSI 的内容。此外，一些开发者也在个人博客上分享了他们的经验和教程，你可以搜索相关博客文章来获取更多学习资源。

4. 示例项目和开源插件：研究一些开源的 IntelliJ IDEA 插件项目可以帮助你学习 PSI 的实际应用。可以浏览 GitHub 上的一些知名插件项目，如 JetBrains 官方的插件、Lombok 插件等。阅读其源代码可以帮助你理解 PSI 的使用方式和最佳实践。

5. 社区论坛和讨论组：加入 IntelliJ IDEA 插件开发的社区论坛和讨论组，与其他开发者交流经验和学习资源。JetBrains 官方提供了插件开发者社区论坛（https://intellij-support.jetbrains.com/hc/en-us/community/topics/200366979-IntelliJ-IDEA-Open-API-and-Plugin-Development），你可以在这里提问和寻求帮助。

通过结合阅读官方文档、学习教程、阅读源代码和参与社区讨论，你可以逐步深入学习 PSI 接口并掌握其使用方法。不断实践和开发小项目也是提高技能的关键。

# 参考资料

https://plugins.jetbrains.com/docs/intellij/psi.html

* any list
{:toc}