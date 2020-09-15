---
layout: post
title: test 系统学习-02-Junit @Parameters junit 参数化测试
date:  2018-06-23 23:43:46 +0800
categories: [Test]
tags: [test, sh]
published: true
---

# TestNG

[TestNG](https://testng.org/doc/index.html) 中我们提到了  `@DataProvider` 注解，
使用起来也较为方便。

当然，没有对比，有没有伤害。

# Junit4

Junit4 本身也是支持这种参数化的实现的。

> [Parameterized](https://github.com/junit-team/junit4/wiki/Parameterized-tests)

## maven 引入

```xml
<dependency>
    <groupId>junit</groupId>
    <artifactId>junit</artifactId>
    <version>4.12</version>
    <scope>test</scope>
</dependency>
```

## 代码

- Fibonacci.java

```java
public class Fibonacci {
    public static int compute(int n) {
    	int result = 0;
    	
        if (n <= 1) { 
        	result = n; 
        } else { 
        	result = compute(n - 1) + compute(n - 2); 
        }
        
        return result;
    }
}
```

- FibonacciTest.java

```java
import static org.junit.Assert.assertEquals;

import java.util.Arrays;
import java.util.Collection;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.Parameterized;
import org.junit.runners.Parameterized.Parameters;

@RunWith(Parameterized.class)
public class FibonacciTest {
    @Parameters
    public static Collection<Object[]> data() {
        return Arrays.asList(new Object[][] {     
                 { 0, 0 }, { 1, 1 }, { 2, 1 }, { 3, 2 }, { 4, 3 }, { 5, 5 }, { 6, 8 }  
           });
    }

    private int fInput;

    private int fExpected;

    public FibonacciTest(int input, int expected) {
        this.fInput = input;
        this.fExpected = expected;
    }

    @Test
    public void test() {
        assertEquals(fExpected, Fibonacci.compute(fInput));
    }
}
```

需要声明变量，很麻烦。如何解决呢？

# junit-dataprovider

junit-dataprovider 可以让 Junit4 中使用 `@DataProvider` 的功能

> [Getting-started#usage](https://github.com/TNG/junit-dataprovider/wiki/Getting-started#usage)

## maven 引入

```xml
<dependency>
    <groupId>com.tngtech.java</groupId>
    <artifactId>junit-dataprovider</artifactId>
    <version>1.10.0</version>
    <scope>test</scope>
</dependency>
```

## 代码

- DataProviderTest.java

```java
import static org.junit.Assert.*;

import org.junit.Test;
import org.junit.runner.RunWith;

import com.tngtech.java.junit.dataprovider.DataProvider;
import com.tngtech.java.junit.dataprovider.DataProviderRunner;
import com.tngtech.java.junit.dataprovider.UseDataProvider;

@RunWith(DataProviderRunner.class)
public class DataProviderTest {

    @DataProvider
    public static Object[][] dataProviderAdd() {
        // @formatter:off
        return new Object[][] {
                { 0, 0, 0 },
                { 1, 1, 2 },
                /* ... */
        };
        // @formatter:on
    }

    @Test
    @UseDataProvider("dataProviderAdd")
    public void testAdd(int a, int b, int expected) {
        // Given:

        // When:
        int result = a + b;

        // Then:
        assertEquals(expected, result);
    }
}
```

# Junit5

Junit5 这些方式变得非常易用+强大。


* any list
{:toc}