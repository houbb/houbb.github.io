---
layout: post
title: 字符串值提取工具-05-java 调用 shell
date: 2024-08-05 21:01:55 +0800
categories: [Java]
tags: [java, open-source, tool, sh]
published: true
---

# 场景

我们希望通过 java 执行 windows shell，如何实现呢?


# windows 脚本效果

## 代码

```java
package org.example;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.IOException;

public class ShellCommandExecutor {
    public static void main(String[] args) {
        try {
            // 使用 cmd.exe
            ProcessBuilder processBuilder = new ProcessBuilder();
            processBuilder.command("cmd.exe", "/c", "echo Hello, World!");

            Process process = processBuilder.start();

            BufferedReader stdInput = new BufferedReader(new InputStreamReader(process.getInputStream()));
            BufferedReader stdError = new BufferedReader(new InputStreamReader(process.getErrorStream()));

            String line;
            while ((line = stdInput.readLine()) != null) {
                System.out.println("OUTPUT: " + line);
            }
            while ((line = stdError.readLine()) != null) {
                System.out.println("ERROR: " + line);
            }

            int exitCode = process.waitFor();
            System.out.println("Exited with code: " + exitCode);
        } catch (IOException | InterruptedException e) {
            e.printStackTrace();
        }
    }
}
```

效果：

```
OUTPUT: Hello, World!
Exited with code: 0
```


------------------------------------------

# chat

## java 调用 shell

在 Java 中，可以通过使用 `ProcessBuilder` 或 `Runtime.getRuntime().exec` 方法来调用 Shell 命令。以下是这两种方法的示例。

### 使用 `ProcessBuilder` 调用 Shell 命令

`ProcessBuilder` 提供了更灵活和更易用的接口来启动和管理系统进程。

```java
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.IOException;

public class ShellCommandExecutor {
    public static void main(String[] args) {
        try {
            // 创建 ProcessBuilder 实例
            ProcessBuilder processBuilder = new ProcessBuilder();

            // 设定要执行的命令
            processBuilder.command("bash", "-c", "echo Hello, World!");

            // 启动进程
            Process process = processBuilder.start();

            // 读取进程的输出
            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
            String line;
            while ((line = reader.readLine()) != null) {
                System.out.println(line);
            }

            // 等待进程结束
            int exitCode = process.waitFor();
            System.out.println("Exited with code: " + exitCode);
        } catch (IOException | InterruptedException e) {
            e.printStackTrace();
        }
    }
}
```

### 使用 `Runtime.getRuntime().exec` 调用 Shell 命令

`Runtime.getRuntime().exec` 是一种更直接但稍显过时的方式。

```java
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.IOException;

public class ShellCommandExecutor {
    public static void main(String[] args) {
        try {
            // 执行命令
            Process process = Runtime.getRuntime().exec("bash -c 'echo Hello, World!'");

            // 读取进程的输出
            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
            String line;
            while ((line = reader.readLine()) != null) {
                System.out.println(line);
            }

            // 等待进程结束
            int exitCode = process.waitFor();
            System.out.println("Exited with code: " + exitCode);
        } catch (IOException | InterruptedException e) {
            e.printStackTrace();
        }
    }
}
```

### 处理错误流

在调用外部进程时，处理错误流也很重要。以下是改进后的 `ProcessBuilder` 示例，包含对错误流的处理。

```java
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.IOException;

public class ShellCommandExecutor {
    public static void main(String[] args) {
        try {
            ProcessBuilder processBuilder = new ProcessBuilder();
            processBuilder.command("bash", "-c", "echo Hello, World! && echo Error message >&2");

            Process process = processBuilder.start();

            BufferedReader stdInput = new BufferedReader(new InputStreamReader(process.getInputStream()));
            BufferedReader stdError = new BufferedReader(new InputStreamReader(process.getErrorStream()));

            String line;
            while ((line = stdInput.readLine()) != null) {
                System.out.println("OUTPUT: " + line);
            }
            while ((line = stdError.readLine()) != null) {
                System.out.println("ERROR: " + line);
            }

            int exitCode = process.waitFor();
            System.out.println("Exited with code: " + exitCode);
        } catch (IOException | InterruptedException e) {
            e.printStackTrace();
        }
    }
}
```

### 总结

- 使用 `ProcessBuilder` 是调用 Shell 命令的推荐方式，因为它提供了更强大的控制和更好的错误处理机制。
- 处理输入流和错误流，确保所有的输出和错误信息都能被正确捕获。
- 等待进程结束并检查退出码，以确定命令是否成功执行。

通过这些方法，你可以在 Java 中方便地调用和管理 Shell 命令。如果你有更多问题或特定需求，请告诉我。

## 这里必须要求当前系统有 bash 命令吗？可以直接模拟整个 bash 环境，直接执行吗？

是的，上述方法是依赖于系统上有 `bash` 命令的。在没有 `bash` 的环境中，或者想要模拟整个 `bash` 环境时，可以考虑使用以下方法：

1. **使用 Java 内建的命令执行环境**：你可以直接调用系统自带的 shell（如 `cmd.exe` 或 `sh`），而不是强制要求 `bash`。 
2. **嵌入一个轻量级的 shell 解释器**：如 Jython 或其他嵌入式解释器。
3. **使用 Java 自身的脚本 API（如 Java Scripting API）来执行脚本**。

### 使用系统自带的 shell

对于 Linux 或 Unix 系统，你可以使用 `/bin/sh`，而在 Windows 系统上，你可以使用 `cmd.exe`。

#### 在 Unix/Linux 系统上使用 `/bin/sh`:

```java
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.IOException;

public class ShellCommandExecutor {
    public static void main(String[] args) {
        try {
            // 使用 /bin/sh 而不是 bash
            ProcessBuilder processBuilder = new ProcessBuilder();
            processBuilder.command("/bin/sh", "-c", "echo Hello, World!");

            Process process = processBuilder.start();

            BufferedReader stdInput = new BufferedReader(new InputStreamReader(process.getInputStream()));
            BufferedReader stdError = new BufferedReader(new InputStreamReader(process.getErrorStream()));

            String line;
            while ((line = stdInput.readLine()) != null) {
                System.out.println("OUTPUT: " + line);
            }
            while ((line = stdError.readLine()) != null) {
                System.out.println("ERROR: " + line);
            }

            int exitCode = process.waitFor();
            System.out.println("Exited with code: " + exitCode);
        } catch (IOException | InterruptedException e) {
            e.printStackTrace();
        }
    }
}
```

#### 在 Windows 系统上使用 `cmd.exe`:

```java
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.IOException;

public class ShellCommandExecutor {
    public static void main(String[] args) {
        try {
            // 使用 cmd.exe
            ProcessBuilder processBuilder = new ProcessBuilder();
            processBuilder.command("cmd.exe", "/c", "echo Hello, World!");

            Process process = processBuilder.start();

            BufferedReader stdInput = new BufferedReader(new InputStreamReader(process.getInputStream()));
            BufferedReader stdError = new BufferedReader(new InputStreamReader(process.getErrorStream()));

            String line;
            while ((line = stdInput.readLine()) != null) {
                System.out.println("OUTPUT: " + line);
            }
            while ((line = stdError.readLine()) != null) {
                System.out.println("ERROR: " + line);
            }

            int exitCode = process.waitFor();
            System.out.println("Exited with code: " + exitCode);
        } catch (IOException | InterruptedException e) {
            e.printStackTrace();
        }
    }
}
```

### 使用 Java Scripting API

Java 提供了 Scripting API (JSR 223)，可以直接在 Java 中执行脚本代码。

如果你需要执行一些复杂的脚本逻辑，可以考虑使用 Scripting API。

以下是一个使用 JavaScript 的示例：

```java
import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import javax.script.ScriptException;

public class ScriptExecutor {
    public static void main(String[] args) {
        ScriptEngineManager manager = new ScriptEngineManager();
        ScriptEngine engine = manager.getEngineByName("JavaScript");

        try {
            engine.eval("print('Hello, World!');");
        } catch (ScriptException e) {
            e.printStackTrace();
        }
    }
}
```

### 总结

- **系统自带的 shell**：可以使用 `/bin/sh` 或 `cmd.exe` 作为替代，而不是强制要求 `bash`。
- **Java Scripting API**：如果需要更多的灵活性和更强大的脚本功能，使用 Java 的 Scripting API 是一个不错的选择。

通过这些方法，你可以在没有 `bash` 的环境中运行脚本。如果你有更多具体需求或问题，请告诉我。

## ScriptEngine engine = manager.getEngineByName("JavaScript");jdk8 内置支持哪些语言？linux shell 支持吗？ 

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

如果你需要在 Java 中支持其他脚本语言，可以使用外部库或脚本引擎实现。例如，Jython（用于运行 Python 脚本）、JRuby（用于运行 Ruby 脚本）等。

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

#### 使用 ProcessBuilder 调用 Linux Shell

虽然 JDK 8 不直接支持 Linux Shell 作为脚本引擎，但你可以通过 `ProcessBuilder` 来调用 Linux Shell 命令：

```java
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.IOException;

public class ShellCommandExecutor {
    public static void main(String[] args) {
        try {
            ProcessBuilder processBuilder = new ProcessBuilder();
            processBuilder.command("sh", "-c", "echo Hello, World!");

            Process process = processBuilder.start();

            BufferedReader stdInput = new BufferedReader(new InputStreamReader(process.getInputStream()));
            BufferedReader stdError = new BufferedReader(new InputStreamReader(process.getErrorStream()));

            String line;
            while ((line = stdInput.readLine()) != null) {
                System.out.println("OUTPUT: " + line);
            }
            while ((line = stdError.readLine()) != null) {
                System.out.println("ERROR: " + line);
            }

            int exitCode = process.waitFor();
            System.out.println("Exited with code: " + exitCode);
        } catch (IOException | InterruptedException e) {
            e.printStackTrace();
        }
    }
}
```

### 总结

- **JDK 8 内置支持 JavaScript**：通过 Nashorn 脚本引擎，可以在 Java 中运行 JavaScript 代码。
- **支持其他脚本语言**：可以使用外部库如 Jython（Python）、JRuby（Ruby）等。
- **调用 Linux Shell**：可以使用 `ProcessBuilder` 来执行 Linux Shell 命令。

这些方法可以帮助你在 Java 应用程序中支持和执行不同的脚本语言和命令。如果你有更多特定需求或问题，请告诉我。




# 参考资料

* any list
{:toc}