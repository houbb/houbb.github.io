---
layout: post
title: Commons Math 概览-01
date:  2019-5-10 11:08:59 +0800
categories: [Math]
tags: [math, apache, overview, sh]
published: true
---

# Commons Math：Apache Commons 数学库

Commons Math 是一个轻量级，自包含的数学和统计组件库，解决了Java编程语言或Commons Lang中没有的最常见问题。

## 指导原则：

实际应用程序用例确定开发优先级。

该软件包强调小型，易于集成的组件，而不是具有复杂依赖性和配置的大型库。

所有算法都有完整的文档，并遵循公认的最佳实践。

在存在多个标准算法的情况下，策略模式用于支持多个实现。

有限的依赖关系。 除了 Commons 组件和核心Java平台之外没有外部依赖（至少Java 1.3到库的1.2版本，至少Java 5从库的2.0版本开始）。

# 什么是公共数学

Commons Math由一小组数学/统计实用程序组成，用于解决下面列表中的编程问题。

这个列表并不详尽，它只是为了感受Commons Math提供的各种事物。

数字列表的计算方法，差异和其他汇总统计

使用线性回归将线拟合到一组数据点

将曲线拟合到一组数据点

找到通过一组点的平滑曲线（插值）

使用最小二乘法将参数模型拟合到一组测量

求解涉及实值函数的方程（即根寻找）

求解线性方程组

求解常微分方程

最小化多维功能

生成具有比使用JDK可能的更多限制（例如分布，范围）的随机数

生成与输入文件中的数据“相似”的随机样本和/或数据集

执行统计显着性测试

其他数学函数，如阶乘，二项式系数和“特殊函数”（例如gamma，beta函数）

# 如何组织公共数学

根据提供的功能，Commons Math分为16个子包。

org.apache.commons.math4.stat  - 统计，统计测试

org.apache.commons.math4.analysis  -  rootfinding，integration，interpolation，polynomials

org.apache.commons.math4.random  - 随机数，字符串和数据生成

org.apache.commons.math4.special  - 特殊功能（Gamma，Beta）

org.apache.commons.math4.linear  - 矩阵，求解线性系统

org.apache.commons.math4.util  - 扩展java.lang.Math的常见math/stat函数

org.apache.commons.math4.complex  - 复数

org.apache.commons.math4.distribution  - 概率分布

org.apache.commons.math4.fraction  - 有理数

org.apache.commons.math4.transform  - 转换方法（快速傅立叶）

org.apache.commons.math4.geometry  -  geometry（欧几里德空间和二进制空间分区）

org.apache.commons.math4.optim  - 函数最大化或最小化

org.apache.commons.math4.ode  - 常微分方程的积分

org.apache.commons.math4.genetics  - 遗传算法

org.apache.commons.math4.fitting  - 曲线拟合

org.apache.commons.math4.ml  - 机器学习

# 如何在commons-math javadoc中指定接口契约

在程序中使用Commons Math组件时，应始终仔细阅读javadoc类和方法注释。 

javadoc提供了对所使用的算法的引用，有关限制，性能等的使用说明以及接口契约。

接口契约是根据前提条件（为了使方法返回有效结果必须为真），返回的特殊值（例如Double.NaN）或者在不满足前提条件时可能抛出的异常以及返回值/对象或状态更改。

当提供给方法的实际参数或对象的内部状态使计算无意义时，可能抛出MathIllegalArgumentException或MathIllegalStateException。

在javadoc方法注释中指定了抛出运行时异常（和任何其他异常）的确切条件。

在某些情况下，为了与浮点运算的IEEE 754标准和java.lang.Math一致，Commons Math方法返回Double.NaN值。返回Double.NaN或其他特殊值的条件在javadoc方法注释中完全指定。

从版本2.2开始，处理空引用的策略如下：当参数意外为null时，将引发NullArgumentException以指示非法参数。请注意，此类不继承标准NullPointerException，而是MathIllegalArgumentException的子类。

# 依赖

Commons Math需要JDK 1.5+并且没有运行时依赖性。

# 许可证

Commons Math根据Apache License 2.0版的条款分发：。

本产品包含由其他第三方开发的软件，并按照与Apache License 2.0版兼容的许可条款进行分发。 

此类第三方产品的所有许可证均可在LICENSE.txt文件中分发。 

某些产品需要额外的归属，这些归因可以在NOTICE.txt文件中找到。 这些文件在源包和二进制文件分发jar文件中都可用。

# 拓展阅读

[数学相关基础知识](https://houbb.github.io/2017/08/23/math-00-overview-00)

[Colt]()

[Numpy]()

# 参考资料

[Apache Commons Math-Overview](http://commons.apache.org/proper/commons-math/userguide/overview.html)

* any list
{:toc}