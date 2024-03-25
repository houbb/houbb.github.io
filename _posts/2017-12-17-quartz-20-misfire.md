---
layout: post
title:  Quartz 20-misfire 详解
date:  2017-12-19 14:43:25 +0800
categories: [Schedule]
tags: [java, quartz, job, schedule, sh]
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

假设job设定的执行时间是8点00分00秒，而当前时间是8点00分10秒，由于misfireThreshold设置为1秒，则发生了misfire。

各 misfire 策略如下：

```
命令	说明
MISFIRE_INSTRUCTION_SMART_POLICY--default	默认策略等同于MISFIRE_INSTRUCTION_FIRE_NOW。
MISFIRE_INSTRUCTION_IGNORE_MISFIRE_POLICY	Quartz不会判断job发生misfire，但是当Quartz有可用资源的时候，会尽可能早的执行所有发生misfire的任务，结果等同于MISFIRE_INSTRUCTION_FIRE_NOW。
withMisfireHandlingInstructionFireNow MISFIRE_INSTRUCTION_FIRE_NOW	立即执行job，即在8点00分10秒发现了misfire以后立即执行job。
withMisfireHandlingInstructionNowWithExistingCount MISFIRE_INSTRUCTION_RESCHEDULE_NOW_WITH_EXISTING_REPEAT_COUNT	等同于MISFIRE_INSTRUCTION_FIRE_NOW。
withMisfireHandlingInstructionNowWithRemainingCount MISFIRE_INSTRUCTION_RESCHEDULE_NOW_WITH_REMAINING_REPEAT_COUNT	等同于MISFIRE_INSTRUCTION_FIRE_NOW。
withMisfireHandlingInstructionNextWithExistingCount MISFIRE_INSTRUCTION_RESCHEDULE_NEXT_WITH_EXISTING_COUNT	不会执行job。此命令会等待下一次执行时间来执行job，但是只执行一次的job，在发生misfire以后没有下次的执行时间，因此使用此命令不会再执行job。
withMisfireHandlingInstructionNextWithRemainingCount MISFIRE_INSTRUCTION_RESCHEDULE_NEXT_WITH_REMAINING_COUNT	等同于MISFIRE_INSTRUCTION_RESCHEDULE_NEXT_WITH_EXISTING_COUNT。
```

### 固定次数执行的job

设置job开始执行时间是早上8点，执行间隔是1小时，执行次数是5次，那么job总的执行次数是6次（开始执行的一次以及后面执行的5次），则计划的执行时间是8:00，9:00,10:00,11:00,12:00,13:00，代码片段如下：

```java
JobDetail job = newJob(MisfireJob.class)
                .withIdentity("job1", "g1")
                .build();

SimpleTrigger trigger = newTrigger()
                .withIdentity("trigger1", "g1")
                .startAt(nextOne)
                .withSchedule(simpleSchedule()
                        .withIntervalInHours(1)
                        .withRepeatCount(5)
                        .withMisfireHandlingInstructionNowWithRemainingCount()/*可以指定为任意可用的策略*/)
                .build();
```

假设8:00的任务执行了，但是由于某些原因，scheduler没有执行9:00和10:00的任务，在10:15分的时候scheduler发现job有两次没有执行，这两次的延迟执行时间分别是1小时15分和15分，都大于设置的misfireThreshold=1秒，因此发生了两次misfire。

各 misfire 策略如下：

```
命令	说明
MISFIRE_INSTRUCTION_SMART_POLICY--default	默认执行策略，在固定次数执行的情况下，等同于MISFIRE_INSTRUCTION_RESCHEDULE_NOW_WITH_EXISTING_REPEAT_COUNT
MISFIRE_INSTRUCTION_IGNORE_MISFIRE_POLICY	Quartz不会判断发生misfire，在Quartz资源可用时会尽可能早的执行所有发生misfire的任务。例如：Quartz会在10:15执行9:00和10:00的任务，然后按照原计划继续执行剩下的任务。最后任务执行完成时间还是13:00。
withMisfireHandlingInstructionFireNow MISFIRE_INSTRUCTION_FIRE_NOW	等同于MISFIRE_INSTRUCTION_RESCHEDULE_NOW_WITH_REMAINING_REPEAT_COUNT。
withMisfireHandlingInstructionNowWithExistingCount MISFIRE_INSTRUCTION_RESCHEDULE_NOW_WITH_EXISTING_REPEAT_COUNT	立即执行第一个发生misfire的任务，并且修改startTime为当前时间，然后按照设定的间隔时间执行下一次任务，直到所有的任务执行完成，此命令不会遗漏任务的执行次数。 例如：10:15会立即执行9:00的任务，startTime修改为10:15，然后后续的任务执行时间为,11:15,12:15,13:15,14:15，也就是说任务完成时间延迟到了14:15，但是任务的执行次数还是总共的6次。
withMisfireHandlingInstructionNowWithRemainingCount MISFIRE_INSTRUCTION_RESCHEDULE_NOW_WITH_REMAINING_REPEAT_COUNT	立即执行第一个发生misfire的任务，并且修改startTime为当前时间，然后按照设定的间隔时间执行下一个任务，直到所有剩余任务执行完成，此命令会忽略已经发生misfire的任务（第一个misfire任务除外，因为会被立即执行），继续执行剩余的正常任务。 例如：10:15会立即执行9:00的任务，并且修改startTime为10:15，然后Quartz会忽略10:00发生的misfire的任务，然后后续的执行时间为：11:15,12:15,13:15，由于10:00的任务被忽略了，因此总的执行次数实际上是5次。
withMisfireHandlingInstructionNextWithExistingCount MISFIRE_INSTRUCTION_RESCHEDULE_NEXT_WITH_EXISTING_COUNT	不会立即执行任务，会等到下一次的计划执行时间开始执行，然后按照设定的间隔时间执行直到执行到计划的任务结束时间。
这个地方需要注意一下，不要被命令的名字所迷惑，第一眼印象可能觉得这个命令会把已经misfire的任务也执行了，而且好多博文也是这么讲解的，实际上并没有，我也是在自己测试的时候发现的，其实这个命令在发现存在misfire以后，后续并没有再执行发生misfire的任务，而是继续执行剩下的任务，直到结束时间，因此此命令与MISFIRE_INSTRUCTION_RESCHEDULE_NEXT_WITH_REMAINING_COUNT的执行结果相同，至于原因后面会讲。
例如：10:15发现9:00和10:00发生了misfire，并不会立即执行，由于原计划的下一次执行时间是11:00，因此Quartz会等到11:00执行任务，然后在原计划的13:00执行最后一个任务结束，因此实际上总的执行次数是4次。
withMisfireHandlingInstructionNextWithRemainingCount MISFIRE_INSTRUCTION_RESCHEDULE_NEXT_WITH_REMAINING_COUNT	不会立即执行任务，会等到下一次计划执行时间开始执行，忽略已经发生了misfire的任务，然后按照设定的间隔时间执行直到计划的任务结束时间。 例如：10:15发现9:00和10:00发生了misfire，并不会立即执行，忽略掉发生misfire的9:00和10:00的任务，按照计划在11:00执行任务，直到13:00执行最后一个任务结束，因此总的执行次数是4次。
```

### 无限次数执行的job

设定一个job开始执行时间是早上8点，执行间隔是1小时，无限执行次数，代码片段如下：

```java
JobDetail job = JobBuilder.newJob(MisfireJob.class)
                .withIdentity("job", "g")
                .build();
        SimpleTrigger trigger = TriggerBuilder.newTrigger()
                .withIdentity("trigger", "g")
                .startAt(next)
                .withSchedule(SimpleScheduleBuilder.simpleSchedule()
                        .withIntervalInHours(1)
                        .repeatForever())
                .build();
```

假设8:00的任务执行了，但是由于某些原因，scheduler没有执行9:00和10:00的任务，在10:15分的时候scheduler发现job有两次没有执行，这两次的延迟执行时间分别是1小时15分和15分，都大于设置的misfireThreshold=1秒，因此发生了两次misfire。

各misfire策略如下：

```
命令	说明
MISFIRE_INSTRUCTION_SMART_POLICY--default	等同于MISFIRE_INSTRUCTION_RESCHEDULE_NEXT_WITH_REMAINING_COUNT。
MISFIRE_INSTRUCTION_IGNORE_MISFIRE_POLICY	Quartz不会判断发生misfire，在Quartz资源可用时会尽可能早的执行所有发生misfire的任务。例如：Quartz会在10:15执行9:00和10:00的任务，然后按照原计划继续执行下去。
withMisfireHandlingInstructionFireNow MISFIRE_INSTRUCTION_FIRE_NOW	等同于MISFIRE_INSTRUCTION_RESCHEDULE_NOW_WITH_REMAINING_REPEAT_COUNT。
withMisfireHandlingInstructionNowWithExistingCount MISFIRE_INSTRUCTION_RESCHEDULE_NOW_WITH_EXISTING_REPEAT_COUNT	因为执行次数为无限次，所以等同于MISFIRE_INSTRUCTION_RESCHEDULE_NOW_WITH_REMAINING_REPEAT_COUNT。
withMisfireHandlingInstructionNowWithRemainingCount MISFIRE_INSTRUCTION_RESCHEDULE_NOW_WITH_REMAINING_REPEAT_COUNT	立即执行第一个发生misfire的任务，并且修改startTime为当前时间，然后按照设定的间隔时间执行下一个任务，一直执行下去，执行次数是无限的，但是计划的执行时间会被改变，因为此策略会修改startTime。 例如：10:15会立即执行9:00的任务，并且修改startTime为10:15，后续的执行时间被修改为了11:15，12:15，13:15以此类推。
withMisfireHandlingInstructionNextWithExistingCount MISFIRE_INSTRUCTION_RESCHEDULE_NEXT_WITH_EXISTING_COUNT	等同于MISFIRE_INSTRUCTION_RESCHEDULE_NEXT_WITH_REMAINING_COUNT。
withMisfireHandlingInstructionNextWithRemainingCount MISFIRE_INSTRUCTION_RESCHEDULE_NEXT_WITH_REMAINING_COUNT	不会立即执行任务，会等到下一次计划执行时间开始执行，忽略已经发生了misfire的任务，然后按照原计划执行时间继续执行下去。实际上就相当于不管有没有发生misfire，就按照原计划继续执行下去。 例如：10:15发现9:00和10:00发生了misfire，并不会立即执行，忽略掉发生misfire的9:00和10:00的任务，按照计划在11:00执行任务，然后一直按照原计划执行下去。
```

## 几个重要策略实现原理

先讲解一下SimpleTrigger中几个比较重要的属性：

1、startTime：SimpleTrigger的开始执行时间。

2、endTime：SimpleTrigger的结束执行时间，可以不指定。

3、repeatCount：重复执行的次数，如果指定为无限次数，则此值被设置为-1。

4、repeatInterval：执行的时间间隔。

5、finalFireTime：SimpleTrigger的最后触发时间，这个属性很重要，下面讲解的几个策略都跟这个属性有关。

finalFireTime的计算方法：

1、repeatCount=0，则finalFireTime等于startTime。

2、repeatCount为无限次数即-1，则先判断是否存在endTime，如果不存在则finalFireTime为null。如果存在endiTime，则会根据starTime和repeatInterval计算小于或者等于endiTime的最后一次触发时间，此时间作为finalFireTime。

3、repeatCount为固定次数，则finalFireTime=startTime+(repeatCount*repeatInterval)，计算结果与endTime比较，如果比endTime小，则直接返回，否则会根据starTime和repeatInterval计算小于或者等于endTime的最后一次触发时间并返回。

下面开始讲解NowWithExisting、NowWithRemaining、NextWithExisting、NextWithRemainng这四个策略的实现原理，这四个实现策略都与finalFireTime有关，为了方便理解，还是使用上诉的固定次数例子来进行讲解，8点00分开始执行，执行间隔是1小时，执行次数是5次，计划执行时间是：8:00,9:00,10:00,11:00,12:00,13:00。8:00正常执行，在10:15发现了9:00和10:00的任务发生了misfire。

1、MISFIRE_INSTRUCTION_RESCHEDULE_NOW_WITH_EXISTING_REPEAT_COUNT：在10:15分立即执行9:00任务，然后修改starTime为10:15，并且会修改repeatCount为4（原计划中10:00,11:00,12:00,13:00这4个任务），因此计算的finalFireTime为10:15 + (1 * 4) = 14:15，所以最后一次执行时间为14:15，与上诉讲解吻合。

2、MISFIRE_INSTRUCTION_RESCHEDULE_NOW_WITH_REMAINING_REPEAT_COUNT：在10:15分立即执行9:00任务，然后修改starTime为10:15，并且会修改repeatCount为3（原计划中11:00,12:00，13:00,10:00的任务会被忽略掉），因此计算的finalFireTime为10:15 + (1 * 3) = 13:15，所以最后一次执行时间为13:15，与上诉讲解吻合。

3、MISFIRE_INSTRUCTION_RESCHEDULE_NEXT_WITH_EXISTING_COUNT：在10:15分不会执行job，等待下一次执行计划，即在11:00执行任务。这个策略不会修改starTime，也不会修改repeatCount，因此finalFireTime并没有改变，从当前时间到finalFireTime还是剩余原计划中的执行次数。所以说这个策略与MISFIRE_INSTRUCTION_RESCHEDULE_NEXT_WITH_REMAINING_COUNT相同，即使发生了misfire也还是按照原计划来执行。

4、MISFIRE_INSTRUCTION_RESCHEDULE_NEXT_WITH_REMAINING_COUNT：在10:15分不会执行job，等待下一次执行计划，即在11:00执行任务。这个策略不会修改starTime，也不会修改repeatCount，因此finalFireTime并没有改变，忽略misfire任务，按照原计划继续执行下去。

## 几个重要策略的理解

`now*` 相关的策略，会立即执行第一个misfire的任务，同时会修改startTime和repeatCount，因此会重新计算finalFireTime，原计划执行时间会被打乱。

`next*` 相关的策略，不会立即执行misfire的任务，也不会修改startTime和repeatCount，因此finalFireTime也没有改变，发生了misfire也还是按照原计划进行执行。

# CronTrigger

设定一个job，开始时间为早上8:00，每一个小时执行一次job，代码片段如下：

```java
CronTrigger trigger = TriggerBuilder.newTrigger()
        .withIdentity("trigger", "g")
        .startAt(next)
        .withSchedule(CronScheduleBuilder.cronSchedule("0 0 0/1 * * ?"))
        .build();
```

假设8:00的任务执行了，但是由于某些原因，scheduler没有执行9:00和10:00的任务，在10:15分的时候scheduler发现job有两次没有执行，这两次的延迟执行时间分别是1小时15分和15分，都大于设置的misfireThreshold=1秒，因此发生了两次misfire。

各misfire策略如下：

```
命令	说明
MISFIRE_INSTRUCTION_SMART_POLICY--default	等同于MISFIRE_INSTRUCTION_FIRE_ONCE_NOW。
MISFIRE_INSTRUCTION_IGNORE_MISFIRE_POLICY	Quartz不会判断发生了misfire，立即执行所有发生了misfire的任务，然后按照原计划进行执行。 例如：10:15分立即执行9:00和10:00的任务，然后等待下一个任务在11:00执行，后续按照原计划执行。
withMisfireHandlingInstructionFireAndProceed MISFIRE_INSTRUCTION_FIRE_ONCE_NOW	立即执行第一个发生misfire的任务，忽略其他发生misfire的任务，然后按照原计划继续执行。 例如：在10:15立即执行9:00任务，忽略10:00任务，然后等待下一个任务在11:00执行，后续按照原计划执行。
withMisfireHandlingInstructionDoNothing MISFIRE_INSTRUCTION_DO_NOTHING	所有发生misfire的任务都被忽略，只是按照原计划继续执行。
```

# 个人理解

其实可以简化为两个场景：

（1）misFire 和正常保持一致执行。

（2）misFire 时，忽略执行任务，放到下一次执行。

## 如何判断 MisFire

执行的时候，和当前时间对比。

如果超过 60S（可配置），则认为时 mis-fire

## 实现

1. MisFire 对应的策略

2. MisFire 对应的监听器



# 参考资料

[Quartz misfire 详解](https://blog.csdn.net/chen888999/article/details/78575492)

* any list
{:toc}