---
layout: post
title: blog-engine-08-vuepress 以 Markdown 为中心的静态网站生成器
date:   2016-04-13 23:20:27 +0800
categories: [UI]
tags: [hexo, blog, blog-engine]
published: true
---

# 拓展阅读

[blog-engine-02-通过博客引擎 jekyll 构建 github pages 博客实战笔记](https://houbb.github.io/2016/04/13/blog-engine-02-jekyll-01-install)

[blog-engine-02-博客引擎jekyll-jekyll 博客引擎介绍，常见博客引擎 jekyll/hugo/Hexo/Pelican/Gatsby/VuePress/Nuxt.js/Middleman 对比](https://houbb.github.io/2016/04/13/blog-engine-03-jekyll-02-intro)

[blog-engine-04-博客引擎 hugo intro 入门介绍+安装笔记](https://houbb.github.io/2016/04/13/blog-engine-04-hugo-intro)

[blog-engine-05-博客引擎 Hexo 入门介绍+安装笔记](https://houbb.github.io/2017/03/29/blog-engine-05-hexo)

# vuepress

VuePress 是一个以 Markdown 为中心的静态网站生成器。

你可以使用 Markdown 来书写内容（如文档、博客等），然后 VuePress 会帮助你生成一个静态网站来展示它们。

VuePress 诞生的初衷是为了支持 Vue.js 及其子项目的文档需求，但是现在它已经在帮助大量用户构建他们的文档、博客和其他静态网站。

## 它是如何工作的？

一个 VuePress 站点本质上是一个由 Vue 和 Vue Router 驱动的单页面应用 (SPA)。

路由会根据你的 Markdown 文件的相对路径来自动生成。每个 Markdown 文件都通过 markdown-it 编译为 HTML ，然后将其作为 Vue 组件的模板。

因此，你可以在 Markdown 文件中直接使用 Vue 语法，便于你嵌入一些动态内容。

在开发过程中，我们启动一个常规的开发服务器 (dev-server) ，并将 VuePress 站点作为一个常规的 SPA。如果你以前使用过 Vue 的话，你在使用时会感受到非常熟悉的开发体验。

在构建过程中，我们会为 VuePress 站点创建一个服务端渲染 (SSR) 的版本，然后通过虚拟访问每一条路径来渲染对应的 HTML 。这种做法的灵感来源于 Nuxt 的 nuxt generate 命令，以及其他的一些项目，比如 Gatsby。

## 为什么不是 ...?

### Nuxt

Nuxt 是一套出色的 Vue SSR 框架， VuePress 能做的事情，Nuxt 实际上也同样能够胜任。但 Nuxt 是为构建应用程序而生的，而 VuePress 则更为轻量化并且专注在以内容为中心的静态网站上。

### VitePress

VitePress 是 VuePress 的孪生兄弟，它同样由 Vue.js 团队创建和维护。 

VitePress 甚至比 VuePress 要更轻更快，但它在灵活性和可配置性上作出了一些让步，比如它不支持插件系统。

当然，如果你没有进阶的定制化需求， VitePress 已经足够支持你将你的内容部署到线上。

这个比喻可能不是很恰当，但是你可以把 VuePress 和 VitePress 的关系看作 Laravel 和 Lumen 。

### Docsify / Docute

这两个项目同样都是基于 Vue，然而它们都是完全的运行时驱动，因此对 SEO 不够友好。如果你并不关注 SEO，同时也不想安装大量依赖，它们仍然是非常好的选择！

### Hexo

Hexo 一直驱动着 Vue 2.x 的文档。

Hexo 最大的问题在于他的主题系统太过于静态以及过度地依赖纯字符串，而我们十分希望能够好好地利用 Vue 来处理我们的布局和交互。

同时，Hexo 在配置 Markdown 渲染方面的灵活性也不是最佳的。

### GitBook

过去我们的子项目文档一直都在使用 GitBook 。 

GitBook 最大的问题在于当文件很多时，每次编辑后的重新加载时间长得令人无法忍受。

它的默认主题导航结构也比较有限制性，并且，主题系统也不是 Vue 驱动的。

GitBook 背后的团队如今也更专注于将其打造为一个商业产品而不是开源工具。

# 在线体验

可以直接使用 [https://stackblitz.com/edit/vuepress-pamxm3?file=package.json](https://stackblitz.com/edit/vuepress-pamxm3?file=package.json) 在线体验。

# 安装

## 依赖环境

Node.js v18.16.0+

包管理器，如 pnpm、yarn、npm 等。

### 本机测试

```
>node -v
v20.10.0

>npm -v
10.2.3
```

## 创建项目

通过命令行创建

你可以通过 create-vuepress 直接创建项目模板。

创建文件夹：

```bat
d:
mkdir D:\blogs\vuepress
cd D:\blogs\vuepress
```

执行创建命令：

```
npm init vuepress vuepress-starter
```

### 配置项

根据个人需要选择：

```
D:\>cd D:\blogs\vuepress

D:\blogs\vuepress>npm init vuepress vuepress-starter
Need to install the following packages:
create-vuepress@2.0.0-rc.12
Ok to proceed? (y) y
? Select a language to display / 选择显示语言 简体中文
? 选择包管理器 npm
? 你想要使用哪个打包器？ vite
? 你想要创建什么类型的项目？ blog
生成 package.json...
? 设置应用名称 my-vuepress-site
? 设置应用版本号 0.0.1
? 设置应用描述 A VuePress project
? 设置协议 MIT
? 是否需要一个自动部署文档到 GitHub Pages 的工作流？ No
生成模板...
? 选择你想使用的源 国内镜像源
安装依赖...
这可能需要数分钟，请耐心等待.
我们无法正确输出子进程的进度条，所以进程可能会看似未响应
```

使用 demo 模式查看：

```
added 210 packages in 34s
模板已成功生成!
? 是否想要现在启动 Demo 查看? Yes
启动开发服务器...
启动成功后，请在浏览器输入给出的开发服务器地址(默认为 'localhost:8080')

> my-vuepress-site@0.0.1 docs:dev
> vuepress dev docs


  vite v5.1.6 dev server running at:

  ➜  Local:   http://localhost:8080/
  ➜  Network: http://192.168.1.6:8080/
```

## 访问

浏览器访问：

[http://localhost:8080/](http://localhost:8080/)

启动后就是非常简洁的页面，类似 vuepress 的官方风格。

# 目录结构

创建完成后，你项目的目录结构应该是这样的：


```
├─ docs
│  ├─ .vuepress
│  │  └─ config.js
│  └─ README.md
└─ package.json
```

docs 目录是你放置 Markdown 文件的地方，它同时也会作为 VuePress 的源文件目录。

docs/.vuepress 目录，即源文件目录下的 .vuepress 目录，是放置所有和 VuePress 相关的文件的地方。

当前这里只有一个配置文件。默认还会在该目录下生成临时文件、缓存文件和构建输出文件。

建议你把它们添加到 .gitignore 文件中。

- .gitignore

```
# VuePress 默认临时文件目录
.vuepress/.temp
# VuePress 默认缓存目录
.vuepress/.cache
# VuePress 默认构建生成的静态文件目录
.vuepress/dist
```

# 开始使用 VuePress

## 启动开发服务器

你可以在 package.json 中添加一些 scripts ：

```js
{
  "scripts": {
    "docs:dev": "vuepress dev docs",
    "docs:build": "vuepress build docs"
  }
}
```

运行 docs:dev 脚本可以启动开发服务器:

```sh
npm run docs:dev
```

VuePress 会在 http://localhost:8080 启动一个热重载的开发服务器。当你修改你的 Markdown 文件时，浏览器中的内容也会自动更新。

## 构建你的网站

运行 docs:build 脚本可以构建你的网站：

```sh
npm run docs:build
```

在 docs/.vuepress/dist 目录中可以找到构建生成的静态文件。你可以查看 部署 来了解如何部署你的网站。

# 小结

不得不说，感觉 vuepress 设计的非常友好，使用起来很简单，国内文档写的也很不错。

# 参考资料

https://v2.vuepress.vuejs.org/zh/guide/getting-started.html

* any list
{:toc}