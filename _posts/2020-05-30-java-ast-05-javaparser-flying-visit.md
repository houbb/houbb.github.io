---
layout: post
title: JavaParser 系列学习-05-快速访问
date:  2020-5-29 14:24:18 +0800
categories: [java]
tags: [aop, ast, sh]
published: true
---

# 飞行访问

在本章中，我们将不停地浏览JavaParser库提供的主要功能。

您可以将其视为快速入门指南，使您可以开始在本地计算机上运行。

我们将分析一个有趣的代码，尽管基本的计算器以反向波兰符号格式输入输入并计算结果（维基百科）。

它还具有一个简单的存储功能，可以存储单个数字，类似于您会发现的普通计算器。

该类的长度合理，因此可以在附录A中找到。

# 随行同伴

首先，尽管我们应该在使用JavaParser时向您介绍主要的旅行伙伴。

除了提供用于表示语言概念的众多类之外，还有一些支持与Java AST一起使用的主要类，即JavaParser，StaticJavaParser和CompilationUnit，此外，还有各种各样的Visitor类。

在本书的过程中，我们将更详细地介绍所有这些内容，但是这里是一个简短的介绍。

简单来说：

JavaParser类提供了用于从代码生成AST的完整API

StaticJavaParser类提供了一种快速简单的API，用于根据代码生成AST。

CompilationUnit 是 AST 的根

Visitor 是用于查找 AST 特定部分的类

与往常一样，JavaDoc在使用Java库时是您的朋友，尽管本书将尽力涵盖尽可能多的内容，但不可避免地会跳过某些领域。

# JavaParser 类

您可能会想到，该类使您可以将Java源代码解析为可以与之交互的Java对象。

在大多数情况下，您将使用完整的类文件，并且在这种情况下 JavaParser.parse() 方法将重载以接受Path，File，InputStream和String将返回一个CompiliationUnit供您使用。

也可以使用源代码片段，尽管为了解析String，您将需要知道结果类型以避免解析错误。

例如：

```java
Statement statement = StaticJavaParser.parseStatement("int a = 0;");
```

## CompilationUnit类

CompilationUnit是来自您已解析的完整且语法正确的类文件中的源代码的Java表示。

在提到的AST上下文中，您可以将类视为根节点。

从这里，您可以访问树的所有节点以检查其属性，操纵基础Java表示或将其用作您定义的Visitor的入口点。

## Visitor classes

尽管手动滚动代码直接遍历CompilationUnit中的AST是可行的，但这往往很费力并且容易出错。

这主要是由于该过程依赖于递归和频繁的类型检查来实现您的目标。

在大多数情况下，您将需要确定要寻找的内容，然后定义将对其进行操作的访问者。

使用访问者很容易找到某种类型的所有节点，例如所有方法声明或所有乘法表达式。

## A simple Visitor

如前所述，定义访问者以遍历AST并在您感兴趣的代码中的概念上进行操作通常是一个好主意。

因此，从一个简单的Visitor作为我们的第一个示例开始是很有意义的。

本书随附的所有代码都可以在随附的[存储库](https://github.com/javaparser/javaparser-visited)中找到，欢迎您从此处查看工作示例。

但是，我们建议您自己编写代码，这是获得直觉的最佳途径。

在此示例中，我们将创建一个Visitor，以检查类中的所有方法并将其名称和行长打印到控制台。 

因此，让我们开始吧！

# 愉快之旅

## maven 引入

首先，在您喜欢的IDE中创建一个新项目，然后将JavaParser库添加到您的类路径中。

如果您更喜欢使用依赖项管理工具，则只需在构建脚本中添加几行即可。

对于 Maven，这些行是：

```xml
<dependency>
<groupId>com.github.javaparser</groupId>
<artifactId>javaparser-symbol-solver-core</artifactId>
<version>3.13.3</version>
</dependency>
```

上述依赖项包括项目中的核心Java解析和符号解析功能。

本书涵盖了这两个库，我们建议您同时包括这两个库。

如果仅需要解析功能，则可以将工件标记更改为javaparser-core。

## 代码编写

现在是时候编写一些代码了。

您可以看一下附录A并创建 [ReversePolishNotation.java](https://github.com/javaparser/javaparser-visited/blob/master/src/main/java/org/javaparser/samples/ReversePolishNotation.java#L10:14)类。

该软件包将是org.javaparser.examples。

接下来，创建第二类，名称和包装取决于您。

我们将使用org.javaparser.examples.VoidVisitorStarter.java。

现在我们已经完成了所有设置，现在该创建一个CompilationUnit了，即为ReversePolishNotation类解析的AST。

随时复制以下代码。

```java
package com.github.houbb.javaparser.learn.chap1;

import com.github.javaparser.StaticJavaParser;
import com.github.javaparser.ast.CompilationUnit;
import com.github.javaparser.ast.body.MethodDeclaration;
import com.github.javaparser.ast.visitor.VoidVisitor;
import com.github.javaparser.ast.visitor.VoidVisitorAdapter;

import java.io.FileInputStream;
import java.util.ArrayList;
import java.util.List;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
public class VoidVisitorComplete {

    /**
     * com.github.houbb.javaparser.learn.chap1
     */
    private static final String FILE_PATH = "src/main/java/com/github/" +
            "houbb/javaparser/learn/chap1/ReversePolishNotation.java";

    public static void main(String[] args) throws Exception {
        CompilationUnit cu = StaticJavaParser.parse(new FileInputStream(FILE_PATH));

        VoidVisitor<?> methodNameVisitor = new MethodNamePrinter();
        methodNameVisitor.visit(cu, null);

        List<String> methodNames = new ArrayList<>();
        VoidVisitor<List<String>> methodNameCollector = new MethodNameCollector();
        methodNameCollector.visit(cu, methodNames);
        methodNames.forEach(n -> System.out.println("Method Name Collected: " + n));
    }

    private static class MethodNamePrinter extends VoidVisitorAdapter<Void> {

        @Override
        public void visit(MethodDeclaration md, Void arg) {
            super.visit(md, arg);
            System.out.println("Method Name Printed: " + md.getName());
        }
    }

    private static class MethodNameCollector extends VoidVisitorAdapter<List<String>> {

        @Override
        public void visit(MethodDeclaration md, List<String> collector) {
            super.visit(md, collector);
            collector.add(md.getNameAsString());
        }
    }

}
```

- 输出结果

```
Method Name Printed: calc
Method Name Printed: memoryRecall
Method Name Printed: memoryClear
Method Name Printed: memoryStore
Method Name Collected: calc
Method Name Collected: memoryRecall
Method Name Collected: memoryClear
Method Name Collected: memoryStore
```

## 源码浅析

`CompilationUnit cu = StaticJavaParser.parse(new FileInputStream(FILE_PATH));`

这行代码是将 FILE_PATH 中的源码进行编译为 AST 语法树。

这里展示了两种遍历方法的方式。

MethodNamePrinter 是直接输出方法名称，MethodNameCollector 是将方法列表返回。

- ReversePolishNotation.java

对应的方法如下：

```java
package com.github.houbb.javaparser.learn.chap1;

import java.util.Stack;
import java.util.stream.Stream;


/**
 * A Simple Reverse Polish Notation calculator with memory function.
 */
public class ReversePolishNotation {

    /* What does this do? */
    public static int ONE_BILLION = 1000000000;

    private double memory = 0;

    /**
     * Takes reverse polish notation style string and returns the resulting calculation.
     *
     * @param input mathematical expression in the reverse Polish notation format
     * @return the calculation result
     */
    public Double calc(String input) {

        String[] tokens = input.split(" ");
        Stack<Double> numbers = new Stack<>();

        Stream.of(tokens).forEach(t -> {
            double a;
            double b;
            switch(t){
                case "+":
                    b = numbers.pop();
                    a = numbers.pop();
                    numbers.push(a + b);
                    break;
                case "/":
                    b = numbers.pop();
                    a = numbers.pop();
                    numbers.push(a / b);
                    break;
                case "-":
                    b = numbers.pop();
                    a = numbers.pop();
                    numbers.push(a - b);
                    break;
                case "*":
                    b = numbers.pop();
                    a = numbers.pop();
                    numbers.push(a * b);
                    break;
                default:
                    numbers.push(Double.valueOf(t));
            }
        });
        return numbers.pop();
    }

    /**
     * Memory Recall uses the number in stored memory, defaulting to 0.
     *
     * @return the double
     */
    public double memoryRecall(){
        return memory;
    }

    /**
     * Memory Clear sets the memory to 0.
     */
    public void memoryClear(){
        memory = 0;
    }


    public void memoryStore(double value){
        memory = value;
    }

}
```

# A Simple Modifying Visitor

在版本7中对Java语言进行的鲜为人知的较小更改之一是能够用数值下划线表示数字文字。

尽管它的应用范围很窄，但它不是杀手级语言功能，但对于可读性而言可能特别有用。

```java
public static int ONE_BILLION = 1000000000;
public static int TWO_BILLION = 2_000_000_000;
```

如果使用必须定义任意大数值的代码库，则可以看到此约定具有其优点。

我们将再次使用“反向波兰语符号”类作为基础，如果您跳过了本书的这一部分，则可以在附录A中找到它。

碰巧有一个用Java 7以前的样式定义的成员。

## 核心代码

```java
package com.github.houbb.javaparser.learn.chap1;

import com.github.javaparser.StaticJavaParser;
import com.github.javaparser.ast.CompilationUnit;
import com.github.javaparser.ast.body.FieldDeclaration;
import com.github.javaparser.ast.expr.IntegerLiteralExpr;
import com.github.javaparser.ast.visitor.ModifierVisitor;

import java.io.FileInputStream;
import java.util.regex.Pattern;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
public class ModifyingVisitorComplete {

    /**
     * com.github.houbb.javaparser.learn.chap1
     */
    private static final String FILE_PATH = "src/main/java/com/github/" +
            "houbb/javaparser/learn/chap1/ReversePolishNotation.java";

    private static final Pattern LOOK_AHEAD_THREE = Pattern.compile("(\\d)(?=(\\d{3})+$)");

    public static void main(String[] args) throws Exception {
        CompilationUnit cu = StaticJavaParser.parse(new FileInputStream(FILE_PATH));

        ModifierVisitor<?> numericLiteralVisitor = new IntegerLiteralModifier();
        numericLiteralVisitor.visit(cu, null);

        System.out.println(cu.toString());
    }

    private static class IntegerLiteralModifier extends ModifierVisitor<Void> {

        @Override
        public FieldDeclaration visit(FieldDeclaration fd, Void arg) {
            super.visit(fd, arg);
            fd.getVariables().forEach(v ->
                    v.getInitializer().ifPresent(i -> {
                        if (i instanceof IntegerLiteralExpr) {
                            v.setInitializer(formatWithUnderscores(((IntegerLiteralExpr) i).getValue()));
                        }
                    }));
            return fd;
        }
    }

    private static String formatWithUnderscores(String value) {
        String withoutUnderscores = value.replaceAll("_", "");
        return LOOK_AHEAD_THREE.matcher(withoutUnderscores).replaceAll("$1_");
    }

}
```

## 浅析

这里就是针对数字的表示做了一个格式化。

演示了如何改变一个字段的初始化值。

输出结果

```java
/**
 * A Simple Reverse Polish Notation calculator with memory function.
 */
public class ReversePolishNotation {

    /* What does this do? */
    public static int ONE_BILLION = 1_000_000_000;

    //.... 省略其他
}
```

# 获取注释

现在与之前的示例相比，现在的步伐发生了令人愉快的变化，因此我们不会创建“访客”。

尽管我们将从强制性的main方法开始，然后再在CompilationUnit上使用getAllContainedComments方法。

这将为我们提供文件中所有注释的输出。 

然后，我们可以在以后以某种有趣的方式继续使用它。

ps: 我们可以根据这个特性，直接生成新的文档，结合对应的属性等。

而不是像以前的 Maven 的方式，当然这可以作为两种实现的策略。

**好好学习，不要故步自封。有一天你就会发现以前难以解决的问题的答案。**


## 核心代码

```java
package com.github.houbb.javaparser.learn.chap2;

import com.github.javaparser.StaticJavaParser;
import com.github.javaparser.ast.CompilationUnit;

import java.io.File;
import java.util.List;
import java.util.stream.Collectors;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
public class CommentReporterComplete {

    /**
     * com.github.houbb.javaparser.learn.chap2
     */
    private static final String FILE_PATH = "src/main/java/com/github/" +
            "houbb/javaparser/learn/chap2/ReversePolishNotation.java";

    public static void main(String[] args) throws Exception {
        CompilationUnit cu = StaticJavaParser.parse(new File(FILE_PATH));

        List<CommentReportEntry> comments = cu.getAllContainedComments()
                .stream()
                .map(p -> new CommentReportEntry(p.getClass().getSimpleName(),
                        p.getContent(),
                        p.getRange().get().begin.line,
                        !p.getCommentedNode().isPresent()))
                .collect(Collectors.toList());

        comments.forEach(System.out::println);
    }


    private static class CommentReportEntry {
        private String type;
        private String text;
        private int lineNumber;
        private boolean isOrphan;

        CommentReportEntry(String type, String text, int lineNumber, boolean isOrphan) {
            this.type = type;
            this.text = text;
            this.lineNumber = lineNumber;
            this.isOrphan = isOrphan;
        }

        @Override
        public String toString() {
            return lineNumber + "|" + type + "|" + isOrphan + "|" + text.replaceAll("\\n","").trim();
        }
    }

}
```

- 输出日志

```
81|BlockComment|true|EOF
7|JavadocComment|false|* A Simple Reverse Polish Notation calculator with memory function.
12|BlockComment|false|What does this do?
     * @return the calculation result
     * @return the double
68|JavadocComment|false|* Memory Clear sets the memory to 0.
```

## 浅析

这里是直接调用 `cu.getAllContainedComments()` 获取所有对应的注释，不过也有一个缺点，无法获取方法等的对应信息。

应该也有方式获取到，后续学习留意下即可。

# 参考资料

官方语法书

* any list
{:toc}