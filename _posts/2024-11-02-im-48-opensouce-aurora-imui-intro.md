---
layout: post
title: IM 即时通讯系统-48-aurora-imui 是个通用的即时通讯（IM）UI 库，不特定于任何 IM SDK。
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

https://github.com/jpush/aurora-imui

# Aurora IMUI

Aurora IMUI 是个通用的即时通讯（IM）UI 库，不特定于任何 IM SDK。

本 UI 库提供了消息列表、输入视图等常用组件，支持常见的消息类型：文字、图片、语音、视频等。默认包含多套界面风格，也能根据自己的需要自定义。

同步支持 Android、iOS 和 React Native。

更多 demo 可以参考 [aurora-imui-examples](https://github.com/jpush/aurora-imui-examples).

![png](https://github.com/huangminlinux/resource/blob/master/IMUIPick%402x.pn)

## 功能

可以基于本 UI 库实现的功能：

- 消息列表的展示；
  - 支持多种消息类型；
  - 对每种消息类型的点击、长按处理；
  - 支持用户头像。

- 消息输入：
  - 支持多种消息类型；
  - 语音输入组件；
  - 相册照片选取组件；
  - 视频拍摄。

当前支持展示与输入的消息类型：

- 文字
- 图片
- 语音
- 视频
- 自定义

## 使用

当前提供的组件：

### Android
- [MessageList](https://github.com/jpush/aurora-imui/blob/master/docs/Android/message_list_usage_zh.md) (消息列表)

- [ChatInputView](https://github.com/jpush/aurora-imui/blob/master/Android/chatinput/README.md) (聊天输入组件)

### iOS (Swift)

- [IMUIMessageCollectionView](https://github.com/jpush/aurora-imui/blob/master/docs/iOS/IMUIMessageCollectionView_usage_iOS_zh.md)
- [IMUIInputView](https://github.com/jpush/aurora-imui/blob/master/docs/iOS/IMUIInputView_usage_zh.md)

### React Native

- [AuroraIMUI_Pure_JS  Beta](https://github.com/jpush/aurora-imui/blob/master/ReactNative_JS/README.md)
- [AuroraIMUI](https://github.com/jpush/aurora-imui/blob/master/ReactNative/README_zh.md)


# 参考资料

* any list
{:toc}