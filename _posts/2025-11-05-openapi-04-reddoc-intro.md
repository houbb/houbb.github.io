---
layout: post
title: OpenAPI-04-redoc openapi 更好看的文档
date: 2025-11-05 14:12:33 +0800
categories: [HTTP]
tags: [http, openapi, sh]
published: true
---

# 前言

swagger 用起来比较方便，但是比较工科审美。

样式还是不够好看。

# 入门例子

可以命令行比较简单的实现。

## 安装

```
>npm install -g redoc-cli
```

## 生成

```
npx redoc-cli bundle http://localhost:8080/v3/api-docs -o api-doc.html
```

成功的日志

```
   ┌───────────────────── DEPRECATED ─────────────────────┐
   │                                                      │
   │   This package is deprecated.                        │
   │                                                      │
   │   Use `npx @redocly/cli build-docs <api>` instead.   │
   │                                                      │
   └──────────────────────────────────────────────────────┘

Prerendering docs

🎉 bundled successfully in: api-doc.html (1066 KiB) [⏱ 0.328s]
```

然后就可以直接在当前目录下，浏览器打开 `api-doc.html` 即可。

# 在线页面例子

为了让大家更加方便的学习，我写了一个简单的 html。

支持 openapi 的格式校验，和点击生成对应的 html 文档信息。

> [https://houbb.github.io/tools/tools/openapi/index.html](https://houbb.github.io/tools/tools/openapi/index.html)

# 参考资料

* any list
{:toc}