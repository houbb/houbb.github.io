---
layout: post
title:  Coreos Etcd
date:  2018-06-19 08:47:17 +0800
categories: [Distributed]
tags: [distributed]
published: true
---

# Etcd


[etcd](https://coreos.com/etcd/) 是一个分布式的键值存储，它提供了一种可靠的方法，可以在一组机器上存储数据。它是开源的，可以在GitHub上找到。
etcd在网络分区期间优雅地处理领导人选举，并将容忍机器故障，包括领导人。

您的应用程序可以读写etcd中的数据。一个简单的用例是在etcd中存储数据库连接细节或特性标志作为键值对。这些值可以被监视，允许应用程序在它们改变时重新配置自己。

高级应用程序利用一致性保证来实现数据库领导者的选举，或者在一群工作人员之间进行分布式锁定。


## 作用

服务发现，优于 ZooKeeper 的选择

# 参考文章

> [etcd：从应用场景到实现原理的全方位解读](http://www.infoq.com/cn/articles/etcd-interpretation-application-scenario-implement-principle)

> [CoreOS 实战：剖析 etcd](http://www.infoq.com/cn/articles/coreos-analyse-etcd/)

* any list
{:toc}







