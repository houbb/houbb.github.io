---
layout: post
title:  Vue-12-vue 如何自定义 component 组件
date:  2017-09-04 20:38:53 +0800
categories: [Vue]
tags: [ui, vue, learn-note, sh]
published: true
---

# 说明

暂时不基于 webpack 实现自己的 vue 应用。

# 思路1

直接通过 html 字符串指定 template 的内容。

不过这样有一个很大的缺点，就是难以维护和修改。

# 思路2

requirejs

如果不使用webpack等任何模块打包方案，可以试试requirejs模块加载方案。

requirejs有配套的加载css和html的插件，将.css，.html，.js放在一个文件夹内，可以模拟成.vue的单文件组件。

在requirejs的配置文件中配置好所有的组件，以及vue，vue-router，vuex，axios等等所需要的插件。

# 思路3

自己实现一个简单的打包程序。


# 思路 4

html 中 include 另一个 html 页面，常见模板最简单的解决方案。


# 参考资料

[如何不基于webpack, 使用vue.js构建大型应用?](https://www.zhihu.com/question/48440409)

[vue用组件插入模板html怎么实现](https://segmentfault.com/q/1010000010232772)

[html页面引入另一个html页面](https://www.jianshu.com/p/c4f18bea8cab?tdsourcetag=s_pcqq_aiomsg)

* any list
{:toc}