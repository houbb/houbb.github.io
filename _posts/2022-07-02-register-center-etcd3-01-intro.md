---
layout: post
title:  分布式注册中心 ETCD3 01 入门介绍
date:  2022-07-02 09:22:02 +0800
categories: [Distributed]
tags: [distributed, register-center, sofa, sh]
published: true
---

# 什么是etcd？

etcd 是一个强一致性、分布式的键值存储系统，提供了一种可靠的方式来存储需要被分布式系统或机器集群访问的数据。

它在网络分区期间能够优雅地处理领导者选举，并且可以容忍机器故障，甚至是领导者节点的故障。

## 特性

### 简单接口

使用标准的 HTTP 工具（如 curl）读取和写入值。

### 键值存储

以层次化组织的目录存储数据，类似于标准文件系统。

### 监视变更

监视特定的键或目录以检测变更，并对值的变化做出反应。

# 快速入门

在不到 5 分钟内让 etcd 启动并运行！  

按照以下步骤在本地安装、运行和测试一个单成员的 etcd 集群：

1. 从预构建的二进制文件或源代码安装 etcd。有关详细信息，请参见安装说明。

   **重要提示**：确保您执行安装说明的最后一步，以验证 etcd 已在您的路径中。

2. 启动 etcd：

   ```bash
   $ etcd
   {"level":"info","ts":"2021-09-17T09:19:32.783-0400","caller":"etcdmain/etcd.go:72","msg":... }
   ⋮
   ```
   **注意**：etcd 产生的输出为日志——信息级别的日志可以忽略。

3. 在另一个终端中，使用 etcdctl 设置一个键：

   ```bash
   $ etcdctl put greeting "Hello, etcd"
   OK
   ```

4. 在同一终端中，检索该键：

   ```bash
   $ etcdctl get greeting
   greeting
   Hello, etcd
   ```



# 参考资料

https://etcd.io/docs/v3.5/quickstart/

* any list
{:toc}