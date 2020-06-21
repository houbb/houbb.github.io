---
layout: post
title: Design Pattern 18-java 中介者模式（Mediator Pattern）
date:  2017-03-14 19:52:28 +0800
categories: [Design Pattern]
tags: [design pattern, sf]
published: true
---

# 中介者模式

中介者模式（Mediator Pattern）是用来降低多个对象和类之间的通信复杂性。

这种模式提供了一个中介类，该类通常处理不同类之间的通信，并支持松耦合，使代码易于维护。

中介者模式属于行为型模式。

# 实际案例

类信息概览：

| 类名 | 说明 |
|:----|:----|
| Main.java | 方法的总入口 |
| User.java | 用户 |
| WeChat.java | 中介者 |

## 定义

- User.java

```java
package com.ryo.design.pattern.note.mediator;

/**
 * @author houbinbin
 * @version 1.0
 * @on 2017/8/16
 * @since 1.7
 */
public class User {

    private String name;

    public User(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

}

```


- WeChat.java

```java
package com.ryo.design.pattern.note.mediator;

/**
 * @author houbinbin
 * @version 1.0
 * @on 2017/8/16
 * @since 1.7
 */
public class WeChat {

    private User user;

    private String message;

    public WeChat(User user, String message) {
        this.user = user;
        this.message = message;
    }

    public void say() {
        System.out.println("["+this.user.getName()+"]"+", msg: "+message);
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

package com.ryo.design.pattern.note.mediator;

/**
 * <p> </p>
 *
 * <pre> Created: 2018/5/22 下午8:04  </pre>
 * <pre> Project: design-pattern  </pre>
 *
 * @author houbinbin
 * @version 1.0
 * @since JDK 1.7
 */
public class Main {

    public static void main(String[] args) {
        User user = new User("ryo");
        User user2 = new User("marry");

        String msg = "hello marry";
        String msg2 = "hello ryo";

        WeChat weChat = new WeChat(user, msg);
        WeChat weChat2 = new WeChat(user2, msg2);

        weChat.say();
        weChat2.say();
    }

}

```

- 测试结果

```
[ryo], msg: hello marry
[marry], msg: hello ryo
```

# 实现方式

# UML & Code

## UML

UML 图示如下

## Code

代码地址

> [中介者模式](https://github.com/houbb/design-pattern/tree/master/design-pattern-note/src/main/java/com/ryo/design/pattern/note/mediator)

# 系列导航

> [系列导航](https://blog.csdn.net/ryo1060732496/article/details/80214740)

* any list
{:toc}