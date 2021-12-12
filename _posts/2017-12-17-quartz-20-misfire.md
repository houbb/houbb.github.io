---
layout: post
title:  Quartz 20-misfire 详解
date:  2017-12-19 14:43:25 +0800
categories: [Java]
tags: [java, quartz, job, sh]
published: true
---

# 一、前言

最近在学习Quartz，看到misfire这一部分，发现官方文档上讲解的很简单，没有看明白，然后去搜索了一下网上的讲解，发现讲的也都大同小异，也没有看明白，最后只能自己动手做测试，总结了一下。

这篇文章把自己总结的记录下来，方便自己以后回顾，同时也分享给大家，方便大家能快速理解Quartz的misfire策略。

misfire产生需要有2个前置条件，**一个是job到达触发时间时没有被执行，二是被执行的延迟时间超过了Quartz配置的misfireThreshold阀值**。

如果延迟执行的时间小于阀值，则Quartz不认为发生了misfire，立即执行job；如果延迟执行的时间大于或者等于阀值，则被判断为misfire，然后会按照指定的策略来执行。

例如：没有配置Quartz的misfireThreshold，此时使用Quartz的默认misfireThreshold配置为60秒（misfireThreshold是可以进行配置的），设置一个job在上午8点执行，由于一些原因job在8点没有执行，分为两种情况：

第一种情况是在8点00分50秒Quartz有资源来执行这个job，此时的延迟执行时间是50秒，小于misfireThreshold为60秒的阀值，则Quartz认为该job没有发生misfire，立即执行job。

第二种情况是在8点10分00秒Quartz有资源来执行这个job，此时延迟执行时间是600秒，大于misfireThreshold为60秒的阀值，则Quartz认为该job发生了misfire，会根据指定的misfire策略来执行。


# misfire产生的原因

我总结的产生misfire的原因有以下4点：

- 1、当job达到触发时间时，所有线程都被其他job占用，没有可用线程。

- 2、在job需要触发的时间点，scheduler停止了（可能是意外停止的）。

- 3、job 使用了 `@DisallowConcurrentExecution` 注解，job不能并发执行，当达到下一个job执行点的时候，上一个任务还没有完成。

- 4、job 指定了过去的开始执行时间，例如当前时间是8点00分00秒，指定开始时间为7点00分00秒。

# misfire策略

这里从SimpleTrigger和CronTrigger两个维度来说明。

注意：在不指定misfire策略的情况下，Quartz会使用默认的MISFIRE_INSTRUCTION_SMART_POLICY策略。

## SimpleTrigger

这里分为三种情况，第一是只执行一次的job，第二是固定次数执行的job，第三是无限次数执行的job。

为了方便快速产生misfire，设置misfireThreshold为1秒。

### 只执行一次的job

设置job只执行一次，开始时间设置设置为当前时间的前10秒，代码片段如下：

```java
JobDetail job = JobBuilder.newJob(MisfireJob.class)
        .withIdentity("job", "g1")
        .build();
Date next = DateUtils.addSeconds(new Date(), -10);

SimpleTrigger trigger = TriggerBuilder.newTrigger()
        .withIdentity("trigger", "g1")
        .startAt(next)
        .withSchedule(SimpleScheduleBuilder.simpleSchedule()
                .withMisfireHandlingInstructionFireNow()/*可以指定为任意一个可用的misfire策略*/)
        .build();
scheduler.scheduleJob(job, trigger);
```





# 参考资料

[Quartz misfire 详解](https://blog.csdn.net/chen888999/article/details/78575492)

* any list
{:toc}