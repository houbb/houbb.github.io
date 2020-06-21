---
layout: post
title: 轻松学习多线程 04-线程间的协作及状态迁移 wait notify 
date:  2019-1-19 11:21:15 +0800
categories: [Thread]
tags: [thread, java, sh]
published: true
---

# 状态迁移图

常言道，一图胜千言。

![线程状态迁移图](https://imgconvert.csdnimg.cn/aHR0cDovL2ltZy5ibG9nLmNzZG4ubmV0LzIwMTgwMjI2MTQ0ODI3MzUw?x-oss-process=image/format,png)

# 线程协作

我们前面讲到使用 `synchronized` 进行线程间的互斥。

但，如果我们需要更加精确地控制。比如：

- 如果空间为空则写入，如果非空则一直等待。

- 空间已经为空时，“通知”其他等待的线程。

为此，JDK 为我们准备了 `wait()`、`notify()`、`notifyAll()` 等方法，用于线程的控制。

# 等待队列

所有的实例都拥有一个等待队列（这是一个**虚拟**的概念）。可以理解为这是为每个实例准备的休息室。
在执行 `wait()` 之后，线程便会停下手中的事情，进入这个休息室休息。
在遇到以下的情况，才会退出等待：

- `wait()` 方法超时
- 其他线程的 `notify()`/`notifyAll()`/`interrupt()` 方法来唤醒线程

# wait 

`wait()` 让线程进入等待队列。

## object

假设执行如下语句：

```java
object.wait();
```

则当前线程会停止，并且进入实例 object 的等待队列中。称之为，线程正在 object 上等待。

## this

若实例化方法中有以下语句：

```java
wait();		//(1)
this.wait();	//(2)
```

(1) (2) 两句的效果是相同的。执行了 `wait()` 的线程将会进入 this 的等待队列。称之为，线程正在 this 上等待。

## 图解

若要执行  `wait()`，则**线程必须持有锁**。若线程进入等待队列，则会释放实例持有的锁。

![wait()执行流程](https://imgconvert.csdnimg.cn/aHR0cDovL2ltZy5ibG9nLmNzZG4ubmV0LzIwMTgwMjI2MTUyNjMxNTk5?x-oss-process=image/format,png)

# notify

`notify()` 会将等待队列中的一个线程取出。

```java
object.notify()
```
上面的代码，会将 object 的等待队列中唤醒，然后退出等待队列。

## 图解

整体流程如下：

![notify() 流程](https://imgconvert.csdnimg.cn/aHR0cDovL2ltZy5ibG9nLmNzZG4ubmV0LzIwMTgwMjI2MTYyMjMyMzQ3?x-oss-process=image/format,png)

> 注意

当执行 `notify()` 方法的时候，如果等待队列中的线程不止一个，则接下来优先选择哪一个是没有明文规定的，取决于 Java 运行环境。
所以，很多人推荐使用 `notifyAll()`

# notifyAll

`notifyAll()` 从等待队列中取出所有线程。

## object

假设执行如下语句：

```java
object.notifyAll();
```

则当 object 实例的等待队列中休眠的所有线程都会被唤醒。

## this

若实例化方法中有以下语句：

```java
notifyAll();		//(1)
this.notifyAll();	//(2)
```

(1) (2) 两句的效果是相同的。执行该语句所在的实例 (this) 等待队列中的所有线程都将退出等待队列。

## 图解

![notifyAll() 流程](https://imgconvert.csdnimg.cn/aHR0cDovL2ltZy5ibG9nLmNzZG4ubmV0LzIwMTgwMjI2MTYzNDA4OTIz?x-oss-process=image/format,png)

# 总结

上述的几个方法线程调用时都要求**持有锁**，如果不满足，则会抛出异常 `java.lang.IlleagalMonitorStateException`。

# 相关内容

[线程-001-线程简介](http://blog.csdn.net/ryo1060732496/article/details/51151809)

[线程-002-基本的线程机制](http://blog.csdn.net/ryo1060732496/article/details/51154746)

[线程-003-线程的同步与锁](http://blog.csdn.net/ryo1060732496/article/details/51184874)

[线程-004-线程间的协作及状态迁移](http://blog.csdn.net/ryo1060732496/article/details/79377105)

* any list
{:toc}