---
layout: post
title:  Junit5-15-Parameterized Tests
date:  2018-06-25 19:13:52 +0800
categories: [Test]
tags: [test, sh]
published: true
---

# 参数化测试

参数化测试使使用不同参数多次运行测试成为可能。它们与常规的@Test方法一样被声明，但是使用 `@ParameterizedTest`注释。
此外，您必须声明至少一个源，该源将为每个调用提供参数，然后使用测试方法中的参数。

下面的示例演示了一个参数化测试，该测试使用@ValueSource注释指定一个字符串数组作为参数的来源。

## 实例

```java
@ParameterizedTest
@ValueSource(strings = { "racecar", "radar", "able was I ere I saw elba" })
void palindromes(String candidate) {
    assertTrue(isPalindrome(candidate));
}
```

执行上述参数化测试方法时，将分别报告每个调用。例如，`ConsoleLauncher` 将输出类似如下的输出。

## 需要

需要添加 `junit-jupiter-params` 模块：

```
Group ID: org.junit.jupiter

Version: 5.2.0

Artifact IDs: junit-jupiter-api
```

# 使用参数



* any list
{:toc}