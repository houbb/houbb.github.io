---
layout: post
title: Design Pattern 07-java 桥接模式(Bridge Pattern)
date:  2017-03-14 19:52:28 +0800
categories: [Design Pattern]
tags: [design pattern, sf]
published: true
---

# 桥接模式

桥接（Bridge）是用于把抽象化与实现化解耦，使得二者可以独立变化。这种类型的设计模式属于结构型模式，它通过提供抽象化和实现化之间的桥接结构，来实现二者的解耦。

这种模式涉及到一个作为桥接的接口，使得实体类的功能独立于接口实现类。这两种类型的类可被结构化改变而互不影响。

我们通过下面的实例来演示桥接模式（Bridge Pattern）的用法。其中，可以使用相同的抽象类方法但是不同的桥接实现类，来画出不同颜色的圆。

# 实际案例

类信息概览：

| 类名 | 说明 |
|:----|:----|
| Main.java | 方法的总入口 |
| Truck.java | 大卡车|
| HighWay.java | 高速公路 |
| AbstractRoad.java | 抽象公路类 |
| Street.java | 街道 |
| Car.java | 小汽车 |
| Bus.java | 公交汽车 |

## 定义


- Truck.java

```java
package com.ryo.design.pattern.note.bridge;

/**
 * 大卡车
 * @author bbhou
 * @date 2017/8/11
 */
public class Truck implements Car {
    @Override
    public void run() {
        System.out.println("Truck is running ");
    }
}

```


- HighWay.java

```java
package com.ryo.design.pattern.note.bridge;

/**
 * 高速公路
 * @author bbhou
 * @date 2017/8/11
 */
public class HighWay extends AbstractRoad {
    public HighWay(Car car) {
        super(car);
    }

    @Override
    public void onRoad() {
        System.out.println("On the highway");
    }
}

```


- AbstractRoad.java

```java
package com.ryo.design.pattern.note.bridge;

/**
 * 马路抽象类
 * @author bbhou
 * @date 2017/8/11
 */
public abstract class AbstractRoad {

    private Car car;

    public AbstractRoad(Car car) {
        this.car = car;
    }

    /**
     * 在路上
     */
    public abstract void onRoad();

    /**
     * 车在路上跑
     */
    public void carRunOnRoad() {
        car.run();
        onRoad();
    }

}

```


- Street.java

```java
package com.ryo.design.pattern.note.bridge;

/**
 * 街道
 * @author bbhou
 * @date 2017/8/11
 */
public class Street extends AbstractRoad {
    public Street(Car car) {
        super(car);
    }

    @Override
    public void onRoad() {
        System.out.println("On the street");
    }
}

```


- Car.java

```java
package com.ryo.design.pattern.note.bridge;

/**
 * 汽车接口
 *
 * @author bbhou
 * @date 2017/8/11
 */
public interface Car {

    /**
     * 运行
     */
    void run();

}

```


- Bus.java

```java
package com.ryo.design.pattern.note.bridge;

/**
 *
 * 公共汽车
 * @author bbhou
 * @date 2017/8/11
 */
public class Bus implements Car {

    @Override
    public void run() {
        System.out.println("Bus is running ");
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

package com.ryo.design.pattern.note.bridge;

/**
 * <p> </p>
 *
 * <pre> Created: 2018/5/14 下午6:49  </pre>
 * <pre> Project: design-pattern  </pre>
 *
 * @author houbinbin
 * @version 1.0
 * @since JDK 1.7
 */
public class Main {

    public static void main(String[] args) {
        AbstractRoad road = new Street(new Bus());
        AbstractRoad road2 = new HighWay(new Truck());

        road.carRunOnRoad();
        road2.carRunOnRoad();
    }

}

```

- 测试结果

```
Bus is running 
On the street
Truck is running 
On the highway
```

# 实现方式

# UML & Code

## UML

UML 图示如下

## Code

代码地址

> [桥接模式](https://github.com/houbb/design-pattern/tree/master/design-pattern-note/src/main/java/com/ryo/design/pattern/note/bridge)

# 系列导航

> [系列导航](https://blog.csdn.net/ryo1060732496/article/details/80214740)

* any list
{:toc}