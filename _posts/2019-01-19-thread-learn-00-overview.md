---
layout: post
title: 轻松学习多线程 00-多线程学习概览
date:  2019-1-19 11:21:15 +0800
categories: [Thread]
tags: [thread, java, overview, sh]
published: true
---

# 基础知识

下面是一些关于 java 线程的基础知识博客。

需要补充知识的可以浏览一下，已经熟悉的可以直接跳过。

## 系列目录

[线程-001-线程简介](http://blog.csdn.net/ryo1060732496/article/details/51151809)

[线程-002-基本的线程机制](http://blog.csdn.net/ryo1060732496/article/details/51154746)

[线程-003-线程的同步与锁](http://blog.csdn.net/ryo1060732496/article/details/51184874)

[线程-004-线程间的协作及状态迁移](http://blog.csdn.net/ryo1060732496/article/details/79377105)

[轻松学习多线程-00-序章](http://blog.csdn.net/ryo1060732496/article/details/79376415)

[轻松学习多线程-01-基础知识](http://blog.csdn.net/ryo1060732496/article/details/79379417)

[轻松学习多线程-02-Single Threaded Execution 模式](http://blog.csdn.net/ryo1060732496/article/details/79396858)

[轻松学习多线程-03-Immutable 模式](http://blog.csdn.net/ryo1060732496/article/details/79414879)

[轻松学习多线程-004-Guarded Suspension 模式](http://blog.csdn.net/ryo1060732496/article/details/79631283)

[轻松学习多线程-05-Balking 模式](https://blog.csdn.net/ryo1060732496/article/details/80083502)

[轻松学习多线程-06-Producer Consumer 模式](https://blog.csdn.net/ryo1060732496/article/details/80083625)

[轻松学习多线程-07-Read Write Lock 模式](https://blog.csdn.net/ryo1060732496/article/details/80083723)

[轻松学习多线程-08-Thread Per Message 模式](https://blog.csdn.net/ryo1060732496/article/details/80083818)

[轻松学习多线程-09-Worker Thread 模式](https://blog.csdn.net/ryo1060732496/article/details/80083893)

[轻松学习多线程-10-Future 模式](https://blog.csdn.net/ryo1060732496/article/details/80088298)

[轻松学习多线程-11-Two Phase Termination 模式](https://blog.csdn.net/ryo1060732496/article/details/80098199)

[轻松学习多线程-12-Thread Special Storage 模式](https://blog.csdn.net/ryo1060732496/article/details/80099013)

[轻松学习多线程-13-Active Object 模式](https://blog.csdn.net/ryo1060732496/article/details/80099142)

# 缘由

Java 多线程的相关知识也接触许久，大都看了忘，忘了看。反反复复。

《Java 并发编程实战》之类的书籍看时觉得受益匪浅，看完有时实践用不到又忘记了。

最近在读《图解 Java 多线程设计模式》，觉得是本佳作。特此记录成篇，希望可以帮助大家和自己记忆学习。

# 内容

主要内容是对**《图解 Java 多线程设计模式》**的整理，加上自己的一点点思考。

内容主要倾向于多线程的各种设计模式，包含各种 concurrent 下的经典实现原理。

所有的代码也都会放在 [github](https://github.com/houbb/thread-learn/tree/master/easy-learn) 上，欢迎指正批评。

# 适合人群

- 对 Java 多线程感兴趣的读者

- 对设计模式 感兴趣的读者

- 有一定好奇心的读者

# 多线程代码的评定标准

对于代码的评定不应该停留于好坏，而应该指出好在哪里？或者坏在哪里？

下面简单地谈一下 Doug Lea 的评价标准。
如果你看过 JDK 源码，应该见过这个名字。

## 安全性

安全性，即不损坏对象。
此处的损坏是指**对象的状态和设计者的意图不一致**。
比如银行账户信息，如果设计者不希望余额为负数，但是却出现了负数，这就可以理解为损坏。
可以被多线程调用，也保证安全性的类，称之为**线程安全**。
比如 `java.util.Vector`。

## 生存性

生存性，必要的处理能够被执行。
最典型的例子就是**死锁**，后面的文章会讲解。

##  可复用性

可复用性，类可以被重复使用。
JDK 中 `java.util.concurrent` 就是提供了很多可复用性高的类。

## 性能

性能，可以快速大批量的执行处理。
下面简单列举几个重要的因素：

- 吞吐量
单位时间内完成的处理数量。
- 响应性
从发出请求到收到请求的时间。
- 容量
可同时进行的处理数量。

> 总结

-  安全性和生存性：必要条件

- 可复用性和性能：提高质量



* any list
{:toc}