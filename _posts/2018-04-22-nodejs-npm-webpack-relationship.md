---
layout: post
title: 前端 nodejs webpack npm 之间的关系
date:  2018-04-22 09:19:44 +0800
categories: [Web]
tags: [web, js, nodejs, sh]
published: true
---

# 间接 

## node.js

[node.js](https://houbb.github.io/2018/04/23/nodejs-01-hello) 是 javascript 运行的环境，

以前只能浏览器解析js，现在直接用chrome的v8引擎封装成nodejs，实现js独立于浏览器也可以解析运行

## npm 

[npm](https://houbb.github.io/2018/04/24/npm) 是前端依赖包管理器（包含在nodejs中），类似maven，帮助下载和管理前端的包

这个下载源是外国服务器，如果想提高下载速度的话，建议更换成淘宝镜像，类似maven之于阿里云镜像。

## vue.js 

[vue](https://houbb.github.io/2018/06/14/vue-cli) 是前端框架

其他大火的前端框架：

anjularjs [React](https://houbb.github.io/2018/07/05/react-01-hello)

## WebPack 

[WebPack](https://houbb.github.io/2018/04/23/webpack-01-quick-start) 可以看做是模块打包机

它做的事情：分析你的项目结构，找到JavaScript模块以及其它的一些浏览器不能直接运行的拓展语言（Scss，TypeScript等），并将其转换和打包为合适的格式供浏览器使用。


# 历史悠久的框架

这些框架比较基础，曾经是整个前端的基石，如今也算是功成身退。

## 控制

jquery

## ui

[bootstrap]()

[semantic-ui](https://houbb.github.io/2017/03/23/semantic-ui)

# 参考资料

[node.js、npm、vue、webpack之间的关系](https://www.cnblogs.com/chudonghai/p/11325485.html)

* any list
{:toc}