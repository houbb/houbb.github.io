---
layout: post
title: ZooKeeper-24-ZooKeeper 原理之客户端 client
date:  2016-09-25 12:21:05 +0800
categories: [Apache]
tags: [zookeeper]
published: true
---


# 客户端

客户端是开发人员使用ZooKeeper最主要的途径，因此我们有必要对ZooKeeper客户端的内部原理进行详细讲解。

ZooKeeper的客户端主要由以下几个核心组件组成。

- ZooKeeper实例：客户端的入口。

- ClientWatchManager：客户端Watcher管理器。

- HostProvider：客户端地址列表管理器。

- ClientCnxn：客户端核心线程，其内部又包含两个线程，即 SendThread 和EventThread。前者是一个 I/O 线程，主要负责 ZooKeeper 客户端和服务端之间的网络I/O通信；后者是一个事件线程，主要负
责对服务端事件进行处理。

客户端整体结构如图7-17所示。

ZooKeeper客户端的初始化与启动环节，实际上就是ZooKeeper对象的实例化过程，因此我们首先来看下ZooKeeper客户端的构造方法：

关于 ZooKeeper 构造方法的参数说明，在 5.3.1 节中已经做了详细的解释，这里不再赘述。客户端的整个初始化和启动过程大体可以分为以下3个步骤。

1. 设置默认Watcher。

2. 设置ZooKeeper服务器地址列表。

3. 创建ClientCnxn。

如果在 ZooKeeper 的构造方法中传入一个 Watcher 对象的话，那么 ZooKeeper 就会将这个Watcher对象保存在ZKWatchManager的defaultWatcher中，作为整个客户端会话期间的默认 Watcher。

关于 Watcher的更多详细讲解，已经在 7.1.4节中做了详细说明。

# 一次会话的创建过程

为了帮助读者更好地了解ZooKeeper客户端的工作原理，我们首先从一次客户端会话的创建过程讲起，从而先对ZooKeeper的客户端及其几个重要组件之间的协作关系有一个宏观上的了解，如图 7-18 所示是客户端一次会话创建的基本过程。

在这个流程图中，所有以白色作为底色的框图流程可以看作是第一阶段，我们称之为初始化阶段；以斜线底纹表示的流程是第二阶段，称之为会话创建阶段；以点状底纹表示的则是客户端在接收到服务端响应后的对应处理，称之为响应处理阶段。

## 初始化阶段

1.初始化ZooKeeper对象。

通过调用ZooKeeper的构造方法来实例化一个ZooKeeper对象，在初始化过程中，会创建一个客户端的Watcher管理器：ClientWatchManager。

2.设置会话默认Watcher。

如果在构造方法中传入了一个 Watcher 对象，那么客户端会将这个对象作为默认Watcher保存在ClientWatchManager中。

3.构造ZooKeeper服务器地址列表管理器：HostProvider。

对于构造方法中传入的服务器地址，客户端会将其存放在服务器地址列表管理器HostProvider中。

4.创建并初始化客户端网络连接器：ClientCnxn。

ZooKeeper 客户端首先会创建一个网络连接器 ClientCnxn，用来管理客户端与服务器的网络交互。另外，客户端在创建ClientCnxn的同时，还会初始化客户端两个核心队列 outgoingQueue 和 pendingQueue，分别作为客户端的请求发送队列和服务端响应的等待队列。

在后面的章节中我们也会讲到，ClientCnxn 连接器的底层 I/O 处理器是ClientCnxnSocket，因此在这一步中，客户端还会同时创建 ClientCnxnSocket处理器。

![初始化阶段](https://img-blog.csdnimg.cn/d029e1fff14947aeadbb61a522bf45f7.png)

图7-18.ZooKeeper客户端一次会话的创建过程

## 5.初始化SendThread和EventThread。

客户端会创建两个核心网络线程SendThread和EventThread，前者用于管理客户端和服务端之间的所有网络 I/O，后者则用于进行客户端的事件处理。同时，客户端还会将ClientCnxnSocket分配给SendThread作为底层网络I/O处理器，并初始化EventThread的待处理事件队列waitingEvents，用于存放所有等待被客户端处理的事件。
会话创建阶段

## 6.启动SendThread和EventThread

SendThread首先会判断当前客户端的状态，进行一系列清理性工作，为客户端发送“会话创建”请求做准备。

## 7.获取一个服务器地址。

在开始创建TCP连接之前，SendThread首先需要获取一个ZooKeeper服务器的目标地址，这通常是从 HostProvider 中随机获取出一个地址，然后委托给ClientCnxnSocket去创建与ZooKeeper服务器之间的TCP连接。











# 参考资料

分布式一致性原理与实践

* any list
{:toc}
