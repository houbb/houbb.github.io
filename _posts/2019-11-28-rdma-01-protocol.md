---
layout: post
title: RDMA-远程直接内存访问-01-RDMA 协议 iWARP 和 RoCE
date:  2019-11-20 11:18:30 +0800
categories: [Network]
tags: [network, tcp, dma, sh]
published: true
---

# 两种以太网 RDMA 协议： iWARP 和 RoCE

本文是讲演 How Ethernet RDMA Protocols iWARP and RoCE Support NVMe over Fabrics【1】的摘要。

如果 NVMe 存储系统与主机是分离的，显然需要某种 fabric 把它们连接，这样主机才能使用存储系统。

目前，支持远程连接的 fabric 包括：

RDMA 协议：底层可以是以太网（ RoCE 或者 iWARP ）或者 Infiniband

Fibre Channel 协议：底层可以是 FC 网络或者以太网（FCoE）

## 为什么需要 RDMA ？

RDMA (Remote Direct Memory Access) 是一种绕过主机 (host-offload/host-bypass) 技术：

```
一个应用（包括存储）<--发送/接收数据-->另外一个（远程）应用的内存空间。

Source Application <-- （发送/接收、完成）队列 --> 带 RDMA 功能的网卡 <-- 可靠的网络连接 --> 带RDMA 功能的网卡 <-- （发送/接收、完成）队列 --> Target Application
```

![机器](http://ww4.sinaimg.cn/large/715142afgw1f0fert11zsj20gn0c2adj.jpg)

由上图可知，应用程序可以从一台（物理的或者虚拟的）机器直接传送数据到另外一台机器，这既提高了带宽又降低了延迟、抖动和 CPU 消耗。

![RDMA 驱动](http://mmbiz.qpic.cn/mmbiz_png/oRL2fUHmGZBj667W4rJ3A7nxYuc9zND07mdZukLT8D8lyQtc1iabnYjUo4RfyEfpSAYPIr1VWvMFAMicibKW9iab8Q/0?wx_fmt=png)


因此，RDMA可以简单理解为利用相关的硬件和网络技术，服务器1的网卡可以直接读写服务器2的内存，最终达到高带宽、低延迟和低资源利用率的效果。

如下图所示，应用程序不需要参与数据传输过程，只需要指定内存读写地址，开启传输并等待传输完成即可。

![RDMA](http://mmbiz.qpic.cn/mmbiz_jpg/oRL2fUHmGZBj667W4rJ3A7nxYuc9zND0FfJRdX9chFicic9J27FXEqsXGsR9MalhGic5JEVeiaXdCPe32rWBnGXicYQ/0?wx_fmt=jpeg)


# 哪些网络协议支持RDMA

InfiniBand(IB): 从一开始就支持RDMA的新一代网络协议。由于这是一种新的网络技术，因此需要支持该技术的网卡和交换机。

RDMA过融合以太网(RoCE): 一种允许通过以太网进行RDMA的网络协议。

其较低的网络头是以太网头，其上网络头(包括数据)是InfiniBand头。这允许在标准以太网基础架构(交换机)上使用RDMA。只有NIC应该是特殊的，并支持RoCE。

互联网广域RDMA协议(iWARP): 允许通过TCP执行RDMA的网络协议。

在IB和RoCE中存在功能，iWARP不支持这些功能。这允许在标准以太网基础架构(交换机)上使用RDMA。

只有NIC应该是特殊的，并支持iWARP(如果使用CPU卸载)，否则所有iWARP堆栈都可以在SW中实现，并且丢失了大部分的RDMA性能优势。

# 操作系统的支持

各种操作系统支持 RDMA

Windows Server: 从 Windows HPC Server 2008 开始支持 Network Direct userspace API ；

从 Windows Server 2012 开始支持 Network Direct kernel API

Linux: 从2004年开始，由 OpenFabrics Alliance 提供 userspace/kernel API ， RHEL 和 SLES 已经自带， Ubuntu 要自己安装？

FreeBSD 9.0+ 支持 OpenFabrics Alliance userspace/kernel API

## 好处

具体来说，RDMA 技术特性带来的好处如下图所示：

![befineties](http://ww1.sinaimg.cn/large/715142afgw1f0ffoaur1dj20ld07bq5e.jpg)

NVMe 设备延迟很低，这就要求网络延迟也必须很低， RDMA 正好满足这一点。

# 用 RDMA 发送 NVMe 写命令

![用 RDMA 发送 NVMe 写命令](http://ww3.sinaimg.cn/large/715142afgw1f0fg884k94j20en0oydi8.jpg)

以一个 NVMe 写操作为例。 

NVMe 主机驱动把写命令及数据（从 NVMe 提交队列取出一项）封装一个与底层传输无关的命令胶囊（capsule）；

胶囊被放到主机 RDMA 网卡的发送队列中，由 RDMA_SEND 发送出去；

目标主机的 RDMA 网卡在接收队列中收到这个胶囊，解除封装，把 NVMe 命令及数据放到目标主机的内存中；

目标主机处理 NVMe 命令及数据；完成后，目标主机封装一个 NVMe 命令完成项，由 RDMA 传输到源主机。

# 两种基于以太网的 RDMA 协议

第一种：以太网->IP->UDP->RoCE (RDMA over Converged Ethernet) v2

第二种：以太网->IP->TCP（去掉 TCP/IP 流量控制和管理）->iWARP

![两种基于以太网的 RDMA 协议](http://ww4.sinaimg.cn/large/715142afgw1f0fhko9zczj20xp0kcwj0.jpg)

不同协议的网卡之间并不兼容，也就说支持 RoCE 协议的网卡不能与支持 iWARP 协议的网卡交换数据。

两种协议的供应商上台系统不一样，

## Infiniband

支持RDMA的新一代网络协议。 

由于这是一种新的网络技术，因此需要支持该技术的NIC和交换机。

## RoCE

一个允许在以太网上执行RDMA的网络协议。 

其较低的网络标头是以太网标头，其较高的网络标头（包括数据）是InfiniBand标头。 

这支持在标准以太网基础设施(交换机)上使用RDMA。 

只有网卡应该是特殊的，支持RoCE。

## iWARP

一个允许在TCP上执行RDMA的网络协议。 

IB和RoCE中存在的功能在iWARP中不受支持。

这支持在标准以太网基础设施(交换机)上使用RDMA。 
 
只有网卡应该是特殊的，并且支持iWARP(如果使用CPU卸载)，否则所有iWARP堆栈都可以在软件中实现，并且丧失了大部分RDMA性能优势。

# RDMA的原理、传输与Verbs
 
RDMA最早专属于infiniband架构。

在网络融合的大趋势下出现的RoCE，使高速、超低延时、极低cpu使用率的RDMA得以部署在目前使用最广泛的以太网上。

对比传统DMA的内部总线IO，RDMA通过网络在两个端点的应用软件之间实现buffer的直接传递；

而对比传统的网络传输，RDMA又无需操作系统和协议栈的介入。

RDMA可以轻易实现端点间的超低延时、超高吞吐量传输，而且基本不需要CPU、OS的资源参与，在高速网络环境下，不必再为网络数据的处理和搬移耗费过多资源。

一言概之，RDMA三大特性：CPU offload 、kernel bypass、zero-copy。   

![application 流程](https://images2015.cnblogs.com/blog/922424/201706/922424-20170615151017275-1708564171.png)

## 传统

![TCP/IP 流程](https://images2015.cnblogs.com/blog/922424/201706/922424-20170615144955759-90038073.png)

## RDMA 方式

![RDMA](https://images2015.cnblogs.com/blog/922424/201706/922424-20170615144607993-944194727.png)

# 原理

传统的网络架构以“网络为中心”，网络公用的软件部分被实现到OS的协议栈，所以OS在所有应用的网络请求时都必须参与其中，并且socket、skbuff、ring buffer的转换都伴随着数据报文的拷贝，容易产生性能瓶颈。

## 网络环境下的CPU负载消耗

![网络环境下的CPU负载消耗](https://user-images.githubusercontent.com/18375710/69779951-b7aceb00-11e4-11ea-845c-3c2df68040e7.png)

在Infiniband/RDMA的模型中，核心“以服务为中心”，围绕一个基本问题：如何实现应用之间最简单、高效和直接的通信。

RDMA提供了基于消息队列的点对点通信，每个应用都可以直接获取自己的消息，无需OS和协议栈的介入。

消息服务建立在通信双方本端和远端应用之间创建的channel-IO连接之上。

当应用需要通信时，就会创建一条Channel连接，每条Channel的首尾端点是两对Queue Pairs（QP），每对QP由Send Queue（SQ）和Receive Queue（RQ）构成，这些队列中管理着各种类型的消息。

QP会被映射到应用的虚拟地址空间，使得应用直接通过它访问RNIC。除了QP描述的两种基本队列之外，RDMA还提供一种队列-Complete Queue（CQ），CQ用来知会用户WQ上的消息已经被处理完。

RDMA提供了一套software transport interface，方便用户创建传输请求-Work Request（WR），WR中描述了应用希望传输到Channel对端的消息内容。

WR通知给QP中的某个队列-Work Queue（WQ）。

在WQ中，用户的WR被转化为Work Queue Ellement（WQE）的格式，等待RNIC的异步调度解析，并从WQE指向的buffer中拿到真正的消息发送到Channel对端。

## 传输

### RDMA 的send/receive和read/write传输

![传输](https://user-images.githubusercontent.com/18375710/69780123-4de11100-11e5-11ea-82a4-f21ef5784a81.png)

RDMA共有三种底层数据传输模式。

SEND/RECEIVE是双边操作，即必须要远端的应用感知参与才能完成收发。

READ和WRITE是单边操作，只需要本端明确信息的源和目的地址，远端应用不必感知此次通信，数据的读或存都通过远端的DMA在RNIC与应用buffer之间完成，再由远端RNIC封装成消息返回到本端。

在实际中，SEND/RECEIVE多用于连接控制类报文，而数据报文多是通过READ/WRITE来完成的。

### 双边

对于双边操作为例，A向B发送数据的流程如下：

1. 首先，A和B都要创建并初始化好各自的QP，CQ

2. A和B分别向自己的WQ中注册WQE，对于A，WQ=SQ，WQE描述指向一个等到被发送的数据；对于B，WQ=RQ，WQE描述指向一块用于存储数据的buffer。

3. A的RNIC异步调度轮到A的WQE，解析到这是一个SEND消息，从buffer中直接向B发出数据。数据流到达B的RNIC后，B的WQE被消耗，并把数据直接存储到WQE指向的存储位置。

4. AB通信完成后，A的CQ中会产生一个完成消息CQE表示发送完成。与此同时，B的CQ中也会产生一个完成消息表示接收完成。每个WQ中WQE的处理完成都会产生一个CQE。

双边操作与传统网络的底层buffer pool类似，收发双方的参与过程并无差别，区别在零拷贝、kernel bypass，实际上传统网络中一些高级的网络SOC已经实现类似功能。

对于RDMA，这是一种复杂的消息传输模式，多用于传输短的控制消息。

### 单边

对于单边操作，以存储网络环境下的存储为例（A作为文件系统，B作为存储介质）：

1. 首先A、B建立连接，QP已经创建并且初始化。

2. 数据被存档在A的buffer地址VA，注意VA应该提前注册到A的RNIC，并拿到返回的local key，相当于RDMA操作这块buffer的权限。

3. A把数据地址VA，key封装到专用的报文传送到B，这相当于A把数据buffer的操作权交给了B。同时A在它的WQ中注册进一个WR，以用于接收数据传输的B返回的状态。

4. B在收到A的送过来的数据VA和R_key后，RNIC会把它们连同存储地址VB到封装RDMA READ，这个过程A、B两端不需要任何软件参与，就可以将A的数据存储到B的VB虚拟地址。

5. B在存储完成后，会向A返回整个数据传输的状态信息。

单边操作传输方式是RDMA与传统网络传输的最大不同，提供直接访问远程的虚拟地址，无须远程应用的参与，这种方式适用于批量数据传输。

# Verbs

RDMAC（RDMA Consortium）和IBTA（InfiniBand Trade Association）主导了RDMA，RDMAC是IETF的一个补充，它主要定义的是iWRAP和iSER，IBTA是infiniband的全部标准制定者，并补充了RoCE v1 v2的标准化。
 
应用和RNIC之间的传输接口层（software transport interface）被称为Verbs。
 
IBTA解释了RDMA传输过程中应具备的特性行为，而并没有规定Verbs的具体接口和数据结构原型。
 
这部分工作由另一个组织OFA（Open Fabric Alliance）来完成，OFA提供了RDMA传输的一系列Verbs API。
 
OFA开发出了OFED（Open Fabric Enterprise Distribution）协议栈，支持多种RDMA传输层协议。

OFED中除了提供向下与RNIC基本的队列消息服务，向上还提供了ULP（Upper Layer Protocols），通过ULPs，上层应用不需要直接到Verbs API对接，而是借助于ULP与应用对接，常见的应用不需要做修改，就可以跑在RDMA传输层上。

# RoCEv2 详细讨论

在基于以太网的版本中，下面重点选择RoCEv2来讨论。
 
可以看出，RoCEv2的协议栈包括IB传输层、TCP/UDP、IP和Ethernet，其中，后面三层都使用了TCP/IP中相应层次的封包格式。

## RoCEv2的封包格式

RoCEv2的封包格式如下图所示。

![封包格式](http://mmbiz.qpic.cn/mmbiz_png/oRL2fUHmGZBj667W4rJ3A7nxYuc9zND0V2n7W5oYp0EA9PdXMYibkia5dBQrgXX17DTHpFakRmwu9FP0D12K3O8A/0?wx_fmt=png)

其中，UDP包头中，目的端口号为4791即代表是RoCEv2帧。

IB BTH即InfiniBand Base Transport Header，定义了IB传输层的相应头部字段。

IB Payload即为消息负载。ICRC和FCS分别对应冗余检测和帧校验。

## IB BTH格式和字段定义

IB BTH格式和字段定义如下图。

![BTH格式和字段定义如下图](http://mmbiz.qpic.cn/mmbiz_png/oRL2fUHmGZBj667W4rJ3A7nxYuc9zND0U78unJuLTxwDALLhMEyC4oFlVb9hMgKB9cia8la5KKLLO2Ir90Qzg5Q/0?wx_fmt=png)

其中，Opcode用于表明该包的type或IB PayLoad中更高层的协议类型。

S是Solicited Event的缩写，表明回应者产生应该产生一个事件。

M是MigReq的缩写，一般用于迁移状态。Pad表明有多少额外字节被填充到IB PayLoad中。

TVer即Transport Header Version，表明该包的版本号。

Partition Key用来表征与本Packet关联的逻辑内存分区。

rsvd是reserved的缩写，该字段是保留的。

Destination QP表明目的端Queue Pair序号。

A是Acknowledge Request，表示该packet的应答可由响应者调度。

PSN是Packet Sequence Number，用来检测丢失或重复的数据包。

## 出包

最后，顺带说下RDMA网卡的出包。

如前文所述，RDMA是一种智能网卡与软件架构充分优化的远端内存直接高速访问技术，通过将RDMA技术固化于网卡上实现，

即，在RoCEv2协议栈中，IB BTH、UDP、IP以及Ethernet Layer全是固化在网卡上的。

用户空间的Application通过OFA Stack(亦或其他组织编写的RDMA stack)提供的verbs编程接口(比如WRITE、READ、SEND等)形成IB payload，接下来便直接进入硬件，由RDMA网卡实现负载的层层封装。

# 拓展阅读

[零拷贝系列](https://houbb.github.io/2018/09/22/java-nio-09-zero-copy-09)

# 参考资料

[基于RDMA高速网络的高性能分布式系统](https://cloud.tencent.com/developer/news/330802)

[How Ethernet RDMA Protocols iWARP and RoCE Support NVMe over Fabrics](https://www.brighttalk.com/webcast/663/185909)

[两种以太网 RDMA 协议： iWARP 和 RoCE](https://www.cnblogs.com/allcloud/p/7680277.html)

[RDMA技术解析](https://www.cnblogs.com/jiweilearn/p/10694046.html)

[RDMA 架构规范](http://www.rdmaconsortium.org/)

[RDMA技术原理分析、主流实现对比和解析](https://www.sohu.com/a/229080366_632967)

[RDMA简介相关内容](https://blog.csdn.net/github_33873969/article/details/83017820)

https://www.jianshu.com/p/22bbb8f029e6

* any list
{:toc}