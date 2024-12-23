---
layout: post
title: Programming language theory 编程语言理论-04-组合子逻辑 
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

# 组合子逻辑

组合子逻辑是Moses Schönfinkel和哈斯凯尔·加里介入的一种符号系统，用来消除数理逻辑中对变量的需要。它最近在计算机科学中被用做计算的理论模型和设计函数式编程语言的基础。它所基于的组合子是只使用函数应用或早先定义的组合子来定义从它们的参数得出的结果的高阶函数。

# 数学中的组合子逻辑

组合子逻辑意图作为简单的元逻辑，它能澄清在逻辑符号中的量化变量的意义，并真正的消除对它们的需要。消除量化变量的另一种方式是蒯因的谓词函子。尽管多数组合子逻辑系统超出了一阶逻辑的表达能力，蒯因的谓词函子的表达能力等价于一阶逻辑（Quine [1960] 1966）。

组合子逻辑的最初发明者Schönfinkel，在1929年之后基本停止了发表著作。Curry在1927年[1]晚期于哥廷根大学读博士的时候重新发现了组合子。在1930年代后期，邱奇和他的学生在普林斯顿发明了一个竞争的函数抽象的形式化，就是lambda演算，它比组合子逻辑更加流行。这些历史上的意外事件的结果是直到在1960年代和1970年代理论计算机科学开始感兴趣于组合子逻辑，关于这个主题的几乎所有工作都是哈斯凯尔·柯里和他的学生们，或比利时的Robert Feys做的。Curry和Feys (1958)和Curry等人（1972） 纵览了组合子逻辑的早期历史。组合子逻辑和lambda演算的更现代的平行处置参见Barendregt（1984），他还评论了达纳·斯科特在1960年代和1970年代为组合子逻辑设计的模型。

# 计算中的组合子逻辑

在计算机科学中，组合子逻辑被用做可计算性理论中计算和证明论的简化模型。这个理论尽管简单，但捕获了计算本质的很多根本特征。

组合子逻辑可以被看作是lambda演算的变体，它把lambda表达式（用来允许函数抽象）替代为组合子的有限集合，它们是不包含自由变量的原始函数。很容易把lambda表达式变换成组合子表达式，并且因为组合子归约比lambda归约要简单，它已经被用做用软件中的某些非严格的函数式编程语言和硬件的图归约机的实现基础。

还可以用很多其他方式来看待它，很多早年的论文证明了各种组合子到各种逻辑公理的等价性[Hindley and Meredith, 1990]。

# chat

## Q: 详细介绍一下 编程语言理论 中的 组合子逻辑

组合子逻辑是编程语言理论中的一个重要概念，它涉及到函数式编程和数理逻辑的结合。

它的核心思想是使用一组固定的函数（组合子），通过它们的组合来构建复杂的功能和逻辑。

在组合子逻辑中，函数被视为一等公民，这意味着函数可以像任何其他数据类型一样进行操作，包括作为参数传递给其他函数、从函数返回等。组合子是一种特殊的函数，它们接受函数作为参数，并返回一个新的函数。这种函数的组合性质使得它们可以用来构建更复杂的函数，从而实现各种计算和逻辑操作。

组合子逻辑通常基于 lambda 演算，lambda 演算是一种简单而强大的形式化系统，它描述了函数的计算和组合。Lambda 演算中的函数被表示为匿名函数，并且通过函数应用和抽象（函数定义）来构建更复杂的函数。组合子逻辑扩展了 lambda 演算，引入了一些固定的函数，以便更方便地表达和组合函数。

组合子逻辑的一些常见组合子包括：

1. **恒等子（Identity Combinator）：**
   表示为 `I`，它接受一个参数并返回该参数本身。即 `I x = x`。

2. **应用子（Application Combinator）：**
   表示为 `A`，它接受两个参数，第一个参数是一个函数，第二个参数是函数的参数。即 `A f x = f x`。

3. **组合子（Composition Combinator）：**
   表示为 `B`，它接受三个参数，分别是两个函数和一个参数，将这两个函数先后应用于参数。即 `B f g x = f (g x)`。

这些组合子可以通过不断地嵌套和组合来构建更复杂的函数。组合子逻辑的优势在于它的简洁性和表达能力，通过组合子可以以一种清晰而优雅的方式来表示函数和逻辑，同时也有利于推导和证明程序的性质。在函数式编程语言和理论中，组合子逻辑被广泛应用，例如在 Haskell、Lambda 演算以及数学逻辑中。

## 给一个具体的编程例子来解释一下，比如 c 语言

在C语言中，虽然不是一个纯函数式编程语言，但我们可以模拟组合子逻辑的概念。

下面我将展示如何使用函数指针来实现组合子逻辑的一个简单例子。

假设我们有一组函数，这些函数将执行一些操作，比如加法、乘法和取反。我们将使用函数指针来表示这些函数，并定义一些组合子来组合这些函数。

```c
#include <stdio.h>

// 定义函数指针类型，表示一个接受一个整数参数并返回整数的函数
typedef int (*IntFunction)(int);

// 加法函数
int add(int x) {
    return x + 1;
}

// 乘法函数
int multiply(int x) {
    return x * 2;
}

// 取反函数
int negate(int x) {
    return -x;
}

// 定义组合子：恒等子
int identity(int x) {
    return x;
}

// 定义组合子：应用子
int apply(IntFunction f, int x) {
    return f(x);
}

// 定义组合子：组合子
int compose(IntFunction f, IntFunction g, int x) {
    return f(g(x));
}

int main() {
    int input = 3;
    int result;

    // 使用组合子来实现操作：(3 * 2) + 1
    result = compose(add, multiply, input);
    printf("(3 * 2) + 1 = %d\n", result);

    // 使用组合子来实现操作：-(3 * 2)
    result = compose(negate, multiply, input);
    printf("-(3 * 2) = %d\n", result);

    // 使用组合子来实现操作：(3 + 1) * 2
    result = compose(multiply, add, input);
    printf("(3 + 1) * 2 = %d\n", result);

    return 0;
}
```

在这个例子中，我们定义了三个基本函数（加法、乘法和取反），并且定义了三个组合子：恒等子、应用子和组合子。

然后我们使用这些组合子来组合基本函数，实现一些简单的操作。在 `main` 函数中，我们演示了如何使用组合子来构建复杂的操作，并输出结果。

虽然这个例子是在C语言中，但它展示了如何使用函数指针和函数组合来模拟组合子逻辑的概念。



# 参考资料

https://zh.wikipedia.org/wiki/%E7%BB%84%E5%90%88%E5%AD%90%E9%80%BB%E8%BE%91

* any list
{:toc}