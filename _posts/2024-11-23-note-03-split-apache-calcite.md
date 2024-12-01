---
layout: post
title: 数据源的统一与拆分 apache calcite 的雄心与现实
date: 2024-11-23 01:18:08 +0800
categories: [Note]
tags: [note, sh]
published: true
---

# 数据库的分类

数据库作为我们常用的底层服务之一，有很多的种类。

![数据库的分类](https://i-blog.csdnimg.cn/blog_migrate/12978d8d61b8b7311c27edf5890d357c.png)

每一种数据库都有对应的查询语句。比如 mysql / oracle / mongodb / es / vm 等等...

这么多，怎么记得住呢?

# 统一

有没有类似于 slf4j 统一日志输出一样，也有人统一一下 SQL 的查询呢？

答案是有的。

apache calcite 提供了一个行业标准的 SQL 解析器和验证器，一个可定制的优化器，具有可插拔规则和成本函数，逻辑和物理代数运算符，从 SQL 到代数（以及相反）的各种转换算法，以及许多适配器，用于在 Cassandra、Druid、Elasticsearch、MongoDB、Kafka 等系统上执行 SQL 查询，配置最小。

![calcite](https://gitee.com/houbinbin/imgbed/raw/master/img/02-flow.png)

# 方言

不过实际使用中，发现对于一些方言语法的兼容还是没那么好。

一开始想设计 SQL 引擎的时候使用，但是实际上发现业务方使用 SQL 造诣非常之高，乃至很多语法 calcite 并不支持。

所以使用体验反而会很差，权衡之下， mysql/oracle 还是选择了使用原生的语法。

# 为什么不能全部统一

不同的数据库解决不同的场景难题,不同的流派有着自己的理念优势，不同的民族有着独特的文化美食。

取长补短，兼容并包，方是正道。

# 小结

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次相遇。

# 随笔

[从千万粉丝“何同学”抄袭开源项目说起，为何纯技术死路一条？](https://houbb.github.io/2024/11/22/note-02-he-tech)

[数据源的统一与拆分](https://houbb.github.io/2024/11/22/note-03-split-apache-calcite)

[监控报警系统的指标、规则与执行闭环](https://houbb.github.io/2024/11/22/note-04-indicator-rule-execute-mearurement)

[我们的系统应该配置哪些监控报警项？](https://houbb.github.io/2024/11/22/note-04-indicator-rule-items)

[监控报警系统如何实现自监控?](https://houbb.github.io/2024/11/22/note-04-indicator-rule-items-self-monitor)

[java 老矣，尚能饭否？](https://houbb.github.io/2024/11/22/note-05-is-java-so-old)

[一骑红尘妃子笑，无人知是荔枝来!](https://houbb.github.io/2024/11/22/note-06-lizhi)

[张居正的考成法，对我们有何参考价值？](https://houbb.github.io/2024/11/22/note-07-zhangjuzheng-kaochengfa)

[mongodb/redis/neo4j 如何自己打造一个 web 数据库可视化客户端？](https://houbb.github.io/2024/11/22/note-08-visual)

[DevOps 平台越发展，开发运维越快失业？](https://houbb.github.io/2024/11/22/note-09-devops-how-to-go)

[开源如何健康长久的发展](https://houbb.github.io/2024/11/22/note-10-opensource-way)

[为什么会有流水线？](https://houbb.github.io/2024/11/22/note-11-pipeline)

[既然选择了远方 便只顾风雨兼程](https://houbb.github.io/2024/11/22/note-12-positive-negative)

[银行是如何挣钱的？](https://houbb.github.io/2024/11/22/note-13-bank-profit)

# 参考资料

* any list
{:toc}