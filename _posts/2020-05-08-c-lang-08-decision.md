---
layout: post
title: C语言学习笔记-08-判断
date:  2020-5-8 19:23:59 +0800
categories: [C]
tags: [c, lang, sf]
published: true
---

# C 判断

判断结构要求程序员指定一个或多个要评估或测试的条件，以及条件为真时要执行的语句（必需的）和条件为假时要执行的语句（可选的）。

C 语言把任何非零和非空的值假定为 true，把零或 null 假定为 false。

# 判断语句

C 语言提供了以下类型的判断语句。

## if

```c
if(true) {
    //...
}
```
## if...else

```c
if(x == 3) {

} else {
    //...
}
```

## switch

```c
switch(x) {
    case 1:
    case 2:
    default:
}
```
## 嵌套 switch 语句

您可以在一个 switch 语句内使用另一个 switch 语句。

# ? : 运算符(三元运算符)

我们已经在前面的章节中讲解了条件运算符 ? :，可以用来替代 if...else 语句。

它的一般形式如下：

```
Exp1 ? Exp2 : Exp3;
```

其中，Exp1、Exp2 和 Exp3 是表达式。

请注意，冒号的使用和位置。

? 表达式的值是由 Exp1 决定的。

如果 Exp1 为真，则计算 Exp2 的值，结果即为整个 ? 表达式的值。

如果 Exp1 为假，则计算 Exp3 的值，结果即为整个 ? 表达式的值。

* any list
{:toc}