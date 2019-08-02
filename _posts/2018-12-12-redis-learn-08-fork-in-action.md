---
layout: post
title: Redis Learn-08-Redis 延迟分析实战
date: 2018-12-12 11:35:23 +0800
categories: [Redis]
tags: [redis, cache, in-action, sh]
published: true
---

# 分析的方向

## 内在原因

不合理地使用API或数据结构、CPU饱和、持久化阻塞

## 外在原因

CPU竞争、内存交换、网络问题等。

# 内在原因

## 不合理地使用API或数据结构

可能会有一些很慢的操作。

比如 O(n) 的操作。

## cpu 饱和

```
$   top
```

查看内存等占用信息

## 持久化阻塞

aof rdb 的 fork 持久化。

## 慢操作

`info commandstats` 可以查看操作的平均时间。

slowlog

latency

# 外在原因

## 内存交换

登录进入 redis  

- 查看 redis 的 pid

```
> info server
```

process_id 对应的信息

- 查看 swap 信息

```
cat /proc/${process_id}/smaps | grep Swap
```

# Redis 的登录

## 命令

```
$   redis-cli -h xxx.xxx.xxx.xxx -p ${port}
```

## 验证

如果有密码，则需要进一步验证

```
$   auth ${password}
```

# 慢日志

redis的slow log记录了那些执行时间超过规定时长的请求。

执行时间不包括 I/O 操作（比如与客户端进行网络通信等），只是命令的实际执行时间（期间线程会被阻塞，无法服务于其它请求）。 

## 配置

有两个参数用于配置slow log：  

```
slowlog-log-slower-than：设定执行时间，单位是毫秒，执行时长超过该时间的命令将会被记入log。-1表示不记录slow log; 0强制记录所有命令。 
slowlog-max-len：slow log的长度。最小值为0。如果日志队列已超出最大长度，则最早的记录会被从队列中清除。 
```

可以通过编辑redis.conf文件配置以上两个参数。

对运行中的redis, 可以通过config get, config set命令动态改变上述两个参数

## 查看

slow log是记录在内存中的，所以即使你记录所有的命令（将slowlog-log-slower-than设为0），对性能的影响也很小。 

```
slowlog get: 列出所有slow log 
slowlog get N:列出最近N条slow log
```

## 解释

## 最佳实践

慢日志放在内存中，而且一般最大数量默认为 128。

这里透露了两个问题：

（1）内存中，重启信息会丢失

（2）最大记录有限制，多了会丢失。

如果想保证所有的慢日志可以保存下来，可以定时将慢日志保存起来。并且定期清空。

这个任务可以交给 redis 的监控来做，对客户端应该是透明的。

## 一些教训

实际，一般建议将慢日志的时间设置为 10ms

但是有些操作是比较耗时的，慎用。

`info all` 可能要统计很多信息，操作一次可能要 20ms。

或者是一些 `keys*` 正则匹配，这个复杂度为 O(n)。

# 持久化配置

持久化一般是缓存的瓶颈所在。

## 持久化策略

参考 [RDB](https://houbb.github.io/2018/12/12/redis-learn-07-rdb-persist) 和 [AOF](https://houbb.github.io/2018/12/12/redis-learn-08-aof-persist)


## 持久化过程

比如 RDB 持久化，redis 主线程会 fork 一个子进程进行内存快照(snapshot)的存储。

这个 fork 的过程会阻塞客户端的响应。

## fork 耗时

可以在 info stats 统 计中查 latest_fork_usec 指标获取最近一次fork操作耗时，单位微秒。

当然这里只保存了最近的一次。

如果想看全部，可以在 slow_log 中查看（超过阈值的话才会保存）

发现耗时还是比较快的，10ms 左右，主要是数据不多。

## RDB 持久化相关日志

所有的日志，都可以在 redis.log 中查看。

```
[13351] 09 Jul 14:39:20.564 * Background saving started by pid 44595
[44595] 09 Jul 14:41:41.933 * DB saved on disk
[44595] 09 Jul 14:41:42.179 * RDB: 134 MB of memory used by copy-on-write （这一行显示Redis在做RDB的过程中，主进程copy了多少内存）
[13351] 09 Jul 14:41:42.679 * Background saving terminated with success
```

# 其他原因

如果发现 redis 本身没有记录这些信息，可能问题出在其他地方，比如网络通讯，cpu，磁盘等硬件资源不足。

## 网络和通信引起的延迟

当用户连接到Redis通过TCP/IP连接或Unix域连接，千兆网络的典型延迟大概200us，而Unix域socket可能低到30us。

这完全基于你的网络和系统硬件。在通信本身之上，系统增加了更多的延迟（线程调度，CPU缓存，NUMA替换等等）。

系统引起的延迟在虚拟机环境远远高于在物理机器环境。

实际情况是即使Redis处理大多数命令在微秒之下，客户机和服务器之间的交互也必然消耗系统相关的延迟。

一个高效的客户机因而试图通过捆绑多个命令在一起的方式减少交互的次数。服务器和大多数客户机支持这种方式。聚合命令象MSET/MGET也可以用作这个目的。从Redis 2.4版本起，很多命令对于所有的数据类型也支持可变参数。

### 这里有一些指导：

如果你负担的起，尽可能的使用物理机而不是虚拟机来做服务器

不要经常的connect/disconnect与服务器的连接（尤其是对基于web的应用），尽可能的延长与服务器连接的时间。

如果你的客户端和服务器在同一台主机上，则使用Unix域套接字

尽量使用聚合命令(MSET/MGET)或可变参数命令而不是pipelining

如果可以尽量使用pipelining而不是序列的往返命令。

针对不适合使用原始pipelining的情况，如某个命令的结果是后续命令的输入，在以后的版本中redis提供了对服务器端的lua脚本的支持，实验分支版本现在已经可以使用了。

在Linux上，你可以通过process placement(taskset)、cgroups、real-time priorities(chrt)、NUMA配置(numactl)或使用低延迟内核的方式来获取较低的延迟。请注意Redis 并不适合被绑到单个CPU核上。redis会在后台创建一些非常消耗CPU的进程，如bgsave和AOF重写，这些任务是绝对不能和主事件循环进程放在一个CPU核上的。

大多数情况下上述的优化方法是不需要的，除非你确实需要并且你对优化方法很熟悉的情况下再使用上述方法。

- pipeline

这个管道操作，可以减少网络 io 的消耗，但是一次不能操作太多，因为会阻塞其他操作。

## Redis的单线程属性

Redis 使用了单线程的设计，意味着单线程服务于所有的客户端请求，使用一种复用的技术。

这种情况下redis可以在任何时候处理单个请求， 所以所有的请求是顺序处理的。

这和Node.js的工作方式很像， 所有的产出通常不会有慢的感觉，因为处理单个请求的时间非常短，但是最重要的是这些产品被设计为非阻塞系统调用，比如从套接字中读取或写入数据。

我提到过Redis从2.4版本后几乎是单线程的，我们使用线程在后台运行一些效率低下的I/O操作， 主要关系到硬盘I/O，但是这不改变Redis使用单线程处理所有请求的事实。

## 低效操作产生的延迟

单线程的一个结果是，当一个请求执行得很慢，其他的客户端调用就必须等待这个请求执行完毕。

当执行GET、SET或者 LPUSH 命令的时候这不是个问题，因为这些操作可在很短的常数时间内完成。

然而，对于多个元素的操作，像SORT, LREM, SUNION 这些，做两个大数据集的交叉要花掉很长的时间。

文档中提到了所有操作的算法复杂性。 

在使用一个你不熟悉的命令之前系统的检查它会是一个好办法。

如果你对延迟有要求，那么就不要执行涉及多个元素的慢操作。

**你可以使用Redis的replication功能，把这类慢操作全都放到replica上执行。**

可以用 Redis 的 Slow Log 来监控慢操作。

此外，你可以用你喜欢的进程监控程序（top, htop, prstat, 等...）来快速查看Redis进程的CPU使用率。

如果traffic不高而CPU占用很高，八成说明有慢操作。

## 延迟由fork产生

Redis不论是为了在后台生成一个RDB文件，还是为了当AOF持久化方案被开启时重写Append Only文件，都会在后台fork出一个进程。

fork操作（在主线程中被执行）本身会引发延迟。

在大多数的类unix操作系统中，fork是一个很消耗的操作，因为它牵涉到复制很多与进程相关的对象。而这对于分页表与虚拟内存机制关联的系统尤为明显

对于运行在一个linux/AMD64系统上的实例来说，内存会按照每页4KB的大小分页。

为了实现虚拟地址到物理地址的转换，每一个进程将会存储一个分页表（树状形式表现），分页表将至少包含一个指向该进程地址空间的指针。

所以一个空间大小为24GB的redis实例，需要的分页表大小为  24GB/4KB*8 = 48MB。

当一个后台的save命令执行时，实例会启动新的线程去申请和拷贝48MB的内存空间。

这将消耗一些时间和CPU资源，尤其是在虚拟机上申请和初始化大块内存空间时，消耗更加明显。

### 在不同系统中的Fork时间

除了Xen系统外，现代的硬件都可以快速完美的复制页表。

Xen系统的问题不是特定的虚拟化，而是特定的Xen.例如使用VMware或者Virutal Box不会导致较慢的fork时间。

下面的列表比较了不同Redis实例的fork时间。

数据包含正在执行的BGSAVE，并通过INFO指令查看thelatest_fork_usecfiled。

Linux beefy VM on VMware 6.0GB RSS forked 77 微秒 (每GB 12.8 微秒 ).
Linux running on physical machine (Unknown HW) 6.1GB RSS forked 80 微秒(每GB 13.1微秒)
Linux running on physical machine (Xeon @ 2.27Ghz) 6.9GB RSS forked into 62 微秒 (每GB 9 微秒).
Linux VM on 6sync (KVM) 360 MB RSS forked in 8.2 微秒 (每GB 23.3 微秒).
Linux VM on EC2 (Xen) 6.1GB RSS forked in 1460 微秒 (每GB 239.3 微秒).
Linux VM on Linode (Xen) 0.9GBRSS forked into 382 微秒 (每GB 424 微秒).

你能看到运行在Xen上的VM的Redis性能相差了一到两个数量级。

我们相信这是Xen系统的一个验证问题，我们希望这个问题能尽快处理。 

## swapping (操作系统分页)引起的延迟

Linux (以及其他一些操作系统) 可以把内存页存储在硬盘上，反之也能将存储在硬盘上的内存页再加载进内存，这种机制使得内存能够得到更有效的利用。

如果内存页被系统移到了swap文件里，而这个内存页中的数据恰好又被redis用到了（例如要访问某个存储在内存页中的key），系统就会暂停redis进程直到把需要的页数据重新加载进内存。

这个操作因为牵涉到随机I/O，所以很慢，会导致无法预料的延迟。

系统之所以要在内存和硬盘之间置换redis页数据主要因为以下三个原因：

（1）系统总是要应对内存不足的压力，因为每个运行的进程都想申请更多的物理内存，而这些申请的内存的数量往往超过了实际拥有的内存。简单来说就是redis使用的内存总是比可用的内存数量更多。

（2）redis实例的数据，或者部分数据可能就不会被客户端访问，所以系统可以把这部分闲置的数据置换到硬盘上。需要把所有数据都保存在内存中的情况是非常罕见的。

（3）一些进程会产生大量的读写I/O。因为文件通常都有缓存，这往往会导致文件缓存不断增加，然后产生交换（swap）。请注意，redis RDB和AOF后台线程都会产生大量文件。

所幸 Linux 提供了很好的工具来诊断这个问题，所以当延迟疑似是swap引起的，最简单的办法就是使用Linux提供的工具去确诊。

首先要做的是检查swap到硬盘上的redis内存的数量，为实现这个目的要知道redis实例的进程id：

```
$ redis-cli info | grep process_id
process_id:5454
```

进入进程目录:

```
$ cd /proc/5454
```

在这里你会发现一个名为 smaps 的文件，它描述了redis进程的内存布局 (假定你使用的是Linux 2.6.16或者更新的版本)。

这个文件包括了很多进程所使用内存的细节信息，其中有一项叫做Swap的正是我们所关心的。

不过仅看这一项是不够的，因为smaps文件包括有redis进程的多个不同的的内存映射区域的使用情况（进程的内存布局远不是线性排列那么简单）。

从我们对所有进程的内存交换情况感兴趣以来，我们首先要做的事情是使用grep命令显示进程的smaps文件

```
$ cat smaps | grep 'Swap:'
Swap:                  0 kB
Swap:                  0 kB
Swap:                  0 kB
Swap:                  0 kB
Swap:                  0 kB
Swap:                 12 kB
Swap:                156 kB
Swap:                  8 kB
Swap:                  0 kB
Swap:                  0 kB
Swap:                  0 kB
Swap:                  0 kB
Swap:                  0 kB
Swap:                  0 kB
Swap:                  0 kB
Swap:                  0 kB
Swap:                  0 kB
Swap:                  4 kB
Swap:                  0 kB
```

假如所有的数据显示为0kb或者某些数据偶尔显示为4kb，表示当前一切正常。

实际上我们的例子是一个真实的运行着Redis并每秒为数百的用户提供服务的网站，会显示更多的交换页。

为了研究是否存在一个严重的问题，我们改变命令打印出分配的内存尺寸

```
$ cat smaps | egrep '^(Swap|Size)'
Size:                316 kB
Swap:                  0 kB
Size:                  4 kB
Swap:                  0 kB
Size:                  8 kB
Swap:                  0 kB
Size:                 40 kB
Swap:                  0 kB
Size:                132 kB
Swap:                  0 kB
Size:             720896 kB
Swap:                 12 kB
Size:               4096 kB
Swap:                156 kB
Size:               4096 kB
Swap:                  8 kB
Size:               4096 kB
Swap:                  0 kB
Size:                  4 kB
Swap:                  0 kB
Size:               1272 kB
Swap:                  0 kB
Size:                  8 kB
Swap:                  0 kB
Size:                  4 kB
Swap:                  0 kB
Size:                 16 kB
Swap:                  0 kB
Size:                 84 kB
Swap:                  0 kB
```

在输出信息中，你能看到有一个720896kb的内存分配（有12kb的交换）还有一个156kb的交换是另一个进程的。

基本上我们的内存只会有很小的内存交换，因此不会产生任何的问题

假如进程的内存有相当部分花在了swap上，那么你的延迟可能就与swap有关。

假如redis出现这种情况那么可以用 vmstat 命令来验证一下猜测：

```
$ vmstat 1
procs -----------memory---------- ---swap-- -----io---- -system-- ----cpu----
 r  b   swpd   free   buff  cache   si   so    bi    bo   in   cs us sy id wa
 0  0   3980 697932 147180 1406456    0    0     2     2    2    0  4  4 91  0
 0  0   3980 697428 147180 1406580    0    0     0     0 19088 16104  9  6 84  0
 0  0   3980 697296 147180 1406616    0    0     0    28 18936 16193  7  6 87  0
 0  0   3980 697048 147180 1406640    0    0     0     0 18613 15987  6  6 88  0
 2  0   3980 696924 147180 1406656    0    0     0     0 18744 16299  6  5 88  0
 0  0   3980 697048 147180 1406688    0    0     0     4 18520 15974  6  6 88  0
```

输出中我们最感兴趣的两行是si 和 so，这两行分别统计了从swap文件恢复到内存的数量和swap到文件的内存数量。

如果在这两行发现了非0值那么就说明系统正在进行swap。

最后，可以用iostat命令来查看系统的全局I/O行为。

```
$ iostat -xk 1
avg-cpu:  %user   %nice %system %iowait  %steal   %idle
          13.55    0.04    2.92    0.53    0.00   82.95

Device:         rrqm/s   wrqm/s     r/s     w/s    rkB/s    wkB/s avgrq-sz avgqu-sz   await  svctm  %util
sda               0.77     0.00    0.01    0.00     0.40     0.00    73.65     0.00    3.62   2.58   0.00
sdb               1.27     4.75    0.82    3.54    38.00    32.32    32.19     0.11   24.80   4.24   1.85
```

如果确认延迟是由于swap引起的，那么就需要减小系统的内存压力，要么给机器增加内存，要么不要在同一个机器上运行其他消耗内存的程序。

# AOF 和硬盘I/O操作延迟

## AOF 模式简介

另一个延迟的根源是Redis的AOF（仅附加文件）模式。

AOF基本上是通过两个系统间的调用来完成工作的。 

一个是写，用来写数据到AOF， 另外一个是文件数据同步，通过清除硬盘上空核心文件的缓冲来保证用户指定的持久级别。

包括写和文件数据同步的调用都可以导致延迟的根源。 

写实例可以阻塞系统范围的同步操作，也可以阻塞当输出的缓冲区满并且内核需要清空到硬盘来接受新的写入的操作。

文件数据同步对于延迟的影响非常大，因为它涉及到好几步调用，可能要花掉几毫秒以致几秒的时间，特别是在还有其他进程后也在占用I/O的情况下。

因为这个原因，从redis2.4开始用一个单独的线程来做文件数据同步。

## 如何配置

我们来看看当使用AOF的时候如何配置来降低延迟。

通过设置AOF相关的appendfsync项，可以使用三种不同的方式来执行文件同步（也可以在运行时使用CONFIG SET 命令来修改这个配置）。

appendfsync 的值设置为no，redis不执行fsync。

这种情况下造成延迟的唯一原因就是写操作。

这种延迟没有办法可以解决，因为redis接收到数据的速度是不可控的，不过这种情况也不常见，除非有其他的进程占用I/O使得硬盘速度突然下降。

appendfsync 的值设置为everysec，每秒都会执行fsync。fsync 由一个单独线程执行，如果需要写操作的时候有fsync正在执行redis就会用一个buffer来延迟写入2秒（因为在Linux如果一个fsync 正在运行那么对该文件的写操作就会被堵塞）。如果fsync 耗时过长（译者注：超过了2秒），即使fsync 还在进行redis也会执行写操作，这就会造成延迟。

appendfsync 的值设置为always ，fsync 会在每次写操作返回成功代码之前执行（事实上redis会积累多个命令在一次fsync 过程中执行）。这种模式下的性能表现是非常差劲的，所以最好使用一个快速的磁盘和文件系统以加快fsync 的执行。

大多数redis用户都会把这个值设成 no 或者 everysec。

要减少延迟，最好避免在同一个机器上有其他耗费I/O的程序。用SSD也有益于降低延迟，不过即使不使用SSD，如果能有冗余的硬盘专用于AOF也会减少寻址时间，从而降低延迟。

如果你想诊断AOF相关的延迟原因可以使用strace 命令：

sudo strace -p $(pidof redis-server) -T -e trace=fdatasync
上面的命令会展示redis主线程里所有的fdatasync系统调用。不包括后台线程执行的fdatasync 调用。如果appendfsync 配置为everysec，则给strace增加-f选项。

用下面命令可以看到fdatasync和write调用：

```
sudo strace -p $(pidof redis-server) -T -e trace=fdatasync,write
```

不过因为write也会向客户端写数据，所以用上面的命令很可能会获得许多与磁盘I/O没有关系的结果。似乎没有办法让strace 只显示慢系统调用，所以要用下面的命令：

```
sudo strace -f -p $(pidof redis-server) -T -e trace=fdatasync,write 2>&1 | grep -v '0.0' | grep -v unfinished
```

# 数据过期造成的延迟

## 过期策略

redis有两种方式来去除过期的key：

lazy 方式，在key被请求的时候才检查是否过期。 to be already expired.

active 方式，每0.1秒进行一次过期检查。

## Active 模式

active 过期模式是自适应的，每过100毫秒开始一次过期检查（每秒10次），每次作如下操作：

根据 REDIS_EXPIRELOOKUPS_PER_CRON 的值去除已经过期的key（是指如果过期的key数量超过了REDIS_EXPIRELOOKUPS_PER_CRON 的值才会启动过期操作，太少就不必了。这个值默认为10）, evicting all the keys already expired.

假如超过25%（是指REDIS_EXPIRELOOKUPS_PER_CRON这个值的25%，这个值默认为10，译者注）的key已经过期，则重复一遍检查失效的过程。

REDIS_EXPIRELOOKUPS_PER_CRON 默认为10， 过期检查一秒会执行10次，通常在actively模式下1秒能处理100个key。

在过期的key有一段时间没被访问的情况下这个清理速度已经足够了，所以 lazy模式基本上没什么用。

1秒只过期100个key也不会对redis造成多大的影响。

这种算法式是自适应的，如果发现有超过指定数量25%的key已经过期就会循环执行。这个过程每秒会运行10次，这意味着随机样本中超过25%的key会在1秒内过期。

通常来讲如果有很多key在同一秒过期，超过了所有key的25%，redis就会阻塞直到过期key的比例下降到25%以下。

使用这种策略是为了避免清除过期key的过程占用太多内存，这种方法对系统几乎不会有不良影响，因为大量key同时到期并非是一种常见现象，不过如果用户使用了 EXPIREAT 来设置过期时间的话也是有可能的。

总而言之： 要知道大量key同时过期会对系统延迟造成影响。

# Redis 看门狗

Redis2.6版本引进了redis看门狗(watchdog)软件，这是个调试工具用于诊断Redis的延迟问题

这个看门狗软件还是一个实验性功能，当用于生产环境时，请小心并做好备份工作，可能有意想不到的问题影响正常的redis服务。

当你没有更好的工具追踪问题时，可以使用它。

## 工作流程

这个功能是这样工作的：

用户通过命令CONFIG SET开启软件看门狗

Redis启动监测程序监测自己的状态

如果Redis检测到服务器被某些操作阻塞了，并运行速度不够快，也许是因为延迟导致的，Redis就会在log文件中写入一份关于被阻塞服务器的底层监测数据报表
用户通过Redis Google Group发送消息给开发人员，消息包括看门狗报表。

请注意，这项功能不能通过redis.conf文件开启，因为这项够能设计之初就是面向正在运行的服务器，而且只是为了调试程序。

如果要开启该功能，只需运行如下命令：

```
CONFIG SET watchdog-period 500
```

时间间隔以毫秒为单位。在上面的例子中，我指定了，当服务器检测到500毫秒或更大的延迟的时候，才记录延迟事件。最小的时间间隔是200毫秒。

当你运行完了软件看门狗，你可以通过设置时间间隔参数为0来关闭看门狗。

## 注意

需要注意的：记得关闭看门狗，因为开启看门狗太长时间并不是一个好主意。

## 日志

以下的例子，你可以看到，当看门狗监测到延迟事件的时候，输出日志文件的内容：

```
[8547 | signal handler] (1333114359)
--- WATCHDOG TIMER EXPIRED ---
/lib/libc.so.6(nanosleep+0x2d) [0x7f16b5c2d39d]
/lib/libpthread.so.0(+0xf8f0) [0x7f16b5f158f0]
/lib/libc.so.6(nanosleep+0x2d) [0x7f16b5c2d39d]
/lib/libc.so.6(usleep+0x34) [0x7f16b5c62844]
./redis-server(debugCommand+0x3e1) [0x43ab41]
./redis-server(call+0x5d) [0x415a9d]
./redis-server(processCommand+0x375) [0x415fc5]
./redis-server(processInputBuffer+0x4f) [0x4203cf]
./redis-server(readQueryFromClient+0xa0) [0x4204e0]
./redis-server(aeProcessEvents+0x128) [0x411b48]
./redis-server(aeMain+0x2b) [0x411dbb]
./redis-server(main+0x2b6) [0x418556]
/lib/libc.so.6(__libc_start_main+0xfd) [0x7f16b5ba1c4d]
./redis-server() [0x411099]
------
```

注意：例子中 DEBUG SLEEP 命令是用于阻塞服务器的。

在不同的阻塞背景下，堆栈信息会有不同。

如果收集到多个看门狗的监测堆栈信息，我们鼓励你把这些信息发送到Redis Google Group：我们获得越多的信息，我们就越容易分析得到你的服务器到底有什么问题。


# 参考资料

[Redis slowlog 慢查询](https://www.cnblogs.com/liqing1009/p/8531109.html)

[Redis 响应延迟问题排查](https://www.cnblogs.com/xiaoleiel/p/8300911.html)

[redis 操作耗时较高问题排查记录](https://blog.csdn.net/weixin_33922672/article/details/91699126)

[Redis 持久化](https://blog.csdn.net/tian330726/article/details/85043224)

* any list
{:toc}