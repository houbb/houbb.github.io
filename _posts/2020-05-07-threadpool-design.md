---
layout: post
title: 线程池框架设计
date:  2020-5-7 19:23:59 +0800
categories: [Java]
tags: [java, thread, threadpool, sh]
published: true
---

# 背景

最近写一些任务调度相关的工具，总是涉及到线程池相关的处理。

一遍一遍的写，觉得非常浪费时间，而且没有凝聚成组件，无法优化和复用。

## jdk 内置

java 自带的线程池工具可以满足平时的需求，但是特性还是不够强大。

所以这并不是重复造轮子。

但是这又引入了第二个问题，如何充分的利用 jdk 自带的特性呢？

如果 jdk 升级了，特性我们可以享受到吗？


# 开源框架

[从Hystrix核心代码中提取出来的线程池隔离的代码,可以非常方便的在Web应用中实现线程池隔离](https://github.com/EZLippi/isolation-threadpool)

[java 线程池的写法](https://github.com/THEONE10211024/ThreadPool)

[轻量级多线程池](https://github.com/aofeng/threadpool4j)

[合理估算线程池大小及队列数](https://github.com/sunshanpeng/dark_magic)

* any list
{:toc}