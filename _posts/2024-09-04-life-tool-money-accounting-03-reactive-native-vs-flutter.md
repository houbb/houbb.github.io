---
layout: post
title: 记账工具 app-03-reactive native VS Flutter 建跨平台应用程序
date: 2024-09-04 21:01:55 +0800
categories: [Web]
tags: [Web, cross-plateform, sh]
published: true
---



# 什么是Flutter？

Flutter 是 Google 于 2018 年发布的用户界面 (UI) 软件开发套件。Flutter 可让您为多种平台和操作系统构建跨平台应用程序。

# 什么是 React Native？

React Native 是 Facebook 创建并于 2015 年发布的移动开发框架。您可以使用 React Native 开发移动、Web 和桌面应用程序。

# React Native 和 Flutter 最大的区别

Flutter 在自己的画布上渲染所有组件。

React Native 将 JavaScript 组件转换为原生组件。

因此，组件更新（例如，iOS 16）对 Flutter 应用程序没有任何影响，但对 React Native 应用程序有影响。

根据不同的立场，这可能是一件好事或坏事。例如，如果你希望你的组件保持原样，Flutter的方法将满足你的需求。

但是如果你希望你的应用程序能够跟上最新的本地组件设计，那么React Native就是最好的选择——在React Native中，这种更新会自动进行且免费。

此外，如果你不想让React Native应用程序中的组件遵循新的iOS设计（因为你想保留风格），你可以关闭自动组件更新。

但是要在Flutter中包含最新的本地组件，你必须手动更新应用程序。

# Flutter 会超越 React Native 吗？[更新]

截至 2021 年 5 月，Flutter 在流行度和使用率方面越来越接近于超越 React Native。但是让我们看看统计数据。

![流行度](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e1cc6d43ce434b3fa9ac846f9d32677a~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp?)

看看谷歌趋势结果就会发现两者之间的激烈战斗仍在继续。

在超过 React Native 两年多之后，2020 年 4 月，Flutter 成为全球搜索频率更高的查询，并将在 2023 年继续如此。

# Flutter 与 React Native：比较

## 学习曲线

似乎React Native相对于Flutter的优势在于它使用JavaScript——全球最流行的编程语言。

然而，JavaScript并不一定是最简单和最有趣的编程语言。就像木匠喜欢高质量的工具一样，开发人员也喜欢使用有趣和方便的编程语言——这样可以使工作更加愉快和有效。

那么，Flutter和React Native哪一个更容易学习？

从开发人员的角度来看，**Flutter比React Native更容易学习**。

正如我们之前提到的，JavaScript远非最友好的编程语言。它包含各种嵌套的类和其他怪癖，有时让开发人员难以理解JavaScript的运作方式，从而不必要地复杂化编码。

还有React Native作为一个框架本身。这并不是说React Native是一个糟糕的框架——事实上，许多优秀的应用程序都有它。。但是如果不熟悉一些细节，你可能会花费长时间来解决在配置开发环境时遇到的问题。

相比React Native，Flutter更加友好。

Dart作为一种编程语言比JavaScript更易于使用和理解。

Dart在范式和用法上也更接近于用于本地移动应用开发的编程语言。

因此，Flutter 在 2022 年 Stack Overflow 调查的“最受欢迎的技术——其他框架和库”类别中几乎名列前茅。

![Flutter](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7bcea503e85b47b697927c920e7efa20~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp?)

## 命令行界面 (CLI)

Flutter 还有一个命令行界面 (CLI)，它附带了 Flutter Doctor 等工具，它可以帮助设置您选择的 IDE 和 iOS 或 Android 开发。

Flutter Doctor 查找安装在本地机器上的工具并检查它们的配置。Flutter CLI 与 Flutter Doctor 相结合，可以更顺畅地为新的 Flutter 移动应用程序准备环境。

设置 React Native 需要更多经验。React Native 的入门指南没有提供足够的细节和帮助来启动一个项目。然而，React Native 有Expo。Expo 是一组工具，可以更轻松地构建 React Native 应用程序。

使用 Expo 客户端，您可以在直接在手机上构建应用程序时查看它们（无需通过 Android Studio 或 XCode）。

Expo CLI 通过提供用于开发、日志、部署、迭代、编译等的工具来促进新的 React Native 应用程序的创建。

## Flutter 与 React Native 性能比较

React Native 的架构需要一个桥接器来实现 JavaScript 与本地用户界面组件和设备特定元素（蓝牙、传感器、相机等）之间的交互。

由于基于桥接的通信，React Native 比 Flutter 慢一点。

更新，2022 年 6 月：

React Native 现在有一个新的桥接模块JSI（JavaScript 接口），它使 React Native 在组件通信方面更快。

Flutter 不依赖桥接器。相反，Flutter 的核心图形机器 Skia 在用户与应用程序交互时将 UI 编译为本机代码。

## 调试

在 React Native 中，调试可能会出现问题，尤其是当特定异常或错误源自应用程序本机部分的某个地方时。

例如，错误可能在 JavaScript 方面：在 React Native 或应用程序的代码中。

在本机方面，错误也可能来自 React Native 以及第三方库。

但是 React Native 有一个不错的调试器——Flipper。

在 Flutter 中，借助支持在 Android Studio 和 Visual Studio 中进行开发的工具，调试变得更加容易。

DevTools（来自 Chrome 浏览器）和 OEM Debugger 使它能够帮助开发人员捕获和理解错误。

还有Inspector，它可以让您检查应用程序的可视层以及它为什么看起来像这样。

## 包和库

React Native 的生态系统非常庞大，比 Flutter 大得多。这主要归功于节点包管理器 ( npm )，它是一个包存储库。npm 上托管了超过180 万个包。

Npm 已经存在了很长时间。尽管它主要面向 Web 开发（它是 JavaScript 的王国），但许多库可以很容易地适应 React Native 应用程序。

但是 npm 有一个警告 — 许多可用的 JavaScript 库质量低下并且在生产中几乎不可用，因此在为您的应用程序选择库时必须小心。

Flutter/Dart 的pub-dev存储库是一个动态增长的存储库，但它还很年轻，没有那么多现成的解决方案。

然而，当我们在 Github 上寻找 repos 时，快速搜索就会发现这两种技术的生态系统规模相似。

截至 2023 年 2 月，Flutter 有 490,413 个存储库结果，React Native UI 库有 358,036 个。

对于 Flutter，这个数字几乎翻了一番，因为在 2022 年“只有”241,632 个，而 React Native 是 232,168 个。

## 发展

技术的成熟度通常反映在广泛和积极的采用以及长期支持上。

React Native 拥有大量高质量的第三方库，并已被纳入各大品牌的技术堆栈。

不过，Flutter 正在快速追赶，我们可以说这两种技术都已经足够成熟，可以安全地用于生产。

## 文档

尽管 React Native 的存在时间比 Flutter 长得多，但 Flutter 的文档比 React Native 的文档更发达、更深入、更易于浏览。

例如，在 Flutter 的文档中，有针对不同技术背景和经验水平的开发者的“入门”部分。

## 社区

Flutter 和 React Native 都有蓬勃发展的社区，每年都会举办大量的会议、编程马拉松和活动。

您可以与专家交谈并获得帮助解决您的开发问题的社区和沟通渠道的规模怎么强调都不为过。


## 集成开发环境（IDE）

如果你愿意，你可以在好的记事本中编写移动应用程序。但在专用的集成开发环境 (IDE) 中进行开发会更加愉快和高效，该环境具有内置调试器、代码编辑器、构建自动化工具、编译器和其他方便的开发工具。

Flutter 允许开发人员选择他们的 IDE，例如 Android Studio 或 Visual Studio。例如，在 React Native 中，您可以使用 Visual Studio 或WebStorm。
对于具有一些原生 Android 开发经验的开发人员来说，在 Flutter 中工作可能会感觉更轻松，因为他们会熟悉 Android Studio，这对开发人员非常友好。

## 跨平台能力

React Native 允许开发人员通过 React 为 iOS 和 Android 以及 Web 构建应用程序。

最近，Microsoft 推出了一个很棒的项目，其中可以使用 React Native（适用于 macOS 和 Windows）编写桌面应用程序。

对于 React Native 0.71 版（最初遇到了一些麻烦），团队专注于改善默认情况下使用 TypeScript 的跨平台开发人员体验、新架构更新以及通过 Flexbox Gap 进行布局管理。此版本还提供了受网络启发的样式和可访问性道具，以跨平台调整 RN 的 API。

使用 Flutter，您可以为 Web、macOS、Windows、Linux、Android、iOS 和嵌入式系统（例如，汽车中的信息娱乐系统）开发应用程序。

Flutter 3 承诺提供真正的跨平台开发功能，SDK 允许开发人员在所有兼容平台之间共享代码。

事实上，Flutter 4 将专注于桌面应用程序开发。另一方面，Flutter 的最新版本 Flutter 3.7 通过 iOS 上的新渲染引擎和后台处理改进以及对开发人员工具和国际化以及 Material 3 支持的其他更新来提升性能。

## 热重载

热重载对于开发人员来说是一项非常方便的功能，它允许开发人员重新加载应用程序并在 UI 中查找更改。

React Native 的 hot reload 对应物是 Fast Refresh，它基本上和 Flutter 的 Hot Reload 做同样的事情。

该功能的任一版本的缺点是代码中的高级更改（例如，将无状态小部件更改为有状态小部件）无法热重新加载。复杂的更改需要重新编译应用程序。

## 编程语言

Dart 编程语言与 Java/Kotlin (Android) 非常相似，这使得来自原生移动开发的开发人员更容易学习。

JavaScript 不太直观，因此更难掌握。

## 谁在使用Flutter？

Flutter 存在于公司的技术栈中，例如：

Alibaba
BMW
eBay
Square
Groupon
CapitalOne

## 谁在使用 React Native？

React Native为许多全球知名品牌提供支持：

Uber Eats
Skype
Tesla
Coinbase
Instagram
Salesforce

## 使用Flutter和React Native相对于原生开发的优势：

非常快速地创建应用程序原型，不需要最新的原生功能。而原生开发要花费更长时间。

热重载包含在React Native和Flutter中，可以让开发人员快速得到有关布局更改的反馈。

每当您更改某些内容时，可以在无需重新编译应用程序的情况下检查其在应用程序中的外观。这大大加快了开发过程。

注：热重载也受到原生Android和iOS的支持，但是与React Native和Flutter相比，其功能受到限制。

## 使用 React Native 或 Flutter 与原生应用程序开发的缺点

尽管React Native和Flutter都是快速构建移动应用的优秀工具，但调整跨平台应用程序以适应操作系统更新时会有一定的开销（无论是iOS还是Android），而本地应用程序则会自动更新。

使用本地应用程序开发，实现出色的应用程序性能更加容易。尽管在Flutter或React Native中构建的iOS和Android应用程序的性能差异越来越不明显。

此外，在本地应用程序中实现完美的像素级设计更加简单。然而，这要求您分别为两个平台进行实现，从而增加了开发时间和成本。

另一方面，Flutter的组件（例如按钮或文本框）高度可配置，使您可以微调设计并实现完美的像素级别。

一些新功能在本地iOS和Android上可用，更容易在本地应用程序中实现。

## 结论：React Native 比 Flutter 好吗？

长期以来，CTO们一直在问React Native比Flutter好在哪里，但这个问题的参数已经在一段时间内发生了转变。

在熟练的开发者手中，React Native和Flutter都可以用来构建具有接近本地性能和外观的优秀应用程序。然而，Flutter在商业和专业开发者中的使用越来越多，这一趋势在全球范围内持续发展。

但是，选择任何一种技术时，你必须从更广泛的角度来看待它，而不仅仅是流行度或技术优缺点。

例如，在外包开发之后，你能否招到完整的Flutter开发团队来维护和发展你的应用程序？

Flutter的温和学习曲线是一项宝贵的资产，当你需要开发者快速跳入项目时，Flutter的文档配合相对较容易的Dart肯定会有所帮助。

但是不要忘记，与React Native中极受欢迎的JavaScript相比，Dart不是非常流行的编程语言。因此，难以招募到熟练的Flutter开发人员。

## 何时使用Flutter

Flutter 在以下情况下会很好地工作：

您的预算较少（无需两个团队进行原生 Android 和 iOS 开发）
您需要快速发布产品（截止日期短）
您希望拥有像素完美的设计和组件来创建出色的 UI
您需要为您的用户（桌面、移动、汽车信息娱乐）构建跨平台体验

## 何时使用 React Native

在以下情况下使用 React Native：

你有一个桌面应用程序或网站，并且可以为移动应用程序重用组件（只有一个技术栈）
您拥有一支熟悉现有资产的 JavaScript 团队，他们可以使用庞大的 npm 存储库中的插件、模块和小部件
你时间紧迫，找不到 React Native 开发团队（Flutter 开发人员目前更难找到）


# 经常问的问题

## Flutter 比 React Native 快吗？

随着 React Native 架构（JSI）的变化，React Native 在性能上已经越来越接近 Flutter。

但是 Flutter 应用程序仍然可以比 React Native 的应用程序稍微快一些（当然，这不一定是个问题，这取决于您的产品类型和它所做的工作）。

## Flutter 比 React Native 好吗？

一段时间以来，Flutter 一直在逐渐赢得 React Native 与 Flutter 流行度竞赛，这是因为它被认为更易于使用。

此外，GitHub 上报告的问题比 React Native 的解决方案多得多。

然而，市场上的 Flutter 开发人员稀缺，这是一个相当大的缺点。

因此，尽管 Flutter 相对于 React Native 有很多优势，但很难回答哪种技术更适合开发接近原生的移动应用程序。

## Flutter 是否准备好在 2023 年投入生产？

Flutter 很久以前就已经可以投入生产了。事实上，该工具允许开发人员从 Flutter 中的单个代码库构建桌面、移动和 Web 应用程序。

## Flutter 是原生的还是混合的？

Flutter 是一个 SDK，用于开发具有原生 UI 组件的混合或跨平台移动应用程序。



# 参考资料

[Flutter 与 React Native - 详细深入对比分析（2023 年）](https://juejin.cn/post/7205025712170958909)

https://www.51cto.com/article/781506.html

* any list
{:toc}