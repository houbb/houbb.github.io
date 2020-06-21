---
layout: post
title: Design Pattern 26-java MVC 模式（Model-View-Controller）
date:  2017-03-14 19:52:28 +0800
categories: [Design Pattern]
tags: [design pattern, sf]
published: true
---

# MVC 模式

MVC 模式代表 Model-View-Controller（模型-视图-控制器） 模式。这种模式用于应用程序的分层开发。

- Model（模型） 

代表一个存取数据的对象或 JAVA POJO。它也可以带有逻辑，在数据变化时更新控制器。


- View（视图） 

代表模型包含的数据的可视化。

- Controller（控制器） 

作用于模型和视图上。它控制数据流向模型对象，并在数据变化时更新视图。它使视图与模型分离开。

# 实际案例

类信息概览：

| 类名 | 说明 |
|:----|:----|
| Main.java | 方法的总入口 |
| User.java | model |
| UserView.java | 实体视图 |
| UserController.java | 实体控制 |

## 定义


- User.java

```java
/*
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS HEADER.
 * Copyright (c) 2012-2018. houbinbini Inc.
 * design-pattern All rights reserved.
 */

package com.ryo.design.pattern.note.mvc;

/**
 * <p> </p>
 *
 * <pre> Created: 2018/5/26 下午8:44  </pre>
 * <pre> Project: design-pattern  </pre>
 *
 * @author houbinbin
 * @version 1.0
 * @since JDK 1.7
 */
public class User {

    private String name;

    private int age;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        this.age = age;
    }

    @Override
    public String toString() {
        return "User{" +
                "name='" + name + '\'' +
                ", age=" + age +
                '}';
    }
}

```


- UserView.java

```java
/*
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS HEADER.
 * Copyright (c) 2012-2018. houbinbini Inc.
 * design-pattern All rights reserved.
 */

package com.ryo.design.pattern.note.mvc;

/**
 * <p> </p>
 *
 * <pre> Created: 2018/5/26 下午8:44  </pre>
 * <pre> Project: design-pattern  </pre>
 *
 * @author houbinbin
 * @version 1.0
 * @since JDK 1.7
 */
public class UserView {

    /**
     * 展现用户信息
     * @param user 用户
     */
    public void showInfo(final User user) {
        System.out.println(user);
    }

}

```


- UserController.java

```java
/*
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS HEADER.
 * Copyright (c) 2012-2018. houbinbini Inc.
 * design-pattern All rights reserved.
 */

package com.ryo.design.pattern.note.mvc;

/**
 * <p> </p>
 *
 * <pre> Created: 2018/5/26 下午8:44  </pre>
 * <pre> Project: design-pattern  </pre>
 *
 * @author houbinbin
 * @version 1.0
 * @since JDK 1.7
 */
public class UserController {

    /**
     * model
     */
    private User user;

    /**
     * view
     */
    private UserView userView;

    public UserController(User user, UserView userView) {
        this.user = user;
        this.userView = userView;
    }

    /**
     * 展示信息
     */
    public void show() {
        this.userView.showInfo(user);
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

package com.ryo.design.pattern.note.mvc;

/**
 * <p> </p>
 *
 * <pre> Created: 2018/5/26 下午8:52  </pre>
 * <pre> Project: design-pattern  </pre>
 *
 * @author houbinbin
 * @version 1.0
 * @since JDK 1.7
 */
public class Main {

    public static void main(String[] args) {
        User user = buildUser();
        UserView userView = new UserView();
        UserController userController = new UserController(user, userView);
        userController.show();
    }

    /**
     * 构建用户信息
     * @return 用户
     */
    private static User buildUser() {
        User user = new User();
        user.setName("ryo");
        user.setAge(10);
        return user;
    }

}

```

- 测试结果

```
User{name='ryo', age=10}
```

# 实现方式

# UML & Code

## UML

UML 图示如下

## Code

代码地址

> [MVC 模式](https://github.com/houbb/design-pattern/tree/master/design-pattern-note/src/main/java/com/ryo/design/pattern/note/mvc)

# 系列导航

> [系列导航](https://blog.csdn.net/ryo1060732496/article/details/80214740)

* any list
{:toc}