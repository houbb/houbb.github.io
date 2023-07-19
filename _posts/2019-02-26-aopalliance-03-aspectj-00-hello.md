---
layout: post
title: Aopalliance-03-aspectj-00-hello world 入门例子
date:  2019-2-26 09:48:47 +0800
categories: [Java]
tags: [java, aop, sh]
published: true
---

# 入门例子

## maven 依赖

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>org.example</groupId>
    <artifactId>aspectj-learn</artifactId>
    <version>1.0-SNAPSHOT</version>
    <packaging>pom</packaging>
    <modules>
        <module>aspectj-learn-01-hello</module>
    </modules>

    <properties>
        <maven.compiler.source>8</maven.compiler.source>
        <maven.compiler.target>8</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

    <dependencies>
        <!-- AspectJ依赖 -->
        <dependency>
            <groupId>org.aspectj</groupId>
            <artifactId>aspectjrt</artifactId>
            <version>1.8.7</version>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <!-- AspectJ编译器插件 -->
            <plugin>
                <groupId>org.codehaus.mojo</groupId>
                <artifactId>aspectj-maven-plugin</artifactId>
                <version>1.8</version>
                <configuration>
                    <complianceLevel>1.8</complianceLevel>
                    <source>1.8</source>
                    <target>1.8</target>
                    <aspectLibraries>
                        <aspectLibrary>
                            <groupId>org.aspectj</groupId>
                            <artifactId>aspectjrt</artifactId>
                        </aspectLibrary>
                    </aspectLibraries>
                </configuration>
                <executions>
                    <execution>
                        <goals>
                            <goal>compile</goal>
                            <goal>test-compile</goal>
                        </goals>
                    </execution>
                </executions>
            </plugin>

            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <version>3.3</version>
                <configuration>
                    <source>1.8</source>
                    <target>1.8</target>
                    <encoding>UTF-8</encoding>
                </configuration>
            </plugin>
        </plugins>
    </build>

</project>
```

## aspectj 插件

添加对应的 plugin

```xml
   <build>
        <plugins>
            <!-- AspectJ编译器插件 -->
            <plugin>
                <groupId>org.codehaus.mojo</groupId>
                <artifactId>aspectj-maven-plugin</artifactId>
                <version>1.14.0</version>
                <configuration>
                    <complianceLevel>1.8</complianceLevel>
                    <source>1.8</source>
                    <target>1.8</target>
                    <aspectLibraries>
                        <aspectLibrary>
                            <groupId>org.aspectj</groupId>
                            <artifactId>aspectjrt</artifactId>
                        </aspectLibrary>
                    </aspectLibraries>
                </configuration>
                <executions>
                    <execution>
                        <goals>
                            <goal>compile</goal>
                            <goal>test-compile</goal>
                        </goals>
                    </execution>
                </executions>
            </plugin>
        </plugins>
    </build>
```

### aspectj-maven-plugin 插件介绍

`aspectj-maven-plugin`是一个Maven插件，它允许您在Maven项目中使用AspectJ编译器，实现在编译期间织入AspectJ切面。通过使用该插件，您可以将AOP（面向切面编程）的功能集成到Maven构建过程中，从而实现在代码中添加横切关注点的能力。

`aspectj-maven-plugin`提供了以下主要功能：

1. **织入AspectJ切面**：
   该插件允许在编译期间将AspectJ切面织入到Java类中。通过在Maven构建过程中使用AspectJ编译器，切面中定义的增强逻辑将被插入到目标类中，实现AOP功能。

2. **支持不同的织入方式**：
   `aspectj-maven-plugin`支持多种织入方式，包括编译时织入（Compile-Time Weaving，CTW）、加载时织入（Load-Time Weaving，LTW）和运行时织入（Runtime Weaving）。您可以根据项目的需求选择适当的织入方式。

3. **自动引入依赖**：
   该插件会自动引入AspectJ运行时库（aspectjrt.jar）作为依赖，以便在织入期间使用AspectJ的运行时支持。

4. **配置编译级别和目标级别**：
   您可以配置插件来指定编译级别和目标级别，确保生成的字节码与目标Java版本兼容。

5. **支持各种AspectJ选项**：
   插件允许您配置各种AspectJ选项，例如指定AspectJ编译器的版本、添加命令行参数等。

使用`aspectj-maven-plugin`的一般流程如下：

1. 在Maven项目的 `pom.xml` 文件中添加`aspectj-maven-plugin`插件配置。

2. 编写AspectJ切面类，并将其放置在指定的源代码目录中。

3. 运行Maven构建命令，该插件将会在编译期间织入AspectJ切面到Java类中。

下面是一个简单的`aspectj-maven-plugin`插件配置示例：

```xml
<build>
    <plugins>
        <!-- AspectJ编译器插件 -->
        <plugin>
            <groupId>org.codehaus.mojo</groupId>
            <artifactId>aspectj-maven-plugin</artifactId>
            <version>1.14.0</version>
            <configuration>
                <complianceLevel>1.8</complianceLevel>
                <source>1.8</source>
                <target>1.8</target>
                <aspectLibraries>
                    <!-- 配置要织入的AspectJ切面库 -->
                    <aspectLibrary>
                        <groupId>org.aspectj</groupId>
                        <artifactId>aspectjrt</artifactId>
                    </aspectLibrary>
                </aspectLibraries>
            </configuration>
            <executions>
                <execution>
                    <goals>
                        <goal>compile</goal>
                        <goal>test-compile</goal>
                    </goals>
                </execution>
            </executions>
        </plugin>
    </plugins>
</build>
```

使用`aspectj-maven-plugin`可以很方便地在Maven项目中使用AspectJ，实现面向切面编程，增强代码的功能和灵活性。

## 测试代码

- Calc

```java
package org.example;

public class Calc {
    public int add(int a, int b) {
        System.out.println("called add");
        return a + b;
    }
}
```

- LoggingAspect

```java
package org.example;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.After;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;

@Aspect
public class LoggingAspect {

    @Before("execution(* Calc.add(int, int))")
    public void beforeAddMethod(JoinPoint joinPoint) {
        System.out.println("Before add method is called.");
    }

    @After("execution(* Calc.add(int, int))")
    public void afterAddMethod(JoinPoint joinPoint) {
        System.out.println("After add method is called.");
    }

}
```

- Main.java

```java
package org.example;

public class Main {

    public static void main(String[] args) {
        Calc calculator = new Calc();
        int result = calculator.add(5, 3);
    }

}
```

## 测试

首先进行编译

```
mvn clean complie
```

然后直接执行 main 方法即可

```java
Before add method is called.
called add
After add method is called.
```

# 参考资料

https://programmer.ink/think/the-simplest-helloworld-example-of-aspectj.html

https://github.com/josephpconley/aspectj-java-quickstart

* any list
{:toc}