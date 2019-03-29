---
layout: post
title:  Netty-05-异步结果的获取 ChannelFuture
date:  2017-11-16 19:23:06 +0800
categories: [Netty]
tags: [netty, java, sh]
published: true
---


# 异步

异步的概念和同步相对。

当一个异步过程调用发出后，调用者不能立刻得到结果。

实际处理这个调用的部件在完成后，通过状态、通知和回调来通知调用者。

异步的好处是不会造成阻塞，在高并发情形下会更稳定和更高的吞吐量。

# ChannelFuture

说到Netty中的异步，就不得不提ChannelFuture。

Netty中的IO操作是异步的，包括bind、write、connect等操作会简单的返回一个ChannelFuture，调用者并不能立刻获得结果。

当future对象刚刚创建时，处于非完成状态。可以通过isDone()方法来判断当前操作是否完成。通过isSuccess()判断已完成的当前操作是否成功，getCause()来获取已完成的当前操作失败的原因，isCancelled()来判断已完成的当前操作是否被取消。

调用者可以通过返回的ChannelFuture来获取操作执行的状态，注册监听函数来执行完成后的操作。

## 同步与异步

其实同步的阻塞和异步的非阻塞可以直接通过代码看出：

### 同步

```java
printTime("开始connect： ");
// Start the connection attempt.
ChannelFuture future = bootstrap.connect(new InetSocketAddress(host, port));

// Wait until the connection is closed or the connection attempt fails.
future.getChannel().getCloseFuture().awaitUninterruptibly();

printTime("connect结束： ");
// Shut down thread pools to exit.
bootstrap.releaseExternalResources();
```

这段代码的输出结果是：

```
开始connect： 2013-07-17 14:45:28

connect结束： 2013-07-17 14:45:29
```

很明显的可以看出，connect操作导致整段代码阻塞了大概1秒。

### 异步

```java
printTime("开始connect： ");
// Start the connection attempt.
ChannelFuture future = bootstrap.connect(new InetSocketAddress(host, port));

future.addListener(new ChannelFutureListener()
{
    public void operationComplete(final ChannelFuture future)throws Exception {
        printTime("connect结束： ");
    }
});

printTime("异步时间： ");
// Shut down thread pools to exit.
bootstrap.releaseExternalResources();
```

输出结果是：

```
开始connect： 2013-07-17 14:50:09
异步时间： 2013-07-17 14:50:09
connect结束： 2013-07-17 14:50:09
```
 
可以明显的看出，在异步模式下，上面这段代码没有阻塞，在执行connect操作后直接执行到 `printTime("异步时间： ")`，随后connect完成，future的监听函数输出connect操作完成。

### 例子

关于同步的阻塞和异步的非阻塞可以打一个很简单的比方，A向B打电话，通知B做一件事。

在同步模式下，A告诉B做什么什么事，然后A依然拿着电话，等待B做完，才可以做下一件事；

在异步模式下，A告诉B做什么什么事，A挂电话，做自己的事。B做完后，打电话通知A做完了。

# 获取结果

目前java 8 之前的异步并发编程的API(callable、future、futuretask)，都有一个共同的问题，就是要获取结果必须阻塞等待。

netty提供了一种通过回调的方式获得结果的办法：

```java
Future<TGroup> future = businessEG.submit(new Callable<TGroup>() {
    @Override
    public TGroup call() throws Exception {
        //从数据库查询
        TGroup group = groupService.getDBTGroupById(gid);
        targetGroupsHM.put(gid, group);
        return group;
    }
});

future.addListener(new GenericFutureListener<Future<? super TGroup>>() {
    @Override
    public void operationComplete(Future<? super TGroup> future) throws Exception {
        //处理返回的结果
        TGroup group = (TGroup) future.get();
        if (group == null) {
            byteBuf.release();
            return;
        }
        sendToSingleGroup(group, byteBuf);
    }
});
```

# 源码分析

如上面代码所显示的，ChannelFuture同时提供了阻塞和非阻塞方法，接下来就简单的分析一下各自是怎么实现的。

## 阻塞方法

阻塞方法是await系列，这些方法要小心翼翼的使用，不可以在handler内调用这些方法，否则会造成死锁。

```java
public ChannelFuture awaitUninterruptibly() {
    boolean interrupted = false;
    synchronized (this) {
        //循环等待到完成
        while (!done) {
            checkDeadLock();
            waiters++;
            try {
                wait();
            } catch (InterruptedException e) {
                //不允许中断
                interrupted = true;
            } finally {
                waiters--;
            }
        }
    }
    if (interrupted) {
        Thread.currentThread().interrupt();
    }
    return this;
}
```

一个标志位，一个while循环，代码简洁明了。

## 非阻塞

非阻塞则是添加监听类ChannelFutureListener，通过覆盖ChannelFutureListener的operationComplete执行业务逻辑。

```java
public void addListener(final ChannelFutureListener listener) {
    if (listener == null) {
        throw new NullPointerException("listener");
    }
    boolean notifyNow = false;
    synchronized (this) {
        if (done) {
            notifyNow = true;
        } else {
            if (firstListener == null) {
                //listener链表头
                firstListener = listener;
            } else {
                if (otherListeners == null) {
                    otherListeners = new ArrayList<ChannelFutureListener>(1);
                }
                //添加到listener链表中，以便操作完成后遍历操作
                otherListeners.add(listener);
            }
           //......
    if (notifyNow) {
        //通知listener进行处理
        notifyListener(listener);
    }
}
```

## 成功

然后当操作完成后直接遍历listener链表，把每个listener取出来执行。

以setSuccess为例，如下：

```java
public boolean setSuccess() {
    synchronized (this) {
        // Allow only once.
        if (done) {
            return false;
        }
        done = true;
        //唤醒所有等待
        if (waiters > 0) {
            notifyAll();
        }
    }
    //通知所有listener
    notifyListeners();
    return true;
}
```

- notifyListeners()

```java
private void notifyListeners() {
    if (firstListener != null) {
        //执行listener表头
        notifyListener(firstListener);
        firstListener = null;
        //挨个执行其余的listener
        if (otherListeners != null) {
            for (ChannelFutureListener l: otherListeners) {
                notifyListener(l);
            }
            otherListeners = null;
        }
    }
}
```

其实这部分代码的逻辑很简单，就是注册回调函数，当操作完成后自动调用回调函数，就达到了异步的效果。

# 参考资料

[Netty推荐addListener回调异步执行](https://www.jianshu.com/p/c7019a8f6c53)

[通过 netty 实现异步任务回调获取执行结果](https://segmentfault.com/a/1190000010370004)

* any list
{:toc}

