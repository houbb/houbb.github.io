---
layout: post
title: 老马学机器学习-09-KNN 算法详解及 python 实现
date:  2019-4-16 10:55:13 +0800
categories: [ML]
tags: [ML, ai, math, sh]
published: true
---

# 什么是 k 近邻算法？

k最近邻(k-Nearest Neighbor，kNN)分类算法是一个比较成熟也是最简单的机器学习(Machine Learning)算法之一。

该方法的思路是：

**如果一个样本在特征空间中与k个实例最为相似(即特征空间中最邻近)，那么这k个实例中大多数属于哪个类别，则该样本也属于这个类别。**

其中，计算样本与其他实例的相似性一般采用距离衡量法。

离得越近越相似，离得越远越不相似。

## 例子

换个说法可能更好理解，比如一个一定范围的平面随机分布着两种颜色的样本点，在这个平面内有个实例点不知道它是什么颜色，因此通过它周边的不同颜色的点分布情况进行推测。

假设取K=3，意思是在离这个实例点最近的样本点中去前三个最近的， 然后看这三个当中那种类别占比大，就判断该实例点属于那个类别的，当k=5的时候也一样这样判断，因此k的取值很关键，通常不会超过20。

当然，因为每个样本有多个特征，因此实际工作中，这个‘平面’就是三维甚至是多维的，道理是一样的。

如图：

![输入图片说明](https://images.gitee.com/uploads/images/2021/0415/204446_772c7a3a_508704.png "屏幕截图.png")

# KNN 算法原理

## 算法

![算法](https://images.gitee.com/uploads/images/2021/0415/221409_7a94927e_508704.png)

## 原理

在KNN中，通过计算对象间距离来作为各个对象之间的非相似性指标，避免了对象之间的匹配问题，在这里距离一般使用欧氏距离或曼哈顿距离：

![输入图片说明](https://images.gitee.com/uploads/images/2021/0415/204522_feb8f151_508704.png "屏幕截图.png")

对KNN算法的思想总结一下：就是在训练集中数据和标签已知的情况下，输入测试数据，将测试数据的特征与训练集中对应的特征进行相互比较，找到训练集中与之最为相似的前K个数据，则该测试数据对应的类别就是K个数据中出现次数最多的那个分类，其算法的描述为：

1）计算测试数据与各个训练数据之间的距离；

2）按照距离的递增关系进行排序；

3）选取距离最小的K个点；

4）确定前K个点所在类别的出现频率；

5）返回前K个点中出现频率最高的类别作为测试数据的预测分类。

# KNN算法优缺点以及算法改进

## 优缺点：

1、简单，易于理解，是一个天然的多分类器；

2、不需要庞大的样本数据也可以完成一个简单的分类；

3、不需要训练和求解参数（既是优点也是缺点）；

4、数据量大的时候，计算量也非常大（样本多，特征多）；

5、不平衡样本处理能力差；

6、并没有学习和优化的过程，严格来说不算是机器学习。

## 改进

进行加权平均，离得近的样本给予更大的权重，离得远的样本使其权重变小。

# 鸢尾花卉分类

首先，数据集我们选择经典的鸢尾花卉数据集（Iris）。

Iris数据集每个样本x包含了花萼长度（sepal length）、花萼宽度（sepal width）、花瓣长度（petal length）、花瓣宽度（petal width）四个特征。

样本标签y共有三类，分别是Setosa，Versicolor和Virginica。

Iris数据集总共包含150个样本，每个类别由50个样本，整体构成一个150行5列的二维表，如下图展示了10个样本：

## 数据准备

我们可以利用已有的训练数据：

[https://archive.ics.uci.edu/ml/machine-learning-databases/iris/iris.data](https://archive.ics.uci.edu/ml/machine-learning-databases/iris/iris.data)

我们看下前几行，内容如下：

```
5.1,3.5,1.4,0.2,Iris-setosa
4.9,3.0,1.4,0.2,Iris-setosa
4.7,3.2,1.3,0.2,Iris-setosa
4.6,3.1,1.5,0.2,Iris-setosa
5.0,3.6,1.4,0.2,Iris-setosa
5.4,3.9,1.7,0.4,Iris-setosa
4.6,3.4,1.4,0.3,Iris-setosa
5.0,3.4,1.5,0.2,Iris-setosa
4.4,2.9,1.4,0.2,Iris-setosa
4.9,3.1,1.5,0.1,Iris-setosa
```

对应的属性名称为别是：

```
'sepal length', 'sepal width', 'petal length', 'petal width', 'species'
```

数据一共是 150行，对应分别如下：

1-50：Iris-setosa

51-100：Iris-versicolor

101-150：Iris-virginica

## 数据加载

```py
import numpy as np
import pandas as pd

data = pd.read_csv('D:/_data/ai-data/knn/iris.data', header=None)
data.columns = ['sepal length', 'sepal width', 'petal length', 'petal width', 'species']    # 特征及类别名称
```

然后，我们将三个类别的数据分别提取出来。

```py
X = data.iloc[0:150, 0:4].values  # 获取前面 4 维度的基本属性
y = data.iloc[0:150, 4].values    # 获取最后一个维度的分类
X_setosa, y_setosa = X[0:50], y[0:50]                     # Iris-setosa 4个特征&分类
X_versicolor, y_versicolor = X[50:100], y[50:100]         # Iris-versicolor 4个特征&分类
X_virginica, y_virginica = X[100:150], y[100:150]         # Iris-virginica 4个特征&分类

y[y == 'Iris-setosa'] = 0                                 # Iris-setosa 输出label用0表示
y[y == 'Iris-versicolor'] = 1                             # Iris-versicolor 输出label用1表示
y[y == 'Iris-virginica'] = 2                              # Iris-virginica 输出label用2表示
```

## 数据可视化

```py
import matplotlib.pyplot as plt

plt.scatter(X_setosa[:, 0], X_setosa[:, 2], color='tomato', marker='o', label='setosa')
plt.scatter(X_versicolor[:, 0], X_versicolor[:, 2], color='skyblue', marker='^', label='versicolor')
plt.scatter(X_virginica[:, 0], X_virginica[:, 2], color='green', marker='s', label='virginica')
plt.xlabel('sepal length')
plt.ylabel('petal length')
plt.legend(loc = 'upper left')
plt.show()
```

![输入图片说明](https://images.gitee.com/uploads/images/2021/0415/211504_d57e95ac_508704.png "屏幕截图.png")

注意：这里为了在平面展现，所以只选取了二维。实际上有四维的属性。

## 数据的分类

接下来，我们要将每个类别的所有样本分成训练样本（training set）、验证集(validation set)和测试样本（test set），各占所有样本的比例分别为60%，20%，20%。

```py
# training set
X_setosa_train = X_setosa[:30, :]
y_setosa_train = y_setosa[:30]
X_versicolor_train = X_versicolor[:30, :]
y_versicolor_train = y_versicolor[:30]
X_virginica_train = X_virginica[:30, :]
y_virginica_train = y_virginica[:30]
X_train = np.vstack([X_setosa_train, X_versicolor_train, X_virginica_train])
y_train = np.hstack([y_setosa_train, y_versicolor_train, y_virginica_train])

# validation set
X_setosa_val = X_setosa[30:40, :]
y_setosa_val = y_setosa[30:40]
X_versicolor_val = X_versicolor[30:40, :]
y_versicolor_val = y_versicolor[30:40]
X_virginica_val = X_virginica[30:40, :]
y_virginica_val = y_virginica[30:40]
X_val = np.vstack([X_setosa_val, X_versicolor_val, X_virginica_val])
y_val = np.hstack([y_setosa_val, y_versicolor_val, y_virginica_val])

# test set
X_setosa_test = X_setosa[40:50, :]
y_setosa_test = y_setosa[40:50]
X_versicolor_test = X_versicolor[40:50, :]
y_versicolor_test = y_versicolor[40:50]
X_virginica_test = X_virginica[40:50, :]
y_virginica_test = y_virginica[40:50]
X_test = np.vstack([X_setosa_test, X_versicolor_test, X_virginica_test])
y_test = np.hstack([y_setosa_test, y_versicolor_test, y_virginica_test])
```

就是把 50 条数据分成 3 个部分：30 10 10。

用于训练、校验和测试。

## 参数的影响

算法实现主要有两点需要确定下：

（1）距离的算法

此处使用欧式距离

（2）K 值的选择

一般来说，k值太小会使模型过于复杂，造成过拟合（overfitting）；k值太大会使模型分类模糊，造成欠拟合(underfitting)。实际应用中，我们可以选择不同的k值，通过验证来决定K值大小。

代码中，我们将k设定为可调参数。

## 算法实现

```py
class KNearestNeighbor(object):
   def __init__(self):
       pass

   # 训练函数
   def train(self, X, y):
       self.X_train = X
       self.y_train = y

   # 预测函数
   def predict(self, X, k=1):
       # 计算L2距离
       num_test = X.shape[0]
       num_train = self.X_train.shape[0]
       dists = np.zeros((num_test, num_train))    # 初始化距离函数
       # because(X - X_train)*(X - X_train) = -2X*X_train + X*X + X_train*X_train, so
       d1 = -2 * np.dot(X, self.X_train.T)    # shape (num_test, num_train)
       d2 = np.sum(np.square(X), axis=1, keepdims=True)    # shape (num_test, 1)
       d3 = np.sum(np.square(self.X_train), axis=1)    # shape (1, num_train)
       dist = np.sqrt(d1 + d2 + d3)

       # 根据K值，选择最可能属于的类别
       y_pred = np.zeros(num_test)
       for i in range(num_test):
           dist_k_min = np.argsort(dist[i])[:k]    # 最近邻k个实例位置
           y_kclose = self.y_train[dist_k_min]     # 最近邻k个实例对应的标签
           y_pred[i] = np.argmax(np.bincount(y_kclose.tolist()))    # 找出k个标签中从属类别最多的作为预测类别

       return y_pred
```


其实算法只有两个部分：

（1）距离的计算

最经典的欧式距离，只不过这里是 2 个矩阵之间的计算。

（2）找出 KNN 对应的分类

然后找出 K 个最近的，进行分类的次数统计。

出现次数最多的，就是最后的分类结果。

## 训练和预测

那么，K 的值应该定为多少才是最好的呢？

首先，创建一个KnearestNeighbor实例对象。

然后，在验证集上进行 k-fold 交叉验证。

选择不同的k值，根据验证结果，选择最佳的k值。

可以假定 k=1~20，然后测试输出。

我们在验证集中进行正确率验证：


### CV 验证代码

```py
#  k-fold CV
KNN = KNearestNeighbor()
KNN.train(X_train, y_train)
for k in range(1, 20):
    y_pred = KNN.predict(X_val, k)
    accuracy = np.mean(y_pred == y_val)
    print('k={} , 正确率：{}'.format(k,accuracy))
```

输出如下：

```
k=1 , 正确率：0.9333333333333333
k=2 , 正确率：0.9
k=3 , 正确率：0.9666666666666667
k=4 , 正确率：0.9333333333333333
k=5 , 正确率：0.9333333333333333
k=6 , 正确率：0.9333333333333333
k=7 , 正确率：0.9666666666666667
k=8 , 正确率：0.9
k=9 , 正确率：0.9333333333333333
k=10 , 正确率：0.9
k=11 , 正确率：0.9
k=12 , 正确率：0.9
k=13 , 正确率：0.9
k=14 , 正确率：0.9
k=15 , 正确率：0.9
k=16 , 正确率：0.9
k=17 , 正确率：0.9333333333333333
k=18 , 正确率：0.9
k=19 , 正确率：0.9
```

可以发现 k = 3 的时候，正确率最高。

### 可视化

可视化代码如下：

```py
#  k-fold CV
list_k = []
list_accuracy = []
KNN = KNearestNeighbor()
KNN.train(X_train, y_train)
for k in range(1, 20):
    y_pred = KNN.predict(X_val, k)
    accuracy = np.mean(y_pred == y_val)
    list_k.append(k)
    list_accuracy.append(accuracy)
    
plt.plot(list_k, list_accuracy, linewidth=1)#线宽
plt.title("k-fold CV", fontsize=16)#标题及字号
plt.xlabel("k")#X轴标题及字号
plt.ylabel("accuracy")#Y轴标题及字号
plt.show()
```

效果如下如：

![输入图片说明](https://images.gitee.com/uploads/images/2021/0415/220856_d47c4edf_508704.png "屏幕截图.png")

# 完整代码

```py
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

class KNearestNeighbor(object):
   def __init__(self):
       pass

   # 训练函数
   def train(self, X, y):
       self.X_train = X
       self.y_train = y

   # 预测函数
   def predict(self, X, k=1):
       # 计算L2距离
       num_test = X.shape[0]
       num_train = self.X_train.shape[0]
       dists = np.zeros((num_test, num_train))    # 初始化距离函数
       # because(X - X_train)*(X - X_train) = -2X*X_train + X*X + X_train*X_train, so
       d1 = -2 * np.dot(X, self.X_train.T)    # shape (num_test, num_train)
       d2 = np.sum(np.square(X), axis=1, keepdims=True)    # shape (num_test, 1)
       d3 = np.sum(np.square(self.X_train), axis=1)    # shape (1, num_train)
       dist = np.sqrt(d1 + d2 + d3)

       # 根据K值，选择最可能属于的类别
       y_pred = np.zeros(num_test)
       for i in range(num_test):
           dist_k_min = np.argsort(dist[i])[:k]    # 最近邻k个实例位置
           y_kclose = self.y_train[dist_k_min]     # 最近邻k个实例对应的标签
           y_pred[i] = np.argmax(np.bincount(y_kclose.tolist()))    # 找出k个标签中从属类别最多的作为预测类别

       return y_pred

data = pd.read_csv('D:/_data/ai-data/knn/iris.data', header=None)
data.columns = ['sepal length', 'sepal width', 'petal length', 'petal width', 'species']    # 特征及类别名称

X = data.iloc[0:150, 0:4].values  # 获取前面 4 维度的基本属性
y = data.iloc[0:150, 4].values    # 获取最后一个维度的分类
X_setosa, y_setosa = X[0:50], y[0:50]                     # Iris-setosa 4个特征&分类
X_versicolor, y_versicolor = X[50:100], y[50:100]         # Iris-versicolor 4个特征&分类
X_virginica, y_virginica = X[100:150], y[100:150]         # Iris-virginica 4个特征&分类

y[y == 'Iris-setosa'] = 0                                 # Iris-setosa 输出label用0表示
y[y == 'Iris-versicolor'] = 1                             # Iris-versicolor 输出label用1表示
y[y == 'Iris-virginica'] = 2                              # Iris-virginica 输出label用2表示


# training set
X_setosa_train = X_setosa[:30, :]
y_setosa_train = y_setosa[:30]
X_versicolor_train = X_versicolor[:30, :]
y_versicolor_train = y_versicolor[:30]
X_virginica_train = X_virginica[:30, :]
y_virginica_train = y_virginica[:30]
X_train = np.vstack([X_setosa_train, X_versicolor_train, X_virginica_train])
y_train = np.hstack([y_setosa_train, y_versicolor_train, y_virginica_train])

# validation set
X_setosa_val = X_setosa[30:40, :]
y_setosa_val = y_setosa[30:40]
X_versicolor_val = X_versicolor[30:40, :]
y_versicolor_val = y_versicolor[30:40]
X_virginica_val = X_virginica[30:40, :]
y_virginica_val = y_virginica[30:40]
X_val = np.vstack([X_setosa_val, X_versicolor_val, X_virginica_val])
y_val = np.hstack([y_setosa_val, y_versicolor_val, y_virginica_val])

# test set
X_setosa_test = X_setosa[40:50, :]
y_setosa_test = y_setosa[40:50]
X_versicolor_test = X_versicolor[40:50, :]
y_versicolor_test = y_versicolor[40:50]
X_virginica_test = X_virginica[40:50, :]
y_virginica_test = y_virginica[40:50]
X_test = np.vstack([X_setosa_test, X_versicolor_test, X_virginica_test])
y_test = np.hstack([y_setosa_test, y_versicolor_test, y_virginica_test])


# 运行
KNN = KNearestNeighbor()
KNN.train(X_train, y_train)
y_pred = KNN.predict(X_test, k=3)
accuracy = np.mean(y_pred == y_test)
print('测试集预测准确率：%f' % accuracy)
```

# 拓展阅读

[测试数据](https://archive.ics.uci.edu/ml/index.php)

# 总结

k近邻算法是一种最简单最直观的分类算法。它的训练过程保留了所有样本的所有特征，把所有信息都记下来，没有经过处理和提取。

而其它机器学习算法包括神经网络则是在训练过程中提取最重要、最有代表性的特征。

在这一点上，kNN算法还非常不够“智能”。

但是，kNN算法作为机器学习的基础算法，还是值得我们了解一下的。

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次相遇。

# 参考资料

《统计学习方法》

[K-fold交叉验证实现python](http://www.voidcn.com/article/p-dmowgkpg-bvt.html)

https://www.captainai.net/plumlegend/

[K近邻算法详解](https://www.jianshu.com/p/2682b4676b71)

[k邻近算法有什么实际应用意义？](https://www.zhihu.com/question/448966376/answer/1808566926)

[knn算法的原理与实现](https://blog.csdn.net/hellozhxy/article/details/80932185)

[机器学习之KNN最邻近分类算法](https://blog.csdn.net/pengjunlee/article/details/82713047)

[距离产生美？k近邻算法python实现](https://redstonewill.blog.csdn.net/article/details/80607960)

[K近邻法(KNN)原理小结](https://www.cnblogs.com/pinard/p/6061661.html)

[KNN算法原理以及代码实现](https://www.cnblogs.com/lmcltj/p/11010211.html)

[KNN算法原理及实现](https://www.cnblogs.com/sxron/p/5451923.html)

[K-临近算法介绍和实践](https://blog.csdn.net/qq_34841823/article/details/78610998)

[机器学习2—KNN算法(原理、实现、实例)](https://zhuanlan.zhihu.com/p/30793832)

https://blog.csdn.net/weixin_44508906/article/details/90116509

https://blog.csdn.net/v_july_v/article/details/8203674

https://www.cnblogs.com/louyifei0824/p/10000448.html

http://www.360doc.com/content/18/0412/11/9824753_744973368.shtml

https://segmentfault.com/a/1190000011266815

https://segmentfault.com/a/1190000011174688

* any list
{:toc}