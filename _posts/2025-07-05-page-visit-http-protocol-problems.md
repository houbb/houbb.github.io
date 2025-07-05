---
layout: post
title: 页面 https 域名访问 http/https 等踩坑笔记
date: 2025-07-05 21:01:55 +0800
categories: [Tool]
tags: [note, sh]
published: true
---

# 背景

在自己的 https 的域名访问后端接口的时候，产线踩坑的比较。


# v1-访问对方的 http 域名

因为是 https 页面访问 http 会遇到一个类似如下的异常：

```
Mixed Content: The page at 'https://xxx' was loaded over HTTPS, but requested an insecure resource 'http://xxx'. This request has been blocked.
```

## 原因

HTTPS 页面要求所有子资源（脚本、样式、接口等）必须通过加密的 HTTPS 协议加载。

若页面内发起 HTTP 请求，浏览器会判定为不安全行为（可能被中间人攻击篡改），并阻止请求（状态码 (blocked:mixed-content)）

## 解决方式

后端升级为 HTTPS 协议，或者调整为对应的 https 接口。

# v2-直接访问对方的 https

希望在页面直接访问对方的 https 接口，发现对方的后端直接 CORS 限制，失败。

这种一般对方的后端接口看针对哪些域名之类的进行了 CORS 跨域的设置。

> [CORS 介绍](https://houbb.github.io/2018/04/04/cors)


# v3-http 的域名转发

一种比较靠谱的方式是，https 的页面，访问自己对应的 https 后端接口。

然后在后端，通过 http 请求转发来解决。

这种虽然比较绕，但是也不失为一种解决方案。

# 小结

还有就是很多应用的 post 请求，可能使用的还是 form 的形式，一定要注意。

# 参考资料


* any list
{:toc}