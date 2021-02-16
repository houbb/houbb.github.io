---
layout: post
title:  03-微信小程序目录结构
date:  2021-2-14 16:52:15 +0800
categories: [Dev]
tags: [dev, windows, sh]
published: true
---

# 目录结构

小程序包含一个描述整体程序的 app 和多个描述各自页面的 page。

一个小程序主体部分由三个文件组成，必须放在项目的根目录，如下：

| 文件	       | 必需	| 作用 |
|:---|:---|:---|
| app.js	   | 是	    | 小程序逻辑 |
| app.json	   | 是	    | 小程序公共配置 |
| app.wxss	   | 否	    | 小程序公共样式表 |

一个小程序页面由四个文件组成，分别是：

| 文件类型	   | 必需	| 作用 |
|:---|:---|:---|
| js	       | 是	    | 页面逻辑 |
| wxml	       | 是	    | 页面结构 |
| json	       | 否	    | 页面配置 |
| wxss	       | 否	    | 页面样式表 |

注意：为了方便开发者减少配置项，描述页面的四个文件必须具有相同的路径与文件名。

# 允许上传的文件

在项目目录中，以下文件会经过编译，因此上传之后无法直接访问到：.js、app.json、.wxml、*.wxss（其中 wxml 和 wxss 文件仅针对在 app.json 中配置了的页面）。

除此之外，只有后缀名在白名单内的文件可以被上传，不在白名单列表内文件在开发工具能被访问到，但无法被上传。

具体白名单列表如下：

```
wxs
png
jpg
jpeg
gif
svg
json
cer
mp3
aac
m4a
mp4
wav
ogg
silk
```

# 参考资料

https://developers.weixin.qq.com/miniprogram/dev/framework/structure.html


* any list
{:toc}