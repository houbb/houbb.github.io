---
layout: post
title:  如何设计一套补偿方案？
date:  2021-1-25 16:52:15 +0800
categories: [Design]
tags: [design, system, sh]
published: true
---

# 补偿方案

为什么需要补偿方案呢？

有时候可能因为时间差，或者是无法实时获取正确的结果，就需要一套补偿方案。

补偿方案可以设计的很复杂，比如基于数据库+mq，也可以设计的很简单，比如基于内存+定时任务。

我们今天主要讲解一个比较简单的设计方案: 内存 + 定时任务。

# 整体预期

可以指定补偿次数

可以指定补偿的时间间隔？

可以查询当前补偿的状态 + 对补偿的数据进行 CRUD 管理。（前期可以不需要页面）

## 不同的实现策略

基于内存的

基于数据库的（允许自定义）

# 什么时候需要补偿

补偿应该是一个偶发性的动作，如果非常常见，首先应该考虑是不是功能设计有问题，或者程序存在 BUG。

一般都是存在异常的时候。

所以我们可以定义一个异常，或者当特定的情况下抛出这个异常。

ps: 这个设计理念类似于 spring 的事务管理。

## 异常的定义

我们专门定义一个异常，用于区分其他的各种异常。

只有当抛出的是这个异常的时候，才进行处理。

```java
package com.github.houbb.compensate.api.exception;

/**
 * 当需要补偿的时候，需要抛出这个异常。
 * 
 * @author binbin.hou
 * @since 1.0.0
 */
public class RequireCompensateException extends CompensateException {

    public RequireCompensateException() {
    }

    public RequireCompensateException(String message) {
        super(message);
    }

    public RequireCompensateException(String message, Throwable cause) {
        super(message, cause);
    }

    public RequireCompensateException(Throwable cause) {
        super(cause);
    }

    public RequireCompensateException(String message, Throwable cause, boolean enableSuppression, boolean writableStackTrace) {
        super(message, cause, enableSuppression, writableStackTrace);
    }
}
```

# 存储的设计

当抛出异常的时候，这个时候上下文信息应该放在那里呢？

和重试的差异性要如何体现呢？

这里为了充分的将二者区分开，或者说将二者融合也是一个不错的方案？

为了简单和后续的自由发展，我们暂时将二者区分开。

我们认为，补偿甚至是有些类似于 spring 中的熔断等等方法。

## 注解定义




## 基本属性

当前补偿次数

历史

时间

入参

结果





* any list
{:toc}