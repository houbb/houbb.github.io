---
layout: post
title: JUC-06-LockSupport
date:  2019-1-20 14:10:12 +0800
categories: [Concurrency]
tags: [java, concurrency, juc, sh]
published: true
---

# LockSupport

在Java多线程中，当需要阻塞或者唤醒一个线程时，都会使用LockSupport工具类来完成相应的工作。LockSupport定义了一组公共静态方法，这些方法提供了最基本的线程阻塞和唤醒功能，而LockSupport也因此成为了构建同步组件的基础工具。

## 方法

LockSupport定义了一组以park开头的方法用来阻塞当前线程，以及unpark(Thread)方法来唤醒一个被阻塞的线程，这些方法描述如下：

| 方法名称    |    描  述| 
|:---|:---|
| park()                    | 阻塞当前线程，如果掉用unpark(Thread)方法或被中断，才能从park()返回 | 
| parkNanos(long nanos)     | 阻塞当前线程，超时返回，阻塞时间最长不超过nanos纳秒 | 
| parkUntil(long deadline)  | 阻塞当前线程，直到deadline时间点 | 
| unpark(Thread)            | 唤醒处于阻塞状态的线程 |

在Java 6中，LockSupport增加了park(Object blocker)、parkNanos(Object blocker, long nanos)、parkUntil(Object blocker, long deadline)这3个方法，用于实现阻塞当前线程的功能，其中参数blocker是用来标识当前线程在等待的对象，该对象主要用于问题排查和系统监控。

## 使用案例

下面的示例中，将对比parkNanos(long nanos)和parkNanos(Object blocker, long nanos)方法来展示阻塞对象blocker的用处。

- 采用parkNanos(long nanos)阻塞线程：

```java
public class LockSupportTest {
	public static void main(String[] args) {
		LockSupport.parkNanos(TimeUnit.SECONDS.toNanos(20));
	}
}
```

- 采用parkNanos(Object blocker, long nanos)阻塞线程：

```java
public class LockSupportTest {
	public static void main(String[] args) {
		LockSupport.parkNanos(new Object(), TimeUnit.SECONDS.toNanos(20));
	}
}
```

这两段代码都是 阻塞当前线程20秒，从上面的dump结果可以看出，有阻塞对象的parkNanos方法能够传递给开发人员更多的现场信息。

这是由于在Java 5之前，当线程使用synchronized关键字阻塞在一个对象上时，通过线程dump能够看到该线程的阻塞对象，而Java 5推出的Lock等并发工具却遗漏了这一点，致使在线程dump时无法提供阻塞对象的信息。

因此，在Java 6中，LockSupport新增了上述3个含有阻塞对象的方法，用以替代原有的park方法。

通过源码可以发现，LockSupport的park和unpark方法都是通过sun.misc.Unsafe类的park和unpark方法实现的，那下面我们对sun.misc.Unsafe类的源码进行进一步解析。

> 详情见 [Unsafe]()

# 拓展阅读

[Unsafe]()

# 参考资料

[Java并发编程之LockSupport、Unsafe详解](https://blog.csdn.net/qq_38293564/article/details/80512758)

* any list
{:toc}