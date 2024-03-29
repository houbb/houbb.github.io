---
layout: post
title: uniapp 教程-15-app nvue api and event 接口与事件
date: 2021-11-15 21:01:55 +0800
categories: [WEB]
tags: [web, cross-plateform, uni-app, sh]
published: true
---

# API

内容较为琐碎，使用时查阅即可：

> [nvue-api](https://uniapp.dcloud.net.cn/tutorial/nvue-api.html)

# 事件

Weex 提供了通过事件触发动作的能力，例如在用户点击组件时执行 JavaScript。 

下面列出了可被添加到 Weex 组件上以定义事件动作的属性：

## 事件穿透

Android和iOS下原生事件传递机制不同，这里仅针对iOS

当一个父View存在多个同级子View时，由于iOS会选择层级最高的View来响应事件，底层的View的事件永远都不会响应。

Weex在view组件中增加了eventPenetrationEnabled属性，当值为true（默认为false）时，View的子View仍能正常响应事件，但View自身将不会响应事件。

## View 交互性

仅iOS支持

Weex在view组件中增加了userInteractionEnabled属性，当值为false（默认为true）时，View及其子View均不响应事件，事件向下层View传递。

### longpress

如果一个组件被绑定了 longpress 事件，那么当用户长按这个组件时，该事件将会被触发。

事件对象

| key			| value			备注 |
|:---|:---|:---|
| type		| longpress	 | |
| target		| -			|   触发长按事件的目标组件 |
| timestamp	| -			   | 长按事件触发时的时间戳(不支持 H5) |

### Appear

如果一个位于某个可滚动区域内的组件被绑定了 appear 事件，那么当这个组件的状态变为在屏幕上可见时，该事件将被触发。

### Disappear

如果一个位于某个可滚动区域内的组件被绑定了 disappear 事件，那么当这个组件被滑出屏幕变为不可见状态时，该事件将被触发。

# 参考资料

https://uniapp.dcloud.net.cn/tutorial/nvue-api.html#dom

* any list
{:toc}
