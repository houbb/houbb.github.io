---
layout: post
title: 时序数据库-06-09-vm VictoriaMetrics 如果用来存储大量数据怎么办？
date:  2019-4-1 19:24:57 +0800
categories: [Database]
tags: [database, dis-database, distributed, time-series, sf]
published: true
---

# 时序数据库系列

[时序数据库-01-时序数据库有哪些？为什么要使用](https://houbb.github.io/2019/04/01/database-time-seriers-01-overview)

[时序数据库-02-聊一聊时序数据库](https://houbb.github.io/2019/04/01/database-time-seriers-02-chat)

[时序数据库-03-opentsdb-分布式时序数据库](https://houbb.github.io/2019/04/01/database-time-seriers-03-opentsdb)

[时序数据库-04-InfluxData-分布式时序数据库](https://houbb.github.io/2019/04/01/database-time-seriers-04-influxdb)

[时序数据库-05-TDengine 是一款开源、高性能、云原生的时序数据库 (Time-Series Database, TSDB)](https://houbb.github.io/2019/04/01/database-time-seriers-05-00-tdengine-overview)

[时序数据库-05-TDengine Time-Series Database, TSDB](https://houbb.github.io/2019/04/01/database-time-seriers-05-01-tdengine-chat)

[时序数据库-05-TDengine windows11 WSL 安装实战笔记 docker](https://houbb.github.io/2019/04/01/database-time-seriers-05-02-windows-wls-install)

[时序数据库-06-01-vm VictoriaMetrics 快速、经济高效的监控解决方案和时间序列数据库](https://houbb.github.io/2019/04/01/database-time-seriers-06-01-vm-intro)

[时序数据库-06-02-vm VictoriaMetrics install on docker 安装 vm](https://houbb.github.io/2019/04/01/database-time-seriers-06-02-vm-install-docker)

[时序数据库-06-03-vm VictoriaMetrics java 整合](https://houbb.github.io/2019/04/01/database-time-seriers-06-03-vm-java-integration)

[时序数据库-06-04-vm VictoriaMetrics storage 存储原理简介](https://houbb.github.io/2019/04/01/database-time-seriers-06-04-vm-storage)

[时序数据库-06-05-vm VictoriaMetrics cluster 集群原理](https://houbb.github.io/2019/04/01/database-time-seriers-06-05-vm-cluster)

[时序数据库-06-06-vm VictoriaMetrics cluster 集群访问方式](https://houbb.github.io/2019/04/01/database-time-seriers-06-06-vm-cluster-access)


# 业务背景

一开始选取 vm 是想存储一些简单的指标信息的数据。

近期想实现一个数据的分组统计，发现需要把一些基础数据都放入 vm，发现数据量非常大，应该怎么解决呢？

# 解决思路

## v1-TTL

定期删除数据。

不过目前的 vm 有其他的基础数据，希望存储很长时间。不适合修改全局的 TTL。

## v2-手动删除

当然也考虑 了自己定期删除，但是这样就会比较麻烦。

## V3-另起炉灶

当然，还有方法就是将这部分写入的数据到一个新的 VM。

新的 vm 存储保留的 TTL 更短。

但是这样成本比较高，可以作为后期的解决方案。

## V4-减少数据

本身的需求，是分组后大于一定量的数据。

那么就可以在写入之前，程序本身进行统计，超过一定数量的才进行处理。

其他的直接忽略写入。

# 小结

方法总比困难多，选择合适的场景。

# 参考资料


* any list
{:toc}