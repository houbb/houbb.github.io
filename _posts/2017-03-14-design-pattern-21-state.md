---
layout: post
title: Design Pattern 21-java 状态模式（State Pattern）
date:  2017-03-14 19:52:28 +0800
categories: [Design Pattern]
tags: [design pattern, sf]
published: true
---

# 状态模式

在状态模式（State Pattern）中，类的行为是基于它的状态改变的。这种类型的设计模式属于行为型模式。

在状态模式中，我们创建表示各种状态的对象和一个行为随着状态对象改变而改变的 context 对象。

# 实际案例

类信息概览：

| 类名 | 说明 |
|:----|:----|
| Main.java | 方法的总入口 |
| Context.java | 上下文 |
| StopState.java | 停止状态 |
| StartState.java | 开始状态 |
| State.java | 状态 |

## 定义


- Context.java

```java
package com.ryo.design.pattern.note.state;

/**
 * Created by bbhou on 2017/8/17.
 */
public class Context {

    private State state;

    public State getState() {
        return state;
    }

    public void setState(State state) {
        this.state = state;
    }

}

```


- StopState.java

```java
package com.ryo.design.pattern.note.state;

/**
 * Created by bbhou on 2017/8/17.
 */
public class StopState implements State {

    @Override
    public void doAction(Context context) {
        System.out.println("Stop State...");
        context.setState(this);
    }

    @Override
    public String getMsg() {
        return "Stop State";
    }

}

```


- StartState.java

```java
package com.ryo.design.pattern.note.state;

/**
 * Created by bbhou on 2017/8/17.
 */
public class StartState implements State {

    @Override
    public void doAction(Context context) {
        System.out.println("Start State...");
        context.setState(this);
    }

    @Override
    public String getMsg() {
        return "Start State";
    }
}

```


- State.java

```java
package com.ryo.design.pattern.note.state;

/**
 * Created by bbhou on 2017/8/17.
 */
public interface State {

    void doAction(Context context);

    String getMsg();

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

package com.ryo.design.pattern.note.state;

/**
 * <p> </p>
 *
 * <pre> Created: 2018/5/24 下午9:47  </pre>
 * <pre> Project: design-pattern  </pre>
 *
 * @author houbinbin
 * @version 1.0
 * @since JDK 1.7
 */
public class Main {

    public static void main(String[] args) {
        Context context = new Context();

        StartState startState = new StartState();
        startState.doAction(context);
        System.out.println(context.getState().getMsg());

        StopState stopState = new StopState();
        stopState.doAction(context);

        System.out.println(context.getState().getMsg());
    }

}

```

- 测试结果

```
Start State...
Start State
Stop State...
Stop State
```

# 实现方式

# UML & Code

## UML

UML 图示如下

## Code

代码地址

> [状态模式](https://github.com/houbb/design-pattern/tree/master/design-pattern-note/src/main/java/com/ryo/design/pattern/note/state)

# 系列导航

> [系列导航](https://blog.csdn.net/ryo1060732496/article/details/80214740)

* any list
{:toc}