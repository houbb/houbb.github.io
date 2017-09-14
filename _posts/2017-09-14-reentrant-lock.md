---
layout: post
title: ReentrantLock
date:  2017-9-14 18:03:18 +0800
categories: [Java]
tags: [java, lock]
published: true
---


# ReentrantLock

- ReconnectThread.class

创建一个可重输锁线程。


```java
public class ReconnectThread extends Thread {

    /**
     * 生命可重入锁
     */
    private static final ReentrantLock reentrantLock = new ReentrantLock();


    /**
     * 用于标识当前线程
     */
    private String name;

    public ReconnectThread(String name) {
        this.name = name;
    }

    @Override
    public void run() {
        reentrantLock.lock();

        try {
            for (int i = 0; i < 5; i++) {
                System.out.println(name+" "+i+" times");
                Thread.sleep(1000);
            }
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            reentrantLock.unlock();
        }

    }
}
```

- Test

```java
public static void main(String[] args) {
    Thread one = new ReconnectThread("one");
    Thread two = new ReconnectThread("two");
    one.start();
    two.start();
}
```

- result

根据结果可知。两个必须要等待另外一个执行完成才能运行。

```
two 0 times
two 1 times
two 2 times
two 3 times
two 4 times
one 0 times
one 1 times
one 2 times
one 3 times
one 4 times
```


* any list
{:toc}





