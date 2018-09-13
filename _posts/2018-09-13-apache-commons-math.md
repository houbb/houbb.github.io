---
layout: post
title: Apache Commons Math
date:  2018-09-13 20:02:52 +0800
categories: [Java]
tags: [java, apache, math, sh]
published: true
excerpt: java 数学工具包
---

# commons-math

Commons Math是由一组数学/stat实用程序组成的，这些实用程序可以解决下面列表中的编程问题。这个列表并不是详尽的，它只是为了让大家对Commons Math所提供的东西有所了解。

- 对数字列表的计算方法、方差和其他汇总统计信息

- 使用线性回归将直线拟合到一组数据点上

- 将曲线拟合到一组数据点上

- 通过一系列点(插值)找到一条平滑的曲线

- 用最小二乘方法将参数模型拟合到一组测量结果中

- 求解包含实值函数的方程(即寻根)

- 解线性方程组

- 常微分方程解

- 多维函数最小化

- 生成具有更多限制的随机数(e。g分布，范围)比使用JDK可能的

- 生成与输入文件中的数据“类似”的随机样本和/或数据集

- 进行统计显著性检验

- 各种数学函数，如阶乘、二项式系数和“特殊函数”(例如，函数)

我们正在积极寻找其他组件的想法，这些组件符合通用的数学愿景，即一组轻量级、自包含的 math/stat 组件，这些组件对解决常见的编程问题非常有用。

对于新组件或现有功能的增强的建议总是受欢迎的!所有关于改进的反馈/建议都应该发送到 commons-dev 邮件列表，在主题行开始处加上`[math]`。

# 包的组织

Commons Math is divided into sixteen subpackages, based on functionality provided.

- org.apache.commons.math4.stat - statistics, statistical tests

- org.apache.commons.math4.analysis - rootfinding, integration, interpolation, polynomials

- org.apache.commons.math4.random - random numbers, strings and data generation

- org.apache.commons.math4.special - special functions (Gamma, Beta)

- org.apache.commons.math4.linear - matrices, solving linear systems

- org.apache.commons.math4.util - common math/stat functions extending java.lang.Math

- org.apache.commons.math4.complex - complex numbers

- org.apache.commons.math4.distribution - probability distributions

- org.apache.commons.math4.fraction - rational numbers

- org.apache.commons.math4.transform - transform methods (Fast Fourier)

- org.apache.commons.math4.geometry - geometry (Euclidean spaces and Binary Space Partitioning)

- org.apache.commons.math4.optim - function maximization or minimization

- org.apache.commons.math4.ode - Ordinary Differential Equations integration

- org.apache.commons.math4.genetics - Genetic Algorithms

- org.apache.commons.math4.fitting - Curve Fitting

- org.apache.commons.math4.ml - Machine Learning

# 如何在 common-math javadoc 中指定接口契约

在您的程序中使用Commons Math组件时，您应该始终仔细阅读javadoc类和方法注释。

javadoc提供了对所使用算法的引用、关于限制、性能等的用法说明以及接口契约。

接口契约是根据先决条件(为了使方法返回有效结果必须为真)、返回的特殊值(例如Double.NaN)或在不满足先决条件时可能抛出的异常以及返回值/对象或状态更改的定义来指定的。

当提供给方法的实际参数或对象的内部状态使计算无意义时，可能会抛出MathIllegalArgumentException或MathIllegalStateException。

javadoc方法注释中指定了抛出运行时异常(和任何其他异常)的确切条件。

在某些情况下，要与IEEE 754浮点运算标准和java.lang保持一致。Math, Commons Math方法返回Double。NaN值。Double 的条件。

返回的NaN或其他特殊值在javadoc方法注释中完全指定。

在版本2.2中，处理null引用的策略如下:

当一个参数意外为null时，会抛出一个NullArgumentException来表示非法的参数。

注意，这个类不是继承自标准的NullPointerException，而是MathIllegalArgumentException的一个子类。


# 依赖 

jdk1.5+

# 感想

java 相关的数学工具包少得可怜。。。

# 参考资料

[使用指南](https://commons.apache.org/proper/commons-math/userguide/index.html)

* any list
{:toc}