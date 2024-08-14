---
layout: post
title: Janino：轻量级且高效的Java编译器-01-overview 
date: 2024-08-05 21:01:55 +0800
categories: [Java]
tags: [java, open-source, tool, sh]
published: true
---

# 标题：**Janino：轻量级且高效的Java编译器**

Janino 是一个超小型、超快速的Java编译器。

Janino 不仅能像JAVAC一样将一组源文件编译成一组类文件，而且还能编译一个Java表达式、一个代码块、一个类体、一个.java文件或一组.java文件在内存中，加载字节码并在运行中的JVM中直接执行。

```
<integration>
  <commons-jci>Apache Commons JCI ("Java Compiler Interface")</commons-jci>
  <jboss-rules>JBoss Rules / Drools</jboss-rules>
</integration>
```

Janino 还可以用于静态代码分析或代码操作。


# **快速入门指南**

## 简介：

这是关于什么的？查看这个PDF演示文稿以快速开始。（请注意，一些信息已经过时，例如对CODEHAUS的引用，它在2015年的某个时候已经不存在了。）

## 属性：

主要设计目标是在保持编译器小巧简单的前提下，提供一个（几乎）完整的Java编译器。

以下是Java编程语言实现的元素（或注明部分实现的）：

Java 1.4语言特性：
- 包声明，导入声明
- 类声明
- 接口声明
- 继承（扩展和实现）
- 静态成员类型声明
- 内部类声明（非静态成员、局部、匿名）
- 类初始化器，实例初始化器
- 字段声明，方法声明
- 局部变量声明
- 类变量初始化器，实例变量初始化器
- 块语句（{...}）
- if ... else 语句
- 基本的for循环
- while循环
- do ... while循环
- try ... catch ... finally 语句
- 抛出语句
- 返回语句
- 断点语句
- 继续语句
- switch语句
- 同步语句
- 所有基本类型（布尔，字符，字节，短整型，整型，长整型，浮点型，双精度浮点型）
- 赋值运算符 =
- 复合赋值运算符 +=, -=, *=, /=, &=, |=, ^=, %=, <<=, >>=, >>>=
- 条件运算符 ? ... :, &&, ||
- 布尔逻辑运算符 &, ^, |
- 整型位运算符 &, ^, |
- 数值运算符 *, /, %, +, -, <<, >>, >>
- 字符串连接运算符 +
- 运算符 ++ 和 --
- 类型比较运算符 instanceof
- 一元运算符 +, -, ~, !
- 括号表达式
- 字段访问（如 System.out）
- 超类成员访问（super.meth(), super.field）
- this（当前实例的引用）
- 调用其他构造器（this(a, b, c);）
- 超类构造器调用（super(a, b, c);）
- 方法调用（System.out.println("Hello")）
- 类实例创建（new Foo()）
- 原始数组创建（new int[10][5][])
- 类或接口数组创建（new Foo[10][5][])
- 数组访问（args[0]）
- 局部变量访问
- 整数字面量（十进制，十六进制和八进制）
- 浮点字面量（十进制）
- 布尔，字符，字符串字面量
- null字面量
- 数值转换：一元，二元，扩展，缩小
- 引用转换：扩展，缩小
- 赋值转换
- 字符串转换（用于字符串连接）
- 强制类型转换
- 常量表达式
- 块作用域，方法作用域，类作用域，全局作用域
- 抛出子句
- 数组初始化器（String[] a = { "x", "y", "z" }）
- 原始类字面量（int.class）
- 非原始类字面量（String.class）
- 未编译编译单元之间的引用
- 行号表（"-g:lines"）
- 源文件信息（"-g:source"）
- 局部变量信息（"-g:vars"）
- 处理@deprecated文档注释标签
- 可访问性检查（public, protected, private, 默认）
- "确定赋值"检查
- 编译成超过32KB的方法
- assert（部分实现 - 断言始终启用，就像JVM以"-ea"命令行选项启动一样）
- 用于字符串连接的StringBuilder类

Java 5语言特性：
- 参数化类型声明
- 类型参数（例如 List<String>）：已解析，但其他方面被忽略。最显著的限制是，您必须从方法调用中强制转换返回值，例如 "(String) myMap.get(key)"

Java 7语言特性：
- 二进制整数字面量（JLS7 3.10.1）
- 数值字面量中的下划线（JLS7 3.10.1）
- 字符串switch语句（JLS7 14.11）
- try-with-resources语句（JLS7 14.20.3）
- 捕获和重新抛出多个异常类型：部分实现；已解析和未解析，但不可编译
- 泛型实例创建的类型推断（即“菱形运算符”）（JLS11 15.9.1）

Java 8语言特性：
- Lambda表达式：部分实现；已解析和未解析，但不可编译
- 方法引用：部分实现；已解析和未解析，但不可编译
- 默认方法
- 静态接口方法

Java 9语言特性：
- 私有接口方法
- 增强的try-with-resources语句，允许VariableAccesses作为资源（JLS9 14.20.3）

Java 10语言特性：
- 局部变量类型推断：部分实现；已解析和未解析，但不可编译

Java 11语言特性：
- Lambda参数类型推断：部分实现；已解析和未解析，但不可编译

Java 15语言特性：
- 文本块

即使JANINO在旧版本的JRE上运行，它也支持所有这些语言特性！


# Java编程语言未实现或部分实现的特性

以下是Java编程语言未实现（或注明部分实现）的元素：

Java 1.4语言特性：
- assert：部分实现 - 断言始终启用，就像JVM是以"-ea"命令行选项启动的一样。

Java 5语言特性：
- 类型参数：已解析，但其他方面被忽略。最显著的限制是，您必须从方法调用中强制转换返回值，例如 "(String) myMap.get(key)"。

Java 7语言特性：
- 捕获并重新抛出多个异常类型：部分实现；已解析和未解析，但不可编译。
- 泛型实例创建的类型推断（例如 `Map<String, Integer> map = new HashMap<>();`）。

Java 8语言特性：
- Lambda表达式：部分实现；已解析和未解析，但不可编译。
- 方法引用：部分实现；已解析和未解析，但不可编译。
- 重复注解。
- 类型注解。

Java 9语言特性：
- 内部类使用的菱形运算符。
- 模块：部分实现；模块化编译单元已解析和未解析，但不可编译。

Java 10语言特性：
- 局部变量类型推断：部分实现；已解析和未解析，但不可编译。

Java 11语言特性：
- Lambda参数类型推断：部分实现；已解析和未解析，但不可编译。

许可：
- JANINO在新BSD许可证下可用。

# 下载

- 包
  如果您使用MAVEN，请在您的POM文件中添加此条目：

```xml
<!-- MAVEN依赖配置示例 -->
<dependency>
  <groupId>org.codehaus.janino</groupId>
  <artifactId>janino</artifactId>
  <version>版本号</version>
</dependency>
```

请注意，上面的`版本号`应替换为实际使用的Janino库的版本号。

## 入门例子

```java
ExpressionEvaluator ee = new ExpressionEvaluator();
ee.cook("3 + 4");
System.out.println(ee.evaluate()); // Prints "7".
```


# 基础示例：Janino 作为表达式求值器

Janino作为一个表达式求值器：

假设你正在构建一个电子商务系统，该系统计算用户放入购物车中的商品的运费。由于你在实现时不知道商家的运费计算模型，你可以实现一组你能想到的运费计算模型（固定收费、按重量、按商品数量等），并在运行时选择其中之一。

实际上，你会发现你实现的运费计算模型很少会符合商家的要求，所以你必须添加自定义模型，这些模型是特定于商家的。如果商家的模型稍后有变化，你必须更改你的代码，重新编译并重新分发你的软件。

因为这种方式非常不灵活，运费表达式应在运行时指定，而不是在编译时。这意味着表达式必须在运行时扫描、解析和评估，这就是为什么你需要一个表达式求值器。

一个简单的表达式求值器会解析一个表达式并创建一个“语法树”。例如，表达式 "a + b * c" 将编译成一个“求和”对象，其第一个操作数是参数 "a"，第二个操作数是一个“乘积”对象，其操作数是参数 "b" 和 "c"。这样的语法树可以相对快速地评估。然而，运行时性能大约比直接由JVM执行的“本地”Java代码低100倍。这限制了这种表达式求值器在简单应用程序中的使用。

此外，你可能不仅想要进行简单的算术运算，如 "a + b * c % d"，而且可能想要进一步发展这个概念，拥有一个真正的“脚本”语言，这增加了你的应用程序的灵活性。由于你已经知道Java编程语言，你可能想要一个与Java编程语言语法类似的语言。

所有这些考虑都导致了在运行时编译Java代码，就像一些引擎（例如JSP引擎）已经做的那样。然而，使用ORACLE的JDK编译Java程序是一个相对资源密集型的过程（磁盘访问，CPU时间等）。这就是Janino发挥作用的地方……一个轻量级，“嵌入式”Java编译器，它在内存中编译简单程序到JVM字节码，这些字节码在运行程序的JVM中执行。

好的，现在你好奇了……这就是你如何使用ExpressionEvaluator的方式：（接下来的内容应该是具体的使用示例，但原文中并未给出具体的代码或步骤，所以这里无法继续翻译。如果需要进一步的示例代码或步骤，请提供详细信息。）

```java
package foo;
 
import java.lang.reflect.InvocationTargetException;
 
import org.codehaus.commons.compiler.CompileException;
import org.codehaus.janino.ExpressionEvaluator;
 
public class Main {
 
    public static void
    main(String[] args) throws CompileException, InvocationTargetException {
 
        // Now here's where the story begins...
        ExpressionEvaluator ee = new ExpressionEvaluator();
 
        // The expression will have two "int" parameters: "a" and "b".
        ee.setParameters(new String[] { "a", "b" }, new Class[] { int.class, int.class });
 
        // And the expression (i.e. "result") type is also "int".
        ee.setExpressionType(int.class);
 
        // And now we "cook" (scan, parse, compile and load) the fabulous expression.
        ee.cook("a + b");
 
        // Eventually we evaluate the expression - and that goes super-fast.
        int result = (Integer) ee.evaluate(new Object[] { 19, 23 });
        System.out.println(result);
    }
}
```

注意：如果你传递一个字符串字面量作为表达式，一定要转义所有的 Java 特殊字符，特别是反斜杠。

在我的机器上（2 GHz P4），编译表达式需要 670 微秒，而评估表达式仅需 0.35 微秒（大约比编译快 2000 倍）。

有一个示例程序 "ExpressionDemo" 你可以用来试验 ExpressionEvaluator，或者你可以研究 ExpressionDemo 的源代码来了解 ExpressionEvaluator 的 API。

```
$ java -cp janino.jar:commons-compiler.jar \
> org.codehaus.commons.compiler.samples.ExpressionDemo \
> -help
Usage:
  ExpressionDemo { <option> } <expression> { <parameter-value> }
Compiles and evaluates the given expression and prints its value.
Valid options are
 -et <expression-type>                        (default: any)
 -pn <comma-separated-parameter-names>        (default: none)
 -pt <comma-separated-parameter-types>        (default: none)
 -te <comma-separated-thrown-exception-types> (default: none)
 -di <comma-separated-default-imports>        (default: none)
 -help
The number of parameter names, types and values must be identical.
$ java -cp janino.jar:commons-compiler.jar \
> org.codehaus.commons.compiler.samples.ExpressionDemo \
> -et double \
> -pn x \
> -pt double \
> "Math.sqrt(x)" \
> 99
Result = 9.9498743710662
$
```

# Janino 作为脚本评估器

类似于表达式评估器，ScriptEvaluator API 存在于编译和处理 Java "块"（即方法体）中。

如果定义了一个非 "void" 的返回值，那么该块必须返回该类型的值。

作为一个特殊功能，它允许声明方法。方法声明的位置和顺序无关紧要。

示例：

```java
package foo;
 
import java.lang.reflect.InvocationTargetException;
 
import org.codehaus.commons.compiler.CompileException;
import org.codehaus.janino.ScriptEvaluator;
 
public class Main {
 
    public static void
    main(String[] args) throws CompileException, NumberFormatException, InvocationTargetException {
 
        ScriptEvaluator se = new ScriptEvaluator();
 
        se.cook(
            ""
            + "static void method1() {\n"
            + "    System.out.println(1);\n"
            + "}\n"
            + "\n"
            + "method1();\n"
            + "method2();\n"
            + "\n"
            + "static void method2() {\n"
            + "    System.out.println(2);\n"
            + "}\n"
        );
 
        se.evaluate();
    }
}
```


# Janino 作为类体评估器

类似于表达式评估器和脚本评估器，ClassBodyEvaluator 用于编译和处理 Java 类体，即一系列方法和变量声明。

如果你规定类体应该定义一个名为 "main()" 的方法，那么你的脚本将几乎像一个 "C" 程序一样：

```java
public static void
main(String[] args) {
    System.out.println(java.util.Arrays.asList(args));
}
```

“ClassBodyDemo” 程序（源代码）演示了这一点：

```
$ java -cp janino.jar:commons-compiler.jar \
> org.codehaus.commons.compiler.samples.ClassBodyDemo -help
Usage:
  ClassBodyDemo <class-body> { <argument> }
  ClassBodyDemo -help
If <class-body> starts with a '@', then the class body is read
from the named file.
The <class-body> must declare a method "public static void main(String[])"
to which the <argument>s are passed. If the return type of that method is
not VOID, then the returned value is printed to STDOUT.
$ java -cp janino.jar:commons-compiler.jar \
> org.codehaus.commons.compiler.samples.ClassBodyDemo '
> public static void
> main(String[] args) {
>     System.out.println(java.util.Arrays.asList(args));
> }' \
> a b c
[a, b, c]
$
```

# Janino 作为简单编译器

SimpleCompiler 编译单个 .java 文件（“编译单元”）。

与常规的 Java 编译不同，该编译单元可以声明多个公共类型。

示例：

```java
// This is file "Hello.java", but it could have any name.
 
public
class Foo {
 
    public static void
    main(String[] args) {
        new Bar().meth();
    }
}
 
public
class Bar {
 
    public void
    meth() {
        System.out.println("HELLO!");
    }
}
```

它返回一个 ClassLoader，你可以从中获取已编译的类。

要运行此程序，请输入：

```
$ java -cp janino.jar:commons-compiler.jar \
> org.codehaus.janino.SimpleCompiler -help
Usage:
    org.codehaus.janino.SimpleCompiler <source-file> <class-name> { <argument> }
Reads a compilation unit from the given <source-file> and invokes method
"public static void main(String[])" of class <class-name>, passing the
given <argument>s.
$ java -cp janino.jar:commons-compiler.jar \
> org.codehaus.janino.SimpleCompiler \
> Hello.java Foo
HELLO!
$
```

# Janino 作为编译器

Compiler 编译一组 .java 文件（“编译单元”），并生成 .class 文件。

每个编译单元可以声明不同的包，且这些编译单元可以相互引用，甚至可以循环引用。

示例：

```java
ICompiler compiler = compilerFactory.newCompiler();
 
compiler.compile(new File("pkg1/A.java"), new File("pkg2/B.java"));
```

然而，Compiler 可以重新配置，以从不同的源读取编译单元，和/或将类存储在不同的位置，例如存储到一个 Map 中，然后通过 ClassLoader 将其加载到虚拟机中：

```java
ICompiler compiler = compilerFactory.newCompiler();
 
// Store generated .class files in a Map:
Map<String, byte[]> classes = new HashMap<String, byte[]>();
compiler.setClassFileCreator(new MapResourceCreator(classes));
 
// Now compile two units from strings:
compiler.compile(new Resource[] {
    new StringResource(
        "pkg1/A.java",
        "package pkg1; public class A { public static int meth() { return pkg2.B.meth(); } }"
    ),
    new StringResource(
        "pkg2/B.java",
        "package pkg2; public class B { public static int meth() { return 77;            } }"
    ),
});
 
// Set up a class loader that uses the generated classes.
ClassLoader cl = new ResourceFinderClassLoader(
    new MapResourceFinder(classes),    // resourceFinder
    ClassLoader.getSystemClassLoader() // parent
);
 
Assert.assertEquals(77, cl.loadClass("pkg1.A").getDeclaredMethod("meth").invoke(null));
```

# 高级示例

Janino 作为源代码类加载器

JavaSourceClassLoader 扩展了 Java 的 java.lang.ClassLoader 类，具有直接从源代码加载类的功能。

具体来说，如果通过这个类加载器加载一个类，它会在给定的“源路径”中的任何目录中搜索匹配的 ".java" 文件，读取、扫描、解析并编译它，并在 JVM 中定义生成的类。必要时，更多的类将通过父类加载器和/或源路径加载。

文件系统中不会创建任何中间文件。

示例：

```java
// srcdir/pkg1/A.java
 
package pkg1;
 
import pkg2.*;
 
public class A extends B {
}
```

```java
// srcdir/pkg2/B.java
 
package pkg2;
 
public class B implements Runnable {
    public void run() {
        System.out.println("HELLO");
    }
}
```

```java
// Sample code that reads, scans, parses, compiles and loads
// "A.java" and "B.java", then instantiates an object of class
// "A" and invokes its "run()" method.
ClassLoader cl = new JavaSourceClassLoader(
    this.getClass().getClassLoader(),  // parentClassLoader
    new File[] { new File("srcdir") }, // optionalSourcePath
    (String) null,                     // optionalCharacterEncoding
    DebuggingInformation.NONE          // debuggingInformation
);
 
// Load class A from "srcdir/pkg1/A.java", and also its superclass
// B from "srcdir/pkg2/B.java":
Object o = cl.loadClass("pkg1.A").newInstance();
 
// Class "B" implements "Runnable", so we can cast "o" to
// "Runnable".
((Runnable) o).run(); // Prints "HELLO" to "System.out".
```

如果 Java 源代码不在文件中，而是在其他存储（如数据库、主内存等）中，你可以指定一个自定义的 ResourceFinder，而不是基于目录的源路径。

如果你有许多源文件，并且想要减少编译时间，可以使用 CachingJavaSourceClassLoader，它利用应用程序提供的缓存来存储类文件以便重复使用。

# jsh - Java shell

JANINO 有一个姊妹项目 "jsh"，它实现了一个类似于 "bash"、"ksh"、"csh" 等的 "shell" 程序，但使用 Java 语法。

# Janino 作为命令行 Java 编译器

Compiler 类模仿了 ORACLE 的 javac 工具的行为。它将一组“编译单元”（即 Java 源文件）编译成一组类文件。

使用 "-warn" 选项，Janino 会发出一些可能非常有趣的警告，这些警告可能帮助你“清理”源代码。

BASH 脚本 "bin/janinoc" 实现了一个 ORACLE 的 JAVAC 工具的替代品：

```
$ janinoc -sourcepath src -d classes src/com/acme/MyClass.java
$ janinoc -help
A drop-in replacement for the JAVAC compiler, see the documentation for JAVAC
Usage:
 
  java java.lang.Compiler [ <option> ] ... <source-file> ...
 
Supported <option>s are:
  -d <output-dir>           Where to save class files
  -sourcepath <dirlist>     Where to look for other source files
  -classpath <dirlist>      Where to look for other class files
  -extdirs <dirlist>        Where to look for other class files
  -bootclasspath <dirlist>  Where to look for other class files
  -encoding <encoding>      Encoding of source files, e.g. "UTF-8" or "ISO-8859-1"
  -verbose
  -g                        Generate all debugging info
  -g:none                   Generate no debugging info (the default)
  -g:{source,lines,vars}    Generate only some debugging info
  -rebuild                  Compile all source files, even if the class files
                            seem up-to-date
  -help
 
The default encoding in this environment is "UTF-8".
$
```

# Janino 作为 ANT 编译器

你可以通过 `AntCompilerAdapter` 类将 Janino 插入到 ANT 工具中。

只需确保 `janino.jar` 在类路径中，然后使用以下命令行选项运行 ANT：

```bash
-Dbuild.compiler=org.codehaus.janino.AntCompilerAdapter
```

# Janino 作为 TOMCAT 编译器

如果你想在 TOMCAT 中使用 Janino，只需将 `janino.jar` 文件复制到 TOMCAT 的 `common/lib` 目录中，然后在 TOMCAT 的 `conf/web.xml` 文件中的 JSP servlet 定义部分添加以下初始化参数段：

```xml
<init-param>
    <param-name>compiler</param-name>
    <param-value>org.codehaus.janino.AntCompilerAdapter</param-value>
</init-param>
```

# Janino 作为代码分析器  

除了编译 Java 代码之外，Janino 还可以用于静态代码分析：

基于解析器生成的 AST（“抽象语法树”），遍历器会遍历 AST 的所有节点，派生类可以对它们进行各种分析，例如计算声明数量：

```bash
$ java org.codehaus.janino.samples.DeclarationCounter DeclarationCounter.java
Class declarations:     1
Interface declarations: 0
Fields:                 4
Local variables:        4
$
```

这就是所有这些精巧的代码度量和样式检查的基础。

# Janino 作为代码操控器  

如果你想将一个 Java 编译单元读入内存，对其进行操控，然后将其写回文件以进行编译，只需执行以下步骤：

```java
// 从 Reader "r" 中读取编译单元到内存中。
Java.CompilationUnit cu = new Parser(new Scanner(fileName, r)).parseCompilationUnit();
 
// 在内存中操控 AST。
// ...
 
// 将 AST 转换回文本。
UnparseVisitor.unparse(cu, new OutputStreamWriter(System.out));
```

`AstTest.testMoveLocalVariablesToFields()` 测试用例演示了如何操控 AST。

# 替代编译器实现

Janino 可以配置为使用其他 Java 编译器实现，而不是其自身的编译器。这些替代实现基本上需要实现 `ICompilerFactory` 接口。其中一个替代实现基于 `javax.tools` API，并作为 Janino 发行版的一部分提供：`commons-compiler-jdk.jar`。

基本上有两种方式可以切换实现：

1. 使用 `org.codehaus.commons.compiler.jdk.ExpressionEvaluator` 及其相关类，而不是 `org.codehaus.janino.ExpressionEvaluator`；在编译时和运行时的类路径中使用 `commons-compiler-jdk.jar` 代替 `janino.jar`。（`commons-compiler.jar` 必须始终在类路径中，因为它包含所有实现所需的基本类。）

2. 使用 `org.codehaus.commons.compiler.CompilerFactoryFactory.getDefaultFactory().newExpressionEvaluator()`，并且只对 `commons-compiler.jar` 进行编译（不需要具体实现）。在运行时，添加一个实现（`janino.jar` 或 `commons-compiler-jdk.jar`）到类路径中，`getDefaultFactory()` 会在运行时找到它。

基于 JDK 的实现生成的代码性能与 Janino 实现的性能相同；然而，编译速度则慢了 22 倍（通过编译表达式“a + b”两个整数来测量，见下文）。主要原因是 `javax.tools` 编译器通过类路径加载所需的 JRE 类，而 Janino 则使用已经加载到运行中的 JVM 中的类。因此，`CompilerDemo`（JAVAC 的直接替代品）并不比 JAVAC 更快（通过编译 Janino 源代码来测量，见下文）。

| 活动                         | Janino  | JDK     |
|------------------------------|---------|---------|
| 编译表达式“a + b”            | 0.44 ms | 9.84 ms |
| 编译 Janino 源代码            | 6.417 s | 5.864 s |

（使用 JDK 17 和 JRE 17 测量。）

# 安全性

**警告**: JRE 17 报告“`System::setSecurityManager` 将在未来版本中移除”，因此你不应该在 JRE 17 及更高版本中使用 Janino 沙箱。

由于 Janino 生成的字节码可以完全访问 JRE，因此如果正在编译和执行的表达式、脚本、类体或编译单元包含用户输入，可能会产生安全问题。

如果用户是一个有经验的系统管理员，可以预期他或她会负责任地使用 Janino，并遵循你提供的文档和注意事项；然而，如果用户是来自内部网或互联网的用户，无法假定他们不会表现得笨拙、轻率、富有创造性、一根筋，甚至是恶意的。

Janino 包含一个非常易于使用的安全 API，可以用来将表达式、脚本、类体和编译单元锁定在一个“沙箱”中，该沙箱由 Java 安全管理器保护。

```java
import java.security.Permissions;
import java.security.PrivilegedAction;
import java.util.PropertyPermission;
import org.codehaus.janino.ScriptEvaluator;
import org.codehaus.commons.compiler.Sandbox;
 
public class SandboxDemo {
 
    public static void
    main(String[] args) throws Exception {
 
        // Create a JANINO script evaluator. The example, however, will work as fine with
        // ExpressionEvaluators, ClassBodyEvaluators and SimpleCompilers.
        ScriptEvaluator se = new ScriptEvaluator();
        se.setDebuggingInformation(true, true, false);
 
        // Now create a "Permissions" object which allows to read the system variable
        // "foo", and forbids everything else.
        Permissions permissions = new Permissions();
        permissions.add(new PropertyPermission("foo", "read"));
 
        // Compile a simple script which reads two system variables - "foo" and "bar".
        PrivilegedAction<?> pa = se.createFastEvaluator((
            "System.getProperty(\"foo\");\n" +
            "System.getProperty(\"bar\");\n" +
            "return null;\n"
        ), PrivilegedAction.class, new String[0]);
 
        // Finally execute the script in the sandbox. Getting system property "foo" will
        // succeed, and getting "bar" will throw a
        //    java.security.AccessControlException: access denied (java.util.PropertyPermission bar read)
        // in line 2 of the script. Et voila!
        Sandbox sandbox = new Sandbox(permissions);
        sandbox.confine(pa);
    }
}
```

Java 安全管理器的官方文档由 ORACLE 提供，标题为《Java Essentials: The Security Manager》。由权限保护的操作包括：

- 接受来自指定主机和端口号的套接字连接
- 修改线程（更改其优先级、停止它等）
- 打开到指定主机和端口号的套接字连接
- 创建新的类加载器
- 删除指定文件
- 创建新进程
- 使应用程序退出
- 加载包含本地方法的动态库
- 在指定的本地端口号上等待连接
- 从指定包中加载类（由类加载器使用）
- 将新类添加到指定包中（由类加载器使用）
- 访问或修改系统属性
- 访问指定的系统属性
- 从指定文件读取
- 向指定文件写入

这些操作是攻击者可能进行的“真正恶意的行为”。然而，未受到保护的操作包括：

- 分配内存
- 创建新线程
- 过度使用 CPU 时间

幸运的是，`Thread` 构造函数会进行一些反射操作，因此可以通过不允许新的 `RuntimePermission("accessDeclaredMembers")` 来防止脚本创建新线程。

内存分配无法直接受到保护，不过，`com.sun.management.ThreadMXBean.getThreadAllocatedBytes(long threadId)` 似乎可以统计线程所分配的字节数，因此它可能是检测运行中脚本过度内存分配的一个有效措施。

# debug 调试

即使生成的类是动态创建的，也可以进行交互式调试。

只需在启动 JVM 时设置两个系统属性，例如：

```bash
$ java \
> ... \
> -Dorg.codehaus.janino.source_debugging.enable=true \
> -Dorg.codehaus.janino.source_debugging.dir=C:\tmp \
> ...
```

（第二个属性是可选的；如果未设置，则临时文件将创建在默认的临时文件目录中。）

当 Janino 扫描表达式、脚本、类体或编译单元时，它会将源代码的副本存储在一个临时文件中，调试器通过其源路径访问该文件。（JVM 终止时，临时文件将被删除。）

# 参考资料

https://janino-compiler.github.io/janino/#getting_started

* any list
{:toc}