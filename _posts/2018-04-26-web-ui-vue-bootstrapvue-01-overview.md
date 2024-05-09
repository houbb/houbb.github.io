---
layout: post
title: BootstrapVue-01-入门介绍
date: 2024-05-07 21:01:55 +0800
categories: [Web]
tags: [web, vue, vue-ui, ui, sh]
published: true
---

# BootstrapVue

通过BootstrapVue，您可以使用Vue.js和世界上最流行的前端CSS库Bootstrap v4，在Web上构建响应式、移动优先和ARIA可访问的项目。

Bootstrap v4是构建响应式、移动优先网站的世界上最流行的框架。

Vue.js（发音为/vjuː/，像view）是一个用于构建用户界面的渐进式框架。


### 入门指南

使用基于世界上最流行的框架 Bootstrap v4 的 BootstrapVue 来开始吧，它可以用于使用 Vue.js 构建响应式、移动优先的网站。

Vue.js 版本需要 v2.6，建议使用 v2.6.12。
Bootstrap 版本需要 v4.3.1，建议使用 v4.6.1。
Dropdowns（以及基于 dropdown 的组件）、tooltips 和 popovers 需要 Popper.js 版本 v1.16，建议使用 v1.16.1。
Toasts 需要 PortalVue 版本 v2.1，建议使用 v2.1.7。
不需要 jQuery。
查看 BootstrapVue 发布版本 v2.23.0 中的新内容。

如果你正在从之前的 v2.0.0-rc.## 发布版本迁移，请参阅 v2.0.0 迁移指南。

### 先决条件

本 BootstrapVue 文档假定您熟悉 Vue 和 Bootstrap v4 CSS。这些是学习的良好起点：

- [Vue 指南](https://vuejs.org/v2/guide/)
- [Vue API](https://vuejs.org/v2/api/)
- [Bootstrap v4.6 文档](https://getbootstrap.com/docs/4.6/getting-started/introduction/)
- 如果在 SFC（单文件组件）.vue 文件中使用了作用域样式，则需要 Vue loader scoped CSS。

文档信息：

在 BootstrapVue 文档中的许多示例中，您可能会看到类似 ml-2、py-1 等的 CSS 类的使用。这些是 Bootstrap v4.6 的实用类，用于控制填充、边距、定位等。您可以在实用类参考部分找到关于这些类的信息。

本文档中的许多示例都是实时的，并且可以进行就地编辑，以提供更丰富的学习体验（请注意，由于在 `<template>` 部分使用了 ES6 JavaScript 代码，某些示例可能在 IE 11 中无法工作）。

BootstrapVue 还提供了一个交互式游乐场，您可以在其中尝试各种组件，并将结果导出到 JSFiddle、CodePen 和/或 CodeSandbox。

### 重要的 HTML 全局设置

Bootstrap v4 CSS 使用了一些重要的全局样式和设置，当您使用它时，您需要注意到这些设置，这些设置几乎完全是针对于规范化跨浏览器样式。请参考以下各小节以获取详细信息。

#### HTML5 文档类型

Bootstrap 需要使用 HTML5 文档类型。没有它，您可能会看到一些奇怪的不完整的样式。

```html
<!doctype html>
<html lang="en">
  ...
</html>
```

#### 响应式 meta 标签

Bootstrap 首先针对移动设备进行优化，然后使用 CSS 媒体查询根据需要扩展组件。为了确保所有设备的正确呈现和触摸缩放，请在 `<head>` 中添加响应式视口 meta 标签。

```html
<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
```

### CSS 盒模型

为了在 CSS 中更直观地进行尺寸设置，全局的 box-sizing 值从 content-box 切换为 border-box。这确保填充不会影响元素的最终计算宽度，但它可能会在某些第三方软件（如谷歌地图和谷歌自定义搜索引擎）中引起问题。

在很少的情况下，如果需要覆盖它，请使用以下类似的方式：

```css
.selector-for-some-widget {
  box-sizing: content-box;
}
```

使用上面的代码片段，包括通过 ::before 和 ::after 生成的内容在内的嵌套元素将全部继承该 .selector-for-some-widget 指定的 box-sizing 设置。

在 [CSS Tricks](https://css-tricks.com/) 上了解更多关于盒模型和尺寸的信息。

### 样式重置

为了改善跨浏览器的渲染，Bootstrap v4.6 使用 Reboot 来纠正浏览器和设备之间的不一致性，同时为常见的 HTML 元素提供稍微更具见解的重置。

### 使用模块打包工具

您很可能正在使用像 Webpack、Parcel 或 rollup.js 这样的模块打包工具，它使得直接将包包含到您的项目中变得非常容易。

要做到这一点，请使用 npm 或 yarn 获取最新版本的 Vue.js、Bootstrap v4 和 BootstrapVue：

```bash
# 使用 npm
npm install vue bootstrap bootstrap-vue

# 使用 yarn
yarn add vue bootstrap bootstrap-vue
```

然后，在您的应用程序入口点（通常是 app.js 或 main.js）中注册 BootstrapVue：

```javascript
import Vue from 'vue'
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'

// 导入 Bootstrap 和 BootstrapVue CSS 文件（顺序很重要）
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

// 在整个项目中使 BootstrapVue 可用
Vue.use(BootstrapVue)
// 可选择地安装 BootstrapVue 图标组件插件
Vue.use(IconsPlugin)
```

### 自定义主题

如果您想要更改 Bootstrap 的默认样式（例如 $body-color），您必须使用 Bootstrap 和 BootstrapVue 的 scss 文件。

创建自己的 scss 文件（例如 app.scss），其中包含您的自定义定义以及最后的 2 个 @import：

```scss
// 定义变量默认值
$body-bg: #000;
$body-color: #111;

// 然后导入 Bootstrap 和 BootstrapVue 的 SCSS 文件（顺序很重要）
@import 'node_modules/bootstrap/scss/bootstrap.scss';
@import 'node_modules/bootstrap-vue/src/index.scss';
```

然后将这个单独的 scss 文件导入到您的项目中：

```javascript
import Vue from 'vue'
import { BootstrapVue } from 'bootstrap-vue'

import './app.scss'

Vue.use(BootstrapVue)
```

不要单独将各个 SCSS 文件导入到您的项目中，因为变量和函数将无法在文件之间共享。

有关主题化 Bootstrap 的信息，请查看主题化参考部分。

### Vue 导入别名

BootstrapVue 和 PortalVue 需要访问全局的 Vue 引用（通过 import Vue from 'vue'）。

如果您正在使用特定版本的 Vue（即仅运行时 vs. 编译器 + 运行时），您将需要在您的捆绑器配置中设置一个别名到 'vue'，以确保您的项目、BootstrapVue 和 PortalVue 都使用相同版本的 Vue 构建。

如果您看到诸如 "$attr 和 $listeners 是只读的" 或 "检测到多个 Vue 实例" 的错误，则需要设置别名。

示例：在 vue.config.js 中为 Vue CLI 设置 Vue 别名

```javascript
const path = require('path')

module.exports = {
  chainWebpack: config => {
    config.resolve.alias.set(
      'vue$',
      // 如果使用的是仅运行时构建
      path.resolve(__dirname, 'node_modules/vue/dist/vue.runtime.esm.js')
      // 如果使用的是完整构建的 Vue（运行时 + 编译器）
      // path.resolve(__dirname, 'node_modules/vue/dist/vue.esm.js')
    )
  }
}
```

示例：在 webpack.config.js 中设置 Vue 别名

```javascript
module.exports = {
  // ...
  resolve: {
    alias: {
      // 如果使用的是仅运行时构建
      vue$: 'vue/dist/vue.runtime.esm.js' // 'vue/dist/vue.runtime.common.js' 适用于 webpack 1
      // 如果使用的是完整构建的 Vue（运行时 + 编译器）
      // vue$: 'vue/dist/vue.esm.js'      // 'vue/dist/vue.common.js' 适用于 webpack 1
    }
  }
}
```

注意：如果您的项目有多个 webpack 配置文件（例如 webpack.config.js、webpack.renderer.config.js、webpack.vendor.config.js、webpack.server.config.js、webpack.client.config.js 等），您需要在所有这些文件中设置适当的别名。

请参阅 Vue.js 指南以获取有关为 webpack、rollup.js、Parcel 等设置别名的完整详情。

### 高级模块打包工具用法

Webpack 和 Parcel 支持在从 scss 文件导入时使用波浪号路径（~）来引入模块：

```scss
// Webpack 示例
@import '~bootstrap';
@import '~bootstrap-vue';
// Parcel 示例
@import '~bootstrap/scss/bootstrap.scss';
@import '~bootstrap-vue/src/index.scss';
```

有关如何配置资产加载以及如何解析模块的更多详细信息，请参阅模块打包工具的文档。

注意事项：

- Webpack 配置加载 CSS 文件（官方指南）
- Webpack 加载 SASS/SCSS 文件的 Loader（官方指南）
- Parcel CSS（官方指南）
- Parcel SCSS（官方指南）






# 参考资料

https://bootstrap-vue.org/

* any list
{:toc}
 