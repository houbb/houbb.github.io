---
layout: post
title: 轻松学习多线程 13-future 未来模式
date:  2019-1-19 11:21:15 +0800
categories: [Thread]
tags: [thread, java, sh]
published: true
---

# Future 模式

future 模式类似于一张提货单。

future 意思就是未来、期货(金融领域)。

# 实际案例

类信息概览：

| 类名 | 说明 |
|:----|:----|
| Main.java | 方法的总入口 |
| FutureData.java | 未来的数据 |
| Data.java | 数据 |
| Host.java | 客户端 |
| RealData.java | 实际的数据 |

## 定义


- FutureData.java

```java
package com.github.houbb.thread.learn.easy.learn.future;

/**
 * 2018/2/3
 *
 * @author houbinbin
 * @version 1.0
 * @since 1.7
 */
public class FutureData implements Data {

    private RealData realData;

    private boolean isReady = false;

    public synchronized void setRealData(RealData realData) {
        if(isReady) {
            return; //balk
        }

        this.realData = realData;
        this.isReady = true;
        notifyAll();
    }

    @Override
    public synchronized String getContent() {
        while (!isReady) {
            try {
                wait();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }

        return this.realData.getContent();
    }

}

```


- Data.java

```java
package com.github.houbb.thread.learn.easy.learn.future;

/**
 * 2018/2/3
 *
 * @author houbinbin
 * @version 1.0
 * @since 1.7
 */
public interface Data {

    String getContent();

}
```


- Host.java

```java
package com.github.houbb.thread.learn.easy.learn.future;

/**
 * 2018/2/3
 *
 * @author houbinbin
 * @version 1.0
 * @since 1.7
 */
public class Host {

    public Data request(final String string) {
        //
        System.out.println("Host.request() START...");

        //1. future
        final FutureData futureData = new FutureData();


        //2.
        new Thread(new Runnable() {
            @Override
            public void run() {
                RealData realData = new RealData(string);
                futureData.setRealData(realData);
            }
        }).start();


        System.out.println("Host.request() END...");
        return futureData;
    }

}

```


- RealData.java

```java
package com.github.houbb.thread.learn.easy.learn.future;

import com.github.houbb.thread.learn.easy.learn.ThreadUtil;

/**
 * 2018/2/3
 *
 * @author houbinbin
 * @version 1.0
 * @since 1.7
 */
public class RealData implements Data {

    private final String string;

    public RealData(String string) {
        ThreadUtil.sleep(1000);
        this.string = string+"-real";
    }

    @Override
    public String getContent() {
        return this.string;
    }

}

```


## 测试

- Main.java

```java
package com.github.houbb.thread.learn.easy.learn.future;

/**
 * 2018/2/3
 *
 * @author houbinbin
 * @version 1.0
 * @since 1.7
 */
public class Main {

    public static void main(String[] args) {
        Data futureDataA = new Host().request("A");
        Data futureDataB = new Host().request("C");
        Data futureDataC = new Host().request("D");

        System.out.println(futureDataA.getContent());
        System.out.println(futureDataB.getContent());
        System.out.println(futureDataC.getContent());
    }

}

```

- 测试结果

```
Host.request() START...
Host.request() END...
Host.request() START...
Host.request() END...
Host.request() START...
Host.request() END...
A-real
C-real
D-real
```

# 实现方式

# UML & Code

## UML

![Future](https://img-blog.csdn.net/20180425185112876?watermark/2/text/aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3J5bzEwNjA3MzI0OTY=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70)

## Code

代码地址

> [future](https://github.com/houbb/thread-learn/tree/master/easy-learn/src/main/java/com/github/houbb/thread/learn/easy/learn//Users/houbinbin/IT/OTHER/thread-learn/easy-learn/src/main/java/com/github/houbb/thread/learn/easy/learn/future)

# 系列导航

> [多线程系列导航](http://blog.csdn.net/ryo1060732496/article/details/79376415)

* any list
{:toc}