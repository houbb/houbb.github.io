---
layout: post
title:  log-00-日志组件概览
date:  2016-5-21 10:00:13 +0800
categories: [Log]
tags: [log, log4j, sf]
published: true
---

# 拓展阅读

[Log4j2 系统学习](https://houbb.github.io/2016/05/21/Log4j2-01-overview)

[Logback 系统学习](https://houbb.github.io/2018/11/19/logback-01-intro)

[Slf4j](https://houbb.github.io/2018/08/27/slf4j)

[Slf4j-02-slf4j 与 logback 整合](https://houbb.github.io/2018/08/27/slf4j-02-logback)

[SLF4j MDC-日志添加唯一标识](https://houbb.github.io/2018/12/06/slf4j-mdc)

[分布式链路追踪-05-mdc 等信息如何跨线程? Log4j2 与 logback 的实现方式](https://houbb.github.io/2023/07/25/distributed-trace-06-log4j2-slf4j)

[日志开源组件（一）java 注解结合 spring aop 实现自动输出日志](https://houbb.github.io/2023/08/06/auto-log-01-overview)

[日志开源组件（二）注解结合 spring aop 实现日志traceId唯一标识](https://houbb.github.io/2023/08/06/auto-log-02-trace-id)

[日志开源组件（三）java 注解结合 spring aop 自动输出日志新增拦截器与过滤器](https://houbb.github.io/2023/08/06/auto-log-03-filter)

[日志开源组件（四）如何动态修改 spring aop 切面信息？让自动日志输出框架更好用](https://houbb.github.io/2023/08/06/auto-log-04-dynamic-aop)

[日志开源组件（五）如何将 dubbo filter 拦截器原理运用到日志拦截器中？](https://houbb.github.io/2023/08/06/auto-log-05-dubbo-interceptor)

[日志开源组件（六）Adaptive Sampling 自适应采样](https://houbb.github.io/2023/08/06/auto-log-06-adaptive)

# chat

## java 日志组件有哪些？

Java中有许多流行的日志组件，用于在应用程序中记录和管理日志信息。以下是一些常见的Java日志组件：

1. **java.util.logging (JUL):**
   - 是Java平台自带的官方日志框架。
   - 提供了基本的日志记录功能，但在功能和灵活性方面相对较简单。

2. **Log4j:**
   - 是Apache软件基金会的一个开源日志框架。
   - 提供了丰富的功能和配置选项，广泛用于Java应用程序。

3. **Logback:**
   - 由Log4j的创始人开发的后续项目，旨在提供更好的性能和一些新功能。
   - 与Log4j兼容，并提供了许多相似的特性。

4. **SLF4J (Simple Logging Facade for Java):**
   - 不是具体的日志实现，而是一个抽象的日志门面，提供了一个通用的接口。
   - 允许应用程序以一种灵活的方式使用不同的底层日志实现（如Log4j、Logback等）。

5. **Commons Logging:**
   - 由Apache Commons项目提供的一个通用的日志接口。
   - 类似于SLF4J，允许使用不同的底层实现。

6. **Tinylog:**
   - 是一个轻量级的日志框架，设计简单，易于使用。
   - 提供了简洁的API和低依赖性。

7. **Slf4j简化版 (Simple Logging Facade for Java - Simple):**
   - 是SLF4J的一个简化版本，专注于提供基本的日志功能。
   - 适用于小型项目或对日志需求不高的应用。

8. **Micrometer:**
   - 主要用于度量（metrics）和性能监控，但也提供了日志记录的功能。
   - 通常与其他日志框架（如Logback）一起使用。

以上只是一些主要的日志组件，实际上还有其他一些轻量级和特定用途的日志库，开发者可以根据项目需求和个人偏好选择适当的日志组件。

## log4j2 呢？

抱歉遗漏了 Log4j2。Log4j2 是 Apache Log4j 项目的升级版本，是一种功能强大且高性能的日志框架。以下是关于 Log4j2 的一些关键信息：

**Log4j2:**
- **特点：**
  - **性能优越：** Log4j2 的设计旨在提供卓越的性能，特别是在异步日志记录方面。
  - **插件架构：** 支持插件架构，可以通过插件扩展不同的功能，如日志输出格式、日志过滤器等。
  - **异步日志：** 支持异步日志记录，提高了性能，尤其在高吞吐量的应用中表现出色。
  - **灵活配置：** 配置文件使用 XML、JSON、YAML 等多种格式，支持动态重新加载配置。
  - **ContextMap：** 引入了 ThreadContext Map，可以为日志消息附加上下文信息。
  - **插入点：** 提供了多种插入点，允许在不同的位置插入自定义代码。

- **配置：**
  - Log4j2 的配置可以通过 XML、JSON、YAML 或编程方式进行，提供了更灵活的配置选项。
  - 配置文件支持监视和重新加载，使得可以在运行时动态修改日志配置。

- **依赖：**
  - Log4j2 不仅可以独立使用，还可以与 SLF4J 结合使用，使其更具灵活性。

- **使用示例：**
  - 配置文件示例（XML）：
    ```xml
    <?xml version="1.0" encoding="UTF-8"?>
    <Configuration status="WARN">
        <Appenders>
            <Console name="Console" target="SYSTEM_OUT">
                <PatternLayout pattern="%d{HH:mm:ss.SSS} [%t] %-5level %logger{36} - %msg%n"/>
            </Console>
        </Appenders>
        <Loggers>
            <Root level="debug">
                <AppenderRef ref="Console"/>
            </Root>
        </Loggers>
    </Configuration>
    ```
  - Java 代码示例：
    ```java
    import org.apache.logging.log4j.LogManager;
    import org.apache.logging.log4j.Logger;

    public class MyClass {
        private static final Logger logger = LogManager.getLogger(MyClass.class);

        public static void main(String[] args) {
            logger.debug("Debug message");
            logger.info("Info message");
            logger.error("Error message");
        }
    }
    ```

Log4j2 是一个强大而灵活的日志框架，被广泛用于各种 Java 应用程序中。它提供了许多先进的特性，适用于不同规模和类型的项目。

## 给出所有日志组件的详细对比表格

以下是一些常见的Java日志组件的对比，包括java.util.logging、Log4j、Logback、SLF4J、Commons Logging、Tinylog、Slf4j简化版、Micrometer和Log4j2。请注意，这里提供的信息可能会有变化，建议查阅各个项目的最新文档以获取最准确的信息。

| 特性/组件                   | java.util.logging | Log4j               | Logback             | SLF4J               | Commons Logging     | Tinylog            | Slf4j简化版         | Micrometer          | Log4j2             |
| -------------------------- | ----------------- | ------------------- | ------------------- | ------------------- | ------------------- | ------------------ | ------------------- | ------------------- | ------------------ |
| **异步日志**               | 否                | 是                  | 是                  | 部分支持（取决于实现）| 部分支持（取决于实现）| 是                | 是                  | 部分支持             | 是                 |
| **插件架构**               | 否                | 是                  | 部分支持            | 否                  | 否                  | 否                | 否                  | 否                  | 是                 |
| **配置文件格式**           | 配置属性文件(.properties) | XML, JSON, YAML     | XML                 | N/A                | N/A                | Properties        | Properties         | 配置属性文件(.properties) | XML, JSON, YAML    |
| **灵活配置**               | 有限               | 是                  | 是                  | 是                  | 是                  | 是                | 是                  | 部分支持             | 是                 |
| **性能**                   | 适中               | 良好                | 优秀                | 适中                | 适中                | 良好              | 适中                | 适中                | 优秀               |
| **适用范围**               | 基本               | 大型应用程序，复杂配置 | 大型应用程序        | 通用                | 通用                | 小型到中型应用     | 简单应用，小型项目   | 度量和监控          | 大型应用程序        |
| **支持级别**               | 有限               | 丰富                | 丰富                | 丰富                | 丰富                | 有限              | 有限                | 有限                | 丰富               |
| **ContextMap**             | 无                | ThreadContext Map   | MDC                 | MDC                 | N/A                | N/A              | N/A                | N/A                | ThreadContext Map  |
| **SLF4J整合**              | 无                | 支持                | 支持                | N/A                | 支持                | N/A              | 支持                | 支持                | 支持               |
| **社区活跃度**             | N/A               | 高                  | 高                  | 高                  | 低                  | 中                | 低                  | 高                  | 高                 |

这个对比表格只是一个简要概述，实际选择日志组件时，建议根据项目需求、性能要求、配置灵活性和个人偏好等因素进行更详细的评估。

## 
# 参考资料

[log4j日志扩展---自定义PatternLayout](https://blog.csdn.net/u010162887/article/details/51736637)

* any list
{:toc}