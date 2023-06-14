---
layout: post
title:  Idea Plugin Dev-15-07-xml doc api
date:  2017-10-13 10:24:52 +0800
categories: [Java]
tags: [java, idea, idea-plugin]
published: true
---

# XML DOM API

本文适用于创建自定义 Web 服务器集成或一些 UI 以轻松编辑 XML 的插件作者。

它描述了 IntelliJ 平台中的文档对象模型 (DOM) - 

一种使用 DTD 或基于模式的 XML 模型的简单方法。 将涵盖以下主题：使用 DOM 本身（读/写标签内容、属性和子标签）以及通过将 UI 连接到 DOM 在 UI 中轻松编辑 XML。

假定读者熟悉 Java、Swing、IntelliJ 平台 XML PSI（类 XmlTag、XmlFile、XmlTagValue 等）、IntelliJ 平台插件开发基础知识（应用程序和项目组件、文件编辑器）。

# XML PSI 与 DOM

那么，如何使用 IntelliJ 平台插件中的 XML 进行操作呢？ 

通常，必须获取 XmlFile，获取其根标签，然后通过路径找到所需的子标签。 

该路径由标签名称组成，每个标签名称都是一个字符串。 

到处输入这些内容既乏味又容易出错。 假设您有以下 XML：

```xml
<root>
  <foo>
    <bar>42</bar>
    <bar>239</bar>
  </foo>
</root>
```

假设您要读取第二个 bar 元素的内容，即“239”。

创建链式调用是不正确的

```java
file.getDocument()
    .getRootTag()
    .findFirstSubTag("foo")
    .findSubTags("bar")[1]
    .getValue()
    .getTrimmedText();
```

因为这里每次调用都可能返回null。

所以代码可能看起来像这样：

```java
XmlFile file = ...;
XmlDocument document = file.getDocument();
if (document != null) {
  XmlTag rootTag = document.getRootTag();
  if (rootTag != null) {
    XmlTag foo = rootTag.findFirstSubTag("foo");
    if (foo != null) {
      XmlTag[] bars = foo.findSubTags("bar");
      if (bars.length > 1) {
        String s = bars[1].getValue().getTrimmedText();
        // do something
      }
    }
  }
}
```

看起来很糟糕，不是吗？ 但是有更好的方法来做同样的事情。 

你只需要扩展一个特殊的接口——DomElement。

例如，让我们创建几个接口：

```java
interface Root extends com.intellij.util.xml.DomElement {
  Foo getFoo();
}

interface Foo extends com.intellij.util.xml.DomElement {
  List<Bar> getBars();
}

interface Bar extends com.intellij.util.xml.DomElement {
  String getValue();
}
```

接下来，您应该创建一个 DomFileDescription 类，将根标签名称和根元素接口传递给它的构造函数。 

使用 com.intellij.dom.fileMetaData 扩展点在 plugin.xml 中注册它并指定 rootTagName 和 domVersion/stubVersion 属性。

您现在可以从 DomManager 获取文件元素。 要获取“239”值，只需编写以下代码：

```java
DomManager manager = DomManager.getDomManager(project);
Root root = manager.getFileElement(file).getRootElement();
List<Bar> bars = root.getFoo().getBars();
if (bars.size() > 1) {
  String s = bars.get(1).getValue();
  // do something
}
```

我想这看起来好一点。 您经常在多个地方使用您的模型。 

重新创建模型效率太低，因此我们为您缓存它，并且对 DomManager.getFileElement() 的任何后续调用都将返回相同的实例。 

因此，只调用此方法一次，然后在所有地方只保留您获得的“根”对象是很有用的。 

在这种情况下，您不需要重复那可怕的第一行，而且代码看起来会更好。

同样重要的是要注意，在这种情况下，我们避免了潜在的 NullPointerException：我们的 DOM 保证访问标签子标签的每个方法都将返回一个非空元素，即使相应命名的子标签不存在。 

乍一看这似乎很奇怪，但它似乎相当方便。 它是如何工作的？ 简单的。 给定这些接口，DOM 生成所有代码以在运行时访问正确的子标签和创建模型元素。 

子标签名称和元素类型取自方法名称、返回类型和方法注释（如果有）。 在大多数情况下，可以省略注释，就像在我们的示例中一样，但无论如何本文都会对此进行进一步讨论。

现在让我们更彻底地探索 DOM 可以做什么，并查看表示各种 XML 概念（例如标记内容、属性或子标记）的可能方式。 

稍后，我们将讨论使用模型的基本方法，以及更高级的功能。 最后，我们将了解如何轻松地为 DOM 模型元素创建 UI 编辑器。

# 参考资料

https://plugins.jetbrains.com/docs/intellij/xml-dom-api.html

* any list
{:toc}