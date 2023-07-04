---
layout: post
title:  Idea Plugin Dev-20-01-Themes
date:  2017-10-13 10:24:52 +0800
categories: [Java]
tags: [java, idea, idea-plugin]
published: true
---

# Getting Started

从 2019.1 版本开始，支持自定义主题。 自定义主题使设计人员可以控制内置 UI 元素的外观。 

自定义选项包括：

替代图标，

更改图标和 UI 控件的颜色，

更改 UI 控件的边框和插图，

提供自定义编辑器方案，

添加背景图像。

可供下载的主题展示了创意的可能性。

# 主题插件开发

可以使用 IntelliJ IDEA Community Edition 或 IntelliJ IDEA Ultimate 作为您的 IDE 来开发主题（强烈建议使用最新的可用版本）。 

两者都包含开发主题插件所需的全套开发工具。 

要更加熟悉 IntelliJ IDEA，请参阅 IntelliJ IDEA Web 帮助。

主题是插件类型之一。 它的结构与扩展 IDE 行为的插件没有显着差异，并且可以使用一种受支持的方法来实现：DevKit 或 Gradle。 

开发方法的选择取决于项目要求和开发人员的经验。

## 基于 DevKit 的主题项目

使用 DevKit 开发主题插件是最简单的解决方案，不需要使用 Gradle 或类似构建工具的经验。 

DevKit 项目结构是在使用 New Project Wizard 创建 IDE Plugin 主题项目时默认生成的。

有关开发说明，请参阅开发主题部分。

## 基于 Gradle 的主题项目

使用 Gradle 开发主题插件需要使用 Gradle 或类似构建工具的经验。 

它提供了自动化开发过程的某些部分的可能性，例如使用主题插件版本和其他数据修补 plugin.xml 文件，以及在 CI 服务器上构建插件分发并将其发布到 JetBrains Marketplace。

如果您的项目需要任何上述功能，请参阅使用 Gradle 开发插件了解更多详细信息。

# 参考资料

https://plugins.jetbrains.com/docs/intellij/themes-getting-started.html#gradle-based-theme-project

* any list
{:toc}