---
layout: post
title: Design Pattern 10-java 装饰器模式（Decorator Pattern）
date:  2017-03-14 19:52:28 +0800
categories: [Design Pattern]
tags: [design pattern, sf]
published: true
---

# 装饰器模式

装饰器模式（Decorator Pattern）允许向一个现有的对象**添加新的功能，同时又不改变其结构**。

这种类型的设计模式属于结构型模式，它是作为现有的类的一个包装。

这种模式创建了一个装饰类，用来包装原有的类，并在保持类方法签名完整性的前提下，提供了额外的功能。

# 实际案例

类信息概览：

| 类名 | 说明 |
|:----|:----|
| Main.java | 方法的总入口 |
| RectanglePainter.java | 长方形绘图 |
| CirclePainter.java | 圆形绘图 |
| Painter.java | 绘图接口 |
| PainterDecorator.java | 绘图装饰器 |

## 定义


- RectanglePainter.java

```java
package com.ryo.design.pattern.note.decorator;

/**
 * Created by bbhou on 2017/8/11.
 */
public class RectanglePainter implements Painter {
    @Override
    public void draw() {
        System.out.println("Draw rectangle...");
    }
}

```


- CirclePainter.java

```java
package com.ryo.design.pattern.note.decorator;

/**
 * Created by bbhou on 2017/8/11.
 */
public class CirclePainter implements Painter {
    @Override
    public void draw() {
        System.out.println("Draw circle...");
    }
}

```


- Painter.java

```java
package com.ryo.design.pattern.note.decorator;

/**
 * Created by bbhou on 2017/8/11.
 */
public interface Painter {

    /**
     * 绘制
     */
    void draw();

}

```


- PainterDecorator.java

```java
package com.ryo.design.pattern.note.decorator;

/**
 * Created by bbhou on 2017/8/11.
 */
public class PainterDecorator implements Painter {

    private Painter painter;

    public PainterDecorator(Painter painter) {
        this.painter = painter;
    }

    @Override
    public void draw() {
        painter.draw();
        setBorderColor();
    }

    private void setBorderColor() {
        System.out.println("Set border color...");
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

package com.ryo.design.pattern.note.decorator;

/**
 * <p> </p>
 *
 * <pre> Created: 2018/5/16 下午8:16  </pre>
 * <pre> Project: design-pattern  </pre>
 *
 * @author houbinbin
 * @version 1.0
 * @since JDK 1.7
 */
public class Main {

    public static void main(String[] args) {
        Painter painter = new PainterDecorator(new CirclePainter());
        painter.draw();

        Painter painter2 = new PainterDecorator(new RectanglePainter());
        painter2.draw();
    }

}

```

- 测试结果

```
Draw circle...
Set border color...
Draw rectangle...
Set border color...
```

# 实现方式

# UML & Code

## UML

UML 图示如下

## Code

代码地址

> [装饰器模式](https://github.com/houbb/design-pattern/tree/master/design-pattern-note/src/main/java/com/ryo/design/pattern/note/Decorator)

# 系列导航

> [系列导航](https://blog.csdn.net/ryo1060732496/article/details/80214740)

* any list
{:toc}