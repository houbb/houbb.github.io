---
layout: post
title:  Junit5-21-Ex Instance Post-processing
date:  2018-06-26 14:28:16 +0800
categories: [Test]
tags: [test, sh]
published: true
---

# 测试实例后处理

TestInstancePostProcessor 为希望发布流程测试实例的扩展定义了API。

常见的用例包括向测试实例注入依赖项、在测试实例上调用自定义初始化方法等。

## 示例

> [MockitoExtension](https://github.com/mockito/mockito/blob/release/2.x/subprojects/junit-jupiter/src/main/java/org/mockito/junit/jupiter/MockitoExtension.java)

> [SpringExtension](https://github.com/spring-projects/spring-framework/blob/master/spring-test/src/main/java/org/springframework/test/context/junit/jupiter/SpringExtension.java)

* any list
{:toc}