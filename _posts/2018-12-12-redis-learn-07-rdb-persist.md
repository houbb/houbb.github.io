---
layout: post
title: Redis Learn-07-RDB 持久化
date: 2018-12-12 11:35:23 +0800
categories: [Redis]
tags: [redis, cache, sh]
published: true
---

# REDIS数据存储模式

Redis中数据存储模式有2种：cache-only,persistence;

## cache-only

cache-only即只做为“缓存”服务，不持久数据，数据在服务终止后将消失，此模式下也将不存在“数据恢复”的手段，是一种安全性低/效率高/容易扩展的方式；

## persistence

persistence 即为内存中的数据持久备份到磁盘文件，在服务重启后可以恢复，此模式下数据相对安全。

对于 persistence 持久化存储，Redis提供了两种持久化方法：

Redis DataBase(简称RDB)

Append-only file (简称AOF)

除了这两种方法，Redis在早起的版本还存在虚拟内存的方法，现在已经被废弃。

# RDB持久化

RDB 文件是一个压缩的二进制文件，redis 数据库将自己的状态生成一个RDB文件，通过这个文件也可以还原对应时刻数据库的状态。

# RDB文件的创建与载入

## 创建

save: 创建RDB文件，期间会阻塞 redis 不能处理任何请求

bgsave: 创建子进程生成RDB文件，父进程可以继续处理请求

## 载入

服务器启动时自动载入RDB文件，无需命令调用，载入过程服务器是阻塞状态，直到载入完成

## 优先级

AOF 的更新频率通常高于RDB，因此在开启了AOF的情况下，服务器优先使用AOF还原数据库，只有在关闭AOF的情况下，才会使用RDB来还原数据库状态

## BGSAVE

在执行BGSAVE期间，服务器会拒绝SAVE和BGSAVE命令，避免多个进程创建RDB文件。

BGSAVE 和 BGREWRITEAOF 不能同时执行，执行一个时，收到另一个命令请求会拒绝，考虑到两个命令都会大量读写磁盘。

1、在BGSAVE命令执行期间，客户端发送的SAVE命令会被服务器拒绝。服务器禁止SAVE与BGSAVE同时执行是为了避免父进程和子进程同时指向两个rdbSave调用，防止产生竞争条件。

2、同样的道理，在BGSAVE执行期间，客户端的BGSAVE命令也会被服务器拒绝。

3、另外，对于AOF持久化命令BGREWRITEAOF与BGSAVE也同样是互斥关系，如果BGSAVE正在执行，则BGREWRITEAOF命令会被延迟到BGSAVE执行完毕之后；而BGREWRITEAOF命令执行时，服务器会拒绝BGSAVE命令的执行。

4、而事实上，因为BGREWRITEAOF命令与BGSAVE两个命令的实际工作都是由子进程执行，所以这两个命令在操作方面并没有冲突的地方，不能同时执行只是性能方面的考虑--并发处两个子进程，并且这两个子进程同时对磁盘进行大量读写。

### 源码

- rdb.c

```c
void saveCommand(client *c) {
	   // BGSAVE 已经在执行中，不能再执行 SAVE
    // 否则将产生竞争条件
    if (server.rdb_child_pid != -1) {
        addReplyError(c,"Background save already in progress");
        return;
    }
    // 执行 
    if (rdbSave(server.rdb_filename) == C_OK) {
        addReply(c,shared.ok);
    } else {
        addReply(c,shared.err);
    }
}
 
/* BGSAVE [SCHEDULE] */
void bgsaveCommand(client *c) {
    int schedule = 0;  //SCHEDULE控制BGSAVE的执行，避免和AOF重写进程冲突
 
    /* The SCHEDULE option changes the behavior of BGSAVE when an AOF rewrite
     * is in progress. Instead of returning an error a BGSAVE gets scheduled. */
    if (c->argc > 1) {
    	 // 设置schedule标志
        if (c->argc == 2 && !strcasecmp(c->argv[1]->ptr,"schedule")) {
            schedule = 1;
        } else {
            addReply(c,shared.syntaxerr);
            return;
        }
    }
     // 不能重复执行 BGSAVE
    if (server.rdb_child_pid != -1) {
        addReplyError(c,"Background save already in progress");
    } else if (server.aof_child_pid != -1) {
    	  // 不能在 BGREWRITEAOF 正在运行时执行.提上日程
        if (schedule) {
            server.rdb_bgsave_scheduled = 1;
            addReplyStatus(c,"Background saving scheduled");
        } else {
            addReplyError(c,
                "An AOF log rewriting in progress: can't BGSAVE right now. "
                "Use BGSAVE SCHEDULE in order to schedule a BGSAVE whenver "
                "possible.");
        }
        // 执行BGSAVE
    } else if (rdbSaveBackground(server.rdb_filename) == C_OK) {
        addReplyStatus(c,"Background saving started");
    } else {
        addReply(c,shared.err);
    }
}
```

# save配置

## 默认选项

通过配置save选项来通过条件触发执行BGSAVE命令，如下:

```
save 900 1
save 300 10
save 60 10000
```

这表示三个条件任意一个被满足，将执行BGSAVE。

900秒内至少一次修改，300秒内至少十次修改，60秒内至少10000次修改，上面也是默认配置.

### 1、保存结构

服务器启动时，会读取save条件，并写入其redisServer结构的saveparams属性中。

```c
struct redisServer{
    //…其他属性
    struct saveparam *saveparams;
}
```

由上可知，saveparams是一个数组，由saveparam结构元素组成。

```c
struct saveparam{
         time_t seconds;
         int changes;
}
```

由上结构可知，saveparam 保存了时间和改变次数，即对应上述每一行save后面跟的两个参数。

上面默认的save条件配置的存储方式如下图所示：

![存储方式](https://ask.qcloudimg.com/http-save/yehe-1327360/yj7km2zd99.jpeg?imageView2/2/w/1620)

### dirty计数器和lastsave属性

dirty 计数器记录距离上一次成功执行save或bgsave命令后，服务器对其中所有数据库进行的修改（增删改）的总次数。

lastsave 属性是一个UNIX时间戳，记录服务器上一次成功执行save或bgsave的时间。

```c
struct redisServer{
    long long dirty;
     time_t lastsave;
}
```

每执行一次修改，dirty值就加1，如果是批量修改命令如sadd等，一次修改多个值，则修改几个dirty的值就加多少。

这两个属性分别是用于比较save条件的两个参数——修改次数和时间，是否匹配，以判定是否要执行bgsave命令。

### 3、检查是否满足保存条件

redis服务器的周期性函数serverCron，默认每隔100毫秒执行一次，用来维护运行中的服务器，其中一项工作就是检查save条件，满足的话就执行bgsave命令。

其判断方式是，循环save配置，分别比较save每一条配置的修改次数与redisServer结构中的dirty属性值、当前时间减去lastsave属性判断经过的时间，有一个符合则执行bgsave命令。

## 选项原理

save选项原理:

服务器会周期性(100ms间隔)检查三个条件，内部会保存一个计数器和上一次执行BGSAVE的Unix时间戳，如果时间到了一个条件的临界值，并且计数器记录的命令修改次数也已经达到了，就会执行BGSAVE，并且将计数器清零，更新BGSAVE命令执行时间。

注意这里时间没到的话，即使执行的命令次数到了也不会触发，比如60秒内10000次，假如过去了40秒，但是期间修改了10001次，也不会触发，时间和次数是必须同时满足的(反过来想如果不是这样的话，那么比如10秒内执行2次命令，那么肯定就需要执行BGSAVE了，因为这就满足了第一个条件了)，因此也可以认为，BGSAVE默认情况下，最快也只能60秒调用一次，频率不会再快了，即使更新次数更快也要等到60秒,如果有至少一次操作的话，最慢是900秒。

我们看下面的redis源码就知道时间和次数是逻辑与的关系，这里面判断的时候，修改次数和时间必须同时达到才会执行BGSAVE；

```c
//源码文件redis.c的serverCron函数
// 遍历所有保存条件，看是否需要执行 BGSAVE 命令
for (j = 0; j < server.saveparamslen; j++) {
   struct saveparam *sp = server.saveparams+j;
   /* Save if we reached the given amount of changes,
    * the given amount of seconds, and if the latest bgsave was
    * successful or if, in case of an error, at least
    * REDIS_BGSAVE_RETRY_DELAY seconds already elapsed. */
   // 检查是否有某个保存条件已经满足了
   if (server.dirty >= sp->changes &&
       server.unixtime-server.lastsave > sp->seconds &&
       (server.unixtime-server.lastbgsave_try >
        REDIS_BGSAVE_RETRY_DELAY ||
        server.lastbgsave_status == REDIS_OK))
   {
       redisLog(REDIS_NOTICE,"%d changes in %d seconds. Saving...",
           sp->changes, (int)sp->seconds);
       // 执行 BGSAVE
       rdbSaveBackground(server.rdb_filename);
       break;
   }
}
```

# RDB文件结构

## RDB 文件组成部分

| 字段组成	  |  长度 |
|:---|:---|
| redis字符常量	| 5字节 |
| 版本号	       | 4字节 |
| 数据库键值对	| 长度不定，可以为空 |
| EOF,结束标志	| 1字节 |
| 校验和	       | 8字节 |

## RDB 的数据库键值对

数据库部分是最核心的，其他的部分都是固定的或者长度固定的。

数据库部分可以包含0或者多个数据库的信息，每个数据库的信息是相邻且独立的。

每一个数据库的信息包括三部分，包括 selectdb,dbnumber,k–v 对。

第一和二部分用于选择数据库，第三部分是真正的数据。

## k-v对部分

k-v对部分保存一个或者多个键值对，可以携带过期时间。

因为数据类型的不一样，这部分的长度也有不同，因此它也进行了细分。

每一个k-v对部分由一下几个部分组成。

```
EXPIRETIME_MS	ms	TYPE	key	value
```

EXPIRETIME_MS：代表后面是一个毫秒的时间,长度为1字节

ms：是unix的时间戳，8字节

TYPE：数据类型

后面是键值对

ps: 不考虑拓展性，默认使用 MS 作为时间单位，可以去掉 `EXPIRETIME_MS` 字段。

## 分析RDB文件

RBD文件是redis用于恢复自身数据的，我们来看看其使用方法

## 查看方法
使用Linux下的od命令可以查看RDB文件，使用-c参数可以指定编码方式为ASCII，-x指定为十六进制

## 查看RDB文件

先生成RDB文件

```
127.0.0.1:6379> FLUSHALL
OK
127.0.0.1:6379> SAVE
OK
127.0.0.1:6379> 
```

保存一个name=mozping的键值对后，再生成新的RDB文件。

对比查看空的数据库和保存了键值对的数据库，两个RDB文件的区别

```
$ od -c dump.rdb 
0000000    R   E   D   I   S   0   0   0   8 372  \t   r   e   d   i   s
0000020    -   v   e   r 006   4   .   0   .   1   4 372  \n   r   e   d
0000040    i   s   -   b   i   t   s 300   @ 372 005   c   t   i   m   e
0000060  302 376   b 004   ] 372  \b   u   s   e   d   -   m   e   m 302
0000100    0 274 017  \0 372  \f   a   o   f   -   p   r   e   a   m   b
0000120    l   e 300  \0 377   u  \a 277   { 277   B 301 372            
0000135
mzpdeMac-mini:redis-4.0.14 mzp$ rm ./dump.rdb 
mzpdeMac-mini:redis-4.0.14 mzp$ od -c dump.rdb 
0000000    R   E   D   I   S   0   0   0   8 372  \t   r   e   d   i   s
0000020    -   v   e   r 006   4   .   0   .   1   4 372  \n   r   e   d
0000040    i   s   -   b   i   t   s 300   @ 372 005   c   t   i   m   e
0000060  302 257   c 004   ] 372  \b   u   s   e   d   -   m   e   m 302
0000100  240 274 017  \0 372  \f   a   o   f   -   p   r   e   a   m   b
0000120    l   e 300  \0 376  \0 373 001  \0  \0 004   n   a   m   e  \a
0000140    m   o   z   p   i   n   g 377   N 222 274 016   ` 365   l 224
0000160
```

可以看到最开始的是REDIS这个常量，5字节，后面的008代表版本，后面也可以看到键值对的信息。

这里我查看的RDB是redis4.0.14版本的，前面的资料是源于《REDIS设计与实现》这本书，基于的版本较低稍微有点不一样。

不过对于普通使用来说一般不会要深入了解RDB文件的结构，如果需要的话可以寻找更多资料。

# RDB工具

redis-check-dump是redis自带的RDB文件分析工具。

```
$ ./bin/redis-check-rdb   ./dump.rdb 
[offset 0] Checking RDB file ./dump.rdb
[offset 27] AUX FIELD redis-ver = '4.0.14'
[offset 41] AUX FIELD redis-bits = '64'
[offset 53] AUX FIELD ctime = '1560569706'
[offset 68] AUX FIELD used-mem = '1030304'
[offset 84] AUX FIELD aof-preamble = '0'
[offset 86] Selecting DB ID 0
[offset 112] Checksum OK
[offset 112] \o/ RDB looks OK! \o/
[info] 1 keys read
[info] 0 expires
[info] 0 already expired
```

从这里的信息我们可以看到，4.0.14版本的redis在RDB文件中包含的信息比之前分析的要多一些，比如redis-bit，ctime，used-men这样的信息。

# 恢复RDB

默认情况下，redis启动就会找到对应的RDB文件将数据库进行恢复，这里我们需要关注redis的2个配置

```
# The filename where to dump the DB，
#这是RDB文件的名字，默认是dump.rdb
dbfilename dump.rdb

#这是RDB文件和AOF文件保存的路径，默认是当前路径
# The working directory.
#
# The DB will be written inside this directory, with the filename specified
# above using the 'dbfilename' configuration directive.
#
# The Append Only File will also be created inside this directory.
#
# Note that you must specify a directory here, not a file name.
dir ./
```

如果强制杀掉redis，那么内存中的数据可能来不及持久化，再次启动恢复数据会有部分丢失

使用redis-cli shutdown是安全关闭redis，会将数据持久化之后再关闭

如果关闭redis后删除了RDB文件，再次启动redis数据会丢失

如果关闭redis后，用一个新的RDB文件替换旧的RDB文件，那么启动后会恢复新的RDB中的数据，不过最好版本一致，因为这些信息都在RDB里面。

我验证了安全关闭redis后，重新启动redis，数据是在的。

但是我关闭redis，然后把RDB文件移动到另一个A路径，再启动redis，就没有数据了，因为找不到RDB文件。然后我再修改redis的配置文件将dir配置修改为A路径，然后再启动redis，数据又有了，按照这个思路可以使用指定的RDB文件恢复redis的数据。

ps: 这也很好理解，redis 只是从固定的文件恢复数据。

## 其他常见配置

```
#dbfilename：持久化数据存储在本地的文件
dbfilename dump.rdb
#dir：持久化数据存储在本地的路径，如果是在/redis/redis-3.0.6/src下启动的redis-cli，则数据会存储在当前src目录下
dir ./
##snapshot触发的时机，save <seconds> <changes>  
##如下为900秒后，至少有一个变更操作，才会snapshot  
##对于此值的设置，需要谨慎，评估系统的变更操作密集程度  
##可以通过“save “””来关闭snapshot功能  
#save时间，以下分别表示更改了1个key时间隔900s进行持久化存储；更改了10个key300s进行存储；更改10000个key60s进行存储。
save 900 1
save 300 10
save 60 10000
##当snapshot时出现错误无法继续时，是否阻塞客户端“变更操作”，“错误”可能因为磁盘已满/磁盘故障/OS级别异常等  
stop-writes-on-bgsave-error yes  
##是否启用rdb文件压缩，默认为“yes”，压缩往往意味着“额外的cpu消耗”，同时也意味这较小的文件尺寸以及较短的网络传输时间  
rdbcompression yes  
```

# 优缺点

## RDB 的优点：

RDB 是一个紧凑压缩的二进制文件，代表Redis在某个时间点上的数据快照。

非常适用于备份，全景复制等场景。

Redis 加载RDB恢复数据远远快于AOF的方式。

## RDB的缺点：

RDB没有办法做到实时持久化或秒级持久化。

因为BGSAVE每次运行的又要进行fork()的调用创建子进程，这属于重量级操作，频繁执行成本过高，因为虽然Linux支持读时共享，写时拷贝(copy-on-write)的技术，但是仍然会有大量的父进程的空间内存页表，信号控制表，寄存器资源等等的复制。

RDB文件使用特定的二进制格式保存，Redis版本演进的过程中，有多个RDB版本，这导致版本兼容的问题。

# RDB 文件结构

## 概览

在本章之前的内容中， 我们介绍了 Redis 服务器保存和载入 RDB 文件的方法， 在这一节， 我们将对 RDB 文件本身进行介绍， 并详细说明文件各个部分的结构和意义。

图 IMAGE_RDB_STRUCT_OVERVIEW 展示了一个完整 RDB 文件所包含的各个部分。

![IMAGE_RDB_STRUCT_OVERVIEW](http://redisbook.com/_images/graphviz-b1672d2bcb1fae10e01942bf792a01afe984336e.png)

> 注意

为了方便区分变量、数据、常量， 图 IMAGE_RDB_STRUCT_OVERVIEW 中用全大写单词标示常量， 用全小写单词标示变量和数据。

本章展示的所有 RDB 文件结构图都遵循这一规则。

### REDIS

RDB 文件的最开头是 REDIS 部分，这个部分的长度为 5 字节， 保存着 "REDIS" 五个字符。 

通过这五个字符， 程序可以在载入文件时， 快速检查所载入的文件是否 RDB 文件。

ps: 从某种角度来说，个人感觉是没必要的。不过类似于 java 的 BABYCAFE 之类的，留作纪念吧。

> 注意

因为 RDB 文件保存的是二进制数据， 而不是 C 字符串， 为了简便起见， 我们用 "REDIS" 符号代表 'R' 、 'E' 、 'D' 、 'I' 、 'S' 五个字符， 而不是带 '\0' 结尾符号的 C 字符串 'R' 、 'E' 、 'D' 、 'I' 、 'S' 、 '\0' 。

本章介绍的所有内容，以及展示的所有 RDB 文件结构图都遵循这一规则。

### db_version

db_version 长度为 4 字节， 它的值是一个字符串表示的整数， 这个整数记录了 RDB 文件的版本号， 比如 "0006" 就代表 RDB 文件的版本为第六版。 

本章只介绍第六版 RDB 文件的结构。

### databases

databases 部分包含着零个或任意多个数据库， 以及各个数据库中的键值对数据：

如果服务器的数据库状态为空（所有数据库都是空的）， 那么这个部分也为空， 长度为 0 字节。

如果服务器的数据库状态为非空（有至少一个数据库非空）， 那么这个部分也为非空， 根据数据库所保存键值对的数量、类型和内容不同， 这个部分的长度也会有所不同。

### EOF

EOF 常量的长度为 1 字节， 这个常量标志着 RDB 文件正文内容的结束， 当读入程序遇到这个值的时候， 它知道所有数据库的所有键值对都已经载入完毕了。

### check_sum

check_sum 是一个 8 字节长的无符号整数， 保存着一个校验和， 这个校验和是程序通过对 REDIS 、 db_version 、 databases 、 EOF 四个部分的内容进行计算得出的。 

服务器在载入 RDB 文件时， 会将载入数据所计算出的校验和与 check_sum 所记录的校验和进行对比， 以此来检查 RDB 文件是否有出错或者损坏的情况出现。

作为例子， 图 IMAGE_RDB_WITH_EMPTY_DATABASE 展示了一个 databases 部分为空的 RDB 文件： 文件开头的 "REDIS" 表示这是一个 RDB 文件， 之后的 "0006" 表示这是第六版的 RDB 文件， 因为 databases 为空， 所以版本号之后直接跟着 EOF 常量， 最后的 6265312314761917404 是文件的校验和。

ps: 这里的 check_sum 只有检验是否损害的作用，没有校验正确的作用。比如 CRC 校验，都是类似的思想。

![IMAGE_RDB_WITH_EMPTY_DATABASE](http://redisbook.com/_images/graphviz-8c8c19f0cf214a4fb9b9c6fd073e2654f291bdec.png)

## databases 部分

一个 RDB 文件的 databases 部分可以保存任意多个非空数据库。

每个非空数据库在 RDB 文件中都可以保存为 SELECTDB 、 db_number 、 key_value_pairs 三个部分， 如图 IMAGE_DATABASE_STRUCT_OF_RDB 所示。

```
SELECTDB | db_number | key_value_pairs
```

- SELECTDB

SELECTDB 常量的长度为 1 字节， 当读入程序遇到这个值的时候， 它知道接下来要读入的将是一个数据库号码。

- db_number

db_number 保存着一个数据库号码， 根据号码的大小不同， 这个部分的长度可以是 1 字节、 2 字节或者 5 字节。 

当程序读入 db_number 部分之后， 服务器会调用 SELECT 命令， 根据读入的数据库号码进行数据库切换， 使得之后读入的键值对可以载入到正确的数据库中。

- key_value_pairs

key_value_pairs 部分保存了数据库中的所有键值对数据， 如果键值对带有过期时间， 那么过期时间也会和键值对保存在一起。 

根据键值对的数量、类型、内容、以及是否有过期时间等条件的不同， key_value_pairs 部分的长度也会有所不同。

作为例子， 图 IMAGE_EXAMPLE_OF_DB 展示了 RDB 文件中， 0 号数据库的结构。

```
SELECTDB | 0 | key_value_pairs
```

另外， 图 IMAGE_RDB_WITH_DB_0_AND_DB_3 则展示了一个完整的 RDB 文件， 文件中包含了 0 号数据库和 3 号数据库。

![IMAGE_RDB_WITH_DB_0_AND_DB_3](http://redisbook.com/_images/graphviz-7ec754c8fc3aa6458409f6465c476c9e8dc6c667.png)

## key_value_pairs 部分

RDB 文件中的每个 key_value_pairs 部分都保存了一个或以上数量的键值对， 如果键值对带有过期时间的话， 那么键值对的过期时间也会被保存在内。

不带过期时间的键值对在 RDB 文件中对由 TYPE 、 key 、 value 三部分组成， 如图 IMAGE_KEY_WITHOUT_EXPIRE_TIME 所示。

```
TYPE | key | value
```

### TYPE

TYPE 记录了 value 的类型， 长度为 1 字节， 值可以是以下常量的其中一个：

```
REDIS_RDB_TYPE_STRING
REDIS_RDB_TYPE_LIST
REDIS_RDB_TYPE_SET
REDIS_RDB_TYPE_ZSET
REDIS_RDB_TYPE_HASH
REDIS_RDB_TYPE_LIST_ZIPLIST
REDIS_RDB_TYPE_SET_INTSET
REDIS_RDB_TYPE_ZSET_ZIPLIST
REDIS_RDB_TYPE_HASH_ZIPLIST
```

以上列出的每个 TYPE 常量都代表了一种对象类型或者底层编码， 当服务器读入 RDB 文件中的键值对数据时， 程序会根据 TYPE 的值来决定如何读入和解释 value 的数据。

### key/value

key 和 value 分别保存了键值对的键对象和值对象：

其中 key 总是一个字符串对象， 它的编码方式和 REDIS_RDB_TYPE_STRING 类型的 value 一样。 

根据内容长度的不同， key 的长度也会有所不同。

根据 TYPE 类型的不同， 以及保存内容长度的不同， 保存 value 的结构和长度也会有所不同， 本节稍后会详细说明每种 TYPE 类型的 value 结构保存方式。

带有过期时间的键值对在 RDB 文件中的结构如图 IMAGE_KEY_WITH_EXPIRE_TIME 所示。

```
EXPIRETIME_MS | ms | TYPE | key | value
```

带有过期时间的键值对中的 TYPE 、 key 、 value 三个部分的意义， 和前面介绍的不带过期时间的键值对的 TYPE 、 key 、 value 三个部分的意义完全相同， 至于新增的 EXPIRETIME_MS 和 ms ， 

它们的意义如下：

### EXPIRETIME_MS

EXPIRETIME_MS 常量的长度为 1 字节， 它告知读入程序， 接下来要读入的将是一个以毫秒为单位的过期时间。

### ms

ms 是一个 8 字节长的带符号整数， 记录着一个以毫秒为单位的 UNIX 时间戳， 这个时间戳就是键值对的过期时间。

作为例子， 图 IMAGE_EXAMPLE_OF_KEY_WITHOUT_EXPIRE_TIME 展示了一个没有过期时间的字符串键值对。

```
REDIS_RDB_TYPE_STRING | key | value
```

图 IMAGE_EXAMPLE_OF_KEY_WITH_EXPIRE_TIME 展示了一个带有过期时间的集合键值对， 其中键的过期时间为 1388556000000 （2014 年 1 月 1 日零时）。

```
EXPIRETIME_MS | 1388556000000 | REDIS_RDB_TYPE_STRING | key | value
```

## value 的编码

RDB 文件中的每个 value 部分都保存了一个值对象， 每个值对象的类型都由与之对应的 TYPE 记录， 根据类型的不同， value 部分的结构、长度也会有所不同。

在接下来的各个小节中， 我们将分别介绍各种不同类型的值对象在 RDB 文件中的保存结构。

### 字符串对象

如果 TYPE 的值为 REDIS_RDB_TYPE_STRING ， 那么 value 保存的就是一个字符串对象， 字符串对象的编码可以是 REDIS_ENCODING_INT 或者 REDIS_ENCODING_RAW 。

如果字符串对象的编码为 REDIS_ENCODING_INT ， 那么说明对象中保存的是长度不超过 32 位的整数， 这种编码的对象将以图 IMAGE_INT_ENCODING_STRING 所示的结构保存。

```
ENCODING | integer
```

其中， ENCODING 的值可以是 REDIS_RDB_ENC_INT8 、 REDIS_RDB_ENC_INT16 或者 REDIS_RDB_ENC_INT32 三个常量的其中一个， 它们分别代表 RDB 文件使用 8 位（bit）、 16 位或者 32 位来保存整数值 integer 。

举个例子， 如果字符串对象中保存的是可以用 8 位来保存的整数 123 ， 那么这个对象在 RDB 文件中保存的结构将如图 IMAGE_EXAMPLE_OF_INT_ENCODING_STRING 所示。

```
REDIS_RDB_ENC_INT8 | 123
```

如果字符串对象的编码为 REDIS_ENCODING_RAW ， 那么说明对象所保存的是一个字符串值， 根据字符串长度的不同， 有压缩和不压缩两种方法来保存这个字符串：

1. 如果字符串的长度小于等于 20 字节， 那么这个字符串会直接被原样保存。

2. 如果字符串的长度大于 20 字节， 那么这个字符串会被压缩之后再保存。

> 注意

以上两个条件是在假设服务器打开了 RDB 文件压缩功能的情况下进行的， 如果服务器关闭了 RDB 文件压缩功能， 那么 RDB 程序总以无压缩的方式保存字符串值。

具体信息可以参考 redis.conf 文件中关于 rdbcompression 选项的说明。

对于没有被压缩的字符串， RDB 程序会以图 IMAGE_NON_COMPRESS_STRING 所示的结构来保存该字符串。

```
len | string
```

其中， string 部分保存了字符串值本身，而 len 保存了字符串值的长度。

对于压缩后的字符串， RDB 程序会以图 IMAGE_COMPRESSED_STRING 所示的结构来保存该字符串。

其中， REDIS_RDB_ENC_LZF 常量标志着字符串已经被 LZF 算法（http://liblzf.plan9.de）压缩过了， 读入程序在碰到这个常量时， 会根据之后的 compressed_len 、 origin_len 和 compressed_string 三部分， 对字符串进行解压缩： 

其中 compressed_len 记录的是字符串被压缩之后的长度， 而 origin_len 记录的是字符串原来的长度， compressed_string 记录的则是被压缩之后的字符串。

图 IMAGE_EXAMPLE_OF_NON_COMPRESS_STRING 展示了一个保存无压缩字符串的例子， 其中字符串的长度为 5 ， 字符串的值为 "hello" 。

```
5 | "hello"
```

图 IMAGE_EXAMPLE_OF_COMPRESS_STRING 展示了一个压缩后的字符串示例， 从图中可以看出， 字符串原本的长度为 21 ， 压缩之后的长度为 6 ， 压缩之后的字符串内容为 "?aa???" ， 其中 ? 代表的是无法用字符串形式打印出来的字节。

```
REDIS_RDB_ENC_LZF | 6 | 21 | "?aa???"
```

ps: 压缩的目的是为了节约空间，但是同样的道理，压缩带来了 CPU 的性能消耗。

## 列表对象

如果 TYPE 的值为 REDIS_RDB_TYPE_LIST， 那么 value 保存的就是一个 REDIS_ENCODING_LINKEDLIST 编码的列表对象， RDB 文件保存这种对象的结构如图 IMAGE_LINKEDLIST_ENCODING_LIST 所示。

```
list_length | list1 | list2 | ... | listN
```

list_length 记录了列表的长度， 它记录列表保存了多少个项（item）， 读入程序可以通过这个长度知道自己应该读入多少个列表项。

图中以 item 开头的部分代表列表的项， 因为每个列表项都是一个字符串对象， 所以程序会以处理字符串对象的方式来保存和读入列表项。

作为示例， 图 IMAGE_EXAMPLE_OF_LINKEDLIST_ENCODING_LIST 展示了一个包含三个元素的列表。

```
3 | 5 | "hello" | 5 | "world" | 1 | "!"
```

结构中的第一个数字 3 是列表的长度， 之后跟着的分别是第一个列表项、第二个列表项和第三个列表项， 其中：

第一个列表项的长度为 5 ， 内容为字符串 "hello" 。

第二个列表项的长度也为 5 ， 内容为字符串 "world" 。

第三个列表项的长度为 1 ， 内容为字符串 "!" 。

## 集合对象

如果 TYPE 的值为 REDIS_RDB_TYPE_SET， 那么 value 保存的就是一个 REDIS_ENCODING_HT 编码的集合对象， RDB 文件保存这种对象的结构如图 IMAGE_HT_ENCODING_SET 所示。

```
set_size | elem1 | elem2 | ... | elemN
```

其中， set_size 是集合的大小， 它记录集合保存了多少个元素， 读入程序可以通过这个大小知道自己应该读入多少个集合元素。

图中以 elem 开头的部分代表集合的元素， 因为每个集合元素都是一个字符串对象， 所以程序会以处理字符串对象的方式来保存和读入集合元素。

作为示例， 图 IMAGE_EXAMPLE_OF_HT_SET 展示了一个包含四个元素的集合。

```
4 | 5 | "apple" | 6 | "banana" | 3 | "cat" | 3 | "dog"
```

结构中的第一个数字 4 记录了集合的大小， 之后跟着的是集合的四个元素：

第一个元素的长度为 5 ，值为 "apple" 。

第二个元素的长度为 6 ，值为 "banana" 。

第三个元素的长度为 3 ，值为 "cat" 。

第四个元素的长度为 3 ，值为 "dog" 。

ps: 这里和列表很类似。

## 哈希表对象

如果 TYPE 的值为 REDIS_RDB_TYPE_HASH ， 那么 value 保存的就是一个 REDIS_ENCODING_HT 编码的集合对象， RDB 文件保存这种对象的结构如图 IMAGE_HT_HASH 所示：

```
hash_size | key_value_pair1 | key_value_pair2 | ... | key_value_pairN
```

hash_size 记录了哈希表的大小， 也即是这个哈希表保存了多少键值对， 读入程序可以通过这个大小知道自己应该读入多少个键值对。

以 key_value_pair 开头的部分代表哈希表中的键值对， 键值对的键和值都是字符串对象， 所以程序会以处理字符串对象的方式来保存和读入键值对。

结构中的每个键值对都以键紧挨着值的方式排列在一起， 如图 IMAGE_KEY_VALUE_PAIR_OF_HT_HASH 所示。

```
key1 | value2 | key2 | value2 | key3 | value3
```

因此， 从更详细的角度看， 图 IMAGE_HT_HASH 所展示的结构可以进一步修改为图 IMAGE_DETIAL_HT_HASH 。

```
hash_size | key1 | value1 | key2 | value2 | ... | keyN | valueN
```

作为示例， 图 IMAGE_EXAMPLE_OF_HT_HASH 展示了一个包含两个键值对的哈希表。

```
2 | 1 | "a" | 5 | "apple" | 1 | "b" | 6 | "banana" 
```

在这个示例结构中， 第一个数字 2 记录了哈希表的键值对数量， 之后跟着的是两个键值对：

第一个键值对的键是长度为 1 的字符串 "a" ， 值是长度为 5 的字符串 "apple" 。

第二个键值对的键是长度为 1 的字符串 "b" ， 值是长度为 6 的字符串 "banana" 。

## 有序集合对象

如果 TYPE 的值为 REDIS_RDB_TYPE_ZSET ， 那么 value 保存的就是一个 REDIS_ENCODING_SKIPLIST 编码的有序集合对象， RDB 文件保存这种对象的结构如图 IMAGE_SKIPLIST_ZSET 所示。

```
sorted_set_size | elem1 | elem2 | ... | elemN
```

sorted_set_size 记录了有序集合的大小， 也即是这个有序集合保存了多少元素， 读入程序需要根据这个值来决定应该读入多少有序集合元素。

以 element 开头的部分代表有序集合中的元素， 每个元素又分为成员（member）和分值（score）两部分， 成员是一个字符串对象， 分值则是一个 double 类型的浮点数， 程序在保存 RDB 文件时会先将分值转换成字符串对象， 然后再用保存字符串对象的方法将分值保存起来。

有序集合中的每个元素都以成员紧挨着分值的方式排列， 如图 IMAGE_MEMBER_AND_SCORE_OF_ZSET 所示。

```
member1 | score1 | member2 | score2 | .... | memberN | scoreN
```

因此， 从更详细的角度看， 图 IMAGE_SKIPLIST_ZSET 所展示的结构可以进一步修改为图 IMAGE_DETIAL_SKIPLIST_ZSET 。

```
sorted_set_size |member1 | score1 | member2 | score2 | .... | memberN | scoreN
```

作为示例， 图 IMAGE_EXAMPLE_OF_SKIPLIST_ZSET 展示了一个带有两个元素的有序集合。

```
2 | 2 | "pi" | 4 | "3.14" | 1 | "e" | 3 | "2.7"
```

在这个示例结构中， 第一个数字 2 记录了有序集合的元素数量， 之后跟着的是两个有序集合元素：

第一个元素的成员是长度为 2 的字符串 "pi" ， 分值被转换成字符串之后变成了长度为 4 的字符串 "3.14" 。

第二个元素的成员是长度为 1 的字符串 "e" ， 分值被转换成字符串之后变成了长度为 3 的字符串 "2.7" 。


## INTSET 编码的集合

如果 TYPE 的值为 REDIS_RDB_TYPE_SET_INTSET ， 那么 value 保存的就是一个整数集合对象， RDB 文件保存这种对象的方法是， 先将整数集合转换为字符串对象， 然后将这个字符串对象保存到 RDB 文件里面。

如果程序在读入 RDB 文件的过程中， 碰到由整数集合对象转换成的字符串对象， 那么程序会根据 TYPE 值的指示， 先读入字符串对象， 再将这个字符串对象转换成原来的整数集合对象。

## ZIPLIST 编码的列表、哈希表或者有序集合

如果 TYPE 的值为 REDIS_RDB_TYPE_LIST_ZIPLIST 、 REDIS_RDB_TYPE_HASH_ZIPLIST 或者 REDIS_RDB_TYPE_ZSET_ZIPLIST ， 那么 value 保存的就是一个压缩列表对象， RDB 文件保存这种对象的方法是：

1. 将压缩列表转换成一个字符串对象。

2. 将转换所得的字符串对象保存到 RDB 文件。

如果程序在读入 RDB 文件的过程中， 碰到由压缩列表对象转换成的字符串对象， 那么程序会根据 TYPE 值的指示， 执行以下操作：

1. 读入字符串对象，并将它转换成原来的压缩列表对象。

2. 根据 TYPE 的值，设置压缩列表对象的类型： 如果 TYPE 的值为 REDIS_RDB_TYPE_LIST_ZIPLIST ， 那么压缩列表对象的类型为列表； 如果 TYPE 的值为 REDIS_RDB_TYPE_HASH_ZIPLIST ， 那么压缩列表对象的类型为哈希表； 如果 TYPE 的值为 REDIS_RDB_TYPE_ZSET_ZIPLIST ， 那么压缩列表对象的类型为有序集合。

从步骤 2 可以看出， 由于 TYPE 的存在， 即使列表、哈希表和有序集合三种类型都使用压缩列表来保存， RDB 读入程序也总可以将读入并转换之后得出的压缩列表设置成原来的类型。

# 个人收获

## 持久化

二进制压缩文件，是一种比较不错的持久化方式。

## BGSAVE

background 执行一个操作，而不影响现在的服务。是一个非常常见的需求。

比如 mongo 也提供了类似的 background 创建索引。


# 参考资料

[03-Redis 持久化-RDB](https://blog.csdn.net/my_momo_csdn/article/details/92075588#RDB_1)

[RDB 持久化](https://www.cnblogs.com/wujuntian/p/9249774.html)

[RDB 文件结构](http://redisbook.com/preview/rdb/rdb_struct.html)

* any list
{:toc}