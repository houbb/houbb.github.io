---
layout: post
title: jdk8 Java Lambda
date:  2017-6-28 16:35:38 +0800
categories: [Java]
tags: [lambda]
published: true
---

# 拓展阅读

[Java Functional java 函数式编程](https://houbb.github.io/2017/06/29/java-functional)

[Java Lambda](https://houbb.github.io/2017/06/28/java-lambda)


# Lambda 

Lambda 是 JDK8 中引入的一个很重要的内容。

# 一、anonymous function

以下为 [wiki](https://en.wikipedia.org/wiki/Anonymous_function) 的内容

```
匿名函数

在计算机编程中，匿名函数（也称为函数字面量、lambda抽象）是一个没有绑定到标识符的函数定义。匿名函数经常用于以下情况：

- 作为传递给高阶函数的参数，或用于构造需要返回函数的高阶函数的结果。
  
- 如果函数只被使用一次或有限次数，使用匿名函数可能在语法上更为简洁，而不是使用命名函数。

匿名函数在函数式编程语言和其他具有一级函数特性的语言中无处不在，它们对函数类型的作用与字面量对其他数据类型的作用相同。
```

## jdk7 及之前的匿名函数是什么样的？

在 JDK 7 及之前的版本中，Java 并没有原生支持 Lambda 表达式或匿名函数。但是，开发者通常使用匿名内部类来模拟匿名函数的功能。匿名内部类允许开发者创建一个没有名称的类实例，并直接在代码中使用它。

### 匿名内部类的语法

匿名内部类通常在创建接口或抽象类的实例时使用，语法如下：

```java
new InterfaceOrAbstractClassName() {
    // 匿名内部类的主体
    @Override
    returnType methodName(parameters) {
        // 方法实现
    }
};
```

### 示例

1. **使用匿名内部类实现接口**

假设有一个接口 `Runnable`，它只有一个抽象方法 `run()`：

```java
Runnable runnable = new Runnable() {
    @Override
    public void run() {
        System.out.println("Hello from anonymous inner class!");
    }
};
```

2. **使用匿名内部类实现抽象类**

```java
AbstractClass abstractInstance = new AbstractClass() {
    @Override
    public void abstractMethod() {
        System.out.println("Implementation of abstract method");
    }
};
```

### 在集合操作中使用匿名内部类

在 JDK 7 及之前的版本中，通常使用匿名内部类来处理集合元素：

```java
List<String> list = Arrays.asList("apple", "banana", "orange");

// 使用匿名内部类遍历集合
list.forEach(new Consumer<String>() {
    @Override
    public void accept(String item) {
        System.out.println(item);
    }
});
```

### 注意事项

- 匿名内部类通常会使代码显得冗长和不够清晰，特别是当需要实现多个接口或抽象方法时。
- 匿名内部类不能访问非 final 或非事实上 final 的局部变量（即不再改变的变量），因为它们在匿名内部类中被隐式地视为 final。

总的来说，尽管在 JDK 7 及之前的版本中没有原生支持 Lambda 表达式或匿名函数，但开发者通过匿名内部类能够模拟出类似的功能，尽管这种方法在语法和可读性上都不如 Lambda 表达式方便。

随着 JDK 8 的引入，Lambda 表达式为 Java 提供了更简洁、更灵活的函数式编程方式。

## Q: 有什么缺点吗?为什么需要引入 lambda

匿名内部类在 JDK 7 及之前的版本中是模拟函数式编程特性的主要方式，但它们具有一些缺点，这些缺点在实际开发中可能会导致代码冗长、可读性差和维护困难。以下是匿名内部类存在的一些主要问题：

### 1. 代码冗长

匿名内部类的语法通常更加冗长，需要更多的代码来完成相同的功能，这可能会降低代码的可读性和维护性。

### 2. 代码可读性差

由于匿名内部类的语法相对复杂，可能会使代码难以理解，特别是对于新加入的开发者或不熟悉该代码的人。

### 3. 作用域限制

匿名内部类中对外部变量的访问存在限制。只能访问 final 或事实上 final 的局部变量，这限制了其灵活性。

### 4. 缺乏清晰性和直观性

匿名内部类通常需要定义新的类或实现接口，这可能会导致代码结构变得混乱，难以直观地表达代码的意图。

### 为什么需要引入 Lambda 表达式？

Lambda 表达式是为了解决上述问题而引入的，它提供了一种更简洁、更清晰的方式来表示匿名函数或闭包，使得 Java 能够更加轻松地进行函数式编程和数据处理。

以下是 Lambda 表达式的一些主要优点：

#### 1. 简洁性

Lambda 表达式可以使代码更加简洁，特别是在处理集合、事件监听器和回调函数等场景下。

#### 2. 可读性

Lambda 表达式提高了代码的可读性，使开发者更容易理解代码的意图和功能。

#### 3. 灵活性

Lambda 表达式支持更灵活的变量捕获，可以更自然地访问外部变量，而不需要额外的限制。

#### 4. 促进函数式编程

Lambda 表达式使得函数式编程在 Java 中变得更加容易，使得 Java 可以更好地适应现代编程模式和技术。

综上所述，Lambda 表达式通过提供一种简洁、清晰和灵活的语法，显著改进了 Java 在函数式编程方面的能力，从而使 Java 开发更加高效和愉悦。

## Q: 详细介绍一下 匿名函数

匿名函数是一种没有名称的函数，也被称为 lambda 表达式或闭包。

在 Java 中，匿名函数主要通过 Lambda 表达式的形式表示。

匿名函数提供了一种更简洁的方式来创建函数，通常用于函数式编程和数据处理。

### Lambda 表达式的语法

Lambda 表达式的基本语法如下：

```java
(parameters) -> { body }
```

- **参数列表**：Lambda 表达式的参数列表，可以是零个、一个或多个参数。参数类型可以明确指定，也可以根据上下文进行推断。
  
- **箭头符号 (->)**：箭头符号将参数列表与 Lambda 表达式的主体分隔开。
  
- **主体**：Lambda 表达式的主体可以是一个表达式或一个代码块。如果主体是一个表达式，那么它会自动返回这个表达式的值；如果主体是一个代码块，那么需要使用 `return` 关键字来返回值。

### Lambda 表达式的示例

1. **无参数的 Lambda 表达式**

```java
() -> System.out.println("Hello, World!");
```

2. **带有一个参数的 Lambda 表达式**

```java
(name) -> System.out.println("Hello, " + name);
```

3. **带有多个参数的 Lambda 表达式**

```java
(a, b) -> {
    int sum = a + b;
    System.out.println("Sum: " + sum);
};
```

### 在集合操作中使用 Lambda 表达式

Lambda 表达式在集合操作中尤为有用，如 `forEach`、`filter`、`map` 等方法。

```java
List<String> list = Arrays.asList("apple", "banana", "orange");

// 使用 Lambda 表达式遍历集合
list.forEach(item -> System.out.println(item));

// 使用 Lambda 表达式进行数据过滤和映射
List<String> filteredList = list.stream()
                               .filter(item -> item.startsWith("a"))
                               .map(String::toUpperCase)
                               .collect(Collectors.toList());
```

### 注意事项

- Lambda 表达式引入了函数式编程的特性，使得代码更加简洁和可读。
- Lambda 表达式可以捕获外部的变量，但这些变量必须是隐式最终的或事实上最终的（即不能再次赋值）。
- 在函数式接口（只有一个抽象方法的接口）中，Lambda 表达式可以被赋值给该接口的变量，或作为参数传递给方法。

总的来说，Lambda 表达式为 Java 开发者提供了一种强大的工具，使得函数式编程和数据处理变得更加简单和直观。

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

# 参考资料

[Lambda Expressions](http://docs.oracle.com/javase/tutorial/java/javaOO/lambdaexpressions.html)

[深入理解Java 8 Lambda](http://zh.lucida.me/blog/java-8-lambdas-insideout-language-features/)

* any list
{:toc}