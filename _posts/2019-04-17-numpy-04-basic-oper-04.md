---
layout: post
title: Numpy-04-基本操作
date:  2019-4-16 10:55:13 +0800
categories: [Python]
tags: [python, numpy, sh]
published: true
---

# 算术运算符

数组上的算术运算符应用于元素。 

创建一个新数组并填充结果。

```
>>> a = np.array([6,7,8,9])
>>> b = np.arange(4)
>>> c = a-b
>>> c
array([6, 6, 6, 6])
>>> b
array([0, 1, 2, 3])
>>> b**2
array([0, 1, 4, 9])
>>> b<1
array([ True, False, False, False])
```

# 矩阵计算

与许多矩阵语言不同，产品运算符 `*` 在NumPy数组中以元素方式运行。 

矩阵乘积可以使用 `@` 运算符（在python> = 3.5中）或点函数或方法执行：


```
>>> a = np.array([[0,1], [2,3]])
>>> b = np.array([[2,3], [4,5]])
>>> a * b            # 对应元素直接做乘法
array([[ 0,  3],
       [ 8, 15]])
>>> a @ b            # 矩阵运算
array([[ 4,  5],
       [16, 21]])
>>> a.dot(b)
array([[ 4,  5],
       [16, 21]])
```

# 修改数组的值

某些操作（例如 `+=` 和 `*=`）用于修改现有数组而不是创建新数组

```
>>> a = np.ones((2,3), dtype=int)
>>> a
array([[1, 1, 1],
       [1, 1, 1]])
>>> a *= 3
>>> a
array([[3, 3, 3],
       [3, 3, 3]])

>>> b = np.random.random((2,3))
>>> b
array([[0.69130364, 0.78987813, 0.54995678],
       [0.72684798, 0.60646457, 0.87405791]])

>>> b += a
>>> b
array([[3.69130364, 3.78987813, 3.54995678],
       [3.72684798, 3.60646457, 3.87405791]])
>>> a += b
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
TypeError: Cannot cast ufunc add output from dtype('float64') to dtype('int64') with casting rule 'same_kind'
```

这其实和普通的语言中丢失精度是一样的道理。

# 向上转型

当使用不同类型的数组进行操作时，结果数组的类型对应于更一般或更精确的数组（称为向上转换的行为）。

```
>>> a = np.ones(3, dtype=np.int32)
>>> a
array([1, 1, 1], dtype=int32)
>>> b = np.linspace(0,pi,3)
>>> b
array([0.        , 1.57079633, 3.14159265])
>>> b.dtype.name
'float64'

>>> c = a+b
>>> c
array([1.        , 2.57079633, 4.14159265])
>>> c.dtype.name
'float64'

>>> d = np.exp(c*1j)
>>> d
array([ 0.54030231+0.84147098j, -0.84147098+0.54030231j,
       -0.54030231-0.84147098j])
>>> d.dtype.name
'complex128'
```

# 一元操作

许多一元操作，例如计算数组中所有元素的总和，都是作为ndarray类的方法实现的。

```
>>> a = np.random.random((2,3))
>>> a.sum()
3.5360788979749973
>>> a.min()
0.20503831331878253
>>> a.max()
0.8077413278893076
```

# 数轴

默认情况下，这些操作适用于数组，就像它是一个数字列表一样，无论其形状如何。 

但是，通过指定axis参数，您可以沿数组的指定轴应用操作：

```
>>> a = np.arange(12).reshape(3,4)
>>> a
array([[ 0,  1,  2,  3],
       [ 4,  5,  6,  7],
       [ 8,  9, 10, 11]])
>>> a.sum(axis=0)           # 每一列的和
array([12, 15, 18, 21])
>>> a.sum(axis=1)           # 每一行的和
array([ 6, 22, 38])
>>> a.min(axis=0)           # 每一列的最小值
array([0, 1, 2, 3])
>>> a.max(axis=1)           # 每一行的最大值
array([ 3,  7, 11])
>>> a.cumsum(axis=0)        # cumulative sum along each row
array([[ 0,  1,  2,  3],
       [ 4,  6,  8, 10],
       [12, 15, 18, 21]])
```

# 对于函数的学习

函数大概知道有哪些即可，要学会查文档。

更主要的是数学统计学知识，知道有哪些指标。

# 参考资料

[basic-operations](https://docs.scipy.org/doc/numpy/user/quickstart.html#basic-operations)

[均值函数numpy.mean](https://blog.csdn.net/qq_20258087/article/details/79809379)

* any list
{:toc}











