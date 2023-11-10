---
layout: post
title: ZooKeeper-22-ZooKeeper 原理之系统模型
date:  2016-09-25 12:21:05 +0800
categories: [Apache]
tags: [zookeeper, config-center]
published: true
---


# ZooKeeper技术内幕

好了，到现在为止，在学习了前面几章的内容之后，相信读者已经能够在应用中很好地使用 ZooKeeper 了。

尤其在数据发布/订阅、负载均衡、命名服务、分布式协调/通知、集群管理、Master 选举、分布式锁以及分布式队列等分布式场景中，能够很好地利用ZooKeeper来解决实际的分布式问题了。

当然，相信读者也一定对ZooKeeper内部如何做到分布式数据一致性而感到好奇。

在本章中，我们将从系统模型、序列化与协议、客户端工作原理、会话、服务端工作原理以及数据存储等方面来向读者揭示 ZooKeeper 的技术内幕，帮助读者更深入地了解ZooKeeper这一分布式协调框架。

# 系统模型

在本节中，我们首先将从数据模型、节点特性、版本、Watcher 和 ACL 五方面来讲述ZooKeeper的系统模型。

## 数据模型

ZooKeeper的视图结构和标准的Unix文件系统非常类似，但没有引入传统文件系统中目录和文件等相关概念，而是使用了其特有的“数据节点”概念，我们称之为ZNode。

ZNode是ZooKeeper中数据的最小单元，每个ZNode上都可以保存数据，同时还可以挂载子节点，因此构成了一个层次化的命名空间，我们称之为树。

### 树

首先我们来看图7-1所示的ZooKeeper数据节点示意图，从而对ZooKeeper上的数据节点有一个大体上的认识。

在ZooKeeper中，每一个数据节点都被称为一个ZNode，所有ZNode 按层次化结构进行组织，形成一棵树。ZNode 的节点路径标识方式和 Unix 文件系统路径非常相似，都是由一系列使用斜杠（/）进行分割的路径表示，开发人员可以向这个节点中写入数据，也可以在节点下面创建子节点。

### 事务ID

在《事务处理：概念与技术》一书中提到，事务是对物理和抽象的应用状态上的操作集合。

在现在的计算机科学中，狭义上的事务通常指的是数据库事务，一般包含了一系列对数据库有序的读写操作，这些数据库事务具有所谓的ACID特性，即原子性（Atomic）、一致性（Consistency）、隔离性（Isolation）和持久性（Durability）。

在ZooKeeper中，事务是指能够改变ZooKeeper服务器状态的操作，我们也称之为事务操作或更新操作，一般包括数据节点创建与删除、数据节点内容更新和客户端会话创建与失效等操作。

对于每一个事务请求，ZooKeeper都会为其分配一个全局唯一的事务ID，用 ZXID 来表示，通常是一个 64 位的数字。

每一个 ZXID 对应一次更新操作，从这些ZXID中可以间接地识别出ZooKeeper处理这些更新操作请求的全局顺序。

## 节点特性

在上一节中，我们已经了解到，ZooKeeper 的命名空间是由一系列数据节点组成的，在本节中，我们将对数据节点做详细讲解。

### 节点类型

在ZooKeeper中，每个数据节点都是有生命周期的，其生命周期的长短取决于数据节点的节点类型。

在ZooKeeper中，节点类型可以分为持久节点（PERSISTENT）、临时节点（EPHEMERAL）和顺序节点（SEQUENTIAL）三大类，具体在节点创建过程中，通过组合使用，可以生成以下四种组合型节点类型：

### 持久节点（PERSISTENT）

持久节点是ZooKeeper中最常见的一种节点类型。所谓持久节点，是指该数据节点被创建后，就会一直存在于ZooKeeper服务器上，直到有删除操作来主动清除这个节点。

### 持久顺序节点（PERSISTENT_SEQUENTIAL）

持久顺序节点的基本特性和持久节点是一致的，额外的特性表现在顺序性上。

在ZooKeeper 中，每个父节点都会为它的第一级子节点维护一份顺序，用于记录下每个子节点创建的先后顺序。基于这个

顺序特性，在创建子节点的时候，可以设置这个标记，那么在创建节点过程中，ZooKeeper 会自动为给定节点名加上一个数字后缀，作为一个新的、完整的节点名。另外需要注意的是，这个数字后缀的上限是整型的最大值。

### 临时节点（EPHEMERAL）

和持久节点不同的是，临时节点的生命周期和客户端的会话绑定在一起，也就是说，如果客户端会话失效，那么这个节点就会被自动清理掉。注意，这里提到的是客户端会话失效，而非TCP连接断开。关于ZooKeeper客户端会话和连接，将在7.4节中做详细讲解。另外，ZooKeeper 规定了不能基于临时节点来创建子节点，即临时节点只能作为叶子节点。

### 临时顺序节点（EPHEMERAL_SEQUENTIAL）

临时顺序节点的基本特性和临时节点也是一致的，同样是在临时节点的基础上，添加了顺序的特性。

### 状态信息

在 7.1.1 节中，我们提到可以针对 ZooKeeper 上的数据节点进行数据的写入和子节点的创建。

事实上，**每个数据节点除了存储了数据内容之外，还存储了数据节点本身的一些状态信息**。

在 5.2.2 节中，我们介绍了如何使用 get 命令来获取一个数据节点的内容。

从图7-2所示的返回结果中，我们可以看到，第一行是当前数据节点的数据内容，从第二行开始就是节点的状态信息了，这其实就是数据节点的 Stat 对象的格式化输出，图7-3展示了ZooKeeper中Stat类的数据结构。

- 表7-1.Stat对象状态属性说明

![Stat对象状态属性说明](https://img-blog.csdnimg.cn/5955bfa9c5984f809c0eb9229dc35a47.png)

# 版本——保证分布式数据原子性操作

ZooKeeper中为数据节点引入了版本的概念，每个数据节点都具有三种类型的版本信息，对数据节点的任何更新操作都会引起版本号的变化，表7-2中对这三类版本信息分别进行了说明。

- 表7-2. 数据节点版本类型说明

| 字段 | 说明 |
|:----|:----|
| version | 当前数据节点数据内容的版本号 |
| cversion | 当前数据节点子节点版本号 |
| aversion | 当前数据节点 ACL 变更版本号 |

ZooKeeper 中的版本概念和传统意义上的软件版本有很大的区别，它表示的是对数据节点的数据内容、子节点列表，或是节点ACL信息的修改次数，我们以其中的version这种版本类型为例来说明。

在一个数据节点/zk-book被创建完毕之后，节点的version值是0，表示的含义是“当前节点自从创建之后，被更新过0次”。

如果现在对该节点的数据内容进行更新操作，那么随后，version的值就会变成1。同时需要注意的是，在上文中提到的关于 version 的说明，其表示的是对数据节点数据内容的变更次数，强调的是变更次数，因此即使前后两次变更并没有使得数据内容的值发生变化，version的值依然会变更。

在上面的介绍中，我们基本了解了ZooKeeper中的版本概念。

## 版本的作用

那么版本究竟用来干嘛呢？在讲解版本的作用之前，我们首先来看下分布式领域中最常见的一个概念——锁。

一个多线程应用，尤其是分布式系统，在运行过程中往往需要保证数据访问的排他性。

例如在最常见的车站售票系统上，在对系统中车票“剩余量”的更新处理中，我们希望在针对某个时间点的数据进行更新操作时（这可能是一个极短的时间间隔，例如几秒或几毫秒，甚至是几纳秒，在计算机科学的有些应用场景中，几纳秒可能也算不上太短的时间间隔），数据不会因为其他人或系统的操作再次发生变化。也就是说，车站的售票员在卖票的过程中，必须要保证在自己的操作过程中，其他售票员不会同时也在出售这个车次的车票。

为保证上面这个场景的正常运作，一种可能的做法或许是这样，车站某售票窗口的售票员突然向其他售票员大喊一声：“现在你们不要出售杭州到北京的 XXX 次车票！”然后当他售票完毕后，再次通知大家：“该车次已经可以售票啦！”

当然在现实生活中，不会依靠这么原始的人工方式来实现数据访问的排他性，但这个例子给我们的启发是：在并发环境中，我们需要通过一些机制来保证这些数据在某个操作过程中不会被外界修改，我们称这样的机制为“锁”。在数据库技术中，通常提到的“悲观锁”和“乐观锁”就是这种机制的典型实现。

### 悲观锁

悲观锁，又被称作悲观并发控制（Pessimistic Concurrency Control，PCC），是数据库中一种非常典型且非常严格的并发控制策略。

悲观锁具有强烈的独占和排他特性，能够有效地避免不同事务对同一数据并发更新而造成的数据一致性问题。

在悲观锁的实现原理中，如果一个事务（假定事务A）正在对数据进行处理，那么在整个处理过程中，都会将数据处于锁定状态，在这期间，其他事务将无法对这个数据进行更新操作，直到事务A完成对该数据的处理，释放了对应的锁之后，其他事务才能够重新竞争来对数据进行更新操作。也就是说，对于一份独立的数据，系统只分配了一把唯一的钥匙，谁获得了这把钥匙，谁就有权力更新这份数据。

**一般我们认为，在实际生产应用中，悲观锁策略适合解决那些对于数据更新竞争十分激烈的场景——在这类场景中，通常采用简单粗暴的悲观锁机制来解决并发控制问题**。

### 乐观锁

乐观锁，又被称作乐观并发控制（Optimistic Concurrency Control，OCC），也是一种常见的并发控制策略。

相对于悲观锁而言，乐观锁机制显得更加宽松与友好。从上面对悲观锁的讲解中我们可以看到，悲观锁假定不同事务之间的处理一定会出现互相干扰，从而需要在一个事务从头到尾的过程中都对数据进行加锁处理。而乐观锁则正好相反，它假定多个事务在处理过程中不会彼此影响，因此在事务处理的绝大部分时间里不需要进行加锁处理。当然，既然有并发，就一定会存在数据更新冲突的可能。

在乐观锁机制中，在更新请求提交之前，每个事务都会首先检查当前事务读取数据后，是否有其他事务对该数据进行了修改。如果其他事务有更新的话，那么正在提交的事务就需要回滚。乐观锁通常适合使用在数据并发竞争不大、事务冲突较少的应用场景中。

从上面的讲解中，我们其实可以把一个乐观锁控制的事务分成如下三个阶段：数据读取、写入校验和数据写入，其中写入校验阶段是整个乐观锁控制的关键所在。

在写入校验阶段，事务会检查数据在读取阶段后是否有其他事务对数据进行过更新，以确保数据更新的一致性。

那么，如何来进行写入校验呢？我们首先可以来看下 JDK 中最典型的乐观锁实现——CAS。

在5.3.5节中，我们已经对CAS理论有过阐述，简单地讲就是“对于值V，每次更新前都会比对其值是否是预期值A，只有符合预期，才会将V原子化地更新到新值B”，其中是否符合预期便是乐观锁中的“写入校验”阶段。

好了，现在我们再回过头来看看 ZooKeeper 中版本的作用。事实上，在 ZooKeeper 中，**version属性正是用来实现乐观锁机制中的“写入校验”的**。

在5.3.5节中，我们已经详细地讲解了如何正确地使用 version 属性来实现乐观锁机制，在这里我们重点看下ZooKeeper的内部实现。

在ZooKeeper服务器的PrepRequestProcessor处理器类中，在处理每一个数据更新（setDataRequest）请求时，会进行如清单7-1所示的版本检查。

```java
version = setDataRequest.getVersion();

int currentVersion = nodeRecord.stat.getVersion();
if(version != -1
    && version != currentVersion) {
    throw new KeeperException.BadVersionException(path);    
}

verison = currentVersion+1;
```

从上面的执行逻辑中，我们可以看出，在进行一次 setDataRequest 请求处理时，首先进行了版本检查：ZooKeeper会从setDataRequest请求中获取到当前请求的版本version，同时从数据记录nodeRecord中获取到当前服务器上该数据的最新版本currentVersion。

如果 version 为“-1”，那么说明客户端并不要求使用乐观锁，可以忽略版本比对；如果version不是“-1”，那么就比对version和currentVersion，如果两个版本不匹配，那么将会抛出BadVersionException异常。

# Watcher——数据变更的通知

在 6.1.1 节中，我们已经提到，ZooKeeper 提供了分布式数据的发布/订阅功能。

一个典型的发布/订阅模型系统定义了一种一对多的订阅关系，能够让多个订阅者同时监听某一个主题对象，当这个主题对象自身状态变化时，会通知所有订阅者，使它们能够做出相应的处理。

在 ZooKeeper 中，引入了 Watcher 机制来实现这种分布式的通知功能。ZooKeeper 允许客户端向服务端注册一个 Watcher 监听，当服务端的一些指定事件触发了这个 Watcher，那么就会向指定客户端发送一个事件通知来实现分布式的通知功能。

我们可以看到，ZooKeeper 的 Watcher 机制主要包括客户端线程、客户端WatchManager 和 ZooKeeper 服务器三部分。

在具体工作流程上，简单地讲，客户端在向 ZooKeeper 服务器注册 Watcher 的同时，会将 Watcher 对象存储在客户端的WatchManager中。

当ZooKeeper服务器端触发Watcher事件后，会向客户端发送通知，客户端线程从WatchManager中取出对应的Watcher对象来执行回调逻辑。

## Watcher接口

在ZooKeeper中，接口类Watcher用于表示一个标准的事件处理器，其定义了事件通知相关的逻辑，包含KeeperState和EventType两个枚举类，分别代表了通知状态和事件类型，同时定义了事件的回调方法：process（WatchedEvent event）。

## Watcher事件

同一个事件类型在不同的通知状态中代表的含义有所不同，表7-3列举了常见的通知状态和事件类型。

- 表7-3.Watcher通知状态与事件类型一览

![watch event](https://img-blog.csdnimg.cn/f20f2d516b154a4391ae20e905603e30.png)

表 7-3 中列举了 ZooKeeper 中最常见的几个通知状态和事件类型。

其中，针对NodeDataChanged事件，在5.3.5节中也有提到，此处说的变更包括节点的数据内容和数据的版本号dataVersion。

因此，即使使用相同的数据内容来更新，还是会触发这个事件通知，因为对于ZooKeeper来说，无论数据内容是否变更，一旦有客户端调用了数据更新的接口，且更新成功，就会更新dataVersion值。

NodeChildrenChanged 事件会在数据节点的子节点列表发生变更的时候被触发，这里说的子节点列表变化特指子节点个数和组成情况的变更，即新增子节点或删除子节点，而子节点内容的变化是不会触发这个事件的。

对于 AuthFailed 这个事件，需要注意的地方是，它的触发条件并不是简简单单因为当前客户端会话没有权限，而是授权失败。

我们首先通过清单7-2和清单7-3所示的两个例子来看看AuthFailed这个事件。

```java
zkClient = new Zookeeper(SERVER_LIST, 3000, new Simple_AuthFailed1());
zkClient.addAuthInfo("digest", "taokeeper:true".getBytes());
zkClient.create("/zk-book", "".getBytes(), acls, CreateMode.EPHEMREAL);


zkClient = new Zookeeper(SERVER_LIST, 3000, new Simple_AuthFailed1());
zkClient.addAuthInfo("digest", "taokeeper:error".getBytes());
zkClient.getData("/zk-book", true, null);
```

清单7-2.使用正确的Scheme进行授权

```java
zkClient = new Zookeeper(SERVER_LIST, 3000, new Simple_AuthFailed2());
zkClient.addAuthInfo("digest", "taokeeper:true".getBytes());
zkClient.create("/zk-book", "".getBytes(), acls, CreateMode.EPHEMREAL);


zkClient = new Zookeeper(SERVER_LIST, 3000, new Simple_AuthFailed2());
zkClient.addAuthInfo("digest2", "taokeeper:error".getBytes());
zkClient.getData("/zk-book", true, null);
```

- 清单7-3.使用错误的Scheme进行授权

上面两个示例程序都创建了一个受到权限控制的数据节点，然后使用了不同的权限Scheme 进行权限检查。

在第一个示例程序中，使用了正确的权限 Scheme：digest；而第二个示例程序中使用了错误的 Scheme：digest2。另外，无论哪个程序，都使用了错误的 Auth：taokeeper：error，因此在运行第一个程序的时候，会抛出NoAuthException异常，而第二个程序运行后，抛出的是AuthFailedException异常，同时，会收到对应的Watcher事件通知：（AuthFailed，None）。

关于这两个示例的完整程序，可以到本书对应的源代码包中获取，包名为book.chapter07.$7_1_4。

## 回调方法process（）

process 方法是 Watcher 接口中的一个回调方法，当 ZooKeeper 向客户端发送一个Watcher事件通知时，客户端就会对相应的process方法进行回调，从而实现对事件的处理。

process 方法的定义如下：

```java
abstract public void process(WatchedEvent event);
```

这个回调方法的定义非常简单，我们重点看下方法的参数定义：WatchedEvent。

WatchedEvent 包含了每一个事件的三个基本属性：通知状态（keeperState）、事件类型（eventType）和节点路径（path），其数据结构如图7-5所示。

ZooKeeper使用 WatchedEvent 对象来封装服务端事件并传递给 Watcher，从而方便回调方法process对服务端事件进行处理。

提到WatchedEvent，不得不讲下 WatcherEvent 实体。

笼统地讲，两者表示的是同一个事物，都是对一个服务端事件的封装。

不同的是，WatchedEvent 是一个逻辑事件，用于服务端和客户端程序执行过程中所需的逻辑对象，而 WatcherEvent 因为实现了序列化接口，因此可以用于网络传输，其数据结构如图7-6所示。

服务端在生成WatchedEvent事件之后，会调用getWrapper方法将自己包装成一个可序列化的 WatcherEvent 事件，以便通过网络传输到客户端。

客户端在接收到服务端的这个事件对象后，首先会将 WatcherEvent 事件还原成一个 WatchedEvent 事件，并传递给 process 方法处理，回调方法 process 根据入参就能够解析出完整的服务端事件了。

需要注意的一点是，无论是WatchedEvent还是WatcherEvent，其对ZooKeeper服务端事件的封装都是极其简单的。

举个例子来说，当 /zk-book 这个节点的数据发生变更时，服务端会发送给客户端一个“ZNode数据内容变更”事件，客户端只能够接收到如下信息：

```
KeeperStat: SyncConneted
EventType: NodeDataChanged
Path: /zk-book
```

从上面展示的信息中，我们可以看到，客户端无法直接从该事件中获取到对应数据节点的原始数据内容以及变更后的新数据内容，而是需要客户端再次主动去重新获取数据——这也是ZooKeeper Watcher机制的一个非常重要的特性。

## 工作机制

ZooKeeper的Watcher机制，总的来说可以概括为以下三个过程：客户端注册Watcher、服务端处理Watcher和客户端回调Watcher，其内部各组件之间的关系如图7-7所示。

## 客户端注册Watcher

在 5.3.1 节中，我们提到在创建一个 ZooKeeper 客户端对象实例时，可以向构造方法中传入一个默认的Watcher：

```java
public Zookeeper(String connectString, int sessionTimeout, Watcher watcher);
```

这个 Watcher 将作为整个 ZooKeeper 会话期间的默认 Watcher，会一直被保存在客户端ZKWatchManager 的 defaultWatcher 中。

另外，ZooKeeper 客户端也可以通过getData、getChildren和exist三个接口来向ZooKeeper服务器注册Watcher，无论使用哪种方式，注册 Watcher 的工作原理都是一致的，这里我们以 getData 这个接口为例来说明。

getData接口用于获取指定节点的数据内容，主要有两个方法：

```java
public byte[] getData(String path, boolean watch, Stat stat);
public byte[] getData(String path, Watcher watcher, Stat stat);
```

在这两个接口上都可以进行 Watcher 的注册，第一个接口通过一个 boolean 参数来标识是否使用上文中提到的默认Watcher来进行注册，具体的注册逻辑和第二个接口是一致的。

在向getData接口注册Watcher后，客户端首先会对当前客户端请求request进行标记，将其设置为“使用Watcher监听”，同时会封装一个Watcher的注册信息WatchRegistration对象，用于暂时保存数据节点的路径和Watcher的对应关系，具体的逻辑代码如下：

```java
public Stat getData(final String path, Watcher watcher, Stat stat) {
    //...
    WatcherRegistration wcb = null;
    if(watcher != null) {
        wcb = new DataWatchRegistration(watcher, clientPath);
    }

    //...
    request.setWatch(watcher != null);

    ReplyHeader r = cnxn.submitRequest(h, request, response, wcb);

    //...
}
```

在ZooKeeper中，Packet可以被看作一个最小的通信协议单元，用于进行客户端与服务端之间的网络传输，任何需要传输的对象都需要包装成一个Packet对象。

因此，在ClientCnxn中WatchRegistration又会被封装到Packet中去，然后放入发送队列中等待客户端发送：

```java
Packet queuePacket(RequestHeader h, ReplyHeader r, Record request, Record response, AsyncCallback cb,
    String clientpath, String serverPath, Object ctx, WatchRegistration watchRegistration) {
    Packet packet = null;

    //...
    synchronized(outgoingQueue) {
        packet = new Packet(h, r, request, response, watchRegistration);

        //...

        outgoingQueue.add(packet);
    }    
}
```

随后，ZooKeeper 客户端就会向服务端发送这个请求，同时等待请求的返回。

完成请求发送后，会由客户端 SendThread 线程的 readResponse 方法负责接收来自服务端的响应，finishPacket方法会从Packet中取出对应的Watcher并注册到ZKWatchManager中去：

```java
public void finishPacket(Packet p) {
    if(p.watchRegistration != null) {
        p.watchRegistration.register(p.replyHeader.getErr());
    }
}
```

从上面的内容中，我们已经了解到客户端已经将Watcher暂时封装在了WatchRegistration对象中，现在就需要从这个封装对象中再次提取出Watcher来：


## 服务端处理Watcher

上面主要讲解了客户端注册 Watcher 的过程，并且已经了解了最终客户端并不会将Watcher对象真正传递到服务端。

那么，服务端究竟是如何完成客户端的Watcher注册，又是如何来处理这个Watcher的呢？

本节将主要围绕这两个问题展开进行讲解。

- 图7-9.服务端处理Watcher的序列图

从图7-9中我们可以看到，服务端收到来自客户端的请求之后，在FinalRequest Processor.processRequest（）中会判断当前请求是否需要注册Watcher：

从getData请求的处理逻辑中，我们可以看到，当getDataRequest.getWatch（）为true的时候，ZooKeeper就认为当前客户端请求需要进行Watcher注册，于是就会将当前的 ServerCnxn 对象和数据节点路径传入 getData 方法中去。

那么为什么要传入ServerCnxn呢？ServerCnxn是一个ZooKeeper客户端和服务器之间的连接接口，代表了一个客户端和服务器的连接。ServerCnxn接口的默认实现是NIOServerCnxn，同时从3.4.0版本开始，引入了基于Netty的实现：NettyServerCnxn。无论采用哪种实现方式，都实现了Watcher的process接口，因此我们可以把ServerCnxn看作是一个Watcher对象。数据节点的节点路径和 ServerCnxn 最终会被存储在 WatchManager 的watchTable和watch2Paths中。

WatchManager是ZooKeeper服务端Watcher的管理者，其内部管理的watchTable和watch2Paths两个存储结构，分别从两个维度对Watcher进行存储。

- watchTable是从数据节点路径的粒度来托管Watcher。

- watch2Paths是从Watcher的粒度来控制事件触发需要触发的数据节点。

同时，WatchManager还负责Watcher事件的触发，并移除那些已经被触发的Watcher。

注意，WatchManager只是一个统称，在服务端，DataTree中会托管两个WatchManager，分别是dataWatches和childWatches，分别对应数据变更Watcher和子节点变更Watcher。

在本例中，因为是getData接口，因此最终会被存储在dataWatches中，其数据结构如图7-10所示。

### Watcher触发

在上面的讲解中，我们了解了对于标记了Watcher注册的请求，ZooKeeper会将其对应的ServerCnxn存储到WatchManager中，下面我们来看看服务端是如何触发 Watcher 的。

在表 7-3 中我们提到，NodeDataChanged 事件的触发条件是“Watcher监听的对应数据节点的数据内容发生变更”，其具体实现如下：

无论是 dataWatches 还是 childWatches 管理器，Watcher 的触发逻辑都是一致的，基本步骤如下。

1.封装WatchedEvent。

首先将通知状态（KeeperState）、事件类型（EventType）以及节点路径（Path）封装成一个WatchedEvent对象。

2.查询Watcher。

根据数据节点的节点路径从watchTable中取出对应的Watcher。如果没有找到Watcher，说明没有任何客户端在该数据节点上注册过Watcher，直接退出。而如果找到了这个Watcher，会将其提取出来，同时会直接从watchTable和watch2Paths中将其删除——从这里我们也可以看出，Watcher在服务端是一次性的，即触发一次就失效了。

3.调用process方法来触发Watcher。

在这一步中，会逐个依次地调用从步骤2中找出的所有Watcher的process方法。那么这里的 process 方法究竟做了些什么呢？

在上文中我们已经提到，对于需要注册 Watcher 的请求，ZooKeeper 会把当前请求对应的ServerCnxn 作为一个 Watcher 进行存储，因此，这里调用的 process 方法，事实上就是ServerCnxn的对应方法：

从上面的代码片段中，我们可以看出在process方法中，主要逻辑如下。

· 在请求头中标记“-1”，表明当前是一个通知。

· 将WatchedEvent包装成WatcherEvent，以便进行网络传输序列化。

· 向客户端发送该通知。

从以上几个步骤中可以看到，ServerCnxn的process方法中的逻辑非常简单，本质上并不是处理客户端 Watcher 真正的业务逻辑，而是

借助当前客户端连接的ServerCnxn 对象来实现对客户端的 WatchedEvent 传递，真正的客户端 Watcher回调与业务逻辑执行都在客户端。

### 客户端回调Watcher

上面我们已经讲解了服务端是如何进行Watcher触发的，并且知道了最终服务端会通过使用 ServerCnxn对应的 TCP连接来向客户端发送一个 WatcherEvent 事件，下面我们来看看客户端是如何处理这个事件的。

SendThread接收事件通知

首先我们来看下ZooKeeper客户端是如何接收这个客户端事件通知的：

对于一个来自服务端的响应，客户端都是由 SendThread.readResponse （ByteBuffer incomingBuffer）方法来统一进行处理的，如果响应头replyHdr 中标识了 XID 为-1，表明这是一个通知类型的响应，对其的处理大体上分为以下4个主要步骤。

1.反序列化。

ZooKeeper客户端接到请求后，首先会将字节流转换成WatcherEvent对象。

2.处理chrootPath。

如果客户端设置了chrootPath属性，那么需要对服务端传过来的完整的节点路径进行chrootPath处理，生成客户端的一个相对节点路径。例如客户端设置了 chrootPath 为/app1，那么针对服务端传过来的响应包含的节点路径为/app1/locks，经过chrootPath处理后，就会变成一个相对路径：/locks。关于ZooKeeper的chrootPath，将在7.3.2节中做详细讲解。

3.还原WatchedEvent。

在本节的“回调方法 process（）部分”中提到，process 接口的参数定义是 WatchedEvent，因此这里需要将 WatcherEvent 对象转换成 Watched Event。

4.回调Watcher。

最后将 WatchedEvent 对象交给 EventThread 线程，在下一个轮询周期中进行Watcher回调。

EventThread处理事件通知

在上面内容中我们讲到，服务端的Watcher事件通知，最终交给了EventThread线程来处理，现在我们就来看看EventThread的一些核心逻辑。

EventThread线程是ZooKeeper客户端中专门用来处理服务端通知事件的线程，其数据结构如图7-11所示。

客户端在识别出事件类型 EventType 后，会从相应的 Watcher 存储（即dataWatches、existWatches或childWatches中的一个或多个，本例中就是从dataWatches和existWatches两个存储中获取）中去除对应的Watcher。

注意，此处使用的是remove接口，因此也表明了客户端的Watcher机制同样也是一次性的，即一旦被触发后，该Watcher就失效了。

获取到相关的所有 Watcher 之后，会将其放入 waitingEvents 这个队列中去。

WaitingEvents是一个待处理Watcher的队列，EventThread的run方法会不断对该队列进行处理：

从上面的代码片段中我们可以看出，EventThread线程每次都会从waiting Events队列中取出一个Watcher，并进行串行同步处理。注意，此处processEvent方法中的Watcher才是之前客户端真正注册的Watcher，调用其process方法就可以实现Watcher的回调了。


### Watcher特性总结

到目前为止，相信读者已经了解了 ZooKeeper 中 Watcher 机制的相关接口定义以及Watcher 的各类事件。

同时，我们以 ZooKeeper 节点的数据内容获取接口为例，从ZooKeeper客户端进行Watcher注册、服务端处理Watcher以及客户端回调Watcher三方面分阶段讲解了ZooKeeper的Watcher工作机制。

通过上面内容的讲解，我们不难发现ZooKeeper的Watcher具有以下几个特性。

- 一次性

从上面的介绍中可以看到，无论是服务端还是客户端，一旦一个 Watcher 被触发，ZooKeeper都会将其从相应的存储中移除。

因此，开发人员在Watcher的使用上要记住的一点是需要反复注册。这样的设计有效地减轻了服务端的压力。

试想，如果注册一个Watcher之后一直有效，那么，针对那些更新非常频繁的节点，服务端会不断地向客户端发送事件通知，这无论对于网络还是服务端性能的影响都非常大。

- 客户端串行执行

客户端 Watcher 回调的过程是一个串行同步的过程，这为我们保证了顺序，同时，需要开发人员注意的一点是，千万不要因为一个Watcher的处理逻辑影响了整个客户端的Watcher回调。

- 轻量

WatchedEvent 是 ZooKeeper 整个 Watcher 通知机制的最小通知单元，这个数据结构中只包含三部分内容：通知状态、事件类型和节点路径。

也就是说，Watcher通知非常简单，只会告诉客户端发生了事件，而不会说明事件的具体内容。

例如针对NodeDataChanged事件，ZooKeeper的Watcher只会通知客户端指定数据节点的数据内容发生了变更，而对于原始数据以及变更后的新数据都无法从这个事件中直接获取到，而是需要客户端主动重新去获取数据——这也是ZooKeeper的Watcher机制的一个非常重要的特性。

另外，客户端向服务端注册Watcher的时候，并不会把客户端真实的Watcher对象传递到服务端，仅仅只是在客户端请求中使用boolean类型属性进行了标记，同时服务端也仅仅只是保存了当前连接的ServerCnxn对象。

如此轻量的Watcher机制设计，在网络开销和服务端内存开销上都是非常廉价的。

# ACL——保障数据的安全

从前面的介绍中，我们已经了解到，ZooKeeper 作为一个分布式协调框架，其内部存储的都是一些关乎分布式系统运行时状态的元数据，尤其是一些涉及分布式锁、Master选举和分布式协调等应用场景的数据，会直接影响基于ZooKeeper进行构建的分布式系统的运行状态。

因此，如何有效地保障ZooKeeper中数据的安全，从而避免因误操作而带来的数据随意变更导致的分布式系统异常就显得格外重要了。

所幸的是，ZooKeeper 提供了一套完善的**ACL（Access Control List）权限控制机制来保障数据的安全**。

提到权限控制，我们首先来看看大家都熟悉的、在Unix/Linux文件系统中使用的，也是目前应用最广泛的权限控制方式——UGO（User、Group 和 Others）权限控制机制。

简单地讲，UGO就是针对一个文件或目录，对创建者（User）、创建者所在的组（Group）和其他用户（Other）分别配置不同的权限。

从这里可以看出，UGO 其实是一种粗粒度的文件系统权限控制模式，利用UGO只能对三类用户进行权限控制，即文件的创建者、创建者所在的组以及其他所有用户，很显然，UGO无法解决下面这个场景：

用户U1创建了文件F1，希望U1所在的用户组G1拥有对F1读写和执行的权限，另一个用户组G2拥有读权限，而另外一个用户U3则没有任何权限。

接下去我们来看另外一种典型的权限控制方式：ACL。ACL，即访问控制列表，是一种相对来说比较新颖且更细粒度的权限管理方式，可以针对任意用户和组进行细粒度的权限控制。目前绝大部分 Unix 系统都已经支持了 ACL 方式的权限控制，Linux 也从 2.6版本的内核开始支持这个特性。

## ACL介绍

在5.3.7节中，我们已经讲解了如何使用ZooKeeper的ACL机制来实现对数据节点的权限控制，在本节中，我们将重点来看看ZooKeeper中ACL机制的技术内幕。

ZooKeeper的ACL权限控制和Unix/Linux操作系统中的ACL有一些区别，读者可以从三个方面来理解 ACL 机制，分别是：权限模式（Scheme）、授权对象（ID）和权限（Permission），通常使用“scheme：id：permission”来标识一个有效的ACL信息。

## 权限模式：Scheme

权限模式用来确定权限验证过程中使用的检验策略。

在ZooKeeper中，开发人员使用最多的就是以下四种权限模式。

- IP

IP模式通过IP地址粒度来进行权限控制，例如配置了“ip：192.168.0.110”，即表示权限控制都是针对这个IP地址的。

同时，IP模式也支持按照网段的方式进行配置，例如“ip：192.168.0.1/24”表示针对192.168.0.*这个IP段进行权限控制。

- Digest

Digest是最常用的权限控制模式，也更符合我们对于权限控制的认识，其以类似于“username：password”形式的权限标识来进行权限配置，便于区分不同应用来进行权限控制。

当我们通过“username：password”形式配置了权限标识后，ZooKeeper会对其先后进行两次编码处理，分别是 SHA-1 算法加密和 BASE64 编码，其具体实现由DigestAuthenticationProvider.generateDigest（String idPassword）函数进行封装，清单7-4所示为使用该函数进行“username：password”编码的一个实例。

从上面的运行结果中可以看出，“username：password”最终会被混淆为一个无法辨识的字符串。

- World

World是一种最开放的权限控制模式，从其名字中也可以看出，事实上这种权限控制方式几乎没有任何作用，数据节点的访问权限对所有用户开放，即所有用户都可以在不进行任何权限校验的情况下操作ZooKeeper上的数据。另外，World模式也可以看作是一种特殊的Digest模式，它只有一个权限标识，即“world：anyone”。

- Super

Super模式，顾名思义就是超级用户的意思，也是一种特殊的Digest模式。

在Super模式下，超级用户可以对任意ZooKeeper上的数据节点进行任何操作。关于Super模式的用法，本节后面会进行详细的讲解。

## 授权对象：ID

授权对象指的是权限赋予的用户或一个指定实体，例如 IP 地址或是机器等。

在不同的权限模式下，授权对象是不同的，表7-4中列出了各个权限模式和授权对象之间的对应关系。

## 权限：Permission

权限就是指那些通过权限检查后可以被允许执行的操作。

在ZooKeeper中，所有对数据的操作权限分为以下五大类：

· CREATE（C）：数据节点的创建权限，允许授权对象在该数据节点下创建子节点。

· DELETE（D）：子节点的删除权限，允许授权对象删除该数据节点的子节点。

· READ（R）：数据节点的读取权限，允许授权对象访问该数据节点并读取其数据内容或子节点列表等。

· WRITE（W）：数据节点的更新权限，允许授权对象对该数据节点进行更新操作。

· ADMIN（A）：数据节点的管理权限，允许授权对象对该数据节点进行 ACL 相关的设置操作。

## 权限扩展体系

在上文中，我们已经讲解了 ZooKeeper 默认提供的 IP、Digest、World 和 Super 这四种权限模式，在绝大部分的场景下，这四种权限模式已经能够很好地实现权限控制的目的。

同时，ZooKeeper 提供了特殊的权限控制插件体系，允许开发人员通过指定方式对ZooKeeper 的权限进行扩展。

这些扩展的权限控制方式就像插件一样插入到 ZooKeeper的权限体系中去，因此在ZooKeeper的官方文档中，也称该机制为“Pluggable ZooKeeper Authentication”。

### 实现自定义权限控制器

要实现自定义权限控制器非常简单，ZooKeeper 定义了一个标准权限控制器需要实现的接口：org.apache.zookeeper.server.auth.AuthenticationProvider，其接口定义如清单7-5所示。

用户可以基于该接口来进行自定义权限控制器的实现。事实上，在前面内容中提到的几个权限模式，对应的就是 ZooKeeper 自带的 DigestAuthenticationProvider 和IPAuthenticationProvider两个权限控制器。

### 注册自定义权限控制器

完成自定义权限控制器的开发后，接下去就需要将该权限控制器注册到ZooKeeper服务器中去了。

ZooKeeper 支持通过系统属性和配置文件两种方式来注册自定义的权限控制器。

对于权限控制器的注册，ZooKeeper 采用了延迟加载的策略，即只有在第一次处理包含权限控制的客户端请求时，才会进行权限控制器的初始化。

同时，ZooKeeper 还会将所有的权限控制器都注册到ProviderRegistry中去。

在具体的实现中，ZooKeeper首先会将DigestAuthenticationProvider和IPAuthenticationProvider这两个默认的控制器初始化，然后通过扫描 zookeeper.authProvider.这一系统属性，获取到所有用户配置的自定义权限控制器，并完成其初始化。

## ACL管理

讲解完ZooKeeper的ACL及其扩展机制后，我们来看看如何进行ACL管理。

### 设置ACL

通过zkCli脚本登录ZooKeeper服务器后，可以通过两种方式进行ACL的设置。

一种是在数据节点创建的同时进行ACL权限的设置，命令格式如下：

另一种方式则是使用setAcl命令单独对已经存在的数据节点进行ACL设置：

### Super模式的用法

根据ACL权限控制的原理，一旦对一个数据节点设置了ACL权限控制，那么其他没有被授权的ZooKeeper客户端将无法访问该数据节点，这的确很好地保证了ZooKeeper的数据安全。

但同时，ACL权限控制也给ZooKeeper的运维人员带来了一个困扰：如果一个持久数据节点包含了 ACL 权限控制，而其创建者客户端已经退出或已不再使用，那么这些数据节点该如何清理呢？

这个时候，就需要在 ACL 的 Super 模式下，使用超级管理员权限来进行处理了。

要使用超级管理员权限，首先需要在ZooKeeper服务器上开启Super模式，方法是在ZooKeeper服务器启动的时候，添加如下系统属性：

从上面的输出结果中，我们可以看出，由于“foo：zk-book”是一个超级管理员账户，因此能够针对一个受权限控制的数据节点zk-book随意进行操作，但是对于“foo：false”这个普通用户，就无法通过权限校验了。

# 参考资料

分布式一致性原理与实践

* any list
{:toc}
