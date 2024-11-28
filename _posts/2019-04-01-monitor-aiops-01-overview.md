---
layout: post
title: 监控系统 AIOps-01-overview 概览
date: 2018-11-25 09:14:43 +0800
categories: [Devops]
tags: [devops, monitor, apm, ai, sh]
published: true
---


# 基本的监控属性会有哪些

Static Relationship: 静态资源：cmdb

Dynamic Relationship: 动态关系：Trace

Events 事件变更：应用发布 + 配置变更 + 数据库变更===》背后需要统一的审批流程+流水线支撑

Alarm: 报警信息：普米/CAT/DB/日志

Mertric: 以及对应的指标信息

通知：一些变更的通知 停水/停电/机房搬迁？

# 关系

所有的静态资源

通过 cmdb，从上到下，方向的关联起来。

比如：dns==>网络==》应用====》虚拟机==》物理机===》交换机。。。


网络：dns域名  IP映射  网络服务器
业务层：收单 航旅 。。。
核心支撑：收银台  余额 出款 对账 风控
中间件：redis mongodb mysql mq
应用自身：disk cpu mem gc net

# 通道

主流的通道：

IM: 自建 app，或者是钉钉，打通？

email: 邮件？

电话

短信？

这些基本被垄断了，但是基本是必须的。

# RCA 根因分析

可以根据上面的图。

把所有的 event/alarm 直接关联到对应的 ip 上面，然后通过图的关系，画出对应的图。

可以考虑借助 apoc algo gds 等内置库

可以考虑前期剪枝

# 参考资料

https://www.zabbix.com/documentation/4.0/zh/manual/introduction/about

* any list
{:toc}