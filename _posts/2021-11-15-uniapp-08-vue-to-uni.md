---
layout: post
title: uniapp 跨平台框架-08-vue h5转换uni-app指南（vue转uni、h5转uni）
date: 2021-11-15 21:01:55 +0800
categories: [WEB]
tags: [web, cross-plateform, uni-app, sh]
published: true
---
 

# 转换

如果你已经有了一个基于vue开发的H5站点，想转换为uni-app。

首先注意2个前提：

1、你的web站是适合手机屏幕的；

2、你的H5代码是前后端分离的，uni-app只处理前端代码。

一切从新建一个uni-app项目开始。

然后依次进行

# 文件处理

把之前的vue web项目的前端代码copy到新项目下

如果之前的文件后缀名是.html，需要改为.vue，并注意遵循vue单文件组件SFC规范，比如必须一级根节点为template、script、style，template节点下必须且只能有一个根view节点，所有内容写在这个根view节点下。
处理页面路由

uni-app默认是小程序的路由方式，在pages.json里管理页面。

如果你使用vue rooter的话，一种是改造为pages.json方式，另一种是使用三方插件，比如vue rooter for uni-app

静态文件（如图片）挪到static目录

uni-app工程目录下有个static目录，用于存放静态文件，这个目录不编译，直接整体copy到发行代码里的。

如果你希望自定义静态资源目录，可以在 vue.config.js 中自定义。

# 标签代码处理

相同功能的组件自动转换

uni-app的标签组件与小程序相同，比如`<div>`变成了`<view>`，`<span>`变成了`<text>`。

但uni-app的编译器已经自动处理了这部分转换，如果源码中写了可自动转换的组件，在编译到非H5端时会被自动转换（再编译回到H5端时div还是div）。

- div 改成 view

- span、font 改成 text

- a 改成 navigator

- img 改成 image

- select 改成 picker

- iframe 改成 web-view

- ul、li没有了，都用view替代

区域滚动使用scroll-view，不再使用div的区域滚动处理方式

左右、上下滑动切换，有专门的swiper组件，不要使用div模拟

input的search，原来的type没用了，改成confirmtype，详见

audio组件不再推荐使用，改成api方式，背景音频api文档

之前的v-html，可以在H5端和App端（需v3编译器）使用，不能在小程序中使用。如需要在小程序使用，请使用rich-text组件或uparse扩展插件，详见

# js 代码处理

uni-app的非H5端，不管是App还是各种小程序，都不支持window、navigator、document等web专用对象。

uni-app的API与小程序保持一致，需要处理这些不同的API写法

（1）处理window api

ajax 改成 uni.request。（插件市场也有适配uni-app的axios、flyio等封装拦截器）
cookie、session.storage 没有了，改用 uni.storage 吧；local.storage 也改成 uni.storage。另外插件市场有一个垫片mp-storage，可使用之前的代码，兼容运行在uni-app上，
alert,confirm 改成 uni.showmodel
window的resize 改为了 uni.onWindowResize

（2）处理navigator api

geolocation 的定位方式改为 uni.getLocation
useragent的设备api没有了，改用uni.getSystemInfo

（3）处理dom api

如果使用标准vue的数据绑定，是不需要操作dom来修改界面内容的。如果没有使用vue数据绑定，仍然混写了jquery等dom操作，需要改为纯数据绑定
有时获取dom并不是为了修改显示内容，而是为了获取元素的长宽尺寸来做布局。此时uni-app提供了同小程序的另一种API，uni.createSelectorQuery

（4）其他js api

web中还有canvas、video、audio、websocket、webgl、webbluetooth、webnfc，这些在uni-app中都有专门的API。

（5）生命周期

uni-app补充了一批类小程序的声明周期，包括App的启动、页面的加载，详见https://uniapp.dcloud.io/collocation/frame/lifetime

vue h5一般在created或者mounted中请求数据，而在uni-app的页面中，使用onLoad或者onShow中请求数据。（组件仍然是created或者mounted）

（6）少量不常用的vue语法在非h5端仍不支持，data必须以return的方式编写，注意事项详见

注意：如果你使用了一些三方ui框架、js库，其中引用了包括一些使用了dom、window、navigator的三方库，除非你只做H5端，否则需要更换。

去uni-app的插件市场寻找替代品。

如果找不到对应库，必须使用for web的库，在App端可以使用renderjs来引入这些for web的库。

# css代码处理

uni-app发布到App(非nvue)、小程序时，显示页面仍然由webview渲染，css大部分是支持的。

但需要注意

不支持 `*` 选择器

没有body元素选择器，改用page元素选择器。（编译到非H5时，编译器会自动处理。所以不改也行）

div等元素选择器改为view、span和font改为text、a改为navigator、img改为image...（编译到非H5时，编译器会自动处理。所以不改也行）

不同端的浏览器兼容性仍然存在，避免使用太新的css语法，否则发布为App时，Android低端机（Android 4.4、5.x），会有样式错误。

当然在App端也可以引用x5浏览器内核来抹平浏览器差异。

本文是思路，不是工具。我们鼓励和欢迎开发者编写垫片API和转换器，方便更多人使用。

# 参考资料

https://ask.dcloud.net.cn/article/36174

* any list
{:toc}
