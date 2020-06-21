---
layout: post
title: Design Pattern 23-java 策略模式（Strategy Pattern）
date:  2017-03-14 19:52:28 +0800
categories: [Design Pattern]
tags: [design pattern, sf]
published: true
---

# 策略模式

在策略模式（Strategy Pattern）中，一个类的行为或其算法可以在运行时更改。这种类型的设计模式属于行为型模式。

在策略模式中，我们创建表示各种策略的对象和一个行为随着策略对象改变而改变的 context 对象。策略对象改变 context 对象的执行算法。

# 实际案例

类信息概览：

| 类名 | 说明 |
|:----|:----|
| Main.java | 方法的总入口 |
| Strategy.java | 策略 |
| SubStrategy.java | 减法策略 |
| Context.java | 上下文 |
| AddStrategy.java | 加法策略 |

## 定义


- Strategy.java

```java
package com.ryo.design.pattern.note.strategy;

/**
 * 策略
 * @author bbhou
 * @date 2017/8/18
 */
public interface Strategy {

    /**
     * 数据操作
     * @param numOne 数据一
     * @param numTwo 数据二
     * @return 结果
     */
    int operation(int numOne, int numTwo);

}

```


- SubStrategy.java

```java
package com.ryo.design.pattern.note.strategy;

/**
 * 数据之间的和
 *
 * @author bbhou
 * @date 2017/8/18
 */
public class SubStrategy implements Strategy {

    @Override
    public int operation(int numOne, int numTwo) {
        return numOne - numTwo;
    }

}

```


- Context.java

```java
/*
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS HEADER.
 * Copyright (c) 2012-2018. houbinbini Inc.
 * design-pattern All rights reserved.
 */

package com.ryo.design.pattern.note.strategy;

/**
 * <p> </p>
 *
 * <pre> Created: 2018/5/25 下午9:12  </pre>
 * <pre> Project: design-pattern  </pre>
 *
 * @author houbinbin
 * @version 1.0
 * @since JDK 1.7
 */
public class Context {

    private Strategy strategy;

    public Context(Strategy strategy){
        this.strategy = strategy;
    }

    public int executeStrategy(int num1, int num2){
        return strategy.operation(num1, num2);
    }

}

```


- AddStrategy.java

```java
package com.ryo.design.pattern.note.strategy;

/**
 * 数据之间的和
 *
 * @author bbhou
 * @date 2017/8/18
 */
public class AddStrategy implements Strategy {

    @Override
    public int operation(int numOne, int numTwo) {
        int result = numOne + numTwo;
        return result;
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

package com.ryo.design.pattern.note.strategy;

/**
 * <p> </p>
 *
 * <pre> Created: 2018/5/25 下午9:11  </pre>
 * <pre> Project: design-pattern  </pre>
 *
 * @author houbinbin
 * @version 1.0
 * @since JDK 1.7
 */
public class Main {

    public static void main(String[] args) {
        Context context = new Context(new AddStrategy());
        int addResult = context.executeStrategy(10, 5);
        System.out.println(addResult);

        context = new Context(new SubStrategy());
        int subResult = context.executeStrategy(10, 5);
        System.out.println(subResult);
    }

}

```

- 测试结果

```
```

# 实现方式

# UML & Code

## UML

UML 图示如下

## Code

代码地址

> [策略模式](https://github.com/houbb/design-pattern/tree/master/design-pattern-note/src/main/java/com/ryo/design/pattern/note/strategy)

# 系列导航

> [系列导航](https://blog.csdn.net/ryo1060732496/article/details/80214740)

* any list
{:toc}