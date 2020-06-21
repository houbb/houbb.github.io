---
layout: post
title: 轻松学习多线程 10-Read Write Lock 读写锁模式
date:  2019-1-19 11:21:15 +0800
categories: [Thread]
tags: [thread, java, sh]
published: true
---

# Read Write Lock 模式

Read Write Lock 模式就是将内容的读取和写入分开进行处理。

因为数据的互斥需要牺牲性能，读的时候可以互不影响，但是读的时候禁止写。

# 实际案例

类信息概览：

| 类名 | 说明 |
|:----|:----|
| Main.java | 方法的总入口 |
| WriterThread.java | 写线程 |
| MyReadWriteLock.java | 自定义读写锁 |
| ReadWriteLock.java | 读写锁 |
| ReaderThread.java | 读线程 |
| Data.java | 数据对象 |

## 定义


- WriterThread.java

```java
package com.github.houbb.thread.learn.easy.learn.rwlock;

import com.github.houbb.thread.learn.easy.learn.CharUtil;
import com.github.houbb.thread.learn.easy.learn.ThreadUtil;

public class WriterThread extends Thread {

    private Data data;

    public WriterThread(Data data) {
        super("WriterThread");
        this.data = data;
    }

    @Override
    public void run() {
        while(true) {
            char c = CharUtil.nextChar();
            try {
                System.out.println(Thread.currentThread().getName() + " writes " + c);
                data.write(c);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            ThreadUtil.sleepRandom();
        }
    }
}

```


- MyReadWriteLock.java

```java
package com.github.houbb.thread.learn.easy.learn.rwlock;

/**
 * 读写冲突
 * 写写冲突
 */
public class MyReadWriteLock implements ReadWriteLock {

    private int readingReaders = 0; //正在读的
    private int waitingWriters = 0; //等待写的
    private int writingWriters = 0; //正在写的

    private boolean preferWriter = true;   //写优先

    @Override
    public synchronized void readLock() throws InterruptedException {
        while(writingWriters > 0
                || (preferWriter && waitingWriters > 0)) {
            wait();
        }
        readingReaders++;   //读+1
    }

    @Override
    public synchronized void readUnLock() {
        if(readingReaders > 0) {
            readingReaders--;
        }
        preferWriter = true;    //优先写
        notifyAll();
    }

    @Override
    public synchronized void writeLock() throws InterruptedException {
        waitingWriters++;

        try {
            while(writingWriters > 0
                    || readingReaders > 0) {
                wait();
            }
        } finally {
            waitingWriters--;
        }

        writingWriters++;
    }

    @Override
    public synchronized void writeUnLock() {
        writingWriters--;
        preferWriter = false;
        notifyAll();
    }

}

```


- ReadWriteLock.java

```java
package com.github.houbb.thread.learn.easy.learn.rwlock;

public interface ReadWriteLock {

    void readLock() throws InterruptedException;

    void readUnLock() throws InterruptedException;

    void writeLock() throws InterruptedException;

    void writeUnLock() throws InterruptedException;

}

```


- ReaderThread.java

```java
package com.github.houbb.thread.learn.easy.learn.rwlock;

import com.github.houbb.thread.learn.easy.learn.ThreadUtil;

public class ReaderThread extends Thread {

    private Data data;

    public ReaderThread(Data data) {
        this.data = data;
    }

    @Override
    public void run() {
        while(true) {
            try {
                char[] chars = data.read();
                System.out.println(Thread.currentThread().getName() + " reads " + String.valueOf(chars));
                ThreadUtil.sleepRandom();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }
}

```


- Data.java

```java
package com.github.houbb.thread.learn.easy.learn.rwlock;

import com.github.houbb.thread.learn.easy.learn.ThreadUtil;

import java.util.Arrays;

public class Data {

    private final int size;

    private char[] buffer;

    private final ReadWriteLock readWriteLock = new MyReadWriteLock();

    public Data(int size) {
        this.size = size;
        buffer = new char[size];

        initBuffer();
    }

    private void initBuffer() {
        Arrays.fill(buffer, '*');
    }

    public char[] read() throws InterruptedException {
        readWriteLock.readLock();
        try {
            //copy current value
            char[] result = new char[size];
            System.arraycopy(buffer, 0, result, 0, size);
            ThreadUtil.sleep(50);
            return result;
        } finally {
            readWriteLock.readUnLock();
        }
    }

    public void write(char c) throws InterruptedException {
        readWriteLock.writeLock();

        //do write
        try {
            Arrays.fill(buffer, c);
            ThreadUtil.sleep(50);
        } finally {
            readWriteLock.writeUnLock();
        }

    }

}

```


## 测试

- Main.java

```java
package com.github.houbb.thread.learn.easy.learn.rwlock;

public class Main {

    public static void main(String[] args) {
        Data data = new Data(10);

        new ReaderThread(data).start();
        new ReaderThread(data).start();
        new WriterThread(data).start();
    }
}

```

- 测试结果

```
```

# 实现方式

# UML & Code

## UML

![Read Write Lock](https://img-blog.csdn.net/20180425184118132?watermark/2/text/aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3J5bzEwNjA3MzI0OTY=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70)

## Code

代码地址

> [Read Write Lock](https://github.com/houbb/thread-learn/tree/master/easy-learn/src/main/java/com/github/houbb/thread/learn/easy/learn//Users/houbinbin/IT/OTHER/thread-learn/easy-learn/src/main/java/com/github/houbb/thread/learn/easy/learn/rwlock)

# 系列导航

> [多线程系列导航](http://blog.csdn.net/ryo1060732496/article/details/79376415)

* any list
{:toc}