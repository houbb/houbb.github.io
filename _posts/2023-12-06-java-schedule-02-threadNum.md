---
layout: post
title: java 原生方式，创建指定个数定时执行的线程？如何把独立的 kafka 消息，基于内存聚合批量操作？
date: 2023-12-06 21:01:55 +0800
categories: [Log]
tags: [log, elk, sh]
published: true
---

# 需求 1

需要多个线程同时进行，并发执行。同时要求每个线程定时执行，并且线程之间存在一定的时间差。

## 实现

```java
package org.example;

import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

public class FixThreadScheduleService {

    public FixThreadScheduleService(int threadNum, Runnable runnable) {

        // 初始化
        int actualThreadNum = Math.max(1, threadNum);
        ScheduledExecutorService scheduledExecutorService = Executors.newScheduledThreadPool(actualThreadNum);

        // 初始化固定线程，执行对应的任务。
        for(int i = 0; i < threadNum; i++) {
            //1+threadNum * 2L 把每一个线程的时间错开
            scheduledExecutorService.scheduleAtFixedRate(runnable, 1+threadNum * 2L, 2, TimeUnit.SECONDS);
        }
    }

    public static void main(String[] args) {
        FixThreadScheduleService scheduleService = new FixThreadScheduleService(3, new Runnable() {
            @Override
            public void run() {
                System.out.println(Thread.currentThread().getName() + "-hello");
            }
        });
    }

}
```

## 测试日志

```
pool-1-thread-3-hello
pool-1-thread-2-hello
pool-1-thread-1-hello
pool-1-thread-1-hello
pool-1-thread-2-hello
pool-1-thread-3-hello
pool-1-thread-1-hello
pool-1-thread-2-hello
pool-1-thread-3-hello
pool-1-thread-1-hello
pool-1-thread-2-hello
pool-1-thread-3-hello
pool-1-thread-1-hello
pool-1-thread-3-hello
pool-1-thread-2-hello
```

# 需求 2

## 说明

模拟程序每次从 kafka 拉取 2W 的数据。

然后解处理完这些数据，以前执行的时候，直接单个处理落库，但是数据库比较慢，所以需要优化。

将数据合并到内存队列中，然后指定大小后一次入库。入库可以做成同步阻塞，这样方便一些，避免异步压垮数据库。

## 代码实现

```java
package org.example;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.TimeUnit;

public class MessageStore {

    // 设置为可以变化的量
    private static final int SIZE = 100;

    private static final BlockingQueue<String> QUEUE = new ArrayBlockingQueue<>(SIZE+1);

    public synchronized boolean add(String message) {
        // 如果满了
        if(QUEUE.size() >= SIZE) {
            batchSave();
        }

        QUEUE.add(message);

        return true;
    }

    private synchronized void batchSave()  {
        System.out.println("队列已经满了，开始执行批量入库操作....");

        // 构建结果
        List<String> textList = new ArrayList<>();
        for(String text : QUEUE) {
            textList.add(text);
        }

        System.out.println("------------------ 批量入库开始 size=" + textList.size());
        try {
            TimeUnit.SECONDS.sleep(2);
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }
        System.out.println("------------------ 批量入库完成");

        // 清空
        QUEUE.clear();

        System.out.println("队列已经满了，完成执行批量入库操作....");
    }

}
```


## 调用方

```java
package org.example;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.TimeUnit;

public class MessageStoreMain {

    public static void main(String[] args) throws InterruptedException {
        // 全局唯一
        MessageStore messageStore = new MessageStore();

        while (true) {
            List<String> kafkaList = pullDataFromKafka(500);
            for(String kafka : kafkaList) {
                messageStore.add(kafka);
            }

            TimeUnit.SECONDS.sleep(5);
        }
    }

    // 模拟从 kafka 取消息
    private static List<String> pullDataFromKafka(int size) {
        List<String> list = new ArrayList<>();
        for(int i = 0; i < size; i++) {
            list.add(i+"");
        }
        return list;
    }


}
```

## 测试日志

```
队列已经满了，开始执行批量入库操作....
------------------ 批量入库开始 size=100
------------------ 批量入库完成
队列已经满了，完成执行批量入库操作....
队列已经满了，开始执行批量入库操作....
------------------ 批量入库开始 size=100
------------------ 批量入库完成
队列已经满了，完成执行批量入库操作....
队列已经满了，开始执行批量入库操作....
------------------ 批量入库开始 size=100
------------------ 批量入库完成
队列已经满了，完成执行批量入库操作....
队列已经满了，开始执行批量入库操作....
------------------ 批量入库开始 size=100
------------------ 批量入库完成
队列已经满了，完成执行批量入库操作....
队列已经满了，开始执行批量入库操作....
------------------ 批量入库开始 size=100
------------------ 批量入库完成
队列已经满了，完成执行批量入库操作....
队列已经满了，开始执行批量入库操作....
------------------ 批量入库开始 size=100
```

# 参考资料

chat

* any list
{:toc}