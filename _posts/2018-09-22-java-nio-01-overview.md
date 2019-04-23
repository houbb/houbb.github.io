---
layout: post
title:  Java NIO-01-Overview
date:  2018-09-22 09:18:47 +0800
categories: [Java]
tags: [java, nio, java-base, sf]
published: true
---

# NIO

## 是什么

Java NIO是java 1.4之后新出的一套IO接口，这里的的新是相对于原有标准的Java IO和Java Networking接口。NIO提供了一种完全不同的操作方式。

## 作用

Java NIO使我们可以进行非阻塞IO操作。

比如说，单线程中从通道读取数据到buffer，同时可以继续做别的事情，当数据读取到buffer中后，线程再继续处理数据。写数据也是一样的。

## 核心类

位于 `java.nio` 包下。

定义缓冲区，缓冲区是数据的容器，并提供其他NIO包的概述。
NIO api的中心抽象是:

- Buffers

缓冲区，它是数据的容器;

- Charsets

字符集及其相关解码器和编码器，在字节和Unicode字符之间转换;

- Channels

表示连接的各种类型的通道能够执行I/O操作的实体;

- Selectors

选择器和选择键，它们一起可选通道定义了多路复用、非阻塞通道 I/O 设备。

# NIO VS IO

## 面向流和面向缓冲区比较

第一个重大差异是IO是面向流的，而NIO是面向缓存区的。

这句话是什么意思呢？

Java IO面向流意思是我们每次从流当中读取一个或多个字节。怎么处理读取到的字节是我们自己的事情。他们不会再任何地方缓存。再有就是我们不能在流数据中向前后移动。如果需要向前后移动读取位置，那么我们需要首先为它创建一个缓存区。

Java NIO是面向缓冲区的，这有些细微差异。数据是被读取到缓存当中以便后续加工。我们可以在缓存中向向后移动。这个特性给我们处理数据提供了更大的弹性空间。当然我们任然需要在使用数据前检查缓存中是否包含我们需要的所有数据。另外需要确保在往缓存中写入数据时避免覆盖了已经写入但是还未被处理的数据。

## 阻塞和非阻塞IO比较

Java IO的各种流都是阻塞的。这意味着一个线程一旦调用了read(),write()方法，那么该线程就被阻塞住了，知道读取到数据或者数据完整写入了。在此期间线程不能做其他任何事情。

Java NIO的非阻塞模式使得线程可以通过channel来读数据，并且是返回当前已有的数据，或者什么都不返回如果当前没有数据可读的话。这样一来线程不会被阻塞住，它可以继续向下执行。

通常线程在调用非阻塞操作后，会通知处理其他channel上的IO操作。因此一个线程可以管理多个channel的输入输出。

- Selectors

Java NIO的selector允许一个单一线程监听多个channel输入。

我们可以注册多个channel到selector上，然后然后用一个线程来挑出一个处于可读或者可写状态的channel。

selector机制使得单线程管理过个channel变得容易。

## NIO和IO是如何影响程序设计的

开发中选择NIO或者IO会在多方面影响程序设计：

1. 使用NIO、IO的API调用类

2. 数据处理

3. 处理数据需要的线程数

### API调用(The API Calls)

显而易见使用NIO的API接口和使用IO时是不同的。

不同于直接冲InputStream读取字节，我们的数据需要先写入到buffer中，然后再从buffer中处理它们。

### 数据处理（The Processing of Data）

数据的处理方式也随着是NIO或IO而异。 

- IO 的实现方式

在IO设计中，我们从InputStream或者Reader中读取字节。

假设我们现在需要处理一个按行排列的文本数据，如下：

```
Name: Anna
Age: 25
Email: anna@mailserver.com
Phone: 1234567890
```

这个处理文本行的过程大概是这样的：

```java
InputStream input = ... ; // get the InputStream from the client socket
BufferedReader reader = new BufferedReader(new InputStreamReader(input));

String nameLine   = reader.readLine();
String ageLine    = reader.readLine();
String emailLine  = reader.readLine();
String phoneLine  = reader.readLine();
```

注意，处理状态如何由程序执行的距离决定。

换句话说，一旦第一个reader.readLine()方法返回，您就可以确定已经读取了一整行文本。readLine()阻塞直到读取整行，这就是原因所在。您还知道这一行包含名称。类似地，当第二个readLine()调用返回时，您知道这一行包含年龄等信息。

正如您所看到的，程序只有在有新数据需要读取时才会进行，对于每一步，您都知道这些数据是什么。一旦执行的线程在读取代码中的某段数据之后进行了进一步的工作，那么该线程就不会在数据中倒退(大多数情况下不会)。

这个原理在这个图中也有说明:

![nio-vs-io-1.png](http://tutorials.jenkov.com/images/java-nio/nio-vs-io-1.png)

- NIO 的实现方式

```java
ByteBuffer buffer = ByteBuffer.allocate(48);
int bytesRead = inChannel.read(buffer);
```

注意第二行从通道读取字节到ByteBuffer。当该方法调用返回时，您不知道所需的所有数据是否都在缓冲区中。您所知道的只是缓冲区包含一些字节。这使得处理过程更加困难。

想象一下，如果在第一次读(缓冲区)调用之后，所有读到缓冲区的内容都是半行。

例如，“Name: An”。你能处理这些数据吗?不是真的。您需要等待直到缓冲区中有完整的数据行，然后才有必要处理任何数据。

那么，您如何知道缓冲区是否包含足够多的数据，以便对其进行有意义的处理呢?好吧,你不喜欢。

找到答案的唯一方法是查看缓冲区中的数据。结果是，在知道所有数据是否都在缓冲区中之前，您可能需要多次检查缓冲区中的数据。

这不仅效率低下，而且在程序设计方面可能会变得混乱。

例如:

```java
ByteBuffer buffer = ByteBuffer.allocate(48);
int bytesRead = inChannel.read(buffer);
while(! bufferFull(bytesRead) ) {
    bytesRead = inChannel.read(buffer);
}
```

`bufferFull()` 方法必须跟踪有多少数据被读入缓冲区，并根据缓冲区是否满返回true或false。换句话说，如果缓冲区已准备好进行处理，则认为它已满。

`bufferFull()` 方法扫描缓冲区，但必须使缓冲区保持与调用bufferFull()方法之前相同的状态。如果没有，则下一个读入缓冲区的数据可能无法在正确的位置读入。这并非不可能，但这是另一个需要注意的问题。

如果缓冲区已满，则可以对其进行处理。如果数据不完整，您可能可以部分处理其中的任何数据，如果这在您的特定情况下有意义的话。在很多情况下不是这样。

下面的图说明了为缓冲准备的is-data-in-buffer-ready循环:

![nio-vs-io-2.png](http://tutorials.jenkov.com/images/java-nio/nio-vs-io-2.png)


## 总结

NIO允许我们只用一条线程来管理多个通道（网络连接或文件），随之而来的代价是解析数据相对于阻塞流来说可能会变得更加的复杂。

如果你需要同时管理成千上万的链接，这些链接只发送少量数据，例如聊天服务器，用NIO来实现这个服务器是有优势的。

类似的，如果你需要维持大量的链接，例如P2P网络，用单线程来管理这些 链接也是有优势的。

这种单线程多连接的设计可以用下图描述：

![nio-vs-io-3.png](http://tutorials.jenkov.com/images/java-nio/nio-vs-io-3.png)

如果使用非常高的带宽连接更少，一次发送大量数据，那么一个典型的IO服务器实现可能是最合适的。

这个图表展示了一个经典的IO服务器设计:

![nio-vs-io-4.png](http://tutorials.jenkov.com/images/java-nio/nio-vs-io-4.png)

# 参考资料

## 系列教程

http://tutorials.jenkov.com/java-nio/index.html

http://wiki.jikexueyuan.com/project/java-nio-zh/java-nio-tutorial.html

https://docs.oracle.com/javase/8/docs/api/java/nio/package-summary.html


## 进阶文章

https://tech.meituan.com/nio.html

https://www.ibm.com/developerworks/cn/education/java/j-nio/j-nio.html

http://www.importnew.com/19816.html

https://yq.aliyun.com/articles/2371

https://www.cnblogs.com/pony1223/p/8138233.html

https://www.jianshu.com/p/a9b2fec31fd1

http://www.jasongj.com/java/nio_reactor/

https://www.zhihu.com/question/29005375

## Doug Lea

http://ifeve.com/doug-lea/

* any list
{:toc}