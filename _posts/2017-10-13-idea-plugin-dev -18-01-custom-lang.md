---
layout: post
title:  Idea Plugin Dev-18-01-Custom Language Support
date:  2017-10-13 10:24:52 +0800
categories: [Java]
tags: [java, idea, idea-plugin]
published: true
---

# Custom Language Support

IntelliJ Platform 是一个强大的平台，用于构建针对任何语言的开发工具。 

大多数 IDE 功能由语言无关（由平台提供）和语言特定部分组成。 

支持一种新语言的特定功能可以通过少量的努力来实现：插件必须只实现特定于语言的部分。

# 参考

文档的这一部分解释了语言 API 的主要概念，并指导您完成开发自定义语言插件通常需要的一系列步骤。 

您可以从 Language API 类的 JavaDoc 注释和 Properties 语言支持源代码（它是 IntelliJ IDEA Community Edition 源代码的一部分）中获取有关 Language API 的更多信息。

# 教程

如果您更喜欢本节中提供的详细说明的完整示例，请查看有关如何为简单语言创建自定义语言支持的分步教程：自定义语言支持教程。 

本教程中的相应步骤链接在本参考资料每一页的“示例”部分下。

我们如何在 IntelliJ 平台上构建 Raku IDE Comma 网络研讨会也提供了出色的介绍。



# 参考资料

https://plugins.jetbrains.com/docs/intellij/testing-plugins.html

* any list
{:toc}