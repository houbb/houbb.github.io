---
layout: post
title: log 日志全生命周期-01-概览 日志整体设计蓝图
date: 2023-10-30 21:01:55 +0800
categories: [Log]
tags: [log, elk, sh]
published: true
---



# 开源组件系列

## 日志矩阵

[日志采集-logcollect-go](https://github.com/houbb/logcollect-go)

[日志处理-logstash4j](https://github.com/houbb/logstash4j)

[日志处理插件-logstash4j-plugins](https://github.com/houbb/logstash4j-plugins)

TODO: 将插件和 logstash4j 合并，方便管理，单独一个 api 模块，方便拓展。

[日志整合框架-log-integration](https://github.com/houbb/log-integration)

[切面日志-auto-log](https://github.com/houbb/auto-log)

[日志脱敏-sensitive](https://github.com/houbb/sensitive)

## 日志的全链路

[全链路 auto-trace](https://github.com/houbb/auto-trace)

[唯一的跟踪号-trace-id](https://github.com/houbb/trace-id)

[包内链路信息]()

[应用间链路]()

## 日志检索

[分词-segment](https://github.com/houbb/segment)

[拼音-pinyin](https://github.com/houbb/pinyin)

[中文繁简体转换-opencc4j](https://github.com/houbb/opencc4j)

[日志存储+检索 类似ES:TODO]()

[日志的可视化 类似kibana:TODO]()

[日志分析-错误+慢日志+报警平台：TODO]()

## 三方

CAT-client 和 CAT 服务端联动

mq: kafka

注册中心：zk

ELK 

LOKI

VM 时序数据库 + 夜莺等监控

# 整体的架构设计

![整体设计](https://i-blog.csdnimg.cn/direct/c9655cd1939b4e77bde05a23c1bcd0dc.png#pic_center)

# 小结

一定要有大局观。

可以不是自己实现，但是一定要对每个核心的额点了如指掌。

# 参考资料

* any list
{:toc}