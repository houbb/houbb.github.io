---
layout: post
title:  Java ScriptEngine
date:  2018-07-14 22:29:05 +0800
categories: [Java]
tags: [js, java]
published: true
---

# Java ScriptEngine 

> [Java ScriptEngine](https://docs.oracle.com/javase/7/docs/api/javax/script/ScriptEngine.html)

ScriptEngine是基本接口，它的方法必须在本规范的每个实现中都具有完全的功能。

这些方法提供了基本的脚本功能。编写到这个简单接口的应用程序在每个实现中只需要很少的修改。它包括执行脚本的方法，以及设置和获取值的方法。

值是两种类型的键/值对。第一类对由在本规范中保留和定义密钥或由个别实现定义的密钥组成。带有保留键的对中的值具有指定的含义。

另一种类型的对由创建Java语言绑定的对组成，这些值通常在脚本中由相应的键或它们的修饰形式表示。

# 实例 

- Main.java

```java
import javax.script.Invocable;
import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import javax.script.ScriptException;

public class Main {

    public static void main(String[] args) throws ScriptException, NoSuchMethodException {
        ScriptEngineManager manager = new ScriptEngineManager();
        ScriptEngine engine = manager.getEngineByName("JavaScript");
        String scriptText = "function greet(name) { return 'Hello, ' + name; } ";
        engine.eval(scriptText);
        Invocable invocable = (Invocable) engine;
        Object result = invocable.invokeFunction("greet", "Alex");
        System.out.println(result);
    }

}
```

输出结果:

```
Hello, Alex

Process finished with exit code 0
```



* any list
{:toc}