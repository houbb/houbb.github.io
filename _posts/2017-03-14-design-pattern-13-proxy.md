---
layout: post
title: Design Pattern 13-java 代理模式(Proxy Pattern)
date:  2017-03-14 19:52:28 +0800
categories: [Design Pattern]
tags: [design pattern, sf]
published: true
---

# 代理模式

在代理模式（Proxy Pattern）中，一个类代表另一个类的功能。这种类型的设计模式属于结构型模式。

在代理模式中，我们创建具有现有对象的对象，以便向外界提供功能接口。

# 实际案例

类信息概览：

| 类名 | 说明 |
|:----|:----|
| Main.java | 方法的总入口 |
| Image.java | 图片类 |
| ProxyImage.java | 图片代理 |
| RealImage.java | 实际图片服务类 |

## 定义


- Image.java

```java
package com.ryo.design.pattern.note.proxy;

/**
 * @author houbinbin
 * @version 1.0
 * @on 2017/8/12
 * @since 1.7
 */
public interface Image {

    /**
     * 展现
     */
    void display();

}

```


- ProxyImage.java

```java
package com.ryo.design.pattern.note.proxy;

/**
 * @author houbinbin
 * @version 1.0
 * @on 2017/8/12
 * @since 1.7
 */
public class ProxyImage implements Image {

    private RealImage realImage;

    private String fileName;

    public ProxyImage(String fileName) {
        this.fileName = fileName;
    }

    @Override
    public void display() {
        if(realImage == null) {
            realImage = new RealImage(fileName);
        }

        realImage.display();
    }

}

```


- RealImage.java

```java
package com.ryo.design.pattern.note.proxy;

/**
 * @author houbinbin
 * @version 1.0
 * @on 2017/8/12
 * @since 1.7
 */
public class RealImage implements Image {

    private String fileName;

    public RealImage(String fileName) {
        this.fileName = fileName;

        load();
    }

    private void load() {
        System.out.println("Loading  "+this.fileName);
    }

    @Override
    public void display() {
        System.out.println("Display "+this.fileName);
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

package com.ryo.design.pattern.note.proxy;

/**
 * <p> </p>
 *
 * <pre> Created: 2018/5/20 下午7:13  </pre>
 * <pre> Project: design-pattern  </pre>
 *
 * @author houbinbin
 * @version 1.0
 * @since JDK 1.7
 */
public class Main {

    public static void main(String[] args) {
        Image image = new ProxyImage("1.png");
        image.display();
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

> [代理模式](https://github.com/houbb/design-pattern/tree/master/design-pattern-note/src/main/java/com/ryo/design/pattern/note/proxy)

# 系列导航

> [系列导航](https://blog.csdn.net/ryo1060732496/article/details/80214740)

* any list
{:toc}