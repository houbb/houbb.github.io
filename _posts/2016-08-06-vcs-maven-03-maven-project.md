---
layout: post
title: maven 包管理平台-03-maven project maven 项目的创建入门
date: 2016-08-06 13:10:53 +0800
categories: [VCS]
tags: [maven, devops, sf]
published: true
---

# 拓展阅读

[maven 包管理平台-01-maven 入门介绍 + Maven、Gradle、Ant、Ivy、Bazel 和 SBT 的详细对比表格](https://houbb.github.io/2016/08/06/maven-01-intro)

[maven 包管理平台-02-windows 安装配置 + mac 安装配置](https://houbb.github.io/2016/08/06/maven-02-windows-mac-install)

[maven 包管理平台-03-maven project maven 项目的创建入门](https://houbb.github.io/2016/08/06/maven-03-maven-project)

[maven 包管理平台-04-maven archetype 项目原型](https://houbb.github.io/2016/08/06/maven-04-maven-archetype)

[maven 包管理平台-05-multi module 多模块](https://houbb.github.io/2016/08/06/maven-05-multi-module)

[maven 包管理平台-06-常用技巧 实时更新快照/乱码问题/下载很慢/包依赖解决包冲突/如何导入本地 jar](https://houbb.github.io/2016/08/06/maven-06-tips)

[maven 包管理平台-07-plugins 常见插件介绍](https://houbb.github.io/2016/08/06/maven-07-plugins)

[maven 包管理平台-08-nexus 自己搭建 maven 仓库](https://houbb.github.io/2016/08/06/maven-08-nexus)


# 创建 Maven 项目

您可以像这样在 IntelliJ IDEA 中创建 Maven 项目：

```
File -> New -> Module -> Maven
```

- 步骤 1：从原型中选择一个

- 步骤 2：添加 GroupId、ArtifactId、Version

- 步骤 3：设置属性

> 如果 Maven 构建非常缓慢，您可以添加以下代码：

```
archetypeCatalog=internal
```

# 运行项目

- 在命令行中的优雅方式

```
mvn clean install

mvn tomcat7:run
```

- 常规方式

[Tomcat 中文文档](http://www.cnblogs.com/jifeng/p/4658765.html)

> 提示

## 设置

您可以使用以下步骤配置 Maven 设置，然后搜索 **maven**

快捷键：ctrl+alt+s

## 报错

```
-Dmaven.multiModuleProjectDirectory 系统属性未设置
```

1. 您可以使用**低版本**的 Maven 以适应您的 IDEA。

2. 或者按照以下方式解决：

```
-Dmaven.multiModuleProjectDirectory=$M2_HOME

M2_HOME D:\Maven\apache-maven-3.3.9
```

# pom.xml

- 默认的 pom.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.ryo</groupId>
    <artifactId>maven</artifactId>
    <version>1.0-SNAPSHOT</version>

    <dependencies>
        <dependency>...</dependency>
        ...
    </dependencies>

    <build>
        <plugins>
            <plugin>...</plugin>
            ...
        </plugins>

        <!--maven only compile resources files under package ```resources```, you can solve it.-->

        <resources>
            <resource>
                <directory>src/main/java</directory>
                <includes>
                    <include>**/*.xml</include>
                </includes>
            </resource>
            <resource>
                <directory>src/main/resources</directory>
                <filtering>true</filtering>
                <includes>
                    <include>**/*.xml</include>
                    <include>**/*.properties</include>
                </includes>
            </resource>
        </resources>
    </build>
</project>
```
- 定义打包方式

```xml
<packaging>war</packaging>
```

- 定义源文件编码

```xml
<project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
```

# 常用的插件汇总

- 定义 Maven 编译器插件

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-compiler-plugin</artifactId>
    <version>3.3</version>
    <configuration>
        <source>1.7</source>
        <target>1.7</target>
    </configuration>
</plugin>
```

- 定义 Tomcat7 插件

```xml
<plugin>
    <groupId>org.apache.tomcat.maven</groupId>
    <artifactId>tomcat7-maven-plugin</artifactId>
    <version>2.2</version>
    <configuration>
        <port>8080</port>
        <path>/</path>
        <uriEncoding>${project.build.sourceEncoding}</uriEncoding>
    </configuration>
</plugin>
```

- 如果您希望默认情况下跳过测试，但希望能够通过命令行重新启用测试，
您需要在 pom 文件中通过 properties 部分进行设置：

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-surefire-plugin</artifactId>
    <version>2.19.1</version>
    <configuration>
      <skipTests>true</skipTests>
    </configuration>
</plugin>
```

- 您可以使用 **Maven Shade 插件** 将类打包成 JAR。

# maven scope 简单介绍

- compile，缺省值，适用于所有阶段，会随着项目一起发布。
- provided，类似compile，期望JDK、容器或使用者会提供这个依赖。如servlet.jar。
- runtime，只在运行时使用，如JDBC驱动，适用运行和测试阶段。
- test，只在测试时使用，用于编译和运行测试代码。不会随项目发布。
- system，类似provided，需要显式提供包含依赖的jar，Maven不会在Repository中查找它。
- import 它只使用在```<dependencyManagement>```中，表示从其它的pom中导入dependency的配置

* any list
{:toc}