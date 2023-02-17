---
layout: post
title:  Java Concurrency-03-thread safety
date:  2018-07-24 16:11:28 +0800
categories: [Java]
tags: [thread, concurrency, thread]
published: true
---

# java 线程安全

## 线程安全

定义线程安全性非常棘手。一个快速的谷歌搜索出现了许多这样的“定义”:

- 线程安全的代码是可以工作的代码，即使许多线程同时执行它。

- 如果一段代码只以保证多个线程同时安全执行的方式操作共享数据结构，那么它就是线程安全的。

难道你不认为上面的定义实际上没有传达任何有意义的东西，甚至增加了一些混乱。
虽然这些定义不能像那样被排除，因为它们没有错。
但事实是，他们没有提供任何实际的帮助或观点。
如何区分线程安全类和不安全类?我们所说的“安全”是什么意思?

## 线程安全的正确性是什么?

任何合理定义线程安全的核心是正确性的概念。

因此，在理解线程安全之前，我们应该首先理解这个“正确性”。

```
正确性意味着一个类符合它的规范。
```

您将同意，一个好的类规范将在任何给定时间拥有关于类状态的所有信息，如果对其执行某些操作，那么它就是post条件。由于我们经常没有为我们的类编写足够的规范，我们怎么可能知道它们是正确的呢?我们做不到，但这并不能阻止我们在确信“代码有效”之后使用它们。这种“代码自信”差不多是我们很多人能够正确理解的。

将“正确性”乐观地定义为可以识别的东西之后，我们现在可以用一种不那么循环的方式来定义线程安全性:
类在从多个线程访问时继续保持正确行为时是线程安全的。

```
如果类在从多个线程访问时行为正确，那么它是线程安全的，而不考虑运行时环境对这些线程执行的调度或交错，并且在调用代码的部分没有额外的同步或其他协调。
```

如果“正确性”在这里的松散使用让您感到困扰，那么您可能更愿意将线程安全类视为在并发环境中与在单线程环境中一样不会被破坏的类。

线程安全类封装任何需要的同步，以便客户端不需要提供它们自己的同步。


# 线程安全的实现方式

保证类的线程安全，有以下的几种方式：

## 无状态的类

线程安全类的一个很好的例子是java servlet，它没有字段和引用，没有其他类的字段等等。它们是无状态(`stateless`)的。

```java
public class StatelessFactorizer implements Servlet {

    public void service(ServletRequest req, ServletResponse resp) {
        BigInteger i = extractFromRequest(req);
        BigInteger[] factors = factor(i);
        encodeIntoResponse(resp, factors);
    }

}
```

特定计算的瞬态状态仅存在于存储在线程堆栈上的本地变量中，并且仅对执行线程可访问。
一个线程访问一个状态因数分解器不能影响另一个线程访问相同的无状态分解器的结果;
因为这两个线程不共享状态，所以它们好像访问了不同的实例。

由于访问无状态对象的线程的操作不会影响其他线程中操作的正确性，因此无状态对象是线程安全的。

## 不可变的类

[不可变设计模式](https://houbb.github.io/2018/10/08/pattern-immutable)

## 悲观锁 synchronized

[synchronized](https://houbb.github.io/2018/07/25/java-concurrency-09-sync)

## 乐观锁 volatile

[volatile](https://houbb.github.io/2018/07/27/jmm-05-volatile)

## ThreadLocal

[ThreadLocal](https://houbb.github.io/2018/10/08/java-threadlocal)

* any list
{:toc}