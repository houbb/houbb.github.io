---
layout: post
title: Java Bytecode Kit-00-bytekit 入门介绍
date:  2023-08-09 +0800
categories: [JVM]
tags: [jvm, byte, instrument, ali, sh]
published: true
---


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




# 参考资料

https://github.com/alibaba/bytekit

* any list
{:toc}