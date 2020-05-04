---
layout: post
title: Kotlin-08-接口
date:  2020-5-2 16:28:32 +0800
categories: [Kotlin]
tags: [kotlin, sh]
published: true
---

# Kotlin 接口

Kotlin 接口与 Java 8 类似，使用 interface 关键字定义接口，允许方法有默认实现：

```kotlin
interface MyInterface {
    fun bar()    // 未实现
    fun foo() {  //已实现
      // 可选的方法体
      println("foo")
    }
}
```

ps: 对比 java8 的优点就是不需要使用 `default` 关键字，这应该是设计的问题。

因为在这个语言设计时就考虑到了这个问题，java 也是为了兼容。

# 实现接口

一个类或者对象可以实现一个或多个接口。

## 语法

```kotlin
class Child : MyInterface {
    override fun bar() {
        // 方法体
    }
}
```

## 实例

```kotlin
interface MyInterface {
    fun bar()
    fun foo() {
        // 可选的方法体
        println("foo")
    }
}
class Child : MyInterface {
    override fun bar() {
        // 方法体
        println("bar")
    }
}
fun main(args: Array<String>) {
    val c =  Child()
    c.foo();
    c.bar();
}
```

- 结果

```
foo
bar
```

# 接口中的属性

接口中的属性只能是抽象的，**不允许初始化值，接口不会保存属性值**。

实现接口时，必须重写属性：

```kotlin
interface MyInterface{
    var name:String //name 属性, 抽象的
}
 
class MyImpl:MyInterface{
    override var name: String = "echo" //重写属性
}
```

ps: 这一点和 java 是不同的，java 中就有很多静态常量类的错误用法。估计 koltin 在设计之初，就考虑到让接口保持纯净。

## 例子

```kotlin
interface MyInterface {
    var name:String //name 属性, 抽象的
    fun bar()
    fun foo() {
        // 可选的方法体
        println("foo")
    }
}
class Child : MyInterface {
    override var name: String = "runoob" //重写属性
    override fun bar() {
        // 方法体
        println("bar")
    }
}
fun main(args: Array<String>) {
    val c =  Child()
    c.foo();
    c.bar();
    println(c.name)
}
```

- 输出

```
foo
bar
runoob
```

# 函数重写

实现多个接口时，可能会遇到同一方法继承多个实现的问题。

## 例子

例如:

```kotlin
interface A {
    fun foo() { print("A") }   // 已实现
    fun bar()                  // 未实现，没有方法体，是抽象的
}
 
interface B {
    fun foo() { print("B") }   // 已实现
    fun bar() { print("bar") } // 已实现
}
 
class C : A {
    override fun bar() { print("bar") }   // 重写
}
 
class D : A, B {
    override fun foo() {
        super<A>.foo()
        super<B>.foo()
    }
 
    override fun bar() {
        super<B>.bar()
    }
}
 
fun main(args: Array<String>) {
    val d =  D()
    d.foo();
    d.bar();
}
```

- 输出

```
ABbar
```

实例中接口 A 和 B 都定义了方法 foo() 和 bar()， 两者都实现了 foo(), B 实现了 bar()。因为 C 是一个实现了 A 的具体类，所以必须要重写 bar() 并实现这个抽象方法。

然而，如果我们从 A 和 B 派生 D，我们需要实现多个接口继承的所有方法，并指明 D 应该如何实现它们。

这一规则既适用于继承单个实现（bar()）的方法也适用于继承多个实现（foo()）的方法。

ps: 这个和 java 是一样的，具体的实现类，必须实现所有的抽象方法。

# 参考资料

## 官方

[官网](http://www.kotlinlang.org/)

## 参考入门教程

[Kotlin 接口](https://www.runoob.com/kotlin/kotlin-interface.html)

* any list
{:toc}