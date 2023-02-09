---
layout: post
title: 【leetcode】014-29.两数相除 divide two integers 
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [Algorithm, data-struct, leetcode, sf]
published: true
---

## 29.整数相除

给定两个整数，被除数 dividend 和除数 divisor。

将两数相除，**要求不使用乘法、除法和 mod 运算符。**

返回被除数 dividend 除以除数 divisor 得到的商。

整数除法的结果应当截去（truncate）其小数部分，例如：truncate(8.345) = 8 以及 truncate(-2.7335) = -2


示例 1:

```
输入: dividend = 10, divisor = 3
输出: 3
解释: 10/3 = truncate(3.33333..) = truncate(3) = 3
```

示例 2:

```
输入: dividend = 7, divisor = -3
输出: -2
解释: 7/-3 = truncate(-2.33333..) = -2
```


提示：

1. 被除数和除数均为 32 位有符号整数。

2. 除数不为 0。

3. 假设我们的环境只能存储 32 位有符号整数，其数值范围是 [−2^31,  2^31 − 1]。本题中，如果除法结果溢出，则返回 2^31 − 1。

## 数学的方式

我们先实现一种比较容易理解的方式，可能不严格符合题意。

不过本人还算比较喜欢这种解法，算是提供了一种思路。

### 解法

```java
public int divide(int dividend, int divisor) {
    double logAns = Math.log(Math.abs((double) dividend)) - Math.log(Math.abs((double) divisor));
    double answer = Math.exp(logAns);

    return (int) ((dividend ^ divisor) < 0 ? -answer : answer);
}
```

### 性能

```
Runtime: 1 ms, faster than 100.00% of Java online submissions for Divide Two Integers.
Memory Usage: 36.9 MB, less than 42.42% of Java online submissions for Divide Two Integers.
```

性能本身是无可挑剔的。

### 解析

上述用到了[指数与对数](https://www.shuxuele.com/algebra/exponents-logarithms.html)的一个公式：

```
ln(A) - ln(B) = ln(A/B);
```

利用 e^x 与 lnx 函数互为反函数，曲线救国算出了结果。

`(dividend ^ divisor) < 0` 则通过位运算，计算出对应的结果是正数还是负数。

看完了这一种解法，我们来看一看更加符合题意的解法。

## 逼近

### 思路

这题是除法，所以先普及下除法术语

商公式是：`(被除数-余数)÷除数=商`，记作：被除数÷除数=商...余数，是一种数学术语。

在一个除法算式里，被除数、余数、除数和商的关系为：(被除数-余数)÷除数=商，记作：被除数÷除数=商...余数，

进而推导得出：商×除数+余数=被除数。

要求商，我们首先想到的是减法，能被减多少次，那么商就为多少，但是明显减法的效率太低

那么我们可以用位移法，因为计算机在做位移时效率特别高，向左移1相当于乘以2，向右位移1相当于除以2

我们可以把一个dividend（被除数）先除以2^n，n最初为31，不断减小n去试探,当某个n满足 `dividend/2^n>=divisor` 时，表示我们找到了一个足够大的数，这个数*divisor是不大于dividend的，所以我们就可以减去2^n个divisor，以此类推。

### 例子

我们可以以100/3为例

2^n是1，2，4，8...2^31这种数，当n为31时，这个数特别大，100/2^n是一个很小的数，肯定是小于3的，所以循环下来，

当n=5时，100/32=3, 刚好是大于等于3的，这时我们将100-32*3=4，也就是减去了32个3，接下来我们再处理4，同样手法可以再减去 3

所以一共是减去了33个3，所以商就是33

这其中得处理一些特殊的数，比如divisor是不能为0的，Integer.MIN_VALUE和Integer.MAX_VALUE

### java 实现

```java
public int divide(int dividend, int divisor) {
    if (dividend == 0) {
        return 0;
    }
    if (dividend == Integer.MIN_VALUE && divisor == -1) {
        return Integer.MAX_VALUE;
    }

    long t = Math.abs((long) dividend);
    long d = Math.abs((long) divisor);
    int result = 0;

    for (int i = 31; i >= 0; i--) {
        //找出足够大的数2^n*divisor
        if ((t >> i) >= d) {
            //将结果加上2^n
            result += 1 << i;
            //将被除数减去2^n*divisor
            t -= d << i;
        }
    }

    //符号相异取反
    return (dividend ^ divisor) < 0 ? -result : result;
}
```

最核心的几行代码，就是对上述思路的一个实现。

如果看不太明白，可以结合例子，自己 debug 一遍就懂了。

### 性能

```
Runtime: 1 ms, faster than 100.00% of Java online submissions for Divide Two Integers.
Memory Usage: 36.8 MB, less than 57.77% of Java online submissions for Divide Two Integers.
```

性能也是比较不错的。

看到这里你可能已经比较满意了，如果是面试的话，面试官应该也是比较满意的。

但是我不满意，为什么呢？

因为如果较真起来，这个解法还是不够严谨，因为引入了 long 类型，但是题目中要求数值范围是 `[−2^31,  2^31 − 1]`。

## int 版本

### java 实现

```java
public int divide(int A, int B) {
    if (A == 1 << 31 && B == -1) return (1 << 31) - 1;
    int a = Math.abs(A), b = Math.abs(B), res = 0;

    for (int x = 31; x >= 0; x--)
        if ((a >>> x) - b >= 0) {
            res += 1 << x;
            a -= b << x;
        }
    return (A > 0) == (B > 0) ? res : -res;
}
```

说明：

`>>>`：无符号右移。无论是正数还是负数，高位通通补0。

对于正数而言，>>和>>>没区别。

这里的终止条件比较巧妙，其他的类似。

### 效果

```
Runtime: 1 ms, faster than 100.00% of Java online submissions for Divide Two Integers.
Memory Usage: 36.7 MB, less than 70.20% of Java online submissions for Divide Two Integers.
```

好了，到此告一段落。

差点沦落到除法都不会做的地步，希望你不会遇到这么坑的面试题。

# 开源地址

为了便于大家学习，所有实现均已开源。欢迎 fork + star~

> [https://github.com/houbb/leetcode](https://github.com/houbb/leetcode)

## 参考资料

https://leetcode-cn.com/problems/divide-two-integers/

[Clean-Java-solution-with-some-comment](https://leetcode.com/problems/divide-two-integers/discuss/13397/Clean-Java-solution-with-some-comment.)

[No-Use-of-Long-Java-Solution](https://leetcode.com/problems/divide-two-integers/discuss/13417/No-Use-of-Long-Java-Solution)

* any list
{:toc}