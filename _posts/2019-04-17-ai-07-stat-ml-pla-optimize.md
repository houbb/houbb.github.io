---
layout: post
title: 老马学机器学习-08-感知机算法对偶算法
date:  2019-4-16 10:55:13 +0800
categories: [ML]
tags: [ML, ai, math, sh]
published: true
---

# 回顾

上一节，我们学习了感知机算法的基本实现。

但是，如果数据不是线性可分，即找不到一条直线能够将所有的正负样本完全分类正确，这种情况下，似乎 PLA 会永远更新迭代下去，却找不到正确的分类线。

对于线性不可分的情况，该如何使用PLA算法呢？

# Pocket PLA 是什么?

首先，我们来看一下线性不可分的例子：

## 读取数据

实现如下：

```py
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

# 读取数据
data = pd.read_csv('D:\\_data\\ai-data\\pla\\pocket-pla.csv', header=None)
# 样本输入，维度（100，2）
x = data.iloc[:,:2].values
# 样本输出，维度（100，）
y = data.iloc[:,2].values

# 可视化
plt.scatter(x[:50, 0], x[:50, 1], color='skyblue', marker='o', label='Positive')
plt.scatter(x[50:, 0], x[50:, 1], color='tomato', marker='x', label='Negative')
plt.xlabel('Feature 1')
plt.ylabel('Feature 2')
plt.legend(loc = 'upper left')
plt.title('Original Data')
plt.show()
```

其中文件内容见：

> [https://gitee.com/houbinbin/ai-data/blob/master/pla/data/pocket-pla.csv](https://gitee.com/houbinbin/ai-data/blob/master/pla/data/pocket-pla.csv)

效果如下图：

![输入图片说明](https://images.gitee.com/uploads/images/2021/0414/204145_7812bf40_508704.png "屏幕截图.png")

## 不可分

不可分对于二维数据而言，就是我们无法找到一条直线，可以把数据一分为二且符合分类的预期。

那么我们只好退而求其次，如何找到一条直线，可以将数据一分为二，并且错误的数量降低到最小呢？

这种算法的实现就是 pocket PLA。

# 算法实现

## 数据归一化

首先和上一次一样，我们对数据进行归一化。

```py
# 归一化
# 均值
u = np.mean(x, axis=0)
# 方差
v = np.std(x, axis=0)
x = (x - u) / v
```

效果如下：

![输入图片说明](https://images.gitee.com/uploads/images/2021/0414/204205_1a1a0be9_508704.png "屏幕截图.png")

## 直接初始化

```py
# x加上偏置项
x = np.hstack((np.ones((x.shape[0],1)), x))
# 权重初始化
w = np.random.randn(3,1)
```

到这里和原来的 PLA 实际上一模一样。

## 迭代更新

```py
for i in range(100):
   s = np.dot(x, w)
   y_pred = np.ones_like(y)
   loc_n = np.where(s < 0)[0]
   y_pred[loc_n] = -1
   num_fault = len(np.where(y != y_pred)[0])

   if num_fault == 0:
       break
   else:
       r = np.random.choice(num_fault)        # 随机选择一个错误分类点
       t = np.where(y != y_pred)[0][r]
       w2 = w + y[t] * x[t, :].reshape((3,1))

       s = np.dot(x, w2)
       y_pred = np.ones_like(y)
       loc_n = np.where(s < 0)[0]
       y_pred[loc_n] = -1
       num_fault2 = len(np.where(y != y_pred)[0])
       if num_fault2 < num_fault:
           w = w2        # 犯的错误点更少，则更新w，否则w不变
```

对比下，原来的 else 实现如下：

```py
t = np.where(y != y_pred)[0][0]
w += y[t] * x[t, :].reshape((3,1))
```

这里的优化点在于选择随机选择一个错误点，然后尝试进行更新。

如果发现更新之后，错误点变得更多了，那么就舍弃这次更新，否则则采纳。

## 绘制结果直线

```py
# 直线第一个坐标（x1，y1）
x1 = -2
y1 = -1 / w[2] * (w[0] * 1 + w[1] * x1)
# 直线第二个坐标（x2，y2）
x2 = 2
y2 = -1 / w[2] * (w[0] * 1 + w[1] * x2)

plt.plot([x1,x2], [y1,y2],'r')
```

## 完整源码

把上面的整合在一起，结果如下：

```py
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

# 读取数据
data = pd.read_csv('D:\\_data\\ai-data\\pla\\pocket-pla.csv', header=None)
# 样本输入，维度（100，2）
x = data.iloc[:,:2].values
# 样本输出，维度（100，）
y = data.iloc[:,2].values

# 归一化
# 均值
u = np.mean(x, axis=0)
# 方差
v = np.std(x, axis=0)
x = (x - u) / v

# x加上偏置项
x = np.hstack((np.ones((x.shape[0],1)), x))
# 权重初始化
w = np.random.randn(3,1)

for i in range(100):
   s = np.dot(x, w)
   y_pred = np.ones_like(y)
   loc_n = np.where(s < 0)[0]
   y_pred[loc_n] = -1
   num_fault = len(np.where(y != y_pred)[0])

   if num_fault == 0:
       break
   else:
       r = np.random.choice(num_fault)        # 随机选择一个错误分类点
       t = np.where(y != y_pred)[0][r]
       w2 = w + y[t] * x[t, :].reshape((3,1))

       s = np.dot(x, w2)
       y_pred = np.ones_like(y)
       loc_n = np.where(s < 0)[0]
       y_pred[loc_n] = -1
       num_fault2 = len(np.where(y != y_pred)[0])
       if num_fault2 < num_fault:
           w = w2        # 犯的错误点更少，则更新w，否则w不变
        
# 直线第一个坐标（x1，y1）
x1 = -2
y1 = -1 / w[2] * (w[0] * 1 + w[1] * x1)
# 直线第二个坐标（x2，y2）
x2 = 2
y2 = -1 / w[2] * (w[0] * 1 + w[1] * x2)
plt.plot([x1,x2], [y1,y2],'r')

# 可视化
plt.scatter(x[:50, 1], x[:50, 2], color='skyblue', marker='o', label='Positive')
plt.scatter(x[50:, 1], x[50:, 2], color='tomato', marker='x', label='Negative')
plt.xlabel('Feature 1')
plt.ylabel('Feature 2')
plt.legend(loc = 'upper left')
plt.title('Original Data')
plt.show()
```

效果如下图：

![输入图片说明](https://images.gitee.com/uploads/images/2021/0414/205424_afa494dc_508704.png "屏幕截图.png")

# 正确率

计算方式

```py
# 正确率
s = np.dot(x, w)
y_pred = np.ones_like(y)
loc_n = np.where(s < 0)[0]
y_pred[loc_n] = -1
accuracy = len(np.where(y == y_pred)[0]) / len(y)
print('accuracy: %.2f' % accuracy)
```

我们这种正确率可以达到：

```
accuracy: 0.85
```
# 损失函数

## 0-1 损失函数

从策略来说，无论是PLA还是Pocket PLA，使用的损失函数是统计误分类点的总数，即希望误分类点的总数越少越好，属于0-1损失函数「0-1 Loss Function」。

![输入图片说明](https://images.gitee.com/uploads/images/2021/0414/210521_4824ac9c_508704.png "屏幕截图.png")

但是，这样的损失函数不是参数 w 的连续可导函数。

修正函数为

```
w = w + yx
```

## 其他损失函数

而对于分类问题，常见的损失函数一般为交叉熵损失函数「Cross Entropy Loss」。

类似的损失函数还有很多，我们单独一篇进行讲解。

# 总结

相对来说，这个实现在 PLA 的基础上并没有那么难。

当然你会发现有 100 个节点，我们就循环 100 次，然后进行矩阵的乘积计算。

那么，这个性能可以优化吗？

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次相遇。

# 参考资料

《统计学习方法》

[通俗解释优化的线性感知机算法：Pocket PLA](https://redstonewill.blog.csdn.net/article/details/80574894)

[Pocket_PLA 算法](https://blog.csdn.net/fightingyxy/article/details/51771493)

[常见的损失函数(loss function)总结](https://zhuanlan.zhihu.com/p/58883095)

[交叉熵损失函数原理详解](https://blog.csdn.net/b1055077005/article/details/100152102)

[交叉熵损失函数](https://www.jianshu.com/p/b07f4cd32ba6)

* any list
{:toc}