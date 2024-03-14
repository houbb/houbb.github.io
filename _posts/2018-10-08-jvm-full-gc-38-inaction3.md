---
layout: post
title: JVM FULL GC 生产问题 III-多线程执行队列的封装实现 线程通用实现
date: 2018-10-08 23:36:46 +0800
categories: [Java]
tags: [jvm, gc, bytecode, sh]
published: true
---

# 拓展阅读

[JVM FULL GC 生产问题 I-多线程通用实现](https://houbb.github.io/2018/10/08/jvm-full-gc-37-inaction)

[JVM FULL GC 生产问题 II-如何定位内存泄露？ 线程通用实现](https://houbb.github.io/2018/10/08/jvm-full-gc-38-inaction2)

[JVM FULL GC 生产问题 III-多线程执行队列的封装实现，进一步抽象](https://houbb.github.io/2018/10/08/jvm-full-gc-38-inaction3)

[java 多线程实现通用方法 threadpool implement in java](https://houbb.github.io/2018/10/08/jvm-full-gc-39-inaction4)

# 情景回顾

我们在上一篇 [JVM FULL GC 生产问题笔记](https://houbb.github.io/2018/10/08/jvm-full-gc-37-inaction) 中提出了如何更好的实现一个多线程消费的实现方式。

没有看过的小伙伴建议看一下。

本来以为一切都可以结束的，不过又发生了一点点意外，这里记录一下，避免自己和小伙伴们踩坑。

但是上一篇的文章还是存在一点不足，原来的**实现无法直接复用**。

为什么无法复用呢？因为不够抽象！

# java 实现

## 接口定义

```java
public interface IQueueService<T> {

    void handle(final Request request);

}
```

Request 就是我们业务中的入参对象。

## 抽象类实现

```java
package com.github.houbb.queue.service.queue;

import com.github.houbb.queue.service.dto.Request;

import java.util.List;
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicLong;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
public abstract class AbstractQueueService<T> implements IQueueService<T> {

    private ArrayBlockingQueue<T> queue = null;

    /**
     * 计算总数
     */
    private AtomicLong counter = null;

    /**
     * 分页大小
     * @return 大小
     */
    protected int getPageSize() {
        return  10000;
    }

    /**
     * 线程数量
     * @return 数量
     */
    protected int getThreadNum() {
        return 10;
    }

    /**
     * 等待的毫秒数
     * @return 等待
     */
    protected long getAwaitMills() {
        return 3000;
    }

    public AbstractQueueService() {
        final int threadNum = getThreadNum();

        //1. 初始化
        Executor executor = Executors.newFixedThreadPool(threadNum);
        this.queue = new ArrayBlockingQueue<T>(2 * getPageSize(), true);
        this.counter = new AtomicLong(0);

        //2. 初始化消费者线程
        for(int i = 0; i < threadNum; i++) {
            ConsumerTask task = new ConsumerTask();
            executor.execute(task);
            System.out.println(this.getClass().getSimpleName() + "消费者线程-" + i + " 启动完成");
        }
    }

    /**
     * 查询总数
     * @param request 条件
     * @return 结果
     */
    protected abstract int queryCount(Request request);

    /**
     * 查询列表
     * @param pageNum 当前页
     * @param pageSize 大小
     * @param request 请求
     * @return 结果
     */
    protected abstract List<T> queryList(int pageNum, int pageSize, Request request);

    /**
     * 查询列表
     * @param request 请求
     * @return 结果
     */
    protected abstract List<T> queryByIds(Request request);

    /**
     * 单个处理逻辑
     * @param t 单个实体
     */
    protected abstract void doHandle(T t);

    /**
     * 核心处理逻辑
     * @param request 请求参数
     */
    public void handle(Request request) {
        System.out.println("接收到参数：" + request);
        counter = new AtomicLong(0);

        //1. 是否为多线程模式
        boolean threadFlag = request.isThread();

        if(threadFlag) {
            // 分页查询
            int pageSize = getPageSize();
            int total = this.queryCount(request);
            int totalPage = total / pageSize;

            for(int i = 1; i <= totalPage; i++) {
                // 等待消费者处理已有的信息
                awaitQueue();

                System.out.println("开始查询第"+i+"页");
                List<T> list = this.queryList(i, pageSize, request);
                System.out.println("完成查询第"+i+"页");

                // 直接往队列里面扔
                queue.addAll(list);
            }
        } else {
            // 根据传入的列表判断
            List<String> ids = request.getList();
            List<T> queryList = this.queryByIds(request);

            // 如果列表为空。

            for(T t : queryList) {
                this.doHandle(t);
            }
        }
    }

    // 消费线程任务
    private class ConsumerTask implements Runnable {
        @Override
        public void run() {
            while (true) {
                try {
                    T t = queue.take();
                    doHandle(t);

                    long count = counter.incrementAndGet();
                    System.out.println(this.getClass().getSimpleName()+" 已完成：" + count);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        }
    }

    /**
     * 等待，直到 queue 的小于等于 limit，才进行生产处理
     */
    private void awaitQueue() {
        int limit = this.getPageSize();
        while (true) {
            // 获取阻塞队列的大小
            int size = queue.size();

            if(size >= limit) {
                try {
                    // 根据实际的情况进行调整
                    Thread.sleep(getAwaitMills());
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            } else {
                break;
            }
        }
    }

}
```

## 实现类

### MenuQueueService

```java
package com.github.houbb.queue.service.queue;

import com.github.houbb.queue.service.dal.entity.Menu;
import com.github.houbb.queue.service.dto.Request;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
public class MenuQueueService extends AbstractQueueService<Menu> {

    @Override
    protected int queryCount(Request request) {
        return 50000;
    }

    @Override
    protected List<Menu> queryList(int pageNum, int pageSize, Request request) {
        List<Menu> list = new ArrayList<Menu>();
        for(int i = 0; i < pageSize; i++) {
            Menu menu = new Menu();
            menu.setName(UUID.randomUUID().toString());
            list.add(menu);
        }
        return list;
    }

    @Override
    protected List<Menu> queryByIds(Request request) {
        return null;
    }

    @Override
    protected void doHandle(Menu menu) {
        System.out.println("开始处理：" + menu);
    }

}
```

### UserQueueService

```java
package com.github.houbb.queue.service.queue;

import com.github.houbb.queue.service.dal.entity.User;
import com.github.houbb.queue.service.dto.Request;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
public class UserQueueService extends AbstractQueueService<User> {

    @Override
    protected int queryCount(Request request) {
        return 50000;
    }

    @Override
    protected List<User> queryList(int pageNum, int pageSize, Request request) {
        List<User> list = new ArrayList<User>();
        for(int i = 0; i < pageSize; i++) {
            User user = new User();
            user.setName(UUID.randomUUID().toString());
            list.add(user);
        }
        return list;
    }

    @Override
    protected List<User> queryByIds(Request request) {
        return null;
    }

    @Override
    protected void doHandle(User user) {
        System.out.println("开始处理：" + user);
    }

}
```

## 测试类

```java
package com.github.houbb.queue.service.queue;

import com.github.houbb.queue.service.dto.Request;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
public class Main {

    public static void main(String[] args) {
        Request request = new Request();
        request.setThread(true);

        UserQueueService userQueueService = new UserQueueService();
        userQueueService.handle(request);

        MenuQueueService menuQueueService = new MenuQueueService();
        menuQueueService.handle(request);
    }

}
```

这样 2 个类实际上是完全独立的实现。

# 小结

经过这样的抽象之后，省去了我们很多写代码的时间。

也避免了 copy 的时间消耗。

**架构，就是抽象。**

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次相遇。

* any list
{:toc}