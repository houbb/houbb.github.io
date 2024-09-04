---
layout: post
title: 记账工具 app-01-整体构思
date: 2024-09-04 21:01:55 +0800
categories: [Life]
tags: [life, tool, sh]
published: true
---

# 说明

希望有一个简单好用的记账 app，最好可以账户共享。这样更加方便。

## 需求

- 移动端/小程序，不想开电脑

- 最好可以账户信息共享，后续优化

- 最好支持导入导出

- 简单好用，可参考鲨鱼记账等 app

- 支持天/周/月/年，分类统计。

# 开源的项目

[开源项目：模仿鲨鱼记账（iOS版）](https://github.com/378056350/bookkeeping-iOS)

[UniApp开发的记账小程序 使用ColorUI](https://gitee.com/LiangJiaXiaoJiang/uniapp-keep-accounts)

[个人记账解决方案](https://github.com/getmoneynote/moneynote-pc)

[「那样记账」——一款纯粹、轻量的记账应用](https://github.com/purezhi/MoneyKeeper)

[一款简约风格的记账app](https://github.com/LouBii/OneAccount)

[自动记账](https://github.com/AutoAccountingOrg/Qianji_auto)

[iOS 高仿Timi记账，欢迎star，THX](https://github.com/LLLaiYoung/Timi)

[简易记账APP](https://github.com/yuukidach/Ucount)

[简单、干净的记账本应用](https://github.com/coderpage/Mine)

[Android记账项目、家庭记账APP、安卓原生](https://github.com/KuoLuoC/JZ_app)

[新手Android记账app](https://github.com/terencehyz/AccountingApp)


# chat

## 如果想实现一个移动端可用的前端，技术选型怎么样比较好？为什么？

移动端前端开发有多种技术选型，每种技术都有其优势和适用场景。以下是一些常见的技术选型及其特点：

1. **原生开发**：
   - **iOS**：使用Swift或Objective-C进行开发。
   - **Android**：使用Java或Kotlin进行开发。
   - **优势**：性能最优，可以充分利用设备的所有功能，用户体验最佳。
   - **劣势**：需要为每个平台单独开发，维护成本高。

2. **跨平台开发框架**：
   - **React Native**：使用JavaScript开发，可以运行在iOS和Android上。
   - **Flutter**：使用Dart语言，提供丰富的组件和良好的性能。
   - **优势**：代码复用率高，可以同时开发iOS和Android应用，减少开发和维护成本。
   - **劣势**：可能无法完全达到原生应用的性能，某些平台特有的功能可能需要额外的工作。

3. **Web应用**：
   - **PWA（Progressive Web Apps）**：通过Service Workers、Manifest文件等技术提升Web应用的体验。
   - **优势**：开发成本低，维护简单，跨平台兼容性好。
   - **劣势**：性能和用户体验可能不如原生应用。

4. **混合应用开发**：
   - **Ionic**：基于Angular和Apache Cordova，可以打包为原生应用。
   - **优势**：结合了Web技术和原生应用的优点，开发效率高。
   - **劣势**：性能可能受到WebView的限制。

5. **小程序**：
   - **微信小程序**、**支付宝小程序**等。
   - **优势**：易于分发，用户无需下载安装，适合轻量级应用。
   - **劣势**：受限于平台，跨平台能力有限。

选择技术时，需要考虑以下因素：
- **项目需求**：应用的复杂度、性能要求、功能需求等。
- **目标用户**：用户使用的设备类型和操作系统。
- **开发资源**：团队的技术栈、开发和维护成本。
- **维护和扩展性**：应用未来的维护和扩展需求。

综合考虑这些因素，可以做出最适合项目需求的技术选型决策。

例如，如果需要高性能和最佳用户体验，可能会选择原生开发；如果需要快速开发和跨平台兼容性，可能会选择React Native或Flutter。

## uni-app 这种属于什么？

uni-app 是一种使用 Vue.js 语法进行开发，可以编译到多个平台的前端框架。它属于跨平台开发框架的一种，允许开发者编写一次代码，然后将其编译为可以在多个移动操作系统（如 iOS 和 Android）以及 Web 平台（包括 PWA、H5 等）上运行的应用。

uni-app 的特点包括：

1. **使用 Vue.js**：uni-app 基于 Vue.js，这意味着如果你熟悉 Vue.js，你可以很容易地使用 uni-app 开发应用。

2. **多端适配**：uni-app 支持编译到多个平台，包括但不限于：
   - 移动应用：iOS、Android
   - 小程序：微信、支付宝、百度、字节跳动等
   - Web应用：H5、PWA
   - PC端：支持编译为桌面应用

3. **性能优化**：uni-app 在编译为原生应用时，会使用原生渲染，以提供接近原生应用的性能。

4. **组件丰富**：uni-app 提供了丰富的组件库，这些组件在不同平台上都能保持一致的表现。

5. **开发工具**：uni-app 有自己的开发工具，支持代码提示、编译预览、真机调试等功能。

6. **社区支持**：由于 uni-app 是基于 Vue.js 的，它受益于 Vue.js 庞大的社区和生态系统。

7. **热更新**：uni-app 支持热更新，这意味着开发者可以快速迭代应用，而无需用户重新下载应用。

8. **成本效益**：对于需要同时支持多个平台的应用，使用 uni-app 可以显著减少开发和维护成本。

uni-app 适合那些希望快速开发并部署到多个平台的中小型项目，尤其是对于那些希望利用现有 Web 开发技能来构建移动应用的开发者。

然而，对于需要极致性能和深度定制的复杂应用，可能需要考虑原生开发或其他更专业的跨平台解决方案。

## 还有哪些类似于 uni-app 的这种跨端的？给出对比表格

以下是一些流行的跨平台开发框架及其特点的对比表格：

| 框架       | 技术栈       | 优点                                                         | 缺点                                                         | 适用场景                                                     | 官网/文档                                                     |
|------------|--------------|--------------------------------------------------------------|--------------------------------------------------------------|--------------------------------------------------------------|--------------------------------------------------------------|
| Flutter    | Dart         | 跨平台，高性能，丰富的组件库                                 | 学习曲线较陡峭，Widget选择困难，第三方库生态相对较小       | 需要高性能和一致UI体验的跨平台应用                         | [Flutter官网](https://flutter.dev/)                    |
| React Native | JavaScript (React) | 基于React，一次开发多端运行，热重载，社区庞大             | 性能可能不如Flutter，第三方库兼容性问题                   | 中小型应用，需要快速迭代，React开发者团队                 | [React Native官网](https://reactnative.dev/docs/getting-started)  |
| Taro       | JavaScript (React) | 遵循React语法规范，支持多端编译                            | 可能需要更多配置，部分API不支持                            | 需要在多个小程序平台和H5上运行的应用                       | [Taro官网](https://taro.jd.com/)                      |
| uni-app    | Vue.js       | 支持多平台，包括小程序，H5，App等，开发效率高               | 性能可能不如原生开发，部分平台特有的功能可能需要额外工作   | 需要快速开发并部署到多个平台的应用                         | [uni-app官网](https://uniapp.dcloud.net.cn/)          |
| Xamarin    | C#           | 直接访问原生API，共享代码，强大的.NET生态系统                | 性能可能略低，第三方库和插件支持较少                       | .NET开发者团队，需要原生API访问的应用                       | [Xamarin官网](https://www.xamarin.com/)              |
| NativeScript | JavaScript/TypeScript (Angular/Vue.js) | 支持多种前端框架，直接访问原生API，共享代码             | 社区相对较小，第三方库支持较少                             | 前端开发者，需要直接访问原生功能的应用                       | [NativeScript官网](https://www.nativescript.org/)   |
| Electron   | JavaScript (Node.js) | 构建跨平台桌面应用，使用Web技术                              | 性能和资源消耗问题，不适合移动设备                         | 需要构建桌面应用的项目                                    | [Electron官网](https://www.electronjs.org/)            |

请注意，选择框架时，应考虑项目的具体需求、团队的技术背景以及期望的应用性能。

上述表格中的信息基于搜索结果，可能随时间而变化。











# 参考资料

https://github.com/opengoofy/hippo4j

* any list
{:toc}