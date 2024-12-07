---
layout: post
title: cross-plateform 跨平台应用程序-07-Taro 介绍
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

# Taro

## 是什么？

Taro 是一个由京东凹凸实验室开发的多端统一开发框架，它允许开发者使用 React 的开发方式来编写一次代码，然后将其编译成可以运行在不同端上的应用。

这些端包括微信/支付宝/百度/字节跳动小程序、H5、React Native 等。

Taro 的设计目标是提高开发效率，降低维护成本，同时保持一致的用户体验。

## 特点

1. 使用 React 开发：Taro 基于 React，允许开发者使用 React 的编程模型来构建用户界面。

2. 多端运行：开发者编写的 Taro 应用可以编译为多个平台的目标代码，实现跨平台运行。

3. 统一的组件和 API：Taro 提供了一套统一的组件和 API，使得开发者无需关心不同平台的差异。

4. 性能优化：Taro 在编译时会进行代码优化，以提供接近原生应用的性能。

5. 状态管理：Taro 与 Redux、MobX 等状态管理库兼容，方便开发者管理应用状态。

# 核心原理

Taro 跨平台的核心实现原理主要依赖于以下几个关键技术和设计决策：

1. 编译时转换：Taro 将使用 React 风格的 JSX 编写的代码编译成对应平台的原生代码。例如，对于小程序，Taro 会将 JSX 转换成对应平台的 WXML 和 WXSS。

2. React 编程模型：Taro 基于 React，利用其组件化和声明式编程的特点，使得开发者可以使用 React 的编程模型来构建用户界面。

3. 条件编译和平台特有代码：Taro 支持条件编译，允许开发者针对不同平台编写特定的代码，这为开发者提供了更大的灵活性，可以根据不同平台的特点进行优化。

4. 样式转换：Taro 将 CSS 样式转换为对应平台支持的样式。例如，在小程序中，Taro 会将 CSS 转换为 WXSS，并处理一些平台特有的样式差异。

5. JSX 转换：Taro 将 JSX 转换为对应的平台模板。在小程序中，JSX 会被转换为 WXML，而在 H5 中，则会被转换为 HTML。

# 学习资料

Taro 官方文档 [https://docs.taro.zone/docs/](https://docs.taro.zone/docs/) 

# 参考资料

[Taro 与 Taro - 详细深入对比分析（2023 年）](https://juejin.cn/post/7205025712170958909)

https://www.51cto.com/article/781506.html

* any list
{:toc}