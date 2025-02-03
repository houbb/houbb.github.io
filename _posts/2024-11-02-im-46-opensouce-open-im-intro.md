---
layout: post
title: IM 即时通讯系统-46-OpenIM 提供了专为开发者设计的开源即时通讯解决方案
date: 2024-11-02 21:01:55 +0800
categories: [IM]
tags: [im, opensource, sh]
published: true
---

# IM 开源系列

[IM 即时通讯系统-41-开源 野火IM 专注于即时通讯实时音视频技术，提供优质可控的IM+RTC能力](https://houbb.github.io/2024/11/02/im-41-opensouce-yehuo-overview)

[IM 即时通讯系统-42-基于netty实现的IM服务端,提供客户端jar包,可集成自己的登录系统](https://houbb.github.io/2024/11/02/im-42-opensouce-yuanrw-im-intro)

[IM 即时通讯系统-43-简单的仿QQ聊天安卓APP](https://houbb.github.io/2024/11/02/im-43-opensouce-xiuweikang-im)

[IM 即时通讯系统-44-仿QQ即时通讯系统服务端](https://houbb.github.io/2024/11/02/im-44-opensouce-kingston-csj-im)

[IM 即时通讯系统-45-merua0oo0 IM 分布式聊天系统](https://houbb.github.io/2024/11/02/im-45-opensouce-merua0oo0-im)

[IM 即时通讯系统-46-OpenIM 提供了专为开发者设计的开源即时通讯解决方案](https://houbb.github.io/2024/11/02/im-46-opensouce-open-im-intro)

[IM 即时通讯系统-47-beardlessCat IM 使用netty开发分布式Im，提供分布netty集群解决方案](https://houbb.github.io/2024/11/02/im-47-opensouce-beardlessCat-im-intro)

[IM 即时通讯系统-48-aurora-imui 是个通用的即时通讯（IM）UI 库，不特定于任何 IM SDK](https://houbb.github.io/2024/11/02/im-48-opensouce-aurora-imui-intro)

[IM 即时通讯系统-49-云信 IM UIKit 是基于 NIM SDK（网易云信 IM SDK）开发的一款即时通讯 UI 组件库，包括聊天、会话、圈组、搜索、群管理等组件](https://houbb.github.io/2024/11/02/im-49-opensouce-nim-uikit-android-intro)

[IM 即时通讯系统-50-📲cim(cross IM) 适用于开发者的分布式即时通讯系统](https://houbb.github.io/2024/11/02/im-50-opensouce-cim-intro)

[IM 即时通讯系统-51-MPush开源实时消息推送系统](https://houbb.github.io/2024/11/02/im-51-opensouce-mpush-intro)

[IM 即时通讯系统-52-leo-im 服务端](https://houbb.github.io/2024/11/02/im-52-opensouce-leo-im-intro)

[IM 即时通讯系统-53-im system server](https://houbb.github.io/2024/11/02/im-53-opensouce-linyu-intro)

# IM

https://github.com/openimsdk/open-im-server

## :busts_in_silhouette: 加入我们的社区

+ 💬 [关注我们的 Twitter](https://twitter.com/founder_im63606)
+ 🚀 [加入我们的 Slack](https://join.slack.com/t/openimsdk/shared_invite/zt-2hljfom5u-9ZuzP3NfEKW~BJKbpLm0Hw)
+ :eyes: [加入我们的微信群](https://openim-1253691595.cos.ap-nanjing.myqcloud.com/WechatIMG20.jpeg)

## Ⓜ️ 关于 OpenIM

与Telegram、Signal、Rocket.Chat等独立聊天应用不同，OpenIM提供了专为开发者设计的开源即时通讯解决方案，而不是直接安装使用的独立聊天应用。OpenIM由OpenIM SDK和OpenIM Server两大部分组成，为开发者提供了一整套集成即时通讯功能的工具和服务，包括消息发送接收、用户管理和群组管理等。总体来说，OpenIM旨在为开发者提供必要的工具和框架，帮助他们在自己的应用中实现高效的即时通讯解决方案。

![App-OpenIM 关系](./docs/images/oepnim-design.png)

## 🚀 OpenIMSDK 介绍

**OpenIMSDK** 是为 **OpenIMServer** 设计的IM SDK，专为集成到客户端应用而生。

它支持多种功能和模块：

+ 🌟 主要功能：
  - 📦 本地存储
  - 🔔 监听器回调
  - 🛡️ API封装
  - 🌐 连接管理

+ 📚 主要模块：
  1. 🚀 初始化及登录
  2. 👤 用户管理
  3. 👫 好友管理
  4. 🤖 群组功能
  5. 💬 会话处理

它使用 Golang 构建，并支持跨平台部署，确保在所有平台上提供一致的接入体验。

👉 **[探索 GO SDK](https://github.com/openimsdk/openim-sdk-core)**

## 🌐 OpenIMServer 介绍

+ **OpenIMServer** 的特点包括：

  - 🌐 微服务架构：支持集群模式，包括网关(gateway)和多个rpc服务。

  - 🚀 多样的部署方式：支持源代码、Kubernetes或Docker部署。

  - 海量用户支持：支持十万级超大群组，千万级用户和百亿级消息。

### 增强的业务功能：

+ **REST API**：为业务系统提供REST API，增加群组创建、消息推送等后台接口功能。

+ **Webhooks**：通过事件前后的回调，向业务服务器发送请求，扩展更多的业务形态。

  ![整体架构](https://github.com/openimsdk/open-im-server/raw/main/docs/images/architecture-layers.png)

## :rocket: 快速入门

在线体验iOS/Android/H5/PC/Web：

👉 **[OpenIM在线演示](https://www.openim.io/en/commercial)**

为了便于用户体验，我们提供了多种部署解决方案，您可以根据以下列表选择适合您的部署方式：

+ **[源代码部署指南](https://docs.openim.io/guides/gettingStarted/imSourceCodeDeployment)**
+ **[Docker 部署指南](https://docs.openim.io/guides/gettingStarted/dockerCompose)**

## 系统支持

支持 Linux、Windows、Mac 系统以及 ARM 和 AMD CPU 架构。

## :link: 相关链接

  + **[开发手册](https://docs.openim.io/)**
  + **[更新日志](https://github.com/openimsdk/open-im-server/blob/main/CHANGELOG.md)**

## :writing_hand: 如何贡献

我们欢迎任何形式的贡献！在提交 Pull Request 之前，请确保阅读我们的[贡献者文档](https://github.com/openimsdk/open-im-server/blob/main/CONTRIBUTING.md)

  + **[报告 Bug](https://github.com/openimsdk/open-im-server/issues/new?assignees=&labels=bug&template=bug_report.md&title=)**
  + **[提出新特性](https://github.com/openimsdk/open-im-server/issues/new?assignees=&labels=enhancement&template=feature_request.md&title=)**
  + **[提交 Pull Request](https://github.com/openimsdk/open-im-server/pulls)**

感谢您的贡献，一起来打造强大的即时通讯解决方案！

## :closed_book: 许可证

  OpenIMSDK 在 Apache License 2.0 许可下可用。
  
  查看[LICENSE 文件](https://github.com/openimsdk/open-im-server/blob/main/LICENSE)了解更多信息。

# 参考资料

* any list
{:toc}