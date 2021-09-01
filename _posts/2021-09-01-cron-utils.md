---
layout: post
title: cron-utils 用于解析、验证和人类可读描述以及日期/时间互操作性的 Cron 实用程序。
date: 2021-09-01 21:01:55 +0800
categories: [java]
tags: [java, sh]
published: true
---

# cron-utils

我们定义 cron。 

并支持他们。

cron-utils 是一个 Java 库，用于定义、解析、验证、迁移 cron 以及为它们获取人类可读的描述。 

该项目遵循语义版本控制约定，提供 OSGi 元数据并使用 Apache 2.0 许可。

## 特征

创建任意的 cron 表达式：您可以定义自己的 cron 格式！支持的字段有：秒、分、小时、月中的某天、月份、星期几、年。

您可以将最后一个字段标记为可选！

支持所有 cron 特殊字符： * / , -

非标准字符 L、W、LW、'?'和 # 也支持！

打印到语言环境特定的人类可读格式（完全支持中文、英语、德语、希腊语、印度尼西亚语、韩语、波兰语、西班牙语、斯瓦希里语和土耳其语。荷兰语、法语、意大利语、葡萄牙语和俄语有基本支持）。

解析和描述过程是解耦的：解析一次，结果操作！

使用 CronBuilder 构建 cron 表达式：

无需记住每个 cron 提供程序的字段和约束

cron 与 cron 提供程序分离：任何时候您都可以导出为另一种格式。

检查 cron 表达式是否等效

将多个 cron 表达式压缩成一个！

验证 cron 字符串表达式是否与 cron 定义匹配

在不同的 cron 定义之间转换 cron：如果您需要迁移表达式，CronMapper 可能会帮助您！

提供了以下 cron 库的预定义定义：

Unix
Cron4j
Quartz
Spring

获取上次/下一次执行时间以及从上次执行/时间到下一次执行的时间。

考虑不同的周末政策和假期，获取两个日期之间的工作日计数。

需要在不同的 cron/time 库之间映射常量？使用常量映射器。

    

# 快速开始

## maven 引入

```xml
<dependency>
    <groupId>com.cronutils</groupId>
    <artifactId>cron-utils</artifactId>
    <version>9.1.5</version>
</dependency>
```

## 例子

### 构建 cron 定义

```java
// Define your own cron: arbitrary fields are allowed and last field can be optional
CronDefinition cronDefinition =
    CronDefinitionBuilder.defineCron()
        .withSeconds().and()
        .withMinutes().and()
        .withHours().and()
        .withDayOfMonth()
            .supportsHash().supportsL().supportsW().and()
        .withMonth().and()
        .withDayOfWeek()
            .withIntMapping(7, 0) //we support non-standard non-zero-based numbers!
            .supportsHash().supportsL().supportsW().and()
        .withYear().optional().and()
        .instance();

// or get a predefined instance
cronDefinition = CronDefinitionBuilder.instanceDefinitionFor(QUARTZ);
```

### Build a cron expression

```java
// Create a cron expression. CronMigrator will ensure you remain cron provider agnostic
import static com.cronutils.model.field.expression.FieldExpressionFactory.*;

Cron cron = CronBuilder.cron(CronDefinitionBuilder.instanceDefinitionFor(CronType.QUARTZ))
    .withYear(always())
    .withDoM(between(SpecialChar.L, 3))
    .withMonth(always())
    .withDoW(questionMark())
    .withHour(always())
    .withMinute(always())
    .withSecond(on(0))
    .instance();
// Obtain the string expression
String cronAsString = cron.asString(); // 0 * * L-3 * ? *
```

### Parse

```java
// Create a parser based on provided definition
CronParser parser = new CronParser(cronDefinition);
Cron quartzCron = parser.parse("0 23 * ? * 1-5 *");
```

... even multi-cron expressions! How about squashing multiple crons into a single line? 

Instead of writing 0 0 9 * * ? *, 0 0 10 * * ? *, 0 30 11 * * ? * and 0 0 12 * * ? * we can wrap it into 0 0|0|30|0 9|10|11|12 * * ? *

### 描述

```java
// Create a descriptor for a specific Locale
CronDescriptor descriptor = CronDescriptor.instance(Locale.UK);

// Parse some expression and ask descriptor for description
String description = descriptor.describe(parser.parse("*/45 * * * * ?"));
// Description will be: "every 45 seconds"

description = descriptor.describe(quartzCron);
// Description will be: "every hour at minute 23 every day between Monday and Friday"
// which is the same description we get for the cron below:
descriptor.describe(parser.parse("0 23 * ? * MON-FRI *"));
```

### Migrate

```java
// Migration between cron libraries has never been so easy!
// Turn cron expressions into another format by using CronMapper:
CronMapper cronMapper = CronMapper.fromQuartzToCron4j();

Cron cron4jCron = cronMapper.map(quartzCron);
// and to get a String representation of it, we can use
cron4jCron.asString();//will return: 23 * * * 1-5
```

### Validate

```java
cron4jCron.validate()
```

### Calculate time from/to execution

```java
// Get date for last execution
ZonedDateTime now = ZonedDateTime.now();
ExecutionTime executionTime = ExecutionTime.forCron(parser.parse("* * * * * ? *"));
ZonedDateTime lastExecution = executionTime.lastExecution(now);

// Get date for next execution
ZonedDateTime nextExecution = executionTime.nextExecution(now);

// Time from last execution
Duration timeFromLastExecution = executionTime.timeFromLastExecution(now);

// Time to next execution
Duration timeToNextExecution = executionTime.timeToNextExecution(now);
```

### Map constants between libraries

```java
// Map day of week value from Quartz to JodaTime
int jodatimeDayOfWeek =
        ConstantsMapper.weekDayMapping(
                ConstantsMapper.QUARTZ_WEEK_DAY,
                ConstantsMapper.JODATIME_WEEK_DAY
        );
```

### Date and time formatting for humans!

使用 htime - 人类可读的 Java 日期时间格式！ 

尽管此功能未捆绑在同一个 jar 中，但您可能会发现一个 cron-utils 项目很有用。

```java
// You no longer need to remember "YYYY-MM-dd KK a" patterns.
DateTimeFormatter formatter = 
	    HDateTimeFormatBuilder
		    .getInstance()
		    .forJodaTime()
		    .getFormatter(Locale.US)
		    .forPattern("June 9, 2011");
String formattedDateTime = formatter.print(lastExecution);
// formattedDateTime will be lastExecution in "dayOfWeek, Month day, Year" format
```

# 参考资料

https://github.com/jmrozanec/cron-utils

* any list
{:toc}