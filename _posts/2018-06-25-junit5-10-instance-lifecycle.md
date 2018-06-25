---
layout: post
title:  Junit5-10-Test Instance Lifecycle
date:  2018-06-25 16:53:21 +0800
categories: [Test]
tags: [test, sh]
published: true
---

# 测试实例生命周期

为了让单独的测试方法在隔离中执行，并且为了避免由于可变测试实例状态而产生的意外副作用，
JUnit在执行每个测试方法之前**创建了一个新的测试类的实例**。
这种“每个方法”的测试实例生命周期是JUnit Jupiter中的默认行为，类似于JUnit的所有以前版本。

如果您希望JUnit Jupiter在同一个测试实例上执行所有的测试方法，只需使用@TestInstance(Lifecycle.PER_CLASS)注释您的测试类。当使用此模式时，每个测试类将创建一个新的测试实例。因此，如果您的测试方法依赖于实例变量中存储的状态，您可能需要在@BeforeEach或@AfterEach方法中重置该状态。

“每个类”模式比默认的“每个方法”模式有一些额外的好处。
具体来说，通过“每个类”模式，可以在非静态方法和接口默认方法上声明@BeforeAll和@AfterAll。
因此，“每个类”模式也使得@BeforeAll和@AfterAll方法可以在@嵌套测试类中使用。

如果您正在使用 Kotlin 编程语言编写测试，您可能还会发现通过切换到“每个类”测试实例生命周期模式来实现@BeforeAll和@AfterAll方法更容易。

> 注意

如果给定的测试方法通过条件(例如，`@Disabled`， `@DisabledOnOs`等)被禁用，
即使“per-method”测试实例生命周期模式是活动的，测试类仍然会被实例化。

# 修改默认的生命周期

如果测试类或测试接口没有使用 `@TestInstance` 注释，JUnit Jupiter将使用默认的生命周期模式。
标准的默认模式是PER_METHOD;但是，可以更改整个测试计划执行的默认值。要更改默认的测试实例生命周期模式，
只需将 `junit.jupiter.testinstance.lifecycle.default` 配置参数设置为TestInstance中定义的枚举常量的名称。

生命周期,忽略的情况。可以将其作为JVM系统属性提供，作为传递给启动程序的LauncherDiscoveryRequest中的配置参数，或者通过JUnit平台配置文件(详细信息请参见配置参数)。

例如，将默认的测试实例生命周期模式设置为生命周期。PER_CLASS，您可以使用以下系统属性启动JVM。

```
-Djunit.jupiter.testinstance.lifecycle.default = per_class
```

但是，请注意，通过JUnit平台配置文件设置默认测试实例生命周期模式是一种更健壮的解决方案，因为配置文件可以连同项目一起检入版本控制系统，因此可以在ide和构建软件中使用。

将默认的测试实例生命周期模式设置为生命周期。
PER_CLASS通过JUnit平台配置文件，创建一个名为JUnit平台的文件。类路径的根属性(如src/test/resources)，包含以下内容。

```
junit.jupiter.testinstance.lifecycle.default = per_class
```

更改默认的测试实例生命周期模式可能导致不可预测的结果和脆弱的构建，如果不一致地应用的话。
例如，如果构建将“每个类”语义配置为默认的，但是IDE中的测试是使用“每个方法”语义执行的，那么就很难调试构建服务器上发生的错误。
因此，**建议更改JUnit平台配置文件中的默认值，而不是通过JVM系统属性**。


* any list
{:toc}







