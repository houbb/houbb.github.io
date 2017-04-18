---
layout: post
title:  Scheduler .Net
date:  2017-04-18 23:09:28 +0800
categories: [.Net]
tags: [dotnet, scheduler]
header-img: "static/app/res/img/kon-bg.jpeg"
published: true
---


# 任务调度系统


> [LTS](https://houbb.github.io/2016/10/22/LTS)

> [.net 分布式架构之任务调度平台](http://www.cnblogs.com/chejiangyi/p/4934991.html)

希望可以博采众家之长，做个简化版的系统。



# 项目企划草案


一、从LTS学习

> [LTS DOC](https://qq254963746.gitbooks.io/lts/content/introduce/architecture.html)

## 任务支持

- 实时任务：提交了之后立即就要执行的任务。

- 定时任务：在指定时间点执行的任务，譬如 今天3点执行（单次）。

- Cron任务：CronExpression，和quartz类似（但是不是使用quartz实现的）譬如 0 0/1 * ?

- Repeat任务：譬如每隔5分钟执行一次，重复50次就停止。


前三种是很有必要的。


## 架构设计

架构设计上，LTS框架中包含以下五种类型的节点：

- JobClient :主要负责提交任务, 并接收任务执行反馈结果。

- JobTracker :负责任务调度，接收并分配任务。

- TaskTracker :负责执行任务，执行完反馈给JobTracker。

- LTS-Monitor :主要负责收集各个节点的监控信息，包括任务监控信息，节点JVM监控信息

- LTS-Admin :管理后台）主要负责节点管理，任务队列管理，监控管理等。

LTS的这五种节点都是无状态的，都可以部署多个，动态扩容，来实现负载均衡，实现更大的负载量, 并且框架采用FailStore策略使LTS具有很好的容错能力。

这个可以简化。


## 执行结果


LTS框架提供四种执行结果支持，EXECUTE_SUCCESS，EXECUTE_FAILED，EXECUTE_LATER，EXECUTE_EXCEPTION，并对每种结果采取相应的处理机制，譬如重试。

- EXECUTE_SUCCESS: 执行成功,这种情况，直接反馈客户端（如果任务被设置了要反馈给客户端）。

- EXECUTE_FAILED：执行失败，这种情况，直接反馈给客户端，不进行重试。

- EXECUTE_LATER：稍后执行（需要重试），这种情况，不反馈客户端，重试策略采用30s的策略，默认最大重试次数为10次，用户可以通过参数设置修改这些参数。

- EXECUTE_EXCEPTION：执行异常, 这中情况也会重试(重试策略，同上)


可根据自己需要细化。


## 优秀点

- 动态扩容和容错重试。

- 故障转移









