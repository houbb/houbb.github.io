---
layout: post
title:  Quartz 13-高级特性
date:  2017-12-19 14:43:25 +0800
categories: [Schedule]
tags: [java, quartz, job, schedule, sh]
published: true
---

# Advanced (Enterprise) Features

# Clustering

集群目前使用JDBC-Jobstore (JobStoreTX或JobStoreCMT)和TerracottaJobStore。

特性包括**负载平衡和工作故障转移**(如果JobDetail的“请求恢复”标志设置为true)。

通过设置“org.quartz.jobStore”，将集群与JobStoreTX或JobStoreCMT进行集群。
isClustered”属性“true”。集群中的每个实例都应该使用相同的quartz副本。属性文件。这其中的例外是使用相同的属性文件，
并使用以下允许的例外:不同的线程池大小，以及“org.quartz.scheduler”的不同值。instanceId”属性。集群中的每个节点都必须具有唯一的instanceId，通过将“AUTO”作为该属性的值，可以轻松完成(不需要不同的属性文件)。

## 注意

(1) 不要在单独的机器上运行集群，除非它们的时钟是同步的，使用某种形式的时间同步服务(守护进程)，它运行得非常频繁(时钟必须在彼此之间的秒内)。

见[http://www.boulder.nist.gov/timefreq/service/its.htm](http://www.boulder.nist.gov/timefreq/service/its.htm) 如果您不熟悉如何做到这一点。

(2) 不要在任何其他实例运行的同一组表上启动非集群实例。您可能会得到严重的数据损坏，并且肯定会经历不稳定的行为。


只有一个节点会触发每次发射的任务。我的意思是,如果工作有重复触发告诉火每10秒,然后在12:00:00将运行一个节点工作,和12:00:10将运行一个节点工作,等等。每次都不一定是相同的节点,它或多或少会随机节点运行它。对于繁忙的调度程序(很多触发器)，负载平衡机制几乎是随机的，但它倾向于只对非繁忙的(例如，一个或两个触发器)调度程序进行活动的同一个节点。

使用TerracottaJobStore集群，只需配置调度程序，使用TerracottaJobStore(第9课:JobStores)，您的调度器将全部用于集群。

您可能还需要考虑如何设置Terracotta服务器，特别是启用诸如持久性等特性的配置选项，以及为HA运行一系列Terracotta服务器。

TerracottaJobStore的企业版提供了高级的Quartz，它允许将工作的智能目标定向到适当的集群节点。

这JobStore和Terracotta的更多信息可以在 [http://www.terracotta.org/quartz](http://www.terracotta.org/quartz) 上找到

# JTA Transactions

正如第9课所解释的:jobstore, JobStoreCMT允许在较大的JTA事务中执行Quartz调度操作。

通过设置 `org.quartz.scheduler.wrapJobExecutionInUserTransaction` 属性为 **true**。
使用此选项集，在调用作业执行方法之前，将启动一个JTA事务，并在执行终止调用后提交。这适用于所有的工作。

如果您想要在每个作业中显示JTA事务是否应该包装它的执行，那么您应该在作业类上使用 `@ExecuteInJTATransaction` 注释。

除了在JTA事务中自动执行任务执行的Quartz之外，在使用JobStoreCMT时，在调度器接口上的调用也会参与事务。在调用调度程序的方法之前，确保已经启动了一个事务。您可以通过使用UserTransaction直接完成这一操作，也可以使用使用容器管理事务的SessionBean中的调度器。

# 导航目录

> [导航目录](https://blog.csdn.net/ryo1060732496/article/details/79794802)

* any list
{:toc}