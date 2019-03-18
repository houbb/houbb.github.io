---
layout: post
title:  LevelDB-04-SSTable
date:  2018-09-07 07:44:19 +0800
categories: [Cache]
tags: [cache, google, middleware, in-memory cache, sh]
published: true
---

# SSTable文件

SSTable是Bigtable中至关重要的一块，对于LevelDb来说也是如此，对LevelDb的SSTable实现细节的了解也有助于了解Bigtable中一些实现细节。
  
本节内容主要讲述SSTable的静态布局结构，我们曾在“LevelDb日知录之二：整体架构”中说过，SSTable文件形成了不同Level的层级结构，
至于这个层级结构是如何形成的我们放在后面Compaction一节细说。
本节主要介绍SSTable某个文件的物理布局和逻辑布局结构，这对了解LevelDb的运行过程很有帮助。
  
LevelDb不同层级有很多SSTable文件（以后缀.sst为特征），所有.sst文件内部布局都是一样的。
上节介绍Log文件是物理分块的，SSTable也一样会将文件划分为固定大小的物理存储块，但是两者逻辑布局大不相同，
根本原因是：Log文件中的记录是Key无序的，即先后记录的key大小没有明确大小关系，
而.sst文件内部则是根据记录的Key由小到大排列的，从下面介绍的SSTable布局可以体会到Key有序是为何如此设计.sst文件结构的关键。

![leveldb-sstable](https://pic002.cnblogs.com/images/2011/274814/2011121116355194.png)

展示了一个.sst文件的物理划分结构，同Log文件一样，也是划分为固定大小的存储块，每个Block分为三个部分，红色部分是数据存储区， 
蓝色的Type区用于标识数据存储区是否采用了数据压缩算法（Snappy压缩或者无压缩两种），CRC部分则是数据校验码，
用于判别数据是否在生成和传输中出错。

以上是.sst的物理布局，下面介绍.sst文件的逻辑布局，所谓逻辑布局，就是说尽管大家都是物理块，但是每一块存储什么内容，
内部又有什么结构等。

下图展示了.sst文件的内部逻辑解释。

![leveldb-logic-layout](https://pic002.cnblogs.com/images/2011/274814/2011121116360588.png)

从上图可以看出，从大的方面，可以将.sst文件划分为数据存储区和数据管理区，数据存储区存放实际的Key:Value数据，
数据管理区则提供一些索引指针等管理数据，目的是更快速便捷的查找相应的记录。
两个区域都是在上述的分块基础上的，就是说文-件的前面若干块实际存储KV数据，后面数据管理区存储管理数据。
管理数据又分为四种不同类型：紫色的Meta Block，红色的MetaBlock 索引和蓝色的数据索引块以及一个文件尾部块。

LevelDb 1.2版对于Meta Block尚无实际使用，只是保留了一个接口，估计会在后续版本中加入内容，
下面我们看看数据索引区和文件尾部Footer的内部结构。

![leveldb-index](https://pic002.cnblogs.com/images/2011/274814/2011121116362376.png)

图4.3是数据索引的内部结构示意图。再次强调一下，Data Block内的KV记录是按照Key由小到大排列的，
数据索引区的每条记录是对某个Data Block建立的索引信息，每条索引信息包含三个内容，
以图4.3所示的数据块i的索引Index i来说：红色部分的第一个字段记载大于等于数据块i中最大的Key值的那个Key，
第二个字段指出数据块i在.sst文件中的起始位置，第三个字段指出Data Block i的大小（有时候是有数据压缩的）。
后面两个字段好理解，是用于定位数据块在文件中的位置的，第一个字段需要详细解释一下，
在索引里保存的这个Key值未必一定是某条记录的Key,
以图4.3的例子来说，假设数据块i 的最小Key=“samecity”，最大Key=“the best”;
数据块i+1的最小Key=“the fox”,最大Key=“zoo”,那么对于数据块i的索引Index i来说，
其第一个字段记载大于等于数据块i的最大Key(“the best”)同时要小于数据块i+1的最小Key(“the fox”)，
所以例子中Index i的第一个字段是：“the c”，这个是满足要求的；而Index i+1的第一个字段则是“zoo”，即数据块i+1的最大Key。

## Footer 

文件末尾Footer块的内部结构见图4.4，metaindex_handle指出了metaindex block的起始位置和大小；
inex_handle指出了index Block的起始地址和大小；这两个字段可以理解为索引的索引，是为了正确读出索引值而设立的，
后面跟着一个填充区和魔数。

![leveldb-index-footer](https://images2017.cnblogs.com/blog/1143071/201711/1143071-20171123133448477-408543261.png)

# Block

上面主要介绍的是数据管理区的内部结构，下面我们看看数据区的一个Block的数据部分内部是如何布局的（图4.1中的红色部分），
图4.5是其内部布局示意图。

![leveldb-block](https://pic002.cnblogs.com/images/2011/274814/2011121116363982.png)

从图中可以看出，其内部也分为两个部分，前面是一个个KV记录，其顺序是根据Key值由小到大排列的，
在Block尾部则是一些“重启点”（Restart Point）,其实是一些指针，指出Block内容中的一些记录位置。

## 重启点

“重启点”是干什么的呢？

我们一再强调，Block内容里的KV记录是按照Key大小有序的，
这样的话，相邻的两条记录很可能Key部分存在重叠，
比如key i=“the Car”，Key i+1=“the color”,那么两者存在重叠部分“the c”，
为了减少Key的存储量，Key i+1可以只存储和上一条Key不同的部分“olor”，
两者的共同部分从Key i中可以获得。记录的Key在Block内容部分就是这么存储的，主要目的是减少存储开销。

“重启点”的意思是：在这条记录开始，不再采取只记载不同的Key部分，而是重新记录所有的Key值，
假设Key i+1是一个重启点，那么Key里面会完整存储“the color”，而不是采用简略的“olor”方式。
Block尾部就是指出哪些记录是这些重启点。

![leveldb-restart-point](https://pic002.cnblogs.com/images/2011/274814/2011121116365490.png)

在Block内容区，每个KV记录的内部结构是怎样的？

图4.6给出了其详细结构，每个记录包含5个字段：key共享长度，比如上面的“olor”记录， 
其key和上一条记录共享的Key部分长度是“the c”的长度，即5；

key非共享长度，对于“olor”来说，是4；value长度指出Key:Value中Value的长度，
在后面的Value内容字段中存储实际的Value值；而key非共享内容则实际存储“olor”这个Key字符串。

上面讲的这些就是.sst文件的全部内部奥秘。

# 参考资料

[Leveldb实现原理](https://www.cnblogs.com/zhihaowu/p/7884424.html)

* any list
{:toc}