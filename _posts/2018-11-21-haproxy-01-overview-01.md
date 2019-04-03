---
layout: post
title:  HAProxy-01-Overview
date: 2018-11-22 8:01:55 +0800
categories: [Web]
tags: [web-server, overview, ha, load-balance, sh]
published: true
---


# HAProxy

[HAProxy](https://www.haproxy.org/)  is a free, very fast and reliable solution offering high availability, load balancing, and proxying for TCP and HTTP-based applications. It is particularly suited for very high traffic web sites and powers quite a number of the world's most visited ones. Over the years it has become the de-facto standard opensource load balancer, is now shipped with most mainstream Linux distributions, and is often deployed by default in cloud platforms. Since it does not advertise itself, we only know it's used when the admins report it。

## 性能

HAProxy涉及操作系统体系结构中常见的几种技术，以实现绝对最大性能：

单进程，事件驱动模型大大降低了上下文切换和内存使用的成本。可以在一毫秒内处理数百个任务，并且每个会话的内存使用量大约为几千字节，而在preforked或线程服务器中消耗的内存更多的是每个进程的兆字节数量级。

允许它的系统上的O（1）事件检查器（Linux和FreeBSD）允许在成千上万的任何连接上即时检测任何事件。

使用延迟事件缓存对事件检查器的延迟更新可确保我们永远不会更新事件，除非绝对需要。这节省了大量的系统调用。

单缓冲，尽可能在读取和写入之间不进行任何数据复制。这节省了大量CPU周期和有用的内存带宽。通常，瓶颈将是CPU和网络接口之间的I / O总线。在10-100 Gbps时，内存带宽也可能成为瓶颈。

使用Linux下的splice（）系统调用可以进行零拷贝转发，从而实现从Linux 3.5开始的真正零拷贝。这允许一个小于3瓦的设备（如Seagate Dockstar）以1千兆位/秒的速度转发HTTP流量。

MRU内存分配器使用固定大小的内存池进行即时内存分配，有利于热缓存区域而不是冷缓存区域。这大大减少了创建新会话所需的时间。

工作因子，例如一次多个accept（），以及在多进程模式下运行时限制每次迭代的accept（）数量的能力，以便在进程之间均匀分配负载。

在多进程模式下运行时支持CPU亲和性，或者只是为了适应硬件，并且尽可能与管理NIC的CPU核心最接近，而不与之冲突。

基于树的存储，大量使用弹性二叉树，我已经开发了好几年了。这用于保持定时器的顺序，以保持命令的运行队列，管理循环和最少conn队列，在表中查找ACL或密钥，只需要O（log（N））成本。

优化的计时器队列：如果推迟计时器，它们不会在树中移动，因为它们被满足的可能性接近于零，因为它们主要用于超时处理。这进一步优化了ebtree的使用。

优化的HTTP标头分析：标头被解析为动态解释，并且优化解析以避免重新读取任何先前读取的存储区域。当使用不完整的头到达缓冲区的末尾时使用检查点，这样当读取更多数据时，解析不会从头开始。在快速Xeon E5上解析平均HTTP请求通常需要半微秒。

小心减少昂贵的系统调用次数。大多数工作默认在用户空间中完成，例如时间读取，缓冲区聚合，文件描述符启用/禁用。

内容分析经过优化，只能携带指向原始数据的指针，除非需要转换数据，否则永远不会复制。这确保了非常小的结构被携带并且在不绝对必要时不会复制内容。

> [性能测试报告](https://www.haproxy.org/10g.html)

## 衡量负载均衡的标准

有三个重要因素用于衡量负载均衡器的性能：

## 会话率

这个因素非常重要，因为它直接决定了负载均衡器何时无法分发它收到的所有请求。它主要依赖于CPU。有时，您会听到请求/ s或hits / s，它们与HTTP / 1.0或HTTP / 1.1中的sessions / s相同，并且禁用了keep-alive。启用保持活动的请求/通常要高得多（因为它显着减少了系统端工作），但对于面向Internet的部署通常没有意义，因为客户端经常打开大量连接，并且在转换时不会为每个连接发送许多请求。该因子是用不同的对象大小来测量的，最快的结果通常来自空对象（例如：HTTP 302,304或404响应代码）。 2014年，Xeon E5系统的会话速率约为100,000会话/秒。

## 会话并发

这个因素与前一个因素有关。通常，当并发会话数增加时，会话速率将下降（epoll或kqueue轮询机制除外）。服务器越慢，同一会话速率的并发会话数越多。如果负载均衡器每秒接收10000个会话，并且服务器在100毫秒内响应，则负载均衡器将具有1000个并发会话。此数量受内存量和系统可处理的文件描述符数量的限制。对于16 kB缓冲区，HAProxy每个会话需要大约34 kB，这导致每GB RAM大约30000个会话。实际上，系统中的套接字缓冲区也需要一些内存，每GB RAM 20000个会话更合理。第4层负载平衡器通常会宣布数百万个并发会话，因为它们需要处理系统在代理中免费处理的TIME_WAIT套接字。它们也不处理任何数据，因此它们不需要任何缓冲区。此外，它们有时被设计用于直接服务器返回模式，其中负载均衡器仅看到前向流量，并且强制它在结束后长时间保持会话以避免在关闭之前切断会话。

## 数据转发率

该因素通常与会话率相反。它以兆字节/秒（MB / s）为单位，有时以千兆位/秒（Gbps）为单位。使用大型对象可以实现最高的数据速率，从而最大限度地减少会话设置和拆卸造成的开销。大对象通常会增加会话并发性，而高数据速率的高会话并发性需要大量内存来支持大型窗口。高数据速率会在软件负载平衡器上烧毁大量CPU和总线周期，因为必须将数据从输入接口复制到存储器然后再返回到输出设备。硬件负载平衡器倾向于直接将数据包从输入端口切换到输出端口以获得更高的数据速率，但无法处理它们，有时无法触摸标头或cookie。 2014年典型Xeon E5上的Haproxy可以将数据转发到大约40 Gbps。无风扇1.6 GHz Atom CPU略高于1 Gbps。
负责平衡器与这些因素相关的性能通常是针对最佳情况宣布的（例如：会话速率为空对象，数据速率为大对象）。这不是因为供应商缺乏诚实，而是因为无法确切地说出它在每种组合中的表现如何。因此，当知道这3个限制时，客户应该意识到它通常会在所有这些限制之下执行。对软件负载平衡器的一个好的经验法则是考虑平均大小对象的最大会话和数据速率的一半的平均实际性能。

## 其他

Reliability - keeping high-traffic sites online since 2002

Security - Not even one intrusion in 13 years

# 参考资料

- 官方

https://www.haproxy.com/

https://www.haproxy.org/

https://en.wikipedia.org/wiki/HAProxy

https://github.com/observing/haproxy

- 其他

https://wiki.archlinux.org/index.php/HAproxy

[An Introduction to HAProxy and Load Balancing Concepts](https://www.digitalocean.com/community/tutorials/an-introduction-to-haproxy-and-load-balancing-concepts)

* any list
{:toc}