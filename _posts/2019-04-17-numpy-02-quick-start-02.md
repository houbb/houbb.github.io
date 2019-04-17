---
layout: post
title: Numpy-02-快速开始
date:  2019-4-16 10:55:13 +0800
categories: [Python]
tags: [python, numpy, quick-start, sh]
published: true
---

# 基本概念


NumPy的主要对象是同构多维数组。 它是一个元素表（通常是数字），都是相同的类型，由正整数元组索引。 `在NumPy维度中称为轴。

例如，3D空间[1,2,1]中的点的坐标具有一个轴。 

该轴有3个元素，所以我们说它的长度为3.在下图所示的例子中，数组有2个轴。 第一轴的长度为2，第二轴的长度为3。

```
[[ 1., 0., 0.],
 [ 0., 1., 2.]]
```

NumPy的数组类称为ndarray。它也被别名数组所知。

请注意，numpy.array与标准Python库类array.array不同，后者仅处理一维数组并提供较少的功能。 

ndarray对象的更重要的属性是：

- ndarray.ndim

数组的轴数（尺寸）。

- ndarray.shape

数组的大小。这是一个整数元组，表示每个维度中数组的大小。对于具有n行和m列的矩阵，形状将为（n，m）。因此，形状元组的长度是轴的数量ndim。

- ndarray.size

数组的元素总数。这等于形状元素的乘积。

- ndarray.dtype

描述数组中元素类型的对象。可以使用标准Python类型创建或指定dtype。此外，NumPy还提供自己的类型。 numpy.int32，numpy.int16和numpy.float64就是一些例子。

- ndarray.itemsize

数组中每个元素的大小（以字节为单位）。例如，float64类型的元素数组具有itemsize 8（= 64/8），而complex32类型之一具有itemsize 4（= 32/8）。它相当于

ndarray.dtype.itemsize。

- ndarray.data

包含数组实际元素的缓冲区。通常，我们不需要使用此属性，因为我们将使用索引工具访问数组中的元素。

# 基本的例子

```py
>>> import numpy as np
>>> a = np.arange(15).reshape(3, 5)
>>> a
array([[ 0,  1,  2,  3,  4],
       [ 5,  6,  7,  8,  9],
       [10, 11, 12, 13, 14]])
```

基础属性

```
>>> a.ndim
2
>>> a.shape
(3, 5)
>>> a.size
15
>>> a.dtype
dtype('int64')
>>> a.itemsize
8
>>> a.data
<memory at 0x119167a68>
```


# 参考资料

https://docs.scipy.org/doc/numpy/user/quickstart.html

* any list
{:toc}











