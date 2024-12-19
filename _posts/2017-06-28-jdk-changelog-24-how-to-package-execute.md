---
layout: post
title: java 程序如何打包成为一个可执行文件？
date:  2017-06-28 23:15:43 +0800
categories: [Java]
tags: [jdk, java]
published: true
---

# 拓展阅读

[Java Functional java 函数式编程](https://houbb.github.io/2017/06/29/java-functional)

[Java Lambda](https://houbb.github.io/2017/06/28/java-lambda)

# chat

## 如何把 java 程序打包成为一个可执行的文件？

使用第三方工具创建可执行文件：

   Java本身不提供直接生成`.exe`文件的功能，你需要使用第三方工具，如Launch4j、IzPack或JSmooth等，来创建Windows下的可执行文件。

   - **Launch4j**：
     Launch4j是一个流行的工具，用于将JAR文件打包成Windows下的`.exe`文件。你需要下载Launch4j，并按照其文档配置一个XML配置文件，然后使用Launch4j的命令行工具或图形界面来生成`.exe`文件。

   - **IzPack**：
     IzPack是一个用于创建跨平台安装程序的工具，它也可以用来生成`.exe`文件。

   - **JSmooth**：
     JSmooth是一个用于将Java应用程序打包成可执行文件的工具，支持Windows、Linux和Mac。

## 有不需要安装 jre 的方式不

确实存在不需要安装JRE的方式，可以通过以下方法实现：

### 1. 使用`jpackage`工具

`jpackage`是从Java 14开始提供的一个新工具，它可以帮助开发者为模块化或非模块化的Java应用程序生成指定系统平台的可执行程序，而不需要预先安装JRE环境。`jpackage`实际上是将JRE和JAR文件以及所有必要依赖项一起打包生成指定平台的可执行程序，例如Windows上的`.exe`或macOS上的`.dmg`。

每种格式都必须在其运行的平台上构建，没有跨平台支持。

**使用步骤**：

1. **编译Java程序**：确保你的Java程序已经编译成`.class`文件，并打包成JAR文件。
2. **使用`jpackage`**：通过`jpackage`命令行工具来打包你的JAR文件和JRE，生成可执行文件。

   例如，对于一个名为`app.jar`的JAR文件，可以使用以下命令：

   ```bash
   jpackage --input path/to/your/jar --name MyApp --main-jar app.jar --main-class com.example.Main --type exe --win-console
   ```

   这个命令会生成一个包含JRE的可执行文件，用户无需安装JRE即可运行。

### 2. 使用第三方工具

除了`jpackage`，还有一些第三方工具可以帮助你将Java程序打包成可执行文件，并嵌入JRE，使得程序可以在没有安装JRE的环境中运行。这些工具包括：

- **Launch4j**：一个用于将JAR文件打包成Windows可执行文件的工具。
- **IzPack**：一个用于创建跨平台安装程序的工具，也可以用来生成包含JRE的可执行文件。
- **Exe4j**：类似于Launch4j，可以将JAR文件打包成可执行文件，并允许嵌入JRE。

这些工具通常提供了图形界面，使得打包过程更加直观和简单。

### 总结

使用`jpackage`或第三方工具，你可以创建一个包含JRE的可执行文件，这样用户就无需预先安装JRE即可运行你的Java程序。

这些方法提供了一种方便的方式来分发Java应用程序，特别是对于那些不希望或不能安装JRE的用户。

## 详细介绍一下 JLink

JLink 是 Java 9 引入的一个工具，旨在创建自定义的 Java 运行时镜像（runtime image），以便在不需要完整 JDK 的情况下运行 Java 应用程序。

通过 JLink，你可以从 Java 运行时（JRE）中去除不必要的模块，从而减小镜像的体积，并提升应用程序的启动性能。

### 1. **JLink 的基本概念**
JLink 允许开发者基于一个或多个 Java 模块创建自定义的运行时环境。

你可以通过它去除 Java 运行时环境中不必要的部分，只保留你应用程序需要的模块。这样可以使得最终的运行时镜像更小、更精简，同时提高了性能。

Java 9 引入了 **模块化系统**（Jigsaw），使得 JDK 被分成了多个独立的模块。JLink 依赖这个模块化系统，能够精确选择和定制应用所需的模块。

### 2. **JLink 的功能和优势**

- **减小应用体积**：JLink 允许你去除应用程序不需要的模块，减小 Java 运行时镜像的体积。例如，如果你的应用不需要 `javafx` 模块或者 `JDBC` 模块，可以将它们从镜像中删除。
  
- **提高启动速度**：通过去除不必要的模块，JLink 创建的镜像启动速度更快，因为它减少了类加载的数量。

- **自定义运行时**：开发者可以选择包含自己应用所需的模块和特定的 JDK 版本，而不必使用整个 JDK。

- **封装为可执行文件**：使用 JLink，开发者可以将应用程序和运行时镜像一起打包，创建一个独立的可执行文件，这个文件包含了所有必要的文件和配置，无需依赖 JDK。

### 3. **JLink 的使用步骤**

1. **创建模块化的应用**：确保你的 Java 应用是模块化的，应用程序的代码和库需要在 `module-info.java` 文件中声明模块。
   
2. **使用 JLink 创建自定义运行时镜像**：使用 JLink 工具来指定你要包含哪些模块和依赖的 JDK 版本。

   ```bash
   jlink --module-path $JAVA_HOME/jmods --add-modules <modules> --output <output-directory>
   ```

   - `--module-path`：指定包含 JDK 模块的目录（通常是 `$JAVA_HOME/jmods`）。
   - `--add-modules`：指定应用程序所需的模块，多个模块之间用逗号分隔。
   - `--output`：指定生成的运行时镜像的输出目录。

3. **运行自定义镜像**：使用生成的运行时镜像，你可以直接启动应用程序。镜像包含了所有必要的 JDK 模块和你应用所需的模块，可以通过以下命令来运行：

   ```bash
   <output-directory>/bin/java -m <module>/<main-class>
   ```

4. **打包和分发**：你可以将 JLink 创建的自定义运行时镜像与应用程序一起打包并分发，确保接收者不需要 JDK 环境即可运行你的应用。

### 4. **JLink 的常见选项**

- `--compress`：指定压缩镜像的级别。可以是 `2`、`3`、`4` 等，数字越大，压缩程度越高。
  
  示例：
  ```bash
  jlink --module-path $JAVA_HOME/jmods --add-modules <modules> --output <output-directory> --compress 2
  ```

- `--strip-debug`：去除调试信息，减小镜像体积。
  
  示例：
  ```bash
  jlink --module-path $JAVA_HOME/jmods --add-modules <modules> --output <output-directory> --strip-debug
  ```

- `--launcher`：为应用程序创建启动器，可以为应用指定一个简化的启动命令。

  示例：
  ```bash
  jlink --module-path $JAVA_HOME/jmods --add-modules <modules> --output <output-directory> --launcher myapp=<module>/<main-class>
  ```

- `--no-header-files`：避免生成包含头文件的镜像，适用于不需要本地代码的情况。

- `--no-man-pages`：避免生成手册页。

### 5. **JLink 的典型应用场景**

- **嵌入式系统**：嵌入式系统通常资源有限，JLink 可以用来创建精简的 Java 运行时环境，适应硬件资源较少的场景。
  
- **微服务架构**：微服务通常部署在容器中，JLink 可以帮助减少容器的镜像体积，提升部署效率。

- **自定义应用程序打包**：开发者可以将自己的应用与所需的 JDK 模块一起打包，确保最终用户能够以最小的环境配置运行应用程序。

### 6. **JLink 的局限性**

- **模块化要求**：JLink 依赖于 Java 模块系统，因此使用 JLink 创建自定义运行时镜像的应用必须是模块化的。如果应用程序仍然使用传统的类路径而非模块路径，那么就无法使用 JLink。
  
- **与第三方库兼容问题**：某些第三方库可能还没有完全适配 Java 模块化系统，因此可能会遇到兼容性问题。

### 7. **总结**

JLink 是一个强大的工具，可以帮助开发者精简和定制 Java 运行时环境，特别适用于需要精简应用体积、提高性能或部署自定义应用程序的场景。

通过 JLink，开发者可以控制应用程序和其运行时环境的所有细节，确保应用能够在没有 JDK 环境的机器上独立运行。

## jdk8 有类似的工具吗？生成一个不依赖 jre 的可执行包

在 JDK 8 中，并没有直接类似于 JLink 的工具来创建不依赖 JRE 的可执行包。JLink 是 Java 9 引入的功能，专为模块化系统设计，它能够生成精简版的运行时镜像。而在 JDK 8 中，应用程序仍然依赖于 JRE（Java 运行时环境）来运行。虽然没有像 JLink 这样的工具，但有一些其他方法可以帮助你实现类似的目标，尤其是创建一个无需安装 JRE 的可执行包。

### JDK 8 中的替代方案

1. **自带 JRE 方式打包应用**：
   最常见的做法是将 JRE 和你的 Java 应用程序打包在一起，确保用户无需独立安装 JRE。你可以通过以下方式实现：

   - **将 JRE 复制到应用目录**：
     你可以从安装的 JDK 中提取 JRE，并将其与应用程序一起打包。这样用户只需运行你的应用，而不需要单独安装 JDK 或 JRE。

     这种方式通常涉及手动操作或脚本自动化，确保 JRE 包含在应用程序的目录结构中。

   - **使用安装包工具打包应用**：
     使用一些安装包制作工具，可以将 JRE 和应用程序一起打包成一个可执行的安装包。例如：
     
     - **Launch4j**：它允许你将一个 Java 程序与 JRE 打包，生成一个独立的 Windows 可执行文件（.exe）。Launch4j 可以检测 JRE 是否已安装，如果没有，可以将 JRE 包含在安装包中。
     - **Inno Setup / NSIS**：这些安装包工具可以与 Launch4j 配合使用，创建一个安装程序，其中包含 JRE 和你的 Java 应用，最终用户可以通过安装程序进行一键安装和启动。

2. **使用 GraalVM Native Image**：
   虽然 GraalVM 是一个更为先进的工具，但它同样支持 JDK 8 环境（尽管在 JDK 9 及以后得到了更多的优化）。GraalVM 的 Native Image 特性允许你将 Java 程序编译成本地可执行文件，从而不依赖 JRE。

   - **Native Image**：通过 GraalVM，你可以将 Java 应用编译为原生机器代码，生成一个不依赖于 JRE 的独立可执行文件。这对于不想依赖任何 Java 环境的应用来说是一个非常合适的解决方案。

     需要注意的是，GraalVM 的 Native Image 功能可能需要额外的配置和优化，特别是在使用第三方库时，它们可能需要特殊的处理来保证兼容性。

3. **使用 JPackage（Java 14 引入）**：
   虽然 JPackage 是在 JDK 14 中引入的，但它是一个值得关注的工具，因为它允许将 Java 应用程序和 JDK 打包成独立的本地安装包。它类似于 JLink，目的是创建独立的运行时环境和可执行包。然而，JPackage 并不直接适用于 JDK 8，因此如果你决定升级到 Java 14 或更高版本，它将是一个强大的替代方案。

   - JPackage 会自动创建包含所需模块和 JRE 的安装包（如 `.exe` 或 `.dmg` 等），适用于不同平台（Windows、macOS、Linux）。

### 总结

对于 JDK 8，虽然没有 JLink 这样的工具，但你可以通过以下方式创建不依赖于 JRE 的可执行包：

1. **将 JRE 和应用程序打包在一起**：通过工具如 Launch4j 或自定义安装包工具（Inno Setup、NSIS 等）来实现。
2. **使用 GraalVM Native Image**：将 Java 应用编译为原生可执行文件，避免依赖 JRE。
3. **升级到 JDK 9 或更高版本**：如果你有升级计划，JDK 9 引入了模块化和 JLink，JDK 14 进一步支持了 JPackage，可以帮助你更好地打包应用。

如果你选择继续使用 JDK 8，最实际的做法是将 JRE 包含在你的应用包中，确保用户能够轻松运行应用而无需额外安装 JRE。

# 参考资料

https://blogs.oracle.com/java/post/the-arrival-of-java-22


* any list
{:toc}