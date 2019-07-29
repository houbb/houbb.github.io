---
layout: post
title: Redis Learn-31-健康指标
date: 2018-12-12 11:35:23 +0800
categories: [Redis]
tags: [redis, cache, in-action, sh]
published: true
---


# 存活情况

所有指标中最重要的当然是检查redis是否还活着，可以通过命令PING的响应是否是PONG来判断。

# 连接数

连接的客户端数量，可通过命令 `src/redis-cli info Clients | grep connected_clients` 得到，这个值跟使用redis的服务的连接池配置关系比较大，所以在监控这个字段的值时需要注意。

另外这个值也不能太大，建议不要超过5000，如果太大可能是redis处理太慢，那么需要排除问题找出原因。

另外还有一个拒绝连接数（rejected_connections）也需要关注，这个值理想状态是0。

如果大于0，说明创建的连接数超过了maxclients，需要排查原因。

是redis连接池配置不合理还是连接这个redis实例的服务过多等。

# 阻塞客户端数量

blocked_clients，一般是执行了list数据类型的BLPOP或者BRPOP命令引起的，可通过命令 `src/redis-cli info Clients | grep blocked_clients` 得到，很明显，这个值最好应该为0。

# 使用内存峰值

监控redis使用内存的峰值，我们都知道Redis可以通过命令 `config set maxmemory 10737418240` 设置允许使用的最大内存（强烈建议不要超过20G），为了防止发生swap导致Redis性能骤降，甚至由于使用内存超标导致被系统kill，建议used_memory_peak的值与maxmemory的值有个安全区间，例如1G，那么used_memory_peak的值不能超过9663676416（9G）。

另外，我们还可以监控maxmemory不能少于多少G，比如5G。

因为我们以前生产环境出过这样的问题，运维不小心把10G配置成了1G，从而导致服务器有足够内存却不能使用的悲剧。

# 内存碎片率

`mem_fragmentation_ratio=used_memory_rss/used_memory`，这也是一个非常需要关心的指标。

如果是redis4.0之前的版本，这个问题除了重启也没什么很好的优化办法。

而redis4.0有一个主要特性就是优化内存碎片率问题（Memory de-fragmentation）。

在redis.conf配置文件中有介绍即ACTIVE DEFRAGMENTATION：碎片整理允许Redis压缩内存空间，从而回收内存。

这个特性默认是关闭的，可以通过命令CONFIG SET activedefrag yes热启动这个特性。

当这个值大于1时，表示分配的内存超过实际使用的内存，数值越大，碎片率越严重。

当这个值小于1时，表示发生了swap，即可用内存不够。

另外需要注意的是，当内存使用量（used_memory）很小的时候，这个值参考价值不大。

所以，建议used_memory至少1G以上才考虑对内存碎片率进行监控。

# 缓存命中率

keyspace_misses/keyspace_hits这两个指标用来统计缓存的命令率，keyspace_misses指未命中次数，keyspace_hits表示命中次数。keyspace_hits/(keyspace_hits+keyspace_misses)就是缓存命中率。

视情况而定，建议0.9以上，即缓存命中率要超过90%。如果缓存命中率过低，那么要排查对缓存的用法是否有问题！

# OPS

instantaneous_ops_per_sec 这个指标表示缓存的OPS，如果业务比较平稳，那么这个值也不会波动很大，不过国内的业务比较特性，如果不是全球化的产品，夜间是基本上没有什么访问量的，所以这个字段的监控要结合自己的具体业务，不同时间段波动范围可能有所不同。

# 持久化

rdb_last_bgsave_status/aof_last_bgrewrite_status，即最近一次或者说最后一次RDB/AOF持久化是否有问题，这两个值都应该是"ok"。

另外，由于redis持久化时会fork子进程，且fork是一个完全阻塞的过程，所以可以监控fork耗时即 latest_fork_usec，单位是微妙，如果这个值比较大会影响业务，甚至出现timeout。

# 失效KEY

如果把Redis当缓存使用，那么建议所有的key都设置了expire属性，通过命令 `src/redis-cli info Keyspace` 得到每个db中key的数量和设置了expire属性的key的属性，且expires需要等于keys：

```
# Keyspace
db0:keys=30,expires=30,avg_ttl=0
db0:keys=23,expires=22,avg_ttl=0
```

# 慢日志

通过命令slowlog get得到Redis执行的slowlog集合，理想情况下，slowlog集合应该为空，即没有任何慢日志，

不过，有时候由于网络波动等原因造成set key value这种命令执行也需要几毫秒，在监控的时候我们需要注意，

而不能看到slowlog就想着去优化，简单的set/get可能也会出现在slowlog中。

# 个人收获

基础的常见的指标信息。

## redis 基础信息

比如执行 

```
$   info all
```

可以得到信息如下：

可以看到，redis 对基础场景的信息进行了下面维度的分类。

我们在设计框架时，就可以考虑类似的设计。

```
# Server
redis_version:4.0.14
redis_git_sha1:00000000
redis_git_dirty:0
redis_build_id:d5cb9d9a74410bd0
redis_mode:standalone
os:Linux 4.14.116-boot2docker x86_64
arch_bits:64
multiplexing_api:epoll
atomicvar_api:atomic-builtin
gcc_version:8.3.0
process_id:1
run_id:c9b103f85a7a010743dbf3ebecc0d9e073642fb8
tcp_port:6379
uptime_in_seconds:52
uptime_in_days:0
hz:10
lru_clock:4097343
executable:/data/redis-server
config_file:

# Clients
connected_clients:1
client_longest_output_list:0
client_biggest_input_buf:0
blocked_clients:0

# Memory
used_memory:849384
used_memory_human:829.48K
used_memory_rss:4218880
used_memory_rss_human:4.02M
used_memory_peak:849384
used_memory_peak_human:829.48K
used_memory_peak_perc:100.13%
used_memory_overhead:836126
used_memory_startup:786488
used_memory_dataset:13258
used_memory_dataset_perc:21.08%
total_system_memory:1037463552
total_system_memory_human:989.40M
used_memory_lua:37888
used_memory_lua_human:37.00K
maxmemory:0
maxmemory_human:0B
maxmemory_policy:noeviction
mem_fragmentation_ratio:4.97
mem_allocator:jemalloc-4.0.3
active_defrag_running:0
lazyfree_pending_objects:0

# Persistence
loading:0
rdb_changes_since_last_save:0
rdb_bgsave_in_progress:0
rdb_last_save_time:1564378379
rdb_last_bgsave_status:ok
rdb_last_bgsave_time_sec:-1
rdb_current_bgsave_time_sec:-1
rdb_last_cow_size:0
aof_enabled:0
aof_rewrite_in_progress:0
aof_rewrite_scheduled:0
aof_last_rewrite_time_sec:-1
aof_current_rewrite_time_sec:-1
aof_last_bgrewrite_status:ok
aof_last_write_status:ok
aof_last_cow_size:0

# Stats
total_connections_received:1
total_commands_processed:1
instantaneous_ops_per_sec:0
total_net_input_bytes:53
total_net_output_bytes:10219
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

# Replication
role:master
connected_slaves:0
master_replid:4704d2177bb331ffc49e70f249ddf2f1c16555fc
master_replid2:0000000000000000000000000000000000000000
master_repl_offset:0
second_repl_offset:-1
repl_backlog_active:0
repl_backlog_size:1048576
repl_backlog_first_byte_offset:0
repl_backlog_histlen:0

# CPU
used_cpu_sys:0.03
used_cpu_user:0.06
used_cpu_sys_children:0.00
used_cpu_user_children:0.00

# Commandstats
cmdstat_command:calls=1,usec=450,usec_per_call=450.00

# Cluster
cluster_enabled:0

# Keyspace
```

# 参考资料

[Redis 几个重要的健康指标](https://mp.weixin.qq.com/s/sSl3_RV_xP1EoZnE7shqfA)

* any list
{:toc}