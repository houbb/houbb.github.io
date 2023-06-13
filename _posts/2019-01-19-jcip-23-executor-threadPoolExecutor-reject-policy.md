---
layout: post
title:  JCIP-23-ThreadPoolExecutor 对应的拒绝策略
date:  2019-1-18 11:21:15 +0800
categories: [Concurrency]
tags: [thread, concurrency, thread, async, sh]
published: true
---

# 介绍一下 ThreadPoolExecutor 

在Java中，ThreadPoolExecutor是java.util.concurrent包下的一个类，用于创建和管理线程池以实现并发执行任务。它是Java提供的用于多线程编程的强大工具之一。

ThreadPoolExecutor提供了一种可配置的线程池实现，可以通过设置参数来控制线程池的大小、线程的创建和销毁方式，以及任务的执行策略等。

它是ExecutorService接口的实现类，提供了一系列方法来提交任务并处理线程池中的任务执行。

下面是一个简单的使用ThreadPoolExecutor的示例：

```java
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.ThreadPoolExecutor;

public class ThreadPoolExecutorExample {
    public static void main(String[] args) {
        // 创建一个具有固定线程数的线程池
        ExecutorService executor = Executors.newFixedThreadPool(4);

        // 提交任务给线程池
        for (int i = 0; i < 10; i++) {
            final int taskId = i;
            executor.submit(() -> {
                // 执行任务逻辑
                System.out.println("Task " + taskId + " is executing.");
            });
        }

        // 关闭线程池
        executor.shutdown();
    }
}
```

在上面的示例中，首先通过Executors工厂类的newFixedThreadPool方法创建了一个固定大小为4的线程池。

然后使用submit方法向线程池提交了10个任务，每个任务都是一个Runnable对象，表示要执行的具体逻辑。最后调用executor.shutdown()方法关闭线程池。

ThreadPoolExecutor提供了各种构造函数和方法，允许你自定义线程池的参数，如核心线程数、最大线程数、线程空闲时间、任务队列等。

此外，你还可以通过配置RejectedExecutionHandler来处理任务提交超过线程池容量时的行为。

使用ThreadPoolExecutor，你可以方便地管理线程池并发执行任务，充分利用系统资源，提高程序的并发性能。

# 线程池的拒绝策略

ThreadPoolExecutor在处理任务提交超过线程池容量时，提供了几种可选的拒绝策略。拒绝策略决定了当线程池无法接受新的任务时应该采取的行为。以下是常见的几种拒绝策略：

1. AbortPolicy（默认策略）：当线程池无法处理新提交的任务时，会抛出RejectedExecutionException异常，表示拒绝执行该任务。这是默认的拒绝策略。

2. CallerRunsPolicy：当线程池无法处理新提交的任务时，该策略会使用调用线程来执行任务。也就是说，任务会在提交任务的线程中执行。这个策略可以保证任务的提交不会被拒绝，但可能会导致任务提交线程的执行速度变慢。

3. DiscardPolicy：当线程池无法处理新提交的任务时，该策略会默默地丢弃被拒绝的任务，不会抛出任何异常。如果对任务的结果不感兴趣，可以使用这个策略。

4. DiscardOldestPolicy：当线程池无法处理新提交的任务时，该策略会丢弃队列中最老的一个任务，然后尝试重新提交新任务。

此外，你还可以实现RejectedExecutionHandler接口来自定义拒绝策略。自定义拒绝策略需要实现RejectedExecutionHandler接口的rejectedExecution()方法，在该方法中定义拒绝任务的行为。

以下是一个示例，演示如何在ThreadPoolExecutor中使用自定义的拒绝策略：

```java
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;

public class CustomRejectedExecutionHandler implements RejectedExecutionHandler {
    @Override
    public void rejectedExecution(Runnable r, ThreadPoolExecutor executor) {
        // 自定义拒绝策略的具体实现
        System.out.println("Task rejected: " + r.toString());
    }
}

public class ThreadPoolExecutorExample {
    public static void main(String[] args) {
        int corePoolSize = 5;
        int maxPoolSize = 10;
        long keepAliveTime = 1000;
        TimeUnit unit = TimeUnit.MILLISECONDS;
        LinkedBlockingQueue<Runnable> workQueue = new LinkedBlockingQueue<>(15);
        RejectedExecutionHandler rejectedExecutionHandler = new CustomRejectedExecutionHandler();

        ThreadPoolExecutor executor = new ThreadPoolExecutor(
                corePoolSize, maxPoolSize, keepAliveTime, unit, workQueue, rejectedExecutionHandler);

        // 提交任务给线程池...
        
        executor.shutdown();
    }
}
```

在上面的示例中，自定义的拒绝策略CustomRejectedExecutionHandler实现了RejectedExecutionHandler接口，并在rejectedExecution()方法中输出一条拒绝执行的消息。然后在创建ThreadPoolExecutor时，将该自定义拒绝策略传递给了线程池构造函数。

通过选择适合的拒绝策略，可以根据具体需求来处理线程池无法接受新任务的情况。以下是一些考虑因素：

1. AbortPolicy是默认的拒绝策略，它会抛出异常并终止任务提交，适用于希望明确知道任务被拒绝的情况。当任务提交过载时，可以及时发现并处理异常情况。

2. CallerRunsPolicy 策略会将任务返回给提交任务的线程来执行。这种策略可以在一些场景中保证任务提交的成功，但**可能会导致任务提交线程的执行速度变慢。如果任务提交的速度相对较慢，且希望任务的执行在提交线程中执行，可以考虑使用该策略。**

3. DiscardPolicy策略会默默地丢弃被拒绝的任务，不会抛出任何异常。如果对任务的结果不感兴趣，且希望尽量避免异常情况干扰程序的正常执行，可以选择该策略。

4. DiscardOldestPolicy策略会丢弃队列中最老的一个任务，然后尝试重新提交新任务。如果希望尽可能多地接收新的任务，而不关心队列中一些较旧任务的执行，可以选择该策略。

当默认的拒绝策略不满足需求时，也可以根据具体情况实现自定义的RejectedExecutionHandler来处理任务拒绝情况。通过自定义拒绝策略，可以实现更灵活的任务处理逻辑，例如记录日志、通知等。

选择合适的拒绝策略需要根据应用场景和需求来决定。

在制定选择之前，可以考虑以下问题：任务提交频率、任务的重要性、任务执行时间的长短、对任务结果的依赖程度等。

综合考虑这些因素，选择最合适的拒绝策略以保证线程池的稳定性和任务的正常执行。

# 详细解释下 CallerRunsPolicy，以及 jdk 为什么不把这个作为默认策略。基于什么考虑？

CallerRunsPolicy是ThreadPoolExecutor的一种拒绝策略。当线程池无法接受新任务时，该策略会使用提交任务的线程来执行被拒绝的任务。也就是说，任务会在提交任务的线程中执行，而不会交给线程池中的工作线程执行。

CallerRunsPolicy的作用是确保任务的提交不会被拒绝，而是由提交任务的线程来执行。这种策略可以避免任务被丢弃或抛出异常，但可能会导致任务提交线程的执行速度变慢，因为提交线程会阻塞等待被拒绝任务的执行完成。

为什么JDK没有将CallerRunsPolicy作为默认策略呢？

这是基于以下考虑：

1. 避免任务提交线程被阻塞：如果将CallerRunsPolicy作为默认策略，当线程池无法接受新任务时，会将任务返回给提交任务的线程执行。如果提交任务的线程是主线程或其他重要的线程，它们可能会被阻塞，导致整个应用程序的响应性能下降。因此，将该策略作为默认策略可能会影响应用程序的整体性能和稳定性。

2. 提醒开发者处理拒绝的任务：将异常抛出作为默认策略（AbortPolicy）可以明确地告知开发者任务提交被拒绝，需要进行适当的处理。这样可以让开发者及时发现和解决任务提交过载的问题，避免任务丢失或无响应的情况。

3. 灵活性和可配置性：ThreadPoolExecutor提供了多种拒绝策略，并且允许开发者根据应用程序的需求进行选择和配置。将默认策略设置为CallerRunsPolicy会限制了这种灵活性，因为它会强制执行任务提交线程来执行被拒绝的任务。通过提供多种可选的拒绝策略，开发者可以根据具体的场景和需求选择最适合的策略。

综上所述，JDK没有将CallerRunsPolicy作为默认策略是为了避免潜在的线程阻塞问题，提醒开发者处理被拒绝的任务，并保持ThreadPoolExecutor的灵活性和可配置性，以满足各种应用场景的需求。开发者可以根据具体情况选择合适的拒绝策略来处理任务提交过载的情况。

# 参考资料

* any list
{:toc}


