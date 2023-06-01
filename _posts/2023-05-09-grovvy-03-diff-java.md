---
layout: post
title: grovvy-03-java 之间的区别
date:  2023-05-09 +0800
categories: [Lang]
tags: [grovvy, lang, sh]
published: true
---

# 与Java的区别

Groovy力图尽可能适合Java开发人员的使用习惯。

在设计Groovy时，我们努力遵循最少惊讶原则，特别是针对那些从Java背景转向学习Groovy的开发人员。

以下是Java和Groovy之间的主要区别：

# 1. 默认导入

以下所有的包和类都默认被导入，也就是说您无需使用显式的导入语句即可使用它们：

```
java.io.*

java.lang.*

java.math.BigDecimal

java.math.BigInteger

java.net.*

java.util.*

groovy.lang.*

groovy.util.*
```

# 2. 多方法（Multi-methods）

在Groovy中，将在运行时选择要调用的方法。这被称为运行时分派或多方法。这意味着方法的选择是基于运行时参数的类型。

而在Java中，则相反：方法的选择是在编译时根据声明的类型进行的。

以下代码作为Java代码编写，可以在Java和Groovy中都进行编译，但其行为将不同：

```java
int method(String arg) {
    return 1;
}
int method(Object arg) {
    return 2;
}
Object o = "Object";
int result = method(o);
```

java 中:

```java
assertEquals(2, result);
```

groovy 中:

```java
assertEquals(1, result);
```

这是因为Java使用静态信息类型，即将o声明为Object类型，而Groovy会在实际调用方法时在运行时选择。

由于方法是以String参数调用的，因此将调用String版本的方法。

# 3. 数组初始化器

在Java中，数组初始化器可以采用以下两种形式之一：

```java
int[] array = {1, 2, 3};             // Java array initializer shorthand syntax
int[] array2 = new int[] {4, 5, 6};  // Java array initializer long syntax
```

在Groovy中，`{ ... }` 块被保留用于闭包。

这意味着您不能使用Java的数组初始化器简写语法创建数组字面量。

相反，您可以借用Groovy的列表字面量表示法，如下所示：

```java
int[] array = [1, 2, 3]
```

Groovy 3+ 中，可以如下：

```java
def array2 = new int[] {1, 2, 3} // Groovy 3.0+ supports the Java-style array initialization long syntax
```

# 4. 包作用域可见性

在Groovy中，如果在字段上省略修饰符，不会像Java中那样生成包私有字段：

```groovy
class Person {
    String name
}
```

相反，它用于创建属性，也就是说，它会生成一个私有字段，一个关联的getter方法和一个关联的setter方法。

通过使用 `@PackageScope` 注解，可以创建一个包私有字段：

```groovy
class Person {
    @PackageScope String name
}
```

# 5. ARM 块

Java 7引入了ARM（自动资源管理）块（也称为try-with-resources）块，如下所示：

```java
Path file = Paths.get("/path/to/file");
Charset charset = Charset.forName("UTF-8");
try (BufferedReader reader = Files.newBufferedReader(file, charset)) {
    String line;
    while ((line = reader.readLine()) != null) {
        System.out.println(line);
    }

} catch (IOException e) {
    e.printStackTrace();
}
```

这样的块从Groovy 3+版本开始受支持。

然而，Groovy提供了各种依赖于闭包的方法，这些方法具有相同的效果，同时更符合惯用写法。

例如：

```groovy
new File('/path/to/file').eachLine('UTF-8') {
   println it
}
```

或者更加接近 java 的写法：

```groovy
new File('/path/to/file').withReader('UTF-8') { reader ->
   reader.eachLine {
       println it
   }
}
```

# 6. 内部类

匿名内部类和嵌套类的实现与Java密切相关，但也存在一些差异，例如，从这些类内部访问的局部变量不必是final的。

在生成内部类字节码时，我们利用了一些在groovy.lang.Closure中使用的实现细节。

## 6.1 静态内部类

以下是静态内部类的示例：

```java
class A {
    static class B {}
}

new A.B()
```

静态内部类是最受支持的一种使用方式。如果您确实需要内部类，应将其定义为静态内部类。

## 6.2. Anonymous Inner Classes

```groovy
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit

CountDownLatch called = new CountDownLatch(1)

Timer timer = new Timer()
timer.schedule(new TimerTask() {
    void run() {
        called.countDown()
    }
}, 0)

assert called.await(10, TimeUnit.SECONDS)
```

## 6.3. Creating Instances of Non-Static Inner Classes

In Java:

```java
public class Y {
    public class X {}
    public X foo() {
        return new X();
    }
    public static X createX(Y y) {
        return y.new X();
    }
}
```

在3.0.0之前，Groovy不支持`y.new X()`的语法。

相反，您需要编写`new X(y)`，如下面的代码所示：

```groovy
public class Y {
    public class X {}
    public X foo() {
        return new X()
    }
    public static X createX(Y y) {
        return new X(y)
    }
}
```

需要注意的是，Groovy支持在调用只有一个参数的方法时不传递参数。

此时，该参数的值将为null。对于调用构造函数，基本上也适用相同的规则。然而，存在一种危险，您可能会错误地编写`new X()`而不是`new X(this)`，例如。

由于这也可能是正常的用法，我们尚未找到一个好的方法来解决这个问题。

Groovy 3.0.0支持使用Java风格的语法来创建非静态内部类的实例。

# 7. Lambda expressions and the method reference operator

jdk8 支持 lambda `::`

```java
Runnable run = () -> System.out.println("Run");  // Java
list.forEach(System.out::println);
```

在Groovy 3及以上版本中，还支持使用Parrot解析器来实现这些功能。

在较早版本的Groovy中，您应该使用闭包来替代：

```groovy
Runnable run = { println 'run' }
list.each { println it } // or list.each(this.&println)
```

# 8.GStrings

由于双引号字符串字面量被解释为GString值，如果一个包含美元符号的字符串字面量的类使用Groovy和Java编译器进行编译，Groovy可能会导致编译错误或产生细微的不同代码。

通常情况下，Groovy会在API声明参数类型时自动进行GString和String之间的类型转换，但要注意接受Object参数然后检查实际类型的Java API。

# 9. 字符串和字符字面量

在Groovy中，单引号的字面量用于表示字符串，而双引号的字面量则根据字面量中是否存在插值来表示字符串或GString。

```groovy
assert 'c'.class == String
assert "c".class == String
assert "c${1}".class in GString
```

当将单个字符的字符串赋值给char类型的变量时，Groovy会自动将其转换为char类型。

但是，在调用参数类型为char的方法时，我们需要明确地进行类型转换，或者确保提前将值进行转换。

```groovy
char a = 'a'
assert Character.digit(a, 16) == 10: 'But Groovy does boxing'
assert Character.digit((char) 'a', 16) == 10

try {
  assert Character.digit('a', 16) == 10
  assert false: 'Need explicit cast'
} catch(MissingMethodException e) {
}
```

Groovy支持两种类型的类型转换，在将字符串转换为char类型时，对于多个字符的字符串，存在一些细微的差异。

Groovy风格的类型转换更加宽松，会取第一个字符，而C风格的类型转换会导致异常。

```groovy
// for single char strings, both are the same
assert ((char) "c").class == Character
assert ("c" as char).class == Character

// for multi char strings they are not
try {
  ((char) 'cx') == 'c'
  assert false: 'will fail - not castable'
} catch(GroovyCastException e) {
}
assert ('cx' as char) == 'c'
assert 'cx'.asType(char) == 'c'
```

# 10. "=="的行为

在Java中，"=="表示原始类型的相等性或对象的身份。

在Groovy中，"=="在所有情况下都表示相等性。

对于非原始类型，它会转换为a.compareTo(b) == 0，用于比较Comparable对象的相等性，否则使用a.equals(b)进行比较。

要检查身份（引用相等性），请使用is方法：a.is(b)。从

Groovy 3开始，您还可以使用"==="运算符（或其否定版本）：a === b（或c !== d）。

# 11. 原始类型和包装类

在一个纯面向对象的语言中，一切都应该是对象。

Java认为原始类型（如int、boolean和double）在使用频率上很高，并且值得特殊处理。

原始类型可以高效地存储和操作，但不能在所有可以使用对象的上下文中使用。

幸运的是，Java在将原始类型作为参数传递或作为返回类型使用时，会自动进行装箱和拆箱操作：

```java
public class Main {           // Java

   float f1 = 1.0f;
   Float f2 = 2.0f;

   float add(Float a1, float a2) { return a1 + a2; }

   Float calc() { return add(f1, f2); }   //add方法期望的是包装类型后跟原始类型的参数，但我们提供的参数是原始类型后跟包装类型。同样地，add方法的返回类型是原始类型，但我们需要包装类型。

    public static void main(String[] args) {
       Float calcResult = new Main().calc();
       System.out.println(calcResult); // => 3.0
    }
}
```

groovy 也是一样：

```groovy
class Main {

    float f1 = 1.0f
    Float f2 = 2.0f

    float add(Float a1, float a2) { a1 + a2 }

    Float calc() { add(f1, f2) }
}

assert new Main().calc() == 3.0
```

Groovy也支持原始类型和对象类型，然而，它在追求面向对象的纯洁性方面更进一步；它努力将一切都视为对象处理。

任何原始类型的变量或字段都可以像对象一样处理，并在需要时进行自动封装。

尽管原始类型可能在底层使用，但在可能的情况下，它们的使用应该与普通对象的使用无异，并且会根据需要进行装箱和拆箱。

这里有一个小例子，使用Java尝试（对于Java而言是不正确的）解引用一个原始的float类型：

```java
public class Main {           // Java

    public float z1 = 0.0f;

    public static void main(String[] args){
      new Main().z1.equals(1.0f); // DOESN'T COMPILE, error: float cannot be dereferenced
    }
}
```

不过 groovy 是支持的：

```groovy
class Main {
    float z1 = 0.0f
}
assert !(new Main().z1.equals(1.0f))
```

由于Groovy在装箱和拆箱方面的额外使用，它不遵循Java中宽化操作优先于装箱的行为。以下是使用int的例子：

```groovy
int i
m(i)

void m(long l) {           //这是Java会调用的方法，因为在Java中，宽化操作优先于拆箱操作。
    println "in m(long)"
}

void m(Integer i) {        //这是Groovy实际调用的方法，因为所有原始类型的引用都使用它们的包装类。
    println "in m(Integer)"
}
```

## 11.1. 使用@CompileStatic进行数值原始类型优化

由于Groovy在更多地方进行了转换为包装类的操作，您可能会想知道它是否会为数值表达式生成较低效的字节码。

Groovy拥有一套高度优化的类来进行数学计算。

当使用 `@CompileStatic` 时，仅涉及原始类型的表达式将使用与Java相同的字节码。

## 11.2. 正零/负零边界情况

Java对于原始类型和包装类的float/double操作遵循IEEE 754标准，但涉及正零和负零的一个有趣的边界情况。

该标准支持区分这两种情况，尽管在许多场景中程序员可能不关心差异，但在某些数学或数据科学场景中，考虑到区别是很重要的。

对于原始类型，Java在比较这些值时映射到特殊的字节码指令，其特性是“正零和负零被认为是相等的”。

```
jshell> float f1 = 0.0f
f1 ==> 0.0

jshell> float f2 = -0.0f
f2 ==> -0.0

jshell> f1 == f2
$3 ==> true
```

当然，如果 java 中使用对象，结果就是 false

```
jshell> Float f1 = 0.0f
f1 ==> 0.0

jshell> Float f2 = -0.0f
f2 ==> -0.0

jshell> f1.equals(f2)
$3 ==> false
```

在一方面，Groovy试图紧密遵循Java的行为，但在另一方面，它在更多的地方自动在原始类型和包装类型之间切换。为了避免混淆，我们推荐以下准则：

如果您希望区分正零和负零，请直接使用equals方法或在使用 `==` 之前将任何原始类型转换为其包装类型的等效类型。

如果您希望忽略正零和负零之间的差异，请直接使用equalsIgnoreZeroSign方法或在使用==之前将任何非原始类型转换为其等效的原始类型。

以下示例演示了这些准则的用法：

```groovy
float f1 = 0.0f
float f2 = -0.0f
Float f3 = 0.0f
Float f4 = -0.0f

assert f1 == f2
assert (Float) f1 != (Float) f2

assert f3 != f4         
assert (float) f3 == (float) f4

assert !f1.equals(f2)
assert !f3.equals(f4)

assert f1.equalsIgnoreZeroSign(f2)
assert f3.equalsIgnoreZeroSign(f4)
```

# 12. 转换

Java可以进行自动的扩展和缩小转换。

在Java中，当将较窄类型的值赋给较宽类型的变量时，会自动进行扩展转换。例如：

```java
int num = 10;
double result = num;
```

Java还支持缩小转换，但需要进行显式的类型转换。在将较宽类型的值赋给较窄类型的变量时，需要进行显式的转换。例如：

```java
double num = 3.14;
int result = (int) num;
```

需要注意类型转换，并在必要时使用显式的类型转换，以确保正确的数据处理，并避免出现意外行为。

## 给出Java可以进行自动的扩展和缩小转换类型表格

以下是Java中可以进行自动扩展和缩小转换的类型表格：

```
+-------------------+-------------------------+-------------------------+
|   源类型 (Source)  |     目标类型 (Target)    |      转换类型 (Conversion Type)      |
+-------------------+-------------------------+-------------------------+
| byte              | short                   | 扩展转换 (Widening)                |
| byte              | int                     | 扩展转换 (Widening)                |
| byte              | long                    | 扩展转换 (Widening)                |
| byte              | float                   | 扩展转换 (Widening)                |
| byte              | double                  | 扩展转换 (Widening)                |
| short             | int                     | 扩展转换 (Widening)                |
| short             | long                    | 扩展转换 (Widening)                |
| short             | float                   | 扩展转换 (Widening)                |
| short             | double                  | 扩展转换 (Widening)                |
| int               | long                    | 扩展转换 (Widening)                |
| int               | float                   | 扩展转换 (Widening)                |
| int               | double                  | 扩展转换 (Widening)                |
| long              | float                   | 扩展转换 (Widening)                |
| long              | double                  | 扩展转换 (Widening)                |
| float             | double                  | 扩展转换 (Widening)                |
| char              | int                     | 扩展转换 (Widening)                |
| char              | long                    | 扩展转换 (Widening)                |
| char              | float                   | 扩展转换 (Widening)                |
| char              | double                  | 扩展转换 (Widening)                |
| int               | byte                    | 缩小转换 (Narrowing)               |
| long              | byte                    | 缩小转换 (Narrowing)               |
| float             | byte                    | 缩小转换 (Narrowing)               |
| double            | byte                    | 缩小转换 (Narrowing)               |
| int               | short                   | 缩小转换 (Narrowing)               |
| long              | short                   | 缩小转换 (Narrowing)               |
| float             | short                   | 缩小转换 (Narrowing)               |
| double            | short                   | 缩小转换 (Narrowing)               |
| long              | int                     | 缩小转换 (Narrowing)               |
| float             | int                     | 缩小转换 (Narrowing)               |
| double            | int                     | 缩小转换 (Narrowing)               |
| float             | long                    | 缩小转换 (Narrowing)               |
| double            | long                    | 缩小转换 (Narrowing)               |
| double            | float                   | 缩小转换 (Narrowing)               |
+-------------------+-------------------------+-------------------------+
```

请注意，此表格只显示了Java中的一些常见的自动扩展和缩小转换。在实际编程中，还可能存在其他类型转换的情况。此外

此外，Java还支持其他类型之间的自动转换，例如布尔类型与整数类型之间的转换，以及字符类型与整数类型之间的转换。这些转换也属于自动扩展和缩小转换的范畴。

以下是一些额外的自动转换示例：

- 布尔类型（boolean）可以自动转换为整数类型（int）：true 转换为 1，false 转换为 0。
- 字符类型（char）可以自动转换为整数类型（int）：使用字符的Unicode码值作为转换结果。

需要注意的是，自动转换可能会导致数据丢失或精度损失。在进行自动转换时，应谨慎考虑数据类型的范围和精度要求，以确保正确的结果。

此外，还可以通过显式的类型转换（即使用强制类型转换操作符）进行更特定的类型转换，但在进行显式类型转换时，应注意类型的兼容性和数据的有效范围，以避免错误或数据损失。

## groovy 自动的扩展和缩小转换类型表格

在Groovy中，自动的扩展和缩小转换类型如下所示：

```
+-------------------+-------------------------+-------------------------+
|   源类型 (Source)  |     目标类型 (Target)    |      转换类型 (Conversion Type)      |
+-------------------+-------------------------+-------------------------+
| byte              | short                   | 扩展转换 (Widening)                |
| byte              | int                     | 扩展转换 (Widening)                |
| byte              | long                    | 扩展转换 (Widening)                |
| byte              | float                   | 扩展转换 (Widening)                |
| byte              | double                  | 扩展转换 (Widening)                |
| short             | int                     | 扩展转换 (Widening)                |
| short             | long                    | 扩展转换 (Widening)                |
| short             | float                   | 扩展转换 (Widening)                |
| short             | double                  | 扩展转换 (Widening)                |
| int               | long                    | 扩展转换 (Widening)                |
| int               | float                   | 扩展转换 (Widening)                |
| int               | double                  | 扩展转换 (Widening)                |
| long              | float                   | 扩展转换 (Widening)                |
| long              | double                  | 扩展转换 (Widening)                |
| float             | double                  | 扩展转换 (Widening)                |
| char              | int                     | 扩展转换 (Widening)                |
| char              | long                    | 扩展转换 (Widening)                |
| char              | float                   | 扩展转换 (Widening)                |
| char              | double                  | 扩展转换 (Widening)                |
| int               | byte                    | 缩小转换 (Narrowing)               |
| long              | byte                    | 缩小转换 (Narrowing)               |
| float             | byte                    | 缩小转换 (Narrowing)               |
| double            | byte                    | 缩小转换 (Narrowing)               |
| int               | short                   | 缩小转换 (Narrowing)               |
| long              | short                   | 缩小转换 (Narrowing)               |
| float             | short                   | 缩小转换 (Narrowing)               |
| double            | short                   | 缩小转换 (Narrowing)               |
| long              | int                     | 缩小转换 (Narrowing)               |
| float             | int                     | 缩小转换 (Narrowing)               |
| double            | int                     | 缩小转换 (Narrowing)               |
| float             | long                    | 缩小转换 (Narrowing)               |
| double            | long                    | 缩小转换 (Narrowing)               |
| double            | float                   | 缩小转换 (Narrowing)               |
+-------------------+-------------------------+-------------------------+
```

与Java中的自动类型转换类似，Groovy也支持这些常见的自动扩展和缩小转换。

需要注意的是，在进行转换时，也应考虑数据范围和精度的要求，以确保正确的结果。

此外，还应注意在进行缩小转换时可能会导致数据丢失或精度损失的情况。

# 13. 额外的关键词

除了与Java共享的关键字外，Groovy还具有以下额外的关键字：

- def：用于动态类型和变量声明。它允许在不显式指定类型的情况下声明变量。
- as：用于类型转换或强制转换。它允许将对象从一种类型转换为另一种类型。
- in：用于循环结构（如for循环和each循环），以便遍历集合或范围的元素。
- each：用于遍历集合或范围。它提供了一种简洁的语法，可以在不需要显式索引变量的情况下遍历元素。
- with：用于创建临时作用域，在该作用域中可以直接访问对象的属性和方法，而无需使用对象名称限定。
- mixin：用于在运行时向类中添加行为，通过混入其他类的方法实现。
- trait：用于定义可重用的行为，可以组合到类中。Trait可以为方法提供默认实现，并可以使用“implements”关键字将其混入到类中。

这些Groovy中的额外关键字相对于Java提供了额外的灵活性和功能。它们使Groovy程序能够以简洁和富有表达力的编码风格进行编写。

# 小结

不同的语言存在一定的差异，差异处就是对于设计的平衡的不同理解。

# 参考资料

chatGPT

https://groovy-lang.org/differences.html

* any list
{:toc}