---
layout: post
title:  Solidity-13-types Operators
date:  2022-05-22 09:22:02 +0800
categories: [Lang]
tags: [lang, solidity, sh]
published: true
---

# Operators

即使两个操作数的类型不同，也可以应用算术和位运算符。

例如，您可以计算 y = x + z，其中 x 是 uint8，z 的类型为 int32。在这些情况下，将使用以下机制来确定计算运算的类型（这在溢出的情况下很重要）和运算符结果的类型：

1. 如果右操作数的类型可以隐式转换为左操作数的类型，则使用左操作数的类型，

2. 如果左操作数的类型可以隐式转换为右操作数的类型，则使用右操作数的类型，

3. 否则，该操作是不允许的。

如果其中一个操作数是文字数字，则首先将其转换为其“移动类型”，这是可以保存该值的最小类型（相同位宽的无符号类型被认为比有符号类型“更小”） .如果两者都是文字数字，则以任意精度计算操作。

运算符的结果类型与执行运算的类型相同，但结果始终为 bool 的比较运算符除外。

运算符 `**`（求幂）、`<<` 和 `>>` 将左操作数的类型用于运算和结果。

# 三元运算符 Ternary Operator

三元运算符用于 `<expression> ? <trueExpression> : <falseExpression>`.

它根据主 `<expression>` 的评估结果评估后两个给定表达式之一。

三元运算符的结果没有有理数类型，即使它的所有操作数都是有理数文字。结果类型由两个操作数的类型以与上述相同的方式确定，如果需要，首先转换为它们的移动类型。

因此，255 + (true ? 1 : 0) 将由于算术溢出而恢复。原因是 (true ? 1 : 0) 是 uint8 类型，这会强制在 uint8 中执行加法，并且 256 超出了该类型允许的范围。

另一个结果是像 1.5 + 1.5 这样的表达式是有效的，但 1.5 + (true ? 1.5 : 2.5) 不是。

这是因为前者是一个无限精确计算的有理表达式，只有它的最终值才重要。后者涉及将小数有理数转换为整数，目前是不允许的。

# 复合和递增/递减运算符

如果 a 是 LValue（即变量或可以分配给的东西），则以下运算符可用作简写：

a += e 等价于 a = a + e。 

运算符 -=、*=、/=、%=、|=、&=、^=、<<= 和 >>= 是相应定义的。 

a++ 和 a-- 等价于 a += 1 / a -= 1 但表达式本身仍然具有先前的 a 值。

相反，--a 和 ++a 对 a 具有相同的效果，但返回更改后的值。

# 删除 delete

delete a 将类型的初始值分配给 a。 IE。

对于整数，它等价于 a = 0，但它也可用于数组，其中它分配长度为零的动态数组或相同长度的静态数组，所有元素都设置为其初始值。 

delete a[x] 删除数组索引 x 处的项目，并且保留所有其他元素和数组的长度不变。这尤其意味着它会在阵列中留下空隙。如果您打算删除项目，映射可能是更好的选择。

对于结构，它分配一个所有成员都重置的结构。

换句话说，a after delete a 的值与声明 a 时没有赋值相同，但需要注意以下几点：

delete 对映射没有影响（因为映射的键可能是任意的并且通常是未知的）。因此，如果您删除一个结构，它将重置所有不是映射的成员，并且还会递归到成员中，除非它们是映射。但是，可以删除单个键及其映射到的内容：如果 a 是映射，则 delete a[x] 将删除存储在 x 处的值。

需要注意的是，**删除 a 的行为实际上类似于对 a 的赋值，即它在 a 中存储了一个新对象**。

当 a 是引用变量时，这种区别是可见的：它只会重置 a 本身，而不是它之前引用的值。

```js
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.0 <0.9.0;

contract DeleteExample {
    uint data;
    uint[] dataArray;

    function f() public {
        uint x = data;
        delete x; // sets x to 0, does not affect data
        delete data; // sets data to 0, does not affect x
        uint[] storage y = dataArray;
        delete dataArray; // this sets dataArray.length to zero, but as uint[] is a complex object, also
        // y is affected which is an alias to the storage object
        // On the other hand: "delete y" is not valid, as assignments to local variables
        // referencing storage objects can only be made from existing storage objects.
        assert(y.length == 0);
    }
}
```

# Order of Precedence of Operators

这玩意儿不需要记忆。

![优先级](https://docs.soliditylang.org/en/latest/types.html#order-of-precedence-of-operators)

# 参考资料

https://docs.soliditylang.org/en/latest/types.html#operators

* any list
{:toc}