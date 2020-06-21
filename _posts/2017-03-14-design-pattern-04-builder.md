---
layout: post
title: Design Pattern 04-builder 构建者模式
date:  2017-03-14 19:52:28 +0800
categories: [Design Pattern]
tags: [design pattern, sf]
published: true
---

# 建造者模式

建造者模式（Builder Pattern）使用多个简单的对象一步一步构建成一个复杂的对象。
这种类型的设计模式属于创建型模式，它提供了一种创建对象的最佳方式。

比如：StringBuilder

# 实际案例

类信息概览：

| 类名 | 说明 |
|:----|:----|
| Main.java | 方法的总入口 |
| PersonGirlBuilder.java | |
| PersonBoyBuilder.java | |
| Person.java | |
| PersonBuilder.java | |
| PersonDirector.java | |

## 定义


- PersonGirlBuilder.java

```java
package com.ryo.design.pattern.note.builder;

/**
 * Created by bbhou on 2017/8/9.
 */
public class PersonGirlBuilder implements PersonBuilder {
    @Override
    public String buildName() {
        return "rose";
    }

    @Override
    public int buildAge() {
        return 19;
    }

    @Override
    public String buildSex() {
        return "girl";
    }
}

```


- PersonBoyBuilder.java

```java
package com.ryo.design.pattern.note.builder;

/**
 * Created by bbhou on 2017/8/9.
 */
public class PersonBoyBuilder implements PersonBuilder {
    @Override
    public String buildName() {
        return "jack";
    }

    @Override
    public int buildAge() {
        return 20;
    }

    @Override
    public String buildSex() {
        return "boy";
    }
}

```


- Person.java

```java
package com.ryo.design.pattern.note.builder;

import lombok.Data;

/**
 * Created by bbhou on 2017/8/9.
 */
@Data
public class Person {

    /**
     * 名称
     */
    private String name;

    /**
     * 年龄
     */
    private int age;

    /**
     * 性别
     */
    private String sex;

}

```


- PersonBuilder.java

```java
package com.ryo.design.pattern.note.builder;

/**
 * Created by bbhou on 2017/8/9.
 */
public interface PersonBuilder {

    /**
     * 构建名称
     * @return
     */
    String buildName();

    /**
     * 构建年龄
     * @return
     */
    int buildAge();

    /**
     * 构建性别
     * @return
     */
    String buildSex();

}

```


- PersonDirector.java

```java
package com.ryo.design.pattern.note.builder;


/**
 * Created by bbhou on 2017/8/9.
 */
public class PersonDirector {

    private PersonBuilder personBuilder;

    public PersonDirector(PersonBuilder personBuilder) {
        this.personBuilder = personBuilder;
    }

    /**
     * 创建一个人
     * @return
     */
    Person createPerson() {
        Person person = new Person();
        person.setAge(personBuilder.buildAge());
        person.setName(personBuilder.buildName());
        person.setSex(personBuilder.buildSex());
        return person;
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

package com.ryo.design.pattern.note.builder;

/**
 * <p> </p>
 *
 * <pre> Created: 2018/5/9 下午7:45  </pre>
 * <pre> Project: design-pattern  </pre>
 *
 * @author houbinbin
 * @version 1.0
 * @since JDK 1.7
 */
public class Main {

    public static void main(String[] args) {
        PersonDirector personDirector = new PersonDirector(new PersonBoyBuilder());
        Person person = personDirector.createPerson();
        System.out.println(person);
    }

}

```

- 测试结果

```
Person(name=jack, age=20, sex=boy)
```

# 实现方式

# UML & Code

## UML

UML 图示如下

## Code

代码地址

> [建造者模式](https://github.com/houbb/design-pattern/tree/master/design-pattern-note/src/main/java/com/ryo/design/pattern/note/builder)

# 系列导航

> [系列导航](https://blog.csdn.net/ryo1060732496/article/details/80214740)

* any list
{:toc}