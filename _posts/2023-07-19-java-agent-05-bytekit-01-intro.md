---
layout: post
title: Java agent-05-Bytecode Kit-00-bytekit 入门介绍
date:  2023-07-19 08:00:00 +0800
categories: [Trace]
tags: [jvm, trace, distributed, opensource, sh]
published: true
---

# java agent 系列

[java agent 介绍](https://houbb.github.io/2023/07/19/java-agent-01-intro)

[java agent-02-Java Instrumentation API](https://houbb.github.io/2023/07/19/java-agent-02-instrumentation-api)

[java agent-03-Java Instrumentation 结合 bytekit 实战笔记 agent attach](https://houbb.github.io/2023/07/19/java-agent-03-bytekit-agent-attach)

[java agent-03-Java Instrumentation 结合 bytekit 实战笔记 agent premain](https://houbb.github.io/2023/07/19/java-agent-03-bytekit-premain-inaction)

[java agent-04-统一管理众多的Java Agent](https://houbb.github.io/2023/07/19/java-agent-04-javaoneagent-01-intro)

[java agent-05-bytekit 入门介绍](https://houbb.github.io/2023/07/19/java-agent-03-bytekit-premain-inaction)


# 目标

- 之前的Arthas里的字节码增强，是通过asm来处理的，代码逻辑不好修改，理解困难

- 基于ASM提供更高层的字节码处理能力，面向诊断/APM领域，不是通用的字节码库

- ByteKit期望能提供一套简洁的API，让开发人员可以比较轻松的完成字节码增强

# 对比

|  功能   |  函数Enter/Exit注入点 |  绑定数据   | inline  | 防止重复增强   | 避免装箱/拆箱开销  |origin调用替换  | `@ExceptionHandler`  |
|  ----  | ----                  |----       | :----:      |:----:       | :----:       |:----:         | :----:       |
| ByteKit  | `@AtEnter` <br>  `@AtExit` <br>`@AtExceptionExit` <br> `@AtFieldAccess` <br> `@AtInvoke`<br>`@AtInvokeException`<br>`@AtLine`<br>`@AtSyncEnter`<br>`@AtSyncExit`<br>`@AtThrow`| this/args/return/throw<br>field<br>locals<br>子调用入参/返回值/子调用异常<br>line number|✓|✓|✓|✓|✓|
| ByteBuddy  | `OnMethodEnter`<br>`@OnMethodExit`<br> `@OnMethodExit#onThrowable()`| this/args/return/throw<br>field<br>locals|✓|✗|✓|✓|✓|
| 传统AOP  | `Enter`<br>`Exit`<br>`Exception` |this/args/return/throw|✗|✗|✗|✗|✗

# 特性

## 1. 丰富的注入点支持

@AtEnter 函数入口
@AtExit 函数退出
@AtExceptionExit 函数抛出异常
@AtFieldAccess 访问field
@AtInvoke 在method里的子函数调用
@AtInvokeException 在method里的子函数调用抛出异常
@AtLine 在指定行号
@AtSyncEnter 进入同步块，比如synchronized块
@AtSyncExit 退出同步块
@AtThrow 代码里显式throw异常点

## 2. 动态的Binding

@Binding.This this对象

@Binding.Class Class对象

@Binding.Method 函数调用的 Method 对象

@Binding.MethodName 函数的名字

@Binding.MethodDesc 函数的desc

@Binding.Return 函数调用的返回值

@Binding.Throwable 函数里抛出的异常

@Binding.Args 函数调用的入参

@Binding.ArgNames 函数调用的入参的名字

@Binding.LocalVars 局部变量

@Binding.LocalVarNames 局部变量的名字

@Binding.Field field对象属性字段

@Binding.InvokeArgs method里的子函数调用的入参

@Binding.InvokeReturn method里的子函数调用的返回值

@Binding.InvokeMethodName method里的子函数调用的名字

@Binding.InvokeMethodOwner method里的子函数调用的类名

@Binding.InvokeMethodDeclaration method里的子函数调用的desc

@Binding.Line 行号

@Binding.Monitor 同步块里监控的对象

## 3. 可编程的异常处理

@ExceptionHandler 在插入的增强代码，可以用try/catch块包围起来

## 4. inline支持

增强的代码 和 异常处理代码都可以通过 inline技术内联到原来的类里，达到最理想的增强效果。

## 5. invokeOrigin 技术

通常，我们要增强一个类，就想要办法在函数前后插入一个static的回调函数，但这样子局限太大。

那么有没有更灵活的方式呢？

比如有一个 hello() 函数：

```java
public String hello(String str) {
    return "hello " + str;
}
```

我们想对它做增强，那么可以编写下面的代码：

```java
public String hello(String str) {
    System.out.println("before");
    Object value = InstrumentApi.invokeOrigin();
    System.out.println("after, result: " + value);
    return object;
}
```

增强后的结果是：

```java
public String hello(String str) {
    System.out.println("before");
    Object value = "hello " + str;
    System.out.println("after, result: " + value);
    return object;
}
```

这种方式可以随意插入代码，非常灵活。

参考增强Dubbo Filter的示例：

```java
package com.alibaba.bytekit.asm.inst;

import org.apache.dubbo.rpc.Invocation;
import org.apache.dubbo.rpc.Invoker;
import org.apache.dubbo.rpc.Result;
import org.apache.dubbo.rpc.RpcException;

import com.alibaba.bytekit.agent.inst.Instrument;
import com.alibaba.bytekit.agent.inst.InstrumentApi;

/**
 * @see org.apache.dubbo.rpc.Filter
 * @author hengyunabc 2020-11-26
 *
 */
@Instrument(Interface = "org.apache.dubbo.rpc.Filter")
public abstract class DubboFilter_APM {

    public Result invoke(Invoker<?> invoker, Invocation invocation) throws RpcException {
        DubboUtils.print(invoker);
        System.err.println("invoker class: " + this.getClass().getName());
        Result result = InstrumentApi.invokeOrigin();

        return result;
    }
}
```

# 示例

以ByteKitDemo.java为例说明。

```java
package com.example;

import java.util.List;
import java.util.concurrent.TimeUnit;

import com.alibaba.deps.org.objectweb.asm.tree.ClassNode;
import com.alibaba.deps.org.objectweb.asm.tree.MethodNode;
import com.alibaba.bytekit.asm.MethodProcessor;
import com.alibaba.bytekit.asm.binding.Binding;
import com.alibaba.bytekit.asm.interceptor.InterceptorProcessor;
import com.alibaba.bytekit.asm.interceptor.annotation.AtEnter;
import com.alibaba.bytekit.asm.interceptor.annotation.AtExceptionExit;
import com.alibaba.bytekit.asm.interceptor.annotation.AtExit;
import com.alibaba.bytekit.asm.interceptor.annotation.ExceptionHandler;
import com.alibaba.bytekit.asm.interceptor.parser.DefaultInterceptorClassParser;
import com.alibaba.bytekit.utils.AgentUtils;
import com.alibaba.bytekit.utils.AsmUtils;
import com.alibaba.bytekit.utils.Decompiler;

/**
 * 
 * @author hengyunabc 2020-05-21
 *
 */
public class ByteKitDemo {

    public static class Sample {
        private int exceptionCount = 0;

        public String hello(String str, boolean exception) {
            if (exception) {
                exceptionCount++;
                throw new RuntimeException("test exception, str: " + str);
            }
            return "hello " + str;
        }
    }

    public static class PrintExceptionSuppressHandler {

        @ExceptionHandler(inline = true)
        public static void onSuppress(@Binding.Throwable Throwable e, @Binding.Class Object clazz) {
            System.out.println("exception handler: " + clazz);
            e.printStackTrace();
        }
    }

    public static class SampleInterceptor {

        @AtEnter(inline = true, suppress = RuntimeException.class, suppressHandler = PrintExceptionSuppressHandler.class)
        public static void atEnter(@Binding.This Object object, 
                @Binding.Class Object clazz,
                @Binding.Args Object[] args, 
                @Binding.MethodName String methodName,
                @Binding.MethodDesc String methodDesc) {
            System.out.println("atEnter, args[0]: " + args[0]);
        }

        @AtExit(inline = true)
        public static void atExit(@Binding.Return Object returnObject) {
            System.out.println("atExit, returnObject: " + returnObject);
        }

        @AtExceptionExit(inline = true, onException = RuntimeException.class)
        public static void atExceptionExit(@Binding.Throwable RuntimeException ex,
                @Binding.Field(name = "exceptionCount") int exceptionCount) {
            System.out.println("atExceptionExit, ex: " + ex.getMessage() + ", field exceptionCount: " + exceptionCount);
        }
    }

    public static void main(String[] args) throws Exception {
        AgentUtils.install();

        // 启动Sample，不断执行
        final Sample sample = new Sample();
        Thread t = new Thread(new Runnable() {
            @Override
            public void run() {
                for (int i = 0; i < 100; ++i) {
                    try {
                        TimeUnit.SECONDS.sleep(3);
                        String result = sample.hello("" + i, (i % 3) == 0);
                        System.out.println("call hello result: " + result);
                    } catch (Throwable e) {
                        // ignore
                        System.out.println("call hello exception: " + e.getMessage());
                    }
                }
            }
        });
        t.start();

        // 解析定义的 Interceptor类 和相关的注解
        DefaultInterceptorClassParser interceptorClassParser = new DefaultInterceptorClassParser();
        List<InterceptorProcessor> processors = interceptorClassParser.parse(SampleInterceptor.class);

        // 加载字节码
        ClassNode classNode = AsmUtils.loadClass(Sample.class);

        // 对加载到的字节码做增强处理
        for (MethodNode methodNode : classNode.methods) {
            if (methodNode.name.equals("hello")) {
                MethodProcessor methodProcessor = new MethodProcessor(classNode, methodNode);
                for (InterceptorProcessor interceptor : processors) {
                    interceptor.process(methodProcessor);
                }
            }
        }

        // 获取增强后的字节码
        byte[] bytes = AsmUtils.toBytes(classNode);

        // 查看反编译结果
        System.out.println(Decompiler.decompile(bytes));

        // 等待，查看未增强里的输出结果
        TimeUnit.SECONDS.sleep(10);

        // 通过 reTransform 增强类
        AgentUtils.reTransform(Sample.class, bytes);
        System.in.read();
    }

}
```

## 1. 定义注入点和Binding数据

- 在下面的 SampleInterceptor 时定义了要注入 @AtEnter/@AtExit/@AtExceptionExit 三个地方，

- 用@Binding绑定了不同的数据

- 在@AtEnter里配置了 inline = true，则说明插入的SampleInterceptor#atEnter函数本身会被inline掉

- 配置了 suppress = RuntimeException.class 和 suppressHandler = PrintExceptionSuppressHandler.class，说明插入的代码会被 try/catch 包围

```java
public static class SampleInterceptor {
    @AtEnter(inline = true, suppress = RuntimeException.class, suppressHandler = PrintExceptionSuppressHandler.class)
    public static void atEnter(@Binding.This Object object, 
            @Binding.Class Object clazz,
            @Binding.Args Object[] args, 
            @Binding.MethodName String methodName,
            @Binding.MethodDesc String methodDesc) {
        System.out.println("atEnter, args[0]: " + args[0]);
    }

    @AtExit(inline = true)
    public static void atExit(@Binding.Return Object returnObject) {
        System.out.println("atExit, returnObject: " + returnObject);
    }

    @AtExceptionExit(inline = true, onException = RuntimeException.class)
    public static void atExceptionExit(@Binding.Throwable RuntimeException ex,
            @Binding.Field(name = "exceptionCount") int exceptionCount) {
        System.out.println("atExceptionExit, ex: " + ex.getMessage() + ", field exceptionCount: " + exceptionCount);
    }
}
```

## 2. @ExceptionHandler

在上面的 @AtEnter配置里，生成的代码会被 try/catch 包围，那么具体的内容是在PrintExceptionSuppressHandler里

```java
public static class PrintExceptionSuppressHandler {
    @ExceptionHandler(inline = true)
    public static void onSuppress(@Binding.Throwable Throwable e, @Binding.Class Object clazz) {
        System.out.println("exception handler: " + clazz);
        e.printStackTrace();
    }
}
```

## 3. 查看反编译结果

原始的Sample类是：

```java
public static class Sample {
    private int exceptionCount = 0;
    public String hello(String str, boolean exception) {
        if (exception) {
            exceptionCount++;
            throw new RuntimeException("test exception, str: " + str);
        }
        return "hello " + str;
    }
}
```

增强后的字节码，再反编译：

```java
package com.example;

public static class ByteKitDemo.Sample {
    private int exceptionCount = 0;

    public String hello(String string, boolean bl) {
        try {
            String string2 = "(Ljava/lang/String;Z)Ljava/lang/String;";
            String string3 = "hello";
            Object[] arrobject = new Object[]{string, new Boolean(bl)};
            Class<ByteKitDemo.Sample> class_ = ByteKitDemo.Sample.class;
            ByteKitDemo.Sample sample = this;
            System.out.println("atEnter, args[0]: " + arrobject[0]);
        }
        catch (RuntimeException runtimeException) {
            Class<ByteKitDemo.Sample> class_ = ByteKitDemo.Sample.class;
            RuntimeException runtimeException2 = runtimeException;
            System.out.println("exception handler: " + class_);
            runtimeException2.printStackTrace();
        }
        try {
            String string4;
            void str;
            void exception;
            if (exception != false) {
                ++this.exceptionCount;
                throw new RuntimeException("test exception, str: " + (String)str);
            }
            String string5 = string4 = "hello " + (String)str;
            System.out.println("atExit, returnObject: " + string5);
            return string4;
        }
        catch (RuntimeException runtimeException) {
            int n = this.exceptionCount;
            RuntimeException runtimeException3 = runtimeException;
            System.out.println("atExceptionExit, ex: " + runtimeException3.getMessage() + ", field exceptionCount: " + n);
            throw runtimeException;
        }
    }
}
```

# 开发相关

deploy到远程仓库：

```
mvn clean deploy -DskipTests -P release
```

# 参考资料

https://github.com/alibaba/bytekit

* any list
{:toc}