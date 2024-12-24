---
layout: post
title: java 程序如何打包成为一个可执行文件？jdk jpackages 入门实战笔记
date:  2017-06-28 23:15:43 +0800
categories: [Java]
tags: [jdk, java]
published: true
---

# 拓展阅读

[Java Functional java 函数式编程](https://houbb.github.io/2017/06/29/java-functional)

[Java Lambda](https://houbb.github.io/2017/06/28/java-lambda)


# jpackage 打包实战

## maven 项目

- Main

```java
package org.example.jpackage.demo;

public class Main {
    public static void main(String[] args) {
        System.out.println("Hello world!");
    }
}
```

- pom.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>org.example</groupId>
    <artifactId>jpackage-demo</artifactId>
    <version>1.0-SNAPSHOT</version>

    <properties>
        <maven.compiler.source>23</maven.compiler.source>
        <maven.compiler.target>23</maven.compiler.target>
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
                            <mainClass>org.example.jpackage.demo.Main</mainClass>
                        </manifest>
                    </archive>
                </configuration>
            </plugin>
        </plugins>
    </build>

</project>
```

## 打包为 jar

```
mvn clean package
```

## 执行 jpackage

```sh
D:\tool\jdk\graalvm-jdk-23_windows-x64_bin\graalvm-jdk-23.0.1+11.1\bin\jpackage --type exe --input target/ --name myapp --main-jar jpackage-demo-1.0-SNAPSHOT.jar --main-class org.example.jpackage.demo.Main
```


报错：

```
package-demo-1.0-SNAPSHOT.jar --main-class org.example.jpackage.demo.Main
[09:26:39.774] 找不到 WiX 工具 (light.exe, candle.exe)
[09:26:39.774] 从 https://wixtoolset.org 下载 WiX 3.0 或更高版本，然后将其添加到 PATH。
```


# 下载组件

我们根据提示，去 https://wixtoolset.org

个人下载的是：

https://github.com/wixtoolset/wix3/releases/tag/wix3141rtm

执行安装

# 如何执行效果呢？





# chat

## 是什么？

`jpackage` 是 Java 14 引入的一个工具，旨在简化 Java 应用程序的打包和分发过程。

它可以将 Java 应用程序打包成平台特定的安装包（如 `.exe`、`.dmg`、`.deb`、`.rpm` 等），从而让 Java 程序能够像本地应用程序一样进行安装和运行，无需依赖 JDK 环境。

以下是 `jpackage` 的主要功能和使用方法：

### 1. `jpackage` 的功能

- 打包 Java 应用程序：`jpackage` 可以将 Java 应用程序和所有依赖的 JRE（Java Runtime Environment）一起打包成平台特定的安装包。

这样，用户无需预先安装 JDK 或 JRE，就能运行 Java 应用。

- 创建平台特定的安装包：支持将应用程序打包成多种平台的安装包，包括：
  - Windows：`.exe` 安装程序
  - macOS：`.dmg` 文件
  - Linux：`.deb`、`.rpm` 等包格式
- 内嵌 JRE：打包过程中，可以选择将应用所需的 JRE 一同打包在内，这样就不再需要用户单独安装 JRE。
- 生成快捷方式和启动脚本：`jpackage` 会自动为应用程序创建启动脚本和快捷方式，确保用户可以方便地启动应用。

### 2. 使用 `jpackage` 打包 Java 应用程序
在命令行中使用 `jpackage` 工具打包应用程序的基本语法如下：

```bash
jpackage --name <应用程序名> --input <输入目录> --main-jar <主 JAR 文件> --main-class <主类名> --type <包类型> --dest <输出目录>
```

#### 关键选项：
- `--name`：指定应用程序的名称。
- `--input`：指定包含应用程序 JAR 文件和其他资源的输入目录。
- `--main-jar`：指定应用程序的主 JAR 文件（即包含 `main` 方法的 JAR 文件）。
- `--main-class`：指定应用程序的主类（包含 `main` 方法的类）。
- `--type`：指定包的类型，常见的类型包括：
  - `app-image`：生成自包含的应用程序镜像（不需要安装包）。
  - `exe`：Windows 平台的可执行文件。
  - `dmg`：macOS 平台的安装镜像。
  - `deb`：Linux 平台的 DEB 包。
  - `rpm`：Linux 平台的 RPM 包。
- `--dest`：指定输出目录，打包文件会存放到该目录。

#### 其他常见选项：
- `--runtime-image`：指定自定义的 JRE 镜像，通常与 `jlink` 一起使用。
- `--icon`：为应用程序设置图标。
- `--app-version`：设置应用程序的版本。
- `--java-options`：为 Java 应用程序指定启动时的 JVM 参数。
- `--license-file`：指定许可文件，用于分发时显示应用程序的许可证信息。

### 3. 示例
假设我们有一个名为 `MyApp` 的 Java 应用程序，包含 `MyApp.jar` 和一个 `Main` 类，并且想要打包成一个 Windows 的可执行文件：

```bash
jpackage --name MyApp --input ./build/libs --main-jar MyApp.jar --main-class com.example.Main --type exe --dest ./output --icon ./icon.png
```

这条命令会：
- 将 `MyApp.jar` 打包为 Windows 的 `.exe` 安装包。
- 使用 `com.example.Main` 作为应用的主类。
- 输出的安装包放在 `./output` 目录，并且应用程序会使用 `./icon.png` 作为图标。

### 4. 与 `jlink` 的结合
`jpackage` 可以与 `jlink` 工具结合使用，`jlink` 用于创建定制化的 JRE，去除不必要的模块，从而减少 JRE 的体积。当与 `jpackage` 配合时，可以打包应用和精简过的 JRE。

例如，首先使用 `jlink` 创建定制的 JRE：

```bash
jlink --module-path $JAVA_HOME/jmods --add-modules java.base,java.desktop --output my-jre
```

然后使用 `jpackage` 打包应用并嵌入定制的 JRE：

```bash
jpackage --name MyApp --input ./build/libs --main-jar MyApp.jar --main-class com.example.Main --runtime-image ./my-jre --type exe --dest ./output
```

### 5. 跨平台支持
`jpackage` 提供跨平台的打包支持，允许在不同平台上生成本地安装包。你可以在 Windows 上使用 `jpackage` 创建 `.dmg` 或 `.deb` 包，但这要求你使用适合目标平台的 JDK 或工具链（例如，在 macOS 上打包 `.dmg` 文件时，需要 macOS 上的 JDK）。

### 6. 优缺点
#### 优点：
- 简化打包过程：`jpackage` 提供了一种简洁的方式来创建平台特定的安装包，避免了手动配置安装脚本或使用第三方打包工具。
- 内嵌 JRE：可以将应用程序与 JRE 一起打包，简化了分发过程。
- 跨平台支持：可以生成不同平台的安装包，增强了 Java 应用的可移植性。

#### 缺点：
- 平台依赖性：尽管支持跨平台打包，但不同平台上需要使用不同的工具链，因此无法做到完全的跨平台支持。
- 自定义功能有限：相比于第三方工具（如 Inno Setup、NSIS 等），`jpackage` 的自定义选项较少，可能不适用于需要高度定制的打包需求。

### 总结
`jpackage` 是一个非常方便的工具，可以帮助 Java 开发者轻松将 Java 应用程序打包成平台特定的安装包，并且支持将应用程序与 JRE 一起打包，简化了部署和分发过程。对于需要简洁、自动化打包流程的开发者来说，它是一个理想的选择。


# 参考资料

https://github.com/orphan-oss/launch4j-maven-plugin/blob/master/src/main/resources/README.adoc


* any list
{:toc}