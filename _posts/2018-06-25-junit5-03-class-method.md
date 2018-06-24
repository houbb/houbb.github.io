---
layout: post
title:  Junit5-03-Class and Method
date:  2018-06-25 07:10:34 +0800
categories: [Test]
tags: [test, sh]
published: true
---

# 测试类和方法

测试方法是使用@Test、@RepeatedTest、@ParameterizedTest、@TestFactory或@TestTemplate直接或元注释的任何实例方法。

测试类是包含至少一个测试方法的任何顶层或静态成员类。

## 标准案例

> 注意

测试类和测试方法都可以不设置为 `public`。

- StandardTests.java

```java
import static org.junit.jupiter.api.Assertions.fail;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;

class StandardTests {

    @BeforeAll
    static void initAll() {
    }

    @BeforeEach
    void init() {
    }

    @Test
    void succeedingTest() {
    }

    @Test
    void failingTest() {
        fail("a failing test");
    }

    @Test
    @Disabled("for demonstration purposes")
    void skippedTest() {
        // not executed
    }

    @AfterEach
    void tearDown() {
    }

    @AfterAll
    static void tearDownAll() {
    }

}
```

* any list
{:toc}







