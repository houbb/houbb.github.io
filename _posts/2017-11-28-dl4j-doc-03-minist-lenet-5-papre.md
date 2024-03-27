---
layout: post
title:  dl4j doc-03-minist 手写识别 Lenet-5 paper 论文学习 《Gradient-Based Learning Applied to Document Recognition》
date:  2017-04-16 12:03:32 +0800
categories: [Deep Learning]
tags: [AI, DL, dl4j, neural network]
published: true
---

# 前言

官方的入门例子 Minist 对应的算法是 LeNet-5，代码上有一段注释：

```
 * Implementation of LeNet-5 for handwritten digits image classification on MNIST dataset (99% accuracy)
 * <a href="http://yann.lecun.com/exdb/publis/pdf/lecun-01a.pdf">[LeCun et al., 1998. Gradient based learning applied to document recognition]</a>
 * Some minor changes are made to the architecture like using ReLU and identity activation instead of
 * sigmoid/tanh, max pooling instead of avg pooling and softmax output layer.
```

## 为什么 LeNet-5 这么优秀？

LeNet-5在MNIST数据集上表现出色的原因有几个：

1. **结构设计合理：** LeNet-5是一个经典的卷积神经网络结构，具有较好的设计。它由卷积层、池化层和全连接层构成，这些层的结合能够有效地捕捉图像中的特征并实现分类。

2. **参数量适中：** LeNet-5相对于当今更深层次的网络结构来说，参数量较少。这使得它在MNIST这样相对简单的数据集上训练速度较快，而且不容易出现过拟合的问题。

3. **局部连接和权值共享：** LeNet-5采用了局部连接和权值共享的机制，这样可以大大减少网络参数的数量，同时也提高了模型的泛化能力。

4. **激活函数选择：** LeNet-5使用了Sigmoid函数和tanh函数等在当时较为流行的激活函数，这些激活函数对于浅层神经网络的训练效果较好。

5. **数据集特点：** MNIST数据集是一个相对简单的手写数字数据集，图像分辨率低，数字之间的差异较大。LeNet-5结合了卷积和池化操作，能够有效地提取图像中的特征，使得对于MNIST数据集这样的任务具有较好的表现。

总的来说，LeNet-5在MNIST数据集上表现出色的原因主要是由于其结构设计合理、参数量适中、采用了局部连接和权值共享的机制以及激活函数选择等因素的综合作用。

## 论文

LeNet-5是由Yann LeCun、Léon Bottou、Yoshua Bengio、Patrick Haffner于1998年提出的，是一个经典的卷积神经网络结构，被广泛用于图像识别任务。

该论文名为《Gradient-Based Learning Applied to Document Recognition》，可以在以下网址找到：

[Gradient-Based Learning Applied to Document Recognition](http://vision.stanford.edu/cs598_spring07/papers/Lecun98.pdf)

这个论文介绍了LeNet-5结构以及它在手写数字识别等任务上的应用。



# TODO

...


# 参考资料

[DL4J无法下载MNIST数据集解决 Server returned HTTP response code: 403 for URL解决方法](https://blog.csdn.net/m0_46948660/article/details/134167829)

MNIST数据下载地址: http://github.com/myleott/mnist_png/raw/master/mnist_png.tar.gz

GitHub示例地址: https://github.com/deeplearning4j/deeplearning4j-examples/blob/master/dl4j-examples/src/main/java/org/deeplearning4j/examples/quickstart/modeling/convolution/LeNetMNISTReLu.java


# 参考资料

https://deeplearning4j.konduit.ai/multi-project/tutorials/quickstart


* any list
{:toc}
