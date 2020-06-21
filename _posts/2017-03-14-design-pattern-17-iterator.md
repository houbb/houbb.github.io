---
layout: post
title: Design Pattern 17-java 迭代器模式（Iterator Pattern）
date:  2017-03-14 19:52:28 +0800
categories: [Design Pattern]
tags: [design pattern, sf]
published: true
---

# 迭代器模式

迭代器模式（Iterator Pattern）是 Java 和 .Net 编程环境中非常常用的设计模式。

这种模式用于顺序访问集合对象的元素，不需要知道集合对象的底层表示。

迭代器模式属于行为型模式。

# 实际案例

类信息概览：

| 类名 | 说明 |
|:----|:----|
| Main.java | 方法的总入口 |
| Container.java | 容器 |
| Iterator.java | 迭代器接口 |
| NameRepository.java | 名称仓库 |

## 定义


- Container.java

```java
package com.ryo.design.pattern.note.iterator;

/**
 * @author houbinbin
 * @version 1.0
 * @on 2017/8/15
 * @since 1.7
 */
public interface Container {

    Iterator getIterator();

}

```


- Iterator.java

```java
package com.ryo.design.pattern.note.iterator;

/**
 * @author houbinbin
 * @version 1.0
 * @on 2017/8/15
 * @since 1.7
 */
public interface Iterator {

    Object next();

    boolean hasNext();

}

```


- NameRepository.java

```java
package com.ryo.design.pattern.note.iterator;

/**
 * @author houbinbin
 * @version 1.0
 * @on 2017/8/15
 * @since 1.7
 */
public class NameRepository implements Container {

    /**
     * 人名数组
     */
    private String names[] = {"Robert" , "John" ,"Julie" , "Lora"};

    @Override
    public Iterator getIterator() {
        return new NameIterator();
    }

    public class NameIterator implements Iterator {

        int index = 0;

        @Override
        public Object next() {
            if(this.hasNext()) {
                return names[index++];
            }

            return null;
        }

        @Override
        public boolean hasNext() {
            return index < names.length;
        }
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

package com.ryo.design.pattern.note.iterator;

/**
 * <p> </p>
 *
 * <pre> Created: 2018/5/22 下午8:03  </pre>
 * <pre> Project: design-pattern  </pre>
 *
 * @author houbinbin
 * @version 1.0
 * @since JDK 1.7
 */
public class Main {

    public static void main(String[] args) {
        NameRepository repository = new NameRepository();
        Iterator iterator = repository.getIterator();
        while(iterator.hasNext()) {
            Object object = iterator.next();
            System.out.println(object);
        }
    }

}

```

- 测试结果

```
Robert
John
Julie
Lora
```

# 实现方式

# UML & Code

## UML

UML 图示如下

## Code

代码地址

> [迭代器模式](https://github.com/houbb/design-pattern/tree/master/design-pattern-note/src/main/java/com/ryo/design/pattern/note/iterator)

# 系列导航

> [系列导航](https://blog.csdn.net/ryo1060732496/article/details/80214740)

* any list
{:toc}