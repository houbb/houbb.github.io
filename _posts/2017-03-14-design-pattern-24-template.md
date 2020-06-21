---
layout: post
title: Design Pattern 24-java 模板模式（Template Pattern）
date:  2017-03-14 19:52:28 +0800
categories: [Design Pattern]
tags: [design pattern, sf]
published: true
---

# 模板模式

在模板模式（Template Pattern）中，一个抽象类公开定义了执行它的方法的方式/模板。

它的子类可以按需要重写方法实现，但调用将以抽象类中定义的方式进行。这种类型的设计模式属于行为型模式。

# 实际案例

类信息概览：

| 类名 | 说明 |
|:----|:----|
| Main.java | 方法的总入口 |
| FootBall.java | 足球 |
| BasketBall.java | 足球 |
| AbstractTemplate.java | 抽象模板 |

## 定义


- FootBall.java

```java
package com.ryo.design.pattern.note.template;


/**
 * 足球
 * @author bbhou
 * @date 2017/8/18
 */
public class FootBall extends AbstractTemplate {

    @Override
    protected void start() {
        System.out.println("Foot ball start");
    }

    @Override
    protected void running() {
        System.out.println("Foot ball running");
    }

    @Override
    protected void end() {
        System.out.println("Foot ball end");
    }

}

```


- BasketBall.java

```java
package com.ryo.design.pattern.note.template;


/**
 * 篮球
 * @author bbhou
 * @date 2017/8/18
 */
public class BasketBall extends AbstractTemplate {

    @Override
    protected void start() {
        System.out.println("Basket ball start");
    }

    @Override
    protected void running() {
        System.out.println("Basket ball running");
    }

    @Override
    protected void end() {
        System.out.println("Basket ball end");
    }

}

```


- AbstractTemplate.java

```java
package com.ryo.design.pattern.note.template;

/**
 * 模板
 * @author bbhou
 * @date 2017/8/18
 */
public abstract class AbstractTemplate {

    /**
     * 开始
     */
    protected abstract void start();

    /**
     * 运行
     */
    protected abstract void running();

    /**
     * 结束
     */
    protected abstract void end();

    /**
     * 运行
     */
    void play() {
        start();
        running();
        end();
    }

}

```


## 测试

- Main.java

```java
/*
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS HEADER.
 * Copyright (c) 2012-2018. houbinbini Inc.
 * design-pattern All rights reserved.
 */

package com.ryo.design.pattern.note.template;

/**
 * <p> </p>
 *
 * <pre> Created: 2018/5/25 下午9:18  </pre>
 * <pre> Project: design-pattern  </pre>
 *
 * @author houbinbin
 * @version 1.0
 * @since JDK 1.7
 */
public class Main {

    public static void main(String[] args) {
        AbstractTemplate template = new BasketBall();
        template.play();

        template = new FootBall();
        template.play();
    }

}

```

- 测试结果

```
```

# 实现方式

# UML & Code

## UML

UML 图示如下

## Code

代码地址

> [模板模式](https://github.com/houbb/design-pattern/tree/master/design-pattern-note/src/main/java/com/ryo/design/pattern/note/template)

# 系列导航

> [系列导航](https://blog.csdn.net/ryo1060732496/article/details/80214740)

* any list
{:toc}