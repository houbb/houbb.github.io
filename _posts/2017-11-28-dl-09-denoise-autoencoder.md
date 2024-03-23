---
layout: post
title:  DL4j-09-De-Noise Encoder
date:  2017-12-01 21:30:47 +0800
categories: [Deep Learning]
tags: [AI, DL, dl4j, neural network]
header-img: "static/app/res/img/kon-bg.jpeg"
published: true
---


# 深度自动编码器

自动编码器是一种用于降维的神经网络，这也就是说，它可以用于特征选择和提取。
隐藏层数量多于输入的自动编码器有可能会学习[恒等函数](https://en.wikipedia.org/wiki/Identity_function)（输出直接等于输入的函数），进而变得无用。

降噪自动编码器是基本自动编码器的一种扩展，是加入了随机因素的自动编码器。降噪自动编码器采用对输入进行随机污染（即引入噪声）的方式来减少学习恒等函数的风险，
自动编码器必须将污染后的输入重构，或称**降噪**。

## 参数和污染率

对输入加入的噪声以百分比形式计量。一般而言，污染率在 30%(0.3) 是比较合适的，但如果数据量非常少，就有可能要增加噪声量。

## 输入/初始化降噪自动编码器

单线程降噪自动编码器很容易设置。

要创建自动编码器，只需将一个AutoEncoder类实例化并设定corruptionLevel，即噪声，如下面的例子所示。

以上就是使用MNIST数据设置有一个可见层和一个隐藏层的降噪自动编码器的方法。该网络的学习速率为0.1，动量为0.9，使用重构叉熵作为损失函数。

接下来我们将向您介绍堆叠式降噪自动编码器，也就是许多串在一起的降噪自动编码器。


# 堆叠式降噪自动编码器


堆叠式降噪自动编码器（SDA）与降噪自动编码器的关系就像是深度置信网络与受限玻尔兹曼机一样。

SDA的关键功能之一是**随着输入的传递逐层进行无监督预定型**，更广义地来看，这也是深度学习的关键功能之一。
当每个层都接受了预定型，学习了如何对来自前一层的输入进行特征选择和提取之后，就可以开始第二阶段的有监督微调。

这里要对SDA中的随机污染稍作说明：降噪自动编码器会将数据随机化，然后再通过尝试重构这些数据来进行学习。
随机化的动作即是引入“噪声”，而网络的任务就是识别出噪声之中的特征，依靠这些特征来将输入的数据分类。
网络在定型时会生成一个模型，用一种损失函数来衡量模型与基准之间的距离。
网络会尝试将损失函数最小化，方法是重新对随机化的输入采样并再次重构数据，直至找到可以使模型与已设定的实际基准最为接近的输入。

这种连续的重采样基于一种可以提供随机数据的生成模型，称为**马尔可夫链**——更具体地说，是马尔可夫蒙特卡洛算法，它会遍历整个数据集，搜寻可以构成越来越复杂的特征的代表性指标样本。

在 Deeplearning4j 中，构建堆叠式降噪自动编码器的方法是创建一个以自动编码器作为隐藏层的 `MultiLayerNetwork` 网络。

这些自动编码器有 `corruptionLevel`（污染率）的设定，指的就是“噪声”；神经网络会学习如何降低这种噪声信号。注意pretrain是设定为“真”的。

同理，构建深度置信网络的方法是创建以受限玻尔兹曼机作为隐藏层的 `MultiLayerNetwork` 网络。

总而言之，您可以认为Deeplearning4j是用 RBM 和自动编码器等“原始神经网络”来构建各种深度神经网络的。


```java
MultiLayerConfiguration conf = new NeuralNetConfiguration.Builder()
       .seed(seed)
       .gradientNormalization(GradientNormalization.ClipElementWiseAbsoluteValue)
       .gradientNormalizationThreshold(1.0)
       .iterations(iterations)
       .momentum(0.5)
       .momentumAfter(Collections.singletonMap(3, 0.9))
       .optimizationAlgo(OptimizationAlgorithm.CONJUGATE_GRADIENT)
       .list(4)
       .layer(0, new AutoEncoder.Builder().nIn(numRows * numColumns).nOut(500)
               .weightInit(WeightInit.XAVIER).lossFunction(LossFunction.RMSE_XENT)
               .corruptionLevel(0.3)
               .build())
            .layer(1, new AutoEncoder.Builder().nIn(500).nOut(250)
                    .weightInit(WeightInit.XAVIER).lossFunction(LossFunction.RMSE_XENT)
                    .corruptionLevel(0.3)

                    .build())
            .layer(2, new AutoEncoder.Builder().nIn(250).nOut(200)
                    .weightInit(WeightInit.XAVIER).lossFunction(LossFunction.RMSE_XENT)
                    .corruptionLevel(0.3)
                    .build())
            .layer(3, new OutputLayer.Builder(LossFunction.NEGATIVELOGLIKELIHOOD).activation("softmax")
                    .nIn(200).nOut(outputNum).build())
       .pretrain(true).backprop(false)
            .build();
```




* any list
{:toc}







