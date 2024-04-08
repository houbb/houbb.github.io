---
layout: post
title:  QLExpress-01-Quick Start
date:  2018-06-10 10:29:21 +0800
categories: [Engine]
tags: [qlexpress, engine, rule-engine]
published: true
---


# QLExpress

QLExpress 是一个基于 Java 的表达式解析器和规则引擎，它旨在提供一种简单、高效的方式来处理和计算表达式，同时支持规则的定义和执行。QLExpress 适用于需要动态表达式计算和复杂决策逻辑的场景，如金融分析、业务规则管理、数据验证等。

### 核心特性

1. **表达式解析**：QLExpress 能够解析包含变量、常量、函数调用和操作符的复杂表达式，并计算其结果。

2. **规则定义**：用户可以定义包含条件和动作的业务规则，QLExpress 根据这些规则执行相应的逻辑。

3. **高性能**：QLExpress 优化了表达式的编译和执行过程，以提高计算效率。

4. **易于集成**：作为一个 Java 库，QLExpress 可以轻松集成到任何 Java 应用程序中。

5. **灵活性**：QLExpress 支持自定义函数和操作符，使得用户可以根据业务需求扩展其功能。

6. **错误处理**：QLExpress 提供了详细的错误信息和堆栈跟踪，方便开发者调试和定位问题。

### 使用场景

- **金融分析**：在金融领域，QLExpress 可以用来计算投资组合的风险和收益，或者评估贷款申请者的信用等级。

- **业务规则管理**：企业可以使用 QLExpress 来定义和管理业务规则，如定价策略、促销活动条件等。

- **数据验证**：QLExpress 可以用于验证用户输入数据是否符合特定的业务规则，如年龄限制、密码强度等。

- **报表生成**：在生成报表时，QLExpress 可以用来动态计算各种指标，如销售额、成本分析等。

### 优势

- **易用性**：QLExpress 提供了直观的 API，使得定义表达式和规则变得简单快捷。

- **灵活性**：支持自定义扩展，可以适应各种复杂的业务逻辑。

- **性能**：优化的算法确保了在处理大量数据时仍能保持良好的性能。

### 缺点

- **文档和社区支持**：相较于一些更流行的表达式引擎和规则引擎，QLExpress 的文档和社区支持可能相对较少。

- **功能限制**：虽然 QLExpress 提供了基本的表达式解析和规则执行功能，但可能不如一些成熟的规则引擎那样功能全面。

总的来说，QLExpress 是一个轻量级且功能强大的工具，适合需要在 Java 应用程序中进行表达式计算和业务规则管理的场景。开发者可以利用其灵活性和高性能来构建复杂的业务逻辑，同时保持代码的清晰和可维护性。

## 应用场景

- 对于不可知的场景，比如风控点编写。

如果全部使用代码编写，调整起来将变得十分麻烦。

- EAV 数据库模式，原始信息的处理

可以将 QLExpress 与 Eav 数据库模式结合起来，使得功能变得强大灵活。

## 编写此系列博客的目的

- 系统学习下 QLExpress，而不是局限于简单的使用。

- 官方 `README.md` 写的有些瑕疵

- 便于以后拓展+回顾

# 快速开始

## jar 的引入

```xml
<dependency>
    <groupId>com.alibaba</groupId>
    <artifactId>QLExpress</artifactId>
    <version>3.2.0</version>
</dependency>
```

## 入门案例


```java

import com.ql.util.express.DefaultContext;
import com.ql.util.express.ExpressRunner;

import org.junit.Assert;
import org.junit.Test;

public class HelloWorldTest {

    @Test
    public void helloTest() throws Exception {
        ExpressRunner runner = new ExpressRunner();
        DefaultContext<String, Object> context = new DefaultContext<>();
        context.put("a", 1);
        context.put("b", 2);
        String express = "a+b";
        Object r = runner.execute(express, context, null, true, false);
        Assert.assertEquals(3, r);
    }

}
```

# 拓展总结

## 整体架构

![2018-06-10-qlexpress-struct.jpeg](https://raw.githubusercontent.com/houbb/resource/master/img/java/qlexpress/2018-06-10-qlexpress-struct.jpeg)

## 调用方法入参

```java
/**
 * 执行一段文本
 * @param expressString 程序文本
 * @param context 执行上下文，可以扩展为包含ApplicationContext
 * @param errorList 输出的错误信息List
 * @param isCache 是否使用Cache中的指令集,建议为true
 * @param isTrace 是否输出详细的执行指令信息，建议为false
 * @param aLog 输出的log
 * @return
 * @throws Exception
 */
Object execute(String expressString, IExpressContext<String,Object> context,List<String> errorList, boolean isCache, boolean isTrace, Log aLog);
```

## isTrace

```
/**
 * 是否输出所有的跟踪信息，同时还需要log级别是DEBUG级别
 */
private boolean isTrace = false;
```

这个主要是是否输出脚本的编译解析过程，一般对于业务系统来说关闭之后会提高性能。

我们将上面的执行中 `isTrace` 属性设置为 true。日志结果如下:

```
DEBUG [main] - LoadAttr:a:1
DEBUG [main] - LoadAttr:b:2
DEBUG [main] - +(a:1,b:2)
```


* any list
{:toc}







