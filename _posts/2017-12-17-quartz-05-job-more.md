---
layout: post
title:  Quartz 05-Jobs 深入学习
date:  2017-12-19 14:43:25 +0800
categories: [Schedule]
tags: [java, quartz, job, schedule, sh]
published: true
---

# More About Jobs and Job Details

虽然您实现的作业类具有知道如何完成特定类型作业的实际工作的代码，但 Quartz 需要了解您可能希望该作业的实例拥有的各种属性。

这是通过JobDetail 类完成的，该类在前一节中简要介绍过。

JobDetail 实例是使用 JobBuilder 类构建的。

您通常希望使用所有方法的静态导入，以便在代码中有 dsl-feel。

```java
import static org.quartz.JobBuilder.*;
```

## 代码回顾

开始之前让我们回顾下原来的代码：

```java
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
```

## JobDetail 的生命周期

请注意，我们给调度程序提供了一个 JobDetail 实例，并且它知道在构建 JobDetail 时只需提供作业的类就可以执行的工作类型。

调度程序执行任务时，每个(以及每个)时间都在调用它的 `execute(..)` 方法之前创建一个类的新实例。

当执行完成时，对作业类实例的引用被删除，然后实例被垃圾收集。

这种行为的一个分支是，作业必须有一个**无参数的构造函数**(当使用默认的JobFactory实现时)。

另一个分支是，在作业类上定义状态数据字段是没有意义的，因为它们的值不会在作业执行之间保留。

- 我如何为一个作业实例提供属性/配置? & 我如何在执行过程中记录工作状态?

这些问题的答案是一样的:关键是 JobDataMap，它是 JobDetail 对象的一部分。

# JobDataMap

JobDataMap 可以用来保存任何数量(**可序列化**)的数据对象，您希望在它执行时将它们提供给作业实例。

JobDataMap 是 Java Map 接口的一个实现，它提供了一些用于存储和检索原始类型数据的便利方法。

## 设置和获取

这里有一些快速的片段，可以将数据输入 JobDataMap，同时定义/构建 JobDetail，然后将作业添加到调度器:

```java
// define the job and tie it to our DumbJob class
JobDetail job = newJob(DumbJob.class)
    .withIdentity("myJob", "group1") // name "myJob", group "group1"
    .usingJobData("jobSays", "Hello World!")
    .usingJobData("myFloatValue", 3.141f)
    .build();
```

执行时我们可以将这些数据拿到，方式如下：

```java
public class DumbJob implements Job {

    public DumbJob() {
    }

    public void execute(JobExecutionContext context)
      throws JobExecutionException {
      JobKey key = context.getJobDetail().getKey();

      JobDataMap dataMap = context.getJobDetail().getJobDataMap();

      String jobSays = dataMap.getString("jobSays");
      float myFloatValue = dataMap.getFloat("myFloatValue");

      System.out.println("Instance " + key + " of DumbJob says: " + jobSays + ", and val is: " + myFloatValue);
    }
  }
```

## MergedJobDataMap

如果您使用持久的 JobStore(在本教程的JobStore部分中讨论)，您应该在确定JobDataMap中的位置时使用一些谨慎，因为它中的对象将被序列化，因此它们容易出现类版本问题。

显然，标准的Java类型应该是非常安全的，但是除此之外，任何时候如果有人更改了您已经序列化实例的类的定义，就必须注意不要破坏兼容性。您可以选择将 JDBC-JobStore 和 JobDataMap 放到一个模式中，其中只有原语和字符串被允许存储在映射中，从而消除了以后序列化问题的可能。


如果你添加 setter 方法工作类,对应键的名字 JobDataMap(如setJobSays数据(字符串val)方法在上面的示例中),然后 Quartz 默认 JobFactory 实现将自动调用这些 setter 当工作被实例化,从而防止需要显式地获得值的 map 在你的执行方法。


触发器还可以有与之关联的 JobDataMaps。如果您有一个在调度器中存储的作业，它可以通过多个触发器定期/重复地使用，但是每个独立触发，您想要提供不同数据输入的作业，这一点很有用。


在作业执行期间在 JobExecutionContext 中找到的 JobDataMap 是很方便。它是 JobDataMap 中找到的 JobDataMap 的合并，以及在触发器中找到的，后者的值在前者中重写任何相同的值。


下面是在作业执行过程中获取 JobExecutionContext 的合并 JobDataMap 数据的一个简单示例:

```java
public class DumbJob implements Job {

    public DumbJob() {
    }

    public void execute(JobExecutionContext context)
        throws JobExecutionException
    {
        JobKey key = context.getJobDetail().getKey();

        // Note the difference from the previous example
        JobDataMap dataMap = context.getMergedJobDataMap();  

        String jobSays = dataMap.getString("jobSays");
        float myFloatValue = dataMap.getFloat("myFloatValue");
        ArrayList state = (ArrayList)dataMap.get("myStateData");
        state.add(new Date());

        System.err.println("Instance " + key + " of DumbJob says: " + jobSays + ", and val is: " + myFloatValue);
    }
}
```

依赖于 JobFactory 注入的方式如下：

```java
public class DumbJob implements Job {

    String jobSays;
    float myFloatValue;
    ArrayList state;

    public DumbJob() {
    }

    public void execute(JobExecutionContext context)
      throws JobExecutionException
    {
      JobKey key = context.getJobDetail().getKey();

      JobDataMap dataMap = context.getMergedJobDataMap();  // Note the difference from the previous example

      state.add(new Date());

      System.err.println("Instance " + key + " of DumbJob says: " + jobSays + ", and val is: " + myFloatValue);
    }

    public void setJobSays(String jobSays) {
      this.jobSays = jobSays;
    }

    public void setMyFloatValue(float myFloatValue) {
      myFloatValue = myFloatValue;
    }

    public void setState(ArrayList state) {
      state = state;
    }

}
```

这样代码看起来变多了（实际上 setter 方法都是 IDE自动生成的），但是 `execute()` 可以变得非常简洁。

# Job Instances

许多用户花时间搞清楚到底是什么构成了“工作实例”(Job Instances)。我们将在这里和下面的章节中明确说明工作状态和并发性。

您可以创建一个作业类，并通过创建多个 JobDetails 实例(每个实例都有自己的属性和 JobDataMap )并将它们全部添加到调度器中，从而在调度器中存储许多“实例定义”。

例如，您可以创建一个实现名为 “SalesReportJob” 的作业接口的类。该作业可能被编码为期望发送给它的参数(通过 JobDataMap )来指定销售报告应该基于的销售人员的名称。然后，他们可能会创建工作的多个定义( JobDetails )，
例如 “SalesReportForJoe” 和 “SalesReportForMike”，它们在相应的 JobDataMaps 中指定了 “joe” 和 “mike”，作为各自工作的输入。

当触发器触发时，JobDetail(实例定义)将被加载，并且它引用的作业类通过调度程序中配置的JobFactory实例化。默认的JobFactory只调用作业类上的 `newInstance()`，然后尝试在类上调用 `setter` 方法来匹配JobDataMap中的密钥名。您可能希望创建自己的JobFactory实现来完成一些事情，比如让应用程序的IoC或DI容器生成/初始化作业实例。

在“Quartz speak”中，我们将每个存储的JobDetail引用为“作业定义”或“JobDetail实例”，我们将每个执行任务称为“作业实例”或“作业定义的实例”。通常，如果我们只使用“job”这个词，我们指的是一个命名的定义，或者JobDetail。当我们引用实现作业接口的类时，通常使用“作业类”这个术语。

# Job State and Concurrency

现在，关于作业的状态数据(即JobDataMap)和并发性的一些附加说明。有一些注释可以添加到您的作业类中，这些注释会影响Quartz在这些方面的行为。

- @DisallowConcurrentExecution

@DisallowConcurrentExecution 是一个注释,可以添加到工作类,告诉 Quartz 不要执行一个给定的工作定义的多个实例(指的是给定的工作类)。

注意那里的措辞，因为它是精心挑选的。在前一节的示例中，如果“SalesReportJob”有这个注释，那么“SalesReportForJoe”的一个实例可以在给定的时间执行，但是它可以同时执行“SalesReportForMike”的实例。约束基于实例定义(JobDetail)，而不是作业类的实例。然而，决定(在Quartz的设计过程中)将注释进行到类本身，因为它常常对类的编码方式产生影响。

- @PersistJobDataAfterExecution

@PersistJobDataAfterExecution 是一个注释,可以添加到工作类告诉 Quartz 更新存储复制JobDetail JobDataMap的 `execute()` 方法成功完成后(没有抛出异常),这样下一个执行同样的工作(JobDetail)收到更新后的值而不是原先存储的值。像@DisallowConcurrentExecution注释,这适用于工作定义实例,类实例不是一份工作,虽然这是决定工作类的属性,因为它经常改变类是如何编码的(例如,“有状态性”需要显式地“理解”的代码在执行方法)。


如果你使用 `@PersistJobDataAfterExecution` 注释,您还应该考虑使用 `@DisallowConcurrentExecution` 注释，以避免可能的混乱(竞争条件)的数据被存储在相同的工作的两个实例(JobDetail)并发执行。

# Other Attributes Of Jobs

下面是通过JobDetail对象为作业实例定义的其他属性的快速摘要:

- Durability 

如果一个工作是非持久的，它会自动从调度器中删除，一旦不再有任何与它相关联的活动触发器。换句话说，非耐久的工作的生命周期是由其触发器的存在所限制的。

- RequestsRecovery 

如果一个作业“请求恢复”，并且它在调度程序的“硬关闭”(hard shutdown)期间执行(即它在崩溃中运行的进程，或者机器被关闭)，那么当调度程序再次启动时，它将被重新执行。在这种情况下, `JobExecutionContext.isRecovering()` 方法将返回true。

# JobExecutionException

最后，我们需要通知您一些关于 `Job.execute(..)` 方法的细节。允许从execute方法抛出的惟一异常(包括runtimeexception)是JobExecutionException。

因此，通常应该用“try-catch”块将execute方法的整个内容包装起来。

您还应该花些时间查看JobExecutionException的文档，因为您的作业可以使用它来为调度程序提供各种指示，以了解如何处理异常。

# 导航目录

> [导航目录](https://blog.csdn.net/ryo1060732496/article/details/79794802)

* any list
{:toc}