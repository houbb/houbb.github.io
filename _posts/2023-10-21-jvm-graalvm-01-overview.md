---
layout: post
title: 云时代的 jvm graalvm-01-overview
date: 2023-10-21 21:01:55 +0800
categories: [Tool]
tags: [tool, jvm, sh]
published: true
---


# GraalVM 概览

GraalVM 将您的 Java 应用程序提前编译为独立的二进制文件。

这些二进制文件体积较小，启动速度最多可快至传统方式的 100 倍，无需预热即可达到最佳性能，并且相较于在 Java 虚拟机（JVM）上运行的应用程序，使用的内存和 CPU 资源更少。

GraalVM 减小了您的应用程序的攻击面。它从应用程序二进制文件中排除了未使用的类、方法和字段。它将反射和其他动态 Java 语言特性限制为构建时期。

在运行时，它不加载任何未知的代码。

流行的微服务框架，如 Spring Boot、Micronaut、Helidon 和 Quarkus，以及云平台，如 Oracle Cloud Infrastructure、Amazon Web Services、Google Cloud Platform 和 Microsoft Azure，都支持 GraalVM。

借助基于配置文件的优化和 G1（Garbage-First）垃圾回收器，您可以获得与在 Java 虚拟机（JVM）上运行的应用程序相比，更低的延迟和相当或更好的最佳性能和吞吐量。

您可以在您的集成开发环境（IDE）中像使用其他任何 Java 开发工具包一样使用 GraalVM JDK。

![gvm](http://coding.idealworld.group/img/posts/graalvm-core-features/2021-01-20-08-37-58.png)

# 开始使用 GraalVM

GraalVM 将您的 Java 应用程序提前编译为独立的二进制文件，可以立即启动，无需预热即可达到最佳性能，并且使用更少的资源。

在这里，您将找到有关安装 GraalVM 并使用其运行基本应用程序的信息。

如果您是 GraalVM 的新用户，我们建议您从 GraalVM 简介开始，您将在那里找到关于 GraalVM 的优势、可用分发版本、支持的平台、功能支持和许可等信息。

如果您已经安装了 GraalVM 并且有使用经验，您可以跳过本页面，直接查阅深入的参考手册。

请选择您的操作系统，然后按照您特定平台的安装步骤进行操作：

我这里使用 windows10 做测试，所以选择 windows

> [https://www.graalvm.org/latest/docs/getting-started/windows/](https://www.graalvm.org/latest/docs/getting-started/windows/)

## Installation on Windows Platforms

按照以下步骤安装 GraalVM：

1. 前往 GraalVM 下载页面。选择 Java 版本为 21，操作系统为 Windows，然后进行下载。

2. 切换至您想安装 GraalVM 的目录，然后将 .zip 压缩文件移动到该目录。

3. 解压缩文件到您的文件系统。

4. 在计算机上可以安装多个 JDK。接下来的步骤是配置运行时环境。通过命令行设置环境变量的方式在 Windows 8、10 和 11 上都可以使用。

将 `JAVA_HOME` 环境变量设置为指向 GraalVM 安装目录的路径：


为了便于开发，先备份一下以前的路径。

```
JAVA_HOME=C:\Program Files\Java\jdk1.8.0_192
```

改为：

```
JAVA_HOME=D:\tools\graalvm\graalvm-jdk-21.0.1+12.1
```

### 验证

```
> java -version
java version "21.0.1" 2023-10-17
Java(TM) SE Runtime Environment Oracle GraalVM 21.0.1+12.1 (build 21.0.1+12-jvmci-23.1-b19)
Java HotSpot(TM) 64-Bit Server VM Oracle GraalVM 21.0.1+12.1 (build 21.0.1+12-jvmci-23.1-b19, mixed mode, sharing)
```

## windows 下的准备工作

> https://www.graalvm.org/latest/docs/getting-started/windows/

在 Windows 上，Native Image 需要使用 Visual Studio 和 Microsoft Visual C++（MSVC）。

您可以使用 Visual Studio 2022 版本 17.1.0 或更高版本。

### Install Visual Studio Build Tools and Windows SDK

1) 请从 [visualstudio.microsoft.com](https://visualstudio.microsoft.com/thank-you-downloading-visual-studio/?sku=BuildTools&rel=16) 下载 Visual Studio Build Tools（C 开发环境）。

2) 通过点击 .exe 文件启动 Visual Studio Build Tools 安装，然后点击“继续”：

3) 在主窗口中勾选“Desktop development with C++”复选框。同时，在右侧的“Installation Details”下，选择“Windows SDK”，然后点击“安装”按钮。

我们选择 17.7.5 开源社区版本。

![tools](https://www.graalvm.org/docs/getting-started/img/desktop_development_with_C.png)

这个下载会比较耗时，需要耐心等待。

（ps: 早知道直接使用 linux 验证了）

安装完成后，应该需要重启一下电脑。

### 验证

原生态编译

```
$ native-image.cmd --version
native-image 21.0.1 2023-10-17
GraalVM Runtime Environment Oracle GraalVM 21.0.1+12.1 (build 21.0.1+12-jvmci-23.1-b19)
Substrate VM Oracle GraalVM 21.0.1+12.1 (build 21.0.1+12, serial gc, compressed references)
```

要使用 Native Build Tools Maven 插件构建项目，请运行：

```
mvnw.cmd native:compile
```

要使用 Native Build Tools Gradle 插件构建项目，请运行：

```
gradlew.bat nativeCompile
```

# 编译测试验证

## 编译 java 代码

- HelloWorld.java

```java
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, Native World!");
    }
} 
```

编译一下

```
javac HelloWorld.java
java HelloWorld
```

输出：

```
Hello, Native World!
```

## 原生镜像

我们通过 native-iamge 打包一个镜像。

```sh
$ native-image.cmd HelloWorld 
```

日志如下：

```
$ native-image.cmd HelloWorld
========================================================================================================================
GraalVM Native Image: Generating 'helloworld' (executable)...
========================================================================================================================
For detailed information and explanations on the build output, visit:
https://github.com/oracle/graal/blob/master/docs/reference-manual/native-image/BuildOutput.md
------------------------------------------------------------------------------------------------------------------------
Warning: The host machine does not support all features of 'x86-64-v3'. Falling back to '-march=compatibility' for best compatibility.

[1/8] Initializing...                                                                                    (0.0s @ 0.06GB)
Error: On Windows, GraalVM Native Image for JDK 21 requires Visual Studio 2022 version 17.1.0 or later (C/C++ Optimizing Compiler Version 19.31 or later).
Compiler info detected: cl.exe (microsoft, ??, 19.29.30152)
Error: To prevent native-toolchain checking provide command-line option -H:-CheckToolchain
------------------------------------------------------------------------------------------------------------------------
                         0.1s (3.6% of total time) in 7 GCs | Peak RSS: 0.48GB | CPU load: 4.28
========================================================================================================================
Finished generating 'helloworld' in 2.6s.
```

说明我们要安装比较新的版本。卸载重新安装。

然后依然报错：

```
Error: Native-image building on Windows currently only supports target architecture: AMD64 (?? unsupported)
Error: To prevent native-toolchain checking provide command-line option -H:-CheckToolchain
```

我们直接忽略进行编译：

```
$ native-image.cmd HelloWorld -H:-CheckToolchain
```

日志如下：

```
$ native-image.cmd HelloWorld -H:-CheckToolchain
Warning: The option '-H:-CheckToolchain' is experimental and must be enabled via '-H:+UnlockExperimentalVMOptions' in the future.
Warning: Please re-evaluate whether any experimental option is required, and either remove or unlock it. The build output lists all active experimental options, including where they come from and possible alternatives. If you think an experimental option should be considered as stable, please file an issue.
========================================================================================================================
GraalVM Native Image: Generating 'helloworld' (executable)...
========================================================================================================================
For detailed information and explanations on the build output, visit:
https://github.com/oracle/graal/blob/master/docs/reference-manual/native-image/BuildOutput.md
------------------------------------------------------------------------------------------------------------------------
Warning: The host machine does not support all features of 'x86-64-v3'. Falling back to '-march=compatibility' for best compatibility.
[1/8] Initializing...                                                                                   (10.9s @ 0.12GB)
 Java version: 21.0.1+12, vendor version: Oracle GraalVM 21.0.1+12.1
 Graal compiler: optimization level: 2, target machine: compatibility, PGO: ML-inferred
 C compiler: cl.exe (null, null, 0.0.0)
 Garbage collector: Serial GC (max heap size: 80% of RAM)
 1 user-specific feature(s):
 - com.oracle.svm.thirdparty.gson.GsonFeature
------------------------------------------------------------------------------------------------------------------------
 1 experimental option(s) unlocked:
 - '-H:-CheckToolchain' (origin(s): command line)
------------------------------------------------------------------------------------------------------------------------
Build resources:
 - 24.98GB of memory (78.2% of 31.94GB system memory, determined at start)
 - 20 thread(s) (100.0% of 20 available processor(s), determined at start)
[2/8] Performing analysis...  [******]                                                                   (5.6s @ 0.19GB)
    2,080 reachable types   (61.3% of    3,394 total)
    1,994 reachable fields  (45.8% of    4,351 total)
    9,610 reachable methods (38.4% of   25,047 total)
      764 types,   109 fields, and   474 methods registered for reflection
       53 types,    30 fields, and    48 methods registered for JNI access
        1 native library: version
[3/8] Building universe...                                                                               (1.5s @ 0.25GB)
[4/8] Parsing methods...      [*]                                                                        (1.6s @ 0.30GB)
[5/8] Inlining methods...     [***]                                                                      (0.7s @ 0.28GB)
[6/8] Compiling methods...    [***]                                                                     (11.6s @ 0.23GB)
[7/8] Layouting methods...    [*]                                                                        (1.6s @ 0.28GB)
[8/8] Creating image...       [**]                                                                       (2.2s @ 0.28GB)
   3.38MB (46.78%) for code area:     4,540 compilation units
   3.77MB (52.16%) for image heap:   57,035 objects and 71 resources
  78.88kB ( 1.06%) for other data
   7.23MB in total
------------------------------------------------------------------------------------------------------------------------
Top 10 origins of code area:                                Top 10 object types in image heap:
   1.82MB java.base                                          880.80kB byte[] for code metadata
   1.30MB svm.jar (Native Image)                             720.49kB byte[] for java.lang.String
  94.52kB com.oracle.svm.svm_enterprise                      433.70kB heap alignment
  30.02kB org.graalvm.nativeimage.base                       382.17kB java.lang.String
  29.51kB org.graalvm.collections                            330.67kB java.lang.Class
  21.17kB jdk.internal.vm.ci                                 155.28kB java.util.HashMap$Node
  20.14kB jdk.proxy3                                         114.01kB char[]
  18.18kB jdk.proxy1                                         100.83kB byte[] for reflection metadata
  17.21kB jdk.internal.vm.compiler                            91.66kB java.lang.Object[]
   7.77kB jdk.proxy2                                          81.25kB com.oracle.svm.core.hub.DynamicHubCompanion
  805.00B for 1 more packages                                573.13kB for 548 more object types
                              Use '-H:+BuildReport' to create a report with more details.
------------------------------------------------------------------------------------------------------------------------
Security report:
 - Binary does not include Java deserialization.
 - Use '--enable-sbom' to embed a Software Bill of Materials (SBOM) in the binary.
Warning: The host machine does not support all features of 'x86-64-v3'. Falling back to '-march=compatibility' for best compatibility.
------------------------------------------------------------------------------------------------------------------------
Recommendations:
 PGO:  Use Profile-Guided Optimizations ('--pgo') for improved throughput.
 INIT: Adopt '--strict-image-heap' to prepare for the next GraalVM release.
 HEAP: Set max heap for improved and more predictable memory usage.
 CPU:  Enable more CPU features with '-march=native' for improved performance.
 QBM:  Use the quick build mode ('-Ob') to speed up builds during development.
------------------------------------------------------------------------------------------------------------------------
                        1.7s (4.4% of total time) in 258 GCs | Peak RSS: 0.90GB | CPU load: 9.46
------------------------------------------------------------------------------------------------------------------------
Produced artifacts:
 D:\tools\graalvm\code\helloworld.exe (executable)
========================================================================================================================
Finished generating 'helloworld' in 36.6s.
```

生成结果

```
HelloWorld.class  HelloWorld.java  helloworld.exe*
```

直接执行

```
$ $ ./helloworld.exe
Hello, Native World!
```

# windows10 WSL2 安装

## 环境

windows wls2 

```
$ lsb_release -a
No LSB modules are available.
Distributor ID: Ubuntu
Description:    Ubuntu 22.04.2 LTS
Release:        22.04
Codename:       jammy
```

## install 

这里我们通过命令安装。

### unzip

```
sudo apt install unzip
```

### zip

```
sudo apt install zip
```

### sdkman

```
curl -s "https://get.sdkman.io" | bash
```

启用

```
source "/home/houbinbin/.sdkman/bin/sdkman-init.sh"
```

### graalvm

```
$ sdk install java 21-graal
```

此时直接安装完成，无需额外配置。

## 验证

```
$ java --version
java 21 2023-09-19
Java(TM) SE Runtime Environment Oracle GraalVM 21+35.1 (build 21+35-jvmci-23.1-b15)
Java HotSpot(TM) 64-Bit Server VM Oracle GraalVM 21+35.1 (build 21+35-jvmci-23.1-b15, mixed mode, sharing)
```

## 编译

java 代码

```java
public class HelloWorld {
  public static void main(String[] args) {
    System.out.println("Hello, World!");
  }
}
```

编译&运行

```
javac HelloWorld.java
java HelloWorld
```

输出：

```
Hello, World!
```

## native 编译

```
native-image HelloWorld
```

### 报错

```
It appears as though libz:.a is missing. Please install it.
```

系统上缺少 libz.a 库文件。

```
sudo apt-get install zlib1g-dev
```

### 编译日志

```
========================================================================================================================
GraalVM Native Image: Generating 'helloworld' (executable)...
========================================================================================================================
Warning: The host machine does not support all features of 'x86-64-v3'. Falling back to '-march=compatibility' for best compatibility.
[1/8] Initializing...                                                                                    (7.9s @ 0.07GB)
 Java version: 21+35, vendor version: Oracle GraalVM 21+35.1
 Graal compiler: optimization level: 2, target machine: compatibility, PGO: ML-inferred
 C compiler: gcc (linux, x86_64, 11.4.0)
 Garbage collector: Serial GC (max heap size: 80% of RAM)
 1 user-specific feature(s):
 - com.oracle.svm.thirdparty.gson.GsonFeature
------------------------------------------------------------------------------------------------------------------------
Build resources:
 - 11.68GB of memory (74.9% of 15.59GB system memory, determined at start)
 - 20 thread(s) (100.0% of 20 available processor(s), determined at start)
[2/8] Performing analysis...  [******]                                                                   (7.0s @ 0.20GB)
    2,157 reachable types   (61.4% of    3,513 total)
    2,102 reachable fields  (46.4% of    4,531 total)
    9,982 reachable methods (38.4% of   25,973 total)
      741 types,   112 fields, and   474 methods registered for reflection
       49 types,    32 fields, and    48 methods registered for JNI access
        4 native libraries: dl, pthread, rt, z
[3/8] Building universe...                                                                               (1.9s @ 0.25GB)
[4/8] Parsing methods...      [*]                                                                        (1.8s @ 0.32GB)
[5/8] Inlining methods...     [***]                                                                      (0.8s @ 0.35GB)
[6/8] Compiling methods...    [****]                                                                    (12.7s @ 0.40GB)
[7/8] Layouting methods...    [**]                                                                       (2.0s @ 0.49GB)
[8/8] Creating image...       [**]                                                                       (2.2s @ 0.57GB)
   3.43MB (44.72%) for code area:     4,740 compilation units
   3.82MB (49.80%) for image heap:   58,259 objects and 29 resources
 430.29kB ( 5.48%) for other data
   7.67MB in total
------------------------------------------------------------------------------------------------------------------------
Top 10 origins of code area:                                Top 10 object types in image heap:
   1.96MB java.base                                          929.42kB byte[] for code metadata
   1.21MB svm.jar (Native Image)                             733.25kB byte[] for java.lang.String
  92.14kB com.oracle.svm.svm_enterprise                      390.14kB java.lang.String
  29.56kB org.graalvm.nativeimage.base                       373.66kB heap alignment
  27.79kB org.graalvm.collections                            342.88kB java.lang.Class
  21.04kB jdk.internal.vm.ci                                 156.50kB java.util.HashMap$Node
  19.77kB jdk.proxy3                                         114.01kB char[]
  17.84kB jdk.proxy1                                         103.70kB byte[] for reflection metadata
  16.88kB jdk.internal.vm.compiler                            88.66kB java.lang.Object[]
   7.72kB jdk.proxy2                                          84.26kB com.oracle.svm.core.hub.DynamicHubCompanion
  806.00B for 1 more packages                                595.52kB for 564 more object types
                              Use '-H:+BuildReport' to create a report with more details.
------------------------------------------------------------------------------------------------------------------------
Security report:
 - Binary does not include Java deserialization.
 - Use '--enable-sbom' to embed a Software Bill of Materials (SBOM) in the binary.
Warning: The host machine does not support all features of 'x86-64-v3'. Falling back to '-march=compatibility' for best compatibility.
------------------------------------------------------------------------------------------------------------------------
Recommendations:
 G1GC: Use the G1 GC ('--gc=G1') for improved latency and throughput.
 PGO:  Use Profile-Guided Optimizations ('--pgo') for improved throughput.
 INIT: Adopt '-H:+StrictImageHeap' to prepare for the next GraalVM release.
 HEAP: Set max heap for improved and more predictable memory usage.
 CPU:  Enable more CPU features with '-march=native' for improved performance.
------------------------------------------------------------------------------------------------------------------------
                       2.1s (5.4% of total time) in 126 GCs | Peak RSS: 1.24GB | CPU load: 11.12
------------------------------------------------------------------------------------------------------------------------
Produced artifacts:
 /home/houbinbin/helloworld (executable)
========================================================================================================================
Finished generating 'helloworld' in 37.2s.
```

生成好了对应的 helloworld 文件。

### 测试执行

```
$ ls

HelloWorld.class  HelloWorld.java  ai  helloworld  svm_err_b_20231021T233609.989_pid1384.md
```

```sh
$ ./helloworld
Hello, World!
```

当然，这个 helloworld 的文件内容依然非常复杂。

# 通过 sdk 切换 java 版本

查看版本：

```
sdk list java
```

切换版本：

```
sdk use java 8.0.302-zulu
```

发现没安装：

```
sdk install java 8.0.302-zulu
```

版本：

```
$ java -version
openjdk version "1.8.0_302"
OpenJDK Runtime Environment (Zulu 8.56.0.21-CA-linux64) (build 1.8.0_302-b08)
OpenJDK 64-Bit Server VM (Zulu 8.56.0.21-CA-linux64) (build 25.302-b08, mixed mode)
```

# chat

## Q1-谈一谈 java 的 graalVm

GraalVM 是由 Oracle 开发的一种高性能运行时，它允许在同一个虚拟机中运行多种语言，包括 Java、JavaScript、Ruby、Python 等。

与传统的 Java 虚拟机（JVM）相比，GraalVM 提供了更快的启动时间和更低的内存消耗，同时还支持即时编译（Just-In-Time Compilation）和 Ahead-of-Time 编译（AOT Compilation）等多种编译方式，使得应用程序在各种场景下都能获得更好的性能表现。

以下是 GraalVM 的一些关键特性和用途：

### 1. **多语言支持**
GraalVM 支持多种编程语言，包括 Java、JavaScript、Ruby、Python、R 和 WebAssembly。

这种多语言支持使得开发人员可以在同一个运行时环境中混合使用多种语言，从而更轻松地构建多语言应用程序。

### 2. **即时编译（JIT）和 Ahead-of-Time 编译（AOT）**

GraalVM 提供了强大的即时编译器，可以将字节码转换为本地机器代码，提供更好的性能。此外，GraalVM 还支持 Ahead-of-Time 编译，可以在应用程序部署之前将代码编译成本地机器码，从而提高启动速度和降低内存消耗。

### 3. **原生图像**

GraalVM 允许将 Java 应用程序编译为本地可执行文件，而不依赖于 JVM。这种方式可以减少应用程序的启动时间和内存消耗，适用于服务器端应用程序和云环境中的函数计算等场景。

### 4. **性能优化**

GraalVM 的即时编译器在某些场景下可以提供比传统 JVM 更好的性能。它通过使用全程序分析（Whole Program Analysis）来进行优化，可以生成更高效的机器码，提供更好的执行性能。

### 5. **Polyglot 编程**

GraalVM 支持多语言混编，这意味着你可以在同一个应用程序中使用多种语言编写代码，而这些语言可以相互调用和交互。例如，你可以使用 Java 编写的函数直接调用 JavaScript 函数，而不需要通过 REST 接口或其他通信方式。

### 6. **嵌入式扩展**

GraalVM 允许将它嵌入到各种应用程序和工具中，包括数据库、IDE 和其他工具。

这种嵌入式扩展性使得开发人员可以更灵活地使用 GraalVM 的功能，从而实现更多样化的应用场景。

需要注意的是，虽然 GraalVM 提供了很多强大的特性，但在选择使用它时，你需要考虑你的具体需求和应用场景。

不同的应用程序可能受益于 GraalVM 的不同特性，因此在使用之前最好进行详细的性能测试和分析。

# 使用GraalVM原生映像彻底革新Java

## 关键要点

GraalVM Native Image是一种提前编译技术，可生成本机平台可执行文件。

本机可执行文件是容器和云部署的理想选择，因为它们体积小，启动速度非常快，而且需要的CPU和内存明显减少。

在无分布甚至Scratch容器映像上部署本机可执行文件，以减小大小并提高安全性。

通过配置文件引导的优化和G1垃圾收集器，使用GraalVM Native Image构建的本机可执行文件可以实现与JVM相当的峰值吞吐量。

GraalVM Native Image在Spring Boot、Micronaut、Quarkus、Gluon Substrate等领先Java框架的支持下获得了大量采用。

Java主导了企业应用。但在云中，Java比一些竞争对手更昂贵。本机编译使云中的Java更便宜：它创建的应用程序启动速度更快，内存使用更少。

GraalVM自三年前推出以来，在Java开发中引发了一场革命。GraalVM讨论最多的功能之一是Native Image，它基于提前（AOT）编译。它解锁了本机应用程序的运行时性能配置文件，同时保持了Java生态系统中熟悉的开发人员生产力和工具。

## Java应用程序的传统执行

Java平台中最强大和最有趣的部分之一，实现了卓越的峰值性能，是Java虚拟机（JVM）执行代码的方式。

首次运行应用程序时，虚拟机将解释代码并收集分析信息。尽管JVM解释器的性能很好，但它没有运行编译代码那么快。

这就是为什么Oracle的JVM (HotSpot)还包含实时（JIT）编译器，这些编译器在程序执行时将应用程序代码编译为计算机代码。

因此，如果您的代码“预热”-频繁执行，它将被C1 JIT编译器编译为机器码。然后，如果它仍然执行得足够频繁，并达到某些阈值，它将由顶级JIT编译器（C2或Graal编译器）编译。顶层编译器根据有关哪些代码分支最常执行、循环执行频率以及多态代码中使用哪些类型的分析信息执行优化。

有时编译器会执行推测性优化。例如，JVM可以根据它收集的分析信息生成方法的优化、编译版本。

但是，由于JVM上的代码执行是动态的–如果它所做的假设在以后失效–JVM将去优化：它将忽略编译的代码并恢复到解释模式。正是这种灵活性使JVM如此强大：它开始快速执行代码，利用优化编译器来处理频繁执行的代码，并推测应用更积极的优化。

乍一看，这种方法似乎是运行应用程序的理想方式。然而，像大多数事情一样，即使是这种方法也会带来成本和权衡；那么它们在这里是什么呢？

当JVM执行其操作（如验证代码、加载类、动态编译和收集分析信息）时，它将进行需要大量CPU时间的复杂计算。

除了这个成本之外，JVM还需要大量的内存来存储分析信息，并需要相当大的时间和内存来启动。

随着许多公司将应用程序部署到云中，这些成本变得更加重要，因为启动时间和内存直接影响部署应用程序的成本。

那么，有没有办法减少启动时间和内存使用，并保持我们都喜欢的Java生产力、库和工具？

答案是“是”，这就是GraalVM Native Image所做的。

## GraalVM for Win

GraalVM 10年前开始是Oracle Labs的一个研究项目。

Oracle实验室是Oracle的一个研发分支，研究编程语言和虚拟机、机器学习和安全、图形处理和其他领域。GraalVM是Oracle Labs的一个很好的例子–它基于多年的研究和100多篇发表的学术论文。

项目的核心是Graal编译器–一个现代的、高度优化的编译器，从零开始创建。多亏了许多高级优化，在许多情况下，它生成的代码比C2编译器更好。其中一个优化是部分逃逸分析：它通过在对象不逃逸编译单元的分支中的标量替换来删除堆上不必要的对象分配，并且Graal编译器确保对象存在于堆中的分支中。

这种方法减少了应用程序的内存占用，因为堆上的对象较少。

它还降低了CPU负载，因为需要减少垃圾收集。此外，GraalVM中的高级猜测通过利用动态运行时反馈生成更快的机器代码。通过推测某些程序部分在执行期间不会运行，GraalVM编译器可以使代码更加高效。

您可能会惊讶地发现Graal编译器主要是用Java编写的。如果您查看GraalVM的核心GitHub存储库，您会发现90%以上的代码是用Java编程语言编写的，这再次证明了Java是多么强大和通用。

## 本机映像的工作原理

Graal编译器还作为提前（AOT）编译器工作，生成本机可执行文件。

考虑到Java的动态性质，这到底是如何工作的？

与JIT模式不同，编译和执行同时发生，在AOT模式下，编译器在构建期间执行所有编译，在执行之前。

这里的主要想法是将所有的“繁重”–昂贵的计算–转移到构建时间上，这样它就可以完成一次，然后在运行时生成的可执行文件快速启动，从一开始就准备好了，因为所有的东西都是预先计算和预编译的。

GraalVM“本机映像”实用程序将Java字节码作为输入，并输出本机可执行文件。为此，实用程序在封闭世界假设下对字节码执行静态分析。在分析期间，实用程序查找应用程序实际使用的所有代码，并消除所有不必要的代码。

这三个关键概念有助于您更好地理解本机映像生成过程：

点到分析。GraalVM本机映像确定哪些Java类、方法和字段在运行时可访问，并且只有这些类、方法和字段将包含在本机可执行文件中。点到分析从所有入口点开始，通常是应用程序的主要方法。分析迭代处理所有可传递的代码路径，直到到达固定点并结束分析。这不仅适用于应用程序代码，还适用于库和JDK类–将应用程序打包为自包含二进制文件所需的一切。

构建时初始化。GraalVM Native Image默认在运行时初始化类，以确保行为正确。但是，如果Native Image可以证明某些类可以安全初始化，它将在构建时初始化它们。这使得运行时初始化和检查变得不必要，并提高了性能。

堆快照。Native Image中的堆快照是一个非常有趣的概念，值得有自己的文章。在映像构建过程中，静态初始化器分配的Java对象以及所有可访问的对象都会写入映像堆。这意味着应用程序使用预填充堆启动速度要快得多。

有趣的是，点到分析使对象在图像堆中可访问，而构建图像堆的快照可以使新方法可访问点到分析。

因此，点到分析和堆快照将迭代执行，直到达到固定点：

![点到分析](https://communityfile-drcn.op.hicloud.com/FileServer/getFile/cmtybbs/042/413/002/0000000000042413002.20220902092735.95081690893211946281447375832481:50531002070057:2800:B9FA13E6E1191F6C0D49276BCB051A82E6C1076D8E203A09D729B040CCFEB476.jpeg)

## 原生镜像构建流程

分析完成后，Graal将所有可访问的代码编译为特定于平台的本机可执行文件。

该可执行文件本身功能齐全，不需要JVM运行。

因此，您可以获得一个纤薄而快速的Java应用程序本机可执行版本：一个执行完全相同的功能，但只包含必要的代码及其所需的依赖项。

但是，谁来负责本机可执行文件中的内存管理和线程调度等功能呢？

为此，本机映像包括Substrate VM -一个提供运行时组件的精简VM实现，如垃圾收集器和线程调度器。

就像Graal编译器一样，Substrate VM是用Java编程语言编写的，并由GraalVM Native Image编译成本机代码！

多亏了AOT编译和堆快照，本机映像为您的Java应用程序提供了全新的性能配置文件。接下来让我们仔细看看这个。

## 将Java启动性能提升到一个新的水平

您可能听说过，由Native Image生成的可执行文件具有很好的启动性能。

但这到底意味着什么？

即时启动。与在JVM上运行不同的是，在JVM上，代码首先被验证、解释，然后（预热后）最终编译，本机可执行文件从一开始就附带了优化的机器码。

我喜欢使用的另一个术语是即时性能–应用程序可以在执行的最初毫秒内执行有意义的工作，而没有任何分析或编译开销。

## JIT和原生镜像模式的启动时间效应

内存效率。本机可执行文件既不需要JVM及其JIT编译基础架构，也不需要用于编译代码、配置文件数据和字节码缓存的内存。它所需要的只是可执行文件和应用程序数据的内存。

以下是一个例子：

![demo](https://communityfile-drcn.op.hicloud.com/FileServer/getFile/cmtybbs/042/413/002/0000000000042413002.20220902092735.61291530463246524807238088453828:50531002070057:2800:1406E7EB45E1DF1435833A45ACC862271AFF6D347FC3FC69AEB0889461B32B62.jpeg)

## JIT和Native镜像模式下的内存和CPU占用率

上面的图表显示了Web服务器在JVM上（左）和作为本机可执行文件（右）的运行时行为。

青绿色线显示了使用的内存：JIT模式下200 MB，而本机可执行文件为40 MB。

红线显示CPU活动：JVM在前面描述的预热JIT活动期间大量使用CPU，而本机可执行文件几乎不使用CPU，因为所有昂贵的编译操作都发生在构建时。这种快速且资源高效的运行时行为使Native Image成为一个很好的部署模型，在这种模型中，以更短的时间使用更少的资源显著降低成本-微服务、无服务器和一般云工作负载。

包装尺寸。本机可执行文件仅包含所需的代码。这就是为什么它比应用程序代码、库和JVM的总和要小得多。

在某些情况下，例如在资源受限的环境中工作，应用程序的打包大小可能很重要。公用事业，如UPX进一步压缩本机可执行文件。

## 与JVM不等的峰值性能

不过，峰值性能呢？当所有内容都提前编译时，本机映像如何优化运行时的峰值吞吐量？

我们正在努力确保本机映像提供卓越的峰值性能和快速启动。

已经有几种方法可以提高本机可执行文件的峰值性能：

配置文件引导优化。

由于Native Image会提前优化和编译代码，默认情况下，它无法访问运行时分析信息来在应用程序运行时优化代码。

解决这一问题的一种方法是使用配置文件引导优化（PGO）。

使用PGO，开发人员可以运行应用程序，收集分析信息，然后将其反馈到本机映像生成过程中。“本机映像”实用程序使用此信息根据应用程序的运行时行为优化生成的可执行文件的性能。PGO在GraalVM Enterprise中可用，这是GraalVM的商业版本，提供由甲骨文。

本机映像中的内存管理。

由Native Image生成的可执行文件中的默认垃圾收集器是Serial GC，这对于具有小堆的微服务是最佳的。还有其他GC选项可用：

串行GC现在有了一个新的策略，为年轻一代启用幸存者空间，以减少应用程序运行时内存占用。

自引入此策略以来，我们测量了典型微服务工作负载（如Spring Petclinic）的峰值吞吐量提高高达23.22%。

或者，您可以使用低延迟G1垃圾收集器以获得更好的吞吐量（在GraalVM Enterprise中可用）。

G1最适合较大的堆。

通过PGO和G1 GC，本机可执行文件实现了与JVM相当的峰值性能：

![perf](https://communityfile-drcn.op.hicloud.com/FileServer/getFile/cmtybbs/042/413/002/0000000000042413002.20220902092735.31292074086699172040004400366975:50531002070057:2800:F80715F790FF76DA17D9B3B9BCE42D530DE4D0C27FB946949B393D42679B20D6.jpeg)

## 改变Java的云游戏

本机映像对云部署产生了巨大的影响，在云部署中，它可能会对应用程序的资源消耗配置文件产生巨大影响。

我们已经了解到，由Native Image生成的本机可执行文件启动速度很快，需要的内存更少。它对云部署到底意味着什么，GraalVM如何帮助您最小化Java容器映像？

正如我们已经确定的那样，由原生映像生成的应用程序不需要JVM来运行：它们可以是自包含的，并包括应用程序执行所需的一切。这意味着您可以将应用程序放入一个纤薄的Docker映像中，并且它将独立运行。

图像大小将取决于应用程序的功能以及它包括的依赖项。一个基本的“Hello,World!”应用程序，使用Java微服务框架构建，大约为20 MB。

使用本机映像，您还可以构建静态和大部分静态可执行文件。一个主要是静态的本机可执行文件静态链接到所有库，但容器映像提供的“libc”除外。您可以将所谓的无分布式容器映像用于轻量级部署。

无分发映像仅包括运行应用程序的库，没有shell、包管理器和其他程序。

# 小结

# 参考资料

https://www.graalvm.org/latest/docs/introduction/

https://www.graalvm.org/latest/docs/getting-started/

[GraalVM 使用初体验](https://jasonkayzk.github.io/2023/03/20/GraalVM%E4%BD%BF%E7%94%A8%E5%88%9D%E4%BD%93%E9%AA%8C/)

[GraalVM系列（一）：JVM的未来——GraalVM集成入门](http://coding.idealworld.group/2020/06/12/getting-started-with-graalvm/)

https://jasonkayzk.github.io/2023/03/20/GraalVM%E4%BD%BF%E7%94%A8%E5%88%9D%E4%BD%93%E9%AA%8C/

https://waylau.com/reinventing-java-with-graalvm-native-images/

https://aws.amazon.com/cn/blogs/china/using-graalvm-build-minimal-docker-images-java-applications/

https://www.infoq.cn/article/graalvm-ten-things

http://coding.idealworld.group/2021/01/21/graalvm-core-features/

http://coding.idealworld.group/2020/06/12/getting-started-with-graalvm/

https://blog.csdn.net/wangpaiblog/article/details/122422987

* any list
{:toc}