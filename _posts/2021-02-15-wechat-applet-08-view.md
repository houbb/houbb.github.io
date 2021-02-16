---
layout: post
title:  08-微信小程序视图层 view
date:  2021-2-14 16:52:15 +0800
categories: [Dev]
tags: [dev, windows, sh]
published: true
---


# 视图层 View

框架的视图层由 WXML 与 WXSS 编写，由组件来进行展示。

将逻辑层的数据反映成视图，同时将视图层的事件发送给逻辑层。

WXML(WeiXin Markup language) 用于描述页面的结构。

WXS(WeiXin Script) 是小程序的一套脚本语言，结合 WXML，可以构建出页面的结构。

WXSS(WeiXin Style Sheet) 用于描述页面的样式。

组件(Component)是视图的基本组成单元。

# WXML

WXML（WeiXin Markup Language）是框架设计的一套标签语言，结合基础组件、事件系统，可以构建出页面的结构。

要完整了解 WXML 语法，请参考 [WXML 语法参考](https://developers.weixin.qq.com/miniprogram/dev/reference/wxml/)。

用以下一些简单的例子来看看 WXML 具有什么能力：

## 数据绑定

```js
<!--wxml-->
<view> {{message}} </view>

// page.js
Page({
  data: {
    message: 'Hello MINA!'
  }
})
```

## 列表渲染

```js
<!--wxml-->
<view wx:for="{{array}}"> {{item}} </view>
// page.js
Page({
  data: {
    array: [1, 2, 3, 4, 5]
  }
})
```

## 条件渲染

```js
<!--wxml-->
<view wx:if="{{view == 'WEBVIEW'}}"> WEBVIEW </view>
<view wx:elif="{{view == 'APP'}}"> APP </view>
<view wx:else="{{view == 'MINA'}}"> MINA </view>

// page.js
Page({
  data: {
    view: 'MINA'
  }
})
```

## 模板

```js
<!--wxml-->
<template name="staffName">
  <view>
    FirstName: {{firstName}}, LastName: {{lastName}}
  </view>
</template>

<template is="staffName" data="{{...staffA}}"></template>
<template is="staffName" data="{{...staffB}}"></template>
<template is="staffName" data="{{...staffC}}"></template>
// page.js
Page({
  data: {
    staffA: {firstName: 'Hulk', lastName: 'Hu'},
    staffB: {firstName: 'Shang', lastName: 'You'},
    staffC: {firstName: 'Gideon', lastName: 'Lin'}
  }
})
```

# WXSS

WXSS (WeiXin Style Sheets)是一套样式语言，用于描述 WXML 的组件样式。

WXSS 用来决定 WXML 的组件应该怎么显示。

为了适应广大的前端开发者，WXSS 具有 CSS 大部分特性。

同时为了更适合开发微信小程序，WXSS 对 CSS 进行了扩充以及修改。

与 CSS 相比，WXSS 扩展的特性有：

- 尺寸单位

- 样式导入

## 尺寸单位

rpx（responsive pixel）: 可以根据屏幕宽度进行自适应。

规定屏幕宽为750rpx。

如在 iPhone6 上，屏幕宽度为375px，共有750个物理像素，则750rpx = 375px = 750物理像素，1rpx = 0.5px = 1物理像素。

建议： 开发微信小程序时设计师可以用 iPhone6 作为视觉稿的标准。

注意： 在较小的屏幕上不可避免的会有一些毛刺，请在开发时尽量避免这种情况。

## 样式导入

使用 `@import` 语句可以导入外联样式表，@import后跟需要导入的外联样式表的相对路径，用 `;` 表示语句结束。

示例代码：

```css
/** common.wxss **/
.small-p {
  padding:5px;
}
/** app.wxss **/
@import "common.wxss";
.middle-p {
  padding:15px;
}
```

## 内联样式 

框架组件上支持使用 style、class 属性来控制组件的样式。

### style

静态的样式统一写到 class 中。

style 接收动态的样式，在运行时会进行解析，请尽量避免将静态的样式写进 style 中，以免影响渲染速度。

```xml
<view style="color:{{color}};" />
```

### class

用于指定样式规则，其属性值是样式规则中类选择器名(样式类名)的集合，样式类名不需要带上 `.`，样式类名之间用空格分隔。

```xml
<view class="normal_view" />
```

## 选择器

目前支持的选择器有：

| 选择器	| 样例	|  样例描述 |
|:---|:---|:---|
| .class	          | .intro	        | 选择所有拥有 class="intro" 的组件 |
| #id	              | #firstname	    | 选择拥有 id="firstname" 的组件 |
| element	          | view	          | 选择所有 view 组件 |
| element, element	| view, checkbox	| 选择所有文档的 view 组件和所有的 checkbox 组件 |
| ::after	          | view::after	    | 在 view 组件后边插入内容 |
| ::before	        | view::before	  | 在 view 组件前边插入内容 |

## 全局样式与局部样式

定义在 app.wxss 中的样式为全局样式，作用于每一个页面。

在 page 的 wxss 文件中定义的样式为局部样式，只作用在对应的页面，并会覆盖 app.wxss 中相同的选择器。

# WXS

WXS（WeiXin Script）是小程序的一套脚本语言，结合 WXML，可以构建出页面的结构。

## 注意

- WXS 不依赖于运行时的基础库版本，可以在所有版本的小程序中运行。

- WXS 与 JavaScript 是不同的语言，有自己的语法，并不和 JavaScript 一致。

- WXS 的运行环境和其他 JavaScript 代码是隔离的，WXS 中不能调用其他 JavaScript 文件中定义的函数，也不能调用小程序提供的API。

- WXS 函数不能作为组件的事件回调。

- 由于运行环境的差异，在 iOS 设备上小程序内的 WXS 会比 JavaScript 代码快 2 ~ 20 倍。在 android 设备上二者运行效率无差异。

以下是一些使用 WXS 的简单示例，要完整了解 WXS 语法，请参考 [WXS 语法参考](https://developers.weixin.qq.com/miniprogram/dev/reference/wxs/)。

## 页面渲染

```xml
<!--wxml-->
<wxs module="m1">
var msg = "hello world";

module.exports.message = msg;
</wxs>

<view> {{m1.message}} </view>
```

页面输出：

```
hello world
```

## 数据处理

```js
// page.js
Page({
  data: {
    array: [1, 2, 3, 4, 5, 1, 2, 3, 4]
  }
})
<!--wxml-->
<!-- 下面的 getMax 函数，接受一个数组，且返回数组中最大的元素的值 -->
<wxs module="m1">
var getMax = function(array) {
  var max = undefined;
  for (var i = 0; i < array.length; ++i) {
    max = max === undefined ?
      array[i] :
      (max >= array[i] ? max : array[i]);
  }
  return max;
}

module.exports.getMax = getMax;
</wxs>

<!-- 调用 wxs 里面的 getMax 函数，参数为 page.js 里面的 array -->
<view> {{m1.getMax(array)}} </view>
```

页面输出：

```
5
```



# 参考资料

https://developers.weixin.qq.com/miniprogram/dev/framework/structure.html


* any list
{:toc}