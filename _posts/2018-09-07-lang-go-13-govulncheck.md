---
layout: post
title:  Go Lang-12-govulncheck 漏洞检查有关的 Go 工具
date:  2018-09-07 09:51:23 +0800
categories: [Lang]
tags: [go, lang, sh]
published: true
---


# 教程：使用 govulncheck 查找并修复易受攻击的依赖项

Govulncheck 是一个低噪音工具，可帮助您查找并修复 Go 项目中易受攻击的依赖项。 

它通过扫描项目的依赖项中是否存在已知漏洞，然后识别代码中对这些漏洞的任何直接或间接调用来实现此目的。

在本教程中，您将学习如何使用 govulncheck 扫描简单程序中的漏洞。 

您还将学习如何确定漏洞的优先级和评估漏洞，以便您可以首先专注于修复最重要的漏洞。

要了解有关 govulncheck 的更多信息，请参阅 govulncheck 文档以及有关 Go 漏洞管理的博客文章。 

https://pkg.go.dev/golang.org/x/vuln/cmd/govulncheck

https://go.dev/blog/vuln

# 参考资料

https://go.dev/doc/tutorial/govulncheck

* any list
{:toc}