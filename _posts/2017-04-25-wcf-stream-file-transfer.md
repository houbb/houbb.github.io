---
layout: post
title:  WCF-08-stream-file-transfer
date:  2017-04-25 07:29:38 +0800
categories: [Network]
tags: [wcf]
header-img: "static/app/res/img/nightsky-bg.jpeg"
published: true
---


# TransferMode

如果你不喜欢用Socket来传文件，不妨试试WCF，WCF的流模式传输还是相当强大和相当实用的。

因为开启流模式是基于绑定的，所以，它会影响到整个终结点的操作协定。如果你不记得或者说不喜欢背书，不想去记住哪些绑定支持流模式，可以通过以下方法：

因为开启流模式，主要是设置一个叫 **TransferMode** 的属性，所以，你看看哪些 Binding 的派生类有这个属性就可以了。

TransferMode其实是一个举枚，看看它的几个有效值：

- Buffered：缓冲模式，说白了就是在内存中缓冲，一次调用就把整个消息读/写完，也就是我们最常用的方式，就是普通的操作协定的调用方式；

- StreamedRequest：只是在请求的时候使用流，说简单一点就是在传入方法的参数使用流，如 int MyMethod(System.IO.Stream stream);

- StreamedResponse：就是操作协定方法返回一个流，如 Stream MyMethod(string file_name);

一般而言，如果使用流作为传入参数，最好不要使用多个参数，如这样：

```
bool TransferFile(Stream stream, string name);
```

上面的方法就有了两个in参数了，最好别这样，为什么？有空的话，自己试试就知道了。那如果要传入更多的数据，怎么办？还记得[消息协定](https://houbb.github.io/2017/04/24/wcf-message-contract)吗？


# Simple Demo

好的，下面我们来弄一个上传MP3文件的实例。实例主要的工作是从客户端上传一个文件到服务器。







