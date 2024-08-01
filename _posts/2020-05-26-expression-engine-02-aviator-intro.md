---
layout: post
title:  java 表达式引擎概览-02-google 表达式引擎 Aviator 入门介绍
date:  2020-5-26 15:11:16 +0800
categories: [Engine]
tags: [engine, expression-engine]
published: true
---

# Aviator

Aviator 是一个轻量级、高性能的 Java 表达式求值器。

它可以将表达式编译为字节码，并即时执行求值。

# 快速入门

> [aviator 代码地址](https://github.com/houbb/tech-validation/tree/master/aviator/src/main/java/com/github/houbb/tech/validation/aviator)

## Jar 依赖

```xml
<dependency>
    <groupId>com.googlecode.aviator</groupId>
    <artifactId>aviator</artifactId>
    <version>3.3.0</version>
</dependency>
```

## HelloAviator.java

```java
import com.googlecode.aviator.AviatorEvaluator;

import java.util.HashMap;
import java.util.Map;

public class HelloAviator {

    public static void main(String[] args) {
        int[] a = {1, 2, 3, 4, 5};
        Map<String, Object> env = new HashMap<>(1);
        env.put("a", a);

        AviatorEvaluator.execute("1 + 2 + 3");
        AviatorEvaluator.execute("a[1] + 100", env);
        AviatorEvaluator.execute("'a[1]=' + a[1]", env);
        //求数组长度
        AviatorEvaluator.execute("count(a)", env);
        //求数组总和
        AviatorEvaluator.execute("reduce(a, +, 0)", env);
        //检测数组每个元素都在 0 <= e < 10 之间。
        AviatorEvaluator.execute("seq.every(a, seq.and(seq.ge(0), seq.lt(10)))", env);
    }

}
```

# 用途

java 表达式引擎。可以用来动态解析 java 脚本。

# chat

## 详细介绍一下 表达式引擎 avatar

Avatar是一种轻量级的表达式引擎，用于在Java应用程序中解析和执行动态表达式。

它的设计目标是提供一种简单、快速、易于集成的表达式计算机制，适用于各种业务规则计算、数据处理和其他需要动态计算的场景。

### Avatar的主要特点

1. **轻量级**：Avatar的代码库小，依赖少，易于集成到现有的Java项目中。
2. **高性能**：通过高效的解析和执行机制，Avatar能够快速地计算表达式，适用于对性能要求较高的应用场景。
3. **易用性**：提供简洁易懂的API，使得开发者能够方便地定义和执行表达式。
4. **灵活性**：支持多种数据类型和操作符，能够处理复杂的表达式。

### Avatar的核心功能

1. **表达式解析**：能够解析各种复杂的表达式，包括数学运算、逻辑运算、字符串操作等。
2. **变量支持**：可以在表达式中使用变量，并在运行时进行动态替换。
3. **函数支持**：支持自定义函数，能够在表达式中调用预定义的或用户自定义的函数。
4. **错误处理**：提供完善的错误处理机制，能够捕获并处理表达式解析和执行过程中的各种异常。

### 使用示例

下面是一个简单的示例，展示如何在Java应用程序中使用Avatar表达式引擎：

```java
import com.avatar.expression.ExpressionEngine;
import com.avatar.expression.ExpressionException;

public class AvatarExample {
    public static void main(String[] args) {
        // 创建表达式引擎实例
        ExpressionEngine engine = new ExpressionEngine();
        
        // 定义表达式
        String expression = "3 + 5 * (2 - 1)";
        
        try {
            // 解析并执行表达式
            Object result = engine.evaluate(expression);
            System.out.println("表达式结果: " + result);
        } catch (ExpressionException e) {
            // 处理表达式错误
            e.printStackTrace();
        }
    }
}
```

在这个示例中，我们创建了一个Avatar表达式引擎实例，并定义了一个简单的数学表达式。

通过调用`engine.evaluate(expression)`方法，我们可以解析并执行这个表达式，并得到计算结果。

### Avatar的应用场景

1. **业务规则引擎**：在业务系统中，通过Avatar表达式引擎可以灵活定义和调整业务规则，而无需修改代码。

2. **数据处理**：在数据处理过程中，使用表达式引擎可以简化对数据的各种动态计算需求。

3. **配置管理**：通过表达式引擎，可以在配置文件中定义动态计算逻辑，从而提高配置的灵活性和可扩展性。

总之，Avatar表达式引擎以其轻量级、高性能和易用性，成为Java应用程序中处理动态计算需求的一个有力工具。

## Aviator 内置了哪些常见的函数？

Aviator 是一个功能强大的 Java 表达式引擎，内置了许多常见的函数，涵盖数学、逻辑、字符串操作、集合操作等多个方面。

以下是 Aviator 内置的一些常见函数：

### 数学函数

1. `abs(x)`：返回 x 的绝对值。
2. `ceil(x)`：返回大于等于 x 的最小整数。
3. `floor(x)`：返回小于等于 x 的最大整数。
4. `round(x)`：返回四舍五入后的整数。
5. `max(x, y)`：返回 x 和 y 中的最大值。
6. `min(x, y)`：返回 x 和 y 中的最小值。
7. `sqrt(x)`：返回 x 的平方根。
8. `pow(x, y)`：返回 x 的 y 次方。
9. `random()`：返回一个随机数。

### 字符串函数

1. `string.length(s)`：返回字符串 s 的长度。
2. `string.contains(s, sub)`：判断字符串 s 是否包含子串 sub。
3. `string.startsWith(s, prefix)`：判断字符串 s 是否以 prefix 开头。
4. `string.endsWith(s, suffix)`：判断字符串 s 是否以 suffix 结尾。
5. `string.substring(s, begin, end)`：返回字符串 s 从 begin 到 end 的子串。
6. `string.replace(s, target, replacement)`：将字符串 s 中的 target 替换为 replacement。
7. `string.upper(s)`：将字符串 s 转换为大写。
8. `string.lower(s)`：将字符串 s 转换为小写。

### 集合函数

1. `list.size(list)`：返回集合 list 的大小。
2. `list.contains(list, element)`：判断集合 list 是否包含元素 element。
3. `list.get(list, index)`：返回集合 list 中指定索引位置的元素。
4. `list.add(list, element)`：向集合 list 中添加元素 element。
5. `list.remove(list, element)`：从集合 list 中移除元素 element。

### 逻辑函数

1. `and(x, y)`：返回 x 和 y 的逻辑与。
2. `or(x, y)`：返回 x 和 y 的逻辑或。
3. `not(x)`：返回 x 的逻辑非。

### 日期时间函数

1. `date.now()`：返回当前时间。
2. `date.format(date, pattern)`：按照指定格式 pattern 格式化日期 date。
3. `date.parse(dateString, pattern)`：按照指定格式 pattern 解析日期字符串 dateString。
4. `date.year(date)`：返回日期 date 的年份。
5. `date.month(date)`：返回日期 date 的月份。
6. `date.day(date)`：返回日期 date 的天。

这些内置函数大大增强了 Aviator 表达式引擎的功能，使其能够更方便地处理各种复杂的计算和操作需求。

如果需要更多详细信息，可以参考 Aviator 的官方文档。

## 如果我有一段字符串，比如 "name=老马啸西风;ip=127.0.0.1"，这个字符串放入 env 中，如何通过 avaitar 写一段表达式提取出 ip 地址

### java 原生方式

```java
 public static void main(String[] args) {
        // 定义输入字符串
        String input = "name=老马啸西风;ip=127.0.0.1";

        // 将输入字符串放入 env 环境变量中
        Map<String, Object> env = new HashMap<>();
        env.put("env", input);

        // 定义提取 IP 地址的表达式
        String ip = input.split(";")[1].split("=")[1];
        // 输出结果
        System.out.println("提取的 IP 地址: " + ip);
    }
```

### aviator 方式

```java
import com.googlecode.aviator.AviatorEvaluator;
import com.googlecode.aviator.Expression;

import java.util.HashMap;
import java.util.Map;

public class AvaitarRegexDemo {

    public static void main(String[] args) {
        // 定义输入字符串
        String input = "name=老马啸西风;ip=127.0.0.1";

        // 将输入字符串放入 env 环境变量中
        Map<String, Object> env = new HashMap<>();
        env.put("env", input);

        // 定义提取 IP 地址的表达式
        String expression = "string.split(string.split(env, ';')[1], '=')[1]";

        // 编译并执行表达式
        Expression compiledExp = AviatorEvaluator.compile(expression);
        String ip = (String) compiledExp.execute(env);

        // 输出结果
        System.out.println("提取的 IP 地址: " + ip);
    }

}
```

## 正则表达式的方式

```java
package org.example;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class RegexFindIpDemo {

    public static void main(String[] args) {
        // 定义输入字符串
        String input = "name=老马啸西风;ip=127.0.0.1";

        // 定义正则表达式
        String regex = "ip=(\\d+\\.\\d+\\.\\d+\\.\\d+)";

        // 编译正则表达式
        Pattern pattern = Pattern.compile(regex);

        // 创建匹配器
        Matcher matcher = pattern.matcher(input);

        // 查找匹配的结果
        if (matcher.find()) {
            // 提取并输出 IP 地址
            String ip = matcher.group(1);
            System.out.println("提取的 IP 地址: " + ip);
        } else {
            System.out.println("未找到 IP 地址");
        }
    }

}
```

### 性能duibni

1) 原生方式，10W次: 98ms

2) Regex 方式，

提前 pattern 优化：122ms

不提前优化，大概 200ms

3) 表达式引擎方式：

缓存编译：`AviatorEvaluator.compile(expression, true)` 耗时 275ms

不缓存的话，性能会非常差。约 19s

* any list
{:toc}