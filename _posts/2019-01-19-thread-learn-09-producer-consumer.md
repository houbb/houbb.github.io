---
layout: post
title: 轻松学习多线程 09-Producer Consumer 生产者消费者模式
date:  2019-1-19 11:21:15 +0800
categories: [Thread]
tags: [thread, java, sh]
published: true
---

# Producer Consumer 模式

Producer Consumer 模式是指一个负责生产，一个负责消费。

核心是生产者安全地将数据交给消费者。

# 实际案例

类信息概览：

| 类名 | 说明 |
|:----|:----|
| Main.java | 方法的总入口 |
| ConsumerCakeThread.java | 消费蛋糕的线程 |
| Table.java | 放置蛋糕的桌子 |
| BlockingQueueTable.java | BlockingQueue 实现 |
| ProducerCakeThread.java | 生产蛋糕的线程 |

## 定义

- ConsumerCakeThread.java

```java
package com.github.houbb.thread.learn.easy.learn.producer.consumer;

import java.util.Random;

public class ConsumerCakeThread extends Thread {

    private String name;

    private final Table table;

    public ConsumerCakeThread(String name, Table table) {
        super(name);
        this.table = table;
    }

    @Override
    public void run() {
        Random random = new Random(1000L);
        try {
            while(true) {
                Thread.sleep(random.nextInt(1000));
                String cake = table.take();
            }
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }

}

```


- Table.java

```java
package com.github.houbb.thread.learn.easy.learn.producer.consumer;

/**
 * @see BlockingQueueTable 可以被这个替换
 */
public class Table {

    /**
     * 存放蛋糕的数组
     */
    private String[] cakeArray;

    /**
     * 头
     */
    private int head;

    /**
     * 尾巴
     */
    private int tail;

    private int count;

    private final int size;


    public Table(int size) {
        this.size = size;
        cakeArray = new String[size];
        this.head = 0;
        this.tail = 0;
        this.count = 0;
    }

    public synchronized void put(final String cakeName) throws InterruptedException {
        while(count >= size) {
            wait();
        }

        cakeArray[tail] = cakeName;
        count++;
        tail = (tail + 1) % size;
        System.out.println(Thread.currentThread().getName() + " put cake " + cakeName);

        notifyAll();
    }

    public synchronized String take() throws InterruptedException {
        while (count <= 0) {
            wait();
        }

        String result = cakeArray[head];
        head = (head + 1) % size;
        count--;

        System.out.println(Thread.currentThread().getName() + " take cake " + result);
        notifyAll();

        return result;
    }

}

```


- BlockingQueueTable.java

```java
package com.github.houbb.thread.learn.easy.learn.producer.consumer;

import java.util.concurrent.ArrayBlockingQueue;

/**
 * 使用 queue
 */
public class BlockingQueueTable extends ArrayBlockingQueue<String> {

    public BlockingQueueTable(int size) {
        super(size);
    }

    public void put(final String cakeName) throws InterruptedException {
        super.put(cakeName);
    }

    public String take() throws InterruptedException {
        return super.take();
    }

}

```


- ProducerCakeThread.java

```java
package com.github.houbb.thread.learn.easy.learn.producer.consumer;

import java.util.Random;

public class ProducerCakeThread extends Thread {

    private final Table table;

    private static int id = 0;

    public ProducerCakeThread(String name, Table table) {
        super(name);
        this.table = table;
    }

    @Override
    public void run() {
        Random random = new Random(1000L);
        try {
            while(true) {
                String cakeName = getName()+"-"+genId();
                Thread.sleep(random.nextInt(1000));
                table.put(cakeName);
            }
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }

    private static synchronized int genId() {
        return id++;
    }

}

```


## 测试

- Main.java

```java
package com.github.houbb.thread.learn.easy.learn.producer.consumer;

public class Main {

    public static void main(String[] args) {
        Table table = new Table(3);
        new ConsumerCakeThread("ConsumerCake", table).start();
        new ProducerCakeThread("ProducerCake", table).start();
    }

}

```

- 测试结果

```
ProducerCake put cake ProducerCake-0
ConsumerCake take cake ProducerCake-0
ProducerCake put cake ProducerCake-1
ConsumerCake take cake ProducerCake-1
ProducerCake put cake ProducerCake-2
ConsumerCake take cake ProducerCake-2
ProducerCake put cake ProducerCake-3
ConsumerCake take cake ProducerCake-3
ProducerCake put cake ProducerCake-4
ConsumerCake take cake ProducerCake-4
ProducerCake put cake ProducerCake-5
ConsumerCake take cake ProducerCake-5
```

# 实现方式

# UML & Code

## UML

UML 图示如下

![Producer Consumer ](https://img-blog.csdn.net/20180425182041253?watermark/2/text/aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3J5bzEwNjA3MzI0OTY=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70)

## Code

代码地址

> [Producer Consumer](https://github.com/houbb/thread-learn/tree/master/easy-learn/src/main/java/com/github/houbb/thread/learn/easy/learn//Users/houbinbin/IT/OTHER/thread-learn/easy-learn/src/main/java/com/github/houbb/thread/learn/easy/learn/producer/consumer)

# 系列导航

> [多线程系列导航](http://blog.csdn.net/ryo1060732496/article/details/79376415)

* any list
{:toc}