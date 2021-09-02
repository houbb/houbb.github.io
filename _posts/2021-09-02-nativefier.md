---
layout: post
title: nativefier 使任何网页成为桌面应用程序
date: 2021-09-01 21:01:55 +0800
categories: [java]
tags: [java, sh]
published: true
---

# 介绍

Nativefier 是一个命令行工具，可以以最少的配置轻松地为任何网站创建桌面应用程序。 

应用程序由 Electron（在幕后使用 Chromium）包装在操作系统可执行文件（.app、.exe 等）中，以便在 Windows、macOS 和 Linux 上使用。

我这样做是因为我厌倦了在使用 Facebook Messenger 或 Whatsapp Web（HN 线程）时必须在浏览器中按 ⌘-tab 或 alt-tab，然后在众多打开的选项卡中进行搜索。 

原生特性：

自动检索应用程序图标/名称。

JavaScript 和 CSS 注入。

更多信息，请参阅 API 文档或 `nativefier --help`

# 安装

macOS 10.9+ / Windows / Linux

Node.js >= 12.9 和 npm >= 6.9

可选依赖：

ImageMagick 或 GraphicsMagick 来转换图标。 

确保 convert 和 identify 或 gm 在您的系统 $PATH 中。

Wine 在非 Windows 平台下打包 Windows 应用程序。 

确保 wine 在您的系统 $PATH 中。

然后，使用 `npm install -g nativefier` 全局安装 Nativefier

# 用法

要为 medium.com 创建本机桌面应用程序，只需 nativefier "medium.com"

Nativefier 将尝试确定应用程序名称以及许多其他选项。 

如果需要，可以覆盖这些选项。 

例如，要覆盖名称， nativefier --name 'My Medium App' 'medium.com'

阅读 API 文档或运行 nativefier --help 以了解可用于配置打包应用程序的其他命令行标志。

要默认为应用程序/域使用高分辨率图标，请为图标存储库做出贡献！


# 参考资料

https://github.com/nativefier/nativefier

* any list
{:toc}