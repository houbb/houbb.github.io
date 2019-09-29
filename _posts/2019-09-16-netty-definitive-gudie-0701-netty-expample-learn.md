---
layout: post
title: Netty 权威指南-07-Netty example 例子学习
date:  2019-5-10 11:08:59 +0800
categories: [Netty]
tags: [netty, sh]
published: true
---

# netty.example 包

可以直接参见 [https://netty.io/4.1/xref/overview-summary.html](https://netty.io/4.1/xref/overview-summary.html)

以  netty.example 开头的包。

## netty 学习的难点

国内的资料较少，书籍其实也不多。

netty 官网的 document 内容其实不多，就是前面提到的几节。

可以说，netty 和 java nio 一样，入门相对容易，但是精通太难。

因为计算机世界，就是由单体+网络通讯构成的。

理论上，我们学会 C，就可以编写 linux 操作系统。

学会 netty，也就可以编写所有网络应用。

但是实际上，知道和 master 之间，需要我们脚踏实地，一步步去学习，反馈。

netty 的例子其实是放在 netty.example 下的。

因为文档说再多，不如代码来的实在。

# 难度的梯度

《Netty 权威指南》这本书介绍了前面几节，后面直接来一个 http 文件服务器实现，说实在的，这种梯度设计的是不合理的。

## netty http 相关案例

我们可以按照顺序，依次学习下面的例子。

需要读懂其中的每一个实现类。

```
io.netty.example.file
io.netty.example.http.cors
io.netty.example.http.file
io.netty.example.http.helloworld
io.netty.example.http.snoop
io.netty.example.http.upload
io.netty.example.http.websocketx.benchmarkserver
io.netty.example.http.websocketx.client
io.netty.example.http.websocketx.server
```

下面的系列，学习完成后，全部替换为学习的笔记。

## 实战

[rpc](https://blog.csdn.net/yinbucheng/article/details/77095229)

[mq](https://blog.csdn.net/yinbucheng/article/details/77095264)

将 http/web service/rpc/mq 合为一体的框架。

## 数据库相关

[hades-kv 数据库]()

[passion-document 数据库]()

[sql-传统数据库]()

[graph-图形数据库]()

将 sql/kv/document/graph 合为一体的数据库

# 参考资料

《Netty 权威指南》

[netty 官方例子](https://netty.io/4.1/xref/io/netty/example/http/file/package-summary.html)

[Netty 实现HTTP文件服务器](https://blog.csdn.net/yinbucheng/article/details/77278641)

[利用Netty中提供的HttpChunk简单实现文件传输](http://www.west999.com/cms/wiki/code/2018-07-20/36526.html)

[netty 系列](https://blog.csdn.net/yinbucheng/article/category/6998392)

* any list
{:toc}