---
layout: post 
title: JS 中的 Math 函数
date: 2022-11-18 21:01:55 +0800
categories: [Tool] 
tags: [math, tool, sh]
published: true
---

# Math 对象

Math 对象允许您执行数学任务。

Math 不是构造函数。Math 的所有属性/方法都可以通过使用 Math 作为对象来调用，而无需创建它：

```js
var x = Math.PI;            // 返回 PI
var y = Math.sqrt(16);      // 返回 16 的平方根
```

# Math 对象属性

| 属性 	   | 描述 |
|:-----|:-----|
| E 	    | 返回欧拉数（约 2.718）。 |
| LN2 	  | 返回 2 的自然对数（约 0.693）。 |
| LN10 	  | 返回 10 的自然对数（约 2.302）。 |
| LOG2E 	| 返回 E 的以 2 为底的对数（约 1.442）。 |
| LOG10E 	| 返回 E 的以 10 为底的对数（约 0.434）。 |
| PI 	    | 返回 PI（约 3.14）。 |
| SQRT1_2 | 返回 1/2 的平方根（约 0.707）。 |
| SQRT2 	| 返回 2 的平方根（约 1.414）。 |

# Math 对象方法

| 方法 | 	    描述 |
|:-----|:-----| 
| abs(x) 	      | 返回 x 的绝对值。 |
| trunc(x) 	    | 返回数字 (x) 的整数部分。 |
| sign(x) 	    | 返回数的符号（检查它是正数、负数还是零）。 |
| pow(x, y) 	  | 返回 x 的 y 次幂值。 |
| random() 	    | 返回 0 到 1 之间的随机数。 |
| floor(x) 	    | 返回 x，向下舍入为最接近的整数。 |
| fround(x) 	  | 返回数的最接近的（32 位单精度）浮点表示。 |
| round(x) 	    | 将 x 舍入为最接近的整数。 |
| sqrt(x) 	    | 返回 x 的平方根。 |
| ceil(x) 	    | 返回 x，向上舍入为最接近的整数。 |
| clz32(x) 	    | 返回 x 的 32 位二进制表示中前导零的数量。 |
| acos(x) 	    | 返回 x 的反余弦值，以弧度为单位。 |
| acosh(x) 	    | 返回 x 的双曲反余弦值。 |
| asin(x) 	    | 返回 x 的反正弦值，以弧度为单位。 |
| asinh(x) 	    | 返回 x 的双曲反正弦值。 |
| atan(x) 	    | 返回 x 的反正切值，返回的值是 -PI/2 到 PI/2 之间的弧度值。 |
| atan2(y, x) 	| 返回其参数商的反正切值。 |
| atanh(x) 	    | 返回 x 的双曲反正切值。 |
| cbrt(x) 	    | 返回 x 的三次方根。 |
| cos(x) 	      | 返回 x 的余弦值（x 以弧度为单位）。 |
| cosh(x) 	    | 返回 x 的双曲余弦值。 |
| exp(x) 	      | 返回 Ex 的值。 |
| expm1(x) 	    | 返回 Ex 减去 1 的值。 |
| log(x) 	      | 返回 x 的自然对数。 |
| log10(x) 	    | 返回 x 的以 10 为底的对数。 |
| log1p(x) 	    | 返回 1 + x 的自然对数。 |
| log2(x) 	    | 返回 x 的以 2 为底的对数。 |
| sin(x) 	      | 返回 x 的正弦值（x 以弧度为单位）。 |
| sinh(x) 	    | 返回 x 的双曲正弦值。 |
| tan(x) 	      | 返回角度的正切值。 |
| tanh(x) 	    | 返回数的双曲正切值。 |
| max(x, y, z, ..., n) | 	返回值最高的数字。| 
| min(x, y, z, ..., n) | 返回值最小的数字。| 

# 参考资料

[JavaScript Math 参考手册](https://www.w3school.com.cn/jsref/jsref_obj_math.asp)

* any list
{:toc}