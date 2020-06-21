---
layout: post
title: Design Pattern 16-java 解释器模式(Interpreter Pattern)
date:  2017-03-14 19:52:28 +0800
categories: [Design Pattern]
tags: [design pattern, sf]
published: true
---

# 解释器模式

解释器模式（Interpreter Pattern）提供了评估语言的语法或表达式的方式，它属于行为型模式。

这种模式实现了一个表达式接口，该接口解释一个特定的上下文。这种模式被用在 SQL 解析、符号处理引擎等。

# 实际案例

类信息概览：

| 类名 | 说明 |
|:----|:----|
| Main.java | 方法的总入口 |
| TerminalExpression.java | 解释器 |
| Expression.java | 表达式 |
| OrExpression.java | or 表达式 |
| AndExpression.java | and 表达式 |

## 定义


- TerminalExpression.java

```java
package com.ryo.design.pattern.note.interpreter;

/**
 * @author houbinbin
 * @version 1.0
 * @on 2017/8/14
 * @since 1.7
 */
public class TerminalExpression implements Expression {

    private String content;

    public TerminalExpression(String content) {
        this.content = content;
    }

    @Override
    public boolean interpret(String content) {
        return this.content.contains(content);
    }
}

```


- Expression.java

```java
package com.ryo.design.pattern.note.interpreter;

/**
 * @author houbinbin
 * @version 1.0
 * @on 2017/8/14
 * @since 1.7
 */
public interface Expression {

    /**
     * 解释
     * @param content 内容
     * @return
     */
    boolean interpret(String content);

}

```


- OrExpression.java

```java
package com.ryo.design.pattern.note.interpreter;

/**
 * @author houbinbin
 * @version 1.0
 * @on 2017/8/14
 * @since 1.7
 */
public class OrExpression implements Expression {
    private Expression expressionOne;
    private Expression expressionTwo;

    public OrExpression(Expression expressionOne, Expression expressionTwo) {
        this.expressionOne = expressionOne;
        this.expressionTwo = expressionTwo;
    }

    @Override
    public boolean interpret(String content) {
        return expressionOne.interpret(content) || expressionTwo.interpret(content);
    }
}

```


- AndExpression.java

```java
package com.ryo.design.pattern.note.interpreter;

/**
 * @author houbinbin
 * @version 1.0
 * @on 2017/8/14
 * @since 1.7
 */
public class AndExpression implements Expression {
    private Expression expressionOne;
    private Expression expressionTwo;

    public AndExpression(Expression expressionOne, Expression expressionTwo) {
        this.expressionOne = expressionOne;
        this.expressionTwo = expressionTwo;
    }

    @Override
    public boolean interpret(String content) {
        return expressionOne.interpret(content) && expressionTwo.interpret(content);
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

package com.ryo.design.pattern.note.interpreter;

/**
 * <p> </p>
 *
 * <pre> Created: 2018/5/21 下午7:29  </pre>
 * <pre> Project: design-pattern  </pre>
 *
 * @author houbinbin
 * @version 1.0
 * @since JDK 1.7
 */
public class Main {

    public static void main(String[] args) {
        Expression expressionOne = new TerminalExpression("Hello World");
        Expression expressionTwo = new TerminalExpression("Hello Mongo");

        Expression andExpression = new AndExpression(expressionOne, expressionTwo);
        boolean one = andExpression.interpret("Hello");
        Expression andExpression1 = new AndExpression(expressionOne, expressionTwo);
        boolean two = andExpression1.interpret("World");
        Expression orExpression = new OrExpression(expressionOne, expressionTwo);
        boolean three = orExpression.interpret("World");

        System.out.println(one);
        System.out.println(two);
        System.out.println(three);
    }

}

```

- 测试结果

```
true
false
true
```

# 实现方式

# UML & Code

## UML

UML 图示如下

## Code

代码地址

> [解释器模式](https://github.com/houbb/design-pattern/tree/master/design-pattern-note/src/main/java/com/ryo/design/pattern/note/interpreter)

# 系列导航

> [系列导航](https://blog.csdn.net/ryo1060732496/article/details/80214740)

* any list
{:toc}