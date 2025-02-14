---
layout: post
title: Programming language theory 编程语言理论-01-overview 概览 
date:  2020-6-5 17:42:59 +0800
categories: [Theory]
tags: [programming-language-theory, sh]
published: true
---

# 编程语言理论系列

[Programming language theory 编程语言理论-01-overview 概览](https://houbb.github.io/2020/06/05/programming-language-theory-01-overivew)

[Programming language theory 编程语言理论-02-求值策略 Evaluation strategy](https://houbb.github.io/2020/06/05/programming-language-theory-02-evaluation-strategy)

[Programming language theory 编程语言理论-03-及早求值（英语：Eager evaluation）又译热切求值，也被称为贪婪求值（Greedy evaluation）](https://houbb.github.io/2020/06/05/programming-language-theory-03-eager-evaluation)

[Programming language theory 编程语言理论-03-惰性求值 Lazy Evaluation](https://houbb.github.io/2020/06/05/programming-language-theory-03-lazy-evaluation)

[Programming language theory 编程语言理论-03-短路求值（Short-circuit evaluation; minimal evaluation; McCarthy evaluation; 又称最小化求值）](https://houbb.github.io/2020/06/05/programming-language-theory-03-min-evaluation)

[Programming language theory 编程语言理论-04-组合子逻辑](https://houbb.github.io/2020/06/05/programming-language-theory-04-combine)

[Programming language theory 编程语言理论-05-curring 柯里化](https://houbb.github.io/2020/06/05/programming-language-theory-05-curring)

[Programming language theory 编程语言理论-06-λ演算（英语：lambda calculus，λ-calculus）](https://houbb.github.io/2020/06/05/programming-language-theory-06-lambda-calculus)

# 编程语言理论

编程语言理论（英语：Programming language theory）是计算机科学的一个分支，研究编程语言的设计、实现、分析、描述和分类及其各自的特点。

它属于计算机科学，既依赖又影响着数学、软件工程、语言学，甚至认知科学。

# 历史

从某种角度来看，编程语言理论的历史，甚至比编程语言本身的发展更久远。

尽管阿隆佐·邱奇与斯蒂芬·科尔·克莱尼在1930年代发明的Lambda演算被一些人认为是世界上第一门编程语言，但其初衷是用于对计算进行建模，而不是作为一种程序员向计算机系统描述算法的手段。

许多现代的函数式编程语言都声称自己是为Lambda演算提供了“一点包装”，并能轻松地以其解释。

世界上第一门编程语言是由康拉德·楚泽于1940年代设计的Plankalkül，但其直到1972年才广为人知，更是到1998年才被实现。

Fortran则是第一门大获成功的高级编程语言，由约翰·巴科斯领导的IBM研究者们在1954-1957年间实现。

Fortran的成功使一些科学家联合起来研究一种“通用的”计算机语言，并最终带来了ALGOL 58；麻省理工学院的约翰·麦卡锡则开发了Lisp，其为第一门源自学术界而获取成功的编程语言。

随着1960年代这些起初的尝试获得成功，编程语言逐渐成为热门的研究对象，并延续至今。

# 子学科及相关领域

编程语言理论中存在着几个研究领域,或者对编程语言理论产生了深远的影响，其中许多有相当大的重叠。

此外，PLT还利用了数学的许多其他分支,包括可计算性理论、类型论和集合论。

## 形式语义学

在计算理论中，形式语义学是关注计算的模式和程序设计语言的含义的严格的数学研究的领域。

语言的形式语义是用数学模型去表达该语言描述的可能的计算来给出的。

形式语义学（formal semantics），是程序设计理论的组成部分，以数学为工具，利用符号和公式，精确地定义和解释计算机程序设计语言的语义，使语义形式化的学科。

提供程序设计语言的形式语义的方法很多，其中主要类别有：

- 指称语义学，着重于语言的执行结果而非过程，包括域理论；

- 操作语义学，例如抽象机（象SECD抽象机），着重于描述语言的过程；

- 公理语义学，如 谓词变换语义学和代数语义学。

## 类型论

类型论提供了设计分析和研究类型系统的形式基础。实际上，很多计算机科学家使用术语“类型论”来称呼对编程语言的类型语言的形式研究，尽管有些人把它限制于对更加抽象的形式化如有类型lambda演算的研究。

## 程序分析

程序分析是指自动分析一个程序的包括正确性、健壮性、安全性和活跃性等特征的过程。 程序分析主要研究两大领域：程序的优化和程序的正确性。前者研究如何提升程序性能并且降低程序的资源占用，后者研究如何确保程序完成预期的任务。

## 比较程序语言分析

比较编程语言分析旨在根据编程语言的特点将其分类为不同类型，编程语言的大类通常被称为编程范型。

## 泛型和元编程

是指某类计算机程序的编写，这类计算机程序编写或者操纵其它程序（或者自身）作为它们的数据，或者在运行时完成部分本应在编译时完成的工作。

## 领域特定语言

指专注于某个应用程序领域的计算机语言。

## 编译原理

编译原理是编写编译器的理论。编译器的操作传统上分为语法分析(扫描和解析)、语义分析(确定程序应该做什么)、优化(根据某些指标改进程序的性能，通常是执行速度)和代码生成(用某种目标语言生成和输出等价的程序(通常是CPU的指令集)。

## 运行时系统

指一种把半编译的运行码在目标机器上运行的环境，介乎编译器及解释器的运行方式。包括虚拟机、垃圾回收和外部函数接口。

# 远程求值

在计算机科学中, 远程求值泛指任何包括将可执行软件程序从客户端传输到服务计算机并在服务器上执行的技术。程序结束后，执行的结果被发送到客户端。

远程求值是属于移动代码和Web服务技术。远程求值的一个例子是网格计算：可执行任务被发送到网格中的一个特定计算机上。

任务执行完成后，执行结果被发回到客户端。客户端接着需要将多个并发计算的子任务的不同结果组装成一个结果。

# 主动修改

主动修改是计算机编程中，在一项的值变化时，其依赖项的值随之变化的行为模式。

与惰性求值（Lazy Evaluation，又译为惰性计算、懒惰求值）相对。

假设数据项A的值依赖于数据项B的值。即B的值发生变化将导致A的值的变化。主动修改是在B变化后立即修改A。被动修改或称惰性求值是在取A的值时才修改A。一个具体例子是对于GUI应用程序，子菜单项的内容列表依赖于程序的状态，可以在程序状态改变时立即修改子菜单的列表（主动修改），也可以在仅当菜单被调用时才修改（被动修改）。[1]

另一个例子是：可以在底层数据改变时立即修改视觉显示，也可以仅在点击"redraw"按钮后修改。[2]

事务处理中的直接修改与延迟修改也是这种例子。

# 参考资料

wiki

https://zh.wikipedia.org/wiki/%E7%A8%8B%E5%BC%8F%E8%AA%9E%E8%A8%80%E7%90%86%E8%AB%96

https://zh.wikipedia.org/wiki/%E4%B8%BB%E5%8A%A8%E4%BF%AE%E6%94%B9

* any list
{:toc}