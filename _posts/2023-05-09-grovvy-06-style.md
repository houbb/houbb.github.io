---
layout: post
title: grovvy-06-Style guide
date:  2023-05-09 +0800
categories: [Lang]
tags: [grovvy, lang, sh]
published: true
---

# 风格指南

一个从Java转向Groovy的开发者通常会以Java为参考，并逐步学习Groovy，逐步掌握更多特性，提高生产效率，编写更符合Groovy风格的代码。本文档的目的是指导开发者在这个过程中，教授一些常见的Groovy语法风格、新操作符和新特性，如闭包等。本指南并不完整，只作为一个快速入门和基础，如果您希望对文档进行贡献和完善，可进一步添加指南的章节。

# 1. 不需要分号

当从C/C++/C#/Java的背景转向Groovy时，我们习惯了使用分号，到处都放上分号。

更糟糕的是，Groovy支持99%的Java语法，有时候将一些Java代码粘贴到Groovy程序中非常容易，结果导致到处都是分号。

但是，在Groovy中分号是可选的，您可以省略它们，而且省略分号更符合Groovy的习惯。

# 2. return 关键字可选

在Groovy中，方法体中最后一个被评估的表达式可以在不需要return关键字的情况下返回。

特别是对于简短的方法和闭包，为了简洁起见，最好省略return关键字:

```groovy
String toString() { return "a server" }
String toString() { "a server" }
```

但有时候，当你在使用一个变量，并在两行上看到它的可视化时，这看起来并不好：

```groovy
def props() {
    def m1 = [a: 1, b: 2]
    m2 = m1.findAll { k, v -> v % 2 == 0 }
    m2.c = 3
    m2
}
```

在这种情况下，可以在最后一个表达式之前换行，或者明确使用return关键字可以提高可读性。

对于我个人来说，有时我使用return关键字，有时不使用，这通常是个人喜好的问题。但通常在闭包内，我们更倾向于省略它。所以即使关键字是可选的，如果你认为它影响了代码的可读性，完全可以不使用它。

但需要注意的是，当使用用def关键字定义的方法而不是具体的具体类型时，有时候最后一个表达式会被返回。

因此，通常应该优先使用具体的返回类型，如void或具体的类型。在上面的例子中，如果我们忘记将m2作为最后一个语句返回，那么最后的表达式将是m2.c = 3，它将返回... 3，而不是你期望的map。

像if/else、try/catch这样的语句也可以返回一个值，因为在这些语句中有一个"最后的表达式"被评估：

```groovy
def foo(n) {
    if(n == 1) {
        "Roshan"
    } else {
        "Dawrani"
    }
}

assert foo(1) == "Roshan"
assert foo(2) == "Dawrani"
```

# 3. def和类型

在讨论def和类型时，我经常看到开发人员同时使用def和类型。

但是在这种情况下，def是多余的。所以要做出选择，要么使用def，要么使用类型。

因此，不要这样写：

```groovy
def String name = "Guillaume"
```

而是：

```groovy
String name = "Guillaume"
```

在Groovy中使用def时，实际上类型是Object（因此可以将任何对象赋给使用def定义的变量，并且如果方法声明返回def，则可以返回任何类型的对象）。

当定义一个具有无类型参数的方法时，可以使用def，但是并不需要，所以我们倾向于省略它们。

所以，不要写成：

```groovy
void doSomething(def param1, def param2) { }
```

而是写成：

```groovy
void doSomething(param1, param2) { }
```

但正如我们在文档的最后一节中提到的那样，最好为方法参数指定类型，以便帮助文档化代码，并帮助IDE进行代码补全，或者利用Groovy的静态类型检查或静态编译功能。

另一个应避免使用def的冗余场景是在定义构造函数时：

```groovy
class MyClass {
    def MyClass() {}
}
```

直接移除 def

```groovy
class MyClass {
    MyClass() {}
}
```

# 4. Public by default

默认情况下，Groovy将类和方法视为公共的（public）。

因此，你不必在每个公共的地方都使用public修饰符。

只有在不公共的情况下，才需要使用可见性修饰符。

所以，不必写成：

```groovy
public class Server {
    public String toString() { return "a server" }
}
```

而是:

```groovy
class Server {
    String toString() { "a server" }
}
```

你可能会对“包作用域”可见性感到困惑，Groovy允许省略“public”关键字意味着默认情况下不支持这种作用域，但实际上有一个特殊的Groovy注解可以让你使用这种可见性：

```groovy
class Server {
    @PackageScope Cluster cluster
}
```

# 5. Omitting parentheses

Groovy允许你在顶级表达式中省略括号，比如使用println命令时：

```groovy
println "Hello"
method a, b
```

vs

```groovy
println("Hello")
method(a, b)
```

当闭包是方法调用的最后一个参数时，比如使用Groovy的each{}迭代机制，你可以将闭包放在括号外面，甚至省略括号：

```groovy
list.each( { println it } )
list.each(){ println it }
list.each  { println it }
```

省略括号是更自然的方式，因为空的括号只是无用的语法噪音！总是更倾向于使用第三种形式。

在某些情况下，括号是必需的，例如进行嵌套方法调用或调用无参数的方法时。

```groovy
def foo(n) { n }
def bar() { 1 }

println foo 1 // won't work
def m = bar   // won't work
```

# 6. Classes as first-class citizens

在Groovy中，不需要使用`.class`后缀，有点像Java的`instanceof`一样。

例如：

```groovy
connection.doPost(BASE_URI + "/modify.hqu", params, ResourcesResponse.class)
```

使用下面要介绍的GStrings和使用一等公民（first class citizens）：

```groovy
connection.doPost("${BASE_URI}/modify.hqu", params, ResourcesResponse)
```

# 7. Getter & Setter

在Groovy中，getter和setter组成了我们所称的"属性"，并且提供了一种简化的方式来访问和设置这些属性。

所以，不必像Java那样调用getter和setter，可以使用类似字段访问的符号表示：

```groovy
resourceGroup.getResourcePrototype().getName() == SERVER_TYPE_NAME
resourceGroup.resourcePrototype.name == SERVER_TYPE_NAME

resourcePrototype.setName("something")
resourcePrototype.name = "something"
```

在Groovy中编写bean（通常称为POGOs - Plain Old Groovy Objects）时，你不需要手动创建字段和getter/setter，而是让Groovy编译器为你完成。

所以，不必写成：

```groovy
class Person {
    private String name
    String getName() { return name }
    void setName(String name) { this.name = name }
}
```

可以简化为：

```groovy
class Person {
    String name
}
```

正如你所看到的，一个没有修饰符可见性的独立的“field”实际上会让Groovy编译器为你生成一个私有字段以及对应的getter和setter方法。

当从Java中使用这样的POGO时，getter和setter方法是存在的，并且可以像往常一样使用。

尽管编译器会创建常规的getter/setter逻辑，但如果你希望在这些getter/setter方法中添加额外或不同的逻辑，你仍然可以自己提供它们，编译器将使用你提供的逻辑，而不是默认生成的逻辑。

```groovy
class Server {
    String name
    Cluster cluster
}
```

# 8. 使用命名参数和默认构造函数初始化Bean时，可以使用以下形式的Bean：

```groovy
class Server {
    String name
    Cluster cluster
}
```

如下：

```groovy
def server = new Server()
server.name = "Obelix"
server.cluster = aCluster
```

当使用默认构造函数时，你可以使用命名参数来初始化对象（首先调用构造函数，然后按照映射中指定的顺序调用setter方法）：

```groovy
class Person {
    String name
    int age
}

def person = new Person(name: "John", age: 25)
```

在这个例子中，我们使用命名参数来为`Person`对象提供属性的值。首先使用默认构造函数创建对象，然后根据命名参数的顺序依次调用setter方法来设置属性的值。

这种方式使代码更加清晰易读，并且可以灵活地指定属性的值，而不必依赖于构造函数参数的顺序。

# 9. Using with() and tap() for repeated operations on the same bean

使用`with()`和`tap()`方法可以在同一个对象上进行重复操作，避免反复重复使用对象名称。

## 9.1 with

`with()`方法允许你在代码块中省略对象名称，并直接访问对象的属性和方法。

在代码块内部，可以直接使用属性和方法，而无需使用对象名称进行前缀。

例如：

```groovy
def server = new Server()
with (server) {
    host = "example.com"
    port = 8080
    start()
}
```

在上面的例子中，我们使用`with()`方法创建了一个`Server`对象，并在代码块内部设置了对象的属性值和调用了对象的方法。

在代码块内部，我们可以直接使用`host`和`port`，而无需使用对象名称进行前缀。

## 9.2 tap

`tap()`方法允许你对一个对象进行链式操作，并返回该对象本身。这对于在同一个对象上执行一系列操作非常有用。

例如：
```groovy
def server = new Server().tap {
    host = "example.com"
    port = 8080
    start()
}
```

在上面的例子中，我们使用`tap()`方法创建了一个`Server`对象，并在闭包内部设置了对象的属性值和调用了对象的方法。

`tap()`方法返回的是对象本身，因此可以通过链式操作对同一个对象进行连续的操作。

使用`with()`和`tap()`方法可以使代码更加简洁和可读，特别适用于需要对同一个对象进行多次操作的场景。

# 10. Equals and ==

Java中的`==`在Groovy中实际上是`is()`方法的等价物，而Groovy的`==`是一个聪明的`equals()`方法！

如果要比较对象的引用而不是内容，请使用`a.is(b)`代替`==`。

但是，如果要进行常规的`equals()`比较，应该优先使用Groovy的`==`，因为它还能避免空指针异常，无论左边还是右边是否为null。

所以，不要写成：

```groovy
status != null && status.equals(ControlConstants.STATUS_COMPLETED)
```

而是：

```groovy
status == ControlConstants.STATUS_COMPLETED
```

# 11. GStrings (interpolation, multiline)

在Java中，我们经常使用字符串和变量拼接，需要使用大量的双引号、加号和\n字符来处理换行。

而使用插值字符串（称为GStrings），这样的字符串看起来更美观，输入起来也更方便：

```groovy
throw new Exception("Unable to convert resource: " + resource)
```

vs

```groovy
throw new Exception("Unable to convert resource: ${resource}")
```

在大括号内，您可以放置任何类型的表达式，而不仅仅是变量。

对于简单的变量或变量.属性，您甚至可以省略大括号：

```groovy
throw new Exception("Unable to convert resource: $resource")
```

您甚至可以使用带有 `${-> resource}` 的闭包符号来延迟评估这些表达式。

当 GString 被转换为 String 时，它将评估闭包并获取返回值的 toString() 表示。

示例:

```groovy
int i = 3

def s1 = "i's value is: ${i}"
def s2 = "i's value is: ${-> i}"

i++

assert s1 == "i's value is: 3" // eagerly evaluated, takes the value on creation
assert s2 == "i's value is: 4" // lazily evaluated, takes the new value into account
```

当使用 Java 中的长拼接时：

```java
throw new PluginException("Failed to execute command list-applications:" +
    " The group with name " +
    parameterMap.groupname[0] +
    " is not compatible group of type " +
    SERVER_TYPE_NAME)
```

可以使用 `\` 

```groovy
throw new PluginException("Failed to execute command list-applications: \
The group with name ${parameterMap.groupname[0]} \
is not compatible group of type ${SERVER_TYPE_NAME}")
```

or

```groovy
throw new PluginException("""Failed to execute command list-applications:
    The group with name ${parameterMap.groupname[0]}
    is not compatible group of type ${SERVER_TYPE_NAME)}""")
```

您还可以通过在该字符串上调用.stripIndent() 来去除多行字符串左侧的缩进。

还要注意 Groovy 中单引号和双引号之间的区别：单引号始终创建 Java 字符串，不会插入变量的值，而双引号在存在插入变量时可以创建 Java 字符串或 GString。

对于多行字符串，您可以使用三个引号：即三个双引号表示 GString，三个单引号表示普通字符串。

如果您需要编写正则表达式模式，应该使用 "slashy" 字符串表示法:

```groovy
assert "foooo/baaaaar" ==~ /fo+\/ba+r/
```

"slashy" 表示法的优点是您无需双重转义反斜杠，使得与正则表达式的处理更加简单。

最后但并非最不重要的是，当您需要字符串常量时，最好使用单引号字符串，并且在需要显式依赖字符串插值时使用双引号字符串。

# 12. Native syntax for data structures

Groovy为列表、映射、正则表达式或数值范围等数据结构提供了本地语法构造。

确保在您的Groovy程序中充分利用它们。

以下是一些本地语法构造的示例：

```groovy
def list = [1, 4, 6, 9]

// by default, keys are Strings, no need to quote them
// you can wrap keys with () like [(variableStateAcronym): stateName] to insert a variable or object as a key.
def map = [CA: 'California', MI: 'Michigan']

// ranges can be inclusive and exclusive
def range = 10..20 // inclusive
assert range.size() == 11
// use brackets if you need to call a method on a range definition
assert (10..<20).size() == 10 // exclusive

def pattern = ~/fo*/

// equivalent to add()
list << 5

// call contains()
assert 4 in list
assert 5 in list
assert 15 in range

// subscript notation
assert list[1] == 4

// add a new key value pair
map << [WA: 'Washington']
// subscript notation
assert map['CA'] == 'California'
// property notation
assert map.WA == 'Washington'

// matches() strings against patterns
assert 'foo' ==~ pattern
```

# 13. The Groovy Development Kit

The Groovy Development Kit（GDK）通过提供额外的方法来扩展Java的核心数据结构的功能。这些方法，比如each{}、find{}、findAll{}、every{}、collect{}和inject{}，为Groovy添加了函数式编程的特性，使得处理复杂算法更加容易。GDK提供了大量的方法，通过动态语言的特性，应用于各种类型。

你可以在Groovy网站上找到这些方法的全面列表，网址如下：

http://groovy-lang.org/gdk.html

GDK提供了对String、Files、Streams、Collections等类型的有用方法。

对于希望利用Groovy语言的强大和便利性的开发人员来说，GDK是一个宝贵的资源。

# 14. 强大的 switch

Groovy的switch语句比起类似C的语言更加强大，它可以接受几乎任何类型的值，而不仅仅局限于原始类型和类似的类型。

```groovy
def x = 1.23
def result = ""
switch (x) {
    case "foo": result = "found foo"
    // lets fall through
    case "bar": result += "bar"
    case [4, 5, 6, 'inList']:
        result = "list"
        break
    case 12..30:
        result = "range"
        break
    case Integer:
        result = "integer"
        break
    case Number:
        result = "number"
        break
    case { it > 3 }:
        result = "number > 3"
        break
    default: result = "default"
}
assert result == "number"
```

# 15. 导入别名

在Java中，如果使用了来自不同包的同名类，比如`java.util.List`和`java.awt.List`，你可以导入其中一个类，但必须使用完全限定的名称来引用另一个类。

此外，在代码中多次使用冗长的类名可能会增加代码的冗长度并降低代码的清晰度。

为了改善这种情况，Groovy提供了导入别名的功能：

```groovy
import java.util.List as UtilList
import java.awt.List as AwtList
import javax.swing.WindowConstants as WC

UtilList list1 = [WC.EXIT_ON_CLOSE]
assert list1.size() instanceof Integer
def list2 = new AwtList()
assert list2.size() instanceof java.awt.Dimension
```

如下：

```groovy
import static java.lang.Math.abs as mabs
assert mabs(-4) == 4
```

# 16. Groovy Truth

所有对象都可以被"强制转换"为布尔值：一切为null、void、等于零或为空的值被视为false，否则为true。

所以，可以简化为：

```groovy
if (name != null && name.length > 0) {}
```

直接：

```groovy
if (name) {}
```

对于集合等也是一样的。

因此，在使用while()、if()、三元运算符、Elvis运算符（见下文）等时，可以使用一些快捷方式。

甚至可以通过在类中添加一个boolean类型的asBoolean()方法来自定义Groovy的Truth行为！

# 17. Safe graph navigation

Groovy 支持一种变体的 . 运算符，用于安全地访问对象图。

在 Java 中，当你对一个深层次的节点感兴趣并且需要检查是否为 null 时，通常会写出复杂的 if 语句或嵌套的 if 语句，例如：

```groovy
if (order != null) {
    if (order.getCustomer() != null) {
        if (order.getCustomer().getAddress() != null) {
            System.out.println(order.getCustomer().getAddress());
        }
    }
}
```

使用 `?.` 安全解引用运算符，你可以简化这样的代码：

```groovy
println order?.customer?.address
```

在整个调用链中都会检查空值，如果任何元素为 null，就不会抛出 NullPointerException，而且如果有任何值为 null，结果将为 null。

# 18. Assert

为了检查参数、返回值等，您可以使用 assert 语句。

与 Java 的 assert 不同，assert 不需要被激活才能工作，因此 assert 总是会被检查。

```groovy
def check(String name) {
    // name non-null and non-empty according to Groovy Truth
    assert name
    // safe navigation + Groovy Truth to check
    assert name?.size() > 3
}
```

您还会注意到 Groovy 的 "Power Assert" 语句提供的漂亮输出，其中显示了每个子表达式的各个值的图形视图。

# 19. Elvis operator for default values

Elvis 运算符是一种特殊的三元运算符快捷方式，非常适合用于默认值。

我们经常需要编写类似以下的代码：

```groovy
def result = name != null ? name : "Unknown"
```

由于 Groovy 的 Truth 特性，可以简化为空检查，只需使用 'name' 即可。

为了更进一步，由于您最终返回的是 'name'，可以使用 Elvis 运算符来删除问号和冒号之间的内容，从而避免在这个三元表达式中重复使用 name。因此，上面的代码可以简化为：

```groovy
def result = name ?: "Unknown"
```

# 20. 捕获任意异常

如果您对在 try 块内抛出的异常类型并不关心，可以简单地捕获任意异常，而无需指定捕获的异常类型。

因此，可以将以下方式的异常捕获简化为：

```groovy
try {
    // ...
} catch (Exception t) {
    // something bad happens
}
```

如果想捕获任何异常：

```groovy
try {
    // ...
} catch (any) {
    // something bad happens
}
```

# 21. 可选类型的建议

我将在最后谈一下何时以及如何使用可选类型。Groovy 让您决定是否使用显式的强类型或者使用 def。

我有一个相对简单的经验法则：每当您编写的代码将作为公共 API 被其他人使用时，应始终优先使用强类型。

这有助于加强合约，避免可能的传递参数类型错误，提供更好的文档，并且帮助 IDE 进行代码补全。

每当代码仅供您个人使用时，例如私有方法，或者当 IDE 可以轻松推断类型时，您可以更自由地决定是否使用类型。

# 参考资料

chatGPT

https://groovy-lang.org/style-guide.html

* any list
{:toc}