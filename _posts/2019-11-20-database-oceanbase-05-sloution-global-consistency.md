---
layout: post
title: Ocean Base-05-解决方案之全局一致性
date:  2019-11-20 11:18:30 +0800
categories: [Database]
tags: [database, distributed-database, olap, oltp, htap, sh]
published: true
---

# 全局数据一致性方案

通过高可用的集中式服务来提供全局一致的版本号

OceanBase 的全局一致性方案，无需依赖特殊硬件，通过高可用的集中式服务来提供全局一致的版本号，在全局范围内实现了“快照隔离级别”和“多版本并发控制”的能力，并在此基础之上实现众多涉及全局数据一致性的功能。

# 行业现状及痛点

传统的分库分表架构没有全局统一的快照管理

传统的分库分表架构中，每一个数据库节点都是个孤岛，只能在单库内保证事务的完整性，跨库事务只能保证最终一致性；同时全局一致性时间点恢复几乎不可能实现
部分分布式数据库依赖特殊硬件且通用型差

业内有不少分布式数据库采用特殊的的硬件设备（如 Google Spanner 的 GPS 和原子钟），使多台机器间的系统时钟保持高度一致。

但其对机房的硬件要求明显提高，其次也不能 100% 保证多个机器之间的系统时钟完全一致，虽概率极小，但并不为 0

# 方案架构

![方案架构](https://gw.alipayobjects.com/mdn/ob_asset/afts/img/A*r9PkQKld-5IAAAAAAAAAAABjAQAAAQ/original)

OceanBase 数据库利用集中式服务（Global Timestamp Service，简称 GTS）来提供全局一致的版本号。

无论事务请求源自哪台物理机器，都会从这个集中式的服务处获取版本号，并保证所有的版本号单调向前并且和真实世界的时间顺序保持一致。

OceanBase 以租户为单位分配 GTS。

# 参考资料

[全局数据一致性方案](https://oceanbase.alipay.com/solution/GDC)

* any list
{:toc}
