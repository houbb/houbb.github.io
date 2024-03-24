---
layout: post
title: blog-engine-09-nuxt
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

# nuxt

Nuxt是一个免费且开源的框架，提供直观且可扩展的方式来创建基于Vue.js的类型安全、高性能和生产级别的全栈网站和应用程序。

它提供了许多功能，使得构建快速、SEO友好和可扩展的Web应用程序变得轻松，包括：

- 服务器端渲染、静态站点生成、混合渲染和边缘渲染

- 带有代码分割和预取的自动路由

- 数据获取和状态管理

- SEO优化和元标签定义

- 组件、组合和实用工具的自动导入

- 无需配置的TypeScript

- 使用我们的server/目录进行全栈开发

- 通过200多个模块进行扩展

- 部署到各种托管平台

- ...等等 🚀

## 🚀 入门指南

使用以下命令创建一个新的入门项目。这将创建一个带有所有必要文件和依赖项的入门项目：

```bash
npx nuxi@latest init <my-project>
```

> 还可以发现 [nuxt.new](https://nuxt.new)：在 CodeSandbox、StackBlitz 或本地打开一个 Nuxt 入门项目，几秒钟内即可开始运行。

## 💻 Vue 开发

简单、直观且强大，Nuxt 让您以合理的方式编写 Vue 组件。每个重复的任务都是自动化的，因此您可以放心地专注于编写全栈 Vue 应用程序。

`app.vue` 示例：

```vue
<script setup lang="ts">
useSeoMeta({
  title: '遇见 Nuxt',
  description: '直观的 Vue 框架。'
})
</script>

<template>
  <div id="app">
    <AppHeader />
    <NuxtPage />
    <AppFooter />
  </div>
</template>

<style scoped>
#app {
  background-color: #020420;
  color: #00DC82;
}
</style>
```

## 📖 文档

我们强烈建议您查看 [Nuxt 文档](https://nuxt.com/docs) 来提升技能。

这是一个了解框架更多信息的好资源。它涵盖了从入门到高级主题的所有内容。

## 🧩 模块

探索我们的 [模块列表](https://nuxt.com/modules) 来加速您的 Nuxt 项目，这些模块是由

# windows 实际测试

## 初始化

创建文件夹：

```bat
d:
mkdir D:\blogs\nuxt
cd D:\blogs\nuxt
```

初始化：

```sh
npx nuxi@latest init test
```

报错：

```
[19:02:41]  ERROR  Error: Failed to download template from registry: Failed to download https://raw.githubusercontent.com/nuxt/starter/templates/templates/v3.json: TypeError: fetch failed
```

网络不同，暂时不看了。


# 参考资料

https://github.com/nuxt/nuxt?tab=readme-ov-file

* any list
{:toc}