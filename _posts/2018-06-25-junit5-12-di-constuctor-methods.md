---
layout: post
title:  Junit5-12-DI for Constructors and Methods
date:  2018-06-25 17:13:46 +0800
categories: [Test]
tags: [test, sh]
published: true
---

# 依赖注入

在所有以前的JUnit版本中，都不允许测试构造函数或方法具有参数(至少不允许使用标准的Runner实现)。
作为JUnit Jupiter的主要变化之一，测试构造函数和方法现在都允许有参数。这允许更大的灵活性，并支持构造函数和方法的依赖注入。

ParameterResolver用于测试扩展的API，可以在运行时动态解析参数。
如果测试构造函数或@Test、@TestFactory、@BeforeEach、@AfterEach、@BeforeAll或@AfterAll方法接受一个参数，则必须由注册的参数解析器在运行时解析该参数。

目前有三个内置的解析器是自动注册的。

## TestInfoParameterResolver

如果一个方法参数是TestInfo类型，那么TestInfoParameterResolver将提供一个与当前测试对应的TestInfo实例作为参数的值。
然后，TestInfo可以用来检索关于当前测试的信息，比如测试的显示名称、测试类、测试方法或相关的标记。
DisplayName 可以是技术名称，例如测试类或测试方法的名称，也可以是通过 `@DisplayName` 配置的自定义名称。

TestInfo作为来自JUnit 4的TestName规则的drop-in替换。

下面演示如何将TestInfo注入到测试构造函数@BeforeEach方法和@Test方法中。

- TestInfoDemo.java

```java
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInfo;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@DisplayName("TestInfo Demo")
public class TestInfoDemo {

    TestInfoDemo(TestInfo testInfo) {
        assertEquals("TestInfo Demo", testInfo.getDisplayName());
    }

    @BeforeEach
    void init(TestInfo testInfo) {
        String displayName = testInfo.getDisplayName();
        assertTrue(displayName.equals("TEST 1") || displayName.equals("test2()"));
    }

    @Test
    @DisplayName("TEST 1")
    @Tag("my-tag")
    void test1(TestInfo testInfo) {
        assertEquals("TEST 1", testInfo.getDisplayName());
        assertTrue(testInfo.getTags().contains("my-tag"));
    }

    @Test
    void test2() {
    }
}
```
## RepetitionInfoParameterResolver

如果@RepeatedTest、@BeforeEach或@AfterEach方法中的方法参数类型为repeat tioninfo，那么repeat infoparameresolver将提供一个repeat tioninfo实例。
重复信息可以用来检索当前重复的信息以及对应的@RepeatedTest的重复次数。
但是，请注意，RepetitionInfoParameterResolver 不在 `@RepeatedTest` 的上下文中注册。

## TestReporterParameterResolver

如果方法参数为TestReporter类型，则TestReporterParameterResolver将提供TestReporter的实例。
可以使用TestReporter发布关于当前测试运行的其他数据。
数据可以通过TestExecutionListener.reportingEntryPublished()来使用，因此可以由ide查看或包含在报表中。

在JUnit Jupiter中，您应该使用TestReporter，在那里您可以将信息打印到JUnit 4中的stdout或stderr。
使用@RunWith(JUnitPlatform.class)甚至会将所有报告的条目输出到stdout。

- TestReporterDemo.java

```java
import java.util.HashMap;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestReporter;

class TestReporterDemo {

    @Test
    void reportSingleValue(TestReporter testReporter) {
        testReporter.publishEntry("a key", "a value");
    }

    @Test
    void reportSeveralValues(TestReporter testReporter) {
        HashMap<String, String> values = new HashMap<>();
        values.put("user name", "dk38");
        values.put("award year", "1974");

        testReporter.publishEntry(values);
    }
}
```

## @ExtendWith

通过@ExtendWith注册适当的扩展，必须显式地启用其他参数解析器。

### RandomParametersExtension

参见 [RandomParametersExtension](https://github.com/junit-team/junit5-samples/blob/r5.2.0/junit5-jupiter-extensions/src/main/java/com/example/random/RandomParametersExtension.java)


```java
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;

@ExtendWith(RandomParametersExtension.class)
class MyRandomParametersTest {

    @Test
    void injectsInteger(@Random int i, @Random int j) {
        assertNotEquals(i, j);
    }

    @Test
    void injectsDouble(@Random double d) {
        assertEquals(0.0, d, 1.0);
    }

}
```

### 其他

> [MockitoExtension](https://github.com/mockito/mockito/blob/release/2.x/subprojects/junit-jupiter/src/main/java/org/mockito/junit/jupiter/MockitoExtension.java)

> [SpringExtention](https://github.com/spring-projects/spring-framework/blob/master/spring-test/src/main/java/org/springframework/test/context/junit/jupiter/SpringExtension.java)


* any list
{:toc}