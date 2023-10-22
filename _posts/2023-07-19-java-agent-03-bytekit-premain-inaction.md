---
layout: post
title: java agent-03-Java Instrumentation 结合 bytekit 实战笔记 agent premain
date:  2023-07-12 +0800
categories: [Java]
tags: [java, sh]
published: true
---

# 拓展阅读

前面几篇文档，我们简单介绍了一下 java Instrumentation。

[java agent 介绍](https://houbb.github.io/2023/07/12/java-agent-01-intro)

[Java Instrumentation API](https://houbb.github.io/2023/07/12/java-agent-02-instrumentation-api)

本篇我们结合一下 [bytekit](https://houbb.github.io/2023/08/09/java-agent-02-bytekit) 进行实际的文件修改。


# Java Instrumentation 包介绍

## 简单介绍

基于 Instrumentation 来实现的有：

APM 产品: pinpoint、skywalking、newrelic、听云的 APM 产品等都基于 Instrumentation 实现

热部署工具：Intellij idea 的 HotSwap、Jrebel 等

Java 诊断工具：Arthas、Btrace 等

由于对字节码修改功能的巨大需求，JDK 从 JDK5 版本开始引入了java.lang.instrument 包。它可以通过 addTransformer 方法设置一个 ClassFileTransformer，可以在这个 ClassFileTransformer 实现类的转换。

JDK 1.5 支持静态 Instrumentation，基本的思路是在 JVM 启动的时候添加一个代理（javaagent），每个代理是一个 jar 包，其 MANIFEST.MF 文件里指定了代理类，这个代理类包含一个 premain 方法。JVM 在类加载时候会先执行代理类的 premain 方法，再执行 Java 程序本身的 main 方法，这就是 premain 名字的来源。在 premain 方法中可以对加载前的 class 文件进行修改。这种机制可以认为是虚拟机级别的 AOP，无需对原有应用做任何修改，就可以实现类的动态修改和增强。

从 JDK 1.6 开始支持更加强大的动态 Instrument，在JVM 启动后通过 Attach API 远程加载，后面会详细介绍。

## Java Instrumentation 核心方法

Instrumentation 是 java.lang.instrument 包下的一个接口，这个接口的方法提供了注册类文件转换器、获取所有已加载的类等功能，允许我们在对已加载和未加载的类进行修改，实现 AOP、性能监控等功能。

```java
/**
 * 为 Instrumentation 注册一个类文件转换器，可以修改读取类文件字节码
 */
void addTransformer(ClassFileTransformer transformer, boolean canRetransform);

/**
 * 对JVM已经加载的类重新触发类加载
 */
void retransformClasses(Class<?>... classes) throws UnmodifiableClassException;

/**
 * 获取当前 JVM 加载的所有类对象
 */
Class[] getAllLoadedClasses()
```

它的 addTransformer 给 Instrumentation 注册一个 transformer，transformer 是 ClassFileTransformer 接口的实例，这个接口就只有一个 transform 方法，调用 addTransformer 设置 transformer 以后，后续JVM 加载所有类之前都会被这个 transform 方法拦截，这个方法接收原类文件的字节数组，返回转换过的字节数组，在这个方法中可以做任意的类文件改写。

```java
public class MyClassTransformer implements ClassFileTransformer {
    @Override
    public byte[] transform(ClassLoader loader, String className, Class<?> classBeingRedefined, ProtectionDomain protectionDomain, byte[] classBytes) throws IllegalClassFormatException {
        // 在这里读取、转换类文件
        return classBytes;
    }
}
```

# Javaagent 介绍

Javaagent 是一个特殊的 jar 包，它并不能单独启动的，而必须依附于一个 JVM 进程，可以看作是 JVM 的一个寄生插件，使用 Instrumentation 的 API 用来读取和改写当前 JVM 的类文件。

## Agent 的两种使用方式

1.在 JVM 启动的时候加载，通过 javaagent 启动参数 java -javaagent:myagent.jar MyMain，这种方式在程序 main 方法执行之前执行 agent 中的 premain 方法

```java
public static void premain(String agentArgument, Instrumentation instrumentation) throws Exception
```

2.在 JVM 启动后 Attach，通过 Attach API 进行加载，这种方式会在 agent 加载以后执行 agentmain 方法

```java
public static void agentmain(String agentArgument, Instrumentation instrumentation) throws Exception
```

这两个方法都有两个参数

第一个 agentArgument 是 agent 的启动参数，可以在 JVM 启动命令行中设置，比如 `java -javaagent:<jarfile>=appId:agent-demo,agentType:singleJar test.jar` 的情况下 agentArgument 的值为 "appId:agent-demo,agentType:singleJar"。

第二个 instrumentation 是 java.lang.instrument.Instrumentation 的实例，可以通过 addTransformer 方法设置一个 ClassFileTransformer。

第一种 premain 方式的加载时序如下：

![premain](https://img2020.cnblogs.com/blog/697265/202003/697265-20200326162427954-1418412077.png)

# premain 方式实战

我们本篇文章重点介绍一下第一种 premain 方式。

## 文件结构

```
    │  │          └─houbb
    │  │              └─bytekit
    │  │                  └─learn
    │  │                      └─agent
    │  │                          │  MyAgent.java
    │  │                          │  MyClassFileTransformer.java
    │  │                          │
    │  │                          └─interceptor
    │  │                                  SampleInterceptor.java
    │  │
    │  └─resources
    │      └─META-INF
    │              MANIFEST.MF
    │
    └─test
        └─java
            └─com
                └─github
                    └─houbb
                        └─bytekit
                            └─tool
                                    Main.java
                                    Sample.java
```

## pom.xml

引入对应的依赖，并且指定编译插件，避免资源文件打包丢失。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>com.github.houbb</groupId>
        <artifactId>bytekit-learn</artifactId>
        <version>1.0-SNAPSHOT</version>
    </parent>

    <artifactId>bytekit-learn-agent</artifactId>

    <properties>
        <maven.compiler.source>8</maven.compiler.source>
        <maven.compiler.target>8</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

    <dependencies>
        <dependency>
            <groupId>com.github.houbb</groupId>
            <artifactId>bytekit-tool</artifactId>
            <version>1.1.0</version>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-jar-plugin</artifactId>
                <version>3.2.2</version>
                <configuration>
                    <archive>
                        <manifestEntries>
                            <build-time>${maven.build.timestamp}</build-time>
                        </manifestEntries>
                        <manifestFile>src/main/resources/META-INF/MANIFEST.MF</manifestFile>
                    </archive>
                </configuration>
            </plugin>
        </plugins>
    </build>

</project>
```

## 核心代码

- MyAgent.java

作为代理的入口，主要是 premain 方法。

```java
package com.github.houbb.bytekit.learn.agent;

import java.lang.instrument.ClassDefinition;
import java.lang.instrument.ClassFileTransformer;
import java.lang.instrument.Instrumentation;
import java.lang.instrument.UnmodifiableClassException;
import java.util.jar.JarFile;

public class MyAgent implements Instrumentation {
    @Override
    public void addTransformer(ClassFileTransformer transformer, boolean canRetransform) {

    }

    @Override
    public void addTransformer(ClassFileTransformer transformer) {

    }

    @Override
    public boolean removeTransformer(ClassFileTransformer transformer) {
        return false;
    }

    @Override
    public boolean isRetransformClassesSupported() {
        return false;
    }

    @Override
    public void retransformClasses(Class<?>... classes) throws UnmodifiableClassException {

    }

    @Override
    public boolean isRedefineClassesSupported() {
        return false;
    }

    @Override
    public void redefineClasses(ClassDefinition... definitions) throws ClassNotFoundException, UnmodifiableClassException {

    }

    @Override
    public boolean isModifiableClass(Class<?> theClass) {
        return false;
    }

    @Override
    public Class[] getAllLoadedClasses() {
        return new Class[0];
    }

    @Override
    public Class[] getInitiatedClasses(ClassLoader loader) {
        return new Class[0];
    }

    @Override
    public long getObjectSize(Object objectToSize) {
        return 0;
    }

    @Override
    public void appendToBootstrapClassLoaderSearch(JarFile jarfile) {

    }

    @Override
    public void appendToSystemClassLoaderSearch(JarFile jarfile) {

    }

    @Override
    public boolean isNativeMethodPrefixSupported() {
        return false;
    }

    @Override
    public void setNativeMethodPrefix(ClassFileTransformer transformer, String prefix) {

    }

    // main 方法用于注册 MyAgent

    /**
     * https://blog.csdn.net/tterminator/article/details/54381618
     *
     * @param agentArgs
     * @param inst
     */
    public static void premain(String agentArgs, Instrumentation inst) {
        System.out.println("jvm premain start");
        inst.addTransformer(new MyClassFileTransformer(), true);
        System.out.println("jvm premain end");
    }

}
```

我们在这里指定了类转换实现 MyClassFileTransformer

- MyClassFileTransformer.java

```java
package com.github.houbb.bytekit.learn.agent;

import com.github.houbb.bytekit.learn.agent.interceptor.SampleInterceptor;
import com.github.houbb.bytekit.tool.utils.AgentHelper;

import java.lang.instrument.ClassFileTransformer;
import java.lang.instrument.IllegalClassFormatException;
import java.security.ProtectionDomain;

public class MyClassFileTransformer implements ClassFileTransformer {

    @Override
    public byte[] transform(ClassLoader loader, String className,
                            Class<?> classBeingRedefined,
                            ProtectionDomain protectionDomain,
                            byte[] classfileBuffer) throws IllegalClassFormatException {
        // 注意：这里的类名称是斜杠，而不是点
        if(className.equals("com/github/houbb/bytekit/tool/Sample")) {
             byte[] newBytes = AgentHelper.getEnhanceBytes(classfileBuffer, SampleInterceptor.class, "hello");

            System.out.println(AgentHelper.decompile(newBytes));
            return newBytes;
        }

        return classfileBuffer;
    }

}
```

这里我们针对性的增强我们的测试类 `com/github/houbb/bytekit/tool/Sample`，

- Sample.java

```java
package com.github.houbb.bytekit.tool;

public class Sample {

    private int exceptionCount = 0;

    public String hello(String str, boolean exception) {
        if (exception) {
            exceptionCount++;
            throw new RuntimeException("test exception, str: " + str);
        }
        return "hello " + str;
    }

}
```

- SampleInterceptor.java

对应的代码转换策略，基于 bytekit

```java
package com.github.houbb.bytekit.learn.agent.interceptor;

import com.alibaba.bytekit.asm.binding.Binding;
import com.alibaba.bytekit.asm.interceptor.annotation.AtEnter;
import com.alibaba.bytekit.asm.interceptor.annotation.AtExceptionExit;
import com.alibaba.bytekit.asm.interceptor.annotation.AtExit;
import com.alibaba.bytekit.asm.interceptor.annotation.ExceptionHandler;

public class SampleInterceptor {

    public static class PrintExceptionSuppressHandler {

        @ExceptionHandler(inline = true)
        public static void onSuppress(@Binding.Throwable Throwable e, @Binding.Class Object clazz) {
            System.out.println("exception handler: " + clazz);
            e.printStackTrace();
        }
    }

    @AtEnter(inline = true, suppress = RuntimeException.class, suppressHandler = PrintExceptionSuppressHandler.class)
    public static void atEnter(@Binding.This Object object,
                               @Binding.Class Object clazz,
                               @Binding.Args Object[] args,
                               @Binding.MethodName String methodName,
                               @Binding.MethodDesc String methodDesc) {
        System.out.println("atEnter, args[0]: " + args[0]);
    }

    @AtExit(inline = true)
    public static void atExit(@Binding.Return Object returnObject) {
        System.out.println("atExit, returnObject: " + returnObject);
    }

    @AtExceptionExit(inline = true, onException = RuntimeException.class)
    public static void atExceptionExit(@Binding.Throwable RuntimeException ex,
                                       @Binding.Field(name = "exceptionCount") int exceptionCount) {
        System.out.println("atExceptionExit, ex: " + ex.getMessage() + ", field exceptionCount: " + exceptionCount);
    }

}
```

## 配置 agent 信息

我们需要在 `MANIFEST.MF` 文件中配置 agent 信息，便于程序启动时识别。

- MANIFEST.MF

```
Manifest-Version: 1.0
Premain-Class: com.github.houbb.bytekit.learn.agent.MyAgent
Can-Redefine-Classes: true
Can-Retransform-Classes: true

```

## 测试代码

### 编译 agent

编译程序

```
mvn clean install
```

可以得到上面的 agent 包，路径为：D:/github/bytekit-learn/bytekit-learn-agent/target/bytekit-learn-agent-1.0-SNAPSHOT.jar

### main 配置

我们写一个简单的 main 方法：

```java
public static void main(String[] args) {
    Sample sample = new Sample();
    String result = sample.hello("123", false);
    System.out.println(result);
}
```

我们在 main 方法，配置对应的 vm 启动参数：

```
-javaagent:D:/github/bytekit-learn/bytekit-learn-agent/target/bytekit-learn-agent-1.0-SNAPSHOT.jar
```

### 测试结果

测试日志如下：

```java
jvm premain start
jvm premain end
/*
 * Decompiled with CFR.
 */
package com.github.houbb.bytekit.tool;

public class Sample {
    private int exceptionCount = 0;

    /*
     * WARNING - void declaration
     */
    public String hello(String string, boolean bl) {
        try {
            String string2;
            void str;
            void exception;
            try {
                String string3 = "(Ljava/lang/String;Z)Ljava/lang/String;";
                String string4 = "hello";
                Object[] objectArray = new Object[]{string, new Boolean(bl)};
                Class<Sample> clazz = Sample.class;
                Sample sample = this;
                System.out.println("atEnter, args[0]: " + objectArray[0]);
            }
            catch (RuntimeException runtimeException) {
                Class<Sample> clazz = Sample.class;
                RuntimeException runtimeException2 = runtimeException;
                System.out.println("exception handler: " + clazz);
                runtimeException2.printStackTrace();
            }
            if (exception != false) {
                ++this.exceptionCount;
                throw new RuntimeException("test exception, str: " + (String)str);
            }
            String string5 = string2 = "hello " + (String)str;
            System.out.println("atExit, returnObject: " + string5);
            return string2;
        }
        catch (RuntimeException runtimeException) {
            int n = this.exceptionCount;
            RuntimeException runtimeException3 = runtimeException;
            System.out.println("atExceptionExit, ex: " + runtimeException3.getMessage() + ", field exceptionCount: " + n);
            throw runtimeException;
        }
    }
}

atEnter, args[0]: 123
atExit, returnObject: hello 123
hello 123
```

# 参考资料

https://blog.csdn.net/tterminator/article/details/54381618

https://www.cnblogs.com/756623607-zhang/p/12575509.html

* any list
{:toc}