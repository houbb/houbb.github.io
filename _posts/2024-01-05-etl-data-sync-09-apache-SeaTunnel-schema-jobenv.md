---
layout: post
title: ETL-09-apache SeaTunnel jobEnv
date: 2024-01-05 21:01:55 +0800
categories: [ETL]
tags: [etl, sh]
published: true
---

# **JobEnvConfig**

本文档描述了环境配置信息，env 统一了所有引擎的环境变量。

**job.name**
此参数配置了任务名称。

**jars**
可以通过 jars 加载第三方包，例如 jars="file://local/jar1.jar;file://local/jar2.jar"。

**job.mode**
通过 job.mode 可以配置任务是处于批处理模式还是流处理模式，如 job.mode = "BATCH" 或 job.mode = "STREAMING"。

**checkpoint.interval**
获取定期安排检查点的时间间隔。

**parallelism**
此参数配置源和汇的并行度。

**shade.identifier**
指定加密方法。如果您没有对配置文件进行加密或解密的要求，可以忽略此选项。

有关详细信息，请参阅文档 [config-encryption-decryption](https://seatunnel.apache.org/docs/2.3.3/connector-v2/Config-Encryption-Decryption)。

# 参考资料

https://seatunnel.apache.org/docs/2.3.3/concept/JobEnvConfig

* any list
{:toc}