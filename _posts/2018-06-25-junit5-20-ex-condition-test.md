---
layout: post
title:  Junit5-20-Ex Condition Test
date:  2018-06-26 14:14:31 +0800
categories: [Test]
tags: [test, sh]
published: true
---

# 条件测试

ExecutionCondition 定义用于编程、条件测试执行的扩展API。

执行条件对每个容器(例如，测试类)进行评估，以确定它包含的所有测试是否应该基于提供的ExtensionContext执行。
类似地，对每个测试执行条件进行评估，以确定是否应该基于提供的ExtensionContext执行给定的测试方法。

当注册了多个执行条件扩展时，一旦其中一个条件返回为禁用状态，就会禁用容器或测试。因此，不能保证对条件进行评估，因为另一个扩展可能已经导致容器或测试被禁用。换句话说，评估工作类似于短路布尔或运算符。

具体示例请参见 [DisabledCondition](https://github.com/junit-team/junit5/blob/r5.2.0/junit-jupiter-engine/src/main/java/org/junit/jupiter/engine/extension/DisabledCondition.java)和@Disabled的源代码。

## 去活化条件(Deactivating Conditions)

有时，运行测试套件而没有激活某些条件是有用的。例如，您可能希望运行测试，即使这些测试是用@禁用的，以便查看它们是否仍然被破坏。
为此，只需为 `junit.jupiter.conditions.deactivate` 配置参数提供一个模式，以指定应该停用哪些条件(例如:对于当前的测试运行，不进行计算。该模式可以作为一个JVM系统属性提供，在LauncherDiscoveryRequest中作为配置参数传递给启动器，或者通过JUnit平台配置文件(参见配置参数获取详细信息)。

例如，要停用JUnit的 `@Disabled` 条件，可以使用以下系统属性启动JVM。

```
-Djunit.jupiter.conditions.deactivate=org.junit.*DisabledCondition
```

### 正则匹配语法

如果 `junit.jupiter.conditions.deactivate` 模式仅由星号(`*`)组成，则所有条件都将被禁用。

否则，模式将用于匹配每个已注册条件的全限定类名(FQCN)。

模式中的任何点(`.`)将与FQCN中的点(`.`)或美元符号(`$`)匹配。
任何星号(`*`)都将与FQCN中的一个或多个字符匹配。模式中的所有其他字符将与FQCN进行一对一匹配。

> 示例

- `*`: 所有情况下禁用

- `org.junit.*`: 禁用 **org.junit** 基本包和它的任何子包。

- `*.MyCondition`: 使简单类名正好为MyCondition的所有条件失效。

- `*System*`: 使简单类名包含System的所有条件失效

- `org.example.MyCondition`: 停用FQCN为org.example.MyCondition的条件。






* any list
{:toc}