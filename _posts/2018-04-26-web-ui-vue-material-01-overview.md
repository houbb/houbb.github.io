---
layout: post
title: Vue Material-01-Build beautiful apps with Material Design and Vue.js
date: 2024-05-07 21:01:55 +0800
categories: [Web]
tags: [web, vue, vue-ui, ui, sh]
published: true
---


# ### 介绍

Vue Material 是 Vue.js 和 Material Design 规范之间最好的集成！您可以通过简单的 API 轻松配置它，以满足您的所有需求。

文档分为主题、组件和 UI 元素三个部分。主题部分是关于如何为您的应用程序设置主题（或编写自己的主题）的最终指南。组件和 UI 元素部分展示了实时示例，以及每个组件/资源的 API 表格。

Vue Material 文档假定您已经熟悉 Vue.js 2.5+。如果您是 Vue.js 新手，从这里开始学习可能不是最好的主意 - 先掌握基础知识，然后再回来。Vue.js 网站是您开始的最佳文档来源。

### 安装

您可以通过 NPM 或 Yarn 安装 Vue Material：

```bash
$ npm install vue-material --save
$ yarn add vue-material
```

### 可选项

为了获得最佳体验，请使用来自 Google CDN 的 Roboto 字体和 Google 图标：

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Material+Icons">
```

### 用法

要在您的应用程序中使用 Vue Material，您可以仅导入您实际使用的组件。这将使您的构建比安装完整包要更加紧凑。

#### 单独组件 Individual components

```javascript
import Vue from 'vue'
import { MdButton, MdContent, MdTabs } from 'vue-material/dist/components'
import 'vue-material/dist/vue-material.min.css'
import 'vue-material/dist/theme/default.css'

Vue.use(MdButton)
Vue.use(MdContent)
Vue.use(MdTabs)
```

虽然不推荐，但您可以使用 Vue Material 的完整包。这将导入所有组件和 UI 元素，会影响性能：

#### 完整包 Full Bundle

```javascript
import Vue from 'vue'
import VueMaterial from 'vue-material'
import 'vue-material/dist/vue-material.min.css'
import 'vue-material/dist/theme/default.css'

Vue.use(VueMaterial)
```

虽然不是推荐的做法，但您始终可以使用 CDNs 进行快速原型设计：

```html
<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <meta content="width=device-width,initial-scale=1,minimal-ui" name="viewport">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700,400italic|Material+Icons">
    <link rel="stylesheet" href="https://unpkg.com/vue-material/dist/vue-material.min.css">
    <link rel="stylesheet" href="https://unpkg.com/vue-material/dist/theme/default.css">
  </head>

  <body>
    <div id="app">
      <!-- Your code here -->
    </div>

    <script src="https://unpkg.com/vue"></script>
    <script src="https://unpkg.com/vue-material"></script>
    <script>
      Vue.use(VueMaterial.default)

      new Vue({
        el: '#app'
      })
    </script>
  </body>
</html>
```



### 全局配置

Vue Material 提供了一些全局选项用于自定义。这些选项是响应式的，您可以随时在任何地方更改它：

#### 通过 Vue 全局对象

```javascript
import Vue from 'vue'

// change single option
Vue.material.locale.dateFormat = 'dd/MM/yyyy'

// change multiple options
Vue.material = {
  ...Vue.material,
  locale: {
    ...Vue.material.locale,
    dateFormat: 'dd/MM/yyyy',
    firstDayOfAWeek: 1
  }
}
```

或者您可以在 Vue 组件中通过 this.$material 来更改它：

```js
export default {
  name: 'ChangeDateFormat',
  computed: {
    dateFormat: {
      get () {
        return this.$material.locale.dateFormat
      },
      set (val) {
        this.$material.locale.dateFormat = val
      }
    }
  }
}
```

Vue Material 提供了以下选项用于自定义：

```js
{
  // activeness of ripple effect
  ripple: true,

  theming: {},
  locale: {
    // range for datepicker
    startYear: 1900,
    endYear: 2099,

    // date format for date picker
    dateFormat: 'yyyy-MM-dd',

    // i18n strings
    days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    shortDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    shorterDays: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'],
    shorterMonths: ['J', 'F', 'M', 'A', 'M', 'Ju', 'Ju', 'A', 'Se', 'O', 'N', 'D'],

    // `0` stand for Sunday, `1` stand for Monday
    firstDayOfAWeek: 0,

    cancel: 'Cancel',
    confirm: 'Ok'
  }
}
```

# 参考资料

https://www.creative-tim.com/vuematerial/

* any list
{:toc}
 