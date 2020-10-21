---
layout: post
title:  JMM-07-lock concurrent 包简介
date:  2018-07-29 13:23:50 +0800
categories: [JMM]
tags: [java, lock, sf]
published: true
---


# concurrent 包

由于 java 的 CAS 同时具有 volatile 读和 volatile 写的内存语义，因此 java 线程之间的通信现在有了下面四种方式：

- A 线程写 volatile 变量，随后B线程读这个 volatile 变量。

- A 线程写 volatile 变量，随后 B 线程用 CAS 更新这个 volatile 变量。

- A 线程用 CAS 更新一个 volatile 变量，随后 B 线程用 CAS 更新这个 volatile 变量。

- A 线程用 CAS 更新一个 volatile 变量，随后B线程读这个 volatile 变量。

ps: 简而言之，volatile 和 CAS 的读写组合。

Java 的 CAS 会使用现代处理器上提供的高效机器级别原子指令，这些原子指令以原子方式对内存执行读-改-写操作，这是在多处理器中实现同步的关键（从本质上来说，能够支持原子性读-改-写指令的计算机器，是顺序计算图灵机的异步等价机器，因此任何现代的多处理器都会去支持某种能对内存执行原子性读-改-写操作的原子指令）。

同时，volatile 变量的读/写和CAS可以实现线程之间的通信。

把这些特性整合在一起，就形成了整个 concurrent 包得以实现的基石。

## 通用模式

如果我们仔细分析 concurrent 包的源代码实现，会发现一个通用化的实现模式：

首先，声明共享变量为 volatile；

然后，使用 CAS 的原子条件更新来实现线程之间的同步；

同时，配合以 volatile 的读/写和CAS所具有的 volatile 读和写的内存语义来实现线程之间的通信。

## AQS

AQS，非阻塞数据结构和原子变量类（`java.util.concurrent.atomic` 包中的类）

这些 concurrent 包中的基础类都是使用这种模式来实现的，而 concurrent 包中的高层类又是依赖于这些基础类来实现的。

# 参考资料

- JSR 133

- other

http://www.infoq.com/cn/articles/java-memory-model-5



* any list
{:toc}