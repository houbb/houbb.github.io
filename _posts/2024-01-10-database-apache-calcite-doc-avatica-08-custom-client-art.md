---
layout: post
title: Apache Calcite doc avatica-08-Custom Client Artifacts
date: 2024-01-10 21:01:55 +0800
categories: [Database]
tags: [database, sql, apache, calcite, sh]
published: true
---

# 自定义客户端构件

## Avatica的两个构件

截至到Apache Calcite Avatica 1.9.0版本，提供了两个（JAR）构件，使得客户端可以通过JDBC访问Avatica服务器。

```xml
<dependencies>
  <!-- 带有阴影的构件 -->
  <dependency>
    <groupId>org.apache.calcite.avatica</groupId>
    <artifactId>avatica</artifactId>
  </dependency>
  <!-- 不带阴影的构件 -->
  <dependency>
    <groupId>org.apache.calcite.avatica</groupId>
    <artifactId>avatica-core</artifactId>
  </dependency>
</dependencies>
```

按照以往版本的惯例，org.apache.calcite.avatica:avatica是一个JAR，其中包含Avatica客户端代码库的所有必要依赖项。那些可以安全重定位的类已经这样做了，以减少可能发生的类路径问题。

Avatica 1.9.0将引入一个新的构件org.apache.calcite.avatica:avatica-core，这只包含Avatica客户端类而没有任何捆绑的依赖项。

该构件使用户能够使用不同版本的JAR构建类路径，而不是Avatica目前依赖的版本。

这是一种“你的体验可能会有所不同”或“取消保修”的决定（因为您正在使用我们未经测试的依赖项的Avatica）；但是，一些下游项目确实提供了对版本之间兼容性的合理保证。

## 构建自己的Avatica客户端构件

在某些情况下，提供特定版本的Avatica依赖项可能会很有益。以下是一个简要的pom.xml，概述了如何完成这项工作。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <groupId>myorg.custom.client</groupId>
  <artifactId>my-special-app-client</artifactId>
  <packaging>jar</packaging>
  <name>Special Application Client Artifact</name>
  <description>为我的组织特定应用构建的自定义构件，使用Apache Calcite Avatica</description>

  <properties>
    <myorg.prefix>myorg.custom.client</myorg.prefix>
  </properties>

  <dependencies>
    <dependency>
      <groupId>org.apache.calcite.avatica</groupId>
      <artifactId>avatica-core</artifactId>
      <version>1.9.0</version>
    </dependency>
    <dependency>
      <groupId>org.apache.httpcomponents</groupId>
      <artifactId>httpclient</artifactId>
      <!-- 重写来自avatica-core的版本（4.5.2），以解决httpclient中的假设性错误 -->
      <version>4.5.3</version>
    </dependency>
    <!-- 包含Guava用于“特殊应用程序” -->
    <dependency>
      <groupId>com.google.guava</groupId>
      <artifactId>guava</artifactId>
      <version>17.0</version>
    </dependency>
  </dependencies>

  <build>
    <plugins>
      <plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-shade-plugin</artifactId>
        <executions>
          <execution>
            <phase>package</phase>
            <goals>
              <goal>shade</goal>
            </goals>
            <configuration>
              <!-- 重定位Jackson、Protobuf、Apache Commons HttpClient和HttpComponents，但不包括Guava。
                   假设的“特殊应用程序”会期望在标准位置找到Guava -->
              <relocations>
                <relocation>
                  <pattern>com.fasterxml.jackson</pattern>
                  <shadedPattern>${myorg.prefix}.com.fasterxml.jackson</shadedPattern>
                </relocation>
                <relocation>
                  <pattern>com.google.protobuf</pattern>
                  <shadedPattern>${myorg.prefix}.com.google.protobuf</shadedPattern>
                </relocation>
                <relocation>
                  <pattern>org.apache.http</pattern>
                  <shadedPattern>${myorg.prefix}.org.apache.http</shadedPattern>
                </relocation>
                <relocation>
                  <pattern>org.apache.commons</pattern>
                  <shadedPattern>${myorg.prefix}.org.apache.commons</shadedPattern>
                </relocation>
              </relocations>
              <createDependencyReducedPom>false</createDependencyReducedPom>
            </configuration>
          </execution>
        </executions>
      </plugin>
    </plugins>
  </build>
</project>
```

**注意：** 以上提供的pom.xml是一个示例，您可能需要根据您的项目需求进行调整。

# 参考资料

https://calcite.apache.org/avatica/docs/custom_client_artifacts.html

* any list
{:toc}