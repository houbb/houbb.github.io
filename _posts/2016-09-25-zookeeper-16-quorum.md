---
layout: post
title: ZooKeeper-16-qourum 仲裁模式
date:  2016-09-25 12:21:05 +0800
categories: [Apache]
tags: [zookeeper, config-center]
published: true
---

# ZooKeeper与仲裁模式

到⽬前为⽌，我们⼀直基于独⽴模式配置的服务器端。如果服务器启动，服务就启动了，但如果服务器故障，整个服务也因此⽽关闭。这⾮常不符合可靠的协作服务的承诺。出于可靠性，我们需要运⾏多个服务器。

## 配置文件

为了完成这些，我们将要使⽤以下配置⽂件：

```
tickTime=2000
initLimit=10
syncLimit=5
dataDir=./data
clientPort=2181
server.1=127.0.0.1:2222:2223
server.2=127.0.0.1:3333:3334
server.3=127.0.0.1:4444:4445
```

我们主要讨论最后三⾏对于server.n项的配置信息。其余配置参数将会在第10章中进⾏说明。

```
mkdir z1
mkdir z1/data
mkdir z2
mkdir z2/data
mkdir z3
mkdir z3/data
```

当启动⼀个服务器时，我们需要知道启动的是哪个服务器。⼀个服务器通过读取data⽬录下⼀个名为myid的⽂件来获取服务器ID信息。可以通过以下命令来创建这些⽂件：

```
echo 1 > z1/data/myid
echo 2 > z2/data/myid
echo 3 > z3/data/myid
```

当服务器启动时，服务器通过配置⽂件中的dataDir参数来查找data⽬录的配置。它通过mydata获得服务器ID，之后使⽤配置⽂件中server.n对应的项来设置端⼜并监听。当在不同的机器上运⾏ZooKeeper服务器进程时，它们可以使⽤相同的客户端端⼜和相同的配置⽂件。但对于这个例⼦，在⼀台服务器上运⾏，我们需要⾃定义每个服务器的客户端端⼜。

```
$ cd z1
$ {PATH_TO_ZK}/bin/zkServer.sh start ./z1.cfg
```

服务器的⽇志记录为zookeeper.out。因为我们只启动了三个ZooKeeper服务器中的⼀个，所以整个服务还⽆法运⾏。在⽇志中我们将会看到以下形式的记录：

```
... [myid:1] - INFO [QuorumPeer[myid=1]/...:2181:QuorumPeer@670] - LOOKING
... [myid:1] - INFO [QuorumPeer[myid=1]/...:2181:FastLeaderElection@740] -
New election. My id = 1, proposed zxid=0x0
... [myid:1] - INFO [WorkerReceiver[myid=1]:FastLeaderElection@542] -
Notification: 1 ..., LOOKING (my state)
... [myid:1] - WARN [WorkerSender[myid=1]:QuorumCnxManager@368] - Cannot
open channel to 2 at election address /127.0.0.1:3334
Java.net.ConnectException: Connection refused
at java.net.PlainSocketImpl.socketConnect(Native Method)
at java.net.PlainSocketImpl.doConnect(PlainSocketImpl.java:351)
```

这个服务器疯狂地尝试连接到其他服务器，然后失败，如果我们启动另⼀个服务器，我们可以构成仲裁的法定⼈数：

```
$ cd z2
$ {PATH_TO_ZK}/bin/zkServer.sh start ./z2.cfg
```

如果我们观察第⼆个服务器的⽇志记录zookeeper.out，我们将会看到：

```
... [myid:2] - INFO [QuorumPeer[myid=2]/...:2182:Leader@345] - LEADING
- LEADER ELECTION TOOK - 279
... [myid:2] - INFO [QuorumPeer[myid=2]/...:2182:FileTxnSnapLog@240] -
Snapshotting: 0x0 to ./data/version-2/snapshot.0
```

该⽇志指出服务器2已经被选举为群⾸。如果我们现在看看服务器1的⽇志，我们会看到：

```
... [myid:1] - INFO [QuorumPeer[myid=1]/...:2181:QuorumPeer@738] -
FOLLOWING
... [myid:1] - INFO [QuorumPeer[myid=1]/...:2181:ZooKeeperServer@162] -
Created server ...
... [myid:1] - INFO [QuorumPeer[myid=1]/...:2181:Follower@63] - FOLLOWING
- LEADER ELECTION TOOK - 212
```

服务器1作为服务器2的追随者被激活。我们现在具有了符合法定仲裁（三分之⼆）的可⽤服务器。

在此刻服务开始可⽤。我们现在需要配置客户端来连接到服务上。连接字符串需要列出所有组成服务的服务器host：port对。对于这个例⼦，连接串为"127.0.0.1：2181，127.0.0.1：2182，127.0.0.1：2183"（我们包含第三个服务器的信息，即使我们永远不启动它，因为这可以说明ZooKeeper⼀些有⽤的属性）。

```
$ {PATH_TO_ZK}/bin/zkCli.sh -server 127.0.0.1:2181,127.0.0.1:2182,127.0.0.1:2183
```

当连接到服务器后，我们会看到以下形式的消息：

```
[myid:] - INFO [...] - Session establishment
complete on server localhost/127.0.0.1:2182 ...
```

注意⽇志消息中的端⼜号，在本例中的2182。如果通过Ctrl-C来停⽌客户端并重启多次它，我们将会看到端⼜号在218102182之间来回变化。我们也许还会注意到尝试2183端⼜后连接失败的消息，之后为成功连接到某⼀个服务器端⼜的消息。

# 简单的负载均衡

客户端以随机顺序连接到连接串中的服务器。这样可以用ZooKeeper来实现⼀个简单的负载均衡。不过，客户端⽆法指定优先选择的服务器来进⾏连接。

例如，如果我们有5个ZooKeeper服务器的⼀个集合，其中3个在美国西海岸，另外两个在美国东海岸，为了确保客户端只连接到本地服务器上，我们可以使在东海岸客户端的连接串中只出现东海岸的服务器，在西海岸客户端的连接串中只有西海岸的服务器。

# 参考资料

《Zookeeper分布式过程协同技术详解》

* any list
{:toc}
