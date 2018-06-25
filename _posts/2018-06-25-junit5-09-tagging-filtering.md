---
layout: post
title:  Junit5-08-Tagging and Filtering
date:  2018-06-25 16:50:21 +0800
categories: [Test]
tags: [test, sh]
published: true
---

# 标签和过滤

可以通过 `@Tag` 注释对测试类和方法进行标记。这些标记稍后可用于筛选测试发现和执行。

## 语法规则

- 标签不能为空或 `null`。

- trim() 的标记不能包含空格。

- trim() 的标签不能包含ISO控制字符。

- trim()的标记不能包含以下任何保留字符:

1. `,`: 逗号

2. `(`: 左括号

3. `)`: 右括号

4. `&`: 与

5. `|`: 竖线

6. `!`: 非

## 实例

- TagDemo.java

```java
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

@Tag("fast")
@Tag("model")
public class TagDemo {
    @Test
    @Tag("taxes")
    void testingTaxCalculation() {
    }
}
```









* any list
{:toc}







