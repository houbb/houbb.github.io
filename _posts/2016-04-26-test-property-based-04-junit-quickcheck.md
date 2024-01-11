---
layout: post
title:  test Property-based Testing-04-junit-quickcheck
date:  2016-04-26 14:10:52 +0800
categories: [Test]
tags: [java, test]
published: true
---

# 拓展阅读

[开源 Auto generate mock data for java test.(便于 Java 测试自动生成对象信息)](https://github.com/houbb/data-factory)

[开源 Junit performance rely on junit5 and jdk8+.(java 性能测试框架。性能测试。压测。测试报告生成。)](https://github.com/houbb/junitperf)

# junit-quickcheck：基于 JUnit 风格的属性驱动测试库

junit-quickcheck 是一个支持在 JUnit 中编写和运行属性驱动测试的库，受到了 Haskell 的 QuickCheck 的启发。

属性驱动测试捕获代码输出的特征或“属性”，这些特征在满足某些条件的任意输入下应为真。

例如，想象一个函数，它生成一个正整数 n 大于 1 的质因数列表。

无论 n 的具体值如何，该函数必须生成一个列表，其中的成员都是质数，当全部相乘时等于 n，并且不同于大于 1 且不等于 n 的正整数 m 的因数分解。

与测试所有可能的输入不同，junit-quickcheck 和其他 QuickCheck 衍生库生成一些随机输入，并验证这些属性至少对生成的输入成立。这使我们在重复的测试运行中合理确保这些属性对于任何有效输入都成立。

# 入门例子

```java
    import com.pholser.junit.quickcheck.Property;
    import com.pholser.junit.quickcheck.runner.JUnitQuickcheck;
    import org.junit.runner.RunWith;

    import static org.junit.Assert.*;

    @RunWith(JUnitQuickcheck.class)
    public class StringProperties {
        @Property public void concatenationLength(String s1, String s2) {
            assertEquals(s1.length() + s2.length(), (s1 + s2).length());
        }
    }
```

# 支持的类型

“开箱即用”（核心 + 生成器），junit-quickcheck 可识别以下类型的属性参数：

所有 Java 基本类型和基本类型包装类
java.math.Big(Decimal|Integer)
java.util.Date
任何枚举类型
String
“函数接口”（具有单个抽象方法且不覆盖 java.lang.Object 方法的接口）
java.util.Optional，支持的类型
java.util.ArrayList 和 java.util.LinkedList，支持的类型
java.util.HashSet 和 java.util.LinkedHashSet，支持的类型
java.util.HashMap 和 java.util.LinkedHashMap，支持的类型
支持的类型的数组
“标记”接口（没有方法且不覆盖 java.lang.Object 方法或不是默认方法的接口）
其他类型...

当多个生成器可以满足给定属性参数的类型（例如，java.io.Serializable），在给定的生成中，junit-quickcheck 将以（大致）相等的概率随机选择其中之一的生成器。

# 生成其他类型的值

扩展 Generator 类以创建该类型的生成器。

为了让 junit-quickcheck 能够实例化您的生成器，请确保它具有一个公共的无参数构造函数：

```java
    import java.awt.Dimension;

    public class Dimensions extends Generator<Dimension> {
        public Dimensions() {
            super(Dimension.class);
        }

        @Override public Dimension generate(
            SourceOfRandomness r,
            GenerationStatus status) {

            // ...
        }
    }
```

如果将生成器定义为内部类，请确保它是静态的，否则它将在运行时失败。

# 显式生成器

为了生成其他类型的属性参数的随机值，或者为了覆盖支持类型的默认生成方式，请使用 @From 标记属性参数，并提供要使用的 Generator 类。

如果您给出多个 @From 注解，junit-quickcheck 将在每次生成时按照其频率属性的比例选择其中一个（默认为1）。

```java
    import java.util.UUID;

    public class Version5 extends Generator<UUID> {
        public Version5() {
            super(UUID.class);
        }

        @Override public UUID generate(
            SourceOfRandomness r,
            GenerationStatus status) {

            // ...
        }
    }

    @RunWith(JUnitQuickcheck.class)
    public class IdentificationProperties {
        @Property public void shouldHold(@From(Version5.class) UUID u) {
            // ...
        }
    }
```

junit-quickcheck内置了用于生成函数接口类型值的设施（无论它们是否标有[FunctionalInterface]（http://docs.oracle.com/javase/8/docs/api/java/lang/FunctionalInterface.html）），还有用于数组或枚举类型的设施。显式命名这些类型参数的生成器会覆盖内置的生成方式。这通常对涉及泛型的函数接口是必要的。

## 通过放置和命名隐含的生成器

如果生成器与您要生成的类在同一个包中，并且它有相同的名称并带有额外的“Gen”后缀，那么它应该会被自动找到。

## 通过ServiceLoader隐含的生成器

要在不使用@From的情况下使用自定义类型的生成器，您可以通过安排[ServiceLoader]（http://docs.oracle.com/javase/8/docs/api/java/util/ServiceLoader.html）来发现它。

在资源目录META-INF/services中创建一个名为com.pholser.junit.quickcheck.generator.Generator的提供者配置文件。
此文件的每一行应包含具体生成器类的完全限定名称。
确保您的生成器类和提供者配置文件都在类路径上。junit-quickcheck将以这种方式打包的生成器可用于使用。

模块junit-quickcheck-generators中的生成器也通过此机制加载。您提供和使ServiceLoader可用的任何生成器都会补充而不是覆盖这些生成器。

### Ctor

通过在@From中使用Ctor生成器，可以为具有单个可访问构造函数的类型生成值。

```java
    public class DollarsAndCents {
        private final BigDecimal amount;

        public DollarsAndCents(BigDecimal amount) {
           this.amount = amount.setScale(2, BigDecimal.ROUND_HALF_EVEN);
        }

        // ...
    }

    @RunWith(JUnitQuickcheck.class)
    public class DollarsAndCentsProperties {
        @Property public void rounding(@From(Ctor.class) DollarsAndCents d) {
            // ...
        }
    }
```

junit-quickcheck会找到适用于构造函数参数类型的生成器，并调用它们来为构造函数调用提供值。将尊重构造函数参数上的任何配置注解。

### Fields 字段

通过在@From中使用 Fields 生成器，可以为具有可访问的无参数构造函数的类型生成值。

```java
    public class Counter {
        private int count;

        public Counter increment() {
            ++count;
            return this;
        }

        public Counter decrement() {
            --count;
            return this;
        }

        public int count() {
            return count;
        }
    }

    @RunWith(JUnitQuickcheck.class)
    public class CounterProperties {
        @Property public void incrementing(@From(Fields.class) Counter c) {
            int count = c.count();
            assertEquals(count + 1, c.increment().count());
        }

        @Property public void decrementing(@From(Fields.class) Counter c) {
            int count = c.count();
            assertEquals(count - 1, c.decrement().count());
        }
    }
```

junit-quickcheck会找到适用于类字段类型的生成器，并调用它们来为类的新实例的字段提供值（绕过访问保护）。

将尊重字段上的任何配置注解。

# 参考资料

https://github.com/pholser/junit-quickcheck

* any list
{:toc}