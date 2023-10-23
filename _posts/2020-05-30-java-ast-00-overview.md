---
layout: post
title: java 编译时注解-AST 抽象语法树简介
date:  2020-5-29 14:24:18 +0800
categories: [java]
tags: [aop, ast, sh]
published: true
---

# AST 语法入门

以前使用 Lombok 一直觉得是一个很棒的设计，可以同时兼顾注解的遍历和运行的性能。

运行时注解一直因为性能问题被人诟病。

自己尝试写过一些框架，但是耗费了比较多的精力，因为 AST 语法不是很熟悉，所以准备整一个系列，入门学习下 AST 语法。

# AST(Abstract syntax tree) 抽象语法树

AST是javac编译器阶段对源代码进行词法语法分析之后，语义分析之前进行的操作。

用一个树形的结构表示源代码，源代码的每个元素映射到树上的节点。

## java 编译时的三个阶段

Java源文件->词法，语法分析-> 生成AST ->语义分析 -> 编译字节码，二进制文件。

通过操作 AST 可以实现 java 源代码的功能。

Rewrite、JavaParser 等开源工具可以帮助你更简单的操作AST。

1. 所有源文件会被解析成语法树。

2. 调用注解处理器。如果注解处理器产生了新的源文件，新文件也要进行编译。

3. 最后，语法树会被分析并转化成类文件。

## 启动加载

二进制文件==》intstrument 

jvm 加载运行时

# 个人愿景

通过学习 AST 和 javaParser 等优秀框架的精华，提炼一个可以非常方便生成 class 文件的工具。

## 思路

源文件==》拓展后的文件==》AST 语法树==》class 文件覆盖

## 其他

后续学习下 java-sandbox 的思想和实现方式，拓展一下 AOP 的实现种类。

灵活强大。

# 可以做什么？

## javadoc 源码级别生成

能否跨项目？把注释关联起来

## 项目信息分析

各种依赖关系 + 注释等等。

# 拓展阅读

## java 的字节码处理包有哪些 

在Java中，有几个常用的字节码处理库，它们可以帮助开发人员在运行时修改、生成和分析Java字节码。以下是其中一些常见的字节码处理库：

1. **ASM (ObjectWeb ASM)**: ASM 是一个轻量级的Java字节码操作框架，它可以用于在不加载类的情况下直接操作字节码。ASM提供了高性能的字节码操作接口，广泛用于Java字节码生成和转换。它允许您以非常底层的方式访问和修改字节码。

   官方网站：[ASM](https://asm.ow2.io/)

2. **Byte Buddy**: Byte Buddy 是一个用于生成和修改Java字节码的库。它提供了一个简单而强大的API，用于在运行时创建和修改Java类。Byte Buddy的API设计非常直观，使得动态字节码生成变得相当容易。

   官方网站：[Byte Buddy](http://bytebuddy.net/)

3. **Javassist**: Javassist 是一个用于在运行时编辑字节码的库。它提供了高级别的API，允许开发人员以更面向对象的方式编辑字节码。Javassist还提供了对类的池化访问，以及在不加载类的情况下进行字节码操作的能力。

   官方网站：[Javassist](https://www.javassist.org/)

4. **CGLIB**: CGLIB 是一个用于生成动态代理和增强Java类的库。它基于ASM库，可以在运行时生成子类或代理对象，以实现方法拦截和增强。CGLIB广泛用于AOP（面向切面编程）和其他动态代理场景。

   官方网站：[CGLIB](https://github.com/cglib/cglib)

5. **AspectJ**: AspectJ 是一个面向切面编程的扩展，它允许在编译时或运行时织入切面（Aspect）到Java类中。AspectJ提供了一种强大的方式来处理横切关注点（cross-cutting concerns），例如日志记录、性能监控和事务管理。

   官方网站：[AspectJ](https://www.eclipse.org/aspectj/)

这些库为Java开发人员提供了灵活的选项，可以在运行时操作字节码，实现动态性和元编程。选择哪个库取决于项目的需求和开发人员的偏好。

## javaparser 呢

**JavaParser** 是一个用于解析、操作和生成Java源代码的开源库。

与前述提到的字节码处理库不同，JavaParser 主要针对的是源代码级别的操作，而不是字节码级别的操作。它可以帮助开发人员在Java源代码的层面上进行操作，例如分析、修改、生成源代码等。

使用 JavaParser，您可以将Java源代码解析为抽象语法树（Abstract Syntax Tree，AST），然后在AST上执行各种操作。这使得开发人员可以编写代码来分析和修改源代码，而无需手动解析文本。

JavaParser 提供了易于使用的API，支持Java 1.0 到 Java 16 的语法。它可以用于各种任务，包括代码生成、代码重构、静态分析、代码检查和转换等。

以下是 JavaParser 的官方网站链接：

- 官方网站：[JavaParser](https://javaparser.org/)

使用 JavaParser，您可以轻松地在源代码级别上进行各种操作，使得代码分析和修改变得更加方便和高效。

### 思考

是否可以不拘泥于 maven 插件，直接通过 java-parser 解析生成对应的 java-doc 呢？



## Q3: 类似 javaParser 的开源工具

除了JavaParser，还有其他一些类似的开源工具，用于解析、操作和分析Java代码。以下是其中一些常见的开源Java代码解析工具：

1. **Eclipse JDT (Java Development Tools)**: Eclipse JDT 是 Eclipse IDE 中内置的Java开发工具，它提供了强大的Java代码解析和分析功能。您可以使用 JDT 提取源代码中的信息、进行语法分析和语义分析，以及执行其他与Java代码相关的操作。

   官方网站：[Eclipse JDT](https://www.eclipse.org/jdt/)

2. **ANTLR (ANother Tool for Language Recognition)**: ANTLR 是一个强大的语法分析器生成器，它可以用于解析多种语言，包括Java。您可以使用ANTLR定义自定义语法规则，并生成用于解析和分析源代码的解析器。

   官方网站：[ANTLR](https://www.antlr.org/)

3. **Javacc (Java Compiler Compiler)**: JavaCC 是一个用于生成Java编译器和解析器的工具。它允许您定义自定义语法规则，并生成用于解析源代码的Java解析器。

   官方网站：[JavaCC](https://javacc.github.io/javacc/)

4. **Spoon**: Spoon 是一个开源的Java程序分析和转换框架，它允许您在Java代码的层面上进行分析、修改和生成。Spoon 提供了一种高级别的API，用于操作Java代码，支持代码生成、代码转换和静态分析等任务。

   官方网站：[Spoon](https://spoon.gforge.inria.fr/)

5. **PMD**: PMD 是一个静态代码分析工具，它支持多种编程语言，包括Java。PMD 可以帮助您发现代码中的潜在问题、不良实践和性能问题。它提供了多种规则集，用于执行各种静态代码分析任务。

   官方网站：[PMD](https://pmd.github.io/)

这些工具提供了不同级别的功能和灵活性，可以根据您的需求选择适合的工具。无论是进行源代码解析、静态分析还是自定义语法分析，这些工具都可以帮助您实现相应的任务。

# 参考资料

[基于AST抽象语法树实现删除java/android代码中的Log.*输出,主要运用在apk发布阶段](https://github.com/stormzsl/AndroidDeleteLog)

[解析表达式抽象语法树](https://github.com/LaplaceDemon/light-expr)

* any list
{:toc}