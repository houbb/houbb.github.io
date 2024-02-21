---
layout: post
title: ETL-50-apache SeaTunnel checkpoint v2.3.3 源码之 config 配置
date: 2024-01-05 21:01:55 +0800
categories: [ETL]
tags: [etl, source-code, sh]
published: true
---

# checkpoint 

这个功能能力比较重要，重点学习一下。

此处以 v2.3.3 为例。

# savepoint 与 checkpoint

[savepoint](https://seatunnel.apache.org/docs/2.3.3/seatunnel-engine/savepoint) 是以 [checkpoint](https://seatunnel.apache.org/docs/2.3.3/seatunnel-engine/checkpoint-storage/) 为基础实现的。

savepoint 可以让我们保存+恢复一个任务。

我们这里重点看一下 checkpoint

# server 配置


- seatunnel.yaml

```yaml
seatunnel:
    engine:
        backup-count: 1
        queue-type: blockingqueue
        print-execution-info-interval: 60
        slot-service:
            dynamic-slot: true
        checkpoint:
            interval: 300000
            timeout: 10000
            storage:
                type: localfile
                max-retained: 3
                plugin-config:
                    namespace: C:\ProgramData\seatunnel\checkpoint\
```

这里的 checkpoint 部分，对应着 checkpoint 的配置。

## checkpoint 属性

每一个配置的描述，参见 ServerConfigOptions 源码

```java
    public static final Option<Integer> CHECKPOINT_INTERVAL =
            Options.key("interval")
                    .intType()
                    .defaultValue(300000)
                    .withDescription(
                            "The interval (in milliseconds) between two consecutive checkpoints.");

    public static final Option<Integer> CHECKPOINT_TIMEOUT =
            Options.key("timeout")
                    .intType()
                    .defaultValue(30000)
                    .withDescription("The timeout (in milliseconds) for a checkpoint.");
```

这里一个是间隔，一个是超时时间。

间隔太短，影响性能；太长，持久化可能导致数据时间间隔太长，所以需要均衡。

timeout 这个意味着什么？

--------------------------------------------------------------- 





### 持久化

checkpoint 需要持久化，所以 storage 这部分是关于持久化的配置。

比如基于本地 file，或者 HDFS。我们文件部分暂时不做深入。

因为他可以是任何一种持久化的实现。

```java

    public static final Option<CheckpointStorageConfig> CHECKPOINT_STORAGE =
            Options.key("storage")
                    .type(new TypeReference<CheckpointStorageConfig>() {})
                    .defaultValue(new CheckpointStorageConfig())
                    .withDescription("The checkpoint storage configuration.");


    public static final Option<String> CHECKPOINT_STORAGE_TYPE =
            Options.key("type")
                    .stringType()
                    .defaultValue("localfile")
                    .withDescription("The checkpoint storage type.");

    public static final Option<Integer> CHECKPOINT_STORAGE_MAX_RETAINED =
            Options.key("max-retained")
                    .intType()
                    .defaultValue(20)
                    .withDescription("The maximum number of retained checkpoints.");

    public static final Option<Map<String, String>> CHECKPOINT_STORAGE_PLUGIN_CONFIG =
            Options.key("plugin-config")
                    .type(new TypeReference<Map<String, String>>() {})
                    .noDefaultValue()
                    .withDescription("The checkpoint storage instance configuration.");                
```






# 参考资料

* any list
{:toc}