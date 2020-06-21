---
layout: post
title: Design Pattern 11-java 外观模式(Facade Pattern)
date:  2017-03-14 19:52:28 +0800
categories: [Design Pattern]
tags: [design pattern, sf]
published: true
---

# 外观模式

外观模式（Facade Pattern）**隐藏系统的复杂性**，并向客户端提供了一个客户端可以访问系统的接口。

这种类型的设计模式属于结构型模式，它向现有的系统添加一个接口，来隐藏系统的复杂性。

这种模式涉及到一个单一的类，该类提供了客户端请求的简化方法和对现有系统类方法的委托调用。

# 实际案例

类信息概览：

| 类名 | 说明 |
|:----|:----|
| Main.java | 方法的总入口 |
| Circle.java | 圆形 |
| Rectangle.java | 长方形 |
| ShapeFacade.java | 外观类 |
| Shape.java | 形状接口 |

## 定义


- Circle.java

```java
package com.ryo.design.pattern.note.facade;

/**
 *
 * @author bbhou
 * @date 2017/8/11
 */
public class Circle implements Shape {
    @Override
    public void draw() {
        System.out.println("Draw circle...");
    }
}

```


- Rectangle.java

```java
package com.ryo.design.pattern.note.facade;

/**
 *
 * @author bbhou
 * @date 2017/8/11
 */
public class Rectangle implements Shape {
    @Override
    public void draw() {
        System.out.println("Draw rectangle...");
    }
}

```


- ShapeFacade.java

```java
package com.ryo.design.pattern.note.facade;

/**
 * 最外层调用
 * @author bbhou
 * @date 2017/8/11
 */
public class ShapeFacade {

    public void drawCircle() {
        Shape shape = new Circle();
        shape.draw();
    }

    public void drawRectangle() {
        Shape shape = new Rectangle();
        shape.draw();
    }

}

```


- Shape.java

```java
package com.ryo.design.pattern.note.facade;

/**
 *
 * @author bbhou
 * @date 2017/8/11
 */
public interface Shape {

    /**
     * 绘制图像
     */
    void draw();

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

package com.ryo.design.pattern.note.facade;

/**
 * <p> </p>
 *
 * <pre> Created: 2018/5/17 下午8:37  </pre>
 * <pre> Project: design-pattern  </pre>
 *
 * @author houbinbin
 * @version 1.0
 * @since JDK 1.7
 */
public class Main {

    public static void main(String[] args) {
        ShapeFacade shapeFacade = new ShapeFacade();
        shapeFacade.drawCircle();
        shapeFacade.drawRectangle();
    }

}

```

- 测试结果

```
Draw circle...
Draw rectangle...
```

# 实现方式

# UML & Code

## UML

UML 图示如下

## Code

代码地址

> [外观模式](https://github.com/houbb/design-pattern/tree/master/design-pattern-note/src/main/java/com/ryo/design/pattern/note/facade)

# 系列导航

> [系列导航](https://blog.csdn.net/ryo1060732496/article/details/80214740)

* any list
{:toc}