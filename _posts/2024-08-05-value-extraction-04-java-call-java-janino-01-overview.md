---
layout: post
title: Janino：轻量级且高效的Java编译器-01-overview 
date: 2024-08-05 21:01:55 +0800
categories: [Java]
tags: [java, open-source, tool, sh]
published: true
---

# 标题：**Janino：轻量级且高效的Java编译器**

Janino 是一个超小型、超快速的Java编译器。

Janino 不仅能像JAVAC一样将一组源文件编译成一组类文件，而且还能编译一个Java表达式、一个代码块、一个类体、一个.java文件或一组.java文件在内存中，加载字节码并在运行中的JVM中直接执行。

```
<integration>
  <commons-jci>Apache Commons JCI ("Java Compiler Interface")</commons-jci>
  <jboss-rules>JBoss Rules / Drools</jboss-rules>
</integration>
```

Janino 还可以用于静态代码分析或代码操作。


# **快速入门指南**

## 简介：

这是关于什么的？查看这个PDF演示文稿以快速开始。（请注意，一些信息已经过时，例如对CODEHAUS的引用，它在2015年的某个时候已经不存在了。）

## 属性：

主要设计目标是在保持编译器小巧简单的前提下，提供一个（几乎）完整的Java编译器。

以下是Java编程语言实现的元素（或注明部分实现的）：

Java 1.4语言特性：
- 包声明，导入声明
- 类声明
- 接口声明
- 继承（扩展和实现）
- 静态成员类型声明
- 内部类声明（非静态成员、局部、匿名）
- 类初始化器，实例初始化器
- 字段声明，方法声明
- 局部变量声明
- 类变量初始化器，实例变量初始化器
- 块语句（{...}）
- if ... else 语句
- 基本的for循环
- while循环
- do ... while循环
- try ... catch ... finally 语句
- 抛出语句
- 返回语句
- 断点语句
- 继续语句
- switch语句
- 同步语句
- 所有基本类型（布尔，字符，字节，短整型，整型，长整型，浮点型，双精度浮点型）
- 赋值运算符 =
- 复合赋值运算符 +=, -=, *=, /=, &=, |=, ^=, %=, <<=, >>=, >>>=
- 条件运算符 ? ... :, &&, ||
- 布尔逻辑运算符 &, ^, |
- 整型位运算符 &, ^, |
- 数值运算符 *, /, %, +, -, <<, >>, >>
- 字符串连接运算符 +
- 运算符 ++ 和 --
- 类型比较运算符 instanceof
- 一元运算符 +, -, ~, !
- 括号表达式
- 字段访问（如 System.out）
- 超类成员访问（super.meth(), super.field）
- this（当前实例的引用）
- 调用其他构造器（this(a, b, c);）
- 超类构造器调用（super(a, b, c);）
- 方法调用（System.out.println("Hello")）
- 类实例创建（new Foo()）
- 原始数组创建（new int[10][5][])
- 类或接口数组创建（new Foo[10][5][])
- 数组访问（args[0]）
- 局部变量访问
- 整数字面量（十进制，十六进制和八进制）
- 浮点字面量（十进制）
- 布尔，字符，字符串字面量
- null字面量
- 数值转换：一元，二元，扩展，缩小
- 引用转换：扩展，缩小
- 赋值转换
- 字符串转换（用于字符串连接）
- 强制类型转换
- 常量表达式
- 块作用域，方法作用域，类作用域，全局作用域
- 抛出子句
- 数组初始化器（String[] a = { "x", "y", "z" }）
- 原始类字面量（int.class）
- 非原始类字面量（String.class）
- 未编译编译单元之间的引用
- 行号表（"-g:lines"）
- 源文件信息（"-g:source"）
- 局部变量信息（"-g:vars"）
- 处理@deprecated文档注释标签
- 可访问性检查（public, protected, private, 默认）
- "确定赋值"检查
- 编译成超过32KB的方法
- assert（部分实现 - 断言始终启用，就像JVM以"-ea"命令行选项启动一样）
- 用于字符串连接的StringBuilder类

Java 5语言特性：
- 参数化类型声明
- 类型参数（例如 List<String>）：已解析，但其他方面被忽略。最显著的限制是，您必须从方法调用中强制转换返回值，例如 "(String) myMap.get(key)"

Java 7语言特性：
- 二进制整数字面量（JLS7 3.10.1）
- 数值字面量中的下划线（JLS7 3.10.1）
- 字符串switch语句（JLS7 14.11）
- try-with-resources语句（JLS7 14.20.3）
- 捕获和重新抛出多个异常类型：部分实现；已解析和未解析，但不可编译
- 泛型实例创建的类型推断（即“菱形运算符”）（JLS11 15.9.1）

Java 8语言特性：
- Lambda表达式：部分实现；已解析和未解析，但不可编译
- 方法引用：部分实现；已解析和未解析，但不可编译
- 默认方法
- 静态接口方法

Java 9语言特性：
- 私有接口方法
- 增强的try-with-resources语句，允许VariableAccesses作为资源（JLS9 14.20.3）

Java 10语言特性：
- 局部变量类型推断：部分实现；已解析和未解析，但不可编译

Java 11语言特性：
- Lambda参数类型推断：部分实现；已解析和未解析，但不可编译

Java 15语言特性：
- 文本块

即使JANINO在旧版本的JRE上运行，它也支持所有这些语言特性！


# Java编程语言未实现或部分实现的特性

以下是Java编程语言未实现（或注明部分实现）的元素：

Java 1.4语言特性：
- assert：部分实现 - 断言始终启用，就像JVM是以"-ea"命令行选项启动的一样。

Java 5语言特性：
- 类型参数：已解析，但其他方面被忽略。最显著的限制是，您必须从方法调用中强制转换返回值，例如 "(String) myMap.get(key)"。

Java 7语言特性：
- 捕获并重新抛出多个异常类型：部分实现；已解析和未解析，但不可编译。
- 泛型实例创建的类型推断（例如 `Map<String, Integer> map = new HashMap<>();`）。

Java 8语言特性：
- Lambda表达式：部分实现；已解析和未解析，但不可编译。
- 方法引用：部分实现；已解析和未解析，但不可编译。
- 重复注解。
- 类型注解。

Java 9语言特性：
- 内部类使用的菱形运算符。
- 模块：部分实现；模块化编译单元已解析和未解析，但不可编译。

Java 10语言特性：
- 局部变量类型推断：部分实现；已解析和未解析，但不可编译。

Java 11语言特性：
- Lambda参数类型推断：部分实现；已解析和未解析，但不可编译。

许可：
- JANINO在新BSD许可证下可用。

# 下载

- 包
  如果您使用MAVEN，请在您的POM文件中添加此条目：

```xml
<!-- MAVEN依赖配置示例 -->
<dependency>
  <groupId>org.codehaus.janino</groupId>
  <artifactId>janino</artifactId>
  <version>版本号</version>
</dependency>
```

请注意，上面的`版本号`应替换为实际使用的Janino库的版本号。

## 入门例子

```java
ExpressionEvaluator ee = new ExpressionEvaluator();
ee.cook("3 + 4");
System.out.println(ee.evaluate()); // Prints "7".
```


# 基础示例：Janino作为表达式求值器

Janino作为一个表达式求值器：

假设你正在构建一个电子商务系统，该系统计算用户放入购物车中的商品的运费。由于你在实现时不知道商家的运费计算模型，你可以实现一组你能想到的运费计算模型（固定收费、按重量、按商品数量等），并在运行时选择其中之一。

实际上，你会发现你实现的运费计算模型很少会符合商家的要求，所以你必须添加自定义模型，这些模型是特定于商家的。如果商家的模型稍后有变化，你必须更改你的代码，重新编译并重新分发你的软件。

因为这种方式非常不灵活，运费表达式应在运行时指定，而不是在编译时。这意味着表达式必须在运行时扫描、解析和评估，这就是为什么你需要一个表达式求值器。

一个简单的表达式求值器会解析一个表达式并创建一个“语法树”。例如，表达式 "a + b * c" 将编译成一个“求和”对象，其第一个操作数是参数 "a"，第二个操作数是一个“乘积”对象，其操作数是参数 "b" 和 "c"。这样的语法树可以相对快速地评估。然而，运行时性能大约比直接由JVM执行的“本地”Java代码低100倍。这限制了这种表达式求值器在简单应用程序中的使用。

此外，你可能不仅想要进行简单的算术运算，如 "a + b * c % d"，而且可能想要进一步发展这个概念，拥有一个真正的“脚本”语言，这增加了你的应用程序的灵活性。由于你已经知道Java编程语言，你可能想要一个与Java编程语言语法类似的语言。

所有这些考虑都导致了在运行时编译Java代码，就像一些引擎（例如JSP引擎）已经做的那样。然而，使用ORACLE的JDK编译Java程序是一个相对资源密集型的过程（磁盘访问，CPU时间等）。这就是Janino发挥作用的地方……一个轻量级，“嵌入式”Java编译器，它在内存中编译简单程序到JVM字节码，这些字节码在运行程序的JVM中执行。

好的，现在你好奇了……这就是你如何使用ExpressionEvaluator的方式：（接下来的内容应该是具体的使用示例，但原文中并未给出具体的代码或步骤，所以这里无法继续翻译。如果需要进一步的示例代码或步骤，请提供详细信息。）

```java
package foo;
 
import java.lang.reflect.InvocationTargetException;
 
import org.codehaus.commons.compiler.CompileException;
import org.codehaus.janino.ExpressionEvaluator;
 
public class Main {
 
    public static void
    main(String[] args) throws CompileException, InvocationTargetException {
 
        // Now here's where the story begins...
        ExpressionEvaluator ee = new ExpressionEvaluator();
 
        // The expression will have two "int" parameters: "a" and "b".
        ee.setParameters(new String[] { "a", "b" }, new Class[] { int.class, int.class });
 
        // And the expression (i.e. "result") type is also "int".
        ee.setExpressionType(int.class);
 
        // And now we "cook" (scan, parse, compile and load) the fabulous expression.
        ee.cook("a + b");
 
        // Eventually we evaluate the expression - and that goes super-fast.
        int result = (Integer) ee.evaluate(new Object[] { 19, 23 });
        System.out.println(result);
    }
}
```

# todo

...


# 参考资料

https://janino-compiler.github.io/janino/#getting_started

* any list
{:toc}