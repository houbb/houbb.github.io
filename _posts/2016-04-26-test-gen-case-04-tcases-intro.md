---
layout: post
title: test-04-test case generate 测试用例生成 tcases A model-based test case generator
date:  2016-4-26 12:53:12 +0800
categories: [Test]
tags: [junit, test, generate]
published: true
---

# 拓展阅读

> [junit5 系列](https://houbb.github.io/2018/06/24/junit5-01-hello)

> [基于 junit5 实现 junitperf 源码分析](https://houbb.github.io/2021/07/23/junit-performance-junit5)

[Auto generate mock data for java test.(便于 Java 测试自动生成对象信息)](https://github.com/houbb/data-factory)

[Junit performance rely on junit5 and jdk8+.(java 性能测试框架。性能测试。压测。测试报告生成。)](https://github.com/houbb/junitperf)

[自动生成测试用例](https://github.com/houbb/evosuite-learn)


# Tcases：基于模型的测试用例生成器 #

## 新特性 ##
  * 最新版本 ([Tcases 4.0.2](ReleaseNotes.md#402)) 现在已在Maven Central Repository中提供。
    请查看 [*如何下载 Tcases*](HowToDownload.md) 获取下载指南。

  * 在使用 Tcases 时遇到问题？查看[这些提示](./Troubleshooting-FAQs.md)。

  * 有问题需要咨询？需要一些建议？开始一个[讨论](https://github.com/Cornutum/tcases/discussions)。

## 它是做什么的？ ##

Tcases是一个设计测试的工具。无论你正在测试什么类型的系统 —— 是 UI、命令行，还是[RESTful API](tcases-openapi/README.md#tcases-for-openapi-from-rest-ful-to-test-ful)，又或者是后端。也无论你正在测试系统的哪个级别 —— 单元、子系统，或者是完整系统。你都可以使用Tcases在任何这些情况下设计你的测试。使用Tcases，你定义系统被测系统的输入空间以及你想要的覆盖级别。然后，Tcases生成一个最小的满足你要求的测试用例集。

Tcases 主要是一个用于黑盒测试设计的工具。对于这样的测试，"覆盖" 的概念与结构测试标准（如行覆盖、分支覆盖等）是不同的。相反，Tcases 是根据系统输入空间的覆盖来指导的。

Tcases 提供了一种以简洁而全面的形式定义系统输入空间的方法。然后，Tcases 允许你通过指定想要的覆盖级别来控制你的样本子集中的测试用例数量。你可以从基本覆盖级别开始，Tcases 将生成一小组测试用例，涵盖输入空间的每个重要元素。然后，你可以通过有选择地在特定高风险区域添加覆盖来改进你的测试。例如，你可以指定对所选输入变量的成对覆盖或更高阶的组合。

## 它是如何工作的？ ##

首先，你创建一个系统输入定义，这是一个将系统定义为一组功能的文档。对于每个系统功能，系统输入定义定义了表征函数输入空间的变量。如果你正在测试 Web 服务 API，甚至可以[自动生成系统输入定义](tcases-openapi/README.md#tcases-for-openapi-from-rest-ful-to-test-ful)
从 OpenAPI 定义。

然后，你可以创建一个生成器定义。这是另一份定义了每个系统功能所需覆盖的文档。生成器定义是可选的。你可以跳过此步骤，仍然获得基本的覆盖级别。

最后，你运行 Tcases。Tcases 是一个 Java 程序，你可以从命令行运行，也可以使用
[Tcases Maven 插件](http://www.cornutum.org/tcases/docs/tcases-maven-plugin/)。Tcases 的命令行版本带有内置的
支持，可以使用一个 shell 脚本或 ant 目标来运行。使用你的输入定义和生成器定义，Tcases 生成一个系统测试定义。系统测试定义是一份文档，列出了每个系统功能的一组测试用例，提供了指定级别的覆盖。每个测试用例为每个函数输入变量定义了特定的值。Tcases 不仅生成定义成功测试用例的有效输入值，还为需要验证预期错误处理的测试用例生成无效值。

当然，系统测试定义不是你可以直接执行的东西。（除非它是
[从 OpenAPI 定义自动派生的](tcases-openapi/README.md#how-do-you-run-generated-api-test-cases)！）
但它遵循一个明确定义的架构，这意味着你可以使用各种转换工具将其转换为适合测试系统的形式。例如，Tcases 带有一个内置的转换器，将系统测试定义转换为 JUnit 或 TestNG 测试类的 Java 源代码模板。

## 入门指南 ##

  * **简介**
    * [Tcases：完整指南](https://github.com/Cornutum/tcases/blob/master/Tcases-Guide.md#tcases-the-complete-guide)
    * [Tcases for OpenAPI](tcases-openapi/README.md#tcases-for-openapi-from-rest-ful-to-test-ful): 测试 RESTful API？直接从你的 OpenAPI v3 定义中生成测试用例。
    * [Tcases Maven 插件](http://www.cornutum.org/tcases/docs/tcases-maven-plugin/)

  * **有用的指南**
    * [如何使用 Maven 下载](https://github.com/Cornutum/tcases/blob/master/HowToDownload.md)
    * [如何设置 Tcases Web 服务](https://github.com/Cornutum/tcases/blob/master//Tcases-Web-Service.md)
    * [使用 Tcases API](https://github.com/Cornutum/tcases/blob/master//Using-Tcases-API.md)
    * [故障排除 FAQ](https://github.com/Cornutum/tcases/blob/master//Troubleshooting-FAQs.md#troubleshooting-faqs)
    * [发布说明](https://github.com/Cornutum/tcases/blob/master/ReleaseNotes.md)

  * **更多信息**
    * [使用 Tcases 进行模型驱动测试](ModelDrivenTestingForAgileTeams.md)
    * Javadoc：[Tcases API](http://www.cornutum.org/tcases/docs/api/index.html)

## 贡献者 ##

感谢以下人员对 Tcases 做出的重大改进。

  * [Kerry Kimbrough](https://github.com/kerrykimbrough)（项目创始人）
  * [Juglar](https://github.com/juglar)
  * [Thibault Kruse](https://github.com/tkruse)

  

# chat

## 详细介绍一下 Tcases

截至我知识截止日期（2022年1月），我了解到Tcases是一种用于测试用例生成的开源工具，它主要用于对软件系统进行功能测试。Tcases专注于生成高效、全面、可重复的测试用例，以覆盖系统的各个方面。

以下是Tcases的一些主要特点和概念：

1. **模型驱动：** Tcases采用模型驱动的方法，用户首先定义系统的输入和输出模型，然后Tcases使用这些模型来生成测试用例。这有助于确保生成的测试用例与系统规格一致。

2. **输入空间划分：** Tcases使用输入空间划分的概念，将系统的输入空间划分为等价类，以确保测试用例能够覆盖不同的输入情况。

3. **基于约束的生成：** Tcases可以通过应用用户定义的约束条件来生成测试用例。这有助于在生成测试用例时考虑特定的限制和条件。

4. **可配置性：** Tcases允许用户配置生成测试用例的各个方面，包括输入模型、约束条件、生成算法等。这使得工具更加灵活，能够适应不同项目和测试需求。

5. **输出格式：** 生成的测试用例可以以不同的格式输出，例如文本、XML等。这有助于集成Tcases生成的测试用例到不同的测试框架或工具中。

6. **命令行界面：** Tcases通常提供命令行界面，使其易于集成到自动化测试流程中，并能够方便地在命令行中配置和执行测试用例生成。

请注意，Tcases可能在我知识截止日期之后有了新的发展，因此建议查阅Tcases的官方文档或相关资源，以获取最新的信息和详细的用法说明。

## 解释一下什么事模型驱动？

模型驱动是一种软件开发和测试的方法，其中系统的行为和功能通过模型来描述和驱动。这些模型可以是抽象的、形式化的表示，通常用于捕捉系统的关键方面，例如输入、输出、状态、约束等。模型驱动方法的主要目标是使用模型来指导系统的设计、实现和测试。

以下是模型驱动方法的一些关键概念和特点：

1. **抽象表示：** 模型驱动方法使用抽象表示来描述系统的关键方面，而不是通过具体的代码实现。这种抽象使得模型能够更清晰地表达系统的本质，同时允许在不同抽象级别上工作。

2. **规范性：** 模型通常是规范性的，即它们描述系统应该如何行为，而不是如何实现。这有助于提高系统设计的灵活性和可维护性。

3. **自动化：** 模型驱动方法通常涉及使用工具和自动化技术，以便根据模型生成实际的代码、测试用例等。这有助于降低开发和测试的成本，并减少人为错误的可能性。

4. **一致性：** 由于模型是规范性的，可以确保系统的设计和实现与模型一致。这有助于减少在不同阶段之间产生的不一致性和误解。

5. **变更管理：** 通过修改模型而不是直接修改代码，可以更容易地管理系统的变更。模型可以被视为系统的单一源头，以确保变更的一致性和可控性。

在软件测试领域，模型驱动测试通常涉及使用测试模型来指导测试用例的生成和执行。这有助于确保测试覆盖系统的各个方面，包括边界情况、不同的输入组合等。

总体而言，模型驱动是一种注重抽象和规范性的方法，旨在提高软件开发和测试的效率、一致性和可维护性。

# 参考资料

https://github.com/EvoSuite/evosuite

https://www.evosuite.org/documentation/maven-plugin/

https://randoop.github.io/randoop/manual/index.html

* any list
{:toc}