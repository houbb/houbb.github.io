---
layout: post
title: Programming language theory 编程语言理论-03-及早求值（英语：Eager evaluation）又译热切求值，也被称为贪婪求值（Greedy evaluation）
date:  2020-6-5 17:42:59 +0800
categories: [Theory]
tags: [programming-language-theory, sh]
published: true
---

# 及早求值

及早求值（英语：Eager evaluation）又译热切求值，也被称为贪婪求值（Greedy evaluation），是多数传统编程语言的求值策略。

在及早求值中，表达式在它被约束到变量的时候就立即求值。这在简单编程语言中作为低层策略是更有效率的，因为不需要建造和管理表示未求值的表达式的中介数据结构。

及早求值的优点在于节省内存和提高执行速度，比如下面的 Basic 代码：

```c
x = 5 + 3 * (1 + 5 ^ 2)
print x
print x + 2
```

因为第一行代码 x = 5 + 3 * (1 + 5 ^ 2) 执行完成后 x 被赋值并存储为 83，表达式所占用的空间可以立即释放掉，所以节省了内存空间。

接下来的两行代码执行时都需要使用 x 的值，此时 x 是可以直接用于运算的数值 83 而不是需要计算的表达式 5 + 3 * (1 + 5 ^ 2)，所以减少了一次计算过程，提高了执行效率。

对于惰性求值的编程语言，由于记忆化（memoization）特性，求值过程与之不同。

# 参考资料

https://zh.wikipedia.org/wiki/%E5%8F%8A%E6%97%A9%E6%B1%82%E5%80%BC

* any list
{:toc}