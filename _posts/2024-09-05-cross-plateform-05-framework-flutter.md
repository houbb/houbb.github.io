---
layout: post
title: cross-plateform 跨平台应用程序-05-Flutter 介绍
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


# Flutter

## 是什么？

Flutter 是由 Google 开发的一个开源移动应用开发框架，它允许开发者使用一套代码库来构建跨平台的移动、Web、桌面和嵌入式设备应用程序。

## 特点

1. 跨平台支持：Flutter 允许开发者用 Dart 语言编写代码，然后编译为原生 ARM 代码，支持 iOS、Android、Windows、macOS 和 Linux 平台。

2. 高性能：Flutter 使用自己的高性能渲染引擎，不依赖于平台的原生控件，这意味着它可以提供流畅的 60fps 的动画和过渡效果。

3. Dart 语言：Flutter 使用 Dart 语言，它是一种面向对象、类定义的语言，支持异步编程和流，适合构建现代的、响应式的应用程序。

4. 渐进式 Web 应用：Flutter 支持创建渐进式 Web 应用（PWA），这意味着它可以在现代浏览器中运行，提供类似原生应用的体验。

# Flutter 核心原理

Flutter 跨平台的核心实现原理主要基于以下几个关键技术和设计决策：

1. 自绘 UI 渲染引擎：
   Flutter 使用自己的 Skia 渲染引擎来绘制用户界面，而不是依赖于操作系统的原生控件。这意味着 Flutter 应用的 UI 组件在不同平台上都是一致的，因为它们都是由 Flutter 的渲染引擎绘制的。

2. Dart 语言：
   Flutter 应用是用 Dart 语言编写的。Dart 是一种面向对象的编程语言，支持异步编程和流，这使得 Flutter 应用能够以高效和响应式的方式运行。

3. Widget 树：
   Flutter 使用一个 Widget 树来构建用户界面。Widget 是 Flutter 中的基本构建块，它们可以是可复用的 UI 组件。Widget 树中的每个节点都是一个 Widget，它们定义了应用的布局和外观。

4. 响应式编程模型：
   Flutter 采用了响应式编程模型，这意味着当应用的状态发生变化时，Flutter 会重新构建 Widget 树，并只更新那些发生变化的部分。这种模型提高了性能，因为它避免了不必要的渲染。

5. 平台通道：
   Flutter 通过平台通道与操作系统进行通信。这些通道允许 Flutter 应用调用原生平台的代码，以访问特定平台的功能和服务。这样，即使 Flutter 使用自己的渲染引擎，它仍然可以集成原生功能。

6. 编译到原生代码：
   Flutter 应用最终被编译成原生代码（ARM 或 x86），这意味着它们可以直接在目标设备上运行，而不需要中间层。这提高了应用的性能和响应速度。

# 学习资料

## Flutter 跨平台的相关学习资料，给出网址

Flutter 是一个流行的跨平台 UI 框架，它允许开发者使用 Dart 语言编写代码，快速构建出具有美观 UI 界面、高性能、高稳定性、高帧率、低延迟的跨平台移动应用。以下是一些推荐的学习资源：

1. 《Flutter实战·第二版》：这本书由 Flutter 中国社区的杜文（网名 wendux）撰写，系统地介绍了 Flutter 技术。它包括入门、进阶和实例三部分，适合不同水平的开发者。你可以在 [Flutter实战的官网](https://book.flutterchina.club/) 阅读或购买。 

2. 慕课手记：提供了关于 Flutter 跨平台开发的教程，包括快速入门、基本组件与布局、状态管理和导航路由等关键概念。通过实战案例，演示如何使用状态管理库如 Provider 和 Bloc 实现应用状态的高效管理。教程地址：[慕课手记 - Flutter跨平台教程](https://www.imooc.com/article/347967) 

3. 腾讯云开发者社区：提供了关于 Flutter 跨平台运行原理的介绍，包括 Flutter 的选型、简介和运行原理。文章还讨论了 Flutter 的架构和关键技术，如 Skia 和 Dart。教程地址：[腾讯云 - 10分钟了解Flutter跨平台运行原理](https://cloud.tencent.com/developer/article/1883377) 

4. 中国大学MOOC：提供了一门课程《跨平台移动应用开发——Flutter实践》，这门课程适合想入门跨平台开发的学习者，旨在帮助学习者掌握 Flutter 的开发技术，并提高实际项目开发水平。课程地址：[中国大学MOOC - 跨平台移动应用开发](https://www.icourse163.org/course/NNUTC-1463940162) 

5. Flutter 官方文档：提供了关于如何使用 Flutter 进行多平台应用开发的详细介绍，包括 Flutter 2 的新特性和如何为 web 应用和多屏设备类型提供支持。文档地址：[Flutter - 借助 Flutter 顺畅地开发多平台应用](https://docs.flutter.cn/posts/seamless-multi-platform-app-development-with-flutter/) 

# 参考资料

https://www.51cto.com/article/781506.html

* any list
{:toc}