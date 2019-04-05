---
layout: post
title: Kafka 为什么这么快
date:  2018-09-19 15:44:59 +0800
categories: [MQ]
tags: [java, mq, kafka, why-so-fast, sh]
published: true
---

# Kafka

[Apache Kafka](https://houbb.github.io/2017/08/09/apacke-kafka) 也算是 MQ 的一颗新秀。

问题就是，Kafka 为什么这么快？

# Kafka 使用磁盘比内存快

其实Kafka最核心的思想是使用磁盘，而不是使用内存，可能所有人都会认为，内存的速度一定比磁盘快，我也不例外。

在看了Kafka的设计思想，查阅了相应资料再加上自己的测试后，发现磁盘的顺序读写速度和内存持平。

而且Linux对于磁盘的读写优化也比较多，包括read-ahead和write-behind，磁盘缓存等。

如果在内存做这些操作的时候，一个是JAVA对象的内存开销很大，另一个是随着堆内存数据的增多，JAVA的GC时间会变得很长，使用磁盘操作有以下几个好处：

- 磁盘缓存由Linux系统维护，减少了程序员的不少工作。

- 磁盘顺序读写速度超过内存随机读写。

- JVM的GC效率低，内存占用大。使用磁盘可以避免这一问题。

- 系统冷启动后，磁盘缓存依然可用。


# 生产者

生产者（producer）是负责向Kafka提交数据的，我们先分析这一部分。

Kafka会把收到的消息都写入到硬盘中，它绝对不会丢失数据。为了优化写入速度Kafak采用了两个技术，顺序写入和MMFile。

## 顺序 IO

因为硬盘是机械结构，每次读写都会寻址->写入，其中寻址是一个“机械动作”，它是最耗时的。

所以硬盘最“讨厌”随机I/O，最喜欢顺序I/O。

为了提高读写硬盘的速度，Kafka就是使用顺序I/O。

![顺序写入](http://7rf34y.com2.z0.glb.qiniucdn.com/c/20e2f6a98276fbc3955737ca246909ba)

上图就展示了Kafka是如何写入数据的，每一个Partition其实都是一个文件，收到消息后Kafka会把数据插入到文件末尾（虚框部分）。

- 缺陷

这种方法有一个缺陷——没有办法删除数据，所以Kafka是不会删除数据的，它会把所有的数据都保留下来，每个消费者（Consumer）对每个Topic都有一个offset用来表示读取到了第几条数据。

![没有办法删除数据](http://7rf34y.com2.z0.glb.qiniucdn.com/c/5d87cac3382b10778ea6ec66bf3f5573)

上图中有两个消费者，Consumer1有两个offset分别对应Partition0、Partition1（假设每一个Topic一个Partition）；Consumer2有一个offset对应Partition2。

这个offset是由客户端SDK负责保存的，Kafka的Broker完全无视这个东西的存在；一般情况下SDK会把它保存到zookeeper里面。(所以需要给Consumer提供zookeeper的地址)。

如果不删除硬盘肯定会被撑满，所以Kakfa提供了两种策略来删除数据。

一是基于时间，二是基于partition文件大小。具体配置可以参看它的配置文档。


## 内存映射文件(Memory Mapped Files)

即便是顺序写入硬盘，硬盘的访问速度还是不可能追上内存。

所以Kafka的数据并不是实时的写入硬盘，它充分利用了现代操作系统分页存储来利用内存提高I/O效率。

Memory Mapped Files(后面简称mmap)也被翻译成内存映射文件，在64位操作系统中一般可以表示20G的数据文件，它的工作原理是直接利用操作系统的Page来实现文件到物理内存的直接映射。完成映射之后你对物理内存的操作会被同步到硬盘上（操作系统在适当的时候）。

![MMF](http://7rf34y.com2.z0.glb.qiniucdn.com/c/67c5f10486fd9a5a4ba315e1e6c7c974)

通过mmap，进程像读写硬盘一样读写内存（当然是虚拟机内存），也不必关心内存的大小有虚拟内存为我们兜底。

使用这种方式可以获取很大的I/O提升，省去了用户空间到内核空间复制的开销（调用文件的read会把数据先放到内核空间的内存中，然后再复制到用户空间的内存中。）

- 缺陷

也有一个很明显的缺陷——不可靠，写到mmap中的数据并没有被真正的写到硬盘，操作系统会在程序主动调用flush的时候才把数据真正的写到硬盘。

Kafka提供了一个参数——producer.type来控制是不是主动flush，如果Kafka写入到mmap之后就立即flush然后再返回Producer叫同步(sync)；写入mmap之后立即返回Producer不调用flush叫异步(async)。

mmap其实是Linux中的一个函数就是用来实现内存映射的，谢谢Java NIO，它给我提供了一个mappedbytebuffer类可以用来实现内存映射（所以是沾了Java的光才可以如此神速和Scala没关系！！）

## 文件分段

Kafka的队列topic被分为了多个区partition, 每个partition又分为了多个segment。

所以一个队列中的消息实际上是保存在N多个片段文件中

通过分段的方式，每次文件操作都是对一个小文件的操作，非常轻便，同时也增加了并行处理能力


# 消费者

Kafka使用磁盘文件还想快速？这是我看到Kafka之后的第一个疑问，ZeroMQ完全没有任何服务器节点，也不会使用硬盘，按照道理说它应该比Kafka快。

可是实际测试下来它的速度还是被Kafka“吊打”。

“一个用硬盘的比用内存的快”，这绝对违反常识；如果这种事情发生说明——它作弊了。

没错，Kafka“作弊”。无论是顺序写入还是mmap其实都是作弊的准备工作。

## 零拷贝

当Kafka客户端从服务器读取数据时，如果不使用零拷贝技术，那么大致需要经历这样的一个过程：

1. 操作系统将数据从磁盘上读入到内核空间的读缓冲区中。

2. 应用程序（也就是Kafka）从内核空间的读缓冲区将数据拷贝到用户空间的缓冲区中。

3. 应用程序将数据从用户空间的缓冲区再写回到内核空间的socket缓冲区中。

4. 操作系统将socket缓冲区中的数据拷贝到NIC缓冲区中，然后通过网络发送给客户端。

![不使用零拷贝技术](https://www.itcodemonkey.com/data/upload/portal/20180731/1533039201148679.png)

从图中可以看到，数据在内核空间和用户空间之间穿梭了两次，那么能否避免这个多余的过程呢？

当然可以，Kafka使用了零拷贝技术，也就是直接将数据从内核空间的读缓冲区直接拷贝到内核空间的socket缓冲区，然后再写入到NIC缓冲区，避免了在内核空间和用户空间之间穿梭。

![使用零拷贝技术](https://www.itcodemonkey.com/data/upload/portal/20180731/1533039201450483.jpg)

可见，这里的零拷贝并非指一次拷贝都没有，而是避免了在内核空间和用户空间之间的拷贝。

如果真是一次拷贝都没有，那么数据发给客户端就没了不是？不过，光是省下了这一步就可以带来性能上的极大提升。

# 应用层面的优化

## 数据压缩

Kafka还支持消息压缩，Producer可以通过GZIP或者Snappy格式对消息集合进行压缩，从而减少网络传输的压力

## 使用批次

除了利用底层的技术外，Kafka还在应用程序层面提供了一些手段来提升性能。

最明显的就是使用批次。在向Kafka写入数据时，可以启用批次写入，这样可以避免在网络上频繁传输单个消息带来的延迟和带宽开销。

假设网络带宽为10MB/S，一次性传输10MB的消息比传输1KB的消息10000万次显然要快得多。

# 参考资料

https://www.itcodemonkey.com/article/6858.html

https://toutiao.io/posts/2glgbn/preview

https://www.jianshu.com/p/a1e593f7c3d2

https://acupple.github.io/2016/04/20/Kafka%E4%B8%BA%E4%BB%80%E4%B9%88%E5%A6%82%E6%AD%A4%E7%9A%84%E5%BF%AB/


* any list
{:toc}