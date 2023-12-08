---
layout: post
title: java 原生方式，如何实现定时的任务调度？
date: 2023-12-06 21:01:55 +0800
categories: [Log]
tags: [log, elk, sh]
published: true
---

# 策略调整

本地直接定时加载。

## 设计

总体的数据加载，需要一个开关 configPullFlag

定时调度的模式：configPullScheduleMode: all/update   

all: 全量（默认）

update: 更新增量。

----------------------

匹配时，有一个专门的匹配策略。

### 增量的注意点

增量的时候，需要注意一下被删除的数据，所以数据应该是伪删除（或者通过删除日志获取到）。





# chat

## java 如何实现定时的任务调度，比如每天 00:30 固定执行

在Java中，你可以使用`ScheduledExecutorService`或`Timer`类来实现定时的任务调度。

下面我将分别介绍这两种方法的基本用法。

### 1. 使用ScheduledExecutorService

`ScheduledExecutorService`是Java中用于执行定时任务的接口。你可以使用`ScheduledThreadPoolExecutor`类实现它。以下是一个每天固定时间执行任务的例子：

```java
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

public class ScheduledTaskExample {

    public static void main(String[] args) {
        ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);

        // 获取当前时间
        long initialDelay = calculateInitialDelay();

        // 执行任务
        scheduler.scheduleAtFixedRate(() -> {
            // 这里放置需要执行的任务代码
            System.out.println("任务执行时间：" + System.currentTimeMillis());
        }, initialDelay, 24 * 60 * 60 * 1000, TimeUnit.MILLISECONDS); // 24小时执行一次
    }

    private static long calculateInitialDelay() {
        // 获取当前时间
        long currentTime = System.currentTimeMillis();

        // 计算距离下一次执行的时间间隔
        long nextExecutionTime = getNextExecutionTime();
        long initialDelay = nextExecutionTime - currentTime;

        // 如果计算结果小于0，则表示今天的执行时间已经过去，将初始延迟设置为24小时
        if (initialDelay < 0) {
            initialDelay += 24 * 60 * 60 * 1000;
        }

        return initialDelay;
    }

    private static long getNextExecutionTime() {
        // 获取当前日期的下一个执行时间点，比如每天00:30
        // 这里可以使用相关的日期时间库，比如Java 8中的java.time
        // 这里简化处理，直接设置为每天00:30
        return getNextMidnightTime() + 30 * 60 * 1000; // 30分钟
    }

    private static long getNextMidnightTime() {
        // 获取明天零点的时间戳
        // 这里可以使用相关的日期时间库，比如Java 8中的java.time
        // 这里简化处理，直接设置为明天零点
        return getTodayMidnightTime() + 24 * 60 * 60 * 1000;
    }

    private static long getTodayMidnightTime() {
        // 获取今天零点的时间戳
        // 这里可以使用相关的日期时间库，比如Java 8中的java.time
        // 这里简化处理，直接设置为今天零点
        return System.currentTimeMillis() / (24 * 60 * 60 * 1000) * (24 * 60 * 60 * 1000);
    }
}
```

在这个例子中，`scheduleAtFixedRate`方法中的第一个参数是一个`Runnable`，包含需要执行的任务代码。第二个参数是初始延迟，第三个参数是周期，这里设置为24小时。

### 2. 使用Timer类

```java
import java.util.Calendar;
import java.util.Date;
import java.util.Timer;
import java.util.TimerTask;

public class TimerTaskExample {

    public static void main(String[] args) {
        Timer timer = new Timer();

        // 获取当前时间
        Date currentDate = new Date();

        // 获取明天的执行时间点，比如每天00:30
        Calendar tomorrow = Calendar.getInstance();
        tomorrow.setTime(currentDate);
        tomorrow.add(Calendar.DAY_OF_YEAR, 1);
        tomorrow.set(Calendar.HOUR_OF_DAY, 0);
        tomorrow.set(Calendar.MINUTE, 30);
        tomorrow.set(Calendar.SECOND, 0);
        tomorrow.set(Calendar.MILLISECOND, 0);

        // 计算初始延迟
        long initialDelay = tomorrow.getTimeInMillis() - currentDate.getTime();

        // 执行任务
        timer.scheduleAtFixedRate(new TimerTask() {
            @Override
            public void run() {
                // 这里放置需要执行的任务代码
                System.out.println("任务执行时间：" + System.currentTimeMillis());
            }
        }, initialDelay, 24 * 60 * 60 * 1000); // 24小时执行一次
    }
}
```

在这个例子中，`Timer`类的`scheduleAtFixedRate`方法也可以实现每天固定时间执行任务。第一个参数是`TimerTask`，包含需要执行的任务代码。第二个参数是初始延迟，第三个参数是周期，这里同样设置为24小时。

注意：`Timer`类在Java中已被官方不推荐使用，更推荐使用`ScheduledExecutorService`。前者存在一些不足之处，例如不能处理异常，而`ScheduledExecutorService`更灵活且功能更强大。

## Q: 如果有多台机器，如何保证定时执行时，不会重复执行？

当有多台机器参与定时任务执行时，确保任务不会被重复执行是一项挑战。以下是一些可行的方法：

### 1. 使用分布式锁

使用分布式锁可以确保在某一时刻只有一个机器能够执行任务。常见的分布式锁实现包括：

- **ZooKeeper：** ZooKeeper是一个分布式协调服务，可以用来实现分布式锁。当一个机器成功获取锁时，其他机器将无法获取，直到锁被释放。

- **Redis：** Redis也可以用作分布式锁的实现。通过SETNX命令（SET if Not eXists），你可以在Redis中设置一个键，确保只有一个机器能够成功设置，其他机器将无法设置成功。

### 2. 使用数据库记录状态

你可以使用数据库来记录任务执行的状态，确保在同一时刻只有一个机器能够执行任务。数据库可以是关系型数据库或者分布式数据库。

### 3. 利用分布式调度框架

一些分布式调度框架，如Quartz和Airflow，具有分布式部署和任务执行的能力。它们可以确保任务只在其中一个节点上执行。

### 4. 时间窗口限制

在每个执行节点上，你可以设置一个时间窗口，在这个时间窗口内只有一个节点能够执行任务。这可以通过获取分布式锁或者通过其他手段来实现。

### 5. 基于时间戳的任务唯一性

任务执行的时候，可以基于时间戳来判断是否已经执行过。例如，在数据库中记录上一次任务执行的时间戳，并在执行任务时检查上一次执行的时间戳是否超过一定的时间间隔。

请注意，以上方法各有优缺点，选择最适合你应用场景的方法取决于你的具体需求和系统架构。分布式系统设计涉及到很多复杂性，确保在实际应用中考虑到系统的一致性和可靠性。



# 参考资料

chat

* any list
{:toc}