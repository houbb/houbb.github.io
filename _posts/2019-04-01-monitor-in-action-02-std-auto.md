---
layout: post
title: 监控系统实战-02-标准化是自动化的前提
date: 2018-11-25 09:14:43 +0800
categories: [Devops]
tags: [devops, monitor, apm, zabbix, sh]
published: true
---

# 背景

我们如何实现日志的自动化解析？

答案是前提需要标准化。

但是希望所有的日志都是标准的，这显然非常不现实。

那么，有没有什么办法，稍微让这个情况好一些呢？

# v1-标准化的底层框架日志

我们场景的中间件，比如 mq cache rpc database config 等，可以提供一些中间件层面的标准的日志输出。

因为这部分不需要用户太多额外的工作量，一般公司提前埋点好，耗时比较好推进的。

# V2-ETL

所有的数据不标准化，是一个常见的现状。

一种非常自然的解决方案就是 ETL，对日志加工处理为标准化的日志。

这方面做得比较好的，比如 logstash。

我们可以对加工后的日志进行相关的业务处理。

# 相关开源项目

标准化的日志输出： [log stash in java.(简易版 logstash 实现)](https://github.com/houbb/auto-log)

日志的 ETL:  [log stash in java.(简易版 logstash 实现)](https://github.com/houbb/logstash4j)

# 小结

日志的全链路作为基础，有很多需要考虑的点。

标准化==》自动化

全链路==》TID



# 参考资料

无

* any list
{:toc}