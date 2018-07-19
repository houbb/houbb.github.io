---
layout: post
title:  Vue todo-03-Category
date:  2018-07-18 17:24:46 +0800
categories: [Vue]
tags: [vue, in action]
published: true
---



# 准备知识 

## 组件

> [组件基础](https://cn.vuejs.org/v2/guide/components.html)

> [局部注册](https://cn.vuejs.org/v2/guide/components-registration.html#%E5%B1%80%E9%83%A8%E6%B3%A8%E5%86%8C)

## font-awesome 

为了使用一些常用图标，本项目选择使用 [font-awesome](https://fontawesome.com/)

- 安装

```sh
$ npm install font-awesome --save-dev
```

在 `main.js` 里添加

```js
import 'font-awesome/css/font-awesome.css'
```


# Category (分类菜单组件) 

## Category.vue

```html
<template>
  <div class="list-todos">  <!--菜单容器-->
    <a class="list-todo activeListClass list" > <!--单个菜单容器-->
      <span class="fa fa-fw fa-lock" ></span>  <!--锁的图标-->
      <span class="count-list">1</span><!--数字-->
      星期一 <!--菜单内容-->
    </a>
    <a class="link-list-new" > <!--新增菜单-->
      <span class="fa fa-fw fa-plus">
      </span>
      新增
    </a>
  </div>
</template>
<script>
</script>

<style lang="less" scoped>
  @import '../style/category.less';
</style>
```

## 访问

直接访问 [http://localhost:8080/#/](http://localhost:8080/#/) 即可查看效果。

* any list
{:toc}