---
layout: post
title:  Idea Plugin Dev-16-01-Editing
date:  2017-10-13 10:24:52 +0800
categories: [Java]
tags: [java, idea, idea-plugin]
published: true
---

# Postfix Completion

Postfix Completion 功能允许开发人员通过在要包装、扩展或修改的表达式后键入模板缩写来使用预定义模板包装代码片段。 

它使开发人员免于键入重复或重要的代码，或者有助于更快地创建代码，例如，编写代码部分并用所需的块将其包围而不向后导航插入符号通常很方便。

考虑这样一种情况，开发人员对当前的 Java 项目 API 不是很熟悉，并且不知道如何命名一个变量，该变量将成为他们想要键入的表达式的结果。 

后缀补全使得首先编写表达式并通过在表达式末尾添加后缀模板缩写来创建具有建议名称的变量赋值成为可能。

假设用户键入以下 Java 代码：

```java
void confirmOrder(Cart cart) {
  cart.getDeliveryType().getDeliveryCost()<caret>
}
```

为避免将插入符号移动到行首，用户可以通过添加 `.var` 后缀缩写并扩展模板来快速创建变量赋值：

```java
void confirmOrder(Cart cart) {
  cart.getDeliveryType().getDeliveryCost().var<ENTER>
}
```

当应用模板时，上面的代码被扩展为：

```java
void confirmOrder(Cart cart) {
  Money deliveryCost = cart.getDeliveryType().getDeliveryCost();<caret>
}
```

此外，用户可以从名称建议弹出窗口中选择最匹配的变量名称。

这些部分描述了如何将 Postfix 模板及其相关的构建块实现到插件：

- 后缀模板

- 高级后缀模板

## Postfix Templates

IntelliJ 平台允许插件提供特定于支持的语言、框架或库的自定义后缀模板。

要为现有或自定义语言提供自定义后缀模板，请在 com.intellij.codeInsight.template.postfixTemplateProvider 扩展点 (EP) 中注册 PostfixTemplateProvider 的实现。

PostfixTemplateProvider 扩展包含扩展 PostfixTemplate 类的模板列表。 

在代码完成机制期间，将查询为当前语言注册的所有后缀模板提供者的模板。 

在当前上下文中启用和适用的所有模板都将添加到完成弹出项集中。

### 后缀模板说明

所有后缀模板都必须提供说明和示例，以显示模板展开前后的代码。 

描述模板的文件必须放在 postfixTemplates/$TEMPLATE_NAME$ 中的插件资源中，其中 $TEMPLATE_NAME$ 目录必须与模板类的简单名称匹配，

例如，对于在 com.example.IntroduceVariablePostfixTemplate 类中实现的模板， 目录名称应命名为 IntroduceVariablePostfixTemplate。

通过创建 description.html 文件来提供解释模板用途和上下文详细信息的描述。

相应地通过 before.$EXTENSION$.template 和 after.$EXTENSION$.template 文件提供显示模板处于“之前”和“之后”展开状态的代码片段。 

$EXTENSION$ 占位符应替换为模板语言的扩展名，例如，用于 Kotlin 模板的 before.kt.template。

示例文件中包含的代码片段可以使用 `<spot>` 标记，它应该包围最重要的代码部分，例如，要扩展的表达式和扩展后插入符号的位置。 

标记的部分将在设置 `|` 中突出显示 `Settings | Editor | General | Postfix Completion` 设置页面，使用户更容易理解模板是如何展开的，例如：

- before.java.template:

```java
<spot>cart.getProducts()</spot>.var
```

- after.java.template:

```java
List<Product> products = cart.getProducts();<spot></spot>
```

## Advanced Postfix Templates

虽然简单的模板可以通过直接扩展 PostfixTemplate 类来处理，但更高级的模板需要额外的功能，比如选择模板应该应用的表达式或编辑模板内容。 

IntelliJ 平台提供了简化高级模板功能实现的基类。


# Live Templates

实时模板是可自定义的规则，允许开发人员在编辑器中缩写重复的文本模式或用重复的结构包围代码片段。

当用户键入指定的缩写后跟可配置的扩展键（通常是 Tab）时，IDE 会将前面的输入序列转换为其全长输出，并更新光标位置。

例如，考虑一个 Java for 循环。 

通常，最终用户需要键入 `for (int i = 0; i < 10; i++) {<Enter><Tab><Enter><Enter>}<Up>`。 

该模式可以缩短为 `fori<Tab>` ，其余内容将展开，留下以下结构：

```java
for (int i = [|]; i < []; i++) {
  []
}
```

当用户完成 for 循环的每个部分并按下 Tab 键时，光标会前进到编辑器中的下一个位置。

实时模板的另一个用例是用额外的结构包围选定的代码。 当用户选择代码片段并调用 Code | Surround With... 操作并从列表中选择模板，代码用模板中定义的内容包裹起来。

考虑以下带有 `<selection>` 中选定片段的 Java 方法：

```java
public void testMethod() {
  <selection>getActions()</selection>
}
```


调用 Code | Surround With... 操作并选择 Iterate Iterable 或数组模板会将代码转换为：

```java
public void testMethod() {
  for (Action action : getActions()) {
    <cursor>
  }
}
```

# File and Code Templates

文件模板机制允许生成包含重复文本和模式的文件和代码片段。 

它的主要目的是通过自动生成样板代码来减轻用户不必要的手动工作。

文件模板可用于创建新的项目文件，其中填充了预定义的内容，例如特定于特定文件类型和上下文的代码脚手架或许可证标头。 

例如，当在 IntelliJ IDEA 中创建一个新的 Java 类时，该文件已经包含一个具有提供的名称和空主体的类声明。 

文件模板不限于创建单个文件。 

可以在 MVC 框架中同时使用用于一组相关文件的子/多个文件创建模板，例如模型、视图和控制器类。

另一个用例是从代码意图和修复中生成代码片段，例如，在现有测试类中添加测试方法或快速修复以添加缺少的接口方法实现。

由于文件模板基于 Apache Velocity，因此它们的内容不是静态的。 

模板可以包含基于上下文的动态部分，例如项目或包名称、创建的实体名称、作者数据等。 也可以创建自定义属性并用所需的值填充它们。

所有列出的文件模板的内容都可以在 IDE 设置中进行编辑，以便用户可以根据自己的特定需要进行调整。

这些部分描述了如何将文件和代码模板及其关联的构建块添加到插件：

- [提供文件和代码模板](https://plugins.jetbrains.com/docs/intellij/providing-file-templates.html)

- [以编程方式使用文件模板](https://plugins.jetbrains.com/docs/intellij/using-file-templates.html)

# Documentation

快速文档通过显示文档来帮助用户，例如，编辑器中的类、函数或方法。 

插件作者实现 DocumentationProvider 来显示特定 PSI 元素的文档。

DocumentationProvider 的实现可以在 com.intellij.documentationProvider 或 com.intellij.lang.documentationProvider 扩展点 (EP) 上注册。 

建议在创建针对特定语言的文档时使用后者，因为注册为 com.intellij.lang.documentationProvider 的提供程序只会被该语言的元素调用。 

这就是他们在 plugin.xml 中注册 EP 时需要语言属性的原因。 

这里更大的图景是文档提供者共存，如果同一元素有多个提供者，则第一个返回不同于 null 的值的提供者获胜。

尽管不鼓励，但在注册扩展时使用 order 属性可以影响文档提供者的顺序。 

例如，python-core-common.xml 使用以下代码在默认提供程序之前调用外部文档提供程序（使用 id="pythonDocumentationProvider" 注册）：

```xml
<lang.documentationProvider
  language="Python"
  implementationClass="com.jetbrains.python.documentation.PythonExternalDocumentationProvider"
  order="before pythonDocumentationProvider"/>
```

有关如何实现 DocumentationProvider 的详细说明，请参阅自定义语言支持部分和自定义语言支持教程中的说明。

# Intentions

## 关于意向行动

IntelliJ 平台分析您的代码并帮助处理可能导致错误的情况。 

当怀疑可能存在问题时，IDE 会建议适当的意图操作，用特殊图标表示。

请参阅 IntelliJ 平台 UI 指南中的检查主题，了解检查/意图的命名、编写描述和消息文本。

您可以查看所有可用意图操作的列表，并使用 Settings | Editor | Intentions 的意图列表启用/禁用它们。 





# 参考资料

https://plugins.jetbrains.com/docs/intellij/postfix-completion.html

* any list
{:toc}