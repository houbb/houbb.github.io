---
layout: post
title: 轻松学习多线程 08-balking 不需要就算了
date:  2019-1-19 11:21:15 +0800
categories: [Thread]
tags: [thread, java, sh]
published: true
---

# Balking 模式

Balking 模式是指如果不适合执行这个操作，或者没必要执行这个操作，就停止操作，直接返回。

# 实际案例

类信息概览：

| 类名 | 说明 |
|:----|:----|
| Main.java | 方法的总入口 |
| SaveThread.java | 保存线程 |
| Data.java | 数据 |
| ChangeThread.java | 变更线程 |

## 定义


- SaveThread.java

```java
package com.github.houbb.thread.learn.easy.learn.balking;

public class SaveThread extends Thread {

    private String name;

    private final Data data;

    public SaveThread(String name, Data data) {
        super(name);
        this.data = data;
    }

    @Override
    public void run() {
        while(true) {
            try {
                Thread.sleep(1000);
                data.save();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }
}

```


- Data.java

```java
package com.github.houbb.thread.learn.easy.learn.balking;

public class Data {
    /**
     * 文件名称
     */
    private final String fileName;

    /**
     * 是否变化标识
     */
    private boolean changeFlag;

    /**
     * 内容
     */
    private String content;

    public Data(String fileName, String content) {
        this.fileName = fileName;
        this.content = content;
    }

    public synchronized void change(final String content) {
        this.content = content;
        this.changeFlag = true;
    }

    public synchronized void save() {
        //balking   没有变化直接返回
        if(!changeFlag) {
            return;
        }

        doSave();
        this.changeFlag = false;
    }

    private void doSave() {
        System.out.println(Thread.currentThread().getName() + " calls do save content: "+content+" tO file " + fileName);
    }

}

```


- ChangeThread.java

```java
package com.github.houbb.thread.learn.easy.learn.balking;

import java.util.Random;

public class ChangeThread extends Thread {

    private String name;

    private final Data data;

    public ChangeThread(String name, Data data) {
        super(name);
        this.data = data;
    }

    /**
     * 固定 1S 保存一次数据
     */
    @Override
    public void run() {
        Random random = new Random(1000L);
        while(true) {
            try {
                int value = random.nextInt(1000);
                data.change(String.valueOf(value));
                Thread.sleep(value);
                data.save();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }
}

```


## 测试

- Main.java

```java
package com.github.houbb.thread.learn.easy.learn.balking;

public class Main {

    public static void main(String[] args) {
        Data data = new Data("124.txt", "");
        new ChangeThread("CHANGE", data).start();
        new SaveThread("SAVE", data).start();
    }

}

```

- 测试结果

```
CHANGE calls do save content: 487 tO file 124.txt
SAVE calls do save content: 935 tO file 124.txt
SAVE calls do save content: 676 tO file 124.txt
CHANGE calls do save content: 124 tO file 124.txt
SAVE calls do save content: 792 tO file 124.txt
CHANGE calls do save content: 349 tO file 124.txt
SAVE calls do save content: 641 tO file 124.txt
```

# 实现方式

# UML & Code

## UML

![Balking-uml](https://img-blog.csdn.net/20180425181215906?watermark/2/text/aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3J5bzEwNjA3MzI0OTY=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70)

## Code

代码地址

> [Balking](https://github.com/houbb/thread-learn/tree/master/easy-learn/src/main/java/com/github/houbb/thread/learn/easy/learn//Users/houbinbin/IT/OTHER/thread-learn/easy-learn/src/main/java/com/github/houbb/thread/learn/easy/learn/balking)

# 系列导航

> [多线程系列导航](http://blog.csdn.net/ryo1060732496/article/details/79376415)

* any list
{:toc}