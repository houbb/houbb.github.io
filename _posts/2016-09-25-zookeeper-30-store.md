---
layout: post
title: ZooKeeper-30-ZooKeeper 原理之数据与存储
date:  2016-09-25 12:21:05 +0800
categories: [Apache]
tags: [zookeeper, config-center]
published: true
---


# 数据与存储

至此，我们已经知道了整个ZooKeeper客户端和服务端的一些工作原理，下面我们来看看 ZooKeeper 最底层数据与存储的技术内幕。

在 ZooKeeper 中，数据存储分为两部分：内存数据存储与磁盘数据存储。

# 内存数据

在 7.1.1 节中，我们已经提到，ZooKeeper 的数据模型是一棵树，而从使用角度看，ZooKeeper 就像一个内存数据库一样。

在这个内存数据库中，存储了整棵树的内容，包括所有的节点路径、节点数据及其ACL信息等，ZooKeeper会定时将这个数据存储到磁盘上。

接下来我们就一起来看看这棵“树”的数据结构，如图7-43所示。

## DataTree

DateTree是ZooKeeper内存数据存储的核心，是一个“树”的数据结构，代表了内存中的一份完整的数据。

DataTree不包含任何与网络、客户端连接以及请求处理等相关的业务逻辑，是一个非常独立的ZooKeeper组件。

## DataNode

DataNode 是数据存储的最小单元，其数据结构如图 7-43 所示。DataNode 内部除了保存了节点的数据内容（data[]）、ACL 列表（acl）和节点状态（stat）之外，正如最基本的数据结构中对树的描述，还记录了父节点（parent）的引用和子节点列表（children）两个属性。同时，DataNode还提供了对子节点列表操作的各个接口：

```java
boolean addChild(String child);

boolean removeChild(String child);

boolean setChildren(HashSet<String> child);

HashSet<String> getChildren();
```

## nodes

DataTree 用于存储所有 ZooKeeper 节点的路径、数据内容及其 ACL 信息等，底层的数据结构其实是一个典型的ConcurrentHashMap键值对结构：

```java
private final ConcurrentHashMap<String, DataNode> nodes = new ConcurrentHashMap<String, DataNode>();
```

在 nodes 这个 Map 中，存放了 ZooKeeper 服务器上所有的数据节点，可以说，对于ZooKeeper 数据的所有操作，底层都是对这个 Map 结构的操作。nodes 以数据节点的路径（path）为key，value则是节点的数据内容：DataNode。

另外，对于所有的临时节点，为了便于实时访问和及时清理，DataTree中还单独将临时节点保存起来：

```java
private final Map<Long, HashSet<String>> ephemerals = new ConcurrentHashMap<Long, HashSet<String>>();
```

## ZKDatabase

ZKDatabase，正如其名字一样，是ZooKeeper的内存数据库，负责管理ZooKeeper的所有会话、DataTree 存储和事务日志。

ZKDatabase 会定时向磁盘 dump 快照数据，同时在ZooKeeper服务器启动的时候，会通过磁盘上的事务日志和快照数据文件恢复成一个完整的内存数据库。

# 事务日志

在本书前面章节的内容中，我们已经多次提到了ZooKeeper的事务日志。

在本节中，我们将从事务日志的存储、日志格式和日志写入过程几个方面，来深入讲解ZooKeeper底层实现数据一致性过程中最重要的一部分。

## 文件存储

在5.1.2节中，我们提到在部署ZooKeeper集群的时候需要配置一个目录：dataDir。

这个目录是ZooKeeper中默认用于存储事务日志文件的，其实在ZooKeeper中可以为事务日志单独分配一个文件存储目录：dataLogDir。

如果我们确定dataLogDir为/home/admin/zkData/zk_log，那么ZooKeeper在运行过程中会在该目录下建立一个名字为version-2的子目录，关于这个目录，我们在下面的“日志格式”部分会再次讲解，这里只是简单提下：该目录确定了当前ZooKeeper使用的事务日志格式版本号。

也就是说，等到下次某个ZooKeeper版本对事务日志格式进行变更时，这个目录也会有所变更。

运行一段时间后，我们可以发现在/home/admin/zkData/zk_log/version-2目录下会生成类似下面这样的文件：

![文件存储](https://img-blog.csdnimg.cn/b6f08c5e865b4ab0a13be8b570fb46de.png)

这些文件就是ZooKeeper的事务日志了。不难发现，这些文件都具有以下两个特点。

· 文件大小都出奇地一致：这些文件的文件大小都是67108880KB，即64MB。

· 文件名后缀非常有规律，都是一个十六进制数字，同时随着文件修改时间的推移，这个十六进制后缀变大。

关于这个事务日志文件名的后缀，这里需要再补充一点的是，该后缀其实是一个事务ID：ZXID，并且是写入该事务日志文件第一条事务记录的ZXID。

使用ZXID作为文件后缀，可以帮助我们迅速定位到某一个事务操作所在的事务日志。同时，使用ZXID作为事务日志后缀的另一个优势是，ZXID 本身由两部分组成，高 32 位代表当前 Leader 周期（epoch），低32位则是真正的操作序列号。

因此，将ZXID作为文件后缀，我们就可以清楚地看出当前运行时ZooKeeper的Leader周期。例如上述4个事务日志，前两个文件的epoch是44（十六进制2c对应十进制44），而后面两个文件的epoch则是45。
日志格式

下面我们再来看看这个事务日志里面到底有些什么内容。为此，我们首先部署一个全新的ZooKeeper服务器，配置相关的事务日志存储目录，启动之后，进行如下一系列操作。1.创建/test_log节点，初始值为“v1”。

2.更新/test_log节点的数据为“v2”。

3.创建/test_log/c节点，初始值为“v1”。

4.删除/test_log/c节点。

经过如上四步操作后，在ZooKeeper事务日志存储目录中就可以看到产生了一个事务日志，使用二进制编辑器将这个文件打开后，就可以看到类似于如图 7-44 所示的文件内容——这就是序列化之后的事务日志了。

对于这个事务日志，我们无法直接通过肉眼识别出其究竟包含了哪些事务操作，但可以发现的一点是，该事务日志中除前面有一些有效的文件内容外，文件后面的绝大部分都被“0”（\0）填充。

这个空字符填充和ZooKeeper中事务日志在磁盘上的空间预分配有关，在“日志写入”部分会重点讲解ZooKeeper事务日志文件的磁盘空间预分配策略。

在图7-44中我们已经大体上看到了ZooKeeper事务日志的模样。显然，在图7-44中，除了一些节点路径我们可以隐约地分辨出来之外，就基本上无法看明白其他内容信息了。那么我们不禁要问，是否有一种方式，可以把这些事务日志转换成正常日志文件，以便让开发与运维人员能够清楚地看明白ZooKeeper的事务操作呢？答案是肯定的。

ZooKeeper 提供了一套简易的事务日志格式化工具 org.apache.zookeeper.Server.

LogFormatter，用于将这个默认的事务日志文件转换成可视化的事务操作日志，使用方法如下：

```
java LogFormatter 事务日志文件
```

在图 7-45 中，我们可以发现，所有的事务操作都被可视化显示出来了，并且每一行都对应了一次事务操作，我们列举几行事务操作日志来分析下这个文件。

第一行：

这一行是事务日志的文件头信息，这里输出的主要是事务日志的DBID和日志格式版本号。

第二行：

这一行就是一次客户端会话创建的事务操作日志，其中我们不难看出，从左向右分别记录了事务操作时间、客户端会话 ID、CXID（客户端的操作序列号）、ZXID、操作类型和会话超时时间。

第三行（图中用“...”代替了“0x144699552020000”）：

这一行是节点创建操作的事务操作日志，从左向右分别记录了事务操作时间、客户端会话 ID、CXID、ZXID、操作类型、节点路径、节点数据内容（＃7631，在上文中我们提到该节点创建时的初始值是v1。在LogFormatter中使用如下格式输出节点内容：＃+内容的ASCII码值）、节点的ACL信息、是否是临时节点（F代表持久节点，T代表临时节点）和父节点的子节点版本号。

其他几行事务日志的内容和以上两个示例说明基本上类似，这里就不再赘述，读者可以对照ZooKeeper的源代码（类org.apache.zookeeper.server.LogFormatter）自行分析。

通过可视化这个文件，我们还注意到一点，由于这是一个记录事务操作的日志文件，因此里面没有任何读操作的日志记录。


## 日志写入

FileTxnLog负责维护事务日志对外的接口，包括事务日志的写入和读取等，首先来看日志的写入。将事务操作写入事务日志的工作主要由append方法来负责：

从方法定义中我们可以看到，ZooKeeper 在进行事务日志写入的过程中，会将事务头和事务体传给该方法。事务日志的写入过程大体可以分为如下6个步骤。

1.确定是否有事务日志可写。

当 ZooKeeper 服务器启动完成需要进行第一次事务日志的写入，或是上一个事务日志写满的时候，都会处于与事务日志文件断开的状态，即 ZooKeeper 服务器没有和任意一个日志文件相关联。因此，

在进行事务日志写入前，ZooKeeper 首先会判断FileTxnLog组件是否已经关联上一个可写的事务日志文件。如果没有关联上事务日志文件，那么就会使用与该事务操作关联的 ZXID 作为后缀创建一个事务日志文件，同时构建事务日志文件头信息（包含魔数magic、事务日志格式版本 version 和 dbid），并立即写入这个事务日志文件中去。同时，将该文件的文件流放入一个集合：streamsToFlush。streamsToFlush集合是ZooKeeper用来记录当前需要强制进行数据落盘（将数据强制刷入磁盘上）的文件流，在后续的步骤6中会使用到。

2.确定事务日志文件是否需要扩容（预分配）。

在前面“文件存储”部分我们已经提到，ZooKeeper 的事务日志文件会采取“磁盘空间预分配”的策略。当检测到当前事务日志文件剩余空间不足4096字节（4KB）时，就会开始进行文件空间扩容。文件空间扩容的过程其实非常简单，就是在现有文件大小的基础上，将文件大小增加 65536KB（64MB），然后使用“0”（\0）填充这些被扩容的文件空间。因此在图7-44所示的事务日志文件中，我们会看到文件后半部分都被“0”填充了。

那么 ZooKeeper 为什么要进行事务日志文件的磁盘空间预分配呢？

在前面的章节中我们已经提到，对于客户端的每一次事务操作，ZooKeeper 都会将其写入事务日志文件中。因此，事务日志的写入性能直接决定了 ZooKeeper 服务器对事务请求的响应，也就是说，事务写入近似可以被看作是一个磁盘 I/O 的过程。严格地讲，文件的不断追加写入操作会触发底层磁盘 I/O 为文件开辟新的磁盘块，即磁盘Seek。

因此，为了避免磁盘Seek的频率，提高磁盘I/O的效率，ZooKeeper在创建事务日志的时候就会进行文件空间“预分配”——在文件创建之初就向操作系统预分配一个很大的磁盘块，默认是64MB，而一旦已分配的文件空间不足4KB时，那么将会再次“预分配”，以避免随着每次事务的写入过程中文件大小增长带来的Seek开销，直至创建新的事务日志。

事务日志“预分配”的大小可以通过系统属性zookeeper.preAllocSize来进行设置。

3.事务序列化

事务序列化包括对事务头和事务体的序列化，分别是对TxnHeader（事务头）和Record （事务体）的序列化。

其中事务体又可分为会话创建事务（CreateSessionTxn）、节点创建事务（CreateTxn）、节点删除事务（DeleteTxn）和节点数据更新事务（SetDataTxn）等。

序列化过程和 7.2 节中提到的序列化原理是一致的，最终生成一个

字节数组，这里不再赘述。

4.生成Checksum。

为了保证事务日志文件的完整性和数据的准确性，ZooKeeper 在将事务日志写入文件前，会根据步骤3中序列化产生的字节数组来计算Checksum。ZooKeeper默认使用Adler32算法来计算Checksum值。

5.写入事务日志文件流。

将序列化后的事务头、事务体及 Checksum 值写入到文件流中去。此时由于ZooKeeper 使用的是 BufferedOutputStream，因此写入的数据并非真正被写入到磁盘文件上。

6.事务日志刷入磁盘。

在步骤 5 中，已经将事务操作写入文件流中，但是由于缓存的原因，无法实时地写入磁盘文件中，因此我们需要将缓存数据强制刷入磁盘。在步骤 1 中我们已经将每个事务日志文件对应的文件流放入了 streamsToFlush，因此这里会从streamsToFlush 中提取出文件流，并调用 FileChannel.force（boolean metaData）接口来强制将数据刷入磁盘文件中去。force接口对应的其实是底层的fsync接口，是一个比较耗费磁盘I/O资源的接口，因此ZooKeeper允许用户

控制是否需要主动调用该接口，可以通过系统属性 zookeeper.forceSync 来设置。

## 日志截断

在ZooKeeper运行过程中，可能会出现这样的情况，非Leader机器上记录的事务ID（我们将其称为peerLastZxid）比Leader服务器大，无论这个情况是如何发生的，都是一个非法的运行时状态。同时，ZooKeeper遵循一个原则：只要集群中存在Leader，那么所有机器都必须与该Leader的数据保持同步。

因此，一旦某台机器碰到上述情况，Leader 会发送 TRUNC 命令给这个机器，要求其进行日志截断。Learner服务器在接收到该命令后，就会删除所有包含或大于peerLastZxid的事务日志文件。

# 7.9.3 snapshot——数据快照

数据快照是ZooKeeper数据存储中另一个非常核心的运行机制。

顾名思义，数据快照用来记录ZooKeeper服务器上某一个时刻的全量内存数据内容，并将其写入到指定的磁盘文件中。

## 文件存储

和事务日志类似，ZooKeeper 的快照数据也使用特定的磁盘目录进行存储，读者也可以通过dataDir属性进行配置。

假定我们确定 dataDir 为/home/admin/zkData/zk_data，那么 ZooKeeper 在运行过程中会在该目录下建立一个名为version-2的目录，该目录确定了当前ZooKeeper使用的快照数据格式版本号。

运行一段时间后，我们可以发现在/home/admin/zkData/zk_data/version-2

和事务日志文件的命名规则一致，快照数据文件也是使用ZXID的十六进制表示来作为文件名后缀，该后缀标识了本次数据快照开始时刻的服务器最新 ZXID。

这个十六进制的文件后缀非常重要，在数据恢复阶段，ZooKeeper 会根据该 ZXID 来确定数据恢复的起始点。

和事务日志文件不同的是，ZooKeeper 的快照数据文件没有采用“预分配”机制，因此不会像事务日志文件那样内容中可能包含大量的“0”。每个快照数据文件中的所有内容都是有效的，因此该文件的大小在一定程度上能够反映当前ZooKeeper内存中全量数据的大小。

## 存储格式

现在我们来看快照数据文件的内容。和 7.9.2 节的“日志格式”部分讲解的一样，也部署一个全新的ZooKeeper服务器，并进行一系列简单的操作，这个时候就会生成相应的快照数据文件，使用二进制编辑器将这个文件打开后，文件内容大体如7-46所示。

图7-46.快照数据内容初探

图7-46就是一个典型的数据快照文件内容，可以看出，ZooKeeper的数据快照文件同样让人无法看明白究竟文件内容是什么。所幸ZooKeeper也提供了一套简易的快照数据格式化工具org.apache.zookeeper.server.SnapshotFormatter，用于将这个默认的快照数据文件转换成可视化的数据内容，使用方法如下：

```
java SnapshotFormatter 快照数据文件
```

从图 7-47 中我们可以看到，之前的二进制形式的文件内容已经被格式化输出了：SnapshotFormatter 会将 ZooKeeper 上的数据节点逐个依次输出，但是需要注意的一点是，这里输出的仅仅是每个数

据节点的元信息，并没有输出每个节点的数据内容，但这已经对运维非常有帮助了。

## 数据快照

FileSnap负责维护快照数据对外的接口，包括快照数据的写入和读取等。我们首先来看数据的写入过程——将内存数据库写入快照数据文件中其实是一个序列化过程。

在7.9.2节中，我们已经提到，针对客户端的每一次事务操作，ZooKeeper都会将它们记录到事务日志中，当然，ZooKeeper 同时也会将数据变更应用到内存数据库中。

另外，ZooKeeper会在进行若干次事务日志记录之后，将内存数据库的全量数据Dump到本地文件中，这个过程就是数据快照。

可以使用snapCount参数来配置每次数据快照之间的事务操作次数，即 ZooKeeper 会在 snapCount 次事务日志记录后进行一个数据快照。关于snapCount参数更为详细的介绍，请看8.1节中关于ZooKeeper参数的配置。下面我们重点来看数据快照的过程。

1.确定是否需要进行数据快照。

每进行一次事务日志记录之后，ZooKeeper都会检测当前是否需要进

行数据快照。理论上进行 snapCount 次事务操作后就会开始数据快照，但是考虑到数据快照对于ZooKeeper所在机器的整体性能的影响，需要尽量避免ZooKeeper集群中的所有机器在同一时刻进行数据快照。因此 ZooKeeper 在具体的实现中，并不是严格地按照这个策略执行的，而是采取“过半随机”策略，即符合如下条件就进行数据快照：

```
logCount > (snapCount / 2 + randRoll)
```

其中 logCount 代表了当前已经记录的事务日志数量，randRoll 为 1～snapCount/2之间的随机数，因此上面的条件就相当于：如果我们配置的 snapCount 值为默认的100000，那么ZooKeeper会在50000～100000 次事务日志记录后进行一次数据快照。

2.切换事务日志文件。
满足上述条件之后，ZooKeeper就要开始进行数据快照了。首先是进行事务日志文件的切换。所谓的事务日志文件切换是指当前的事务日志已经“写满”（已经写入了snapCount个事务日志），需要重新创建一个新的事务日志。

3.创建数据快照异步线程。

为了保证数据快照过程不影响 ZooKeeper 的主流程，这里需要创建一个单独的异步线程来进行数据快照。

4.获取全量数据和会话信息。

数据快照本质上就是将内存中的所有数据节点信息（DataTree）和会话信息保存到本地磁盘中去。因此这里会先从 ZKDatabase 中获取到 DataTree 和会话信息。

5.生成快照数据文件名。

在“文件存储”部分，我们已经提到快照数据文件名的命名规则。在这一步中，ZooKeeper会根据当前已提交的最大ZXID来生成数据快照文件名。

6.数据序列化。

接下来就开始真正的数据序列化了。在序列化时，首先会序列化文件头信息，这里的文件头和事务日志中的一致，同样也包含了魔数、版本号和dbid信息。

然后再对会话信息和 DataTree 分别进行序列化，同时生成一个 Checksum，一并写入快照数据文件中去。

# 7.9.4 初始化

在ZooKeeper服务器启动期间，首先会进行数据初始化工作，用于将存储在磁盘上的数据文件加载到ZooKeeper服务器内存中。

## 初始化流程

首先我们先从整体上来看 ZooKeeper 的数据初始化过程，图 7-48 展示了数据的初始化流程。

![初始化流程](https://img-blog.csdnimg.cn/eb067718338b4987960015d4013da6c4.png)

图7-48.服务器启动期数据初始化流程

数据的初始化工作，其实就是从磁盘中加载数据的过程，主要包括了从快照文件中加载快照数据和根据事务日志进行数据订正两个过程。

1.初始化FileTxnSnapLog。

FileTxnSnapLog是ZooKeeper事务日志和快照数据访问层，用于衔接上层业务与底层数据存储。底层数据包含了事务日志和快照数据两部分，因此 FileTxnSnapLog内部又分为FileTxnLog和FileSnap的初始化，分别代表事务日志管理器和快照数据管理器的初始化。

2.初始化ZKDatabase。

完成FileTxnSnapLog 的初始化后，我们就完成了ZooKeeper 服务器和底层数据存储的对接，接下来就要开始构建内存数据库ZKDatabase了。在初始化过程中，首先会构建一个初始化的DataTree，同时会将步骤1中初始化的FileTxnSnapLog交给ZKDatabase，以便内存数据库能够对事务日志和快照数据进行访问。

DataTree 是 ZooKeeper 内存数据的核心模型，简而言之就是一棵树，保存了ZooKeeper 上的所有节点信息，在每个 ZooKeeper 服务器内部都是单例。在ZKDatabase初始化的时候，DataTree也会进行相应的初始化工作——创建一些ZooKeeper的默认节点，包括/、/zookeeper和/zookeeper/quota三个节点的创建。
除了ZooKeeper的数据节点，在ZKDatabase的初始化阶段还会创建一个用于保存所有客户端会话超时时间的记录器：sessionsWithTimeouts——我们称之为“会话超时时间记录器”。

3.创建PlayBackListener监听器。
PlayBackListener 监听器主要用来接收事务应用过程中的回调。在后面读者会看到，在ZooKeeper数据恢复后期，会有一个事务订正的过程，在这个过程中，会回调PlayBackListener监听器来进行对应的数据订正。

4.处理快照文件。
完成内存数据库的初始化之后，ZooKeeper 就可以开始从磁盘中恢复数据了。在上文中我们已经提到，每一个快照数据文件中都保存了 ZooKeeper 服务器近似全量的数据，因此首先从这些快照文件开始加载。

5.获取最新的100个快照文件。

一般在 ZooKeeper 服务器运行一段时间之后，磁盘上都会保留许多个快照文件。另外由于每次数据快照过程中，ZooKeeper 都会将全量数据 Dump 到磁盘快照文件中，因此往往更新时间最晚的那个文件包含了最新的全量数据。那么是否我们只需要这个最新的快照文件就可以了呢？在 ZooKeeper 的实现中，会获取最新的至多100个快照文件（如果磁盘上仅存在不到100个快照文件，那么就获取所有这些快照文件）。关于这里为什么会获取至多100个文件，在接下去的步骤中会讲到。

6.解析快照文件
获取到这至多 100 个文件之后，ZooKeeper 会开始“逐个”进行解析。每个快照文件都是内存数据序列化到磁盘的二进制文件，因此在这里需要对其进行反序列化，生成 DataTree 对象和 sessionsWithTimeouts 集合。同时在这个过程中，还会进行文件的checkSum校验以确定快照文件的正确性。
需要注意的一点是，虽然在步骤5中获取到的是100个快照文件，但其实在这里的“逐个”解析过程中，如果正确性校验通过的话，那么通常只会解析最新的那个快照文件。换句话说，只有当最新的快照文件不可用的时候，才会逐个进行解析，直到将这100个文件全部解析完。如果将步骤4中获取的所有快照文件都解析完后还是无法成功恢复一个完整的 DataTree 和 sessionsWithTimeouts，则认为无法从磁盘中加载数据，服务器启动失败。

7.获取最新的ZXID。
完成步骤6的操作之后，就已经基于快照文件构建了一个完整的DataTree实例和sessionsWithTimeouts集合了。此时根据这个快照文件的文件名就可以解析出一个最新的ZXID：zxid_for_snap，该ZXID代表了ZooKeeper开始进行数据快照的时刻。

8.处理事务日志。
在经过前面7步流程的处理后，此时ZooKeeper服务器内存中已经有了一份近似全量的数据了，现在开始就要通过事务日志来更新增量数据了。

9.获取所有zxid_for_snap之后提交的事务。

到这里，我们已经获取到了快照数据的最新ZXID。在7.9.3节中我们曾经提到，ZooKeeper 中数据的快照机制决定了快照文件中并非包含了所有的事务操作。但是未被包含在快照文件中的那部分事务操作是可以通过数据订正来实现的。因此这里我们只需要从事务日志中获取所有ZXID比步骤7中得到的zxid_for_snap大的事务操作。

10.事务应用。
获取到所有ZXID大于zxid_for_snap的事务后，将其逐个应用到之前基于快照数据文件恢复出来的DataTree和sessionsWithTimeouts中去。
在事务应用的过程中，还有一个细节需要我们注意，每当有一个事务被应用到内存数据库中去后，ZooKeeper 同时会回调 PlayBackListener 监听器，将这一事务操作记录转换成Proposal，并保存到ZKDatabase.committedLog中，以便Follower进行快速同步。

11.获取最新ZXID。

待所有的事务都被完整地应用到内存数据库中之后，基本上也就完成了数据的初始化过程，此时再次获取一个ZXID，用来标识上次服务器正常运行时提交的最大事务ID。

12.校验epoch
epoch 是 ZooKeeper 中一个非常特别的变量，其字面意思是“纪元、时代”，在ZooKeeper中，epoch标识了当前Leader周期。每次选举产生一个新的Leader服务器之后，就会生成一个新的epoch。

在运行期间集群中机器相互通信的过程中，都会带上这个epoch以确保彼此在同一个Leader周期内。

在完成数据加载后，ZooKeeper会从步骤11中确定的ZXID中解析出事务处理的Leader周期：epochOfZxid。同时也会从磁盘的currentEpoch和acceptedEpoch文件中读取出上次记录的最新的epoch值，进行校验。

通过以上流程的讲解，相信读者已经对ZooKeeper服务器启动期的数据初始化过程有了一个大体的认识，接下去将进一步从技术细节上展开，来对数据初始化过程做更深入的讲解。
PlayBackListener
PlayBackListener是一个事务应用监听器，用于在事务应用过程中的回调：每当成功将一条事务日志应用到内存数据库中后，就会调用这个监听器。

其接口定义非常简单，只有一个方法：

```java
void onTxnLoad(TxnHeader hdr, Record rec);
```

用于对单条事务进行处理。在完成步骤2 ZKDatabase的初始化后，ZooKeeper会立即创建一个PlayBackListener监听器，并将其置于FileTxnSnapLog中。

在之后的步骤10事务应用过程中，会逐条回调该接口进行事务的二次处理。

PlayBackListener会将这些刚刚被应用到内存数据库中的事务转存到ZKDatabase.committedLog 中，以便集群中服务器间进行快速的数据同步。关于 ZooKeeper 服务器之间的数据同步，将在7.9.5节中做详细讲解。

# 7.9.5 数据同步

在 7.5.2 节中，我们在讲解 ZooKeeper 集群服务器启动的过程中提到，整个集群完成Leader选举之后，Learner会向Leader服务器进行注册。

当Learner服务器向Leader完成注册后，就进入数据同步环节。

简单地讲，数据同步过程就是Leader服务器将那些没有在Learner服务器上提交过的事务请求同步给Learner服务器，大体过程如图7-49所示。

![数据同步](https://img-blog.csdnimg.cn/4d0575f24a9c419c9cbbe272532d3623.png)

图7-49.数据同步流程

## 获取Learner状态

在注册Learner的最后阶段，Learner服务器会发送给Leader服务器一个ACKEPOCH数据包，Leader会从这个数据包中解析出该Learner的currentEpoch和lastZxid。

## 数据同步初始化

在开始数据同步之前，Leader服务器会进行数据同步初始化，首先会从ZooKeeper的内存数据库中提取出事务请求对应的提议缓存队列（下面我们用“提议缓存队列”来指代该队列）：proposals，同时完成对以下三个ZXID值的初始化。

· peerLastZxid：该Learner服务器最后处理的ZXID。

· minCommittedLog：Leader服务器提议缓存队列committedLog中的最小ZXID。

· maxCommittedLog：Leader服务器提议缓存队列committedLog中的最大ZXID。

ZooKeeper 集群数据同步通常分为四类，分别是直接差异化同步（DIFF 同步）、先回滚再差异化同步（TRUNC+DIFF同步）、仅回滚同步（TRUNC同步）和全量同步（SNAP同步）。在初始化阶段，Leader 服务器会优先初始化以全量同步方式来同步数据——当然，这并非最终的数据同步方式，在以下步骤中，会根据Leader和Learner服务器之间的数据差异情况来决定最终的数据同步方式。
直接差异化同步（DIFF同步）

场景：peerLastZxid介于minCommittedLog和maxCommittedLog之间。

对于这种场景，就使用直接差异化同步（DIFF 同步）方式即可。Leader 服务器会首先向这个Learner发送一个DIFF指令，用于通知Learner“进入差异化数据同步阶段，Leader服务器即将把一些Proposal同步给自己”。在实际Proposal同步过程中，针对每个Proposal，Leader 服务器都会通过发送两个数据包来完成，分别是 PROPOSAL 内容数据包和COMMIT指令数据包——这和ZooKeeper运行时Leader和Follower之间的事务请求的提交过程是一致的。

举个例子来说，假如某个时刻Leader服务器的提议缓存队列对应的ZXID依次是：

而 Learner 服务器最后处理的 ZXID 为 0x500000003，于是 Leader 服务器就会依次将0x500000004和 0x500000005两个提议同步给Learner服务器，同步过程中的数据包发送顺序如表7-16所示。
表7-16.直接差异化同步过程中PROPOSAL和COMMIT消息发送顺序

通过以上四个数据包的发送，Learner服务器就可以接收到自己和 Leader服务器的所有差异数据。

Leader 服务器在发送完差异数据之后，就会将该 Learner 加入到forwardingFollowers或observingLearners队列中，这两个队列在ZooKeeper运行期间的事务请求处理过程中都会使用到。

随后 Leader 还会立即发送一个NEWLEADER指令，用于通知Learner，已经将提议缓存队列中的Proposal都同步给自己了。

下面我们再来看 Learner 对 Leader 发送过来的数据包的处理。

根据上面讲解的 Leader服务器的数据包发送顺序，Learner会首先接收到一个DIFF指令，于是便确定了接下来进入 DIFF 同步阶段。然后依次收到表 7-16 中的四个数据包，Learner 会依次将其应用到内存数据库中。紧接着，Learner 还会接收到来自 Leader 的 NEWLEADER 指令，此时 Learner 就会反馈给 Leader一个 ACK 消息，表明自己也确实完成了对提议缓存队列中Proposal的同步。

Leader在接收到来自Learner的这个ACK消息以后，就认为当前Learner已经完成了数据同步，同时进入“过半策略”等待阶段——Leader 会和其他 Learner 服务器进行上述同样的数据同步流程，直到集群中有过半的Learner机器响应了Leader这个ACK消息。一旦满足“过半策略”后，Leader服务器就会向所有已经完成数据同步的 Learner发送一个UPTODATE指令，用来通知Learner已经完成了数据同步，同时集群中已经有过半机器完成了数据同步，集群已经具备了对外服务的能力了。

Learner在接收到这个来自Leader的UPTODATE指令后，会终止数据同步流程，然后向Leader再次反馈一个ACK消息。

整个直接差异化同步过程中涉及的Leader和Learner之间的数据包通信如图7-50所示。

![7-50](https://img-blog.csdnimg.cn/a1f9b2b68b324b6b9da49b58074cbd3f.png)

图7-50.直接差异化同步方式中Leader和Learner之间的数据通信

## 先回滚再差异化同步（TRUNC+DIFF同步）

场景：针对上面的场景，我们已经介绍了直接差异化同步的详细过程。但是在这种场景中，会有一个罕见但是确实存在的特殊场景：设有 A、B、C 三台机器，假如某一时刻B是Leader服务器，此时的Leader_Epoch为5，同时当前已经被集群中绝大部分机器都提交的 ZXID 包括：0x500000001 和 0x500000002。此时，Leader 正要处理 ZXID：0x500000003，并且已经将该事务写入到了 Leader本地的事务日志中去——就在 Leader恰好要将该 Proposal 发送给其他 Follower 机器进行投票的时候，Leader 服务器挂了，Proposal没有被同步出去。此时ZooKeeper集群会进行新一轮的Leader选举，假设此次选举产生的新的Leader是A，同时Leader_Epoch变更为6，之后A和C两台服务器继续对外进行服务，又提交了0x600000001和0x600000002两个事务。此时，服务器B再次启动，并开始数据同步。

简单地讲，上面这个场景就是Leader服务器在已经将事务记录到了本地事务日志中，但是没有成功发起Proposal流程的时候就挂了。在这个特殊场景中，我们看到，peerLastZxid、minCommittedLog 和 maxCommittedLog 的值分别是 0x500000003、0x500000001 和0x600000002，显然，peerLastZxid介于minCommittedLog和maxCommittedLog之间。

对于这个特殊场景，就使用先回滚再差异化同步（TRUNC+DIFF同步）的方式。当Leader服务器发现某个Learner包含了一条自己没有的事务记录，那么就需要让该Learner进行事务回滚——回滚到Leader服务器上存在的，同时也是最接近于peerLastZxid的ZXID。

在上面这个例子中，Leader会需要Learner回滚到ZXID为0x500000002的事务记录。

先回滚再差异化同步的数据同步方式在具体实现上和差异化同步是一样的，都是会将差异化的Proposal发送给Learner。

同步过程中的数据包发送顺序如表7-17所示。

## 仅回滚同步（TRUNC同步）

场景：peerLastZxid大于maxCommittedLog。

这种场景其实就是上述先回滚再差异化同步的简化模式，Leader会要求 Learner回滚到ZXID值为maxCommitedLog对应的事务操作，这里不再对该过程详细展开讲解。

## 全量同步（SNAP同步）

场景1：peerLastZxid小于minCommittedLog。

场景 2：Leader 服务器上没有提议缓存队列，peerLastZxid 不等于 lastProcessedZxid （Leader服务器数据恢复后得到的最大ZXID）。

上述这两个场景非常类似，在这两种场景下，Leader服务器都无法直接使用提议缓存队列和Learner进行数据同步，因此只能进行全量同步（SNAP同步）。
所谓全量同步就是Leader服务器将本机上的全量内存数据都同步给Learner。Leader服务器首先向Learner发送一个SNAP指令，通知Learner即将进行全量数据同步。随后，Leader会从内存数据库中获取到全量的数据节点和会话超时时间记录器，将它们序列化后传输给Learner。Learner服务器接收到该全量数据后，会对其反序列化后载入到内存数据库中。
以上就是ZooKeeper集群间机器的数据同步流程了。整个数据同步流程的代码实现主要在 LearnerHandler 和 Learner 两个类中，读者可以自行进行更为深入、详细的了解。

# 小结

ZooKeeper以树作为其内存数据模型，树上的每一个节点是最小的数据单元，即ZNode。ZNode具有不同的节点特性，同时每个节点都具有一个递增的版本号，以此可以实现分布式数据的原子性更新。

ZooKeeper 的序列化层使用从 Hadoop 中遗留下来的 Jute 组件，该组件并不是性能最好的序列化框架，但是在ZooKeeper中已经够用。

ZooKeeper 的客户端和服务端之间会建立起 TCP 长连接来进行网络通信，基于该 TCP连接衍生出来的会话概念，是客户端和服务端之间所有请求与响应交互的基石。在会话的生命周期中，会出现连接断开、重连或是会话失效等一系列问题，这些都是ZooKeeper的会话管理器需要处理的问题——Leader服务器会负责管理每个会话的生命周期，包括会话的创建、心跳检测和销毁等。

在服务器启动阶段，会进行磁盘数据的恢复，完成数据恢复后就会进行Leader选举。一旦选举产生 Leader 服务器后，就立即开始进行集群间的数据同步——在整个过程中，ZooKeeper都处于不可用状态，直到数据同步完毕（集群中绝大部分机器数据和Leader一致），ZooKeeper 才可以对外提供正常服务。

在运行期间，如果 Leader 服务器所在的机器挂掉或是和集群中绝大部分服务器断开连接，那么就会触发新一轮的Leader选举。同样，在新的Leader服务器选举产生之前，ZooKeeper无法对外提供服务。
一个正常运行的ZooKeeper集群，其机器角色通常由Leader、Follower和Observer组成。ZooKeeper对于客户端请求的处理，严格按照ZAB协议规范来进行。

每一个服务器在启动初始化阶段都会组装一个请求处理链，Leader服务器能够处理所有类型的客户端请求，而对于 Follower 或是 Observer 服务器来说，可以正常处理非事务请求，而事务请求则需要转发给 Leader 服务器来处理，同时，对于每个事务请求，Leader 都会为其分配一个全局唯一且递增的ZXID，以此来保证事务处理的顺序性。在事务请求的处理过程中，Leader和Follower服务器都会进行事务日志的记录。

ZooKeeper通过JDK的File接口简单地实现了自己的数据存储系统，其底层数据存储包括事务日志和快照数据两部分，这些都是ZooKeeper实现数据一致性非常关键的部分。

# 参考资料

分布式一致性原理与实践

* any list
{:toc}