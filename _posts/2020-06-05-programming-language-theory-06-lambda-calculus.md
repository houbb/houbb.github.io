---
layout: post
title: Programming language theory 编程语言理论-06-λ演算（英语：lambda calculus，λ-calculus）
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

# λ演算

λ演算（英语：lambda calculus，λ-calculus）是一套从数学逻辑中发展，以变量绑定和替换的规则，来研究函数如何抽象化定义、函数如何被应用以及递归的形式系统。它由数学家阿隆佐·邱奇在20世纪30年代首次发表。

lambda演算作为一种广泛用途的计算模型，可以清晰地定义什么是一个可计算函数，而任何可计算函数都能以这种形式表达和求值，它能模拟单一磁带图灵机的计算过程；尽管如此，lambda演算强调的是变换规则的运用，而非实现它们的具体机器。

lambda演算可比拟是最根本的编程语言，它包括了一条变换规则（变量替换）和一条将函数抽象化定义的方式。

因此普遍公认是一种更接近软件而非硬件的方式。对函数式编程语言造成很大影响，比如Lisp、ML语言和Haskell语言。在1936年邱奇利用λ演算给出了对于判定性问题（Entscheidungsproblem）的否定：关于两个lambda表达式是否等价的命题，无法由一个“通用的算法”判断，这是不可判定性能够证明的头一个问题，甚至还在停机问题之先。

lambda演算包括了建构lambda项，和对lambda项执行归约的操作。在最简单的lambda演算中，只使用以下的规则来建构lambda项：

| 语法	 | 名称	  | 描述 |
|:----|:----|:----|
| x	      | 变量	  | 用字符或字符串来表示参数或者数学上的值或者表示逻辑上的值 |
| (λx.M) |	抽象化	| 一个完整的函数定义（M是一个 lambda 项），在表达式中的 x 都会绑定为变量 x。 |
| (M N)	  | 应用	  | 将函数M作用于参数N。 M 和 N 是 lambda 项。 |

产生了诸如：(λx.λy.(λz.(λx.zx)(λy.zy))(x y))的表达式。如果表达式是明确而没有歧义的，则括号可以省略。

对于某些应用，其中可能包括了逻辑和数学的常量以及相关操作。

本文讨论的是邱奇的“无类型lambda演算”，此后，已经研究出来了一些有类型lambda演算。

# 解释与应用

λ演算是图灵完备的，也就是说，这是一个可以用于模拟任何图灵机的通用模型。

[1] λ也被用在λ表达式和λ项中，用来表示将一个变量绑定在一个函数上。

λ演算可以是有类型或者无类型的，在有类型λ演算中（上文所述是无类型的），函数只能在参数类型和输入类型符合时被应用。有类型λ演算比无类型λ演算要弱——后者是这个条目的主要部分——因为有类型的λ运算能表达的比无类型λ演算少；与此同时，前者使得更多定理能被证明。例如，在简单类型λ演算中，运算总是能够停止，然而无类型λ演算中这是不一定的（因为停机问题）。目前有许多种有类型λ演算的一个原因是它们被期望能做到更多（做到某些以前的有类型λ演算做不到的）的同时又希望能用以证明更多定理。

λ演算在数学、哲学[2]、语言学[3][4]和计算机科学[5]中都有许多应用。它在编程语言理论中占有重要地位，函数式编程实现了λ演算支持。λ演算在范畴论中也是一个研究热点。

# 历史

作为对数学基础研究的一部分，数学家阿隆佐·邱奇在20世纪30年代提出了λ演算。[7][8] 但最初的λ演算系统被证明是逻辑上不自洽的——在1935年斯蒂芬·科尔·克莱尼和J. B. Rosser举出了Kleene-Rosser悖论。[9][10]

随后，在1936年邱奇把那个版本的关于计算的部分抽出独立发表—现在这被称为无类型λ演算。[11] 在1940年，他创立了一个计算能力更弱但是逻辑上自洽的系统，这被称为简单类型λ演算。[12]

直到1960年，λ演算与编程语言的关系被确立了；在这之前它只是一个范式。由于理查德·蒙塔古和其他语言学家将λ演算应用于自然语言语法的研究，λ演算已经开始在语言学[13]和计算机科学学界拥有一席之地。[14]

至于为何邱奇选择λ作为符号，连他本人的解释也互相矛盾：最初是在1964年的一封信中，他明确解释称这是来源于《数学原理》一书中的类抽象符号（脱字符），为了方便阅读，他首先将其换成逻辑与符号（ ∧ ）作为区分，然后又改成形状类似的λ。他在1984年又重申了这一点，但再后来他又表示选择λ纯粹是偶然[15]。

# 参考资料

https://zh.wikipedia.org/wiki/%CE%9B%E6%BC%94%E7%AE%97

* any list
{:toc}