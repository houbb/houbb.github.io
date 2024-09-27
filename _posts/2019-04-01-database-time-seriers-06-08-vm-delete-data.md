---
layout: post
title: 时序数据库-06-08-vm VictoriaMetrics 如何删除数据？
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


# 能力

作为 VictoriaMetrics 用户，我们希望其具备数据删除能力。

VictoriaMetrics 也确实支持删除操作，但是程度有限。由于实现上的问题，VictoriaMetrics 保持为一个 append-only 数据库，非常适合存储时序数据。这样的架构的缺点，就是修改、删除数据会变得非常昂贵。

所以 VictoriaMetrics 对修改、删除操作的支持非常有限。在这篇指南中，我们就来看一下如何实现 VictoriaMetrics 中的数据的删除和修改。

# 如何删除指标

💡 警告：数据删除操作不建议作为一个周期性行为来执行。每次调用删除 API 都会对性能产生影响。提供删除 API 主要用于一次性需求，用于删除格式错误的数据或满足 GDPR 合规性。

删除 API 需要指定时序数据选择器。所以删除之前，首先要做的，应该是验证选择器是否匹配了期望的数据。可以使用如下命令来检查：

```sh
# Warning: response can return many metrics, so be careful with series selector.
curl -s 'http://vmselect:8481/select/0/prometheus/api/v1/series?match[]=process_cpu_cores_available' | jq
```

如果你确认时间序列选择器是符合预期的，接下来就可以发个POST请求执行删除，举例：

```sh
curl -s 'http://vmselect:8481/delete/0/prometheus/api/v1/admin/tsdb/delete_series?match[]=process_cpu_cores_available'
```

如果删除成功，删掉的数据就查不到了。不过存储空间不会立马释放，而是在后续数据文件后台合并的时候删除。

前几个月的数据可能永远不会发生后台合并，因此不会为历史数据释放存储空间。

这种情况下，可以尝试强制合并：

```sh
curl -v -X POST http://vmstorage:8482/internal/force_merge
```

# 如何更新指标

VictoriaMetrics 默认不提供更新数据的机制。

不过你可以通过如下方式曲线折中实现：

- 导出指标数据到文件中

- 修改文件中的 value

- 从 VictoriaMetrics 中删除相关指标

- 把刚才保存的文件中的数据重新导入

## 导出指标


```sh
curl -X POST -g http://vmselect:8481/select/0/prometheus/api/v1/export -d 'match[]=node_memory_MemTotal_bytes{instance="node-exporter:9100", job="hostname.com"}' > data.jsonl
```

检查一下导出的数据：

```sh
cat data.jsonl | jq
```

在这个例子中，我们使用 sed 命令替换 node_memory_MemTotal_bytes 的值，从 33604390912 改成 17179869184。

当然，你可以使用自己习惯的方式来做修改：

```sh
sed -i 's/33604390912/17179869184/g' data.jsonl
```

## 删除指标

前文介绍了，这里不再赘述。


## 导入指标

VictoriaMetrics 支持多种数据导入方式，下面我们使用从 json 文件导入的方式来导入数据：

```sh
curl -v -X POST http://vminsert:8480/insert/0/prometheus/api/v1/import -T data.jsonl
```

## 检查导入的指标

```sh
curl -X POST -g http://vmselect:8481/select/0/prometheus/api/v1/export -d match[]=node_memory_MemTotal_bytes
```

# 小结

不过还是需要注意一下。

删除尽量不要操作，因为 merge 也需要性能影响。

可以考虑使用时序数据库默认的 TTL 特性。

# 参考资料

https://blog.51cto.com/ulricqin/6223385


* any list
{:toc}