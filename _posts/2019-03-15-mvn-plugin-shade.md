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

# 参考资料 



* any list
{:toc}