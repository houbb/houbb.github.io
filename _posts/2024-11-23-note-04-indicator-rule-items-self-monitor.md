---
layout: post
title: 监控报警系统如何实现自监控?
date: 2024-11-23 01:18:08 +0800
categories: [Note]
tags: [note, sh]
published: true
---

# 随笔

[从千万粉丝“何同学”抄袭开源项目说起，为何纯技术死路一条？](https://houbb.github.io/2024/11/22/note-02-he-tech)

[数据源的统一与拆分](https://houbb.github.io/2024/11/22/note-03-split-apache-calcite)

[监控报警系统的指标、规则与执行闭环](https://houbb.github.io/2024/11/22/note-04-indicator-rule-execute-mearurement)

[我们的系统应该配置哪些监控报警项？](https://houbb.github.io/2024/11/22/note-04-indicator-rule-items)

[监控报警系统如何实现自监控?](https://houbb.github.io/2024/11/22/note-04-indicator-rule-items-self-monitor)

[java 老矣，尚能饭否？](https://houbb.github.io/2024/11/22/note-05-is-java-so-old)

[一骑红尘妃子笑，无人知是荔枝来!](https://houbb.github.io/2024/11/22/note-06-lizhi)

# 监控系统自己如何自监控？

我们前面在 [我们的系统应该配置哪些监控报警项？](https://houbb.github.io/2024/11/22/note-04-indicator-rule-items) 介绍了一些基本应用应该如何配置，那么监控系统本身如果出问题了怎么办?

下面简单分析一下应该有哪些自监控的配置？

## 一、报警数据采集

1. **数据采集延迟**  
   监控日志和指标数据的采集延迟，避免报警滞后错过关键时机。  
2. **数据丢失率**  
   检查采集过程中是否丢失数据，防止漏报关键问题。  
3. **采集数据量**  
   监控单位时间内的数据量异常，排查采集系统故障或异常业务行为。  

---

## 二、报警生成
1. **规则匹配耗时**  
   检测报警规则触发的时间延迟，确保及时生成报警。  
2. **报警生成率**  
   分析单位时间内的报警数量，避免漏报或误报。  
3. **规则异常**  
   检查规则是否加载失败、重复或无效，确保报警可靠性。  

---

## 三、报警传输与通知
1. **通知通道可用性**  
   确保短信、邮件、Webhook等通知方式正常可用。  
2. **通知发送延迟**  
   监控从报警生成到发送的时间，降低延迟影响。  
3. **通知失败率**  
   追踪通知失败比例，确保关键报警送达。  

---

## 四、报警系统性能
1. **系统吞吐量**  
   监控每秒可处理的报警量，防止高并发导致崩溃。  
2. **资源使用情况**  
   跟踪CPU、内存、磁盘等资源消耗，确保系统稳定。  
3. **队列长度**  
   检查消息队列堆积，避免处理瓶颈。  

---

## 五、系统健康状态
1. **组件运行状况**  
   定期检查采集、处理、通知等模块的健康状态，避免整体瘫痪。  
2. **日志监控**  
   监测报警系统日志中的错误关键字或流量异常，排查潜在问题。  
3. **依赖服务可用性**  
   确保数据库、消息队列等关键服务正常运行，避免系统停摆。  

# 监控系统故障应对

当报警系统自身出现问题时，应采取以下措施：

- **独立监控报警系统**：通过第三方工具监测其运行状态。  

- **冗余设计**：部署多套系统，确保故障切换。  

- **自动化恢复**：配置自愈策略，定时重启或重新部署服务。  

通过这些优化，报警系统将更加高效、稳定，保障业务连续性。

引入另一个维度，比如服务台人去观察服务是否正常。

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