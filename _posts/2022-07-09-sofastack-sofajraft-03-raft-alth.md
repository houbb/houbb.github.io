---
layout: post
title: raft-03-raft 共识算法介绍
date:  2022-07-09 09:22:02 +0800
categories: [SOFA]
tags: [sofa, SOFAJRaft, raft, sh]
published: true
---

## 前言

大家好，我是老马。

分布式系统中，一致性算法是最重要的基石，也是最难学习的部分。

本系列根据 jraft 作为入口，学习一下 raft 的原理和实现。

## raft 系列

[SOFAStack-00-sofa 技术栈概览](https://houbb.github.io/2022/07/09/sofastack-00-overview)

# raft 共识算法

## 什么是Raft？  

Raft 是一种旨在易于理解的共识算法。

它在容错性和性能方面与 Paxos 等效，但其设计将问题分解为相对独立的子问题，并清晰解决了实际系统所需的所有关键部分。

我们希望 Raft 能让更广泛的开发者理解共识算法，并基于此开发出比现有方案更高质量的共识系统。

## 等等——什么是共识（Consensus）？  

共识是容错性分布式系统中的基础性问题，涉及多个服务器就某个值达成一致。

一旦达成决定，该决定即为最终决定。典型的共识算法要求多数服务器（例如，5台服务器组成的集群中至少3台）处于可用状态才能推进决策。

如果超过半数服务器故障（例如5台中有3台故障），系统将无法推进决策（但永远不会返回错误结果）。

## 共识的应用场景：复制状态机  

共识通常出现在复制状态机（Replicated State Machines）的上下文中，这是构建容错系统的通用方法。每台服务器包含一个状态机和一个日志。

状态机是需要实现容错的组件（例如哈希表），即使集群中少数服务器故障，客户端仍会感觉自己在与一个可靠的状态机交互。  

每个状态机从日志中读取输入命令。以哈希表为例，日志可能包含类似“将x设为3”的命令。共识算法的作用是确保所有服务器日志中的命令达成一致。

算法必须保证：如果某台状态机将“将x设为3”作为第n条命令执行，其他状态机也绝不会执行不同的第n条命令。

因此，所有状态机会处理相同的命令序列，产生相同的结果，并最终达到相同的状态。

## Raft 可视化演示  

这是一个在浏览器中运行的 Raft 集群演示。您可以通过交互观察 Raft 的实际运行逻辑。

左侧展示5台服务器，右侧显示它们的日志。我们计划制作解说视频以详细解释其原理。

当前可视化工具（RaftScope）仍处于早期阶段，欢迎提交改进建议（pull requests）。  

（注：原文中提到的 RaftScope 是一个开源工具，可通过其项目页面访问完整功能。）

<iframe src="https://raft.github.io/raftscope/index.html" title="raft visualization" aria-hidden="true" style="border: 0; width: 800px; height: 580px; margin-bottom: 20px"></iframe>

以下是关于 Raft 算法及其相关可视化工具与学术文献的综合梳理，结合您的描述与提供的搜索结果整理为以下内容：


1. [The Secret Lives of Data](http://thesecretlivesofdata.com/raft/)

特点：这是一个专为 Raft 设计的引导式可视化工具，以交互性较低但更循序渐进的方式展示 Raft 的共识流程。它通过动态演示日志复制、领导者选举等核心机制，帮助用户直观理解数据在分布式系统中的流动逻辑。  

目标：旨在降低分布式系统学习门槛，尤其适合初学者通过可视化观察 Raft 的“幕后工作”，例如网络分区时的选举重试、日志同步冲突解决等场景。 

开源支持：相关代码和文档托管于 GitHub，开发者可参与改进或集成到教学工具中。

### 二、Raft 核心论文与衍生研究
#### 1. 核心论文  
   - [《In Search of an Understandable Consensus Algorithm》](https://raft.github.io/raft.pdf)

   
     - 作者：Diego Ongaro 与 John Ousterhout，发表于 2013 年。  

     - 贡献：首次提出 Raft 算法，通过将共识问题分解为领导者选举、日志复制和安全性三个子问题，显著降低了理解和实现复杂度。论文还对比了 Raft 与 Paxos 的等效性，证明其在容错和性能上不逊于后者。  

     - 奖项：精简版论文获 2014 年 USENIX 年度技术会议“最佳论文奖”[citation:用户提供]。

   - Diego Ongaro 的博士论文  
     - 扩展内容：详细补充了 Raft 的集群成员变更算法，并引入基于 TLA+ 的形式化规范，为算法验证提供理论框架[citation:用户提供]。

#### 2. 衍生研究  
[《Verdi: A Framework for Implementing and Verifying Distributed Systems》](http://verdi.uwplse.org/)

作者：James R. Wilcox 等，发表于 PLDI 2015。  

重点：提出 Verdi 框架，支持从形式化模型生成分布式系统代码，并以 Raft 为例验证其可行性[citation:用户提供]。

[《ARC: Analysis of Raft Consensus》](https://www.cl.cam.ac.uk/techreports/UCAM-CL-TR-857.html)

作者：Heidi Howard，剑桥大学技术报告。  

分析：通过数学建模验证 Raft 的安全性，探讨其在大规模集群中的扩展性问题[citation:用户提供]。

其他论文：如[《Planning for Change in a Formal Verification of the Raft Consensus Protocol》](https://dl.acm.org/doi/abs/10.1145/2854065.2854081)聚焦形式化验证方法，确保 Raft 协议在动态环境中的正确性[citation:用户提供]。


### 三、Raft 的核心机制（基于搜索结果的补充）

1. 领导者选举  
   - 角色与任期：节点分为 Leader、Follower、Candidate 三种状态，通过递增的 Term 编号保证每个任期仅有一个 Leader。  
   - 选举规则：Follower 在心跳超时后转为 Candidate 并发起投票，需获得半数以上支持才能当选。若多个 Candidate 竞争，随机超时机制减少冲突。

2. 日志复制与安全性  
   - 日志同步：Leader 将客户端请求封装为日志条目，复制到多数节点后提交，确保所有节点按相同顺序执行命令。  
   - 安全性约束：通过日志完整性检查（如 Term 和 Index 比对），防止旧 Leader 覆盖已提交数据，避免脑裂问题。

3. 与 Paxos 的对比  
   - 简化设计：Raft 通过明确的状态划分和强一致性约束，避免了 Paxos 的模糊性与实现复杂度，更适合工程实践。

### 四、实践与工具

- 开源实现：如 etcd（Kubernetes 的核心组件）和多种语言的 Raft 库，进一步验证其易用性。  

- 教学资源：结合 The Secret Lives of Data 等工具，Raft 已成为分布式系统课程的标配内容，推动共识算法的普及。

以上内容整合了用户提供的论文信息与搜索结果的补充细节，如需进一步探讨某篇论文或机制细节，可参考对应文献或访问相关 GitHub 仓库（如 Raft 官方页面）。

## 教授 Raft 的课程

以下列出了包含 Raft 相关讲座或编程作业的课程清单。这些信息对其他教师和寻找学习材料的在线学习者可能有所帮助。若您知晓其他相关课程，请提交 [pull request](https://github.com/raft/raft.github.io) 或 issue 以更新此列表。（按时间倒序排列）

- [**中国香港大学**](https://www.hku.hk/)  
  [COMP3358: 分布式与并行计算](https://www.cs.hku.hk/index.php/programmes/course-offered?infile=2019/comp3358.html)  
  教师：[Heming Cui](https://www.cs.hku.hk/people/academic-staff/heming)  
  包含 Raft 相关讲座。（2024 年春季）

- [**弗吉尼亚大学**](https://www.virginia.edu/)  
  [CS4740: 云计算](https://changlousys.github.io/CS4740/spring24/about/)  
  教师：[Chang Lou](https://changlousys.github.io/)  
  包含 Raft 讲座及 Go 语言编程作业。（2024 年春季）

- [**加州大学圣地亚哥分校**](https://ucsd.edu)  
  [CSE224: 研究生网络系统](https://canvas.ucsd.edu/courses/43955/assignments/syllabus)  
  教师：[George Porter](https://cseweb.ucsd.edu/\~gmporter/)  
  包含 Raft 讲座及基于 Go 的容错 Dropbox 克隆开发作业。（2023/2022 年冬季、2020/2019/2018 年秋季）

- [**慕尼黑工业大学**](https://www.tum.de/)  
  [IN2259: 分布式系统](https://campus.tum.de/tumonline/ee/ui/ca2/app/desktop/#/slc.tm.cp/student/courses/950635146?lang=en)  
  教师：[Pramod Bhatotia](https://dse.in.tum.de/bhatotia/) 和 [Martin Kleppmann](https://martin.kleppmann.com/)  
  包含 Raft 相关讲座。（2022/2023 年冬季）

- [**伊利诺伊大学厄巴纳-香槟分校**](https://illinois.edu)  
  [CS425: 分布式系统](https://courses.grainger.illinois.edu/cs425/)  
  教师：[Indranil Gupta](http://indy.cs.illinois.edu)、[Nikita Borisov](http://hatswitch.org/\~nikita/) 和 [Radhika Mittal](https://radhikam.web.illinois.edu)  
  包含基于 Go 的 Raft 编程作业。（2021 年春季）

- [**中国香港中文大学**](https://www.cse.cuhk.edu.hk)  
  [CSCI4160: 分布式与并行计算](https://piazza.com/class/kicgvsku8ul6ro)（私有课程）  
  教师：[Eric Lo](https://appsrv.cse.cuhk.edu.hk/\~ericlo/)  
  包含 Paxos 与 Raft 讲座，以及 [Java/Go 实现的 Raft 编程作业](https://github.com/eric-lo/csci4160-asgn1)。（2019 年秋季、2021 年春季）[[11]]

- [**印度理工学院德里分校**](https://www.cse.iitd.ac.in/)  
  [COL 819: 分布式系统](https://www.cse.iitd.ernet.in/\~srsarangi/courses/2020/col_819_2020/index.html)  
  教师：[Smruti R. Sarangi](https://www.cse.iitd.ac.in/\~srsarangi/)  
  包含 Raft 相关讲座。


## 实现排名

这里是**完整无简化**的Raft实现算法的markdown表格，包含所有的项目和信息：

| Rank | Repository URL                                                                                       | Stars | Last Updated          | Archived |
|------|------------------------------------------------------------------------------------------------------|-------|-----------------------|----------|
| 293  | [pingcap/tikv](https://github.com/pingcap/tikv)                                                       | 15659 | 2025-03-26T05:03:20Z | No       |
| 292  | [rethinkdb/rethinkdb](https://github.com/rethinkdb/rethinkdb)                                         | 26854 | 2025-03-26T03:58:21Z | No       |
| 289  | [scylladb/scylla](https://github.com/scylladb/scylla)                                                 | 14265 | 2025-03-26T03:17:44Z | No       |
| 286  | [vesoft-inc/nebula](https://github.com/vesoft-inc/nebula)                                             | 11182 | 2025-03-26T02:21:58Z | No       |
| 285  | [real-logic/aeron](https://github.com/real-logic/aeron)                                               | 7642  | 2025-03-26T03:10:31Z | No       |
| 284  | [alipay/sofa-jraft](https://github.com/alipay/sofa-jraft)                                           | 3666  | 2025-03-26T04:14:29Z | No       |
| 284  | [hashicorp/raft](https://github.com/hashicorp/raft)                                                 | 8481  | 2025-03-26T01:43:07Z | No       |
| 279  | [hazelcast/hazelcast](https://github.com/hazelcast/hazelcast)                                         | 6274  | 2025-03-25T16:45:26Z | No       |
| 276  | [tarantool/tarantool](https://github.com/tarantool/tarantool)                                       | 3472  | 2025-03-25T19:18:47Z | No       |
| 275  | [logcabin/logcabin](https://github.com/logcabin/logcabin)                                             | 1908  | 2025-03-25T20:24:18Z | No       |
| 270  | [opendaylight/controller](https://github.com/opendaylight/controller)                               | 465   | 2025-03-26T06:22:46Z | No       |
| 268  | [apache/ratis](https://github.com/apache/ratis)                                                     | 1347  | 2025-03-25T15:29:59Z | No       |
| 268  | [lni/dragonboat](https://github.com/lni/dragonboat)                                                 | 5140  | 2025-03-24T06:00:16Z | No       |
| 266  | [brpc/braft](https://github.com/brpc/braft)                                                         | 4078  | 2025-03-24T02:45:50Z | No       |
| 266  | [dotnet/dotNext](https://github.com/dotnet/dotNext)                                                 | 1727  | 2025-03-24T21:13:25Z | No       |
| 264  | [apache/incubator-kudu](https://github.com/apache/incubator-kudu)                                   | 1863  | 2025-03-24T15:50:23Z | No       |
| 264  | [datafuselabs/openraft](https://github.com/datafuselabs/openraft)                                   | 1513  | 2025-03-24T20:15:23Z | No       |
| 263  | [ebay/nuraft](https://github.com/ebay/nuraft)                                                       | 1072  | 2025-03-25T14:04:45Z | No       |
| 260  | [rabbitmq/ra](https://github.com/rabbitmq/ra)                                                       | 855   | 2025-03-25T09:54:27Z | No       |
| 257  | [etcd-io/raft](https://github.com/etcd-io/raft)                                                     | 760   | 2025-03-25T07:52:19Z | No       |
| 254  | [wenweihu86/raft-java](https://github.com/wenweihu86/raft-java)                                     | 1211  | 2025-03-23T06:53:41Z | No       |
| 248  | [goraft/raft](https://github.com/goraft/raft)                                                       | 2430  | 2025-03-17T14:09:19Z | Yes      |
| 246  | [eliben/raft](https://github.com/eliben/raft)                                                       | 1129  | 2025-03-20T14:13:19Z | No       |
| 246  | [willemt/raft](https://github.com/willemt/raft)                                                     | 1144  | 2025-03-20T13:43:36Z | No       |
| 244  | [bakwc/PySyncObj](https://github.com/bakwc/PySyncObj)                                              | 718   | 2025-03-23T05:09:10Z | No       |
| 244  | [belaban/jgroups-raft](https://github.com/belaban/jgroups-raft)                                     | 270   | 2025-03-24T19:55:35Z | No       |
| 240  | [async-raft/async-raft](https://github.com/async-raft/async-raft)                                   | 1052  | 2025-03-18T18:31:33Z | No       |
| 239  | [streed/simpleRaft](https://github.com/streed/simpleRaft)                                           | 300   | 2025-03-23T05:09:15Z | No       |
| 233  | [RedisLabs/redisraft](https://github.com/RedisLabs/redisraft)                                       | 826   | 2025-03-14T15:11:51Z | No       |
| 233  | [xnnyygn/xraft](https://github.com/xnnyygn/xraft)                                                   | 234   | 2025-03-23T14:30:11Z | No       |
| 232  | [datatechnology/jraft](https://github.com/datatechnology/jraft)                                     | 180   | 2025-03-24T11:42:29Z | No       |
| 231  | [akiradeveloper/lol](https://github.com/akiradeveloper/lol)                                         | 188   | 2025-03-23T22:47:28Z | No       |
| 227  | [permazen/permazen](https://github.com/permazen/permazen)                                           | 411   | 2025-03-11T22:01:45Z | No       |
| 223  | [MicroRaft/MicroRaft](https://github.com/MicroRaft/MicroRaft)                                       | 232   | 2025-03-20T07:05:04Z | No       |
| 223  | [kanaka/raft.js](https://github.com/kanaka/raft.js)                                                 | 322   | 2025-03-10T01:08:03Z | No       |
| 216  | [Hoverbear/raft](https://github.com/Hoverbear/raft)                                                 | 267   | 2025-03-09T11:52:09Z | No       |
| 215  | [hhblaze/Raft.Net](https://github.com/hhblaze/Raft.Net)                                             | 173   | 2025-03-18T14:13:02Z | No       |
| 215  | [zhebrak/raftos](https://github.com/zhebrak/raftos)                                                 | 350   | 2025-03-02T05:43:40Z | No       |
| 213  | [eraft-io/eraft](https://github.com/eraft-io/eraft)                                                 | 281   | 2025-03-02T11:23:21Z | No       |
| 204  | [datatechnology/cornerstone](https://github.com/datatechnology/cornerstone)                         | 262   | 2025-02-23T12:54:08Z | No       |
| 200  | [pgte/skiff-algorithm](https://github.com/pgte/skiff-algorithm)                                     | 137   | 2025-03-08T15:09:25Z | No       |
| 199  | [unshiftio/liferaft](https://github.com/unshiftio/liferaft)                                         | 238   | 2025-02-18T07:31:55Z | No       |
| 198  | [namasikanam/raft-spin](https://github.com/namasikanam/raft-spin)                                   | 15    | 2025-03-26T05:34:46Z | No       |
| 197  | [xingyif/raft](https://github.com/xingyif/raft)                                                     | 39    | 2025-03-21T13:06:13Z | No       |
| 196  | [cowsql/raft](https://github.com/cowsql/raft)                                                       | 59    | 2025-03-17T03:52:17Z | No       |
| 193  | [resetius/miniraft-cpp](https://github.com/resetius/miniraft-cpp)                                   | 49    | 2025-03-19T23:56:06Z | No       |
| 191  | [NicolasT/kontiki](https://github.com/NicolasT/kontiki)                                             | 121   | 2025-02-25T22:47:29Z | No       |
| 189  | [ben-ng/gaggle](https://github.com/ben-ng/gaggle)                                                   | 64    | 2025-03-08T15:06:26Z | No       |
| 188  | [guille/RaftCore](https://github.com/guille/RaftCore)                                               | 71    | 2025-03-06T06:46:48Z | No       |
| 187  | [heidi-ann/ocaml-raft](https://github.com/heidi-ann/ocaml-raft)                                     | 111   | 2025-02-23T04:51:56Z | Yes      |
| 184  | [allengeorge/libraft](https://github.com/allengeorge/libraft)                                       | 102   | 2025-02-19T23:59:22Z | Yes      |
| 182  | [ktoso/akka-raft](https://github.com/ktoso/akka-raft)                                               | 280   | 2024-11-12T04:28:18Z | Yes      |
| 182  | [uwplse/verdi-raft](https://github.com/uwplse/verdi-raft)                                           | 187   | 2024-12-19T06:18:17Z | No       |
| 181  | [Waqee/Raft-php](https://github.com/Waqee/Raft-php)                                                 | 54    | 2025-03-02T13:02:22Z | No       |
| 178  | [buckie/juno](https://github.com/buckie/juno)                                                       | 453   | 2024-09-05T03:40:35Z | No       |
| 171  | [LVala/zaft](https://github.com/LVala/zaft)                                                         | 18    | 2025-03-20T20:18:09Z | No       |
| 170  | [yahoo/gondola](https://github.com/yahoo/gondola)                                                   | 62    | 2025-01-25T04:11:25Z | Yes      |
| 169  | [andrewjstone/rafter](https://github.com/andrewjstone/rafter)                                       | 269   | 2024-08-30T15:21:35Z | No       |
| 169  | [mreiferson/pontoon](https://github.com/mreiferson/pontoon)                                         | 22    | 2025-03-15T18:28:39Z | No       |
| 168  | [royaltm/node-zmq-raft](https://github.com/royaltm/node-zmq-raft)                                   | 30    | 2025-03-08T14:40:24Z | No       |
| 166  | [simonacca/zatt](https://github.com/simonacca/zatt)                                                 | 156   | 2024-11-10T02:32:44Z | No       |
| 165  | [mgodave/barge](https://github.com/mgodave/barge)                                                   | 91    | 2024-11-28T16:27:55Z | Yes      |
| 162  | [alirezameskin/raft4s](https://github.com/alirezameskin/raft4s)                                     | 22    | 2025-03-08T21:57:24Z | No       |
| 162  | [dreyk/zraft_lib](https://github.com/dreyk/zraft_lib)                                               | 163   | 2024-09-12T12:35:59Z | No       |
| 159  | [pablosmedina/ckite](https://github.com/pablosmedina/ckite)                                         | 213   | 2024-08-24T13:05:33Z | No       |
| 157  | [komamitsu/oraft](https://github.com/komamitsu/oraft)                                               | 30    | 2025-02-22T14:29:29Z | No       |
| 157  | [lewiszlw/raft](https://github.com/lewiszlw/raft)                                                   | 33    | 2025-02-11T06:56:56Z | Yes      |
| 157  | [nuoyimanaituling/xzwraft](https://github.com/nuoyimanaituling/xzwraft)                             | 37    | 2025-01-16T01:31:11Z | No       |
| 155  | [LiangrunDa/raft-lite](https://github.com/LiangrunDa/raft-lite)                                     | 33    | 2025-02-10T09:03:15Z | No       |
| 155  | [lisael/aioraft](https://github.com/lisael/aioraft)                                                 | 30    | 2025-02-16T12:50:47Z | No       |
| 153  | [42dot/foros](https://github.com/42dot/foros)                                                       | 37    | 2025-01-08T18:09:40Z | No       |
| 153  | [AChepurnoi/raft-kotlin](https://github.com/AChepurnoi/raft-kotlin)                                 | 36    | 2025-01-08T22:35:09Z | No       |
| 151  | [EdoardoV97/Raft-Omnet](https://github.com/EdoardoV97/Raft-Omnet)                                   | 13    | 2025-03-11T15:34:56Z | No       |
| 150  | [Oaklight/Vesper](https://github.com/Oaklight/Vesper)                                               | 53    | 2024-11-18T19:19:27Z | No       |
| 150  | [Qihoo360/floyd](https://github.com/Qihoo360/floyd)                                                 | 152   | 2024-08-19T05:11:14Z | No       |
| 149  | [peterbourgon/raft](https://github.com/peterbourgon/raft)                                           | 172   | 2024-05-10T05:43:03Z | Yes      |
| 148  | [iifawzi/tf-raft](https://github.com/iifawzi/tf-raft)                                               | 24    | 2025-02-01T21:01:51Z | No       |
| 146  | [scalecube/raft-leader-election](https://github.com/scalecube/raft-leader-election)                 | 26    | 2025-01-10T05:46:10Z | No       |


# 参考资料

https://raft.github.io/

* any list
{:toc}