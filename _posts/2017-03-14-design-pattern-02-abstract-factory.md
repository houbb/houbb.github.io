---
layout: post
title: Design Pattern 02-抽象工厂模式(abstract factory)
date:  2017-03-14 19:52:28 +0800
categories: [Design Pattern]
tags: [design pattern, sf]
published: true
---

# 抽象工厂模式

抽象工厂模式（Abstract Factory Pattern）是围绕一个超级工厂创建其他工厂。该超级工厂又称为其他工厂的工厂。这种类型的设计模式属于创建型模式，它提供了一种创建对象的最佳方式。

在抽象工厂模式中，接口是负责创建一个相关对象的工厂，不需要显式指定它们的类。每个生成的工厂都能按照工厂模式提供对象。

## 介绍

意图：提供一个创建一系列相关或相互依赖对象的接口，而无需指定它们具体的类。

主要解决：主要解决接口选择的问题。

何时使用：系统的产品有多于一个的产品族，而系统只消费其中某一族的产品。

如何解决：在一个产品族里面，定义多个产品。

关键代码：在一个工厂里聚合多个同类产品。

## 优点

当一个产品族中的多个对象被设计成一起工作时，它能保证客户端始终只使用同一个产品族中的对象。

## 缺点

产品族扩展非常困难，要增加一个系列的某一产品，既要在抽象的 Creator 里加代码，又要在具体的里面加代码。

## 实际应用

### 应用实例： 

工作了，为了参加一些聚会，肯定有两套或多套衣服吧，比如说有商务装（成套，一系列具体产品）、时尚装（成套，一系列具体产品），甚至对于一个家庭来说，
可能有商务女装、商务男装、时尚女装、时尚男装，这些也都是成套的，即一系列具体产品。假设一种情况（现实中是不存在的，要不然，没法进入共产主义了，但有利于说明抽象工厂模式），
在您的家中，某一个衣柜（具体工厂）只能存放某一种这样的衣服（成套，一系列具体产品），每次拿这种成套的衣服时也自然要从这个衣柜中取出了。
用 OO 的思想去理解，所有的衣柜（具体工厂）都是衣柜类的（抽象工厂）某一个，而每一件成套的衣服又包括具体的上衣（某一具体产品），裤子（某一具体产品），这些具体的上衣其实也都是上衣（抽象产品），
具体的裤子也都是裤子（另一个抽象产品）。

### 使用场景： 

1、QQ 换皮肤，一整套一起换。 

2、生成不同操作系统的程序。

## 注意事项

产品族难扩展，产品等级易扩展

# 代码

假设如下场景：我们设计一个画板程序。

有不同的颜色(color)，又有不同的形状(shape)。

color 工厂负责各种颜色，shape 负责各种形状。

我们其实可以对 color, shape 工厂也进行抽象，隐藏工厂的创建细节。

## 接口 & 工厂

- Factory

```java
package com.ryo.design.pattern.note.abstractFactory.core;

/**
 * 工厂-接口
 * @author houbinbin
 * @version 1.0
 * @on 17/2/28
 * @since 1.7
 */
public interface Factory<T> {

    T newInstance(String type);

}
```

- Color

```java
package com.ryo.design.pattern.note.abstractFactory.core;

/**
 * 颜色-接口
 * @author houbinbin
 * @version 1.0
 * @on 17/2/28
 * @since 1.7
 */
public interface Color {

    void fill();

}
```

- Shape

```java
package com.ryo.design.pattern.note.abstractFactory.core;

/**
 * 形状-接口
 * @author houbinbin
 * @version 1.0
 * @on 17/2/28
 * @since 1.7
 */
public interface Shape {

    /**
     * 图形接口
     * 进行绘制
     */
    void draw();

}
```

## 常量

为了各种类型的统一管理，使用常量进行定义。

- FactoryTypeConstant

```java
package com.ryo.design.pattern.note.abstractFactory.constant;

/**
 * 工厂类型-常量
 * @author houbinbin
 * @version 1.0
 * @on 17/2/28
 * @since 1.7
 */
public class FactoryTypeConstant {

    public static final String SHAPE = "shape";

    public static final String COLOR = "color";

}
```

- ColorTypeConstant

```java
package com.ryo.design.pattern.note.abstractFactory.constant;

/**
 * 颜色类型-常量
 * @author houbinbin
 * @version 1.0
 * @on 17/2/28
 * @since 1.7
 */
public class ColorTypeConstant {

    public static final String RED = "red";

    public static final String YELLOW = "yellow";

    public static final String BLUE = "blue";

}
```

- ShapeTypeConstant

```java
package com.ryo.design.pattern.note.abstractFactory.constant;

/**
 * 形状类型-常量
 * @author houbinbin
 * @version 1.0
 * @on 17/2/28
 * @since 1.7
 */
public class ShapeTypeConstant {

    public static final String CIRCLE = "circle";

    public static final String RECTANGLE = "rectangle";

    public static final String TRIANGLE = "triangle";

}
```

## 具体子类

### 工厂实现

- FactoryProducer

```java
package com.ryo.design.pattern.note.abstractFactory.core.impl;


import com.ryo.design.pattern.note.abstractFactory.constant.FactoryTypeConstant;
import com.ryo.design.pattern.note.abstractFactory.core.Factory;

/**
 * 工厂生产者
 * @author houbinbin
 * @version 1.0
 * @on 17/2/28
 * @since 1.7
 */
public class FactoryProducer {

    public static Factory newFactory(String type) {

        if (FactoryTypeConstant.COLOR.equals(type)) {
            return new ColorFactory();
        }

        if (FactoryTypeConstant.SHAPE.equals(type)) {
            return new ShapeFactory();
        }

        return null;
    }

}
```

- ColorFactory

```java
package com.ryo.design.pattern.note.abstractFactory.core.impl;


import com.ryo.design.pattern.note.abstractFactory.constant.ColorTypeConstant;
import com.ryo.design.pattern.note.abstractFactory.core.Color;
import com.ryo.design.pattern.note.abstractFactory.core.Factory;

/**
 * 颜色工厂
 * @author houbinbin
 * @version 1.0
 * @on 17/2/28
 * @since 1.7
 */
public class ColorFactory implements Factory<Color> {

    @Override
    public Color newInstance(String type) {
        if(ColorTypeConstant.BLUE.equals(type)) {
            return new Blue();
        }

        if(ColorTypeConstant.RED.equals(type)) {
            return new Red();
        }

        if(ColorTypeConstant.YELLOW.equals(type)) {
            return new Yellow();
        }

        return null;
    }

}
```

- ShapeFactory

```java
package com.ryo.design.pattern.note.abstractFactory.core.impl;


import com.ryo.design.pattern.note.abstractFactory.constant.ShapeTypeConstant;
import com.ryo.design.pattern.note.abstractFactory.core.Factory;
import com.ryo.design.pattern.note.abstractFactory.core.Shape;

/**
 * 形状工厂
 * @author houbinbin
 * @version 1.0
 * @on 17/2/28
 * @since 1.7
 */
public class ShapeFactory implements Factory<Shape> {

    @Override
    public Shape newInstance(String type) {
        if(ShapeTypeConstant.CIRCLE.equals(type)) {
            return new Circle();
        }

        if(ShapeTypeConstant.RECTANGLE.equals(type)) {
            return new Rectangle();
        }

        if(ShapeTypeConstant.TRIANGLE.equals(type)) {
            return new Triangle();
        }

        return null;
    }

}
```

### 颜色实现

- Blue

```java
package com.ryo.design.pattern.note.abstractFactory.core.impl;


import com.ryo.design.pattern.note.abstractFactory.core.Color;

/**
 * 蓝色
 * @author houbinbin
 * @version 1.0
 * @on 17/2/28
 * @since 1.7
 */
public class Blue implements Color {
    @Override
    public void fill() {
        System.out.println("fill blue");
    }
}
```

- Red

```java
package com.ryo.design.pattern.note.abstractFactory.core.impl;


import com.ryo.design.pattern.note.abstractFactory.core.Color;

/**
 * 红色
 * @author houbinbin
 * @version 1.0
 * @on 17/2/28
 * @since 1.7
 */
public class Red implements Color {
    @Override
    public void fill() {
        System.out.println("fill red");
    }
}
```

- Yellow

```java
package com.ryo.design.pattern.note.abstractFactory.core.impl;


import com.ryo.design.pattern.note.abstractFactory.core.Color;

/**
 * 黄色
 * @author houbinbin
 * @version 1.0
 * @on 17/2/28
 * @since 1.7
 */
public class Yellow implements Color {
    @Override
    public void fill() {
        System.out.println("fill yellow");
    }
}
```

### 形状实现

- Circle

```java
package com.ryo.design.pattern.note.abstractFactory.core.impl;


import com.ryo.design.pattern.note.abstractFactory.core.Shape;

/**
 * 圆形
 * @author houbinbin
 * @version 1.0
 * @on 17/2/28
 * @since 1.7
 */
public class Circle implements Shape {

    @Override
    public void draw() {
        System.out.println("circle draw");
    }

}
```

- Rectangle

```java
package com.ryo.design.pattern.note.abstractFactory.core.impl;

import com.ryo.design.pattern.note.abstractFactory.core.Shape;

/**
 * 长方形
 * @author houbinbin
 * @version 1.0
 * @on 17/2/28
 * @since 1.7
 */
public class Rectangle implements Shape {
    @Override
    public void draw() {
        System.out.println("draw Rectangle");
    }
}
```

- Triangle

```java
package com.ryo.design.pattern.note.abstractFactory.core.impl;


import com.ryo.design.pattern.note.abstractFactory.core.Shape;

/**
 * 三角形
 * @author houbinbin
 * @version 1.0
 * @on 17/2/28
 * @since 1.7
 */
public class Triangle implements Shape {
    @Override
    public void draw() {
        System.out.println("draw Triangle");
    }
}
```

## 测试 & 结果

- Main.java

```java
package com.ryo.design.pattern.note.abstractFactory;

import com.ryo.design.pattern.note.abstractFactory.constant.ColorTypeConstant;
import com.ryo.design.pattern.note.abstractFactory.constant.FactoryTypeConstant;
import com.ryo.design.pattern.note.abstractFactory.core.Color;
import com.ryo.design.pattern.note.abstractFactory.core.Factory;
import com.ryo.design.pattern.note.abstractFactory.core.impl.FactoryProducer;

/**
 * <p> </p>
 *
 * <pre> Created: 2018/5/6 下午3:39  </pre>
 * <pre> Project: design-pattern  </pre>
 *
 * @author houbinbin
 * @version 1.0
 * @since JDK 1.7
 */
public class Main {

    public static void main(String[] args) {
        Factory<Color> colorFactory = FactoryProducer.newFactory(FactoryTypeConstant.COLOR);
        Color color = colorFactory.newInstance(ColorTypeConstant.BLUE);
        color.fill();
    }

}
```

- 结果

```
fill blue
```

# UML & Code

## UML

![abstract factory](https://img-blog.csdn.net/20180506155815869?watermark/2/text/aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3J5bzEwNjA3MzI0OTY=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70)

## Code

> [abstractFactory](https://github.com/houbb/design-pattern/tree/master/design-pattern-note/src/main/java/com/ryo/design/pattern/note/abstractFactory)

# 目录导航

> [目录导航](https://blog.csdn.net/ryo1060732496/article/details/80214740)

* any list
{:toc}