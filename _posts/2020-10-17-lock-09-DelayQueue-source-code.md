---
layout: post
title:  锁专题（9） DelayQueue 延迟队列源码解析
date:  2020-10-17 16:15:55 +0800
categories: [Lock]
tags: [lock, source-code, queue, data-struct, sf]
published: true
---

# DelayQueue 

## 简介

延迟元素的无限制BlockingQueu，其中元素只能在其延迟到期后才能获取。

当元素的getDelay（TimeUnit.NANOSECONDS）方法返回小于或等于零的值时，就会发生过期。

即使未到期的元素无法使用take或poll删除，它们也被视为普通元素。

此队列不允许 null 元素。

### 思考题

为什么不允许有 null 元素？

其实和其他几篇中类似，这里读者可以阅读下后面的源码解读。

希望读完之后，自己可以得到答案。

## 方法说明

| 方法 | 抛出异常 | 返回值 | 一直阻塞 | 超时退出 |
|:---|:---|:---|:---|:---|
| 插入方法 | add | offer | put | offer(time) |
| 移除方法 | remove | poll | take | poll(time) |
| 检查方法 | element | peek | - | - |


# 入门例子

DelayQueue 非常适合指定时间之后，才能让消费者获取到的场景。

## 延迟对象定义

需要继承自 Delay 接口

```java
private static class DelayElem implements Delayed {
    /**
     * 延迟时间
     */
    private final long delay;
    /**
     * 到期时间
     */
    private final long expire;
    /**
     * 数据
     */
    private final String msg;

    private DelayElem(long delay, String msg) {
        this.delay = delay;
        this.msg = msg;
        //到期时间 = 当前时间+延迟时间
        this.expire = System.currentTimeMillis() + this.delay;
    }
    /**
     * 需要实现的接口，获得延迟时间
     *
     * 用过期时间-当前时间
     * @param unit 时间单位
     * @return 延迟时间
     */
    @Override
    public long getDelay(TimeUnit unit) {
        return unit.convert(this.expire - System.currentTimeMillis() , TimeUnit.MILLISECONDS);
    }
    /**
     * 用于延迟队列内部比较排序
     * <p>
     * 当前时间的延迟时间 - 比较对象的延迟时间
     *
     * @param o 比较对象
     * @return 结果
     */
    @Override
    public int compareTo(Delayed o) {
        return (int) (this.getDelay(TimeUnit.MILLISECONDS) - o.getDelay(TimeUnit.MILLISECONDS));
    }
    @Override
    public String toString() {
        return "DelayElem{" +
                "delay=" + delay +
                ", expire=" + expire +
                ", msg='" + msg + '\'' +
                '}';
    }
}
```

## 写入线程

我们模拟定义一个写入线程。

100ms 执行一次，需要放入 1s 之后才能被获取到。

```java
/**
 * 写入线程
 * @author 老马啸西风
 */
private static class WriteThread extends Thread {
    private final DelayQueue<DelayElem> delayQueue;
    private WriteThread(DelayQueue<DelayElem> delayQueue) {
        this.delayQueue = delayQueue;
    }
    @Override
    public void run() {
        for(int i = 0; i < 3; i++) {
            try {
                TimeUnit.MILLISECONDS.sleep(100);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            DelayElem element = new DelayElem(1000,i+"test");
            delayQueue.offer(element);
            System.out.println(System.currentTimeMillis() + " 放入元素 " + i);
        }
    }
}
```

## 读取线程

读者直接使用一个循环等待，并且输出获取到信息的时间。

```java
/**
 * 读取线程
 * @author 老马啸西风
 */
private static class ReadThread extends Thread {
    private final DelayQueue<DelayElem> delayQueue;
    private ReadThread(DelayQueue<DelayElem> delayQueue) {
        this.delayQueue = delayQueue;
    }
    @Override
    public void run() {
        while (true){
            try {
                DelayElem element =  delayQueue.take();
                System.out.println(System.currentTimeMillis() +" 获取元素：" + element);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }
}
```

## 测试

```java
public static void main(String[] args) throws InterruptedException {
    DelayQueue<DelayElem> delayQueue = new DelayQueue<>();
    new WriteThread(delayQueue).start();
    new ReadThread(delayQueue).start();
}
```

输出日志：

```
1604067494687 放入元素 0
1604067494787 放入元素 1
1604067494887 放入元素 2
1604067495687 获取元素：DelayElem{delay=1000, expire=1604067495686, msg='0test'}
1604067495788 获取元素：DelayElem{delay=1000, expire=1604067495787, msg='1test'}
1604067495888 获取元素：DelayElem{delay=1000, expire=1604067495887, msg='2test'}
```

可以看到我们的元素都是间隔 100ms 放入队列。

获取元素都是等待了对应的 1S。

# 源码解析

知其然，知其所以然。

下面让我们一起学习下 DelayQueue 的源码实现。

## 类定义

```java
public class DelayQueue<E extends Delayed> extends AbstractQueue<E>
    implements BlockingQueue<E> {

}
```

延迟队列继承自 AbstractQueue 类，并且实现了 BlockingQueue 接口。

元素必须实现自 Delayed 接口。

```java
public interface Delayed extends Comparable<Delayed> {

    /**
     * 返回对象需要等待多久
     */
    long getDelay(TimeUnit unit);
}
```

## 基本属性

```java
/**
** 可重入读写锁
*/
private final transient ReentrantLock lock = new ReentrantLock();

/**
** 可重入读写锁对应的条件信息
*/
private final Condition available = lock.newCondition();

/**
** 优先级队列
*/
private final PriorityQueue<E> q = new PriorityQueue<E>();


/**
** 看注释这里使用了 leader-follower 的模式
*/
private Thread leader = null;
```

## 构造器

```java
/**
 * 平淡无奇的构造器
 * @author 老马啸西风
 */
public DelayQueue() {}
/**
 * 根据集合初始化当前队列
 */
public DelayQueue(Collection<? extends E> c) {
    this.addAll(c);
}
```

### addAll()

我们一起来看一下 addAll 方法：

```java
public boolean addAll(Collection<? extends E> c) {
    if (c == null)
        throw new NullPointerException();
    if (c == this)
        throw new IllegalArgumentException();
    boolean modified = false;
    for (E e : c)
        if (add(e))
            modified = true;
    return modified;
}
```

这个方法实际非常简单，是父类 AbstractQueue 中的默认方法。

循环集合，将元素添加到队列中。然后用一个 modified 标记元素是否发生了改变。

### 添加元素方法

```java
public boolean add(E e) {
    return offer(e);
}

public void put(E e) {
    offer(e);
}
```

可见这两个方法都是调用的 offer 方法，实现如下：

```java
public boolean offer(E e) {
    // 获取可重入锁
    final ReentrantLock lock = this.lock;
    lock.lock();
    try {
        // 优先级队列入队
        q.offer(e);

        // 如果队列的第一个元素是插入的元素（插入成功），则设置 leader=null，并且通知等待锁的线程。
        if (q.peek() == e) {
            leader = null;
            available.signal();
        }
        return true;
    } finally {
        lock.unlock();
    }
}
```

## 移除元素

### remove

```java
/**
 * Removes a single instance of the specified element from this
 * queue, if it is present, whether or not it has expired.
 */
public boolean remove(Object o) {
    // 首先获取锁
    final ReentrantLock lock = this.lock;
    lock.lock();
    try {
        // 调用优先级队列的元素移除
        return q.remove(o);
    } finally {
        lock.unlock();
    }
}
```

### poll

```java
/**
 *
 * 指定时间内移除元素
 *
 * @author 老马啸西风
 */
public E poll(long timeout, TimeUnit unit) throws InterruptedException {
    // 时间转换
    long nanos = unit.toNanos(timeout);

    // 获取锁
    final ReentrantLock lock = this.lock;
    lock.lockInterruptibly();
    try {
        // while(true) 循环
        for (;;) {
            // 获取第一个元素
            E first = q.peek();
            if (first == null) {
                // 如果第一个元素不存在，且无需等待，直接返回 null。
                if (nanos <= 0)
                    return null;
                else
                    // 进入等待
                    nanos = available.awaitNanos(nanos);
            } else {
                // 获取第一个元素的延迟时间
                long delay = first.getDelay(NANOSECONDS);
                
                // 如果时间已经到了，直接返回元素。
                if (delay <= 0)
                    return q.poll();

                // 如果等待时间为小于等于0，直接返回 null。
                //? 这个感觉逻辑怪怪的。      
                if (nanos <= 0)
                    return null;

                first = null; // don't retain ref while waiting

                // 如果获取等待的时间小于元素延迟的时间或者有其他线程在处理中，进入等待。
                if (nanos < delay || leader != null)
                    nanos = available.awaitNanos(nanos);
                else {
                    // 设置 leader 为当前线程
                    Thread thisThread = Thread.currentThread();
                    leader = thisThread;
                    try {
                        // 获取需要等待的时间
                        long timeLeft = available.awaitNanos(delay);
                        nanos -= delay - timeLeft;
                    } finally {
                        // 释放当前 Leader 的信息
                        if (leader == thisThread)
                            leader = null;
                    }
                }
            }
        }
    } finally {
        // 最后执行锁的释放，并且唤醒等待的线程。
        if (leader == null && q.peek() != null)
            available.signal();
        lock.unlock();
    }
}
```

### take 方法

```java
/**
 * Retrieves and removes the head of this queue, waiting if necessary
 * until an element with an expired delay is available on this queue.
 *
 * @return the head of this queue
 * @throws InterruptedException {@inheritDoc}
 * @author 老马啸西风
 */
public E take() throws InterruptedException {
    // 获取锁
    final ReentrantLock lock = this.lock;
    lock.lockInterruptibly();
    try {
        for (;;) {
            E first = q.peek();
            // 如果第一个元素为 null，则进入等待
            if (first == null)
                available.await();
            else {
                // 获取第一个元素的等待时间
                long delay = first.getDelay(NANOSECONDS);
                // 等待时间到了，直接执行 poll 返回元素。
                if (delay <= 0)
                    return q.poll();
                first = null; // don't retain ref while waiting

                // 当前有其他线程再处理，则进入等待。
                if (leader != null)
                    available.await();
                else {
                    // 设置 leader 为当前线程
                    // 个人理解：通过 leader 控制并发，不过这个 Thread 变量可以保证多线程间可见性吗？
                    Thread thisThread = Thread.currentThread();
                    leader = thisThread;
                    try {
                        // 执行等待
                        available.awaitNanos(delay);
                    } finally {
                        // 释放 leader 信息
                        if (leader == thisThread)
                            leader = null;
                    }
                }
            }
        }
    } finally {
        // 释放锁并且通知其他等待线程
        if (leader == null && q.peek() != null)
            available.signal();
        lock.unlock();
    }
}
```

# 小结

DelayQueue 我也一直听闻很久，不过平时没有自己使用过。现在发现 DelayQueue 执行定时延期执行，还是非常好用的。

本文从 DelayQeueu 的入门使用开始，逐步深入介绍了源码实现原理。

不知道文章开头的思考题你有自己的答案了吗？

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位**极客**的点赞收藏转发，是老马持续写作的最大动力！

# 参考资料

jdk 源码

[DelayQueue 的使用](https://blog.csdn.net/hsqingwei/article/details/88850835)

[Java延时队列DelayQueue的使用](https://my.oschina.net/lujianing/blog/705894)

* any list
{:toc}