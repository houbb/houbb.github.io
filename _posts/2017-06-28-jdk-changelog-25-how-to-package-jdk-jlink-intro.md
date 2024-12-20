---
layout: post
title: java 程序如何打包成为一个可执行文件？jdk jlink 入门实战笔记
date:  2017-06-28 23:15:43 +0800
categories: [Java]
tags: [jdk, java]
published: true
---

# 拓展阅读

[Java Functional java 函数式编程](https://houbb.github.io/2017/06/29/java-functional)

[Java Lambda](https://houbb.github.io/2017/06/28/java-lambda)

# jlink 支持版本

`jlink` 是从 JDK 9 开始支持的。

# 有什么用？

`jlink` 工具会从完整的 JDK 中选择特定的模块和资源，创建一个定制化的运行时环境，这个环境包含了运行你的应用程序所需的所有内容。

以下是 `jlink` 的一些关键点：

1. 自定义运行时：`jlink` 创建的是一个自定义的运行时环境，它只包含应用程序运行所需的 JDK 模块和资源。这意味着你可以创建一个比完整 JDK 小得多的运行时环境。

2. 无需 JRE：因为 `jlink` 生成的运行时环境包含了应用程序运行所需的所有 JDK 组件，所以用户不需要在他们的机器上安装 JRE 或 JDK。

3. 便携性：生成的 `jlink` 镜像是自包含的，可以轻松地分发给其他用户，用户可以直接运行镜像中的 `bin/java` 命令来启动你的应用程序。

4. 模块化：`jlink` 允许你指定需要包含在运行时中的模块，这意味着你可以精确控制哪些 JDK 组件被包含在最终的镜像中。

5. 执行性能：对于某些应用程序来说，使用 `jlink` 生成的自定义运行时可能会比使用完整的 JRE 有更好的启动时间和内存占用。

使用 `jlink` 创建的运行时镜像可以让用户在没有安装 JRE 的情况下运行你的应用程序，这对于部署和分发 Java 应用程序来说是一个很大的优势。

然而，需要注意的是，你的应用程序只能使用到 `jlink` 镜像中包含的 JDK 模块和资源，如果应用程序依赖于未包含在镜像中的其他模块或特性，那么它将无法运行。

# 实战笔记

## jlink 镜像

jlink 的命令：

```
jlink --module-path /path/to/jdk-11/lib --add-modules java.base --output myjlinkimage
```

windows 命令例子：

本地的 jdk 目录为：`D:\tool\jdk\graalvm-jdk-23_windows-x64_bin\graalvm-jdk-23.0.1+11.1\bin\`

## 执行

当前的项目根路径执行

```
D:\tool\jdk\graalvm-jdk-23_windows-x64_bin\graalvm-jdk-23.0.1+11.1\bin\jlink --module-path "D:\tool\jdk\graalvm-jdk-23_windows-x64_bin\graalvm-jdk-23.0.1+11.1\jmods" --add-modules java.base,jdk.graal.compiler --output myjlinkimage
```

执行后，项目下可以看到 myjlinkimage 文件夹。

自测发现 graal 需要引入 `jdk.graal.compiler`。

## maven 项目

我们创建一个最简单的 maven 项目用来测试：

```
src
    ├─main
    │  ├─java
    │  │  └─org
    │  │      └─example
    │  │          └─jlink
    │  │              └─demo
    │  │                      Main.java
    │  │
    │  └─resources
    └─test
        └─java
```

Main.java 终究是一个 hello world.

### pom.xml

这里需要把应用部署为可运行的

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>org.example</groupId>
    <artifactId>jlink-demo</artifactId>
    <version>1.0-SNAPSHOT</version>

    <properties>
        <maven.compiler.source>11</maven.compiler.source>
        <maven.compiler.target>11</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

    <build>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-jar-plugin</artifactId>
                <version>3.2.0</version>
                <configuration>
                    <archive>
                        <manifest>
                            <addClasspath>true</addClasspath>
                            <mainClass>org.example.jlink.demo.Main</mainClass>
                        </manifest>
                    </archive>
                </configuration>
            </plugin>
        </plugins>
    </build>

</project>
```

##  jar 包含

当前项目直接 

```
mvn clean package
```

在 target 下生成 `jlink-demo-1.0-SNAPSHOT.jar` 可执行 jar。

## 运行测试

项目根路径下运行

```
./myjlinkimage/bin/java -jar target/jlink-demo-1.0-SNAPSHOT.jar
```

直接正常输出：

```
Hello world!
```

# chat

## 介绍

`jlink` 是 Java 提供的一个工具，用于定制和创建特定的运行时镜像（runtime image）。

通过 `jlink`，可以从 JDK 中选择所需的模块来构建一个精简的 Java 运行时环境。

这种精简的运行时适用于特定的应用程序，可以显著减少运行时的体积和复杂性。

以下是 `jlink` 的详细介绍：

---

### 1. 核心功能
- 定制运行时环境：只包含应用程序运行所需的 Java 模块。
- 减小体积：通过剔除不必要的模块和功能，显著降低 Java 运行时的体积。
- 优化启动性能：支持对模块进行优化（如压缩或预编译）。
- 平台依赖性：创建的运行时镜像是与构建系统的平台相关的。

---

### 2. 主要特性
- 模块化支持：基于 Java 平台模块系统（JPMS），选择性地包含模块。
- 跨平台支持：支持在指定平台上构建定制运行时镜像。
- 压缩：支持通过各种压缩方法（如 `—compress` 参数）减小镜像大小。
- 去除调试信息：通过参数移除运行时不需要的调试信息。

---

### 3. 使用场景
1. 嵌入式应用开发：在资源受限的设备上运行 Java 应用（如 IoT 设备）。
2. 独立应用程序发布：创建只包含必要模块的可执行包，不需要完整的 JDK 或 JRE。
3. 云端应用优化：为容器化或无服务器环境构建更轻量级的 Java 环境。

---

### 4. 基本命令
#### （1）语法
```bash
jlink --module-path <路径> --add-modules <模块名> [其他选项] --output <目标路径>
```

#### （2）常用选项
- `--module-path`：指定模块路径，通常为 JDK 的 `jmods` 目录。
- `--add-modules`：指定需要包含的模块，模块名以逗号分隔。
- `--output`：指定输出的运行时镜像目录。
- `--compress`：设置压缩级别（`0`、`1`、`2`）。
- `--strip-debug`：移除调试信息。
- `--no-header-files`：不包含头文件。
- `--no-man-pages`：不包含手册页。

---

### 5. 示例
#### （1）构建包含特定模块的运行时镜像
假设需要创建一个运行时镜像，包含 `java.base` 和 `java.sql` 模块：
```bash
jlink --module-path $JAVA_HOME/jmods \
      --add-modules java.base,java.sql \
      --output custom-runtime
```

#### （2）启用压缩和移除调试信息
```bash
jlink --module-path $JAVA_HOME/jmods \
      --add-modules java.base,java.sql \
      --compress=2 --strip-debug \
      --output custom-runtime
```

#### （3）运行生成的镜像
生成的运行时镜像会包含一个自定义的 `bin` 目录和启动脚本，可以直接运行：
```bash
./custom-runtime/bin/java -version
```

---

### 6. 文件结构
生成的运行时镜像结构如下：
```
custom-runtime/
├── bin/           # 包含启动脚本（如 java）
├── conf/          # 配置文件目录
├── include/       # C/C++ 头文件（可选）
├── jmods/         # 模块文件（可选）
├── legal/         # 授权文件
└── lib/           # 必要的库和资源
```

---

### 7. 优势
- 高效：生成的运行时仅包含必要模块，减少了无关部分。
- 安全：移除未使用的模块可以减少潜在的安全漏洞。
- 便携性：自定义运行时镜像无需额外安装 JDK 或 JRE。

---

### 8. 限制
- 模块依赖管理复杂：需要明确知道应用所需的模块及其依赖关系。
- 平台相关：生成的运行时镜像与构建时的平台相关，无法跨平台使用。
- 不支持动态加载模块：运行时的模块集是固定的。

---

### 9. 小结

`jlink` 是 Java 模块化的重要工具，特别适合需要精简、优化的场景。

与传统的 JDK 或 JRE 不同，它提供了按需裁剪的能力，可以更好地满足嵌入式、微服务等场景的需求。






# 参考资料

https://github.com/orphan-oss/launch4j-maven-plugin/blob/master/src/main/resources/README.adoc


* any list
{:toc}