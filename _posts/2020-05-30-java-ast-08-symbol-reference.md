---
layout: post
title: JavaParser 系列学习-08-变量和引用
date:  2020-5-29 14:24:18 +0800
categories: [java]
tags: [aop, ast, sh]
published: true
---

# 解决符号和参考

与其他解析器一样，JavaParser接收源代码中存在的信息，并将其组织成一棵树，即抽象语法树。

在许多情况下，AST中显示的信息足以满足用户的需求。

但是，在其他情况下，您可能需要详细说明AST并计算其他信息。

特别是，您可能需要解析引用并找到节点之间的关系。

从某种意义上讲，这意味着跟踪新链接并将树转换为图形。

当我们找到Java代码中使用的名称时，我们会将其识别为符号。

符号是我们用来表示可能由名称表示的任何元素的术语。 

符号可以是变量，参数，也可以是字段或类型。

当我们遇到这个表达式时：

```java
container.element
```

什么是容器？ 什么是元素？ 也许容器是一个变量，而元素是该变量的字段。

或者，容器是一个类名，而元素是该类的静态字段。

在这个阶段我们还不知道，所以我们通常说符号。

JavaSymbolSolver 是一个库，它检查那些符号并告诉我们它们的真正含义，为我们找到该符号表示的变量声明，参数声明或类型声明。

例如考虑这种情况：

```java
void aMethod() {
    int a;
    a = a + 1;
}
```

通过查看AST，我们知道 a = a + 1 对应于一个分配。

我们也知道我们正在将加1的结果分配给a的值。

有些事情我们不知道：

- 在这种情况下是否有符号a？

- 可以分配该符号吗？

- 该符号的类型是什么？

考虑最后一点：如果a是一个整数，那么a + 1的结果将是一个整数。

但是a可以是一个String，在这种情况下，我们不求和1，而是将其字符串表示与a表示的String串联。

换句话说，仅查看AST，我们就无法说出我们正在执行哪种运算：代数和或字符串连接？

这取决于a的类型。

要回答这些问题，我们必须解决参考。

我们必须将+ 1中对a的引用连接到要引用的a的声明。

现在考虑以下情况：

```java
class Bar {

 private String a;

    void aMethod() {
     float a;
        while (true) {
         int a;
         a = a + 1;
        }
    }
}
```

有很多符号。 解决参考意味着找到正确的参考，这可能很困难。

相信我们，事情会变得非常复杂。

幸运的是，您可以使用JavaSymbolSolver来解决JavaParser AST元素之间的引用。

# 如何设置JavaSymbolSolver？

JavaSymbolSolver现在与JavaParser核心库捆绑在一起。

这是因为保证每个版本的JavaSymbolSolver都可以与特定版本的JavaParser一起使用。

从历史上看并非如此，这些库是分开分发的。

如果您遇到与依赖性相关的问题，请更新至最新版本。

如果您以前选择不包含JavaSymbolSolver而是仅将javaparser-core工件包含在依赖项中，则必须更新到捆绑版本，然后需要替换这种依赖性。

## 源码

- Bar.java

```java
package com.github.houbb.javaparser.learn.chap5;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
public class Bar {

    private String a;

    void aMethod() {
        while (true) {
            int a = 0;
            a = a + 1;
        }
    }

}
```

- GetTypeOfReference.java

```java
package com.github.houbb.javaparser.learn.chap5;

import com.github.javaparser.StaticJavaParser;
import com.github.javaparser.ast.CompilationUnit;
import com.github.javaparser.ast.expr.AssignExpr;
import com.github.javaparser.resolution.types.ResolvedType;
import com.github.javaparser.symbolsolver.JavaSymbolSolver;
import com.github.javaparser.symbolsolver.model.resolution.TypeSolver;
import com.github.javaparser.symbolsolver.resolution.typesolvers.CombinedTypeSolver;

import java.io.File;
import java.io.FileNotFoundException;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
public class GetTypeOfReference {

    /**
     * com.github.houbb.javaparser.learn.chap5
     */
    private static final String FILE_PATH = "src/main/java/" +
            "com/github/houbb/javaparser/learn/chap5/Bar.java";

    public static void main(String[] args) throws FileNotFoundException {
        TypeSolver typeSolver = new CombinedTypeSolver();

        JavaSymbolSolver symbolSolver = new JavaSymbolSolver(typeSolver);
        StaticJavaParser
                .getConfiguration()
                .setSymbolResolver(symbolSolver);

        CompilationUnit cu = StaticJavaParser.parse(new File(FILE_PATH));

        cu.findAll(AssignExpr.class).forEach(ae -> {
            ResolvedType resolvedType = ae.calculateResolvedType();
            System.out.println(ae.toString() + " is a: " + resolvedType);
        });
    }

}
```

- 输出日志

```
a = a + 1 is a: PrimitiveTypeUsage{name='int'}
```

比较核心的一句代码:

```java
TypeSolver typeSolver = new CombinedTypeSolver();
```

后续将进行深入学习。

# 指定在哪里寻找类型

在前面的示例中，我们已经看到了相同AST（即同一Java源文件）中元素之间的引用。

生活往往比这复杂，引用通常涉及其他文件。

考虑一下：

```java
class MyClass extends MySuperClass {

    public void returnSomeValue() {
        System.out.println(aField.size();
    }

}
```

字段来自哪里？

我们不知道，它可能是MySuperClass中定义的字段。

或者，也许MySuperClass扩展了另一个名为MyExtraSuperClass的类，并且该类定义了名为aField的字段。

因此，我们需要检查MySuperClass来解决它。 

好的，这就是JavaSymbolSolver将为我们做的事情。

为了做到这一点，JavaSymbolSolver将需要知道在哪里寻找类。

类可以是：

- 在其他Java源文件中，如果它们是类，我们现在正在编译

- 来自某些库的类文件或JAR中

- 在JRE中，用于java.lang.Object或java.lang.String之类的类

## 不同的 TypeSolvers

根据上面的内容，您需要将不同的TypeSolvers传递给JavaSymbolSolver。

JarTypeSolver：此TypeSolver在JAR文件中查找类。您只需要指定JAR文件的位置即可。

JavaParserTypeSolver：此TypeSolver查找在源文件中定义的类。您只需要指定根目录。例如src目录。它将在与包相对应的目录中查找源文件。因此它将在指定的根目录下的目录a下的目录b中寻找类a.b.C。

ReflectionTypeSolver：有些类被定义为语言的一部分，并且没有JAR。诸如java.lang.Object之类的类。为了找到此类的定义，我们可以使用反射。

MemoryTypeSolver：此TypeSolver仅返回我们在其中记录的类。它主要用于测试。

CombinedTypeSolver：您通常希望将多个TypeSolver合并为一个。为此，您可以使用CombinedTypeSolver。

# 使用绝对名称解析类型

您可以根据需要直接使用TypeSolver。 

这将查找给定其限定名称的元素定义。

考虑以下示例：

```java
package com.github.houbb.javaparser.learn.chap5;

import com.github.javaparser.resolution.declarations.ResolvedReferenceTypeDeclaration;
import com.github.javaparser.symbolsolver.model.resolution.TypeSolver;
import com.github.javaparser.symbolsolver.resolution.typesolvers.ReflectionTypeSolver;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
public class UsingTypeSolver {

    private static void showReferenceTypeDeclaration(ResolvedReferenceTypeDeclaration resolvedReferenceTypeDeclaration){

        System.out.println(String.format("== %s ==",
                resolvedReferenceTypeDeclaration.getQualifiedName()));
        System.out.println(" fields:");
        resolvedReferenceTypeDeclaration.getAllFields().forEach(f ->
                System.out.println(String.format("    %s %s", f.getType(), f.getName())));
        System.out.println(" methods:");
        resolvedReferenceTypeDeclaration.getAllMethods().forEach(m ->
                System.out.println(String.format("    %s", m.getQualifiedSignature())));
        System.out.println();
    }

    public static void main(String[] args) {
        TypeSolver typeSolver = new ReflectionTypeSolver();

        showReferenceTypeDeclaration(typeSolver.solveType("java.lang.Object"));
        showReferenceTypeDeclaration(typeSolver.solveType("java.lang.String"));
        showReferenceTypeDeclaration(typeSolver.solveType("java.util.List"));
    }

}
```

日志输出如下：

```
== java.lang.Object ==
 fields:
 methods:
    java.lang.Object.registerNatives()
    java.lang.Object.getClass()
    java.lang.Object.wait(long, int)
    java.lang.Object.clone()
    java.lang.Object.hashCode()
    java.lang.Object.finalize()
    java.lang.Object.wait()
    java.lang.Object.notify()
    java.lang.Object.equals(java.lang.Object)
    java.lang.Object.notifyAll()
    java.lang.Object.toString()
    java.lang.Object.wait(long)

== java.lang.String ==
 fields:
    ResolvedArrayType{PrimitiveTypeUsage{name='char'}} value
    PrimitiveTypeUsage{name='int'} hash
    PrimitiveTypeUsage{name='long'} serialVersionUID
    ResolvedArrayType{ReferenceType{java.io.ObjectStreamField, typeParametersMap=TypeParametersMap{nameToValue={}}}} serialPersistentFields
    ReferenceType{java.util.Comparator, typeParametersMap=TypeParametersMap{nameToValue={java.util.Comparator.T=ReferenceType{java.lang.String, typeParametersMap=TypeParametersMap{nameToValue={}}}}}} CASE_INSENSITIVE_ORDER
 methods:
    java.lang.String.substring(int)
    java.lang.String.valueOf(boolean)
    java.lang.Object.getClass()
    java.lang.String.endsWith(java.lang.String)
    java.lang.String.valueOf(char[], int, int)
    java.lang.String.valueOf(float)
    java.lang.String.length()
    java.lang.CharSequence.chars()
    java.lang.String.contentEquals(java.lang.StringBuffer)
    java.lang.Object.finalize()
    java.lang.String.valueOf(long)
    java.lang.String.charAt(int)
    java.lang.String.lastIndexOf(char[], int, int, char[], int, int, int)
    java.lang.String.toLowerCase(java.util.Locale)
    java.lang.String.startsWith(java.lang.String)
    java.lang.String.copyValueOf(char[])
    java.lang.Object.notifyAll()
    java.lang.String.toUpperCase()
    java.lang.String.lastIndexOf(char[], int, int, java.lang.String, int)
    java.lang.String.equalsIgnoreCase(java.lang.String)
    java.lang.String.checkBounds(byte[], int, int)
    java.lang.Object.clone()
    java.lang.CharSequence.codePoints()
    java.lang.String.join(java.lang.CharSequence, java.lang.Iterable<? extends java.lang.CharSequence>)
    java.lang.String.getBytes(int, int, byte[], int)
    java.lang.String.format(java.lang.String, java.lang.Object...)
    java.lang.String.replaceAll(java.lang.String, java.lang.String)
    java.lang.String.toUpperCase(java.util.Locale)
    java.lang.String.trim()
    java.lang.String.indexOf(int, int)
    java.lang.String.getBytes(java.nio.charset.Charset)
    java.lang.String.lastIndexOf(java.lang.String, int)
    java.lang.String.codePointAt(int)
    java.lang.String.getBytes()
    java.lang.String.replace(char, char)
    java.lang.String.concat(java.lang.String)
    java.lang.String.replace(java.lang.CharSequence, java.lang.CharSequence)
    java.lang.String.contains(java.lang.CharSequence)
    java.lang.String.toCharArray()
    java.lang.String.codePointCount(int, int)
    java.lang.String.valueOf(double)
    java.lang.String.lastIndexOfSupplementary(int, int)
    java.lang.String.indexOfSupplementary(int, int)
    java.lang.String.valueOf(char)
    java.lang.String.isEmpty()
    java.lang.String.getChars(int, int, char[], int)
    java.lang.String.toString()
    java.lang.String.offsetByCodePoints(int, int)
    java.lang.String.indexOf(char[], int, int, java.lang.String, int)
    java.lang.String.getChars(char[], int)
    java.lang.String.lastIndexOf(java.lang.String)
    java.lang.String.toLowerCase()
    java.lang.String.codePointBefore(int)
    java.lang.String.replaceFirst(java.lang.String, java.lang.String)
    java.lang.String.split(java.lang.String, int)
    java.lang.String.equals(java.lang.Object)
    java.lang.String.contentEquals(java.lang.CharSequence)
    java.lang.Object.wait(long)
    java.lang.String.valueOf(char[])
    java.lang.String.valueOf(java.lang.Object)
    java.lang.String.lastIndexOf(int, int)
    java.lang.String.indexOf(char[], int, int, char[], int, int, int)
    java.lang.Object.wait()
    java.lang.String.matches(java.lang.String)
    java.lang.String.getBytes(java.lang.String)
    java.lang.String.valueOf(int)
    java.lang.String.compareTo(java.lang.String)
    java.lang.Object.wait(long, int)
    java.lang.String.indexOf(java.lang.String)
    java.lang.String.startsWith(java.lang.String, int)
    java.lang.String.copyValueOf(char[], int, int)
    java.lang.String.hashCode()
    java.lang.String.lastIndexOf(int)
    java.lang.String.regionMatches(boolean, int, java.lang.String, int, int)
    java.lang.String.intern()
    java.lang.Comparable.compareTo(T)
    java.lang.String.split(java.lang.String)
    java.lang.Object.notify()
    java.lang.String.indexOf(java.lang.String, int)
    java.lang.String.format(java.util.Locale, java.lang.String, java.lang.Object...)
    java.lang.String.join(java.lang.CharSequence, java.lang.CharSequence...)
    java.lang.String.regionMatches(int, java.lang.String, int, int)
    java.lang.String.substring(int, int)
    java.lang.String.nonSyncContentEquals(java.lang.AbstractStringBuilder)
    java.lang.String.compareToIgnoreCase(java.lang.String)
    java.lang.Object.registerNatives()
    java.lang.String.indexOf(int)
    java.lang.String.subSequence(int, int)

== java.util.List ==
 fields:
 methods:
    java.lang.Object.finalize()
    java.lang.Object.notifyAll()
    java.util.List.addAll(int, java.util.Collection<? extends E>)
    java.lang.Iterable.forEach(java.util.function.Consumer<? super T>)
    java.lang.Object.notify()
    java.lang.Object.wait(long, int)
    java.lang.Object.wait(long)
    java.util.List.add(int, E)
    java.util.List.subList(int, int)
    java.util.Collection.stream()
    java.util.List.containsAll(java.util.Collection<? extends java.lang.Object>)
    java.util.List.listIterator()
    java.util.List.removeAll(java.util.Collection<? extends java.lang.Object>)
    java.util.List.spliterator()
    java.util.List.add(E)
    java.util.List.set(int, E)
    java.util.List.hashCode()
    java.util.List.remove(int)
    java.util.Collection.parallelStream()
    java.util.List.size()
    java.util.List.indexOf(java.lang.Object)
    java.util.List.get(int)
    java.lang.Object.clone()
    java.util.List.clear()
    java.util.List.contains(java.lang.Object)
    java.util.List.retainAll(java.util.Collection<? extends java.lang.Object>)
    java.util.List.iterator()
    java.util.List.remove(java.lang.Object)
    java.util.Collection.removeIf(java.util.function.Predicate<? super E>)
    java.lang.Object.getClass()
    java.lang.Object.registerNatives()
    java.util.List.addAll(java.util.Collection<? extends E>)
    java.util.List.isEmpty()
    java.util.List.lastIndexOf(java.lang.Object)
    java.lang.Object.wait()
    java.util.List.listIterator(int)
    java.lang.Object.toString()
    java.util.List.replaceAll(java.util.function.UnaryOperator<E>)
    java.util.List.toArray(T[])
    java.util.List.sort(java.util.Comparator<? super E>)
    java.util.List.equals(java.lang.Object)
    java.util.List.toArray()
```

# 在上下文中解析类型

仅提供类型名称时，TypeSolver才能查找类型。 

但是，JavaSymbolSolver可以使用上下文查找与某个声明相对应的实际限定名称。

考虑一下：

栏的类型是什么？

可以是org.javaparser.examples.chapter5.Bar或org.javaparser.examples.chapter4.Bar。

JavaSymbolSolver将通过查看上下文并考虑诸如以下的内容来为您解决这一问题：

- 使用该类型的类的名称

- 导入指令

- 当前包

您如何告诉JavaSymbolSolver使用哪个上下文？

好吧，它通过查看包含您感兴趣的节点的AST来确定这一点。

## 源码

```java
package com.github.houbb.javaparser.learn.chap5;

import com.github.javaparser.StaticJavaParser;
import com.github.javaparser.ast.CompilationUnit;
import com.github.javaparser.ast.body.FieldDeclaration;
import com.github.javaparser.symbolsolver.JavaSymbolSolver;
import com.github.javaparser.symbolsolver.javaparser.Navigator;
import com.github.javaparser.symbolsolver.model.resolution.TypeSolver;
import com.github.javaparser.symbolsolver.resolution.typesolvers.CombinedTypeSolver;
import com.github.javaparser.symbolsolver.resolution.typesolvers.JavaParserTypeSolver;
import com.github.javaparser.symbolsolver.resolution.typesolvers.ReflectionTypeSolver;

import java.io.File;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
public class ResolveTypeInContext {

    private static final String FILE_PATH = "src/main/java/" +
            "com/github/houbb/javaparser/learn/chap5/Foo.java";
    private static final String SRC_PATH = "src/main/java";

    public static void main(String[] args) throws Exception {
        TypeSolver reflectionTypeSolver = new ReflectionTypeSolver();
        TypeSolver javaParserTypeSolver = new JavaParserTypeSolver(new File(SRC_PATH));
        reflectionTypeSolver.setParent(reflectionTypeSolver);

        CombinedTypeSolver combinedSolver = new CombinedTypeSolver();
        combinedSolver.add(reflectionTypeSolver);
        combinedSolver.add(javaParserTypeSolver);

        JavaSymbolSolver symbolSolver = new JavaSymbolSolver(combinedSolver);
        StaticJavaParser
                .getConfiguration()
                .setSymbolResolver(symbolSolver);

        CompilationUnit cu = StaticJavaParser.parse(new File(FILE_PATH));

        FieldDeclaration fieldDeclaration = Navigator.findNodeOfGivenClass(cu, FieldDeclaration.class);

        System.out.println("Field type: " + fieldDeclaration.getVariables().get(0).getType()
                .resolve().asReferenceType().getQualifiedName());
    }

}
```

- 输出

```
Field type: com.github.houbb.javaparser.learn.chap5.Bar
```

我们在这里做什么？

1. 我们获得在FieldDeclaration中定义的第一个（也是唯一的）变量的类型

2. 我们将该类型转换为JavaSymbolSolver类型，以实现传递JavaParser类型和要使用的上下文的目的。

JavaSymbolSolver ResolvedType是一种类型，其中包含您可能需要的有关该类型的所有信息。

在这种情况下，我们使用的上下文是fieldDeclaration。

这意味着我们希望JavaSymbolSolver考虑当引用类型Bar指向该特定节点的定义位置时引用类型的含义

考虑一下：

```java
class Foo {
    Bar bar;
}

class Zum {
    Bar bar;

    class Bar {

    }
}
```

从JavaParser的角度来看，两个FieldDeclarations具有相同的类型：名为Bar的类型。

但是，相同的名称在不同的上下文中具有不同的含义。 

因此，通过传递相同的JavaParser类型和上下文（第一个或第二个FieldDeclaration），JavaSymbolSolver将为我们提供不同的答案，并找出每种情况下使用的实际类型。

很整洁吧？

# 解决方法调用

JavaSymbolSolver可以帮助您的另一件事是解决方法调用。

您可能知道Java允许方法的重载，即，具有相同名称但具有不同签名的不同方法。

但是，这可以使特定调用调用哪种方法变得不清楚。

考虑这种情况：

```java
package com.github.houbb.javaparser.learn.chap5;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
public class A {

    public void foo(Object param) {
        System.out.println(1);
        System.out.println("hi");
        System.out.println(param);
    }
    
}
```

我们有三个调用，这三个调用引用了恰好具有相同名称的三个不同方法。

这是我们可以使用JavaSymbolSolver找出每种情况下调用哪个方法的方法：

## 代码

```java
package com.github.houbb.javaparser.learn.chap5;

import com.github.javaparser.StaticJavaParser;
import com.github.javaparser.ast.CompilationUnit;
import com.github.javaparser.ast.expr.MethodCallExpr;
import com.github.javaparser.symbolsolver.JavaSymbolSolver;
import com.github.javaparser.symbolsolver.model.resolution.TypeSolver;
import com.github.javaparser.symbolsolver.resolution.typesolvers.ReflectionTypeSolver;

import java.io.File;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
public class ResolveMethodCalls {

    /**
     * com.github.houbb.javaparser.learn.chap5
     */
    private static final String FILE_PATH = "src/main/java/" +
            "com/github/houbb/javaparser/learn/chap5/A.java";

    public static void main(String[] args) throws Exception {
        TypeSolver typeSolver = new ReflectionTypeSolver();

        JavaSymbolSolver symbolSolver = new JavaSymbolSolver(typeSolver);
        StaticJavaParser
                .getConfiguration()
                .setSymbolResolver(symbolSolver);

        CompilationUnit cu = StaticJavaParser.parse(new File(FILE_PATH));

        cu.findAll(MethodCallExpr.class).forEach(mce ->
                System.out.println(mce.resolve().getQualifiedSignature()));
    }

}
```

- 日志输出

```
java.io.PrintStream.println(int)
java.io.PrintStream.println(java.lang.String)
java.io.PrintStream.println(java.lang.Object)
```

还要注意，JavaSymbolSolver会找出在特定上下文中可见的方法，它确定方法调用范围的类型（在本例中为System.out），依此类推。

这是相当多的工作，您可能不想自己做，尤其是当您可以仅使用此库并转到下一个问题时。

# 使用CombinedTypeSolver

在检查实际应用程序时，通常将使用CombinedTypeSolver将不同的其他TypeSolver分组为一个。

例如，假设您要检查的应用程序使用以下类：

- 标准库

- 3个不同的 jars

- 2个包含源代码的目录

您可以创建一个CombinedTypeSolver，其中包含ReflectionTypeSolver的一个实例，3个JarTypeSolver的实例和2个JavaParserTypeSolver的实例。

代码看起来像这样：

```java
package com.github.houbb.javaparser.learn.chap5;

import com.github.javaparser.symbolsolver.model.resolution.TypeSolver;
import com.github.javaparser.symbolsolver.resolution.typesolvers.CombinedTypeSolver;
import com.github.javaparser.symbolsolver.resolution.typesolvers.JarTypeSolver;
import com.github.javaparser.symbolsolver.resolution.typesolvers.JavaParserTypeSolver;
import com.github.javaparser.symbolsolver.resolution.typesolvers.ReflectionTypeSolver;

import java.io.File;
import java.io.IOException;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
public class UsingCombinedTypeSolver {

    public static void main(String[] args) throws IOException {
        TypeSolver myTypeSolver = new CombinedTypeSolver(
                new ReflectionTypeSolver(),
                JarTypeSolver.getJarTypeSolver("jars/library1.jar"),
                JarTypeSolver.getJarTypeSolver("jars/library2.jar"),
                JarTypeSolver.getJarTypeSolver("jars/library3.jar"),
                new JavaParserTypeSolver(new File("src/main/java")),
                new JavaParserTypeSolver(new File("generated_code"))
        );
        // using myTypeSolver
    }
    
}
```

# 使用MemoryTypeSolver

正如我们预期的那样，这种TypeSolver通常不会在实际应用中使用。 

相反，它主要用于测试。

让我们考虑一下JavaSymbolSolver项目中的一项真实测试：

```java
package org.javaparser.examples.chapter5;

import com.github.javaparser.StaticJavaParser;
import com.github.javaparser.ast.CompilationUnit;
import com.github.javaparser.resolution.declarations.ResolvedReferenceTypeDeclaration;
import com.github.javaparser.resolution.declarations.ResolvedTypeDeclaration;
import com.github.javaparser.symbolsolver.core.resolution.Context;
import com.github.javaparser.symbolsolver.javaparsermodel.contexts.CompilationUnitContext;
import com.github.javaparser.symbolsolver.model.resolution.SymbolReference;
import com.github.javaparser.symbolsolver.resolution.typesolvers.MemoryTypeSolver;
import org.easymock.EasyMock;
import org.junit.Test;

import java.io.File;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

public class MemoryTypeSolverComplete {

    private static final String FILE_PATH = "src/main/java/org/javaparser/examples/chapter5/Foo.java";

    @Test
    public void solveTypeInSamePackage() throws Exception {
        CompilationUnit cu = StaticJavaParser.parse(new File(FILE_PATH));

        ResolvedReferenceTypeDeclaration otherClass = EasyMock.createMock(ResolvedReferenceTypeDeclaration.class);
        EasyMock.expect(otherClass.getQualifiedName()).andReturn("org.javaparser.examples.chapter5.Bar");

        /* Start of the relevant part */
        MemoryTypeSolver memoryTypeSolver = new MemoryTypeSolver();
        memoryTypeSolver.addDeclaration(
                "org.javaparser.examples.chapter5.Bar", otherClass);
        Context context = new CompilationUnitContext(cu, memoryTypeSolver);

        /* End of the relevant part */

        EasyMock.replay(otherClass);

        SymbolReference<ResolvedTypeDeclaration> ref = context.solveType("Bar");
        assertTrue(ref.isSolved());
        assertEquals("org.javaparser.examples.chapter5.Bar", ref.getCorrespondingDeclaration().getQualifiedName());
    }
}
```

在这种情况下，我们要验证其余代码是否在寻找一种特定类型（com.foo.OtherClassInSamePackage）。

我们使用MemoryTypeSolver并指示它在使用名称com.foo.OtherClassInSamePackage时返回特定的TypeDeclaration，而不是创建JAR只是在文本中使用它。

也可以使用它来使用特殊的类加载器来分析应用程序，从而在运行中或在其他奇怪的情况下生成类。

在大多数情况下，您可以忽略MemoryTypeSolver的存在。

# 摘要

此时，您应该对JavaSymbolSolver可以为您解决什么样的问题有所了解。

我们并不希望您回答关于库的所有问题，也没有探讨整个API，但是我们应该为您提供一个起点。

Javadoc还可以帮助您解决一些剩余的问题。 对于其他人，请随时与我们联系。

请记住，与JavaParser相比，JavaSymbolSolver还很年轻，并且随着时间的推移，其API可能会逐渐变得易于使用。

但是，由于有出色的JavaParser社区，该项目正在快速发展，并且已经在商业产品中使用。

# 参考资料

官方语法书

* any list
{:toc}