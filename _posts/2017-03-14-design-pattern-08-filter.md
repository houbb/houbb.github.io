---
layout: post
title: Design Pattern 08-java 过滤器模式(Filter Pattern)
date:  2017-03-14 19:52:28 +0800
categories: [Design Pattern]
tags: [design pattern, sf]
published: true
---

# 过滤器模式

过滤器模式（Filter Pattern）或标准模式（Criteria Pattern）是一种设计模式，这种模式允许开发人员使用不同的标准来过滤一组对象，通过逻辑运算以解耦的方式把它们连接起来。

这种类型的设计模式属于结构型模式，它结合多个标准来获得单一标准。

# 实际案例

类信息概览：

| 类名 | 说明 |
|:----|:----|
| Main.java | 方法的总入口 |
| Person.java | 人 |
| PersonSexFilter.java | 性别过滤器 |
| PersonFilter.java | 过滤器接口 |
| PersonAgeFilter.java | 年龄过滤器 |

## 定义

- Person.java

```java
package com.ryo.design.pattern.note.filter;

import lombok.Builder;
import lombok.Data;

/**
 * 人
 * @author bbhou
 * @date 2017/8/11
 */
@Data
@Builder
public class Person {

    /**
     * 性别
     */
    private String sex;

    /**
     * 年龄
     */
    private int age;

}

```


- PersonSexFilter.java

```java
package com.ryo.design.pattern.note.filter;

import java.util.LinkedList;
import java.util.List;

/**
 * 人类性别过滤器
 * @author bbhou
 * @date 2017/8/11
 */
public class PersonSexFilter implements PersonFilter {

    /**
     * 这种写法非常之麻烦。
     * 1. 使用 guva 或者 linq 要简洁 许多
     * @param personList 等待过滤的列表
     * @return
     */
    @Override
    public List<Person> filter(List<Person> personList) {
        List<Person> boyList = new LinkedList<>();

        for(Person person : personList) {
            if("boy".equals(person.getSex())) {
                boyList.add(person);
            }
        }

        return boyList;
    }
}

```


- PersonFilter.java

```java
package com.ryo.design.pattern.note.filter;

import java.util.List;

/**
 * 人类过滤器
 * @author bbhou
 * @date 2017/8/11
 */
public interface PersonFilter {

    /**
     * 对列表进行过滤
     * @param personList 等待过滤的列表
     * @return 已经过滤的列表结果
     */
    List<Person> filter(List<Person> personList);

}

```


- PersonAgeFilter.java

```java
package com.ryo.design.pattern.note.filter;

import java.util.LinkedList;
import java.util.List;

/**
 * 人年龄过滤器
 * @author bbhou
 * @date 2017/8/11
 */
public class PersonAgeFilter implements PersonFilter {
    @Override
    public List<Person> filter(List<Person> personList) {
        List<Person> youngList = new LinkedList<>();

        for(Person person : personList) {
            int age = person.getAge();
            if(age > 0 && age <= 20) {
                youngList.add(person);
            }
        }
        return youngList;
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

package com.ryo.design.pattern.note.filter;

import java.util.Arrays;
import java.util.List;

/**
 * <p> </p>
 *
 * <pre> Created: 2018/5/14 下午7:53  </pre>
 * <pre> Project: design-pattern  </pre>
 *
 * @author houbinbin
 * @version 1.0
 * @since JDK 1.7
 */
public class Main {

    public static void main(String[] args) {
        Person one = Person.builder().age(20).sex("boy").build();
        Person two = Person.builder().age(20).sex("girl").build();
        Person three = Person.builder().age(25).sex("boy").build();
        List<Person> personList = Arrays.asList(one, two, three);
        List<Person> sexFilterResult = new PersonSexFilter().filter(personList);
        System.out.println(sexFilterResult);
        List<Person> ageFilterResult = new PersonAgeFilter().filter(personList);
        System.out.println(ageFilterResult);
    }

}

```

- 测试结果

```
[Person(sex=boy, age=20), Person(sex=boy, age=25)]
[Person(sex=boy, age=20), Person(sex=girl, age=20)]
```

# 实现方式

# UML & Code

## UML

UML 图示如下

## Code

代码地址

> [过滤器模式](https://github.com/houbb/design-pattern/tree/master/design-pattern-note/src/main/java/com/ryo/design/pattern/note/Filter)

# 系列导航

> [系列导航](https://blog.csdn.net/ryo1060732496/article/details/80214740)

* any list
{:toc}