---
layout: post
title: cross-plateform 跨平台应用程序-02-有哪些主流技术栈？
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

# 主流技术栈对比

| 技术栈           | 语言                    | 开发者       | 支持平台                                                                                                                                                    | UI框架            | 优点                                                                                                                                                             | 缺点                                                                                                                                                                | 适用场景                                                                                               |
|----------------------|-----------------------------|------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------|
| React Native      | JavaScript、TypeScript       | Facebook          | iOS、Android                                                                                                                                                    | React                 | 近原生性能，广泛使用，社区活跃，支持原生代码集成，跨平台支持强                                                                                                      | 性能不如原生，特别是复杂动画和图形渲染场景                                                                                                                           | 高性能需求的移动应用开发                                                                                     |
| Flutter           | Dart                        | Google            | iOS、Android、Web、桌面                                                                                                                                         | 自定义UI引擎           | 性能接近原生，丰富的UI组件，跨平台支持广泛，适合复杂UI和动画开发                                                                                                      | Dart语言学习成本较高，应用程序包体积较大                                                                                                                              | 复杂UI/动画开发，移动端、Web、桌面跨平台应用                                                                 |
| Xamarin           | C#                          | Microsoft         | iOS、Android、Windows                                                                                                                                           | 原生UI                | .NET生态，支持原生API绑定，业务逻辑代码复用率高                                                                                                                     | 性能稍弱于React Native和Flutter，社区较小，第三方库支持有限                                                                                                          | .NET生态下的移动应用开发，跨平台业务逻辑复用                                                                 |
| Ionic             | JavaScript、TypeScript、HTML | Ionic团队         | iOS、Android、Web                                                                                                                                               | 基于Web技术的UI         | Web开发者易上手，丰富的预制UI组件，适合Web与移动端共享代码                                                                                                           | 性能较低，依赖WebView，复杂交互不如原生                                                                                                                               | 简单应用，Web和移动端共享代码的场景                                                                          |
| PhoneGap (Cordova)| JavaScript、HTML、CSS        | Apache基金会      | iOS、Android、Windows                                                                                                                                           | 基于Web技术的UI         | 快速上手，跨平台支持广泛，插件支持设备硬件访问                                                                                                                      | 性能不佳，基于WebView，复杂UI和交互表现较弱                                                                                                                           | 简单跨平台应用开发，快速原型                                                                                  |
| NativeScript      | JavaScript、TypeScript       | Progress Software | iOS、Android                                                                                                                                                    | 原生UI                | 直接调用原生API，无需WebView，性能较好，支持Vue.js和Angular                                                                                                         | 社区和插件支持较少，学习曲线较陡                                                                                                                                    | 对原生API和性能要求较高的跨平台移动应用开发                                                                  |
| Kotlin Multiplatform Mobile (KMM) | Kotlin                      | JetBrains         | iOS、Android                                                                                                                                                    | 原生UI                | Kotlin语言强大，业务逻辑代码复用率高，支持与原生代码无缝集成                                                                                                       | UI需要为每个平台单独开发，生态不成熟                                                                                                                               | Kotlin开发者，业务逻辑复用，原生UI开发场景                                                                    |
| Unity             | C#                          | Unity Technologies| iOS、Android、Web、Windows、Mac、游戏主机                                                                                                                        | 游戏引擎的UI框架        | 强大的游戏引擎，支持2D/3D开发，跨平台广泛                                                                                                                          | 非游戏应用包体积大，性能开销高                                                                                                                                        | 游戏开发和需要复杂3D渲染的应用开发                                                                           |
| uni-app           | JavaScript、Vue.js           | DCloud             | iOS、Android、Web、小程序、快应用                                                                                                                               | Vue.js                | 一次开发多端运行，基于Vue.js开发体验好，插件市场丰富，支持小程序和原生App                                                                                          | 性能比Flutter和React Native稍差，原生功能支持有限                                                                                                                    | 移动端、小程序、Web多平台统一开发                                                                            |
| Taro              | JavaScript、TypeScript、React| 京东               | iOS、Android、小程序、Web、React Native                                                                                                                         | React                 | React 生态，支持小程序和React Native，TypeScript 支持，适合多端统一开发                                                                                            | 支持的跨平台较 uni-app 少，复杂UI性能不及Flutter                                                                                                                    | 多平台小程序开发，React 生态下的移动和Web应用                                                                 |
| WePY              | JavaScript、TypeScript       | 开源项目           | 微信小程序                                                                                                                                                      | 类似Vue的组件化UI       | 类似Vue的开发模式，开发者易上手，适合小程序开发                                                                                                                     | 仅支持微信小程序，跨平台能力有限                                                                                                                                     | 专注于微信小程序的项目                                                                                       |
| MPVue             | JavaScript、Vue.js           | 美团               | 微信小程序                                                                                                                                                      | Vue.js                | 基于Vue.js，组件化、模块化开发，小程序开发效率高                                                                                                                    | 仅支持微信小程序，更新较慢                                                                                                                                            | 微信小程序的Vue.js开发                                                                                       |
| QuickApp (快应用) | JavaScript、HTML、CSS        | 华为、OPPO、小米等 | 安卓设备（国内手机厂商联盟）                                                                                                                                     | 原生UI                | 无需安装即可运行，启动速度快，接近原生性能                                                                                                                        | 仅支持安卓，针对中国市场，跨平台能力弱                                                                                                                                 | 国内安卓设备上的轻量级应用                                                                                   |

## 总结

- 性能和复杂性需求较高的应用：选择 Flutter 或 React Native。

- 有.NET生态的开发者：推荐使用 Xamarin。

- 前端背景开发者：适合选择 uni-app、Taro 或 Ionic。

- 游戏开发：推荐使用 Unity。

- 专注于小程序的开发：可选择 WePY、MPVue 或 Taro。

# 参考资料

https://github.com/opengoofy/hippo4j

https://blog.csdn.net/weixin_37600397/article/details/140050205

https://daotin.netlify.app/aklt7y.html

https://cloud.tencent.com/developer/article/2316020

* any list
{:toc}