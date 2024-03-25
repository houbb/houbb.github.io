---
layout: post
title:  Quartz 09-TriggerListeners JobListeners 监听者
date:  2017-12-19 14:43:25 +0800
categories: [Schedule]
tags: [java, quartz, job, schedule, sh]
published: true
---

# 监听者

Listeners 是您根据调度程序中发生的事件创建的对象。

正如您可能猜到的那样，triggerlistener 接收与触发器相关的事件，而 joblistener 接收与作业相关的事件。

## TriggerListener 接口

Trigger 事件包括:触发触发，触发错误触发(在本文档的“触发器”部分中讨论)，触发完成(触发器触发的工作完成)。

```java
public interface TriggerListener {

    public String getName();

    public void triggerFired(Trigger trigger, JobExecutionContext context);

    public boolean vetoJobExecution(Trigger trigger, JobExecutionContext context);

    public void triggerMisfired(Trigger trigger);

    public void triggerComplete(Trigger trigger, JobExecutionContext context,
            int triggerInstructionCode);
}
```

## JobListener 接口

与 Job 相关的事件包括:任务即将被执行的通知，以及任务完成执行时的通知。

```java
public interface JobListener {

    public String getName();

    public void jobToBeExecuted(JobExecutionContext context);

    public void jobExecutionVetoed(JobExecutionContext context);

    public void jobWasExecuted(JobExecutionContext context,
            JobExecutionException jobException);
}
```

# 自定义 Listeners

要创建一个侦听器(Listener)，只需创建一个实现了 `org.quartz.TriggerListener` 或者 `org.quartz.JobListener` 接口。

在运行时，侦听器会在调度程序中注册，并且必须给定一个名称(或者更确切地说，它们必须通过 `getName()` 方法为自己的名称做广告)。

为了方便起见，除了实现这些接口之外，您的类还可以扩展类 `JobListenerSupport` 或 `TriggerListenerSupport`，并简单地覆盖您感兴趣的事件。

侦听器在调度器的 ListenerManager 上注册，并附带一个 Matcher，用来描述侦听器想要接收事件的工作/触发器。

> 侦听器在运行时在调度器中注册，并且不会与作业和触发器一起存储在JobStore中。这是因为侦听器通常是应用程序的集成点。因此，每次应用程序运行时，都需要将侦听器重新注册到调度器中

## 各种 Listener 使用

### 静态导入

```java
import static org.quartz.JobKey.*;
import static org.quartz.impl.matchers.KeyMatcher.*;
import static org.quartz.impl.matchers.GroupMatcher.*;
import static org.quartz.impl.matchers.AndMatcher.*;
import static org.quartz.impl.matchers.OrMatcher.*;
import static org.quartz.impl.matchers.EverythingMatcher.*;
```

- 增加一个对某项工作(Job)感兴趣的JobListener:

```java
scheduler
.getListenerManager()
.addJobListener(myJobListener, jobKeyEquals(jobKey("myJobName", "myJobGroup")));
```

- 增加一个对特定 group 中所有工作(Job)感兴趣的JobListener:

```java
scheduler.getListenerManager().addJobListener(myJobListener, jobGroupEquals("myJobGroup"));
```

- 增加一个对多个 group 中所有工作(Job)感兴趣的JobListener:

```java
scheduler.getListenerManager().addJobListener(myJobListener, or(jobGroupEquals("myJobGroup"), jobGroupEquals("yourGroup")));
```

- 增加一个对所有工作(Job)感兴趣的JobListener:

```java
scheduler.getListenerManager().addJobListener(myJobListener, allJobs());
```

TriggerListeners 注册也是类似的方式

大多数 Quartz 用户都不使用侦听器，但是当应用程序**需求创建事件通知的需要**时，就很方便了，因为没有工作本身必须显式地通知应用程序。

# 导航目录

> [导航目录](https://blog.csdn.net/ryo1060732496/article/details/79794802)

* any list
{:toc}