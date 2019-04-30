---
layout: post
title:  Netty-12-关闭
date:  2017-11-16 19:23:06 +0800
categories: [Netty]
tags: [netty, java, sh]
published: true
---

# 关闭

引导使你的应用程序启动并且运行起来，但是迟早你都需要优雅地将它关闭。

当然，你也可以让JVM 在退出时处理好一切，但是这不符合优雅的定义，优雅是指干净地释放资源。

关闭Netty应用程序并没有太多的魔法，但是还是有些事情需要记在心上。

最重要的是，你需要关闭EventLoopGroup，它将处理任何挂起的事件和任务，并且随后释放所有活动的线程。

这就是调用 `EventLoopGroup.shutdownGracefully()` 方法的作用。

这个方法调用将会返回一个 Future，这个 Future 将在关闭完成时接收到通知。

需要注意的是，shutdownGracefully() 方法也是一个异步的操作，所以你需要阻塞等待直到它完成，或者向所返回的Future 注册一个监听器以在关闭完成时获得通知。

## 代码

代码清单8-9 符合优雅关闭的定义。

```java
EventLoopGroup group = new NioEventLoopGroup();
Bootstrap bootstrap = new Bootstrap();
bootstrap.group(group)
.channel(NioSocketChannel.class);
...
Future<?> future = group.shutdownGracefully();
// block until the group has shutdown
future.syncUninterruptibly();
```

或者，你也可以在调用EventLoopGroup.shutdownGracefully()方法之前，显式地在所有活动的 Channel 上调用 Channel.close() 方法。

但是在任何情况下，都请记得关闭 EventLoopGroup 本身。

# 源码

- SingleThreadEventExecutor

```java
    @Override
    public Future<?> shutdownGracefully(long quietPeriod, long timeout, TimeUnit unit) {
        if (quietPeriod < 0) {
            throw new IllegalArgumentException("quietPeriod: " + quietPeriod + " (expected >= 0)");
        }
        if (timeout < quietPeriod) {
            throw new IllegalArgumentException(
                    "timeout: " + timeout + " (expected >= quietPeriod (" + quietPeriod + "))");
        }
        if (unit == null) {
            throw new NullPointerException("unit");
        }

        if (isShuttingDown()) {
            return terminationFuture();
        }

        boolean inEventLoop = inEventLoop();
        boolean wakeup;
        int oldState;
        for (;;) {
            if (isShuttingDown()) {
                return terminationFuture();
            }
            int newState;
            wakeup = true;
            oldState = state;
            if (inEventLoop) {
                newState = ST_SHUTTING_DOWN;
            } else {
                switch (oldState) {
                    case ST_NOT_STARTED:
                    case ST_STARTED:
                        newState = ST_SHUTTING_DOWN;
                        break;
                    default:
                        newState = oldState;
                        wakeup = false;
                }
            }
            if (STATE_UPDATER.compareAndSet(this, oldState, newState)) {
                break;
            }
        }
        gracefulShutdownQuietPeriod = unit.toNanos(quietPeriod);
        gracefulShutdownTimeout = unit.toNanos(timeout);

        if (oldState == ST_NOT_STARTED) {
            doStartThread();
        }

        if (wakeup) {
            wakeup(inEventLoop);
        }

        return terminationFuture();
    }
```


# 个人收获

1. 原理其实就是线程池的关闭。

2. 这里应该有好奇心，为什么 shutdown 被废弃了，怎么个优雅法则？

# 参考资料

《Netty in Action》 P128

* any list
{:toc}