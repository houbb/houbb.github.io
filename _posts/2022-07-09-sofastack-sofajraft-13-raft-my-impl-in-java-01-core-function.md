---
layout: post
title: raft-13-从零开始实现自己的 raft（二）核心能力
date:  2022-07-09 09:22:02 +0800
categories: [SOFA]
tags: [sofa, SOFAJRaft, raft, sh]
published: true
---

# 前言

大家好，我是老马。

分布式系统中，一致性算法是最重要的基石，也是最难学习的部分。

这里是从零开始实现 raft 系列，今天我们简单介绍一下 raft 的核心能力。

# 核心能力

Raft 为了算法的可理解性，将算法分成了 4 个部分。

leader 选举

日志复制

成员变更

日志压缩

## 简单说明

同 zk 一样，leader 都是必须的，所有的写操作都是由 leader 发起，从而保证数据流向足够简单。

而 leader 的选举则通过比较每个节点的逻辑时间（term）大小，以及日志下标（index）的大小。

刚刚说 leader 选举涉及日志下标，那么就要讲日志复制。

日志复制可以说是 Raft 核心的核心，说简单点，Raft 就是为了保证多节点之间日志的一致。

当日志一致，我们可以认为整个系统的状态是一致的。这个日志你可以理解成 mysql 的 binlog。

Raft 通过各种补丁，保证了日志复制的正确性。

Raft leader 节点会将客户端的请求都封装成日志，发送到各个 follower 中，如果集群中超过一半的 follower 回复成功，那么这个日志就可以被提交（commit），这个 commit 可以理解为 ACID 的 D ，即持久化。

当日志被持久化到磁盘，后面的事情就好办了。

而第三点则是为了节点的扩展性。第四点是为了性能。

相比较 leader 选举和 日志复制，不是那么的重要，可以说，如果没有成员变更和日志压缩，也可以搞出一个可用的 Raft 分布式系统，但没有 leader 选举和日志复制，是万万不能的。

# 参考资料


* any list
{:toc}