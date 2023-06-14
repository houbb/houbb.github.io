---
layout: post
title:  Idea Plugin Dev-15-02-File View Providers
date:  2017-10-13 10:24:52 +0800
categories: [Java]
tags: [java, idea, idea-plugin]
published: true
---

# FileViewProvider

文件视图提供程序 (FileViewProvider) 管理对单个文件中多个 PSI 树的访问。

例如，一个 JSPX 页面有一个单独的 PSI 树用于其中的 Java 代码 (PsiJavaFile)，一个单独的树用于 XML 代码 (XmlFile)，一个单独的树用于整个 JSP (JspFile)。

每个 PSI 树都覆盖了文件的全部内容，并在可以找到不同语言内容的地方包含特殊的“外部语言元素”。

FileViewProvider 实例对应于单个 VirtualFile、单个 Document，并且可以检索多个 PsiFile 实例。

## How do I get a FileViewProvider?

| Context | API |
|:----|:----|
| PSI File |  PsiFile.getViewProvider() |
| Virtual File | PsiManager.getInstance(project).findViewProvider() |


## 我可以用 FileViewProvider 做什么？

获取文件中存在 PSI 树的所有语言的集合：fileViewProvider.getLanguages()

获取特定语言的 PSI 树：fileViewProvider.getPsi(language)。 

例如，要获取 XML 的 PSI 树，请使用 fileViewProvider.getPsi(XMLLanguage.INSTANCE)。

要在文件中的指定偏移处查找特定语言的元素：`fileViewProvider.findElementAt(offset, language)`

## 如何扩展 FileViewProvider？

要为不同语言创建具有多个散布树的文件类型，插件必须包含对 com.intellij.fileType.fileViewProviderFactory 扩展点的扩展。

实施 FileViewProviderFactory 并从 createFileViewProvider() 方法返回您的 FileViewProvider 实施。

在plugin.xml中注册如下：

```xml
<extensions defaultExtensionNs="com.intellij">
  <fileType.fileViewProviderFactory
      filetype="$FILE_TYPE$"
      implementationClass="com.example.MyFileViewProviderFactory"/>
</extensions>
```

其中 $FILE_TYPE$ 指的是正在创建的文件的类型（例如，“JSF”）。

# PSI Elements

PSI（程序结构接口）文件表示 PSI 元素的层次结构（所谓的 PSI 树）。 

单个 PSI 文件（本身就是一个 PSI 元素）可能会以特定编程语言公开多个 PSI 树（请参阅文件视图提供程序）。 

PSI 元素又可以有子 PSI 元素。

**PSI 元素和各个 PSI 元素级别的操作用于探索源代码的内部结构，因为它由 IntelliJ 平台解释。** 

例如，您可以使用 PSI 元素执行代码分析，例如代码检查或意图操作。

PsiElement 类是 PSI 元素的公共基类。

## How do I get a PSI element?

| Context  | API |
|:----|:----|
| Action | AnActionEvent.getData(CommonDataKeys.PSI_ELEMENT) Note: If an editor is currently open and the element under caret is a reference, this will return the result of resolving the reference. |
| PSI File | PsiFile.findElementAt(offset) - This returns a leaf element at the specified offset, normally a lexer token. Use PsiTreeUtil.getParentOfType() to find the element of the exact type. PsiRecursiveElementWalkingVisitor |
| Reference | PsiReference.resolve() | 

## What can I do with PSI elements?

See [PSI Cookbook](https://plugins.jetbrains.com/docs/intellij/psi-cookbook.html) and [Modifying the PSI](https://plugins.jetbrains.com/docs/intellij/modifying-psi.html).

# Navigating the PSI

导航 PSI 的方式主要有三种：自上而下、自下而上和引用（references）。 

在第一个场景中，您有一个 PSI 文件或另一个更高级别的元素（例如，一个方法）。 

您需要找到与指定条件匹配的所有元素（例如，所有变量声明）。 

在第二种情况下，您在 PSI 树中有一个特定的点（例如，插入符号处的元素），需要找出有关其上下文的信息（例如，声明它的元素）。 

最后，引用允许您从元素的用法（例如，方法调用）导航到声明（被调用的方法）并返回。 

参考资料在单独的主题中描述。

## 自上而下的导航

执行自上而下导航的最常见方法是使用访问者。 

要使用访问者，您需要创建一个类（通常是匿名内部类）来扩展基本访问者类，覆盖处理您感兴趣的元素的方法，并将访问者实例传递给 PsiElement.accept()。

访问者的基类是特定于语言的。 

例如，如果您需要处理 Java 文件中的元素，您可以扩展 JavaRecursiveElementVisitor 并覆盖与您感兴趣的 Java 元素类型对应的方法。

以下代码片段显示了使用访问者查找所有 Java 局部变量声明：

```java
file.accept(new JavaRecursiveElementVisitor() {
  @Override
  public void visitLocalVariable(PsiLocalVariable variable) {
    super.visitLocalVariable(variable);
    System.out.println("Found a variable at offset " +
         variable.getTextRange().getStartOffset());
  }
});
```

在许多情况下，您还可以使用更具体的 API 进行自上而下的导航。 

例如，如果您需要获取 Java 类中所有方法的列表，您可以使用访问者，但更简单的方法是调用 PsiClass.getMethods()。

PsiTreeUtil 包含许多用于 PSI 树导航的通用、独立于语言的函数，其中一些函数（例如，findChildrenOfType()）执行自上而下的导航。

## 自下而上导航

自下而上导航的起点是 PSI 树中的特定元素（例如，解析引用的结果）或偏移量。 

如果有偏移量，可以通过调用 PsiFile.findElementAt() 找到对应的 PSI 元素。 

此方法返回树最低级别的元素（例如，标识符），如果要确定更广泛的上下文，则需要向上导航树。

在大多数情况下，自下而上的导航是通过调用 PsiTreeUtil.getParentOfType() 来执行的。 

此方法在树中向上移动，直到找到您指定类型的元素。 

例如，要查找包含方法，您可以调用 PsiTreeUtil.getParentOfType(element, PsiMethod.class)。

在某些情况下，您还可以使用特定的导航方法。 

例如，要查找包含方法的类，您可以调用 PsiMethod.getContainingClass()。

以下代码片段显示了如何一起使用这些调用：

```java
PsiFile psiFile = anActionEvent.getData(CommonDataKeys.PSI_FILE);
PsiElement element = psiFile.findElementAt(offset);
PsiMethod containingMethod = PsiTreeUtil.getParentOfType(element, PsiMethod.class);
PsiClass containingClass = containingMethod.getContainingClass();
```

# PSI References

PSI 树中的引用是一个对象，表示从代码中特定元素的使用到相应声明的链接。 

解析引用意味着找到特定用法所引用的声明。

最常见的引用类型由语言语义定义。 

例如，考虑一个简单的 Java 方法：

```java
public void hello(String message) {
    System.out.println(message);
}
```

这个简单的代码片段包含五个引用。 

由标识符 String、System、out 和 println 创建的引用可以解析为 JDK 中相应的声明：String 和 System 类、out 字段和 println 方法。 

由 println(message) 中第二次出现的消息标识符创建的引用可以解析为消息参数，由方法头中的 String message 声明。

请注意，String message 不是引用，无法解析。 

相反，它是一个声明。 

它不引用别处定义的任何名称； 相反，它自己定义了一个名称。

引用是实现 PsiReference 接口的类的实例。 

请注意，引用不同于 PSI 元素。 

PSI 元素创建的引用从 `PsiElement.getReferences()` 返回，引用的基础 PSI 元素可以从 `PsiReference.getElement()` 获得。

要解析引用 - 定位被引用的声明 - 调用 PsiReference.resolve()。 

了解 PsiReference.getElement() 和 PsiReference.resolve() 之间的区别非常重要。 

前一种方法返回引用的来源，而后者返回其目标。 

在上面的示例中，对于消息引用，getElement() 将在片段的第二行返回消息标识符，而 resolve() 将在第一行（在参数列表内）返回消息标识符。

解析引用的过程与解析不同，并且不同时执行。 

此外，它并不总是成功的。 

如果当前在 IDE 中打开的代码无法编译，或者在其他情况下，PsiReference.resolve() 返回 null 是正常的 - 所有使用引用的代码都必须准备好处理它。

## 贡献参考

除了由编程语言的语义定义的引用之外，IDE 还识别许多由代码中使用的 API 和框架的语义确定的引用。 考虑以下示例：

```java
File f = new File("foo.txt");
```

在这里，“foo.txt”从 Java 语法的角度来看没有特殊含义——它只是一个字符串文字。 

但是，在 IntelliJ IDEA 中打开此示例并在同一目录中有一个名为“foo.txt”的文件，可以按 Ctrl/Cmd 并单击“foo.txt”并导航到该文件。 

这是有效的，因为 IDE 识别 new File(...) 的语义，并提供对作为参数传递给该方法的字符串文字的引用。

通常，引用可以贡献给没有自己引用的元素，例如字符串文字和注释。 引用也经常贡献给非代码文件，例如 XML 或 JSON。

贡献参考是扩展现有语言的最常见方法之一。 例如，您的插件可以贡献对 Java 代码的引用，即使 Java PSI 是平台的一部分并且未在您的插件中定义。

实现在 com.intellij.psi.referenceContributor 扩展点中注册的 PsiReferenceContributor。

属性语言应设置为该贡献者适用的语言ID。 

然后在调用 PsiReferenceRegistrar.registerReferenceProvider() 时使用元素模式指定提供引用的确切位置。

另请参阅参考贡献者教程。

## 具有可选或多个解析结果的引用

最简单的情况下，引用解析为单个元素，如果解析失败，则代码不正确，IDE 需要将其高亮显示为错误。 但是，也有情况不同的情况。

第一种情况是软引用。 考虑上面的 new File("foo.txt") 示例。 如果 IDE 找不到文件“foo.txt”，这并不意味着需要突出显示错误 - 也许该文件仅在运行时可用。 此类引用从 PsiReference.isSoft() 方法返回 true，然后可以在检查/注释器中使用该方法以跳过完全突出显示它们或使用较低的严重性。

第二种情况是多变量引用。 考虑 JavaScript 程序的情况。 JavaScript 是一种动态类型的语言，因此 IDE 不能总是准确地确定在特定位置调用了哪个方法。 为了处理这个问题，它提供了一个可以解析为多个可能元素的引用。 此类引用实现 PsiPolyVariantReference 接口。

要解析 PsiPolyVariantReference，可以调用它的 multiResolve() 方法。 该调用返回一个 ResolveResult 对象数组。 每个对象标识一个 PSI 元素并指定结果是否有效。 例如，假设您有多个 Java 方法重载和一个调用，其参数与任何重载都不匹配。 在这种情况下，您将获得所有重载的 ResolveResult 对象，并且 isValidResult() 对所有重载返回 false。

## 搜索参考

解析引用意味着从用法到相应的声明。 要执行相反方向的导航 - 从声明到它的用法 - 执行参考搜索。

要使用 ReferencesSearch 执行搜索，请指定要搜索的元素，以及可选的其他参数，例如需要搜索参考的范围。 创建的 Query 允许一次获取所有结果或一个一个地迭代结果。 后者允许在找到第一个（匹配）结果后立即停止处理。

## 实施参考

请参阅指南和相应的教程以获取更多信息。

# Modifying the PSI

PSI 是源代码的读/写表示，作为与源文件结构相对应的元素树。 

您可以通过添加、替换和删除 PSI 元素来修改 PSI。

要执行这些操作，您可以使用 PsiElement.add()、PsiElement.delete() 和 PsiElement.replace() 等方法，以及 PsiElement 接口中定义的其他方法，这些方法允许您在单个操作中处理多个元素， 或指定树中需要添加元素的确切位置。

与文档操作一样，PSI 修改需要包装在写入操作和命令中（并且只能在事件调度线程中执行）。 

有关命令和写入操作的更多信息，请参阅文档一文。

## 创建新的 PSI

添加到树中或替换现有 PSI 元素的 PSI 元素通常是从文本创建的。 

在最一般的情况下，您使用 PsiFileFactory 的 createFileFromText() 方法创建一个新文件，其中包含您需要添加到树中的代码构造或用作现有元素的替换，遍历生成的树以定位 您需要的特定部分，然后将该元素传递给 add() 或 replace()。 另请参阅如何创建 PSI 文件？

大多数语言都提供工厂方法，使您可以更轻松地创建特定的代码结构。 

例子：

PsiJavaParserFacade 类包含诸如 createMethodFromText() 之类的方法，它根据给定的文本创建 Java 方法

SimpleElementFactory.createProperty() 创建简单语言属性

当您实施适用于现有代码的重构、意图或检查快速修复时，您传递给各种 createFromText() 方法的文本将结合硬编码片段和从现有文件中获取的代码片段。 对于小代码片段（单独的标识符），您可以简单地将现有代码中的文本附加到您正在构建的代码片段的文本中。 在这种情况下，您需要确保生成的文本在语法上是正确的。 否则，createFromText() 方法将抛出异常。

对于较大的代码片段，最好分几步进行修改：

从文本创建替换树片段，为用户代码片段留下占位符；

用用户代码片段替换占位符；

用替换树替换原始源文件中的元素。

这可确保保留用户代码的格式，并且修改不会引入任何不需要的空白更改。 

正如 IntelliJ 平台 API 中的其他地方一样，传递给 createFileFromText() 和其他 createFromText() 方法的文本必须仅使用 `\n` 作为行分隔符。

作为此方法的示例，请参阅 ComparingStringReferencesInspection 示例中的快速修复：

```java
// binaryExpression holds a PSI expression of the form "x == y", which needs to be replaced with "x.equals(y)"
PsiBinaryExpression binaryExpression = (PsiBinaryExpression) descriptor.getPsiElement();
IElementType opSign = binaryExpression.getOperationTokenType();
PsiExpression lExpr = binaryExpression.getLOperand();
PsiExpression rExpr = binaryExpression.getROperand();

// Step 1: Create a replacement fragment from text, with "a" and "b" as placeholders
PsiElementFactory factory = JavaPsiFacade.getInstance(project).getElementFactory();
PsiMethodCallExpression equalsCall =
    (PsiMethodCallExpression) factory.createExpressionFromText("a.equals(b)", null);

// Step 2: replace "a" and "b" with elements from the original file
equalsCall.getMethodExpression().getQualifierExpression().replace(lExpr);
equalsCall.getArgumentList().getExpressions()[0].replace(rExpr);

// Step 3: replace a larger element in the original file with the replacement tree
PsiExpression result = (PsiExpression) binaryExpression.replace(equalsCall);
```

## 维护树结构一致性

PSI 修改方法不会限制您构建结果树结构的方式。 

例如，当使用 Java 类时，您可以将 for 语句添加为 PsiMethod 元素的直接子元素，即使 Java 解析器永远不会生成这样的结构（for 语句将始终是 PsiCodeBlock 的子元素）表示 方法体。 

产生不正确树结构的修改可能看起来有效，但它们稍后会导致问题和异常。 

因此，您始终需要确保使用 PSI 修改操作构建的结构与解析器在解析您创建的代码时生成的结构相同。

为确保您不会引入不一致，您可以在测试中调用 PsiTestUtil.checkFileStructure() 以修改 PSI 的操作。 

此方法可确保您构建的结构与解析器生成的结构相同。

## 空格和导入

使用 PSI 修改函数时，您永远不应从文本中创建单独的空白节点（空格或换行符）。 

相反，所有空白修改都由格式化程序执行，它遵循用户选择的代码样式设置。 

格式化会在每个命令结束时自动执行，如果需要，您也可以使用 CodeStyleManager 类中的 reformat(PsiElement) 方法手动执行。

此外，在使用 Java 代码（或使用具有类似导入机制的其他语言的代码，例如 Groovy 或 Python）时，您永远不应该手动创建导入。 

相反，您应该将完全限定的名称插入到您正在生成的代码中，然后调用 JavaCodeStyleManager（或您正在使用的语言的等效 API）中的 shortenClassReferences() 方法。 

这确保导入是根据用户的代码样式设置创建的，并插入到文件的正确位置。

## 结合 PSI 和文档修改

在某些情况下，您需要执行 PSI 修改，然后通过 PSI 对刚刚修改的文档执行操作（例如，启动实时模板）。 

要完成基于 PSI 的后处理（例如格式化）并将更改提交到文档，请在 PsiDocumentManager 实例上调用 doPostponedOperationsAndUnblockDocument()。

# 参考资料

https://plugins.jetbrains.com/docs/intellij/file-view-providers.html

* any list
{:toc}