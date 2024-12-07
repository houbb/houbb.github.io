---
layout: post
title: cross-plateform 跨平台应用程序-10-naitvescript 介绍
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

# naitvescript

## 是什么？

NativeScript 是一个开源的跨平台移动应用开发框架，它允许开发者使用 JavaScript 或 TypeScript 以及 XML 和 CSS 来构建原生移动应用。

与基于 WebView 的框架（如 Apache Cordova 或 Ionic）不同，NativeScript 直接渲染 UI 组件到原生平台，提供了更好的性能和更接近原生应用的用户体验。

## 特点

1. 原生 UI 组件：NativeScript 允许开发者使用 iOS 和 Android 的原生 UI 组件，这意味着应用的界面和交互将与平台的原生应用一致。

2. 性能：由于 NativeScript 直接与原生平台的 API 交互，它提供了更好的性能，特别是在图形渲染和动画方面。

3. 跨平台代码共享：虽然 UI 代码可能会根据不同平台有所差异，但逻辑代码可以在 iOS 和 Android 之间共享，减少了代码重复。

4. 访问原生 API：NativeScript 提供了直接访问设备原生 API 的能力，这意味着开发者可以充分利用设备的硬件功能。

5. 支持现代前端框架：NativeScript 支持与现代前端框架如 Angular 和 Vue.js 的集成，允许开发者使用这些框架的特性和最佳实践。

6. 热重载：NativeScript 支持热重载，这意味着开发者可以在应用运行时更改代码，并立即看到更改的效果，加快了开发和调试过程。

7. 原生性能的 JavaScript：NativeScript 允许开发者使用 JavaScript 或 TypeScript 编写应用逻辑，同时享受原生应用的性能。

8. CSS 布局：NativeScript 支持使用 CSS 来控制应用的布局和样式，这对于 Web 开发者来说是一个熟悉的体验。

9. 原生插件：通过 NativeScript Marketplace，开发者可以找到和使用各种原生插件，这些插件提供了对原生功能的访问。

10. 支持 TypeScript：NativeScript 支持 TypeScript，为开发者提供了更好的类型检查和代码自动完成能力。

# 核心实现原理？

核心实现原理：

1. 原生渲染引擎：NativeScript 使用原生平台的渲染引擎来绘制 UI 组件，而不是使用 WebView。这意味着在 iOS 上使用 UIKit，在 Android 上使用 Android SDK，从而保证了 UI 的原生性能和外观。

2. JavaScript 运行时：NativeScript 提供了一个 JavaScript 运行时环境，允许开发者使用 JavaScript 或 TypeScript 编写应用逻辑。这个运行时环境负责执行 JavaScript 代码并将其与原生平台的 API 交互。

3. 原生模块桥接：NativeScript 通过模块桥接技术，允许 JavaScript 代码调用原生平台的 API。开发者可以创建或使用现有的模块，这些模块封装了原生代码，并提供了 JavaScript 接口。

4. XML 布局和 CSS 样式：NativeScript 允许使用 XML 来定义用户界面布局，以及 CSS 来设计样式。这使得从 Web 开发背景的开发者可以快速上手移动应用开发。

5. 组件化开发：NativeScript 支持组件化开发，提供了丰富的 UI 组件库，这些组件可以在不同平台上提供一致的行为和外观。

6. 性能优化：NativeScript 在编译时会进行代码优化，例如死代码消除、代码压缩等，以提高应用的性能。

# naitvescript 学习资料

NativeScript 官方教程： [Tutorials | NativeScript](https://docs.nativescript.org/tutorials/) 

# 参考资料

* any list
{:toc}