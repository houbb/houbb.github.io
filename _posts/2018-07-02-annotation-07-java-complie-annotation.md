---
layout: post
title:  Annotation-07-java complile annotation
date:  2018-07-02 22:26:27+0800
categories: [Java]
tags: [java, annotation]
published: true
---

# Java 编译时注解

## 实际意义

本例子仅用于展现简单的编译时注解使用。

编译时注解，可以再编译时生成代码等。比如 lombok。


## 注解处理器

首先来了解下什么是注解处理器，注解处理器是javac的一个工具，它用来在编译时扫描和处理注解（Annotation）。
你可以自定义注解，并注册到相应的注解处理器，由注解处理器来处理你的注解。
一个注解的注解处理器，以Java代码（或者编译过的字节码）作为输入，生成文件（通常是.java文件）作为输出。这些生成的Java代码是在生成的.java文件中，所以你不能修改已经存在的Java类，例如向已有的类中添加方法。这些生成的Java文件，会同其他普通的手动编写的Java源代码一样被javac编译。

# 实例

## maven 的配置

```xml
<properties>
    <!--main-->
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    <compiler.level>1.8</compiler.level>
    <!--plugin-->
    <plugin.compiler.version>3.2</plugin.compiler.version>
    <maven-surefire-plugin.version>2.18.1</maven-surefire-plugin.version>
</properties>

<build>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <version>${plugin.compiler.version}</version>
                <configuration>
                    <source>${compiler.level}</source>
                    <target>${compiler.level}</target>
                    <!-- Disable annotation processing for ourselves.-->
                    <compilerArgument>-proc:none</compilerArgument>
                    <encoding>${project.build.sourceEncoding}</encoding>
                </configuration>
            </plugin>
        </plugins>
    </build>
```

## 目录结构

```
.
├── java
│   └── com
│       └── ryo
│           └── jdk
│               └── annotation
│                   ├── annotation
│                   │   └── Util.java
│                   ├── processor
│                   │   └── UtilProcessor.java
└── resources
    ├── META-INF
    │   └── services
    │       └── javax.annotation.processing.Processor

```

## 定义

- Util.java

```java
import java.lang.annotation.*;

/**
 * Util 注解
 */
@Retention(RetentionPolicy.CLASS)
@Target({ElementType.TYPE})
@Inherited
public @interface Util {
    String value() default "";
}
```

- UtilProcessor.java

mvn clean install 就会去执行这个编译时注解

```java
import javax.annotation.processing.*;
import javax.lang.model.SourceVersion;
import javax.lang.model.element.Element;
import javax.lang.model.element.TypeElement;
import javax.tools.Diagnostic;
import java.util.Set;

/**
 *
 * 编译时注解
 */
@SupportedSourceVersion(SourceVersion.RELEASE_7)
@SupportedAnnotationTypes("com.ryo.jdk.annotation.annotation.Util")
public class UtilProcessor extends AbstractProcessor {

    @Override
    public boolean process(Set<? extends TypeElement> annotations, RoundEnvironment roundEnv) {
        for (TypeElement te : annotations) {
            for (Element e : roundEnv.getElementsAnnotatedWith(te)) {
                Util util = e.getAnnotation(Util.class);
                if(util != null) {
                    final String value = util.value();
                    System.out.println(">>>>>>>>>>>> util value: " + value);

                    //1. 如果打印 error, 直接直接中断。
                    processingEnv.getMessager().printMessage(Diagnostic.Kind.WARNING,
                            ">>>>>>>>>>>> util value = " + value);
                }
            }
        }
        return true;
    }
}
```

- javax.annotation.processing.Processor

```
com.ryo.jdk.annotation.processor.UtilProcessor
```

## 测试

```java
import com.ryo.jdk.annotation.annotation.Util;

@Util("java compile annotation")
public class UtilTest {
}
```

直接运行 `mvn clean install`

在编译的时候，就会执行对应的 `UtilProcessor` 方法

# AutoService

`javax.annotation.processing.Processor` 的编写比较麻烦，我们可以使用 `@AutoService` 简化编程。

AutoService 可以帮你解决这个问题（和上面的方式选择一种使用即可）。
AutoService注解处理器是Google开发的，用来生成 
`META-INF/services/javax.annotation.processing.Processor` 文件的，
你只需要在你定义的注解处理器上添加 @AutoService(Processor.class) 就可以了，简直不能再方便了。

# 代码地址

> [annotation 编译时注解](https://github.com/houbb/jdk/tree/master/jdk-annotation/src/main/java/com/ryo/jdk/annotation/)

# 引用

> [实际应用的例子](http://www.importnew.com/15246.html) 

> [AbstractProcessor 用法示例](http://blog.51cto.com/terryrao/1654812)

* any list
{:toc}