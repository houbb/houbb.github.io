---
layout: post
title: RDMA-远程直接内存访问-00-overview
date:  2019-11-20 11:18:30 +0800
categories: [Network]
tags: [network, tcp, dma, sh]
published: true
---

# RDMA 协议

## 概念

RDMA是Remote Direct Memory Access的缩写，意思是远程直接数据存取，就是为了解决网络传输中服务器端数据处理的延迟而产生的。

RDMA(RemoteDirect Memory Access)技术全称远程直接内存访问，就是为了解决网络传输中客户端与服务器端数据处理的延迟而产生的。

它将数据直接从一台计算机的内存传输到另一台计算机，无需双方操作系统的介入。

这允许高吞吐、低延迟的网络通信，尤其适合在大规模并行计算机集群中使用。

RDMA通过网络把资料直接传入计算机的内存中，将数据从一个系统快速移动到远程系统内存中，而不对操作系统造成任何影响，这样就不需要用到多少计算机的处理能力。

它消除了数据包在用户空间和内核空间复制移动和上下文切换的开销，因而能解放内存带宽和CPU周期用于改进应用系统性能。

## 简介

RDMA(Remote Direct Memory Access)技术全称远程直接数据存取，就是为了解决网络传输中服务器端数据处理的延迟而产生的。

RDMA通过网络把资料直接传入计算机的存储区，将数据从一个系统快速移动到远程系统存储器中，而不对操作系统造成任何影响，这样就不需要用到多少计算机的处理功能。

它消除了外部存储器复制和上下文切换的开销，因而能解放内存带宽和CPU周期用于改进应用系统性能。

## 优点

在实现上，RDMA实际上是一种智能网卡与软件架构充分优化的远端内存直接高速访问技术，通过在网卡上将RDMA协议固化于硬件，以及支持零复制网络技术和内核内存旁路技术这两种途径来达到其高性能的远程直接数据存取的目标。
 
### 零复制

零复制网络技术使网卡可以直接与应用内存相互传输数据，从而消除了在应用内存与内核之间复制数据的需要。因此，传输延迟会显著减小。

### 内核旁路

内核协议栈旁路技术使应用程序无需执行内核内存调用就可向网卡发送命令。

在不需要任何内核内存参与的条件下，RDMA请求从用户空间发送到本地网卡并通过网络发送给远程网卡，这就减少了在处理网络传输流时内核内存空间与用户空间之间环境切换的次数。

### 没有CPU参与

应用程序可以访问远程内存，而不占用远程机器中的任何CPU。远程存储器将被读取，无需任何干预的远程进程(或处理器)。

远程CPU中的缓存将不会被访问的内存内容填满。

### 基于消息的事务

数据被作为离散消息处理，而不是作为流，这消除了应用将流分成不同消息/事务的需要。

### 分散/收集条目支持

RDMA支持本地处理多个分散/收集条目，即读取多个内存缓冲区并将其作为一个流或获取一个流并将其写入多个内存缓冲区。

在具体的远程内存读写中，RDMA操作用于读写操作的远程虚拟内存地址包含在RDMA消息中传送，远程应用程序要做的只是在其本地网卡中注册相应的内存缓冲区。

远程节点的CPU除在连接建立、注册调用等之外，在整个RDMA数据传输过程中并不提供服务，因此没有带来任何负载。

# RDMA的理解

## 传统意义上的DMA

直接内存访问(DMA) 方式，是一种完全由硬件执行I/O交换的工作方式.在这种方式中，DMA 控制器从CPU 完全接管对总线的控制，数据交换不经过CPU ，而直接在内存和IO设备之间进行.DMA工作时，由DMA 控制器向内存发出地址和控制信号，进行地址修改，对传送字的个数计数，并且以中断方式向CPU 报告传送操作的结束。

使用 DMA 方式的目的是减少大批量数据传输时CPU 的开销.采用专用DMA 控制器(DMAC) 生成访存地址并控制访存过程.优点有操作均由硬件电路实现，传输速度快;

CPU 基本不干预，仅在初始化和结束时参与， CPU 与外设并行工作，效率高。

## RDMA工作原理

普通网卡集成了支持硬件校验和的功能，并对软件进行了改进，从而减少了发送数据的拷贝量，但无法减少接收数据的拷贝量，而这部分拷贝量要占用CPU 的大量计算周期.

普通网卡的工作过程如下:

先把收到的数据包缓存到系统上，数据包经过处理后，相应数据被分配到一个TCP 连接;

然后，接收系统再把主动提供的TCP 数据同相应的应用程序联系起来，并将数据从系统缓冲区拷贝到目标存储地址.

这样，制约网络速率的因素就出现了:

应用通信强度不断增加和主机 CPU 在内核与应用存储器间处理数据的任务繁重使系统要不断追加主机CPU 资源，配置高效的软件并增强系统负荷管理.

问题的关键是要消除主机 CPU 中不必要的频繁数据传输，减少系统间的信息延迟。

## RDMA 

RDMA 是通过网络把资料直接传入计算机的存储区，将数据从一个系统快速移动到远程系统存储器中，而不对操作系统造成任何影响，这样就不需要用到多少计算机的处理功能.

它消除了外部存储器复制和文本交换操作，因而能腾出总线空间和CPU 周期用于改进应用系统性能. 通用的做法需由系统先对传入的信息进行分析与标记，然后再存储到正确的区域.

整体结构如图所示。

RDMA 的工作过程如下:

1) 当一个应用执行RDMA 读或写请求时，不执行任何数据复制.在不需要任何内核内存参与的条件下， RDMA 请求从运行在用户空间中的应用中发送到本地NIC(网卡)。

2) NIC 读取缓冲的内容，并通过网络传送到远程NIC。

3) 在网络上传输的RDMA 信息包含目标虚拟地址、内存钥匙和数据本身.请求完成既可以完全在用户空间中处理(通过轮询用户级完成排列) ，或者在应用一直睡眠到请求完成时的情况下通过内核内存处理.RDMA 操作使应用可以从一个远程应用的内存中读数据或向这个内存写数据。

4) 目标NIC 确认内存钥匙，直接将数据写入应用缓存中.用于操作的远程虚拟内存地址包含在RDMA 信息中。

# RDMA中零拷贝技术

零拷贝网络技术使NIC 可以直接与应用内存相互传输数据，从而消除了在应用内存与内核内存之间复制数据的需要.

内核内存旁路使应用无需执行内核内存调用就可向NIC 发送命令.

在不需要任何内核内存参与的条件下，RDMA 请求从用户空间发送到本地NIC，并通过网络发送给远程NIC，这就减少了在处理网络传输流时内核内存空间与用户空间之间环境切换的次数.

RDMA 中的零拷贝技术主要实现方法如图所示。

在上图中，右边是传统TCP/IP 协议以及普通网卡进行的通信操作过程.

很明显，当应用层想从网卡获得数据报文时需要经过 2 个缓冲区和正常TCP/IP 协议栈，其中由软中断负责从第一个接收队列缓冲区读取数据报文，再拷贝到MSGBuff 中，最后由应用层通过系统调用将数据报文读到用户态.而左边则是利用RDMA来实现的零拷贝过程，规则如下:

1) RDMA 及其LLP( Lower Layer Protocol)可以在NIC 上实现(称为RNIC)。

2) 在1)中所说的2 种实现都是经过以下步骤:将收发的数据缓存到一个已经标记好的存储空间中，然后根据LLP 和RDMA 双方协商的规则直接将此存储空间映射到应用空间，这样就减少了传统实现方法中的至少2次内存拷贝，即实现零拷贝.

其中细线表示数据流动方向，其实标记缓存就是通过RDMA 直接映射成为用户缓存空间的。

# RDMA的构成

如上图为RDMA 的构成，RDMA的实现由RDMA、DDP 、MPA3 种协议共间实现，构成了iWARP协议族，用来保证高速网络的互操作性。

RDMA 层用于将RMDA 读、写及Send 操作消息转化成RDMA 消息，并将RDMA 消息传送至DDP(Direct Data Placement)层，DDP应将RDMA消息分段封装成DDP 数据包转发到下层Marker-based，Protocol-data-unit-Aligned (MPA)层， MPA 层将DDP 数据包插入标识符，长度及CRC 校验，构成MPA 数据段。

TCP 层负责对TCP 数据段进行调度，确保发包能够顺利到达目标位置。

IP 层则在数据包中增加必要的网络路由数据信息。

# 数据操作方法

RDMA 协议为远端直接数据缓存提供7 种类型的控制操作.除了远端缓冲区读取操作之外，每一种RDMA 控制操作都只产生一个对应的RDMA 消息。

1)Send: 发送操作使用Send 消息将发送方应用的数据直接发送到数据接收方应用尚未明确声明的缓冲区中.故Send 消息使用的是DDP 的无标记的缓冲区数据传递模型，将上层应用消息传递到接收方应用的元标记队列式缓冲区中。

2) Send with Invalidate: 在Send 基础上，加了一个导航标记Stag. 当该消息缓存在Stag 所指定对端应用缓冲区中，并将消息到达通知传达给接收方应用后，接收方应用就再不允许发送方应用介入该缓冲区，直到接收方应用重新声明该缓冲区可用后才可以供发送方应用继续使用。

3) Send with Solicited Event (Send with SE): 该消息用来将发送方应用的数据直接发送到数据接收方应用的无标记队列式缓冲区中，具备Send 所有的功能同时增加对消息的反馈。

4) Send with Solicited Event and Invalidate (Send with SE and Invalidate): 该消息所对应的操作是将发送方应用的数据直接发送到数据接收方应用尚未明确声明的缓冲区中，具备Send with SE 所有的功能同时增加对消息的反馈。

5) Remote Direct Memory Access W出e: 对应于RDMA 写操作，用来将发送方应用的数据传递到接收方应用已声明的缓冲区中.在这个操作中，接收方应用事先应该己经分配出带标记的应用接收缓冲区，并允许发送方应用直接进行缓冲区写操作.同时，发送方应用还在声明中得到了上述缓冲区的位置、大小和相应的Stag 等信息.之后发送方应用开始发起RDMA 写操作，该操作使用DDP 的带标记的缓冲区数据传递模型，将发送方应用的消息直接传递到接收方应用所声明的带标记缓冲区中。

6) Remote Direct Memory Access Read: 对应于RDMA 读操作，将对端(对应于数据源)带标记应用缓冲区的数据传递到本地(对应于数据接收方)的带标记应用缓冲区.数据源的上层应用首先需要事先分配出带标记的应用缓冲区，并允许对该缓冲区内容直接进行读操作.同时，数据源上层应用还要将待声明的数据源缓冲区的位置、大小和相应的Stag 等信息传递到本地上层应用.数据接收方上层应用在得到上述声明后，分配相应的带标记应用缓冲区，开始从对端读取数据操作。

7) Terminate: 终止操作使用Terminate 消息将本地发生的错误信息通知给对端应用，以终止当前数据直接缓存操作.终止操作使用DDP 的元标记缓冲区模型将Terminate 传递到对端的无标记缓冲区。

# 背景介绍

![mode](https://img-blog.csdn.net/20180604100643560?watermark/2/text/aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMTI1MTgz/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70)

## 传统TCP/IP通信模式

传统的TCP/IP网络通信，数据需要通过用户空间发送到远程机器的用户空间。

数据发送方需要讲数据从用户应用空间Buffer复制到内核空间的Socket Buffer中。

然后内核空间中添加数据包头，进行数据封装。

通过一系列多层网络协议的数据包处理工作，这些协议包括传输控制协议（TCP）、用户数据报协议（UDP）、互联网协议（IP）以及互联网控制消息协议（ICMP）等。

数据才被Push到NIC网卡中的Buffer进行网络传输。

消息接受方接受从远程机器发送的数据包后，要将数据包从NIC Buffer中复制数据到Socket Buffer。

然后经过一些列的多层网络协议进行数据包的解析工作。解析后的数据被复制到相应位置的用户空间Buffer。

这个时候再进行系统上下文切换，用户应用程序才被调用。

以上就是传统的TCP/IP协议层的工作。

## 通信网络定义

计算机网络通信中最重要两个衡量指标主要是指高带宽和低延迟。

通信延迟主要是指：处理延迟和网络传输延迟。

处理延迟开销指的就是消息在发送和接收阶段的处理时间。

网络传输延迟指的就是消息在发送和接收方的网络传输时延。

如果网络通信状况很好的情况下，网络基本上可以达到高带宽和低延迟。

## 当今网络现状

当今随着计算机网络的发展。

消息通信主要分为两类消息，一类是Large Messages，在这类消息通信中，网络传输延迟占整个通信中的主导位置。

还有一类消息是Small Messages，在这类消息通信中，消息发送端和接受端的处理开销占整个通信的主导地位。

然而在现实计算机网络中的通信场景中，主要是以发送小消息为主。

所有说发送消息和接受消息的处理开销占整个通信的主导的地位。

具体来说，处理开销指的是buffer管理、在不同内存空间中消息复制、以及消息发送完成后的系统中断。

## 传统TCP/IP存在的问题

传统的TPC/IP存在的问题主要是指I/O bottleneck瓶颈问题。

在高速网络条件下与网络I/O相关的处理的高开销限制了可以在机器之间发送的带宽。

这里高额开销是数据移动操作和复制操作。

具体来讲，主要是传统的TCP/IP网络通信是通过内核发送消息。

Messaging passing through kernel 这种方式会导致很低的性能和很低的灵活性。

其中性能低下的原因主要是由于网络通信通过内核传递，这种通信方式存在的很高的数据移动和数据复制的开销。

并且现如今内存带宽性相较如CPU带宽和网络带宽有着很大的差异。

其中很低的灵活性的原因主要是所有网络通信协议通过内核传递，这种方式很难去支持新的网络协议和新的消息通信协议以及发送和接收接口。

# 相关工作

高性能网络通信历史发展主要有以下四个方面：

TCP Offloading Engine（TOE）、User-Net Networking(U-Net)、Virtual interface Architecture（VIA）、Remote Direct Memroy Access(RDMA)。

U-Net是第一个跨过内核网络通信的模式之一。

VIA首次提出了标准化user-level的网络通信模式，其次它组合了U-Net接口和远程DMA设备。

RDMA就是现代化高性能网络通信技术。

##  TCP Offloading Engine

在主机通过网络进行通信的过程中，主机处理器需要耗费大量资源进行多层网络协议的数据包处理工作，这些协议包括传输控制协议（TCP）、用户数据报协议（UDP）、互联网协议（IP）以及互联网控制消息协议（ICMP）等。

由于CPU需要进行繁重的封装网络数据包协议，为了将占用的这部分主机处理器资源解放出来专注于其他应用，人们发明了TOE（TCP/IP Offloading Engine）技术，将上述主机处理器的工作转移到网卡上。

 这种技术需要特定网络接口-网卡支持这种Offloading操作。

这种特定网卡能够支持封装多层网络协议的数据包，这个功能常见于高速以太网接口上，如吉比特以太网（GbE）或10吉比特以太网（10GbE）。

## User-Net Networking(U-Net)

U-Net的设计目标是将协议处理部分移动到用户空间去处理。

这种方式避免了用户空间将数据移动和复制到内核空间的开销。

它的设计宗旨就是移动整个协议栈到用户空间中去，并且从数据通信路径中彻底删除内核。

这种设计带来了高性能的提升和高灵活性的提升。

![User-Net Networking](https://img-blog.csdn.net/20180604104321951?watermark/2/text/aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMTI1MTgz/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70)

U-Net的virtual NI 为每个进程提供了一种拥有网络接口的错觉，内核接口只涉及到连接步骤。

传统上的网络，内核控制整个网络通信，所有的通信都需要通过内核来传递。

U-Net应用程序可以通过MUX直接访问网络，应用程序通过MUX直接访问内核，而不需要将数据移动和复制到内核空间中

# RDMA 详解

RDMA(Remote Direct Memory Access)技术全称远程直接内存访问，就是为了解决网络传输中服务器端数据处理的延迟而产生的。

![RDMA](https://img-blog.csdn.net/20180604105337953?watermark/2/text/aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMTI1MTgz/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70)

RDMA主要有以下三个特性：1.Low-Latency 2.Low CPU overhead 3. high bandwidth

## RDMA 简介

Remote：数据通过网络与远程机器间进行数据传输。

Direct：没有内核的参与，有关发送传输的所有内容都卸载到网卡上。

Memory：在用户空间虚拟内存与RNIC网卡直接进行数据传输不涉及到系统内核，没有额外的数据移动和复制。

Access：send、receive、read、write、atomic操作。

## RDMA 基本概念

RDMA 有两种基本操作。

Memory verbs: 包括RDMA read、write和atomic操作。这些操作指定远程地址进行操作并且绕过接收者的CPU。

Messaging verbs: 包括RDMA send、receive操作。这些动作涉及的接收方CPU，发送的数据被写入由接收方的CPU先前发布的接受所指定的地址。

RDMA 传输分为可靠和不可靠的，并且可以连接和不连接的（数据报）。

凭借可靠的传输，NIC使用确认来保证消息的按序传送。

不可靠的传输不提供这样的保证。

然而，像InfiniBand这样的现代RDMA实现使用了一个无损链路层，它可以防止使用链路层流量控制的基于拥塞的损失，以及使用链路层重传的基于位错误的损失。

因此，不可靠的传输很少会丢弃数据包。 

目前的RDMA硬件提供一种数据报传输：不可靠的数据报（UD），并且不支持memory verbs。

![基本概念](https://img-blog.csdn.net/20180604105946911?watermark/2/text/aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMTI1MTgz/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70)

##  RDMA 三种不同的硬件实现

目前RDMA有三种不同的硬件实现。

分别是InfiniBand、iWarp（internet Wide Area RDMA Protocol）、RoCE(RDMA over Converged Ethernet)。

![三种不同的硬件实现](https://img-blog.csdn.net/20180604110329770?watermark/2/text/aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMTI1MTgz/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70)

目前，大致有三类RDMA网络，分别是Infiniband、RoCE、iWARP。

其中，Infiniband是一种专为RDMA设计的网络，从硬件级别保证可靠传输， 而 RoCE 和 iWARP 都是基于以太网的RDMA技术，支持相应的verbs接口，如图1所示。

从图中不难发现，RoCE协议存在RoCEv1和RoCEv2两个版本，主要区别RoCEv1是基于以太网链路层实现的RDMA协议(交换机需要支持PFC等流控技术，在物理层保证可靠传输)，而RoCEv2是以太网TCP/IP协议中UDP层实现。

从性能上，很明显Infiniband网络最好，但网卡和交换机是价格也很高，然而RoCEv2和iWARP仅需使用特殊的网卡就可以了，价格也相对便宜很多。

### Infiniband，支持RDMA的新一代网络协议。 

由于这是一种新的网络技术，因此需要支持该技术的NIC和交换机。

### RoCE，一个允许在以太网上执行RDMA的网络协议。 

其较低的网络标头是以太网标头，其较高的网络标头（包括数据）是InfiniBand标头。 这支持在标准以太网基础设施（交换机）上使用RDMA。 

只有网卡应该是特殊的，支持RoCE。

### iWARP，一个允许在TCP上执行RDMA的网络协议。 

IB和RoCE中存在的功能在iWARP中不受支持。 

这支持在标准以太网基础设施（交换机）上使用RDMA。 

只有网卡应该是特殊的，并且支持iWARP（如果使用CPU卸载），否则所有iWARP堆栈都可以在SW中实现，并且丧失了大部分RDMA性能优势。

![硬件方式](https://img-blog.csdn.net/20180604110437524?watermark/2/text/aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMTI1MTgz/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70)

![硬件标准](https://img-blog.csdn.net/20180604110441608?watermark/2/text/aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMTI1MTgz/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70)

# RDMA 技术

## 整体架构图

![整体架构图](https://img-blog.csdn.net/20180604111156118?watermark/2/text/aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMTI1MTgz/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70)

传统上的RDMA技术设计内核封装多层网络协议并且涉及内核数据传输。

RDMA通过专有的RDMA网卡RNIC，绕过内核直接从用户空间访问RDMA enabled NIC网卡。

RDMA提供一个专有的Verbs Interface而不是传统的TCP/IP Socket Interface。

要使用RDMA首先要建立从RDMA到应用程序内存的数据路径，可以通过RDMA专有的Verbs Interface接口来建立这些数据路径，一旦数据路径建立后，就可以直接访问用户空间buffer。

# RDMA整体系统架构图

![RDMA整体系统架构图](https://img-blog.csdn.net/20180604111615348?watermark/2/text/aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMTI1MTgz/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70)

上诉介绍的是RDMA整体框架架构图。

从图中可以看出，RDMA在应用程序用户空间，提供了一系列verbs interface接口操作RDMA硬件。

RDMA绕过内核直接从用户空间访问RDMA 网卡(RNIC)。

RNIC网卡中包括Cached Page Table Entry，页表就是用来将虚拟页面映射到相应的物理页面。

# RDMA技术详解

RDMA 的工作过程如下:

1) 当一个应用执行 RDMA 读或写请求时，不执行任何数据复制.在不需要任何内核内存参与的条件下，RDMA 请求从运行在用户空间中的应用中发送到本地NIC(网卡)。

2) NIC 读取缓冲的内容，并通过网络传送到远程NIC。

3) 在网络上传输的RDMA 信息包含目标虚拟地址、内存钥匙和数据本身.请求既可以完全在用户空间中处理(通过轮询用户级完成排列) ，又或者在应用一直睡眠到请求完成时的情况下通过系统中断处理.RDMA 操作使应用可以从一个远程应用的内存中读数据或向这个内存写数据。

4) 目标NIC 确认内存钥匙，直接将数据写人应用缓存中.用于操作的远程虚拟内存地址包含在RDMA 信息中。

# RDMA 操作细节

RDMA提供了基于消息队列的点对点通信，每个应用都可以直接获取自己的消息，无需操作系统和协议栈的介入。

消息服务建立在通信双方本端和远端应用之间创建的Channel-IO连接之上。

当应用需要通信时，就会创建一条Channel连接，每条Channel的首尾端点是两对Queue Pairs（QP）。

每对QP由Send Queue（SQ）和Receive Queue（RQ）构成，这些队列中管理着各种类型的消息。

QP会被映射到应用的虚拟地址空间，使得应用直接通过它访问RNIC网卡。

除了QP描述的两种基本队列之外，RDMA还提供一种队列Complete Queue（CQ），CQ用来知会用户WQ上的消息已经被处理完。

RDMA提供了一套软件传输接口，方便用户创建传输请求Work Request(WR），WR中描述了应用希望传输到Channel对端的消息内容，WR通知QP中的某个队列Work Queue(WQ)。

在WQ中，用户的WR被转化为Work Queue Element（WQE）的格式，等待RNIC的异步调度解析，并从WQE指向的Buffer中拿到真正的消息发送到Channel对端。

![RDMA 操作细节](https://img-blog.csdn.net/20180604113309716?watermark/2/text/aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMTI1MTgz/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70)

## RDAM单边操作 (RDMA READ)

READ和WRITE是单边操作，只需要本端明确信息的源和目的地址，远端应用不必感知此次通信，数据的读或写都通过RDMA在RNIC与应用Buffer之间完成，再由远端RNIC封装成消息返回到本端。

对于单边操作，以存储网络环境下的存储为例，数据的流程如下：

1.   首先A、B建立连接，QP已经创建并且初始化。

2.   数据被存档在B的buffer地址VB，注意VB应该提前注册到B的RNIC (并且它是一个Memory Region) ，并拿到返回的local key，相当于RDMA操作这块buffer的权限。

3.   B把数据地址VB，key封装到专用的报文传送到A，这相当于B把数据buffer的操作权交给了A。同时B在它的WQ中注册进一个WR，以用于接收数据传输的A返回的状态。

4.   A在收到B的送过来的数据VB和R_key后，RNIC会把它们连同自身存储地址VA到封装RDMA READ请求，将这个消息请求发送给B，这个过程A、B两端不需要任何软件参与，就可以将B的数据存储到A的VA虚拟地址。

5.   A在存储完成后，会向B返回整个数据传输的状态信息。

单边操作传输方式是RDMA与传统网络传输的最大不同，只需提供直接访问远程的虚拟地址，无须远程应用的参与其中，这种方式适用于批量数据传输。

## RDMA 单边操作 (RDMA WRITE)

对于单边操作，以存储网络环境下的存储为例，数据的流程如下：

1.   首先A、B建立连接，QP已经创建并且初始化。

2.   数据remote目标存储buffer地址VB，注意VB应该提前注册到B的RNIC(并且它是一个Memory Region)，并拿到返回的local key，相当于RDMA操作这块buffer的权限。

3.   B把数据地址VB，key封装到专用的报文传送到A，这相当于B把数据buffer的操作权交给了A。同时B在它的WQ中注册进一个WR，以用于接收数据传输的A返回的状态。

4.   A在收到B的送过来的数据VB和R_key后，RNIC会把它们连同自身发送地址VA到封装RDMA WRITE请求，这个过程A、B两端不需要任何软件参与，就可以将A的数据发送到B的VB虚拟地址。

5.   A在发送数据完成后，会向B返回整个数据传输的状态信息。

单边操作传输方式是RDMA与传统网络传输的最大不同，只需提供直接访问远程的虚拟地址，无须远程应用的参与其中，这种方式适用于批量数据传输。

## RDMA 双边操作 (RDMA SEND/RECEIVE)

RDMA中SEND/RECEIVE是双边操作，即必须要远端的应用感知参与才能完成收发。

在实际中，SEND/RECEIVE多用于连接控制类报文，而数据报文多是通过READ/WRITE来完成的。

对于双边操作为例，主机A向主机B(下面简称A、B)发送数据的流程如下：

1.   首先，A和B都要创建并初始化好各自的QP，CQ

2.   A和B分别向自己的WQ中注册WQE，对于A，WQ=SQ，WQE描述指向一个等到被发送的数据；对于B，WQ=RQ，WQE描述指向一块用于存储数据的Buffer。

3.   A的RNIC异步调度轮到A的WQE，解析到这是一个SEND消息，从Buffer中直接向B发出数据。数据流到达B的RNIC后，B的WQE被消耗，并把数据直接存储到WQE指向的存储位置。

4.  AB通信完成后，A的CQ中会产生一个完成消息CQE表示发送完成。与此同时，B的CQ中也会产生一个完成消息表示接收完成。每个WQ中WQE的处理完成都会产生一个CQE。

双边操作与传统网络的底层Buffer Pool类似，收发双方的参与过程并无差别，区别在零拷贝、Kernel Bypass，实际上对于RDMA，这是一种复杂的消息传输模式，多用于传输短的控制消息。

# 拓展阅读

[零拷贝系列](https://houbb.github.io/2018/09/22/java-nio-09-zero-copy-09)

# 参考资料

[RDMA 协议-百度百科](https://baike.baidu.com/item/RDMA/1453093?fr=aladdin)

[深入浅出全面解析RDMA](https://blog.csdn.net/qq_21125183/article/details/80563463)

[RDMA over TCP的协议栈工作过程浅析](https://www.cnblogs.com/allcloud/p/7680211.html)

* any list
{:toc}