---
layout: post
title: cross-plateform 跨平台应用程序-06-uni-app 介绍
date: 2024-09-05 21:01:55 +0800
categories: [WEB]
tags: [web, cross-plateform, uni-app, sh]
published: true
---

# 跨平台系列

[cross-plateform 跨平台应用程序-01-概览](https://houbb.github.io/2024/09/05/cross-plateform-01-overview)

[cross-plateform 跨平台应用程序-02-有哪些主流技术栈？](https://houbb.github.io/2024/09/05/cross-plateform-02-framework-overview)

[cross-plateform 跨平台应用程序-03-如果只选择一个框架，应该选择哪一个?](https://houbb.github.io/2024/09/05/cross-plateform-03-framework-only-one)

[cross-plateform 跨平台应用程序-04-React Native 介绍](https://houbb.github.io/2024/09/05/cross-plateform-04-framework-reactive-native)

[cross-plateform 跨平台应用程序-05-Flutter 介绍](https://houbb.github.io/2024/09/05/cross-plateform-05-framework-flutter)

[cross-plateform 跨平台应用程序-06-uni-app 介绍](https://houbb.github.io/2024/09/05/cross-plateform-06-framework-uni-app)

[cross-plateform 跨平台应用程序-07-Taro 介绍](https://houbb.github.io/2024/09/05/cross-plateform-07-framework-taro)

[cross-plateform 跨平台应用程序-08-Ionic 介绍](https://houbb.github.io/2024/09/05/cross-plateform-08-framework-Ionic)

[cross-plateform 跨平台应用程序-09-phonegap/Apache Cordova 介绍](https://houbb.github.io/2024/09/05/cross-plateform-09-framework-phonegap)

[cross-plateform 跨平台应用程序-10-naitvescript 介绍](https://houbb.github.io/2024/09/05/cross-plateform-10-framework-naitvescript)


# uni-app

## 是什么？

uni-app 是一个使用 Vue.js 开发所有前端应用的框架，开发者编写一次代码，可发布到 iOS、Android、Web（响应式）、以及各种小程序（微信/支付宝/百度/头条/飞书/QQ/快手/京东/美团/钉钉/淘宝）、快应用等多个平台。

## 特点

1. 使用 Vue.js 开发：uni-app 基于 Vue.js，这意味着如果你已经熟悉 Vue.js，那么你将能够轻松上手 uni-app 开发。

2. 多端适配：支持编译到多个平台，包括但不限于 iOS、Android、Web、各种小程序和快应用。

3. 性能优异：在编译到 iOS 和 Android 应用时，uni-app 使用原生渲染，性能接近原生开发。

4. 统一的 API 调用：提供了统一的 API 接口，使得开发者无需关心不同平台的差异，可以写出一次调用多端运行的代码。

5. 条件编译和平台特有代码：支持条件编译和编写平台特有代码，以处理不同平台的特定需求。

# uni-app 核心实现原理？

uni-app 能够实现跨平台的核心原理主要基于以下几个关键技术和设计决策：

1. 使用 Vue.js 作为开发框架：
   - uni-app 采用 Vue.js 作为基础框架，利用其响应式和组件化的特点来构建用户界面。

2. 条件编译和平台特有代码：
   - 开发者可以使用条件编译指令来编写特定平台的代码，这样可以让应用在不同平台上实现特定的功能或优化。

3. WebView 和原生渲染的结合：
   - 在 Web 端，uni-app 使用 WebView 来渲染页面。
   - 在 iOS 和 Android 等平台上，uni-app 通过编译为原生应用，使用原生组件进行渲染，以保证性能。

4. 框架和平台的兼容性：
   - uni-app 设计了一套框架来兼容不同平台的布局、组件和 API，使得开发者可以编写一次代码，然后在多个平台上运行。


# 学习资料

[uni-app 官网](https://zh.uniapp.dcloud.io/quickstart-cli.htm) 

[uni-app 官方资源](https://uniapp.dcloud.io/resource) 

# 参考资料

* any list
{:toc}