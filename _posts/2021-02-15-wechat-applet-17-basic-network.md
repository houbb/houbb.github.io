---
layout: post
title:  17-微信小程序网络
date:  2021-2-14 16:52:15 +0800
categories: [Dev]
tags: [dev, windows, sh]
published: true
---

# 网络

在小程序/小游戏中使用网络相关的 API 时，需要注意下列问题，请开发者提前了解。

# 1. 服务器域名配置

每个微信小程序需要事先设置通讯域名，小程序只可以跟指定的域名进行网络通信。

包括普通 HTTPS 请求（wx.request）、上传文件（wx.uploadFile）、下载文件（wx.downloadFile) 和 WebSocket 通信（wx.connectSocket）。

从基础库 2.4.0 开始，网络接口允许与局域网 IP 通信，但要注意 不允许与本机 IP 通信。

从 2.7.0 开始，提供了 UDP 通信（wx.createUDPSocket)。

## 配置流程

服务器域名请在 「小程序后台-开发-开发设置-服务器域名」 中进行配置，配置时需要注意：

域名只支持 https (wx.request、wx.uploadFile、wx.downloadFile) 和 wss (wx.connectSocket) 协议；

域名不能使用 IP 地址（小程序的局域网 IP 除外）或 localhost；

可以配置端口，如 https://myserver.com:8080，但是配置后只能向 https://myserver.com:8080 发起请求。如果向 https://myserver.com、https://myserver.com:9091 等 URL 请求则会失败。

如果不配置端口。如 https://myserver.com，那么请求的 URL 中也不能包含端口，甚至是默认的 443 端口也不可以。如果向 https://myserver.com:443 请求则会失败。

域名必须经过 ICP 备案；

出于安全考虑，api.weixin.qq.com 不能被配置为服务器域名，相关API也不能在小程序内调用。 

开发者应将 AppSecret 保存到后台服务器中，通过服务器使用 getAccessToken 接口获取 access_token，并调用相关 API；

不支持配置父域名，使用子域名。


# 2. 网络请求

## 超时时间

默认超时时间和最大超时时间都是 60s；

超时时间可以在 app.json 或 game.json 中通过 networktimeout 配置。

## 使用限制

网络请求的 referer header 不可设置。其格式固定为 https://servicewechat.com/{appid}/{version}/page-frame.html，其中 {appid} 为小程序的 appid，{version} 为小程序的版本号，版本号为 0 表示为开发版、体验版以及审核版本，版本号为 devtools 表示为开发者工具，其余为正式版本；

wx.request、wx.uploadFile、wx.downloadFile 的最大并发限制是 10 个；

wx.connectSocket 的最大并发限制是 5 个。

小程序进入后台运行后，如果 5s 内网络请求没有结束，会回调错误信息 fail interrupted；在回到前台之前，网络请求接口调用都会无法调用。

## 返回值编码

建议服务器返回值使用 UTF-8 编码。对于非 UTF-8 编码，小程序会尝试进行转换，但是会有转换失败的可能。

小程序会自动对 BOM 头进行过滤（只过滤一个BOM头）。

## 回调函数

只要成功接收到服务器返回，无论 statusCode 是多少，都会进入 success 回调。请开发者根据业务逻辑对返回值进行判断。

# 参考资料

https://developers.weixin.qq.com/miniprogram/dev/framework/custom-component/observer.html

* any list
{:toc}
