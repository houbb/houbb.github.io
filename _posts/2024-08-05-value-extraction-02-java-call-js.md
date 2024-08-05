---
layout: post
title: 字符串值提取工具-02-java 调用 js
date: 2024-08-05 21:01:55 +0800
categories: [Java]
tags: [java, open-source, tool, sh]
published: true
---

# 场景

我们希望通过 java 执行 js，如何实现呢?

# java 调用 js

```java
package org.example;

import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import javax.script.ScriptException;

public class JavaCallJsDemo {

    public static void main(String[] args) {
        // 创建一个脚本引擎管理器
        ScriptEngineManager manager = new ScriptEngineManager();

        // 获取一个 JavaScript 引擎实例
        ScriptEngine engine = manager.getEngineByName("JavaScript");

        // 定义一个 JavaScript 脚本
        String script = "function greet(name) { return 'Hello, ' + name; } greet('World');";

        try {
            // 执行 JavaScript 脚本
            Object result = engine.eval(script);

            // 输出执行结果
            System.out.println(result);
        } catch (ScriptException e) {
            e.printStackTrace();
        }
    }

}
```

结果：

```
Hello, World
```

# 如何传入参数

## 我们如何传入参数呢？

我们希望参数是变化的，让 js 执行对应的脚本方法

## 代码

```java
package org.example;

import javax.script.Invocable;
import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import javax.script.ScriptException;

public class JavaCallJsWithArgsDemo {

    public static void main(String[] args) {
        // 创建一个脚本引擎管理器
        ScriptEngineManager manager = new ScriptEngineManager();

        // 获取一个 JavaScript 引擎实例
        ScriptEngine engine = manager.getEngineByName("JavaScript");

        // 定义一个 JavaScript 脚本
        String script = "function greet(name) { return 'Hello, ' + name; }";

        try {
            // 执行 JavaScript 脚本，定义函数
            engine.eval(script);

            // 创建Invocable实例
            Invocable invocable = (Invocable) engine;

            // 调用 JavaScript 函数并传递参数
            String result = (String) invocable.invokeFunction("greet", "World");

            // 输出执行结果
            System.out.println(result);
        } catch (ScriptException | NoSuchMethodException e) {
            e.printStackTrace();
        }
    }
}
```

# chat

## java 如何执行 js 脚本？

在 Java 中执行 JavaScript 脚本，可以使用 `javax.script` 包中的 `ScriptEngine`。

以下是一个示例代码，展示如何在 Java 中执行 JavaScript 脚本：

```java
import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import javax.script.ScriptException;

public class ExecuteJavaScript {
    public static void main(String[] args) {
        // 创建一个脚本引擎管理器
        ScriptEngineManager manager = new ScriptEngineManager();
        
        // 获取一个 JavaScript 引擎实例
        ScriptEngine engine = manager.getEngineByName("JavaScript");
        
        // 定义一个 JavaScript 脚本
        String script = "function greet(name) { return 'Hello, ' + name; } greet('World');";
        
        try {
            // 执行 JavaScript 脚本
            Object result = engine.eval(script);
            
            // 输出执行结果
            System.out.println(result);
        } catch (ScriptException e) {
            e.printStackTrace();
        }
    }
}
```

这个示例代码做了以下几件事：

1. 创建一个 `ScriptEngineManager` 实例，该实例用于管理不同的脚本引擎。
2. 获取一个 JavaScript 引擎实例（通常是 Nashorn 引擎）。
3. 定义一个 JavaScript 脚本，该脚本包含一个函数 `greet`，用于返回一个问候字符串。
4. 使用 `engine.eval` 方法执行 JavaScript 脚本。
5. 输出执行结果。

### 注意事项

1. **Nashorn 引擎的可用性**：在 JDK 8 到 JDK 14 中，Nashorn 引擎默认包含在 JDK 中。但从 JDK 15 开始，Nashorn 引擎已被移除。如果使用的是 JDK 15 及以上版本，需要引入其他 JavaScript 引擎（如 GraalVM）。
2. **错误处理**：在执行脚本时，可能会遇到 `ScriptException` 异常，因此需要进行适当的错误处理。

如果使用的是 GraalVM，可以如下进行配置：

```xml
<dependency>
    <groupId>org.graalvm.js</groupId>
    <artifactId>js</artifactId>
    <version>21.1.0</version>
</dependency>
```

然后在代码中使用：

```java
import org.graalvm.polyglot.*;

public class ExecuteJavaScriptWithGraalVM {
    public static void main(String[] args) {
        // 使用 GraalVM Polyglot API 执行 JavaScript 脚本
        try (Context context = Context.create()) {
            // 定义 JavaScript 脚本
            String script = "function greet(name) { return 'Hello, ' + name; } greet('World');";
            
            // 执行 JavaScript 脚本
            Value result = context.eval("js", script);
            
            // 输出执行结果
            System.out.println(result.asString());
        }
    }
}
```

这个示例展示了如何使用 GraalVM 的 Polyglot API 来执行 JavaScript 脚本。

## 数据信息

要让参数可以从外部传入 JavaScript 脚本，并且在 Java 中传递参数，可以通过在 JavaScript 中使用函数参数并在 Java 中动态地传递值。

以下是如何实现这一点的示例：

### 使用 `ScriptEngine` 传递参数

```java
import javax.script.*;

public class ExecuteJavaScriptWithArgs {
    public static void main(String[] args) {
        // 创建一个脚本引擎管理器
        ScriptEngineManager manager = new ScriptEngineManager();
        
        // 获取一个 JavaScript 引擎实例
        ScriptEngine engine = manager.getEngineByName("JavaScript");
        
        // 定义一个 JavaScript 脚本
        String script = "function greet(name) { return 'Hello, ' + name; }";

        try {
            // 执行 JavaScript 脚本，定义函数
            engine.eval(script);
            
            // 创建Invocable实例
            Invocable invocable = (Invocable) engine;
            
            // 调用 JavaScript 函数并传递参数
            String result = (String) invocable.invokeFunction("greet", "World");
            
            // 输出执行结果
            System.out.println(result);
        } catch (ScriptException | NoSuchMethodException e) {
            e.printStackTrace();
        }
    }
}
```

### 使用 GraalVM 传递参数

```java
import org.graalvm.polyglot.*;

public class ExecuteJavaScriptWithGraalVMArgs {
    public static void main(String[] args) {
        // 使用 GraalVM Polyglot API 执行 JavaScript 脚本
        try (Context context = Context.create()) {
            // 定义 JavaScript 脚本
            String script = "function greet(name) { return 'Hello, ' + name; }";
            
            // 执行 JavaScript 脚本，定义函数
            context.eval("js", script);
            
            // 获取 JavaScript 中定义的函数
            Value greetFunction = context.getBindings("js").getMember("greet");
            
            // 调用 JavaScript 函数并传递参数
            String result = greetFunction.execute("World").asString();
            
            // 输出执行结果
            System.out.println(result);
        }
    }
}
```

### 说明

1. **ScriptEngine 版本**：
   - 先执行脚本，定义函数。
   - 使用 `Invocable` 接口调用 JavaScript 函数并传递参数。

2. **GraalVM 版本**：
   - 使用 Polyglot API 先执行脚本，定义函数。
   - 获取 JavaScript 中定义的函数，并使用 `Value` 对象调用函数，传递参数。

这两种方式都展示了如何在 Java 中传递参数给 JavaScript 函数，并获取结果。根据你的 JDK 版本和需求选择合适的方法。


# 参考资料

* any list
{:toc}