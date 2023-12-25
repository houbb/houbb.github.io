---
layout: post
title: test assert-03-assertj AssertJ - Fluent Assertions for Java 断言
date:  2016-4-26 12:53:12 +0800
categories: [JS]
tags: [js, assert, sh]
published: true
---

# assertj

AssertJ提供了一组丰富且直观的强类型断言，用于单元测试（与JUnit、TestNG或任何其他测试框架一起使用）。

## AssertJ的目标

AssertJ的雄心壮志是为单元测试提供一组丰富而直观的强类型断言。

其理念是在编写单元测试时，应该将处置断言具体化为我们检查的对象类型。

如果您正在检查字符串的值，则使用字符串特定的断言。检查Map的值？使用Map特定的断言轻松检查Map的内容。

AssertJ的断言非常容易使用：只需键入assertThat(underTest)。并使用代码完成显示所有可用的断言。

断言缺失？请创建一个问题进行讨论，甚至更好地为项目做出贡献！

AssertJ由几个模块组成：

- 核心模块，为JDK类型提供断言（String、Iterable、Stream、Path、File、Map等） - 请参阅AssertJ Core文档和javadoc。
- Guava模块，为Guava类型提供断言（Multimap、Optional等） - 请参阅AssertJ Guava文档和javadoc。
- Joda Time模块，为Joda Time类型提供断言（DateTime、LocalDateTime等） - 请参阅AssertJ Joda Time文档和javadoc。
- Neo4J模块，为Neo4J类型提供断言（Path、Node、Relationship等） - 请参阅AssertJ Neo4J文档和javadoc。
- DB模块，为关系数据库类型提供断言（Table、Row、Column等） - 请参阅AssertJ DB文档和javadoc。
- Swing模块，提供了用于对Swing用户界面进行功能测试的简单直观的API - 请参阅AssertJ Swing文档和javadoc。

# 快速开始

## maven 

```xml
<dependency>
  <groupId>org.assertj</groupId>
  <artifactId>assertj-core</artifactId>
  <version>3.24.2</version>
  <scope>test</scope>
</dependency>
```

## 包导入

```java
import static org.assertj.core.api.Assertions.*;
```

or

```java
import static org.assertj.core.api.Assertions.assertThat;  // main one
import static org.assertj.core.api.Assertions.atIndex; // for List assertions
import static org.assertj.core.api.Assertions.entry;  // for Map assertions
import static org.assertj.core.api.Assertions.tuple; // when extracting several properties at once
import static org.assertj.core.api.Assertions.fail; // use when writing exception tests
import static org.assertj.core.api.Assertions.failBecauseExceptionWasNotThrown; // idem
import static org.assertj.core.api.Assertions.filter; // for Iterable/Array assertions
import static org.assertj.core.api.Assertions.offset; // for floating number assertions
import static org.assertj.core.api.Assertions.anyOf; // use with Condition
import static org.assertj.core.api.Assertions.contentOf; // use with File assertions
```

## 例子

WithAssertions example:

```java
import org.assertj.core.api.WithAssertions;

public class WithAssertionsExamples extends AbstractAssertionsExamples implements WithAssertions {

  // the data used are initialized in AbstractAssertionsExamples.

  @Test
  public void withAssertions_examples() {

    // assertThat methods come from WithAssertions - no static import needed
    assertThat(frodo.age).isEqualTo(33);
    assertThat(frodo.getName()).isEqualTo("Frodo").isNotEqualTo("Frodon");

    assertThat(frodo).isIn(fellowshipOfTheRing);
    assertThat(frodo).isIn(sam, frodo, pippin);
    assertThat(sauron).isNotIn(fellowshipOfTheRing);

    assertThat(frodo).matches(p -> p.age > 30 && p.getRace() == HOBBIT);
    assertThat(frodo.age).matches(p -> p > 30);
  }
}
```

BDDAssertions example:

```java
import static org.assertj.core.api.BDDAssertions.then;

public class BDDAssertionsExamples extends AbstractAssertionsExamples {

  // the data used are initialized in AbstractAssertionsExamples.

  @Test
  public void withAssertions_examples() {

    // then methods come from BDDAssertions.then static
    then(frodo.age).isEqualTo(33);
    then(frodo.getName()).isEqualTo("Frodo").isNotEqualTo("Frodon");

    then(frodo).isIn(fellowshipOfTheRing);
    then(frodo).isIn(sam, frodo, pippin);
    then(sauron).isNotIn(fellowshipOfTheRing);

    then(frodo).matches(p -> p.age > 30 && p.getRace() == HOBBIT);
    then(frodo.age).matches(p -> p > 30);
  }
}
```

# 参考资料

https://assertj.github.io/doc/#assertj-core-quick-start

* any list
{:toc}
