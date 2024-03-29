---
layout: post
title:  mysql（6）Index 索引
date:  2020-10-17 16:15:55 +0800
categories: [Database]
tags: [database, mysql, index, sf]
published: true
---

# 索引

索引是应用程序设计和开发的一个重要方面。

若索引太多，应用程序的性能可能会受到影响。而索引太少，对查询性能又会产生影响。

要找到一个合适的平衡点，这对应用程序的性能至关重要。

一些开发人员总是在事后才想起添加索引——我一直认为，这源于一种错误的开发模式。

如果知道数据的使用，从一开始就应该在需要处添加索引。

开发人员往往对于数据库的使用停留在应用的层面， 比如编写SQL语句、存储过程之类， 他们甚至可能不知道索引的存在， 或者认为事后让相关DBA加上即可。

DBA往往不够了解业务的数据流，而添加索引需要通过监控大量的SQL语句进而从中找到问题， 这个步骤所需的时间肯定是远大于初始添加索引所需要的时间，并且可能会遗漏一部分的索引。

当然索引也并不是越多越好，我曾经遇到这样一个问题：某台MySQL服务器iostat显示磁盘使用率一直处于100%，经过分析后发现是由于开发人员添加了太多的索引，在删除一些不必要的索引之后，磁盘使用率马上下降为20%。可见索引的添加也是非常有技术含量的。

这一章的主旨是对InnoDB存储引擎支持的索引做一个概述， 并对索引内部的机制做一个深入的解析，通过了解索引内部构造来了解哪里可以使用索引。

本章的风格和别的有关MySQL的书有所不同， 更偏重于索引内部的实现和算法问题的讨论。

# 5.1 InnoDB存储引擎索引概述

InnoDB 存储引擎支持以下几种常见的索引：

- B+树索引

- 全文索引

- 哈希索引

前面已经提到过，InnoDB存储引擎支持的哈希索引是自适应的，InnoDB存储引擎会根据表的使用情况自动为表生成哈希索引，不能人为干预是否在一张表中生成哈希索引。

B+树索引就是传统意义上的索引，这是目前关系型数据库系统中查找最为常用和最为有效的索引。B+树索引的构造类似于二叉树， 根据键值(KeyValue) 快速找到数据。

注意B+树中的B不是代表二叉(binary)， 而是代表平衡(balance)， 因为B+树是从最早的平衡二叉树演化而来，但是B+树不是一个二叉树。

另一个常常被DBA忽视的问题是：B+树索引并不能找到一个给定键值的具体行。

**B+树索引能找到的只是被查找数据行所在的页。然后数据库通过把页读入到内存，再在内存中进行查找，最后得到要查找的数据。**

# 5.2 数据结构与算法

B+树索引是最为常见，也是在数据库中使用最为频繁的一种索引。在介绍该索引之前先介绍与之密切相关的一些算法与数据结构，这有助于读者更好的理解B+树索引的工作方式。

## 5.2.1 二分查找法

二分查找法(binarysearch) 也称为折半查找法， 用来查找一组有序的记录数组中的某一记录，其基本思想是：将记录按有序化(递增或递减)排列，在查找过程中采用跳跃式方式查找，即先以有序数列的中点位置为比较对象，如果要找的元素值小于该中点元素，则将待查序列缩小为左半部分，否则为右半部分。

通过一次比较，将查找区间缩小一半。

## 5.2.2二叉查找树和平衡二叉树

在介绍B+树前，需要先了解一下二叉查找树。B+树是通过二叉查找树，再由平衡二叉树，B树演化而来。

相信在任何一本有关数据结构的书中都可以找到二叉查找树的章节，二叉查找树是一种经典的数据结构。

- 图5-2显示了一棵二叉查找树。

```
     6
    / \
   3    7
  / \  / \
 2  5     8
```

图5-2中的数字代表每个节点的键值，在二叉查找树中，左子树的键值总是小于根的键值，右子树的键值总是大于根的键值。

因此可以通过中序遍历得到键值的排序输出，图5-2的二叉查找树经过中序遍历后输出：2、3、5、6、7、8。

对图5-2的这棵二叉树进行查找，如查键值为5的记录，先找到根，其键值是6，6大于5，因此查找6的左子树，找到3；而5大于3，再找其右子树；一共找了3次。

如果按2、3、5、6、7、8的顺序来找同样需要3.次。用同样的方法再查找键值为8的这个记录，这次用了3次查找，而顺序查找需要6次。

计算平均查找次数可得：顺序查找的平均查找次数为(1+2+3+4+5+6)/6=3.3次，二叉查找树的平均查找次数为(3+3+3+2+2+1)/6=2.3次。

二叉查找树的平均查找速度比顺序查找来得更快。

二叉查找树可以任意地构造，同样是2、3、5、6、7、8这五个数字，也可以按照图5-3的方式建立二叉查找树。

- 5.3 效率较低的二叉树

```
2
 \
   3
    \
     5
      \
       7
      / \
     6   8
```
图5-3的平均查找次数为(1+2+3+4+5+5)/6=3.16次，和顺序查找差不多：显然这棵二叉查找树的查询效率就低了。

### 平衡二叉树

因此若想最大性能地构造一棵二叉查找树，需要这棵二叉查找树是平衡的，从而引出了新的定义——平衡二叉树， 或称为AVL树。

平衡二叉树的定义如下：

**首先符合二叉查找树的定义，其次必须满足任何节点的两个子树的高度最大差为1。**

显然，图5-3不满足平衡二叉树的定义，而图5-2是一棵平衡二叉树。平衡二叉树的查找性能是比较高的，但不是最高的，只是接近最高性能。

最好的性能需要建立一棵最优二叉树，但 图5-3效率较低的一棵二叉查找树是最优二叉树的建立和维护需要大量的操作，因此，用户一般只需建立一棵平衡二叉树即可。

平衡二叉树的查询速度的确很快，但是维护一棵平衡二叉树的代价是非常大的。

通常来说，需要1次或多次左旋和右旋来得到插入或更新后树的平衡性。

对于图5-2所示的平衡树，当用户需要插入一个新的键值为9的节点时，需做如图5-4所示的变动。

这里通过一次左旋操作就将插人后的树重新变为平衡的了。

但是有的情况可能需要多次，如图5-5所示。

![输入图片说明](https://images.gitee.com/uploads/images/2020/1113/210134_96ee3b9c_508704.png "屏幕截图.png")

图5-4和图5-5中列举了向一棵平衡二叉树插人一个新的节点后，平衡二叉树需要做的旋转操作。

除了插人操作，还有更新和删除操作，不过这和插人没有本质的区别，都是通过左旋或者右旋来完成的。

因此对一棵平衡树的维护是有一定开销的，不过平衡二叉树多用于内存结构对象中，因此维护的开销相对较小。

# 5.3 B+树

B+树和二叉树、平衡二叉树一样，都是经典的数据结构。

B+树由B树和索引顺序访问方法(ISAM，是不是很熟悉?对， 这也是MyISAM引擎最初参考的数据结构) 演化而来， 但是在现实使用过程中几乎已经没有使用B树的情况了。

B+树的定义在任何一本数据结构书中都能找到，其定义十分复杂，在这里列出来只会让读者感到更加困惑。

这里，我来精简地对B+树做个介绍：

B+树是为磁盘或其他直接存取辅助设备设计的一种平衡查找树。

在B+树中，所有记录节点都是按键值的大小顺序存放在同一层的叶子节点上，由各叶子节点指针进行连接。

先来看一个B+树，其高度为2， 每页可存放4条记录， 扇出(fanout) 为5， 如图5-6所示。

![输入图片说明](https://images.gitee.com/uploads/images/2020/1113/210327_d6c8bdd0_508704.png "屏幕截图.png")

从图5-6可以看出，所有记录都在叶子节点上，并且是顺序存放的，如果用户从最左边的叶子节点开始顺序遍历，可以得到所有键值的顺序排序：5、10、15、20、25、30、50、55、60、65、75、80、85、90。

## 插入

插入必须保证插入之后依然有顺序。

![输入图片说明](https://images.gitee.com/uploads/images/2020/1113/210621_52724c7a_508704.png "屏幕截图.png")

下面用一个例子分析一下。5-6 插入 28，直接插入即可。

![输入图片说明](https://images.gitee.com/uploads/images/2020/1113/210658_70f830ca_508704.png "屏幕截图.png")

接着再插入70这个键值， 这时原先的LeafPage已经满了， 但是IndexPage还没有满， 符合表5-1的第二种情况， 这时插入Leaf Page后的情况为55、55、60、65、70，并根据中间的值60来拆分叶子节点，可得图5-8。

![输入图片说明](https://images.gitee.com/uploads/images/2020/1113/210943_3d97dabf_508704.png "屏幕截图.png")

最后插入 95，此时满足第三种情况。

![输入图片说明](https://images.gitee.com/uploads/images/2020/1113/211116_b618eded_508704.png "屏幕截图.png")

可以看到，不管怎么变化，B+树总是会保持平衡。但是为了保持平衡对于新插入的键值可能需要做大量的拆分页(split) 操作。

因为B+树结构主要用于磁盘， 页的拆分意味着磁盘的操作，所以应该在可能的情况下尽量减少页的拆分操作。因此，B+树同样提供了类似于平衡二叉树的旋转(Rotation) 功能。

旋转发生在LeafPage已经满， 但是其的左右兄弟节点没有满的情况下。

这时B+树并不会急于去做拆分页的操作，而是将记录移到所在页的兄弟节点上。

在通常情况下，左兄弟会被首先检查用来做旋转操作，因此再来看图5-7的情况，若插人键值70，其实B+树并不会急于去拆分叶子节点，而是去做旋转操作，得到如图5-10所示的操作。

![输入图片说明](https://images.gitee.com/uploads/images/2020/1113/211237_e55e2de0_508704.png "屏幕截图.png")

从图5-10可以看到，采用旋转操作使B+树减少了一次页的拆分操作，同时这棵B+树的高度依然还是2。

## 5.3.2 B+树的删除操作

B+树使用填充因子(fllfactor) 来控制树的删除变化， 50%是填充因子可设的最小值。

B+树的删除操作同样必须保证删除后叶子节点中的记录依然排序，同插人一样，B+树的删除操作同样需要考虑以下表5-2中的三种情况，与插人不同的是，删除根据填充因子的变化来衡量。

![输入图片说明](https://images.gitee.com/uploads/images/2020/1113/211550_5e406afe_508704.png "屏幕截图.png")

根据 5-9 执行删除操作，符合第一种情况。删除后得到 5-11

![输入图片说明](https://images.gitee.com/uploads/images/2020/1113/211639_b599312e_508704.png "屏幕截图.png")

接着删除25，也是符合第一种情况，不过需要把 28 更新到 PageIndex 中。

删除后如下图：

![输入图片说明](https://images.gitee.com/uploads/images/2020/1113/211825_83cff592_508704.png "屏幕截图.png")

最后删除 60，并且需要做合并。

![输入图片说明](https://images.gitee.com/uploads/images/2020/1113/211911_e73ed491_508704.png "屏幕截图.png")

# 5.4 B+树索引

前面讨论的都是B+树的数据结构及其一般操作，B+树索引的本质就是B+树在数据库中的实现。但是B+索引在数据库中有一个特点是高扇出性，因此在数据库中，B+树的高度一般都在2~4层，这也就是说查找某一键值的行记录时最多只需要2到4次IO，这倒不错。

因为当前一般的机械磁盘每秒至少可以做100次10，2~4次的IO意味着查询时间只需0.02~0.04秒。

数据库中的B+树索引可以分为聚集索引(clusteredindex) 和辅助索引(secondary index)， 但是不管是聚集还是辅助的索引， 其内部都是B+树的， 即高度平衡的， 叶子节点存放着所有的数据。

聚集索引与辅助索引不同的是，叶子节点存放的是否是一整行的信息。

## 5.4.1 聚集索引

之前已经介绍过了，InnoDB存储引擎表是索引组织表， 即表中数据按照主键顺序存放。而聚集索引(clusteredindex) 就是按照每张表的主键构造一棵B+树， 同时叶子节点中存放的即为整张表的行记录数据，也将聚集索引的叶子节点称为数据页。

聚集索引的这个特性决定了索引组织表中数据也是索引的一部分。同B+树数据结构一样，每个数据页都通过一个双向链表来进行链接。

**由于实际的数据页只能按照一棵B+树进行排序，因此每张表只能拥有一个聚集索引。**

在多数情况下，查询优化器倾向于采用聚集索引。

因为聚集索引能够在B+树索引的叶子节点上直接找到数据。

此外，由于定义了数据的逻辑顺序，聚集索引能够特别快地访问针对范围值的查询。

查询优化器能够快速发现某一段范围的数据页需要扫描。

许多数据库的文档会这样告诉读者：聚集索引按照顺序物理地存储数据。

但是试想一下，如果聚集索引必须按照特定顺序存放物理记录，则维护成本显得非常之高。所以，**聚集索引的存储并不是物理上连续的，而是逻辑上连续的**。

这其中有两点：一是前面说过的页通过双向链表链接，页按照主键的顺序排序；另一点是每个页中的记录也是通过双向链表进行维护的，物理存储上可以同样不按照主键存储。

聚集索引的另一个好处是，它对于**主键的排序查找和范围查找速度非常快。叶子节点的数据就是用户所要查询的数据**。

## 5.4.2 辅助索引

对于辅助索引(SecondaryIndex， 也称非聚集索引)， 叶子节点并不包含行记录的全部数据。

叶子节点除了包含键值以外，每个叶子节点中的索引行中还包含了一个书签(bookmark) 。

该书签用来告诉InnoDB存储引擎哪里可以找到与索引相对应的行数据。

由于InnoDB存储引擎表是索引组织表， 因此InnoDB存储引擎的辅助索引的书签就是相应行数据的聚集索引键。

图5-15显示了InnoDB存储引擎中辅助索引与聚集索引的关系。

![输入图片说明](https://images.gitee.com/uploads/images/2020/1113/212626_f41f02d8_508704.png "屏幕截图.png")

辅助索引的存在并不影响数据在聚集索引中的组织，因此每张表上可以有多个辅助索引。

**当通过辅助索引来寻找数据时，InnoDB存储引擎会遍历辅助索引并通过叶级别的指针获得指向主键索引的主键，然后再通过主键索引来找到一个完整的行记录。**

举例来说。

如果在一棵高度为3的辅助索引树中查找数据，那需要对这棵辅助索引树遍历3次找到指定主键，如果聚集索引树的高度同样为3，那么还需要对聚集索引树进行3次查找，最终找到一个完整的行数据所在的页，因此一共需要6次逻辑IO访问以得到最终的一个数据页。

对于其他的一些数据库， 如Microsoft SQLServer数据库， 其有一种称为堆表的表类型， 即行数据的存储按照插人的顺序存放。

这与MySQL数据库的MyISAM存储引擎有些类似。堆表的特性决定了堆表上的索引都是非聚集的，主键与非主键的区别只是是否唯一且非空(NOTNULL)。

因此这时书签是一个行标识符(RowIdentifiedr，RID)， 可以用如“文件号：页号：槽号”的格式来定位实际的行数据。

有的 Microsoft SQL Server数据库DBA问过我这样的问题，为什么在 Microsoft SQLServer数据库上还要使用索引组织表?

堆表的书签使非聚集查找可以比主键书签方式更快，并且非聚集可能在一张表中存在多个，我们需要对多个非聚集索引进行查找。

而且对于非聚集索引的离散读取，索引组织表上的非聚集索引会比堆表上的聚集索引慢一些。

当然，在一些情况下，使用堆表的确会比索引组织表更快，但是我觉得大部分原因是由于存在OLAP(On-LineAnalyticalProcessing，在线分析处理)的应用。

其次就是前面提到的，表中数据是否需要更新，并且更新是否影响到物理地址的变更。

此外另一个不能忽视的是对于排序和范围查找，索引组织表通过B+树的中间节点就可以找到要查找的所有页，然后进行读取，而堆表的特性决定了这对其是不能实现的。

最后，非聚集索引的离散读，的确存在上述的情况， 但是一般的数据库都通过实现预读(readahead)技术来避免多次的离散读操作。

因此，具体是建堆表还是索引组织表，这取决于应用，不存在哪个更优的问题。

这和InnoDB存储引擎好还是MyISAM存储引擎好这个问题的答案是一样的，Italldepends。

## 5.4.3 B+树索引的分裂

在5.3节中介绍B+树的分裂是最为简单的一种情况，这和数据库中B+树索引的情况可能略有不同。

此外5.3节页没有涉及并发，而这才是B+树索引实现最为困难的部分。

B+树索引页的分裂并不总是从页的中间记录开始，这样可能会导致页空间的浪费。

例如下面的记录：

```
1.2、3、、5、57、8、9
```

插入是根据自增顺序进行的，若这时插人10这条记录后需要进行页的分裂操作，那么根据5.3.1节介绍的分裂方法，会将记录5作为分裂点记录(splitrecord)， 分裂后得到下面两个页：

```
P1：1、2、3、4
P2：5、6、7、8、9、10
```

然而由于插入是顺序的，P1这个页中将不会再有记录被插人，从而导致空间的浪费。

而P2又会再次进行分裂。

InnoDB存储引擎的PageHeader中有以下几个部分用来保存插入的顺序信息：

- PAGE_LAST_INSERT

- PAGE_DIRECTION

- PAGE_N_DIRECTION

通过这些信息，InnoDB存储引擎可以决定是向左还是向右进行分裂， 同时决定将分裂点记录为哪一个。

若插入是随机的，则取页的中间记录作为分裂点的记录，这和之前介绍的相同。

若往同一方向进行插人的记录数量为5， 并且目前已经定位(cursor) 到的记录(InnoDB存储引擎插入时， 首先需要进行定位，定位到的记录为待插人记录的前一条记录)之后还有3条记录，则分裂点的记录为定位到的记录后的第三条记录，否则分裂点记录就是待插人的记录。

来看一个向右分裂的例子，并且定位到的记录之后还有3条记录，则分裂点记录如图5-17所示。

![输入图片说明](https://images.gitee.com/uploads/images/2020/1113/213204_58cd5e3d_508704.png "屏幕截图.png")

最终分裂如下图：

![输入图片说明](https://images.gitee.com/uploads/images/2020/1113/213304_b93887ef_508704.png "屏幕截图.png")

5-19，分裂点就是插入本身。

![输入图片说明](https://images.gitee.com/uploads/images/2020/1113/213354_c4751f05_508704.png "屏幕截图.png")

## 索引快速创建

MySQL 5.5版本之前(不包括5.5) 存在的一个普遍被人诟病的问题是MySQL数据库对于索引的添加或者刷除的这类DDL操作，MySQL数据库的操作过程为.

- 首先创建一张新的临时表， 表结构为通过命令ALTER TABLE新定义的结构。

- 然后把原表中数据导人到临时表。

- 接着删除原表。

- 最后把临时表重名为原来的表名。

可以发现，若用户对于一张大表进行索引的添加和删除操作，那么这会需要很长的时间。

更关键的是，若有大量事务需要访问正在被修改的表，这意味着数据库服务不可用。

而这对于MicrosoftSQLServer或Oracle数据库的DBA来说， MySQL数据库的索引维护始终让他们感觉非常痛苦。

InnoDB存储引擎从InnoDB1.0.x版本开始支持一种称为Fast Index Creation (快速索引创建)的索引创建方式——简称FIC。

对于辅助索引的创建，InnoDB存储引擎会对创建索引的表加上一个S锁。

在创建的过程中，不需要重建表，因此速度较之前提高很多，并且数据库的可用性也得到了提高。

删除辅助索引操作就更简单了，InnoDB存储引擎只需更新内部视图， 并将辅助索引的空间标记为可用， 同时删除MySQL数据库内部视图上对该表的索引定义即可。

这里需要特别注意的是， 临时表的创建路径是通过参数tmpdir进行设置的。

用户必须保证tmpdir有足够的空间可以存放临时表，否则会导致创建索引失败，由于FIC在索引的创建的过程中对表加上了S锁， 因此在创建的过程中只能对该表进行读操作，若有大量的事务需要对目标表进行写操作，那么数据库的服务同样不可用。

此外，FIC方式只限定于辅助索引，对于主键的创建和删除同样需要重建一张表。

## Online Schema Change

OnlineSchemaChange(在线架构改变， 简称OSC) 最早是由Facebook实现的一种在线执行DDL的方式， 并广泛地应用于Facebook的MySQL数据库。

所谓“在线”是指在事务的创建过程中，可以有读写事务对表进行操作，这提高了原有MySQL数据库在DDL操作时的并发性。

Facebook采用PHP脚本来现实OSC，而并不是通过修改InnoDB存储引擎源码的方式.

OSC最初由Facebook的员工Vamsi P on nek anti开发。

此外，OSC借鉴了开源社区之前的工具The open ark kit toolkit oak-online-alter-table.

实现OSC步骤如下：

- init， 即初始化阶段， 会对创建的表做一些验证工作， 如检查表是否有主键， 是否存在触发器或者外键等。

- create Copy Table ， 创建和原始表结构一样的新表。

- alterCopyTable：对创建的新表进行ALTER TABLE操作， 如添加索引或列等。

- create Delta sTable ， 创建deltas表， 该表的作用是为下一步创建的触发器所使用。之后对原表的所有DML操作会被记录到create Delta sTable中。

- createTriggers，对原表创建INSERT、UPDATE、DELETE操作的触发器。触发操作产生的记录被写人到deltas表。

- startS npshotXact， 开始OSC操作的事务。

- select Table Into Outfle， 将原表中的数据写人到新表。为了减少对原表的锁定时间， 这里通过分片(chunked) 将数据输出到多个外部文件， 然后将外部文件的数据导人到copy表中，分片的大小可以指定， 默认值是500000。

- dropNCIndexs， 在导人到新表前， 删除新表中所有的辅助索引。

- load Copy Table ， 将导出的分片文件导人到新表。

- replay Changes ， 将OSC过程中原表DML操作的记录应用到新表中， 这些记录被保存在deltas表中。

- recreate NCIndexes， 重新创建辅助索引。

- replay Changes ， 再次进行DML日志的回放操作， 这些日志是在上述创建辅助索引中过程中新产生的日志。

- swap Tables ， 将原表和新表交换名字， 整个操作需要锁定2张表， 不允许新的数据产生。由于改名是一个很快的操作，因此阻塞的时间非常短。

上述只是简单介绍了OSC的实现过程， 实际脚本非常复杂， 仅OSC的PHP核心代码就有2200多行， 用到的MySQL InnoDB的知识点非常多， 建议DBA和数据库开发人员尝试进行阅读， 这有助于更好地理解InnoDB存储引擎的使用。


由于OSC只是一个PHP脚本， 因此其有一定的局限性。例如其要求进行修改的表一定要有主键， 且表本身不能存在外键和触发器。

此外， 在进行OSC过程中， 允许SETsql_bin_log=0， 因此所做的操作不会同步slave服务器， 可能导致主从不一致的情况。
    
## Online DDL

虽然FIC可以让InnoDB存储引擎避免创建临时表， 从而提高索引创建的效率。

但正如前面小节所说的， 索引创建时会阻塞表上的DML操作。

OSC虽然解决了上述的部分问题， 但是还是有很大的局限性。

MySQL 5.6 版本开始支持Online DDL(在线数据定义) 操作， 其允许辅助索引创建的同时， 还允许其他诸如INSERT、UPDATE DELETE这类DML操作， 这极大地提高了MySQL数据库在生产环境中的可用性。

此外， 不仅是辅助索引，以下这几类DDL操作都可以通过“在线”的方式进行操作：

- 辅助索引的创建与删除

- 改变自增长值

- 添加或除外键约束

- 列的重命名


通过新的ALTERTABLE语法， 用户可以选择索引的创建方式：

```
ALTER TABLE tbl_nane
I ADD[INDEX|KEY] [index_name )
[index_type l( index_col_nane，...) [index_option] ...
ALGORITH H[-】(DEFAULTIINPLACEICOPY)
LOCK(-) {DEFAULT IN ONE I SHARED I EXCLUSIVE]
```

ALGORITHM指定了创建或制除索引的算法，COPY表示按照MySQL 5.1版本之前的工作模式， 即创建临时表的方式。

INPLACE 表示索引创建或删除操作不需要创建临时表。

DEFAULT表示根据参数 `old_alter_table` 来判断是通过IN PLACE还是COPY的算法，该参数的默认值为OFF， 表示采用INPLACE的方式， 如：

```
mysql> select @@version;
+-----------+
| @@version |
+-----------+
| 5.7.31    |
+-----------+
1 row in set (0.00 sec)


mysql> SHOW VARIABLES LIKE 'old_alter_table'\G；
*************************** 1. row ***************************
Variable_name: old_alter_table
        Value: OFF
1 row in set, 1 warning (0.01 sec)
```

### Lock 部分

LOCK部分为索引创建或删除时对表添加锁的情况， 可有的选择为：

(1) NONE

执行索引创建或者删除操作时，对目标表不添加任何的锁，即事务仍然可以进行读写操作，不会收到阻塞。因此这种模式可以获得最大的并发度。

(2) SHARE

这和之前的FIC类似， 执行索引创建或删除操作时， 对目标表加上一个Ｓ锁。

对于并发地读事务，依然可以执行，但是遇到写事务，就会发生等待操作。如果存储引擎不支持SHARE模式， 会返回一个错误信息。

(3) EXCLUSIVE

在EXCLUSIVE模式下， 执行索引创建或删除操作时，对目标表加上一个X锁。读写事务都不能进行， 因此会阻塞所有的线程，这和COPY方式运行得到的状态类似， 但是不需要像COPY方式那样创建一张临时表。

(4) DEFAULT

DEFAULT模式首先会判断当前操作是否可以使用NONE模式， 若不能， 则判断是否可以使用SHARE模式， 最后判断是否可以使用EXCLUSIVE模式。也就是说DEFAULT会通过判断事务的最大并发性来判断执行DDL的模式。

InnoDB存储引擎实现OnlineDDL的原理是在执行创建或者删除操作的同时， 将INSERT、UPDATE、DELETE这类DML操作日志写人到一个缓存中。待完成索引创建后再将重做应用到表上， 以此达到数据的一致性。

这个缓存的大小由参数 `innodb_online_alter_log_max_size` 控制， 默认的大小为128MB。
    
若用户更新的表比较大， 并且在创建过程中伴有大量的写事务， 如遇到innodb_online_alter_log_max_size的空间不能存放日志时，会抛出类似如下的错误：

```
Error ：1799SQLSTATE：HY000(ER_INNODB_ONLINE_LOG_TOO_BIG)
Message：Creatingindex'idx_aaa'requiredmorethan'innodb_online_alter_log_max_size ' bytes of modification log.Pleasetryagain.
```

对于这个错误，用户可以调大参数innodb_online_alter_log_max_size ， 以此获得更大的日志缓存空间。

此外， 还可以设置ALTERTABLE的模式为SHARE，这样在执行过程中不会有写事务发生， 因此不需要进行DML日志的记录。

需要特别注意的是， 由于 Online DDL在创建索引完成后再通过重做日志达到数据库的最终一致性，这意味着**在索引创建过程中，SQL优化器不会选择正在创建中的索引**。


# 5.5 Cardinality值

## 5.5.1 什么是Cardinality

并不是在所有的查询条件中出现的列都需要添加索引。

对于什么时候添加B+树索引一般的经验是，在访问表中很少一部分时使用B+树索引才有意义。

对手性别字、地区字段、类型字段，它们可取值的范围很小，称为低选择性。

按性别进行查询时， 可取值的范围一般只有'M'、'℉'。

因此上述SQL语句得到的结果可能是该表50%的数据(假设男女比例1∶1)，这时添加B+树索引是完全没有必要的。

相反，如果某个字段的取值范围很广，几乎没有重复，即属于高选择性，则此时使用B+树索引是最适合的。

例如，对于姓名字段，基本上在一个应用中不允许重名的出现。

怎样查看索引是否是高选择性的呢?可以通过SHOW INDEX结果中的列Cardinality来观察。

Cardinality 值非常关键， 表示索引中不重复记录数量的预估值。

同时需要注意的是，Cardinality是一个预估值， 而不是一个准确值， 基本上用户也不可能得到一个准确的值。

在实际应用中， Cardinality/n_rows_in_table 应尽可能地接近1.

如果非常小， 那么用户需要考虑是否还有必要创建这个索引。

故在访问高选择性属性的字段并从表中取出很少一部分数据时，对这个字段添加B+树索引是非常有必要的。

## 5.5.2 InnoDB存储引擎的Cardinality统计

上一小节介绍了Cardinaity的重要性， 并且告诉读者Cardinality表示选择性。

建立索引的前提是列中的数据是高选择性的，这对数据库来说才具有实际意义

。然而数据库是怎样来统计Cardinality信息的呢?

因为MySQL数据库中有各种不同的存储引擎， 而每种存储引擎对于B+树劳引的实现又各不相同， 所以对Cardinality的统计是放在存储引擎层进行的。

此外需要考虑到的是，在生产环境中，索引的更新操作可能是非常频繁的。

如果每次索引在发生操作时就对其进行Cardinality的绕计，那么将会给数据库带来很大的负担。

另外需要考虑的是，如果一张表的数据非常大，如一张表有50G的数据，那么统计一次Cardinality信息所需要的时间可能非常长。

这在生产环境下， 也是不能接受的。

因此， 数据库对于Cardinality的统计都是通过**采样(Sample)**的方法来完成的。

在InnoDB存储引擎中，Cardinaty统计信息的更新发生在两个操作中：INSERT和UPDATE。

根据前面的叙述，不可能在每次发生INSERT和UPDATE时就去更新Cardinality信息， 这样会增加数据库系统的负荷，同时对于大表的统计， 时间上也不允许数据库这样去操作。

因此，InnoDB存储引擎内部对更新Cardinality信息的策略为：

- 表中1/16的数据已发生过变化.

- stat_modified_counter > 2000000000.

第一种策略为自从上次统计Cardinality信息后， 表中1/16的数据已经发生过变化，这时需要更新 Cardinality 信息。

第二种情况考虑的是， 如果对表中某一行数据频繁地进行更新操作，这时表中的数据实际并没有增加，实际发生变化的还是这一行数据，则第一种更新策略就无法适用这这种情况。

故在InnoDB存储引擎内部有一个计数器stat_modifed_counter，用来表示发生变化的次数， 当stat_modified_counter大于2000000000时， 则同样需要更新Cardinality信息。

接着考虑InnoDB存储引擎内部是怎样来进行Cardinality信息的统计和更新操作的呢?同样是通过采样的方法。

 ### 采样

默认InnoDB存储引擎对8个叶子节点(LeafPage) 进行采用。

采样的过程如下：

- 取得B+树索引中叶子节点的数量，记为A.

- 随机取得B+树索引中的8个叶子节点。统计每个页不同记录的个数，即为P1，P2....P8

- 根据采样获取 Cardinality 的预估值 = (P1+P2+...+P8)/8

在InnoDB1.2版本之前， 可以通过参数innodb_stats_sample_pages用来设置统计Cardinality时每次采样页的数量，默认值为8。

同时， 参数innodb_stats_method用来判断如何对待索引中出现的NULL值记录。该参数默认值为nulls_equal， 表示将NULL值记录视为相等的记录。

其有效值还有nulls_unequal ，nulls_ignored ， 分别表示将NULL值记录视为不同的记录和忽略NULL值记录。

例如某页中索引记录为NULL、NULL、1、2、2、3、3、3， 在参数innodb_stats_method的默认设置下， 该页的Cardinality为4； 若参数innodb_stats_method为nulls_unequal， 则该页的Caridinality为5； 

若参数innodb_stats_method为nulls_ignored ， 则Cardinality为3。

当执行SQL语句ANALYZE TABLE、SHOW TABLE STATUS、SHOW INDEX以及访问INFORMATION_SCHEMA架构下的表TABLES和STATISTICS时会导致InnoDB存储引擎去重新计算索引的Cardinality值。

若表中的数据量非常大，并且表中存在多个辅助索引时，执行上述这些操作可能会非常慢。

虽然用户可能并不希望去更新Cardinality值。

InnoDB1.2版本提供了更多的参数对Cardinality统计进行设置，这些参数如表5-3所示。

![输入图片说明](https://images.gitee.com/uploads/images/2020/1113/215534_54cdd229_508704.png "屏幕截图.png")

# 5.6 B+树索引的使用

## 5.6.1 不同应用中B+树索引的使用

在了解了B+树索引的本质和实现后，下一个需要考虑的问题是怎样正确地使用B+树索引，这不是一个简单的问题。

这里所总结的可能并不适用于所有的应用场合。我所能做的只是概括一个大概的方向。

在实际的生产环境使用中， 每个DBA和开发人员，还是需要根据自己的具体生产环境来使用索引，并观察索引使用的情况，判断是否需要添加索引。

不要盲从任何人给你的经验意见，Think Different。

根据第1章的介绍，用户已经知道数据库中存在两种类型的应用，OLTP和OLAP应用。

在OLTP应用中， 查询操作只从数据库中取得一小部分数据，一般可能都在10条记录以下，甚至在很多时候只取1条记录，如根据主键值来取得用户信息，根据订单号取得订单的详细信息， 这都是典型OLTP应用的查询语句。

在这种情况下，B+树索引建立后，对该索引的使用应该只是通过该索引取得表中少部分的数据。

这时建立B+树索引才是有意义的，否则即使建立了，优化器也可能选择不使用索引。


对于OLAP应用， 情况可能就稍显复杂了。

不过概括来说，在OLAP应用中， 都需要访问表中大量的数据，根据这些数据来产生查询的结果，这些查询多是面向分析的查询，目的是为决策者提供支持。

如这个月每个用户的消费情况，销售额同比、环比增长的情况。因此在OLAP中索引的添加根据的应该是宏观的信息， 而不是微观， 因为最终要得到的结果是提供给决策者的。

例如不需要在OLAP中对姓名字段进行索引， 因为很少需要对单个用户进行查询。

但是对于OLAP中的复杂查询， 要涉及多张表之间的联接操作， 因此索引的添加依然是有意义的。

但是， 如果联接操作使用的是HashJoin， 那么索引可能又变得不是非常重要了， 所以这需要DBA或开发人员认真并仔细地研究自己的应用。

不过在OLAP应用中， 通常会需要对时间字段进行索引， 这是因为大多数统计需要根据时间维度来进行数据的筛选。



## 5.6.2 联合索引

联合索引是指对表上的多个列进行索引。

前面讨论的情况都是只对表上的一个列进行索引。

联合索引的创建方法与单个索引创建的方法一样，不同之处仅在于有多个索引列。

例如， 以下代码创建了一张t表， 并且索引idx_a_b是联合索引， 联合的列为 (a, b)

```sql
CREATE TABLE t(
   a INT，
   b INT，
   PRIMARY KEY(a) ，
    KEY idx_a_b(a，b)
) ENGINE=INNODB
```

那么何时需要使用联合索引呢?

在讨论这个问题之前，先来看一下联合索引内部的结果。

从本质上来说，联合索引也是一棵B+树，不同的是联合索引的键值的数量不是1，而是大于等于2。

接着来讨论两个整型列组成的联合索引，假定两个键值的名称分别为a、b，如图5-22所示。 

- 图5-22 多个键值的B+树

![ 多个键值的B+树](https://images.gitee.com/uploads/images/2020/1113/220205_737f26a5_508704.png)

从图5-22可以观察到多个键值的B+树情况。
    
其实和之前讨论的单个键值的B+树并没有什么不同，键值都是排序的，通过叶子节点可以逻辑上顺序地读出所有数据，就上面的例子来说，即(1，1)、(1，2)、(2，1)、(2，4)、(3，1)、(3，2)。

数据按(a，b)的顺序进行了存放。

因此， 对于查询 `SELECT * FROM TABLE WHERE a=xxx and b=xxx`， 显然是可以使用(a，b) 这个联合索引的。

对于单个的 a 列查询 `SELECT * FROM TABLE WHERE a = xxx`， 也可以使用这个(a，b) 索引。

但对于b列的查询 `SELECT * FROM TABLE WHERE b=xxx`， 则不可以使用这棵B+树索引。

可以发现叶子节点上的b值为1、2、1、4、1、2，显然不是排序的，因此对于b列的查询使用不到(a，b)的索引。

联合索引的第二个好处是已经对第二个键值进行了排序处理。

![输入图片说明](https://images.gitee.com/uploads/images/2020/1113/220205_737f26a5_508704.png "屏幕截图.png")

## 5.6.3覆盖索引
 
InnoDB存储引擎支持覆盖索引(coveringindex， 或称索引覆盖)， 即从辅助索引中就可以得到查询的记录，而不需要查询聚集索引中的记录。

**使用覆盖索引的一个好处是辅助索引不包含整行记录的所有信息，故其大小要远小于聚集索引，因此可以减少大量的IO操作。**

注意覆盖索引技术最早是在InnoDB Plugin中完成并实现。

这意味着对于·InnoDB版本小于1.0的， 或者MySQL数据库版本为5.0或以下的，InnoDB存储引擎不支持覆盖索引特性。

对于InnoDB存储引擎的辅助索引而言， 由于其包含了主键信息， 因此其叶子节点存放的数据为( primary keyl，primarykey2， …，key1，key2， …) 。

## 5.6.4优化器选择不使用索引的情况

在某些情况下，当执行EXPLAIN命令进行SQL语句的分析时，会发现优化器并没有选择索引去查找数据，而是通过扫描聚集索引，也就是直接进行全表的扫描来得到数据。

这种情况多发生于范围查找、JOIN链接操作等情况下。

 在possible_keys一列可以看到查询可以使用PRIMARY、OrderID、Orders Order_Details三个索引， 但是在最后的索引使用中， 优化器选择了PRIMARY聚集索引， 也就是表扫描(tablescan)， 而非OrderID辅助索引扫描(indexscan) 。

这是为什么呢?
    
原因在于用户要选取的数据是整行信息， 而OrderID索引不能覆盖到我们要查询的信息， 因此在对OrderID索引查询到指定数据后， 还需要一次书签访问来查找整行数据的信息。

虽然OrderID索引中数据是顺序存放的， 但是再一次进行书签查找的数据则是无序的，因此变为了磁盘上的离散读操作。

如果要求访问的数据量很小，则优化器还是会选择辅助索引，但是当访问的数据占整个表中数据的蛮大一部分时(一般是20%左右)，优化器会选择通过聚集索引来查找数据。

因为之前已经提到过，顺序读要远远快于离散读。

**因此对于不能进行索引覆盖的情况，优化器选择辅助索引的情况是，通过辅助索引查找的数据是少量的。**

这是由当前传统机械硬盘的特性所决定的，即利用顺序读来替换随机读的查找。

若用户使用的磁盘是固态硬盘，随机读操作非常快，同时有足够的自信，可以使用 `force index 强制指定 index`

## 5.6.5索引提示

MySQL数据库支持索引提示(INDEXHINT)， 显式地告诉优化器使用哪个索引。

个人总结以下两种情况可能需要用到 INDEX HINT：
    
（1）MySQL数据库的优化器错误地选择了某个索引， 导致SQL语句运行的很慢。

这种情况在最新的MySQL数据库版本中非常非常的少见。优化器在绝大部分情况下工作得都非常有效和正确。这时有经验的DBA或开发人员可以强制优化器使用某个索引， 以此来提高SQL运行的速度。

（2）某SQL语句可以选择的索引非常多， 这时优化器选择执行计划时间的开销可能会大于SQL语句本身。

例如， 优化器分析Range查询本身就是比较耗时的操作。

这时DBA或开发人员分析最优的索引选择， 通过IndexHint来强制使优化器不进行各个执行路径的成本分析，直接选择指定的索引来完成查询。

## 5.6.6Multi - Range Read优化

MySQL 5.6版本开始支持Multi -RangeRead(MRR) 优化。

Multi - Range Read 优化的目的就是**为了减少磁盘的随机访问，并且将随机访问转化为较为顺序的数据访问，这对于IO-bound类型的SQL查询语句可带来性能极大的提升**。

Multi - Range Read 优化可适用于range ，ref，eq_ref类型的查询。

MRR 优化有以下几个好处：

- MRR使数据访问变得较为顺序。在查询辅助索引时， 首先根据得到的查询结果，按照主键进行排序，并按照主键排序的顺序进行书签查找。

- 减少缓冲池中页被替换的次数。

- 批量处理对键值的查询操作。

对于InnoDB和MyISAM存储引擎的范围查询和JOIN查询操作，MRR的工作方式如下：

- 将查询得到的辅助索引键值存放于一个缓存中，这时缓存中的数据是根据辅助索引键值排序的。

- 将缓存中的键值根据RowID进行排序。

- 根据RowID的排序顺序来访问实际的数据文件。

此外， 若InnoDB存储引擎或者MyISAM存储引擎的缓冲池不是足够大， 即不能存放下一张表中的所有数据，此时频繁的离散读操作还会导致缓存中的页被替换出缓冲池，然后又不断地被读人缓冲池。

若是按照主键顺序进行访问，则可以将此重复行为降为最低。

## 5.6.7Index Condition Pushdown(ICP) 优化

和Multi-Range Read一样， Index Condi ion Pushdown同样是MySQL 5.6开始支持的一种根据索引进行查询的优化方式。

之前的MySQL数据库版本不支持Index ConditionPushdown， 当进行索引查询时， 首先根据索引来查找记录， 然后再根据WHERE条件来过滤记录。

在支持Index Condition Pushdown后， MySQL 数据库**会在取出索引的同时，判断是否可以进行WHERE条件的过滤， 也就是将WHERE的部分过滤操作放在了存储引擎层**。

在某些查询下， 可以大大减少上层SQL层对记录的索取(fetch) ， 从而提高数据库的整体性能。

Index Condition Pushdown优化支持range、ref、eq_ref、ref_or_null类型的查询， 当前支持MyISAM和InnoDB存储引擎。

当优化器选择Index Condi ion Pushdown优化时，可在执行计划的列Extra看到Using index condition提示。

注意NDB Cluster存储引擎支持Engine Condition Pushdown优化。

不仅可以进行“Index”的Condition Pushdown， 也可以支持非索引的Condition Pushdown，不过这是由其引擎本身的特性所决定的。

另外在MySQL 5.1版本中NDB Cluster存储引擎就开始支持Engine Condition Pushdown优化。

假设某张表有联合索引(zip_code， last_name， first_name) ， 并且查询语句如下：

```sql
SELECT FROM people
WHERE zipcode='95054'
AND lastname LIKE '%asdf%'
AND address LIKE '%Main Street%'；
```

对于上述语句， MySQL数据库可以通过索引来定位zipcode等于95054的记录， 但是索引对WHERE条件的  `AND lastname LIKE '%asdf%' AND address LIKE '%Main Street%'` 没有任何帮助。
   
若不支持Index Condition Pushdown优化， 则数据库需要先通过索引取出所有zipcode等于95054的记录， 然后再过滤WHERE之后的两个条件。

如果支持的话，可以在获取索引的时候就进行过滤，然后再去获取数据。

# 5.7 哈希算法

哈希算法是一种常见算法，时间复杂度为O(1)，且不只存在于索引中，每个数据库应用中都存在该数据库结构。

设想一个问题，当前服务器的内存为128GB时，用户怎么从内存中得到某一个被缓存的页呢?

虽然内存中查询速度很快，但是也不可能每次都要遍历所有内存来进行查找，这时对于字典操作只需O(1)的哈希算法就有了很好的用武之地。

## 5.7.1 哈希表

哈希表(HashTable) 也称散列表， 由直接寻址表改进而来。

我们先来看直接寻址表。

当关键字的全域 U 比较小时，直接寻址是一种简单而有效的技术。

假设某应用要用到一个动态集合，其中每个元素都有一个取自全域 `U={0，1，…，m-1}°` 的关键字。

同时假设没有两个元素具有相同的关键字。

用一个数组(即直接寻址表) `T[0..m-1]` 表示动态集合，其中每个位置(或称槽或桶)对应全域Ｕ中的一个关键字。

图5-38说明了这个方法，槽k指向集合中一个关键字为k的元素。

如果该集合中没有关键字为k的元素， 则T[k] =NULL。

![输入图片说明](https://images.gitee.com/uploads/images/2020/1113/221813_273092c8_508704.png "屏幕截图.png")

直接寻址技术存在一个很明显的问题，如果域U很大，在一台典型计算机的可用容量的限制下，要在机器中存储大小为Ｕ的一张表Ｔ就有点不实际，甚至是不可能的。

如果实际要存储的关键字集合K相对于U来说很小，那么分配给Ｔ的大部分空间都要浪费掉。

因此，哈希表出现了。

在哈希方式下，该元素处于h(k)中，即利用哈希函数h，根据关键字k计算出槽的位置。函数h将关键字域U映射到哈希表T[0..m-1]的槽位上，如图5-39所示。

哈希表技术很好地解决了直接寻址遇到的问题，但是这样做有一个小问题，如图5-39所示的两个关键字可能映射到同一个槽上。

一般将这种情况称之为发生了碰撞(collision) 。在数据库中一般采用最简单的碰撞解决技术， 这种技术被称为链接法(chaining) 。

![输入图片说明](https://images.gitee.com/uploads/images/2020/1113/221940_f35323bb_508704.png "屏幕截图.png")

在链接法中，把散列到同一槽中的所有元素都放在一个链表中，如图5-40所示。

槽j中有一个指针，它指向由所有散列到j的元素构成的链表的头；如果不存在这样的元素，则j中为NULL。

![输入图片说明](https://images.gitee.com/uploads/images/2020/1113/222107_2b37ff51_508704.png "屏幕截图.png")

最后要考虑的是哈希函数。

哈希函数h必须可以很好地进行散列。最好的情况是能避免碰撞的发生。即使不能避免，也应该使碰撞在最小程度下产生。

一般来说，都将关键字转换成自然数，然后通过除法散列、乘法散列或全域散列来实现。数据库中一般采用除法散列的方法。

在哈希函数的除法散列法中，通过取k除以m的余数，将关键字k映射到m个槽的某一个去，即哈希函数为：

```
h(k) = k mod m
```

## 5.7.2 InnoDB存储引擎中的哈希算法

InnoDB存储引擎使用哈希算法来对字典进行查找， 其冲突机制采用链表方式， 哈希函数采用除法散列方式。

对于缓冲池页的哈希表来说，在缓冲池中的Page页都有一个chain指针，它指向相同哈希函数值的页

。而对于除法散列，m的取值为略大于2倍的缓冲池页数量的质数。例如：当前参数innodb_buffer_pool_size的大小为10M， 则共有640个16KB的页。

对于缓冲池页内存的哈希表来说，需要分配640×2=1280个槽，但是由于1280不是质数，需要取比1280略大的一个质数，应该是1399，所以在启动时会分配1399个槽的哈希表，用来哈希查询所在缓冲池中的页。

那么InnoDB存储引擎的缓冲池对于其中的页是怎么进行查找的呢?

上面只是给出了一般的算法，怎么将要查找的页转换成自然数呢?

其实也很简单，InnoDB存储引擎的表空间都有一个space_id， 用户所要查询的应该是某个表空间的某个连续16KB的页， 即偏移量offset。

InnoDB存储引擎将space_id左移20位， 然后加上这个space_id和offset，即关键字 K=space_id<<20+space_id+offset ，然后通过除法散列到各个槽中去。

## 5.7.3 自适应哈希索引

自适应哈希索引采用之前讨论的哈希表的方式实现。

不同的是，这仅是数据库自身创建并使用的，DBA本身并不能对其进行干预。

自适应哈希索引经哈希函数映射到一个哈希表中， 因此对于字典类型的查找非常快速，如 `SELECT * FROM TABLE WHERE index_col='xxx'`。

但是对于范围查找就无能为力了。

由于自适应哈希索引是由InnoDB存储引擎自己控制的， 因此这里的这些信息只供参考。

不过可以通过参数 `innodb_adaptive_hash_index` 来禁用或启动此特性， 默认为开启。

# 5.8 全文检索

## 5.8.1 概述

通过前面章节的介绍，已经知道B+树索引的特点，可以通过索引字段的前缀(prefix) 进行查找。

例如， 对于下面的查询B+树索引是支持的：

```sql
SELECT * FROM blog WHERE content like 'xxx'
```

上述SQL语句可以查询博客内容以xxx开头的文章， 并且只要content添加了B+树索引，就能利用索引进行快速查询。

然而实际这种查询不符合用户的要求，因为在更多的情况下，用户需要查询的是博客内容包含单词xxx的文章，即：

```sql
SELECT * FROM blog WHERE content like `xxx'
```

根据B+树索引的特性， 上述SQL语句即便添加了B+树索引也是需要进行索引的扫描来得到结果。

类似这样的需求在互联网应用中还有很多。

例如，搜索引擎需要根据用户输人的关键字进行全文查找，电子商务网站需要根据用户的查询条件，在可能需要在商品的详细介绍中进行查找，这些都不是B+树索引所能很好地完成的工作。

**全文检索(Full-TextSearch) 是将存储于数据库中的整本书或整篇文章中的任意内容信息查找出来的技术**。

它可以根据需要获得全文中有关章、节、段、句、词等信息，也可以进行各种统计和分析。

在之前的MySQL数据库中，InnoDB存储引擎并不支持全文检索技术。
 
大多数的用户转向MyISAM存储引擎，这可能需要进行表的拆分， 并将需要进行全文检索的数据存储为MyISAM表。

这样的确能够解决逻辑业务的需求， 但是却丧失了InnoDB存储引擎的事务性，而这在生产环境应用中同样是非常关键的。

从InnoDB1.2.x版本开始，InnoDB存储引擎开始支持全文检索， 其支持MyISAM存储引擎的全部功能，并且还支持其他的一些特性，这些将在后面的小节中进行介绍。

## 5.8.2 倒排索引

全文检索通常使用倒排索引(invertedindex)来实现。

倒排索引同B+树索引一样，也是一种索引结构。

它在辅助表(auxiliarytable) 中存储了单词与单词自身在一个或多个文档中所在位置之间的映射。

这通常利用关联数组实现，其拥有两种表现形式：

- inverted file index， 其表现形式为{单词， 单词所在文档的ID}

- full inverted index， 其表现形式为{单词，(单词所在文档的ID，在具体文档中的位置) }

## 5.8.3InnoDB全文检索

InnoDB存储引擎从1.2.x版本开始支持全文检索的技术， 其采用fullinvertedindex的方式。

在InnoDB存储引擎中， 将(DocumentId，Position) 视为一个“i list”。

因此在全文检索的表中， 有两个列，一个是word字段， 另一个是i list字段， 并且在word字段上有设有索引。

此外， 由于InnoDB存储引擎在ilist字段中存放了Position信息， 故可以进行ProximitySearch， 而MyISAM存储引擎不支持该特性。

正如之前所说的那样， 倒排索引需要将word存放到一张表中，这个表称为Auxiliary Table (辅助表)。

在InnoDB存储引擎中，为了提高全文检索的并行性能， 共有6张Auxiliary Table ， 目前每张表根据word的Latin编码进行分区。

Auxiliary Table是持久的表， 存放于磁盘上。

然而在InnoDB存储引擎的全文索引中， 还有另外一个重要的概念FTSIndexCache(全文检索索引缓存)， 其用来提高全文检索的性能。

FTS Index Cache是一个红黑树结构， 其根据(word，ilist) 进行排序。

这意味着插人的数据已经更新了对应的表， 但是对全文索引的更新可能在分词操作后还在FTSIndexCache中，AuxiliaryTable可能还没有更新。

InnoDB存储引擎会批量对AuxiliaryTable进行更新， 而不是每次插人后更新一次AuxiliaryTable。

当对全文检索进行查询时，Auxiliary Table首先会将在FTSIndexCache中对应的word字段合并到Auxiliary Table中， 然后再进行查询。

这种merge操作非常类似之前介绍的InsertBuffer的功能，不同的是InsertBuffer是一个持久的对象，并且其是B+树的结构。

然而FTSIndexCache的作用又和InsertBuffer是类似的，它提高了InnoDB存储引擎的性能，并且由于其根据红黑树排序后进行批量插人， 其产生的AuxiliaryTable相对较小。

InnoDB存储引擎允许用户查看指定倒排索引的AuxiliaryTable中分词的信息， 可以通过设置参数innodb_ft_aux_table来观察倒排索引的AuxiliaryTable。
    
下面的SQL语句设置查看test架构下表fts_a的AuxiliaryTable：

```sql
mysql>SET GLOBAL innodb_ft_aux_table ='test/fts_a'；
Query OK ，Orowsaffected(0.00sec)
```

在上述设置完成后， 就可以通过查询information_schema架构下的表INNODB_FT_INDEX_TABLE得到表fts_a中的分词信息。

对于其他数据库， 如Oracle 11g， 用户可以选择手工在事务提交时，或者固定间隔时间时将倒排索引的更新刷新到磁盘。

对于InnoDB存储引擎而言， 其总是在事务提交时将分词写人到FTSIndexCache， 然后再通过批量更新写人到磁盘。

虽然InnoDB存储引擎通过一种延时的、批量的写人方式来提高数据库的性能，但是上述操作仅在事务提交时发生。

当数据库关闭时，在FTSIndexCache中的数据库会同步到磁盘上的AuxiliaryTable中。然而， 如果当数据库发生宕机时，一些FTSIndexCache中的数据库可能未被同步到磁盘上。那么下次重启数据库时，当用户对表进行全文检索(查询或者插人操作)时，InnoDB存储引擎会自动读取未完成的文档， 然后进行分词操作， 再将分词的结果放人到FTSIndexCache中。

参数innodb_ft_cache_size用来控制FTSIndexCache的大小， 默认值为32M。

当该缓存满时，会将其中的(word，ilist)分词信息同步到磁盘的AuxiliaryTable中。增大该参数可以提高全文检索的性能，但是在宕机时，未同步到磁盘中的索引信息可能需要更长的时间进行恢复。



# 小结


# 参考资料

《mysql 技术内幕》

https://xiaolincoding.com/mysql/index/why_index_chose_bpuls_tree.html#mysql-%E4%B8%AD%E7%9A%84-b-%E6%A0%91

* any list
{:toc}

