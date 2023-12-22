---
layout: post
title:  blog-engine-04-博客引擎 hugo intro 入门介绍+安装笔记
date:   2016-04-13 23:20:27 +0800
categories: [Github]
tags: [jekyll, seo, github]
published: true
---

# hugo 博客引擎

Hugo 是一个流行的静态网站生成器，它被广泛用于创建博客和静态网站。

1. 静态网站生成器：Hugo 是一个静态网站生成器，它将你的博客内容转换为 HTML、CSS 和 JavaScript 文件，这些文件可以直接部署到 Web 服务器上。相比于动态网站，静态网站具有更快的加载速度和更高的安全性。

2. 快速高效：Hugo 被设计成非常快速和高效的静态网站生成器。它使用 Go 语言编写，采用了一些优化策略，如并行处理、增量构建等，以确保生成网站的速度和效率。

3. 简单易用：Hugo 的使用非常简单，它提供了一个简洁的命令行界面和易于理解的目录结构。你只需编写 Markdown 格式的博客文章，并使用 Hugo 的命令将其转换为静态网页。

4. 主题和布局：Hugo 提供了丰富的主题和布局选项，使你能够轻松地自定义你的博客外观。你可以选择一个现成的主题，也可以根据自己的需求创建自定义主题。

5. 多语言支持：Hugo 支持多语言功能，你可以轻松创建多语言的博客。它提供了语言文件和语言选择器等功能，方便你管理和展示多语言内容。

6. 强大的功能：Hugo 提供了许多强大的功能，如标签、分类、分页、搜索等。它还支持各种插件和扩展，可以满足不同需求的博客功能。

Hugo 是一个功能强大、快速高效且易于使用的博客引擎，适合个人博客、技术博客和静态网站的创建。

无论你是初学者还是有经验的开发者，都可以通过 Hugo 轻松地构建出专业水平的博客网站。

# hugo windows 入门例子

## require

Git

```
λ git --version
git version 2.33.1.windows.1
```

Go

```
λ go version
go version go1.21.5 windows/amd64
```

[Dart Sass: 用于做 sass 转换为 css](https://gohugo.io/hugo-pipes/transpile-sass-to-css/#dart-sass)

## install

1. 安装 Hugo。你可以从 [Hugo 官网](https://gohugo.io/) 下载 Hugo 的二进制文件，然后将其解压到你的电脑上。

windows 的话：

> [https://gohugo.io/installation/windows/](https://gohugo.io/installation/windows/)

release 地址：

> [https://github.com/gohugoio/hugo/releases/tag/v0.121.1](https://github.com/gohugoio/hugo/releases/tag/v0.121.1)

这里选择了：

https://github.com/gohugoio/hugo/releases/download/v0.121.1/hugo_0.121.1_windows-amd64.zip

下载之后解压，这是一个可执行的 exe

比如解压到：

```
C:\Users\dh\Downloads\hugo_0.121.1_windows-amd64
```

## quick start

使用 WSL 或者 git bash，我们在文件夹 `C:\Users\dh\Downloads\hugo_0.121.1_windows-amd64` 下打开命令行

```
hugo new site quickstart
cd quickstart

git init
git submodule add https://github.com/theNewDynamic/gohugo-theme-ananke.git themes/ananke
echo "theme = 'ananke'" >> hugo.toml

hugo server
```

PS: 这里 hugo.toml 估计会报错。

建议手动修改：

```toml
baseURL = 'https://example.org/'
languageCode = 'en-us'
title = 'My New Hugo Site'
theme = 'ananke'
```

如果配置了 path，就可以直接执行 hugo server。

没配置，可以指定全路径

```
C:\Users\dh\Downloads\hugo_0.121.1_windows-amd64\hugo server
```

### 主题

https://themes.gohugo.io/

## access

访问你的博客。你可以在浏览器中访问以下地址：

http://localhost:1313/

你应该会看到你的博客页面，不过默认这里 pages 是空的。

## 添加 page 页面

```
hugo new content posts/my-first-post.md
```

or

```
C:\Users\dh\Downloads\hugo_0.121.1_windows-amd64\hugo new content posts/my-first-post.md
```

创建一个新的文件。

### 修改文件内容

```md
---
title: "My First Post"
date: 2022-11-20T09:03:20-08:00
draft: true
---
## Introduction

This is **bold** text, and this is *emphasized* text.

Visit the [Hugo](https://gohugo.io) website!
```

重新执行

```
hugo server -D

# 若要显示 draft 为 true 的草稿，则用下命令
# 若要在之后网页中显示文章，则要把 draft 改为 false
```

or

```
C:\Users\dh\Downloads\hugo_0.121.1_windows-amd64\hugo server -D
```

界面还是很不错的。

![hugo](https://img-blog.csdnimg.cn/direct/8258350bb49e412f85ad826265f84827.png)

# 部署

你可以将你的 Hugo 网站部署到任何 Web 服务器上。

例如，你可以使用 [Nginx](https://www.nginx.com/) 或 [Apache](https://httpd.apache.org/) 来部署你的 Hugo 网站。

或者 github pages

# 参考资料

https://gohugo.io/getting-started/quick-start/

https://zhuanlan.zhihu.com/p/644838582

https://zhuanlan.zhihu.com/p/126298572

* any list
{:toc}