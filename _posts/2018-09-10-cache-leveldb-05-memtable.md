---
layout: post
title:  LevelDB-05-MemTable
date:  2018-09-07 07:44:19 +0800
categories: [Cache]
tags: [cache, google, middleware, in-memory cache, sh]
published: true
---

# MemTable 

LevelDb日知录前述小节大致讲述了磁盘文件相关的重要静态结构，
本小节讲述内存中的数据结构Memtable，Memtable在整个体系中的重要地位也不言而喻。
总体而言，所有KV数据都是存储在Memtable，Immutable Memtable和SSTable中的，
Immutable Memtable从结构上讲和Memtable是完全一样的，区别仅仅在于其是只读的，
不允许写入操作，而Memtable则是允许写入和读取的。当Memtable写入的数据占用内存到达指定数量，
则自动转换为Immutable Memtable，等待Dump到磁盘中，系统会自动生成新的Memtable供写操作写入新数据，
理解了Memtable，那么Immutable Memtable自然不在话下。
  
LevelDb的MemTable提供了将KV数据写入，删除以及读取KV记录的操作接口，但是事实上Memtable并不存在真正的删除操作,删除某个Key的Value在Memtable内是作为插入一条记录实施的，但是会打上一个Key的删除标记，真正的删除操作是Lazy的，会在以后的Compaction过程中去掉这个KV。
  
需要注意的是，LevelDb的Memtable中KV对是根据Key大小有序存储的，在系统插入新的KV时，LevelDb要把这个KV插到合适的位置上以保持这种Key有序性。其实，LevelDb的Memtable类只是一个接口类，真正的操作是通过背后的SkipList来做的，包括插入操作和读取操作等，所以Memtable的核心数据结构是一个SkipList。
  
SkipList是由William Pugh发明。他在Communications of the ACM June 1990, 33(6) 668-676 发表了Skip lists: a probabilistic alternative to balanced trees，在该论文中详细解释了SkipList的数据结构和插入删除操作。
  
SkipList是平衡树的一种替代数据结构，但是和红黑树不相同的是，SkipList对于树的平衡的实现是基于一种随机化的算法的，这样也就是说SkipList的插入和删除的工作是比较简单的。
 
SkipList不仅是维护有序数据的一个简单实现，而且相比较平衡树来说，在插入数据的时候可以避免频繁的树节点调整操作，所以写入效率是很高的，LevelDb整体而言是个高写入系统，SkipList在其中应该也起到了很重要的作用。Redis为了加快插入操作，也使用了SkipList来作为内部实现数据结构。

# 拓展阅读

[跳跃表](https://houbb.github.io/2019/02/13/datastruct-skiplist)

# 参考资料

[Leveldb实现原理](https://www.cnblogs.com/zhihaowu/p/7884424.html)

* any list
{:toc}