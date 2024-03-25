---
layout: post
title:  Quartz 04-Jobs 和 Trigger
date:  2017-12-19 14:43:25 +0800
categories: [Schedule]
tags: [java, quartz, job, schedule, sh]
published: true
---

# Quartz API

主要接口定义如下：

Quartz API 的关键接口包括：

- Scheduler（调度器）- 与调度器进行交互的主要 API。

- Job（作业）- 由您希望由调度器执行的组件实现的接口。

- JobDetail（作业详情）- 用于定义作业的实例。

- Trigger（触发器）- 定义给定作业将被执行的调度时间表的组件。

- JobBuilder（作业构建器）- 用于定义/构建 JobDetail 实例，这些实例定义了作业的实例。

- TriggerBuilder（触发器构建器）- 用于定义/构建触发器实例。

Scheduler 的生命周期受它的创建限制，通过一个 SchedulerFactory 和对其 `shutdown()` 方法的调用。

一旦创建了调度程序接口，就可以使用添加、删除和列出作业和触发器，并执行其他与调度相关的操作(例如暂停触发器)。

但是，调度器实际上不会在任何触发器(执行作业)上起作用，直到它从 `start()` 方法开始。

## 静态导入

Quartz 为我们提供了 Builder，便于我们定义 领域特定语言（DSL，有时也称为“流畅接口”）。

为了更方便的书写代码，可以使用如下的静态导入代码。

```java
import static org.quartz.JobBuilder.*;
import static org.quartz.SimpleScheduleBuilder.*;
import static org.quartz.CronScheduleBuilder.*;
import static org.quartz.CalendarIntervalScheduleBuilder.*;
import static org.quartz.TriggerBuilder.*;
import static org.quartz.DateBuilder.*;
```


# Jobs and Triggers

## Job Interface

```java
package org.quartz;

public interface Job {

public void execute(JobExecutionContext context)
    throws JobExecutionException;
}
```

当作业的触发器触发时(稍后会详细说明)，`execute(..)` 方法由一个调度程序的工作线程调用。传递给该方法的 **JobExecutionContext** 对象提供了有关其“运行时”环境的信息的作业实例——执行它的调度程序的句柄、触发执行的触发器的句柄、作业的 JobDetail 对象和其他一些项。


**JobDetail** 对象是由 Quartz 客户机(您的程序)在任务添加到调度器时创建的。它包含作业的各种属性设置，以及 JobDataMap，它可以用来存储作业类的给定实例的状态信息。它本质上是作业实例的定义，在下一课中将进一步详细讨论。


触发器(Trigger)对象用于触发作业的执行(或“触发”)。当您希望调度作业时，您将实例化一个触发器并“调整”其属性，以提供您希望拥有的调度。触发器也可能有与它们相关联的JobDataMap——这对于将参数传递给特定于触发器触发的作业是有用的。带有少量不同触发器类型的Quartz船，但最常用的类型是SimpleTrigger和CronTrigger。


如果您需要“一次性”执行(仅在给定时刻执行一项任务)，或者您需要在给定的时间内解雇一份工作，并且重复执行N次，在执行期间延迟执行，那么 **SimpleTrigger** 非常方便。如果你希望基于日历的日程安排(比如“每个周五，中午”或“每月10日10时15分”触发，**CronTrigger** 是很有用的。

- Why Jobs AND Triggers? 

许多工作调度器没有关于工作和触发器的不同概念。
有些人将“工作”定义为简单的执行时间(或时间表)和一些小的工作标识符。另一些则很像石英的工作和触发对象的结合。在开发 Quartz 的同时，我们决定在时间表和在该计划上执行的工作之间创建分离是有意义的。这(在我们看来)有许多好处。


例如，可以在作业调度器中创建和存储作业，独立于触发器，并且许多触发器可以与相同的作业相关联。这种松耦合的另一个好处是，在相关触发器过期之后，可以配置在调度器中保留的作业，以便以后可以重新调度，而不必重新定义它。它还允许您修改或替换触发器，而不必重新定义其关联的作业。


# Identities

Job 和 触发器(Triggers) 被赋予标识键(Identities)，当它们在 Quartz 调度器中注册时。

Job 和触发器的关键(JobKey和TriggerKey)允许它们被放置到“组”(Group)中，这些“组”对组织工作和触发“报告工作”和“维护工作”等类别非常有用。

作业或触发器的键的名称部分必须在组内是**惟一**的，或者换句话说，作业或触发器的完整密钥(或标识符)是名称和组的复合。

# 目录导航

> [目录导航](https://blog.csdn.net/ryo1060732496/article/details/79794802)


* any list
{:toc}