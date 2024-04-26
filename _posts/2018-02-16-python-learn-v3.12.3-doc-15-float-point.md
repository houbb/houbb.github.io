---
layout: post
title:  Python v3.12.3 学习-15 Floating Point Arithmetic Issues and Limitations
date:  2018-02-14 15:09:30 +0800 
categories: [Lang]
tags: [python, lang, why-learn, sh]
published: true
---

### 浮点数表示

浮点数在计算机硬件中以基数2（二进制）小数的形式表示。例如，十进制小数0.625的值为6/10 + 2/100 + 5/1000，同样地，二进制小数0.101的值为1/2 + 0/4 + 1/8。这两个小数具有相同的值，唯一的区别是第一个使用基数10的小数表示法，而第二个使用基数2的小数表示法。

### 浮点数的近似表示

不幸的是，大多数十进制小数不能完全表示为二进制小数。因此，通常，你输入的十进制浮点数在机器中实际存储的是其近似值。

在基数10下，这个问题更容易理解。考虑分数1/3。你可以将其近似为基数10的小数：

0.3  
或者更好地，  

0.33  
或者更好地，  

0.333  
依此类推。无论你愿意写多少位数，结果永远不会是完全的1/3，但会是越来越接近1/3的近似值。

同样地，无论你愿意使用多少个基数2的数字，十进制值0.1不能完全表示为基数2的小数。在基数2的情况下，1/10是一个无限重复的小数：

0.0001100110011001100110011001100110011001100110011...  
只要停在任何有限的位数，你都得到一个近似值。在大多数现代机器上，浮点数使用一个二进制分数来近似表示，分子使用最高有效位开始的前53位，分母作为2的幂。在1/10的情况下，二进制分数是3602879701896397 / 2 ** 55，这接近但并不完全等于1/10的真实值。

### 浮点数表示误差

许多用户由于显示值的方式而没有意识到这种近似。Python只打印机器存储的二进制近似的真实十进制值的小数近似值。在大多数机器上，如果Python打印0.1的二进制近似的真实十进制值，它必须显示：

```
0.1  
0.1000000000000000055511151231257827021181583404541015625
```

这比大多数人发现有用的数字还要多，所以Python通过显示一个四舍五入的值来保持数字数量的可管理性：

```
1 / 10  
0.1
```

### 注意事项

请记住，即使打印的结果看起来像1/10的精确值，实际存储的值是最接近的可表示二进制分数。例如，0.1和0.10000000000000001和0.1000000000000000055511151231257827021181583404541015625这些数字都由3602879701896397 / 2 ** 55近似。因为所有这些十进制值都共享相同的近似值，任何一个都可以被显示，同时仍然保持不变的eval(repr(x)) == x。

### 结论

这并不是Python的一个错误，也不是你代码中的一个错误。你会在所有支持你的硬件浮点运算的语言中看到这样的情况。为了获得更好的输出，你可能希望使用字符串格式化来生成有限数量的有效数字。同时，对于需要精确十进制表示的用例，可以使用decimal模块或fractions模块。如果你需要进行更多的数学和统计操作，可以考虑使用NumPy包和SciPy项目提供的其他包。

# 参考资料

https://docs.python.org/3.12/tutorial/floatingpoint.html

* any list
{:toc}
