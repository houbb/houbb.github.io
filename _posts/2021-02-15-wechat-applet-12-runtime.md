---
layout: post
title:  12-微信小程序运行时
date:  2021-2-14 16:52:15 +0800
categories: [Dev]
tags: [dev, windows, sh]
published: true
---

# 小程序的运行环境

微信小程序运行在多种平台上：iOS（iPhone/iPad）微信客户端、Android 微信客户端、PC 微信客户端、Mac 微信客户端和用于调试的微信开发者工具。

各平台脚本执行环境以及用于渲染非原生组件的环境是各不相同的：

在 iOS 上，小程序逻辑层的 javascript 代码运行在 JavaScriptCore 中，视图层是由 WKWebView 来渲染的，环境有 iOS 12、iOS 13 等；

在 Android 上，小程序逻辑层的 javascript 代码运行在 V8 中，视图层是由自研 XWeb 引擎基于 Mobile Chrome 内核来渲染的；

在 开发工具上，小程序逻辑层的 javascript 代码是运行在 NW.js 中，视图层是由 Chromium Webview 来渲染的。

在 PC 上，小程序逻辑层 javascript 和视图层 javascript 都是用 Chrome 内核

在 Mac 上，小程序逻辑层的 javascript 代码运行在 JavaScriptCore 中，视图层是由 WKWebView 来渲染的，与 iOS 一致

## 平台差异

尽管各运行环境是十分相似的，但是还是有些许区别：

JavaScript 语法和 API 支持不一致：语法上开发者可以通过开启 ES6 转 ES5 的功能来规避（详情）；此外，小程序基础库内置了必要的Polyfill，来弥补API的差异（详情)。

WXSS 渲染表现不一致：尽管可以通过开启样式补全来规避大部分的问题，还是建议开发者需要在 iOS 和 Android 上分别检查小程序的真实表现。

开发者工具仅供调试使用，最终的表现以客户端为准。

# JavaScript 支持情况

## 运行限制

基于安全考虑，小程序中不支持动态执行 JS 代码，即：

1. 不支持使用 eval 执行 JS 代码

2. 不支持使用 new Function 创建函数

# 小程序运行机制

## 前台/后台状态

小程序启动后，界面被展示给用户，此时小程序处于前台状态。

当用户点击右上角胶囊按钮关闭小程序，或者按了设备 Home 键离开微信时，小程序并没有完全终止运行，而是进入了后台状态，小程序还可以运行一小段时间。

当用户再次进入微信或再次打开小程序，小程序又会从后台进入前台。但如果用户很久没有再进入小程序，或者系统资源紧张，小程序可能被销毁，即完全终止运行。

## 小程序启动

这样，小程序启动可以分为两种情况，一种是冷启动，一种是热启动。

冷启动：如果用户首次打开，或小程序销毁后被用户再次打开，此时小程序需要重新加载启动，即冷启动。

热启动：如果用户已经打开过某小程序，然后在一定时间内再次打开该小程序，此时小程序并未被销毁，只是从后台状态进入前台状态，这个过程就是热启动。

## 小程序销毁时机

通常，只有当小程序进入后台一定时间，或者系统资源占用过高，才会被销毁。具体而言包括以下几种情形：

（1）当小程序进入后台，可以维持一小段时间的运行状态，如果这段时间内都未进入前台，小程序会被销毁。

（2）当小程序占用系统资源过高，可能会被系统销毁或被微信客户端主动回收。

在 iOS 上，当微信客户端在一定时间间隔内连续收到系统内存告警时，会根据一定的策略，主动销毁小程序，并提示用户 「运行内存不足，请重新打开该小程序」。具体策略会持续进行调整优化。

建议小程序在必要时使用 wx.onMemoryWarning 监听内存告警事件，进行必要的内存清理。

基础库 1.1.0 及以上，1.4.0 以下版本： 当用户从扫一扫、转发等入口（场景值为1007, 1008, 1011, 1025）进入小程序，且没有置顶小程序的情况下退出，小程序会被销毁。

启动场景分类

## 退出状态

每当小程序可能被销毁之前，页面回调函数 onSaveExitState 会被调用。

如果想保留页面中的状态，可以在这个回调函数中“保存”一些数据，下次启动时可以通过 exitState 获得这些已保存数据。

代码示例：

```js
{
  "restartStrategy": "homePageAndLatestPage"
}
Page({
  onLoad: function() {
    var prevExitState = this.exitState // 尝试获得上一次退出前 onSaveExitState 保存的数据
    if (prevExitState !== undefined) { // 如果是根据 restartStrategy 配置进行的冷启动，就可以获取到
      prevExitState.myDataField === 'myData' 
    }
  },
  onSaveExitState: function() {
    var exitState = { myDataField: 'myData' } // 需要保存的数据
    return {
      data: exitState,
      expireTimeStamp: Date.now() + 24 * 60 * 60 * 1000 // 超时时刻
    }
  }
})
```

onSaveExitState 返回值可以包含两项：

| 字段名	| 类型	| 含义 | 
|:---|:---|:---|
| data	          | Any	    | 需要保存的数据（只能是 JSON 兼容的数据） | 
| expireTimeStamp	| Number	| 超时时刻，在这个时刻后，保存的数据保证一定被丢弃，默认为 (当前时刻 + 1 天) | 

- 注意事项：

如果超过 expireTimeStamp ，保存的数据将被丢弃，且冷启动时不遵循 restartStrategy 的配置，而是直接从首页冷启动。

expireTimeStamp 有可能被自动提前，如微信客户端需要清理数据的时候。

在小程序存活期间， onSaveExitState 可能会被多次调用，此时以最后一次的调用结果作为最终结果。

在某些特殊情况下（如微信客户端直接被系统杀死），这个方法将不会被调用，下次冷启动也不遵循 restartStrategy 的配置，而是直接从首页冷启动。

# 小程序更新机制

## 未启动时更新

开发者在管理后台发布新版本的小程序之后，如果某个用户本地有小程序的历史版本，此时打开的可能还是旧版本。

微信客户端会有若干个时机去检查本地缓存的小程序有没有更新版本，如果有则会静默更新到新版本。

总的来说，开发者在后台发布新版本之后，无法立刻影响到所有现网用户，但最差情况下，也在发布之后 24 小时之内下发新版本信息到用户。

用户下次打开时会先更新最新版本再打开。

## 启动时更新

小程序每次冷启动时，都会检查是否有更新版本，如果发现有新版本，将会异步下载新版本的代码包，并同时用客户端本地的包进行启动，即新版本的小程序需要等下一次冷启动才会应用上。

如果需要马上应用最新版本，可以使用 wx.getUpdateManager API 进行处理。

```js
const updateManager = wx.getUpdateManager()

updateManager.onCheckForUpdate(function (res) {
  // 请求完新版本信息的回调
  console.log(res.hasUpdate)
})

updateManager.onUpdateReady(function () {
  wx.showModal({
    title: '更新提示',
    content: '新版本已经准备好，是否重启应用？',
    success(res) {
      if (res.confirm) {
        // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
        updateManager.applyUpdate()
      }
    }
  })
})

updateManager.onUpdateFailed(function () {
  // 新版本下载失败
})
```

# 参考资料

https://developers.weixin.qq.com/miniprogram/dev/framework/runtime/env.html

* any list
{:toc}