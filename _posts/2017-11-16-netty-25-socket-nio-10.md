---
layout: post
title:  Netty-09-socket nio 版本
date:  2017-11-16 19:23:06 +0800
categories: [Netty]
tags: [netty, java, nio, sh]
published: false
---

# NIO 版本

服务器无需通过为每个客户端的链接而开启一个线程。

而是通过一个叫Selector的轮循器来不断的检测那个Channel有消息处理。

当发现有消息要处理时，通过 selectedKeys() 方法就可以获取所有有消息要处理的Set集合了。

下面是一些简单介绍：

## Channel

Channel 有两种ServerSocketChannel 和 SocketChannel，ServerSocketChannel可以监听新加入的Socket连接，SocketChannel用于读和写操作。

NIO总是把缓冲区的数据写入通道，或者把通道里的数据读出到缓冲区。

## Buffer

Buffer 本质上是一块用于读写的内存，只是被包装成了buffer对象，你可以通过allocateDirect()或者allocate()申请内存空间（allocate分配方式产生的内存开销是在JVM中的，而allocateDirect的分配方式产生的开销在JVM之外，以就是系统级的内存分配，使用allocateDirect尤其注意内存溢出问题），Buffer尤其需要理解三个概念，

capacity、position、limit，capacity是固定大小，position是当前读写位置，limit是一个类似于门限的值，用于控制读写的最大的位置。

Buffer的常用方法有clear、compact、flip等等，还有比如Buffer的静态方法wrap等等，这些需要根据capacity、position、limit的值进行理解。

## Selector

Selector 用于检测通道，我们通过它才知道哪个通道发生了哪个事件，所以如果需要用selector的话就需要首先进行register，然后遍历SelectionKey对事件进行处理。

它一共有SelectionKey.OP_CONNECT、SelectionKey.OP_ACCEPT、SelectionKey.OP_READ、SelectionKey.OP_WRITE四种事件类型。

# 基于NIO的TCP连接的建立步骤
 
## 服务端

```
1、传建一个Selector实例；

2、将其注册到各种信道，并指定每个信道上感兴趣的I/O操作；

3、重复执行：

    1）调用一种 select() 方法；

    2）获取选取的键列表；

    3）对于已选键集中的每个键：

        a、获取信道，并从键中获取附件（如果为信道及其相关的key添加了附件的话）；

        b、确定准备就绪的操纵并执行，如果是accept操作，将接收的信道设置为非阻塞模式，并注册到选择器；

        c、如果需要，修改键的兴趣操作集；

        d、从已选键集中移除键
```

## 客户端

与基于多线程的TCP客户端大致相同，只是这里是通过信道建立的连接，但在等待连接建立及读写时，我们可以异步地执行其他任务。

# 代码例子

## 服务器

```java
```

## 客户端

```java
```

# 拓展阅读

[NIO 系列学习](https://houbb.github.io/2018/09/22/java-nio-01-overview)

# 参考资料

[Java NIO浅析](https://zhuanlan.zhihu.com/p/23488863)

- blogs

[NIO主要原理及使用](https://www.cnblogs.com/fengjian/p/5606045.html)

[传统IOSocket和NIOSocket](https://blog.csdn.net/XlxfyzsFdblj/article/details/79746221)

[java Nio 使用 NioSocket 客户端与服务端交互实现](https://blog.csdn.net/qq_36666651/article/details/80955398)

[使用Java NIO实现异步的socket通信](https://blog.csdn.net/zhouxinyubest/article/details/20242011)

[简易版聊天系统实现 Socket VS NIO两种实现方式](https://blog.51cto.com/dba10g/1843410)

[Java Socket NIO示例总结](https://www.cnblogs.com/ywind/p/4555625.html)



* any list
{:toc}

