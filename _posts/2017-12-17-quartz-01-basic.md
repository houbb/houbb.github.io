---
layout: post
title:  Quartz 01-quartz 入门使用介绍
date:  2017-12-19 14:43:25 +0800
categories: [Schedule]
tags: [java, quartz, job, schedule, sh]
published: true
---

# Quartz

[Quartz](http://www.quartz-scheduler.org/) 是一个功能丰富的开源作业调度库，可以集成到几乎任何 Java 应用程序中——从最小的独立应用程序到最大的电子商务系统。

# 入门案例

## maven 引入

```xml
<dependency>
    <groupId>org.quartz-scheduler</groupId>
    <artifactId>quartz</artifactId>
    <version>2.2.1</version>
</dependency>
```

## 建立 Task

```java
package com.ryo.quartz.hello.job;

import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;

public class MyJob implements Job {

    @Override
    public void execute(JobExecutionContext jobExecutionContext) throws JobExecutionException {
        System.err.println("Hello Quartz!");
    }

}
```

## 测试代码

```java
import com.ryo.quartz.hello.job.MyJob;
import org.quartz.*;
import org.quartz.impl.StdSchedulerFactory;

public class AppMain {

    public static void main(String[] args) throws SchedulerException {
        // define the job and tie it to our MyJob class
        JobDetail job = JobBuilder.newJob(MyJob.class)
                .withIdentity("job1", "group1")
                .build();

        // Trigger the job to run now, and then repeat every 5 seconds
        Trigger trigger = TriggerBuilder.newTrigger()
                .withIdentity("trigger1", "group1")
                .startNow()
                .withSchedule(SimpleScheduleBuilder.simpleSchedule()
                        .withIntervalInSeconds(5)
                        .repeatForever())
                .build();

        // Grab the Scheduler instance from the Factory
        Scheduler scheduler = StdSchedulerFactory.getDefaultScheduler();
        // and start it off
        scheduler.start();
        // Tell quartz to schedule the job using our trigger
        scheduler.scheduleJob(job, trigger);
    }
}
```

## 运行结果

每 5S 执行一次我们的 Job

```
SLF4J: Failed to load class "org.slf4j.impl.StaticLoggerBinder".
SLF4J: Defaulting to no-operation (NOP) logger implementation
SLF4J: See http://www.slf4j.org/codes.html#StaticLoggerBinder for further details.

Hello Quartz!
Hello Quartz!
Hello Quartz!
Hello Quartz!
```

# 拓展阅读

[Quartz 入门系列教程-00-序章](https://blog.csdn.net/ryo1060732496/article/details/79794802)

* any list
{:toc}