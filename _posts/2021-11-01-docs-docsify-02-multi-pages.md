---
layout: post
title: docsify-02-多页
date: 2021-10-12 21:01:55 +0800
categories: [Doc]
tags: [doc, tool, front-end, sh]
published: true
---

# 多页文档

如果需要创建多个页面，或者需要多级路由的网站，在 docsify 里也能很容易的实现。

例如创建一个 guide.md 文件，那么对应的路由就是 `/#/guide`。

假设你的目录结构如下：

```
.
└── docs
    ├── README.md
    ├── guide.md
    └── zh-cn
        ├── README.md
        └── guide.md
```

那么对应的访问页面将是

```
docs/README.md        => http://domain.com
docs/guide.md         => http://domain.com/guide
docs/zh-cn/README.md  => http://domain.com/zh-cn/
docs/zh-cn/guide.md   => http://domain.com/zh-cn/guide
```

# 定制侧边栏

为了获得侧边栏，您需要创建自己的_sidebar.md，你也可以自定义加载的文件名。

默认情况下侧边栏会通过 Markdown 文件自动生成，效果如当前的文档的侧边栏。

首先配置 loadSidebar 选项，具体配置规则见配置项#loadSidebar。

```html
<!-- index.html -->

<script>
  window.$docsify = {
    loadSidebar: true
  }
</script>
<script src="//cdn.jsdelivr.net/npm/docsify/lib/docsify.min.js"></script>
```

接着创建 _sidebar.md 文件，内容如下

```md
<!-- docs/_sidebar.md -->

* [首页](zh-cn/)
* [指南](zh-cn/guide)
```

需要在 ./docs 目录创建 .nojekyll 命名的空文件，阻止 GitHub Pages 忽略命名是下划线开头的文件。

# 嵌套的侧边栏

你可能想要浏览到一个目录时，只显示这个目录自己的侧边栏，这可以通过在每个文件夹中添加一个 _sidebar.md 文件来实现。

_sidebar.md 的加载逻辑是从每层目录下获取文件，如果当前目录不存在该文件则回退到上一级目录。

例如当前路径为 /zh-cn/more-pages 则从 /zh-cn/_sidebar.md 获取文件，如果不存在则从 /_sidebar.md 获取。

当然你也可以配置 alias 避免不必要的回退过程。

```html
<script>
  window.$docsify = {
    loadSidebar: true,
    alias: {
      '/.*/_sidebar.md': '/_sidebar.md'
    }
  }
</script>
```

你可以在一个子目录中创建一个 README.md 文件来作为路由的默认网页。

# 用侧边栏中选定的条目名称作为页面标题

一个页面的 title 标签是由侧边栏中选中条目的名称所生成的。

为了更好的 SEO ，你可以在文件名后面指定页面标题。

```
<!-- docs/_sidebar.md -->
* [Home](/)
* [Guide](guide.md "The greatest guide in the world")
```

# 显示目录

自定义侧边栏同时也可以开启目录功能。

设置 subMaxLevel 配置项，具体介绍见 配置项#subMaxLevel。

```html
<!-- index.html -->

<script>
  window.$docsify = {
    loadSidebar: true,
    subMaxLevel: 2
  }
</script>
<script src="//cdn.jsdelivr.net/npm/docsify/lib/docsify.min.js"></script>
```

# 忽略副标题

当设置了 subMaxLevel 时，默认情况下每个标题都会自动添加到目录中。如果你想忽略特定的标题，可以给它添加 `<!-- {docsify-ignore} -->` 。

```
# Getting Started

## Header <!-- {docsify-ignore} -->

该标题不会出现在侧边栏的目录中。
```

要忽略特定页面上的所有标题，你可以在页面的第一个标题上使用 `<!-- {docsify-ignore-all} -->` 。

```
# Getting Started <!-- {docsify-ignore-all} -->

## Header

该标题不会出现在侧边栏的目录中。
```

在使用时， `<!-- {docsify-ignore} -->` 和 `<!-- {docsify-ignore-all} -->` 都不会在页面上呈现。


# 自定义导航栏

## HTML

如果你需要定制导航栏，可以用 HTML 创建一个导航栏。

注意：文档的链接都要以 `#/` 开头。

```html
<!-- index.html -->

<body>
  <nav>
    <a href="#/">EN</a>
    <a href="#/zh-cn/">中文</a>
  </nav>
  <div id="app"></div>
</body>
```

## 配置文件

那我们可以通过 Markdown 文件来配置导航。

首先配置 loadNavbar，默认加载的文件为 _navbar.md。具体配置规则见配置项#loadNavbar。

```html
<!-- index.html -->

<script>
  window.$docsify = {
    loadNavbar: true
  }
</script>
<script src="//cdn.jsdelivr.net/npm/docsify/lib/docsify.min.js"></script>
```

- _navbar.md

```md
<!-- _navbar.md -->

* [En](/)
* [中文](/zh-cn/)
```

你需要在 ./docs 目录下创建一个 .nojekyll 文件，以防止 GitHub Pages 忽略下划线开头的文件。

_navbar.md 加载逻辑和 sidebar 文件一致，从每层目录下获取。

例如当前路由为 /zh-cn/custom-navbar 那么是从 /zh-cn/_navbar.md 获取导航栏。

## 嵌套

如果导航内容过多，可以写成嵌套的列表，会被渲染成下拉列表的形式。

```md

<!-- _navbar.md -->

* 入门

  * [快速开始](zh-cn/quickstart.md)
  * [多页文档](zh-cn/more-pages.md)
  * [定制导航栏](zh-cn/custom-navbar.md)
  * [封面](zh-cn/cover.md)


* 配置
  * [配置项](zh-cn/configuration.md)
  * [主题](zh-cn/themes.md)
  * [使用插件](zh-cn/plugins.md)
  * [Markdown 配置](zh-cn/markdown.md)
  * [代码高亮](zh-cn/language-highlight.md)
```

# 整合自定义导航栏与 emoji 插件

如果你使用 emoji 插件:

```html
<!-- index.html -->

<script>
  window.$docsify = {
    // ...
  }
</script>
<script src="//cdn.jsdelivr.net/npm/docsify/lib/docsify.min.js"></script>
<script src="//cdn.jsdelivr.net/npm/docsify/lib/plugins/emoji.min.js"></script>
```

例如，你可以在自定义导航栏 Markdown 文件中使用旗帜表情：

```md
<!-- _navbar.md -->

* [:us:, :uk:](/)
* [:cn:](/zh-cn/)
```

# 封面

通过设置 coverpage 参数，可以开启渲染封面的功能。

具体用法见配置项#coverpage。

## 基本用法

封面的生成同样是从 markdown 文件渲染来的。

开启渲染封面功能后在文档根目录创建 _coverpage.md 文件。渲染效果如本文档。

- index.html

```html
<!-- index.html -->

<script>
  window.$docsify = {
    coverpage: true
  }
</script>
<script src="//cdn.jsdelivr.net/npm/docsify/lib/docsify.min.js"></script>
```

- _coverpage.md

```md
<!-- _coverpage.md -->

![logo](_media/icon.svg)

# docsify <small>3.5</small>

> 一个神奇的文档网站生成器。

- 简单、轻便 (压缩后 ~21kB)
- 无需生成 html 文件
- 众多主题

[GitHub](https://github.com/docsifyjs/docsify/)
[Get Started](#docsify)
```

## 自定义背景

目前的背景是随机生成的渐变色，我们自定义背景色或者背景图。

在文档末尾用添加图片的 Markdown 语法设置背景。

- _coverpage.md

```md
<!-- _coverpage.md -->

# docsify <small>3.5</small>

[GitHub](https://github.com/docsifyjs/docsify/)
[Get Started](#quick-start)

<!-- 背景图片 -->

![](_media/bg.png)

<!-- 背景色 -->

![color](#f0f0f0)
```

## 封面作为首页

通常封面和首页是同时出现的，当然你也是当封面独立出来通过设置 onlyCover 选项。

## 多个封面

如果你的文档网站是多语言的，或许你需要设置多个封面。

例如你的文档目录结构如下

```
.
└── docs
    ├── README.md
    ├── guide.md
    ├── _coverpage.md
    └── zh-cn
        ├── README.md
        └── guide.md
        └── _coverpage.md
```

那么你可以这么配置

```js
window.$docsify = {
  coverpage: ['/', '/zh-cn/']
};
```

或者指定具体的文件名

```js
window.$docsify = {
  coverpage: {
    '/': 'cover.md',
    '/zh-cn/': 'cover.md'
  }
};
```

# 参考资料

https://docsify.js.org/#/zh-cn/quickstart

* any list
{:toc}