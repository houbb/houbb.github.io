---
layout: post
title: java agent-02-Java Instrumentation API
date:  2023-07-12 +0800
categories: [Java]
tags: [java, sh]
published: true
---

# 介绍一下 Java Instrumentation API

Java Instrumentation API是Java平台提供的一组API，它允许开发者在运行时通过修改字节码来监测和改变Java应用程序的行为。

这个API在Java SE 5（JDK 5）引入，为开发者提供了访问和操作类加载、字节码修改和类转换的能力，使得在Java应用程序运行时进行动态修改成为可能。

Java Instrumentation API的主要组成部分包括两个接口：`Instrumentation`和`ClassFileTransformer`。

1. **Instrumentation接口**：

   `Instrumentation`接口是Java Instrumentation API的核心部分，它位于`java.lang.instrument`包中。
   
   该接口允许代理程序（即Java代理）与JVM进行交互，并在类加载过程中对类进行修改。

   通过`Instrumentation`接口，代理程序可以实现以下功能：
   - 获取已加载的类信息，包括类的名称、方法、字段等。
   - 修改类的字节码，实现对类的增强和拦截。
   - 动态定义新的类。
   - 获取和修改类加载器，实现自定义类加载器的功能。

   要使用`Instrumentation`接口，代理程序需要在`premain`或`agentmain`方法中获取一个`Instrumentation`实例。这些方法是Java代理程序的入口点，`premain`在应用程序启动时调用，`agentmain`在应用程序运行时动态加载代理时调用。

2. **ClassFileTransformer接口**：
   `ClassFileTransformer`接口是用于在类加载过程中修改类字节码的关键接口。它位于`java.lang.instrument`包中。

   通过实现`ClassFileTransformer`接口，代理程序可以在类被加载之前或之后，对类的字节码进行修改。在类加载期间，JVM会调用`ClassFileTransformer`的`transform`方法，代理程序可以在该方法中实现对类字节码的修改，并返回修改后的字节码。

   `ClassFileTransformer`接口的方法：
   ```java
   byte[] transform(ClassLoader loader, String className, Class<?> classBeingRedefined,
                    ProtectionDomain protectionDomain, byte[] classfileBuffer) throws IllegalClassFormatException;
   ```

   - `loader`：表示加载当前类的类加载器。
   - `className`：表示正在加载的类的全限定名。
   - `classBeingRedefined`：表示正在重定义的类的Class对象，若不是重定义，则为null。
   - `protectionDomain`：表示保护该类域的域对象。
   - `classfileBuffer`：表示类的字节码内容。

Java Instrumentation API为开发者提供了强大的能力，使得在Java应用程序运行时对类进行修改和增强成为可能。

但同时也需要注意，使用Java Instrumentation API需要小心谨慎，确保代理程序的操作是合理的，并且不会影响应用程序的稳定性和安全性。


# 入门例子

## 代码

实现接口

- MyAgent.java

```java
package com.github.houbb.agent.learn.agent;

import com.github.houbb.agent.learn.transfer.MyTransformer;

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
    public static void premain(String agentArgs, Instrumentation inst) {
        inst.addTransformer(new MyTransformer());
    }
    
}
```

最核心的就是最下面的方法。

- MyTransformer.java

```java
package com.github.houbb.agent.learn.transfer;

import java.lang.instrument.ClassFileTransformer;
import java.lang.instrument.IllegalClassFormatException;
import java.security.ProtectionDomain;

public class MyTransformer implements ClassFileTransformer {

    @Override
    public byte[] transform(ClassLoader loader, String className, Class<?> classBeingRedefined, ProtectionDomain protectionDomain, byte[] classfileBuffer) throws IllegalClassFormatException {
        //只处理自定义的类
        if(className.startsWith("com")) {
            // 在此处对类的字节码进行增强，这里只是简单打印类名

            System.out.println("Transforming class: " + className);
        }

        return classfileBuffer;
    }

}
```

我们只针对 com 开头的方法进行增强。

## 配置 MANIFEST.MF

我们新建一个文件 `src\main\resources\META-INF\MANIFEST.MF`，内容如下：

```
Manifest-Version: 1.0
Premain-Class: com.github.houbb.agent.learn.agent.MyAgent
```

需要指定我们定义的 Agent 路径。


## 打包

```
mvn clean install
```

生成的 agent jar 完整路径：

```
D:/code/learn/agent-learn/target/agent-learn-1.0-SNAPSHOT.jar
```

### maven 插件

第一次测试的时候，发现自定义的 MANIFEST.MF 并没有被打包到最总的 jar 中，会导致找不到 Agent 信息。

我们可以在 pom 中指定：

```xml
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
```

# 定义测试代码

## 测试方法

我们创建一个简单的测试类

```java
package com.github.houbb.agent.learn.test;

public class Main {
    public static void main(String[] args) {
        System.out.println("Hello world!");
    }
}
```

## 测试

1) 编译

```
mvn clean compile
```

编译上面的类，然后到 classes 目录下

2） 运行

```
java -javaagent:D:/code/learn/agent-learn/target/agent-learn-1.0-SNAPSHOT.jar -cp .  com.github.houbb.agent.learn.test.Main
```

效果如下

```
PS D:\code\learn\agent-learn-test\target\classes> java -javaagent:D:/code/learn/agent-learn/target/agent-learn-1.0-SNAPSHOT.jar -cp .  com.github.houbb.agent.learn.test.Main
Transforming class: com/github/houbb/agent/learn/test/Main
Hello world!
```

# 参考资料

https://blog.csdn.net/xixi8865/article/details/23849125

* any list
{:toc}