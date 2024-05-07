---
layout: post
title:  NodeJs-02 First Server
date:  2018-04-23 21:08:50 +0800
categories: [NodeJs]
tags: [js, nodejs, nodejs-learn, js-learn]
published: true
---

# 简单的服务

## server.js

内容如下:

```js
const http = require('http');

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World\n');
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
```

## 服务的运行

```
$   node server.js
```

日志如下：

```
Server running at http://127.0.0.1:3000/
```

## 访问

直接访问 [http://127.0.0.1:3000/](http://127.0.0.1:3000/) 即可看到写着 "hello world" 的页面。


* any list
{:toc}