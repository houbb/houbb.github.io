---
layout: post
title: schedule-07-任务调度 jobrunr 介绍
date: 2024-01-10 21:01:55 +0800
categories: [Schedule]
tags: [schedule, apache, distribued, work-flow, sh]
published: true
---

## 概览

```java
BackgroundJob.enqueue(() -> System.out.println("这是在分布式任务中所需的一切！"));
```

通过仅使用 *Java 8 lambda*，在**Java应用程序**中执行**fire-and-forget**、**延迟**、**定时**和**循环任务**的非常简单的方式。

支持CPU和I/O密集型、长时间运行和短时间运行的任务。持久存储可以通过关系型数据库（如Postgres、MariaDB/MySQL、Oracle、SQL Server、DB2和SQLite）或NoSQL（ElasticSearch、MongoDB和Redis）完成。

JobRunr提供了一种**可靠方式**处理后台任务并在JVM实例内共享主机、专用主机或云中（[你好，Kubernetes](https://www.jobrunr.io/en/blog/2020-05-06-jobrunr-kubrnetes-terraform/)）运行它们的统一编程模型。

## 反馈

> 感谢构建JobRunr，我很喜欢它！在使用之前，我在Ruby和Golang中使用了类似的库，到目前为止，JobRunr是使用最愉快的一个。我特别喜欢仪表板，它太棒了！[Alex Denisov](https://www.linkedin.com/in/alex-denisov-a29bab2a/)

在 [jobrunr.io](https://www.jobrunr.io/en/#why-jobrunr) 上查看更多反馈。

## 特点

- 简单：只需使用Java 8 lambda创建后台作业。
- 分布式和集群友好：通过使用乐观锁定保证单个调度程序实例执行。
- 持久性作业：使用关系型数据库（四个表和一个视图）或NoSQL数据存储。
- 可嵌入：设计用于嵌入现有应用程序中。
- 依赖最小：（[ASM](https://asm.ow2.io/)、slf4j和[jackson](https://github.com/FasterXML/jackson)和jackson-datatype-jsr310，[gson](https://github.com/google/gson)或符合JSON-B的库）。

## 使用场景

一些可能适用的场景：
- 在REST API中立即返回客户端响应并在后台执行长时间运行的任务
- 大规模通知/新闻通讯
- 工资计算和生成结果文档
- 从xml、csv或json进行批量导入
- 创建归档
- 触发Web钩子
- 图片/视频处理
- 清理临时文件
- 定期自动报告
- 数据库维护
- 在数据更改后更新elasticsearch/solr
- *...等等*

您可以从小处着手，在Web应用程序中处理作业，或者横向扩展并添加尽可能多的后台作业服务器以处理峰值作业。JobRunr将为您在所有服务器上分发负载。JobRunr还具有容错性 - 外部Web服务宕机？别担心，作业将自动重试10次，并采用智能回退策略。

JobRunr是 [HangFire](https://github.com/HangfireIO/Hangfire)、[Resque](https://github.com/resque/resque)、[Sidekiq](http://sidekiq.org)、[delayed_job](https://github.com/collectiveidea/delayed_job)、[Celery](https://github.com/celery/celery) 的Java替代品，并类似于[Quartz](https://github.com/quartz-scheduler/quartz)和[Spring Task Scheduler](https://github.com/spring-guides/gs-scheduling-tasks)。

## 屏幕截图

-----------

![m1](https://user-images.githubusercontent.com/567842/80217070-60019700-863f-11ea-9f02-d62c77e97a1c.png)

![m2](https://user-images.githubusercontent.com/567842/80217075-609a2d80-863f-11ea-8994-cd0ca16b31c4.png)

![m3](https://user-images.githubusercontent.com/567842/80217067-5f690080-863f-11ea-9d41-3e2878ae7ac8.png)

![m4](https://user-images.githubusercontent.com/567842/80217063-5ed06a00-863f-11ea-847b-3ed829fd5503.png)

![m5](https://user-images.githubusercontent.com/567842/80217079-6132c400-863f-11ea-9789-8633897ef317.png)

![m6](https://user-images.githubusercontent.com/567842/80217078-609a2d80-863f-11ea-9b49-c891985de924.png)

## 使用

[**Fire-and-forget任务**](https://www.jobrunr.io/en/documentation/background-methods/enqueueing-jobs/)

专用工作池线程尽快执行排队的后台作业，缩短请求的处理时间。

```java
BackgroundJob.enqueue(() -> System.out.println("简单！"));
```

[**延迟任务**](https://www.jobrunr.io/en/documentation/background-methods/scheduling-jobs/)

仅在给定时间段后执行计划的后台作业。

```java
BackgroundJob.schedule(Instant.now().plusHours(5), () -> System.out.println("可靠！"));
```

[**循环任务**](https://www.jobrunr.io/en/documentation/background-methods/recurring-jobs/)

执行循环任务从未如此简单；只需调用以下方法，使用[CRON表达式](http://en.wikipedia.org/wiki/Cron#CRON_expression)执行任何类型的循环任务。

```java
Background

Job.scheduleRecurrently("my-recurring-job", Cron.daily(), () -> service.doWork());
```

**在Web应用程序内处理后台任务...**

您可以在任何Web应用程序中处理后台任务，我们对[Spring](https://spring.io/)提供全面的支持 - JobRunr可靠地在Web应用程序中处理后台作业。

**...或者在任何其他地方**

比如Spring控制台应用程序，包装在永远运行并轮询新后台作业的Docker容器中。

请参阅 [https://www.jobrunr.io](https://www.jobrunr.io) 获取更多信息。

# 参考资料

https://github.com/jobrunr/jobrunr

* any list
{:toc}