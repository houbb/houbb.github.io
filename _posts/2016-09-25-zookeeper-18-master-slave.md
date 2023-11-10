---
layout: post
title: ZooKeeper-18-⼀个主-从模式例⼦的实现
date:  2016-09-25 12:21:05 +0800
categories: [Apache]
tags: [zookeeper, config-center]
published: true
---

# ⼀个主-从模式例⼦的实现

本节中我们通过zkCli⼯具来实现主-从⽰例的⼀些功能。

这个例⼦仅⽤于教学⽬的，我们不推荐使⽤zkCli⼯具来搭建系统。使⽤zkCli的⽬的仅仅是为了说明如何通过ZooKeeper来实现协作菜谱，从⽽撇开在实际实现中所需的⼤量细节。我们将在下⼀章中进⼊实现的细节。

## 角色

主-从模式的模型中包括三个⾓⾊：

- 主节点

主节点负责监视新的从节点和任务，分配任务给可⽤的从节点。

- 从节点

从节点会通过系统注册⾃⼰，以确保主节点看到它们可以执⾏任务，然后开始监视新任务。

- 客户端

客户端创建新任务并等待系统的响应。

# 主节点⾓⾊因为

只有⼀个进程会成为主节点，所以⼀个进程成为ZooKeeper的主节点后必须锁定管理权。为此，进程需要创建⼀个临时znode，名为/master：

```
[zk: localhost:2181(CONNECTED) 0] create -e /master "master1.example.com:2223"①
Created /master
[zk: localhost:2181(CONNECTED) 1] ls /②
[master, zookeeper]
[zk: localhost:2181(CONNECTED) 2] get /master③
"master1.example.com:2223"
cZxid = 0x67
ctime = Tue Dec 11 10:06:19 CET 2012
mZxid = 0x67
mtime = Tue Dec 11 10:06:19 CET 2012
pZxid = 0x67
cversion = 0
dataVersion = 0
aclVersion = 0
ephemeralOwner = 0x13b891d4c9e0005
dataLength = 26
numChildren = 0
[zk: localhost:2181(CONNECTED) 3]
```

①创建主节点的znode，以便获得管理权。使用-e标志来表示创建的znode为临时性的。

刚刚发⽣了什么？

⾸先创建⼀个临时znode/master。我们在znode中添加了主机信息，以便ZooKeeper外部的其他进程需要与它通信。添加主机信息并不是必需的，但这样做仅仅是为了说明我们可以在需要时添加数据。

现在让我们看下我们使⽤两个进程来获得主节点⾓⾊的情况，尽管在任何时刻最多只能有⼀个活动的主节点，其他进程将成为备份主节点。假如其他进程不知道已经有⼀个主节点被选举出来，并尝试创建⼀个/master节点。让我们看看会发⽣什么：

```
[zk: localhost:2181(CONNECTED) 0] create -e /master "master2.example.com:2223"
Node already exists: /master
[zk: localhost:2181(CONNECTED) 1]
```

ZooKeeper告诉我们⼀个/master节点已经存在。这样，第⼆个进程就知道已经存在⼀个主节点。然⽽，⼀个活动的主节点可能会崩溃，备份主节点需要接替活动主节点的⾓⾊。为了检测到这些，需要在/master节点上设置⼀个监视点，操作如下：

```
[zk: localhost:2181(CONNECTED) 0] create -e /master "master2.example.com:2223"
Node already exists: /master
[zk: localhost:2181(CONNECTED) 1] stat /master true
cZxid = 0x67
ctime = Tue Dec 11 10:06:19 CET 2012
mZxid = 0x67
mtime = Tue Dec 11 10:06:19 CET 2012
pZxid = 0x67
cversion = 0
dataVersion = 0
aclVersion = 0
ephemeralOwner = 0x13b891d4c9e0005
dataLength = 26
numChildren = 0
[zk: localhost:2181(CONNECTED) 2]
```

stat命令可以得到⼀个znode节点的属性，并允许我们在已经存在的znode节点上设置监视点。通过在路径后⾯设置参数true来添加监视点。当活动的主节点崩溃时，我们会观察到以下情况：

```
[zk: localhost:2181(CONNECTED) 0] create -e /master "master2.example.com:2223"
Node already exists: /master
[zk: localhost:2181(CONNECTED) 1] stat /master true
cZxid = 0x67
ctime = Tue Dec 11 10:06:19 CET 2012
mZxid = 0x67
mtime = Tue Dec 11 10:06:19 CET 2012
pZxid = 0x67
cversion = 0
dataVersion = 0
aclVersion = 0
ephemeralOwner = 0x13b891d4c9e0005
dataLength = 26
numChildren = 0
[zk: localhost:2181(CONNECTED) 2]
WATCHER::
WatchedEvent state:SyncConnected type:NodeDeleted path:/master
[zk: localhost:2181(CONNECTED) 2] ls /
[zookeeper]
[zk: localhost:2181(CONNECTED) 3]
```

在输出的最后，我们注意到NodeDeleted事件。这个事件指出活动主节点的会话已经关闭或过期。同时注意，/master节点已经不存在了。现在备份主节点通过再次创建/master节点来成为活动主节点。

```
[zk: localhost:2181(CONNECTED) 0] create -e /master "master2.example.com:2223"
Node already exists: /master
[zk: localhost:2181(CONNECTED) 1] stat /master true
cZxid = 0x67
ctime = Tue Dec 11 10:06:19 CET 2012
mZxid = 0x67
mtime = Tue Dec 11 10:06:19 CET 2012
pZxid = 0x67
cversion = 0
dataVersion = 0
aclVersion = 0
ephemeralOwner = 0x13b891d4c9e0005
dataLength = 26
numChildren = 0
[zk: localhost:2181(CONNECTED) 2]
WATCHER::
WatchedEvent state:SyncConnected type:NodeDeleted path:/master
[zk: localhost:2181(CONNECTED) 2] ls /
[zookeeper]
[zk: localhost:2181(CONNECTED) 3] create -e /master "master2.example.com:2223"
Created /master
[zk: localhost:2181(CONNECTED) 4]
```

因为备份主节点成功创建了/master节点，所以现在客户端开始成为活动主节点。

# 从节点、任务和分配

在我们讨论从节点和客户端所采取的步骤之前，让我们先创建三个重要的⽗znode，/workers、/tasks和/assign：

```
[zk: localhost:2181(CONNECTED) 0] create /workers ""
Created /workers
[zk: localhost:2181(CONNECTED) 1] create /tasks ""
Created /tasks
[zk: localhost:2181(CONNECTED) 2] create /assign ""
Created /assign
[zk: localhost:2181(CONNECTED) 3] ls /
[assign, tasks, workers, master, zookeeper]
[zk: localhost:2181(CONNECTED) 4]
```

这三个新的znode为持久性节点，且不包含任何数据。本例中，通过使⽤这些znode可以告诉我们哪个从节点当前有效，还告诉我们当前有任务需要分配，并向从节点分配任务。

```
[zk: localhost:2181(CONNECTED) 4] ls /workers true
[]
[zk: localhost:2181(CONNECTED) 5] ls /tasks true
[]
[zk: localhost:2181(CONNECTED) 6]
```

请注意，在主节点上调⽤stat命令前，我们使⽤可选的true参数调⽤ls命令。通过true这个参数，可以设置对应znode的⼦节点变化的监视点。

# 从节点⾓⾊

从节点⾸先要通知主节点，告知从节点可以执⾏任务。从节点通过在/workers⼦节点下创建临时性的znode来进⾏通知，并在⼦节点中使⽤主机名来标识⾃⼰：

```
[zk: localhost:2181(CONNECTED) 0] create -e /workers/worker1.example.com
"worker1.example.com:2224"
Created /workers/worker1.example.com
[zk: localhost:2181(CONNECTED) 1]
```

注意，输出中，ZooKeeper确认znode已经创建。之前主节点已经监视了/workers的⼦节点变化情况。⼀旦从节点在/workers下创建了⼀个znode，主节点就会观察到以下通知信息：

```
WATCHER::
WatchedEvent state:SyncConnected type:NodeChildrenChanged path:/workers
```

下⼀步，从节点需要创建⼀个⽗znode/assing/worker1.example.com来接收任务分配，并通过第⼆个参数为true的ls命令来监视这个节点的变化，以便等待新的任务。

```
[zk: localhost:2181(CONNECTED) 0] create -e /workers/worker1.example.com
"worker1.example.com:2224"
Created /workers/worker1.example.com
[zk: localhost:2181(CONNECTED) 1] create /assign/worker1.example.com ""Created /assign/worker1.example.com
[zk: localhost:2181(CONNECTED) 2] ls /assign/worker1.example.com true
[]
[zk: localhost:2181(CONNECTED) 3]
```

从节点现在已经准备就绪，可以接收任务分配。之后，我们通过讨论客户端⾓⾊来看⼀下任务分配的问题。

# 客户端⾓⾊

客户端向系统中添加任务。在本⽰例中具体任务是什么并不重要，我们假设客户端请求主从系统来运⾏cmd命令。为了向系统添加⼀个任务，客户端执⾏以下操作：

```
[zk: localhost:2181(CONNECTED) 0] create -s /tasks/task- "cmd"
Created /tasks/task-0000000000
```

我们需要按照任务添加的顺序来添加znode，其本质上为⼀个队列。客户端现在必须等待任务执⾏完毕。执⾏任务的从节点将任务执⾏完毕后，会创建⼀个znode来表⽰任务状态。客户端通过查看任务状态的znode是否创建来确定任务是否执⾏完毕，因此客户端需要监视状态znode的创建事件：

```
[zk: localhost:2181(CONNECTED) 1] ls /tasks/task-0000000000 true
[]
[zk: localhost:2181(CONNECTED) 2]
```

执⾏任务的从节点会在/tasks/task-0000000000节点下创建状态znode节点，所以我们需要⽤ls命令来监视/tasks/task-0000000000的⼦节点。

```
[zk: localhost:2181(CONNECTED) 6]
WATCHER::
WatchedEvent state:SyncConnected type:NodeChildrenChanged path:/tasks
```

主节点之后会检查这个新的任务，获取可⽤的从节点列表，之后分配这个任务给worker1.example.com：

```
[zk: 6] ls /tasks
[task-0000000000]
[zk: 7] ls /workers
[worker1.example.com]
[zk: 8] create /assign/worker1.example.com/task-0000000000 ""
Created /assign/worker1.example.com/task-0000000000
[zk: 9]
```

从节点接收到新任务分配的通知：

```
[zk: localhost:2181(CONNECTED) 3]
WATCHER::
WatchedEvent state:SyncConnected type:NodeChildrenChanged
path:/assign/worker1.example.com
```

从节点之后便开始检查新任务，并确认该任务是否分配给⾃⼰：

```
WATCHER::
WatchedEvent state:SyncConnected type:NodeChildrenChanged
path:/assign/worker1.example.com
[zk: localhost:2181(CONNECTED) 3] ls /assign/worker1.example.com
[task-0000000000]
[zk: localhost:2181(CONNECTED) 4]
```

⼀旦从节点完成任务的执⾏，它就会在/tasks中添加⼀个状态znode：

```
[zk: localhost:2181(CONNECTED) 4] create /tasks/task-0000000000/status "done"
Created /tasks/task-0000000000/status
[zk: localhost:2181(CONNECTED) 5]
```

之后，客户端接收到通知，并检查执⾏结果：

```
WATCHER::
WatchedEvent state:SyncConnected type:NodeChildrenChanged
path:/tasks/task-0000000000
[zk: localhost:2181(CONNECTED) 2] get /tasks/task-0000000000
"cmd"
cZxid = 0x7c
ctime = Tue Dec 11 10:30:18 CET 2012
mZxid = 0x7c
mtime = Tue Dec 11 10:30:18 CET 2012
pZxid = 0x7e
cversion = 1
dataVersion = 0
aclVersion = 0
ephemeralOwner = 0x0
dataLength = 5
numChildren = 1
[zk: localhost:2181(CONNECTED) 3] get /tasks/task-0000000000/status
"done"
cZxid = 0x7e
ctime = Tue Dec 11 10:42:41 CET 2012
mZxid = 0x7e
mtime = Tue Dec 11 10:42:41 CET 2012
pZxid = 0x7e
cversion = 0
dataVersion = 0
aclVersion = 0
ephemeralOwner = 0x0
dataLength = 8
numChildren = 0
[zk: localhost:2181(CONNECTED) 4]
```

客户端检查状态znode的信息，并确认任务的执⾏结果。本例中，我们看到任务成功执⾏，其状态为“done”。当然任务也可能⾮常复杂，甚⾄涉及另⼀个分布式系统。最终不管是什么样的任务，执⾏任务的机制与通过ZooKeeper来传递结果，本质上都是⼀样的

# 参考资料

《Zookeeper分布式过程协同技术详解》

* any list
{:toc}
