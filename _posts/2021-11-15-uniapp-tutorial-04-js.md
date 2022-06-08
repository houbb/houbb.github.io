---
layout: post
title: uniapp 教程-04-js 语法
date: 2021-11-15 21:01:55 +0800
categories: [WEB]
tags: [web, cross-plateform, uni-app, sh]
published: true
---
 

# js 语法

uni-app的js API由标准ECMAScript的js API 和 uni 扩展 API 这两部分组成。

标准ECMAScript的js仅是最基础的js。

浏览器基于它扩展了window、document、navigator等对象。小程序也基于标准js扩展了各种wx.xx、my.xx、swan.xx的API。node也扩展了fs等模块。

uni-app基于ECMAScript扩展了uni对象，并且API命名与小程序保持兼容。

# 标准js和浏览器js的区别

uni-app的js代码，h5端运行于浏览器中。

非h5端（包含小程序和App），Android平台运行在v8引擎中，iOS平台运行在iOS自带的jscore引擎中，都没有运行在浏览器或webview里。

非H5端，虽然不支持window、document、navigator等浏览器的js API，但也支持标准ECMAScript。

请注意不要把浏览器里的js扩展对象等价于标准js。

所以uni-app的非H5端，一样支持标准js，支持if、for等语法，支持字符串、数字、时间、布尔值、数组、自定义对象等变量类型及各种处理方法。

仅仅是不支持window、document、navigator等浏览器专用对象。

# ES6 支持

uni-app 在支持绝大部分 ES6 API 的同时，也支持了 ES7 的 await/async。

ES6 API 的支持，详见如下表格部分（x 表示不支持，无特殊说明则表示支持）：

因为iOS上不允许三方js引擎，所以iOS上不区分App、小程序、H5，各端均仅依赖iOS版本。

ps: 差异处使用时查询，此处不再赘述。

## 注意

App端Android支持不依赖Android版本号，即便是Android4.4也是上表数据。

因为uni-app的js代码运行在自带的独立jscore中，没有js的浏览器兼容性问题。

uni-app的vue页面在Android低端机上只有css浏览器兼容性问题，因为vue页面仍然渲染在webview中，受Android版本影响，太新的css语法在低版本不支持。

默认不需要在微信工具里继续开启es6转换。但如果用了微信的wxml自定义组件（wxcomponents目录下），uni-app编译器并不会处理这些文件中的es6代码，需要去微信工具里开启转换。

从HBuilderX调起微信工具时，如果发现工程下有wxcomponents目录会自动配置微信工程打开es6转换。

# 参考资料

https://uniapp.dcloud.net.cn/tutorial/syntax-js.html#%E6%A0%87%E5%87%86js%E5%92%8C%E6%B5%8F%E8%A7%88%E5%99%A8js%E7%9A%84%E5%8C%BA%E5%88%AB

* any list
{:toc}
