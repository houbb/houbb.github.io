---
layout: post
title: 监控标准-OpenTracing-02-chat
date:  2019-4-1 19:24:57 +0800
categories: [Monitor]
tags: [monitor, apm, api, sf]
published: true
---

# chat

## 详细介绍一下 opentracing

OpenTracing 是一个用于分布式追踪的开放标准，旨在帮助开发人员在微服务架构中收集和可视化系统中的请求和操作流。以下是 OpenTracing 的一些关键概念和特点：

### 1. **目的**
OpenTracing 旨在提供一个抽象层，使开发人员能够以统一的方式进行分布式追踪，而不依赖于具体的实现。它支持多种追踪系统，例如 Jaeger、Zipkin、Lightstep 等。

### 2. **核心概念**
- **Span**：表示一个操作的执行（例如，处理一个 HTTP 请求）。每个 Span 有一个唯一的标识符，包含开始时间、持续时间、标签和日志等信息。
- **Trace**：表示一个请求在系统中的整个执行路径，包含多个 Span。
- **Context**：表示追踪上下文，用于在不同服务间传递追踪信息。

### 3. **实现**
OpenTracing 提供了一组 API，允许开发者在应用程序中插入追踪逻辑。实现通常包括以下步骤：
- 创建 Span：在开始处理请求时创建一个 Span。
- 记录信息：在 Span 中记录事件、错误或其他有用信息。
- 结束 Span：在操作完成后结束 Span。

### 4. **集成**
OpenTracing 可以与多种编程语言和框架集成，如 Java、Python、Go、Node.js 等。通过使用 OpenTracing SDK，开发者可以轻松将追踪功能集成到他们的应用程序中。

### 5. **优势**
- **无 Vendor 锁定**：由于是开放标准，开发者可以在不同的追踪后端之间切换。
- **提高可观察性**：帮助开发者理解系统的性能瓶颈和依赖关系。
- **故障排查**：快速定位问题的根源，提高故障恢复的效率。

### 6. **使用示例**
```python
from opentracing import Tracer, Format
from opentracing_instrumentation import SpanDecorator

# 初始化 Tracer
tracer = Tracer()

# 创建一个新的 Span
with tracer.start_span('operation_name') as span:
    span.set_tag('key', 'value')
    # 执行操作
    span.log_kv({'event': 'some_event'})
```

### 7. **未来**
OpenTracing 作为一个标准，正逐步与 OpenTelemetry 合并，后者提供了更广泛的可观察性解决方案，包括追踪、度量和日志记录。开发者可以关注 OpenTelemetry，以获取更全面的观察工具。

如果你有更具体的需求或问题，欢迎提问！

## java 应用如何使用 open-tracing

在 Java 应用中使用 OpenTracing，可以按照以下步骤集成和使用它来实现分布式追踪：

### 1. **添加依赖**
首先，需要在项目中添加 OpenTracing 和所选追踪实现的依赖。例如，如果你使用 Maven，可以在 `pom.xml` 中添加以下内容：

```xml
<dependency>
    <groupId>io.opentracing</groupId>
    <artifactId>opentracing-api</artifactId>
    <version>1.0.0</version>
</dependency>
<dependency>
    <groupId>io.jaegertracing</groupId>
    <artifactId>jaeger-client</artifactId>
    <version>1.5.0</version>
</dependency>
```

### 2. **初始化 Tracer**
在应用启动时，初始化 OpenTracing 的 Tracer 实现。例如，使用 Jaeger 作为追踪后端：

```java
import io.jaegertracing.Configuration;
import io.opentracing.Tracer;

public class TracingExample {
    private static Tracer initTracer() {
        return new Configuration("my-service-name")
                .withSampler(new Configuration.SamplerConfiguration()
                        .withType("const").withParam(1))
                .withReporter(new Configuration.ReporterConfiguration()
                        .withLogSpans(true))
                .getTracer();
    }

    public static void main(String[] args) {
        Tracer tracer = initTracer();
        // 其他代码...
    }
}
```

### 3. **创建和管理 Span**
在需要追踪的代码中创建 Span，并记录信息：

```java
import io.opentracing.Span;
import io.opentracing.util.GlobalTracer;

public void myOperation() {
    // 获取全局 Tracer
    Tracer tracer = GlobalTracer.get();
    
    // 创建 Span
    Span span = tracer.buildSpan("myOperation").start();
    try {
        // 业务逻辑
        // span.setTag("key", "value"); // 设置标签
        // span.log("some log message"); // 记录日志
    } catch (Exception e) {
        span.setTag("error", true); // 记录错误
    } finally {
        span.finish(); // 完成 Span
    }
}
```

### 4. **传递上下文**
在微服务调用中，需要传递上下文。可以使用 `TextMap` 或 `Carrier` 接口来实现。例如，传递 HTTP 请求中的追踪信息：

```java
import io.opentracing.propagation.TextMap;
import io.opentracing.propagation.Format;

// 在发送请求前
tracer.inject(span.context(), Format.Builtin.HTTP_HEADERS, new TextMap() {
    // 实现 put 和 keys 方法
});
```

### 5. **查看追踪数据**
确保 Jaeger 或其他追踪系统正在运行，并查看其 UI 来监控追踪数据。

### 6. **集成框架**
许多常见的框架（如 Spring Boot）都有 OpenTracing 的集成库，可以自动化许多步骤。例如，使用 `opentracing-spring-cloud` 和 `opentracing-spring-boot`，可以自动创建和管理 Span。

### 示例
如果你在使用 Spring Boot，可以使用以下示例：

```java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import io.opentracing.Tracer;

@RestController
public class MyController {
    @Autowired
    private Tracer tracer;

    @GetMapping("/my-endpoint")
    public String myEndpoint() {
        Span span = tracer.buildSpan("myEndpoint").start();
        try {
            // 业务逻辑
            return "Hello, OpenTracing!";
        } finally {
            span.finish();
        }
    }
}
```

以上步骤可以帮助你在 Java 应用中成功集成 OpenTracing。如果你有特定的框架或场景，欢迎提供更多信息！

## 如何解决 trace 中的全局 traceId，以及不同调用模块之间的 span 关系？

在分布式系统中，管理全局 `traceId` 和不同调用模块之间的 `span` 关系是实现有效追踪的关键。以下是一些解决方案和最佳实践：

### 1. **全局 `traceId` 管理**
- **生成和传播 `traceId`**：
  - 当一个请求进入系统时，生成一个全局的 `traceId`，并在后续的调用中传播该 `traceId`。通常可以在 HTTP 请求的头部中传递，例如：
    ```plaintext
    X-B3-TraceId
    ```
  - 使用 `OpenTracing` 的 `inject` 方法将当前 `span` 的上下文信息注入到请求中，以便在下游服务中使用。

### 2. **上下文传递**
- **使用 Propagation**：
  - 在发送请求时，使用 `Tracer.inject()` 方法将 `span` 的上下文信息注入到 HTTP 请求的头部。
  - 在接收请求时，使用 `Tracer.extract()` 方法提取上下文信息，以恢复 `span` 的状态。

```java
// 发送请求前，注入上下文
tracer.inject(span.context(), Format.Builtin.HTTP_HEADERS, new TextMap() {
    @Override
    public void put(String key, String value) {
        // 添加到 HTTP 头部
    }

    @Override
    public Iterable<String> keys() {
        return Collections.emptyList();
    }
});

// 在下游服务中提取上下文
SpanContext parentContext = tracer.extract(Format.Builtin.HTTP_HEADERS, new TextMap() {
    @Override
    public void put(String key, String value) {
        // 从 HTTP 头部读取
    }

    @Override
    public Iterable<String> keys() {
        return Collections.emptyList();
    }
});
Span span = tracer.buildSpan("newSpan").asChildOf(parentContext).start();
```

### 3. **建立父子关系**
- **父子 Span**：
  - 当在一个服务中创建新的 `span` 时，可以将当前 `span` 作为新 `span` 的父 `span`。这样可以在追踪中清晰地显示调用层次关系。
  - 使用 `asChildOf()` 方法创建子 `span`。

### 4. **使用 Middleware 或 AOP**
- **自动追踪**：
  - 在使用框架如 Spring Boot 时，可以使用拦截器、过滤器或 AOP (面向切面编程) 自动管理 `span` 的创建和结束。这有助于简化代码并确保追踪的一致性。

### 5. **日志记录和监控**
- **记录 Trace 信息**：
  - 在日志中记录当前的 `traceId` 和 `spanId`，这有助于在日志中关联请求和追踪信息。

### 6. **监控与告警**
- **监控追踪数据**：
  - 使用 Jaeger、Zipkin 等工具来监控追踪数据，确保追踪链的完整性和准确性。

### 示例
以下是一个简单的示例，展示如何在微服务调用中管理 `traceId` 和 `span` 关系：

```java
// 上游服务中创建 Span
Span parentSpan = tracer.buildSpan("parentOperation").start();
try {
    // 注入上下文到请求中
    tracer.inject(parentSpan.context(), Format.Builtin.HTTP_HEADERS, new TextMap() {
        @Override
        public void put(String key, String value) {
            // 添加到 HTTP 请求头
        }

        @Override
        public Iterable<String> keys() {
            return Collections.emptyList();
        }
    });

    // 发送 HTTP 请求到下游服务
} finally {
    parentSpan.finish(); // 完成父 Span
}

// 下游服务中提取上下文并创建子 Span
SpanContext parentContext = tracer.extract(Format.Builtin.HTTP_HEADERS, new TextMap() {
    @Override
    public void put(String key, String value) {
        // 从 HTTP 请求头中读取
    }

    @Override
    public Iterable<String> keys() {
        return Collections.emptyList();
    }
});
Span childSpan = tracer.buildSpan("childOperation").asChildOf(parentContext).start();
try {
    // 执行子操作
} finally {
    childSpan.finish(); // 完成子 Span
}
```

通过上述方法，你可以有效地管理全局 `traceId` 和模块之间的 `span` 关系，确保追踪信息的完整性和准确性。如果有更多具体的问题或需求，请告诉我！

# 参考资料

[opentracing 文档中文版](https://wu-sheng.gitbooks.io/opentracing-io/content/)

* any list
{:toc}