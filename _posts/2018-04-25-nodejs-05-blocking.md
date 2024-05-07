---
layout: post
title:  NodeJs-05 Blocking vs Non-Blocking
date:  2018-04-26 11:17:51 +0800
categories: [NodeJs]
tags: [js, nodejs, nodejs-learn, js-learn]
published: true
---

# 阻塞(Blocking)

[Blocking](https://nodejs.org/en/docs/guides/blocking-vs-non-blocking/) 

是在节点中执行额外的JavaScript时。js进程必须等待非javascript操作完成。这是因为在发生阻塞操作时，事件循环无法继续运行JavaScript。

在 Node.js，由于CPU密集型而不是等待非JavaScript操作(比如I/O)而表现不佳的JavaScript，通常不被称为阻塞。
节点中的同步方法。使用 [libuv](http://libuv.org/) 的js标准库是最常用的阻塞操作。本机模块也可能有阻塞方法。

节点中的所有I/O方法。js标准库提供非阻塞的异步版本，并接受**回调函数**。有些方法也有阻塞副本，它们的名称以`Sync`结束。


# 代码示例

新建一个文件 `data.txt` 内容如下：

```
文件内容：对于数据的阻塞和非阻塞演示
```

## 阻塞版本

需要等待。


- sync.js

```js
var fs = require("fs");

var data = fs.readFileSync('data.txt');

console.log(data.toString());
console.log("程序执行结束!");
```

- 执行

```
$   node sync.js
```

- 执行结果

```
文件内容：对于数据的阻塞和非阻塞的演示
程序执行结束!
```

## 非阻塞版本

无需等待，即可进行后续执行。

- asyn.js

```
var fs = require("fs");

fs.readFile('data.txt', function (err, data) {
    if (err) return console.error(err);
    console.log(data.toString());
});

console.log("程序执行结束!");
```


- 执行

```
$   node asyn.js
```

- 执行结果

```
程序执行结束!
文件内容：对于数据的阻塞和非阻塞的演示
```

* any list
{:toc}