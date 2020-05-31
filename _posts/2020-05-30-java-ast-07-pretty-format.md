---
layout: post
title: JavaParser 系列学习-07-格式化输出&词汇保存
date:  2020-5-29 14:24:18 +0800
categories: [java]
tags: [aop, ast, sh]
published: true
---

# 漂亮的印刷和词法保存

您可以将JavaParser用于不同的目的。

最常见的两个是代码生成和代码转换。

在这两种情况下，您最终都将生成Java代码，可能将其存储在扩展名为.java的文件中。

在 CompilationUnit 上对 toString() 的简单调用将返回一个字符串，可用于编写源代码。

我们面临的问题是：它将如何格式化AST中的代码？

答案是两种方式之一：

- 使用漂亮的印刷

- 使用词法保留打印

# 什么是漂亮印刷？

漂亮的打印意味着当我们将代码作为源代码写出时，文本表示将以格式正确，标准的方式打印。

例如，如果要解析一个现有的java类，如下所示：

```java
class A { int


a;}
```

然后，您决定使用JavaParser对它进行漂亮的打印，您将获得以下代码表示形式：

```java
class A {
    int a;
}
```

# 什么是词法保留打印？

保留词汇的印刷是指保持原始布局的印刷。

当我们编写代码时，有一些信息对于编译器而言并不是严格意义上的，但对人类而言却很重要。

即空格和注释的位置。

如果您解析了一些代码，然后以保留词法的打印方式将其打印回来，您将获得与解析后相同的代码。

如果解析某些代码，对其进行修改，然后使用lexicalpreserving打印将其打印回去，您将获得与原始代码非常接近的代码，并且更改仅限于已明确更改的节点。

即使在以编程方式构建且未从源解析的AST上，也可以始终使用保留词法的打印。

在这种情况下，没有原始布局可保留，并且代码将默认为漂亮的打印形式。

当您解析代码并将某些以编程方式创建的新节点添加到AST时，情况也是如此：您解析的代码部分将附加布局信息，而您创建的节点将没有布局信息，并且它们将被漂亮地打印。

# 在漂亮打印和保留词汇的打印之间进行选择

我们已经看到，使用JavaParser从AST生成代码时，可以使用两种不同的样式。

下一个要考虑的问题是何时应该使用一个，何时应该使用另一个？

从我们已经看到的情况来看，很多情况下都涉及将JavaParser用于在大型代码库上执行转换。

在这种情况下，您通常会希望使用词法保留打印。

原因是，您的转换未修改的所有代码将保持完全不变。

通常，这会使开发人员更加放心，当提交大型（甚至安全）更改时，开发人员可能会感到紧张。

这也使我们可以使用更小的diff文件，从而使手动代码审查变得容易。

最后，它使我们能够保留具有意义的复杂布局或格式。

当生成不用于手动审阅的代码或转换代码时，您可以选择漂亮的打印。

如果要强制执行特定的打印，漂亮的打印也是一个不错的选择
代码样式：每次保存代码时，都可以确保它格式正确，没有任何例外。

这些是我们认为普遍的考虑因素，但请记住，JavaParser和JavaSymbolSolver旨在用作在许多不同上下文中使用的工具。

作为开发人员，您必须分析您的上下文并为您做出适当的选择。

我们已经看到了漂亮打印和词法保留打印之间的区别。

现在，让我们看看如何使用它们以及它们如何工作。

# 格式化输出

## 代码

```java
package com.github.houbb.javaparser.learn.chap4;

import com.github.javaparser.ast.body.ClassOrInterfaceDeclaration;
import com.github.javaparser.ast.comments.LineComment;
import com.github.javaparser.printer.PrettyPrinter;
import com.github.javaparser.printer.PrettyPrinterConfiguration;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
public class PrettyPrintComplete {

    public static void main(String[] args) {
        ClassOrInterfaceDeclaration myClass = new ClassOrInterfaceDeclaration();
        myClass.setComment(new LineComment("A very cool class!"));
        myClass.setName("MyClass");
        myClass.addField("String", "foo");

        PrettyPrinterConfiguration conf = new PrettyPrinterConfiguration();
        conf.setIndentSize(1);
        conf.setIndentType(PrettyPrinterConfiguration.IndentType.SPACES);
        conf.setPrintComments(false);
        PrettyPrinter prettyPrinter = new PrettyPrinter(conf);
        System.out.println(prettyPrinter.print(myClass));
    }

}
```

这里设置了 `conf.setPrintComments(false) `注释关闭，输出结果如下：

```java
class MyClass {

 String foo;
}
```

# 格式化访问

## 代码

```java
package com.github.houbb.javaparser.learn.chap4;

import com.github.javaparser.ast.body.ClassOrInterfaceDeclaration;
import com.github.javaparser.ast.comments.LineComment;
import com.github.javaparser.ast.expr.MarkerAnnotationExpr;
import com.github.javaparser.ast.expr.NormalAnnotationExpr;
import com.github.javaparser.ast.expr.SingleMemberAnnotationExpr;
import com.github.javaparser.printer.PrettyPrintVisitor;
import com.github.javaparser.printer.PrettyPrinter;
import com.github.javaparser.printer.PrettyPrinterConfiguration;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
public class PrettyPrintVisitorComplete {

    public static void main(String[] args) {
        ClassOrInterfaceDeclaration myClass = new ClassOrInterfaceDeclaration();
        myClass.setComment(new LineComment("A very cool class!"));
        myClass.setName("MyClass");
        myClass.addField("String", "foo");
        myClass.addAnnotation("MySecretAnnotation");

        PrettyPrinterConfiguration conf = new PrettyPrinterConfiguration();
        conf.setIndentSize(2);
        conf.setIndentType(PrettyPrinterConfiguration.IndentType.SPACES);
        conf.setPrintComments(false);
        conf.setVisitorFactory(prettyPrinterConfiguration -> new PrettyPrintVisitor(conf) {

            @Override
            public void visit(MarkerAnnotationExpr n, Void arg) {
                // ignore
            }

            @Override
            public void visit(SingleMemberAnnotationExpr n, Void arg) {
                // ignore
            }

            @Override
            public void visit(NormalAnnotationExpr n, Void arg) {
                // ignore
            }

        });
        PrettyPrinter prettyPrinter = new PrettyPrinter(conf);
        System.out.println(prettyPrinter.print(myClass));
    }

}
```

从这个代码我们可以看出，可以像前面的代码一样，访问其中的属性。

# 语法保留输出

## 简介

保留词汇的打印可用于保留解析代码时的原始布局。

这是它的主要目标，但是您可以将其用于已创建的节点。

在那种情况下，结果将等同于漂亮地打印那些节点。

设置词法保留打印的最简单方法是使用词法保留打印机的设置方法。

此方法将进行解析，注册初始文本并将观察者添加到AST中。

当您对AST进行操作时，观察者将在每次修改时调整文本。

在下面的示例中，您可以看到如何解析某些代码并通过使用lexicalpreserving打印将其打印回：

## 源码

```java
package com.github.houbb.javaparser.learn.chap4;

import com.github.javaparser.StaticJavaParser;
import com.github.javaparser.ast.CompilationUnit;
import com.github.javaparser.ast.Modifier;
import com.github.javaparser.ast.body.ClassOrInterfaceDeclaration;
import com.github.javaparser.printer.lexicalpreservation.LexicalPreservingPrinter;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
public class LexicalPreservationComplete {

    public static void main(String[] args) {
        String code = "// Hey, this is a comment\n\n\n// Another one\n\nclass A { }";
        CompilationUnit cu = StaticJavaParser.parse(code);
        LexicalPreservingPrinter.setup(cu);

        System.out.println(LexicalPreservingPrinter.print(cu));

        System.out.println("----------------");

        ClassOrInterfaceDeclaration myClass = cu.getClassByName("A").get();
        myClass.setName("MyNewClassName");
        System.out.println(LexicalPreservingPrinter.print(cu));

        System.out.println("----------------");

        myClass = cu.getClassByName("MyNewClassName").get();
        myClass.setName("MyNewClassName");
        myClass.addModifier(Modifier.Keyword.PUBLIC);
        System.out.println(LexicalPreservingPrinter.print(cu));

        System.out.println("----------------");

        myClass = cu.getClassByName("MyNewClassName").get();
        myClass.setName("MyNewClassName");
        myClass.addModifier(Modifier.Keyword.PUBLIC);
        cu.setPackageDeclaration("org.javaparser.samples");
        System.out.println(LexicalPreservingPrinter.print(cu));
    }
    
}
```

- 输出

```
// Hey, this is a comment


// Another one

class A { }
----------------
// Hey, this is a comment


// Another one

class MyNewClassName { }
----------------
// Hey, this is a comment


// Another one

public class MyNewClassName { }
----------------
package org.javaparser.samples;

// Hey, this is a comment


// Another one

public class MyNewClassName { }
```

# 工作原理：NodeText和具体语法

模型我们之前曾描述过，词法保留会存储初始文本，这在某种程度上简化了所发生的事情。

词汇保留的实际作用是为每个节点。

NodeText基本上是子代的令牌或占位符的列表。

例如，如果考虑以下方法声明：

```java
void foo（int a）{}
```

它的 NodeText 看起来像这样：

![image](https://user-images.githubusercontent.com/18375710/83344766-d465df00-a33d-11ea-8e41-88e7f722ca22.png)

如果我们排序不同的元素：

```
1. child(void)
2. token(space)
3. child(name)
4. token(lparen)
5. child(param#0)
6. token(rparen)
7. token(space)
8. child(body)
```

现在，假设您向此方法添加了一个参数。 

会发生什么？

我们将需要更新与MethodDeclaration关联的NodeText。

词法保护设置将观察者附加到所有节点。 每次更改时，我们都会收到通知，并计算更改后该节点的外观，并将这些修改更新为NodeText。

为了了解更改后Node的外观，我们使用了ConcreteSyntaxModel。

## 什么是具体语法模型？

您可能想知道具体语法模型（CSM）是什么：它是节点通常应具有的外观的定义。

具体语法模型向我们解释了如何“解析” AST节点并将其转换为文本。

MethodDeclaration的ConcreteSyntaxModel如下所示：

```java
concreteSyntaxModelByClass.put(MethodDeclaration.class, sequence(
orphanCommentsBeforeThis(),
comment(),
memberAnnotations(),
modifiers(),
conditional(ObservableProperty.DEFAULT, FLAG, sequence(token(GeneratedJavaPa\
rserConstants._DEFAULT), space())),
typeParameters(),
child(ObservableProperty.TYPE),
space(),
child(ObservableProperty.NAME),
token(GeneratedJavaParserConstants.LPAREN),
list(ObservableProperty.PARAMETERS, sequence(comma(), space()), none(), none\
()),
token(GeneratedJavaParserConstants.RPAREN),
list(ObservableProperty.THROWN_EXCEPTIONS, sequence(comma(), space()),
sequence(space(), token(GeneratedJavaParserConstants.THROWS), space(\
)), none()),
conditional(ObservableProperty.BODY, IS_PRESENT,sequence(space(), child(ObservableProperty.BODY)), semicolon())));
```

这非常复杂，因为它考虑了可以构成 MethodDeclaration 的所有潜在元素以及如何呈现所有这些元素。

考虑这一行，例如：

```java
list(ObservableProperty.PARAMETERS, sequence(comma(), space()), none(), none()),
```

这告诉我们，理想情况下，MethodDeclaration的参数应以一个逗号和一个空格分隔。

或这些行：

```java
conditional(ObservableProperty.BODY, IS_PRESENT, sequence(space(), child(ObservableProperty.BODY)), semicolon())
```

这告诉我们，如果存在该方法的主体，则应打印该文本，并在其前面加上空格，并在其后加上分号。

如果我们使用CSM来计算更改前节点的外观，我们将得到以下信息：

```
1. child(void)
2. child(name)
3. token(lparen)
4. child(param#0)
5. token(rparen)
6. token(space)
7. child(body)
```

更改后，它看起来像这样：

```
1. child(void)
2. child(name)
3. token(lparen)
4. child(param#0)
5. token(comma)
6. token(space)
7. child(param#1)
8. token(rparen)
9. token(space)
10. child(body)
```

## 计算CSM之间的差异

此时，将获得两个计算出的CSM之间的差异，并且基本上看起来像：

```
1. keep: child(void)
2. keep: child(name)
3. keep: token(lparen)
4. keep: child(param#0)
5. add: token(comma)
6. add: token(space)
7. add: child(param#1)
8. keep: token(rparen)
9. keep: token(space)
10. keep: child(body)
```

最后，将这种差异应用于为节点存储的NodeText：遍历NodeText，直到找到必须添加或删除新元素的位置。

在那里，我们将应用所需的更改。

在这种情况下，我们为 child 添加一个逗号，一个空格和一个占位符（第二个参数）。

应用差异并不容易，因为我们要忽略NodeText中存在的一些空白和注释。

# 总结

长期以来，JavaParser仅支持漂亮的打印，并且对于许多用途来说，它过去一直是一种合理的选择。

相反，某些用户希望在保留现有代码格式的同时进行修改：

保留确切的空格，将注释精确保留在原处。

此布局信息对于编译器可能毫无意义，但对开发人员而言很重要。

对于这些用法，我们创建了词法保留，这是在3.1.1版中首次引入的。

这两种选择应该可以满足您的所有需求。 如果不是，请与我们联系或在GitHub上创建新期刊。

# 参考资料

官方语法书

* any list
{:toc}