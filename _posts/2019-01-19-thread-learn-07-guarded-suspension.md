---
layout: post
title: 轻松学习多线程 07-Guarded Suspension 模式 等待唤醒
date:  2019-1-19 11:21:15 +0800
categories: [Thread]
tags: [thread, java, sh]
published: true
---

# Guarded Suspension 模式

Guarded Suspension 模式通过让**线程等待**保证线程的安全性。

# 实际案例

类信息概览：

| 类名 | 说明 |
|:----|:----|
| Main.java | 方法的总入口 |
| ClientThread.java | 发送请求的类 |
| ServerThread.java | 接受请求的类 |
| RequestQueue.java | 依次存放请求的类 |
| Request.java | 标识一个请求的类 |

## 定义


- ClientThread.java

```java
package com.github.houbb.thread.learn.easy.learn.guarded.suspension;

import java.util.Random;

public class ClientThread extends Thread {

    private final Random random;

    private final RequestQueue requestQueue;

    public ClientThread(RequestQueue requestQueue, final String name, final long seed) {
        super(name);
        this.requestQueue = requestQueue;
        random = new Random(seed);
    }

    @Override
    public void run() {
        for(int i = 0; i < 10; i++) {
            Request request = new Request("No. " + i);
            requestQueue.putRequest(request);
            System.out.println(Thread.currentThread().getName() + " put " + request);
            try {
                Thread.sleep(random.nextInt(1000));
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }

}

```


- ServerThread.java

```java
package com.github.houbb.thread.learn.easy.learn.guarded.suspension;

import java.util.Random;

public class ServerThread extends Thread {

    private final Random random;

    private final RequestQueue requestQueue;

    public ServerThread(RequestQueue requestQueue, final String name, final long seed) {
        super(name);
        this.requestQueue = requestQueue;
        random = new Random(seed);
    }

    @Override
    public void run() {
        for(int i = 0; i < 10; i++) {
            Request request = requestQueue.getRequest();
            System.out.println(Thread.currentThread().getName()+" get "+request);
            try {
                Thread.sleep(random.nextInt(1000));
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }

}

```


- RequestQueue.java

```java
package com.github.houbb.thread.learn.easy.learn.guarded.suspension;

import java.util.LinkedList;
import java.util.Queue;

public class RequestQueue {

    private Queue<Request> requestQueue = new LinkedList<>();

    /**
     * 获取一个对象
     * 1. 如果队列为空，则一直等待。
     * @return
     */
    public synchronized Request getRequest() {
        while(requestQueue.peek() == null) {
            try {
                wait();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
        // Retrieves and removes the head of this queue.
        return requestQueue.remove();
    }

    /**
     * 放置一个对象
     * @param request
     */
    public synchronized void putRequest(Request request) {
        requestQueue.add(request);

        notifyAll();
    }

}

```


- Request.java

```java
package com.github.houbb.thread.learn.easy.learn.guarded.suspension;

/**
 * 请求参数
 * @version 1.0.0
 * @author bbhou
 * @since 1.0.0
 */
public class Request {

    private final String name;

    public Request(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }

    @Override
    public String toString() {
        return "Request{" +
                "name='" + name + '\'' +
                '}';
    }
}

```


## 测试

- Main.java

```java
package com.github.houbb.thread.learn.easy.learn.guarded.suspension;

public class Main {

    public static void main(String[] args) {
        RequestQueue requestQueue = new RequestQueue();
        new ClientThread(requestQueue, "CLIENT", 10000L).start();
        new ServerThread(requestQueue, "SERVER", 20000L).start();
    }

}

```

- 测试结果

```
CLIENT put Request{name='No. 0'}
SERVER get Request{name='No. 0'}
CLIENT put Request{name='No. 1'}
SERVER get Request{name='No. 1'}
CLIENT put Request{name='No. 2'}
CLIENT put Request{name='No. 3'}
SERVER get Request{name='No. 2'}
SERVER get Request{name='No. 3'}
CLIENT put Request{name='No. 4'}
CLIENT put Request{name='No. 5'}
SERVER get Request{name='No. 4'}
CLIENT put Request{name='No. 6'}
CLIENT put Request{name='No. 7'}
SERVER get Request{name='No. 5'}
CLIENT put Request{name='No. 8'}
SERVER get Request{name='No. 6'}
CLIENT put Request{name='No. 9'}
SERVER get Request{name='No. 7'}
SERVER get Request{name='No. 8'}
SERVER get Request{name='No. 9'}
```

# 实现方式

# UML & Code

## UML

UML 图示如下

![UML](https://imgconvert.csdnimg.cn/aHR0cHM6Ly9pbWctYmxvZy5jc2RuLm5ldC8yMDE4MDMyMDIwMzI0ODgwNj93YXRlcm1hcmsvMi90ZXh0L0x5OWliRzluTG1OelpHNHVibVYwTDNKNWJ6RXdOakEzTXpJME9UWT0vZm9udC81YTZMNUwyVC9mb250c2l6ZS80MDAvZmlsbC9JMEpCUWtGQ01BPT0vZGlzc29sdmUvNzA?x-oss-process=image/format,png)

## Code

代码地址

> [Guarded Suspension](https://github.com/houbb/thread-learn/tree/master/easy-learn/src/main/java/com/github/houbb/thread/learn/easy/learn/guarded/suspension)

# 系列导航

> [多线程系列导航](http://blog.csdn.net/ryo1060732496/article/details/79376415)

* any list
{:toc}