---
layout: post
title:  Vue todo-03-Layout
date:  2018-07-18 16:35:16 +0800
categories: [Vue]
tags: [vue, in action]
published: true
---

# Less

[Less](http://lesscss.org/) 是 CSS 向后兼容的语言扩展。

可以用更简洁且便于管理的方式编写 css。

> [less 教程](http://www.bootcss.com/p/lesscss/)

## 项目安装

```sh
$ npm install --save-dev less-loader style-loader less
```

## 配置 less

在 `/build/webpack.base.conf.js` 加上

```js
module.exports = {
  module: {
    rules: [
      {   //把这个对象添加在里面
        test: /\.less$/,
        use: [
          'style-loader',
          { loader: 'css-loader', options: { importLoaders: 1 } },
          'less-loader'
        ]
      }
    ]
  }
}
```

# Layout.vue (布局组件)

## layout.less

本文件放置在 **src/style** 文件夹下

- layout.less

```less

```

## 添加 vue

在 **src/components/** 目录下新增文件 `Layout.vue`

```html
<template>
  <section class="container" > <!--最外层容器-->
    <section class="menu"> <!--左边的容器-->
    </section>
    <section class="content-container"><!--右边的容器-->
    </section>
  </section>
</template>
<script>
</script>
<style lang="less" scoped>
  @import '../style/layout.less';
</style>
```

# 设置路由

`.vue` 文件是无法直接被浏览器解析的。

需要通过 [vue-router](https://router.vuejs.org/zh/) 渲染。

## vue-router

- 作用

使用 Vue.js ，我们已经可以通过组合组件来组成应用程序，当你要把 Vue Router 添加进来，
我们需要做的是，将组件 (components) 映射到路由 (routes)，然后告诉 Vue Router 在哪里渲染它们。

- 官方入门文档

[起步](https://router.vuejs.org/zh/guide/)

[命名路由](https://router.vuejs.org/zh/guide/essentials/named-routes.html)

## 修改路由

打开文件 `src/router/index.js`，文件进行修改如下：

```js
import Vue from 'vue'
import Router from 'vue-router'
import Layout from '@/components/Layout'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Layout',
      component: Layout
    }
  ]
})
```

## 访问

直接访问 [http://localhost:8080/#/](http://localhost:8080/#/) 即可查看效果。

* any list
{:toc}