---
layout: post
title:  Vue Cli-13-部署
date:  2018-06-14 15:16:10 +0800
categories: [Vue]
tags: [vue]
published: true
---

# 通用指南

如果你用 Vue CLI 处理静态资源并和后端框架一起作为部署的一部分，那么你需要的仅仅是确保 Vue CLI 生成的构建文件在正确的位置，并遵循后端框架的发布方式即可。

如果你独立于后端部署前端应用——也就是说后端暴露一个前端可访问的 API，然后前端实际上是纯静态应用。

那么你可以将 dist 目录里构建的内容部署到任何静态文件服务器中，但要确保正确的 publicPath。

# 本地预览

dist 目录需要启动一个 HTTP 服务器来访问 (除非你已经将 publicPath 配置为了一个相对的值)，所以以 `file://` 协议直接打开 dist/index.html 是不会工作的。

在本地预览生产环境构建最简单的方式就是使用一个 Node.js 静态文件服务器，例如 serve：

```
npm install -g serve
# -s 参数的意思是将其架设在 Single-Page Application 模式下
# 这个模式会处理即将提到的路由问题
serve -s dist
```

# 使用 history.pushState 的路由

如果你在 history 模式下使用 Vue Router，是无法搭配简单的静态文件服务器的。

例如，如果你使用 Vue Router 为 /todos/42/ 定义了一个路由，开发服务器已经配置了相应的 localhost:3000/todos/42 响应，但是一个为生产环境构建架设的简单的静态服务器会却会返回 404。

为了解决这个问题，你需要配置生产环境服务器，将任何没有匹配到静态文件的请求回退到 index.html。

Vue Router 的文档提供了常用服务器配置指引。

# CORS

如果前端静态内容是部署在与后端 API 不同的域名上，你需要适当地配置 CORS

# PWA

如果你使用了 PWA 插件，那么应用必须架设在 HTTPS 上，这样 Service Worker 才能被正确注册。

# 参考资料

https://cli.vuejs.org/zh/guide/deployment.html#%E9%80%9A%E7%94%A8%E6%8C%87%E5%8D%97

* any list
{:toc}