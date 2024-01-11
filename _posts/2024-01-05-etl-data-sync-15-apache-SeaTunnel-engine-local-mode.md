---
layout: post
title: ETL-16-apache SeaTunnel Engine cluster-mode
date: 2024-01-05 21:01:55 +0800
categories: [ETL]
tags: [etl, sh]
published: true
---

# 在集群模式下运行作业

这是在生产环境中使用 SeaTunnel Engine 的最推荐方式。在此模式下，SeaTunnel Engine 的全部功能得到支持，并且集群模式将具有更好的性能和稳定性。

在集群模式下，首先需要部署 SeaTunnel Engine 集群，然后客户端将作业提交到 SeaTunnel Engine 集群进行运行。

# 部署 SeaTunnel Engine 集群

[参考部署 SeaTunnel Engine 集群](https://seatunnel.apache.org/docs/2.3.3/seatunnel-engine/deployment)

# 提交作业

```bash
$SEATUNNEL_HOME/bin/seatunnel.sh --config $SEATUNNEL_HOME/config/v2.batch.config.template
```

# 参考资料

https://seatunnel.apache.org/docs/2.3.3/seatunnel-engine/cluster-mode

* any list
{:toc}