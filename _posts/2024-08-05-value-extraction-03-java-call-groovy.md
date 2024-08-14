---
layout: post
title: 字符串值提取工具-03-java 调用 groovy
date: 2024-08-05 21:01:55 +0800
categories: [Java]
tags: [java, open-source, tool, sh]
published: true
---

# 值提取系列

## 值提取系列

[字符串值提取工具-01-概览](https://houbb.github.io/2024/08/05/value-extraction-01-overview)

[字符串值提取工具-02-java 调用 js](https://houbb.github.io/2024/08/05/value-extraction-02-java-call-js)

[字符串值提取工具-03-java 调用 groovy](https://houbb.github.io/2024/08/05/value-extraction-03-java-call-groovy)

[字符串值提取工具-04-java 调用 java? Janino 编译工具](https://houbb.github.io/2024/08/05/value-extraction-04-java-call-java)

[字符串值提取工具-05-java 调用 shell](https://houbb.github.io/2024/08/05/value-extraction-05-java-call-shell)

[字符串值提取工具-06-java 调用 python](https://houbb.github.io/2024/08/05/value-extraction-06-java-call-python)

[字符串值提取工具-07-java 调用 go](https://houbb.github.io/2024/08/05/value-extraction-07-java-call-go)

## 代码地址

> [value-extraction 值提取核心](https://github.com/houbb/value-extraction)


# 场景

我们希望通过 java 执行 groovy，如何实现呢?

# 入门例子

## maven 依赖

```xml
   <dependency>
       <groupId>org.codehaus.groovy</groupId>
       <artifactId>groovy</artifactId>
       <version>3.0.9</version>
   </dependency>
```

## 代码

```java
package org.example;

import groovy.lang.Binding;
import groovy.lang.GroovyShell;


public class GroovyScriptExecutorMain {


    public static void main(String[] args) {
        // 创建绑定对象
        Binding binding = new Binding();
        binding.setVariable("name", "World");

        // Groovy 脚本内容
        String scriptContent =
                "def greet(name) { " +
                        "    return \"Hello, $name!\" " +
                        "}; " +
                        "greet(name)";

        // 创建 GroovyShell 对象
        GroovyShell shell = new GroovyShell(binding);

        // 解析并执行脚本
        Object result = shell.evaluate(scriptContent);

        // 输出结果
        System.out.println(result); // 输出 "Hello, World!"
    }

}
```

# chat

## java 调用 groovy

在 Java 中调用 Groovy 脚本，可以使用 Groovy 提供的 `GroovyShell` 类。

这是一个简单而有效的方法来在 Java 应用程序中执行 Groovy 脚本。

以下是一个基本示例，展示了如何从 Java 调用 Groovy 脚本：

1. **添加 Groovy 依赖**：如果你使用的是 Maven 或 Gradle，请在你的项目中添加 Groovy 依赖。

   Maven 示例：
   ```xml
   <dependency>
       <groupId>org.codehaus.groovy</groupId>
       <artifactId>groovy</artifactId>
       <version>3.0.9</version>
   </dependency>
   ```

   Gradle 示例：
   ```groovy
   implementation 'org.codehaus.groovy:groovy:3.0.9'
   ```

2. **编写 Groovy 脚本**：创建一个 Groovy 脚本文件，例如 `script.groovy`。

   ```groovy
   // script.groovy
   def greet(name) {
       return "Hello, $name!"
   }
   ```

3. **在 Java 中调用 Groovy 脚本**：使用 `GroovyShell` 类来执行脚本。

   ```java
   import groovy.lang.Binding;
   import groovy.lang.GroovyShell;
   import groovy.lang.Script;

   public class GroovyScriptExecutor {
       public static void main(String[] args) {
           // 创建绑定对象
           Binding binding = new Binding();
           binding.setVariable("name", "World");

           // 创建 GroovyShell 对象
           GroovyShell shell = new GroovyShell(binding);

           // 读取并执行 Groovy 脚本
           Script script = shell.parse(new File("path/to/script.groovy"));
           Object result = script.invokeMethod("greet", "World");

           // 输出结果
           System.out.println(result); // 输出 "Hello, World!"
       }
   }
   ```

   请注意，你需要将 `path/to/script.groovy` 替换为你的实际 Groovy 脚本文件的路径。

通过这种方法，你可以在 Java 应用程序中轻松调用和执行 Groovy 脚本。

如果你有任何特定需求或遇到问题，可以提供更多细节，我可以进一步提供帮助。

## 直接执行 groovy 脚本内容的方式呢

如果你想在 Java 中直接执行 Groovy 脚本内容而不是从文件中读取，可以将 Groovy 脚本的内容作为字符串传递给 `GroovyShell`。以下是一个示例，展示如何在 Java 中直接执行 Groovy 脚本内容：

1. **添加 Groovy 依赖**：确保在你的项目中添加 Groovy 依赖，参考前面的 Maven 或 Gradle 示例。

2. **在 Java 中直接执行 Groovy 脚本内容**：

   ```java
   import groovy.lang.Binding;
   import groovy.lang.GroovyShell;

   public class GroovyScriptExecutor {
       public static void main(String[] args) {
           // 创建绑定对象
           Binding binding = new Binding();
           binding.setVariable("name", "World");

           // Groovy 脚本内容
           String scriptContent = 
               "def greet(name) { " +
               "    return \"Hello, $name!\" " +
               "} " +
               "greet(name)";

           // 创建 GroovyShell 对象
           GroovyShell shell = new GroovyShell(binding);

           // 解析并执行脚本
           Object result = shell.evaluate(scriptContent);

           // 输出结果
           System.out.println(result); // 输出 "Hello, World!"
       }
   }
   ```

在这个示例中：

- 我们创建了一个 `Binding` 对象，并设置了一个变量 `name`，其值为 "World"。
- 我们将 Groovy 脚本的内容作为字符串保存在 `scriptContent` 变量中。
- 使用 `GroovyShell` 对象，我们调用 `evaluate` 方法来解析和执行脚本内容。
- 最后，我们打印出脚本的执行结果。

这种方式适用于需要动态执行脚本内容的场景，无需将脚本存储在文件中。如果你有更多需求或问题，请告诉我。



# 参考资料

* any list
{:toc}