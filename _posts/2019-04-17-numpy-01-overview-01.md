---
layout: post
title: Numpy-01-Overview
date:  2019-4-16 10:55:13 +0800
categories: [Python]
tags: [python, numpy, overview, sh]
published: true
---

# NumPy 

[NumPy](http://www.numpy.org/) 是使用Python进行科学计算的基础包。 

它包含其他内容：

一个强大的N维数组对象

复杂的（广播）功能

用于集成C / C ++和Fortran代码的工具

有用的线性代数，傅里叶变换和随机数功能

除了明显的科学用途外，NumPy还可以用作通用数据的高效多维容器。 

可以定义任意数据类型。 

这使NumPy能够无缝快速地与各种数据库集成。

# 基础环境

## 相关资料

要安装NumPy，我们强烈建议您使用科学的Python发行版。 

有关详细信息，请参阅安装SciPy堆栈。

NumPy可以使用许多高质量的在线教程，课程和书籍。 为了快速了解NumPy，我们提供了NumPy教程。 我们还推荐SciPy Lecture Notes，以更广泛地介绍科学Python生态系统。

有关SciPy堆栈（NumPy提供基本阵列数据结构）的更多信息，请参阅scipy.org。

## 推荐发行版

对于许多用户，尤其是在Windows上，最简单的方法是下载其中一个Python发行版，其中包括所有关键包：

Anaconda：使用科学软件包免费发布Python。 支持Linux，Windows和Mac。

Enthought Canopy：免费和商业版本包括核心科学包。 支持Linux，Windows和Mac。

Python（x，y）：一个免费的发行版，包括基于Spyder IDE的科学包。 Windows和Ubuntu; 仅限Py2。

WinPython：另一个免费发行版，包括科学软件包和Spyder IDE。 仅限Windows，但更积极地维护并支持最新的Python 3版本。

Pyzo：基于Anaconda和IEP交互式开发环境的免费发行版。 支持Linux，Windows和Mac。

ps: 此处我选择 Anaconda

# What is NumPy?

NumPy是Python中科学计算的基础包。它是一个Python库，提供多维数组对象，各种派生对象（如掩码数组和矩阵），以及用于数组快速操作的各种例程，包括数学，逻辑，形状操作，排序，选择，I/O离散傅立叶变换，基本线性代数，基本统计运算，随机模拟等等。

NumPy包的核心是ndarray对象。这封装了同构数据类型的n维数组，许多操作在编译代码中执行以提高性能。 NumPy数组和标准Python序列之间有几个重要的区别：

NumPy数组在创建时具有固定的大小，与Python列表（可以动态增长）不同。更改ndarray的大小将创建一个新数组并删除原始数组。

NumPy数组中的元素都需要具有相同的数据类型，因此在内存中的大小相同。例外：可以有（Python，包括NumPy）对象的数组，从而允许不同大小的元素的数组。

NumPy数组有助于对大量数据进行高级数学和其他类型的操作。通常，与使用Python的内置序列相比，此类操作的执行效率更高，代码更少。

越来越多的基于Python的科学和数学软件包正在使用NumPy数组;

虽然这些通常支持Python序列输入，但它们在处理之前将这些输入转换为NumPy数组，并且它们通常输出NumPy数组。换句话说，为了有效地使用当今大量（甚至大多数）基于Python的科学/数学软件，只知道如何使用Python的内置序列类型是不够的 - 还需要知道如何使用NumPy数组。

## 序列

关于序列大小和速度的要点在科学计算中尤为重要。

举一个简单的例子，考虑将1-D序列中的每个元素与相同长度的另一个序列中的相应元素相乘的情况。如果数据存储在两个Python列表a和b中，我们可以迭代每个元素：

```py
c = []
for i in range(len(a)):
    c.append(a[i]*b[i])
```

这产生了正确的答案，但如果a和b每个都包含数百万个数字，我们将为Python中循环的低效率付出代价。 

我们可以通过写入在C中更快地完成相同的任务（为了清楚起见，我们忽略了变量声明和初始化，内存分配等）

```c
for (i = 0; i < rows; i++): {
  c[i] = a[i]*b[i];
}
```

这节省了解释Python代码和操作Python对象所涉及的所有开销，但代价是从Python编码中获得的好处。 

此外，所需的编码工作随着我们数据的维度而增加。 

例如，在二维数组的情况下，C代码（如前所述）扩展为

```c
for (i = 0; i < rows; i++): {
  for (j = 0; j < columns; j++): {
    c[i][j] = a[i][j]*b[i][j];
  }
}
```

## 两全其美

NumPy为我们提供了两全其美：逐个元素操作是涉及ndarray时的“默认模式”，但逐个元素的操作由预编译的C代码快速执行。 

在 NumPy 中：

```py
c = a * b
```

以接近C的速度执行前面的示例所做的事情，但是我们期望基于Python的代码简化。 

事实上，NumPy的成语更简单！ 

最后一个例子说明了NumPy的两个特征，它们是它的大部分功能的基础：矢量化和广播。

Vectorization描述了代码中没有任何显式的循环，索引等 - 这些事情当然只是在优化的，预编译的C代码中“幕后”。 

矢量化代码有许多优点，其中包括：

1. 矢量化代码更简洁，更易于阅读

2. 更少的代码行通常意味着更少的错误

3. 代码更接近于标准的数学符号（通常，更容易正确编码数学结构）

4. 矢量化导致更多“Pythonic”代码。 如果没有矢量化，我们的代码就会被低效且难以阅读的循环所困扰。

广播是用于描述操作的隐式逐元素行为的术语;

一般而言，在NumPy中，所有操作，不仅仅是算术运算，而是逻辑的，逐位的，功能性的等，以这种隐式的逐元素方式表现，即它们广播。此外，在上面的例子中，a和b可以是相同形状的多维数组，或标量和数组，或者甚至是具有不同形状的两个数组，只要较小的数组是“可扩展的”到更大的形状以这样一种方式，结果广播是明确的。

NumPy完全支持面向对象的方法，再次使用ndarray开始。

例如，ndarray是一个类，拥有许多方法和属性。它的许多方法都在最外层的NumPy命名空间中镜像函数，使程序员可以完全自由地编写她喜欢的范例和/或最适合手头任务的范例。

# numpy 安装

```
python3 -m pip install numpy
```

官方安装了太多的东西，暂时只关心 numpy。

# 拓展阅读

[Quant-03-Anaconda Python 环境神器](https://houbb.github.io/2018/02/14/quant-04-anaconda-04)

# 参考资料

https://docs.scipy.org/doc/

[NumPy Reference](https://docs.scipy.org/doc/numpy/reference/)

[NumPy User Guide](https://docs.scipy.org/doc/numpy/user/index.html#numpy-user-guide)

* any list
{:toc}











