---
layout: post
title: redis-44-redis migrate tool redis 迁移工具 
date:  2018-09-08 11:07:16 +0800
categories: [Distributed]
tags: [distributed, redis, lock, sh]
published: true
---

# redis-migrate-tool

redis-migrate-tool is a convenient and useful tool for migrating data between redis.

## 特点：

- 快速。

- 多线程。

- 基于redis复制。

- 实时迁移。

- 迁移过程中，源集群不影响对外提供服务。

- 异构迁移。

- 支持Twemproxy集群，redis cluster集群，rdb文件 和 aof文件。

- 过滤功能。

- 当目标集群是Twemproxy，数据会跳过Twemproxy直接导入到后端的redis。

- 迁移状态显示。

- 完善的数据抽样校验。

迁移工具的来源可以是：单独的redis实例，twemproxy集群，redis cluster，rdb文件，aof文件。

迁移工具的目标可以是：单独的redis实例，twemproxy集群，redis cluster，rdb文件。

## 使用

软件编译安装：

```
$ cd redis-migrate-tool
$ autoreconf -fvi
$ ./configure
$ make
$ src/redis-migrate-tool -h
```

软件运行：

```
src/redis-migrate-tool -c rmt.conf -o log -d
```

配置文件示例：从redis cluster集群迁移数据到twemproxy集群

```
[source]
type: redis cluster
servers:
- 127.0.0.1:6379

[target]
type: twemproxy
hash: fnv1a_64
hash_tag: "{}"
distribution: ketama
servers:
- 127.0.0.1:6380:1 server1
- 127.0.0.1:6381:1 server2
- 127.0.0.1:6382:1 server3
- 127.0.0.1:6383:1 server4
	
[common]
listen: 0.0.0.0:34345
threads: 8
step: 1
mbuf_size: 512
source_safe: true
```

配置文件示例：从redis cluster集群迁移数据到另外一个cluster集群

```
[source]
type: redis cluster
servers:
- 127.0.0.1:8379

[target]
type: redis cluster
servers:
- 127.0.0.1:7379

[common]
listen: 0.0.0.0:8888
```

配置文件示例：从rdb文件恢复数据到redis cluster集群

```
[source]
type: rdb file
servers:
 - /data/redis/dump1.rdb
 - /data/redis/dump2.rdb
 - /data/redis/dump3.rdb

[target]
type: redis cluster
servers:
 - 127.0.0.1:7379

[common]
listen: 0.0.0.0:8888
```

状态查看：通过redis-cli连接redis-migrate-tool监控的端口，运行info命令

```
$redis-cli -h 127.0.0.1 -p 8888
127.0.0.1:8888> info
# Server
version:0.1.0
os:Linux 2.6.32-573.12.1.el6.x86_64 x86_64
multiplexing_api:epoll
gcc_version:4.4.7
process_id:9199
tcp_port:8888
uptime_in_seconds:1662
uptime_in_days:0
config_file:/ect/rmt.conf

# Clients
connected_clients:1
max_clients_limit:100
total_connections_received:3

# Memory
mem_allocator:jemalloc-4.0.4

# Group
source_nodes_count:32
target_nodes_count:48

# Stats
all_rdb_received:1
all_rdb_parsed:1
rdb_received_count:32
rdb_parsed_count:32
total_msgs_recv:7753587
total_msgs_sent:7753587
total_net_input_bytes:234636318
total_net_output_bytes:255384129
total_net_input_bytes_human:223.77M
total_net_output_bytes_human:243.55M
total_mbufs_inqueue:0
total_msgs_outqueue:0
127.0.0.1:8888>
```

数据校验：

```
$src/redis-migrate-tool -c rmt.conf -o log -C redis_check
Check job is running...

Checked keys: 1000
Inconsistent value keys: 0
Inconsistent expire keys : 0
Other check error keys: 0
Checked OK keys: 1000

All keys checked OK!
Check job finished, used 1.041s
```

# 参考资料

https://github.com/vipshop/redis-migrate-tool

* any list
{:toc}