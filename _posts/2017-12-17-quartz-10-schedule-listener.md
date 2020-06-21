---
layout: post
title:  Quartz 10-SchedulerListeners
date:  2017-12-19 14:43:25 +0800
categories: [Java]
tags: [java, java-tool, sh]
published: true
---

# SchedulerListeners

调度器很像触发监听器(TriggerListeners)和工作监听器(JobListeners)，除非它们接收到调度程序本身中的事件通知——不一定是与特定触发器或作业相关的事件。

与调度相关的事件包括:添加作业/触发器、删除作业/触发器、调度程序中的严重错误、调度程序被关闭的通知等。

## SchedulerListeners 接口

```java
public interface SchedulerListener {

    public void jobScheduled(Trigger trigger);

    public void jobUnscheduled(String triggerName, String triggerGroup);

    public void triggerFinalized(Trigger trigger);

    public void triggersPaused(String triggerName, String triggerGroup);

    public void triggersResumed(String triggerName, String triggerGroup);

    public void jobsPaused(String jobName, String jobGroup);

    public void jobsResumed(String jobName, String jobGroup);

    public void schedulerError(String msg, SchedulerException cause);

    public void schedulerStarted();

    public void schedulerInStandbyMode();

    public void schedulerShutdown();

    public void schedulingDataCleared();
}
```

调度器是在调度器的 `ListenerManager` 注册的。可调度器实际上可以是实现 `org.quartz.SchedulerListener` 接口。


## 触发器的操作

- 添加

```java
scheduler.getListenerManager().addSchedulerListener(mySchedListener);
```

- 移除

```java
scheduler.getListenerManager().removeSchedulerListener(mySchedListener);
```

# 导航目录

> [导航目录](https://blog.csdn.net/ryo1060732496/article/details/79794802)

* any list
{:toc}