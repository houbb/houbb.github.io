---
layout: post
title:  test assert-01-Google Truth 断言
date:  2016-4-26 12:53:12 +0800
categories: [Test]
tags: [google, assert, test]
published: true
---

# 拓展阅读

[junit5-05-assert](https://houbb.github.io/2018/06/24/junit5-05-assert)

[junit5 系列](https://houbb.github.io/2018/06/24/junit5-01-hello)

[基于 junit5 实现 junitperf 源码分析](https://houbb.github.io/2021/07/23/junit-performance-junit5)

[Auto generate mock data for java test.(便于 Java 测试自动生成对象信息)](https://github.com/houbb/data-factory)

[Junit performance rely on junit5 and jdk8+.(java 性能测试框架。性能测试。压测。测试报告生成。)](https://github.com/houbb/junitperf)

# Truth

[Truth](https://github.com/google/truth) 是用于Java测试的断言框架，灵感来自于FEST，并受到一些可扩展性需求的驱动，几乎完全由谷歌员工在业余时间编写，或者作为Java核心图书馆管理员的身份做出贡献。

# 作用

作为工程师，我们花费大部分的时间来阅读现有的代码，而不是编写新的代码。

[Truth](http://blog.csdn.net/huayuqa/article/details/52956380) 是一个开源的、流畅的Java测试框架，使你的测试断言和失败消息更有**可读性**。
 
# Quick Start

完整代码地址：[google true demo](https://github.com/houbb/jdk/tree/master/jdk-truth)

## 引入

- 引入 jar

```xml
<dependency>
    <groupId>com.google.truth</groupId>
    <artifactId>truth</artifactId>
    <version>0.37</version>
    <scope>test</scope>
</dependency>
```


## 对比

- 测试断言和失败消息更有可读性

```java
/**
 * 由Truth编写的断言很容易从左到右读取，而由Junit编写的例子需要“精神回溯”。
 */
@Test
public void containsTruthTest() {
    Map<Integer, String> monthMap = new HashMap<>();
    monthMap.put(3, "March");

    assertEquals("March", monthMap.get(3)); // JUnit
    assertThat(monthMap).containsEntry(3, "March");  // Truth
}
```

- 有用的错误提示

```java
/**
 * 增加有用的默认失败消息。
 */
@Test
public void usefulMsgTest() {
    ImmutableSet<String> colors = ImmutableSet.of("red", "green", "blue", "yellow");

//        assertTrue(colors.contains("orange"));  // JUnit
    assertThat(colors).contains("orange");  // Truth
}
```

(1) Junit

```
java.lang.AssertionError
	at org.junit.Assert.fail(Assert.java:86)
	at org.junit.Assert.assertTrue(Assert.java:41)
	at org.junit.Assert.assertTrue(Assert.java:52)
	at com.ryo.jdk.truth.TruthTest.usefulMsgTest(TruthTest.java:41)
	...
```

(2) Truth

```
java.lang.AssertionError: <[red, green, blue, yellow]> should have contained <orange>

	at com.ryo.jdk.truth.TruthTest.usefulMsgTest(TruthTest.java:42)
	...
```

- 对 java 常见类型的支持

1. JDK 类型：对象，基本类型，数组，字符串，类，可比较类型，可迭代类型，集合，列表，集合，图

2. Guava: 可选值

3. 其他：异常，迭代器，多重映射，无符号整型，无符号长整型

- 可拓展

用户可以自定义一个 Truth 主题，以对你自定义的类型进行流畅的断言。

通过创建你自定义的主题，你的断言API和你的失败消息都可以是特定领域的。

* any list
{:toc}