---
layout: post
title: 轻松学习多线程 12-Worker Thread 有活就干模式
date:  2019-1-19 11:21:15 +0800
categories: [Thread]
tags: [thread, java, sh]
published: true
---

# Worker Thread 模式

Worker Thread 模式就是没有工作就一直等待，工作来了就进行处理。

# 实际案例

类信息概览：

| 类名 | 说明 |
|:----|:----|
| Main.java | 方法的总入口 |
| ClientThread.java | 客户端线程 |
| Channel.java | 通道 |
| WorkerThread.java | 工人线程 |
| Request.java | 请求 |

## 定义


- ClientThread.java

```java
package com.github.houbb.thread.learn.easy.learn.workerThread;

import com.github.houbb.thread.learn.easy.learn.ThreadUtil;
import com.github.houbb.thread.learn.easy.learn.id.IdGen;
import com.github.houbb.thread.learn.easy.learn.id.IncreaseIdGen;

/**
 * 2018/2/3
 *
 * @author houbinbin
 * @version 1.0
 * @since 1.7
 */
public class ClientThread extends Thread {

    private final Channel channel;

    public ClientThread(String name, Channel channel) {
        super(name);
        this.channel = channel;
    }

    @Override
    public void run() {
        IdGen idGen = new IncreaseIdGen();
        while(true) {
            Request request = new Request(getName(), idGen.genId());
            try {
                channel.putRequest(request);
                ThreadUtil.sleepRandom();

            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }

}

```


- Channel.java

```java
package com.github.houbb.thread.learn.easy.learn.workerThread;

/**
 * 2018/2/3
 *
 * @author houbinbin
 * @version 1.0
 * @since 1.7
 */
public class Channel {

    /**
     * 最大存储数量
     */
    private static final int MAX_SIZE = 100;

    /**
     * 存储 request 的位置
     */
    private int tail = 0;

    /**
     * 取出  request 的位置
     */
    private int head = 0;

    /**
     * request 的数量
     */
    private int count = 0;

    private Request[] requestQueue = new Request[MAX_SIZE];

    /**
     * 线程池
     */
    private WorkerThread[] threadsPool;

    public Channel(int threads) {
        threadsPool = new WorkerThread[threads];

        for(int i = 0; i < threads; i++) {
            threadsPool[i] = new WorkerThread("Worker-"+i, this);
        }

        /**
         * 默认开启
         */
        workerThreadStart();
    }

    private void workerThreadStart() {
        for(WorkerThread workerThread : threadsPool) {
            workerThread.start();
        }
    }


    public synchronized void putRequest(Request request) throws InterruptedException {
        while (count >= requestQueue.length) {
            wait();
        }

        requestQueue[tail] = request;
        count++;
        tail = (tail+1) % requestQueue.length;  //移动位置
        System.out.println("put...");
        notifyAll();
    }

    public synchronized Request takeRequest() throws InterruptedException {
        while (count <= 0) {
            wait();
        }

        Request request = requestQueue[head];
        head = (head+1) % requestQueue.length;  //移动位置
        count--;
        notifyAll();
        System.out.println("take...");
        return request;
    }

}

```


- WorkerThread.java

```java
package com.github.houbb.thread.learn.easy.learn.workerThread;

/**
 * 2018/2/3
 *
 * @author houbinbin
 * @version 1.0
 * @since 1.7
 */
public class WorkerThread extends Thread {

    private final Channel channel;

    public WorkerThread(String name, Channel channel) {
        super(name);
        this.channel = channel;
    }

    @Override
    public void run() {
        while(true) {
            Request request = null;
            try {
                request = channel.takeRequest();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            request.doSomething();
        }
    }

}

```


- Request.java

```java
package com.github.houbb.thread.learn.easy.learn.workerThread;

/**
 * 2018/2/3
 *
 * @author houbinbin
 * @version 1.0
 * @since 1.7
 */
public class Request {

    private String name;

    private String number;

    public Request(String name, String number) {
        this.name = name;
        this.number = number;
    }

    public void doSomething() {
        System.out.println(Thread.currentThread().getName() + " execute " + this);
    }

    @Override
    public String toString() {
        return "Request{" +
                "name='" + name + '\'' +
                ", number='" + number + '\'' +
                '}';
    }

}

```


## 测试

- Main.java

```java
package com.github.houbb.thread.learn.easy.learn.workerThread;

/**
 * 2018/2/3
 *
 * @author houbinbin
 * @version 1.0
 * @since 1.7
 */
public class Main {

    public static void main(String[] args) {
        Channel channel = new Channel(5);
        new ClientThread("one", channel).start();
        new ClientThread("two", channel).start();
        new ClientThread("three", channel).start();
    }

}

```

- 测试结果

```
put...
take...
put...
Worker-3 execute Request{name='two', number='0'}
put...
take...
Worker-3 execute Request{name='three', number='0'}
take...
Worker-0 execute Request{name='one', number='0'}
put...
take...
Worker-3 execute Request{name='three', number='1'}
put...
take...
Worker-1 execute Request{name='one', number='1'}
put...
take...
Worker-1 execute Request{name='two', number='1'}
put...
take...
Worker-2 execute Request{name='three', number='2'}
```

# 实现方式

# UML & Code

## UML

![Worker Thread](https://img-blog.csdn.net/2018042518463070?watermark/2/text/aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3J5bzEwNjA3MzI0OTY=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70)

## Code

代码地址

> [Worker Thread](https://github.com/houbb/thread-learn/tree/master/easy-learn/src/main/java/com/github/houbb/thread/learn/easy/learn//Users/houbinbin/IT/OTHER/thread-learn/easy-learn/src/main/java/com/github/houbb/thread/learn/easy/learn/workerThread)

# 系列导航

> [多线程系列导航](http://blog.csdn.net/ryo1060732496/article/details/79376415)

* any list
{:toc}