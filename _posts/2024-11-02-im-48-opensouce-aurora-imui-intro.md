---
layout: post
title: IM 即时通讯系统-48-aurora-imui 是个通用的即时通讯（IM）UI 库，不特定于任何 IM SDK。
date: 2024-11-02 21:01:55 +0800
categories: [IM]
tags: [im, opensource, sh]
published: true
---


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