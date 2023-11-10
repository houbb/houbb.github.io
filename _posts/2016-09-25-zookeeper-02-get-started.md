---
layout: post
title: ZooKeeper-02-快速开始
date:  2016-09-25 12:21:05 +0800
categories: [Apache]
tags: [zookeeper, config-center]
published: true
---

# 入门

使用ZooKeeper协调分布式应用程序

本文档包含使您快速开始使用ZooKeeper的信息。 

它主要针对希望试用的开发人员，并包含单个ZooKeeper服务器的简单安装说明，一些验证其正在运行的命令以及一个简单的编程示例。 

最后，为方便起见，有几节涉及更复杂的安装，例如，运行复制的部署以及优化事务日志。 

但是，有关商业部署的完整说明，请参阅 [《ZooKeeper管理员指南》](https://zookeeper.apache.org/doc/r3.6.2/zookeeperAdmin.html)。

# 准备工作

这里需要 jdk1.8+，这里是 3.6.2 的版本。

[系统要求](https://zookeeper.apache.org/doc/r3.6.2/zookeeperAdmin.html#sc_systemReq)

# 下载 

## windows10 

这里以 windos10 作为演示。

从 [https://zookeeper.apache.org/releases.html](https://zookeeper.apache.org/releases.html) 选择你需要的版本。

我下载的是 [https://mirror.bit.edu.cn/apache/zookeeper/zookeeper-3.6.2/apache-zookeeper-3.6.2-bin.tar.gz](https://mirror.bit.edu.cn/apache/zookeeper/zookeeper-3.6.2/apache-zookeeper-3.6.2-bin.tar.gz)

这里有一个坑，一定要下载 bin.tar.gz 的，否则会报错找不到执行类。

## 解压

此处解压的根目录为：

```
D:\tools\zookeeper\apache-zookeeper-3.6.2-bin
```

下面对应的文件为：

```
bin/  conf/  docs/  lib/  LICENSE.txt  NOTICE.txt  README.md  README_packaging.md
```


# 独立运行

在独立模式下设置ZooKeeper服务器非常简单。 

该服务器包含在单个JAR文件中，因此安装包括创建配置。

下载稳定的ZooKeeper版本后，将其解压缩并CD到根目录

要启动ZooKeeper，您需要一个配置文件。 

## 官方说明

这是一个示例，在conf/zoo.cfg中创建它：

```
tickTime=2000
dataDir=/var/lib/zookeeper
clientPort=2181
```

## 实战配置

```
$ cd conf

D:\tools\zookeeper\apache-zookeeper-3.6.2-bin\conf

$ ls
configuration.xsl  log4j.properties  zoo_sample.cfg
```

可以发现 conf 目录西默认是没有 zoo.cfg 文件的，我们可以直接新建一个文件，也可以复制 zoo_sample.cfg 重命名为 zoo.cfg。

- zoo.cfg

```
tickTime=2000
dataDir=D:\\tools\\zookeeper\\data
clientPort=2181
```

该文件可以被命名为任何文件，但是为了便于讨论，将其命名为 conf/zoo.cfg。 

更改dataDir的值以指定现有（空开头）目录。

以下是每个字段的含义：

tickTime：ZooKeeper使用的基本时间单位（毫秒）。 它用于做心跳，并且最小会话超时将是tickTime的两倍。

dataDir：存储内存数据库快照的位置，除非另有说明，否则存储数据库更新的事务日志。

clientPort：用于侦听客户端连接的端口

## 启动配置

现在，您已经创建了配置文件，您可以启动 ZooKeeper：

```
$ pwd
D:\tools\zookeeper\apache-zookeeper-3.6.2-bin\bin

$ zkServer
```

我们到 bin 目录下，直接执行 zkServer 命令，日志如下：

```
call "D:\Program Files\Java\jdk1.8.0_192"\bin\java "-Dzookeeper.log.dir=D:\tools\zookeeper\apache-zookeeper-3.6.2-bin\bin\..\logs" "-Dzookeeper.root.logger=INFO,CONSOLE" "-Dzookeeper.log.file=zookeeper-Administrator-server-PC-20210113XLZD.log" "-XX:+HeapDumpOnOutOfMemoryError" "-XX:OnOutOfMemoryError=cmd /c taskkill /pid %%p /t /f" -cp "D:\tools\zookeeper\apache-zookeeper-3.6.2-bin\bin\..\build\classes;D:\tools\zookeeper\apache-zookeeper-3.6.2-bin\bin\..\build\lib\*;D:\tools\zookeeper\apache-zookeeper-3.6.2-bin\bin\..\*;D:\tools\zookeeper\apache-zookeeper-3.6.2-bin\bin\..\lib\*;D:\tools\zookeeper\apache-zookeeper-3.6.2-bin\bin\..\conf" org.apache.zookeeper.server.quorum.QuorumPeerMain "D:\tools\zookeeper\apache-zookeeper-3.6.2-bin\bin\..\conf\zoo.cfg"
...
2021-02-14 23:39:52,384 [myid:] - INFO  [main:ZookeeperBanner@42] -
2021-02-14 23:39:52,384 [myid:] - INFO  [main:ZookeeperBanner@42] -   ______                  _
2021-02-14 23:39:52,385 [myid:] - INFO  [main:ZookeeperBanner@42] -  |___  /                 | |
2021-02-14 23:39:52,385 [myid:] - INFO  [main:ZookeeperBanner@42] -     / /    ___     ___   | | __   ___    ___   _ __     ___   _ __
2021-02-14 23:39:52,386 [myid:] - INFO  [main:ZookeeperBanner@42] -    / /    / _ \   / _ \  | |/ /  / _ \  / _ \ | '_ \   / _ \ | '__|
2021-02-14 23:39:52,386 [myid:] - INFO  [main:ZookeeperBanner@42] -   / /__  | (_) | | (_) | |   <  |  __/ |  __/ | |_) | |  __/ | |
2021-02-14 23:39:52,387 [myid:] - INFO  [main:ZookeeperBanner@42] -  /_____|  \___/   \___/  |_|\_\  \___|  \___| | .__/   \___| |_|
2021-02-14 23:39:52,387 [myid:] - INFO  [main:ZookeeperBanner@42] -                                               | |
2021-02-14 23:39:52,387 [myid:] - INFO  [main:ZookeeperBanner@42] -                                               |_|
2021-02-14 23:39:52,387 [myid:] - INFO  [main:ZookeeperBanner@42] -
2021-02-14 23:39:52,428 [myid:] - INFO  [main:Environment@98] - Server environment:zookeeper.version=3.6.2--803c7f1a12f85978cb049af5e4ef23bd8b688715, built on 09/04/2020 12:44 GMT
...
```

当然，这里需要我们首先配置好对应的 JAVA_HOME 等 jdk 的基本环境信息。

# 链接到 zk

```
$   cd D:\tools\zookeeper\apache-zookeeper-3.6.2-bin\bin
$   zkCli -server 127.0.0.1:2181
```

日志信息如下：

```
2021-02-14 23:45:47,707 [myid:] - INFO  [main:Environment@98] - Client environment:zookeeper.version=3.6.2--803c7f1a12f85978cb049af5e4ef23bd8b688715, built on 09/04/2020 12:44 GMT
...
JLine support is enabled
2021-02-14 23:45:48,066 [myid:127.0.0.1:2181] - INFO  [main-SendThread(127.0.0.1:2181):ClientCnxn$SendThread@1433] - Session establishment complete on server ieonline.microsoft.com/127.0.0.1:2181, session id = 0x100000714f00000, negotiated timeout = 30000

WATCHER::

WatchedEvent state:SyncConnected type:None path:null
[zk: 127.0.0.1:2181(CONNECTED) 0]
```

## 简单命令

```
$   help
```

输入 help 可以查看对应的常见命令。

### 查看

```
[zk: 127.0.0.1:2181(CONNECTED) 2] ls /
[zookeeper]
```

### 创建

接下来，通过运行 `create / zk_test my_data` 创建一个新的znode。 

这将创建一个新的znode并将字符串“my_data”与该节点关联。

```
[zk: 127.0.0.1:2181(CONNECTED) 3] create /zk_test my_data
Created /zk_test

[zk: 127.0.0.1:2181(CONNECTED) 4] ls /
[zk_test, zookeeper]
```

此时，zk_test 文件夹已经被创建。

### get 读取数据

可以通过 get 获取信息。

```
[zk: 127.0.0.1:2181(CONNECTED) 6] get /zk_test
my_data
```

### set 设置数据

可以通过 set 设置信息。

```
[zk: 127.0.0.1:2181(CONNECTED) 7] set /zk_test new_info
[zk: 127.0.0.1:2181(CONNECTED) 8] get /zk_test
new_info
```

### delete 删除数据

```
[zk: 127.0.0.1:2181(CONNECTED) 9] delete /zk_test
[zk: 127.0.0.1:2181(CONNECTED) 10] ls /
[zookeeper]
```

# 运行复制模式（Replicated ）的ZooKeeper

以独立模式运行ZooKeeper便于评估，某些开发和测试。 

但是在生产中，您应该在复制模式下运行ZooKeeper。 

同一应用程序中的一组服务器复制称为仲裁，并且在复制模式下，仲裁中的所有服务器都具有相同配置文件的副本。

- 笔记

对于复制模式，**至少需要三个服务器，并且强烈建议您使用奇数个服务器**。 

如果只有两台服务器，那么您将处于一种情况，如果其中一台服务器发生故障，则没有足够的计算机构成多数仲裁。 

由于存在两个单点故障，因此两个服务器本来就不如单个服务器稳定。

## 官方例子

复制模式所需的 conf/zoo.cfg 文件类似于独立模式下使用的文件，但有一些区别。 

这是一个例子：

```
tickTime=2000
dataDir=/var/lib/zookeeper
clientPort=2181
initLimit=5
syncLimit=2
server.1=zoo1:2888:3888
server.2=zoo2:2888:3888
server.3=zoo3:2888:3888
```

新条目initLimit是超时ZooKeeper用于限制仲裁中的ZooKeeper服务器必须连接到领导者的时间长度。

条目syncLimit限制服务器与领导者之间过时的距离。

对于这两个超时，您都可以使用tickTime指定时间单位。

在此示例中，initLimit的超时是5个滴答声，即2000毫秒/滴答声，即10秒。

表格 `server.X` 的条目列出了组成ZooKeeper服务的服务器。服务器启动时，它通过在数据目录中查找文件myid来知道它是哪台服务器。该文件包含ASCII的服务器号。

最后，记下每个服务器名称后的两个端口号：“2888”和“3888”。对等方使用前一个端口连接到其他对等方。这样的连接是必要的，以便对等方可以进行通信，例如，同意更新顺序。更具体地说，ZooKeeper服务器使用此端口将关注者连接到领导者。当出现新的领导者时，跟随者使用此端口打开与领导者的TCP连接。

因为默认的领导者选举也使用TCP，所以我们当前需要另一个端口来进行领导者选举。这是服务器条目中的第二个端口。

ps: 一个端口负责基本的通信；另一个端口，用于领导者选举。

- 笔记

如果要在一台计算机上测试多台服务器，请为每台服务器指定服务器名称为localhost，并具有唯一的仲裁和领导者选择端口（例如，在上面的示例中为2888：3888、2889：3889、2890：3890）。配置文件。当然，也需要单独的_dataDir_s和不同的_clientPort_s（在上面的复制示例中，在单个本地主机上运行，​​您仍然会有三个配置文件）。

请注意，在一台计算机上设置多个服务器不会产生任何冗余。如果发生某些事情导致机器死机，则所有zookeeper服务器都将处于脱机状态。完全冗余要求每个服务器都有自己的计算机。它必须是完全独立的物理服务器。同一物理主机上的多个虚拟机仍然容易受到该主机完全故障的影响。

如果ZooKeeper机器中有多个网络接口，则还可以指示ZooKeeper绑定所有接口，并在网络出现故障时自动切换到正常接口。

# 其他优化

还有几个其他配置参数可以大大提高性能：

为了获得较低的更新延迟，拥有专用的事务日志目录非常重要。 

默认情况下，事务日志与数据快照和myid文件放在同一目录中。

dataLogDir参数指示用于事务日志的其他目录。

# 参考资料

https://zookeeper.apache.org/doc/r3.6.2/zookeeperStarted.html

* any list
{:toc}