---
layout: post
title: flexmark-java 高性能的 markdown 转换工具
date: 2021-09-01 21:01:55 +0800
categories: [java]
tags: [java, markdown, sh]
published: true
---

# flexmark-java

flexmark-java 是 CommonMark（规范 0.28）解析器的 Java 实现，首先使用块，在 Markdown 解析架构之后内联。

它的优势在于速度、灵活性、基于 Markdown 源元素的 AST，以及源位置的详细信息，包括构成元素的词素的单个字符和可扩展性。

API 允许对解析过程进行精细控制，并针对使用大量已安装扩展的解析进行了优化。解析器和扩展为解析器行为和 HTML 呈现变体提供了大量选项。最终目标是让解析器和渲染器能够非常准确地模拟其他解析器。现在已经部分完成了 Markdown Processor Emulation 的实现

这个项目的动机是需要在我的 JetBrains IDE 的 Markdown Navigator 插件中替换 pegdown 解析器。 

pegdown 有一个很好的功能集，但它的速度一般不太理想，并且在解析过程中病理输入要么挂起，要么实际上挂起。

⚠️ 0.60.0 版本由于实现类的重新组织、重命名、清理和优化而发生了重大变化。

更改在 Version-0.60.0-Changes 中有详细说明。

## 要求

Java 8 或更高版本，兼容 Java 9+

安卓兼容性待添加

该项目在 Maven 上：com.vladsch.flexmark

除了 org.jetbrains:annotations:15.0 之外，核心没有其他依赖项。 

对于扩展，请参阅下面的扩展说明。

API 仍在不断发展以适应新的扩展和功能。

# 快速开始

对于 Maven，将 flexmark-all 添加为包含核心和所有模块的依赖项到以下示例：

```xml
<dependency>
    <groupId>com.vladsch.flexmark</groupId>
    <artifactId>flexmark-all</artifactId>
    <version>0.62.2</version>
</dependency>
```

使用：

```java
package com.vladsch.flexmark.samples;

import com.vladsch.flexmark.util.ast.Node;
import com.vladsch.flexmark.html.HtmlRenderer;
import com.vladsch.flexmark.parser.Parser;
import com.vladsch.flexmark.util.data.MutableDataSet;

public class BasicSample {
    public static void main(String[] args) {
        MutableDataSet options = new MutableDataSet();

        // uncomment to set optional extensions
        //options.set(Parser.EXTENSIONS, Arrays.asList(TablesExtension.create(), StrikethroughExtension.create()));

        // uncomment to convert soft-breaks to hard breaks
        //options.set(HtmlRenderer.SOFT_BREAK, "<br />\n");

        Parser parser = Parser.builder(options).build();
        HtmlRenderer renderer = HtmlRenderer.builder(options).build();

        // You can re-use parser and renderer instances
        Node document = parser.parse("This is *Sparta*");
        String html = renderer.render(document);  // "<p>This is <em>Sparta</em></p>\n"
        System.out.println(html);
    }
}
```

# Pegdown 迁移助手

PegdownOptionsAdapter 类将 pegdown Extensions.* 标志转换为 flexmark 选项和扩展列表。 

包含 Pegdown Extensions.java 是为了方便和 pegdown 1.6.0 中没有的新选项。 

它们位于 flexmark-profile-pegdown 模块中，但您可以从这个 repo 中获取源代码：PegdownOptionsAdapter.java、Extensions.java 并制作您自己的版本，根据您的项目需要进行修改。

您可以将您的扩展标志传递给静态 PegdownOptionsAdapter.flexmarkOptions(int) 或者您可以实例化 PegdownOptionsAdapter 并使用方便的方法来设置、添加和删除扩展标志。 

PegdownOptionsAdapter.getFlexmarkOptions() 每次都会返回一个 DataHolder 的新副本，其中的选项反映了 pegdown 扩展标志。

```java
import com.vladsch.flexmark.html.HtmlRenderer;
import com.vladsch.flexmark.parser.Parser;
import com.vladsch.flexmark.profile.pegdown.Extensions;
import com.vladsch.flexmark.profile.pegdown.PegdownOptionsAdapter;
import com.vladsch.flexmark.util.data.DataHolder;

public class PegdownOptions {
     final private static DataHolder OPTIONS = PegdownOptionsAdapter.flexmarkOptions(
            Extensions.ALL
    );

    static final Parser PARSER = Parser.builder(OPTIONS).build();
    static final HtmlRenderer RENDERER = HtmlRenderer.builder(OPTIONS).build();

    // use the PARSER to parse and RENDERER to render with pegdown compatibility
}
```

默认的 flexmark-java pegdown 仿真使用不太严格的 HTML 块解析，它会在空行上中断 HTML 块。 

如果 HTML 块中的所有标签都关闭，Pegdown 只会在空白行中断 HTML 块。

要更接近原始的 pegdown HTML 块解析行为，请使用采用布尔值 strictHtml 参数的方法：

```java
import com.vladsch.flexmark.html.HtmlRenderer;
import com.vladsch.flexmark.parser.Parser;
import com.vladsch.flexmark.profile.pegdown.Extensions;
import com.vladsch.flexmark.profile.pegdown.PegdownOptionsAdapter;
import com.vladsch.flexmark.util.data.DataHolder;

public class PegdownOptions {
     final private static DataHolder OPTIONS = PegdownOptionsAdapter.flexmarkOptions(true,
            Extensions.ALL
    );

    static final Parser PARSER = Parser.builder(OPTIONS).build();
    static final HtmlRenderer RENDERER = HtmlRenderer.builder(OPTIONS).build();

    // use the PARSER to parse and RENDERER to render with pegdown compatibility
}
```

还提供了带有自定义链接解析器的示例，其中包括用于更改 URL 或链接属性的链接解析器，以及用于覆盖生成的链接 HTML 的自定义节点渲染器。

ℹ️ flexmark-java 除了 pegdown 1.6.0 中可用的扩展之外，还有比 pegdown 更多的扩展和配置选项。 通过 PegdownOptionsAdapter 的可用扩展

# 参考资料

https://github.com/vsch/flexmark-java

* any list
{:toc}