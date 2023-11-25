---
layout: post
title: logstash 日志加工处理-08-表达式执行引擎 AviatorScript+SpEL  如何把字符串变为小写
date: 2023-10-30 21:01:55 +0800
categories: [Log]
tags: [log, sh]
published: true
---


# Q: 表达式引擎把字符串转换为小写的一个例子？

## A1: springex

在Java中，你可以使用一些库来实现表达式引擎，比如Apache Commons JEXL、Spring的Expression Language（SpEL）或者使用JavaScript引擎（例如Rhino或Nashorn）。在这里，我将使用Spring的Expression Language（SpEL）作为例子。

首先，确保你的项目中包含了Spring相关的依赖。然后，你可以使用`StandardEvaluationContext`类来设置输入变量，并通过`ExpressionParser`和`Expression`来进行表达式的解析和计算。

以下是一个简单的例子，演示如何将输入的字符串转为小写：

```java
import org.springframework.expression.Expression;
import org.springframework.expression.ExpressionParser;
import org.springframework.expression.spel.standard.SpelExpressionParser;
import org.springframework.expression.spel.support.StandardEvaluationContext;

public class ExpressionEngineExample {
    public static void main(String[] args) {
        // 创建表达式解析器
        ExpressionParser parser = new SpelExpressionParser();

        // 创建表达式
        Expression expression = parser.parseExpression("#inputString.toLowerCase()");

        // 创建EvaluationContext，并设置变量
        StandardEvaluationContext context = new StandardEvaluationContext();
        context.setVariable("inputString", "Hello World");

        // 计算表达式
        String result = expression.getValue(context, String.class);

        // 输出结果
        System.out.println("Original String: Hello World");
        System.out.println("Result after conversion to lowercase: " + result);
    }
}
```

在这个例子中，我们使用了SpEL表达式 `#inputString.toLowerCase()` 来将输入字符串转为小写。

在`StandardEvaluationContext`中，我们设置了变量 `inputString` 的值为 "Hello World"，然后通过 `expression.getValue()` 方法计算表达式的值。

请注意，为了运行这个例子，你需要在项目中包含Spring相关的库。如果你使用Maven，可以在 `pom.xml` 文件中添加以下依赖：

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter</artifactId>
</dependency>
```

确保你的项目中包含了这个依赖，然后你就可以运行这个例子了。

## A2-Aviator 的例子呢？

Aviator 是一个轻量级的、快速的Java表达式求值引擎，可以用于在运行时动态计算表达式的值。以下是一个简单的例子，演示如何使用 Aviator 将字符串转为小写：

首先，确保你的项目中包含了 Aviator 的依赖。

如果使用 Maven，可以在 `pom.xml` 文件中添加以下依赖：

```xml
<dependency>
    <groupId>com.googlecode.aviator</groupId>
    <artifactId>aviator</artifactId>
    <version>5.4.1</version> <!-- 查看最新的版本号 -->
</dependency>
```

然后，你可以使用 Aviator 执行表达式。以下是一个例子：

```java
Map<String, Object> context = new HashMap<String, Object>();
context.put("text", "I Love Express");
Object value = ExpressionHelper.execute("string.toLowerCase(text)", context);
```

### 问题

实际上这个例子会报错。

```
com.googlecode.aviator.exception.FunctionNotFoundException: Function not found: string.toLowerCase
```

因为没有内置大小写的方法。

我们后面会解决这个问题。

# avatar 如何真正的实现 string.toLowerCase？

## 思路

avatar 非常灵活的一点在于支持我们自定义。

## 自定义

```java
public class StringToLowerCaseFunction extends AbstractFunction {

    @Override
    public String getName() {
        return "string.toLowerCase";
    }

    public AviatorObject call(Map<String, Object> env, AviatorObject arg1) {
        String value = FunctionUtils.getStringValue(arg1, env);
        return new AviatorString(value.toLowerCase());
    }

}
```

## 注册

```java
// 注册 string.toLowerCase() 函数
AviatorEvaluator.addFunction(new StringToLowerCaseFunction());
```

## 测试

```java
Map<String, Object> context = new HashMap<String, Object>();
context.put("text", "I Love Express");
Object value = ExpressionHelper.execute("string.toLowerCase(text)", context);
Assert.assertEquals("i love express", value.toString());
```

# 参考资料

chat

[Java表达式引擎选型调研分析 | 京东云技术团队](https://zhuanlan.kanxue.com/article-24953.htm)

[表达式引擎工具](https://www.oschina.net/project/awesome?columnId=29)

[Aviator——轻量级Java表达式求值引擎](https://developer.aliyun.com/article/608829)

* any list
{:toc}