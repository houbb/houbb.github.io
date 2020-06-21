---
layout: post
title: Design Pattern 12-java 享元模式(Flyweight Pattern)
date:  2017-03-14 19:52:28 +0800
categories: [Design Pattern]
tags: [design pattern, sf]
published: true
---

# 享元模式

享元模式（Flyweight Pattern）主要用于**减少创建对象的数量，以减少内存占用和提高性能**。

这种类型的设计模式属于结构型模式，它提供了减少对象数量从而改善应用所需的对象结构的方式。

享元模式尝试重用现有的同类对象，如果未找到匹配的对象，则创建新对象

# 实际案例

类信息概览：

| 类名 | 说明 |
|:----|:----|
| Main.java | 方法的总入口 |
| RectangleFactory.java | 工厂 |
| Rectangle.java | 长方形 |

## 定义


- RectangleFactory.java

```java
package com.ryo.design.pattern.note.flyweight;

import java.util.HashMap;
import java.util.Map;

/**
 * @author houbinbin
 * @version 1.0
 * @on 2017/8/12
 * @since 1.7
 */
public class RectangleFactory {

    private static Map<String, Rectangle> rectangleMap = new HashMap<>();

    public static Rectangle getRectangle(String color) {
          Rectangle rectangle = rectangleMap.get(color);

          if(rectangle == null) {
              rectangle = new Rectangle();
              rectangle.setColor(color);
              rectangleMap.put(color, rectangle);
          }
          return rectangle;
    }

}

```


- Rectangle.java

```java
package com.ryo.design.pattern.note.flyweight;

import lombok.Data;

/**
 * @author houbinbin
 * @version 1.0
 * @on 2017/8/12
 * @since 1.7
 */
@Data
public class Rectangle {

    private int width;

    private int weight;

    private String color;

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

package com.ryo.design.pattern.note.flyweight;

/**
 * <p> </p>
 *
 * <pre> Created: 2018/5/17 下午8:41  </pre>
 * <pre> Project: design-pattern  </pre>
 *
 * @author houbinbin
 * @version 1.0
 * @since JDK 1.7
 */
public class Main {

    public static void main(String[] args) {
        Rectangle rectangle = RectangleFactory.getRectangle("RED");
        rectangle.setWeight(11);
        Rectangle rectangle2 = RectangleFactory.getRectangle("BLUE");
        rectangle2.setWeight(12);
        Rectangle rectangle3 = RectangleFactory.getRectangle("YELLOW");
        rectangle3.setWeight(13);
        Rectangle rectangle4 = RectangleFactory.getRectangle("RED");
        rectangle4.setWeight(14);
        Rectangle rectangle5 = RectangleFactory.getRectangle("BLUE");
        rectangle5.setWeight(15);

        System.out.println(rectangle);
        System.out.println(rectangle2);
        System.out.println(rectangle3);
        System.out.println(rectangle4);
        System.out.println(rectangle5);
    }

}

```

- 测试结果

```
Rectangle(width=0, weight=14, color=RED)
Rectangle(width=0, weight=15, color=BLUE)
Rectangle(width=0, weight=13, color=YELLOW)
Rectangle(width=0, weight=14, color=RED)
Rectangle(width=0, weight=15, color=BLUE)
```



# 实现方式

# UML & Code

## UML

UML 图示如下

## Code

代码地址

> [享元模式](https://github.com/houbb/design-pattern/tree/master/design-pattern-note/src/main/java/com/ryo/design/pattern/note/flyweight)

# 系列导航

> [系列导航](https://blog.csdn.net/ryo1060732496/article/details/80214740)

* any list
{:toc}