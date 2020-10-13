---
layout: post
title:  java 基础篇-01-什么是面向对象？ OOP
date:  2020-7-19 10:37:20 +0800
categories: [Java]
tags: [java, java-base, sf]
published: true
---

# 什么是面向对象

面向对象程序设计（英语：Object-oriented programming，缩写：OOP）是种具有对象概念的程序编程典范，同时也是一种程序开发的抽象方针。

它可能包含数据、属性、代码与方法。对象则指的是类的实例。它将对象作为程序的基本单元，将程序和数据封装其中，以提高软件的重用性、灵活性和扩展性，对象里的程序可以访问及经常修改对象相关连的数据。

在面向对象程序编程里，计算机程序会被设计成彼此相关的对象。

面向对象程序设计可以看作一种在程序中包含各种独立而又互相调用的对象的思想，这与传统的思想刚好相反：传统的程序设计主张将程序看作一系列函数的集合，或者直接就是一系列对电脑下达的指令。面向对象程序设计中的每一个对象都应该能够接受数据、处理数据并将数据传达给其它对象，因此它们都可以被看作一个小型的“机器”，即对象。目前已经被证实的是，面向对象程序设计推广了程序的灵活性和可维护性，并且在大型项目设计中广为应用。此外，支持者声称面向对象程序设计要比以往的做法更加便于学习，因为它能够让人们更简单地设计并维护程序，使得程序更加便于分析、设计、理解。反对者在某些领域对此予以否认。

当我们提到面向对象的时候，它不仅指一种程序设计方法。它更多意义上是一种程序开发方式。

在这一方面，我们必须了解更多关于面向对象系统分析和面向对象设计（Object Oriented Design，简称OOD）方面的知识。

许多流行的编程语言是面向对象的,它们的风格就是会透由对象来创出实例。

重要的面向对象编程语言包含Common Lisp、Python、C++、Objective-C、Smalltalk、Delphi、Java、Swift、C#、Perl、Ruby 与 PHP等。

# 基本组成

面向对象编程通常共享高端编程语言的低端功能。

可用于建构一个程序的基本工具包括：

变量 能存储一些内置类型的信息如整数与字符，也有些是数据结构像是字符串、串列与散列表等包含内置或复合的变量如指针。

程序：也称为函数、方法或例程，是指输入数据产生输出结果，现代语言还包含结构化编程结构如程序循环与条件。

# 类和对象

支持面向对象编程语言通常利用继承其他类达到代码重用和可扩展性的特性。

## 概念

而类有两个主要的概念：

类（Class）：定义了一件事物的抽象特点。类的定义包含了数据的形式以及对数据的操作。

对象：是类的实例。

其中类（Class）定义了一件事物的抽象特点。类的定义包含了数据的形式以及对数据的操作。

## 例子

我们来看一段代码：

```java
package com.github.houbb.java.basic.learn.p01;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
public class Person {

    /**
     * 属性
     */
    private String name;

    /**
     * 构造器
     * @param name
     */
    public Person(String name) {
        this.name = name;
    }

    /**
     * 方法
     */
    public void printName() {
        System.out.println("name: " + name);
    }
}
```

举例来说，“Person”这个类会包含 person 的一切基础特征，即所有“person”都共有的特征或行为，例如它的名字等属性，可以输出名字的方法。

类可以为程序提供模版和结构。

一个类的方法和属性被称为“成员”。 

# 三大基本特征

## 封装性

具备封装性（Encapsulation）的面向对象编程隐藏了某一方法的具体运行步骤，取而代之的是通过消息传递机制发送消息给它。封装是通过限制只有特定类的对象可以访问这一特定类的成员，而它们通常利用接口实现消息的传入传出。

通常来说，成员会依它们的访问权限被分为3种：公有成员、私有成员以及保护成员。

有些语言更进一步：Java可以限制同一包内不同类的访问；C#和VB.NET保留了为类的成员聚集准备的关键字：internal（C#）和Friend（VB.NET）；Eiffel语言则可以让用户指定哪个类可以访问所有成员。

具备封装性（Encapsulation）的面向对象程序设计隐藏了某一方法的具体执行步骤，取而代之的是通过消息传递机制传送消息给它。

```java
/**
 * 共有方法
 */
public void printName() {
    System.out.println("name: " + name);
}

/**
 * 私有方法
 */
private void secret() {
    System.out.println("secret");
}
```

printName 就是一个共有方法，可以被外界调用。

secrect 是一个私有方法，外界无法直接访问。

个人理解：属性的访问级别，可以让外部不用关心具体的细节，也便于后期的调整，尽可能少的和外界交互，也是一种设计准则。

## 继承

继承性（Inheritance）是指，在某种情况下，一个类会有“子类”。子类比原本的类（称为父类）要更加具体化。

集成可以大大降低我们的代码编程量。

比如我们定义一种人，包含年龄的信息，我们可以直接使用继承的方式。

在伪代码中我们可以这样写：

```java
package com.github.houbb.java.basic.learn.p01;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
public class AgedPerson extends Person {

    private String age;

    public AgedPerson(String name, String age) {
        super(name);
        this.age = age;
    }

}
```

当一个类从多个父类继承时，我们称之为“多重继承”。

多重继承并不总是被支持的，因为它很难理解，又很难被好好使用。

ps: java 只支持单层胡继承，但是支持实现多个接口。

## 多态

多态（Polymorphism）是指由继承而产生的相关的不同的类，其对象对同一消息会做出不同的响应。

例子如下：

```java
package com.github.houbb.java.basic.learn.p01;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
public class AgedPerson extends Person {

    private String age;

    public AgedPerson(String name, String age) {
        super(name);
        this.age = age;
    }

    @Override
    public void printName() {
        System.out.println("Aged name: unknown");
    }
    
}
```

我们在子类中可以重写父类的 `printName()` 名称，不同的子类可以有不同的实现。

```java
Person person = new Person("person");
person.printName();

AgedPerson agedPerson = new AgedPerson("person", "10");
agedPerson.printName();
```

测试日志如下：

```
name: person
Aged name: unknown
```

# 抽象性

抽象（Abstraction）是简化复杂的现实问题的途径，它可以为具体问题找到最恰当的类定义，并且可以在最恰当的继承级别解释问题。

举例说明，莱丝在大多数时候都被当作一条狗，但是如果想要让它做牧羊犬做的事，你完全可以调用牧羊犬的方法。如果狗这个类还有动物的父类，那么你完全可以视莱丝为一个动物。

# 为什么Java不是纯粹面向对象的语言？

## 纯粹的面向对象语言

对于编程语言来说，纯粹的面向对象有七个特质需要满足。

他们是：

1. 封装/数据隐藏

2. 遗传

3. 多态性

4. 抽象化

5. 所有预定义类型都是对象

6. 所有用户定义的类型都是对象

7. 在对象上执行的所有操作必须仅通过在对象上暴露的方法。

例如：Smalltalk

## 为什么 java 不是纯粹面向对象？

Java支持属性1,2,3,4和6，但不支持上面给出的属性5和7。

（1）java 有 8 大基本类型

（2）静态关键字

当我们声明一个类为静态的时候，它可以在没有使用Java中的对象的情况下使用。

如果我们使用静态函数或静态变量，那么我们不能通过使用点（`.`）或类对象违反面向对象的特性来调用该函数或变量。

# 拓展阅读

[open close 开闭原则](https://houbb.github.io/2017/03/14/design-pattern-33-open-close)

[LSP 里氏替换原则](https://houbb.github.io/2017/03/14/design-pattern-34-lsp)

[依赖倒置原则（Dependence Inversion Principle，DIP）](https://houbb.github.io/2017/03/14/design-pattern-35-dip)

[单一职责原则（Single Responsibility Principle，SRP）](https://houbb.github.io/2017/03/14/design-pattern-36-srp)

[接口隔离原则（Interface Segregation Principle，ISP）](https://houbb.github.io/2017/03/14/design-pattern-37-isp)

[迪米特法则（Law of Demeter，LoD）](https://houbb.github.io/2017/03/14/design-pattern-38-lod)

[合成复用原则（Composite Reuse Principle，CRP）](https://houbb.github.io/2017/03/14/design-pattern-39-crp)

# 参考资料

[wiki](https://zh.wikipedia.org/wiki/%E9%9D%A2%E5%90%91%E5%AF%B9%E8%B1%A1%E7%A8%8B%E5%BA%8F%E8%AE%BE%E8%AE%A1)

[为什么Java不是纯粹面向对象的语言？](https://www.breakyizhan.com/java/3903.html)

* any list
{:toc}