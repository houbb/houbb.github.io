---
layout: post
title:  Compile Doc Processor
date:  2017-9-29 17:13:18 +0800
categories: [Java]
tags: [java]
published: true
---


# Compile Doc Processor

Java 可以在编译阶段对类的信息进行解析。

阅读要求：最 Java 注解熟悉。

# Simple Demo

## Coding

简单例子，目录结构如下：

```
├─src
│  ├─main
│  │  ├─java
│  │  │  └─com
│  │  │      └─ryo
│  │  │          └─jdk
│  │  │              └─annotation
│  │  │                  │  readme.md
│  │  │                  │
│  │  │                  ├─annotation
│  │  │                  │      Doc.java
│  │  │                  │
│  │  │                  └─processor
│  │  │                          DocProcessor.java
│  │  │
│  │  └─resources
│  │      └─META-INF
│  │          └─services
│  │                  javax.annotation.processing.Processor
│  │
│  └─test
│      └─java
│              DocTest.java
```

- Doc.java

```java
/**
 * Doc 文档注解
 * Created by bbhou on 2017/9/29.
 */
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
@Inherited
public @interface Doc {

    /**
     * 内容
     * @return
     */
    String value() default "";

}
```

- DocProcessor.java

```java
/**
 * 编译时注解
 * Created by bbhou on 2017/9/29.
 */
@SupportedSourceVersion(SourceVersion.RELEASE_7)
@SupportedAnnotationTypes("com.ryo.jdk.annotation.annotation.Doc")
public class DocProcessor extends AbstractProcessor {

    @Override
    public boolean process(Set<? extends TypeElement> annotations, RoundEnvironment roundEnv) {
        for (TypeElement te : annotations) {
            for (Element e : roundEnv.getElementsAnnotatedWith(te)) {
                String value = e.getAnnotation(Doc.class).value();
                System.out.println(">>>>>>>>>>>>>>> sout value: "+value); 
                //1. 如果打印 error, 直接直接中断。
                processingEnv.getMessager().printMessage(Diagnostic.Kind.WARNING, ">>>>>>>>>>>> Doc value = " + value);
            }
        }
        return true;
    }

    @Override
    public SourceVersion getSupportedSourceVersion() {
        return SourceVersion.latestSupported();
    }

}
```

只有声明是不够的，还需要将上述对于 @annotation 的解释器进行注册，在 `javax.annotation.processing.Processor` 文件中添加如下内容(完整类包路径):

```
com.ryo.jdk.annotation.processor.DocProcessor
```

## Compile

我们对上述代码进行打包，以便于其他模块调用。编译时需要禁用当前模块的注解，否则会报错。

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-compiler-plugin</artifactId>
            <version>3.2</version>
            <configuration>
                <source>1.8</source>
                <target>1.8</target>
                <!-- Disable annotation processing for ourselves.-->
                <compilerArgument>-proc:none</compilerArgument>
                <encoding>UTF-8</encoding>
            </configuration>
        </plugin>
    </plugins>
</build>
```

## Test

在其他模块，引用当前打包好的 jar。

编写如下测试：


- DocTest.java

```java
@Doc("hello world")
public class DocTest {
}
```

然后对代码进行编译:

```
$   mvn clean install
```

日志截取如下：

```
...
[INFO] Compiling 31 source files to D:\CODE\jdk\jdk-test\target\test-classes
>>>>>>>>>>>>>>> sout value: hello world
...
```

- `processingEnv.getMessager().printMessage(Diagnostic.Kind.WARNING, ">>>>>>>>>>>> Doc value = " + value);` 

这段代码没有如预期打印。Diagnostic.Kind.WARNING 如果修改为 Diagnostic.Kind.ERROR，则会编译失败。

适用场景：对某些必须的版本号等信息进行校验，如果不通过，直接编译失败。

## Thinking

对于这个编译阶段来说，classes 文件还没有生成，所以想在这里修改对应文件是不太现实的。

这个比较适合对项目中的类信息进行扫描，统计等。




* any list
{:toc}












 

