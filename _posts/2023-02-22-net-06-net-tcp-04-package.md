---
layout: post
title: NET 网络专题汇总-06-04-TCP 实战抓包分析
date:  2023-02-22 +0800
categories: [Net]
tags: [net, tcp, sh]
published: true
---

# TCP 实战抓包分析

为了让大家更容易「看得见」 TCP，我搭建不少测试环境，并且数据包抓很多次，花费了不少时间，才抓到比较容易分析的数据包。

接下来丢包、乱序、超时重传、快速重传、选择性确认、流量控制等等 TCP 的特性，都能「一览无余」。

没错，我把 TCP 的"衣服扒光"了，就为了给大家看的清楚，嘻嘻。

![tcp 抓包](https://cdn.xiaolincoding.com/gh/xiaolincoder/ImageHost/%E8%AE%A1%E7%AE%97%E6%9C%BA%E7%BD%91%E7%BB%9C/TCP-Wireshark/2.jpg)

# 显形“不可见”的网络包

网络世界中的数据包交互我们肉眼是看不见的，它们就好像隐形了一样，我们对着课本学习计算机网络的时候就会觉得非常的抽象，加大了学习的难度。

还别说，我自己在大学的时候，也是如此。

直到工作后，认识了两大分析网络的利器：tcpdump 和 Wireshark，这两大利器把我们“看不见”的数据包，呈现在我们眼前，一目了然。

唉，当初大学学习计网的时候，要是能知道这两个工具，就不会学的一脸懵逼。

## tcpdump 和 Wireshark 有什么区别？

tcpdump 和 Wireshark 就是最常用的网络抓包和分析工具，更是分析网络性能必不可少的利器。

tcpdump 仅支持命令行格式使用，常用在 Linux 服务器中抓取和分析网络包。
Wireshark 除了可以抓包外，还提供了可视化分析网络包的图形页面。
所以，这两者实际上是搭配使用的，先用 tcpdump 命令在 Linux 服务器上抓包，接着把抓包的文件拖出到 Windows 电脑后，用 Wireshark 可视化分析。

当然，如果你是在 Windows 上抓包，只需要用 Wireshark 工具就可以。

## tcpdump 在 Linux 下如何抓包？

tcpdump 提供了大量的选项以及各式各样的过滤表达式，来帮助你抓取指定的数据包，不过不要担心，只需要掌握一些常用选项和过滤表达式，就可以满足大部分场景的需要了。

假设我们要抓取下面的 ping 的数据包：

![tcpdump](https://cdn.xiaolincoding.com/gh/xiaolincoder/ImageHost/%E8%AE%A1%E7%AE%97%E6%9C%BA%E7%BD%91%E7%BB%9C/TCP-Wireshark/3.jpg)

要抓取上面的 ping 命令数据包，首先我们要知道 ping 的数据包是 icmp 协议，接着在使用 tcpdump 抓包的时候，就可以指定只抓 icmp 协议的数据包：

![命令参数](https://cdn.xiaolincoding.com/gh/xiaolincoder/ImageHost/%E8%AE%A1%E7%AE%97%E6%9C%BA%E7%BD%91%E7%BB%9C/TCP-Wireshark/4.jpg)

那么当 tcpdump 抓取到 icmp 数据包后， 输出格式如下：

```
时间戳 协议 源地址：源端口 > 目的地址.目的端口 网络包详细信息
```

![格式](https://cdn.xiaolincoding.com/gh/xiaolincoder/ImageHost/%E8%AE%A1%E7%AE%97%E6%9C%BA%E7%BD%91%E7%BB%9C/TCP-Wireshark/6.jpg)


从 tcpdump 抓取的 icmp 数据包，我们很清楚的看到 icmp echo 的交互过程了，首先发送方发起了 ICMP echo request 请求报文，接收方收到后回了一个 ICMP echo reply 响应报文，之后 seq 是递增的。

我在这里也帮你整理了一些最常见的用法，并且绘制成了表格，你可以参考使用。

首先，先来看看常用的选项类，在上面的 ping 例子中，我们用过 -i 选项指定网口，用过 -nn 选项不对 IP 地址和端口名称解析。

其他常用的选项，如下表格：

![tcpdump](https://cdn.xiaolincoding.com/gh/xiaolincoder/ImageHost/%E8%AE%A1%E7%AE%97%E6%9C%BA%E7%BD%91%E7%BB%9C/TCP-Wireshark/7.jpg)

接下来，我们再来看看常用的过滤表用法，在上面的 ping 例子中，我们用过的是 `icmp and host 183.232.231.174`，表示抓取 icmp 协议的数据包，以及源地址或目标地址为 183.232.231.174 的包。

其他常用的过滤选项，我也整理成了下面这个表格。

![tcpdump 过滤表达式](https://cdn.xiaolincoding.com/gh/xiaolincoder/ImageHost/%E8%AE%A1%E7%AE%97%E6%9C%BA%E7%BD%91%E7%BB%9C/TCP-Wireshark/8.jpg)

说了这么多，你应该也发现了，tcpdump 虽然功能强大，但是输出的格式并不直观。

所以，在工作中 tcpdump 只是用来抓取数据包，不用来分析数据包，而是把 tcpdump 抓取的数据包保存成 pcap 后缀的文件，接着用 Wireshark 工具进行数据包分析。

## Wireshark 工具如何分析数据包？

Wireshark 除了可以抓包外，还提供了可视化分析网络包的图形页面，同时，还内置了一系列的汇总分析工具。

比如，拿上面的 ping 例子来说，我们可以使用下面的命令，把抓取的数据包保存到 ping.pcap 文件

```
tcpdump -i ethl icmp and host 183.232.231.174 -w ping.pcap
```

接着把 ping.pcap 文件拖到电脑，再用 Wireshark 打开它。打开后，你就可以看到下面这个界面：

![内容](https://cdn.xiaolincoding.com/gh/xiaolincoder/ImageHost/%E8%AE%A1%E7%AE%97%E6%9C%BA%E7%BD%91%E7%BB%9C/TCP-Wireshark/10.jpg)

是吧？在 Wireshark 的页面里，可以更加直观的分析数据包，不仅展示各个网络包的头部信息，还会用不同的颜色来区分不同的协议，由于这次抓包只有 ICMP 协议，所以只有紫色的条目。

接着，在网络包列表中选择某一个网络包后，在其下面的网络包详情中，可以更清楚的看到，这个网络包在协议栈各层的详细信息。

比如，以编号 1 的网络包为例子：

![网络包](https://cdn.xiaolincoding.com/gh/xiaolincoder/ImageHost/%E8%AE%A1%E7%AE%97%E6%9C%BA%E7%BD%91%E7%BB%9C/TCP-Wireshark/11.jpg)

可以在数据链路层，看到 MAC 包头信息，如源 MAC 地址和目标 MAC 地址等字段；
可以在 IP 层，看到 IP 包头信息，如源 IP 地址和目标 IP 地址、TTL、IP 包长度、协议等 IP 协议各个字段的数值和含义；
可以在 ICMP 层，看到 ICMP 包头信息，比如 Type、Code 等 ICMP 协议各个字段的数值和含义；

Wireshark 用了分层的方式，展示了各个层的包头信息，把“不可见”的数据包，清清楚楚的展示了给我们，还有理由学不好计算机网络吗？是不是相见恨晚？

从 ping 的例子中，我们可以看到网络分层就像有序的分工，每一层都有自己的责任范围和信息，上层协议完成工作后就交给下一层，最终形成一个完整的网络包。

![完整的网络包](https://cdn.xiaolincoding.com/gh/xiaolincoder/ImageHost/%E8%AE%A1%E7%AE%97%E6%9C%BA%E7%BD%91%E7%BB%9C/TCP-Wireshark/12.jpg)

# 解密 TCP 三次握手和四次挥手

既然学会了 tcpdump 和 Wireshark 两大网络分析利器，那我们快马加鞭，接下来用它俩抓取和分析 HTTP 协议网络包，并理解 TCP 三次握手和四次挥手的工作原理。

本次例子，我们将要访问的 http://192.168.3.200 服务端。在终端一用 tcpdump 命令抓取数据包：

```
tcpdump -i any tcp and host 192.168.3.200 and port 80 -w http.pcap
```

接着，在终端二执行下面的 curl 命令：

```
curl http://192.168.3.200
```

最后，回到终端一，按下 Ctrl+C 停止 tcpdump，并把得到的 http.pcap 取出到电脑。

使用 Wireshark 打开 http.pcap 后，你就可以在 Wireshark 中，看到如下的界面：

![Wireshark](https://cdn.xiaolincoding.com/gh/xiaolincoder/ImageHost/%E8%AE%A1%E7%AE%97%E6%9C%BA%E7%BD%91%E7%BB%9C/TCP-Wireshark/15.jpg)

我们都知道 HTTP 是基于 TCP 协议进行传输的，那么：

- 最开始的 3 个包就是 TCP 三次握手建立连接的包

- 中间是 HTTP 请求和响应的包

- 而最后的 3 个包则是 TCP 断开连接的挥手包

Wireshark 可以用时序图的方式显示数据包交互的过程，从菜单栏中，点击 统计 (Statistics) -> 流量图 (Flow Graph)，然后，在弹出的界面中的「流量类型」选择 「TCP Flows」，你可以更清晰的看到，整个过程中 TCP 流的执行过程：

![Wireshark](https://cdn.xiaolincoding.com/gh/xiaolincoder/ImageHost/%E8%AE%A1%E7%AE%97%E6%9C%BA%E7%BD%91%E7%BB%9C/TCP-Wireshark/16.jpg)

## 你可能会好奇，为什么三次握手连接过程的 Seq 是 0 ？

实际上是因为 Wireshark 工具帮我们做了优化，它默认显示的是序列号 seq 是相对值，而不是真实值。

如果你想看到实际的序列号的值，可以右键菜单， 然后找到「协议首选项」，接着找到「Relative Seq」后，把它给取消，操作如下：

TODO....

# 参考资料

https://xiaolincoding.com/network/3_tcp/tcp_tcpdump.html#%E6%98%BE%E5%BD%A2-%E4%B8%8D%E5%8F%AF%E8%A7%81-%E7%9A%84%E7%BD%91%E7%BB%9C%E5%8C%85

* any list
{:toc}