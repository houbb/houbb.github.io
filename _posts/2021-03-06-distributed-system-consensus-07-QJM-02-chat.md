---
layout: post
title: 分布式一致性算法-07-聊一聊 QJM QuorumJournalManager
date:  2021-3-06 16:52:15 +0800
categories: [Distributed]
tags: [algorithm, distributed, java, sh]
published: true
---


# chat



### 分布式一致性算法 QuorumJournalManager 详解

QuorumJournalManager（QJM）是Hadoop HDFS中实现高可用性（HA）的核心组件，通过分布式一致性协议管理NameNode的EditLog，确保元数据的一致性和可靠性。

以下从多个维度展开详细解析：

---

#### 一、基本原理与架构设计
1. Quorum机制  
   QJM基于 多数派原则（N/2+1） ，要求写入操作需在大多数JournalNode（JN）节点成功，以此保证数据一致性。例如，3节点集群需至少2个节点确认写入，容忍单点故障。

2. 核心组件  
   - JournalNode（JN） ：独立守护进程，提供RPC接口供NameNode读写EditLog，每个JN本地存储日志文件。  
   - QuorumJournalManager：运行于NameNode，协调JN集群的写入与同步，封装了Epoch管理、故障恢复等逻辑。  
   - AsyncLoggerSet：异步发送EditLog到所有JN，并等待多数派响应，通过QuorumCall管理结果。  
   - FSEditLog：所有EditLog操作的入口，整合本地和远程日志管理。

3. 写入流程  
   1. 获取Epoch：新活跃NameNode生成唯一递增的EpochNumber，发送`newEpoch`请求至所有JN，确保旧节点无法继续写入。  
   2. 日志恢复：若存在未完成的日志段（如部分JN写入失败），通过Paxos协议同步至一致状态。  
   3. 并行写入：通过AsyncLoggerSet并发发送EditLog至所有JN，等待多数派成功响应后确认提交。  
   4. 确认段（Finalize） ：完成日志段后，通知JN持久化，并标记为不可修改。

---

#### 二、节点角色与通信机制
1. 节点角色  
   - 活跃NameNode（ANN） ：处理客户端请求，写入EditLog至JN集群。  
   - 备用NameNode（SNN） ：通过HTTP从JN拉取EditLog并重放，保持元数据同步。  
   - JournalNode集群：奇数节点组成，提供高可用存储，确保多数派存活时系统可用。

2. 通信协议  
   - RPC（QJournalProtocol） ：用于ANN向JN发送写入请求，以及SNN同步日志。  
   - HTTP（JournalNodeHttpServer） ：供SNN或其他JN拉取日志文件，支持断点续传和冗余校验。  
   - 异步管道（AsyncLogger） ：每个JN对应一个AsyncLogger，非阻塞发送请求，提升吞吐量。

---

#### 三、故障恢复与一致性保障
1. 日志恢复流程  
   - 状态获取：ANN向所有JN发送`getJournalState`，获取各节点最新的Epoch和日志段信息。  
   - 数据同步：选择事务ID最高的日志段作为基准，通过`prepareRecovery`和`acceptRecovery`同步至落后节点。  
   - 最终确认：多数节点同步完成后，发送`finalizeLogSegment`标记日志段为最终状态。

2. 防止脑裂（Split-Brain）  
   - Epoch机制：JN仅接受最大Epoch的写入请求，旧ANN的请求会被拒绝。  
   - 隔离（Fencing） ：通过脚本或ZKFC（ZooKeeper Failover Controller）强制终止旧ANN进程。

3. 一致性协议  
   QJM基于Paxos变体，通过两阶段提交（Prepare-Accept）恢复不一致日志，而常规写入优化为类似Multi-Paxos，跳过Prepare阶段直接提交，降低延迟。

---

#### 四、性能优化与部署实践
1. 性能优化  
   - 异步批量写入：合并多个EditLog操作批量发送，减少RPC次数。  
   - 双缓冲（DoubleBuffer） ：JN使用内存缓冲区暂存数据，异步刷盘避免阻塞写入线程。  
   - 动态超时调整：根据网络状况动态延长`DFS_QJOURNAL_WRITE_TXNS_TIMEOUT`，避免GC或网络抖动导致误判。

2. 典型部署  
   - JN数量：推荐3或5个节点，平衡容错与成本。例如，3节点允许1个故障，5节点允许2个故障。  
   - 配置示例：  
     ```xml
     <property>
       <name>dfs.namenode.shared.edits.dir</name>
       <value>qjournal://node1:8485;node2:8485;node3:8485/mycluster</value>
     </property>
     ```
  
   - 网络要求：JN节点需低延迟、高带宽，避免跨数据中心部署。

---

#### 五、应用场景与生态整合
1. HDFS高可用  
   QJM替代传统共享存储（如NFS），成为Hadoop官方推荐的HA方案，支持自动故障切换（通过ZKFC）和数据强一致性。

2. 与ZooKeeper协同  
   - ZKFC：监控NameNode健康状态，通过ZooKeeper选举活跃节点，触发故障转移。  
   - 脑裂防护：结合ZooKeeper临时节点，确保仅一个ANN可持有锁。

3. 扩展性与兼容性  
   QJM设计兼容多种存储后端（如本地磁盘、云存储），并支持与其他一致性算法（如Raft）集成，适应大规模集群需求。

---

#### 六、总结与对比
- 优势：  
  - 去中心化存储，避免单点故障。  
  - 基于多数派原则，兼顾一致性与可用性。  
  - 与Hadoop生态深度集成，部署维护简便。  
- 对比Paxos/Raft：  
  QJM简化了Paxos的Prepare阶段，专注于日志同步场景，而Raft更通用，适用于状态机复制。  
- 挑战：  
  JN集群规模扩大时，写入延迟可能增加，需结合分片或优化网络拓扑缓解。

通过上述设计，QuorumJournalManager在Hadoop生态中实现了高效、可靠的元数据管理，成为分布式存储系统中一致性算法的经典实践。


# 参考资料

https://github.com/baidu/braft/blob/master/docs/cn/qjm.md

* any list
{:toc}