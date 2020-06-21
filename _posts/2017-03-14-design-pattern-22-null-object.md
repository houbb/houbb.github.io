---
layout: post
title: Design Pattern 22-java 空对象模式（Null Object Pattern）
date:  2017-03-14 19:52:28 +0800
categories: [Design Pattern]
tags: [design pattern, sf]
published: true
---

# 空对象模式

在空对象模式（Null Object Pattern）中，一个空对象取代 NULL 对象实例的检查。Null 对象不是检查空值，而是反应一个不做任何动作的关系。

这样的 Null 对象也可以在数据不可用的时候提供默认的行为。

在空对象模式中，我们创建一个指定各种要执行的操作的抽象类和扩展该类的实体类，还创建一个未对该类做任何实现的空对象类，该空对象类将无缝地使用在需要检查空值的地方。

# 实际案例

类信息概览：

| 类名 | 说明 |
|:----|:----|
| Main.java | 方法的总入口 |
| RealConsumer.java | 真实顾客 |
| ConsumerFactory.java | 顾客工厂 |
| NullConsumer.java | 空顾客 |
| AbstractConsumer.java | 抽象顾客 |

## 定义


- RealConsumer.java

```java
package com.ryo.design.pattern.note.nullObject;

/**
 * Created by bbhou on 2017/8/17.
 */
public class RealConsumer extends AbstractConsumer {

    public RealConsumer(String name) {
        this.name = name;
    }

    @Override
    public boolean isNull() {
        return false;
    }

    @Override
    public String getName() {
        return this.name;
    }
}

```


- ConsumerFactory.java

```java
package com.ryo.design.pattern.note.nullObject;

import java.util.Arrays;
import java.util.List;

/**
 * Created by bbhou on 2017/8/17.
 */
public class ConsumerFactory {

    private static List<String> nameList = Arrays.asList("hello", "world", "ryo");

    public static AbstractConsumer getConsumer(String name) {
        if(nameList.contains(name)) {
            return new RealConsumer(name);
        }
        return new NullConsumer();
    }

}

```


- NullConsumer.java

```java
package com.ryo.design.pattern.note.nullObject;

/**
 * Created by bbhou on 2017/8/17.
 */
public class NullConsumer extends AbstractConsumer {

    @Override
    public boolean isNull() {
        return true;
    }

    @Override
    public String getName() {
        return "Not an available name!";
    }
}

```


- AbstractConsumer.java

```java
package com.ryo.design.pattern.note.nullObject;

/**
 * Created by bbhou on 2017/8/17.
 */
public abstract class AbstractConsumer {

    /**
     * 用户名称
     */
    protected String name;

    /**
     * 是否为空
     * @return
     */
    public abstract boolean isNull();

    /**
     * 获取名称
     * @return
     */
    public abstract String getName();

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

package com.ryo.design.pattern.note.nullObject;

/**
 * <p> </p>
 *
 * <pre> Created: 2018/5/24 下午10:02  </pre>
 * <pre> Project: design-pattern  </pre>
 *
 * @author houbinbin
 * @version 1.0
 * @since JDK 1.7
 */
public class Main {

    public static void main(String[] args) {
        AbstractConsumer customer1 = ConsumerFactory.getConsumer("hello");
        AbstractConsumer customer2 = ConsumerFactory.getConsumer("world");
        AbstractConsumer customer3 = ConsumerFactory.getConsumer("ryo");
        AbstractConsumer customer4 = ConsumerFactory.getConsumer("Laura");

        System.out.println("Customers");
        System.out.println(customer1.getName());
        System.out.println(customer2.getName());
        System.out.println(customer3.getName());
        System.out.println(customer4.getName());
    }

}

```

- 测试结果

```
Customers
hello
world
ryo
Not an available name!
```

# 实现方式

# UML & Code

## UML

UML 图示如下

## Code

代码地址

> [空对象模式](https://github.com/houbb/design-pattern/tree/master/design-pattern-note/src/main/java/com/ryo/design/pattern/note/nullObject)

# 系列导航

> [系列导航](https://blog.csdn.net/ryo1060732496/article/details/80214740)

* any list
{:toc}