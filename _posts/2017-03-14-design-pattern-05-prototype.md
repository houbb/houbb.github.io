---
layout: post
title: Design Pattern 05-原型模式(Prototype Pattern)
date:  2017-03-14 19:52:28 +0800
categories: [Design Pattern]
tags: [design pattern, sf]
published: true
---

# 原型模式

原型模式（Prototype Pattern）是用于**创建重复的对象，同时又能保证性能**。

这种类型的设计模式属于创建型模式，它提供了一种创建对象的最佳方式。

这种模式是实现了一个原型接口，该接口用于创建当前对象的克隆。当直接创建对象的代价比较大时，则采用这种模式。例如，一个对象需要在一个高代价的数据库操作之后被创建。我们可以缓存该对象，在下一个请求时返回它的克隆，在需要的时候更新数据库，以此来减少数据库调用。

# 实际案例

类信息概览：

| 类名 | 说明 |
|:----|:----|
| Main.java | 方法的总入口 |
| AbstractShape.java | 抽象父类 |
| ShapeCache.java | 缓存类 |
| Circle.java | 圆形 |
| Rectangle.java | 长方形 |

## 定义


- AbstractShape.java

```java
/*
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS HEADER.
 * Copyright (c) 2012-2018. houbinbini Inc.
 * design-pattern All rights reserved.
 */

package com.ryo.design.pattern.note.prototype;

/**
 * <p> </p>
 *
 * <pre> Created: 2018/5/13 下午4:29  </pre>
 * <pre> Project: design-pattern  </pre>
 *
 * @author houbinbin
 * @version 1.0
 * @since JDK 1.7
 */
public abstract class AbstractShape implements Cloneable {

    /**
     * 获取名称
     * @return 名称
     */
    public abstract String getName();

    @Override
    protected AbstractShape clone()  {
        try {
            return (AbstractShape) super.clone();
        } catch (CloneNotSupportedException e) {
            e.printStackTrace();
            return null;
        }
    }

}

```


- ShapeCache.java

```java
/*
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS HEADER.
 * Copyright (c) 2012-2018. houbinbini Inc.
 * design-pattern All rights reserved.
 */

package com.ryo.design.pattern.note.prototype;

import java.util.HashMap;
import java.util.Map;

/**
 * <p> 图形缓存 </p>
 * <p> 当资源的创建特别消耗资源时 </p>
 *
 * <pre> Created: 2018/5/13 下午4:29  </pre>
 * <pre> Project: design-pattern  </pre>
 *
 * @author houbinbin
 * @version 1.0
 * @since JDK 1.7
 */
public class ShapeCache  {

    /**
     * 存放对象的 map
     */
    private static Map<String, AbstractShape> MAP = new HashMap<>();


    /**
     * 加载缓存
     */
    public static void loadCache() {
        Circle circle = new Circle();
        MAP.put("Circle", circle);

        Rectangle rectangle = new Rectangle();
        MAP.put("Rectangle", rectangle);
    }

    /**
     * 获取形状的 clone
     * @param name 名称
     * @return 形状
     */
    public static AbstractShape getShape(final String name) {
        AbstractShape shape = MAP.get(name);
        return shape.clone();
    }


}

```


- Circle.java

```java
/*
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS HEADER.
 * Copyright (c) 2012-2018. houbinbini Inc.
 * design-pattern All rights reserved.
 */

package com.ryo.design.pattern.note.prototype;

/**
 * <p> </p>
 *
 * <pre> Created: 2018/5/13 下午4:30  </pre>
 * <pre> Project: design-pattern  </pre>
 *
 * @author houbinbin
 * @version 1.0
 * @since JDK 1.7
 */
public class Circle extends AbstractShape {
    @Override
    public String getName() {
        return "Circle";
    }
}

```


- Rectangle.java

```java
/*
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS HEADER.
 * Copyright (c) 2012-2018. houbinbini Inc.
 * design-pattern All rights reserved.
 */

package com.ryo.design.pattern.note.prototype;

/**
 * <p> </p>
 *
 * <pre> Created: 2018/5/13 下午4:30  </pre>
 * <pre> Project: design-pattern  </pre>
 *
 * @author houbinbin
 * @version 1.0
 * @since JDK 1.7
 */
public class Rectangle extends AbstractShape {
    @Override
    public String getName() {
        return "Rectangle";
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

package com.ryo.design.pattern.note.prototype;

/**
 * <p> </p>
 *
 * <pre> Created: 2018/5/13 下午4:20  </pre>
 * <pre> Project: design-pattern  </pre>
 *
 * @author houbinbin
 * @version 1.0
 * @since JDK 1.7
 */
public class Main {

    public static void main(String[] args) {
        ShapeCache.loadCache();

        AbstractShape circleOne = ShapeCache.getShape("Circle");
        System.out.println(circleOne.getName());

        //1. 两次是不同的对象 且通过 clone 性能还不错
        AbstractShape circleTwo = ShapeCache.getShape("Circle");
        System.out.println(circleTwo == circleOne);

        AbstractShape rectangle = ShapeCache.getShape("Rectangle");
        System.out.println(rectangle.getName());
    }

}

```

- 测试结果

```
Circle
false
Rectangle
```

# 实现方式

# UML & Code

## UML

UML 图示如下

## Code

代码地址

> [原型模式](https://github.com/houbb/design-pattern/tree/master/design-pattern-note/src/main/java/com/ryo/design/pattern/note/prototype)

# 系列导航

> [系列导航](https://blog.csdn.net/ryo1060732496/article/details/80214740)

* any list
{:toc}