---
layout: post
title: Design Pattern 29-java 数据访问对象模式（Data Access Object Pattern）
date:  2017-03-14 19:52:28 +0800
categories: [Design Pattern]
tags: [design pattern, sf]
published: true
---

# 数据访问对象模式

数据访问对象模式

# 实际案例

类信息概览：

| 类名 | 说明 |
|:----|:----|
| Main.java | 方法的总入口 |
| UserDao.java | 用户 dao 接口 |
| User.java | 用户 |
| UserDaoImpl.java | 用户 dao 实现 |

## 定义


- UserDao.java

```java
/*
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS HEADER.
 * Copyright (c) 2012-2018. houbinbini Inc.
 * design-pattern All rights reserved.
 */

package com.ryo.design.pattern.note.dao;

import java.util.List;

/**
 * <p> </p>
 *
 * <pre> Created: 2018/5/28 下午6:55  </pre>
 * <pre> Project: design-pattern  </pre>
 *
 * @author houbinbin
 * @version 1.0
 * @since JDK 1.7
 */
public interface UserDao {

    /**
     * 查询所有的用户信息
     * @return 用户列表
     */
    List<User> queryUsers();

}

```


- User.java

```java
/*
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS HEADER.
 * Copyright (c) 2012-2018. houbinbini Inc.
 * design-pattern All rights reserved.
 */

package com.ryo.design.pattern.note.dao;

import lombok.Builder;
import lombok.Data;

/**
 * <p> </p>
 *
 * <pre> Created: 2018/5/28 下午6:55  </pre>
 * <pre> Project: design-pattern  </pre>
 *
 * @author houbinbin
 * @version 1.0
 * @since JDK 1.7
 */
@Data
@Builder
public class User {

    private String name;

    private int age;

}

```


- UserDaoImpl.java

```java
/*
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS HEADER.
 * Copyright (c) 2012-2018. houbinbini Inc.
 * design-pattern All rights reserved.
 */

package com.ryo.design.pattern.note.dao;

import java.util.Arrays;
import java.util.List;

/**
 * <p> </p>
 *
 * <pre> Created: 2018/5/28 下午6:55  </pre>
 * <pre> Project: design-pattern  </pre>
 *
 * @author houbinbin
 * @version 1.0
 * @since JDK 1.7
 */
public class UserDaoImpl implements UserDao {

    @Override
    public List<User> queryUsers() {
        User user = User.builder().age(10).name("hello").build();
        User user2 = User.builder().age(12).name("hello2").build();
        return Arrays.asList(user, user2);
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

package com.ryo.design.pattern.note.dao;

import java.util.List;

/**
 * <p> </p>
 *
 * <pre> Created: 2018/5/28 下午6:57  </pre>
 * <pre> Project: design-pattern  </pre>
 *
 * @author houbinbin
 * @version 1.0
 * @since JDK 1.7
 */
public class Main {

    public static void main(String[] args) {
        UserDao userDao = new UserDaoImpl();
        List<User> userList = userDao.queryUsers();
        System.out.println(userList);
    }

}

```

- 测试结果

```
[User(name=hello, age=10), User(name=hello2, age=12)]
```

# 实现方式

# UML & Code

## UML

UML 图示如下

## Code

代码地址

> [数据访问对象模式](https://github.com/houbb/design-pattern/tree/master/design-pattern-note/src/main/java/com/ryo/design/pattern/note/dao)

# 系列导航

> [系列导航](https://blog.csdn.net/ryo1060732496/article/details/80214740)

* any list
{:toc}