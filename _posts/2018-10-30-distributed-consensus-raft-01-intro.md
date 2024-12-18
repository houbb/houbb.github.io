---
layout: post
title: Raft-一致性算法
date:  2018-10-30 09:31:33 +0800
categories: [Distributed]
tags: [algorithm, distributed, java, sh]
published: true
---

# Raft

Raft 是一种为了管理复制日志的一致性算法。

它提供了和 Paxos 算法相同的功能和性能，但是它的算法结构和 Paxos 不同，使得 Raft 算法更加容易理解并且更容易构建实际的系统。

为了提升可理解性，Raft 将一致性算法分解成了几个关键模块，例如领导人选举、日志复制和安全性。同时它通过实施一个更强的一致性来减少需要考虑的状态的数量。从一个用户研究的结果可以证明，对于学生而言，Raft 算法比 Paxos 算法更加容易学习。

Raft 算法还包括一个新的机制来允许集群成员的动态改变，它利用重叠的大多数来保证安全性。

[算法原文](https://ramcloud.atlassian.net/wiki/download/attachments/6586375/raft.pdf)

## 和 Paxos 的对比

- 效果

Raft 等价于  (multi-)Paxos；

- 效率

Raft 与 Paxos 一样高效；

- 结构

Raft 更易于理解 - 为了增强可理解性，Raft 将 leader 选举、日志复制和安全性等关键元素分离，并采用更强的一致性以减少必须考虑的状态的数量；

- 实现

Raft 更易于实现 - Raft 算法的论文中提供了许多有利于实现的指引；

- 安全性

Raft 还包括一个用于变更集群成员的新机制，它使用重叠的大多数（overlapping majorities）来保证安全性。

# 参考资料

[Raft 算法和 Paxos 算法](https://yeasy.gitbooks.io/blockchain_guide/content/distribute_system/paxos.html)

[寻找一种易于理解的一致性算法（扩展版）](https://github.com/maemual/raft-zh_cn/blob/master/raft-zh_cn.md)

[raft 一致性算法](https://cizixs.com/2017/12/04/raft-consensus-algorithm/)

[Raft 算法详解](https://zhuanlan.zhihu.com/p/32052223)

[Raft 算法和 Paxos 算法 对比](https://www.zhihu.com/question/36648084)

* any list
{:toc}