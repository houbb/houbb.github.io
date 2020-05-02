---
layout: post
title: Kotlin-03-Kotlin 基本类型
date:  2020-5-2 16:28:32 +0800
categories: [Kotlin]
tags: [kotlin, sh]
published: true
---

# Kotlin 基本数据类型

Kotlin 的基本数值类型包括 Byte、Short、Int、Long、Float、Double 等。

不同于 Java 的是，字符不属于数值类型，是一个独立的数据类型。

| 类型	 | 位宽度 |
|:---|:---|
| Double| 64 |
| Float	 | 32 |
| Long	 | 64 |
| Int	   | 32 |
| Short	 | 16 |
| Byte	 | 8 |

# 字面常量

下面是所有类型的字面常量：

十进制：123
长整型以大写的 L 结尾：123L
16 进制以 0x 开头：0x0F
2 进制以 0b 开头：0b00001011

注意：8进制不支持

## 传统符号

Kotlin 同时也支持传统符号表示的浮点数值：

Doubles 默认写法: 123.5, 123.5e10

Floats 使用 f 或者 F 后缀：123.5f

你可以使用下划线使数字常量更易读：

你可以使用下划线使数字常量更易读：

```kotlin
val oneMillion = 1_000_000
val creditCardNumber = 1234_5678_9012_3456L
val socialSecurityNumber = 999_99_9999L
val hexBytes = 0xFF_EC_DE_5E
val bytes = 0b11010010_01101001_10010100_10010010
```

# 比较两个数字

Kotlin 中没有基础数据类型，只有封装的数字类型，你每定义的一个变量，其实 Kotlin 帮你封装了一个对象，这样可以保证不会出现空指针。

ps: 这一点算是对 java 的一个缺陷的修复，当然也有缺点，那就是占用了更多的内存。

数字类型也一样，所以在比较两个数字的时候，就有比较数据大小和比较两个对象是否相同的区别了。

在 Kotlin 中，三个等号 `===` 表示比较对象地址，两个 `==` 表示比较两个值大小。

ps: 这个和 js 一样。

```kotlin
fun main(args: Array<String>) {
    val a: Int = 10000
    println(a === a) // true，值相等，对象地址相等

    //经过了装箱，创建了两个不同的对象
    val boxedA: Int? = a
    val anotherBoxedA: Int? = a

    //虽然经过了装箱，但是值是相等的，都是10000
    println(boxedA === anotherBoxedA) //  false，值相等，对象地址不一样
    println(boxedA == anotherBoxedA) // true，值相等
}
```

# 类型转换

由于不同的表示方式，较小类型并不是较大类型的子类型，较小的类型不能隐式转换为较大的类型。 

这意味着在不进行显式转换的情况下我们不能把 Byte 型值赋给一个 Int 变量。

```kotlin
val b: Byte = 1 // OK, 字面值是静态检测的
val i: Int = b // 错误
```

我们可以代用其toInt()方法。

```kotlin
val b: Byte = 1 // OK, 字面值是静态检测的
val i: Int = b.toInt() // OK
```

每种数据类型都有下面的这些方法，可以转化为其它的类型：

```kotlin
toByte(): Byte
toShort(): Short
toInt(): Int
toLong(): Long
toFloat(): Float
toDouble(): Double
toChar(): Char
```

ps: 这种设计就比较好，基本常见的类型全部内置了互相转换的方式。

有些情况下也是可以使用自动类型转化的，前提是可以根据上下文环境推断出正确的数据类型而且数学操作符会做相应的重载。

ps: 重载这个概念在 C++ 中用的比较多。

例如下面是正确的：

```kotlin
val l = 1L + 3 // Long + Int => Long
```

# 位操作符

对于Int和Long类型，还有一系列的位操作符可以使用，分别是：

```kotlin
shl(bits) – 左移位 (Java’s <<)
shr(bits) – 右移位 (Java’s >>)
ushr(bits) – 无符号右移位 (Java’s >>>)
and(bits) – 与
or(bits) – 或
xor(bits) – 异或
inv() – 反向
```

ps: 这种英文的方式个人感觉不如符号来的直观。

# 字符

和 Java 不一样，Kotlin 中的 Char 不能直接和数字操作，Char 必需是单引号 ' 包含起来的。

比如普通字符 '0'，'a'。

```kotlin
fun check(c: Char) {
    if (c == 1) { // 错误：类型不兼容
        // ……
    }
}
```

字符字面值用单引号括起来: '1'。 

ps: 个人理解应该是为了避免 java 中 char 自动转换带来的歧义。

## 特殊字符转义

特殊字符可以用反斜杠转义。 

支持这几个转义序列：\t、 \b、\n、\r、\'、\"、`\\` 和 \$。 

编码其他字符要用 Unicode 转义序列语法：'\uFF00'。

## 显式类型转换

我们可以显式把字符转换为 Int 数字：

```kotlin
fun decimalDigitValue(c: Char): Int {
    if (c !in '0'..'9')
        throw IllegalArgumentException("Out of range")
    return c.toInt() - '0'.toInt() // 显式转换为数字
}
```

当需要可空引用时，像数字、字符会被装箱。

装箱操作不会保留同一性。

# 布尔

布尔用 Boolean 类型表示，它有两个值：true 和 false。

若需要可空引用布尔会被装箱。

内置的布尔运算有：

```
|| – 短路逻辑或
&& – 短路逻辑与
! - 逻辑非
```

ps: 从这里可以发现 kotlin 应该是同时支持符号和英文的写法。

# 数组

数组用类 Array 实现，并且还有一个 size 属性及 get 和 set 方法，由于使用 `[]` 重载了 get 和 set 方法，所以我们可以通过下标很方便的获取或者设置数组对应位置的值。

数组的创建两种方式：一种是使用函数arrayOf()；另外一种是使用工厂函数。

如下所示，我们分别是两种方式创建了两个数组：

```kotlin
fun main(args: Array<String>) {
    //[1,2,3]
    val a = arrayOf(1, 2, 3)
    //[0,2,4]
    val b = Array(3, { i -> (i * 2) })

    //读取数组内容
    println(a[0])    // 输出结果：1
    println(b[1])    // 输出结果：2
}
```

如上所述，[] 运算符代表调用成员函数 get() 和 set()。

注意: 与 Java 不同的是，Kotlin 中数组是不型变的（invariant）。

除了类Array，还有ByteArray, ShortArray, IntArray，用来表示各个类型的数组，省去了装箱操作，因此效率更高，其用法同Array一样：

```kotlin
val x: IntArray = intArrayOf(1, 2, 3)
x[0] = x[1] + x[2]
```

# 何为型变？

## 定义

这里讨论的协变、逆变与不变都是编程语言中的概念。

下面介绍定义：

若类A是类B的子类，则记作A ≦ B。设有变换f()，若：

当A ≦ B时，有f(A)≦ f(B)，则称变换f()具有协变性。

当A ≦ B时，有f(B)≦ f(A)，则称变换f()具有逆变性。

当A ≦ B时，f(A)与f(B)无关，则称变换f()具有协变性。

定义没看懂没关系，下面我们一个一个将Java中常见的f()变换，并举例说明，其中包括：

- 数组

- 泛型

- 方法的返回类型

## 数组协变

设有Super和Sub两个类，且Sub继承自Super：

```java
public class Super{}
class Sub extends Super{}
```

则如下代码在Java中是允许的：

```java
Super[] sups = new Sub[];
```

这里的f()就是从类延伸到数组的变换，而原有的继承关系不变，所以说Java的数组是协变的。

## 协变的缺点

看似合理的语言设计，其实是存在一些漏洞的。

考虑下面的代码：

```java
Object[] objs = new Integer[10];
objs[0] = "afly";
```

很不合理吧？但是上面的代码在编译时没有报错，只会在运行期抛出ArrayStoreException。

这就是数组协变带来的静态类型漏洞：**编译期无法完全保证类型安全。**

关于这个知乎上有些讨论。

看上去Java的设计者是在程序的易用性与类型安全之间做了取舍，因为如果不支持数组协变，一些通用的方法如 `Arrays.sort(Object[])` 确实没办法正常工作。

ps: java 对于集合就舍弃了这种妥协。


# 字符串

和 Java 一样，String 是不可变的。

方括号 [] 语法可以很方便的获取字符串中的某个字符，也可以通过 for 循环来遍历：

```kotlin
for (c in str) {
    println(c)
}
```

Kotlin 支持三个引号 `"""` 扩起来的字符串，支持多行字符串，比如：

```kotlin
fun main(args: Array<String>) {
    val text = """
    多行字符串
    多行字符串
    """
    println(text)   // 输出有一些前置空格
}
```

ps: 这个特性类似于 python 的注释。

## trim 方法

String 可以通过 trimMargin() 方法来删除多余的空白。

```kotlin
fun main(args: Array<String>) {
    val text = """
    |多行字符串
    |菜鸟教程
    |多行字符串
    |Runoob
    """.trimMargin()
    println(text)    // 前置空格删除了
}
```

默认 `|` 用作边界前缀，但你可以选择其他字符并作为参数传入，比如 trimMargin(">")。

# 字符串模板

字符串可以包含模板表达式 ，即一些小段代码，会求值并把结果合并到字符串中。 

模板表达式以美元符（`$`）开头，由一个简单的名字构成:

```kotlin
fun main(args: Array<String>) {
    val i = 10
    val s = "i = $i" // 求值结果为 "i = 10"
    println(s)
}
```

或者用花括号扩起来的任意表达式:

```kotlin
fun main(args: Array<String>) {
    val s = "runoob"
    val str = "$s.length is ${s.length}" // 求值结果为 "runoob.length is 6"
    println(str)
}
```

ps: 这个解决了 java 中我们最常见的一个需求：Expression 表达式。

## 如何输出 `$` 符号

原生字符串和转义字符串内部都支持模板。 

如果你需要在原生字符串中表示字面值 `$` 字符（它不支持反斜杠转义），你可以用下列语法：

```kotlin
fun main(args: Array<String>) {
    val price = """
    ${'$'}9.99
    """
    println(price)  // 求值结果为 $9.99
}
```

ps: 至于为什么不支持转义这点难以理解，可能有其他的取舍。

# 参考资料

## 官方

[官网](http://www.kotlinlang.org/)

## 参考入门教程

[协变、逆变与不变：数组、泛型、与返回类型](https://blog.csdn.net/yi_afly/article/details/52071260)

[Java泛型（二） 协变与逆变](https://www.jianshu.com/p/2bf15c5265c5)

* any list
{:toc}