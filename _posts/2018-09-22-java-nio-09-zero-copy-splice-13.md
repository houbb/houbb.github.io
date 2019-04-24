---
layout: post
title:  Java NIO-09-零拷贝之 Splice
date:  2018-09-22 12:20:47 +0800
categories: [Java]
tags: [java, io, linux, zero-copy, sf]
published: true
---

# splice()

splice() 是　 Linux 　中与 mmap() 和　 sendfile() 类似的一种方法。

它也可以用于用户应用程序地址空间和操作系统地址空间之间的数据传输。

splice() 适用于可以确定数据传输路径的用户应用程序，它不需要利用用户地址空间的缓冲区进行显式的数据传输操作。

那么，当数据只是从一个地方传送到另一个地方，过程中所传输的数据不需要经过用户应用程序的处理的时候，spice() 就成为了一种比较好的选择。

splice() 可以在操作系统地址空间中整块地移动数据，从而减少大多数数据拷贝操作。

而且，splice() 进行数据传输可以通过异步的方式来进行，用户应用程序可以先从系统调用返回，而操作系统内核进程会控制数据传输过程继续进行下去。

splice() 可以被看成是类似于基于流的管道的实现，管道可以使得两个文件描述符相互连接，splice 的调用者则可以控制两个设备（或者协议栈）在操作系统内核中的相互连接。

## 流程

splice() 系统调用和 sendfile() 非常类似，用户应用程序必须拥有两个已经打开的文件描述符，一个用于表示输入设备，一个用于表示输出设备。

与 sendfile() 不同的是，splice() 允许任意两个文件之间互相连接，而并不只是文件到 socket 进行数据传输。

对于从一个文件描述符发送数据到 socket 这种特例来说，一直都是使用 sendfile() 这个系统调用，而 splice 一直以来就只是一种机制，它并不仅限于 sendfile() 的功能。

也就是说，sendfile() 只是 splice() 的一个子集，在 Linux 2.6.23 中，sendfile() 这种机制的实现已经没有了，但是这个 API 以及相应的功能还存在，只不过 API 以及相应的功能是利用了 splice() 这种机制来实现的。

在数据传输的过程中，splice() 机制交替地发送相关的文件描述符的读写操作，并且可以将读缓冲区重新用于写操作。它也利用了一种简单的流控制，通过预先定义的水印（ watermark ）来阻塞写请求。有实验表明，利用这种方法将数据从一个磁盘传输到另一个磁盘会增加 30% 到 70% 的吞吐量，数据传输的过程中， CPU 的负载也会减少一半。

Linux 2.6.17 内核引入了 splice() 系统调用，但是，这个概念在此之前其实已经存在了很长一段时间了。

1988 年，Larry McVoy 提出了这个概念，它被看成是一种改进服务器端系统的 I/O 性能的一种技术，尽管在之后的若干年中经常被提及，但是 splice 系统调用从来没有在主流的 Linux 操作系统内核中实现过，一直到 Linux 2.6.17 版本的出现。

splice 系统调用需要用到四个参数，其中两个是文件描述符，一个表示文件长度，还有一个用于控制如何进行数据拷贝。splice 系统调用可以同步实现，也可以使用异步方式来实现。在使用异步方式的时候，用户应用程序会通过信号 SIGIO 来获知数据传输已经终止。

## 接口

splice() 系统调用的接口如下所示：

```c
long splice(int fdin, int fdout, size_t len, unsigned int flags);
```

调用 splice() 系统调用会导致操作系统内核从数据源 fdin 移动最多 len 个字节的数据到 fdout 中去，这个数据的移动过程只是经过操作系统内核空间，需要最少的拷贝次数。

使用 splice() 系统调用需要这两个文件描述符中的一个必须是用来表示一个管道设备的。

不难看出，这种设计具有局限性，Linux 的后续版本针对这一问题将会有所改进。

参数 flags 用于表示拷贝操作的执行方法，当前的 flags 有如下这些取值：

SPLICE_F_NONBLOCK：splice 操作不会被阻塞。然而，如果文件描述符没有被设置为不可被阻塞方式的 I/O ，那么调用 splice 有可能仍然被阻塞。

SPLICE_F_MORE：告知操作系统内核下一个 splice 系统调用将会有更多的数据传来。

SPLICE_F_MOVE：如果输出是文件，这个值则会使得操作系统内核尝试从输入管道缓冲区直接将数据读入到输出地址空间，这个数据传输过程没有任何数据拷贝操作发生。

ps: 关于接口的信息，应该取查阅文档。

## linux 对于 splice 的支持

Splice() 系统调用利用了 Linux 提出的管道缓冲区（ pipe buffer ）机制，这就是为什么这个系统调用的两个文件描述符参数中至少有一个必须要指代管道设备的原因。

为了支持 splice 这种机制，Linux 在用于设备和文件系统的 file_operations 结构中增加了下边这两个定义：

```c
ssize_t (*splice_write)(struct inode *pipe, strucuct file *out, 
                      size_t len, unsigned int flags); 
ssize_t (*splice_read)(struct inode *in, strucuct file *pipe, 
                      size_t len, unsigned int flags);
```

这两个新的操作可以根据 flags 的设定在 pipe 和 in 或者 out 之间移动 len 个字节。

Linux 文件系统已经实现了具有上述功能并且可以使用的操作，而且还实现了一个 generic_splice_sendpage() 函数用于和 socket 之间的接合。

# 参考资料

https://www.ibm.com/developerworks/cn/linux/l-cn-zerocopy2/

* any list
{:toc}