---
layout: post
title:  Junit5-04-DisplayName
date:  2018-06-25 07:18:29 +0800
categories: [Test]
tags: [test, sh]
published: true
---

# 测试方法的名字

以前在看 Spock 的时候，提到一个胜于 Junit4 的优势就是可以灵活的定义测试方法和类的名称。

## 说明 

Junit5 中的 `@DisplayName` 就为我们提供了实现这种方式的名称。

测试类和测试方法可以声明自定义显示名称——带有空格、特殊字符甚至表情符号——将由测试运行器和测试报告显示。

## 例子

```java
package com.github.houbb.jdk.junit5;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("A special test case")
public class DisplayNameTest {

    @Test
    @DisplayName("Custom test name containing spaces")
    void testWithDisplayNameContainingSpaces() {
    }

    @Test
    @DisplayName("╯°□°）╯")
    void testWithDisplayNameContainingSpecialCharacters() {
    }

    @Test
    @DisplayName("😱")
    void testWithDisplayNameContainingEmoji() {
    }

}
```

* any list
{:toc}







