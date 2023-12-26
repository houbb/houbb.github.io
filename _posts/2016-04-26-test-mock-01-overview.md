---
layout: post
title: test mock-01-什么是 mock? Mockito/EasyMock/PowerMock/JMockit/Spock mock 框架对比
date:  2016-4-26 12:53:12 +0800
categories: [Test]
tags: [test, mock, sh]
published: true
---

# 拓展阅读

[test 之 jmockit-01-overview](https://houbb.github.io/2023/05/09/test-jmockit-01-overview)

[jmockit-01-test 之 jmockit 入门使用案例](https://houbb.github.io/2023/05/09/test-jmockit-00-intro)

[mockito-01-overview mockito 简介及入门使用](https://houbb.github.io/2023/05/09/test-mockito-01-overview)

[PowerMock](https://houbb.github.io/2017/10/27/powermock)

[Mock Server](https://houbb.github.io/2017/11/03/mock-server)

[ChaosBlade-01-测试混沌工程平台整体介绍](https://houbb.github.io/2023/08/08/jvm-chaosblade-01-overview)

[jvm-sandbox 入门简介](https://houbb.github.io/2020/06/04/jvm-sandbox-00-overview)

# chat

## 谈一谈单元测试中的 mock

在软件开发中，单元测试是一种验证代码单元（通常是函数或方法）是否按照预期工作的测试方法。

而在进行单元测试时，经常会用到一种称为 "mock" 的技术。

Mock 是一种模拟或替代真实对象的方法，目的是在测试过程中隔离被测代码，以确保测试的是被测代码本身，而不是其依赖的外部组件。

以下是关于单元测试中的 mock 的一些重要概念和用法：

## java 有哪些 mock 开源框架？

在Java领域，有多个开源的Mock框架可用于单元测试和集成测试，以下是其中一些常用的Java Mock框架：

1. **Mockito:**
   - Mockito 是一个流行的Java Mock框架，提供了简单易用的API，用于创建Mock对象、模拟方法调用和验证行为。
   - 它支持验证方法的调用次数、参数匹配等，而且语法清晰，广泛应用于Java单元测试。

2. **EasyMock:**
   - EasyMock 是另一个Java Mock框架，用于模拟对象和验证方法的调用。
   - 它使用比较简洁的语法，并支持创建Mock对象、设置期望值、验证调用等功能。

3. **PowerMock:**
   - PowerMock 扩展了Mockito和EasyMock，提供了更强大的功能，例如可以模拟静态方法、构造函数、私有方法等。
   - PowerMock 在一些复杂的测试场景中非常有用，但需要小心使用，以免导致测试变得复杂和脆弱。

4. **JMockit:**
   - JMockit 是一个功能强大的Java测试工具，它可以用于Mocking和Stubbing，支持对私有方法、构造函数、静态方法等的模拟。
   - 它还提供了对测试框架的集成支持，如JUnit和TestNG。

5. **Spock:**
   - Spock 不仅是一个Mock框架，还是一个基于Groovy语言的测试框架。它结合了JUnit和Mockito的特性，提供了一种优雅而强大的测试语法。
   - Spock支持数据驱动测试、交互式的断言语法以及灵活的Mocking功能。

6. **JMock:**
   - JMock 是一个早期的Mock框架，虽然现在使用较少，但仍然是一个可选项。它支持创建Mock对象、设置期望行为等。

这些框架在Mocking方面有各自的优势和语法风格，选择适合项目和团队需求的框架是很重要的。 

Mockito 和 EasyMock 是两个较为流行和广泛使用的框架，而PowerMock和JMockit在一些特殊场景中可能更为适用。

Spock 则适用于那些喜欢Groovy语法或者希望利用其特有功能的团队。

## 给出上述的 mock 框架对比表格

下面是一些常见的Java Mock框架的对比，包括Mockito、EasyMock、PowerMock、JMockit和Spock。请注意，这些信息可能在未来有所变化，建议查看各框架的官方文档获取最新信息。

| 功能/特性            | Mockito                                       | EasyMock                                      | PowerMock                                    | JMockit                                     | Spock                                      |
|-----------------------|-----------------------------------------------|-----------------------------------------------|----------------------------------------------|---------------------------------------------|--------------------------------------------|
| 创建 Mock 对象         | ✔                                             | ✔                                             | ✔                                            | ✔                                           | ✔ (Groovy 语法)                             |
| 设置方法的期望行为    | ✔                                             | ✔                                             | ✔                                            | ✔                                           | ✔                                           |
| 参数匹配              | ✔                                             | ✔                                             | ✔                                            | ✔                                           | ✔                                           |
| 验证方法调用次数      | ✔                                             | ✔                                             | ✔                                            | ✔                                           | ✔                                           |
| 模拟静态方法          | ✘ (通过 PowerMock)                            | ✘ (通过 PowerMock)                            | ✔                                            | ✔                                           | ✘                                          |
| 模拟构造函数          | ✘ (通过 PowerMock)                            | ✘ (通过 PowerMock)                            | ✔                                            | ✔                                           | ✘                                          |
| 模拟私有方法          | ✘ (通过 PowerMock)                            | ✘ (通过 PowerMock)                            | ✔                                            | ✔                                           | ✘                                          |
| 模拟 final 类         | ✘ (通过 PowerMock)                            | ✘ (通过 PowerMock)                            | ✔                                            | ✔                                           | ✘                                          |
| 数据驱动测试          | ✘                                             | ✘                                             | ✘                                           | ✔                                           | ✔                                           |
| 支持异步测试          | ✘                                             | ✘                                             | ✘                                           | ✔                                           | ✔                                           |
| 对测试框架的集成支持  | ✔ (JUnit, TestNG)                             | ✔ (JUnit, TestNG)                             | ✔ (JUnit, TestNG)                            | ✔ (JUnit, TestNG)                            | ✔ (JUnit, TestNG)                           |
| 支持 Groovy 语法      | ✘                                             | ✘                                             | ✘                                           | ✘                                           | ✔                                           |

请注意，PowerMock 通常与其他Mock框架（如 Mockito 和 EasyMock）一起使用，以提供一些额外的功能，如模拟静态方法、构造函数等。


### 1. **什么是 Mock 对象？**
Mock 对象是一种模拟对象，用于替代真实对象，以便在测试中模拟对象的行为。

Mock 对象可以被配置为模拟特定的方法调用，并返回预定的结果。

### 2. **为什么使用 Mock？**
   - **隔离测试单元：** 通过使用 Mock 对象，可以隔离被测代码，确保测试只关注当前单元而不受其他组件的影响。
   - **模拟外部依赖：** 当被测代码依赖于外部服务、数据库或其他组件时，使用 Mock 对象可以模拟这些依赖的行为，而无需实际访问这些外部资源。

### 3. **Mock 框架的使用：**
   - **Python 中的 unittest.mock 模块：** 在 Python 中，`unittest.mock` 模块提供了创建 Mock 对象的功能。你可以使用 `Mock` 类创建一个模拟对象，并使用各种方法配置它的行为。
   ```python
   from unittest.mock import Mock

   # 创建一个 Mock 对象
   my_mock = Mock()

   # 配置 Mock 对象的行为
   my_mock.some_method.return_value = 42

   # 使用 Mock 对象
   result = my_mock.some_method()
   assert result == 42
   ```

   - **其他语言的 Mock 框架：** 不同的编程语言有各种 Mock 框架，如 Java 的 Mockito、JavaScript 的 Sinon.js 等，它们提供类似的功能来模拟对象和控制其行为。

### 4. **Mock 的应用场景：**
   - **模拟函数调用：** 当被测代码调用外部函数或方法时，可以使用 Mock 对象模拟这些调用，以便更好地控制测试环境。
   - **模拟网络请求：** 在测试中，通常希望避免实际发起网络请求。使用 Mock 对象可以模拟网络请求的返回结果，使测试更可控。
   - **模拟数据库访问：** 在单元测试中，避免直接访问真实数据库，而是使用 Mock 对象模拟数据库访问，确保测试的独立性。

### 5. **Mock 与 Stub 的区别：**
   - **Mock 是一种更强大的概念：** Mock 可以模拟对象的行为，包括对方法的调用和返回值的设置。Stub通常只关注返回值。
   - **Stub 可以看作是 Mock 的一种形式：** Mock 对象可以被配置为 Stub，即只关注模拟方法的返回值，而不检查方法的调用情况。

使用 Mock 的关键在于灵活配置和运用，以确保测试的可靠性和独立性。

然而，要注意不要过度使用 Mock，以免导致测试变得脆弱且难以维护。



因此，某些功能可能需要 PowerMock 的支持才能实现。

选择合适的Mock框架取决于项目需求、团队经验和个人偏好。 Mockito 和 EasyMock 是两个非常流行和广泛使用的框架，而 PowerMock 和 JMockit 则在某些特殊场景中更为适用。 

Spock 提供了一种不同的测试语法，特别适合那些喜欢Groovy语法或者希望利用其特有功能的团队。

## 详细对比一下  PowerMock、JMockit。二者的差一点，设计理念。如果我是一个 java 开发团队，应该选择哪一个？

PowerMock和JMockit都是Java领域常用的Mock框架，它们在一些方面有相似之处，但在设计理念和使用方式上存在差异。以下是对PowerMock和JMockit的详细对比：

### PowerMock:

1. **设计理念：**
   - PowerMock的设计目标之一是为了解决Java语言的限制，例如无法直接模拟final类、静态方法、私有方法等。
   - PowerMock使用字节码操作来实现对这些限制的突破，允许在测试中模拟这些通常难以测试的场景。

2. **特点和优势：**
   - 支持模拟静态方法、构造函数、私有方法、final类等。
   - 能够与其他Mock框架（如Mockito、EasyMock）结合使用，提供更多的功能。
   - 在某些复杂场景下，PowerMock是唯一能够胜任的框架。

3. **缺点和注意事项：**
   - 使用字节码操作可能导致一些不可预测的问题，需要小心使用。
   - 部分开发者认为PowerMock的语法较为冗长，可能增加测试代码的复杂性。
   - 不太适合初学者，可能需要花费一些时间来理解和配置。

### JMockit:

1. **设计理念：**
   - JMockit的设计目标之一是提供一种简单而强大的方式来进行Mocking和Stubbing，同时避免使用字节码操作。
   - 通过使用Java的Instrumentation API，JMockit能够在运行时修改字节码，实现对方法的Mock。

2. **特点和优势：**
   - 支持模拟静态方法、构造函数、final类等，而且不需要PowerMock的字节码操作。
   - 语法相对简单，易于上手，对于初学者友好。
   - 提供了丰富的功能，包括Mocking、Stubbing、验证调用等。

3. **缺点和注意事项：**
   - 在一些极端场景下，可能无法满足PowerMock的一些高级需求。
   - 需要在JVM启动时使用 `-javaagent` 参数，这可能会影响一些特定环境下的使用。

### 如何选择：

1. **项目需求：** 如果你的项目需要模拟静态方法、构造函数、私有方法等，且有复杂的测试场景，PowerMock可能更适合。
   
2. **简单性和上手难度：** 如果团队中有初学者或者更注重简洁的语法，JMockit可能是更好的选择。

3. **维护性：** PowerMock的高级功能可能增加测试代码的复杂性，需要确保团队对其有足够的理解和经验。JMockit在某些场景下可能更易于维护。

4. **社区支持和更新频率：** 查看框架的社区活跃度、文档质量以及最近的更新情况，这些因素都对选择具有影响。

总体而言，两者都是强大的工具，选择取决于项目的具体需求、团队的经验水平以及个人偏好。

在实际使用过程中，可以考虑在小范围内试用并评估框架的适用性。

## jmockit 不需要像 powermock 那样使用字节码操作？那是如何实现的？

是的，JMockit 确实不需要像 PowerMock 那样使用显式的字节码操作。

JMockit 通过 Java 的 Instrumentation API 来实现对字节码的修改，从而达到Mocking的目的。

下面是JMockit的一些基本原理：

1. **Instrumentation API：** Java的 `java.lang.instrument` 包提供了 Instrumentation API，它允许在类被加载进JVM时进行字节码的修改。JMockit 利用这个API，将自己的类加载器注册到JVM中，并在类加载的过程中实时修改字节码。

2. **预置 Mock 代码：** JMockit 在运行时会预先加载一些与Mock相关的代码，这些代码包含了对被测类的Mock行为。当被测类被加载时，JMockit会检查是否有相关的Mock代码需要插入，如果有，就会进行字节码修改。

3. **运行时注入：** JMockit 利用 Instrumentation API 在类加载的时候注入Mock代码。这意味着，当测试运行时，被测类的字节码会被动态修改，以包含所需的Mock行为。

4. **支持各种Mock操作：** JMockit 能够支持模拟静态方法、实例方法、构造函数，以及对 final 类和 final 方法的 Mock。它还提供了丰富的API，可以在测试中配置 Mock 对象的行为。

这种动态字节码修改的方式让 JMockit 能够不依赖于显式的字节码操作，使得测试用例的编写更加方便。不过，这也需要在JVM启动时使用 `-javaagent` 参数，以指定 JMockit 的代理（Agent）。

总体来说，JMockit 的设计思想是利用 Java 的 Instrumentation API 在运行时对字节码进行修改，从而实现对各种类型的 Mock 的支持。

这种方式相较于显式的字节码操作，更易于使用和理解。

PS: 原理上是一样的，都需要通过修改字节码的方式，达到修改代码的逻辑。

## 有哪些场景是 jmockit 能做不到，但是 powermock 能做到的？

尽管 JMockit 和 PowerMock 都是用于 Java 测试的强大工具，但由于它们的设计理念和实现方式不同，存在一些场景 PowerMock 可能更适合。

以下是一些 JMockit 可能无法胜任，但 PowerMock 能够胜任的场景：

1. **模拟静态初始化块：** 如果被测类包含静态初始化块（static initializer block），JMockit 可能无法成功模拟这些块的行为。PowerMock 可以通过对静态构造函数和静态方法的模拟来处理这类情况。

2. **模拟私有构造函数：** 在某些情况下，如果被测类的构造函数是私有的，JMockit 可能无法成功模拟这些私有构造函数。PowerMock 可以通过对私有构造函数的模拟来解决这个问题。

3. **模拟 final 类的方法：** JMockit 提供了 `@Mocked` 注解来模拟 final 类，但这种方式可能会有一些限制，而 PowerMock 可以通过对 final 类的字节码修改来实现对 final 类方法的模拟。

4. **模拟 final 方法：** PowerMock 具有能够模拟 final 方法的能力，而 JMockit 对 final 方法的模拟也存在一些限制。

5. **Mock 私有方法：** PowerMock 具有能够模拟私有方法的能力，而 JMockit 对私有方法的模拟可能需要通过一些特殊的技巧实现。

6. **Mock 构造函数的参数：** PowerMock 具有能够模拟构造函数参数的能力，而 JMockit 可能在某些情况下无法对构造函数的参数进行准确的模拟。

需要注意的是，PowerMock 对字节码的直接操作可能使得测试代码变得复杂，而且在一些场景下可能导致不稳定的行为。

因此，使用 PowerMock 时需要谨慎，确保真的需要它提供的高级特性，而不是简单的Mock功能。

在实际选择中，可以根据项目的具体需求和复杂性来决定使用 JMockit 还是 PowerMock。

## chaosblade 混沌工程知道吗？

ChaosBlade 是一种混沌工程（Chaos Engineering）工具，旨在帮助开发人员和运维团队在生产环境中引入故障、模拟异常条件，以测试系统的稳定性和可靠性。

以下是 ChaosBlade 的一些关键特点和用法：

1. **故障注入：** ChaosBlade 允许用户在运行时注入各种故障，如延迟、异常、丢包等，以模拟现实世界中可能发生的故障情况。

2. **丰富的场景支持：** 支持的故障场景包括网络故障、磁盘故障、进程挂起、时钟偏移等，覆盖了多种系统组件。

3. **跨平台：** ChaosBlade 支持多种操作系统和容器化环境，如 Linux、Windows、Docker、Kubernetes 等。

4. **可扩展性：** 提供了插件机制，用户可以根据自己的需求定制故障注入场景。

5. **监控和度量：** ChaosBlade 可以与监控系统集成，帮助用户在注入故障后监测系统的性能和行为。

6. **开源社区：** ChaosBlade 是一个开源项目，有一个活跃的社区，用户可以参与其中，共同推动工具的发展。

混沌工程的理念是通过在生产环境中主动引入故障，了解系统在面临各种异常情况时的表现，以便更好地改进系统的设计和可用性。

ChaosBlade 是这一理念的一个实际工具，有助于团队更好地了解和提高系统的弹性。

## 有哪些类似于 ChaosBlade 这种开箱即用的 mock 开源服务？

ChaosBlade 是一个混沌工程工具，而在 mock 方面，有一些开箱即用的开源工具和服务可用于模拟和测试系统的各种场景。

以下是一些类似于 ChaosBlade 的 mock 工具：

1. **Mockito:**
   - Mockito 是一个功能强大的 Java Mock 框架，提供了简单而清晰的 API，用于创建 Mock 对象、模拟方法调用和验证行为。它广泛用于单元测试。

2. **EasyMock:**
   - EasyMock 是另一个 Java Mock 框架，与 Mockito 类似，用于模拟对象和验证方法的调用。它提供了一些不同的语法和功能，可以根据团队的偏好选择使用。

3. **WireMock:**
   - WireMock 是一个 HTTP Mock 服务，可以用于模拟 RESTful API 的行为。它支持定义模拟服务的期望和响应，以便测试客户端与服务的交互。

4. **Pact:**
   - Pact 是一个用于消费者与提供者之间的契约测试的工具。它允许定义消费者的期望和提供者的实际行为，并确保它们之间的契约得到满足。

5. **Mountebank:**
   - Mountebank 是一个多协议的服务虚拟化工具，可以用于模拟和测试微服务架构中的各种场景。它支持 HTTP、TCP、SMTP 等协议。

6. **Hoverfly:**
   - Hoverfly 是一个用于服务虚拟化和模拟的工具，特别适用于微服务和分布式系统的测试。它可以记录和回放服务之间的交互，并支持创建模拟服务。

这些工具提供了各种功能，从模拟 HTTP 请求到模拟对象的行为，以满足不同测试场景的需求。选择工具时，可以根据具体的使用场景、语言偏好和团队经验来进行评估。

## 有哪些类似于 ChaosBlade 这种开箱即用的 mock 开源服务？要求必须是 java 语言

在 Java 语言中，有一些类似于 ChaosBlade 的开箱即用的 Mock 工具或服务，用于模拟和测试系统的各种场景。以下是一些 Java Mock 工具：

1. **Mockito:**
   - Mockito 是一个流行的 Java Mock 框架，提供了简单而强大的 API，用于创建 Mock 对象、模拟方法调用和验证行为。它是一个开箱即用的工具，广泛应用于单元测试。

2. **EasyMock:**
   - EasyMock 是另一个 Java Mock 框架，与 Mockito 类似，用于模拟对象和验证方法的调用。它提供了一些不同的语法和功能，可以根据团队的偏好选择使用。

3. **JMockit:**
   - JMockit 是一个强大的 Java 测试工具，它可以用于 Mocking 和 Stubbing。它支持模拟静态方法、实例方法、构造函数等，并具有比较简单的语法。

4. **PowerMock:**
   - PowerMock 是一个扩展 Mockito 和 EasyMock 的框架，提供了更多高级功能，如模拟静态方法、构造函数、私有方法等。它可以与其他 Mock 框架一起使用，以提供更多功能。

5. **WireMock:**
   - WireMock 是一个 HTTP Mock 服务，用于模拟 RESTful API 的行为。它可以在测试中模拟 HTTP 请求和响应，并支持灵活的配置。

6. **Hoverfly Java:**
   - Hoverfly Java 是 Hoverfly 的 Java 版本，用于服务虚拟化和模拟。它可以记录和回放服务之间的交互，并支持创建模拟服务。

这些工具都是在 Java 中进行 Mocking 的流行框架，可以根据具体的需求和项目要求选择合适的工具。

Mockito 和 EasyMock 是两个简单易用的框架，而 JMockit 和 PowerMock 提供了更多高级的 Mocking 功能。

WireMock 和 Hoverfly Java 则专注于模拟服务的行为。

## wiremock 和 Hoverfly 都是 java 中模拟 http 服务的，有模拟 rpc 服务的开源服务吗？

是的，有一些开源工具可以用于模拟 RPC（Remote Procedure Call）服务。

这些工具可以帮助您在开发和测试过程中模拟远程服务的行为。

以下是一些常见的开源工具：

1. **MockServer:**
   - **语言:** Java
   - **简介:** MockServer 是一个用于模拟和测试 HTTP、HTTPS、SMTP、TCP 和 UDP 的服务器的开源工具。它可以在测试中用作模拟 RPC 服务的选择。

2. **WireMock:**
   - **语言:** Java
   - **简介:** 除了模拟 HTTP 和 HTTPS 服务，WireMock 也可以用于模拟和测试其他协议，包括基于 HTTP 的 RPC。它具有灵活的 DSL（领域专用语言），可用于定义模拟服务的规则。

3. **Hoverfly:**
   - **语言:** Java
   - **简介:** Hoverfly 不仅可以模拟 HTTP 服务，还支持模拟 TCP 和 UDP。这使得它可以用于模拟基于这些协议的 RPC 服务。

4. **Mountebank:**
   - **语言:** Node.js
   - **简介:** Mountebank 是一个跨平台的服务虚拟化工具，可以用于模拟 HTTP、HTTPS、TCP 和 SMTP。它使用类似于 WireMock 的配置文件来定义模拟服务。

这些工具可以帮助您在开发和测试过程中隔离和模拟 RPC 服务，以确保系统的各个部分可以正确地集成和工作。

选择适合您需求的工具取决于您的项目要求、技术栈和个人偏好。

# 参考资料


* any list
{:toc}
