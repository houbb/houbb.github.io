---
layout: post
title: cross-plateform 跨平台应用程序-04-React Native 介绍
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

# React Native

## 是什么？

React Native 是一个流行的开源框架，由 Facebook 开发，用于构建原生移动应用程序。

它允许开发者使用 JavaScript 和 React 来开发 iOS 和 Android 应用。

## 特点

1. 跨平台开发：React Native 允许开发者编写一次代码，然后将其部署到多个平台（iOS 和 Android），这大大减少了开发时间和成本。

2. 原生组件：React Native 使用原生平台的组件，这意味着应用程序能够提供与原生应用相同的性能和用户体验。

3. 热重载：开发者可以实时查看代码更改的效果，而无需重新编译应用程序，这加快了开发过程。

4. 可扩展性：React Native 支持模块化开发，开发者可以创建可重用的组件和模块，这有助于构建大型和复杂的应用程序。

# 核心原理

React Native 的跨平台核心实现原理主要基于以下几个关键技术：

1. JavaScriptCore：React Native 使用 JavaScriptCore 作为 JavaScript 引擎，它允许 JavaScript 代码在移动设备上运行。这是跨平台开发的基础，因为它使得开发者可以使用 JavaScript 来编写应用逻辑。

2. 原生组件桥接：React Native 通过桥接技术将 JavaScript 编写的代码与原生平台的 UI 组件和 API 连接起来。当 React Native 应用运行时，它会创建一个桥接层，这个桥接层负责将 JavaScript 中的调用转发到原生代码。

3. 原生模块：React Native 提供了一系列预定义的原生模块，这些模块封装了 iOS 和 Android 的原生功能。开发者可以通过 JavaScript 调用这些模块，实现与原生平台的交互。

4. UI 组件：React Native 提供了一套 UI 组件，这些组件在 iOS 和 Android 上都有对应的原生实现。这意味着开发者可以使用相同的 JavaScript 代码来描述 UI，而 React Native 会根据运行的平台渲染相应的原生 UI 组件。

5. Flexbox 布局：React Native 使用 Flexbox 作为其布局引擎，这是一种灵活的布局系统，可以轻松地在不同屏幕尺寸和方向上适应 UI。Flexbox 使得跨平台布局变得更加容易。

# 学习资料

以下是一些推荐的学习资料，可以帮助你系统地学习 React Native：

1. React Native 官方文档：这是学习 React Native 的最佳起点，提供了全面的指南和教程。你可以从基础的“Hello World”教程开始，逐步深入了解更复杂的主题。
   - [React Native 中文网](https://reactnative.cn/docs/tutorial)
   
2. React 基础：由于 React Native 基于 React，了解 React 的基础知识是非常重要的。React Native 中文网提供了关于 React 核心概念的介绍，包括组件、JSX、props 和 state。
   - [React 基础 · React Native 中文网](https://reactnative.cn/docs/next/intro-react)

3. 进阶教程：当你对 React Native 有了基本的了解后，可以探索更高级的主题，如导航、状态管理、性能优化等。
   - [React Native 中文网](https://rn.nodejs.cn/docs/tutorial)

# 参考资料

https://www.51cto.com/article/781506.html

* any list
{:toc}