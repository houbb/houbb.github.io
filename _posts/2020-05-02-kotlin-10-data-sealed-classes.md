---
layout: post
title: Kotlin-10-数据类和密封类
date:  2020-5-2 16:28:32 +0800
categories: [Kotlin]
tags: [kotlin, sh]
published: true
---

# 数据类

Kotlin 可以创建一个只包含数据的类，关键字为 `data`：

```
data class User(val name: String, val age: Int)
```

编译器会自动的从主构造函数中根据所有声明的属性提取以下函数：

```
equals() / hashCode()
toString() 格式如 "User(name=John, age=42)"
componentN() functions 对应于属性，按声明顺序排列
copy() 函数
```

如果这些函数在类中已经被明确定义了，或者从超类中继承而来，就不再会生成。

## 条件

为了保证生成代码的一致性以及有意义，数据类需要满足以下条件：

- 主构造函数至少包含一个参数。

- 所有的主构造函数的参数必须标识为val 或者 var ;

- 数据类不可以声明为 abstract, open, sealed 或者 inner;

- 数据类不能继承其他类 (但是可以实现接口)。

ps: 上一次看到 `sealed` 这种密封类还是在 C# 编程中。现在感觉 kotlin 确实引入了不少 keyword。

## 复制

复制使用 `copy()` 函数，我们可以使用该函数复制对象并修改部分属性, 对于上文的 User 类，其实现会类似下面这样：

```kotlin
fun copy(name: String = this.name, age: Int = this.age) = User(name, age)
```

### 实例

```kotlin
data class User(val name: String, val age: Int)

fun main(args: Array<String>) {
    val jack = User(name = "Jack", age = 1)
    val olderJack = jack.copy(age = 2)
    println(jack)
    println(olderJack)
}
```

- 输出

```
User(name=Jack, age=1)
User(name=Jack, age=2)
```

## 数据类以及解构声明

组件函数允许数据类在解构声明中使用：

```kotlin
val jane = User("Jane", 35)
val (name, age) = jane
println("$name, $age years of age") // prints "Jane, 35 years of age"
```

## 标准数据类

标准库提供了 Pair 和 Triple。

在大多数情形中，命名数据类是更好的设计选择，因为这样代码可读性更强而且提供了有意义的名字和属性。

ps: 当然有时候只是简单的几个属性，可以使用内置的标准库类。

# 密封类

密封类用来表示受限的类继承结构：当一个值为有限几种的类型, 而不能有任何其他类型时。

在某种意义上，他们是枚举类的扩展：枚举类型的值集合也是受限的，但每个枚举常量只存在一个实例，而密封类的一个子类可以有可包含状态的多个实例。

声明一个密封类，使用 `sealed` 修饰类，密封类可以有子类，但是所有的子类都必须要内嵌在密封类中。

sealed 不能修饰 interface, abstract class(会报 warning,但是不会出现编译错误)

## 实例

```kotlin
sealed class Expr
data class Const(val number: Double) : Expr()
data class Sum(val e1: Expr, val e2: Expr) : Expr()
object NotANumber : Expr()

fun eval(expr: Expr): Double = when (expr) {
    is Const -> expr.number
    is Sum -> eval(expr.e1) + eval(expr.e2)
    NotANumber -> Double.NaN
}
```

## 好处

使用密封类的关键好处在于使用 when 表达式的时候，如果能够验证语句覆盖了所有情况，就不需要为该语句再添加一个 else 子句了。

```kotlin
fun eval(expr: Expr): Double = when(expr) {
    is Expr.Const -> expr.number
    is Expr.Sum -> eval(expr.e1) + eval(expr.e2)
    Expr.NotANumber -> Double.NaN
    // 不再需要 `else` 子句，因为我们已经覆盖了所有的情况
}
```


ps: 从这个例子可以看得出，sealed 类是枚举的一种拓展。不过比枚举更加灵活。

# 参考资料

## 官方

[官网](http://www.kotlinlang.org/)

## 参考入门教程

[Kotlin 数据类与密封类](https://www.runoob.com/kotlin/kotlin-data-sealed-classes.html)

* any list
{:toc}