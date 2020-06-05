---
layout: post
title: 编译原理系列-02-mini java
date:  2020-6-4 13:34:28 +0800
categories: [Java]
tags: [java, compiling-principle, sf]
published: true
---

# mini java

重新写一个 java 时间有限，只能先实现一个核心功能。

所以需要对 java 多一些特性的简化。

文本主要收集一些网上资料，做下简单的整理。

# EBNF Grammar for Mini-Java

```
Goal	=	MainClass, { ClassDeclaration }, EOF;
MainClass	=	"class", Identifier, "{", "public", "static", "void", "main", "(", "String", "[", "]", Identifier, ")", "{", Statement, "}", "}";
ClassDeclaration	=	"class", Identifier, [ "extends", Identifier ], "{", { VarDeclaration }, { MethodDeclaration } "}";
VarDeclaration	=	Type, Identifier, ";";
MethodDeclaration	=	"public", Type, Identifier, "(", [ Type, Identifier, { ",", Type, Identifier }, ], ")", "{", { VarDeclaration }, { Statement }, "return", Expression, ";", "}";
Type	=	"int", "[", "]"
|	"boolean"
|	"int"
|	Identifier
;	
Statement	=	"{", { Statement }, "}"
|	"if", "(", Expression, ")", Statement, "else", Statement
|	"while", "(", Expression, ")", Statement
|	"System.out.println", "(" , Expression, ")", ";"
|	Identifier, "=", Expression, ";"
|	Identifier, "[", Expression, "]", "=", Expression, ";"
;	
Expression	=	Expression , ( "&&" | "<" | "+" | "-" | "*" ) , Expression
|	Expression, "[", Expression, "]"
|	Expression, ".", "length"
|	Expression, ".", Identifier, "(", [ Expression { ",", Expression } ], ")"
|	IntegerLiteral
|	"true"
|	"false"
|	Identifier
|	"this"
|	"new", "int", "[", Expression, "]"
|	"new", Identifier ,"(" ,")"
|	"!", Expression
|	"(", Expression, ")"
;	
Identifier	is	one or more letters, digits, and underscores, starting with a letter
IntegerLiteral	is	one or more decimal digits
EOF	is	a distinguished token returned by the scanner at end-of-file
```

## EBNF

```
ISO/IEC 14977: 1996(E)
Terminal symbols are quoted
[ and ] indicate optional symbols
{ and } indicate repetition
( and ) group items together; the other brackets do too
```

# MiniJava字符集

MiniJava程序是由US-ASCII字符组成的文本文件。 （这与Java不同。）

# Java注释

Comments are `//` to end of line and `/* ... */`, just as in Java. 

The `/* ... */` comments do not nest in Java. 

For example,

```java
/*
   One commment
   /*  Nested comment */
   Bad things will happen
*/
```

第二个 `/*` 将被忽略（在注释中），第一个 `*/` 将终止注释。 

现在，“不好的事情将会发生”，因为剩下的文字不是注释。

Appel，第2版，第484页，将MiniJava中的注释描述为可嵌套的。 

对于扫描仪来说，这是一个有趣的练习，但不正确。

MiniJava应该是Java的子集。 

在实际中，每个非法Java程序都应该是非法Mini-Java程序。 

例如，

```java
class Main {
  void m() {
    int goto = 3; // 'goto' is a reserved word in Java
  }
}
```

与Java中一样，带有未初始化变量的Mini-Java程序应该是非法的。 我认为不可能用不可达的语句（在Java中是非法的）编写Mini-Java程序。

## Java关键字

MiniJava中没有使用许多Java关键字。 有关Java关键字的详细信息，请查阅Java 13语言规范。

## Java的简化

为了简化编程项目，我们进行了以下简化：

没有Unicode逸出。

没有文字为null。

没有测试原始相等性或引用相等性。

方法中的五个或更少的形式参数。

没有方法被覆盖。

没有方法被重载。

（但是，如果需要，您可以包括这些功能。）

但是，最小的Mini-Java编译器必须包含以下功能：

子类和子类多态性。

继承的字段和方法。

# 参考资料

《现代编译原理 java》

[mini_java_grammar](https://cs.fit.edu/~ryan/cse4251/mini_java_grammar.html)

[mini java 系列](https://blog.csdn.net/sandy_xu/article/details/320856)

* any list
{:toc}