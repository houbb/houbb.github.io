---
layout: post
title: Redis Learn-08-持久化相关的性能问题
date: 2018-12-12 11:35:23 +0800
categories: [Redis]
tags: [redis, cache, in-action, sh]
published: true
---


# fork操作

当Redis做RDB或AOF重写时，一个必不可少的操作就是执行fork操作创建子进程，对于大多数操作系统来说fork是个重量级错误。

虽然fork创建的子进程不需要拷贝父进程的物理内存空间，但是会复制父进程的空间内存页表。

例如对于10GB的Redis进程，需要复制大约20MB的内存页表，因此fork操作耗时跟进程总内存量息息相关，如果使用虚拟化技术，特别是Xen虚拟
机，fork操作会更耗时

# fork耗时问题定位

对于高流量的Redis实例OPS可达5万以上，如果fork操作耗时在秒级别将拖慢Redis几万条命令执行，对线上应用延迟影响非常明显。

正常情况下fork耗时应该是每GB消耗20毫秒左右。

可以在info stats统计中查latest_fork_usec指标获取最近一次fork操作耗时，单位微秒。

## 例子

```
127.0.0.1:6379> info Stats
# Stats
total_connections_received:2
total_commands_processed:6
instantaneous_ops_per_sec:0
total_net_input_bytes:177
total_net_output_bytes:26074
instantaneous_input_kbps:0.00
instantaneous_output_kbps:0.00
rejected_connections:0
sync_full:0
sync_partial_ok:0
sync_partial_err:0
expired_keys:0
expired_stale_perc:0.00
expired_time_cap_reached_count:0
evicted_keys:0
keyspace_hits:0
keyspace_misses:0
pubsub_channels:0
pubsub_patterns:0
latest_fork_usec:0
migrate_cached_sockets:0
slave_expires_tracked_keys:0
active_defrag_hits:0
active_defrag_misses:0
active_defrag_key_hits:0
active_defrag_key_misses:0
```

## 如何改善fork操作的耗时：

1）优先使用物理机或者高效支持fork操作的虚拟化技术，避免使用Xen。

2）控制Redis实例最大可用内存，fork耗时跟内存量成正比，线上建议每个Redis实例内存控制在10GB以内。

3）合理配置Linux内存分配策略，避免物理内存不足导致fork失败

4）降低fork操作的频率，如适度放宽AOF自动触发时机，避免不必要的全量复制等。

# 子进程开销监控和优化

子进程负责AOF或者RDB文件的重写，它的运行过程主要涉及CPU、内存、硬盘三部分的消耗。


## CPU

### CPU开销分析。

子进程负责把进程内的数据分批写入文件，这个过程属于CPU密集操作，通常子进程对单核CPU利用率接近90%.

### CPU消耗优化。

Redis是CPU密集型服务，不要做绑定单核CPU操作。

由于子进程非常消耗CPU，会和父进程产生单核资源竞争。

不要和其他CPU密集型服务部署在一起，造成CPU过度竞争。

## 内存

### 内存消耗分析。

子进程通过fork操作产生，占用内存大小等同于父进程，理论上需要两倍的内存来完成持久化操作，但Linux有写时复制机制（copy-on-write）。

父子进程会共享相同的物理内存页，当父进程处理写请求时会把要修改的页创建副本，而子进程在fork操作过程中共享整个父进程内存快照。

### 内存消耗监控。

RDB重写时，Redis日志输出容如下：

```
* Background saving started by pid 7692
* DB saved on disk
* RDB: 5 MB of memory used by copy-on-write
* Background saving terminated with success
```

如果重写过程中存在内存修改操作，父进程负责创建所修改内存页的副本，从日志中可以看出这部分内存消耗了5MB，可以等价认为RDB重写消耗了5MB的内存。

AOF重写时，Redis日志输出容如下：

```
* Background append only file rewriting started by pid 8937
* AOF rewrite child asks to stop sending diffs.
* Parent agreed to stop sending diffs. Finalizing AOF...
* Concatenating 0.00 MB of AOF diff received from parent.
* SYNC append only file rewrite performed
* AOF rewrite: 53 MB of memory used by copy-on-write
* Background AOF rewrite terminated with success
* Residual parent diff successfully flushed to the rewritten AOF (1.49 MB)
* Background AOF rewrite finished successfully
```

父进程维护页副本消耗同RDB重写过程类似，不同之处在于AOF重写需要AOF重写缓冲区，因此根据以上日志可以预估内存消耗为：

53MB+1.49MB，也就是AOF重写时子进程消耗的内存量。

### 优化方案

1）同CPU优化一样，如果部署多个Redis实例，尽量保证同一时刻只有一个子进程在工作。

2）避免在大量写入时做子进程重写操作，这样将导致父进程维护大量页副本，造成内存消耗。

Linux kernel在2.6.38内核增加了Transparent Huge Pages（THP），支持huge page（2MB）的页分配，默认开启。

当开启时可以降低fork创建子进程的速度，但执行fork之后，如果开启THP，复制页单位从原来4KB变为2MB，会大幅增加重写期间父进程内存消耗。

建议设置“sudo echonever>/sys/kernel/mm/transparent_hugepage/enabled”关闭THP。


## 硬盘开销分析

子进程主要职责是把AOF或者RDB文件写入硬盘持久化。

势必造成硬盘写入压力。

根据Redis重写AOF/RDB的数据量，结合系统工具如sar、iostat、iotop等，可分析出重写期间硬盘负载情况。

### 硬盘开销优化。

优化方法如下：

a）不要和其他高硬盘负载的服务部署在一起。

如：存储服务、消息队列服务等。

b）AOF重写时会消耗大量硬盘IO，可以开启配置no-appendfsync-onrewrite，默认关闭。表示在AOF重写期间不做fsync操作。

c）当开启AOF功能的Redis用于高流量写入场景时，如果使用普通机械磁盘，写入吞吐一般在100MB/s左右，这时Redis实例的瓶颈主要在AOF同步硬盘上。

d）对于单机配置多个Redis实例的情况，可以配置不同实例分盘存储AOF文件，分摊硬盘写入压力。


# 参考资料

[Redis slowlog 慢查询](https://www.cnblogs.com/liqing1009/p/8531109.html)

[Redis 响应延迟问题排查](https://www.cnblogs.com/xiaoleiel/p/8300911.html)

[redis 操作耗时较高问题排查记录](https://blog.csdn.net/weixin_33922672/article/details/91699126)

[Redis 持久化](https://blog.csdn.net/tian330726/article/details/85043224)

* any list
{:toc}