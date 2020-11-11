---
layout: post
title:  mysql（5）表
date:  2020-10-17 16:15:55 +0800
categories: [Database]
tags: [database, mysql, sf]
published: true
---

# 4.1索引组织表

在InnoDB存储引擎中， 表都是根据主键顺序组织存放的， 这种存储方式的表称为索引组织表(index organized table) 。

在InnoDB存储引擎表中， 每张表都有个主键(PrimaryKey) ， 如果在创建表时没有显式地定义主键， 则InnoDB存储引擎会按如下方式选择或创建主键：

（1）首先判断表中是否有非空的唯一索引(Unique NOT NULL) ， 如果有， 则该列即为主键。

（2）如果不符合上述条件， InnoDB存储引擎自动创建一个6字节大小的指针。

当表中有多个非空唯一索引时， InnoDB存储引擎将选择建表时第一个定义的非空唯一索引为主键。

这里需要非常注意的是，主键的选择根据的是定义索引的顺序，而不是建表时列的顺序。

## 例子

看下面的例子：

```sql
create table t(
 a int not null,
 b int null,
 c int not null,
 d int not null,
 unique key (b),
 unique key (c),
 unique key (d)
);
```

问，谁是主键?

```sql
insert into t (a, b, c, d) values (11, 21, 31, 41);
insert into t (a, b, c, d) values (12, 22, 32, 42);
insert into t (a, b, c, d) values (13, 23, 33, 43);
insert into t (a, b, c, d) values (14, 24, 34, 44);
```

查看一下数据

```
select a, b, c, d, _rowid from t;
```

结果如下：

```
mysql> select a, b, c, d, _rowid from t;
+----+------+----+----+--------+
| a  | b    | c  | d  | _rowid |
+----+------+----+----+--------+
| 11 |   21 | 31 | 41 |     31 |
| 12 |   22 | 32 | 42 |     32 |
| 13 |   23 | 33 | 43 |     33 |
| 14 |   24 | 34 | 44 |     34 |
+----+------+----+----+--------+
4 rows in set (0.00 sec)
```

说明 c 是主键列。

这里的 `_rowid` 其实有一定的限制：

为在某些情况下_rowid是不存在的，其只存在于以下情况：

（1）当表中存在一个数字类型的单列主键时，_rowid其实就是指的是这个主键列

（2）当表中不存在主键但存在一个数字类型的非空唯一列时，_rowid其实就是指的是对应非空唯一列。


# 4.2 InnoDB 逻辑存储结构

从InnoDB存储引擎的逻辑存储结构看， 所有数据都被逻辑地存放在一个空间中， 称之为表空间(tablespace) 。

表空间又由段(segment) 、区(extent) 、页(page) 组成。

页在一些文档中有时也称为块(block) ，InnoDB存储引擎的逻辑存储结构大致如图4-1所示。

![输入图片说明](https://images.gitee.com/uploads/images/2020/1111/220255_786bf146_508704.png "屏幕截图.png")

## 4.2.1表空间

表空间可以看做是InnoDB存储引擎逻辑结构的最高层， 所有的数据都存放在表空间中。

第3章中已经介绍了在默认情况下InnoDB存储引擎有一个共享表空间ib data l，即所有数据都存放在这个表空间内。如果用户启用了参数innodb_file_per_table， 则每张表内的数据可以单独放到一个表空间内。

如果启用了 `innodb_fle_per_table` 的参数， 需要注意的是每张表的表空间内存放的只是数据、索引和插入缓冲Bitmap页， 其他类的数据， 如回滚(undo) 信息， 插人缓冲索引页、系统事务信息， 二次写缓冲(Double write buffer) 等还是存放在原来的共享表空间内。

这同时也说明了另一个问题：即使在启用了参数innodb_fe_per_table之后， 共享表空间还是会不断地增加其大小。

可以来做一个实验， 在实验之前已经将innodb_fle_per_table设为ON了。

现在看看初始共享表空间文件的大小：

```
mysql> show variables like '%innodb_file_per_table%' \G
*************************** 1. row ***************************
Variable_name: innodb_file_per_table
        Value: ON
1 row in set, 1 warning (0.01 sec)
```


## 4.2.2段

图4-1中显示了表空间是由各个段组成的，常见的段有数据段、索引段、回滚段等。

因为前面已经介绍过了InnoDB存储引擎表是索引组织的(indexorganized) ， 因此数据即索引， 索引即数据。

那么数据段即为B+树的叶子节点(图4-1的Leafnodesegment) ，索引段即为B+树的非索引节点(图4-1的Non-leafnodesegment) 。

回滚段较为特殊，将会在后面的章节进行单独的介绍。

在InnoDB存储引擎中， 对段的管理都是由引擎自身所完成，DBA不能也没有必要对其进行控制。

这和Oracle数据库中的自动段空间管理(ASSM) 类似，从一定程度上简化了DBA对于段的管理。

## 4.2.3 区

区是由连续页组成的空间，在任何情况下每个区的大小都为1MB。

为了保证区中页的连续性，InnoDB存储引擎一次从磁盘申请4~5个区。在默认情况下，InnoDB存储引擎页的大小为16KB，即一个区中一共有64个连续的页。

InnoDB1.0.x版本开始引人压缩页， 即每个页的大小可以通过参数KEY_BLOCKSIZE设置为2K、4K、8K， 因此每个区对应页的数量就应该为512、256、128。

InnoDB1.2.x版本新增了参数innodb_page_size ， 通过该参数可以将默认页的大小设置为4K、8K，但是页中的数据库不是压缩。

这时区中页的数量同样也为256、128。总之，不论页的大小怎么变化，区的大小总是为1M。

但是，这里还有这样一个问题：在用户启用了参数innodb_file_per_talbe后， 创建的表默认大小是96KB。

区中是64个连续的页，创建的表的大小至少是1MB才对啊?其实这是因为在每个段开始时， 先用32个页大小的碎片页(fragmentpage)来存放数据，在使用完这些页之后才是64个连续页的申请。

这样做的目的是，对于一些小表，或者是undo这类的段，可以在开始时申请较少的空间，节省磁盘容量的开销。


## 4.2.4 页

同大多数数据库一样，InnoDB有页(Page)的概念(也可以称为块)， 页是InnoDB磁盘管理的最小单位。在InnoDB存储引擎中， 默认每个页的大小为16KB。

而从InnoDB1.2.x版本开始， 可以通过参数innodb_page_size将页的大小设置为4K、8K、16K。若设置完成， 则所有表中页的大小都为innodb_page_size，不可以对其再次进行修改。除非通过mysqldump导人和导出操作来产生新的库。

在InnoDB存储引擎中， 常见的页类型有：

- 数据页(B-treeNode)

- undo页(undoLogPage)

- 系统页(SystemPage)

- 事务数据页(TransactionsystemPage)

- 插入缓冲位图页(InsertBufferBitmap)

- 插入缓冲空闲列表页(InsertBufferFreeList)

- 未压缩的二进制大对象页(UncompressedBLOBPage)

- 压缩的二进制大对象页(compressedBLOBPage)

## 4.2.5 行

InnoDB存储引擎是面向列的(row-oriented)， 也就说数据是按行进行存放的。

每个页存放的行记录也是有硬性定义的，最多允许存放16KB/2-200行的记录，即7992行记录。

这里提到了row-oriented的数据库， 也就是说， 存在有column-oriented的数据库。

MySQL info bright存储引擎就是按列来存放数据的， 这对于数据仓库下的分析类SQL语句的执行及数据压缩非常有帮助。

类似的数据库还有Sybase IQ、GoogleBigTable。面向列的数据库是当前数据库发展的一个方向，但这超出了本书涵盖的内容，有兴趣的读者可以在网上寻找相关资料。

# 4.3 InnoDB行记录格式

InnoDB存储引擎和大多数数据库一样(如Oracle和Microsoft SQLServer数据库) ，记录是以行的形式存储的。

这意味着页中保存着表中一行行的数据。

在InnoDB 1.0.x版本之前， InnoDB存储引擎提供了Compact和Redundant两种格式来存放行记录数据， 这也是目前使用最多的一种格式。

Redundant格式是为兼容之前版本而保留的， 如果阅读过InnoDB的源代码， 用户会发现源代码中是用PHYSICAL RECORD (NEWSTYLE)和PHYSICAL RECORD (OLDSTYLE) 来区分两种格式的。

在MySQL 5.1版本中， 默认设置为Compact行格式。用户可以通过命令 `SHOW TABLE STATUS LIKE '%table_name%'` 来查看当前表使用的行格式， 其中row_format属性表示当前所使用的行记录结构类型。


如：

```
mysql> SHOW TABLE STATUS LIKE '%t%' \G;
*************************** 1. row ***************************
           Name: t
         Engine: InnoDB
        Version: 10
     Row_format: Dynamic
           Rows: 4
 Avg_row_length: 4096
    Data_length: 16384
Max_data_length: 0
   Index_length: 32768
      Data_free: 0
 Auto_increment: NULL
    Create_time: 2020-11-11 21:51:46
    Update_time: 2020-11-11 21:56:37
     Check_time: NULL
      Collation: utf8_general_ci
       Checksum: NULL
 Create_options:
        Comment:
1 row in set (0.00 sec)
```


这里的 `Row_format: Dynamic` 可以知道对应的行信息是 dynamic 模式。


## 4.3.1Compact行记录格式

Compact行记录是在MySQL 5.0中引人的， 其设计目标是高效地存储数据。简单来说，一个页中存放的行数据越多， 其性能就越高。图4-2显示了Compact行记录的存储方式：

- 图4-2Compact行记录的格式

```
| 变长字段长度列表  |  NULL标志位  | 记录头信息  | 列1数据 |  列2数据 | 
```

从图4-2可以观察到， Compact行记录格式的首部是一个非NULL变长字段长度列表，并且其是按照列的顺序逆序放置的，其长度为：

- 若列的长度小于255字节，用1字节表示；

- 若大于255个字节，用2字节表示。

变长字段的长度最大不可以超过2字节，这是因在MySQL数据库中VARCHAR类型的最大长度限制为65535。

变长字段之后的第二个部分是NULL标志位， 该位指示了该行数据中是否有NULL值， 有则用1表示。

该部分所占的字节应该为1字节。

接下来的部分是记录头信息(recordheader)， 固定占用5字节(40位)， 每位的含义见表4-1。

![输入图片说明](https://images.gitee.com/uploads/images/2020/1111/223408_347f674a_508704.png "屏幕截图.png")

最后的部分就是实际存储每个列的数据。

需要特别注意的是，NULL不占该部分任何空间， 即NULL除了占有NULL标志位， 实际存储不占有任何空间。

另外有一点需要注意的是，每行数据除了用户定义的列外，还有两个隐藏列，事务ID列和回滚指针列，分别为6字节和7字节的大小。

若InnoDB表没有定义主键， 每行还会增加一个6字节的rowid列。


## 4.3.2Redundant行记录格式

Redundant是MySQL 5.0版本之前InnoDB的行记录存储方式，MySQL5.0支持Redundant是为了兼容之前版本的页格式。

Redundant行记录采用如图4-3所示的方式存储。

- 图4-3Redundant行记录格式

```
| 字段长度偏移列表 | 记录头信息  | 列1数据 | 列2数据 | 列3数据 |
```

从图4-3可以看到， 不同于Compact行记录格式，Redundant行记录格式的首部是一个字段长度偏移列表，同样是按照列的顺序逆序放置的。

若列的长度小于255字节，用1字节表示； 若大于255字节， 用2字节表示。第二个部分为记录头信息( recordheader )， 不同于Compact行记录格式，Redundant行记录格式的记录头占用6字节(48位)， 每位的含义见表4-2。

从表4-2中可以发现，n_fields值代表一行中列的数量， 占用10位。

同时这也很好地解释了为什么MySQL数据库一行支持最多的列为1023。另一个需要注意的值为1byte_offs_flags ， 该值定义了偏移列表占用1字节还是2字节。

而最后的部分就是实际存储的每个列的数据了。

![输入图片说明](https://images.gitee.com/uploads/images/2020/1111/223818_b54e350f_508704.png "屏幕截图.png")


## 4.3.3行溢出数据

InnoDB存储引擎可以将一条记录中的某些数据存储在真正的数据页面之外。

一般认为BLOB、LOB这类的大对象列类型的存储会把数据存放在数据页面之外。

但是， 这个理解有点偏差，BLOB可以不将数据放在溢出页面， 而且即便是VARCHAR列数据类型，依然有可能被存放为行溢出数据。

首先对VARCHAR数据类型进行研究。

很多DBA喜欢MySQL数据库提供的VARCHAR类型， 因为相对于Oracle VARCHAR 2最大存放4000字节， SQLServer最大存放8000字节， MySQL数据库的VARCHAR类型可以存放65535字节。

但是， 这是真的吗?真的可以存放65535字节吗?

如果创建VARCHAR长度为65535的表， 用户会得到下面的错误信息：

```
mysql> create table over_t(
    ->
    -> a varchar(65535)
    ->
    -> );
ERROR 1074 (42000): Column length too big for column 'a' (max = 21845); use BLOB or TEXT instead
```

实际上这里是有限制的，因为还有别的开销。

最大的值应该是 65532.

## 4.3.4 Compressed和Dynamic行记录格式

InnoDB1.0.x版本开始引人了新的文件格式(fileformat， 用户可以理解为新的页格式)，以前支持的Compact和Redundant格式称为Antelope文件格式，新的文件格式称为Barracuda文件格式。Barracuda文件格式下拥有两种新的行记录格式：Compressed和Dynamic。

新的两种记录格式对于存放在BLOB中的数据采用了完全的行溢出的方式， 如图4-5所示，在数据页中只存放20个字节的指针， 实际的数据都存放在OffPage中，而之前的Compact和Redundant两种格式会存放768个前缀字节。

- 图4-5 Barracuda 文件格式的溢出行

![文件格式的溢出行](https://images.gitee.com/uploads/images/2020/1111/224804_b9b99b8a_508704.png)

Compressed 行记录格式的另一个功能就是， 存储在其中的行数据会以zlib的算法进行压缩， 因此对于BLOB、TEXT、VARCHAR这类大长度类型的数据能够进行非常有效的存储。

## 4.3.5 CHAR的行结构存储

通常理解VARCHAR是存储变长长度的字符类型，CHAR是存储固定长度的字符类型。而在前面的小节中，用户已经了解行结构的内部的存储，并可以发现每行的变长字段长度的列表都没有存储CHAR类型的长度。

然而， 值得注意的是之前给出的两个例子中的字符集都是单字节的latin1格式。

从MySQL 4.1版本开始，**CHR(N) 中的N指的是字符的长度，而不是之前版本的字节长度**。

也就说在不同的字符集下，CHAR类型列内部存储的可能不是定长的数据。

# 4.4 InnoDB数据页结构

相信通过前面几个小节的介绍， 读者已经知道页是InnoDB存储引擎管理数据库的最小磁盘单位。

页类型为B-treeNode的页存放的即是表中行的实际数据了。

在这一节中， 我们将从底层具体地介绍InnoDB数据页的内部存储结构。

注意InnoDB公司本身并没有详细介绍其页结构的实现， MySQL的官方手册中也基本没有提及InnoDB存储引擎页的内部结构。

本节通过阅读源代码来了解InnoDB的页结构， 此外结合了Peter对于InnoDB页结构的分析。

Peter写这部分内容的时间很久远了， 在其之后InnoDB引入了Compact格式， 页结构已经有所改动，因此可能出现对页结构分析错误的情况，如有错误，希望可以指出。

InnoDB数据页由以下7个部分组成， 如图4-6所示。

- File Header (文件头)

- Page Header (页头)

- In fim un和Supremum Records

- User Records (用户记录， 即行记录)

- FreeSpace (空闲空间)

- Page Directory (页目录)

- File Trailer (文件结尾信息)

其中FileHeader、PageHeader、FileTrailer的大小是固定的， 分别为38、56、8字节， 这些空间用来标记该页的一些信息， 如Checksum， 数据页所在B+树索引的层数等。

UserRecords、FreeSpace、PageDirectory这些部分为实际的行记录存储空间， 因此大小是动态的。

在接下来的各小节中将具体分析各组成部分。

![输入图片说明](https://images.gitee.com/uploads/images/2020/1111/225613_84a1e0b7_508704.png "屏幕截图.png")

## FILE HEADER

![输入图片说明](https://images.gitee.com/uploads/images/2020/1111/225657_a91b4977_508704.png "屏幕截图.png")

![输入图片说明](https://images.gitee.com/uploads/images/2020/1111/225719_eccb19e7_508704.png "屏幕截图.png")


## Page Header

![输入图片说明](https://images.gitee.com/uploads/images/2020/1111/225929_7b0fb807_508704.png "屏幕截图.png")

![输入图片说明](https://images.gitee.com/uploads/images/2020/1111/225948_5156edcc_508704.png "屏幕截图.png")

## 4.4.3Infimum和Supremum Record

在InnoDB存储引擎中， 每个数据页中有两个虚拟的行记录，用来限定记录的边界。

Infimum记录是比该页中任何主键值都要小的值， Supremum指比任何可能大的值还要大的值。

这两个值在页创建时被建立，并且在任何情况下不会被删除。

在Compact行格式和Redundant行格式下， 两者占用的字节数各不相同。

图4-7显示了Infmum和Supremum记录。

![输入图片说明](https://images.gitee.com/uploads/images/2020/1111/230402_c670dc6d_508704.png "屏幕截图.png")

## 4.4.4 User Record和FreeSpace

User Record就是之前讨论过的部分， 即实际存储行记录的内容。

再次强调，InnoDB存储引擎表总是B+树索引组织的。

FreeSpace很明显指的就是空闲空间 同样也是个链表数据结构。

在一条记录被删除后，该空间会被加入到空闲链表中。

## 4.4.5 Page Directory

Page Directory (页目录) 中存放了记录的相对位置(注意， 这里存放的是页相对位置， 而不是偏移量)，有些时候这些记录指针称为Slots (槽) 或目录槽( DirectorySlots)。与其他数据库系统不同的是，在InnoDB中并不是每个记录拥有一个槽，InnoDB存储引擎的槽是一个稀疏目录(sparscdirectory)， 即一个槽中可能包含多个记录。

伪记录Infimum的n_owned值总是为1， 记录Supremum的n_owned的取值范围为[1， 8] ，其他用户记录n_owned的取值范围为[4， 8] 。当记录被插人或删除时需要对槽进行分裂或平衡的维护操作。

在Slots中记录按照索引键值顺序存放， 这样可以利用二叉查找迅速找到记录的指针。假设有('i'，'d'，'c'，'b'，'e'，'g'，‘I'，'h'，'f'，'j'，'k'，'a')，同时假设一个槽中包含4条记录， 则Slots中的记录可能是('a'，'e'，'i')。
 
 
由于在InnoDB存储引擎中Page Direcotry是帮疏目录， 二叉查找的结果只是一个粗略的结果， 因此InnoDB存储引擎必须通过recorder header中的next_record来继续查找相关记录。

同时， Page Directory很好地解释了recorderheader中的n_owned值的含义，因为这些记录并不包括在PageDirectory中。

需要牢记的是，B+树索引本身并不能找到具体的一条记录，能找到只是该记录所在的页。

数据库把页载人到内存，然后通过Page Directory再进行二叉查找。只不过二又查找的时间复杂度很低，同时在内存中的查找很快，因此通常忽略这部分查找所用的时间。

## 4.4.6 File Trailer

为了检测页是否已经完整地写人磁盘(如可能发生的写人过程中础盘损坏、机器关机等)，InnoDB存储引擎的页中设置了FileTrailer部分。

File Trailer只有一个FIL_PAGE_END_LSN部分， 占用8字节。前4字节代表该页的checksum值， 最后4字节和File Header中的FIL_PAGE_LSN相同。

将这两个值与Fil c Header中的FIL_PAGE_SPACE_OR_CHKSUM和FIL_PAGE_LSN值进行比较，看是否一致(checksum的比较需要通过InnoDB的checksum函数来进行比较，不是简单的等值比较)， 以此来保证页的完整性(notcorrupted)。

在默认配置下，InnoDB存储引擎每次从磁盘读取一个页就会检测该页的完整性， 即页是否发生Corrupt， 这就是通过File Trailer部分进行检测， 而该部分的检测会有一定的开销。

用户可以通过参数innodb_checksums来开启或关闭对这个页完整性的检查。

MySQL 5.6.6版本开始新增了参数innodb_checksum_algorthm， 该参数用来控制检测checksum函数的算法， 默认值为crc32， 可设置的值有：innodb、crc 32、none、strict_innodb、strict_cre 32、strict_none。

innodb为兼容之前版本InnoDB页的checksum检测方式，crc 32为MySQL 5.6.6版本引进的新的checksum算法， 该算法较之前的innodb有着较高的性能。

但是若表中所有页的checksum值都以strict算法保存， 那么低版本的MySQL数据库将不能读取这些页。none表示不对页启用checksum检查。

`strict_*` 正如其名， 表示严格地按照设置的checksum算法进行页的检测。

因此若低版本MySQL数据库升级到 MySQL 5.6.6 或之后的版本， 启用 strict_cre 32 将导致不能读取表中的页。

启用strict_crc32方式是最快的方式， 因为其不再对innodb和crc 32算法进行两次检测。

故推荐使用该设置。

若数据库从低版本升级而来， 则需要进行mysql_upgrade操作。


# 4.5 Named File Formats机制

随着InnoDB存储引擎的发展， 新的页数据结构有时用来支持新的功能特性。比如前面提到的InnoDB1.0.x版本提供了新的页数据结构来支持表压缩功能，完全的溢出(Offpage)大变长字符类型字段的存储。这些新的页数据结构和之前版本的页并不兼容，因此从InnoDB1.0.x版本开始，InnoDB存储引通过Named File Formats机制来解决不同版本下页结构兼容性的问题。

InnoDB存储引擎将1.0.x版本之前的文件格式(fileformat) 定义为Antelope， 将这个版本支持的文件格式定义为Barracuda。

新的文件格式总是包含于之前的版本的页格式。

图4-8显示了Barracuda文件格式和Antelope文件格式之间的关系，Antelope文件格式有Compact和Redudant的行格式， Barracuda文件格式既包括了Antelope所有的文件格式， 另外新加人了之前已经提到过的Compressed和Dynamic行格式。

![输入图片说明](https://images.gitee.com/uploads/images/2020/1111/231000_75779dd3_508704.png "屏幕截图.png")

# 4.6约束

## 4.6.1数据完整性

关系型数据库系统和文件系统的一个不同点是，关系数据库本身能保证存储数据的完整性，不需要应用程序的控制，而文件系统一般需要在程序端进行控制。

当前几乎所有的关系型数据库都提供了约束(constraint)机制， 该机制提供了一条强大而简易的途径来保证数据库中数据的完整性。

一般来说，数据完整性有以下三种形式：实体完整性保证表中有一个主键。

在InnoDB存储引擎表中， 用户可以通过定义PrimaryKey或Unique Key约束来保证实体的完整性。

用户还可以通过编写一个触发器来保证数据完整性。

域完整性保证数据每列的值满足特定的条件。

在InnoDB存储引擎表中， 域完整性可以通过以下几种途径来保证：

- 选择合适的数据类型确保一个数据值满足特定条件。

- 外键(ForeignKey) 约束。

- 编写触发器。

- 还可以考虑用DEFAULT约束作为强制域完整性的一个方面。

参照完整性保证两张表之间的关系。InnoDB存储引擎支持外键， 因此允许用户定义外键以强制参照完整性，也可以通过编写触发器以强制执行。

对于InnoDB存储引擎本身而言， 提供了以下几种约束：

- PrimaryKey

- Unique Key

- ForeignKey

- Default

- NOT NULL

## 4.6.2约束的创建和查找

约束的创建可以采用以下两种方式：

1. 表建立时就进行约束定义

2. 利用ALTER TABLE命令来进行创建约束

对Unique Key(唯一索引)的约束， 用户还可以通过命令CREATE UNIQUE INDEX来建立。

对于主键约束而言， 其默认约束名为PRIMARY。

而对于Unique Key约束而言，默认约束名和列名一样， 当然也可以人为指定Unique Key约束的名字。

ForeignKey约束似乎会有一个比较神秘的默认名称。

## 4.6.3约束和索引的区别

在前面的小节中已经看到PrimaryKey和UniqueKey的约束，有人不禁会问：这不就是通常创建索引的方法吗?那约束和索引有什么区别呢?

的确，当用户创建了一个唯一索引就创建了一个唯一的约束。但是约束和索引的概念还是有所不同的，约束更是一个逻辑的概念，用来保证数据的完整性，而索引是一个数据结构，既有逻辑上的概念，在数据库中还代表着物理存储的方式。

## 4.6.4对错误数据的约束

在某些默认设置下，MySQL数据库允许非法的或不正确的数据的插人或更新， 又或者可以在数据库内部将其转化为一个合法的值， 如向NOTNULL的字段插人一个NULL值， MySQL数据库会将其更改为0再进行插人， 因此数据库本身没有对数据的正确性进行约束。

## 4.6.5ENUM和SET约束

MySQL数据库不支持传统的CHECK约束， 但是通过ENUM和SET类型可以解决部分这样的约束需求。

例如表上有一个性别类型， 规定域的范围只能是male或female ，在这种情况下用户可以通过ENUM类型来进行约束。

## 4.6.6 触发器与约束

通过前面小节的介绍，用户已经知道完整性约束通常也可以使用触发器来实现，因此在了解数据完整性前先对触发器来做一个了解。

触发器的作用是在执行INSERT、DELETE和UPDATE命令之前或之后自动调用

## 4.6.7外键约束

外键用来保证参照完整性， MySQL数据库的MyISAM存储引擎本身并不支持外键，对于外键的定义只是起到一个注释的作用。

而InnoDB存储引擎则完整支持外键约束。

# 4.7 视图

在MySQL数据库中， 视图(View) 是一个命名的虚表， 它由一个SQL查询来定义， 可以当做表使用。

与持久表(permanenttable) 不同的是， 视图中的数据没有实际的物理存储。

## 4.7.1 视图的作用

视图在数据库中发挥着重要的作用。

视图的主要用途之一是被用做一个抽象装置，特别是对于一些应用程序， 程序本身不需要关心基表(basetable) 的结构， 只需要按照视图定义来取数据或更新数据，因此，视图同时在一定程度上起到一个安全层的作用。

MySQL数据库从5.0版本开始支持视图。

## 4.7.2物化视图

Oracle数据库支持物化视图——该视图不是基于基表的虚表， 而是根据基表实际存在的实表，即物化视图的数据存储在非易失的存储设备上。

物化视图可以用于预先计算并保存多表的链接(JOIN) 或聚集(GROUPBY)等耗时较多的SQL操作结果。

这样，在执行复杂查询时，就可以避免进行这些耗时的操作，从而快速得到结果。物化视图的好处是对于一些复杂的统计类查询能直接查出结果。

在Microsoft SQLServer数据库中，称这种视图为索引视图。

在Oracle数据库中， 物化视图的创建方式包括以下两种：
    
- BUILD IMMEDIATE

- BUILD DEFERRED

BUILDIMMEDIATE是默认的创建方式， 在创建物化视图的时候就生成数据， 而BUILD DEFERRED则在创建物化视图时不生成数据， 以后根据需要再生成数据。

查询重写是指当对物化视图的基表进行查询时，数据库会自动判断能否通过查询物化视图来直接得到最终的结果， 如果可以， 则避免了聚集或连接等这类较为复杂的SQL操作，直接从已经计算好的物化视图中得到所需的数据。

物化视图的刷新是指当基表发生了DML操作后， 物化视图何时采用哪种方式和基表进行同步。

刷新的模式有两种：

- ONDEMAND

- ON COMMIT

ONDEMAND意味着物化视图在用户需要的时候进行刷新，ON COMMIT意味着物化视图在对基表的DML操作提交的同时进行刷新。

而刷新的方法有四种：

- FAST

- COMPLETE

- FORCE

- ON EVER

FAST刷新采用增量刷新， 只刷新自上次刷新以后进行的修改。COMPLETE刷新是对整个物化视图进行完全的刷新。

如果选择FORCE方式， 则数据库在刷新时会去判断是否可以进行快速刷新， 如果可以， 则采用FAST方式，否则采用COMPLETE的方式。

NEVER是指物化视图不进行任何刷新。

MySQL数据库本身并不支持物化视图， 换句话说， MySQL数据库中的视图总是虚拟的。但是用户可以通过一些机制来实现物化视图的功能。

例如要创建一个ONDEMAND的物化视图还是比较简单的， 用户只需定时把数据导人到另一张表。


# 4.8分区表

## 4.8.1分区概述

分区功能并不是在存储引擎层完成的， 因此不是只有InnoDB存储引擎支持分区，常见的存储引擎MyISAM、NDB等都支持。但也并不是所有的存储引擎都支持， 如CSV、FEDORA TED、MERGE等就不支持。

在使用分区功能前， 应该对选择的存储引擎对分区的支持有所了解。

MySQL数据库在5.1版本时添加了对分区的支持。分区的过程是将一个表或索引分解为多个更小、更可管理的部分。

就访问数据库的应用而言，从逻辑上讲，只有一个表或一个索引，但是在物理上这个表或索引可能由数十个物理分区组成。

每个分区都是独立的对象，可以独自处理，也可以作为一个更大对象的一部分进行处理。

MySQL数据库支持的分区类型为水平分区， 并不支持垂直分区。

- 水平分区，指将同一表中不同行的记录分配到不同的物理文件中。

- 垂直分区，指将同一表中不同列的记录分配到不同的物理文件中。

此外， MySQL数据库的分区是局部分区索引，一个分区中既存放了数据又存放了索引。

而全局分区是指， 数据存放在各个分区中， 但是所有数据的索引放在一个对象中。

目前， MySQL数据库不支持全局分区。


大多数DBA会有这样一个误区：只要启用了分区， 数据库就会运行得更快。这个结论是存在很多问题的。

就我的经验看来， 分区可能会给某些SQL语句性能带来提高，但是分区主要用于数据库高可用性的管理。

在OLTP应用中， 对于分区的使用应该非常小心。

总之，如果只是一味地使用分区，而不理解分区是如何工作的，也不清楚你的应用如何使用分区，那么分区极有可能会对性能产生负面的影响。

当前MySQL数据库支持以下几种类型的分区。

- RANGE分区：行数据基于属于一个给定连续区间的列值被放人分区。MySQL 5.5开始支持RANGECOLUMNS的分区。

- LIST分区：和RANGE分区类型， 只是LIST分区面向的是离散的值。MySQL 5.5开始支持LISTCOLUMNS的分区。

- HASH分区：根据用户自定义的表达式的返回值来进行分区， 返回值不能为负数。

- KEY分区：根据MySQL数据库提供的哈希函数来进行分区。

**不论创建何种类型的分区，如果表中存在主键或唯一索引时，分区列必须是唯一索引的一个组成部分**。

## 4.8.3子分区

子分区(sub partitioning) 是在分区的基础上再进行分区， 有时也称这种分区为复合分区(composite partitioning) 。

MySQL数据库允许在RANGE和LIST的分区上再进行HASH或KEY的子分区。

## 4.8.4分区中的NULL值

MySQL数据库允许对NULL值做分区， 但是处理的方法与其他数据库可能完全不同。

MYSQL数据库的分区总是视NULL值视小于任何的一个非NULL值， 这和MySQL数据库中处理NULL值的ORDERBY操作是一样的。

因此对于不同的分区类型，MySQL数据库对于NULL值的处理也是各不相同。

对于RANGE分区， 如果向分区列插人了NULL值， 则MySQL数据库会将该值放人最左边的分区。

## 4.8.5分区和性能

我常听到开发人员说“对表做个分区”，然后数据库的查询就会快了。

这是真的吗?实际上可能根本感觉不到查询速度的提升，甚至会发现查询速度急剧下降。

因此，在合理使用分区之前，必须了解分区的使用环境。

数据库的应用分为两类：一类是OLTP(在线事务处理)， 如Blog、电子商务、网络游戏等； 另一类是OLAP(在线分析处理)， 如数据仓库、数据集市。

在一个实际的应用环境中， 可能既有OLTP的应用， 也有OLAP的应用。如网络游戏中， 玩家操作的游戏数据库应用就是OLTP的， 但是游戏厂商可能需要对游戏产生的日志进行分析， 通过分析得到的结果来更好地服务于游戏， 预测玩家的行为等， 而这却是OLAP的应用。

对于OLAP的应用， 分区的确是可以很好地提高查询的性能， 因为OLAP应用大多数查询需要频繁地扫描一张很大的表。假设有一张1亿行的表，其中有一个时间戳属性列。

用户的查询需要从这张表中获取一年的数据。如果按时间戳进行分区，则只需要扫描相应的分区即可。这就是前面介绍的Partition Pruning技术。

然而对于OLTP的应用， 分区应该非常小心。

在这种应用下， 通常不可能会获取一张大表中10%的数据，大部分都是通过索引返回几条记录即可。而根据B+树索引的原理可知，对于一张大表，一般的B+树需要2~3次的磁盘IO。因此B+树可以很好地完成操作，不需要分区的帮助，并且设计不好的分区会带来严重的性能问题。

我发现很多开发团队会认为含有1000W行的表是一张非常巨大的表，所以他们往往会选择采用分区， 如对主键做10个HASH的分区， 这样每个分区就只有100W的数据了， 因此查询应该变得更快了， 如

`SELECT * FROM TABLE WHERE PK=@pk`。

但是有没有考虑过这样一种情况：100W和1000W行的数据本身构成的B+树的层次都是一样的，可能都是2层。

那么上述走主键分区的索引并不会带来性能的提高。

好的，如果1000W的B+树的高度是3，100W的B+树的高度是2，那么上述按主键分区的索引可以避免1次IO，从而提高查询的效率。

这没问题，但是这张表只有主键索引，没有任何其他的列需要查询的。

如果还有类似如下的SQL语句：`SELECT * FROM TABLEWHERE KEY=@key`， 这时对于KEY的查询需要扫描所有的10个分区， 即使每个分区的查询开销为2次IO， 则一共需要20次IO。

而对于原来单表的设计， 对于KFX查询只需要2~3次IO。

接着来看如下的表Profile， 根据主键ID进行了HASH分区， HASH分区的数量为10， 表Profile有接近1000W的数据
    
# 小结

# 参考资料

《mysql 技术内幕》

[mysql中的_rowid](https://blog.csdn.net/a158123/article/details/89818537)

* any list
{:toc}

