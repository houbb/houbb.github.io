---
layout: post
title:  Quartz 07-SimpleTrigger
date:  2017-12-19 14:43:25 +0800
categories: [Schedule]
tags: [java, quartz, job, schedule, sh]
published: true
---

# SimpleTrigger

如果您需要在特定的时间内精确地执行一次任务，或者在特定的时间间隔内重复执行某个特定的时间间隔，那么SimpleTrigger应该满足您的调度需求。

举个例子，如果你想在2015年1月13日上午11:23:54的时候触发，或者你想在那个时候触发，然后再触发5次(间隔 10S)。

有了这个描述，您可能不会惊讶地发现一个简单触发器的属性包括:开始时间、结束时间、重复计数和重复间隔。

重复计数可以是零，一个正整数，或者常量值 `SimpleTrigger.REPEAT_INDEFINITELY`。
重复的间隔属性必须为零，或正长的值，并表示若干毫秒。注意，重复的零间隔将导致触发器的“重复计数”触发同时发生(或者与调度程序可以同时执行的情况类似)。

- DateBuilder

DateBuilder 类，有助于计算触发器的触发时间，这取决于您试图创建的startTime(或endTime)。

- endTime

endTime属性(如果指定的话)会**覆盖**重复计数属性。

这可能是有用的,如果您希望创建一个触发器每10秒触发一次,直到一个给定的时刻,而不是计算的次数,将重复启动时间和结束时间,您可以简单地指定的 endTime, 然后使用重复计数REPEAT_INDEFINITELY(你甚至可以指定一些大量的重复计算,保证 endTime 先结束即可)。

## TriggerBuilder

SimpleTrigger 实例是使用 TriggerBuilder (用于触发器的主要属性)和 SimpleScheduleBuilder (针对SimpleTrigger特定属性)构建的。

要在dsl风格中使用这些构建器，请使用静态导入:

```java
import static org.quartz.TriggerBuilder.*;
import static org.quartz.SimpleScheduleBuilder.*;
import static org.quartz.DateBuilder.*:
```

# 各种触发器的定义

- 在特定的时间内建立一个触发点，不要重复:

```java
SimpleTrigger trigger = (SimpleTrigger) newTrigger()
    .withIdentity("trigger1", "group1")
    .startAt(myStartTime) // some Date
    .forJob("job1", "group1") // identify job with name, group strings
    .build();
```

- 在特定的时间内建立一个触发点，然后每10秒重复10次:

```java
SimpleTrigger trigger = newTrigger()
    .withIdentity("trigger3", "group1")
    .startAt(myTimeToStartFiring)  // if a start time is not given (if this line were omitted), "now" is implied
    .withSchedule(simpleSchedule()
        .withIntervalInSeconds(10)
        .withRepeatCount(10)) // note that 10 repeats will give a total of 11 firings
    .forJob(myJob) // identify job with handle to its JobDetail itself                   
    .build();
```

- 5分钟后执行一次

```java
 trigger = (SimpleTrigger) newTrigger()
    .withIdentity("trigger5", "group1")
    .startAt(futureDate(5, IntervalUnit.MINUTE)) // use DateBuilder to create a date in the future
    .forJob(myJobKey) // identify job with its JobKey
    .build();
```

- 立刻执行。并且 5min 重复一次，直到 22:00

```java
trigger = newTrigger()
    .withIdentity("trigger7", "group1")
    .withSchedule(simpleSchedule()
        .withIntervalInMinutes(5)
        .repeatForever())
    .endAt(dateOf(22, 0, 0))
    .build();
```

- 下个小时的（00:00）开始触发，每2小时触发一次，一直下去

```java
trigger = newTrigger()
    .withIdentity("trigger8") // because group is not specified, "trigger8" will be in the default group
    .startAt(evenHourDate(null)) // get the next even-hour (minutes and seconds zero ("00:00"))
    .withSchedule(simpleSchedule()
        .withIntervalInHours(2)
        .repeatForever())
    // note that in this example, 'forJob(..)' is not called
    //  - which is valid if the trigger is passed to the scheduler along with the job  
    .build();

    scheduler.scheduleJob(trigger, job);
```

# SimpleTrigger 失败说明

SimpleTrigger有几个指令，可以用来告诉 Quartz 在发生错误时应该做什么。(MisFire 情况在“第4课:更多关于触发器”中介绍)。
这些指令被定义为简单触发器本身的**常量**(包括描述其行为的JavaDoc)。包括:

## Misfire Instruction Constants of SimpleTrigger

```java
MISFIRE_INSTRUCTION_IGNORE_MISFIRE_POLICY
MISFIRE_INSTRUCTION_FIRE_NOW
MISFIRE_INSTRUCTION_RESCHEDULE_NOW_WITH_EXISTING_REPEAT_COUNT
MISFIRE_INSTRUCTION_RESCHEDULE_NOW_WITH_REMAINING_REPEAT_COUNT
MISFIRE_INSTRUCTION_RESCHEDULE_NEXT_WITH_REMAINING_COUNT
MISFIRE_INSTRUCTION_RESCHEDULE_NEXT_WITH_EXISTING_COUNT
```

你应该回忆起早期的教训，所有的触发器都有触发器。MISFIRE_INSTRUCTION_SMART_POLICY指令可用，此指令也是所有触发器类型的默认指令。

如果使用“智能策略”(‘smart policy)指令，基于给定的SimpleTrigger实例的配置和状态，SimpleTrigger会在其各种错误指令之间进行动态选择。的 JavaDoc `SimpleTrigger.updateAfterMisfire()` 方法解释了这种动态行为的具体细节。

在构建 SimpleTrigger 时，您可以将misfire指令指定为简单调度的一部分(通过SimpleSchedulerBuilder):

```java
trigger = newTrigger()
    .withIdentity("trigger7", "group1")
    .withSchedule(simpleSchedule()
        .withIntervalInMinutes(5)
        .repeatForever()
        .withMisfireHandlingInstructionNextWithExistingCount())
    .build();
```

# 导航目录

> [导航目录](https://blog.csdn.net/ryo1060732496/article/details/79794802)

* any list
{:toc}