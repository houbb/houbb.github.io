---
layout: post
title: schedule-05-Spring Schedule 官方文档翻译
date: 2024-01-10 21:01:55 +0800
categories: [Schedule]
tags: [schedule, apache, distribued, work-flow, sh]
published: true
---


# 27.1 简介

Spring框架提供了异步执行任务和任务调度的抽象，分别通过TaskExecutor和TaskScheduler接口实现。

Spring还提供了这些接口的实现，支持在线程池或在应用服务器环境中委托给CommonJ。最终，这些实现在通用接口背后的使用抽象了Java SE 5、Java SE 6和Java EE环境之间的差异。

Spring还提供了支持使用JDK自1.3版以来一直存在的Timer以及Quartz Scheduler（http://quartz-scheduler.org）的集成类。这两个调度器都是使用FactoryBean设置的，可选地引用Timer或Trigger实例。此外，还提供了对Quartz Scheduler和Timer的便捷类，允许您调用现有目标对象的方法（类似于正常的MethodInvokingFactoryBean操作）。

# 27.2 Spring的TaskExecutor抽象

Spring 2.0引入了一个新的用于处理执行器的抽象。执行器是Java 5中线程池概念的名称。“执行器”命名的原因是不能保证底层实现实际上是一个池；执行器可能是单线程的，甚至是同步的。Spring的抽象隐藏了Java SE 1.4、Java SE 5和Java EE环境之间的实现细节。

Spring的TaskExecutor接口与java.util.concurrent.Executor接口相同。事实上，它存在的主要原因是在使用线程池时抽象掉对Java 5的需求。该接口有一个方法execute(Runnable task)，根据线程池的语义和配置接受一个任务进行执行。

TaskExecutor最初是为了给其他Spring组件提供一个在需要时进行线程池管理的抽象而创建的。

诸如ApplicationEventMulticaster、JMS的AbstractMessageListenerContainer和Quartz集成等组件都使用TaskExecutor抽象来进行线程池管理。

但是，如果您的bean需要线程池行为，也可以将此抽象用于您自己的需求。

## 27.2.1 TaskExecutor 类型

Spring发行版中包含了许多预构建的TaskExecutor实现。

很可能，您永远不需要实现自己的TaskExecutor。

SimpleAsyncTaskExecutor

这个实现不会重用任何线程，而是为每个调用启动一个新线程。然而，它支持并发限制，会阻塞任何超出限制的调用，直到有空闲的插槽。如果您正在寻找真正的池化，请继续向下滚动页面。

SyncTaskExecutor

这个实现不会异步执行调用。相反，每个调用都在调用线程中进行。主要用于不需要多线程的情况，如简单的测试案例。

ConcurrentTaskExecutor

这个实现是Java 5 java.util.concurrent.Executor的包装器。有一个替代品ThreadPoolTaskExecutor，将Executor配置参数公开为bean属性。一般情况下不需要使用ConcurrentTaskExecutor，但如果ThreadPoolTaskExecutor不够强大满足您的需求，ConcurrentTaskExecutor是一个选择。

SimpleThreadPoolTaskExecutor

这个实现实际上是Quartz的SimpleThreadPool的子类，它监听Spring的生命周期回调。通常在需要Quartz和非Quartz组件共享的线程池时使用。

ThreadPoolTaskExecutor

这个实现不可能使用java.util.concurrent包的任何备用或替代版本。Doug Lea和Dawid Kurzyniec的实现使用不同的包结构，这将阻止它们正确工作。

这个实现只能在Java 5环境中使用，但也是该环境中最常用的一个。它公开了用于配置java.util.concurrent.ThreadPoolExecutor的bean属性，并将其包装在TaskExecutor中。如果您需要高级功能，比如ScheduledThreadPoolExecutor，建议您使用ConcurrentTaskExecutor。

TimerTaskExecutor

这个实现使用单个TimerTask作为其后端实现。与SyncTaskExecutor不同的是，方法调用在单独的线程中执行，尽管它们在该线程中是同步的。

WorkManagerTaskExecutor

CommonJ是BEA和IBM共同开发的一组规范。这些规范不是Java EE标准，但在BEA和IBM的应用服务器实现中是标准的。

这个实现使用CommonJ WorkManager作为其后端实现，并且是在Spring上下文中设置CommonJ WorkManager引用的中央便利类。

与SimpleThreadPoolTaskExecutor类似，这个类实现了WorkManager接口，因此也可以直接用作WorkManager。

## 27.2.2 使用TaskExecutor

Spring的TaskExecutor实现被用作简单的JavaBean。

在下面的示例中，我们定义了一个bean，使用ThreadPoolTaskExecutor异步打印出一组消息。

```java
import org.springframework.core.task.TaskExecutor;

public class TaskExecutorExample {

  private class MessagePrinterTask implements Runnable {

    private String message;

    public MessagePrinterTask(String message) {
      this.message = message;
    }

    public void run() {
      System.out.println(message);
    }

  }

  private TaskExecutor taskExecutor;

  public TaskExecutorExample(TaskExecutor taskExecutor) {
    this.taskExecutor = taskExecutor;
  }

  public void printMessages() {
    for(int i = 0; i < 25; i++) {
      taskExecutor.execute(new MessagePrinterTask("Message" + i));
    }
  }
}
```

正如您所看到的，与其自己从池中检索线程并执行，您将您的Runnable添加到队列中，然后TaskExecutor使用其内部规则来决定何时执行任务。

要配置TaskExecutor将使用的规则，已经公开了简单的bean属性。

```xml
<bean id="taskExecutor" class="org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor">
  <property name="corePoolSize" value="5" />
  <property name="maxPoolSize" value="10" />
  <property name="queueCapacity" value="25" />
</bean>

<bean id="taskExecutorExample" class="TaskExecutorExample">
  <constructor-arg ref="taskExecutor" />
</bean>
```

# 27.3 Spring的TaskScheduler抽象

除了TaskExecutor抽象外，Spring 3.0还引入了TaskScheduler，它具有各种方法来安排任务在将来某个时间点运行。

```java
public interface TaskScheduler {

    ScheduledFuture schedule(Runnable task, Trigger trigger);

    ScheduledFuture schedule(Runnable task, Date startTime);

    ScheduledFuture scheduleAtFixedRate(Runnable task, Date startTime, long period);

    ScheduledFuture scheduleAtFixedRate(Runnable task, long period);

    ScheduledFuture scheduleWithFixedDelay(Runnable task, Date startTime, long delay);

    ScheduledFuture scheduleWithFixedDelay(Runnable task, long delay);

}
```

最简单的方法是名为“schedule”的方法，只接受一个Runnable和Date参数。这将导致任务在指定时间后运行一次。

所有其他方法都能够重复安排任务运行。固定速率和固定延迟的方法用于简单的周期性执行，但接受Trigger参数的方法更加灵活。

## 27.3.1 Trigger接口

Trigger接口基本上是受JSR-236启发的，截至Spring 3.0，它尚未正式实现。

Trigger的基本思想是执行时间可能根据过去的执行结果或甚至是任意条件来确定。

如果这些确定考虑了前一个执行的结果，那么该信息将在TriggerContext中可用。Trigger接口本身非常简单：

```java
public interface Trigger {

    Date nextExecutionTime(TriggerContext triggerContext);

}
```

正如您所看到的，TriggerContext是最重要的部分。它封装了所有相关数据，并且如果有必要，将来可以进行扩展。

TriggerContext是一个接口（默认情况下使用SimpleTriggerContext实现）。

这里您可以看到Trigger实现可用的方法。

```java
public interface TriggerContext {

    Date lastScheduledExecutionTime();

    Date lastActualExecutionTime();

    Date lastCompletionTime();

}
```

## 27.3.2 Trigger 实现

Spring提供了两个Trigger接口的实现。其中最有趣的是CronTrigger。它允许基于cron表达式进行任务调度。

例如，以下任务被安排在每个小时的15分钟后运行，但仅在周一至周五的9点到17点之间的“工作时间”内运行。

```java
scheduler.schedule(task, new CronTrigger("0 15 9-17 * * MON-FRI"));
```

另一个开箱即用的实现是PeriodicTrigger，它接受一个固定的周期，一个可选的初始延迟值，以及一个布尔值，用于指示周期是否应被解释为固定速率还是固定延迟。

由于TaskScheduler接口已经定义了以固定速率或固定延迟调度任务的方法，因此应尽可能直接使用这些方法。

PeriodicTrigger实现的价值在于它可以在依赖Trigger抽象的组件中使用。

例如，允许周期性触发器、基于cron的触发器甚至自定义触发器实现互换使用可能会很方便。这样的组件可以利用依赖注入，以便这些触发器可以在外部进行配置，因此可以轻松地进行修改或扩展。

## 27.3.3 TaskScheduler 实现

与Spring的TaskExecutor抽象类似，TaskScheduler的主要优点是依赖调度行为的代码不需要与特定的调度程序实现耦合。

这提供的灵活性在运行在应用服务器环境中特别重要，因为在这些环境中，线程不应该由应用程序直接创建。

对于这种情况，Spring提供了一个TimerManagerTaskScheduler，它委托给一个CommonJ TimerManager实例，通常配置了一个JNDI查找。

一个更简单的选择是ThreadPoolTaskScheduler，每当外部线程管理不是必需时都可以使用它。

在内部，它委托给一个ScheduledExecutorService实例。ThreadPoolTaskScheduler实际上也实现了Spring的TaskExecutor接口，因此可以使用单个实例进行尽快的异步执行以及调度和可能的重复执行。

# 27.4 使用注解支持任务调度和异步方法执行

Spring提供了注解支持，用于任务调度和异步方法执行。

## 27.4.1 启用调度注解

要启用对 `@Scheduled` 和 `@Async` 注解的支持，将@EnableScheduling和@EnableAsync添加到您的@Configuration类之一中：

```java
@Configuration
@EnableAsync
@EnableScheduling
public class AppConfig {
}
```

您可以自由选择适用于您的应用程序的相关注解。

例如，如果您只需要支持@Scheduled，请简单地省略@EnableAsync。

对于更精细的控制，您还可以额外实现SchedulingConfigurer和/或AsyncConfigurer接口。有关完整详细信息，请参阅Javadoc。

如果您更喜欢XML配置，请使用<task:annotation-driven>元素。

```xml
<task:annotation-driven executor="myExecutor" scheduler="myScheduler"/>
<task:executor id="myExecutor" pool-size="5"/>
<task:scheduler id="myScheduler" pool-size="10"/>}
```

请注意，以上XML中提供了一个执行器引用，用于处理那些对应于带有@Async注解的方法的任务，并且提供了调度程序引用，用于管理那些带有@Scheduled注解的方法。

## 27.4.2 @Scheduled 注解

@Scheduled注解可以与触发器元数据一起添加到方法中。

例如，以下方法将每5秒调用一次，使用固定延迟，这意味着周期将从每个前一个调用的完成时间开始计算。

```java
@Scheduled(fixedDelay=5000)
public void doSomething() {
    // 需要周期性执行的操作
}
```

如果需要固定速率执行，则只需更改注解中指定的属性名称。以下代码将在每次调用的连续开始时间之间以5秒为间隔执行。

```java
@Scheduled(fixedRate=5000)
public void doSomething() {
    // 需要周期性执行的操作
}
```

对于固定延迟和固定速率任务，可以指定初始延迟，表示在方法第一次执行之前等待的毫秒数。

```java
@Scheduled(initialDelay=1000, fixedRate=5000)
public void doSomething() {
    // 需要周期性执行的操作
}
```

如果简单的周期性调度不够表达性，那么可以提供一个cron表达式。例如，以下代码将仅在工作日执行。

```java
@Scheduled(cron="*/5 * * * * MON-FRI")
public void doSomething() {
    // 需要仅在工作日执行的操作
}
```

请注意，要安排的方法必须具有void返回类型，并且不应该期望任何参数。如果方法需要与应用程序上下文中的其他对象交互，则这些对象通常通过依赖注入提供。

[注意]

确保在运行时不要初始化同一个@Scheduled注解类的多个实例，除非您确实希望为每个这样的实例安排回调。

与此相关，请确保不要对使用@Scheduled注解的bean类使用@Configurable，并将其作为常规Spring bean注册到容器中：否则您将获得双重初始化，一次通过容器，一次通过@Configurable方面，导致每个@Scheduled方法被调用两次。

## 27.4.3 @Async 注解

@Async注解可以应用在方法上，使得该方法的调用将会异步执行。

换句话说，在调用时，调用者会立即返回，而方法的实际执行将会在一个已经提交给Spring TaskExecutor的任务中进行。

在最简单的情况下，该注解可以应用在一个返回void的方法上。

```java
@Async
void doSomething() {
    // 这将被异步执行
}
```

与@Scheduled注解的方法不同，这些方法可以接受参数，因为它们将在运行时以“正常”的方式被调用者调用，而不是来自由容器管理的调度任务。例如，以下是@Async注解的一个合法应用。

```java
@Async
void doSomething(String s) {
    // 这将被异步执行
}
```

甚至返回值的方法也可以异步调用。但是，这样的方法需要有一个Future类型的返回值。这仍然提供了异步执行的好处，以便调用者可以在调用该Future的get()方法之前执行其他任务。

```java
@Async
Future<String> returnSomething(int i) {
    // 这将被异步执行
}
```

@Async不能与生命周期回调（如@PostConstruct）一起使用。要异步初始化Spring bean，您目前必须使用一个单独的初始化Spring bean，在目标上调用带有@Async注解的方法。

```java
public class SampleBeanImpl implements SampleBean {

  @Async
  void doSomething() { … }
}


public class SampleBeanInititalizer {

  private final SampleBean bean;

  public SampleBeanInitializer(SampleBean bean) {
    this.bean = bean;
  }

  @PostConstruct
  public void initialize() {
    bean.doSomething();
  }
}
```

## 27.4.4 使用@Async进行Executor限定

默认情况下，在方法上指定@Async时，将使用提供给'annotation-driven'元素的执行器，如上所述。

但是，当需要指示在执行给定方法时应使用除默认执行器之外的其他执行器时，可以使用@Async注解的value属性。

```java
@Async("otherExecutor")
void doSomething(String s) {
    // 这将由“otherExecutor”异步执行
}
```

在这种情况下，“otherExecutor”可以是Spring容器中任何Executor bean的名称，也可以是与任何Executor相关联的限定符的名称，例如，使用 `<qualifier>` 元素或Spring的@Qualifier注解指定的名称。


# 27.5 任务命名空间

从Spring 3.0开始，有一个XML命名空间用于配置TaskExecutor和TaskScheduler实例。

它还提供了一种方便的方法来配置使用触发器调度的任务。

## 27.5.1 'scheduler' 元素

以下元素将创建一个具有指定线程池大小的ThreadPoolTaskScheduler实例。

```xml
<task:scheduler id="scheduler" pool-size="10"/>
```

提供给 'id' 属性的值将用作池内线程名称的前缀。 'scheduler' 元素相对简单。

如果不提供 'pool-size' 属性，则默认线程池将只有一个线程。对于调度程序没有其他配置选项。

## 27.5.2 'executor' 元素

以下将创建一个ThreadPoolTaskExecutor实例：

```xml
<task:executor id="executor" pool-size="10"/>
```

与上述调度程序类似，提供给 'id' 属性的值将用作池内线程名称的前缀。就池大小而言，'executor' 元素支持比 'scheduler' 元素更多的配置选项。

对于ThreadPoolTaskExecutor，线程池本身更加可配置。而不是一个固定大小，执行器的线程池可以有不同的核心和最大大小。

如果提供单个值，则执行器将具有固定大小的线程池（核心大小和最大大小相同）。但是，'executor' 元素的 'pool-size' 属性也可以接受形式为 "min-max" 的范围。

```xml
<task:executor id="executorWithPoolSizeRange"
                 pool-size="5-25"
                 queue-capacity="100"/>
```

从配置中可以看到，还提供了一个 'queue-capacity' 值。线程池的配置应当考虑到执行器的队列容量。有关线程池大小和队列容量之间关系的完整描述，请参阅ThreadPoolExecutor的文档。主要思想是，当提交任务时，执行器将首先尝试使用一个空闲线程（如果当前活动线程的数量小于核心大小）。如果已达到核心大小，则只要队列的容量尚未达到，任务将被添加到队列中。只有在队列的容量达到时，执行器才会超出核心大小创建一个新线程。如果还达到了最大大小，则执行器将拒绝该任务。

默认情况下，队列是无界的，但这很少是所需的配置，因为如果在所有池线程都忙碌时向该队列添加足够的任务，可能会导致OutOfMemoryErrors。此外，如果队列是无界的，那么最大大小根本不起作用。由于执行器总是首先尝试队列，然后才会超出核心大小创建新线程，所以队列必须具有有限的容量，以使线程池在核心大小之上增长（这就是在使用无界队列时固定大小池是唯一合理的情况）。

在考虑提供池大小配置时，keep-alive 设置将增加另一个因素。首先，让我们考虑一下，如上所述，当任务被拒绝时的情况。默认情况下，当任务被拒绝时，线程池执行器将抛出一个TaskRejectedException。然而，拒绝策略实际上是可配置的。当使用默认拒绝策略（AbortPolicy实现）时，将抛出异常。对于在重载下可以跳过一些任务的应用程序，可以配置为使用DiscardPolicy或DiscardOldestPolicy。另一个在需要在重载下限制提交任务的应用程序中运行良好的选项是CallerRunsPolicy。该策略不会抛出异常或丢弃任务，而是简单地强制调用submit方法的线程自行运行任务。其想法是在运行该任务时，调用者将忙于执行，无法立即提交其他任务。因此，它提供了一种简单的方法来限制传入负载，同时保持线程池和队列的限制。通常，这允许执行器“赶上”它正在处理的任务，并因此释放队列、池或两者的一些容量。可以从'executor'元素的 'rejection-policy' 属性的值枚举中选择这些选项中的任何一个。

```xml
<task:executor id="executorWithCallerRunsPolicy"
               pool-size="5-25"
               queue-capacity="100"
               rejection-policy="CALLER_RUNS"/>
```

# 27.5.3 'scheduled-tasks' 元素

Spring任务命名空间最强大的特性是支持在Spring应用程序上下文中配置要调度的任务。这遵循了Spring中其他“方法调用器”的方法，例如JMS命名空间为配置消息驱动的POJO提供的方法。基本上，“ref”属性可以指向任何Spring管理的对象，“method”属性提供要在该对象上调用的方法的名称。以下是一个简单的示例。

```xml
<task:scheduled-tasks scheduler="myScheduler">
    <task:scheduled ref="beanA" method="methodA" fixed-delay="5000"/>
</task:scheduled-tasks>

<task:scheduler id="myScheduler" pool-size="10"/>
```

如您所见，调度程序由外部元素引用，并且每个单独的任务都包括其触发器元数据的配置。

在前面的示例中，该元数据定义了一个周期性触发器，其中包含一个固定的延迟，指示在每个任务执行完成后等待的毫秒数。另一个选项是 'fixed-rate'，指示方法应以多快的频率执行，而不考虑任何先前执行花费的时间。

此外，对于固定延迟和固定速率任务，还可以指定一个 'initial-delay' 参数，指示在方法第一次执行之前等待的毫秒数。

为了获得更多控制，可以提供一个 “cron” 属性。以下是演示这些其他选项的示例。

```xml
<task:scheduled-tasks scheduler="myScheduler">
    <task:scheduled ref="beanA" method="methodA" fixed-delay="5000" initial-delay="1000"/>
    <task:scheduled ref="beanB" method="methodB" fixed-rate="5000"/>
    <task:scheduled ref="beanC" method="methodC" cron="*/5 * * * * MON-FRI"/>
</task:scheduled-tasks>

<task:scheduler id="myScheduler" pool-size="10"/>
```

# 27.6 使用Quartz调度器

Quartz使用Trigger、Job和JobDetail对象来实现各种类型的作业调度。

有关Quartz背后的基本概念，请参阅 http://quartz-scheduler.org。为了方便起见，Spring提供了一些类来简化在基于Spring的应用程序中使用Quartz的过程。

## 27.6.1 使用JobDetailBean

JobDetail对象包含运行作业所需的所有信息。Spring框架提供了一个JobDetailBean，使JobDetail更像是一个实际的JavaBean，并提供了合理的默认值。让我们看一个例子：

```xml
<bean name="exampleJob" class="org.springframework.scheduling.quartz.JobDetailBean">
  <property name="jobClass" value="example.ExampleJob" />
  <property name="jobDataAsMap">
    <map>
      <entry key="timeout" value="5" />
    </map>
  </property>
</bean>
```

作业详细信息bean具有运行作业（ExampleJob）所需的所有信息。

超时在作业数据映射中指定。作业数据映射可以通过作业执行上下文（在执行时传递给您）获得，但是JobDetailBean还将作业数据映射中的属性映射到实际作业的属性。因此，在这种情况下，如果ExampleJob包含名为timeout的属性，则JobDetailBean将自动应用它：

```java
package example;

public class ExampleJob extends QuartzJobBean {

  private int timeout;

  /**
   * Setter called after the ExampleJob is instantiated
   * with the value from the JobDetailBean (5)
   */
  public void setTimeout(int timeout) {
    this.timeout = timeout;
  }

  protected void executeInternal(JobExecutionContext ctx) throws JobExecutionException {
      // do the actual work
  }
}
```


所有作业详细信息bean的其他设置当然也是可用的。

注意：使用名称和组属性，您可以分别修改作业的名称和组。默认情况下，作业的名称与作业详细信息bean的bean名称相匹配（在上面的示例中，这是exampleJob）。

## 27.6.2 使用MethodInvokingJobDetailFactoryBean

通常，您只需在特定对象上调用一个方法。使用MethodInvokingJobDetailFactoryBean，您可以做到这一点：

```xml
<bean id="jobDetail" class="org.springframework.scheduling.quartz.MethodInvokingJobDetailFactoryBean">
  <property name="targetObject" ref="exampleBusinessObject" />
  <property name="targetMethod" value="doIt" />
</bean>
```

上面的示例将在exampleBusinessObject方法上调用doIt方法（见下文）：

```java
public class ExampleBusinessObject {

  // 属性和协作者

  public void doIt() {
    // 执行实际工作
  }
}
```

```xml
<bean id="exampleBusinessObject" class="examples.ExampleBusinessObject"/>
```

使用MethodInvokingJobDetailFactoryBean，您不需要创建只调用方法的单行作业，并且只需要创建实际的业务对象并连接详细对象。

默认情况下，Quartz Jobs是无状态的，这可能导致作业之间发生干扰的可能性。

如果为同一个JobDetail指定了两个触发器，则可能在第一个作业完成之前，第二个作业将启动。

如果JobDetail类实现了Stateful接口，则不会发生这种情况。

在第一个作业完成之前，第二个作业不会启动。要使由MethodInvokingJobDetailFactoryBean产生的作业不是并发的，请将concurrent标志设置为false。

```xml
<bean id="jobDetail" class="org.springframework.scheduling.quartz.MethodInvokingJobDetailFactoryBean">
  <property name="targetObject" ref="exampleBusinessObject" />
  <property name="targetMethod" value="doIt" />
  <property name="concurrent" value="false" />
</bean>
```

【注意】
默认情况下，作业将以并发方式运行。


## 27.6.3 使用触发器和SchedulerFactoryBean连接作业

我们已经创建了作业详细信息和作业。我们还回顾了允许您在特定对象上调用方法的便捷bean。

当然，我们仍然需要安排作业本身的时间。这是使用触发器和SchedulerFactoryBean完成的。

在Quartz中有几种触发器可用，而Spring提供了两个Quartz FactoryBean实现，具有方便的默认值：CronTriggerFactoryBean和SimpleTriggerFactoryBean。

触发器需要被安排。Spring提供了一个SchedulerFactoryBean，它将触发器暴露为属性来设置。SchedulerFactoryBean使用这些触发器安排实际的作业。

以下是几个示例：

```xml
<bean id="simpleTrigger" class="org.springframework.scheduling.quartz.SimpleTriggerFactoryBean">
    <!-- 参见上面的方法调用作业示例 -->
    <property name="jobDetail" ref="jobDetail" />
    <!-- 10秒后开始 -->
    <property name="startDelay" value="10000" />
    <!-- 每50秒重复一次 -->
    <property name="repeatInterval" value="50000" />
</bean>

<bean id="cronTrigger" class="org.springframework.scheduling.quartz.CronTriggerFactoryBean">
    <property name="jobDetail" ref="exampleJob" />
    <!-- 每天早上6点运行 -->
    <property name="cronExpression" value="0 0 6 * * ?" />
</bean>
```

现在我们设置了两个触发器，一个每50秒运行一次，延迟10秒开始，另一个每天早上6点运行一次。为了完成一切，我们需要设置SchedulerFactoryBean：

```xml
<bean class="org.springframework.scheduling.quartz.SchedulerFactoryBean">
    <property name="triggers">
        <list>
            <ref bean="cronTrigger" />
            <ref bean="simpleTrigger" />
        </list>
    </property>
</bean>
```

SchedulerFactoryBean还有更多属性供您设置，例如作业详细信息使用的日历，自定义Quartz等的属性等。

有关更多信息，请参阅SchedulerFactoryBean Javadoc。

# 参考资料

https://blog.csdn.net/fly910905/article/details/79530709

https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/scheduling/annotation/Scheduled.html

https://docs.spring.io/spring-framework/docs/3.2.x/spring-framework-reference/html/scheduling.html

* any list
{:toc}