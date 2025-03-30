---
layout: post
title: vuepress-00-入门介绍
date: 2025-3-30 12:56:46 +0800
categories: [Vue]
tags: [vue, blog, sh]
published: true
---

# vuepress

## 介绍

VuePress 是一个以 Markdown 为中心的静态网站生成器。你可以使用 Markdown 来书写内容（如文档、博客等），然后 VuePress 会帮助你生成一个静态网站来展示它们。

VuePress 诞生的初衷是为了支持 Vue.js 及其子项目的文档需求，但是现在它已经在帮助大量用户构建他们的文档、博客和其他静态网站。

## 它是如何工作的？

一个 VuePress 站点本质上是一个由 Vue 和 Vue Router 驱动的单页面应用 (SPA)。

路由会根据你的 Markdown 文件的相对路径来自动生成。每个 Markdown 文件都通过 markdown-it 编译为 HTML ，然后将其作为 Vue 组件的模板。因此，你可以在 Markdown 文件中直接使用 Vue 语法，便于你嵌入一些动态内容。

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

这两个项目同样都是基于 Vue，然而它们都是完全的运行时驱动，因此对 SEO 不够友好。

如果你并不关注 SEO，同时也不想安装大量依赖，它们仍然是非常好的选择！

### Hexo

Hexo 一直驱动着 Vue 2.x 的文档。Hexo 最大的问题在于他的主题系统太过于静态以及过度地依赖纯字符串，而我们十分希望能够好好地利用 Vue 来处理我们的布局和交互。

同时，Hexo 在配置 Markdown 渲染方面的灵活性也不是最佳的。

### GitBook

过去我们的子项目文档一直都在使用 GitBook 。 

GitBook 最大的问题在于当文件很多时，每次编辑后的重新加载时间长得令人无法忍受。

它的默认主题导航结构也比较有限制性，并且，主题系统也不是 Vue 驱动的。

GitBook 背后的团队如今也更专注于将其打造为一个商业产品而不是开源工具。


# 快速开始

## 安装

依赖环境

Node.js v18.19.0+

包管理器，如 pnpm、yarn、npm 等。

提示

使用 pnpm 时，你需要安装 vue 作为 peer-dependencies 。

使用 yarn 2+ 时，你需要在 .yarnrc.yml 文件中设置 nodeLinker: 'node-modules' 。


## 创建项目

通过命令行创建

```
npm init vuepress vuepress-starter
```

### 选择

```
D:\blogs>npm init vuepress vuepress-starter
? Select a language to display / 选择显示语言 简体中文
? 选择包管理器 npm
? 你想要使用哪个打包器？ vite
? 你想要创建什么类型的项目？ blog
生成 package.json...
? 设置应用名称 my-vuepress-site
? 设置应用版本号 0.0.1
? 设置应用描述 A VuePress project
? 设置协议 MIT
? 是否需要一个自动部署文档到 GitHub Pages 的工作流？ Yes
生成模板...
? 选择你想使用的源 当前源
安装依赖...
这可能需要数分钟，请耐心等待.
我们无法正确输出子进程的进度条，所以进程可能会看似未响应

added 235 packages in 15s

71 packages are looking for funding
  run `npm fund` for details
模板已成功生成!
? 是否想要现在启动 Demo 查看? Yes
启动开发服务器...
启动成功后，请在浏览器输入给出的开发服务器地址(默认为 'localhost:8080')

> my-vuepress-site@0.0.1 docs:dev
> vuepress dev docs


  vite v6.1.2 dev server running at:

  ➜  Local:   http://localhost:8080/
```


### 报错

启动报错

```
[plugin:vite:css] Preprocessor dependency "sass-embedded" not found. Did you install it? Try `npm install -D sass-embedded`.
```

我们到项目目录下，执行 `npm install -D sass-embedded`

重新启动

```
npm run docs:dev 
```

重新打开 [http://localhost:8080/](http://localhost:8080/) 可以看到。

# 构建你的网站

运行 docs:build 脚本可以构建你的网站：

```
npm run docs:build
```

在 docs/.vuepress/dist 目录中可以找到构建生成的静态文件。

你可以查看 部署 来了解如何部署你的网站。

# 部署到 github

## base

如果你准备发布到 `https://<USERNAME>.github.io/` ，你可以省略这一步，因为 base 默认就是 "/" 。

如果你准备发布到 `https://<USERNAME>.github.io/<REPO>/` ，也就是说你的仓库地址是 `https://github.com/<USERNAME>/<REPO>` ，则将 base 设置为 `/<REPO>/`。

在 docs/.vuepress/config.js 中设置正确的 base 在 docs/.vuepress 文件夹下创建 **config.js **，请求路径

因为我的默认创建了，所以尝试修改原来的信息。

新增一个 base，和我们的项目仓库名保持一致。

```js
export default defineUserConfig({
  lang: 'en-US',
  base: "/vuepress-starter/", 		
  title: 'VuePress',
  description: 'My first VuePress Site',
```

## github workflow

创建 `.github/workflows/docs.yml` 文件来配置工作流。

```yaml
name: 部署文档

on:
  push:
    branches:
      # 确保这是你正在使用的分支名称
      - main

permissions:
  contents: write

jobs:
  deploy-gh-pages:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3
        with:
          fetch-depth: 0
          # 如果你文档需要 Git 子模块，取消注释下一行
          # submodules: true



      - name: 设置 Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 20
          cache: npm

      - name: 安装依赖
        run: npm ci

      - name: 构建文档
        env:
          NODE_OPTIONS: --max_old_space_size=8192
        run: |-
          npm run docs:build
          > docs/.vuepress/dist/.nojekyll

      - name: 部署文档
        uses: JamesIves/github-pages-deploy-action@v4
        with:
          # 这是文档部署到的分支名称
          branch: gh-pages
          folder: docs/.vuepress/dist
```

提交本地变更，就会触发工作流。

然后发现一切正常，没报错，但是访问不到。

## github pages 设置

来到 https://github.com/houbb/vuepress-starter/settings/pages

Build and deployment==>source 选择 【deploy from a branch】==》gh-pages 分支 ==》`/root`

然后再次访问 [https://houbb.github.io/vuepress-starter/](https://houbb.github.io/vuepress-starter/) 一切正常。

# 参考资料

https://juejin.cn/post/7134280660880982024

https://vuepress.vuejs.org/zh/guide/deployment.html#github-pages

* any list
{:toc}