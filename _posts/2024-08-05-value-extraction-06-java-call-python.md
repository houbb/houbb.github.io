---
layout: post
title: 字符串值提取工具-06-java 调用 python
date: 2024-08-05 21:01:55 +0800
categories: [Java]
tags: [java, open-source, tool, sh]
published: true
---

# 场景

我们希望通过 java 执行 python ，如何实现呢?


# chat

## Q: java 执行 python

在 JDK 8 中，Java 自带了一个内置的脚本引擎：**Nashorn**，这是一个基于 JavaScript 的脚本引擎。它允许在 Java 应用程序中运行 JavaScript 代码。然而，JDK 8 并不直接支持其他脚本语言（如 Python、Ruby 或 Linux shell）。

### JDK 8 内置支持的脚本语言

JDK 8 默认只内置支持 JavaScript（通过 Nashorn 脚本引擎）。以下是使用 Nashorn 的示例：

```java
import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import javax.script.ScriptException;

public class JavaScriptExecutor {
    public static void main(String[] args) {
        ScriptEngineManager manager = new ScriptEngineManager();
        ScriptEngine engine = manager.getEngineByName("nashorn");

        try {
            engine.eval("print('Hello, World!');");
        } catch (ScriptException e) {
            e.printStackTrace();
        }
    }
}
```

### 如何支持其他脚本语言

如果你需要在 Java 中支持其他脚本语言，可以使用外部库或脚本引擎实现。

例如，Jython（用于运行 Python 脚本）、JRuby（用于运行 Ruby 脚本）等。

#### 使用 Jython 支持 Python

1. **添加 Jython 依赖**：
   如果使用 Maven，可以添加以下依赖：

   ```xml
   <dependency>
       <groupId>org.python</groupId>
       <artifactId>jython-standalone</artifactId>
       <version>2.7.2</version>
   </dependency>
   ```

2. **使用 Jython 执行 Python 代码**：

   ```java
   import org.python.util.PythonInterpreter;

   public class PythonExecutor {
       public static void main(String[] args) {
           try (PythonInterpreter pyInterp = new PythonInterpreter()) {
               pyInterp.exec("print('Hello, Python World!')");
           }
       }
   }
   ```


# 参考资料

* any list
{:toc}