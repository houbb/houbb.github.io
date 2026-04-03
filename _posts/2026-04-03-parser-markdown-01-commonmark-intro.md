---
layout: post 
title: commonmark-java 一个 Java 库，用于根据 Markdown 和 CommonMark 规范（以及部分扩展）解析和渲染 Markdown 文本。
date: 2026-04-03 21:01:55 +0800
categories: [Markdown]
tags: [markdown, ast]
published: true
---

# commonmark-java

一个 Java 库，用于根据 [Markdown] 和 [CommonMark] 规范（以及部分扩展）解析和渲染 Markdown 文本。

## 介绍

提供用于将输入解析为抽象语法树（AST）、访问和操作节点，以及渲染为 HTML 或重新转换为 Markdown 的类。
该项目最初是 [commonmark.js] 的移植版本，但后来演化为一个可扩展的库，具有以下特性：

* 轻量（核心无依赖，扩展在独立 artifact 中）
* 高性能（比曾经流行的 Markdown 库 [pegdown] 快 10–20 倍，详见仓库中的基准测试）
* 灵活（可在解析后操作 AST，自定义 HTML 渲染）
* 可扩展（支持表格、删除线、自动链接等，详见下文）

该库支持 Java 11 及以上版本。也可运行在 Android 上，但仅提供尽力支持，请反馈问题。
Android 最低 API 等级为 19，参见 `commonmark-android-test` 目录。

核心库的 Maven 坐标（完整列表见 [Maven Central]）：

```xml
<dependency>
    <groupId>org.commonmark</groupId>
    <artifactId>commonmark</artifactId>
    <version>0.28.0</version>
</dependency>
```

在 Java 9 中使用的模块名为 `org.commonmark`、`org.commonmark.ext.autolink` 等，对应包名。

注意：该库在 0.x 版本阶段 API 尚未稳定，可能在次版本之间发生破坏性变更。
1.0 之后将遵循 [Semantic Versioning]。
包含 `beta` 的包表示 API 尚未稳定，但一般使用场景下不需要依赖。

如果你想了解当前实现的规范版本，请查看 `spec.txt` 文件。
也可以使用 [CommonMark Dingus] 来熟悉语法或测试边界情况。
克隆仓库后，还可以使用 `DingusApp` 类进行交互式测试。

---

## 使用

### 解析并渲染为 HTML

```java
import org.commonmark.node.*;
import org.commonmark.parser.Parser;
import org.commonmark.renderer.html.HtmlRenderer;

Parser parser = Parser.builder().build();
Node document = parser.parse("This is *Markdown*");
HtmlRenderer renderer = HtmlRenderer.builder().build();
renderer.render(document);  // "<p>This is <em>Markdown</em></p>\n"
```

上述示例使用默认配置。构建器提供了多种配置方法：

* `escapeHtml(true)`：转义原始 HTML 标签和块
* `sanitizeUrls(true)`：移除 `<a>` 和 `<img>` 中潜在不安全的 URL
* 更多选项见构建器方法

注意：该库不会对输出 HTML 的标签安全性进行过滤（如允许哪些标签）。
这属于调用方责任，如果对外暴露 HTML，建议后续进行安全过滤。

---

### 渲染为 Markdown

```java
import org.commonmark.node.*;
import org.commonmark.renderer.markdown.MarkdownRenderer;

MarkdownRenderer renderer = MarkdownRenderer.builder().build();
Node document = new Document();
Heading heading = new Heading();
heading.setLevel(2);
heading.appendChild(new Text("My title"));
document.appendChild(heading);

renderer.render(document);  // "## My title\n"
```

如果需要渲染为尽量少标记的纯文本，可使用 `TextContentRenderer`。

---

### 使用 Visitor 处理节点

解析后的结果是一个节点树，可以在渲染前修改，或仅进行分析：

```java
Node node = parser.parse("Example\n=======\n\nSome more text");
WordCountVisitor visitor = new WordCountVisitor();
node.accept(visitor);
visitor.wordCount;  // 4

class WordCountVisitor extends AbstractVisitor {
    int wordCount = 0;

    @Override
    public void visit(Text text) {
        // 对所有 Text 节点调用
        wordCount += text.getLiteral().split("\\W+").length;
        visitChildren(text);
    }
}
```

---

### 源码位置（Source positions）

如果需要知道节点在源文本中的位置：

```java
var parser = Parser.builder()
    .includeSourceSpans(IncludeSourceSpans.BLOCKS_AND_INLINES)
    .build();
```

解析并查看：

```java
var source = "foo\n\nbar *baz*";
var doc = parser.parse(source);
var emphasis = doc.getLastChild().getLastChild();
var s = emphasis.getSourceSpans().get(0);

s.getLineIndex();    // 行号
s.getColumnIndex();  // 列号
s.getInputIndex();   // 字符索引
s.getLength();       // 长度
```

---

### 修改 HTML 元素属性

示例：为 `img` 标签添加 `class="border"`：

```java
HtmlRenderer renderer = HtmlRenderer.builder()
    .attributeProviderFactory(context -> new ImageAttributeProvider())
    .build();
```

---

### 自定义 HTML 渲染

可完全控制节点如何渲染，例如修改代码块输出方式。

（示例代码略，逻辑：自定义 `NodeRenderer`）

---

### 自定义节点类型

可继承 `CustomNode` 创建自定义节点，并通过 `NodeRenderer` 控制其 HTML 渲染。

---

### 自定义解析

通过 `Parser.Builder` 扩展或覆盖解析逻辑：

* 启用/禁用块类型：`enabledBlockTypes`
* 自定义块解析：`customBlockParserFactory`
* 自定义行内解析：`customInlineContentParserFactory`
* 自定义分隔符处理：`customDelimiterProcessor`
* 自定义链接处理：`linkProcessor`、`linkMarker`

---

### 线程安全

`Parser` 和 `HtmlRenderer` 支持多线程复用：
配置与运行时状态分离。

如发现问题，请提交 issue。

---

### API 文档

在线 Javadoc：
[https://www.javadoc.io/doc/org.commonmark/commonmark](https://www.javadoc.io/doc/org.commonmark/commonmark)

---

## 扩展

扩展通过增强解析器或渲染器实现，需要额外依赖。

示例：启用 GFM 表格：

```xml
<dependency>
    <groupId>org.commonmark</groupId>
    <artifactId>commonmark-ext-gfm-tables</artifactId>
    <version>0.28.0</version>
</dependency>
```

```java
List<Extension> extensions = List.of(TablesExtension.create());
Parser parser = Parser.builder().extensions(extensions).build();
HtmlRenderer renderer = HtmlRenderer.builder().extensions(extensions).build();
```

---

## 内置扩展

### Autolink

自动将 URL、邮箱转换为链接
（artifact：`commonmark-ext-autolink`）

### 删除线（Strikethrough）

使用 `~~text~~`

### 表格（Tables）

支持 GitHub 风格表格

### Alerts

支持 GitHub 风格提示块（NOTE、TIP 等）

### 脚注（Footnotes）

支持 GitHub / Pandoc 风格脚注

### 标题锚点（Heading anchor）

自动生成标题 id

### 下划线（Ins）

使用 `++text++`

### YAML Front Matter

支持 YAML 元数据头

### 图片属性（Image Attributes）

支持宽高等属性

### 任务列表（Task List Items）

支持 `[ ]` / `[x]` 任务列表

---

## 第三方扩展

* commonmark-ext-notifications：支持通知块（INFO、WARNING 等）

---

## 使用该库的项目

* Atlassian（库最初开发地）
* OpenJDK
* Gerrit / Gitiles
* Clerk
* Znai
* Open Note（Android Markdown 应用）
* Quarkus Roq
* Lucee
* Previewer（Eclipse 插件）
* Xeres（P2P Markdown 应用）

---

## 相关项目

* Markwon：Android Markdown 渲染库
* flexmark-java：增强版分支

---

## 贡献

参见 `CONTRIBUTING.md`

---

## 许可证

Copyright (c) 2015, Robin Stocker
BSD 2-Clause License（见 LICENSE.txt）

---

[CommonMark]: https://commonmark.org/
[Markdown]: https://daringfireball.net/projects/markdown/
[commonmark.js]: https://github.com/commonmark/commonmark.js
[pegdown]: https://github.com/sirthias/pegdown
[CommonMark Dingus]: https://spec.commonmark.org/dingus/
[Maven Central]: https://search.maven.org/#search|ga|1|g%3A%22org.commonmark%22
[Semantic Versioning]: https://semver.org/
[autolink-java]: https://github.com/robinst/autolink-java
[gfm-tables]: https://help.github.com/articles/organizing-information-with-tables/


# 参考资料

* any list
{:toc}