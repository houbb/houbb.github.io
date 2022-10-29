---
layout: post
title: web3 consensus 共识机制
date: 2022-10-28 21:01:55 +0800
categories: [web3]
tags: [consensus, sh]
published: true
---

# 共识机制

共识机制（consensus），常见于区块链领域，即达成共识的机制。

在分布式系统中，依据系统对故障组件的容错能力分为崩溃容错协议(crash fault tolerant,CFT)和拜占庭容错协议（Byzantine fault tolerant,BFT)。

# 产生背景

由于加密货币多数采用去中心化的区块链设计，节点是各处分散且平行的，所以必须设计一套制度，来维护系统的运作顺序与公平性，统一区块链的版本，并奖励提供资源维护区块链的使用者，以及惩罚恶意的危害者。

这样的制度，必须依赖某种方式来证明，是由谁取得了一个区块链的打包权（或称记账权），并且可以获取打包这一个区块的奖励；又或者是谁意图进行危害，就会获得一定的惩罚，这就是共识机制。

# 常见的共识机制

- 工作量证明（Proof-of-Work，PoW），典型案例：比特币

- 权益证明（Proof-of-Stake，PoS，又译持有量证明），典型案例：以太坊

- 股份授权证明（Delegated-Proof-of-Stake，DPoS），典型案例：EOS

- 容量证明（Proof-of-space，PoSpace，又称 Proof-of-Capacity，PoC），典型案例：Filecoin

- Paxos算法

- Raft

- PBFT

- LibraBFT（Byzantine fault-tolerance）：Libra上使用。

# 推荐阅读

[DAG 有向无环图（Directed Acyclic Graph）](https://houbb.github.io/2020/01/23/data-struct-learn-03-dag)

[java 实现有向图(Direct Graph)](https://houbb.github.io/2020/01/23/data-struct-learn-03-direct-graph)

# 参考资料

[共识机制](https://zh.wikipedia.org/wiki/%E5%85%B1%E8%AD%98%E6%A9%9F%E5%88%B6)

* any list
{:toc}