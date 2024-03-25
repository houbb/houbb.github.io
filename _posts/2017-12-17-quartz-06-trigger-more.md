---
layout: post
title:  Quartz 06-Triggers 深入学习
date:  2017-12-19 14:43:25 +0800
categories: [Schedule]
tags: [java, quartz, job, schedule, sh]
published: true
---

# Triggers

和 jobs 一样，触发器也很容易使用，但确实包含了各种可定制的选项，在充分使用Quartz之前，您需要了解并了解这些选项。

另外，正如前面提到的，您可以选择不同类型的触发器来满足不同的调度需求。

后面将会深入讨论: Simple Triggers & Cron Triggers.

# Common Trigger Attributes

除了所有触发器类型都有触发键(TriggerKey)属性来跟踪它们的特性之外，还有许多其他属性对所有触发器类型都是通用的。
当您正在构建触发器定义时，这些公共属性设置为 TriggerBuilder (下面的例子将会出现)。

- jobKey

指示在触发器触发时应该执行的作业的标识

- startTime

指示触发器的调度何时开始生效。

该值是一个 `java.util.date` 对象，它在给定的日历日期上定义了一个时间点。
对于某些触发器类型，触发器在开始时实际上会触发，而对于其他触发器，它只是标记了该调度应该开始执行的时间。
这意味着你可以在1月份的时候用“每月5天”这样的时间表来存储一个触发器，如果 startTime 属性设置为4月1日，那么就会在第一次触发前几个月。


- endTime

指示何时不再执行触发器的调度。

换句话说，在6月5日的最后一段时间里，一个“每个月5日”和7月1日的结束时间的触发点将会被触发。

# Priority

有时，当您有许多触发器(或您的石英线程池中很少的工作线程)时，Quartz可能没有足够的资源来立即触发所有计划在同一时间触发的触发器。

在这种情况下，您可能想要控制哪些触发器在可用的Quartz工作线程上优先被执行。为此，可以在触发器上设置优先级属性。如果 N 触发器同时触发，但是目前只有 Z 工作者线程可用，那么优先级最高的第一个 Z 触发器将首先被执行。
如果您没有在触发器上设置优先级，那么它将使用**默认的优先级5**。任何整数值都被允许为优先级，正或负。

## 注意

- 优先级仅用于相同的触发时间

预定在10:59的触发点总是在一个预定在11点首先被触发。

- 恢复的优先级

当检测到触发器的工作需要恢复时，它的恢复计划与最初的触发器相同。


# Misfire Instructions

触发器的另一个重要特性是它的“错误指令”。

如果一个持久的触发器“错过”了它的触发时间，因为调度程序正在被关闭，或者因为 Quartz 的线程池中没有可用的线程来执行任务，那么就会发生错误。不同的触发器类型有不同的错误指示。默认情况下，他们使用“智能策略”指令——基于触发器类型和配置的动态行为。当调度器启动时，它会搜索任何被错误触发的持久触发器，然后根据各自配置的错误指示更新每个触发器。

当您在自己的项目中开始使用 Quartz 时，您应该熟悉在给定触发器类型上定义的错误指示，并在其JavaDoc中解释。关于错误指示的更详细的信息将在每个触发类型的教程中给出。

# Calendars

## Quartz Calendar 

不是java.util。当触发器被定义并存储在调度程序中时，日历对象可以与触发器关联。日历是有用的，不包括时间块，从触发器的发射时间表。例如，您可以创建一个触发器，在每个工作日的上午9点30分触发一个作业，然后添加一个不包括所有业务假期的日历。


日历可以是任何实现日历接口的可序列化对象，它看起来是这样的:

## The Calendar Interface

```java
package org.quartz;

public interface Calendar {

  public boolean isTimeIncluded(long timeStamp);

  public long getNextIncludedTime(long timeStamp);

}
```

注意，这些方法的参数属于 long 类型。正如您可能猜到的，它们是**毫秒格式的时间戳**。这意味着日历可以将时间划分为毫秒。很有可能，你会对“封锁”一整天感兴趣。作为一个方便，Quartz 包含了类 `org.quartz.impl`。假期日历，就是这样。

日历必须通过 `addCalendar(..)` 方法实例化并通过调度程序注册。如果您使用假期日历，在实例化之后，您应该使用它的 `addExcludedDate(日期日期)` 方法来填充它，以便在您希望将其排除在调度之外的那些日子。同一个日历实例可以使用多个触发器，例如:

## 示例代码

```java
HolidayCalendar cal = new HolidayCalendar();
cal.addExcludedDate( someDate );
cal.addExcludedDate( someOtherDate );

sched.addCalendar("myHolidays", cal, false);


Trigger t = newTrigger()
    .withIdentity("myTrigger")
    .forJob("myJob")
    .withSchedule(dailyAtHourAndMinute(9, 30)) // execute job daily at 9:30
    .modifiedByCalendar("myHolidays") // but not on holidays
    .build();

// .. schedule job with trigger

Trigger t2 = newTrigger()
    .withIdentity("myTrigger2")
    .forJob("myJob2")
    .withSchedule(dailyAtHourAndMinute(11, 30)) // execute job daily at 11:30
    .modifiedByCalendar("myHolidays") // but not on holidays
    .build();

// .. schedule job with trigger2
```

在接下来的几节课中，将会给出触发点的 construction/building 的细节。
现在，只要相信上面的代码创建了两个触发器，每个触发器每天都被触发。但是，在日历排除的期间内发生的任何解雇都将被跳过。

参见 `org.quartz.impl` 日历包中有许多可能适合您的需要的日历实现。

# 目录导航

> [目录导航](https://blog.csdn.net/ryo1060732496/article/details/79794802)

* any list
{:toc}