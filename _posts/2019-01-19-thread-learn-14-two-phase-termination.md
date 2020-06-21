---
layout: post
title: 轻松学习多线程 14-Two Phase Termination 安全的终止线程模式
date:  2019-1-19 11:21:15 +0800
categories: [Thread]
tags: [thread, java, sh]
published: true
---

# Two Phase Termination 模式

Two Phase Termination 模式表示先执行完终止处理，再终止线程的模式。

## 模式特点

- 安全的终止线程

- 必定会进行线程终止

- 发出请求后尽快响应终止处理

# 实际案例

类信息概览：

| 类名 | 说明 |
|:----|:----|
| Main.java | 方法的总入口 |
| CounterUpThread.java | 进行计数的线程类 |

## 定义


- CounterUpThread.java

```java
package com.github.houbb.thread.learn.easy.learn.twoPhaseTerminal;

/**
 * 2018/2/3
 *
 * @author houbinbin
 * @version 1.0
 * @since 1.7
 */
public class CounterUpThread extends Thread {

    private long counter = 0;

    private volatile boolean isShutdownRequest = false;

    /**
     * 终止请求
     * @see Thread#interrupt() 打断当前的 sleep() and wait(); 提高响应速度
     */
    public void shutdownRequest() {
        isShutdownRequest = true;
        interrupt();
    }

    /**
     * 状态
     * @return
     */
    public boolean getIsShutdownRequest() {
        return isShutdownRequest;
    }

    @Override
    public void run() {

        try {
            while(!getIsShutdownRequest()) {
                doWork();
            }
        } catch (InterruptedException e) {
            //ignore
        } finally {
            doShutDown();
        }
    }

    private void doWork() throws InterruptedException {
        counter++;
        System.out.println("doWork counter = " + counter);
        Thread.sleep(1000);
    }

    private void doShutDown() {
        isShutdownRequest = false;
        System.out.println("doShutDown counter = " + counter);
    }
}

```

## 测试

- Main.java

```java
package com.github.houbb.thread.learn.easy.learn.twoPhaseTerminal;

import com.github.houbb.thread.learn.easy.learn.ThreadUtil;

/**
 * 2018/2/3
 *
 * @author houbinbin
 * @version 1.0
 * @since 1.7
 */
public class Main {

    public static void main(String[] args) throws InterruptedException {
        System.out.println("Main BEGIN...");
        CounterUpThread counterUpThread = new CounterUpThread();
        System.out.println("counterUpThread START...");
        counterUpThread.start();

        ThreadUtil.sleep(1000);

        System.out.println("counterUpThread shutdown...");
        counterUpThread.shutdownRequest();

        System.out.println("Main JOIN...");
        counterUpThread.join(); //等待线程终止

        System.out.println("Main END...");
    }
}

```

- 测试结果

```
Main BEGIN...
counterUpThread START...
doWork counter = 1
counterUpThread shutdown...
doWork counter = 2
Main JOIN...
doShutDown counter = 2
Main END...

Process finished with exit code 0
```

# 实现方式

# UML & Code

## UML

![Two Phase Termination](https://img-blog.csdn.net/2018042619054382?watermark/2/text/aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3J5bzEwNjA3MzI0OTY=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70)

## Code

代码地址

> [Two Phase Termination](https://github.com/houbb/thread-learn/tree/master/easy-learn/src/main/java/com/github/houbb/thread/learn/easy/learn//Users/houbinbin/IT/OTHER/thread-learn/easy-learn/src/main/java/com/github/houbb/thread/learn/easy/learn/twoPhaseTerminal)

# 系列导航

> [多线程系列导航](http://blog.csdn.net/ryo1060732496/article/details/79376415)

* any list
{:toc}