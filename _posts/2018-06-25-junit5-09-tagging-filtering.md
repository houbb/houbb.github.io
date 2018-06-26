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

# Tag 表达式

标签表达式是具有运算符`!` `&`和`|`的布尔表达式。此外，`(` 和 `)` 可以用于调整操作符的优先级。

## 操作符号(按优先级的降序排列)

| 操作符 |	意思 | 结合性 | 
|:---|:---|:---|
| ! | not | 右边 |
| & | and | 左边 |
| `|` | or | 左边 |

如果您正在跨多个维度标记您的测试，标记表达式将帮助您选择要执行哪些测试。
根据测试类型(例如，micro, integration，端到端)和特性(例如foo, bar, baz)标记以下标记表达式是有用的。

- 示例

| TAG 表达式 | 选中 |
| `foo` | all tests for foo |
| `bar | baz` | all tests for bar plus all tests for baz |
| `bar & baz` | all tests for the interaction between bar and baz |
| `foo & !end-to-end` | all tests for foo, but not the end-to-end tests |
| `(micro | integration) & (foo | baz)` | all micro or integration tests for foo or baz |











* any list
{:toc}







