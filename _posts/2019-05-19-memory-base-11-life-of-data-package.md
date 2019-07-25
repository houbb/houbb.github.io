---
layout: post
title: Memory 内存知识-11-数据存储的一生
date:  2019-5-10 11:08:59 +0800
categories: [Memory]
tags: [memory, cache, sh]
published: true
---

# 存储数据包的一生

最近认认真真学习了一个叫《Life of a Storage Packet》讲座，借助这个讲座将整个存储的过程理解了下，不放过任何一个有疑问的点。

这篇文章算是对讲座的理解和自己收获的总结，同时也为那些对存储系统不够了解又想要了解的初学者，展现一个存储数据包的“生命”。

这个演讲主要聚焦在“整体的存储”，强调存储系统中各个基本元素的关系，并且尽可能简单、清楚地用一种不同的方式可视化一些存储的概念。

先上一张大图，可以说这篇文章目的就是解释这个图：

![all-in-one](https://cloud.githubusercontent.com/assets/1736354/14232888/3dc0f734-f9ea-11e5-877c-8b37b7addbdd.png)

# 1. 整体视角

```
Application------NetWork
|              | 
|              | 
|              |
Storage---------        
```

可能经过网络，也可能不经过网络。

存储系统从整体的分层一览，包括了主机/应用，存储介质，存储网络。对于存储来说就做了一件事：

```
Here is a bit of data. Hold onto it. Give that same bit back to me when I ask for it.
```

# 2. Application视角

每个系统都有会有很多应用程序运行在CPU上，对于这些Application来说，他们觉得自己有很多很多足够的可用内存。

## 2.1 CPU和MMU

计算机系统中有一个“内存管理单元”（MMU，Memory Management Unit）的概念，MMU负责与DRAM内存直接通信，并且获得一些可用的“页”。

多租户：内存被某个进程（比如一个应用）独享，这些内存不能被其他进程重写。

地址：将CPU的物理地址翻译成独有的DRAM地址或者是很多行DRAMs

有了MMU以后，对于每个进程来说，他们就像是一个人独占了所有的内存一样。

## 2.2 访问内存

![访问内存](https://cloud.githubusercontent.com/assets/1736354/14232849/a28c5010-f9e9-11e5-9d03-ce555d9ca575.png)

Application在他需要访问的时候，获取这些内存，在实际进行访问时，会发生如下事情：

1. Application会问操作系统“Hey，我需要一些可用内存”

2. 操作系统向MMU说，“能给我一些可以使用内存页不？”

3. MMU把一些可用的内存页给操作系统

4. 操作系统把这些可用的内存页给Application。

## 2.3 分配内存

在 2.2 中，获取的那些内存，实际是可以分布在内存中的任何地方的（非连续），MMU在把这些内存给应用的时候会进行初始化操作，当然，当应用不再访问这些内存页的时候，也会MMU也会负责回收这些内存。

## 2.4 加速访问

如果Application对内存的访问，每次都要都要从MMU获取的话，那太慢了，因此有个经验法则是：

```
Always put storage/memory as close to the CPU as possible
```

可以说在存储中，改善时间的限制是永恒不变的主题，然后访问DRAM的话，需要60-100ns的时间。

我们需要更快的访问，甚至达到“0”时间访问。

## 2.5 缓存的魔法

![2.5 缓存的魔法](https://cloud.githubusercontent.com/assets/1736354/14232850/a8f5c67a-f9e9-11e5-8d4b-bc6f819e546a.png)

于是在CPU中增加了一些缓存，当然缓存也是分级别的，对于L1缓存大概花费1ns以内，L2缓存大概花费3-6ns，没错，这使得每次访问从60-100ns提升了几十倍！

## 2.6 更多的空间

如果DRAM中也没有足够的空间时，这是你需要更多的持久化存储，比如说磁盘。

当然直接去访问磁盘会非常的昂贵，当然这里指的是时间的花费非常昂贵。

在Jeff Dean大神的Software Engineering Advice from Building Large-Scale Distributed Systems给出了数据：

| 类型 | 时间 |
|:---|:---|
| L1缓存 | 1ns |
| L2缓存 | 5ns |
| 主存 | 100ns |
| 硬盘 | 10,000,000ns |


- 时间单位

1s=1000 ms

1s=10^9 ns

### 例子

举个比较形象的例子：你需要快递送个包裹，

快递一个1公里（L1）、5公里（L2）外的包裹，oops，可能马云爸爸保证当日达；

快递100公里（DRAM）的包裹，11点前下单，当日达，不能再快了！；

快递1000万公里（Disk）的快递，啊亲，你真的需要快递吗？这可是从地球到月球（38.4万公里）十几个来回的距离啊亲。

ps: 这个例子仅供参考。只是为了理解 disk 比较慢而已。

## 2.7 下一站，使用存储设备

![下一站，使用存储设备](https://cloud.githubusercontent.com/assets/1736354/14232851/b26c959e-f9e9-11e5-9ab0-191778aa8f94.png)

存储设备和RAM不太一样，不会和CPU直接进行“对话”，而是有一些其他的部分来帮助他们完成对话，我们在存储视角进一步去讲述。

# Storage视角

## 3.1 块设备的基本概念

### 块存储的IO流

CPU和内存通过PCI总线（目前通常是PCIe）与存储进行连接，应用会向存储请求一段数据。

系统会将数据转换成地址和位置信息，并转换成某种协议的形式。

### 数据总线

CPU的指令需要转换或者说是进行适配，以便能够与存储设备进行“交流”，比如SCSI、IDE/ATA

![数据总线](https://cloud.githubusercontent.com/assets/1736354/14232852/b983a7e6-f9e9-11e5-9343-9d9461fdfbcf.png)

### SCSI系统

SCSI是一个很普遍、且向后兼容的，通常主要包含的组件有：

Initiator：一些服务用它发起请求，可以视为登陆或者适配的一部分

Target：物理存储设备，可以是单个磁盘或者磁阵

Service Delivery Subsystem：Initiator和Target之间的通信（通常是网线）

### 块设备

![块设备](https://cloud.githubusercontent.com/assets/1736354/14232855/c052f9dc-f9e9-11e5-932f-3c7df1db0fd6.png)

Block：块是存储介质上的物理或者逻辑单元，也是文件系统或者磁盘写入的最小单元，所有的存储（包括文件存储、对象存储）最终都是需要与block进行对话。

磁盘包括了盘面（Platter）、磁道（Track）、扇区（Sector）。盘面是一个圆，磁道是一个环，扇区是环上的一段，数据的位置影响性能。块由扇区组成，每一个块也有一个唯一的号码，文件系统的一切操作都是由对blocks操作构成。

## 3.2 文件与块

对于应用来说，他们看到的都是文件；而对于存储来说，看到是块。因此需要某种方式将他们联系起来。

对于文件来说，应用看到的是一个连续的“空间”，然而实际上，文件是由很多块组成的，而这些块就是磁盘上的块，这些块分布在磁盘的不同区域。

## 3.3 文件系统

![文件系统](https://cloud.githubusercontent.com/assets/1736354/14232859/c7502796-f9e9-11e5-96af-ba7d703b11b4.png)

在操作系统中，其内核中会有一个文件系统，文件系统维护着在磁盘上的文件名，文件系统知道这些文件与磁盘上块位置的对应关系，同时还需要管理着磁盘空间、权限、所属、加密、文件缓存等等。

驱动控制：硬盘被驱动控制来操控，接收文件系统的通过某种协议（比如SCSI）下发的一些I/O命令

卷管理：文件系统和设备驱动中间存在着卷管理，卷管理负责抽象出一层“假的”磁盘供操作系统使用.

## 3.4 文件系统与驱动

![文件系统与驱动](https://cloud.githubusercontent.com/assets/1736354/14232864/d20afa1c-f9e9-11e5-9ce6-2141048f2328.png)

因此，对于文件系统来说，需要将应用程序所看到的“虚拟地址”翻译到真正的设备地址。

例如访问一个文件时，文件系统会先会先在找到对应的逻辑块地址（Logical Block Adress, LBA），然后通过scsi系统进一步访问，对应到磁盘上的物理块地址。

## 3.5 INODE

Inode是文件的原数据，用来记录文件的所述、权限、block信息等。

一个Inode会对应一个文件或目录，通过inode就可以将文件与某些block对应起来。

也就是说通过inode信息，就可以完全的找到一个文件，包括这个文件所对应的data block。

对于目录而言，data block包含了目录的内容，即该目录下文件及其这些文件对应inode的列表。

对于文件而言，data block则包含了文件的实际内容。

## 3.6 举个例子

![示例代码](https://cloud.githubusercontent.com/assets/1736354/14232879/210e7b70-f9ea-11e5-96aa-5f79cb5a2870.png)

### 执行命令的步骤

当执行 `cat /home/foo.txt` 命令时，会对foo.txt文件进行访问，经历了以下步骤：

1. 获取”/“内容；

2. 查找”home”的node信息（inode 38）;

3. 获取”home”目录内容；

4. 查找”foo.txt”的inode信息（inode 40）；

5. 根据inode获得block numbers；

6. 文件系统将block number转换为真正的block number（data block 101）；

7. 通过SCSI Controller读取block内容。

### 数据存储之路

至此，我们可以看到存储数据是这样走自己的路的：

1. 应用程序说我要获取/home/foo.txt的内容

2. 操作系统依次检查L1、L2、RAM中是否存在，若均不存在则在文件系统中查找

3. 文件系统先检查Unified Buffer Cache中是否存在该文件，如果不存在则去目录中查找“home”文件

4. (访问磁盘)读取”home”目录的内容，并把inode信息放到buffer cache以便下次访问，最后根据目录内容查询到foo.txt的inode

5. (访问磁盘)读取foo.txt的inode，获取到data block号

6. (访问磁盘)文件系统读取data block，最终将数据返回给应用，并且把数据存储在L1、L2、RAM和UBC中，加速下次访问。

### 三次磁盘访问

我们可以看到，访问/home/foo.txt有3次磁盘访问：

第1次是读取home的inode，获取foo.txt的inode号

第2次是读取foo.txt的inode，获取data block号

第3次是读取data block，获取真正的内容

然而，我们对于机械硬盘来说，每次需要磁盘转到正确的地址才能访问到内容，尤其是这些data block若未按顺序存储，就需要“下一圈”的时候再访问，这样会很耗时，也就是说访问磁盘的时间和数据在磁盘上的位置非常相关。

所以Flash技术(如flash-based SSD)就腾空出世了，可以做到任意数据的随机访问，就大大减少了数据访问时间。

# 4. Network视角

我们先回顾一下到网络这里都经历了什么：应用、操作系统、文件系统、缓冲缓存、卷管理、设备驱动、硬件控制、SCSI，一层一层递进访问。

## 4.1 存储网络

应用和存储视角已经可以工作了，而在应用和存储之间加一层网络，因此目前的玩法主要包括以下几种形式：

![存储网络](https://cloud.githubusercontent.com/assets/1736354/14232884/329592ca-f9ea-11e5-858a-d51abd697d94.png)

这些知识在之前的存储基础知识学习中有大概的涉及过。

对于文件存储，常常使用NAS的架构，更灵活；而基于块的存储则常使用SAN的方式，保证性能。

## 4.2 存储区域网络

下面是存储区域网络(SAN)常见的几种网络协议格式以及组网方式：

![存储区域网络](https://cloud.githubusercontent.com/assets/1736354/14232886/381735dc-f9ea-11e5-8155-ed14516287ab.png)

# 5. 最后的大招

![最后的大招](https://cloud.githubusercontent.com/assets/1736354/14232888/3dc0f734-f9ea-11e5-877c-8b37b7addbdd.png)

# 总结

至此，我们将所有的的细节都进行了分析。

作为编程者，如果想实现性能非常好的程序，那我们需要对每一个环节都有一定的认识。

# 参考资料

[存储数据包的一生](https://yikun.github.io/2016/04/03/%E5%AD%98%E5%82%A8%E6%95%B0%E6%8D%AE%E5%8C%85%E7%9A%84%E4%B8%80%E7%94%9F/)

* any list
{:toc}