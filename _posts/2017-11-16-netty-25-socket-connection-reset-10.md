---
layout: post
title:  Netty-10-Connection Reset 异常分析
date:  2017-11-16 19:23:06 +0800
categories: [Netty]
tags: [netty, java, socket, ex, sh]
published: true
---

# Connection Reset

## 场景

当客户端关闭的时候，服务器会报错如下：

```
java.net.SocketException: Connection reset
....
```

## 对于问题的好奇心

这里遇到了一个异常。

按照常理，我们应该忽略这个内容，但是这里恰恰是我们可以学习到知识的地方。

我们应该会有如下的疑问：

1. 为什么会有这个异常？

2. 什么情况下会有这个异常?

3. 如何解决这个异常？

# 个人理解

1. 一个问题可以有多个解决方案，有时候问题本身比解决方案还有价值。

2. 最原理的知识《TCP/IP 原理详解》

# 参考资料

[一次SocketException：Connection reset 异常排查](https://www.cnblogs.com/shoren/p/httpclient-connectionreset.html)

[Socket java.net.SocketException: Connection reset的解决方案](https://blog.csdn.net/a718515028/article/details/79078508)

[Socket java.net.SocketException: Connection reset的解决方案](https://blog.csdn.net/qq_38339561/article/details/84887663)

[java.net.SocketException: Connection reset，解决办法](http://www.imooc.com/qadetail/288048)

[出现java.net.SocketException: Connection reset，这是什么原因造成的，该怎么办？](http://ask.zol.com.cn/q/2100015.html)

[java.net.SocketException: Connection reset的错误 解决方法](https://www.2cto.com/kf/201801/715675.html)

- ex

[java---Socket编程出现的异常种类](https://www.cnblogs.com/w-wfy/p/6415840.html)

* any list
{:toc}

