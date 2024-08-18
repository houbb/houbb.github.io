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



# 核心实现

## 核心代码

```java
package com.github.houbb.value.extraction.core.support.extraction;

import com.github.houbb.value.extraction.api.ValueExtractionContext;
import org.python.util.PythonInterpreter;

/**
 *
 * @author 老马啸西风
 * @since 0.8.0
 */
public class ValueExtractionPython extends AbstractValueExtractionAdaptor<PythonInterpreter> {

    /**
     * 参数上下文
     */
    public static final String DATA_MAP = "dataMap";
    /**
     * 结果值
     */
    public static final String RESULT = "result";

    @Override
    protected PythonInterpreter prepare(ValueExtractionContext context) {
        PythonInterpreter interpreter = new PythonInterpreter();

        // 将 Map 传递给 Python
        interpreter.set(DATA_MAP, context.getDataMap());
        return interpreter;
    }

    @Override
    protected Object evaluate(PythonInterpreter prepareObject, String script, ValueExtractionContext context) {
        // 在 Python 中截断字符串
        prepareObject.exec(script);

        // 约定把结果放在 result 中
        return prepareObject.get(RESULT);
    }

}
```

我们把参数放在 `dataMap` 中，并且约定从 `result` 获取执行结果。

## 测试


```java
// 创建绑定并设置参数
Map<String, Object> data = new HashMap<>();
data.put("original_string", "This is a very long string that needs to be truncated.");
data.put("max_length", 20);
// 定义 JavaScript 脚本
String script = "original_string = dataMap['original_string']\n" +
        "max_length = dataMap['max_length']\n" +
        "result = original_string[:max_length]\n" +
        "if len(original_string) > max_length:\n" +
        "    result += '...'";
Map<String, Object> resultMap = ValueExtractionBs.newInstance()
        .scripts(Arrays.asList(script))
        .valueExtraction(ValueExtractions.python())
        .dataMap(data)
        .extract();
Assert.assertEquals("[This is a very long ...]", resultMap.values().toString());
```

-----------------------------

python 的一些调用方式补充：

# 无参数调用

说明： Java调用不带参数的python代码执行

样例代码如下：

```java
try {
	String exe = "python解释器所处的绝对路径";
	String py = "python代码文件绝对地址";
	Process process = Runtime.getRuntime().exec(exe + " " + py);
	//获取结果的同时设置输入流编码格式"gb2312"
	InputStreamReader isr = new InputStreamReader(process.getInputStream(),"gb2312");
	LineNumberReader input = new LineNumberReader(isr);
	String result = "";
	result = input.readLine();
	System.out.println(result);
	input.close();
	isr.close();
	process.waitFor();
} catch (InterruptedException | IOException e) {
	System.out.println("调用python脚本并读取结果时出错：" + e.getMessage());
}
```

# 带参数调用

带参调用可以将命令和参数写入String数组，然后作为执行参数执行。

基本语句如下：

```java
String exe = "python解释器所处的绝对路径";
String py = "python代码文件绝对地址";
String pram = "单个传递参数，若参数为基本类型，转化为String；若为数组等类型，也是将其转换为String型";
String [] args = new String[] {exe, py, pram...};
Process process = Runtime.getRuntime().exec(args);
```

## 单行返回值

说明： Java调用不带参数的python代码执行

样例代码如下：

```java
try {
	String exe = "python解释器所处的绝对路径";
	String py = "python代码文件绝对地址";
	String pram = "单个传递参数，若参数为基本类型，转化为String；若为数组等类型，也是将其转换为String型";
	String [] args = new String[] {exe, py, pram...};
	Process process = Runtime.getRuntime().exec(args);
	//获取结果的同时设置输入流编码格式"gb2312"
	InputStreamReader isr = new InputStreamReader(process.getInputStream(),"gb2312");
	LineNumberReader input = new LineNumberReader(isr);
	String result = "";
	result = input.readLine();
	System.out.println(result);
	input.close();
	isr.close();
	process.waitFor();
} catch (InterruptedException | IOException e) {
	System.out.println("调用python脚本并读取结果时出错：" + e.getMessage());
}
```

## 2.2. 多行返回值

说明： Java调用不带参数的python代码执行

样例代码如下：

```java
try {
	String exe = "python解释器所处的绝对路径";
	String py = "python代码文件绝对地址";
	String pram = "单个传递参数，若参数为基本类型，转化为String；若为数组等类型，也是将其转换为String型";
	String [] args = new String[] {exe, py, pram...};
	ProcessBuilder builder = new ProcessBuilder(args);
    Process process = builder.start();
    BufferedReader success = new BufferedReader(new InputStreamReader(process.getInputStream(), "GB2312"));//获取字符输入流对象
    BufferedReader error = new BufferedReader(new InputStreamReader(process.getErrorStream(), "GB2312"));//获取错误信息的字符输入流对象
    String line = null;
    List<String> success_result = new ArrayList<>();
    List<String> error_result = new ArrayList<>();
    //记录输出结果
    while ((line = success.readLine()) != null) {
        success_result.add(line);
    }
    //记录错误信息
    while ((line = error.readLine()) != null) {
        error_result.add(line);
    }
    success.close();
    error.close();
    process.waitFor();

    System.out.println(success_result);
    System.out.println(error_result);
} catch (InterruptedException | IOException e) {
	System.out.println("调用python脚本并读取结果时出错：" + e.getMessage());
}

```

# 3. Java中直接执行python语句

注意： 此方法在使用之前需要导入依赖环境，如在maven中导入如下依赖：

```xml
<dependency>
    <groupId>org.python</groupId>
    <artifactId>jython-standalone</artifactId>
    <!--python版本在这里指定（2.x或3.x等）-->
    <version>2.7.3</version>	
</dependency>
```

## 代码直接调用

调用语句如下：

```java
import org.python.util.PythonInterpreter;

public class JavaRunPython {
    public static void main(String[] args) {
    	//调用python的解释器
        PythonInterpreter interpreter = new PythonInterpreter();
        //执行Python语句
        interpreter.exec("str = 'hello world!'; ");
        interpreter.exec("print(str);");
    }
}
```

## 如何传递参数？待验证

要将 `Map<String, Object>` 传递给 Python 脚本，你可以通过 `PythonInterpreter` 的 `set` 方法将 Java 的变量传递给 Python 环境。

然后在 Python 脚本中使用这些变量。

下面是一个简单的例子，演示如何将 `Map<String, Object>` 传递给 Python 脚本并在 Python 中使用它。

### Java 代码示例：

```java
package com.github.houbb.value.extraction.test.python;

import org.python.util.PythonInterpreter;

import java.util.HashMap;
import java.util.Map;

public class PythonArgsExample {

    public static void main(String[] args) {
        PythonInterpreter interpreter = new PythonInterpreter();

        // 创建并填充 Map
        Map<String, Object> data = new HashMap<>();
        data.put("key1", "value1");
        data.put("key2", 42);
        data.put("key3", true);

        // 将 Map 传递给 Python
        interpreter.set("data", data);

        // 在 Python 中使用这个 Map
        interpreter.exec("for key in data:\n"
                + "    print('%s: %s' % (key, data[key]))");
    }

}
```

结果：

```
key1: value1
key2: 42
key3: True
```

## 获取执行结果的例子

```java
package com.github.houbb.value.extraction.test.python;

import org.python.util.PythonInterpreter;

import java.util.HashMap;
import java.util.Map;

public class PythonTruncateExample {

    public static void main(String[] args) {
        PythonInterpreter interpreter = new PythonInterpreter();

        // 创建并填充 Map
        Map<String, Object> data = new HashMap<>();
        data.put("original_string", "This is a very long string that needs to be truncated.");
        data.put("max_length", 20);

        // 将 Map 传递给 Python
        interpreter.set("data", data);

        // 在 Python 中截断字符串
        interpreter.exec(
                "original_string = data['original_string']\n" +
                        "max_length = data['max_length']\n" +
                        "truncated_string = original_string[:max_length]\n" +
                        "if len(original_string) > max_length:\n" +
                        "    truncated_string += '...'"
        );

        // 从 Python 环境中获取截断后的字符串
        String result = interpreter.get("truncated_string", String.class);

        // 输出结果
        System.out.println("Truncated String: " + result);
    }

}
```

## 通过PythonInterpreter直接调用python脚本

注意： 此方法也需要导入1.3中依赖

Java调用代码如下：

```java
import org.python.util.PythonInterpreter;
public class JavaPythonFile {
    public static void main(String[] args) {
        PythonInterpreter interpreter = new PythonInterpreter();
        //我在这里使用相对路径，注意区分
        interpreter.execfile("D:/code/test.py");
    }
}
```

- test.py

```py
a = 1
b = 2
print(a +ｂ)
```

#  Java通过调用bat文件间接调用python

hello.bat测试代码如下：

```
echo hello world!
D:
cd D:\code\
start python test.py
pause
```

Java调用代码如下：

```java
try {
	StringBuilder sb = new StringBuilder();
	String batPath = "D:/hello.bat";
	Process process = Runtime.getRuntime().exec(batPath);
	InputStream in = process.getInputStream();
	BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(in));
	String line;
	while ((line = bufferedReader.readLine()) != null) {
		sb.append(line + "\n");
	}
	in.close();
	try {
		process.waitFor();
	} catch (InterruptedException e) {
		System.out.println(e);
	}
} catch (IOException e) {
	System.out.println(e);
}
```


# chat

## Q: java 执行 python

在 Java 中执行 Python 脚本字符串可以通过以下几种方式实现：

### 1. 使用 `ProcessBuilder` 或 `Runtime.getRuntime().exec()` 执行 Python 脚本
这是最直接的方法，通过调用系统命令行来执行 Python 脚本。

```java
import java.io.BufferedReader;
import java.io.InputStreamReader;

public class PythonExecutor {
    public static void main(String[] args) {
        try {
            // 构建要执行的命令
            String[] command = {"python", "-c", "print('Hello from Python!')"};

            // 使用 ProcessBuilder 或 Runtime 来执行命令
            ProcessBuilder pb = new ProcessBuilder(command);
            Process process = pb.start();

            // 读取 Python 输出
            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
            String line;
            while ((line = reader.readLine()) != null) {
                System.out.println(line);
            }

            // 等待进程结束并获取退出值
            int exitCode = process.waitFor();
            System.out.println("Exit Code: " + exitCode);

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

### 3. 使用第三方库（如 JEP 或 GraalVM）
如果你需要执行 Python 3.x 代码，或者需要更高性能的解决方案，可以使用 JEP 或 GraalVM。

#### 使用 JEP:
JEP（Java Embedded Python）允许你在 Java 中嵌入 Python 解释器，且支持 Python 3.x。

```java
import jep.Jep;

public class PythonExecutor {
    public static void main(String[] args) {
        try (Jep jep = new Jep()) {
            jep.eval("print('Hello from Python using JEP!')");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

#### 使用 GraalVM:
GraalVM 是一种多语言虚拟机，支持在 Java 中执行 Python 等多种语言的代码。

```java
import org.graalvm.polyglot.Context;

public class PythonExecutor {
    public static void main(String[] args) {
        try (Context context = Context.newBuilder().allowAllAccess(true).build()) {
            context.eval("python", "print('Hello from Python using GraalVM!')");
        }
    }
}
```

这些方法可以根据项目需求和 Python 版本选择合适的方案。

## 详细介绍一下 JEP（Java Embedded Python），包含 maven 引入，包含参数传递 Map 的代码例子

### maven 如何引入？

```xml
<dependency>
    <groupId>black.ninia</groupId>
    <artifactId>jep</artifactId>
    <version>4.1.1</version> <!-- 请使用适合您项目的版本 -->
</dependency>
```

### 代码

```java
import jep.Jep;
import jep.JepConfig;
import jep.SharedInterpreter;

public class JepExample {
    public static void main(String[] args) {
        // 创建Jep实例，配置Python解释器
        JepConfig jepConfig = new JepConfig();
        jepConfig.addIncludePaths("path/to/your/python/scripts"); // 设置Python脚本的路径
        SharedInterpreter jep = new SharedInterpreter(jepConfig);

        try {
            // 连接Python解释器
            jep.connect();

            // 执行Python脚本中的函数
            jep.eval("def add(a, b): return a + b");

            // 调用Python函数并传递参数
            Object result = jep.invoke("add", 3, 4);

            // 打印结果
            System.out.println("Result of add(3, 4): " + result);
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            // 关闭Jep实例，释放资源
            if (jep != null) {
                jep.close();
            }
        }
    }
}
```

## 必须要设置 addIncludePaths 这个吗？我只想简单的执行一个 python 字符串脚本

```java
import jep.Jep;

public class JepSimpleExample {
    public static void main(String[] args) {
        // 创建Jep实例
        Jep jep = new Jep();

        try {
            // 执行Python表达式
            Object result = jep.eval("3 + 4");

            // 打印结果
            System.out.println("Result: " + result);
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            // 关闭Jep实例
            jep.close();
        }
    }
}
```



# 参考资料

https://blog.csdn.net/xt199711/article/details/107681057

https://blog.csdn.net/qq_43522889/article/details/126776656

* any list
{:toc}