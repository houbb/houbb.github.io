---
layout: post
title: 时序数据库-08-vm VictoriaMetrics cluster 集群访问方式
date:  2019-4-1 19:24:57 +0800
categories: [Database]
tags: [database, dis-database, distributed, time-series, sf]
published: true
---

# 单机版本

## curl 插入

插入单个呢？

```sh
curl 'http://127.0.0.1:8428/api/v1/import' \
-H "Content-Type:application/json" \
-X POST \
-d '{"metric":{"__name__":"testVm","hostname":"127.0.0.1"},"values":[77],"timestamps":[1713493018327]}'
```

1713493018327 这个最好是当前时间。

## curl 查询

我们可以指定 metric 的名字进行查询。


```sh
curl 'http://localhost:8428/api/v1/export' -d 'match={__name__="testVm"}'
```

如下：

```sh
$ curl 'http://localhost:8428/api/v1/export' -d 'match={__name__="testVm"}'
{"metric":{"__name__":"testVm","hostname":"127.0.0.1"},"values":[77,66],"timestamps":[1713493018327,1713493018327]}
```

看的出来，一次性的多个值和时间戳，会被认为还是一条记录。

这个时间最好是当前的 linux 时间戳，默认应该是查询当前一段时间内的数据。

# 集群版本

> [cluster-victoriametrics/](https://docs.victoriametrics.com/cluster-victoriametrics/)

集群版本会有一些不同。

## 插入

默认插入端口是 8480

```sh
curl 'http://机器地址:8480/insert/0/prometheus/api/v1/insert' \
-H "Content-Type:application/json" \
-X POST \
-d '{"metric":{"__name__":"testVm","hostname":"127.0.0.1"},"values":[77],"timestamps":[1713493018327]}'
```

## 查询

默认查询端口是 8481

```sh
curl 'http://机器地址:8481/select/0/prometheus/api/v1/export' -d 'match={__name__="testVm"}'
```

或者

```sh
http://机器地址:8481/select/0/prometheus/api/v1/query?query=指标名称
```

不过后者没查到数据。

# 参考资料

[VictoriaMetrics 集群原理](https://segmentfault.com/a/1190000041789939?utm_source=sf-hot-article)

* any list
{:toc}