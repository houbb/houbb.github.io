---
layout: post
title:  20-微信小程序分包加载
date:  2021-2-14 16:52:15 +0800
categories: [Dev]
tags: [dev, windows, sh]
published: true
---

# 分包加载

某些情况下，开发者需要将小程序划分成不同的子包，在构建时打包成不同的分包，用户在使用时按需进行加载。

在构建小程序分包项目时，构建会输出一个或多个分包。每个使用分包小程序必定含有一个主包。所谓的主包，即放置默认启动页面/TabBar 页面，以及一些所有分包都需用到公共资源/JS 脚本；而分包则是根据开发者的配置进行划分。

在小程序启动时，默认会下载主包并启动主包内页面，当用户进入分包内某个页面时，客户端会把对应分包下载下来，下载完成后再进行展示。

目前小程序分包大小有以下限制：

整个小程序所有分包大小不超过 20M

单个分包/主包大小不能超过 2M

对小程序进行分包，可以优化小程序首次启动的下载时间，以及在多团队共同开发时可以更好的解耦协作。

具体使用方法请参考：

使用分包

独立分包

分包预下载


# 使用分包

## 配置方法


假设支持分包的小程序目录结构如下：

```
├── app.js
├── app.json
├── app.wxss
├── packageA
│   └── pages
│       ├── cat
│       └── dog
├── packageB
│   └── pages
│       ├── apple
│       └── banana
├── pages
│   ├── index
│   └── logs
└── utils
```

开发者通过在 app.json subpackages 字段声明项目分包结构：

```json
{
  "pages":[
    "pages/index",
    "pages/logs"
  ],
  "subpackages": [
    {
      "root": "packageA",
      "pages": [
        "pages/cat",
        "pages/dog"
      ]
    }, {
      "root": "packageB",
      "name": "pack2",
      "pages": [
        "pages/apple",
        "pages/banana"
      ]
    }
  ]
}
```

subpackages 中，每个分包的配置有以下几项：

| 字段 |	      类型	       | 说明 |
|:---|:---|:---|
| root |	      String	     | 分包根目录 |
| name |	      String	     | 分包别名，分包预下载时可以使用 |
| pages |	      StringArray	 | 分包页面路径，相对与分包根目录 |
| independent |	Boolean	     | 分包是否是独立分包 |

## 打包原则

声明 subpackages 后，将按 subpackages 配置路径进行打包，subpackages 配置路径外的目录将被打包到 app（主包） 中

app（主包）也可以有自己的 pages（即最外层的 pages 字段）

subpackage 的根目录不能是另外一个 subpackage 内的子目录

tabBar 页面必须在 app（主包）内

## 引用原则

packageA 无法 require packageB JS 文件，但可以 require app、自己 package 内的 JS 文件

packageA 无法 import packageB 的 template，但可以 require app、自己 package 内的 template

packageA 无法使用 packageB 的资源，但可以使用 app、自己 package 内的资源

## 低版本兼容

由微信后台编译来处理旧版本客户端的兼容，后台会编译两份代码包，一份是分包后代码，另外一份是整包的兼容代码。 

新客户端用分包，老客户端还是用的整包，完整包会把各个 subpackage 里面的路径放到 pages 中。

# 独立分包

微信客户端 6.7.2，基础库 2.3.0 及以上版本开始支持。

独立分包是小程序中一种特殊类型的分包，可以独立于主包和其他分包运行。从独立分包中页面进入小程序时，不需要下载主包。当用户进入普通分包或主包内页面时，主包才会被下载。

开发者可以按需将某些具有一定功能独立性的页面配置到独立分包中。当小程序从普通的分包页面启动时，需要首先下载主包；而独立分包不依赖主包即可运行，可以很大程度上提升分包页面的启动速度。

一个小程序中可以有多个独立分包。

小游戏在基础库v2.12.2开始支持独立分包，详见 小游戏独立分包指南。

## 配置方法

假设小程序目录结构如下：

```
├── app.js
├── app.json
├── app.wxss
├── moduleA
│   └── pages
│       ├── rabbit
│       └── squirrel
├── moduleB
│   └── pages
│       ├── pear
│       └── pineapple
├── pages
│   ├── index
│   └── logs
└── utils
```

开发者通过在app.json的subpackages字段中对应的分包配置项中定义independent字段声明对应分包为独立分包。

```json
{
  "pages": [
    "pages/index",
    "pages/logs"
  ],
  "subpackages": [
    {
      "root": "moduleA",
      "pages": [
        "pages/rabbit",
        "pages/squirrel"
      ]
    }, {
      "root": "moduleB",
      "pages": [
        "pages/pear",
        "pages/pineapple"
      ],
      "independent": true
    }
  ]
}
```

## 限制

独立分包属于分包的一种。普通分包的所有限制都对独立分包有效。

独立分包中插件、自定义组件的处理方式同普通分包。

此外，使用独立分包时要注意：

1. 独立分包中不能依赖主包和其他分包中的内容，包括js文件、template、wxss、自定义组件、插件等。主包中的app.wxss对独立分包无效，应避免在独立分包页面中使用 app.wxss 中的样式；

2. App 只能在主包内定义，独立分包中不能定义 App，会造成无法预期的行为；

3. 独立分包中暂时不支持使用插件。

## 注意事项

### （1）关于 getApp()

与普通分包不同，独立分包运行时，App 并不一定被注册，因此 getApp() 也不一定可以获得 App 对象：

当用户从独立分包页面启动小程序时，主包不存在，App也不存在，此时调用 getApp() 获取到的是 undefined。 

当用户进入普通分包或主包内页面时，主包才会被下载，App 才会被注册。

当用户是从普通分包或主包内页面跳转到独立分包页面时，主包已经存在，此时调用 getApp() 可以获取到真正的 App。

由于这一限制，开发者无法通过 App 对象实现独立分包和小程序其他部分的全局变量共享。

为了在独立分包中满足这一需求，基础库 2.2.4 版本开始 getApp支持 [allowDefault]参数，在 App 未定义时返回一个默认实现。

当主包加载，App 被注册时，默认实现中定义的属性会被覆盖合并到真正的 App 中。

- 独立分包中

```js
const app = getApp({allowDefault: true}) // {}
app.data = 456
app.global = {}
```

- app.js 中

```js
App({
  data: 123,
  other: 'hello'
})

console.log(getApp()) // {global: {}, data: 456, other: 'hello'}
```

### （2）关于 App 生命周期

当从独立分包启动小程序时，主包中 App 的 onLaunch 和首次 onShow 会在从独立分包页面首次进入主包或其他普通分包页面时调用。

由于独立分包中无法定义 App，小程序生命周期的监听可以使用 wx.onAppShow，wx.onAppHide 完成。App 上的其他事件可以使用 wx.onError，wx.onPageNotFound 监听。

## 低版本兼容

在低于6.7.2版本的微信中运行时，独立分包视为普通分包处理，不具备独立运行的特性。

注意：在兼容模式下，主包中的 app.wxss 可能会对独立分包中的页面产生影响，因此应避免在独立分包页面中使用 app.wxss 中的样式。

# 分包预下载

基础库 2.3.0 开始支持，低版本需做兼容处理。 开发者工具请使用 1.02.1808300 及以上版本，可点此下载。

开发者可以通过配置，在进入小程序某个页面时，由框架自动预下载可能需要的分包，提升进入后续分包页面时的启动速度。对于独立分包，也可以预下载主包。

分包预下载目前只支持通过配置方式使用，暂不支持通过调用API完成。

vConsole 里有preloadSubpackages开头的日志信息，可以用来验证预下载的情况。

## 配置方法

预下载分包行为在进入某个页面时触发，通过在 app.json 增加 preloadRule 配置来控制。

```json
{
  "pages": ["pages/index"],
  "subpackages": [
    {
      "root": "important",
      "pages": ["index"],
    },
    {
      "root": "sub1",
      "pages": ["index"],
    },
    {
      "name": "hello",
      "root": "path/to",
      "pages": ["index"]
    },
    {
      "root": "sub3",
      "pages": ["index"]
    },
    {
      "root": "indep",
      "pages": ["index"],
      "independent": true
    }
  ],
  "preloadRule": {
    "pages/index": {
      "network": "all",
      "packages": ["important"]
    },
    "sub1/index": {
      "packages": ["hello", "sub3"]
    },
    "sub3/index": {
      "packages": ["path/to"]
    },
    "indep/index": {
      "packages": ["__APP__"]
    }
  }
}
```

preloadRule 中，key 是页面路径，value 是进入此页面的预下载配置，每个配置有以下几项：

| 字段 |	    类型 |	      必填 | 默认值 | 	说明  |
|:----|:----|:----|:----|:----|
| packages |	StringArray |	是	 | 无 | 	进入页面后预下载分包的  root 或 name。`__APP__` 表示主包。 |
| network |	  String |	    否	 | wifi | 	在指定网络下预下载，可选值为：  all: 不限网络 wifi: 仅wifi下预下载 |

## 限制

同一个分包中的页面享有共同的预下载大小限额 2M，限额会在工具中打包时校验。

如，页面 A 和 B 都在同一个分包中，A 中预下载总大小 0.5M 的分包，B中最多只能预下载总大小 1.5M 的分包。


# 多线程 Worker

一些异步处理的任务，可以放置于 Worker 中运行，待运行结束后，再把结果返回到小程序主线程。Worker 运行于一个单独的全局上下文与线程中，不能直接调用主线程的方法。

Worker 与主线程之间的数据传输，双方使用 Worker.postMessage() 来发送数据，Worker.onMessage() 来接收数据，传输的数据并不是直接共享，而是被复制的。

## 1. 配置 Worker 信息

在 app.json 中可配置 Worker 代码放置的目录，目录下的代码将被打包成一个文件：

配置示例：

```json
{
  "workers": "workers"
}
```

## 2. 添加 Worker 代码文件

根据步骤 1 中的配置，在代码目录下新建以下两个入口文件：

```
workers/request/index.js
workers/request/utils.js
workers/response/index.js
```

添加后，目录结构如下：

```
├── app.js
├── app.json
├── project.config.json
└── workers
    ├── request
    │   ├── index.js
    │   └── utils.js
    └── response
        └── index.js
```

## 3. 编写 Worker 代码

在 workers/request/index.js 编写 Worker 响应代码

```js
const utils = require('./utils')

// 在 Worker 线程执行上下文会全局暴露一个 worker 对象，直接调用 worker.onMessage/postMessage 即可
worker.onMessage(function (res) {
  console.log(res)
})
```

## 4. 在主线程中初始化 Worker

在主线程的代码 app.js 中初始化 Worker

```js
const worker = wx.createWorker('workers/request/index.js') // 文件名指定 worker 的入口文件路径，绝对路径
```

## 5. 主线程向 Worker 发送消息

```js
worker.postMessage({
  msg: 'hello worker'
})
```

worker 对象的其它接口请看 [worker接口说明](https://developers.weixin.qq.com/miniprogram/dev/api/worker/wx.createWorker.html)

## 注意事项

- Worker 最大并发数量限制为 1 个，创建下一个前请用 Worker.terminate() 结束当前 Worker

- Worker 内代码只能 require 指定 Worker 路径内的文件，无法引用其它路径

- Worker 的入口文件由 wx.createWorker() 时指定，开发者可动态指定 Worker 入口文件

- Worker 内不支持 wx 系列的 API

- Workers 之间不支持发送消息


# 参考资料

https://developers.weixin.qq.com/miniprogram/dev/framework/subpackages.html

* any list
{:toc}
