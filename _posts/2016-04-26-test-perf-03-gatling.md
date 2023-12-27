---
layout: post
title:  test perf-03-性能测试之 Gatling
date:  2016-04-26 14:10:52 +0800
categories: [Test]
tags: [java, performance, test]
published: true
---


# quick start

**快速入门**

学习 Gatling 的概念，使用录制器创建可运行的 Gatling 仿真。

**介绍**

在这一部分，我们将使用 Gatling 进行负载测试一个简单的云托管的 Web 服务器，并向您介绍 DSL（领域特定语言）的基本要素。

**选择合适的语言**

Gatling 提供了两种主要的 DSL：

1. 自Gatling 3.7版本引入的Java DSL，也可在Kotlin中使用。
2. 最初的Scala DSL。

在选择使用 Gatling 时，我们建议遵循以下规则：

- 如果目标 Gatling 用户是 Scala 开发者，则使用 Scala。
- 如果他们是 Kotlin 开发者，则使用 Kotlin。
- 否则，使用 Java。

Java 在计算机科学课程中被广泛教授，编译时需要较少的 CPU，并且在 Maven 或 Gradle 中更容易配置。

**安装**

请查看安装部分，选择符合您需求的设置。建议非开发人员从捆绑设置开始。在本教程中，我们将展示与捆绑设置一起使用的命令。

**编码**

Gatling 的默认编码是 UTF-8。如果您想使用其他编码，您需要：

- 在使用录制器时选择适当的编码。
- 在 gatling.conf 文件中配置适当的编码。它将用于编译您的仿真、构建您的请求和响应。
- 确保您的文本编辑器编码已正确配置以匹配。

**测试用例**

此页面将引导您了解大多数 Gatling HTTP 功能。您将了解有关仿真、场景、数据源、录制器、循环等的内容。

**示例应用程序**

在本教程中，我们将使用一个名为 "Computer-Database" 的应用程序，部署在以下 URL：http://computer-database.gatling.io。

**场景**

为了测试该应用程序的性能，我们将创建代表用户在导航应用程序时真正发生的场景。

这是我们认为真实用户在应用程序中可能会执行的操作：

1. 用户进入应用程序。
2. 用户搜索 'macbook'。
3. 用户打开其中一个相关型号。
4. 用户返回首页。
5. 用户浏览页面。
6. 用户创建一个新型号。

**基础知识**

**使用录制器**

为了简化场景的创建，我们将使用 Recorder，这是 Gatling 提供的一种工具，允许您记录对 Web 应用程序的操作并将其导出为 Gatling 场景。

可以使用位于 bin 目录中的脚本启动此工具：

在 Linux/Unix 上：
```bash
$GATLING_HOME/bin/recorder.sh
```

在 Windows 上：
```bash
%GATLING_HOME%\bin\recorder.bat
```

一旦启动，以下 GUI 允许您配置如何记录请求和响应。

使用以下选项进行设置：

- Recorder Mode 设置为 HTTP Proxy
- computerdatabase 包
- BasicSimulation 名称
- Follow Redirects? 勾选
- Infer HTML resources? 勾选
- Automatic Referers? 勾选
- Remove cache headers? 勾选
- No static resources 点击
- 选择所需的格式。教程将假定为 "Java 8"

![gatling](https://gatling.io/docs/gatling/tutorials/quickstart/images/recorder.png)

**录制场景**

现在，简单地浏览该应用程序：

1. 输入 'Search' 标签。
2. 转到网站：http://computer-database.gatling.io。
3. 搜索名字中带有 'macbook' 的型号。
4. 选择 'Macbook pro'。
5. 输入 'Browse' 标签。
6. 返回到首页。
7. 通过单击“下一页”按钮，多次遍历模型页面。
8. 输入 'Edit' 标签。
9. 单击“添加新计算机”。
10. 填写表单。
11. 单击“创建此计算机”。

尽量像真实用户一样行动，不要立即从一个页面跳转到另一个页面而不花时间阅读。这将使您的场景更接近真实用户的行为。

当完成场景演练时，在录制器界面上单击“Stop”。

生成的仿真将保存在 Gatling 安装的 user-files/simulations/computerdatabase 文件夹下，文件名为 BasicSimulation.java。

**Gatling 场景解释**

以下是生成的输出：

```java
//package computerdatabase; // 1

// 2
import io.gatling.javaapi.core.*;
import io.gatling.javaapi.http.*;

import static io.gatling.javaapi.core.CoreDsl.*;
import static io.gatling.javaapi.http.HttpDsl.*;

public class BasicSimulationJava extends Simulation { // 3

  HttpProtocolBuilder httpProtocol = http // 4
    .baseUrl("http://computer-database.gatling.io") // 5
    .acceptHeader("text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8") // 6
    .doNotTrackHeader("1")
    .acceptLanguageHeader("en-US,en;q=0.5")
    .acceptEncodingHeader("gzip, deflate")
    .userAgentHeader("Mozilla/5.0 (Windows NT 5.1; rv:31.0) Gecko/20100101 Firefox/31.0");

  ScenarioBuilder scn = scenario("BasicSimulation") // 7
    .exec(http("request_1") // 8
      .get("/")) // 9
    .pause(5); // 10

  {
    setUp( // 11
      scn.injectOpen(atOnceUsers(1)) // 12
    ).protocols(httpProtocol); // 13
  }
}
```

这段代码是 Gatling 生成的仿真场景的源代码，下面是它的主要部分的解释：

1. **可选包：**
   - 这是用于组织代码的可选包声明。

2. **所需导入：**
   - 这是一些必需的导入语句，引入了 Gatling 的相关类和方法。

3. **类声明：**
   - 这里声明了一个类，注意它扩展了 Simulation 类。Simulation 是 Gatling 中用于定义性能测试场景的基类。

4. **HTTP请求的通用配置：**
   - 这一部分包含了所有 HTTP 请求共用的配置，如基本 URL、HTTP 头等。

5. **baseUrl：**
   - 定义了一个将被添加到所有相对 URL 前面的基础 URL。

6. **通用的 HTTP 头：**
   - 这里定义了将随所有请求一起发送的通用 HTTP 头。

7. **场景定义：**
   - 这里开始了测试场景的定义。

8. **HTTP 请求：**
   - 定义了一个名为 "request_1" 的 HTTP 请求，使用 GET 方法，指定了请求的 URL。

9. **暂停/思考时间：**
   - 使用 `pause` 方法添加了一些暂停/思考时间。在 Gatling 中，时间的单位默认为秒。

10. **场景设置：**
    - 这部分设置了将在此仿真中启动的场景。

11. **注入用户：**
    - 使用 `inject` 方法声明将注入一个名为 "scn" 的场景中的单个用户。

12. **附加 HTTP 配置：**
    - 使用 `protocols` 方法将上面声明的 HTTP 配置附加到场景中。

这个代码片段定义了一个简单的 Gatling 场景，包括一个基本的 HTTP 请求和一些暂停时间。

整个场景将模拟用户在应用程序中的一些典型操作。详细了解 Gatling Simulation 结构的更多信息，请查阅 Simulation 参考页面。

**运行 Gatling**

启动位于 bin 目录中的第二个脚本：

在 Linux/Unix 上：
```bash
$GATLING_HOME/bin/gatling.sh
```

在 Windows 上：
```bash
%GATLING_HOME%\bin\gatling.bat
```

您应该看到一个带有以下选择的菜单：

```
Do you want to run the simulation locally, on Gatling Enterprise, or just package it?
Type the number corresponding to your choice and press enter
[0] <Quit>
[1] Run the Simulation locally
[2] Run the Simulation on Gatling Enterprise Cloud
[3] Package the Simulation for Gatling Enterprise
```

输入 `1` 然后按 Enter。

接下来，您将看到一个仿真示例的菜单：

```
Choose a simulation number:
[0] computerdatabase.BasicSimulation
[1] computerdatabase.advanced.AdvancedSimulationStep01
[2] computerdatabase.advanced.AdvancedSimulationStep02
[3] computerdatabase.advanced.AdvancedSimulationStep03
[4] computerdatabase.advanced.AdvancedSimulationStep04
[5] computerdatabase.advanced.AdvancedSimulationStep05
```

输入 `0` 然后按 Enter。在 Gatling 要求输入运行描述时，按 Enter。

当仿真完成时，控制台将显示指向 HTML 报告的链接。

# 进阶学习

[https://gatling.io/docs/gatling/tutorials/advanced/](https://gatling.io/docs/gatling/tutorials/advanced/)

# chat

## 详细介绍下 Gatling

**Gatling** 是一个开源的性能测试工具，主要用于模拟用户行为和评估系统的性能。以下是 Gatling 的一些关键特性和信息：

1. **编写语言：** Gatling 主要使用 Scala 编写，但同时也支持使用 Java DSL（领域特定语言）进行测试脚本编写。这使得熟悉 Scala 或 Java 的测试人员都能够有效地使用 Gatling。

2. **协议支持：** Gatling 最初是为 HTTP 协议设计的，但随着时间的推移，它已经演变成一个多协议性能测试工具。除了 HTTP 和 HTTPS，Gatling 还支持 WebSocket 等协议。

3. **分布式测试：** Gatling 支持分布式测试，允许在多台机器上运行测试以模拟更高的负载。这使得 Gatling 适用于测试大型和高度分布式的应用程序。

4. **DSL 脚本语法：** Gatling 使用自己的 DSL（领域特定语言）来编写测试脚本，这种语法使得脚本编写更加清晰和易于理解。DSL 风格的代码通常被认为更具表达力，特别适合描述模拟用户的场景和行为。

5. **异步和非阻塞：** Gatling 的异步和非阻塞特性使其能够有效地模拟大量并发用户，而不会因等待响应而阻塞。

6. **丰富的报告：** Gatling 生成详细的测试报告，包括性能指标、响应时间分布、错误率等信息。这有助于测试人员和开发人员更好地理解系统的性能表现。

7. **插件系统：** Gatling 提供了丰富的插件系统，允许用户根据需要扩展其功能。这使得可以定制测试以适应不同的测试场景。

8. **支持 CI/CD：** Gatling 可以轻松集成到持续集成和持续交付（CI/CD）流程中，使得性能测试成为软件开发周期的一部分。

总体而言，Gatling 是一个强大而灵活的性能测试工具，特别适用于需要模拟大量并发用户的场景。其DSL语法和丰富的报告功能使得测试脚本编写和结果解读相对容易。

## 深入学习 Gatling，给出资料 包含网址

当你深入学习 Gatling 时，以下是一些建议的学习资源，包括官方文档、教程和社区讨论：

1. **官方文档：**
   - [Gatling 官方文档](https://gatling.io/docs/current/)
     - Gatling 的官方文档是学习 Gatling 的最佳资源。它包含了全面的指南、教程和参考文档，覆盖了从安装到高级脚本编写的方方面面。

2. **官方示例：**
   - [Gatling 官方示例](https://github.com/gatling/gatling-sbt-plugin-demo)
     - 官方提供了一些示例项目，其中包含了各种场景和用例，可以作为学习和参考的良好资源。

3. **视频教程：**
   - [Gatling Fundamentals](https://www.youtube.com/playlist?list=PLPZwlDSScH5dvaDCpyK5Kr_V6NQomLPXJ)
     - 该视频教程涵盖了 Gatling 的基础知识，由 Gatling 官方发布。

4. **博客和文章：**
   - [Gatling Performance Testing: A Quick Overview](https://www.blazemeter.com/blog/gatling-performance-testing-quick-overview)
     - 该博客文章提供了 Gatling 性能测试的快速概述，并包含了一些基本的用例。

5. **GitHub 仓库：**
   - [Gatling GitHub 仓库](https://github.com/gatling/gatling)
     - Gatling 的 GitHub 仓库包含源代码、问题跟踪和社区贡献。你可以通过查看源代码来深入了解 Gatling 的内部工作原理。

6. **社区论坛：**
   - [Gatling 用户论坛](https://groups.google.com/g/gatling)
     - Gatling 的用户论坛是一个社区讨论的地方，你可以在这里提问问题、分享经验，以及与其他 Gatling 用户交流。

7. **Gatling 插件：**
   - [Gatling 插件](https://gatling.io/docs/current/extensions/)
     - Gatling 提供了一些官方插件，可以扩展其功能。了解这些插件可以帮助你更好地定制和扩展你的测试。

通过结合这些资源，你可以建立对 Gatling 的深入理解，并能够有效地使用它进行性能测试。

## 总结一下 gatling 这个工具

理解了，我将从设计思想、发展推广等角度进行总结 Gatling。

1. **设计思想：**
   - **DSL 驱动设计：** Gatling 采用了领域特定语言（DSL）的设计，使测试脚本更具可读性和表达力。DSL 的使用使得用户能够以一种类似于自然语言的方式描述场景和行为。
   - **异步非阻塞：** Gatling 的异步和非阻塞设计允许模拟大量并发用户而不影响性能，从而更真实地反映了现实世界中的用户行为。

2. **发展推广：**
   - **开源社区支持：** Gatling 是一个开源项目，它的发展受到了活跃的开源社区的支持。这促使了不断的改进、更新和功能扩展。
   - **广泛应用：** Gatling 在性能测试领域取得了广泛的应用，特别是在需要模拟大规模并发用户的场景下。它被许多组织、开发者和测试团队选择作为首选性能测试工具之一。
   - **与 CI/CD 集成：** Gatling 的设计使其能够轻松集成到持续集成和持续交付（CI/CD）流程中。这使得性能测试成为软件开发周期的一部分，提高了测试的自动化程度。

3. **特色功能：**
   - **分布式测试：** Gatling 提供了分布式测试的支持，允许在多个节点上运行测试，以模拟更大的负载。
   - **丰富的报告：** Gatling 生成详细的测试报告，包括性能指标、响应时间分布、错误率等信息，有助于快速定位和解决性能问题。
   - **插件系统：** Gatling 提供了插件系统，使用户能够根据需要扩展和定制其功能。

总体而言，Gatling 通过其设计思想、开源社区支持、广泛应用以及与现代软件开发流程的良好集成，成为一个受欢迎的性能测试工具，尤其适用于需要模拟高并发用户的场景。

## 如果让你深入学习 Gatling，你会问哪 10 个问题？

如果我要深入学习 Gatling，我可能会问以下10个问题：

1. **DSL 的设计和使用：**
   - 如何正确使用 Gatling 的 DSL 进行测试脚本编写？
   - DSL 的设计思想是什么，如何利用 DSL 提高脚本的可读性和表达力？

2. **协议支持和配置：**
   - Gatling 支持哪些协议，如何配置和执行不同协议的性能测试？

3. **分布式测试：**
   - 如何设置和执行分布式测试，以模拟更大的负载？
   - 分布式测试的工作原理是什么？

4. **异步和非阻塞特性：**
   - Gatling 的异步和非阻塞特性是如何实现的，它们如何影响测试的性能和效果？

5. **报告和结果分析：**
   - Gatling 生成的报告包含哪些信息，如何解读报告来评估系统性能？
   - 如何在报告中找到性能瓶颈和问题的迹象？

6. **插件系统：**
   - Gatling 的插件系统是如何工作的，如何使用和开发自定义插件？
   - 有哪些常用的插件，它们可以提供什么额外的功能？

7. **与 CI/CD 集成：**
   - 如何将 Gatling 集成到 CI/CD 流程中，实现自动化性能测试？
   - 有没有与流行的 CI/CD 工具（如Jenkins、GitLab CI）的集成指南？

8. **脚本优化和最佳实践：**
   - 有哪些优化测试脚本的最佳实践，以提高性能测试的效率和准确性？
   - 如何处理测试脚本的维护和可维护性问题？

9. **社区参与和支持：**
   - Gatling 的社区是怎样的，如何参与社区讨论和获取支持？
   - 有没有一些社区维护的资源或者示例项目？

10. **安全性和认证：**
    - 如何在 Gatling 中处理安全性和认证方面的测试需求？
    - 有没有特定的配置或技术可以确保测试覆盖系统的安全性方面的考虑？

这些问题涵盖了从基础到高级的多个方面，可以帮助深入理解 Gatling 并更好地应用于性能测试工作。

# 参考资料

https://gatling.io/docs/gatling/tutorials/quickstart/


* any list
{:toc}