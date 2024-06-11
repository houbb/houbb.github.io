---
layout: post
title:  java 表达式引擎概览-01-overview
date:  2020-5-26 15:11:16 +0800
categories: [Engine]
tags: [engine, expression-engine]
published: true
---

# 背景

希望实现一些类似于 mybatis 的动态 sql，针对语句的判断，比如：

```
test = "name != null and name != ''"
```

这里就需要一个表达式的引擎，从零实现目前比较耗费时间，就去看看有没有现成的。

# mvel

比较老牌了，很强大，但是好久没更新了

参考地址：

http://mvel.documentnode.com/

https://github.com/mvel/mvel


# ScriptEngine 引擎

可以使用java 自带的ScriptEngine,基于此我们可以使用多种语言的实现，但是8之后就被移除了。。。

# graalvm

多语言引擎，可以集成ruby，js，python，groovy，kotlin。。。。，总之很强大

# JEXL

表达式语言，标准，灵活

http://commons.apache.org/proper/commons-jexl/

## 参考例子

```java
import org.apache.commons.jexl.Expression;
import org.apache.commons.jexl.ExpressionFactory;
import org.apache.commons.jexl.JexlContext;
import org.apache.commons.jexl.JexlHelper;
​
Opera opera = new Opera( );
opera.setName("The Magic Flute");
opera.setComposer("Mozart");
opera.setYear(1791);
​
String expr = 
    "${opera.name} was composed by ${opera.composer} in " +
    "${opera.year}.";
​
Expression e = ExpressionFactory.createExpression(expr);
               JexlContext jc = JexlHelper.createContext();
               jc.getVars().put("opera", opera);
               String message = (String) e.evaluate(jc);
​
System.out.println( message );
```

# spring 表达式语言

参考使用

```java
public class Data {
    private String name; // getter and setter omitted
}
​
Data data = new Data();
data.setName("John Doe");
​
ExpressionParser p = new SpelExpressionParser();
Expression e = p.parseExpression("name == 'John Doe'");
Boolean r = (Boolean) e.getValue(data); // will return true
​
e = p.parseExpression("Hello " + name + ", how are you ?");
String text = e.getValue(data, String.class); //
```


# jsr 标准规范

参考地址

https://jcp.org/en/jsr/detail?id=341

# beanshell

比较强大，而且一直在更新 

参考地址 

https://github.com/beanshell/beanshell

# ikexpression

一款简洁够用，小巧的表达式包，文档网上有，但是代码，目前少维护了

# 一些其他类似的模版引擎

模版引擎，实际上也可以作为表达式引擎来使用，而且比较多，Velocity，FreeMarker，stringtemplate4


# 参考资料

[几款不错的java表达式引擎](https://www.cnblogs.com/rongfengliang/p/11863669.html)

* any list
{:toc}