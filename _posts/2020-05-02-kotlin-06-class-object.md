---
layout: post
title: Kotlin-06-类和对象
date:  2020-5-2 16:28:32 +0800
categories: [Kotlin]
tags: [kotlin, sh]
published: true
---

# 类定义

Kotlin 类可以包含：构造函数和初始化代码块、函数、属性、内部类、对象声明。

Kotlin 中使用关键字 class 声明类，后面紧跟类名：

```kotlin
class User {
    // 大括号内是类体构成
}
```

ps: 这个和 java 没有区别。

## 定义空类

```
class Empty
```

## 定义成语函数

可以在类中定义成员函数：

```kotlin
class User {
    fun getName {
        return "kotlin";
    }
}
```

# 类的属性

## 属性定义

类的属性可以用关键字 `var` 声明为可变的，否则使用只读关键字 `val` 声明为不可变。

```kotlin
var age: String = ...;
let name: String  = ...;
```

我们可以像使用普通函数那样使用构造函数创建类实例：

```
var define = User() //kotlin 没有关键词 new
```

要使用一个属性，只要用名称引用它即可

```
define.name
define.age
```

## 构造器

Koltin 中的类可以有一个主构造器，以及一个或多个次构造器，主构造器是类头部的一部分，位于类名称之后:

```kotlin
class Person constructor(firstName: String) {}
```

如果主构造器没有任何注解，也没有任何可见度修饰符，那么constructor关键字可以省略。

```kotlin
class Person(firstName: String) {
}
```

## getter 和 setter

- 属性声明的完整语法：

```
var <propertyName>[: <PropertyType>] [= <property_initializer>]
    [<getter>]
    [<setter>]
```

getter 和 setter 都是可选

如果属性类型可以从初始化语句或者类的成员函数中推断出来，那就可以省去类型，val不允许设置setter函数，因为它是只读的。

```kotlin
var allByDefault: Int? // 错误: 需要一个初始化语句, 默认实现了 getter 和 setter 方法
var initialized = 1    // 类型为 Int, 默认实现了 getter 和 setter
val simple: Int?       // 类型为 Int ，默认实现 getter ，但必须在构造函数中初始化
val inferredType = 1   // 类型为 Int 类型,默认实现 getter
```

## 实例

以下实例定义了一个 Person 类，包含两个可变变量 lastName 和 no，lastName 修改了 getter 方法，no 修改了 setter 方法。

```kotlin
class Person {

    var lastName: String = "zhang"
        get() = field.toUpperCase()   // 将变量赋值后转换为大写
        set

    var no: Int = 100
        get() = field                // 后端变量
        set(value) {
            if (value < 10) {       // 如果传入的值小于 10 返回该值
                field = value
            } else {
                field = -1         // 如果传入的值大于等于 10 返回 -1
            }
        }

    var heiht: Float = 145.4f
        private set
}
```

- 测试

```kotlin
fun main(args: Array<String>) {
    var person: Person = Person()

    person.lastName = "wang"

    println("lastName:${person.lastName}")

    person.no = 9
    println("no:${person.no}")

    person.no = 20
    println("no:${person.no}")

}
```

- 结果

```
lastName:WANG
no:9
no:-1
```

## 类中字段的限制

Kotlin 中类不能有字段。

提供了 Backing Fields(后端变量) 机制,备用字段使用field关键字声明,field 关键词只能用于属性的访问器，如以上实例：

```kotlin
var no: Int = 100
        get() = field                // 后端变量
        set(value) {
            if (value < 10) {       // 如果传入的值小于 10 返回该值
                field = value
            } else {
                field = -1         // 如果传入的值大于等于 10 返回 -1
            }
        }
```

## 延迟初始化策略

非空属性必须在定义的时候初始化,kotlin提供了一种可以延迟初始化的方案,使用 `lateinit` 关键字描述属性：

```kotlin
public class MyTest {
    lateinit var subject: TestSubject

    @SetUp fun setup() {
        subject = TestSubject()
    }

    @Test fun test() {
        subject.method()  // dereference directly
    }
}
```

# 主构造器

主构造器中不能包含任何代码，初始化代码可以放在初始化代码段中，初始化代码段使用 `init` 关键字作为前缀。

```kotlin
class Person constructor(firstName: String) {
    init {
        println("FirstName is $firstName")
    }
}
```

注意：主构造器的参数可以在初始化代码段中使用，也可以在类主体n定义的属性初始化代码中使用。 

一种简洁语法，可以通过主构造器来定义属性并初始化属性值（可以是var或val）：

```kotlin
class People(val firstName: String, val lastName: String) {
    //...
}
```

如果构造器有注解，或者有可见度修饰符，这时constructor关键字是必须的，注解和修饰符要放在它之前。

## 实例

创建一个 User 类，并通过构造函数传入人名：

```kotlin
class User constructor(name: String) {
    var name: String = "ryo"
    var country: String = "CN"
    var age = 20

    init {
        println("初始化人名: ${name}")
    }

    fun printTest() {
        println("我是类的函数")
    }
}
```

- 测试

```kotlin
fun main(args: Array<String>) {
    val person =  Runoob("小明")
    println(person.name)
    println(person.age)
    println(person.country)
    person.printTest()
}
```

- 输出

```
初始化人名: 小明
小明
20
CN
我是类的函数
```

# 次构造函数

类也可以有二级构造函数，需要加前缀 constructor:

```koltin
class Person { 
    constructor(parent: Person) {
        parent.children.add(this) 
    }
}
```

如果类有主构造函数，每个次构造函数都要，或直接或间接通过另一个次构造函数代理主构造函数。

在同一个类中代理另一个构造函数使用 `this` 关键字：

```kotlin
class Person(val name: String) {
    constructor (name: String, age:Int) : this(name) {
        // 初始化...
    }
}
```

ps: 这个是类似于 c++ 的构造器继承实现。


## 默认构造器

如果一个非抽象类没有声明构造函数(主构造函数或次构造函数)，它会产生一个没有参数的构造函数，访问级别是 public。

如果你不想你的类有公共的构造函数，你就得声明一个空的主构造函数：

```kotlin
class DontCreateMe private constructor () {
}
```

注意：在 JVM 虚拟机中，**如果主构造函数的所有参数都有默认值，编译器会生成一个附加的无参的构造函数，这个构造函数会直接使用默认值。**

这使得 Kotlin 可以更简单的使用像 Jackson 或者 JPA 这样使用无参构造函数来创建类实例的库。

```kotlin
class Customer(val customerName: String = "")
```

ps: JPA/Jacson 会利用无参构造器进行反射。所有参数都有默认值，也可以理解为是一种无参。（不用外界显式指定参数）

## 实例

```kotlin
class Runoob  constructor(name: String) {  // 类名为 Runoob
    // 大括号内是类体构成
    var url: String = "http://www.runoob.com"
    var country: String = "CN"
    var siteName = name

    init {
        println("初始化网站名: ${name}")
    }
    // 次构造函数
    constructor (name: String, alexa: Int) : this(name) {
        println("Alexa 排名 $alexa")
    }

    fun printTest() {
        println("我是类的函数")
    }
}

```

- 测试

```kotlin
fun main(args: Array<String>) {
    val runoob =  Runoob("菜鸟教程", 10000)
    println(runoob.siteName)
    println(runoob.url)
    println(runoob.country)
    runoob.printTest()
}
```

- 输出

```
初始化网站名: 菜鸟教程
Alexa 排名 10000
菜鸟教程
http://www.runoob.com
CN
我是类的函数
```

# 抽象类

抽象是面向对象编程的特征之一，类本身，或类中的部分成员，都可以声明为 `abstract` 的。

抽象成员在类中不存在具体的实现。

注意：无需对抽象类或抽象成员标注 open 关键字。

## 实例

```kotlin
open class Base {
    open fun f() {}
}

abstract class Derived : Base() {
    override abstract fun f()
}
```

## open 关键字

这个原教程只是提了一下，那么什么是 open 关键字呢？

### 定义

open关键字的意思是“开放扩展”：

类的开放注释与Java的final注释相反：它允许其他人从此类继承。 

**默认情况下，Kotlin中的所有类都是 final 的**，对应于有效Java，第17项：用于继承的设计和文档，否则将禁止该类。

方法也是如此。

### public 的区别

public关键字充当可见性修饰符，可以应用于类，函数等。请注意，如果没有其他明确指定，则public是默认设置：

如果您未指定任何可见性修饰符，则默认情况下使用public，这意味着您的声明将在所有位置可见。

### 个人理解

open 主要偏向于继承，为什么默认是 final。估计是为了维护类的安全性。

# 嵌套类

我们可以把类嵌套在其他类中，看以下实例：

```kotlin
class Outer {                  // 外部类
    private val bar: Int = 1
    class Nested {             // 嵌套类
        fun foo() = 2
    }
}

fun main(args: Array<String>) {
    val demo = Outer.Nested().foo() // 调用格式：外部类.嵌套类.嵌套类方法/属性
    println(demo)    // == 2
}
```

# 内部类

内部类使用 `inner` 关键字来表示。

内部类会带有一个对外部类的对象的引用，所以内部类可以访问外部类成员属性和成员函数。

```kotlin
class Outer {
    private val bar: Int = 1
    var v = "成员属性"
    /**嵌套内部类**/
    inner class Inner {
        fun foo() = bar  // 访问外部类成员
        fun innerTest() {
            var o = this@Outer //获取外部类的成员变量
            println("内部类可以引用外部类的成员，例如：" + o.v)
        }
    }
}

fun main(args: Array<String>) {
    val demo = Outer().Inner().foo()
    println(demo) //   1
    val demo2 = Outer().Inner().innerTest()   
    println(demo2)   // 内部类可以引用外部类的成员，例如：成员属性
}
```

为了消除歧义，要访问来自外部作用域的 this，我们使用 `this@label`，其中 @label 是一个代指 this 来源的标签。

# 匿名内部类

使用对象表达式来创建匿名内部类：

```kotlin
class Test {
    var v = "成员属性"

    fun setInterFace(test: TestInterFace) {
        test.test()
    }
}

/**
 * 定义接口
 */
interface TestInterFace {
    fun test()
}

fun main(args: Array<String>) {
    var test = Test()

    /**
     * 采用对象表达式来创建接口对象，即匿名内部类的实例。
     */
    test.setInterFace(object : TestInterFace {
        override fun test() {
            println("对象表达式创建匿名内部类的实例")
        }
    })
}
```

# 类的修饰符

类的修饰符包括 classModifier 和 accessModifier :

## 类修饰符

classModifier: 类属性修饰符，标示类本身特性。

```kotlin
abstract    // 抽象类  
final       // 类不可继承，默认属性
enum        // 枚举类
open        // 类可继承，类默认是final的
annotation  // 注解类
```

### 访问修饰符

accessModifier: 访问权限修饰符

```kotlin
private    // 仅在同一个文件中可见
protected  // 同一个文件中或子类可见
public     // 所有调用的地方都可见
internal   // 同一个模块中可见
```

## 实例

```koltin
// 文件名：example.kt
package foo

private fun foo() {} // 在 example.kt 内可见

public var bar: Int = 5 // 该属性随处可见

internal val baz = 6    // 相同模块内可见
```

# 参考资料

## 官方

[官网](http://www.kotlinlang.org/)

## 参考入门教程

[Kotlin 类和对象](https://www.runoob.com/kotlin/kotlin-class-object.html)

[what-is-the-difference-between-open-and-public-in-kotlin](https://stackoverflow.com/questions/49024200/what-is-the-difference-between-open-and-public-in-kotlin)

* any list
{:toc}