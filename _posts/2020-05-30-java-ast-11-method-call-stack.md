---
layout: post
title: JavaParser 系列学习-11-java method call stack java 方法调用堆栈的几种方法
date:  2020-5-29 14:24:18 +0800
categories: [java]
tags: [aop, ast, sh]
published: true
---

# Q1: java 如何获取一个方法的调用链路

在Java中，你可以使用堆栈跟踪（stack trace）来获取方法的调用链路。

堆栈跟踪是一个记录方法调用信息的机制，它可以告诉你程序在执行过程中到达了哪个方法，以及是通过哪些方法调用到达的。

你可以在程序中捕获堆栈跟踪信息，然后分析它来获取方法的调用链路。

在Java中，你可以使用以下方法来获取方法的调用链路：

1. **使用异常堆栈跟踪**：

   ```java
   try {
       // 调用方法
       method1();
   } catch (Exception e) {
       e.printStackTrace();
   }
   ```

   在上面的代码中，如果`method1()`中抛出了异常并且没有在方法内部处理，异常将会被捕获并且打印堆栈跟踪信息。你可以从这些信息中获取方法的调用链路。

2. **使用Thread类的getStackTrace()方法**：

   ```java
   // 获取当前线程的堆栈跟踪
   StackTraceElement[] stackTrace = Thread.currentThread().getStackTrace();
   
   // 遍历堆栈跟踪元素
   for (StackTraceElement element : stackTrace) {
       // 打印方法调用信息
       System.out.println(element.getClassName() + "." + element.getMethodName());
   }
   ```

`Thread.currentThread().getStackTrace()`方法返回一个`StackTraceElement`数组，其中包含当前线程的堆栈跟踪信息。

你可以遍历这个数组并打印方法的类名和方法名来获取调用链路信息。

请注意，堆栈跟踪信息可能包含很多调用信息，包括Java运行时库和第三方库的方法调用。你需要仔细分析堆栈跟踪信息，找到你关心的方法调用链路。

## 测试验证

- UserService.java

```java
package com.github.houbb.java.callgraph.ex.stat.service;

import com.github.houbb.java.callgraph.ex.stat.dao.UserDao;

public class UserService {

    public String queryById(String id) {
        UserDao userDao = new UserDao();
        return "service-" + userDao.queryById(id);
    }

}
```

- UserDao.java

```java
package com.github.houbb.java.callgraph.ex.stat.dao;

import com.github.houbb.java.callgraph.ex.stat.util.StackTraceElementUtil;

public class UserDao {

    public String queryById(String id) {
        // 添加堆栈打印
        StackTraceElementUtil.printStackTrace();

        return "dao-" + id;
    }

}
```

- StackTraceElementUtil.printStackTrace

```java
package com.github.houbb.java.callgraph.ex.stat.util;

public class StackTraceElementUtil {

    public static void printStackTrace() {
        // 获取当前线程的堆栈跟踪
        StackTraceElement[] stackTrace = Thread.currentThread().getStackTrace();

        // 遍历堆栈跟踪元素
        for (StackTraceElement element : stackTrace) {
            // 打印方法调用信息
            System.out.println(element.getClassName() + "." + element.getMethodName());
        }
    }

}
```

测试代码：

```java
package com.github.houbb.java.callgraph.ex.stat;

import com.github.houbb.java.callgraph.ex.stat.service.UserService;

public class MethodStackTraceTest {

    public static void main(String[] args) {
        UserService userService = new UserService();
        userService.queryById("1");
    }

}
```


结果：

```
java.lang.Thread.getStackTrace
com.github.houbb.java.callgraph.ex.stat.util.StackTraceElementUtil.printStackTrace
com.github.houbb.java.callgraph.ex.stat.dao.UserDao.queryById
com.github.houbb.java.callgraph.ex.stat.service.UserService.queryById
com.github.houbb.java.callgraph.ex.stat.MethodStackTraceTest.main
```

可以把当前的方法调用联调打印出来。

PS: 这种需要程序运行起来，而且如果方法堆栈调用结束，信息应该就没有了。可以采用一个 threadLocal 之类的，从头到尾的完整保存整个调用联调。

# Q2: 如何通过代码的静态分析，获取方法调用链

通过代码的静态分析，你可以使用静态分析工具（例如静态代码分析器、编译器插件等）来获取方法调用链。

这种方法不需要运行程序，而是直接分析源代码或编译后的中间代码。

以下是一些常用的方法：

## 常用方式

### 1. **使用AST（抽象语法树）分析**：

通过构建源代码的抽象语法树，你可以分析代码结构，包括方法和方法调用。

你可以使用JavaParser等开源库来解析Java源代码并构建抽象语法树。

然后，你可以遍历这棵树，找到方法的定义和调用，从而构建方法调用链路。

### 2. **使用字节码分析**：

如果你分析的是编译后的Java字节码，你可以使用工具如ASM（Java字节码操纵框架）来解析字节码文件，找到方法调用指令（例如`invokevirtual`、`invokestatic`等），从而构建方法调用链路。

### 3. **使用静态分析工具**：

静态分析工具如FindBugs、PMD、Checkstyle等可以帮助你分析代码，并提供有关方法调用链的信息。这些工具通常有现成的规则和插件，可以直接用于分析代码，并生成报告。

无论使用哪种方法，静态分析都可以帮助你获取方法调用链信息，但是需要根据具体的需求选择适合的工具或方法。

# javaparser 处理例子

## 说明

javaparser 是用来分析 java 源代码的。

### maven 依赖

```xml
<dependency>
    <groupId>com.github.javaparser</groupId>
    <artifactId>javaparser-core</artifactId>
    <version>3.25.5</version>
</dependency>
```

### 实现

```java
package com.github.houbb.java.callgraph.ex.stat;

import com.github.javaparser.JavaParser;
import com.github.javaparser.ParseResult;
import com.github.javaparser.ast.CompilationUnit;
import com.github.javaparser.ast.body.MethodDeclaration;
import com.github.javaparser.ast.expr.MethodCallExpr;

import java.nio.file.Path;
import java.nio.file.Paths;

public class JavaParserStackTraceTest {

    public static void main(String[] args) throws Exception {
        // 读取Java源代码文件
        String filePath = "D:\\code\\learn\\java-callgraph-ex\\src\\test\\java\\com\\github\\houbb\\java\\callgraph\\ex\\stat\\service\\UserService.java";
        Path path = Paths.get(filePath);
        ParseResult<CompilationUnit> parseResult = new JavaParser().parse(path);

        // 检查源代码是否解析成功
        if (parseResult.isSuccessful() && parseResult.getResult().isPresent()) {
            CompilationUnit compilationUnit = parseResult.getResult().get();

            // 遍历所有方法
            compilationUnit.findAll(MethodDeclaration.class).forEach(method -> {
                // 获取方法名
                String methodName = method.getNameAsString();
                System.out.println("Method: " + methodName);

                // 获取方法内的方法调用
                method.findAll(MethodCallExpr.class).forEach(call -> {
                    String calledMethodName = call.getScope().get().toString() + "#" +call.getNameAsString();
                    System.out.println("    Calls: " + calledMethodName);
                });
            });
        } else {
            System.out.println("Failed to parse the Java source file.");
        }
    }

}
```

效果：

```
Method: queryById
    Calls: userDao#queryById
```

## 优点与不足

优点：javaparser 比较成熟，可以直接解析 java 源代码。

缺点：很多时候都是编译后的 class 文件，或者是 jar 文件。

# ASM 例子

## 说明 

当你想要分析方法调用链的时候，了解字节码是非常有用的。

Java字节码是Java源代码编译后的中间代码，可以通过Java编译器生成。

下面是一个使用ASM库（Java字节码操纵框架）来分析方法调用链的简单例子：

## maven 依赖

首先，你需要在你的项目中包含ASM库的依赖。

如果使用Maven，你可以在pom.xml文件中添加以下依赖：

```xml
<dependency>
    <groupId>org.ow2.asm</groupId>
    <artifactId>asm</artifactId>
    <version>9.2</version>
</dependency>
```

## 测试验证

```java
package com.github.houbb.java.callgraph.ex.stat;

import org.objectweb.asm.ClassReader;
import org.objectweb.asm.ClassVisitor;
import org.objectweb.asm.MethodVisitor;
import org.objectweb.asm.Opcodes;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Paths;

public class AsmStackTraceTest {

    public static void main(String[] args) throws IOException {
        InputStream inputStream = Files.newInputStream(Paths.get("D:\\code\\learn\\java-callgraph-ex\\target\\test-classes\\com\\github\\houbb\\java\\callgraph\\ex\\stat\\service\\UserService.class"));
        // 读取类文件并创建ClassReader对象
        ClassReader classReader = new ClassReader(inputStream);

        // 创建ClassVisitor来处理类文件
        ClassVisitor classVisitor = new ClassVisitor(Opcodes.ASM7) {
            @Override
            public MethodVisitor visitMethod(int access, String name, String desc, String signature, String[] exceptions) {
                // 创建MethodVisitor来处理方法
                MethodVisitor methodVisitor = super.visitMethod(access, name, desc, signature, exceptions);

                // 输出方法名
                System.out.println("Method: " + name);

                // 创建一个新的MethodVisitor来分析方法内部的调用
                return new MethodVisitor(Opcodes.ASM7, methodVisitor) {
                    @Override
                    public void visitMethodInsn(int opcode, String owner, String name, String desc, boolean itf) {
                        // 输出方法调用信息
                        System.out.println("    Calls: " + owner + "." + name);
                        super.visitMethodInsn(opcode, owner, name, desc, itf);
                    }
                };
            }
        };

        // 开始分析类文件
        classReader.accept(classVisitor, 0);
    }

}
```

日志：

```
Method: <init>
    Calls: java/lang/Object.<init>
Method: queryById
    Calls: com/github/houbb/java/callgraph/ex/stat/dao/UserDao.<init>
    Calls: java/lang/StringBuilder.<init>
    Calls: java/lang/StringBuilder.append
    Calls: com/github/houbb/java/callgraph/ex/stat/dao/UserDao.queryById
    Calls: java/lang/StringBuilder.append
    Calls: java/lang/StringBuilder.toString
```

我们再对照一下 java 源码

```java
import com.github.houbb.java.callgraph.ex.stat.dao.UserDao;

public class UserService {

    public String queryById(String id) {
        UserDao userDao = new UserDao();
        return "service-" + userDao.queryById(id);
    }

}
```

UserService 首先会有 object 的初始化。

queryById 调用的是 UserDao，然后有对应的字符串拼接+方法调用。

这种分析的可以说是非常清晰了。

## 优缺点

优点：基于 bytecode 字节码，ASM 比较强大。

不足: ams 工具本身非常接近于底层，所以使用起来可能要考虑很多问题，比如各种兼容之类的。所以有一些封装的包。

bytebubby

bytekit

cglib

javassist

apache-bcel

# 基于 javassit 的封装处理

## 说明

当使用 Javassist 进行方法调用链分析时，我们需要进一步解析方法体内的字节码指令，以获取方法内部的方法调用。

## maven 

如果使用Maven，你可以在`pom.xml`文件中添加以下依赖：

```xml
<dependency>
    <groupId>org.javassist</groupId>
    <artifactId>javassist</artifactId>
    <version>3.28.0-GA</version>
</dependency>
```

接下来，你可以使用 javassist 来分析方法调用链。

## 代码例子

以下是一个示例代码：

```java
package com.github.houbb.java.callgraph.ex.stat;

import com.github.houbb.java.callgraph.ex.stat.service.UserService;
import javassist.ClassPool;
import javassist.CtClass;
import javassist.CtMethod;
import javassist.bytecode.CodeIterator;

public class JavaassistStackTraceTest {

    public static void main(String[] args) throws Exception {
        // 创建ClassPool
        ClassPool classPool = ClassPool.getDefault();

        // 获取要分析的类
        CtClass ctClass = classPool.get(UserService.class.getName());

        // 获取类中的所有方法
        CtMethod[] methods = ctClass.getDeclaredMethods();
        for (CtMethod method : methods) {
            // 获取方法名
            String methodName = method.getName();
            System.out.println("Method: " + methodName);

            // 获取方法内部的调用信息
            // 获取方法内部的调用信息
            CodeIterator codeIterator = method.getMethodInfo().getCodeAttribute().iterator();
            while (codeIterator.hasNext()) {
                int index = codeIterator.next();
                int opCode = codeIterator.byteAt(index);

                // 如果是方法调用指令
                if (opCode == javassist.bytecode.Opcode.INVOKEVIRTUAL ||
                        opCode == javassist.bytecode.Opcode.INVOKESTATIC ||
                        opCode == javassist.bytecode.Opcode.INVOKEINTERFACE) {
                    int methodIndex = codeIterator.u16bitAt(index + 1);
                    String methodDescriptor = method.getMethodInfo().getConstPool().getMethodrefType(methodIndex);
                    String methodNameCalled = method.getMethodInfo().getConstPool().getMethodrefName(methodIndex);
                    String classNameCalled = method.getMethodInfo().getConstPool().getMethodrefClassName(methodIndex);

                    // 输出方法调用信息
                    System.out.println("    Calls: " + classNameCalled + "." + methodNameCalled + methodDescriptor);
                }
            }
        }
    }

}
```

在这个例子中，我们使用Byte Buddy创建了一个新的类，并且拦截了这个类的所有方法调用。当调用`sampleMethod()`时，拦截器会输出方法的调用信息。

请确保将Byte Buddy的依赖添加到你的项目中，并按照上述代码示例来使用它。使用Byte Buddy可以更加简洁地进行字节码分析和方法调用拦截。

结果：

```
Method: queryById
    Calls: java.lang.StringBuilder.append(Ljava/lang/String;)Ljava/lang/StringBuilder;
    Calls: com.github.houbb.java.callgraph.ex.stat.dao.UserDao.queryById(Ljava/lang/String;)Ljava/lang/String;
    Calls: java.lang.StringBuilder.append(Ljava/lang/String;)Ljava/lang/StringBuilder;
    Calls: java.lang.StringBuilder.toString()Ljava/lang/String;
```

## 优缺点

优点：对 asm 进一步封装，实现更加优雅便捷。

缺点：静态代码分析存在一个弊端，那就是 java 动态获取的内容有时候无法精确获得，比如反射等。

# jvm-sandbox

## 原理

基于 java 的 instrument，通过 premain agent.jar 的挂载方式，获取通过 agent attach 的方式。

TODO...

# 参考资料

https://github.com/gousiosg/java-callgraph

* any list
{:toc}