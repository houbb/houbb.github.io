---
layout: post
title:  Quartz 08-CronTrigger
date:  2017-12-19 14:43:25 +0800
categories: [Schedule]
tags: [java, quartz, job, schedule, sh]
published: true
---

# CronTrigger

CronTrigger 通常比 SimpleTrigger 更有用，如果您需要根据日历类的概念而不是精确指定的简单触发器间隔来重新定义作业调度。

有了CronTrigger，你可以指定诸如“每个周五中午”，或“每个工作日和上午9:30”，甚至“每星期一、星期三和周五上午9:00到10:00之间的每5分钟”。

即使是这样，像SimpleTrigger一样，CronTrigger有一个startTime，它指定调度何时生效，以及一个(可选的)endTime，指定何时停止调度。

# Cron 表达式

cron 表达式用于配置 CronTrigger 的实例。cron 表达式是由七个子表达式组成的字符串，它们描述了日程的各个细节。这些子表达式与空白区分开，并表示:

```
Seconds
Minutes
Hours
Day-of-Month
Month
Day-of-Week
Year (optional field)
```

一个完整的cron表达式的例子是字符串“0 0 12 ?”-意思是“每周三12:00 pm”。

单个子表达式可以包含范围和/或列表。例如，前一个星期的字段(读“WED”)可以替换为“周一-周五”、“MON、WED、FRI”，甚至“MON-WED,SAT”。

- Wild-cards

Wild-cards(“字符”)可以用来表示这个字段的“每一个”可能值。因此，上一个例子的“月”字段的“字符”只是表示“每个月”。因此，“*”在一周的工作日中显然意味着“每周的每一天”。

所有字段都有一组可以指定的有效值。这些值应该是相当明显的——例如，0到59的秒数和分钟数，以及数小时内0到23的值。一个月的天数可以是1-31，但是你需要注意一个月里有多少天!个月可以指定值0到11之间,或通过使用字符串1月,2月,3月,4月,5月,6月,7月,8月,9月,10月,11月和12月Days-of-Week之间可以指定值1和7(1 =周日)或通过使用字符串的太阳,星期一,星期二,星期三,星期四,星期五,坐。

- `/`

“/” 字符可以用来指定值的增量。例如，如果你把“0/15”放在分钟字段中，它的意思是“每小时15分钟，从0分钟开始”。如果你在分钟字段中使用“3/20”，它将意味着“每小时20分钟，从3分钟开始”——或者换句话说，它与分钟字段中的“3、23、43”是一样的。注意，“/35”并不意味着“每35分钟”——意思是“每小时35分钟，从0分钟开始”——或者换句话说，就是指定“0,35”。

- `?`

“?“ 是允许在一个月和一个星期的区间内。”它用于指定“没有特定值”。当您需要在两个字段中的一个中指定某个值时，这是有用的，但不是另一个字段中指定的。请参见下面的示例(以及CronTrigger JavaDoc)来进行说明。

- `L` 
“L” 字符是允许在一个月和一个星期的字段。这个字符是“last”的缩写，但在两个字段中都有不同的含义。例如，“L”在“月”字段中的值表示“月的最后一天”，即1月31日，2月28日为非闰年。如果是在一周内单独使用，它的意思是“7”或“SAT”。但是，如果在一个又一个值的工作日内使用，它的意思是“一个月的最后一个xxx日”，例如“6L”或“FRIL”，这两个词都表示“一个月的最后一个星期五”。您还可以指定一个月最后一天的偏移量，比如“L-3”，这将意味着日历月的第三天到最后一天。当使用“L”选项时，重要的是不要指定列表或值的范围，因为您将会遇到令人困惑的/意外的结果。

- `W`
“W” 用于指定最近的工作日(星期一至星期五)。举个例子，如果你将“15W”指定为“月”字段的值，那么它的意思是:“最近的工作日到每月的15号”。

- `#`

“#” 用于指定月份的“第n个工作日”。例如，“6#3”或“周五3”的价值意味着“一个月的第三个周五”。

下面是几个例子的表达式及其含义——你可以找到更加 `org.quartz.CronExpression` 的 JavaDoc

# Cron 表达式案例

- 创建触发器的表达式，每5分钟触发一次。

“0 0/5 * * * ?”

- 一种表示每5分钟触发一次触发，在分钟后10秒(即10:00:10 am, 10:05:10 am，等等)。

“10 0/5 * * * ?”

- 在每周三和周五，在10:30、11:30、12:30和13:30触发一个触发器。

“0 30 10-13 ? * WED,FRI”

- 在每个月的5号和20号之间，每隔半小时就会触发一个触发器，每半小时触发一次。注意，触发点不会在上午10点发生，只是在8:00、8:30、9:00和9:30。

“0 0/30 8-9 5,20 * ?”

请注意，有些调度要求过于复杂，无法用单个触发器来表示——比如“早上9点到10点之间每5分钟，下午1点到10点之间的每20分钟”。此场景中的解决方案是简单地创建两个触发器，并将它们注册为运行相同的作业。

# Building CronTriggers

CronTrigger 实例是使用 TriggerBuilder(用于触发器的主要属性)和 CronScheduleBuilder (用于CronTrigger-specific属性)构建的。要在dsl风格中使用这些构建器，请使用静态导入:

```java
import static org.quartz.TriggerBuilder.*;
import static org.quartz.CronScheduleBuilder.*;
import static org.quartz.DateBuilder.*:
```

- 每隔一分钟，每天早上8点到下午5点之间，建立一个触发点。

```java
trigger = newTrigger()
    .withIdentity("trigger3", "group1")
    .withSchedule(cronSchedule("0 0/2 8-17 * * ?"))
    .forJob("myJob", "group1")
    .build();
```

- 建立一个每天早上10:42的触发点:

```java
trigger = newTrigger()
    .withIdentity("trigger3", "group1")
    .withSchedule(dailyAtHourAndMinute(10, 42))
    .forJob(myJobKey)
    .build();
```

or 

```java
trigger = newTrigger()
    .withIdentity("trigger3", "group1")
    .withSchedule(cronSchedule("0 42 10 * * ?"))
    .forJob(myJobKey)
    .build();
```

- 建立一个触发器，在周三上午10:42，在系统默认的时间范围内触发。

```java
trigger = newTrigger()
    .withIdentity("trigger3", "group1")
    .withSchedule(weeklyOnDayAndHourAndMinute(DateBuilder.WEDNESDAY, 10, 42))
    .forJob(myJobKey)
    .inTimeZone(TimeZone.getTimeZone("America/Los_Angeles"))
    .build();
```

or

```java
trigger = newTrigger()
    .withIdentity("trigger3", "group1")
    .withSchedule(cronSchedule("0 42 10 ? * WED"))
    .inTimeZone(TimeZone.getTimeZone("America/Los_Angeles"))
    .forJob(myJobKey)
    .build();
```

# CronTrigger 失败说明

下面的说明可以用来告诉 Quartz 在 CronTrigger 发生 MisFire 时应该做什么。(在本教程的触发器部分中引入了错误的情况)。

这些指令被定义为CronTrigger本身的常量(包括描述其行为的JavaDoc)。说明书包括:

- Misfire Instruction Constants of CronTrigger

```
MISFIRE_INSTRUCTION_IGNORE_MISFIRE_POLICY
MISFIRE_INSTRUCTION_DO_NOTHING
MISFIRE_INSTRUCTION_FIRE_NOW
```

所有的触发器都有触发器。`MISFIRE_INSTRUCTION_SMART_POLICY` 指令可用，此指令也是所有触发器类型的默认指令。

“智能策略”指令由 CronTrigger 解释为 `MISFIRE_INSTRUCTION_FIRE_NOW` 的 JavaDoc `CronTrigger.updateAfterMisfire()` 方法解释这种行为的具体细节。

在构建 CronTrigger 时，您可以将 misfire 指令指定为简单调度的一部分(通过cronschedule erbuilder):

```java
trigger = newTrigger()
    .withIdentity("trigger3", "group1")
    .withSchedule(cronSchedule("0 0/2 8-17 * * ?")
        ..withMisfireHandlingInstructionFireAndProceed())
    .forJob("myJob", "group1")
    .build();
```

# 导航目录

> [导航目录](https://blog.csdn.net/ryo1060732496/article/details/79794802)

* any list
{:toc}