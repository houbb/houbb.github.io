---
layout: post
title:  Quartz 12-Configuration
date:  2017-12-19 14:43:25 +0800
categories: [Schedule]
tags: [java, quartz, job, schedule, sh]
published: true
---

# Configuration, Resource Usage and SchedulerFactory

Quartz的架构是模块化的，因此要让它运行几个组件，需要将其“断开”。幸运的是，存在一些帮助实现这种情况的助手。

在Quartz能够完成其工作之前，需要配置的主要组件是:

- ThreadPool

- JobStore

- DataSources (if necessary)

- The Scheduler itself

## ThreadPool

ThreadPool提供了一组用于执行作业时使用 Quartz 的线程。池中线程越多，可以并发运行的作业数量就越多。但是，太多的线程可能会使系统崩溃。

大多数 Quartz 用户发现，**5**个左右的线程足够多——因为在任何给定的时间内，他们的工作岗位都少于100个，而这些工作通常不会同时运行，而且工作时间很短(完成得很快)。其他用户发现他们需要10个、15个、50个甚至100个线程——因为他们有成千上万个不同时间表的触发点——在任何给定的时刻，他们平均要执行10到100个任务。为调度器的池找到合适的大小完全取决于您使用调度器的用途。**除了保持线程数量尽可能小**(为了您的机器的资源)之外，没有真正的规则，但是要确保您有足够的时间让您的工作按时启动。请注意，如果触发的触发时间到达，并且没有可用的线程，Quartz将阻塞(暂停)，直到有一个线程可用，然后任务将执行——比它应该执行的时间晚几毫秒。这甚至可能导致线程失火(MisFire)——如果调度程序配置的“misfire阈值”(misfire threshold)的持续时间没有可用线程的话。

在 `org.quartz.spi` 包中定义了一个ThreadPool接口。你可以用你喜欢的任何方式创建一个ThreadPool实现。Quartz 附带一个简单(但非常满意)线程池`org.quartz.simpl.SimpleThreadPool`命名。
这个ThreadPool只是在它的池中维护一组固定的线程——从不增长，从不收缩。但是它是非常健壮的，并且经过了很好的测试——几乎所有使用 Quartz 的人都使用这个池。

## JobStores & DataSources 

值得注意的是，所有的jobstore都实现了 `org.quartz.spi.JobStore` 接口——如果其中一个绑定的JobStore不符合您的需求，那么您可以自己创建。

## Scheduler

调度程序本身需要给定一个名称，告诉它的RMI设置，以及一个JobStore和ThreadPool的实例。

RMI设置包括:调度器是否应该创建自己作为RMI的服务器对象(使自己可以用于远程连接)、主机和端口的使用等。StdSchedulerFactory (下面讨论)也可以生成调度实例，它们实际上是远程进程中创建的调度程序的代理(RMI存根)。


# StdSchedulerFactory

StdSchedulerFactory 是 ` org.quartz.SchedulerFactory` 的一个实现。
它使用一组属性(`java.util.Properties`)来创建和初始化一个 Quartz 调度器。
属性通常存储在文件中并从文件中加载，但也可以由程序创建并直接交给工厂。
在工厂中简单地调用 `getScheduler() `将生成调度程序、初始化它(以及它的ThreadPool、JobStore和DataSources)，并返回它的公共接口的句柄。

在Quartz发行版的**docs/config**目录中，有一些示例配置(包括属性描述)。您可以在Quartz文档的“参考”部分的“配置”手册中找到完整的文档。

# DirectSchedulerFactory

DirectSchedulerFactory 是另一个调度程序工厂实现。
对于那些希望以更程序化的方式创建调度实例的人来说，这是很有用的。

它的使用通常是由于以下原因而被阻止的:

(1)它要求用户对他们正在做的事情有一个更大的理解，

(2)它不允许声明式配置——或者换句话说，你最终会硬编码所有调度器的设置。

# Logging

Quartz使用SLF4J框架来满足所有日志记录需求。为了“调优”日志记录设置(例如输出量，以及输出的位置)，您需要了解SLF4J框架，这超出了本文的范围。

如果你想获取额外信息触发解雇和执行工作,`org.quartz.plugins.history.LoggingJobHistoryPlugin` & `org.quartz.plugins.history.LoggingTriggerHistoryPlugin`

# 导航目录

> [导航目录](https://blog.csdn.net/ryo1060732496/article/details/79794802)

* any list
{:toc}