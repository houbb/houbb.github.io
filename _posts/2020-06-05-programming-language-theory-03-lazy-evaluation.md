---
layout: post
title: Programming language theory 编程语言理论-03-惰性求值 Lazy Evaluation
date:  2020-6-5 17:42:59 +0800
categories: [Theory]
tags: [programming-language-theory, sh]
published: true
---

# 惰性求值

在编程语言理论中，惰性求值（英语：Lazy Evaluation），又译为惰性计算、懒惰求值，也称为传需求调用（call-by-need），是计算机编程中的一个概念，目的是要最小化计算机要做的工作。

惰性计算的最重要的好处是它可以在空间复杂度上得到极大的优化，从而可以轻易构造一个无限大的数据类型。

惰性求值的相反是及早求值，这是一个大多数编程语言，如C语言，所使用的缺省计算方式。

由于翻译问题，该词在不同语境下有两个相关而又有区别的含意，可以表示为“延迟求值”和“最小化求值”，本条目主要内容为延迟求值，后者请参见最小化计算条目。

# 延迟求值

延迟求值特别用于匿名式函数编程，在使用延迟求值的时候，表达式不在它被绑定到变量之后就立即求值，而是在该值被取用的时候求值，也就是说，语句如x:=expression; (把一个表达式的结果赋值给一个变量)明显的调用这个表达式被计算并把结果放置到x中，但是先不管实际在x中的是什么，直到通过后面的表达式中到x的引用而有了对它的值的需求的时候，而后面表达式自身的求值也可以被延迟，最终为了生成让外界看到的某个符号而计算这个快速增长的依赖树。

某些编程语言默认进行惰性求值（如Miranda和Haskell），另一些语言提供函数或特殊语法来延迟求值（如Scheme的delay或force）。

延迟求值的一个好处是**能够建立可计算的无限列表而没有妨碍计算的无限循环或大小问题**。

例如，可以建立生成无限斐波那契数列表的函数（经常叫做“流”）。

第n个斐波那契数的计算仅是从这个无限列表上提取出这个元素，它只要求计算这个列表的前n个成员。

例如，在Haskell中，斐波纳契数的列表可以写为

```
fibs = 0 : 1 : zipWith (+) fibs (tail fibs)
```

在Haskell语法中，":"向列表头部添加一个元素，tail返回去掉第一个元素的一个列表，而zipWith使用指定的函数（这里是加法）来组合两个列表的对应元素生成第三个列表。

假定编程者是仔细的，只有生成特定结果所需要的值才被求值。

但是特定计算可能导致程序尝试对无限数目个元素进行求值；例如，求列表的长度或使用fold运算对列表的元素求和将导致程序不能终止或耗尽内存。




# 参考资料

wiki

https://zh.wikipedia.org/wiki/%E6%83%B0%E6%80%A7%E6%B1%82%E5%80%BC

函数式编程的Java编码实践：利用惰性写出高性能且抽象的代码: https://www.cnblogs.com/yunqishequ/p/15522944.html

https://blog.csdn.net/SuperBins/article/details/108231518

13万字详细分析JDK中Stream的实现原理: https://www.cnblogs.com/throwable/p/15371609.html

函数式编程的 Java 编码实践：利用惰性写出高性能且抽象的代码: http://www.uml.org.cn/j2ee/202204144.asp

JAVA进阶之Stream实现原理: https://www.jianshu.com/p/c2115f4a71ed

了解Java Stream流操作: https://hongspell.site/java-stream%E6%93%8D%E4%BD%9C/

* any list
{:toc}