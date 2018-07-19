---
layout: post
title:  Vue todo-02-Component
date:  2018-07-18 15:59:46 +0800
categories: [Vue]
tags: [vue, in action]
published: true
---

# 组件化开发

[什么叫组件化开发?](https://www.zhihu.com/question/29735633)

[vue-组件基础](https://cn.vuejs.org/v2/guide/components.html)

[vue-组件进阶](https://cn.vuejs.org/v2/guide/components-registration.html)

## 组件分类

- 接入型 

比如说一个容器组件,它里面包含了其他的组件，它本身只承担一个布局容器的作用

- 展示型 

纯展示型的数据，它能接收数据，展示出来，但是无法与用用户进行交互

- 交互型 

比如各类加强版的表单组件，通常强调复用

- 功能型 比如 `<router-view>`，`<transition>`，作为一种扩展、抽象机制存在

## 实际组件分析

| 序号 | 组件名称 | 组件类型 | 说明 |
| 1 | app.vue  | 接入型 | 最外层根组件 |
| 2 | layout.vue  | 接入型 | 布局组件 |
| 3 | category.vue  | 交互型 | 待办事件分类 |
| 4 | list.vue  | 交互型 | 待办事件列表 |
| 5 | item.vue  | 交互型 | 单个待办事件 |


# 项目初步介绍

## main.js

打开 `main.js`

```js
import Vue from 'vue'   //引入vue模块
import App from './App'  //引入vue组件
import router from './router' // 引入路由配置文件
Vue.config.productionTip = false // 关闭生产模式下给出的提示
new Vue({  // 创建一个 Vue 的根实例
  el: '#app', //挂载id,这个实例下所有的内容都会在index.html 一个id为app的div下显示
  router, // 注入路由配置。
  template: '<App/>', //配置根模板 即打开页面显示那个组件
  components: { App } // 注入组件
})
```

## `.vue`

Vue自定义了一种后缀名名字为 `.vue` 文件, 
它将 html, js, css 整合成一个文件, 和里面 template script style 三个区别分别依次对应。

```html
<template>
<!--这里写 html -->
<template/>

<script>
 export default {};
 // 这里写js
</script>

<style lang="css" scoped>
 <!--这里写css-->
</style>
```

- `.vue`

一个 `.vue` 文件就等于单独组件。
因为 `.vue` 文件是自定义的，浏览器不识别，所以要对该文件进行解析,
在 [webpack](http://webpack.github.io/) 构建中，
需要安装 [vue-loader](https://vue-loader.vuejs.org/) 对 `.vue` 文件进行解析。

- `template`

里面最外层必须是只有一个容器

- `script`

其中的 `export default {}` 即导出这个组件，外部可以引用。

- `style` 

其中的 lang 指额外表示支持的语言可以让编辑器识别, scoped 指这里写的 css 只适用于该组件。








* any list
{:toc}