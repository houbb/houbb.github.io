---
layout: post
title:  Junit5-06-Assumptions
date:  2018-06-25 07:39:35 +0800
categories: [Test]
tags: [test, sh]
published: true
---

# Assumptions

JUnit Jupiter附带了JUnit 4提供的假设方法的一个子集，并添加了一些可以很好地用于Java 8 lambdas的假设方法。

所有的JUnit Jupiter假设都是在 `org.junit.jupiter.api.Assumptions` 的静态方法。

# 实例

- AssumptionsDemo.java

```java
package com.github.houbb.jdk.junit5;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assumptions.assumeTrue;
import static org.junit.jupiter.api.Assumptions.assumingThat;

import org.junit.jupiter.api.Test;

/**
 * @author houbinbin
 * @version 1.0
 * @since JDK 1.7
 */
public class AssumptionsDemo {

    @Test
    void testOnlyOnCiServer() {
        assumeTrue("CI".equals(System.getenv("ENV")));
        // remainder of test
    }

    @Test
    void testOnlyOnDeveloperWorkstation() {
        assumeTrue("DEV".equals(System.getenv("ENV")),
                () -> "Aborting test: not on developer workstation");
        // remainder of test
    }

    @Test
    void testInAllEnvironments() {
        assumingThat("CI".equals(System.getenv("ENV")),
                () -> {
                    // perform these assertions only on the CI server
                    assertEquals(2, 2);
                });

        // perform these assertions in all environments
        assertEquals("a string", "a string");
    }
}
```

* any list
{:toc}







