---
layout: post
title: Aopalliance-03-aspectj-01-LTW 加载时织入入门例子
date:  2019-2-26 09:48:47 +0800
categories: [Java]
tags: [java, aop, sh]
published: true
---

# 如何基于 aspect 实现运行时织入？类似 spring aop 那样？

在AspectJ中实现运行时织入，类似于Spring AOP的运行时织入，可以通过使用AspectJ的`load-time weaving`（LTW，加载时织入）功能来实现。

Load-time weaving是一种在类加载过程中织入切面的方式，允许您在应用程序运行时将切面逻辑织入到目标类中。

## 1.maven 依赖

确保项目中包含了`aspectjrt`依赖，因为AspectJ LTW代理需要它来实现织入。

```xml
<!-- AspectJ依赖 -->
<dependency>
    <groupId>org.aspectj</groupId>
    <artifactId>aspectjrt</artifactId>
    <version>1.8.7</version>
</dependency>
```

## 2.编写 Aspect 代码

和 hello 的例子类似。

- Calc.java

```java
package org.example.util;

public class Calc {
    public int add(int a, int b) {
        System.out.println("called add");
        return a + b;
    }
}
```

- LoggingAspect.java

编写AspectJ切面类，其中包含要织入到目标类中的增强逻辑。与静态织入不同，运行时织入的切面不需要指定切入点表达式，因为在加载时会动态匹配目标类。

```java
package org.example;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;

@Aspect
public class LoggingAspect {

    @Before("execution(* org.example.util.*.*(..))")
    public void beforeAddMethod(JoinPoint joinPoint) {
        System.out.println("Before method is called.");
    }

}
```

- Main.java

```java
public class Main {

    public static void main(String[] args) {
        Calc calculator = new Calc();
        int result = calculator.add(5, 3);
    }

}
```


## 3.启用LTW织入

在项目的 `META-INF/aop.xml` 文件中，配置要织入的AspectJ切面：

```xml
<aspectj>
    <aspects>
        <!-- 配置要织入的切面 -->
        <aspect name="org.example.LoggingAspect"/>
    </aspects>
</aspectj>
```


## 4.运行

首先，需要在Java虚拟机（JVM）启动时配置AspectJ LTW代理。

在应用程序启动时，AspectJ LTW代理会拦截类的加载过程，将切面逻辑织入到目标类中。

请注意，运行时织入会增加应用程序启动时间，因为AspectJ需要在类加载时检查切面并织入相关逻辑。

因此，如果性能是一个关键问题，您可能需要权衡使用静态织入和加载时织入。

总的来说，通过AspectJ的运行时织入功能，您可以在类加载期间将切面逻辑织入到目标类中，实现运行时AOP的功能。

### bash 命令

可以通过在`java`命令行启动参数中添加`-javaagent`选项来指定AspectJ的weaver代理库，例如：

格式：

```bash
java -javaagent:/path/to/aspectjweaver.jar -cp /path/to/classes com.example.MainApp
```

1) cp

-cp或-classpath：指定Java类路径，用于加载类文件和资源。多个路径之间用分号（Windows）或冒号（Linux/macOS）分隔。

2) java -javaagent 解释

在Java中，`-javaagent`是一种Java虚拟机（JVM）启动参数，用于指定一个Java代理（agent）程序。

代理程序可以在Java应用程序运行时对类进行修改或增强。这种方式通常被称为Java代理技术。

具体地说，`-javaagent`参数用于加载Java代理库（JAR文件），并在JVM启动时将代理绑定到正在运行的Java应用程序中。

代理程序可以使用Java Instrumentation API来对Java类字节码进行修改，从而实现对类的增强、拦截和监控。

使用`-javaagent`参数的一般语法如下：

```
-javaagent:/path/to/agent.jar
```

其中，`/path/to/agent.jar`是Java代理库（JAR文件）的路径。该路径可以是绝对路径或相对路径。

在应用`-javaagent`参数时，需要确保代理库的JAR文件正确地实现了Java Instrumentation API，以便正确地与JVM进行交互并对类进行修改。

常见的使用场景包括：

1. **性能监控和分析**：通过Java代理来监控应用程序的性能和行为，收集性能数据并进行分析，用于性能优化和故障排查。

2. **AOP编程**：类似于AspectJ的AOP编程，通过Java代理技术在运行时织入切面，实现横切关注点的功能。

3. **动态修改类行为**：在应用程序运行时，动态地修改某些类的行为，如在单元测试中替换类的实现，或在运行时增加某些功能。

4. **字节码增强**：通过字节码增强技术，在类加载过程中对字节码进行修改，以实现类的增强或优化。

需要注意的是，使用Java代理技术需要谨慎，不当的使用可能会导致不稳定的应用程序行为和意外的结果。

因此，在使用`-javaagent`参数时，建议只使用经过测试和验证的代理程序，并且清楚地了解代理所做的修改。

### 实测

我们找到 aspectjweaver.jar 的路径

```
C:\Users\dh\.m2\repository\org\aspectj\aspectjweaver\1.8.7\aspectjweaver-1.8.7.jar
```

我们直接 cd 到 classes 文件下

```
$ pwd
/d/code/learn/aspectj-learn/aspectj-learn-02-ltw/target/classes
```

然后执行命令

```
java -javaagent:C:/Users/dh/.m2/repository/org/aspectj/aspectjweaver/1.8.7/aspectjweaver-1.8.7.jar -cp . org.example.Main
Before add method is called.
called add
After add method is called.
```

# 参考资料

https://programmer.ink/think/the-simplest-helloworld-example-of-aspectj.html

https://github.com/josephpconley/aspectj-java-quickstart

* any list
{:toc}