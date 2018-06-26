---
layout: post
title:  Junit5-28-Ex Excution Order
date:  2018-06-26 15:49:26 +0800
categories: [Test]
tags: [test, sh]
published: true
---

# 用户代码和扩展的相对执行顺序

当执行包含一个或多个测试方法的测试类时，除了用户提供的测试和生命周期方法外，还会调用许多扩展回调。

## 相对顺序

下图说明了用户提供的代码和扩展代码的相对顺序。

```java
BeforeAllCallBack //(1)
    @BeforeAll  //(2)
        BeforeEachCallBack  //(3)
            @BeforeEach //(4)
                BeforeTestExecutionCallBack //(5)
                    @Test   //(6)
                    TestExecutionExceptionHandler   //(7)
                BeforeTestExecutionCallBack //(8)
            @AfterEach //(9)    
        AfterEachCallBack  //(10)    
    @AfterAll  //(11)    
AfterAllCallBack //(1)  
```


## 步骤

用户提供的测试和生命周期方法用橙色显示，用蓝色显示的扩展提供回调代码。灰色框表示执行单个测试方法，并将对测试类中的每个测试方法重复执行。

下表进一步解释了用户代码和扩展代码图中的12个步骤。

| 步骤 | 接口/注解 | 描述 |
|:----|:----|:----|
| 1 | interface org.junit.jupiter.api.extension.BeforeAllCallback | 在执行容器的所有测试之前执行扩展代码 |
| 2 | @annotation org.junit.jupiter.api.BeforeAll | 在执行容器的所有测试之前执行用户代码 |
| 3 | interface org.junit.jupiter.api.extension.BeforeEachCallback | 在执行每个测试之前执行的扩展代码 |
| 4 | @annotation org.junit.jupiter.api.BeforeEach | 在执行每个测试之前执行的用户代码 |
| 5 | interface org.junit.jupiter.api.extension.BeforeTestExecutionCallback | 在执行测试之前立即执行的扩展代码 |
| 6 | @annotation org.junit.jupiter.api.Test | 用户代码的实际测试方法 |
| 7 | interface org.junit.jupiter.api.extension.TestExecutionExceptionHandler | 处理在测试期间抛出的异常的扩展代码 |
| 8 | interface org.junit.jupiter.api.extension.AfterTestExecutionCallback | 测试执行后立即执行的扩展代码及其相应的异常处理程序 |
| 9 | @annotation org.junit.jupiter.api.AfterEach | 在每次测试执行后执行的用户代码 |
| 10 | interface org.junit.jupiter.api.extension.AfterEachCallback | 每次测试执行后执行的扩展代码 |
| 11 | @annotation org.junit.jupiter.api.AfterAll | 在执行容器的所有测试之后执行用户代码 |
| 12 | interface org.junit.jupiter.api.extension.AfterAllCallback | 在执行容器的所有测试之后执行扩展代码 |

在最简单的情况下，只执行实际的测试方法(步骤6);所有其他步骤都是可选的，这取决于用户代码的存在或相应生命周期回调的扩展支持。有关各种生命周期回调的详细信息，请咨询各自的JavaDoc以获得每个注释和扩展。

* any list
{:toc}