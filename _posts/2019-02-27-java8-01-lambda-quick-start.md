---
layout: post
title: java8-01-快速开始
date:  2019-2-27 15:48:49 +0800
categories: [Java]
tags: [java, jdk8, sh]
published: true
---


# Lambda 

Lambda 是 JDK8 中引入的一个很重要的内容，思想值得深入学习。

一、anonymous function

以下为 [wiki](https://en.wikipedia.org/wiki/Anonymous_function) 的内容

In computer programming, an anonymous function (function literal, lambda abstraction) is a function definition that is not bound to an identifier. Anonymous functions are often:[1]

- arguments being passed to higher-order functions, or used for constructing the result of a higher-order function that needs to return a function.

- If the function is only used once, or a limited number of times, an anonymous function may be syntactically lighter than using a named function. 
Anonymous functions are ubiquitous in functional programming languages and other languages with first-class functions, 
where they fulfill the same role for the function type as literals do for other data types.

# 语言篇

## 缘起

不过有些 Java 对象只是对单个函数的封装。例如下面这个典型用例：Java API 中定义了一个接口（一般被称为回调接口），用户通过提供这个接口的实例来传入指定行为，例如：

```java
public interface ActionListener {
  void actionPerformed(ActionEvent e);
}
```

这里并不需要专门定义一个类来实现 ActionListener，因为它只会在调用处被使用一次。用户一般会使用匿名类型把行为内联（inline）：

```java
button.addActionListener(new ActionListener() {
  public void actionPerformed(ActionEvent e) {
    ui.dazzle(e.getModifiers());
  }
});
```

很多库都依赖于上面的模式。对于并行 API 更是如此，因为我们需要把待执行的代码提供给并行 API，并行编程是一个非常值得研究的领域，
因为在这里摩尔定律得到了重生：尽管我们没有更快的 CPU 核心（core），但是我们有更多的 CPU 核心。而串行 API 就只能使用有限的计算能力。

## 匿名内部类的缺点

匿名内部类并不是一个好的选择，因为：

- 语法过于冗余

- 匿名类中的 this 和变量名容易使人产生误解

- 类型载入和实例创建语义不够灵活

- 无法捕获非 final 的局部变量

- 无法对控制流进行抽象

# 概念

lambda 可以简洁地表示可传递的匿名函数的一种方式。

- 匿名

不需要确切指定一个名称。

- 函数

它不想方法那样隶属于某个特定的类。

但是和普通方法一样拥有参数列表，函数主题，返回类型，还有可能抛出异常列表。

- 传递

可以作为参数传递给方法或者存储在变量中。

- 简洁

无需像匿名类那样写很多模板代码。

## 初见

- 先前


```java
Comparator<Apple> byWeight = new Comparator<Apple>(){
   public int compare(Apple a1, Apple a2) {
       return a1.getWeight().compareTo(a2.getWeight());
   } 
};
```

- 现在

```java
Comparator<Apple> byWeight = 
    (Apple a1, Apple a2)->a1.getWeight().compareTo(a2.getWeight());
```

# lambda

## 基础语法

```
(parameters)->expression
```

or

```
(parameters)->{statements;}
```

## 使用案例

|使用案例| lambda 示例 |
|:---|:---|
| 布尔表达式 | `(List<String> list)->list.empty()`|
| 创建对象 | `()->new Apple(10)` |
| 消费一个对象 | `(Apple a)->{ System.out.println(a.getWeight())}` |
| 从一个集合中选择 | `(String s) -> s.length()` |
| 组合两个数 | `(int a, int b)->a*b` |
| 比较2个对象 | `(Apple a1, Apple a2)->a1.getWeight().compareTo(a2.getWeight())` |

# 使用场景

## 函数式接口

- Predicate

比如：

```java
@FunctionalInterface
public interface Predicate<T> {

    /**
     * Evaluates this predicate on the given argument.
     */
    boolean test(T t);
}
```




## 函数描述符

- 概念

函数式接口的抽象方法的签名基本上就是 Lambda 表达式的签名，
我们将这种抽象方法叫作**函数描述符**。

Runnable 就是不接受参数，也没有返回的函数的签名。

- 为什么这么实现

添加函数类型。

这种方式自然，且可以避免语言变得更加复杂。

且，大多数 Java 程序员都已经熟悉了具有一个抽象方法的接口的概念。



# 参考资料

[Lambda Expressions](http://docs.oracle.com/javase/tutorial/java/javaOO/lambdaexpressions.html)

[深入理解Java 8 Lambda](http://zh.lucida.me/blog/java-8-lambdas-insideout-language-features/)

* any list
{:toc}
