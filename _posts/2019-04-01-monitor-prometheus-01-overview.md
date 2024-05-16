---
layout: post
title: Prometheus-监控 普罗米修斯普米-01-概览
date:  2019-4-1 19:24:57 +0800
categories: [Monitor]
tags: [monitor, apm, time-series, sf]
published: true
---

# Prometheus

[Prometheus](https://prometheus.io/) Power your metrics and alerting with a leading open-source monitoring solution.
 
## 特性

### 尺寸数据

Prometheus实现了高度维度的数据模型。时间序列由度量标准名称和一组键值对标识。

### 强大的查询

PromQL允许对收集的时间序列数据进行切片和切块，以生成临时图形，表格和警报。

### 很棒的可视化

Prometheus有多种可视化数据的模式：内置表达式浏览器，Grafana集成和控制台模板语言。

### 高效存储

Prometheus以高效的自定义格式将时间序列存储在内存和本地磁盘上。缩放是通过功能分片和联合实现的。

### 操作简单

每个服务器都独立于可靠性，仅依赖于本地存储。写在Go中，所有二进制文件都是静态链接的，易于部署。

### 精确警报

警报基于Prometheus灵活的PromQL定义并维护尺寸信息。 alertmanager处理通知和静音。

### 许多客户端库

客户端库允许轻松检测服务。已经支持超过十种语言，并且易于实现自定义库。

### 许多集成

现有出口商允许将第三方数据桥接到普罗米修斯。示例：系统统计信息，以及Docker，HAProxy，StatsD和JMX指标。

# 拓展阅读

[Zabbix](https://houbb.github.io/2018/11/25/zabbix)

[Cat](https://houbb.github.io/2016/12/16/cat)

[Kibana](https://houbb.github.io/2016/10/16/kibana)

[Influxdb](https://houbb.github.io/2019/04/01/database-influxdb)

[OpenTSDB](https://houbb.github.io/2019/04/01/database-opentsdb)

# 参考资料

[comparison-to-alternatives](https://prometheus.io/docs/introduction/comparison/#comparison-to-alternatives)

[Kibana vs. Grafana vs. Prometheus](https://stackshare.io/stackups/grafana-vs-kibana-vs-prometheus)

[Prometheus vs. NetData](https://stackshare.io/stackups/netdata-vs-prometheus)

[Prometheus vs. Graphite: Which Should You Choose for Time Series or Monitoring?](https://logz.io/blog/prometheus-vs-graphite/)

[Prometheus vs Zabbix](https://www.jianshu.com/p/b3a261d1502b)

# 个人感受

1. 监控相关的软件也是非常之多，选择合适自己公司的。

2. google 检索 `Prometheus vs` 就可以找到相关的对比。

3. 如果我们不知道这个维度，就无法知道相关的知识。可以先国内检索类似的框架技术，然后直接 google 一下。

# 参考资料

[Opentsdb Document](http://opentsdb.net/docs/build/html/index.html)

[为什么说Prometheus是足以取代Zabbix的监控神器？](https://mp.weixin.qq.com/s/zM4BHk4aPaCbpbndhwIbxg)

* any list
{:toc}