---
layout: post
title:  微信公众号项目开发实战-07-ios nav 微信下方的导航栏
date:  2022-07-08 09:22:02 +0800
categories: [Wechat]
tags: [wechat, sh]
published: true
---

# 现象

在 ios 系统，因为没有物理返回按键。

内嵌在微信浏览器的 h5 会在下方添加一个导航栏，方便用户来回的操作。

但是这存在一个问题，如果我们的 h5 最下方有内容，或者页面排版比较紧凑，会导致页面变形，遮挡等问题。

# 解决方案

## 协商

尽量页面不要铺满。

## 解决

隐藏掉对应的导航栏

# 隐藏导航栏的方式

```js
mounted() {
    this.back();
}，
methods: {
//监听微信自带的返回按钮
//写入空白的历史记录 
pushHistory() {
//写入空白历史路径
  let state = {
    title: 'title',
    url: "#"
  }
  window.history.pushState(state, state.title, state.url)
},
back() {
  this.pushHistory();
  window.addEventListener("popstate", function (e) {
    location.href = ''（此处为要跳转的制定路径）
  }, false);
},
}
```

可以在页面初始化的时候，清空对应的 history。

这样微信就认为不需要额外的滚动条，因为没有历史记录，



# 参考资料

https://blog.csdn.net/aloneiii/article/details/122122235

* any list
{:toc}