---
layout: post
title:  Vue Cli-08-HTML 和静态资源
date:  2018-06-14 15:16:10 +0800
categories: [Vue]
tags: [vue]
published: true
---

# HTML

## Index 文件

public/index.html 文件是一个会被 html-webpack-plugin 处理的模板。

在构建过程中，资源链接会被自动注入。

另外，Vue CLI 也会自动注入 resource hint (preload/prefetch、manifest 和图标链接 (当用到 PWA 插件时) 以及构建过程中处理的 JavaScript 和 CSS 文件的资源链接。

## 插值

因为 index 文件被用作模板，所以你可以使用 lodash template 语法插入内容：

`<%= VALUE %>` 用来做不转义插值；

`<%- VALUE %>` 用来做 HTML 转义插值；

`<% expression %>` 用来描述 JavaScript 流程控制。

除了被 html-webpack-plugin 暴露的默认值之外，所有客户端环境变量也可以直接使用。

例如，BASE_URL 的用法：

```html
<link rel="icon" href="<%= BASE_URL %>favicon.ico">
```

详情见：[https://cli.vuejs.org/zh/config/#publicpath](https://cli.vuejs.org/zh/config/#publicpath)

## Preload

`<link rel="preload">` 是一种 resource hint，用来指定页面加载后很快会被用到的资源，所以在页面加载的过程中，我们希望在浏览器开始主体渲染之前尽早 preload。

默认情况下，一个 Vue CLI 应用会为所有初始化渲染需要的文件自动生成 preload 提示。

这些提示会被 @vue/preload-webpack-plugin 注入，并且可以通过 chainWebpack 的 `config.plugin('preload')` 进行修改和删除。

## Prefetch

`<link rel="prefetch">` 是一种 resource hint，用来告诉浏览器在页面加载完成后，利用空闲时间提前获取用户未来可能会访问的内容。

默认情况下，一个 Vue CLI 应用会为所有作为 async chunk 生成的 JavaScript 文件 (通过动态 import() 按需 code splitting 的产物) 自动生成 prefetch 提示。

这些提示会被 @vue/preload-webpack-plugin 注入，并且可以通过 chainWebpack 的 config.plugin('prefetch') 进行修改和删除。

例子：

```js
// vue.config.js
module.exports = {
  chainWebpack: config => {
    // 移除 prefetch 插件
    config.plugins.delete('prefetch')

    // 或者
    // 修改它的选项：
    config.plugin('prefetch').tap(options => {
      options[0].fileBlacklist = options[0].fileBlacklist || []
      options[0].fileBlacklist.push(/myasyncRoute(.)+?\.js$/)
      return options
    })
  }
}
```

当 prefetch 插件被禁用时，你可以通过 webpack 的内联注释手动选定要提前获取的代码区块：

```js
import(/* webpackPrefetch: true */ './someAsyncComponent.vue')
```

webpack 的运行时会在父级区块被加载之后注入 prefetch 链接。

Prefetch 链接将会消耗带宽。

如果你的应用很大且有很多 async chunk，而用户主要使用的是对带宽较敏感的移动端，那么你可能需要关掉 prefetch 链接并手动选择要提前获取的代码区块。

## 不生成 index

当基于已有的后端使用 Vue CLI 时，你可能不需要生成 index.html，这样生成的资源可以用于一个服务端渲染的页面。

这时可以向 vue.config.js 加入下列代码：

```js
// vue.config.js
module.exports = {
  // 去掉文件名中的 hash
  filenameHashing: false,
  // 删除 HTML 相关的 webpack 插件
  chainWebpack: config => {
    config.plugins.delete('html')
    config.plugins.delete('preload')
    config.plugins.delete('prefetch')
  }
}
```

然而这样做并不是很推荐，因为：

- 硬编码的文件名不利于实现高效率的缓存控制。

- 硬编码的文件名也无法很好的进行 code-splitting (代码分段)，因为无法用变化的文件名生成额外的 JavaScript 文件。

- 硬编码的文件名无法在现代模式下工作。

你应该考虑换用 indexPath 选项将生成的 HTML 用作一个服务端框架的视图模板。

## 构建一个多页应用

不是每个应用都需要是一个单页应用。

Vue CLI 支持使用 vue.config.js 中的 pages 选项构建一个多页面的应用。

构建好的应用将会在不同的入口之间高效共享通用的 chunk 以获得最佳的加载性能。

# 参考资料

https://cli.vuejs.org/zh/guide/html-and-static-assets.html#html

* any list
{:toc}