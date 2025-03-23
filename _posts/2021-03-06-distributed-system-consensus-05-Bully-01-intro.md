---
layout: post
title: 分布式一致性算法-05-Bully 入门介绍
date:  2021-3-06 16:52:15 +0800
categories: [Distributed]
tags: [algorithm, distributed, java, sh]
published: true
---


### 概述

最近在看一些 es 方面的东西，了解到在es 的7.x版本之前 Master Election 算法采用的是Bully，但是在7.x改用了 Raft。

### Bully 算法原理

**消息类型：**

*   Election 消息，向节点发起选举的消息  
*   Alive 消息，节点对 Election 消息的应答  
*   Victory 消息，竞选成功的主节点向普通节点发送竞选成功的消息  

**选举过程：**

*   集群中每个活着的节点查找比自己ID大的节点，如果不存在则向其他节点发送Victory消息，表明自己为主节点  
*   如果存在比自己ID大的节点，则向这些节点发送Election消息，并等待响应  
*   如果在给定的时间内，没有收到这些节点回复的消息，则自己成为主节点，并向比自己ID小的节点发送Victory消息  
*   节点收到比自己ID小的节点发送的Election消息，则回复Alive消息  

**选举示例：**  
![节点拓扑](https://www.cs.colostate.edu/\~cs551/Figures/Bully0.gif)  
1. **p6宕机**  
   ![步骤1](https://www.cs.colostate.edu/\~cs551/Figures/Bully1.gif)  
2. **P3发起选举通知**  
   ![步骤2](https://www.cs.colostate.edu/\~cs551/Figures/Bully2.gif)  
3. **p4/p5响应选举**  
   ![步骤3](https://www.cs.colostate.edu/\~cs551/Figures/Bully3.gif)  
4. **P4发起选举**  
   ![步骤4](https://www.cs.colostate.edu/\~cs551/Figures/Bully4.gif)  
5. **仅p5响应**  
   ![步骤5](https://www.cs.colostate.edu/\~cs551/Figures/Bully5.gif)  
6. **P5成为Master**  
   ![步骤6](https://www.cs.colostate.edu/\~cs551/Figures/Bully6.gif)  
   ![结果](https://www.cs.colostate.edu/\~cs551/Figures/Bully7.gif)  

**Bully算法缺陷**  
> Master节点负载过重时可能出现假死：  
> - 原Master（如P6）恢复后可能重新触发选举，导致状态震荡  
> - Elasticsearch优化方案：节点会请求半数以上节点确认原Master状态后才发起选举  

**脑裂问题**  
> 网络分区可能导致多个Master：  
> - 例如partition1（P3/P5/P6）与partition2（P2/P1/P4）因网络故障无法通信  
> - 每个分区可能各自选举出Master节点  

***

[图片来源：CS 551: Distributed Operating Systems - Bully Election Algorithm Example](https://www.cs.colostate.edu/\~cs551/CourseNotes/Synchronization/BullyExample.html)



# 参考资料

https://eliasyaoyc.github.io/blog/%E5%88%86%E5%B8%83%E5%BC%8F%E4%B8%80%E8%87%B4%E6%80%A7%E7%AE%97%E6%B3%95-bully/

https://blog.csdn.net/qq_26222859/article/details/79976506

https://blog.csdn.net/lonewolf79218/article/details/105741431

https://juejin.cn/post/6973625621549154335

https://blog.dreamrounder.com/posts/app-design/distributed-consistence/

https://www.cnblogs.com/wangwangfei/p/13665416.html

https://developer.aliyun.com/article/875650

https://cloud.tencent.com/developer/article/1973355

* any list
{:toc}