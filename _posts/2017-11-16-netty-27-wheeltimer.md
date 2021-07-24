---
layout: post
title:  Netty-27-Netty 的 HashedWheelTimer 时间轮
date:  2017-11-16 19:23:06 +0800
categories: [Netty]
tags: [netty, java, nio, sh]
published: false
---

# 任务调度

前段时间在给自己的玩具项目设计的时候就遇到了一个场景需要定时任务，于是就趁机了解了目前主流的一些定时任务方案，比如下面这些：

- Timer（halo 博客源码中用到了）

- ScheduledExecutorService

- ThreadPoolTaskScheduler（基于 ScheduledExecutorService）

- Netty 的 schedule（用到了 PriorityQueue）

- Netty 的 HashedWheelTimer（时间轮）

- Kafka 的 TimingWheel（层级时间轮）

还有一些分布式的定时任务：

- Quartz

- xxl-job

...

因为我玩具项目实现业务 ACK 的方案就打算用 HashedWheelTimer，所以本节核心是分析 HashedWheelTimer，另外会提下它与 schedule 的区别，其它定时任务实现原理就请自动 Google 吧。

> Netty Version：4.1.42

# HashedWheelTimer 实现图示

![在这里插入图片描述](https://img-blog.csdnimg.cn/b670eab729e84354a1a978cbd3ccba5e.png)

大致有个理解就行，关于蓝色格子中的数字，其实就是剩余时钟轮数，这里听不懂也没关系，等后面看到源码解释就懂了~~（大概）~~。

## HashedWheelTimer 简单使用例子

这里顺便列出 schedule 的使用方式，下面是某个 Handler 中的代码：

```java
@Override
public void handlerAdded(final ChannelHandlerContext ctx) {
    // 定时任务
    ScheduledFuture<?> hello_world = ctx.executor().schedule(() -> {
        ctx.channel().write("hello world");
    }, 3, TimeUnit.SECONDS);

    // 构造一个 Timer 实例，同样只执行一次
    Timer timer = new HashedWheelTimer();
    Timeout timeout1 = timer.newTimeout(timeout -> System.out.println("5s 后执行该任务"), 5, TimeUnit.SECONDS);

    // 取消任务
    timeout1.cancel();
}
```

# HashedWheelTimer 源码

## 接口定义

这个 Timer 接口是 netty 自定义的接口。

```java
/**
 * Schedules {@link TimerTask}s for one-time future execution in a background
 * thread.
 */
public interface Timer {

    /**
     * Schedules the specified {@link TimerTask} for one-time execution after
     * the specified delay.
     * 新增任务
     */
    Timeout newTimeout(TimerTask task, long delay, TimeUnit unit);

    /**
     * Releases all resources acquired by this {@link Timer} and cancels all
     * tasks which were scheduled but not executed yet.
     * 任务取消
     */
    Set<Timeout> stop();
}
```

## 内部变量

```java
public class HashedWheelTimer implements Timer {

    static final InternalLogger logger =
            InternalLoggerFactory.getInstance(HashedWheelTimer.class);

    private static final AtomicInteger INSTANCE_COUNTER = new AtomicInteger();
    private static final AtomicBoolean WARNED_TOO_MANY_INSTANCES = new AtomicBoolean();
    private static final int INSTANCE_COUNT_LIMIT = 64;
    private static final long MILLISECOND_NANOS = TimeUnit.MILLISECONDS.toNanos(1);
    private static final ResourceLeakDetector<HashedWheelTimer> leakDetector = ResourceLeakDetectorFactory.instance()
            .newResourceLeakDetector(HashedWheelTimer.class, 1);

    private static final AtomicIntegerFieldUpdater<HashedWheelTimer> WORKER_STATE_UPDATER =
            AtomicIntegerFieldUpdater.newUpdater(HashedWheelTimer.class, "workerState");

    private final ResourceLeakTracker<HashedWheelTimer> leak;
    private final Worker worker = new Worker();
    private final Thread workerThread;

    public static final int WORKER_STATE_INIT = 0;
    public static final int WORKER_STATE_STARTED = 1;
    public static final int WORKER_STATE_SHUTDOWN = 2;
    @SuppressWarnings({ "unused", "FieldMayBeFinal" })
    private volatile int workerState; // 0 - init, 1 - started, 2 - shut down

    private final long tickDuration;
    private final HashedWheelBucket[] wheel;
    private final int mask;
    private final CountDownLatch startTimeInitialized = new CountDownLatch(1);
    private final Queue<HashedWheelTimeout> timeouts = PlatformDependent.newMpscQueue();
    private final Queue<HashedWheelTimeout> cancelledTimeouts = PlatformDependent.newMpscQueue();
    private final AtomicLong pendingTimeouts = new AtomicLong(0);
    private final long maxPendingTimeouts;

    private volatile long startTime;

}
```

初始化如下：

```java
public HashedWheelTimer(
        ThreadFactory threadFactory,
        long tickDuration, TimeUnit unit, int ticksPerWheel, boolean leakDetection,
        long maxPendingTimeouts) {

    // 参数校验
    if (threadFactory == null) {
        throw new NullPointerException("threadFactory");
    }
    if (unit == null) {
        throw new NullPointerException("unit");
    }
    if (tickDuration <= 0) {
        throw new IllegalArgumentException("tickDuration must be greater than 0: " + tickDuration);
    }
    if (ticksPerWheel <= 0) {
        throw new IllegalArgumentException("ticksPerWheel must be greater than 0: " + ticksPerWheel);
    }

    // 初始化时间轮，数组长度必须是2的幂次方，便于取模
    // Normalize ticksPerWheel to power of two and initialize the wheel.
    wheel = createWheel(ticksPerWheel);
    // 用于取模运算, tick & mask
    mask = wheel.length - 1;

    // Convert tickDuration to nanos.
    // 毫秒转纳秒
    long duration = unit.toNanos(tickDuration);

    // Prevent overflow.
    // 防止溢出
    if (duration >= Long.MAX_VALUE / wheel.length) {
        throw new IllegalArgumentException(String.format(
                "tickDuration: %d (expected: 0 < tickDuration in nanos < %d",
                tickDuration, Long.MAX_VALUE / wheel.length));
    }

    // 时间刻度设置太小，自动设置为MILLISECOND_NANOS， 并弹出警告日志
    if (duration < MILLISECOND_NANOS) {
        logger.warn("Configured tickDuration {} smaller then {}, using 1ms.",
                    tickDuration, MILLISECOND_NANOS);
        this.tickDuration = MILLISECOND_NANOS;
    } else {
        this.tickDuration = duration;
    }

    // 初始化工作线程，注意这里还没有启动
    // 另外需要注意的是本类中的startTime是在worker第一次启动之后才初始化的，
    // 跟io.netty.util.concurrent.ScheduledFutureTask.START_TIME在类加载的时候初始化是不一样的
    workerThread = threadFactory.newThread(worker);

    // 用来跟踪内存问题的，本节忽略，主讲定时任务的实现
    leak = leakDetection || !workerThread.isDaemon() ? leakDetector.track(this) : null;

    // 最大允许任务等待数
    this.maxPendingTimeouts = maxPendingTimeouts;

    // HashedWheelTimer实例如果超过64个就会弹出警告，告诉你HashedWheelTimer不是这样用的，单个应用只需要一个单例即可
    if (INSTANCE_COUNTER.incrementAndGet() > INSTANCE_COUNT_LIMIT &&
        WARNED_TOO_MANY_INSTANCES.compareAndSet(false, true)) {
        reportTooManyInstances();
    }
}
```

## 添加定时任务

添加定时任务其实就是 Timer 接口的 newTimeOut 方法： `io.netty.util.HashedWheelTimer#newTimeout`

```java
@Override
public Timeout newTimeout(TimerTask task, long delay, TimeUnit unit) {
    if (task == null) {
        throw new NullPointerException("task");
    }
    if (unit == null) {
        throw new NullPointerException("unit");
    }

    // 获取当前等待任务数
    long pendingTimeoutsCount = pendingTimeouts.incrementAndGet();

    // 如果超出最大等待
    if (maxPendingTimeouts > 0 && pendingTimeoutsCount > maxPendingTimeouts) {
        pendingTimeouts.decrementAndGet();
        throw new RejectedExecutionException("Number of pending timeouts ("
            + pendingTimeoutsCount + ") is greater than or equal to maximum allowed pending "
            + "timeouts (" + maxPendingTimeouts + ")");
    }

    // 尝试启动workerThread，startTime=0时会startTimeInitialized.await()，最终就是调用Worker的run方法
    start();

    // Add the timeout to the timeout queue which will be processed on the next tick.
    // During processing all the queued HashedWheelTimeouts will be added to the correct HashedWheelBucket.
    // 这条算式我们可以稍微改下，更容易理解些：
    // long deadline = System.nanoTime() + unit.toNanos(delay) - startTime;
    //                                 ↓
    // long deadline = unit.toNanos(delay) - (System.nanoTime() - startTime)
    // 我感觉这样更容易理解些，含义为： 距离任务执行的剩余时间 = 任务截止时间 - (当前时间 - 任务对象初始化时间)
    long deadline = System.nanoTime() + unit.toNanos(delay) - startTime;

    // Guard against overflow.
    if (delay > 0 && deadline < 0) {
        deadline = Long.MAX_VALUE;
    }

    // 构建任务对象
    HashedWheelTimeout timeout = new HashedWheelTimeout(this, task, deadline);
    // 将任务对象添加到mpsc队列中，mpsc是多生产者单消费者的队列模型，另外mpscQueue是无锁队列，靠的CAS实现的。
    timeouts.add(timeout);
    // 返回任务对象，该对象可以用于取消任务、获取任务信息等
    return timeout;
}
```

这里我们再跟进 start 方法看看：`io.netty.util.HashedWheelTimer#start`

```java
/**
 * Starts the background thread explicitly.  The background thread will
 * start automatically on demand even if you did not call this method.
 *
 * @throws IllegalStateException if this timer has been
 *                               {@linkplain #stop() stopped} already
 */
public void start() {
    switch (WORKER_STATE_UPDATER.get(this)) {
        case WORKER_STATE_INIT:
            if (WORKER_STATE_UPDATER.compareAndSet(this, WORKER_STATE_INIT, WORKER_STATE_STARTED)) {
                // 一半会来到这里，最终就是调用到Worker的run方法
                workerThread.start();
            }
            break;
        case WORKER_STATE_STARTED:
            break;
        case WORKER_STATE_SHUTDOWN:
            throw new IllegalStateException("cannot be started once stopped");
        default:
            throw new Error("Invalid WorkerState");
    }

    // Wait until the startTime is initialized by the worker.
    while (startTime == 0) {
        try {
            // 如果startTime异常，Worker的run方法会处理这种异常，重新唤醒
            startTimeInitialized.await();
        } catch (InterruptedException ignore) {
            // Ignore - it will be ready very soon.
        }
    }
}
```

## 定时任务执行

定时任务的执行逻辑其实就在 Worker 的 run 方法中：`io.netty.util.HashedWheelTimer.Worker#run`

```java
// 用于处理取消的任务
private final Set<Timeout> unprocessedTimeouts = new HashSet<Timeout>();

// 时钟指针转动的次数
private long tick;

@Override
public void run() {
    // Initialize the startTime.
    startTime = System.nanoTime();
    if (startTime == 0) {
        // We use 0 as an indicator for the uninitialized value here, so make sure it's not 0 when initialized.
        startTime = 1;
    }

    // Notify the other threads waiting for the initialization at start().
    // 之前如果startTime=0，就会进入await状态，这里就要唤醒它
    startTimeInitialized.countDown();

    do {
            /*
            * 等待到下一次 tick 时如果没有时间延迟返回tickDuration * (tick + 1);
            * 如果延迟了则不空转，立马返回“当前时间”
            * 这个“当前时间”是什么呢？比如时钟指针原本第三次 tick 是在300ms，但是由于前面的任务阻塞了50ms，导致进来的时候已经是350ms了
            * 那么这里的返回值就会变成350ms，至于返回值变成350ms会怎么样？貌似也没有怎么样，就是不等待马上执行罢了
            */
        final long deadline = waitForNextTick();
        if (deadline > 0) {
            // 与运算取模，取出数组桶的坐标，相信这个没少见过了
            int idx = (int) (tick & mask);
            // 前面说过HashedWheelTimeout是可以取消任务的，其实就是在这里取消的
            processCancelledTasks();
            // 在时间轮中取出“指针指向的块”
            HashedWheelBucket bucket = wheel[idx];
            // 将任务填充到时间块中
            transferTimeoutsToBuckets();
            // 取出任务并执行
            bucket.expireTimeouts(deadline);
            tick++;
        }
    } while (WORKER_STATE_UPDATER.get(HashedWheelTimer.this) == WORKER_STATE_STARTED);

    // Fill the unprocessedTimeouts so we can return them from stop() method.
    for (HashedWheelBucket bucket: wheel) {
        bucket.clearTimeouts(unprocessedTimeouts);
    }
    for (;;) {
        HashedWheelTimeout timeout = timeouts.poll();
        if (timeout == null) {
            break;
        }
        if (!timeout.isCancelled()) {
            unprocessedTimeouts.add(timeout);
        }
    }
    // 处理取消的任务
    processCancelledTasks();
}
```

- 取消任务的逻辑这里就不展开看了，也比较简单，有兴趣自行补充即可。

实现如下：

```java
private void processCancelledTasks() {
    for (;;) {
        HashedWheelTimeout timeout = cancelledTimeouts.poll();
        if (timeout == null) {
            // all processed
            break;
        }
        try {
            timeout.remove();
        } catch (Throwable t) {
            if (logger.isWarnEnabled()) {
                logger.warn("An exception was thrown while process a cancellation task", t);
            }
        }
    }
}
```


看看上面的 transferTimeoutsToBuckets 方法，如果你看不懂上面图中蓝色格子数字是什么意思，那就认真看看这个方法：

`io.netty.util.HashedWheelTimer.Worker#transferTimeoutsToBuckets`

```java
private void transferTimeoutsToBuckets() {
    // transfer only max. 100000 timeouts per tick to prevent a thread to stale the workerThread when it just
    // adds new timeouts in a loop.
    for (int i = 0; i < 100000; i++) {
        HashedWheelTimeout timeout = timeouts.poll();
        // 取出一个任务对象
        if (timeout == null) {
            // all processed
            break;
        }
        // 如果任务被取消了，则直接过掉
        if (timeout.state() == HashedWheelTimeout.ST_CANCELLED) {
            // Was cancelled in the meantime.
            continue;
        }

        /*
        * remainingRounds的含义就是:时钟还要完整转几回才能执行到任务
        * 比如你的任务是在2500ms之后才执行的（deadline = 2500ms），时钟总共10个刻度，而 tickDuration 为100ms，当前时钟指针已经拨动三次（tick=3）
        * 那 2500 / 100 = 25
        * (25 - 3) / 10 约等于 2
        * 2 就表示 时钟转完当前圈（25-10=15），还要再转一圈（15-10），在第三圈才能执行到该任务
        */
        long calculated = timeout.deadline / tickDuration;
        timeout.remainingRounds = (calculated - tick) / wheel.length;
        final long ticks = Math.max(calculated, tick); // Ensure we don't schedule for past.
        int stopIndex = (int) (ticks & mask);
        // 将任务填充到“时间块”中
        HashedWheelBucket bucket = wheel[stopIndex];
        bucket.addTimeout(timeout);
    }
}
```

继续看看上面 run 方法中的 bucket.expireTimeouts(deadline);，这里面就是拿出任务并执行的逻辑： `io.netty.util.HashedWheelTimer.HashedWheelBucket#expireTimeouts`

```java
/**
 * Expire all {@link HashedWheelTimeout}s for the given {@code deadline}.
 */
public void expireTimeouts(long deadline) {
    HashedWheelTimeout timeout = head;

    // process all timeouts
    while (timeout != null) {
        HashedWheelTimeout next = timeout.next;
        // 如果剩余轮数 <=0，则表示当前轮就要执行任务了
        if (timeout.remainingRounds <= 0) {
            next = remove(timeout);
            if (timeout.deadline <= deadline) {
                // 执行任务
                timeout.expire();
            } else {
                // The timeout was placed into a wrong slot. This should never happen.
                throw new IllegalStateException(String.format(
                        "timeout.deadline (%d) > deadline (%d)", timeout.deadline, deadline));
            }
        } else if (timeout.isCancelled()) {
            // 如果任务被取消了
            next = remove(timeout);
        } else {
            // 如果任务没被取消，而且剩余轮数>0，则扣除轮数，让任务继续等到至后面轮数
            timeout.remainingRounds --;
        }
        timeout = next;
    }
}
```

# Netty EventLoop#run

记录了NioEventLoop启动前做的一些事情，并最终找到一个方法run，如果不记得可以回上一节看看，因为这个run方法是本篇以及相关章节的入口。

```java
...
// 检查I/O事件
select(wakenUp.getAndSet(false));
...
// 处理上面select查到的I/O事件
processSelectedKeys();
...
// 运行上面处理的事件集
runAllTasks(ioTime * (100 - ioRatio) / ioRatio);
...
```

本节要追踪的就是select方法，除了正常逻辑以外，还可以看到Netty是如何解决jdk空轮询bug。

一些我的口头名词解释：select操作和检测I/O事件是同一个意思。

## 一些没讲过但是要先知道的前提

Netty中除了普通的任务之外，还会有一些定时任务，而这些定时任务，在执行之前实际上是存储在一个定时任务队列中，这个队列里的元素是按照截止时间排序的（本节会讲到这一点）。

另外，在本节之前的篇章中提到的任务队列都不是定时任务队列，在这一节会简单看一下这个任务队列。

## 开始追踪select方法

首先将视角切回io.netty.channel.nio.NioEventLoop#run，这是起点，如果忘记怎么过来的请看回顾，下面直接开始。

首先找到这一段代码：

```java
select(wakenUp.getAndSet(false));
```

ps: 发现 netty 不同版本之间差异比较大，我看目前的版本已经找不到这一行代码了。

含义：执行select方法，并在执行之前，都标识一个状态，表示当前要进行select操作且处于未唤醒状态。

进入select方法，由于代码很长，下面分段贴，此处【坐标1】： io.netty.channel.nio.NioEventLoop#select

```java
Selector selector = this.selector;
try {
    int selectCnt = 0;
    long currentTimeNanos = System.nanoTime();
    long selectDeadLineNanos = currentTimeNanos + delayNanos(currentTimeNanos);
    for (;;) {
        long timeoutMillis = (selectDeadLineNanos - currentTimeNanos + 500000L) / 1000000L;
        if (timeoutMillis <= 0) {
            if (selectCnt == 0) {
                selector.selectNow();
                selectCnt = 1;
            }
            break;
        }
...（略）
```

selector就不多说了

selectCnt大概是一个记录是否有进行select操作的计数器。

currentTimeNanos是当前时间（单位纳秒）。

delayNanos(currentTimeNanos)返回的就是当前时间距离下次定时任务的所剩时间（单位纳秒）。

selectDeadLineNanos就是下次定时任务的开始时间（单位纳秒）。

timeoutMillis（单位毫秒）的含义则需要联系下面的if代码块，只有当下个定时任务开始距离当前时间>=0.5ms，才能继续往下走，否则表示即将有定时任务要执行，之后会调用一个非阻塞的selectNow()

关于上面提到的非阻塞，其实看完源码后仍然我不太理解，因为我追进源码最终还是看到synchronized，也许是指这里的synchronized并未上升到重量级锁。

这里再贴下文档原话，我英语再塑料，也不至于翻译错非阻塞吧：This method performs a non-blocking selection operation。

ps: 这里的非阻塞应该指的是IO模型的非阻塞。synchronized 值得是否为排他锁，是完全的 2 个概念。

这里先不往下看，进入delayNanos方法看看： io.netty.util.concurrent.SingleThreadEventExecutor#delayNanos

```java
protected long delayNanos(long currentTimeNanos) {
    ScheduledFutureTask<?> scheduledTask = peekScheduledTask();
    if (scheduledTask == null) {
        return SCHEDULE_PURGE_INTERVAL;
    }

    return scheduledTask.delayNanos(currentTimeNanos);
}
```

该方法返回的是当前时间距离最近一个定时任务开始的所剩时间。

peekScheduledTask()就是返回一个最近的定时任务。

再看看ScheduledFutureTask这个类，找到它的compareTo方法： io.netty.util.concurrent.ScheduledFutureTask#compareTo

```java
@Override
public int compareTo(Delayed o) {
    if (this == o) {
        return 0;
    }

    ScheduledFutureTask<?> that = (ScheduledFutureTask<?>) o;
    long d = deadlineNanos() - that.deadlineNanos();
    if (d < 0) {
        return -1;
    } else if (d > 0) {
        return 1;
    } else if (id < that.id) {
        return -1;
    } else {
        assert id != that.id;
        return 1;
    }
}
```

可以看到，首先按截止时间排序，当截止时间相同时，再根据任务id排序。

解读了一些时间参数的含义、验证了定时任务是按照截止时间排序后，再次将视角转回io.netty.channel.nio.NioEventLoop#select，继续来看看【坐标1】还没贴出的代码： io.netty.channel.nio.NioEventLoop#select

```java
...(略)
// If a task was submitted when wakenUp value was true, the task didn't get a chance to call
// Selector#wakeup. So we need to check task queue again before executing select operation.
// If we don't, the task might be pended until select operation was timed out.
// It might be pended until idle timeout if IdleStateHandler existed in pipeline.
if (hasTasks() && wakenUp.compareAndSet(false, true)) {
    selector.selectNow();
    selectCnt = 1;
    break;
}

int selectedKeys = selector.select(timeoutMillis);
selectCnt ++;
...(略)
```

第一个if先判断任务队列中是否有任务、将线程设置为唤醒状态是否成功，如果队列中有任务且线程状态更新成功，则调用非阻塞的selectNow，否则继续往下走。

selector.select(timeoutMillis);则是以阻塞方式执行检测I/O事件的操作。

继续往下看代码： io.netty.channel.nio.NioEventLoop#select

```java
if (selectedKeys != 0 || oldWakenUp || wakenUp.get() || hasTasks() || hasScheduledTasks()) {
    // - Selected something,
    // - waken up by user, or
    // - the task queue has a pending task.
    // - a scheduled task is ready for processing
    break;
}
```

含义：如果前面执行过一次同步select 或 oldWakenUp为true 或 线程是唤醒状态 或 普通任务队列里有任务 或 定时任务队列里有任务，都会结束这次for循环。

因为满足了前面任务一个条件，都说明已经进行过一次检测I/O事件了，无需再进行。

### 空轮训 BUG

中间还有个判断线程中断的就跳过了，基本没啥需要解释的，下面来看看一段比较关键的，也正是这段解决了jdk空轮询的bug： io.netty.channel.nio.NioEventLoop#select

```java
long time = System.nanoTime();
    if (time - TimeUnit.MILLISECONDS.toNanos(timeoutMillis) >= currentTimeNanos) {
        // timeoutMillis elapsed without anything selected.
        selectCnt = 1;
    } else if (SELECTOR_AUTO_REBUILD_THRESHOLD > 0 &&
            selectCnt >= SELECTOR_AUTO_REBUILD_THRESHOLD) {
        // The selector returned prematurely many times in a row.
        // Rebuild the selector to work around the problem.
        logger.warn(
                "Selector.select() returned prematurely {} times in a row; rebuilding Selector {}.",
                selectCnt, selector);

        rebuildSelector();
        selector = this.selector;

        // Select again to populate selectedKeys.
        selector.selectNow();
        selectCnt = 1;
        break;
    }

    currentTimeNanos = time;
}//for循环结束
```

time是执行完select后的时间，而currentTimeNanos则是select之前的时间。

time - TimeUnit.MILLISECONDS.toNanos(timeoutMillis) >= currentTimeNanos这段代码含义：

select后时间(纳秒)-换算成纳秒的timeoutMillis>=select开始前时间(纳秒)，则说明已经执行过一次阻塞式select了，计数器=1，这里没有break但之后有， 因为下次再进入for是时间值和计数器都”不符合if”，最终break。

**如果执行代码时，到达了上面if else的前一行，但却没有进入if或else if，就说明发生了空轮询。**

只是空轮询次数低于SELECTOR_AUTO_REBUILD_THRESHOLD（默认512）时在不断重试。

### 解决空轮询bug

再分析一下Netty是如何判断空轮询的：

其实就是将上面if的时间公式反过来想：select操作后时间-timeoutMillis < select操作前时间。

当满足上面这个条件，就说明：selector.select(timeoutMillis);这个阻塞方法并没有阻塞就直接返回了，即发生了空轮询。

而Netty则是靠rebuildSelector();这个方法去解决空轮询bug的，不妨跟进去看看（代码很长，但逻辑还是很简单）： io.netty.channel.nio.NioEventLoop#rebuildSelector

```java
public void rebuildSelector() {
    if (!inEventLoop()) {
        // 保证线程安全
        execute(new Runnable() {
            @Override
            public void run() {
                rebuildSelector();
            }
        });
        return;
    }

    final Selector oldSelector = selector;
    final Selector newSelector;

    if (oldSelector == null) {
        return;
    }

    try {
        newSelector = openSelector();
    } catch (Exception e) {
        logger.warn("Failed to create a new Selector.", e);
        return;
    }

    // Register all channels to the new Selector.
    int nChannels = 0;
    for (;;) {
        try {
            for (SelectionKey key: oldSelector.keys()) {
                // 其实就是Channel
                Object a = key.attachment();
                try {
                    if (!key.isValid() || key.channel().keyFor(newSelector) != null) {
                        continue;
                    }

                    int interestOps = key.interestOps();
                    key.cancel();
                    SelectionKey newKey = key.channel().register(newSelector, interestOps, a);
                    if (a instanceof AbstractNioChannel) {
                        // Update SelectionKey
                        ((AbstractNioChannel) a).selectionKey = newKey;
                    }
                    nChannels ++;
                } catch (Exception e) {
                    logger.warn("Failed to re-register a Channel to the new Selector.", e);
                    if (a instanceof AbstractNioChannel) {
                        AbstractNioChannel ch = (AbstractNioChannel) a;
                        ch.unsafe().close(ch.unsafe().voidPromise());
                    } else {
                        @SuppressWarnings("unchecked")
                        NioTask<SelectableChannel> task = (NioTask<SelectableChannel>) a;
                        invokeChannelUnregistered(task, key, e);
                    }
                }
            }
        } catch (ConcurrentModificationException e) {
            // Probably due to concurrent modification of the key set.
            continue;
        }

        break;
    }

    selector = newSelector;

    try {
        // time to close the old selector as everything else is registered to the new one
        oldSelector.close();
    } catch (Throwable t) {
        if (logger.isWarnEnabled()) {
            logger.warn("Failed to close the old Selector.", t);
        }
    }

    logger.info("Migrated " + nChannels + " channel(s) to the new Selector.");
}
```

Netty解决空轮询bug的手法看上去也很"暴力"，就是重建一个新的selector，并把旧selector上的selectedKeys全部复制到新的selector上，再用新的selector替换旧的selector。

之后再尝试select操作就很可能不会再发生空轮询bug了。


# 和 schedule 对比

关于 schedule 方法加入的定时任务什么时候被执行，在时间操作上和 HashedWheelTimer 大同小异。

schedule 方法也是 Netty 的定时任务实现之一，但是底层的数据结构和 HashedWheelTimer 不一样，schedule 方法用到的数据结构其实和 ScheduledExecutorService 类似，是 PriorityQueue，它是一个优先级的队列。

除此之外，schedule 方法其实也用到 MpscQueue，只是任务执行的时候，会把任务从 PriorityQueue 转移到 MpscQueue 上。

下面来跟踪下 schedule 方法看看，由于主要是看数据结构的区别，所以一些地方在这里我就不深追了

首先来到如下代码：

`io.netty.util.concurrent.AbstractScheduledEventExecutor#schedule(java.lang.Runnable, long, java.util.concurrent.TimeUnit)`

```java
@Override
public <V> ScheduledFuture<V> schedule(Callable<V> callable, long delay, TimeUnit unit) {
    ObjectUtil.checkNotNull(callable, "callable");
    ObjectUtil.checkNotNull(unit, "unit");
    if (delay < 0) {
        delay = 0;
    }
    validateScheduled0(delay, unit);
    return schedule(new ScheduledFutureTask<V>(this, callable, deadlineNanos(unit.toNanos(delay))));
}
```

其中 schedule 实现如下：

```java
private <V> ScheduledFuture<V> schedule(final ScheduledFutureTask<V> task) {
    if (inEventLoop()) {
        scheduleFromEventLoop(task);
    } else {
        final long deadlineNanos = task.deadlineNanos();
        // task will add itself to scheduled task queue when run if not expired
        if (beforeScheduledTaskSubmitted(deadlineNanos)) {
            execute(task);
        } else {
            lazyExecute(task);
            // Second hook after scheduling to facilitate race-avoidance
            if (afterScheduledTaskSubmitted(deadlineNanos)) {
                execute(WAKEUP_TASK);
            }
        }
    }
    return task;
}
```

继续跟进 scheduledTaskQueue()方法：

```java
PriorityQueue<ScheduledFutureTask<?>> scheduledTaskQueue() {
    if (scheduledTaskQueue == null) {
        scheduledTaskQueue = new DefaultPriorityQueue<ScheduledFutureTask<?>>(
                SCHEDULED_FUTURE_TASK_COMPARATOR,
                // Use same initial capacity as java.util.PriorityQueue
                11);
    }
    return scheduledTaskQueue;
}
```

可以看到返回值就是 PriorityQueue，它是一个最小堆实现的优先队列。

# 扩展

## 不同实现的时间复杂度

这里我就直接贴下网上大佬给出的解释：

（1）如果使用最小堆实现的优先级队列：

![最小堆实现](https://img-blog.csdnimg.cn/d28aae73fd5a41fe8e12bacc0baef638.png)

大致意思就是你的任务如果插入到堆顶，时间复杂度为 O(log(n))。

（2）如果使用链表（既然有说道，那就扩展下）：

![链表](https://img-blog.csdnimg.cn/c910b49c353145df801a8e8d18dfca23.png)

中间插入后的事件复杂度为 O(n)

（3）单个时间轮：

![（3）单个时间轮](https://img-blog.csdnimg.cn/04bbf742514e47c8924a8d3dfaa81738.png)

复杂度可以降至 O(1)。

记录轮数的时间轮（其实就是文章开头的那个）：

![记录轮数的时间轮](https://img-blog.csdnimg.cn/b044cd72919942e4a40dd4fb5b208a84.png)

层级时间轮：

![在这里插入图片描述](https://img-blog.csdnimg.cn/8068b333168243f4b9e224143c6aa395.png)

时间复杂度是 O(n)，n 是轮子的数量，除此之外还要计算一个轮子上的 bucket。

## 单时间轮缺点

根据上面的图其实不难理解，如果任务是很久之后才执行的、同时要保证任务低延迟，那么单个时间轮所需的 bucket 数就会变得非常多，从而导致内存占用持续升高（CPU 空转时间还是不变的，仅仅是内存需求变高了），如下图：

![单时间轮缺点](https://img-blog.csdnimg.cn/0ed0bfef89494cabaf7fdba2d1d7667d.png)

Netty 对于单个时间轮的优化方式就是记录下 remainingRounds，从而减少 bucket 过多的内存占用。

## 时间轮和 PriorityQueue 对比

看完上面的时间复杂度对比，你可能会觉得：

- Q：时间轮的复杂度只有 O(1)，schedule 和 ScheduledExecutorService 这种都是 O(log(n))，那时间轮不是碾压吗？

- A：你不要忘了，如果任务是在很久之后才执行的，那么时间轮就会产生很多空转，这是非常浪费 CPU 性能的，这种空转消耗可以通过增大 tickDuration 来避免，但这样做又会产生降低定时任务的精度，可能导致一些任务推到很迟才执行。
- A：而 ScheduledExecutorService 不会有这个问题。

另外，Netty 时间轮的实现模型抽象出来是大概这个样子的：

```java
for(Tasks task : tasks) {
    task.doXxx();
}
```

这个抽象是个什么意思呢？

你要注意一个点，这里的任务循环执行是同步的，**这意味着你第一个任务执行很慢延迟很高，那么后面的任务全都会被堵住**，所以你加进时间轮的任务不可以是耗时任务，比如一些延迟很高的数据库查询，如果有这种耗时任务，最好再嵌入线程池处理，不要让任务阻塞在这一层。

# 参考资料

[【Netty】NioEventLoop的启动（二）：select方法-检查I/O事件](https://wenjie.store/archives/netty-nioeventloop-boot-2)

* any list
{:toc}