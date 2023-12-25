---
layout: post
title: test mock-03-wiremock 模拟 HTTP 服务的开源工具 flexible and open source API mocking
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

# wiremock

WireMock是一个流行的开源工具，用于API模拟测试，每月下载量超过500万次。它可以帮助您创建稳定的测试和开发环境，隔离与不稳定的第三方服务的依赖，并模拟尚不存在的API。

WireMock于2011年由Tom Akehurst作为Java库启动，现在已经涵盖多种编程语言和技术栈。

它可以作为库或客户端包装器在许多语言中运行，也可以作为独立的服务器运行。项目及其生态系统背后有一个庞大的社区。

WireMock支持多种创建模拟API的方法 - 在代码中、通过其REST API、作为JSON文件以及通过记录代理到另一个目标的HTTP流量。

WireMock具有丰富的匹配系统，允许将传入请求的任何部分与复杂和精确的条件进行匹配。

通过基于Handlebars的模板系统，可以动态生成任何复杂度的响应。

最后，由于其众多的扩展点和全面的API，WireMock易于集成到任何工作流程中。

## 关键特性

WireMock可以在单元测试中运行，也可以作为独立进程或容器运行。

其关键特性包括：

- 可通过URL、头部和正文内容模式进行HTTP响应存根匹配
- 支持通过流畅的Java API、JSON文件和HTTP传输的JSON进行配置
- 存根的录制和回放
- 请求验证
- 故障和响应延迟注入
- 按请求的条件代理
- 用于请求检查和替换的浏览器代理
- 具有状态的行为模拟
- 可扩展性

## WireMock生态系统

WireMock具有针对其他语言和测试框架的实现和适配器。它支持多种技术栈的适配器和实现，包括Python、.NET、Golang和Rust。

对于JVM生态系统，有适用于Spring Boot、Quarkus、Kotlin、Testcontainers等的库。

WireMock还可以在Android支持上运行，并即将提供官方的gRPC和GraphQL适配器。

# 快速入门：使用Java和JUnit 4进行API模拟

在本指南中，我们将使用WireMock和JUnit 4编写API单元测试。

## 先决条件

- Java 11或17
- Maven或Gradle，使用最新版本
- 一个基于Maven和Gradle的Java项目
- 一个我们将用作演练场的单元测试文件

## 将WireMock依赖项添加到您的项目

WireMock通过Maven Central分发，可以通过常见的构建工具的依赖管理包含在您的项目中。

要将标准的WireMock JAR添加为项目依赖项，请将以下依赖项放在构建文件的dependencies部分中。

在我们的测试中，我们还将使用AssertJ来验证响应。为了发送请求，我们将使用Java 11+中可用的嵌入式HTTP客户端。

如果您想添加一个Java 1.8测试，您将需要添加一个外部的HTTP客户端实现，如Apache HttpClient。

```xml
<dependency>
    <groupId>org.wiremock</groupId>
    <artifactId>wiremock</artifactId>
    <version>3.3.1</version>
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>org.assertj</groupId>
    <artifactId>assertj-core</artifactId>
    <version>3.24.2</version>
    <scope>test</scope>
</dependency>
```

## 添加WireMock规则

WireMock提供了一些JUnit规则来管理服务器的生命周期和设置/拆卸任务。

要使用WireMock的流畅API，请添加以下导入语句：

```java
import static com.github.tomakehurst.wiremock.client.WireMock.*;
```

为了在每个测试用例中自动启动和停止WireMock，请将以下内容添加到您的测试类（或其超类）：

```java
@Rule
public WireMockRule wireMockRule = new WireMockRule(8089); // No-args constructor defaults to port 8080
```

## 写一个测试

```java
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

...

@Test
public void exampleTest() {
    // Setup the WireMock mapping stub for the test
    stubFor(post("/my/resource")
        .withHeader("Content-Type", containing("xml"))
        .willReturn(ok()
            .withHeader("Content-Type", "text/xml")
            .withBody("<response>SUCCESS</response>")));

    // Setup HTTP POST request (with HTTP Client embedded in Java 11+)
    final HttpClient client = HttpClient.newBuilder().build();
    final HttpRequest request = HttpRequest.newBuilder()
        .uri(wiremockServer.getRequestURI("/my/resource"))
        .header("Content-Type", "text/xml")
        .POST().build();

    // Send the request and receive the response
    final HttpResponse<String> response =
            client.send(request, HttpResponse.BodyHandlers.ofString());

    // Verify the response (with AssertJ)
    assertThat(response.statusCode()).as("Wrong response status code").isEqualTo(200);
    assertThat(response.body()).as("Wrong response body").contains("<response>SUCCESS</response>");
}
```

## 拓展测试类

为了对由规则创建的WireMock服务器的设置有更多的控制，您可以将通过流式构建的Options对象传递给规则的构造函数。

让我们以更改端口号为例：

```java
import static com.github.tomakehurst.wiremock.core.WireMockConfiguration.wireMockConfig;
...

@Rule
public WireMockRule wireMockRule = new WireMockRule(wireMockConfig().port(8089).httpsPort(8443));
```

您可以让WireMock（更准确地说是JVM）选择随机的、空闲的HTTP和HTTPS端口。如果您想要并发运行测试，这是一个很好的选择。

```java
@Rule
public WireMockRule wireMockRule = new WireMockRule(wireMockConfig().dynamicPort().dynamicHttpsPort());
```

可以用下面的发现对应的端口信息：

```java
int port = wireMockRule.port();
int httpsPort = wireMockRule.httpsPort();
```


# chat

## 详细介绍一下 WireMock

WireMock 是一个用于模拟 HTTP 服务的开源工具，可以帮助开发人员和测试人员在不依赖真实服务的情况下进行服务虚拟化和集成测试。

WireMock 的主要特点包括：

### 1. **HTTP 服务模拟：**
   - WireMock 允许你轻松地模拟和配置 HTTP 服务的行为。你可以定义模拟服务的期望响应、状态码、请求头、查询参数等。

### 2. **请求匹配和响应定制：**
   - WireMock 提供了丰富的请求匹配选项，可以根据请求的 URL、HTTP 方法、请求体等来匹配。同时，你可以定制模拟服务的响应，包括响应体、响应头、状态码等。

### 3. **灵活的参数匹配：**
   - 支持各种参数匹配器，例如正则表达式、通配符等，以便更灵活地匹配请求。

### 4. **可配置的延迟和故障注入：**
   - 你可以配置模拟服务的响应延迟，以模拟真实世界中服务的响应时间。此外，还支持故障注入，模拟服务的异常或错误状态。

### 5. **记录和回放：**
   - WireMock 可以记录实际服务的请求和响应，然后将其用作模拟服务的期望行为。这有助于创建模拟服务，以便与实际服务的行为相匹配。

### 6. **适用于测试和开发：**
   - WireMock 既适用于测试场景，也适用于开发阶段，帮助开发人员在构建依赖服务尚未准备好时进行开发和调试。

### 7. **独立运行或嵌入式使用：**
   - WireMock 可以作为一个独立的进程运行，也可以嵌入到 Java 代码中，以便更紧密地集成到测试和开发工作流程中。

### 使用示例：

以下是一个简单的 WireMock 使用示例，演示了如何定义一个模拟服务：

```java
import com.github.tomakehurst.wiremock.WireMockServer;
import static com.github.tomakehurst.wiremock.client.WireMock.*;

public class WireMockExample {

    public static void main(String[] args) {
        // 创建 WireMock 服务器
        WireMockServer wireMockServer = new WireMockServer();

        // 启动 WireMock 服务器
        wireMockServer.start();

        // 定义模拟服务的期望行为
        stubFor(get(urlEqualTo("/example"))
                .willReturn(aResponse()
                        .withStatus(200)
                        .withBody("Hello, WireMock!")));

        // 停止 WireMock 服务器
        wireMockServer.stop();
    }
}
```

在这个示例中，定义了一个模拟服务，当收到 `/example` 路径的 GET 请求时，返回状态码为 200 和响应体为 "Hello, WireMock!"。

这只是一个简单的示例，WireMock 支持更多复杂的配置和场景。

## wiremock 是如何实现 http 服务的模拟的？原理是什么

WireMock实现HTTP服务的模拟的基本原理是拦截和模拟HTTP请求，并根据预定义的规则返回相应的模拟响应。

以下是WireMock的基本原理：

1. **代理模式：** WireMock 可以作为一个代理服务器，拦截客户端发出的HTTP请求。当 WireMock 作为代理运行时，它会监听指定的端口，并将接收到的请求发送到实际的目标服务器。WireMock 在中间拦截这些请求，允许你模拟响应。

2. **Stubbing：** 在 WireMock 中，模拟服务的期望行为通过 stub（存根）来定义。一个 stub 定义了一个匹配规则和一个对应的响应。当收到符合匹配规则的请求时，WireMock 将返回预定义的响应，而不是将请求转发到实际的目标服务器。

3. **匹配规则：** WireMock 提供了丰富的匹配规则，可以根据请求的URL、HTTP方法、请求体、查询参数等条件进行匹配。这使得可以精确地定义哪些请求应该由 WireMock 进行模拟响应。

4. **DSL（领域特定语言）：** WireMock 使用了DSL，即一种特定于领域的语言，用于定义 stubs。DSL 提供了清晰而简洁的语法，使得创建和配置 stubs 变得直观和易读。

5. **内嵌服务器：** 除了代理模式，WireMock 还可以作为一个独立的HTTP服务器运行。在这种情况下，它监听指定的端口并直接处理客户端发出的请求，而不需要实际的目标服务器。

6. **录制和回放：** WireMock 具有录制和回放功能，可以用于记录实际服务的请求和响应，然后将其用作模拟服务的期望行为。这有助于创建与实际服务行为一致的 stubs。

总体而言，WireMock的实现原理是在HTTP请求的传输路径上拦截请求，根据事先定义好的规则（stubs）进行匹配，并返回预设的模拟响应。

这使得开发人员和测试人员能够在没有真实服务的情况下进行系统集成测试、单元测试以及开发过程中的服务虚拟化。

## 详细介绍下 wiremock 的 DSL

WireMock 的 DSL（Domain Specific Language，领域特定语言）是一种用于创建和配置 stubs（存根）的语法，它旨在提供清晰、简洁且易于理解的模拟服务的定义。

以下是 WireMock 的 DSL 的主要组成部分和示例：

### Stubbing（存根）基本结构：

```java
stubFor(requestMethod(urlMatching("/api/resource"))
    .willReturn(aResponse()
        .withStatus(200)
        .withHeader("Content-Type", "application/json")
        .withBody("{\"key\": \"value\"}")));
```

在上述示例中，使用 `stubFor` 定义了一个 stub。该 stub 匹配任何HTTP方法的 `/api/resource` 路径，并定义了一个响应，该响应具有状态码200、Content-Type头为application/json，以及响应体为 `{"key": "value"}`。

### 请求匹配：

- **URL 匹配：**

   ```java
   urlEqualTo("/api/resource")
   urlMatching("/api/resource/[0-9]+")
   ```

- **HTTP 方法匹配：**

   ```java
   get(urlEqualTo("/api/resource"))
   post(urlEqualTo("/api/resource"))
   ```

- **查询参数匹配：**

   ```java
   urlEqualTo("/api/resource").withQueryParam("key", equalTo("value"))
   ```

- **请求头匹配：**

   ```java
   urlEqualTo("/api/resource").withHeader("Content-Type", containing("json"))
   ```

### 响应配置：

- **状态码和响应体：**

   ```java
   withStatus(200)
   withBody("{\"key\": \"value\"}")
   ```

- **延迟和故障注入：**

   ```java
   fixedDelay(5000)  // 5秒延迟
   .withFault(Fault.EMPTY_RESPONSE)  // 返回空响应
   ```

### 参数匹配器：

- **通用匹配器：**

   ```java
   any()
   ```

- **正则表达式匹配器：**

   ```java
   urlMatching("/api/resource/[0-9]+")
   ```

- **自定义匹配器：**

   ```java
   equalToJson("{\"key\": \"value\"}", true, true)
   ```

### 高级配置：

- **多个匹配规则：**

   ```java
   get(urlEqualTo("/api/resource"))
      .atPriority(1)
      .willReturn(aResponse().withStatus(200));

   get(urlEqualTo("/api/resource"))
      .atPriority(2)
      .willReturn(aResponse().withStatus(404));
   ```

- **条件匹配：**

   ```java
   givenThat(get(urlEqualTo("/api/resource"))
      .willReturn(aResponse().withStatus(200)));

   onlyIf(withHeader("Authorization", equalTo("Bearer token")))
      .get(urlEqualTo("/secure/resource"))
      .willReturn(aResponse().withStatus(200));
   ```

以上只是 WireMock DSL 的一些基本用法示例。

DSL 提供了丰富的配置选项，允许开发人员定义详细的 stubs，以模拟复杂的 HTTP 服务行为。

通过这种 DSL，用户可以清晰地表达出模拟服务的期望行为，使测试代码更易读、易维护。

详细的 DSL 文档和示例可以在 WireMock 的官方网站找到。

## 详细介绍一下 wiremock 的内嵌服务器

WireMock 的内嵌服务器是指将 WireMock 直接嵌入到你的 Java 代码中，并在你的应用程序中以嵌入式的方式运行。

这种方式使得 WireMock 可以更紧密地集成到你的测试和开发工作流程中。

以下是 WireMock 内嵌服务器的详细介绍：

### 1. 添加 Maven 依赖：

首先，你需要将 WireMock 的依赖添加到你的 Maven 项目中。在 `pom.xml` 文件中加入如下依赖：

```xml
<dependency>
    <groupId>com.github.tomakehurst</groupId>
    <artifactId>wiremock-standalone</artifactId>
    <version>2.31.0</version> <!-- 请使用最新版本 -->
    <scope>test</scope>
</dependency>
```

### 2. 编写内嵌服务器代码：

接下来，你可以在你的测试类或其他合适的地方编写代码来启动 WireMock 内嵌服务器：

```java
import com.github.tomakehurst.wiremock.WireMockServer;
import static com.github.tomakehurst.wiremock.client.WireMock.*;

public class EmbeddedWireMockExample {

    public static void main(String[] args) {
        // 创建 WireMock 服务器实例
        WireMockServer wireMockServer = new WireMockServer();

        // 启动 WireMock 服务器
        wireMockServer.start();

        // 定义模拟服务的期望行为
        stubFor(get(urlEqualTo("/example"))
                .willReturn(aResponse()
                        .withStatus(200)
                        .withBody("Hello, WireMock!")));

        // 在这里执行你的测试代码，可以使用 WireMock 作为模拟服务

        // 停止 WireMock 服务器
        wireMockServer.stop();
    }
}
```

### 3. 定义期望行为：

在上述代码中，通过 `stubFor` 定义了一个模拟服务的期望行为。

这个行为表示当收到 `/example` 路径的 GET 请求时，返回状态码为 200 和响应体为 "Hello, WireMock!"。

### 4. 运行测试：

在执行测试代码时，WireMock 会在指定的端口启动一个内嵌的 HTTP 服务器，该服务器会拦截和处理符合定义的 stub 规则的请求。

### 5. 注意事项：

- 内嵌服务器默认监听在本地地址（127.0.0.1）的随机端口上。你可以使用 `wireMockServer.port()` 获取实际使用的端口。
  
- 当测试结束时，记得调用 `wireMockServer.stop()` 来停止 WireMock 服务器。

- 如果你希望 WireMock 以 HTTPS 方式运行，可以配置相应的 SSL 选项。

通过使用 WireMock 的内嵌服务器，你可以在测试和开发中更灵活地模拟和测试 HTTP 服务的行为，而无需依赖外部服务。

这对于系统集成测试、单元测试和开发阶段的服务虚拟化非常有用。

## wiremock 内嵌服务的实现原理是什么？

WireMock 的内嵌服务实现原理涉及到它作为一个独立的 HTTP 服务器的启动和管理。

以下是 WireMock 内嵌服务的主要实现原理：

1. **使用 Jetty 构建 HTTP 服务器：** WireMock 使用 Jetty 作为其 HTTP 服务器的嵌入式容器。Jetty 是一个轻量级的、可嵌入的 Java Web 服务器，适用于构建各种类型的网络应用。

2. **配置和启动 Jetty 服务器：** 在 WireMock 的内部实现中，它通过代码配置 Jetty 服务器的相关参数，如监听地址、端口号等。一旦配置完成，WireMock 会启动 Jetty 服务器。

3. **HTTP 请求的拦截和处理：** WireMock 通过 Jetty 的 Handler 机制拦截传入的 HTTP 请求。当请求到达时，WireMock 使用内部的匹配规则检查请求是否与预定义的 stub 规则匹配。

4. **Stub 规则匹配：** 如果请求匹配了任何一个预定义的 stub 规则，WireMock 将按照相应的规则生成模拟的 HTTP 响应。这可能涉及到返回预定义的状态码、响应体、响应头等。

5. **返回模拟的 HTTP 响应：** 一旦模拟的 HTTP 响应被生成，WireMock 将该响应返回给发起请求的客户端。这使得客户端认为它正在与实际的服务通信，而实际上它是在与 WireMock 的模拟服务进行交互。

6. **停止服务器：** 当测试结束或应用程序关闭时，可以调用 WireMock 的方法来停止 Jetty 服务器，释放占用的端口和资源。

整个过程中，WireMock 负责管理和协调 Jetty 服务器的启动、请求拦截、规则匹配和模拟响应的生成。

通过这种方式，WireMock 实现了一个轻量级、易于使用的 HTTP 服务模拟工具，可用于测试和开发中的服务虚拟化。

WireMock 的内嵌服务的实现原理使得它能够灵活适应各种测试和开发场景。





# 参考资料

https://wiremock.org/docs/quickstart/java-junit/

https://wiremock.org/docs/download-and-installation/

* any list
{:toc}
