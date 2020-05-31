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

# 个人愿景

通过学习 AST 和 javaParser 等优秀框架的精华，提炼一个可以非常方便生成 class 文件的工具。

## 思路

源文件==》拓展后的文件==》AST 语法树==》class 文件覆盖

## 其他

后续学习下 java-sandbox 的思想和实现方式，拓展一下 AOP 的实现种类。

灵活强大。

# 拓展阅读

## ASM 

[java assist]()

[cglib]()

## java 源码

[java poet]()


# 参考资料

[基于AST抽象语法树实现删除java/android代码中的Log.*输出,主要运用在apk发布阶段](https://github.com/stormzsl/AndroidDeleteLog)

[解析表达式抽象语法树](https://github.com/LaplaceDemon/light-expr)

* any list
{:toc}