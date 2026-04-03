---
layout: post 
title: flexmark-java 是一个基于 CommonMark 的 Java 实现，采用“先解析块（blocks），再解析行内（inlines）”的 Markdown 解析架构。
date: 2026-04-03 21:01:55 +0800
categories: [Markdown]
tags: [markdown, ast]
published: true
---

#  flexmark-java

**flexmark-java** 是一个基于 **[CommonMark（规范 0.28）]** 的 Java 实现，采用“先解析块（blocks），再解析行内（inlines）”的 Markdown 解析架构。

其优势在于：速度快、灵活性高、基于 Markdown 源元素的 AST（抽象语法树），并且提供精确到组成元素词法单元（lexeme）中每个字符的源码位置信息，同时具有良好的可扩展性。

该 API 提供对解析过程的细粒度控制，并针对安装大量扩展的场景进行了优化。解析器和扩展提供了大量用于控制解析行为和 HTML 渲染方式的选项。最终目标是让解析器和渲染器能够高度精确地模拟其他 Markdown 解析器的行为。目前这一目标已通过实现 [Markdown 处理器模拟（Markdown Processor Emulation）](#markdown-processor-emulation) 部分达成。

该项目的动机是替换我在 JetBrains IDE 的 [Markdown Navigator] 插件中使用的 [pegdown] 解析器。[pegdown] 功能丰富，但整体性能不理想，并且在病态输入（pathological input）情况下可能卡死或几乎卡死。

:warning: **版本 0.60.0** 由于实现类的重构、重命名、清理和优化，包含破坏性变更。详见
[Version-0.60.0-Changes](../../wiki/Version-0.60.0-Changes)

---

### 最新版本

[![Maven Central status](https://img.shields.io/maven-central/v/com.vladsch.flexmark/flexmark.svg)](https://search.maven.org/search?q=g:com.vladsch.flexmark)
[![Javadocs](https://www.javadoc.io/badge/com.vladsch.flexmark/flexmark.svg)](https://www.javadoc.io/doc/com.vladsch.flexmark/flexmark)

---

## 要求

* 对于 0.62.2 及以下版本：需要 Java 8 及以上（兼容 Java 9+）
* 对于 0.64.0 及以上版本：需要 Java 11 及以上
* 项目 Maven 坐标：`com.vladsch.flexmark`
* 核心模块仅依赖 `org.jetbrains:annotations:24.0.1`，扩展依赖见下文说明

API 仍在持续演进，以支持新的扩展和功能。

---

## 快速开始

### Maven 依赖

推荐引入包含核心和所有模块的 `flexmark-all`：

```xml
<dependency>
    <groupId>com.vladsch.flexmark</groupId>
    <artifactId>flexmark-all</artifactId>
    <version>0.64.8</version>
</dependency>
```

示例代码来源：`BasicSample.java`

```java
package com.vladsch.flexmark.samples;

import com.vladsch.flexmark.util.ast.Node;
import com.vladsch.flexmark.html.HtmlRenderer;
import com.vladsch.flexmark.parser.Parser;
import com.vladsch.flexmark.util.data.MutableDataSet;

public class BasicSample {
    public static void main(String[] args) {
        MutableDataSet options = new MutableDataSet();

        // 可选：启用扩展
        //options.set(Parser.EXTENSIONS, Arrays.asList(TablesExtension.create(), StrikethroughExtension.create()));

        // 可选：将软换行转为硬换行
        //options.set(HtmlRenderer.SOFT_BREAK, "<br />\n");

        Parser parser = Parser.builder(options).build();
        HtmlRenderer renderer = HtmlRenderer.builder(options).build();

        // parser 和 renderer 可复用
        Node document = parser.parse("This is *Sparta*");
        String html = renderer.render(document);  // "<p>This is <em>Sparta</em></p>\n"
        System.out.println(html);
    }
}
```

---

### Gradle 构建

```shell
implementation 'com.vladsch.flexmark:flexmark-all:0.64.8'
```

---

### Android Studio 构建

由于存在重复文件，需要额外配置：

```groovy
packagingOptions {
    exclude 'META-INF/LICENSE-LGPL-2.1.txt'
    exclude 'META-INF/LICENSE-LGPL-3.txt'
    exclude 'META-INF/LICENSE-W3C-TEST'
    exclude 'META-INF/DEPENDENCIES'
}
```

更多信息参见文档：
Wiki 首页 / 使用示例 / 扩展说明 / 扩展开发

---

## Pegdown 迁移辅助

`PegdownOptionsAdapter` 可将 pegdown 的 `Extensions.*` 标志转换为 flexmark 的配置和扩展列表。

使用方式：

```java
final private static DataHolder OPTIONS =
    PegdownOptionsAdapter.flexmarkOptions(Extensions.ALL);
```

或启用严格 HTML 解析：

```java
PegdownOptionsAdapter.flexmarkOptions(true, Extensions.ALL);
```

说明：
默认的 flexmark pegdown 模拟对 HTML 块的解析较宽松，而 pegdown 仅在标签全部闭合时才中断 HTML 块。

---

## 最新功能与改进（节选）

* 0.60.0 版本重大重构
* Markdown 合并 API
* Docx 渲染扩展
* HTML → Markdown 转换模块
* Java 9+ 模块支持
* 宏（Macros）扩展
* GitLab Markdown 支持
* 媒体标签扩展（音频/视频等）
* 翻译辅助 API
* Admonition 提示块
* 枚举引用（图表编号）
* 属性解析 `{key=value}`
* YouTube 嵌入转换
* Docx 转换（基于 docx4j）
* PDF 输出（基于 Open HTML To PDF）
* Typographic 排版支持
* Markdown 格式化器

---

## 扩展机制说明

API 提供大量扩展点。一般原则：

* 简单扩展应只需几十行代码
* 如果实现复杂，可能使用方式不正确或 API 需增强
* 大多数扩展代码量较小（约几十行）
* 较大扩展约 200 行（如 tables）

如果无法实现，建议直接提 issue。

---

## Markdown 处理器模拟

CommonMark 并不是其他 Markdown 方言的超集或子集，而是定义了一个标准语法。

flexmark 默认兼容 CommonMark，但可以通过 `ParserEmulationProfile` 模拟其他解析器：

支持：

* CommonMark（0.27 / 0.28）
* Markdown.pl
* Kramdown
* MultiMarkdown
* Pegdown
* GitHub Markdown（部分）

注意：
仅调整解析行为，不会自动增加额外特性，需要手动启用对应扩展。

---

## 历史与动机

**flexmark-java** 是 [commonmark-java] 的一个分支，主要增强：

* AST 完整反映源文本结构
* 完整源码位置跟踪
* 更适合 JetBrains PSI 构建

选择 commonmark-java 的原因：

* 高性能
* 易理解
* 易扩展

目标：

* 支持任意 Markdown 方言扩展
* 提供统一配置 API
* 支持禁用核心解析器

当前仍在持续演进，不保证向后兼容。

---

## 功能对比

| 特性      | flexmark-java | commonmark-java | pegdown |
| ------- | ------------- | --------------- | ------- |
| 解析性能    | ✔             | ✔（更快）           | ✘       |
| AST 完整性 | ✔             | ✘               | ✔       |
| AST 源位置 | ✔             | ✔               | ✔（不稳定）  |
| AST 可修改 | ✔             | ✔               | ✘       |
| 可禁用核心解析 | ✔             | ✘               | ✘       |
| 扩展能力    | ✔             | 一般              | 较弱      |
| 配置统一性   | ✔             | ✘               | ✘       |

---

## 进展（部分）

* 排版（引号、智能符号）
* GitHub 扩展（表格、任务列表等）
* 发布功能（脚注、目录等）
* HTML 抑制控制
* Jekyll 支持
* 列表解析优化

---

## 基准测试

总体性能（相对 flexmark）：

| 实现                | 性能        |
| ----------------- | --------- |
| commonmark-java   | 0.71x（更快） |
| flexmark-java     | 1.00x     |
| intellij-markdown | 12.41x    |
| pegdown           | 28.48x    |

在病态输入下：

* flexmark：稳定
* pegdown：指数级退化甚至卡死

---

## 贡献

欢迎 PR / Issue / 评论：

要求：

* 添加测试
* 遵循代码风格（4 空格缩进等）

---

## 许可证

Copyright (c) 2015–2016 Atlassian
Copyright (c) 2016–2023 Vladimir Schneider

BSD 2-Clause License（见 LICENSE.txt）


# 参考资料

* any list
{:toc}