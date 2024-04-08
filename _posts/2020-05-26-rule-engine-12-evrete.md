---
layout: post
title: 规则引擎-12-Evrete 是一个前向推理的 Java 规则引擎，实现了 RETE 算法，并完全符合 Java 规则引擎规范（JSR 94）。 
date:  2020-5-26 16:05:35 +0800
categories: [Engine]
tags: [design, rule-engine, sf] 
published: true
---

# 介绍

Evrete 是一个前向推理的 Java 规则引擎，实现了 RETE 算法，并完全符合 Java 规则引擎规范（JSR 94）。

ps: 看来这个 rete 算法才是核心，jsr94 也可以重点关注一下。

它的特性包括：

**规则编写**

- 可以使用外部和内联方式编写规则，作为普通的 Java 8 代码。
- 引擎允许规则以 **带注解的 Java** 源代码、类或存档的形式编写。
- 该库本身是一个灵活的工具，用于创建自定义领域特定的规则语言（DSL）。

**直观且开发者友好**

- 库的类型系统使其能够无缝处理任何类型的对象，包括 JSON 和 XML。
- 流畅的构建器、Java 函数式接口和其他最佳实践使开发者的代码简洁清晰。
- 关键组件暴露为服务提供者接口，可以进行定制。

**性能和安全性**

- 引擎的算法和内存经过优化，适用于大规模和带标签的数据。
- 内置的 Java 安全管理器支持，可防止规则中的不需要或潜在恶意代码。

## 项目主页

官方项目描述、文档和使用示例可在 https://www.evrete.org 找到。

## 先决条件

Evrete 兼容 Java 8+，并且不带有任何依赖项。

## 安装

Maven:

```xml
<dependency>
    <groupId>org.evrete</groupId>
    <artifactId>evrete-core</artifactId>
    <version>3.2.00</version>
</dependency>
```

Gradle:

```groovy
implementation 'org.evrete:evrete-core:3.2.00'
```

### 支持带注解的规则（可选）

Maven:

```xml
<dependency>
    <groupId>org.evrete</groupId>
    <artifactId>evrete-dsl-java</artifactId>
    <version>3.2.00</version>
</dependency>
```

Gradle:

```groovy
implementation 'org.evrete:evrete-dsl-java:3.2.00'
```

## 快速入门

以下是一个简单的规则示例，从会话内存中删除除了素数之外的每个整数。

作为内联 Java 代码：

```java
public class PrimeNumbersInline {
    public static void main(String[] args) {
        KnowledgeService service = new KnowledgeService();
        Knowledge knowledge = service
                .newKnowledge()
                .builder()
                .newRule("prime numbers")
                .forEach(
                        "$i1", Integer.class,
                        "$i2", Integer.class,
                        "$i3", Integer.class
                )
                .where("$i1 * $i2 == $i3")
                .execute(ctx -> ctx.deleteFact("$i3"))
                .build();

        try (StatefulSession session = knowledge.newStatefulSession()) {
            // Inject candidates
            for (int i = 2; i <= 100; i++) {
                session.insert(i);
            }

            // Execute rules
            session.fire();

            // Print current memory state
            session.forEachFact((handle, o) -> System.out.println(o));
        }
        service.shutdown();
    }
}
```

作为带注解的 Java 源文件：

```java
public class PrimeNumbersDSLUrl {
    public static void main(String[] args) {
        KnowledgeService service = new KnowledgeService();
        Knowledge knowledge = service
                .newKnowledge(
                        "JAVA-SOURCE",
                        new URL("https://www.evrete.org/examples/PrimeNumbersSource.java")
                );

        try (StatefulSession session = knowledge.newStatefulSession()) {
            // Inject candidates
            for (int i = 2; i <= 100; i++) {
                session.insert(i);
            }
            // Execute rules
            session.fire();
            // Printout current memory state
            session.forEachFact((handle, o) -> System.out.println(o));
        }
    }
}
```

其中规则本身被存储在外部，如 [PrimeNumbersSource.java](https://www.evrete.org/examples/PrimeNumbersSource.java)

更多详细信息请参阅官方[文档](https://www.evrete.org/docs/)

## 许可证

本项目使用以下许可证：[MIT](https://opensource.org/licenses/MIT)

# 参考资料

https://github.com/evrete/evrete/

* any list
{:toc}