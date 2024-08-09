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


# nashorn 方案

jdk8 开始支持。

## 传入参数

```java
package com.github.houbb.value.extraction.test.js;

import javax.script.Bindings;
import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import javax.script.ScriptException;

public class JavaScriptExample {

    public static void main(String[] args) {
        // 创建脚本引擎管理器
        ScriptEngineManager manager = new ScriptEngineManager();

        // 获取 JavaScript 引擎
        ScriptEngine engine = manager.getEngineByName("nashorn");

        // 创建绑定并设置参数
        Bindings bindings = engine.createBindings();
        bindings.put("name", "Alice");
        bindings.put("age", 30);

        // 定义 JavaScript 脚本
        String script = "var greeting = 'Hello, ' + name + '! You are ' + age + ' years old.'; greeting;";

        try {
            // 执行脚本并传递参数
            Object result = engine.eval(script, bindings);
            System.out.println(result);  // 输出结果
        } catch (ScriptException e) {
            e.printStackTrace();
        }
    }

}
```

## 缺点

jdk11 开始不再支持。

# chat

## 区别

`ScriptEngine` 是 Java 中 `javax.script` 包的一部分，用于执行脚本语言。`ScriptEngineManager` 负责管理 `ScriptEngine` 实例。以下是 `getEngineByName` 方法调用 `"JavaScript"` 和 `"Nashorn"` 时的区别：

1. **JavaScript**:
   - 这通常指的是 ECMAScript 语言的通用实现，可能不是特定于任何特定的 JavaScript 引擎。
   - 当你使用 `"JavaScript"` 作为参数调用 `getEngineByName` 方法时，Java 运行时环境会尝试找到一个可用的 JavaScript 引擎来执行脚本。

2. **Nashorn**:
   - Nashorn 是 Oracle 开发的一个 JavaScript 引擎，它是 Java 8 的一部分，用于执行 JavaScript 脚本。
   - 使用 `"Nashorn"` 作为参数调用 `getEngineByName` 方法时，你明确指定了要使用 Nashorn 引擎。
   - Nashorn 支持 ECMAScript 5.1 标准，并且与 Java 有良好的集成，可以直接使用 Java 对象和库。

区别主要包括：

- **兼容性**: Nashorn 是 Java 8 的一部分，而 `"JavaScript"` 可能指的是任何可用的 JavaScript 引擎，这取决于 Java 运行时环境。
- **性能**: Nashorn 可能在某些场景下提供更好的性能，因为它是为 Java 环境优化的。
- **集成**: Nashorn 与 Java 的集成更为紧密，可以无缝地使用 Java 类和库。
- **未来支持**: 从 Java 11 开始，Nashorn 已经被标记为废弃，并且在后续的版本中可能不再被支持。这意味着如果你的应用程序依赖于 Nashorn，你可能需要考虑迁移到其他的 JavaScript 引擎。

如果你正在开发一个需要使用 JavaScript 引擎的 Java 应用程序，你应该根据你的具体需求和 Java 版本来选择合适的引擎。如果你使用的是 Java 8 或更早的版本，并且需要与 Java 紧密集成的 JavaScript 引擎，Nashorn 可能是一个好选择。但是，如果你使用的是 Java 11 或更高版本，你可能需要寻找其他的 JavaScript 引擎，因为 Nashorn 已经被废弃。


## Nashorn 引擎在 Java 11 中被废弃后，有哪些替代的 JavaScript 引擎推荐？

在 Java 11 中 Nashorn 引擎被废弃后，有几个推荐的 JavaScript 引擎可以作为替代：

1. **V8**：V8 是一个性能非常强劲的 JavaScript 引擎，由 Google 开发，广泛用于 Node.js 项目中。它以高性能著称，但可能在包体积和内存占用方面较高 。

2. **JavaScriptCore (JSC)**：JavaScriptCore 是 Apple 开发的 JavaScript 引擎，用于 Safari 浏览器和一些其他 Apple 产品中。它是一个成熟的引擎，但在移动端开发中可能表现不佳 。

3. **Hermes**：Hermes 是由 Facebook 开发的 JavaScript 引擎，专为移动端优化，支持 ES6 语法，并且具有较好的性能和内存使用效率。它还支持生成字节码，加快了 JS 代码的加载速度，并且对内存受限的设备更为友好 。

4. **QuickJS**：由 Fabrice Bellard 开发的 QuickJS 是一个小巧而强大的 JavaScript 引擎，支持 ES2020 规范。它的体积小，功能完善，性能在轻量级 JS 引擎中表现出色，且对嵌入式系统友好 。

5. **GraalVM**：GraalVM 是一个运行时平台，支持多种语言，包括 JavaScript。它提供了 GraalVM 的 JavaScript 引擎，可以作为 Nashorn 的替代品。GraalVM 的 JavaScript 引擎使用 Graal 编译器可以提供接近本地的性能 。

根据你的应用场景和需求，可以选择以上任何一个引擎来替代 Nashorn。如果你需要高性能且不介意较大的内存占用，V8 是一个好选择。如果你的应用主要在移动端，Hermes 或 QuickJS 可能更适合。而如果你希望在 Java 应用程序中使用 JavaScript 并追求更好的性能，GraalVM 的 JavaScript 引擎也是一个不错的选择 。


## java 如何执行 js?

在 Java 中执行 JavaScript 脚本有几种方式，其中最常见的是使用 `Nashorn` 引擎（Java 8 中引入的），或者使用第三方库如 Rhino 或 GraalVM。

### 1. 使用 Nashorn (Java 8 及以上)

Nashorn 是 Java 8 中内置的 JavaScript 引擎，你可以使用 `ScriptEngineManager` 来执行 JavaScript 代码。

```java
import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import javax.script.ScriptException;

public class JavaScriptExample {
    public static void main(String[] args) {
        // 创建一个脚本引擎管理器
        ScriptEngineManager manager = new ScriptEngineManager();
        
        // 获取 JavaScript 引擎实例
        ScriptEngine engine = manager.getEngineByName("nashorn");
        
        // 定义要执行的 JavaScript 代码
        String script = "var greeting = 'Hello, World!'; greeting;";
        
        try {
            // 执行 JavaScript 代码
            Object result = engine.eval(script);
            System.out.println(result);  // 输出结果
        } catch (ScriptException e) {
            e.printStackTrace();
        }
    }
}
```

### 2. 使用 GraalVM
GraalVM 是一个高性能的运行时环境，支持多种语言，包括 JavaScript。相比 Nashorn，GraalVM 提供了更好的性能和现代 JavaScript 支持。

要使用 GraalVM 执行 JavaScript，需要添加相应的依赖：

**Maven 依赖**：
```xml
<dependency>
    <groupId>org.graalvm.js</groupId>
    <artifactId>js</artifactId>
    <version>23.0.0</version>
</dependency>
```

**Java 代码**：
```java
import org.graalvm.polyglot.Context;
import org.graalvm.polyglot.Value;

public class GraalVMExample {
    public static void main(String[] args) {
        // 创建一个 GraalVM Polyglot 上下文
        try (Context context = Context.create()) {
            // 执行 JavaScript 代码
            Value result = context.eval("js", "var greeting = 'Hello from GraalVM!'; greeting;");
            System.out.println(result.asString());  // 输出结果
        }
    }
}
```

### 3. 使用 Rhino

Rhino 是 Mozilla 开发的 JavaScript 引擎，可以嵌入 Java 应用中。

虽然 Rhino 是较老的技术，但在一些旧项目中仍然使用。

**Maven 依赖**：
```xml
<dependency>
    <groupId>org.mozilla</groupId>
    <artifactId>rhino</artifactId>
    <version>1.7.13</version>
</dependency>
```

**Java 代码**：
```java
import org.mozilla.javascript.Context;
import org.mozilla.javascript.Scriptable;

public class RhinoExample {
    public static void main(String[] args) {
        // 创建 Rhino 上下文
        Context context = Context.enter();
        try {
            // 初始化一个空的脚本作用域
            Scriptable scope = context.initStandardObjects();
            
            // 执行 JavaScript 代码
            Object result = context.evaluateString(scope, "var greeting = 'Hello from Rhino!'; greeting;", "script", 1, null);
            System.out.println(Context.toString(result));  // 输出结果
        } finally {
            // 退出上下文
            Context.exit();
        }
    }
}
```

### 选择合适的工具
- **Nashorn**: 简单场景，适合 Java 8 及以上版本。
- **GraalVM**: 现代 JavaScript 支持，较高性能。
- **Rhino**: 老旧项目或需要与 Rhino 兼容时使用。

根据你的需求选择合适的方式来执行 JavaScript 代码。

## 如何传递参数

在执行 JavaScript 时，您可以通过多种方式从 Java 代码传递参数到 JavaScript 脚本中。下面分别展示如何在 Nashorn、GraalVM 和 Rhino 中传递参数。

### 1. 使用 Nashorn 传递参数
在 Nashorn 中，您可以通过 `ScriptEngine` 的 `Bindings` 或直接在脚本中定义变量来传递参数。

```java
import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import javax.script.ScriptException;
import javax.script.Bindings;

public class NashornExample {
    public static void main(String[] args) {
        // 创建脚本引擎管理器
        ScriptEngineManager manager = new ScriptEngineManager();
        
        // 获取 JavaScript 引擎
        ScriptEngine engine = manager.getEngineByName("nashorn");
        
        // 创建绑定并设置参数
        Bindings bindings = engine.createBindings();
        bindings.put("name", "Alice");
        bindings.put("age", 30);
        
        // 定义 JavaScript 脚本
        String script = "var greeting = 'Hello, ' + name + '! You are ' + age + ' years old.'; greeting;";
        
        try {
            // 执行脚本并传递参数
            Object result = engine.eval(script, bindings);
            System.out.println(result);  // 输出结果
        } catch (ScriptException e) {
            e.printStackTrace();
        }
    }
}
```

在这个例子中，`Bindings` 对象用于将参数 `name` 和 `age` 传递给 JavaScript 脚本。

### 2. 使用 GraalVM 传递参数
在 GraalVM 中，您可以通过 Java 变量和 GraalVM 的 `Bindings` 类来传递参数。

```java
import org.graalvm.polyglot.Context;
import org.graalvm.polyglot.Value;

public class GraalVMExample {
    public static void main(String[] args) {
        // 创建 GraalVM Polyglot 上下文
        try (Context context = Context.create()) {
            // 向 JavaScript 传递参数
            context.getBindings("js").putMember("name", "Bob");
            context.getBindings("js").putMember("age", 25);
            
            // 执行脚本
            Value result = context.eval("js", "var greeting = 'Hello, ' + name + '! You are ' + age + ' years old.'; greeting;");
            System.out.println(result.asString());  // 输出结果
        }
    }
}
```

在这个例子中，`putMember` 方法用于将参数 `name` 和 `age` 传递给 JavaScript 脚本。

### 3. 使用 Rhino 传递参数
在 Rhino 中，可以通过 `Scriptable` 接口将参数传递给脚本。

```java
import org.mozilla.javascript.Context;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.ScriptableObject;

public class RhinoExample {
    public static void main(String[] args) {
        // 创建 Rhino 上下文
        Context context = Context.enter();
        try {
            // 初始化脚本作用域
            Scriptable scope = context.initStandardObjects();
            
            // 设置参数
            ScriptableObject.putProperty(scope, "name", "Charlie");
            ScriptableObject.putProperty(scope, "age", 40);
            
            // 执行脚本
            Object result = context.evaluateString(scope, "var greeting = 'Hello, ' + name + '! You are ' + age + ' years old.'; greeting;", "script", 1, null);
            System.out.println(Context.toString(result));  // 输出结果
        } finally {
            // 退出上下文
            Context.exit();
        }
    }
}
```

在这个例子中，`ScriptableObject.putProperty` 方法用于将参数 `name` 和 `age` 传递给 JavaScript 脚本。

### 总结
无论您使用 Nashorn、GraalVM 还是 Rhino，都可以通过绑定机制或作用域对象将参数从 Java 传递给 JavaScript 脚本。这使得在 Java 中动态执行 JavaScript 时可以灵活地与脚本进行交互。

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