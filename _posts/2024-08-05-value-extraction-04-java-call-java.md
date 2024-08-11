---
layout: post
title: 字符串值提取工具-04-java 调用 java? Janino 编译工具
date: 2024-08-05 21:01:55 +0800
categories: [Java]
tags: [java, open-source, tool, sh]
published: true
---

# 场景

我们希望通过 java 执行 java，如何实现呢?

# 入门例子

## 代码

```java
package org.example;

import javax.tools.*;
import java.io.File;
import java.lang.reflect.Method;
import java.net.URI;
import java.net.URL;
import java.net.URLClassLoader;
import java.util.Arrays;

public class DynamicJavaExecutor {

    public static void main(String[] args) {
        // Java 代码字符串
        String javaCode =
                "public class HelloWorld { " +
                        "    public static void main(String[] args) { " +
                        "        System.out.println(\"Hello, World!\"); " +
                        "    } " +
                        "} ";

        // 编译 Java 代码
        boolean success = compileJavaCode("HelloWorld", javaCode);
        if (success) {
            try {
                // 使用 URLClassLoader 加载编译后的类
                File file = new File("./"); // 获取当前目录
                URL url = file.toURI().toURL(); // 转换为 URL
                URLClassLoader classLoader = new URLClassLoader(new URL[]{url});
                Class<?> clazz = classLoader.loadClass("HelloWorld");

                // 调用类的 main 方法
                Method mainMethod = clazz.getMethod("main", String[].class);
                String[] params = null; // 传递给 main 方法的参数
                mainMethod.invoke(null, (Object) params);
            } catch (Exception e) {
                e.printStackTrace();
            }
        } else {
            System.out.println("Compilation failed.");
        }
    }

    public static boolean compileJavaCode(String className, String javaCode) {
        // 创建自定义的 JavaFileObject
        JavaFileObject fileObject = new InMemoryJavaFileObject(className, javaCode);

        // 获取系统 Java 编译器
        JavaCompiler compiler = ToolProvider.getSystemJavaCompiler();
        StandardJavaFileManager fileManager = compiler.getStandardFileManager(null, null, null);

        // 设置输出目录
        Iterable<String> options = Arrays.asList("-d", "./");

        // 编译 Java 代码
        JavaCompiler.CompilationTask task = compiler.getTask(
                null,
                fileManager,
                null,
                options,
                null,
                Arrays.asList(fileObject)
        );

        // 进行编译
        return task.call();
    }

    // 内部类，用于在内存中表示 Java 源文件
    static class InMemoryJavaFileObject extends SimpleJavaFileObject {
        private final String code;

        protected InMemoryJavaFileObject(String name, String code) {
            super(URI.create("string:///" + name.replace('.', '/') + Kind.SOURCE.extension), Kind.SOURCE);
            this.code = code;
        }

        @Override
        public CharSequence getCharContent(boolean ignoreEncodingErrors) {
            return code;
        }
    }
}
```

测试效果：

```
Hello, World!
```

# Janino 例子

## maven 引入

```xml
<dependency>
    <groupId>org.codehaus.janino</groupId>
    <artifactId>janino</artifactId>
    <version>3.1.9</version>
</dependency>
```

## 代码

```java
package org.example;

import org.codehaus.janino.SimpleCompiler;

public class JaninoExample {

    public static void main(String[] args) throws Exception {
        // Java 代码字符串
        String javaCode =
                "public class HelloWorld { " +
                        "    public void run() { " +
                        "        System.out.println(\"Hello, World!\"); " +
                        "    } " +
                        "} ";

        // 创建编译器实例
        SimpleCompiler compiler = new SimpleCompiler();

        // 编译 Java 代码
        compiler.cook(javaCode);

        // 获取编译后的类
        Class<?> clazz = compiler.getClassLoader().loadClass("HelloWorld");

        // 创建类的实例
        Object instance = clazz.getDeclaredConstructor().newInstance();

        // 调用 run 方法
        clazz.getMethod("run").invoke(instance);
    }

}
```

## 直接执行该方法

```java
package com.github.houbb.value.extraction.test;

import org.codehaus.janino.ScriptEvaluator;

public class JavaDemoTest {

    public static void main(String[] args) throws Exception {
        // Java 脚本字符串
        String script =
                "System.out.println(\"Hello, World!\");";

        // 创建脚本求值器实例
        ScriptEvaluator scriptEvaluator = new ScriptEvaluator();

        // 编译并执行脚本
        scriptEvaluator.cook(script);
        scriptEvaluator.evaluate(null);
    }

}
```

## 传入参数，直接执行

```java
package com.github.houbb.value.extraction.test;

import org.codehaus.janino.ScriptEvaluator;

import java.util.HashMap;
import java.util.Map;

public class JaninoExample {

    public static void main(String[] args) throws Exception {
        // 创建一个包含参数的 Map
        Map<String, Object> bindings = new HashMap<>();
        bindings.put("a", 10);
        bindings.put("b", 20);

        // 定义要执行的脚本
        String script = "System.out.println(\"Result: \" + (a + b));";

        // 调用方法来执行脚本
        executeScriptWithBindings(script, bindings);
    }

    public static void executeScriptWithBindings(String script, Map<String, Object> bindings) throws Exception {
        // 提取 Map 中的键（参数名）和值（参数值）
        String[] parameterNames = bindings.keySet().toArray(new String[0]);
        Class<?>[] parameterTypes = new Class<?>[parameterNames.length];

        // 假设所有参数的类型都是 Object，可以根据需要修改类型推断逻辑
        for (int i = 0; i < parameterNames.length; i++) {
            parameterTypes[i] = bindings.get(parameterNames[i]).getClass();
        }

        // 创建 ScriptEvaluator 实例
        ScriptEvaluator scriptEvaluator = new ScriptEvaluator();

        // 设置脚本的参数名称和类型
        scriptEvaluator.setParameters(parameterNames, parameterTypes);

        // 编译脚本
        scriptEvaluator.cook(script);

        // 提取 Map 中的值作为参数
        Object[] parameterValues = bindings.values().toArray();

        // 执行脚本
        scriptEvaluator.evaluate(parameterValues);
    }
}
```

------------------------------------------

# chat

## java 调用 java

这个错误通常是因为编译的类没有正确加载到类加载器的路径中。我们需要确保编译后的类文件被正确加载。

在此示例中，我们需要使用一个自定义的类加载器来加载编译后的类。以下是修正后的代码，确保类文件编译后正确加载和执行：

```java
import javax.tools.JavaCompiler;
import javax.tools.ToolProvider;
import javax.tools.JavaFileObject;
import javax.tools.StandardJavaFileManager;
import javax.tools.SimpleJavaFileObject;
import java.net.URI;
import java.util.Arrays;
import java.util.Locale;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.lang.reflect.Method;
import java.io.File;
import java.net.URL;
import java.net.URLClassLoader;

public class DynamicJavaExecutor {
    public static void main(String[] args) {
        // Java 代码字符串
        String javaCode = 
            "public class HelloWorld { " +
            "    public static void main(String[] args) { " +
            "        System.out.println(\"Hello, World!\"); " +
            "    } " +
            "} ";

        // 编译 Java 代码
        boolean success = compileJavaCode("HelloWorld", javaCode);
        if (success) {
            try {
                // 使用 URLClassLoader 加载编译后的类
                File file = new File("./"); // 获取当前目录
                URL url = file.toURI().toURL(); // 转换为 URL
                URLClassLoader classLoader = new URLClassLoader(new URL[]{url});
                Class<?> clazz = classLoader.loadClass("HelloWorld");
                
                // 调用类的 main 方法
                Method mainMethod = clazz.getMethod("main", String[].class);
                String[] params = null; // 传递给 main 方法的参数
                mainMethod.invoke(null, (Object) params);
            } catch (Exception e) {
                e.printStackTrace();
            }
        } else {
            System.out.println("Compilation failed.");
        }
    }

    public static boolean compileJavaCode(String className, String javaCode) {
        // 创建自定义的 JavaFileObject
        JavaFileObject fileObject = new InMemoryJavaFileObject(className, javaCode);

        // 获取系统 Java 编译器
        JavaCompiler compiler = ToolProvider.getSystemJavaCompiler();
        StandardJavaFileManager fileManager = compiler.getStandardFileManager(null, null, null);

        // 设置输出目录
        Iterable<String> options = Arrays.asList("-d", "./");

        // 编译 Java 代码
        JavaCompiler.CompilationTask task = compiler.getTask(
            null, 
            fileManager, 
            null, 
            options, 
            null, 
            Arrays.asList(fileObject)
        );

        // 进行编译
        return task.call();
    }

    // 内部类，用于在内存中表示 Java 源文件
    static class InMemoryJavaFileObject extends SimpleJavaFileObject {
        private final String code;

        protected InMemoryJavaFileObject(String name, String code) {
            super(URI.create("string:///" + name.replace('.', '/') + Kind.SOURCE.extension), Kind.SOURCE);
            this.code = code;
        }

        @Override
        public CharSequence getCharContent(boolean ignoreEncodingErrors) {
            return code;
        }
    }
}
```

### 关键点说明：

1. **编译输出目录**：在 `compileJavaCode` 方法中，使用 `-d ./` 设置编译输出目录为当前目录。
2. **URLClassLoader**：在加载编译后的类时，使用 `URLClassLoader` 从当前目录加载类文件。

通过这些修改，编译后的类文件将存储在当前目录，并且可以正确加载和执行。

你可以根据需要调整代码以适应不同的目录结构或文件位置。

如果你有更多问题或需求，请告诉我。

# 有没有比较成熟的工具？


在 Java 中，有一些成熟的工具和库可以帮助你动态编译和执行 Java 代码字符串。以下是两个常用的工具：

1. **Janino**：一个小型但功能强大的 Java 编译器，可以在运行时编译和执行 Java 代码。
2. **JShell**：自 Java 9 引入的交互式编程工具，允许在 REPL 环境中执行 Java 代码。

### 使用 Janino 动态编译和执行 Java 代码

Janino 是一个嵌入式的 Java 编译器，适合在运行时编译和执行代码。

1. **添加 Janino 依赖**：
   
   如果你使用 Maven，添加以下依赖：
   ```xml
   <dependency>
       <groupId>org.codehaus.janino</groupId>
       <artifactId>janino</artifactId>
       <version>3.1.9</version>
   </dependency>
   ```

   如果你使用 Gradle，添加以下依赖：
   ```groovy
   implementation 'org.codehaus.janino:janino:3.1.9'
   ```

2. **使用 Janino 编译和执行 Java 代码**：

   ```java
   import org.codehaus.janino.SimpleCompiler;

   public class JaninoExample {
       public static void main(String[] args) throws Exception {
           // Java 代码字符串
           String javaCode = 
               "public class HelloWorld { " +
               "    public void run() { " +
               "        System.out.println(\"Hello, World!\"); " +
               "    } " +
               "} ";

           // 创建编译器实例
           SimpleCompiler compiler = new SimpleCompiler();
           
           // 编译 Java 代码
           compiler.cook(javaCode);
           
           // 获取编译后的类
           Class<?> clazz = compiler.getClassLoader().loadClass("HelloWorld");
           
           // 创建类的实例
           Object instance = clazz.getDeclaredConstructor().newInstance();
           
           // 调用 run 方法
           clazz.getMethod("run").invoke(instance);
       }
   }
   ```

### 使用 JShell 动态执行 Java 代码

JShell 是 Java 9 引入的工具，可以在交互式环境中运行 Java 代码。

1. **启动 JShell**：

   在命令行中，输入 `jshell` 以启动 JShell。

2. **在 JShell 中执行代码**：

   ```java
   jshell> int x = 10;
   x ==> 10

   jshell> System.out.println("Hello, World!");
   Hello, World!

   jshell> /exit
   ```

JShell 适合用于交互式开发和测试，但不太适合在生产代码中动态执行 Java 代码。

### 选择合适的工具

对于在运行时动态编译和执行 Java 代码，Janino 是一个非常成熟且易用的工具。

而 JShell 则更适合用于交互式开发和快速测试。

# 参考资料

* any list
{:toc}