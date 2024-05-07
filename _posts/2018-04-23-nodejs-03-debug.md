---
layout: post
title:  NodeJs-03 Debug
date:  2018-04-24 07:01:32 +0800
categories: [NodeJs]
tags: [js, nodejs, nodejs-learn, js-learn]
published: true
---

# Debug

## 开启调试

- Node.js 

[Enable Inspector](https://nodejs.org/en/docs/guides/debugging-getting-started/#enable-inspector)

当开启 `--inspect` 时，Node.js 进程通过 websocket 侦听由[检查器协议](https://chromedevtools.github.io/debugger-protocol-viewer/v8/)
定义的诊断命令，默认情况下为主机和端口127.0.0.1:9229。

每个进程也被分配一个唯一的[UUID](https://tools.ietf.org/html/rfc4122)(例如:0f2c936f-b1cd-4ac9-aab3-f63b0f33d55e)。

- 检查器客户端

检查器客户端必须知道并指定主机地址、端口和UUID以连接到WebSocket接口。
完整的URL是 `ws://127.0.0.1:9229/0f2c936f-b1cd-4ac9-aab3-f63b0f33d55e`，当然取决于实际的主机和端口，并使用正确的UUID作为实例。

## 实际测试

- 启动

```
$ node --inspect server.js
Debugger listening on ws://127.0.0.1:9229/795bbefc-38c4-4ef7-bcb0-a242a0de686f
For help see https://nodejs.org/en/docs/inspector
Server running at http://127.0.0.1:3000/
```

- 测试

暂时还不会，TODO

# 参考

> [Nodejs 调试方法](https://www.cnblogs.com/knightreturn/p/6480637.html)

# TODO

- 前端日志处理

模仿后端的日志系统设计


* any list
{:toc}