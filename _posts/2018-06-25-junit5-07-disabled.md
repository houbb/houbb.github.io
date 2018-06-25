---
layout: post
title:  Junit5-07-Disabled
date:  2018-06-25 13:35:32 +0800
categories: [Test]
tags: [test, sh]
published: true
---

# @Disabled

可以通过 `@Disabled` 注释、条件测试执行中讨论的注释之一
或自定义ExecutionCondition来禁用整个测试类或单个测试方法。

# 实例

## 整个类 

整个类中的测试方法，都会被跳过

- DisabledClassDemo.java

```java
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;

@Disabled
class DisabledClassDemo {
    @Test
    void testWillBeSkipped() {
    }
}
```

## 单个方法

- DisabledTestsDemo.java

```java
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;

class DisabledTestsDemo {

    @Disabled
    @Test
    void testWillBeSkipped() {
    }

    @Test
    void testWillBeExecuted() {
    }
}
```

* any list
{:toc}







