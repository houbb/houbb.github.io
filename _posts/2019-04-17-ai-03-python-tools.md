---
layout: post
title: 老马学机器学习-03-python 必备工具包简介 
date:  2019-4-16 10:55:13 +0800
categories: [ML]
tags: [ML, ai, math, sh]
published: true
---

# 必备工具包

君子生非异也，善假于物也。——《劝学》

机器学习更是如此，前人为我们整理了大量的工具，我们要学会利用这些工具，帮助我们更快更好的学习。

当然就像孙悟空去东海一样，武器五花八门，我们最好的还是找到几个趁手的工具。

这里我们介绍一个最核心的 python 工具包。

## Numpy

[NumPy(Numerical Python)](https://numpy.org/doc/stable/reference/) 是 Python 语言的一个扩展程序库，支持大量的维度数组与矩阵运算，此外也针对数组运算提供大量的数学函数库。

核心特性：

- 一个强大的 N 维数组对象 ndarray

- 整合 C/C++/Fortran 代码的工具

- 线性代数、傅里叶变换、随机数生成等功能

ps: 说道这个 N-Array 不得不说成也萧何败萧何。java 为了避免程序的复杂性，本身是不支持 N-Array 的，所以原来使用 DL4j 进行机器学习的时候就会觉得有些别扭。

## Pandas

[Pandas](https://pandas.pydata.org/) 是一个开源的，BSD许可的库，为Python编程语言提供高性能，易于使用的数据结构和数据分析工具。 

Pandas 的主要数据结构是 Series（一维数据）与 DataFrame（二维数据），这两种数据结构足以处理金融、统计、社会科学、工程等领域里的大多数典型用例

ps: 一般这个工具在债券、股票分析领域是非常常见的。

## Matplotlib	

[Matplotlib](https://matplotlib.org/) 是一个综合库，用于在Python中创建静态，动画和交互式可视化。

比起数字，人类对于直观的图像理解的往往更好。

常言道，一图胜千言，Matplotlib 绝对是绘图的不二选择！

## Seaborn	

[Seaborn](https://seaborn.pydata.org/) 是基于matplotlib的Python数据可视化库。 

它提供了用于绘制引人入胜且内容丰富的统计图形的高级界面。

换言之，就是在 Matplotlib 的基础上进行封装，让其更加简单好用。

# 工具包的学习

看到这里，很多小伙伴可能会想那我把这些工具都深入学习一遍。

不过老马不建议你这么做，最好的方式还是边用边学习，当然，前提你要知道每个包大概能做什么，不然无从学起。

# Numpy 入门

## 引入

```py
import numpy as np
```

## 入门

我们可以在昨天安装的 notebook 上测试一下简单的统计函数。

```py
import numpy as np
print (np.std([1,2,3,4]))
```

这个函数可以计算标准差，结果如下：

```
1.118033988749895
```

当然，numpy 更大的魅力在于矩阵计算、线性代数等。这里暂时不做展开。

# Pandas 入门

## 引入

```py
import numpy as np
import pandas as pd
```

## 十分钟入门

我们可以参考一下官方的 10min 入门教程，这里我们只介绍最简单的方法，其他方法等使用到再做展开。

### 生成对象

```py
import numpy as np
import pandas as pd

s = pd.Series([1, 3, 5, np.nan, 6, 8])
s
```

输出如下：

```
0    1.0
1    3.0
2    5.0
3    NaN
4    6.0
5    8.0
dtype: float64
```

这里生成了一个序列，pandas 会默认加上对应的索引。

### 可视化

```py
import pandas as pd

ts = pd.Series(np.random.randn(1000), index=pd.date_range('1/1/2000', periods=1000))
ts = ts.cumsum()
ts.plot()
```

![输入图片说明](https://images.gitee.com/uploads/images/2021/0412/213715_3c4aadd7_508704.png "屏幕截图.png")

你会发现 pandas 本身也是支持可视化的，那么为什么还需要其他可视化工具呢？

术业有专攻，pandas 的强项是数据分析处理，更多强大丰富的图像展现，还是需要交个专业的工具。

# Matplotlib 入门

## 引入

```py
import numpy as np 
import matplotlib.pyplot as plt 
```

## 绘制正弦曲线

```py
# 计算正弦曲线上点的 x 和 y 坐标
x = np.arange(0,  4  * np.pi,  0.1) 
y = np.sin(x)
plt.title("sine wave form")  
# 使用 matplotlib 来绘制点
plt.plot(x, y) 
plt.show()
```

效果图：

![输入图片说明](https://images.gitee.com/uploads/images/2021/0412/214239_f1808da6_508704.png "屏幕截图.png")

## 更进一步

当然，你会感觉这也不过如此。

其实工具本身提供了无限的可能性，就像画笔之于画家，乐器之于奏乐者，一切的可能性只取决于你我。

我们来绘制一个稍微复杂一点地图像。（官方例子）

```py
import matplotlib.pyplot as plt
import numpy as np


def explode(data):
    size = np.array(data.shape)*2
    data_e = np.zeros(size - 1, dtype=data.dtype)
    data_e[::2, ::2, ::2] = data
    return data_e

# build up the numpy logo
n_voxels = np.zeros((4, 3, 4), dtype=bool)
n_voxels[0, 0, :] = True
n_voxels[-1, 0, :] = True
n_voxels[1, 0, 2] = True
n_voxels[2, 0, 1] = True
facecolors = np.where(n_voxels, '#FFD65DC0', '#7A88CCC0')
edgecolors = np.where(n_voxels, '#BFAB6E', '#7D84A6')
filled = np.ones(n_voxels.shape)

# upscale the above voxel image, leaving gaps
filled_2 = explode(filled)
fcolors_2 = explode(facecolors)
ecolors_2 = explode(edgecolors)

# Shrink the gaps
x, y, z = np.indices(np.array(filled_2.shape) + 1).astype(float) // 2
x[0::2, :, :] += 0.05
y[:, 0::2, :] += 0.05
z[:, :, 0::2] += 0.05
x[1::2, :, :] += 0.95
y[:, 1::2, :] += 0.95
z[:, :, 1::2] += 0.95

ax = plt.figure().add_subplot(projection='3d')
ax.voxels(x, y, z, filled_2, facecolors=fcolors_2, edgecolors=ecolors_2)

plt.show()
```

效果如下：

![输入图片说明](https://images.gitee.com/uploads/images/2021/0412/215152_f67df8b6_508704.png "屏幕截图.png")

# 小结

数据的三个核心步骤

（1）数据的初始化

（2）数据的计算、分析

（3）数据的可视化

这几个工具也是紧紧围绕这 3 点展开的。

下一篇我们将介绍一下机器学习中用到的数学知识~

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次相遇。

# 参考资料

[NumPy 教程](https://www.runoob.com/numpy/numpy-tutorial.html)

[Pandas 中文教程](https://www.w3cschool.cn/hyspo/)

[十分钟入门 Pandas](http://www.pypandas.cn/docs/getting_started/10min.html)


* any list
{:toc}