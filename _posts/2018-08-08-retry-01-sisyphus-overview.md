---
layout: post
title: 更好的 java 重试框架 sisyphus 入门简介
date:  2018-08-08 17:46:57 +0800
categories: [Java]
tags: [java, retry]
published: true
---

# What is Sisyphus

[sisyphus ](https://github.com/houbb/sisyphus) 综合了 spring-retry 和 gauva-retrying 的优势，使用起来也非常灵活。

> [java 重试框架 sisyphus 开源地址](https://github.com/houbb/sisyphus) https://github.com/houbb/sisyphus

## 为什么选择这个名字

我觉得重试做的事情和西西弗斯很相似。

一遍遍的重复，可能徒劳无功，但是乐此不疲。

人一定要想象西西弗斯的快乐。——加缪

## 其他原因

以前看了 [java retry](https://houbb.github.io/2018/08/08/retry) 的相关框架,
虽然觉得其中有很多不足之处。但是没有任何重复造轮子的冲动，觉得是徒劳无功的。

当然这段时间也看了 Netty 的接口设计，和 Hibernate-Validator 的接口设计，觉得非常的巧妙。

觉得把这些东西结合，可以写出一个还不错的框架，就写了起来。

至少，sisyphus 是快乐的。

# 关于版本

这次的框架版本采用了比较保守的方式，使用 `0.0.X`。

原因有两个：

（1）我认为前期出于实验阶段。代码并不成熟，自测也不充分。所以不适合用于生产。

（2）这样可以快速迭代，而不至于为了追求更好导致版本特性迟迟无法迭代。

## 版本特性

我用了 5 个版本，实现了主要的特性：

（1）基于 fluent 接口声明式调用

（2）基于 annotation 的代理实现

（3）spring 的整合实现

（4）自定义注解的实现

## 未完成的工作

- 更方便的工具类。

- 使用文档

- 测试代码

## 感受

想法是很容易产生的，但是想把它变成一个稳定的框架需要很长的时间锤炼。

# 为什么选择 sisyphus

作为开发者，我们一般都会选择比较著名的框架。

比如 guava-retrying spring-retry。

或者干脆自己写一个。

# 为什么不是 guava-retrying/spring-retry

[java retry](https://houbb.github.io/2018/08/08/retry) 这篇文章中我列举了常见的实现方式
以及上述的两种框架，也讲述了其中的不足。

## guava-retrying 优缺点

### 优点

- 使用灵活

- fluent 优雅写法

- 提供足够多的实现

### 缺点

- 没有默认基于注解的实现

- 重试策略设计并不友好

## spring-retry

### 优点

- 使用简单

### 缺点

- 重试条件单一

- 重试等待策略单一

- 无法自定义注解

# 为什么不自己写一个

## 个人感受

我作为一名开发，平时说实在的，看到重试。

我肯定会偷懒写一个 for 循环，重试几次就结束了。

因为时间不允许。

如果你更勤快一点，就可以选择 spring-retry/guava-retrying。如果你熟悉他们的优缺点的话。

## 如果你渴望创造

sisyphus 所有的实现都是基于接口的。

你完全可以实现自己的实现，所有的东西基本完全可以被替换。

当然一些常见的策略实现，项目的基本框架都有详尽的注释，当做参考也可以有一点帮助。

# sisyphus 做的更多的事情

## netty 的灵感

参考了 netty 的设计，保证接口实现的一致性。

而且 sisyphus 还做了更多，还保证了接口和注解之间的一致性。

使用引导类，保证使用时的便利性，后期拓展的灵活性。

## hibernate-validator

hibernate-validator 的作者是我知道为数不多的对于 java 注解应用很棒的开发者。（虽然所知甚少）

自定义注解就是从这个框架中学来的。

## 与 spring 为伍

spring 基本与我们的代码形影不离，所以你可以很简单的结合 spring.

就像你使用 spring-retry 一样。



# 快速开始

## 需要

jdk1.7+

maven 3.x+

## maven 引入

sisyphus 使用 maven 管理 jar，

```xml
<plugin>
    <groupId>com.github.houbb</groupId>
    <artifactId>sisyphus-core</artifactId>
    <version>0.0.6</version>
</plugin>
```

## 编码

作为入门案例，我们首先介绍些简单灵活的声明式编程

```java
public void helloTest() {
    Retryer.<String>newInstance()
            .callable(new Callable<String>() {
                @Override
                public String call() throws Exception {
                    System.out.println("called...");
                    throw new RuntimeException();
                }
            }).retryCall();
}
```

### 代码简介

`Retryer.<String>newInstance()` 创建引导类的实例，String 是 callable 也就是待重试方法的返回值类型。

`callable()` 指定待重试的方法实现。

`retryCall()` 触发重试调用。

### 日志信息

```
called...
called...
called...
```

以及一些异常信息。

## 等价配置

上面的配置其实有很多默认值，如下：

```java
/**
 * 默认配置测试
 */
@Test(expected = RuntimeException.class)
public void defaultConfigTest() {
    Retryer.<String>newInstance()
            .maxAttempt(3)
            .listen(RetryListens.noListen())
            .recover(Recovers.noRecover())
            .condition(RetryConditions.hasExceptionCause())
            .retryWaitContext(RetryWaiter.<String>retryWait(NoRetryWait.class).context())
            .callable(new Callable<String>() {
                @Override
                public String call() throws Exception {
                    System.out.println("called...");
                    throw new RuntimeException();
                }
            }).retryCall();
}
```

这些默认值都是可以配置的。

比如什么时候触发重试？重试几次？多久触发一次重试？这些都会在下面的章节进行详细讲解。

# 小结

本文简单介绍了重试框架的设计缘由，及其使用入门。

> [java 重试框架 sisyphus 开源地址 ](https://github.com/houbb/sisyphus)

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次重逢。

* any list
{:toc}