---
layout: post
title: 老马学机器学习-08-感知机算法详解及 python 实现
date:  2019-4-16 10:55:13 +0800
categories: [ML]
tags: [ML, ai, math, sh]
published: true
---

# 回顾

如果损失函数为误分类点个数，则该损失函数不是w和b的连续可导函数，不利于优化。

本节来看一下书中提到的超平面的概念实现。

# 感知机

感知机(perceptron) 是二类分类的线性分类模型， 其输入为实例的特征向量，输出为实例的类别，取+1和-1二值。

感知机对应于输入空间(特征空间)中将实例划分为正负两类的分离超平面，属于判别模型、感知机学习旨在求出将训练数据进行线性划分的分离超平面，为此，导入基于误分类的损失函数，利用梯度下降法对损失函数进行极小化，求得感知机模型。

感知机学习算法具有简单而易于实现的优点，分为原始形式和对偶形式.感知机预测是用学习得到的感知机模型对新的输入实例进行分类。

感知机1957年由Rosenblatt提出， 是神经网络与支持向量机的基础.

# 模型

## 定义

![输入图片说明](https://images.gitee.com/uploads/images/2021/0414/222610_a0c37eb0_508704.png "屏幕截图.png")

## 几何学解释

线程方程：w*x + b = 0

对应一个特征空间的超平面 S，w 是超平面的法向量，b 是超平面截距。

![输入图片说明](https://images.gitee.com/uploads/images/2021/0414/222753_f4739a3f_508704.png "屏幕截图.png")

# 学习策略

## 线性可分

![输入图片说明](https://images.gitee.com/uploads/images/2021/0414/222835_c02ec4e8_508704.png "屏幕截图.png")

## 损失函数

损失函数最自然的选择是误分类点的个数，但是这种损失函数不是参数 w b 的连续可导函数，不利于优化。

这里采用的是误分类点到超平面 S 的总距离。

首先输入空间 R^n 中任意一点 x0 到超平面 S 的距离：

![输入图片说明](https://images.gitee.com/uploads/images/2021/0414/223214_584d7a12_508704.png "屏幕截图.png")

显然，损失函数L(w，b)是非负的。

如果没有误分类点，损失函数值是0。

而且，误分类点越少，误分类点离超平面越近，损失函数值就越小。

一个特定的样本点的损失函数：在误分类时是参数w，b的线性函数，在正确分类时是0。

因此，给定训练数据集T，损失函数L(w，b)是w，b的连续可导函数.

# 学习算法

感知机问题转换为求解 2.4 的最优解问题。

最优化的方法是随机梯度下降。（为什么呢？）

## 基础算法

![输入图片说明](https://images.gitee.com/uploads/images/2021/0414/223515_49fb36f1_508704.png "屏幕截图.png")

这种学习算法直观上有如下解释：

当一个实例点被误分类，即位于分离超平面的错误一侧时，则调整w，b的值，使分离超平面向该误分类点的一侧移动，以减少该误分类点与超平面间的距离，直至超平面越过该误分类点使其被正确分类。

算法2.1是感知机学习的基本算法，对应于后面的对偶形式，称为原始形式，感知机学习算法简单且易于实现。

## 代码实现

```py
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

x = np.array([[3,3], [4,3], [1,1]])
y = [1, 1, -1]

w = [0 ,0]
b = 0
yita = 1

# 是否还存在误分类点
def isHasMisclassification(x, y, w, b):
    misclassification = False
    ct = 0
    misclassification_index = 0 
    for i in range(0, len(y)):
        if y[i]*(np.dot(w, x[i]) + b) <= 0:
            ct += 1
            misclassification_index = i
            break
    if ct>0:
        misclassification = True
    return misclassification, misclassification_index

# 更新系数w, b
def update(x, y, w, b, i):
    w = w + y[i]*x[i]
    b = b + y[i]
    return w, b

# 更新迭代
def optimization(x, y, w, b):
    misclassification, misclassification_index = isHasMisclassification(x, y, w, b)
    while misclassification:
        print ("误分类的点：", misclassification_index)
        w, b = update(x, y, w, b, misclassification_index)
        print ("采用误分类点 {} 更新后的权重为:w是 {} , b是 {} ".format(misclassification_index, w, b))
        misclassification, misclassification_index = isHasMisclassification(x, y, w, b)
    return w, b

w, b = optimization(x, y, w, b)

w,b
```

输出如下：

```
误分类的点： 0
采用误分类点 0 更新后的权重为:w是 [3 3] , b是 1 
误分类的点： 2
采用误分类点 2 更新后的权重为:w是 [2 2] , b是 0 
误分类的点： 2
采用误分类点 2 更新后的权重为:w是 [1 1] , b是 -1 
误分类的点： 2
采用误分类点 2 更新后的权重为:w是 [0 0] , b是 -2 
误分类的点： 0
采用误分类点 0 更新后的权重为:w是 [3 3] , b是 -1 
误分类的点： 2
采用误分类点 2 更新后的权重为:w是 [2 2] , b是 -2 
误分类的点： 2
采用误分类点 2 更新后的权重为:w是 [1 1] , b是 -3 
(array([1, 1]), -3)
```

和书中的例子是保持一致的。

## 算法的收敛性

定理表明，误分类的次数k是有上界的，经过有限次搜索可以找到将训练数据完全正确分开的分离超平面。

也就是说，**当训练数据集线性可分时，感知机学习算法原始形式迭代是收敛的**。

但是例 2.1 说明，感知机学习算法存在许多解，这些解既依赖于初值的选择，也依赖于迭代过程中误分类点的选择顺序。

为了得到唯一的超平面，需要对分离超平面增加约束条件。

这就是第7章将要讲述的线性支持向量机的想法。

当训练集线性不可分时，感知机学习算法不收敛，迭代结果会发生震荡.

# 对偶形式

## 对偶算法

![输入图片说明](https://images.gitee.com/uploads/images/2021/0414/230348_c6e588c4_508704.png "屏幕截图.png")

alpha_i 标识第 i 个实例点因为误分而进行的更新的次数。

实例点的更新次数越多，说明距离超平面的距离越近，也越难被正确地分类。

## 理解

![输入图片说明](https://images.gitee.com/uploads/images/2021/0414/215057_0925614a_508704.png "屏幕截图.png")

## 算法实现

```py
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

x = np.array([[3,3], [4,3], [1,1]])
x_transpose = x.T
y = [1, 1, -1]
g = np.dot(x, x_transpose)   #gram 矩阵

alfa = np.array([0, 0, 0])   # alpha i
b = 0   #截距
yita = 1


#是否还存在误分类点
def isHasMisclassification(y, g, b):
    misclassification = False
    ct = 0
    misclassification_index = 0
    for i in range(0, len(y)):
        sum1 = 0
        for j in range(0, len(y)):
            sum1 += (alfa[j]*y[j]*g[j][i] + b)
        if y[i]*sum1 <= 0:
            ct += 1
            misclassification_index = i
            break
    if ct > 0:
        misclassification = True
    return misclassification, misclassification_index

# 更新系数alfa, b
def update(y, alfa, yita, b, i):
    alfa[i] = alfa[i] + yita
    b = b + yita*y[i]
    return alfa, b


# 更新迭代
def optimization(y, alfa, b, yita):
    misclassification, misclassification_index = isHasMisclassification(y, g, b)
    while misclassification:
        print ("误分类的第{}点{}：".format(misclassification_index, x[misclassification_index]))
        alfa, b = update(y, alfa, yita, b, misclassification_index)
        print ("采用第{}误分类点 {} 更新后的权重为:alfa是 {} , b是 {} ".format(misclassification_index, x[misclassification_index], alfa, b))
        misclassification, misclassification_index = isHasMisclassification(y, g, b)
    return alfa, b

alfa, b = optimization(y, alfa, b, yita)


# In[312]:
#w=sum(alfa_i*y_i*x_i)
alfa_y = np.multiply(list(alfa),y)
w = np.dot(alfa_y,x)
b = np.dot(alfa, y)

w,b
```

其中 gram 矩阵的乘积如下：

```
[[18 21  6]
 [21 25  7]
 [ 6  7  2]]
```

这个和例子 1 是一一对应的，也存在多个解。

# 总结

写到这里老马就在想，如果我们真的理解算法了，那么能不能使用 java 实现一遍呢？

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次相遇。

# 参考资料

《统计学习方法》

[感知机学习算法的对偶形式-计算过程](https://blog.csdn.net/u010002184/article/details/86654378)

[如何理解感知机学习算法的对偶形式？](https://www.zhihu.com/question/26526858)

[感知机学习算法的对偶形式](https://blog.csdn.net/qq_29591261/article/details/77945561)

[李航统计学习方法之感知机学习（含感知机原始形式和对偶形式Python代码实现）](https://www.pianshen.com/article/14115299/)

[统计学习方法-感知机、超平面](https://blog.csdn.net/zzyyyyyww/article/details/108932383)

[【统计学习方法.李航】感知机学习算法](https://www.pianshen.com/article/98461448132/)

* any list
{:toc}