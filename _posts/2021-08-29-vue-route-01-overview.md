---
layout: post
title: Vue Router 是什么？安装笔记
date: 2021-08-29 21:01:55 +0800
categories: [VUE]
tags: [vue, vue-router, sh]
published: true
---

# 介绍

Vue Router 是 Vue.js 的官方路由。

它与 Vue.js 核心深度集成，让用 Vue.js 构建单页应用变得轻而易举。

功能包括：

- 嵌套路由映射

- 动态路由选择

- 模块化、基于组件的路由配置

- 路由参数、查询、通配符

- 展示由 Vue.js 的过渡系统提供的过渡效果

- 细致的导航控制

- 自动激活 CSS 类的链接

- HTML5 history 模式或 hash 模式

- 可定制的滚动行为

- URL 的正确编码

- 入门或使用 playground (详见README.md来运行它们)。

# 安装

## 直接下载 / CDN

```
https://unpkg.com/vue-router@4
```

Unpkg.com 提供了基于 npm 的 CDN 链接。上述链接将始终指向 npm 上的最新版本。 

你也可以通过像 `https://unpkg.com/vue-router@3.0.0/dist/vue-router.js` 这样的 URL 来使用特定的版本或 Tag。

## npm

```
npm install vue-router@4
```

## 开发版本构建

如果你想使用最新的开发版本，你需要直接从 GitHub 上克隆并自己构建 vue-router。

```
git clone https://github.com/vuejs/vue-router.git node_modules/vue-router
cd node_modules/vue-router
npm install
npm run build
```

# 参考资料

https://next.router.vuejs.org/zh/introduction.html

* any list
{:toc}