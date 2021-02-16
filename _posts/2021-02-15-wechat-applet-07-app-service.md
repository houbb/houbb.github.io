---
layout: post
title:  07-微信小程序逻辑层 app service
date:  2021-2-14 16:52:15 +0800
categories: [Dev]
tags: [dev, windows, sh]
published: true
---


# 逻辑层 App Service

小程序开发框架的逻辑层使用 JavaScript 引擎为小程序提供开发者 JavaScript 代码的运行环境以及微信小程序的特有功能。

逻辑层将数据进行处理后发送给视图层，同时接受视图层的事件反馈。

开发者写的所有代码最终将会打包成一份 JavaScript 文件，并在小程序启动的时候运行，直到小程序销毁。

这一行为类似 ServiceWorker，所以逻辑层也称之为 App Service。

在 JavaScript 的基础上，我们增加了一些功能，以方便小程序的开发：

- 增加 App 和 Page 方法，进行程序注册和页面注册。

- 增加 getApp 和 getCurrentPages 方法，分别用来获取 App 实例和当前页面栈。

- 提供丰富的 API，如微信用户数据，扫一扫，支付等微信特有能力。

- 提供模块化能力，每个页面有独立的作用域。

注意：小程序框架的逻辑层并非运行在浏览器中，因此 JavaScript 在 web 中一些能力都无法使用，如 window，document 等。

# 注册小程序

每个小程序都需要在 app.js 中调用 App 方法注册小程序实例，绑定生命周期回调函数、错误监听和页面不存在监听函数等。

详细的参数含义和使用请参考 [App 参考文档](https://developers.weixin.qq.com/miniprogram/dev/reference/api/App.html) 。

```js
// app.js
App({
  onLaunch (options) {
    // Do something initial when launch.
  },
  onShow (options) {
    // Do something when show.
  },
  onHide () {
    // Do something when hide.
  },
  onError (msg) {
    console.log(msg)
  },
  globalData: 'I am global data'
})
```

整个小程序只有一个 App 实例，是全部页面共享的。

开发者可以通过 `getApp()` 方法获取到全局唯一的 App 实例，获取App上的数据或调用开发者注册在 App 上的函数。

```js
// xxx.js
const appInstance = getApp()
console.log(appInstance.globalData) // I am global data
```

# 注册页面

对于小程序中的每个页面，都需要在页面对应的 js 文件中进行注册，指定页面的初始数据、生命周期回调、事件处理函数等。

## 使用 Page 构造器注册页面

简单的页面可以使用 Page() 进行构造。

```js
//index.js
Page({
  data: {
    text: "This is page data."
  },
  onLoad: function(options) {
    // 页面创建时执行
  },
  onShow: function() {
    // 页面出现在前台时执行
  },
  onReady: function() {
    // 页面首次渲染完毕时执行
  },
  onHide: function() {
    // 页面从前台变为后台时执行
  },
  onUnload: function() {
    // 页面销毁时执行
  },
  onPullDownRefresh: function() {
    // 触发下拉刷新时执行
  },
  onReachBottom: function() {
    // 页面触底时执行
  },
  onShareAppMessage: function () {
    // 页面被用户分享时执行
  },
  onPageScroll: function() {
    // 页面滚动时执行
  },
  onResize: function() {
    // 页面尺寸变化时执行
  },
  onTabItemTap(item) {
    // tab 点击时执行
    console.log(item.index)
    console.log(item.pagePath)
    console.log(item.text)
  },
  // 事件响应函数
  viewTap: function() {
    this.setData({
      text: 'Set some data for updating view.'
    }, function() {
      // this is setData callback
    })
  },
  // 自由数据
  customData: {
    hi: 'MINA'
  }
})
```

详细的参数含义和使用请参考 [Page 参考文档](https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html)。

## 在页面中使用 behaviors

基础库 2.9.2 开始支持，低版本需做兼容处理。

页面可以引用 behaviors 。 

behaviors 可以用来让多个页面有相同的数据字段和方法。

```js
// my-behavior.js
module.exports = Behavior({
  data: {
    sharedText: 'This is a piece of data shared between pages.'
  },
  methods: {
    sharedMethod: function() {
      this.data.sharedText === 'This is a piece of data shared between pages.'
    }
  }
})
// page-a.js
var myBehavior = require('./my-behavior.js')
Page({
  behaviors: [myBehavior],
  onLoad: function() {
    this.data.sharedText === 'This is a piece of data shared between pages.'
  }
})
```

# 使用 Component 构造器构造页面

基础库 1.6.3 开始支持，低版本需做兼容处理。

Page 构造器适用于简单的页面。但对于复杂的页面， Page 构造器可能并不好用。

此时，可以使用 Component 构造器来构造页面。 

Component 构造器的主要区别是：方法需要放在 methods: { } 里面。

代码示例：

```js
Component({
  data: {
    text: "This is page data."
  },
  methods: {
    onLoad: function(options) {
      // 页面创建时执行
    },
    onPullDownRefresh: function() {
      // 下拉刷新时执行
    },
    // 事件响应函数
    viewTap: function() {
      // ...
    }
  }
})
```

这种创建方式非常类似于 [自定义组件](https://developers.weixin.qq.com/miniprogram/dev/framework/custom-component/) ，可以像自定义组件一样使用 behaviors 等高级特性。

具体细节请阅读 [Component](https://developers.weixin.qq.com/miniprogram/dev/framework/custom-component/component.html) 构造器 章节。

# 生命周期

以下内容你不需要立马完全弄明白，不过以后它会有帮助。

下图说明了页面 Page 实例的生命周期。

![生命周期](https://res.wx.qq.com/wxdoc/dist/assets/img/page-lifecycle.2e646c86.png)

# 页面路由

在小程序中所有页面的路由全部由框架进行管理

## 页面栈

框架以栈的形式维护了当前的所有页面。 

当发生路由切换的时候，页面栈的表现如下：

| 路由方式	  | 页面栈表现 |
|:---|:---|
| 初始化  	  | 新页面入栈 |
| 打开新页面 | 新页面入栈 |
| 页面重定向 | 当前页面出栈，新页面入栈 |
| 页面返回	  | 页面不断出栈，直到目标返回页 |
| Tab 切换	  | 页面全部出栈，只留下新的 Tab 页面 |
| 重加载	    | 页面全部出栈，只留下新的页面 |

开发者可以使用 getCurrentPages() 函数获取当前页面栈。

## 路由方式

对于路由的触发方式以及页面生命周期函数如下：

| 路由方式	  | 触发时机	      |  路由前页面	| 路由后页面 |
|:---|:---|:---|:---|
| 初始化	    | 小程序打开的第一个页面		| | onLoad,onShow |
| 打开新页面	| 调用 API wx.navigateTo 使用组件 `<navigator open-type="navigateTo"/>`	| onHide	  | onLoad, onShow |
| 页面重定向	| 调用 API wx.redirectTo 使用组件 `<navigator open-type="redirectTo"/>`	| onUnload	| onLoad, onShow |
| 页面返回	  | 调用 API wx.navigateBack 使用组件 `<navigator open-type="navigateBack">` 用户按左上角返回按钮	| onUnload	| onShow |
| Tab 切换	  | 调用 API wx.switchTab 使用组件 `<navigator open-type="switchTab"/>` 用户切换 Tab	| |	各种情况请参考下表 |
| 重启动	    | 调用 API wx.reLaunch 使用组件 `<navigator open-type="reLaunch"/>`	| onUnload	| onLoad, onShow |

Tab 切换对应的生命周期（以 A、B 页面为 Tabbar 页面，C 是从 A 页面打开的页面，D 页面是从 C 页面打开的页面为例）：

| 当前页面	| 路由后页面	| 触发的生命周期（按顺序）| 
|:---|:---|:---|
| A	             | A	             | Nothing happend |
| A	             | B	             | A.onHide(), B.onLoad(), B.onShow() |
| A	             | B（再次打开）	 |  A.onHide(), B.onShow() |
| C	             | A	               | C.onUnload(), A.onShow() |
| C	             | B	               | C.onUnload(), B.onLoad(), B.onShow() |
| D	             | B	               | D.onUnload(), C.onUnload(), B.onLoad(), B.onShow() |
| D（从转发进入）|  A	              | D.onUnload(), A.onLoad(), A.onShow() |
| D（从转发进入）|  B	              | D.onUnload(), B.onLoad(), B.onShow() |


### Tips:

- navigateTo, redirectTo 只能打开非 tabBar 页面。

- switchTab 只能打开 tabBar 页面。

- reLaunch 可以打开任意页面。

- 页面底部的 tabBar 由页面决定，即只要是定义为 tabBar 的页面，底部都有 tabBar。

- 调用页面路由带的参数可以在目标页面的onLoad中获取。

# 模块化

可以将一些公共的代码抽离成为一个单独的 js 文件，作为一个模块。

模块只有通过 module.exports 或者 exports 才能对外暴露接口。

注意：

exports 是 module.exports 的一个引用，因此在模块里边随意更改 exports 的指向会造成未知的错误。

所以更推荐开发者采用 module.exports 来暴露模块接口，除非你已经清晰知道这两者的关系。

小程序目前不支持直接引入 node_modules , 开发者需要使用到 node_modules 时候建议拷贝出相关的代码到小程序的目录中，或者使用小程序支持的 npm 功能。

```js
// common.js
function sayHello(name) {
  console.log(`Hello ${name} !`)
}
function sayGoodbye(name) {
  console.log(`Goodbye ${name} !`)
}

module.exports.sayHello = sayHello
exports.sayGoodbye = sayGoodbye
```

​在需要使用这些模块的文件中，使用 require 将公共代码引入

```js
var common = require('common.js')
Page({
  helloMINA: function() {
    common.sayHello('MINA')
  },
  goodbyeMINA: function() {
    common.sayGoodbye('MINA')
  }
})
```

# 文件作用域

在 JavaScript 文件中声明的变量和函数只在该文件中有效；不同的文件中可以声明相同名字的变量和函数，不会互相影响。

通过全局函数 getApp 可以获取全局的应用实例，如果需要全局的数据可以在 App() 中设置，如：

```js
// app.js
App({
  globalData: 1
})
// a.js
// The localValue can only be used in file a.js.
var localValue = 'a'
// Get the app instance.
var app = getApp()
// Get the global data and change it.
app.globalData++
// b.js
// You can redefine localValue in file b.js, without interference with the localValue in a.js.
var localValue = 'b'
// If a.js it run before b.js, now the globalData shoule be 2.
console.log(getApp().globalData)
```

# API

小程序开发框架提供丰富的微信原生 API，可以方便的调起微信提供的能力，如获取用户信息，本地存储，支付功能等。

详细介绍请参考 [API 文档](https://developers.weixin.qq.com/miniprogram/dev/api/index.html)。

通常，在小程序 API 有以下几种类型：

## 事件监听 API

我们约定，以 on 开头的 API 用来监听某个事件是否触发，如：wx.onSocketOpen，wx.onCompassChange 等。

这类 API 接受一个回调函数作为参数，当事件触发时会调用这个回调函数，并将相关数据以参数形式传入。

- 代码示例

```js
wx.onCompassChange(function (res) {
  console.log(res.direction)
})
```

## 同步 API

我们约定，以 Sync 结尾的 API 都是同步 API， 如 wx.setStorageSync，wx.getSystemInfoSync 等。

此外，也有一些其他的同步 API，如 wx.createWorker，wx.getBackgroundAudioManager 等，详情参见 API 文档中的说明。

同步 API 的执行结果可以通过函数返回值直接获取，如果执行出错会抛出异常。

- 代码示例

```js
try {
  wx.setStorageSync('key', 'value')
} catch (e) {
  console.error(e)
}
```

## 异步 API

大多数 API 都是异步 API，如 wx.request，wx.login 等。

这类 API 接口通常都接受一个 Object 类型的参数，这个参数都支持按需指定以下字段来接收接口调用结果：

- Object 参数说明

| 参数名	  | 类型	     |  必填  | 	说明 |
|:---|:---|:---|:---|
| success	  | function | 否	   |   接口调用成功的回调函数 |
| fail	    | function | 否	   |  接口调用失败的回调函数 |
| complete | function	  | 否	   |  接口调用结束的回调函数（调用成功、失败都会执行） |
| 其他	    | Any	       | -	   |   接口定义的其他参数 |


- 回调函数的参数

success，fail，complete 函数调用时会传入一个 Object 类型参数，包含以下字段：

| 属性	 |  类型	  |  说明 |
|:---|:---|:---|
| errMsg	| string	| 错误信息，如果调用成功返回 ${apiName}:ok |
| errCode	| number	| 错误码，仅部分 API 支持，具体含义请参考对应 API 文档，成功时为 0。 |
| 其他	  |  Any	      | 接口返回的其他数据 |

异步 API 的执行结果需要通过 Object 类型的参数中传入的对应回调函数获取。

部分异步 API 也会有返回值，可以用来实现更丰富的功能，如 wx.request，wx.connectSocket 等。

- 代码示例

```js
wx.login({
  success(res) {
    console.log(res.code)
  }
})
```

## 异步 API 返回 Promise

基础库 2.10.2 版本起，异步 API 支持 callback & promise 两种调用方式。

当接口参数 Object 对象中不包含 success/fail/complete 时将默认返回 promise，否则仍按回调方式执行，无返回值。

- 注意事项

部分接口如 downloadFile, request, uploadFile, connectSocket, createCamera（小游戏）本身就有返回值， 它们的 promisify 需要开发者自行封装。

当没有回调参数时，异步接口返回 promise。此时若函数调用失败进入 fail 逻辑， 会报错提示 Uncaught (in promise)，开发者可通过 catch 来进行捕获。

wx.onUnhandledRejection 可以监听未处理的 Promise 拒绝事件。

- 代码示例

```js
// callback 形式调用
wx.chooseImage({
  success(res) {
    console.log('res:', res)
  }
})

// promise 形式调用
wx.chooseImage().then(res => console.log('res: ', res))
```

# 云开发 API

开通并使用小程序[云开发](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html)，即可使用云开发API，在小程序端直接调用服务端的[云函数](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/guide/functions.html#%E4%BA%91%E5%87%BD%E6%95%B0)。

- 代码例子

```js
wx.cloud.callFunction({
  // 云函数名称
  name: 'cloudFunc',
  // 传给云函数的参数
  data: {
    a: 1,
    b: 2,
  },
  success: function(res) {
    console.log(res.result) // 示例
  },
  fail: console.error
})

// 此外，云函数同样支持promise形式调用
```

# 参考资料

https://developers.weixin.qq.com/miniprogram/dev/framework/structure.html


* any list
{:toc}