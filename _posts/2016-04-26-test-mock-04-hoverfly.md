---
layout: post
title: test mock-04-hoverfly Easy Creation of Stub Http Servers for Testing
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

# Hoverfly Java - Easy Creation of Stub Http Servers for Testing

Java原生语言绑定的Hoverfly，是一个Go语言代理工具，允许您在单元测试中模拟HTTP服务。

这个过程的另一个术语是服务虚拟化。

## 特性：

- 模拟HTTP/HTTPS服务
- 基于URL、方法、正文和头部组合的严格或宽松的HTTP请求匹配
- 流畅且表达力强的DSL，用于轻松生成模拟服务
- 在请求/响应体生成期间将对象自动编组成JSON
- 通过捕获实时流量创建模拟
- Hoverfly是一个代理，因此您无需更改发出请求的主机
- 单个Hoverfly实例支持多个主机/服务
- 自动支持HTTPS，无需额外配置
- 支持相互TLS身份验证捕获
- 与标准Hoverfly JSON兼容，方便在Java和其他原生语言绑定之间重用数据
- 使用外部管理的Hoverfly集群进行API模拟
- 请求验证
- 响应模板化
- 有状态的捕获/模拟
- JUnit 5扩展

# 入门例子

## maven

```xml
<dependency>
    <groupId>io.specto</groupId>
    <artifactId>hoverfly-java</artifactId>
    <version>0.14.0</version>
    <scope>test</scope>
</dependency>
```

## 代码示例

最简单的方法是使用JUnit规则开始。

在幕后，JVM代理设置将被配置为使用托管的Hoverfly进程，因此您可以像往常一样发出请求，只不过这次Hoverfly会响应而不是真实服务（假设您的HTTP客户端尊重JVM代理设置）：

```java
import static io.specto.hoverfly.junit.core.SimulationSource.dsl;
import static io.specto.hoverfly.junit.dsl.HoverflyDsl.service;
import static io.specto.hoverfly.junit.dsl.ResponseCreators.success;

public class HoverflyExample {

    @ClassRule
    public static HoverflyRule hoverflyRule = HoverflyRule.inSimulationMode(dsl(
        service("www.my-test.com")
            .get("/api/bookings/1")
            .willReturn(success("{\"bookingId\":\"1\"}", "application/json"))
    ));

    @Test
    public void shouldBeAbleToGetABookingUsingHoverfly() {
        // When
        final ResponseEntity<String> getBookingResponse = restTemplate.getForEntity("http://www.my-test.com/api/bookings/1", String.class);

        // Then
        assertThat(getBookingResponse.getStatusCode()).isEqualTo(OK);
        assertThatJSON(getBookingResponse.getBody()).isEqualTo("{"\"bookingId\":\"1\"}");
    }

// Continues...
```


# chat

## 详细介绍一下 hoverfly java 

**Hoverfly Java** 是 Hoverfly 服务虚拟化工具的 Java 语言绑定，它允许您在单元测试中模拟 HTTP 和 HTTPS 服务。

Hoverfly Java 提供了对 Hoverfly 的各种功能的便捷访问，并通过在测试中创建模拟服务来实现更高效的单元测试。

以下是 Hoverfly Java 的主要特点和功能：

### 主要特点：

1. **服务虚拟化：** Hoverfly Java 允许您模拟 HTTP 和 HTTPS 服务，以便在单元测试中隔离和测试您的代码。

2. **丰富的匹配：** 提供了灵活的匹配机制，可以基于 URL、方法、请求体和头部组合进行请求的精确匹配。

3. **DSL（领域专用语言）：** 使用流畅且表达力强的 DSL，轻松生成和定义模拟服务的规则。

4. **自动JSON编组：** 在请求和响应体生成期间，Hoverfly Java 能够自动将对象编组成 JSON，简化了数据处理。

5. **流量捕获：** 可以通过捕获实时流量创建模拟，使得创建模拟服务更加方便。

6. **支持多个主机/服务：** 单个 Hoverfly Java 实例可以支持多个主机或服务的模拟。

7. **HTTPS自动支持：** 无需额外配置，Hoverfly Java 可以自动支持 HTTPS。

8. **相互TLS身份验证捕获：** 支持捕获相互TLS身份验证的请求。

9. **与其他 Hoverfly JSON 兼容：** Hoverfly Java 生成的数据与标准 Hoverfly JSON 兼容，方便在 Java 和其他语言绑定之间共享数据。

10. **JUnit 5扩展：** Hoverfly Java 提供了JUnit 5扩展，简化了在测试中集成 Hoverfly。

### 使用示例：

```java
import io.specto.hoverfly.junit.rule.HoverflyRule;
import org.junit.Rule;
import org.junit.Test;
import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;

public class HoverflyExampleTest {

    @Rule
    public HoverflyRule hoverflyRule = HoverflyRule.inCaptureOrSimulationMode();

    @Test
    public void testWithHoverfly() throws IOException {
        // Make an HTTP request to some service
        URL url = new URL("http://www.example.com");
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        connection.setRequestMethod("GET");

        // Retrieve the response
        int responseCode = connection.getResponseCode();
        System.out.println("Response Code: " + responseCode);

        // Your assertions based on Hoverfly's response go here
    }
}
```

上述示例展示了如何使用 Hoverfly Java 的 JUnit 规则在单元测试中创建和使用模拟服务。

Hoverfly Java 通过简洁的API和DSL提供了一种轻松实现服务虚拟化的方式。

## Hoverfly Java 和 wiremock 比较有什么差异点？

**Hoverfly Java** 和 **WireMock** 都是用于服务虚拟化和模拟的工具，但它们有一些区别。

以下是它们之间的一些差异点：

### 1. **实现语言：**
- **Hoverfly Java：** Hoverfly Java 是 Hoverfly 的 Java 语言绑定，基于 Hoverfly 服务虚拟化工具。
  
- **WireMock：** WireMock 是使用 Java 编写的独立的服务虚拟化库和服务器。

### 2. **语法和DSL：**
- **Hoverfly Java：** 提供了流畅且表达力强的 DSL（领域专用语言），用于定义和生成模拟服务的规则。
  
- **WireMock：** 也有自己的 DSL，用于配置服务的模拟和响应。

### 3. **支持的语言和平台：**
- **Hoverfly Java：** 主要支持 Java 平台，适用于 Java 应用程序的单元测试。
  
- **WireMock：** 由于其独立性，支持多种语言和平台，并且可以用于各种应用程序和测试场景。

### 4. **JUnit集成：**
- **Hoverfly Java：** 提供了JUnit扩展，简化了在测试中集成 Hoverfly 的过程。

- **WireMock：** 也可以与 JUnit 集成，但没有 Hoverfly Java 提供的专用扩展。

### 5. **流量捕获：**
- **Hoverfly Java：** 具有流量捕获功能，可以通过捕获实时流量来创建模拟服务。

- **WireMock：** 通常需要手动配置 stubs 或使用录制和回放工具来创建模拟服务，相对于 Hoverfly Java 较为简单。

### 6. **TLS和HTTPS支持：**
- **Hoverfly Java：** 提供对相互TLS身份验证的支持，并自动支持 HTTPS。

- **WireMock：** 也支持 HTTPS，但相互TLS身份验证的支持可能需要更多手动配置。

### 7. **社区和生态系统：**
- **Hoverfly Java：** 相对较新，可能没有 WireMock 那样庞大的社区和生态系统。

- **WireMock：** 是一个成熟且广泛使用的项目，有大量的社区支持和丰富的文档。

### 结论：

- 如果您的项目主要是 Java 平台，并且您希望通过JUnit轻松集成服务虚拟化，那么选择 Hoverfly Java 可能更为方便。
  
- 如果您需要一个跨平台的通用解决方案，支持多种语言，并且希望使用一个成熟和广泛使用的工具，那么 WireMock 是一个更全面的选择。

## hoverfly java 的流量捕获是如何实现的？ 

**Hoverfly Java** 的流量捕获是通过其模拟模式实现的。

在模拟模式下，Hoverfly Java 可以捕获实时流量，并根据流量生成模拟服务的规则。

以下是流量捕获的一般流程：

1. **选择模式：** 在测试中，通过使用 `HoverflyRule.inCaptureMode()` 或 `HoverflyRule.inCaptureOrSimulationMode()`，您可以将 Hoverfly 切换到捕获模式。

这告诉 Hoverfly 开始捕获实时流量。

    ```java
    import io.specto.hoverfly.junit.rule.HoverflyRule;
    import org.junit.Rule;

    public class YourApiTest {

        @Rule
        public HoverflyRule hoverflyRule = HoverflyRule.inCaptureMode();

        // Your test methods go here
    }
    ```

2. **执行测试：** 在测试中执行一些操作，例如调用真实的外部服务，使得 Hoverfly 可以捕获相应的流量。

    ```java
    // Your test methods go here
    ```

3. **生成规则：** 当流量捕获完毕后，Hoverfly 会生成相应的规则，这些规则将用于后续的模拟。

4. **切换回模拟模式：** 流量捕获完成后，可以将 Hoverfly 切换回模拟模式，以便使用捕获到的规则进行模拟。

    ```java
    @Rule
    public HoverflyRule hoverflyRule = HoverflyRule.inCaptureOrSimulationMode();
    ```

5. **模拟服务：** 现在，您可以使用捕获到的规则运行您的测试，并让 Hoverfly 模拟服务的响应。

    ```java
    // Your test methods go here
    ```

通过这种方式，Hoverfly Java 可以灵活地在捕获和模拟模式之间切换，从而使得在单元测试中实现服务虚拟化变得更加方便。

在模拟模式下，Hoverfly 使用捕获的规则来模拟服务的响应，而不需要实际调用外部服务。

这种模式对于隔离测试、并发测试和确保测试稳定性非常有用。

## hoverfly java 的流量捕获原理，是把所有的请求都存储起来了吗？然后才能实现捕获？

是的，**Hoverfly Java** 的流量捕获原理是将所有请求都进行存储，然后根据这些存储的请求信息生成模拟服务的规则。

以下是流量捕获的基本原理：

1. **捕获请求：** 在捕获模式下，Hoverfly Java 拦截所有发出的请求和相应的响应。这包括在测试中通过 HTTP 客户端发起的所有实际请求，通常是与外部服务的通信。

2. **存储请求信息：** Hoverfly 将捕获到的每个请求的详细信息（URL、方法、头部、正文等）存储在一个持久化的存储中，以便后续生成模拟规则。

3. **生成模拟规则：** 当流量捕获完成后，Hoverfly 使用存储的请求信息来生成一组规则。这些规则描述了在测试期间应该如何模拟服务的响应。规则通常基于捕获到的请求的特定属性（如 URL、方法、头部等）。

4. **切换到模拟模式：** 一旦规则生成完成，Hoverfly 可以被切换到模拟模式。在模拟模式下，Hoverfly 使用生成的规则来模拟服务的行为，而不需要实际调用外部服务。

5. **执行测试：** 在测试中执行一些操作，例如调用模拟服务，Hoverfly 将返回根据规则生成的模拟响应，而不会实际发出请求到外部服务。

这种捕获和模拟的工作流程使得 Hoverfly 能够在测试中模拟外部服务的行为，而无需实际连接到这些服务。

这对于在隔离环境中进行单元测试、确保测试的可重复性以及减少对外部服务的依赖是非常有用的。

然而，也需要注意，流量捕获可能会导致存储大量的请求信息，因此在大规模测试中需要谨慎使用。

## hoverfly java 的流量捕获是把数据存储在哪里？又是如何匹配数据是否符合配置的 mock 条件呢？

Hoverfly Java 的流量捕获会将数据存储在默认的文件系统中。

具体来说，它将请求和响应数据存储在 Hoverfly 的工作目录下的 `.hoverfly` 文件夹中，以便后续的模拟。

流量匹配是通过 Hoverfly 根据请求和响应中的特定属性进行的。

匹配条件通常包括 URL、HTTP 方法、请求头、请求体等。

当您在测试中发起请求时，Hoverfly 将根据存储的捕获数据中的这些属性来寻找匹配的规则。

具体来说，匹配过程可能包括以下步骤：

1. **URL 匹配：** Hoverfly 将检查请求的 URL 是否与存储的捕获数据中的请求 URL 匹配。

2. **HTTP 方法匹配：** 检查请求的 HTTP 方法是否与存储的捕获数据中的请求方法匹配。

3. **请求头匹配：** Hoverfly 将检查请求的头部是否与存储的捕获数据中的请求头部匹配。

4. **请求体匹配：** 如果请求包含请求体，Hoverfly 将检查请求体是否与存储的捕获数据中的请求体匹配。

5. **其他条件匹配：** 根据需要，可能还会检查其他属性，例如查询参数等。

当存在多个规则时，Hoverfly 会选择第一个匹配的规则作为要应用的规则。这种方式允许您定义特定条件下的优先级，确保最匹配的规则被应用。

总的来说，Hoverfly 使用捕获的请求和响应数据的属性来动态匹配请求，并根据匹配的规则生成相应的模拟响应。

这种方式使得测试中能够模拟外部服务的行为，从而实现对代码的更加有效的单元测试。




# 参考资料

https://github.com/SpectoLabs/hoverfly-java

http://hoverfly-java.readthedocs.io/

* any list
{:toc}
