---
layout: post
title: Maven Plugin-01-maven shade plugin 类文件打包到一个可执行的 JAR 文件中
date:  2019-3-15 09:02:21 +0800
categories: [Maven]
tags: [exception, maven, mvn, sh]
published: true
---

# 介绍一下 maven-shade-plugin 的作用

`maven-shade-plugin` 是 Maven 构建工具的一个插件，它的主要作用是将所有依赖项和项目的类文件打包到一个可执行的 JAR 文件中。

通常，当你的项目有很多依赖项时，你可能会得到一个包含了所有依赖的 JAR 文件。

这对于创建可独立运行的、包含所有必要依赖项的可执行 JAR 文件非常有用。

以下是 `maven-shade-plugin` 的主要作用：

1. **依赖项合并：** `maven-shade-plugin` 可以将项目的所有依赖项合并到一个 JAR 文件中，消除了在运行时需要多个 JAR 文件的问题。这样可以简化项目的部署和分发过程，用户只需要一个 JAR 文件即可运行应用程序。

2. **类重命名：** 该插件还提供了类重命名的功能，可以避免因为不同依赖项中存在相同类名而引起的冲突。它可以为这些类添加前缀、后缀或者进行其他自定义的重命名操作，确保在合并后的 JAR 文件中不会发生类名冲突。

3. **资源合并：** 除了类文件，`maven-shade-plugin` 还可以合并项目中的资源文件，比如配置文件、属性文件等。这样，所有项目相关的资源都会被包含在生成的 JAR 文件中。

使用 `maven-shade-plugin` 的配置通常包括在项目的 `pom.xml` 文件中。

## 配置

以下是一个简单的 `maven-shade-plugin` 的配置示例：

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-shade-plugin</artifactId>
            <version>3.2.4</version>
            <executions>
                <execution>
                    <phase>package</phase>
                    <goals>
                        <goal>shade</goal>
                    </goals>
                    <configuration>
                        <!-- 可以在这里进行配置，比如重命名类、配置资源合并等 -->
                    </configuration>
                </execution>
            </executions>
        </plugin>
    </plugins>
</build>
```

在上述配置中，`<phase>` 指定了插件在构建的哪个阶段执行，这里是 `package` 阶段。

`<configuration>` 元素用于配置插件的具体行为，比如类重命名、资源合并等。

你可以根据项目的需求进行相应的配置。

# 其他-打包文件的查看

这个时候，所有的文件都会变成可执行的文件。

就是各种包：

```
com.xx.xxx
```

完整的打包文件，所有的文件都会分别解压到对应的文件目录。

可以指定的包下面进行查看。


# 包的重命名

## nacos 中有这么一段话

```
由于Nacos Java SDK在2.0版本后引入了gRPC，为了避免用户业务引入的gRPC版本不同导致冲突，使用了shaded技术将部分依赖直接封装进nacos-client中。这里的 shaded 技术是什么？
```

"Shading" 是一种将一个库（或者依赖）及其所有依赖项移动到另一个命名空间的技术。它通常用于解决依赖冲突的问题，特别是在构建Java应用程序时。

在上下文中，Nacos Java SDK使用 shaded 技术将部分依赖直接封装进 `nacos-client` 中。

这样做的主要目的是为了避免与用户业务引入的 gRPC 版本不同导致冲突。

具体来说，shaded 技术会修改库的代码和依赖项的包名，使其不与其他可能存在的相同库或依赖项发生冲突。这可以通过重新命名包、类等来实现。

在这种情况下，Nacos Java SDK将 gRPC 以及相关的依赖项移动到 `nacos-client` 命名空间中，以确保与用户业务引入的 gRPC 版本不会发生冲突。

这种做法使得应用程序可以在同一类路径上同时包含不同版本的相同库，而不会导致命名冲突或其他类加载问题。这对于解决依赖版本冲突的问题是一种有效的方法。

## 入门例子

当使用 shaded 技术时，一般会使用构建工具，例如 Maven 或 Gradle。

下面是一个简单的 Maven shaded 插件的例子，演示如何将一个库及其依赖项 shading 到一个不同的命名空间。

首先，在 Maven 项目的 pom.xml 文件中，你需要添加 shaded 插件的配置：

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-shade-plugin</artifactId>
            <version>3.2.4</version><!-- 使用最新版本 -->
            <executions>
                <execution>
                    <phase>package</phase>
                    <goals>
                        <goal>shade</goal>
                    </goals>
                    <configuration>
                        <relocations>
                            <relocation>
                                <pattern>com.example.library</pattern><!-- 原始库的包名 -->
                                <shadedPattern>shaded.com.example.library</shadedPattern><!-- 新的命名空间 -->
                            </relocation>
                        </relocations>
                    </configuration>
                </execution>
            </executions>
        </plugin>
    </plugins>
</build>
```

# 参考资料 

chat

* any list
{:toc}