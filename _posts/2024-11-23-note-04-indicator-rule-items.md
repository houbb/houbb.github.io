---
layout: post
title: 一张表格，看懂应用监控项配置
date: 2024-11-23 01:18:08 +0800
categories: [Note]
tags: [note, sh]
published: true
---

# 随笔

[从千万粉丝“何同学”抄袭开源项目说起，为何纯技术死路一条？](https://houbb.github.io/2024/11/22/note-02-he-tech)

[数据源的统一与拆分](https://houbb.github.io/2024/11/22/note-03-split-apache-calcite)

[监控报警系统的指标、规则与执行闭环](https://houbb.github.io/2024/11/22/note-04-indicator-rule-execute-mearurement)

[一张表格，看懂应用监控项配置](https://houbb.github.io/2024/11/22/note-04-indicator-rule-items)

[监控报警系统如何实现自监控?](https://houbb.github.io/2024/11/22/note-04-indicator-rule-items-self-monitor)

[java 老矣，尚能饭否？](https://houbb.github.io/2024/11/22/note-05-is-java-so-old)

[一骑红尘妃子笑，无人知是荔枝来!](https://houbb.github.io/2024/11/22/note-06-lizhi)

# 应用监控指北

我们千辛万苦搭建好了一个监控平台，但是应该配置哪些监控项呢？

本文将以通俗易懂的方式，梳理简单梳理一下需要的关键监控项。

| **类别**      | **监控内容**                          | **关键点**                                           | **推荐工具**                |
|---------------|---------------------------------------|-----------------------------------------------------|-----------------------------|
| **基础设施层** | **服务器硬件资源**                   | - CPU使用率：避免性能瓶颈<br>- 内存使用率：防止崩溃<br>- 磁盘IO和空间：监控耗尽与瓶颈<br>- 网络带宽和延迟：关注丢包与延迟 | Prometheus, Zabbix         |
|               | **虚拟化和容器**                     | - 容器资源限制：防异常<br>- 主机节点资源：保证稳定运行 | Prometheus, Zabbix         |
| **应用层**    | **服务健康状态**                     | - 接口可用性：核心接口稳定<br>- 响应时间：监控性能下降<br>- 错误率：快速定位异常 | CAT                        |
|               | **应用性能**                         | - QPS/TPS：系统负载能力<br>- 线程池状态：避免耗尽<br>- GC时间/频率：优化内存管理 | CAT                        |
|               | **日志异常**                         | - 关键字监控：快速排查问题<br>- 日志流量突增：预警故障 | 日志采集工具               |
| **数据库层**  | **连接池**                           | - 连接池使用率：避免耗尽                            | CAT, Prometheus            |
|               | **查询性能**                         | - 慢查询：找性能瓶颈<br>- 查询失败率：预警问题       | 日志分析工具               |
|               | **数据库资源**                       | - CPU/内存/磁盘IO：监控数据库压力<br>- 主从延迟：保证一致性 | Prometheus, 日志工具       |
| **网络层**    | **API网关**                          | - 请求数量/延迟：评估流量与性能<br>- 限流/熔断次数：发现异常流量 | 日志分析工具               |
|               | **网络连接**                         | - HTTP错误率：检查超时/中断<br>- 防火墙日志：检测恶意访问 | 日志分析工具               |
| **安全监控**  | **用户行为**                         | - 登录失败次数：防暴力破解<br>- 敏感操作日志：追踪高风险 | 安全监控平台               |
|               | **系统漏洞**                         | - 异常文件改动：检测入侵<br>- 未授权访问：发现非法操作 | 安全监控平台               |
| **业务指标**  | **核心业务流程**                     | - 订单数量/支付成功率：保障业务正常<br>- 用户转化率：优化策略 | 业务监控平台               |
|               | **自定义指标**                       | 根据业务模型设置，如库存状态、广告点击率             | 业务监控平台               |

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