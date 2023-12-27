---
layout: post
title:  test perf-00-性能测试概览 overview
date:  2016-04-26 14:10:52 +0800
categories: [Java]
tags: [java, performance, test]
published: true
---

# 拓展阅读

[Apache jmeter](https://houbb.github.io/2016/04/26/test-perf-01-jmeter)

[LoadRunner](https://houbb.github.io/2016/04/26/test-perf-02-loadrunner)

[Junit performance rely on junit5 and jdk8+.(java 性能测试框架。性能测试。压测。测试报告生成。)](https://github.com/houbb/junitperf)

[性能测试到底应该怎么做？](https://houbb.github.io/2021/07/23/junit-performance-overview)

[基于 junit5 实现 junitperf 源码分析](https://houbb.github.io/2021/07/23/junit-performance-junit5)

[junit4 90% 的人都不知道的特性，详解 junitperf 的实现原理](https://houbb.github.io/2021/07/23/junit-performance-junit4)

[Benchmark 性能测试框架 JMH](https://houbb.github.io/2021/07/23/junit-performance-jmh)

[WRK-测试利器](https://houbb.github.io/2019/04/01/test-tool-wrk)

# chat

## 详细介绍一下性能测试

性能测试是软件测试的一种类型，旨在评估系统、应用程序或服务在特定负载和条件下的性能表现。

性能测试的目标是确保系统在不同压力下能够满足用户需求，同时保持稳定性和可靠性。以下是性能测试的一些重要方面和方法：

### 1. **性能测试的类型：**

#### 1.1 **负载测试（Load Testing）：**
   - **目的：** 评估系统在正常负载下的性能。
   - **特点：** 增加并发用户数，观察系统响应时间、吞吐量等指标。

#### 1.2 **压力测试（Stress Testing）：**
   - **目的：** 评估系统在极限负载下的性能。
   - **特点：** 将系统推向其极限，观察系统在极端条件下的表现，检测系统的崩溃点。

#### 1.3 **耐久性测试（Endurance Testing）：**
   - **目的：** 评估系统在持续负载下的性能。
   - **特点：** 持续一段时间的负载，检测系统在长时间运行后是否存在性能退化。

#### 1.4 **并发测试（Concurrency Testing）：**
   - **目的：** 评估系统在多个用户同时操作下的性能。
   - **特点：** 同时模拟多个用户执行相同或不同的操作，观察系统的响应。

#### 1.5 **配置测试（Configuration Testing）：**
   - **目的：** 评估系统在不同硬件、网络配置下的性能。
   - **特点：** 模拟不同配置的环境，检查系统在这些配置下的表现。

### 2. **性能测试的关键指标：**

#### 2.1 **响应时间（Response Time）：**
   - 衡量从发送请求到接收到响应所花费的时间。

#### 2.2 **吞吐量（Throughput）：**
   - 衡量系统在单位时间内处理的请求数量。

#### 2.3 **并发用户数（Concurrency/Load Level）：**
   - 同时访问系统的用户数量。

#### 2.4 **资源利用率（Resource Utilization）：**
   - CPU、内存、磁盘等资源的利用率。

#### 2.5 **错误率（Error Rate）：**
   - 请求失败或产生错误的百分比。

### 3. **性能测试的步骤：**

#### 3.1 **制定测试计划：**
   - 定义测试的目标、范围、测试环境和测试数据。

#### 3.2 **设计测试场景：**
   - 确定要模拟的用户行为、负载模型和业务流程。

#### 3.3 **设置测试环境：**
   - 部署系统、配置测试工具、准备测试数据。

#### 3.4 **执行测试：**
   - 执行设计的测试场景，监控关键性能指标。

#### 3.5 **收集和分析结果：**
   - 收集测试结果，分析性能数据，识别性能瓶颈。

#### 3.6 **优化和重新测试：**
   - 根据分析结果进行系统优化，然后重新执行性能测试。

### 4. **性能测试工具：**

#### 4.1 **Apache JMeter：**
   - 用于模拟多用户并发访问的开源性能测试工具。

#### 4.2 **LoadRunner：**
   - 由Micro Focus提供，支持多种协议，用于负载和性能测试。

#### 4.3 **Gatling：**
   - 基于Scala编写的开源性能测试工具，适用于轻量级负载测试。

#### 4.4 **Locust：**
   - 用Python编写的开源性能测试工具，支持分布式负载测试。

### 5. **性能测试的挑战：**

#### 5.1 **真实性：**
   - 如何模拟真实用户的行为和环境。

#### 5.2 **可伸缩性：**
   - 能否在增加负载时保持系统的性能。

#### 5.3 **环境复杂性：**
   - 测试环境和真实生产环境的差异。

#### 5.4 **测试数据的准备：**
   - 如何准备具有代表性的测试数据。

性能测试是确保软件系统能够满足用户需求的关键步骤，通过模拟各种使用情况，发现潜在问题并改进系统性能。

## 常见的类似 apache jmeter 的性能压测开源工具有哪些？

除了Apache JMeter之外，还有一些其他开源的性能测试和负载测试工具可供选择。以下是一些常见的类似JMeter的性能压测开源工具：

1. **Gatling:**
   - **语言：** Scala
   - **特点：** 基于异步非阻塞的设计，适用于轻量级和高并发场景。支持DSL（领域特定语言）进行测试脚本编写。

2. **Locust:**
   - **语言：** Python
   - **特点：** 分布式负载测试工具，使用Python编写，具有简洁的脚本编写方式。易于学习和使用。

3. **Tsung:**
   - **语言：** Erlang
   - **特点：** 分布式负载测试工具，支持HTTP、WebDAV、SOAP、WebSocket等协议。使用XML进行测试场景配置。

4. **Artillery:**
   - **语言：** JavaScript
   - **特点：** 现代的负载测试工具，使用JavaScript编写测试脚本，支持HTTP、WebSocket等协议。可通过插件扩展功能。

5. **Vegeta:**
   - **语言：** Go
   - **特点：** 简单而高效的负载测试工具，使用Go编写。适用于快速的HTTP性能测试。

6. **Siege:**
   - **语言：** C
   - **特点：** 轻量级的HTTP负载测试工具，支持并发请求、事务计数等。使用C编写，适用于基本的性能测试需求。

7. **K6:**
   - **语言：** JavaScript
   - **特点：** 现代负载测试工具，支持JavaScript脚本编写，可以在本地或云端执行。适用于开发者进行性能测试。

8. **Locust:**
   - **语言：** Python
   - **特点：** 分布式负载测试工具，使用Python编写，具有简洁的脚本编写方式。易于学习和使用。

这些工具各有特点，选择取决于具体的测试需求、团队技能和项目特点。

它们可以用于模拟不同协议、处理各种负载，并提供详细的测试结果和报告，帮助开发人员和测试人员评估系统的性能。

## 如果是 java 语言，类似 apache jmeter 的性能压测开源工具有哪些？

如果你使用Java语言，并且希望找到类似Apache JMeter的性能压测工具，有一些专注于Java的工具可供选择。以下是一些在Java生态系统中流行的性能测试工具：

1. **Apache JMeter:**
   - **特点：** 面向Java开发者，支持多种协议，图形用户界面易于使用。

2. **Gatling:**
   - **特点：** 基于Scala编写，但可以用于Java。具有异步和事件驱动的设计，适用于高并发场景。

3. **Apache Benchmark (ab):**
   - **特点：** Apache软件基金会的工具，用于测试Apache HTTP服务器性能。通过命令行使用。

4. **Grinder:**
   - **特点：** 使用Jython或Clojure编写脚本，分布式负载测试工具，适用于测试Java应用程序。

5. **Tsung:**
   - **特点：** 使用Erlang编写，支持分布式测试。适用于HTTP、WebDAV、SOAP、WebSocket等协议。

6. **Artillery:**
   - **特点：** 使用JavaScript编写，支持HTTP、WebSocket等协议。现代且可扩展的负载测试工具。

7. **K6:**
   - **特点：** 使用JavaScript编写，支持本地和云端执行。适用于开发者进行性能测试。

这些工具都有各自的特点和优势，你可以根据项目需求、团队技能以及工具的适用性进行选择。

无论选择哪个工具，都需要根据具体场景和目标进行适当的配置和调整。

## 对比表格

下面是包含Apache JMeter在内的一些性能测试工具的简要对比表格：

| **特性/工具** | **Apache JMeter** | **Gatling** | **Apache Benchmark (ab)** | **Tsung** | **Locust** | **Artillery** |
|---------------|-------------------|-------------|---------------------------|-----------|------------|---------------|
| **编写语言** | Java              | Scala (支持 Java DSL) | C                         | Erlang    | Python     | JavaScript    |
| **协议支持** | 多种协议（HTTP, HTTPS, FTP, JDBC等） | HTTP, HTTPS, WebSocket | HTTP                      | HTTP, WebDAV, SOAP, PostgreSQL | HTTP, WebSocket | HTTP, WebSocket |
| **分布式测试** | 是                | 是          | 否                        | 是        | 是         | 是            |
| **脚本语法** | GUI、JMX 文件、支持 BeanShell 脚本 | DSL (Domain-Specific Language) | 命令行参数               | XML       | Python     | YAML/JavaScript |
| **易用性** | 相对复杂，GUI 提供图形化界面 | 相对复杂，学习曲线较陡 | 简单，适用于基本测试       | 适中      | 简单       | 适中          |
| **社区支持** | 大                | 较大        | 大                        | 适中      | 不错       | 适中          |
| **可扩展性** | 非常高，支持插件系统 | 非常高，支持自定义插件 | 有限                      | 有限      | 适中       | 中等          |

这个对比表格提供了一些常见的特性和优缺点。在选择性能测试工具时，建议根据您的具体需求、团队技能和项目背景来进行更详细的比较。


## 介绍一下 Java Microbenchmark Harness (JMH) 

Java Microbenchmark Harness（JMH）是一款由OpenJDK（Java开发工具包的开源实现）提供的微基准测试框架。

JMH旨在帮助Java开发者编写和执行精准、可靠的微基准测试，用于度量Java代码片段的性能。

以下是关于JMH的一些重要信息：

### 1. **特点和目的：**

- **准确性：** JMH专注于提供准确的测量结果，避免一些常见的微基准测试陷阱。
  
- **隔离性：** JMH尽量确保测试的隔离性，避免外部因素对测试结果的影响。

- **统计学分析：** JMH提供统计学分析，以便更好地理解和解释测试结果。

- **丰富的测试选项：** JMH支持丰富的测试选项，例如迭代次数、线程数、预热阶段等，以满足不同测试需求。

### 2. **使用方法：**

#### 2.1 **注解：**
JMH使用注解来标记测试方法和基准测试类。例如，`@Benchmark`注解用于标记基准测试方法。

```java
@Benchmark
public void myBenchmark() {
    // Benchmark code here
}
```

#### 2.2 **模式（Mode）：**
JMH支持多种模式，例如`Throughput`（吞吐量）、`AverageTime`（平均执行时间）、`SampleTime`（采样时间）等，用于测量不同方面的性能。

#### 2.3 **选项（Options）：**
JMH提供丰富的选项，包括迭代次数、线程数、预热阶段等，以便更灵活地配置测试环境。

#### 2.4 **运行：**
可以使用JMH的命令行工具或通过Maven插件来运行测试。JMH会生成详细的测试报告，包括各种统计信息和分析结果。

### 3. **示例代码：**

```java
import org.openjdk.jmh.annotations.*;

@State(Scope.Thread)
public class MyBenchmark {

    private int x = 1;

    @Benchmark
    public void baseline() {
        // Baseline measurement
    }

    @Benchmark
    public int measure() {
        return x;
    }

    public static void main(String[] args) throws RunnerException {
        Options opt = new OptionsBuilder()
                .include(MyBenchmark.class.getSimpleName())
                .forks(1)
                .build();

        new Runner(opt).run();
    }
}
```

### 4. **集成到Maven项目中：**
可以通过Maven插件集成JMH到Maven项目中，方便执行测试。

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.openjdk.jmh</groupId>
            <artifactId>jmh-maven-plugin</artifactId>
            <version>1.32</version>
            <configuration>
                <forks>1</forks>
            </configuration>
        </plugin>
    </plugins>
</build>
```

### 5. **参考资源：**

- [JMH官方网站](https://openjdk.java.net/projects/code-tools/jmh/)
- [JMH GitHub仓库](https://github.com/openjdk/jmh)

JMH是一个强大的工具，尤其适用于需要精确测量和分析Java代码性能的场景。通过使用JMH，开发者可以更准确地了解和比较不同代码实现的性能，以便进行优化和改进。

## 类似 java JMH 的压测开源框架有哪些？

除了Java Microbenchmark Harness (JMH)之外，还有一些其他类似的性能测试和压测开源框架，每个框架都有其独特的特点和适用场景。以下是一些常见的类似JMH的压测开源框架：

1. **Apache Benchmark (ab):**
   - **语言：** C
   - **特点：** Apache软件基金会的工具，用于测试HTTP服务器性能。通过命令行使用，适用于简单的HTTP性能测试。

2. **Vegeta:**
   - **语言：** Go
   - **特点：** 简单而高效的负载测试工具，支持HTTP。使用Go编写，适用于快速的HTTP性能测试。

3. **Hey:**
   - **语言：** Go
   - **特点：** 另一个用Go编写的HTTP性能测试工具，具有简单的命令行接口。

4. **Tsung:**
   - **语言：** Erlang
   - **特点：** 分布式负载测试工具，支持多种协议，包括HTTP、WebDAV、SOAP、WebSocket等。

5. **Locust:**
   - **语言：** Python
   - **特点：** 分布式负载测试工具，使用Python编写，支持通过代码定义用户行为。

6. **Artillery:**
   - **语言：** JavaScript
   - **特点：** 现代的负载测试工具，使用JavaScript编写，支持HTTP、WebSocket等协议。可通过插件扩展功能。

7. **k6:**
   - **语言：** JavaScript
   - **特点：** 现代负载测试工具，使用JavaScript编写，支持本地和云端执行。适用于开发者进行性能测试。

8. **Wrk:**
   - **语言：** C
   - **特点：** 高性能HTTP压测工具，使用Lua脚本配置。适用于HTTP性能测试。

这些工具可以根据具体的需求和技术栈选择。有些工具可能更适合特定的协议或场景，而有些则可能更通用。

根据项目的具体情况，可以选择合适的工具进行性能测试和压测。

# 参考资料 

chat

* any list
{:toc}