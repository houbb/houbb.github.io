---
layout: post
title:  Quartz 10-SchedulerListeners
date:  2017-12-19 14:43:25 +0800
categories: [Schedule]
tags: [java, quartz, job, schedule, sh]
published: true
---

# SchedulerListeners

调度器很像触发监听器(TriggerListeners)和工作监听器(JobListeners)，除非它们接收到调度程序本身中的事件通知——不一定是与特定触发器或作业相关的事件。

与调度相关的事件包括:添加作业/触发器、删除作业/触发器、调度程序中的严重错误、调度程序被关闭的通知等。

## SchedulerListeners 接口

```java
public interface SchedulerListener {

    /**
     * 当作业被调度时，调度器调用此方法。
     * @param trigger 与调度作业相关联的触发器。
     */
    public void jobScheduled(Trigger trigger);

    /**
     * 当作业取消调度时，调度器调用此方法。
     * @param triggerName 要取消调度的触发器的名称。
     * @param triggerGroup 要取消调度的触发器的组名。
     */
    public void jobUnscheduled(String triggerName, String triggerGroup);

    /**
     * 当触发器被终止时，调度器调用此方法。
     * @param trigger 触发器被终止。
     */
    public void triggerFinalized(Trigger trigger);

    /**
     * 当触发器被暂停时，调度器调用此方法。
     * @param triggerName 要暂停的触发器的名称。
     * @param triggerGroup 要暂停的触发器的组名。
     */
    public void triggersPaused(String triggerName, String triggerGroup);

    /**
     * 当触发器恢复时，调度器调用此方法。
     * @param triggerName 要恢复的触发器的名称。
     * @param triggerGroup 要恢复的触发器的组名。
     */
    public void triggersResumed(String triggerName, String triggerGroup);

    /**
     * 当作业被暂停时，调度器调用此方法。
     * @param jobName 要暂停的作业的名称。
     * @param jobGroup 要暂停的作业的组名。
     */
    public void jobsPaused(String jobName, String jobGroup);

    /**
     * 当作业恢复时，调度器调用此方法。
     * @param jobName 要恢复的作业的名称。
     * @param jobGroup 要恢复的作业的组名。
     */
    public void jobsResumed(String jobName, String jobGroup);

    /**
     * 当调度器发生错误时，调度器调用此方法。
     * @param msg 错误消息。
     * @param cause 导致错误的异常。
     */
    public void schedulerError(String msg, SchedulerException cause);

    /**
     * 当调度器启动时，调度器调用此方法。
     */
    public void schedulerStarted();

    /**
     * 当调度器处于待命模式时，调度器调用此方法。
     */
    public void schedulerInStandbyMode();

    /**
     * 当调度器关闭时，调度器调用此方法。
     */
    public void schedulerShutdown();

    /**
     * 当调度器的调度数据被清除时，调度器调用此方法。
     */
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