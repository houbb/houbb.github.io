---
layout: post
title: ETL-15-apache SeaTunnel Engine local-mode
date: 2024-01-05 21:01:55 +0800
categories: [ETL]
tags: [etl, sh]
published: true
---

# 在本地模式下运行作业

仅用于测试。

在生产环境中使用 SeaTunnel Engine 的最推荐方式是集群模式。

## 部署 SeaTunnel Engine 本地模式

[参考部署 SeaTunnel Engine 本地模式](https://seatunnel.apache.org/docs/2.3.3/start-v2/locally/deployment)

## 更改 SeaTunnel Engine 配置

在 `$SEATUNNEL_HOME/config/hazelcast.yaml` 中将 auto-increment 更新为 true。

## 提交作业

```bash
$SEATUNNEL_HOME/bin/seatunnel.sh --config $SEATUNNEL_HOME/config/v2.batch.config.template -e local
```

# 参考资料

https://seatunnel.apache.org/docs/2.3.3/seatunnel-engine/deployment

* any list
{:toc}