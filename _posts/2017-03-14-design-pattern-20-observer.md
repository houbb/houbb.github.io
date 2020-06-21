---
layout: post
title: Design Pattern 20-java 观察者模式（Observer Pattern）
date:  2017-03-14 19:52:28 +0800
categories: [Design Pattern]
tags: [design pattern, sf]
published: true
---

# 观察者模式

当对象间存在一对多关系时，则使用观察者模式（Observer Pattern）。

比如，当一个对象被修改时，则会自动通知它的依赖对象。

观察者模式属于行为型模式。

# 实际案例

类信息概览：

| 类名 | 说明 |
|:----|:----|
| Main.java | 方法的总入口 |
| Bee.java | 蜜蜂 |
| Flower.java | 花朵 |
| HummingBird.java | 蜂鸟 |

## 定义


- Bee.java

```java
package com.ryo.design.pattern.note.observer;

import java.util.Observable;
import java.util.Observer;

/**
 * @author houbinbin
 * @version 1.0
 * @on 17/3/14
 * @see Flower
 * @since 1.7
 */
public class Bee {

    /**
     * 小蜜蜂的名字
     */
    private String name;

    private Observer openObserver = new OpenObserver();

    private Observer closeObserver = new CloseObserver();

    public Bee(String name) {
        this.name = name;
    }


    // An inner class for observing openings:
    private class OpenObserver implements Observer {
        @Override
        public void update(Observable ob, Object a) {
            System.out.println("Bee " + name
                    + "'s breakfast time!");
        }
    }

    // Another inner class for closings:
    private class CloseObserver implements Observer {
        @Override
        public void update(Observable ob, Object a) {
            System.out.println("Bee " + name
                    + "'s bed time!");
        }
    }

    public Observer getOpenObserver() {
        return openObserver;
    }

    public Observer getCloseObserver() {
        return closeObserver;
    }
}

```


- Flower.java

```java
package com.ryo.design.pattern.note.observer;

import java.util.Observable;

/**
 * @author houbinbin
 * @version 1.0
 * @on 17/3/14
 * @since 1.7
 */
public class Flower {


    /**
     * 标志当前花是否开放
     */
    private boolean isOpen;

    private OpenNotifier openNotifier = new OpenNotifier();

    private CloseNotifier closeNotifier = new CloseNotifier();

    /**
     * 默认花不开
     */
    public Flower() {
        isOpen = false;
    }


    public Observable getOpenNotifier() {
        return openNotifier;
    }

    public Observable getCloseNotifier() {
        return closeNotifier;
    }

    /**
     * 花开
     */
    public void open() {
        isOpen = true;
        openNotifier.notifyObservers(); //通知所有观察者， 花开了。
        closeNotifier.open();   //重置状态
    }

    /**
     * 花落
     */
    public void close() {
        isOpen = false;
        closeNotifier.notifyObservers();
        openNotifier.close();   //重置状态
    }

    /**
     * 花开通知器
     */
    private class OpenNotifier extends Observable {

        private boolean alreadyOpen = false;

        //从花未开变成了花开
        @Override
        public void notifyObservers() {
            if (isOpen && !alreadyOpen) {
                setChanged();
                super.notifyObservers();
                alreadyOpen = true;
            }
        }

        public void close() {
            alreadyOpen = false;
        }
    }

    /**
     * 花落通知器
     */
    private class CloseNotifier extends Observable {

        private boolean alreadyClosed = false;

        /**
         * 从花落变成了花开
         */
        @Override
        public void notifyObservers() {
            if (!isOpen && !alreadyClosed) {
                setChanged();
                super.notifyObservers();
                alreadyClosed = true;
            }
        }

        public void open() {
            alreadyClosed = false;
        }
    }



}

```


- HummingBird.java

```java
package com.ryo.design.pattern.note.observer;

import java.util.Observable;
import java.util.Observer;

/**
 * @author houbinbin
 * @version 1.0
 * @on 17/3/14
 * @see Flower
 * @since 1.7
 */
public class HummingBird {

    /**
     * 蜂鸟的名字
     */
    private String name;

    private Observer openObserver = new OpenObserver();

    private Observer closeObserver = new CloseObserver();

    public HummingBird(String name) {
        this.name = name;
    }

    /**
     * An inner class for observing openings:
     */
    private class OpenObserver implements Observer {
        @Override
        public void update(Observable ob, Object a) {
            System.out.println("HummingBird " + name
                    + "'s breakfast time!");
        }
    }

    /**
     * Another inner class for closings:
     */
    private class CloseObserver implements Observer {
        @Override
        public void update(Observable ob, Object a) {
            System.out.println("HummingBird " + name
                    + "'s bed time!");
        }
    }

    public Observer getOpenObserver() {
        return openObserver;
    }

    public Observer getCloseObserver() {
        return closeObserver;
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

package com.ryo.design.pattern.note.observer;

/**
 * <p> </p>
 *
 * <pre> Created: 2018/5/23 下午8:57  </pre>
 * <pre> Project: design-pattern  </pre>
 *
 * @author houbinbin
 * @version 1.0
 * @since JDK 1.7
 */
public class Main {

    public static void main(String[] args) {
        Flower flower = new Flower();
        Bee bee = new Bee("Bee A");
        HummingBird hummingBird = new HummingBird("HummingBird A");

        flower.getOpenNotifier().addObserver(bee.getOpenObserver());
        flower.getCloseNotifier().addObserver(bee.getCloseObserver());
        flower.getOpenNotifier().addObserver(hummingBird.getOpenObserver());

        System.out.println("-- flower start open");
        flower.open();
        System.out.println("-- flower end open");

        System.out.println("-- flower start close");
        flower.close();
        System.out.println("-- flower end close");
    }

}

```

- 测试结果

```
-- flower start open
HummingBird HummingBird A's breakfast time!
Bee Bee A's breakfast time!
-- flower end open
-- flower start close
Bee Bee A's bed time!
-- flower end close
```

# 实现方式

# UML & Code

## UML

UML 图示如下

## Code

代码地址

> [观察者模式](https://github.com/houbb/design-pattern/tree/master/design-pattern-note/src/main/java/com/ryo/design/pattern/note/observer)

# 系列导航

> [系列导航](https://blog.csdn.net/ryo1060732496/article/details/80214740)

* any list
{:toc}