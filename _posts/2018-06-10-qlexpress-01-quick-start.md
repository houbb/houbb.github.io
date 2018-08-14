---
layout: post
title:  QLExpress-01-Quick Start
date:  2018-06-10 10:29:21 +0800
categories: [QLExpress]
tags: [qlexpress]
published: true
---


# QLExpress

[QLExpress](https://github.com/alibaba/QLExpress) is a powerful, lightweight, 
dynamic language for the Java platform aimed at improving developers’ productivity in different business scenes.

## 应用场景

- 对于不可知的场景，比如风控点编写。

如果全部使用代码编写，调整起来将变得十分麻烦。

- EAV 数据库模式，原始信息的处理

可以将 QLExpress 与 Eav 数据库模式结合起来，使得功能变得强大灵活。

## 编写此系列博客的目的

- 系统学习下 QLExpress，而不是局限于简单的使用。

- 官方 `README.md` 写的有些瑕疵

- 便于以后拓展+回顾

# 快速开始

## jar 的引入

```xml
<dependency>
    <groupId>com.alibaba</groupId>
    <artifactId>QLExpress</artifactId>
    <version>3.2.0</version>
</dependency>
```

## 入门案例


```java

import com.ql.util.express.DefaultContext;
import com.ql.util.express.ExpressRunner;

import org.junit.Assert;
import org.junit.Test;

public class HelloWorldTest {

    @Test
    public void helloTest() throws Exception {
        ExpressRunner runner = new ExpressRunner();
        DefaultContext<String, Object> context = new DefaultContext<>();
        context.put("a", 1);
        context.put("b", 2);
        String express = "a+b";
        Object r = runner.execute(express, context, null, true, false);
        Assert.assertEquals(3, r);
    }

}
```

# 拓展总结

## 整体架构

![2018-06-10-qlexpress-struct.jpeg](https://raw.githubusercontent.com/houbb/resource/master/img/java/qlexpress/2018-06-10-qlexpress-struct.jpeg)

## 调用方法入参

```java
/**
 * 执行一段文本
 * @param expressString 程序文本
 * @param context 执行上下文，可以扩展为包含ApplicationContext
 * @param errorList 输出的错误信息List
 * @param isCache 是否使用Cache中的指令集,建议为true
 * @param isTrace 是否输出详细的执行指令信息，建议为false
 * @param aLog 输出的log
 * @return
 * @throws Exception
 */
Object execute(String expressString, IExpressContext<String,Object> context,List<String> errorList, boolean isCache, boolean isTrace, Log aLog);
```

## isTrace

```
/**
 * 是否输出所有的跟踪信息，同时还需要log级别是DEBUG级别
 */
private boolean isTrace = false;
```

这个主要是是否输出脚本的编译解析过程，一般对于业务系统来说关闭之后会提高性能。

我们将上面的执行中 `isTrace` 属性设置为 true。日志结果如下:

```
DEBUG [main] - LoadAttr:a:1
DEBUG [main] - LoadAttr:b:2
DEBUG [main] - +(a:1,b:2)
```


* any list
{:toc}







