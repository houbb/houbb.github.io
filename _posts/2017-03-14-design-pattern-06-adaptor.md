---
layout: post
title: Design Pattern 06-适配器模式(Adapter Pattern)
date:  2017-03-14 19:52:28 +0800
categories: [Design Pattern]
tags: [design pattern, sf]
published: true
---

# 适配器模式

适配器模式（Adapter Pattern）是作为**两个不兼容的接口之间的桥梁**。这种类型的设计模式属于结构型模式，它结合了两个独立接口的功能。

这种模式涉及到一个单一的类，该类负责加入独立的或不兼容的接口功能。举个真实的例子，读卡器是作为内存卡和笔记本之间的适配器。您将内存卡插入读卡器，再将读卡器插入笔记本，这样就可以通过笔记本来读取内存卡。

我们通过下面的实例来演示适配器模式的使用。其中，音频播放器设备只能播放 mp3 文件，通过使用一个更高级的音频播放器来播放 vlc 和 mp4 文件。

# 实际案例

类信息概览：

| 类名 | 说明 |
|:----|:----|
| Main.java | 方法的总入口 |
| AdapterDelegate.java | 内聚的方式实现 |
| Adaptee.java | 内聚类 |
| Adapter.java | 适配器 |
| Target.java | 用户的预期接口 |

## 定义


- AdapterDelegate.java

```java
package com.ryo.design.pattern.note.adapter;

/**
 * 聚合的方式
 * @author houbinbin
 * @version 1.0
 * @on 2017/8/10
 * @since 1.7
 */
public class AdapterDelegate implements Target {


    private Adaptee adaptee;

    public AdapterDelegate(Adaptee adaptee) {
        this.adaptee = adaptee;
    }

    /**
     * 使用委托的方式
     */
    public void twoPlugin() {
        adaptee.twoPlugin();
    }

    @Override
    public void standardThreePlugin() {
        System.out.println("Adapter with three plugins...");
    }

}

```


- Adaptee.java

```java
package com.ryo.design.pattern.note.adapter;

/**
 * 两个产口的对象
 * @author houbinbin
 * @version 1.0
 * @on 2017/8/10
 * @since 1.7
 */
public class Adaptee {

    /**
     * 只有两个插口。。。
     */
    public void twoPlugin() {
        System.out.println("Only has two plugins...");
    }

}

```


- Adapter.java

```java
package com.ryo.design.pattern.note.adapter;

/**
 * 继承的方式
 * @author houbinbin
 * @version 1.0
 * @on 2017/8/10
 * @since 1.7
 */
public class Adapter extends Adaptee implements Target {


    @Override
    public void standardThreePlugin() {
        System.out.println("Adapter with three plugins...");
    }

}

```


- Target.java

```java
package com.ryo.design.pattern.note.adapter;

/**
 * 客户所期待的接口。目标可以是具体的或抽象的类，也可以是接口。
 * @author houbinbin
 * @version 1.0
 * @on 2017/8/10
 * @since 1.7
 */
public interface Target {

    /**
     * 标准接口。
     * 1. 插板上标准的 3 个插头
     */
    void standardThreePlugin();

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

package com.ryo.design.pattern.note.adapter;

/**
 * <p> </p>
 *
 * <pre> Created: 2018/5/13 下午5:00  </pre>
 * <pre> Project: design-pattern  </pre>
 *
 * @author houbinbin
 * @version 1.0
 * @since JDK 1.7
 */
public class Main {

    public static void main(String[] args) {
        Adapter adapter = new Adapter();
        adapter.standardThreePlugin();
        adapter.twoPlugin();


        AdapterDelegate delegate = new AdapterDelegate(new Adaptee());
        delegate.standardThreePlugin();
        delegate.twoPlugin();
    }

}

```

- 测试结果

```
Adapter with three plugins...
Only has two plugins...
Adapter with three plugins...
Only has two plugins...
```

# 实现方式

# UML & Code

## UML

UML 图示如下

## Code

代码地址

> [适配器模式](https://github.com/houbb/design-pattern/tree/master/design-pattern-note/src/main/java/com/ryo/design/pattern/note/adapter)

# 系列导航

> [系列导航](https://blog.csdn.net/ryo1060732496/article/details/80214740)

* any list
{:toc}