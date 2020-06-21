---
layout: post
title: 轻松学习多线程 11-Thread Per Message 每个消息一个线程模式
date:  2019-1-19 11:21:15 +0800
categories: [Thread]
tags: [thread, java, sh]
published: true
---

# Thread Per Message 模式

Thread Per Message 模式是指为每个请求/命令分配一个新的线程，由这个线程来进行处理。

# 实际案例

类信息概览：

| 类名 | 说明 |
|:----|:----|
| Main.java | 方法的总入口 |
| Host.java | 客户端 |

## 定义


- Host.java

```java
package com.github.houbb.thread.learn.easy.learn.threadPerMsg;

import com.github.houbb.thread.learn.easy.learn.ThreadUtil;

public class Host {

    public void request(final String string) {
        System.out.println("Request start...");
        new Thread() {
            @Override
            public void run() {
                ThreadUtil.sleep(1000);
                System.out.println(string);
            }
        }.start();
        System.out.println("Request end...");
    }

    public static void main(String[] args) {
        Host host = new Host();
        host.request("A");
        host.request("B");
        host.request("C");
    }

}

```

## 测试

- Main.java

```java
public class Main {

    public static void main(String[] args) {
        Host host = new Host();
        host.request("A");
        host.request("B");
        host.request("C");
    }

}
```

- 测试结果

```
Request start...
Request end...
Request start...
Request end...
Request start...
Request end...
B
A
C
```

# 实现方式

# UML & Code

## UML

![这里写图片描述](https://img-blog.csdn.net/20180425183907417?watermark/2/text/aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3J5bzEwNjA3MzI0OTY=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70)

## Code

代码地址

> [Thread Per Message](https://github.com/houbb/thread-learn/tree/master/easy-learn/src/main/java/com/github/houbb/thread/learn/easy/learn//Users/houbinbin/IT/OTHER/thread-learn/easy-learn/src/main/java/com/github/houbb/thread/learn/easy/learn/threadPerMsg)

# 系列导航

> [多线程系列导航](http://blog.csdn.net/ryo1060732496/article/details/79376415)

* any list
{:toc}