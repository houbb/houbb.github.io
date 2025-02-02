---
layout: post
title: IM 即时通讯系统-49-云信 IM UIKit 是基于 NIM SDK（网易云信 IM SDK）开发的一款即时通讯 UI 组件库，包括聊天、会话、圈组、搜索、群管理等组件
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

https://github.com/netease-kit/nim-uikit-android


# 云信 IM UIKit

云信 IM UIKit 是基于网易云信 IM SDK 开发的一款即时通讯 UI 组件库，包括聊天、会话、圈组、搜索、群管理等组件。

通过 IM UIKit，可快速集成包含 UI 界面的即时通讯应用。

IM UIKit 简化了基于 NIM SDK 的应用开发过程。它不仅能助您快速实现 UI 功能，也支持调用 NIM SDK 相应的接口实现即时通讯业务逻辑和数据处理。

因此，您在使用 IM UIKit

时仅需关注自身业务或个性化扩展。

im-uikit-uniapp 界面效果如下图所示：

<img src="https://yx-web-nosdn.netease.im/common/7ffe6a8afe28b48405b41fb3313d1fa2/uniapp.png" width="800" height="550" />
<br>
<img src="https://yx-web-nosdn.netease.im/common/895963a051a2ae1fae685cfd1682a6bf/%E9%80%9A%E8%AE%AF%E6%A8%A1%E5%9D%97%E4%B8%BB%E8%A6%81%E7%95%8C%E9%9D%A2.png" width="800" height="500" />

## 功能优势

优势 | 说明
---- | --------------
UI 组件解耦 | IM UIKit 不同组件可相互独立运行使用。您可按需选择组件，将其快速集成到您的应用，实现相应的 UI 功能，减少无用依赖。
UI 能力简洁易用 |IM UIKit 的业务逻辑层与 UI 层相互独立。在 UI 层，您仅需关注视图展示和事件处理。IM UIKit 清晰的数据流转处理，让 UI 层代码更简洁易懂。
强大的自定义能力 | IM UIKit 支持在各 UI 组件的初始化过程中配置自定义 UI。同时提供 Fragment 和 View 的能力封装，助您快速将 UI 功能添加到您的应用中。
完善的业务逻辑处理 | IM UIKit 业务逻辑层提供完善的业务逻辑处理能力。您无需关心 SDK 层不同接口间的复杂处理逻辑，业务逻辑层一个接口帮您搞定所有。

## 技术原理

### 工作原理

IM UIKit 采用 （Model–View–ViewModel）MVVM 架构模型，实现 UI 展示与业务逻辑开发的相互独立。

![IMuikitDataFlow_Android.png](https://yx-web-nosdn.netease.im/common/f1663a580335822a9770e486c3ea3e12/IMuikitDataFlow_Android.png)

流程 | 说明
---- | --------------
1 | IM UIKit 展示层的 Activity/Fragment/View 向响应层的 ViewModel 发送请求。
2 | ViewModel 将请求经由业务逻辑层转发至 NIM SDK（网易云信 IM SDK）。
3 | NIM SDK 接收请求后触发回调，回调数据经由业务逻辑层和响应层发送至 Activity/Fragment/View。
4 | Activity/Fragment/View 将回调数据发送至 RecyclerViewAdapter。后者根据界面需要展示的不同实体的 type，判定具体的 UI 样式。例如，SDK 返回的回调数据为消息数据时，RecyclerViewAdapter 可判定消息数据中包含的消息类型（即 type），将消息在 UI 上展示为对应类型的样式。

### 产品架构

![IMuikitArch.png](https://yx-web-nosdn.netease.im/common/4e67f1f8f355db7b8ea86ef8f9332011/IMuikitArch.png)

上图中：

- UIKit UI 层的 `ContactKit-ui`、`ChatKit-ui`、`ConversationKit-ui` 和 `QChatKit-ui`，对应上述工作原理图中的
  Activity/Fragment/View。
- UIKit UI 层的 `ContactKit`、`ChatKit` `ConversationKit` 和 `QChatKit`，对应上述工作原理图中的 Repository。
- UIKitCore 层对应上述工作原理图中的 Provider。

详见[IM UIKit介绍](https://doc.yunxin.163.com/docs/TM5MzM5Njk/zMxMTgxMjE?platformId=60002)。

## IM UIKit 集成

具体的集成流程，请参见[快速集成 IM UIKit](https://doc.yunxin.163.com/docs/TM5MzM5Njk/Tg5NjA2ODE)。

# 参考资料

* any list
{:toc}