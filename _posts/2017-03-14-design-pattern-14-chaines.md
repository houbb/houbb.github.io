---
layout: post
title: Design Pattern 14-java 责任链模式(Chain of Responsibility Pattern)
date:  2017-03-14 19:52:28 +0800
categories: [Design Pattern]
tags: [design pattern, sf]
published: true
---

# 责任链模式

责任链模式（Chain of Responsibility Pattern）为请求创建了一个接收者对象的链。

这种模式给予请求的类型，对请求的发送者和接收者进行解耦。这种类型的设计模式属于行为型模式。

在这种模式中，通常每个接收者都包含对另一个接收者的引用。如果一个对象不能处理该请求，那么它会把相同的请求传给下一个接收者，依此类推。

# 实际案例

类信息概览：

| 类名 | 说明 |
|:----|:----|
| Main.java | 方法的总入口 |
| LoggerLevel.java | 日志级别 |
| AbstractLogger.java | 抽象 logger |
| Logger.java | logger 接口 |
| ErrorLogger.java | 错误日志 |
| WarnLogger.java | 警告日志 |
| InfoLogger.java | 信息日志 |

## 定义


- LoggerLevel.java

```java
package com.ryo.design.pattern.note.chainOfResponsibility;

/**
 * @author houbinbin
 * @version 1.0
 * @on 2017/8/12
 * @since 1.7
 */
public class LoggerLevel {

    /**
     * 信息
     */
    public static final int INFO = 1;

    /**
     * 警告
     */
    public static final int WARN = 2;

    /**
     * 错误
     */
    public static final int ERROR = 3;


}

```


- AbstractLogger.java

```java
package com.ryo.design.pattern.note.chainOfResponsibility;

/**
 * @author houbinbin
 * @version 1.0
 * @on 2017/8/12
 * @since 1.7
 */
public abstract class AbstractLogger implements Logger {


    /**
     * 下一个日志打印器
     */
    private AbstractLogger nextLogger;

    /**
     * Logger 本身的日志级别
     */
    protected int level;

    public AbstractLogger(int level) {
        this.level = level;
    }

    @Override
    public void logger(int level, String msg) {
        if(this.level <= level) {
            write(msg);
        }

        if(nextLogger != null) {
            nextLogger.logger(level, msg);
        }
    }


    public AbstractLogger getNextLogger() {
        return nextLogger;
    }

    public AbstractLogger setNextLogger(AbstractLogger nextLogger) {
        this.nextLogger = nextLogger;
        return this;
    }

    protected abstract void write(String message);

}

```


- Logger.java

```java
package com.ryo.design.pattern.note.chainOfResponsibility;

/**
 * @author houbinbin
 * @version 1.0
 * @on 2017/8/12
 * @since 1.7
 */
public interface Logger {

    /**
     * 打印信息
     * @param level 消息级别
     * @param msg 消息内容
     * @see LoggerLevel 消息级别
     */
    void logger(int level, String msg);

}

```


- ErrorLogger.java

```java
package com.ryo.design.pattern.note.chainOfResponsibility;

/**
 * @author houbinbin
 * @version 1.0
 * @on 2017/8/12
 * @since 1.7
 */
public class ErrorLogger extends AbstractLogger {


    public ErrorLogger() {
        super(LoggerLevel.ERROR);
    }

    @Override
    protected void write(String message) {
        System.out.println("[Error] Log: "+message);
    }

}

```


- WarnLogger.java

```java
package com.ryo.design.pattern.note.chainOfResponsibility;

/**
 * @author houbinbin
 * @version 1.0
 * @on 2017/8/12
 * @since 1.7
 */
public class WarnLogger extends AbstractLogger {


    public WarnLogger() {
        super(LoggerLevel.WARN);
    }

    @Override
    protected void write(String message) {
        System.out.println("[Warn] Log: "+message);
    }
}

```


- InfoLogger.java

```java
package com.ryo.design.pattern.note.chainOfResponsibility;

/**
 * @author houbinbin
 * @version 1.0
 * @on 2017/8/12
 * @since 1.7
 */
public class InfoLogger extends AbstractLogger {


    public InfoLogger() {
        super(LoggerLevel.INFO);
    }

    @Override
    protected void write(String message) {
        System.out.println("[Info] Log: "+message);
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

package com.ryo.design.pattern.note.chainOfResponsibility;

/**
 * <p> </p>
 *
 * <pre> Created: 2018/5/20 下午7:15  </pre>
 * <pre> Project: design-pattern  </pre>
 *
 * @author houbinbin
 * @version 1.0
 * @since JDK 1.7
 */
public class Main {

    public static void main(String[] args) {
        AbstractLogger errorLogger = new ErrorLogger();
        AbstractLogger warnLogger = new WarnLogger();
        AbstractLogger infoLogger = new InfoLogger();
        errorLogger.setNextLogger(warnLogger.setNextLogger(infoLogger));
        errorLogger.logger(LoggerLevel.WARN, "warn info test");
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

> [责任链模式](https://github.com/houbb/design-pattern/tree/master/design-pattern-note/src/main/java/com/ryo/design/pattern/note/chainOfResponsibility)

# 系列导航

> [系列导航](https://blog.csdn.net/ryo1060732496/article/details/80214740)

* any list
{:toc}