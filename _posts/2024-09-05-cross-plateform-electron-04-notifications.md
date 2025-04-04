---
layout: post
title:  cross-plateform 跨平台应用 Electron-04-notifications 通知
date: 2024-09-05 21:01:55 +0800
categories: [WEB]
tags: [web, cross-plateform, uni-app, sh]
published: true
---

# 通知 (Windows, Linux, macOS)

## 概览

这三个操作系统都为应用程序向用户发送通知提供了手段。 

在主进程和渲染进程中，显示通知的技术不同的。

对于渲染进程，Electron 方便地允许开发者使用 HTML5 通知 API 发送通知，然后使用当前运行中的系统的原生通知 API 来进行显示。

要在主进程中显示通知，您需要使用 Notification 模块。

# 示例

## 在渲染进程中显示通知

从 Quick Start Guide 示例的应用程序开始，将以下行添加到 index.html 文件：

```js
<script src="renderer.js"></script>
```

并添加 renderer.js 文件：

```js
const NOTIFICATION_TITLE = 'Title'
const NOTIFICATION_BODY = 'Notification from the Renderer process. Click to log to console.'
const CLICK_MESSAGE = 'Notification clicked'

new Notification(NOTIFICATION_TITLE, { body: NOTIFICATION_BODY }).onclick = () => console.log(CLICK_MESSAGE)
```

启动 Electron 应用程序后，您应该能看到通知：

渲染进程中的通知

此外，如果您点击通知，DOM将更新以显示“Notification clicked!”

ps: 个人实验，发现没有看到这个通知信息。

# 在主进程中显示通知

从 Quick Start Guide 中的应用开始，将以下内容更新到 main.js。

```js
const { Notification } = require('electron')

const NOTIFICATION_TITLE = 'Basic Notification'
const NOTIFICATION_BODY = 'Notification from the Main process'

function showNotification () {
  new Notification({ title: NOTIFICATION_TITLE, body: NOTIFICATION_BODY }).show()
}

app.whenReady().then(createWindow).then(showNotification)
```

启动 Electron 应用程序后，您应该能看到系统通知：

`Notification from the Main process`

ps: 个人实验，发现没有看到这个通知信息。

# 补充资料

虽然操作系统的代码和用户体验相似，但依然存在微妙的差异。

## Windows

在 Windows 10 上，您的应用程序的快捷方式必须安装到启动菜单中，包含一个 Application User Model ID. 这可能会在开发过程中被过度杀死，因此将 node_modules\electron\dist\electron.exe 添加到您的开始菜单中也做到了 的技巧。 

在Explorer, 右键单击和“Pin 开始菜单”中导航到文件。 然后您需要添加 app.setAppUserModelId(process.execPath) 到主进程才能看到通知。

在 Windows 8.1 和 Windows 8 上，带有 应用程序用户模型ID（Application User Model ID） 的应用程序快捷方式必须被添加到开始屏幕上。 但是请注意，它不需要被固定到开始屏幕。

在 Windows 7 上, 通知通过视觉上类似于较新系统原生的一个自定义的实现来工作。

Electron尝试将应用程序用户模型 ID 的相关工作自动化。 

Electron在和安装和更新框架 Squirrel 协同使用的时候，快捷方式将被自动正确的配置好。 

更棒的是，Electron 会自动检测 Squirrel 的存在，并且使用正确的值来自动调用app.setAppUserModelId()。 

在开发的过程中, 你可能需要自己调用app.setAppUserModelld()

此外，在Windows 8中，通知正文的最大长度为250个字符，Windows团队建议将通知保留为200个字符。 

然而，Windows 10中已经删除了这个限制，但是Windows团队要求开发人员合理使用。 

尝试将大量文本发送到API(数千个字符) 可能会导致不稳定。

### 高级通知

Windows 的更高版本允许高级通知，自定义模板，图像和其他灵活元素。 

要发送这些通知(来自主进程或渲染器进程)，请使用用户区模块 electron-windows-notifications 来用原生节点附件发送 ToastNotification 和 TileNotification 对象。

当包括按钮在内的通知使用 electron-windows-notifications 时，处理回复需要使用 electron-windows-interactive-notifications 帮助注册所需的 COM 组件并调用您的 Electron 应用程序和输入的用户数据。 

### 免打扰模式 / 演示模式

如果要检测是否允许发送通知，请使用 electron-notification-state 模块。

这样，您可以提前确定 Windows 是否会将通知忽略。

## macOS

MacOS上的通知是最直接的，但你应该注意苹果关于通知的人机接口指南（Apple's Human Interface guidelines regarding notifications）.

请注意，通知的大小限制为256个字节，如果超过该限制，则会被截断。

### 高级通知

后来的 macOS 版本允许有一个输入字段的通知，允许用户快速回复通知。 

为了通过输入字段发送通知，请使用用户区模块node-mac-notifier。

### 勿扰/会话状态

要检测是否允许发送通知，请使用用户区模块 electron-notification-state。

这样可以提前检测是否显示通知。

## Linux

通知是通过libnotify发送的，libnotify可以在任何实现了桌面通知规范（Desktop Notifications Specification）的桌面环境中发送通知，包括Cinnamon、Enlightenment、Unity、GNOME、KDE

# 参考资料

[官方文档](https://www.electronjs.org/docs/tutorial/notifications)

* any list
{:toc}