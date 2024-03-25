---
layout: post
title:  Quartz 14-其他特性
date:  2017-12-19 14:43:25 +0800
categories: [Schedule]
tags: [java, quartz, job, schedule, sh]
published: true
---

# 特性

# Plug-Ins

Quartz 提供了一个接口(`org.quartz.spi.SchedulerPlugin`)插入识别j2ee附加功能。

可以在 **org.quartz.plugins** 文件夹下找到与Quartz一起提供各种实用功能的插件。
它们提供了一些功能，例如在调度器启动时自动调度作业、记录作业历史和触发事件，并确保当JVM退出时调度程序会自动关闭。

# JobFactory

当触发器触发时，它所关联的作业将通过调度程序中配置的JobFactory实例化。
默认的JobFactory只调用作业类中的newInstance()。您可能希望创建自己的JobFactory实现来完成一些事情，比如让应用程序的IoC或DI容器生成/初始化作业实例。

看到 `org.quartz.spi.JobFactory` 接口和相关的 `Scheduler.setJobFactory(fact)` 方法。

# ‘Factory-Shipped’ Jobs

Quartz 还提供了一些实用的工作，您可以在应用程序中使用它来执行诸如发送电子邮件和调用 ejb 的工作。这些开箱即用的工作可以在 `org.quartz..jobs` 包中找到。

# 导航目录

> [导航目录](https://blog.csdn.net/ryo1060732496/article/details/79794802)

* any list
{:toc}