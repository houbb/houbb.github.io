---
layout: post
title: 关于 mysql 数据存储，你了解多少？
date: 2018-11-28 19:30:44 +0800
categories: [Database]
tags: [database, mysql, sh]
published: true
---

# 前言

大家都知道 MySQL 的数据都是保存在磁盘的，那具体是保存在哪个文件呢？

MySQL 存储的行为是由存储引擎实现的，MySQL 支持多种存储引擎，不同的存储引擎保存的文件自然也不同。

InnoDB 是我们常用的存储引擎，也是 MySQL 默认的存储引擎。本文主要以 InnoDB 存储引擎展开讨论。

# InnoDB简介

InnoDB是一个将表中的数据存储到磁盘上的存储引擎。而真正处理数据的过程是发生在内存中的，所以需要把磁盘中的数据加载到内存中，如果是处理写入或修改请求的话，还需要把内存中的内容刷新到磁盘上。

而我们知道读写磁盘的速度非常慢，和内存读写差了几个数量级。

所以当我们想从表中获取某些记录时，InnoDB存储引擎需要一条一条的把记录从磁盘上读出来么？

想要了解这个问题，我们首先需要了解InnoDB的存储结构是怎样的。

![InnoDB的存储结构](https://img-blog.csdnimg.cn/dbf3601d148a402e8e93b5ac1aa6848f.png)

InnoDB采取的方式是：将数据划分为若干个页，以页作为磁盘和内存之间交互的基本单位innodb_page_size选项指定了MySQL实例的所有InnoDB表空间的页面大小。

这个值是在创建实例时设置的，之后保持不变。有效值为64KB，32KB，16KB(默认值 )，8kB和4kB。也就是在一般情况下，一次最少从磁盘中读取16KB的内容到内存中，一次最少把内存中的16KB内容刷新到磁盘中。


# InnoDB 行格式

我们平时是以记录为单位来向表中插入数据的，这些记录在磁盘上的存放方式也被称为行格式或者记录格式。

一行记录可以以不同的格式存在InnoDB中，行格式分别是compact、redundant、dynamic和compressed行格式。

可以在创建或修改的语句中指定行格式：

```sql
-- 创建数据表时,显示指定行格式
CREATE TABLE 表名 (列的信息) ROW_FORMAT=行格式名称;
-- 创建数据表时,修改行格式
ALTER TABLE 表名 ROW_FORMAT=行格式名称;
-- 查看数据表的行格式
show table status like '<数据表名>';
```

mysql5.0之前默认的行格式是redundant，mysql5.0之后的默认行格式为compact ， 5.7之后的默认行格式为dynamic

## compact 格式

![行格式](https://img-blog.csdnimg.cn/8c29546065be485a9c8a9024658f2aad.png)

### 记录的额外信息

记录的额外信息：分别是变长字段长度列表、NULL值列表和记录头信息

#### 1：变长字段长度列表

mysql中支持一些变长数据类型（比如VARCHAR(M)、TEXT等），它们存储数据占用的存储空间不是固定的，而是会随着存储内容的变化而变化。

在Compact行格式中，把所有变长字段的真实数据占用的字节长度都存放在记录的开头部位，从而形成一个变长字段长度列表，各变长字段数据占用的字节数按照列的顺序逆序存放

- 变长字段长度列表中只存储值为 非NULL 的列内容占用的长度，值为 NULL 的列的长度是不储存的 。

- 并不是所有记录都有这个 变长字段长度列表 部分，比方说表中所有的列都不是变长的数据类型的话，这一部分就不需要有

#### 2：NULL值列表

NULL值列表：Compact格式会把所有可以为NULL的列统一管理起来，存在一个NULL值列表，如果表中没有允许为NULL的列，则NULL值列表也不复存在了。

为什么要有NULL值列表？

表中的某些列可能存储NULL值，如果把这些NULL值都放到记录的真实数据中存储会很浪费空间，所以Compact行格式把这些值为NULL的列统一管理起来，存储到NULL值列表中，它的处理过程是这样的：

- 首先统计表中允许存储NULL的列有哪些。

- 根据列的实际值，用0或者1填充NULL值列表，1代表该列的值为空，0代表该列的值不为空。

- 如果表中没有允许存储 NULL 的列，则 NULL值列表 也不存在了。

#### 3：记录头信息

| 名称 | 大小(单位:bit) | 描述 |
|:---|:---|:---|
| 预留位1 | 1 |  未使用 |
| 预留位2  | 1  | 未使用 |
| delete_mask  | 1  | 标记改记录是否被删除 |
| min_rec_mask  | 1  | B+树非叶子节点中最小记录都会添加该标记 |
| n_owned  | 4  | 当前记录拥有的记录数 |
| heap_no  | 13  | 当前记录在记录堆的位置信息 |
| record_type  | 3  | 记录类型  0：普通记录/1：B+树非叶子节点记录/2：最小记录/3：最大记录 |
| next_record  | 16  | 下一条记录的相对位置 |

## redundant 格式

与compact 格式相比, 没有了 变长字段列表以及 NULL值列表, 取而代之的是 记录了所有真实数据的偏移地址表 ，偏移地址表 是倒序排放的, 但是计算偏移量却还是正序开始的从row_id作为第一个, 第一个从0开始累加字段对应的字节数。

在记录头信息中, 大部分字段和compact 中的相同，但是对比compact多了。

n_field(记录列的数量)、1byte_offs_flag(字段长度列表每一列占用的字节数)，少了record_type字段。

因为redundant是mysql 5.0 以前就在使用的一种格式, 已经非常古老, 使用频率非常的低，这里就不过多表述。

## dynamic 格式

在现在 mysql 5.7 的版本中,使用的格式就是 dynamic。

dynamic 和 compact 基本是相同的，只有在溢出页的处理上面,有所不同。

在compact行格式中，对于占用存储空间非常大的列，在记录的真实数据处只会存储该列的前768个字节的数据，把剩余的数据分散存储在几个其他的页中，然后记录的真实数据处用20个字节存储指向这些页的地址，从而可以找到剩余数据所在的页。

![dynamic 格式](https://img-blog.csdnimg.cn/b0c1fa5d784e49759ff78d16b22b815e.png)

这种在本记录的真实数据处只会存储该列的前768个字节的数据和一个指向其他页的地址，然后把剩下的数据存放到其他页中的情况就叫做行溢出，存储超出768字节的那些页面也被称为溢出页（uncompresse blob page）。

dynamic中会直接在真实数据区记录 20 字节 的溢出页地址, 而不再去额外记录一部分的数据了。

## 行溢出临界点

MySQL中规定一个页中至少存放两行记录。

简单理解：因为B+树的特性，如果不存储至少2条记录，则这个B+树是没有意义的，形不成一个有效的索引。

每个页除了存放我们的记录以外，也需要存储一些额外的信息，大概132个字节。

每个记录需要的额外信息是27字节。假设一个列中存储的数据字节数为n，如要要保证该列不发生溢出，则需要满足：132 + 2×(27 + n) < 16384 结果是n < 8099。也就是说如果一个列中存储的数据小于8099个字节，那么该列就不会成为溢出列。如果表中有多个列，那么这个值更小。

## compressed 格式

compressed 格式将会在Dynamic 的基础上面进行压缩处理特别是对溢出页的压缩处理，存储在其中的行数据会以zlib的算法进行压缩，因此对于blob、text这类大长度类型的数据能够进行非常有效的存储。但compressed格式其实也是以时间换空间，性能并不友好，并不推荐在常见的业务中使用。

# InnoDB 数据页结构

数据页代表的这块16KB大小的存储空间可以被划分为多个部分，不同部分有不同的功能

| 名称 			 | 	中文名  | 大小  | 描述 |
|:----|:----|:----|:----|
| File Header 	 | 文件头部  | 38字节  | 页通用信息 |
| Page Header    | 页面头部  | 56字节  | 页专有信息 |
| infimun + supermun  | 最小记录和最大记录  | 26字节  | 虚拟的行记录 |
| User Rcords  | 用户记录  | 不确定  | 实际存储的行记录内容 |
| Free Space  | 空闲空间  | 不确定 |  页中未使用的空间 |
| Page Directory  | 页面目录  | 不确定  | 页中一些记录的相对位置 |
| File Tariler   | 文件尾部  | 8字节  | 校验页的完整性 |

每当我们插入一条记录，都会从Free Space部分，也就是尚未使用的存储空间中申请一个记录大小的空间划分到User Records部分，当Free Space部分的空间全部被User Records部分替代掉之后，也就意味着这个页使用完了，如果还有新的记录插入的话，就需要去申请新的页了，这个过程的图示如下：

![数据页结构](https://img-blog.csdnimg.cn/c40a146b3cbf4b67836ed1c23fdecc1b.png)

为了方便讲述，先创建一个表：

```sql
 CREATE TABLE test(
         a1 INT,
         a2 INT,
         a3 VARCHAR(100),
         PRIMARY KEY (a1)
     ) CHARSET=ascii ROW_FORMAT=Compact;
```

test表中插入几条记录：

```sql
INSERT INTO test VALUES(1, 10, 'aaa'); 
INSERT INTO test VALUES(2, 20, 'bbb'); 
INSERT INTO test VALUES(3, 30, 'ccc'); 
INSERT INTO test VALUES(4, 40, 'ddd');
```

这些记录，就如下图所示，存储在 User Rcords 里

![User Rcords](https://img-blog.csdnimg.cn/95b68bcc3e134a799b26c910354ec621.png)

delete_mask这个属性标记着当前记录是否被删除。这些被删除的记录之所以不立即从磁盘上移除，是因为移除它们之后把其他的记录在磁盘上重新排列需要性能消耗，所以只是打一个删除标记而已。所有被删除掉的记录都会组成一个所谓的垃圾链表，在这个链表中的记录占用的空间称之为所谓的可重用空间，之后如果有新记录插入到表中的话，可能把这些被删除的记录占用的存储空间覆盖掉。

min_rec_maskB+树的每层非叶子节点中的最小记录都会添加该标记，min_rec_mask值都是0，意味着它们都不是B+树的非叶子节点中的最小记录。

n_owned在页目录分组时使用，每个组的最后一条记录（也就是组内最大的那条记录）的头信息中的n_owned属性表示该记录拥有多少条记录，也就是该组内共有几条记录。

heap_no这个属性表示当前记录在本页中的位置，从图中可以看出来，我们插入的4条记录在本页中的位置分别是：2、3、4、5。heap_no值为0和1的记录，称为伪记录或者虚拟记录。这两个伪记录一个代表最小记录，一个代表最大记录。

record_type这个属性表示当前记录的类型，一共有4种类型的记录，0表示普通记录，1表示B+树非叶节点记录，2表示最小记录，3表示最大记录。

next_record它表示从当前记录的真实数据到下一条记录的真实数据的地址偏移量。比方说第一条记录的next_record值为32，意味着从第一条记录的真实数据的地址处向后找32个字节便是下一条记录的真实数据。下一条记录指得并不是按照我们插入顺序的下一条记录，而是按照主键值由小到大的顺序的下一条记录。而且规定Infimum记录（也就是最小记录） 的下一条记录就是本页中主键值最小的用户记录，而本页中主键值最大的用户记录的下一条记录就是 Supremum记录（也就是最大记录）。

![nex record](https://img-blog.csdnimg.cn/626cb8cb60914147ab81b72798de021a.png)

## Page Directory（页目录）

现在我们了解了记录在页中按照主键值由小到大顺序串联成一个单链表，单向链表的特点就是插入、删除非常方便，但是检索效率不高，最差的情况下需要遍历链表上的所有节点才能完成检索。

因此在页结构中专门设计了页目录这个模块，专门给记录做一个目录，通过二分查找法的方式进行检索，提升效率。

1：将所有正常的记录（包括最大和最小记录，不包括标记为已删除的记录）划分为几个组。

2：每个组的最后一条记录（也就是组内最大的那条记录）的头信息中的n_owned属性表示该记录拥有多少条记录，也就是该组内共有几条记录。

3：将每个组的最后一条记录的地址偏移量单独提取出来，用作查找。

注意：这个页目录是为主键服务的。

![Page Directory](https://img-blog.csdnimg.cn/85494ab57b1e45f8acf3c75328b62f26.png)

需要注意的是：

第一：第一个小组，也就是最小记录所在的分组只能有1个记录;

第二：最后一个小组，就是最大记录所在的分组，只能有1-8条记录;

第三：剩下的分组中记录的条数范围只能在是 4-8 条之间；

分组是按照下边的步骤进行：

初始情况下一个数据页里只有最小记录和最大记录两条记录，它们分属于两个分组。

之后每插入一条记录，都会从页目录中找到主键值比本记录的主键值大并且差值最小的槽，然后把该槽对应的记录的n_owned值加1，表示本组内又添加了一条记录，直到该组中的记录数等于8个。

在一个组中的记录数等于8个后再插入一条记录时，会将组中的记录拆分成两个组，一个组中4条记录，另一个5条记录。这个过程会在页目录中新增一个槽来记录这个新增分组中最大的那条记录的偏移量。

我们再添加8条记录看看效果：

```sql
INSERT INTO test VALUES(5, 50, 'eee'); 
INSERT INTO test VALUES(6, 60, 'fff'); 
INSERT INTO test VALUES(7, 70, 'ggg'); 
INSERT INTO test VALUES(8, 80, 'hhh'); 
INSERT INTO test VALUES(9, 90, 'iii');
INSERT INTO test VALUES(10, 100, 'jjj');
INSERT INTO test VALUES(11, 110, 'kkk');
INSERT INTO test VALUES(12, 120, 'lll');
```

![插入数据之后](https://img-blog.csdnimg.cn/6adb6143c7804054b7378aa8587608c1.png)

这里为了便于理解，图中只保留了用户记录头信息中的n_owned和next_record属性。
因为各个槽代表的记录的主键值都是从小到大排序的，所以我们可以使用二分法来进行快速查找。

所以在一个数据页中查找指定主键值的记录的过程分为两步：

1.通过二分法确定该记录所在的槽，并找到该槽所在分组中主键值最大的那条记录。
2.通过记录的next_record属性遍历该槽所在的组中的各个记录。

比方说我们查找主键值为x的记录，计算中间槽的位置(min+max)/2 =mid,查看mid槽对应的主键值y，若 x < y,则min不变，max=mid，若 x > y，则max不变，min=mid。依此类推。

举例：我们想找主键值为6的记录，过程是这样的计算中间槽的位置：(0+3)/2=1，所以查看槽1对应记录的主键值为4，因为4 < 6，所以设置low=1，high保持不变。因为high - low的值为1，所以确定主键值为6的记录在槽2对应的组中。我们可以很轻易的拿到槽1对应的记录（主键值为4），该条记录的下一条记录就是槽2中主键值最小的记录，该记录的主键值为5。所以我们可以从这条主键值为5的记录出发，遍历槽2中的各条记录找到主键为6 的数据。

注意：若查到数据在槽2的分组中，由于槽2是指向最后一个记录，所以需要向上找一个槽位，定位到上一个槽位最后一行，然后再向下找。

## File Header（文件头部）

File Header针对各种类型的页都通用，也就是说不同类型的页都会以File Header作为第一个组成部分，它描述了一些针对各种页都通用的一些信息，比方说这个页的编号是多少，它的上一个页、下一个页是谁等。

FIL_PAGE_OFFSET每一个页都有一个单独的页号，就跟你的身份证号码一样，InnoDB通过页号来可以唯一定位一个页。

FIL_PAGE_PREV和FIL_PAGE_NEXTFIL_PAGE_PREV和FIL_PAGE_NEXT就分别代表本页的上一个和下一个页的页号。

这样通过建立一个双向链表把许许多多的页就都串联起来了。

![File Header](https://img-blog.csdnimg.cn/b122cd7401a748bca686ab3547a245fc.png)

# B+树索引

InnoDB数据页的主要组成部分。各个数据页可以组成一个双向链表，而每个数据页中的记录会按照主键值从小到大的顺序组成一个单向链表，每个数据页都会为存储在它里边儿的记录生成一个页目录。

再通过主键查找某条记录的时候可以在页目录中使用二分法快速定位到对应的槽。

1) 在一个页中的查找：

以主键为搜索条件这个查找过程我们已经很熟悉了，可以在页目录中使用二分法快速定位到对应的槽，然后再遍历该槽对应分组中的记录即可快速找到指定的记录。

以其他列作为搜索条件对非主键列的查找的过程可就不这么幸运了，因为在数据页中并没有对非主键列建立所谓的页目录，所以我们无法通过二分法快速定位相应的槽。

这种情况下只能从最小记录开始依次遍历单链表中的每条记录，然后对比每条记录是不是符合搜索条件。

2) 在很多页中查找：

1：定位到记录所在的页。

2：从所在的页内中查找相应的记录。

在没有索引的情况下，不论是根据主键列或者其他列的值进行查找，由于我们并不能快速的定位到记录所在的页，所以只能从第一个页沿着双向链表一直往下找，在每一个页中根据我们上面聊过的查找方式去查找指定的记录。

## 索引

同样的，我们以上面建的表test为例，清空插入的数据，此时test表为一张空数据的表，为了便于讲述，我们可以简单的把test表的行格式理解如下：

```
record_type | next_record | a1 | a2 | a3 | 其他信息
```

一个简单的索引方案：我们为根据主键值快速定位一条记录在页中的位置而设立的页目录，目录中记录的数据页需要满足下一个数据页中用户记录的主键值必须大于上一个页中用户记录的主键值。

假设我们的每个数据页最多能存放3条记录（实际上一个数据页非常大，可以存放下很多记录），这时候我们向test表插入三条记录，那么数据页就如图所示：

```sql
INSERT INTO test VALUES(1, 10, 'aa'); 
INSERT INTO test VALUES(2, 20, 'bb'); 
INSERT INTO test VALUES(4, 40, 'dd');
```

![索引](https://img-blog.csdnimg.cn/11e429131c8149559967e6434fb174a8.png)

此时我们再来插入一条记录：

```sql
INSERT INTO test VALUES(3, 30, 'cc');
```

因为上面定义了，一个页最多只能放3条记录，所以我们不得不再分配一个新页：

![分配新页](https://img-blog.csdnimg.cn/b32a2c745e994fb8a4b26b061d51b8e1.png)

页1中用户记录最大的主键值是4，而页2中有一条记录的主键值是3，因为4 > 3，所以这就不符合下一个数据页中用户记录的主键值必须大于上一个页中用户记录的主键值的要求，所以在插入主键值为3的记录的时候需要伴随着一次记录移动，也就是把主键值为4的记录移动到页2中，然后再把主键值为3的记录插入到页1中。

最后形成如图所示。

![分裂](https://img-blog.csdnimg.cn/021891dc06f84aa9ae16a2188e8821b7.png)

这个过程叫做**页分裂**。

真实数据存储中，数据页的编号并不是连续的，当我们在test表中插入多条记录后，可能是这样的效果：

![不连续](https://img-blog.csdnimg.cn/b4c1708f0bd54cd888d956cc00718f19.png)

因为这些16KB的页在物理存储上可能并不挨着，所以如果想从这么多页中根据主键值快速定位某些记录所在的页，我们需要给它们做个目录，每个页对应一个目录项，每个目录项由页中记录的最小主键值和页号组成。

我们为上面几个页做目录，则如图：

![页目录](https://img-blog.csdnimg.cn/bf3af8b30c684293aeec455614764455.png)

比方说我们想找主键值为5的记录，具体查找过程分两步：

1：先从目录项中根据二分法快速确定出主键值为5的记录在目录2中（因为 4 < 5 < 7），它对应的数据页是页23。

2：再根据前边说的在页中查找记录的方式去页23中定位具体的记录。

这个目录有一个别名，称为**索引**。

## InnoDB中的索引方案

在InnoDB中复用了之前存储用户记录的数据页来存储目录项，为了和用户记录做一下区分，我们把这些用来表示目录项的记录称为目录项记录。

用record_type来区分普通的用户记录还是目录项记录。

![在这里插入图片描述](https://img-blog.csdnimg.cn/ddca40646e0240809a6e3479408b5d1b.png)

如果表中的数据太多，以至于一个数据页不足以存放所有的目录项记录，会再多整一个存储目录项记录的页。

所以如果此时我们再向上图中插入一条主键值为10的用户记录的话：

![在这里插入图片描述](https://img-blog.csdnimg.cn/7f1d9a1992fe4bc285b2752d9f46f346.png)

在查询时我们需要定位存储目录项记录的页，但是这些页在存储空间中也可能不挨着，如果我们表中的数据非常多则会产生很多存储目录项记录的页，那我们怎么根据主键值快速定位一个存储目录项记录的页呢？

其实也简单，为这些存储目录项记录的页再生成一个更高级的目录，就像是一个多级目录一样，大目录里嵌套小目录，小目录里才是实际的数据，所以现在各个页的示意图就是这样子：

![在这里插入图片描述](https://img-blog.csdnimg.cn/8a32795e90834af9890dd7adeb2c6a98.png)

用户记录其实都存放在B+树的最底层的节点上，这些节点也被称为叶子节点或叶节点，其余用来存放目录项的节点称为非叶子节点或者内节点，其中B+树最上边的那个节点也称为根节点。

## 聚簇索引

我们上边介绍的B+树本身就是一个目录，或者说本身就是一个索引。

它有两个特点：

1：使用记录主键值的大小进行记录和页的排序

2：B+树的叶子节点存储的是完整的用户记录。

我们把具有这两种特性的B+树称为聚簇索引，所有完整的用户记录都存放在这个聚簇索引的叶子节点处。

这种聚簇索引并不需要我们在MySQL语句中显式的使用INDEX语句去创建，InnoDB存储引擎会自动的为我们创建聚簇索引。

另外有趣的一点是，在InnoDB存储引擎中，聚簇索引就是数据的存储方式（所有的用户记录都存储在了叶子节点），也就是所谓的索引即数据，数据即索引。

## 二级索引

![二级索引](https://img-blog.csdnimg.cn/63f124708bf142f782354f591ca4ae8a.png)

这个B+树与上边介绍的聚簇索引有几处不同：

使用记录a2列的大小进行记录和页的排序

页内的记录是按照a2列的大小顺序排成一个单向链表。

各个存放用户记录的页也是根据页中记录的a2列大小顺序排成一个双向链表。

存放目录项记录的页分为不同的层次，在同一层次中的页也是根据页中目录项记录的a2列大小顺序排成一个双向链表。

B+树的叶子节点存储的并不是完整的用户记录，而只是a2列+主键这两个列的值。

目录项记录中不再是主键+页号的搭配，而变成了a2列+页号的搭配。

## 索引的代价

1：空间上的代价每建立一个索引都要为它建立一棵B+树，每一棵B+树的每一个节点都是一个数据页，一个页默认会占用16KB的存储空间。

2：时间上的代价每次对表中的数据进行增、删、改操作时，都需要去修改各个B+树索引。

B+树每层节点都是按照索引列的值从小到大的顺序排序而组成了双向链表。

不论是叶子节点中的记录，还是内节点中的记录（也就是不论是用户记录还是目录项记录）都是按照索引列的值从小到大的顺序而形成了一个单向链表。

而增、删、改操作可能会对节点和记录的排序造成破坏，所以存储引擎需要额外的时间进行一些记录移位，页面分裂、页面回收等操作来维护好节点和记录的排序。

# 参考资料

[关于Mysql数据存储，你了解多少？](https://mp.weixin.qq.com/s/r-RPEoqvgERfYOjYeFPoIg)

* any list
{:toc}