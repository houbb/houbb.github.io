---
layout: post
title:  java 表达式引擎概览-02-Aviator 入门介绍
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

* any list
{:toc}