---
layout: post
title: Java Lambda
date:  2017-6-28 16:35:38 +0800
categories: [Java]
tags: [lambda]
published: false
---

# Lambda 

Lambda 是 JDK8 中引入的一个很重要的内容，我没有将他和 [JDK8]({{ site.url }}/2017/06/28/jdk8) 放在一起，为了可以更深一点学习此内容。

一、anonymous function

以下为 [wiki](https://en.wikipedia.org/wiki/Anonymous_function) 的内容

In computer programming, an anonymous function (function literal, lambda abstraction) is a function definition that is not bound to an identifier. Anonymous functions are often:[1]

- arguments being passed to higher-order functions, or used for constructing the result of a higher-order function that needs to return a function.

- If the function is only used once, or a limited number of times, an anonymous function may be syntactically lighter than using a named function. 
Anonymous functions are ubiquitous in functional programming languages and other languages with first-class functions, 
where they fulfill the same role for the function type as literals do for other data types.


<label class="label success">引用</label>

[Lambda Expressions](http://docs.oracle.com/javase/tutorial/java/javaOO/lambdaexpressions.html)

[深入理解Java 8 Lambda](http://zh.lucida.me/blog/java-8-lambdas-insideout-language-features/)


二、基础需求

<label class="label label-warning">Caveats</label>

阅读本文之前，你必须对[函数式编程](http://www.iteye.com/blogs/subjects/Java8-FP)有所了解。

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

匿名内部类并不是一个好的选择，因为：

- 语法过于冗余

- 匿名类中的 this 和变量名容易使人产生误解

- 类型载入和实例创建语义不够灵活

- 无法捕获非 final 的局部变量

- 无法对控制流进行抽象




* any list
{:toc}





