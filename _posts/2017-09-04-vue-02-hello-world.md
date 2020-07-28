---
layout: post
title:  Vue-02-系列学习之 vue.js 是什么？
date:  2017-09-04 20:38:53 +0800
categories: [Vue]
tags: [ui, vue, learn-note, sh]
published: true
---

# Vue.js

Vue.js（读音 /vjuː/, 类似于 view） 是一套构建用户界面的渐进式框架。

Vue 只关注视图层， 采用自底向上增量开发的设计。

Vue 的目标是通过尽可能简单的 API 实现响应的数据绑定和组合的视图组件。

Vue 学习起来非常简单，本教程基于 Vue 2.1.8 版本测试。


# 知识储备

阅读本教程前，您需要了解的知识：

- HTML

- CSS

- JavaScript

本教程主要介绍了 Vue2.x 版本的使用。

> 此处双花括号和 jekyll 冲突，统一采用 `\{\{` 替代

# 第一个例子

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Vue 测试实例</title>
    <script src="https://unpkg.com/vue/dist/vue.js"></script>
</head>
<body>
<div id="hello">
    <p>\{\{ message \}\}</p>
</div>

<script>
    new Vue({
        el: '#hello',
        data: {
            message: 'Hello Vue.js!'
        }
    })
</script>
</body>
</html>
```

页面访问获取：

```
Hello Vue.js!
```


# 参考资料

[菜鸟教程](https://www.runoob.com/vue2/vue-tutorial.html)

* any list
{:toc}