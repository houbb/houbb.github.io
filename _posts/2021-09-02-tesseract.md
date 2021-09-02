---
layout: post
title: tesseract Tesseract 开源 OCR 引擎
date: 2021-09-01 21:01:55 +0800
categories: [java]
tags: [java, sh]
published: true
---

# 关于

这个包包含一个 OCR 引擎 - libtesseract 和一个命令行程序 - tesseract。 

Tesseract 4 添加了一个新的基于神经网络 (LSTM) 的 OCR 引擎，该引擎专注于线条识别，但仍支持 Tesseract 3 的传统 Tesseract OCR 引擎，该引擎通过识别字符模式来工作。

通过使用旧 OCR 引擎模式 (--oem 0) 启用与 Tesseract 3 的兼容性。

它还需要支持遗留引擎的训练数据文件，例如来自 tessdata 存储库的文件。

首席开发人员是 Ray Smith。维护者是 Zdenko Podobny。有关贡献者列表，请参阅作者和 GitHub 的贡献者日志。

Tesseract 支持 unicode (UTF-8)，可以“开箱即用”识别 100 多种语言。

Tesseract 支持各种输出格式：纯文本、hOCR (HTML)、PDF、仅不可见文本的 PDF、TSV。 master 分支也有对 ALTO (XML) 输出的实验性支持。

您应该注意，在许多情况下，为了获得更好的 OCR 结果，您需要提高提供给 Tesseract 的图像的质量。

该项目不包括 GUI 应用程序。如果您需要，请参阅 3rdParty 文档。

可以训练 Tesseract 识别其他语言。有关更多信息，请参阅 Tesseract 培训。

# 历史简介

Tesseract 最初是在 1985 年至 1994 年间在 Hewlett-Packard Laboratories Bristol 和 Hewlett-Packard Co, Greeley Colorado 开发的，1996 年进行了更多更改以移植到 Windows，并在 1998 年进行了一些 C++izing。2005 年 Tesseract 开放 由惠普提供。 从 2006 年到 2018 年 11 月，它由 Google 开发。

最新的（基于 LSTM 的）稳定版本是 4.1.1，发布于 2019 年 12 月 26 日。 

最新源代码可从 GitHub 上的 master 分支获得。 可以在问题跟踪器和计划文档中找到未解决的问题。

最新的 3.0x 版本为 3.05.02，于 2018 年 6 月 19 日发布。 

3.05 的最新源代码可从 GitHub 上的 3.05 分支获得。 

这个版本没有开发，但它可以用于特殊情况（例如，参见 3.0x 的特征回归）。

有关版本的更多详细信息，请参阅发行说明和更改日志。

# 安装 Tesseract

您可以通过预先构建的二进制包安装 Tesseract，也可以从源代码构建它。

构建需要 C++17 支持。

# 运行 Tesseract

基本命令行用法：

```
tesseract imagename outputbase [-l lang] [--oem ocrenginemode] [--psm pagesegmode] [configfiles...]
```

有关各种命令行选项的更多信息，请使用 tesseract --help 或 man tesseract。

示例可以在文档中找到。

# 对于开发者

开发人员可以使用 libtesseract C 或 C++ API 来构建自己的应用程序。 

如果您需要绑定到其他编程语言的 libtesseract，请参阅 AddOns 文档中的包装器部分。

可以在 tesseract-ocr.github.io 上找到由 doxygen 从源代码生成的 Tesseract 文档。

# 支持

在提交问题之前，请查看此存储库的指南。

如需支持，请先阅读文档，尤其是常见问题解答，看看您的问题是否在那里得到解决。

如果没有，请搜索 Tesseract 用户论坛、Tesseract 开发者论坛和过去的问题，如果您仍然找不到所需的内容，请在邮件列表中寻求支持。

邮件列表：

tesseract-ocr - 适用于 tesseract 用户。

tesseract-dev - 适用于 tesseract 开发人员。

请仅针对错误报告问题，而不是提出问题。

# 参考资料

https://github.com/tesseract-ocr/tesseract

* any list
{:toc}