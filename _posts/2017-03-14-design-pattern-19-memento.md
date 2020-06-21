---
layout: post
title: Design Pattern 19-java 备忘录模式（Memento Pattern）
date:  2017-03-14 19:52:28 +0800
categories: [Design Pattern]
tags: [design pattern, sf]
published: true
---

# 备忘录模式

备忘录模式（Memento Pattern）保存一个对象的某个状态，以便在适当的时候恢复对象。

备忘录模式属于行为型模式。

# 实际案例

类信息概览：

| 类名 | 说明 |
|:----|:----|
| Main.java | 方法的总入口 |
| Memento.java | 记忆者 |
| MementoManager.java | 记忆管理者 |
| Original.java | 原始内容 |

## 定义

- Memento.java

```java
package com.ryo.design.pattern.note.memento;

/**
 * @author houbinbin
 * @version 1.0
 * @on 2017/8/17
 * @since 1.7
 */
public class Memento {

    private String state;

    public Memento(String state) {
        this.state = state;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

}

```

- MementoManager.java

```java
package com.ryo.design.pattern.note.memento;

import java.util.LinkedList;
import java.util.List;

/**
 * @author houbinbin
 * @version 1.0
 * @on 2017/8/17
 * @since 1.7
 */
public class MementoManager {

    private List<Memento> mementoList = new LinkedList<>();

    public void add(Memento memento) {
        this.mementoList.add(memento);
    }

    public Memento get(int index) {
        return mementoList.get(index);
    }

}

```


- Original.java

```java
package com.ryo.design.pattern.note.memento;

/**
 * @author houbinbin
 * @version 1.0
 * @on 2017/8/17
 * @since 1.7
 */
public class Original {

    private String state;

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }


    //-------------------public method;

    /**
     * 保存到 记忆体中
     * @return
     */
    public Memento saveToMemento() {
        return new Memento(this.getState());
    }

    /**
     * 从记忆体中获取对应的状态
     * @param memento
     */
    public void getStateFromMemento(Memento memento) {
        String state = memento.getState();
        this.state = state;;
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

package com.ryo.design.pattern.note.memento;

/**
 * <p> </p>
 *
 * <pre> Created: 2018/5/23 下午8:46  </pre>
 * <pre> Project: design-pattern  </pre>
 *
 * @author houbinbin
 * @version 1.0
 * @since JDK 1.7
 */
public class Main {

    public static void main(String[] args) {
        Original original = new Original();
        MementoManager manager = new MementoManager();
        original.setState("State #1");
        original.setState("State #2");
        manager.add(original.saveToMemento());
        original.setState("State #3");
        manager.add(original.saveToMemento());
        original.setState("State #4");

        System.out.println("Current State: " + original.getState());
        original.getStateFromMemento(manager.get(0));
        System.out.println("First saved State: " + original.getState());
        original.getStateFromMemento(manager.get(1));
        System.out.println("Second saved State: " + original.getState());
    }

}

```

- 测试结果

```
Current State: State #4
First saved State: State #2
Second saved State: State #3
```

# 实现方式

# UML & Code

## UML

UML 图示如下

## Code

代码地址

> [备忘录模式](https://github.com/houbb/design-pattern/tree/master/design-pattern-note/src/main/java/com/ryo/design/pattern/note/memento)

# 系列导航

> [系列导航](https://blog.csdn.net/ryo1060732496/article/details/80214740)

* any list
{:toc}