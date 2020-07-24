---
layout: post
title:  Spring Boot-06-理解 spring-boot-starter-parent
date:  2017-12-19 14:43:25 +0800
categories: [Spring]
tags: [spring, exception, spring, springboot]
published: true
---

# 理解spring-boot-starter-parent

通过spring initializr，我们可以快速构建一个springboot应用，如果你选择的是Maven来管理项目，在默认的pom文件中有这么一个section：

```xml
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>2.1.1.RELEASE</version>
</parent>
```

它表示当前pom文件从spring-boot-starter-parent继承下来，在spring-boot-starter-parent中提供了很多默认的配置，这些配置可以大大简化我们的开发。

## Parent Poms Features

通过继承spring-boot-starter-parent，默认具备了如下功能：

- Java版本（Java8）

- 源码的文件编码方式（UTF-8）

- 依赖管理

- 打包支持

- 动态识别资源

- 识别插件配置

- 识别不同的配置，如：application-dev.properties 和 application-dev.yml

以上继承来的特性有的并非直接继承自spring-boot-starter-parent，而是继承自spring-boot-starter-parent的父级spring-boot-dependencies

需要特别说明的是，application-dev.properties 和 application-dev.yml支持spring风格的占位符(${…​})，但是Maven项目把对占位符的支持改为(@..@)，可以通过设置Maven属性resource.delimiter来重置回去。

## 版本号的设置

继承spring-boot-starter-parent后，大大简化了我们的配置，它提供了丰富的常用的默认的依赖的版本定义，我们就不需要再次指定版本号：

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
</dependencies>
```

假设我们需要定制自己的版本号，可以通过下面的方式重写：

```xml
<properties>
    <spring-data-releasetrain.version>Fowler-SR2</spring-data-releasetrain.version>
</properties>
```

## 不继承spring-boot-starter-parent构建springboot项目

有时候项目可能有自己的parent poms，Maven只允许定义一个parent pom，这时的项目虽然没有继承自spring-boot-starter-parent，但是依赖管理始终需要的，可以通过如下配置引入spring-boot-dependencies的依赖管理功能：

```xml
<dependencyManagement>
    <dependencies>
        <dependency>
            <!-- Import dependency management from Spring Boot -->
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-dependencies</artifactId>
            <version>2.2.0.BUILD-SNAPSHOT</version>
            <type>pom</type>
            <scope>import</scope> 
        </dependency>
    </dependencies>
</dependencyManagement>
```

那么在这种情况下要重写依赖的版本号就需要用另外的方式：

```xml
<dependencyManagement>
    <dependencies>
        <!-- Override Spring Data release train provided by Spring Boot -->
        <dependency>
            <groupId>org.springframework.data</groupId>
            <artifactId>spring-data-releasetrain</artifactId>
            <version>Fowler-SR2</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-dependencies</artifactId>
            <version>2.2.0.BUILD-SNAPSHOT</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
```

除了依赖管理，打包也是需要的：

```xml
<build>
  <plugins>
    <plugin>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-maven-plugin</artifactId>
      <version>1.4.0.RELEASE</version>
      <configuration>
        <executable>true</executable>
      </configuration>
      <executions>
        <execution>
          <goals>
            <goal>repackage</goal>
          </goals>
        </execution>
      </executions>
    </plugin>
  </plugins>
</build>
```

增加以上配置后就可以使用熟悉的mvn pacakge成一个jar了。

# 参考资料

[理解 spring-boot-starter-parent](https://www.jianshu.com/p/628acadbe3d8)

* any list
{:toc}
