---
layout: post
title: 轻松学习多线程 15-Thread Special Storage ThreadLocal 模式
date:  2019-1-19 11:21:15 +0800
categories: [Thread]
tags: [thread, java, sh]
published: true
---

# Thread Special Storage 模式

Thread Special Storage 模式是一种即使只有一个入口，也会为每一个线程分配特有的存储空间的模式。

# 实际案例

类信息概览：

| 类名 | 说明 |
|:----|:----|
| Main.java | 方法的总入口 |
| LogInterface.java | 日志接口 |
| ThreadSpecialLog.java | 每个线程分配特有存储空间的类 |
| ClientThread.java | 客户端 |
| Log.java | 创建日志的类 |

## 定义


- LogInterface.java

```java
package com.github.houbb.thread.learn.easy.learn.threadSpecialStorage;

/**
 * 2018/2/4
 *
 * @author houbinbin
 * @version 1.0
 * @since 1.7
 */
public interface LogInterface {

    void printLog(String log);

    void closeLog();

}

```


- ThreadSpecialLog.java

```java
package com.github.houbb.thread.learn.easy.learn.threadSpecialStorage;

import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;

/**
 * 2018/2/4
 *
 * @author houbinbin
 * @version 1.0
 * @since 1.7
 */
public class ThreadSpecialLog implements LogInterface{

    private PrintWriter printWriter = null;

    public ThreadSpecialLog(final String fileName) {
        try {
            printWriter = new PrintWriter(new FileWriter(fileName));
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    @Override
    public void printLog(String log) {
        printWriter.println(log);
    }

    @Override
    public void closeLog() {
        printWriter.print("================= END OF LOG =================");
        printWriter.close();
    }

}

```


- ClientThread.java

```java
package com.github.houbb.thread.learn.easy.learn.threadSpecialStorage;

/**
 * 2018/2/4
 *
 * @author houbinbin
 * @version 1.0
 * @since 1.7
 */
public class ClientThread extends Thread {

    public ClientThread(String threadName) {
        super(threadName);
    }

    @Override
    public void run() {
        System.out.println("MAIN BEGIN...");
        for(int i = 0; i < 10; i++) {
            Log.printLog("log-"+i);
        }
        Log.closeLog();
        System.out.println("MAIN END...");
    }

}

```


- Log.java

```java
package com.github.houbb.thread.learn.easy.learn.threadSpecialStorage;

/**
 * 2018/2/4
 *
 * @author houbinbin
 * @version 1.0
 * @since 1.7
 */
public class Log {

    private static final ThreadLocal<ThreadSpecialLog> tsLogCollection = new ThreadLocal<>();

    public static void printLog(String log) {
        getTsLog().printLog(log);
    }

    public static void closeLog() {
        getTsLog().closeLog();
    }

    private static LogInterface getTsLog() {
        ThreadSpecialLog threadSpecialLog = tsLogCollection.get();
        if(null == threadSpecialLog) {
            String fileName = Thread.currentThread().getName()+"-log.txt";
            threadSpecialLog = new ThreadSpecialLog(fileName);
            tsLogCollection.set(threadSpecialLog);
            return threadSpecialLog;
        }
        return threadSpecialLog;
    }

}

```


## 测试

- Main.java

```java
package com.github.houbb.thread.learn.easy.learn.threadSpecialStorage;

/**
 * 2018/2/4
 *
 * @author houbinbin
 * @version 1.0
 * @since 1.7
 */
public class Main {

    public static void main(String[] args) {
        new ClientThread("One").start();
        new ClientThread("Two").start();
        new ClientThread("Three").start();
    }

}

```

- 测试结果

```
MAIN BEGIN...
MAIN BEGIN...
MAIN BEGIN...
MAIN END...
MAIN END...
MAIN END...
```

# 实现方式

# UML & Code

## UML

UML 图示如下

## Code

代码地址

> [Thread Special Storage](https://github.com/houbb/thread-learn/tree/master/easy-learn/src/main/java/com/github/houbb/thread/learn/easy/learn//Users/houbinbin/IT/OTHER/thread-learn/easy-learn/src/main/java/com/github/houbb/thread/learn/easy/learn/threadSpecialStorage)

# 系列导航

> [多线程系列导航](http://blog.csdn.net/ryo1060732496/article/details/79376415)

* any list
{:toc}