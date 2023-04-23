---
layout: post
title: Weka 入门学习-04-mnist 手写数字和字母数据集
date:  2023-04-14 +0800
categories: [AI]
tags: [ai, weka, sh]
published: true
---

# 说明

可从此页面获取手写数字的 MNIST 数据库，训练集包含 60,000 个示例，测试集包含 10,000 个示例。 

它是 NIST 提供的更大集合的子集。 这些数字已经过大小归一化并在固定大小的图像中居中。

对于想要在真实世界数据上尝试学习技术和模式识别方法，同时在预处理和格式化上花费最少精力的人们来说，这是一个很好的数据库。

本站提供四个文件：

train-images-idx3-ubyte.gz：训练集图像（9912422 字节）
train-labels-idx1-ubyte.gz：训练集标签（28881 字节）
t10k-images-idx3-ubyte.gz：测试集图像（1648877 字节）
t10k-labels-idx1-ubyte.gz：测试集标签（4542 字节）

请注意，您的浏览器可能会在不通知您的情况下解压缩这些文件。 如果您下载的文件比上述文件大，则说明您的浏览器未对文件进行解压。 只需重命名它们即可删除 .gz 扩展名。 有人问我“我的应用程序无法打开您的图像文件”。 这些文件不是任何标准图像格式。 您必须编写自己的（非常简单的）程序才能阅读它们。 文件格式在本页底部描述。

来自 NIST 的原始黑白（二值）图像经过尺寸标准化以适合 20x20 像素框，同时保持其纵横比。 由于归一化算法使用的抗锯齿技术，生成的图像包含灰度级。 通过计算像素的质心并平移图像以便将该点定位在 28x28 区域的中心，图像在 28x28 图像中居中。

使用某些分类方法（特别是基于模板的方法，例如 SVM 和 K 最近邻），当数字以边界框而不是质心为中心时，错误率会提高。 如果你进行了这种预处理，你应该在你的出版物中报告它。

MNIST 数据库由 NIST 的特殊数据库 3 和特殊数据库 1 构建而成，其中包含手写数字的二进制图像。 NIST 最初指定 SD-3 作为他们的训练集，SD-1 作为他们的测试集。 但是，SD-3 比 SD-1 更清晰、更容易识别。 究其原因，SD-3 是在人口普查局员工中收集的，而 SD-1 是在高中生中收集的。 从学习实验中得出明智的结论要求结果独立于训练集的选择和在完整样本集之间的测试。 因此，有必要通过混合 NIST 的数据集来构建一个新的数据库。

MNIST 训练集由来自 SD-3 的 30,000 个模式和来自 SD-1 的 30,000 个模式组成。 我们的测试集由来自 SD-3 的 5,000 个模式和来自 SD-1 的 5,000 个模式组成。 60,000 个模式训练集包含来自大约 250 位作者的示例。 我们确保训练集和测试集的作者集是不相交的。

SD-1 包含由 500 位不同作者编写的 58,527 个数字图像。 与 SD-3 不同的是，每个写入器的数据块按顺序出现，而 SD-1 中的数据是经过加密的。 SD-1 的作者身份可用，我们使用此信息来解读作者。 然后我们将 SD-1 分成两部分：前 250 位作者写的字符进入我们的新训练集。 其余 250 名作者被放入我们的测试集中。 因此，我们有两组，每组都有近 30,000 个示例。 新的训练集是用来自 SD-3 的足够示例完成的，从模式 #0 开始，以构成一整套 60,000 个训练模式。 类似地，新的测试集是用 SD-3 示例从模式 #35,000 开始完成的，以构成一个包含 60,000 个测试模式的完整集。 此站点上只有 10,000 个测试图像的子集（SD-1 中的 5,000 个和 SD-3 中的 5,000 个）可用。 完整的 60,000 个样本训练集可用。

许多方法已经用这个训练集和测试集进行了测试。 这里有一些例子。 有关这些方法的详细信息将在即将发表的论文中给出。 其中一些实验使用了一个版本的数据库，其中输入图像经过校正（通过计算最接近垂直的形状的主轴，并移动线条以使其垂直）。 在其他一些实验中，训练集增加了原始训练样本的人为扭曲版本。 失真是移位、缩放、倾斜和压缩的随机组合。

# MNIST 数据库的文件格式

数据以非常简单的文件格式存储，专为存储向量和多维矩阵而设计。 

此格式的一般信息在本页末尾提供，但您无需阅读它即可使用数据文件。

文件中的所有整数都以大多数非英特尔处理器使用的 MSB 优先（高位优先）格式存储。 Intel 处理器和其他低端机器的用户必须翻转标头的字节。

有4个文件：

train-images-idx3-ubyte：训练集图像
train-labels-idx1-ubyte：训练集标签
t10k-images-idx3-ubyte：测试集图像
t10k-labels-idx1-ubyte：测试集标签

训练集包含 60000 个示例，测试集包含 10000 个示例。

测试集的前 5000 个示例取自原始 NIST 训练集。 最后 5000 个来自原始 NIST 测试集。 

前 5000 个比后 5000 个更干净、更容易。

## TRAINING SET LABEL FILE (train-labels-idx1-ubyte):

```
[offset] [type]          [value]          [description]
0000     32 bit integer  0x00000801(2049) magic number (MSB first)
0004     32 bit integer  60000            number of items
0008     unsigned byte   ??               label
0009     unsigned byte   ??               label
........
xxxx     unsigned byte   ??               label
The labels values are 0 to 9.
```

## TRAINING SET IMAGE FILE (train-images-idx3-ubyte):

```
[offset] [type]          [value]          [description]
0000     32 bit integer  0x00000803(2051) magic number
0004     32 bit integer  60000            number of images
0008     32 bit integer  28               number of rows
0012     32 bit integer  28               number of columns
0016     unsigned byte   ??               pixel
0017     unsigned byte   ??               pixel
........
xxxx     unsigned byte   ??               pixel
```

## TEST SET LABEL FILE (t10k-labels-idx1-ubyte):

```
[offset] [type]          [value]          [description]
0000     32 bit integer  0x00000801(2049) magic number (MSB first)
0004     32 bit integer  10000            number of items
0008     unsigned byte   ??               label
0009     unsigned byte   ??               label
........
xxxx     unsigned byte   ??               label
```


## TEST SET IMAGE FILE (t10k-images-idx3-ubyte):

```
[offset] [type]          [value]          [description]
0000     32 bit integer  0x00000803(2051) magic number
0004     32 bit integer  10000            number of images
0008     32 bit integer  28               number of rows
0012     32 bit integer  28               number of columns
0016     unsigned byte   ??               pixel
0017     unsigned byte   ??               pixel
........
xxxx     unsigned byte   ??               pixel
```

# IDX 文件格式

IDX 文件格式是一种用于各种数值类型的向量和多维矩阵的简单格式。

基本格式是

```
magic number
size in dimension 0
size in dimension 1
size in dimension 2
.....
size in dimension N
data
```

幻数是一个整数（MSB 在前）。 前 2 个字节始终为 0。

第三个字节编码数据的类型：

0x08：无符号字节
0x09：有符号字节
0x0B：短（2 字节）
0x0C：整数（4 字节）
0x0D：浮点数（4 字节）
0x0E：双精度（8 字节）

第 4 个字节编码向量/矩阵的维数：1 表示向量，2 表示矩阵……

每个维度的大小都是 4 字节整数（MSB 优先，高位优先，就像在大多数非英特尔处理器中一样）。

数据像 C 数组一样存储，即最后一个维度中的索引变化最快。

MNIST 集中的数字图像最初是由 Chris Burges 和 Corinna Cortes 使用边界框归一化和居中选择和试验的。 本页提供的 Yann LeCun 版本在较大的窗口中使用质心居中。

# 小结

总体感受 V3.5 版本的错误比较多，基本不可用。

估计 4.0 会好很多。

# 参考资料

http://yann.lecun.com/exdb/mnist/

* any list
{:toc}