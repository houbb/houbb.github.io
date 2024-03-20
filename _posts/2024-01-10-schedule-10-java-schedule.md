---
layout: post
title: schedule-10-java 调度基础  scheduleAtFixedRate 和 scheduleWithFixedDelay
date: 2024-01-10 21:01:55 +0800
categories: [Schedule]
tags: [schedule, apache, distribued, work-flow, sh]
published: true
---

# jdk 的接口定义

```java
/**
 * 创建并执行一个定期操作，该操作首次在给定的初始延迟之后变为启用状态，然后在每次执行的终止和下次执行的开始之间具有给定的延迟。
 * 
 * 如果任务的任何执行遇到异常，则将抑制后续执行。否则，任务只能通过取消或终止执行器来终止。
 *
 * @param command 任务
 * @param initialDelay 首次执行之前的延迟时间
 * @param delay 每次执行的终止和下次执行的开始之间的延迟
 * @param unit initialDelay 和 delay 参数的时间单位
 * @return 表示任务挂起完成的 ScheduledFuture，其 {@code get()} 方法在取消时会抛出异常
 * @throws RejectedExecutionException 如果无法为执行安排任务
 * @throws NullPointerException 如果 command 为 null
 * @throws IllegalArgumentException 如果延迟小于或等于零
 */
public ScheduledFuture<?> scheduleWithFixedDelay(Runnable command,
                                                 long initialDelay,
                                                 long delay,
                                                 TimeUnit unit);

/**
 * 创建并执行一个定期操作，该操作首次在给定的初始延迟之后变为启用状态，然后以给定的周期进行后续执行；
 * 即，执行将在 {@code initialDelay} 之后、{@code initialDelay+period} 之后、
 * {@code initialDelay + 2 * period} 之后等依次开始。
 * 如果任务的任何执行遇到异常，则将抑制后续执行。否则，任务只能通过取消或终止执行器来终止。
 * 如果此任务的任何执行时间长于其周期，则后续执行可能会延迟启动，但不会同时执行。
 *
 * @param command 任务
 * @param initialDelay 首次执行之前的延迟时间
 * @param period 连续执行之间的周期
 * @param unit initialDelay 和 period 参数的时间单位
 * @return 表示任务挂起完成的 ScheduledFuture，其 {@code get()} 方法在取消时会抛出异常
 * @throws RejectedExecutionException 如果无法为执行安排任务
 * @throws NullPointerException 如果 command 为 null
 * @throws IllegalArgumentException 如果 period 小于或等于零
 */
public ScheduledFuture<?> scheduleAtFixedRate(Runnable command,
                                               long initialDelay,
                                               long period,
                                               TimeUnit unit);
```


# 差异

## scheduleWithFixedDelay

官方意思是：创建一个给定初始延迟的间隔性的任务，之后的下次执行时间是上一次任务从执行到结束所需要的时间+给定的间隔时间。

举个例子：比如我给定任务的初始延迟(long initialdelay)是12:00， 间隔为1分钟 。 

那么这个任务会在12:00 首次创建并执行，如果该任务从执行到结束所需要消耗的时间为1分钟，那么下次任务执行的时间理应从12：01 再加上设定的间隔1分钟，那么下次任务执行时间是12:02 。

这里的间隔时间（delay） 是从上次任务执行结束开始算起的。

## scheduleAtFixedRate

官方文档意思为：创建一个给定初始延迟的间隔性的任务，之后的每次任务执行时间为 初始延迟 + N * delay(间隔)  。

这里的N为首次任务执行之后的第N个任务，N从1开始，意识就是 首次执行任务的时间为12:00 那么下次任务的执行时间是固定的 是12:01 下下次为12:02。

与 scheduleWithFixedDelay 最大的区别就是 ，scheduleAtFixedRate  不受任务执行时间的影响。


# chat

## jdk 中 scheduleWithFixedDelay 和 scheduleAtFixedRate 的区别？

`scheduleWithFixedDelay` 和 `scheduleAtFixedRate` 是 Java 中 `ScheduledExecutorService` 接口定义的两种方法，用于创建和执行定期任务。

它们之间的区别在于执行任务的方式和调度的时间点：

1. **scheduleWithFixedDelay**:

   - 这个方法会在每次任务执行结束后，等待一段固定的延迟时间，然后再次执行任务。

   - 例如，假设你使用 `scheduleWithFixedDelay(command, initialDelay, delay, unit)` 方法安排了一个任务，其中 `initialDelay` 表示首次执行任务之前的延迟时间，`delay` 表示每次执行任务之间的延迟时间。任务将在首次执行后的 `initialDelay` 后开始执行，然后在每次执行结束后等待 `delay` 时间，然后再次执行。

2. **scheduleAtFixedRate**:
   - 这个方法会以固定的时间间隔执行任务，不管任务的执行时间长短。
   - 例如，假设你使用 `scheduleAtFixedRate(command, initialDelay, period, unit)` 方法安排了一个任务，其中 `initialDelay` 表示首次执行任务之前的延迟时间，`period` 表示连续执行之间的时间间隔。任务将在首次执行后的 `initialDelay` 后开始执行，然后在每次执行结束后等待 `period` 时间，然后再次执行。

总结：
- `scheduleWithFixedDelay` 在任务执行结束后会等待固定的延迟时间，然后再次执行任务，因此任务之间的时间间隔是由执行完成时间和延迟时间决定的。
- `scheduleAtFixedRate` 则是以固定的时间间隔执行任务，不考虑任务执行时间，因此任务之间的时间间隔是固定的。

## 如果任务执行的时间大于间隔时间会怎么样。比如任务执行时间为 10S，scheduleWithFixedDelay 和 scheduleAtFixedRate 时间间隔都是 5s。具体执行的区别？给出时间例子

假设任务执行时间为10秒，而`scheduleWithFixedDelay`和`scheduleAtFixedRate`的时间间隔都是5秒。让我们看看它们的具体执行情况：

1. **scheduleWithFixedDelay**:
   - 首先，任务将在初始延迟时间后的5秒钟后开始执行。
   - 执行任务需要10秒钟，因此任务结束后会等待固定的延迟时间5秒钟。
   - 在等待5秒钟后，任务将再次执行，然后等待下一次执行。

    ```
    时间：0s        5s        15s       20s        30s
           |----------任务1（10s）----------| |----------任务2（10s）----------|
    ```

2. **scheduleAtFixedRate**:
   - 首先，任务将在初始延迟时间后的5秒钟后开始执行。
   - 任务执行需要10秒钟，但由于`scheduleAtFixedRate`是固定间隔执行，因此在任务结束后5秒钟，即使任务尚未完成，下一次任务也会开始执行。
   - 这意味着任务将以固定的时间间隔执行，而不考虑上一次任务的执行时间。

    ```
    时间：0s        5s        15s       20s        30s
           |----------任务1（10s）----------| |----------任务2（10s）----------|
    ```

总结：

- 在`scheduleWithFixedDelay`中，任务的执行间隔会被实际执行时间和延迟时间所影响，因此即使任务执行时间较长，下一次任务也会在固定延迟时间后开始执行。

- 在`scheduleAtFixedRate`中，任务的执行间隔是固定的，因此即使任务执行时间较长，下一次任务也会在固定间隔时间后开始执行。


# 参考资料

https://blog.csdn.net/liushengbaoblog/article/details/21018467

https://www.cnblogs.com/zjm-1/p/9517539.html

https://developer.aliyun.com/article/744977

https://blog.csdn.net/xiaoblank/article/details/119004980

https://blog.51cto.com/u_12905373/6120750

https://cloud.tencent.com/developer/article/2167673

https://www.cnblogs.com/starcrm/p/5010336.html

https://cloud.tencent.com/developer/article/1423776


* any list
{:toc}