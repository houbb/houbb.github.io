---
layout: post
title: windows wls install redis cluster 3 主实战篇
date: 2025-10-20 20:40:12 +0800
categories: [Redis]
tags: [redis, in-action, sh, spring]
published: true
---


# 背景

想本地安装一个 redis 集群，验证一些功能。

## 方案对比

| 方案                       | 优点          | 缺点        | 适用场景      |
| ------------------------ | ----------- | --------- | --------- |
| **WSL2 + Ubuntu**        | 接近生产、原生支持集群 | 初次安装稍麻烦   | 日常开发调试    |
| **Docker Desktop**       | 一键启动、最简单    | 依赖 Docker | 快速试验、教学演示 |
| **Redis for Windows（旧）** | 不需要 Linux   | 功能落后、不稳定  | 最轻量测试     |


# 一般的 redis 集群是什么架构？

Redis 官方推荐的最小集群是：

3 主 + 3 从 也就是一共 6 个节点。

| 节点角色         | 数量 | 作用                            |
| ------------ | -- | ----------------------------- |
| 主节点（Master）  | 3  | 负责保存数据、处理读写请求                 |
| 从节点（Replica） | 3  | 每个从节点复制一个主节点的数据，当主节点宕机时可以自动接管 |


## 优势：

高可用：主节点挂掉后，对应的从节点会自动提升为主节点（由集群选举机制决定），服务不受影响。

负载均衡：3 个主节点共同分担 16384 个哈希槽（Redis Cluster 把 key 空间分成 16384 槽位）。

数据安全性更高：写入的数据会异步复制到从节点，避免单点故障导致数据丢失。

## 哈希槽（slot）分布示意

Redis Cluster 把所有 key 的哈希值映射到 16384 个槽（slot）里。

比如：

master1 管理槽位 0–5460

master2 管理槽位 5461–10922

master3 管理槽位 10923–16383

当你往集群写入一个 key 时，Redis 根据 `CRC16(key) % 16384` 算出槽号，自动路由到对应的 master 节点。

## 读写规则

默认：

写操作 只发往主节点；

读操作 也默认发往主节点；

如果你要读从节点（分担压力），可以开启：

```
read-only yes
```

或用 readonly 命令让客户端允许读从节点。

## 故障与选举机制

当某个 master 节点挂掉：

负责它的从节点会被集群自动提升为新的 master；

其它节点会重新分配槽位路由；

客户端会自动感知变化（通过 MOVED 重定向）。

注意：Redis Cluster 至少要有 过半的主节点存活，整个集群才能保持可写。

## 更多变体

| 架构      | 特点      | 场景      |
| ------- | ------- | ------- |
| 1 主 1 从 | 最简单的高可用 | 小规模项目   |
| 3 主 3 从 | 官方推荐    | 标准生产集群  |
| N 主 M 从 | 灵活配置    | 大型分布式集群 |

# 本地测试集群-3主

## 背景

这里仅仅是本地做测试验证。

Redis Cluster 至少需要 3 个主节点 才能形成一个真正的集群，因为：

Redis 集群要有 多个主节点 来分配 16384 个槽位；

如果少于 3 个主节点，虽然可以强行建起来，但很多高可用特性（比如投票选举）就无效。

## 环境选择

为了更加接近产线，我们 windows 可以直接选择 WSL

# 实战

## WSL 确认

windows 命令行输出 WSL 进入 ubuntu 后

```
$ lsb_release -a
No LSB modules are available.
Distributor ID: Ubuntu
Description:    Ubuntu 22.04.2 LTS
Release:        22.04
Codename:       jammy
```

## 安装 redis

```
sudo apt update
sudo apt install redis-server -y
```

## 验证

```
redis-server -v
```

如下

```
Redis server v=6.0.16 sha=00000000:0 malloc=jemalloc-5.2.1 bits=64 build=e91d7986ac6d5bb6
```

## 创建文件夹

```
cd ~
mkdir redis-cluster
cd redis-cluster
```

创建三个目录

```
mkdir 7000 7001 7002
```

## 准备三份配置文件

这里简单起见，我们可以先准备一个模板 redis.conf

主要改一下 `port` 和 `dir`

```conf
# ------------------------------
# 基础配置
# ------------------------------

# 当前实例端口号（每个节点唯一）
port 7000

# 实例名称对应的工作目录
# 日志、AOF、RDB、集群配置文件都会存放在这里
dir /home/houbinbin/redis-cluster/7000/

# 日志文件路径（也可以直接打印到 stdout）
logfile "redis-7000.log"

# 监听所有地址（方便集群节点间通信）
bind 0.0.0.0

# 是否以守护进程方式运行
# 在 WSL 建议设为 no（前台运行方便调试）
daemonize no

# ------------------------------
# 集群模式配置
# ------------------------------

# 开启 Redis Cluster 模式
cluster-enabled yes

# 集群配置文件名（Redis 会自动生成和维护）
cluster-config-file nodes.conf

# 集群节点超时时间（ms）
# 若节点在 5s 内无响应则被认为下线
cluster-node-timeout 5000

# ------------------------------
# 持久化配置
# ------------------------------

# 开启 AOF（追加文件日志）持久化
appendonly yes

# AOF 文件名
appendfilename "appendonly.aof"

# AOF 同步策略（每次写入都 fsync，安全但稍慢）
appendfsync everysec

# RDB 快照（可选）
save 900 1
save 300 10
save 60 10000

# ------------------------------
# 访问控制（调试时一般不开启）
# ------------------------------
# requirepass 123456
```

我们修改一下端口号，分别把 redis.conf 放在 7000 7001 7002 的对应文件夹下。


## 启动 3 个实例

用下方命令，启动执行 3 个 redis 服务

```
redis-server ~/redis-cluster/7000/redis.conf &
redis-server ~/redis-cluster/7001/redis.conf &
redis-server ~/redis-cluster/7002/redis.conf &
```

每个节点独立运行，端口监听正常，可以单独访问。

### 效果确认

```
$ ps -ef | grep redis
redis       2365       1  0 20:40 ?        00:00:08 /usr/bin/redis-server 127.0.0.1:6379
houbinb+   21910     653  0 21:46 pts/0    00:00:00 redis-server 0.0.0.0:7000 [cluster]
houbinb+   21911     653  0 21:46 pts/0    00:00:00 redis-server 0.0.0.0:7001 [cluster]
houbinb+   21923     653  0 21:46 pts/0    00:00:00 redis-server 0.0.0.0:7002 [cluster]
houbinb+   22160     653  0 21:47 pts/0    00:00:00 grep --color=auto redis
```

连通性确认

```
$ redis-cli -p 7000 ping
PONG

$ redis-cli -p 7001 ping
PONG

$ redis-cli -p 7002 ping
PONG
```

### 关闭服务

当然你可以关闭，不配置是不需要的。

```
redis-cli -p 7000 shutdown
redis-cli -p 7001 shutdown
redis-cli -p 7002 shutdown
```

## 创建集群

让节点互相通信，分配 slot，把它们组成一个集群。

```
redis-cli --cluster create 127.0.0.1:7000 127.0.0.1:7001 127.0.0.1:7002 --cluster-replicas 0 --cluster-yes
```

成功日志：

```
>>> Performing hash slots allocation on 3 nodes...
Master[0] -> Slots 0 - 5460
Master[1] -> Slots 5461 - 10922
Master[2] -> Slots 10923 - 16383
M: 06d821ea5947334d9435d25746488e03239405aa 127.0.0.1:7000
   slots:[0-5460] (5461 slots) master
M: aaebb654d0573b0c20386d906d7247746463ea0a 127.0.0.1:7001
   slots:[5461-10922] (5462 slots) master
M: e830d8a8c53d18fce72500f52ead7623671fec6d 127.0.0.1:7002
   slots:[10923-16383] (5461 slots) master
>>> Nodes configuration updated
>>> Assign a different config epoch to each node
>>> Sending CLUSTER MEET messages to join the cluster
Waiting for the cluster to join
..
>>> Performing Cluster Check (using node 127.0.0.1:7000)
M: 06d821ea5947334d9435d25746488e03239405aa 127.0.0.1:7000
   slots:[0-5460] (5461 slots) master
M: e830d8a8c53d18fce72500f52ead7623671fec6d 127.0.0.1:7002
   slots:[10923-16383] (5461 slots) master
M: aaebb654d0573b0c20386d906d7247746463ea0a 127.0.0.1:7001
   slots:[5461-10922] (5462 slots) master
[OK] All nodes agree about slots configuration.
>>> Check for open slots...
>>> Check slots coverage...
[OK] All 16384 slots covered.
```

# 集群验证

## 基本信息

```
$ redis-cli -p 7000 cluster nodes
e830d8a8c53d18fce72500f52ead7623671fec6d 127.0.0.1:7002@17002 master - 0 1760968540671 3 connected 10923-16383
06d821ea5947334d9435d25746488e03239405aa 127.0.0.1:7000@17000 myself,master - 0 1760968539000 1 connected 0-5460
aaebb654d0573b0c20386d906d7247746463ea0a 127.0.0.1:7001@17001 master - 0 1760968540000 2 connected 5461-10922
```

## 读写测试

```
$ redis-cli -p 7000 set foo "bar"
(error) MOVED 12182 127.0.0.1:7002

$ redis-cli -p 7001 get foo
(error) MOVED 12182 127.0.0.1:7002
```

我们可以根据提示，移动到正确的节点。

也可以使用 `-c` 自动跟随 MOVED

```
$ redis-cli -c -p 7000 set foo "bar"
OK

$ redis-cli -c -p 7001 get foo
"bar"
```

# springboot 访问集群入门例子











* any list
{:toc}