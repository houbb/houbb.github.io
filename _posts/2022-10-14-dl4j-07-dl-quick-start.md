---
layout: post
title: DeepLearning4j-07-DL4j 快速开始
date:  2022-10-14 09:22:02 +0800
categories: [AI]
tags: [ai, dl4j, ml, sh]
published: true
---

# DL4j

这是运行 DL4J 示例和开始您自己的项目所需的一切。

我们建议您加入我们的社区论坛。 

您可以在那里请求帮助并提供反馈，但请在提出我们在下面回答的问题之前使用本指南。 

如果您不熟悉深度学习，我们为初学者提供了[路线图](https://deeplearning4j.konduit.ai/multi-project/tutorials/beginners)，其中包含课程、阅读材料和其他资源的链接。

我们目前正在重新编写入门指南。

如果您发现无法按照此处进行操作，请查看 Konduit 博客，因为它包含一些来自社区的入门指南。

## 代码的味道

Deeplearning4j 是一种特定领域的语言，用于配置由多层组成的深度神经网络。 

一切都从 MultiLayerConfiguration 开始，它组织了这些层及其超参数。

超参数是决定神经网络如何学习的变量。 

它们包括更新模型权重的次数、如何初始化这些权重、将哪个激活函数附加到节点、使用哪种优化算法以及模型应该学习多快。 

这是一种配置的样子：

```java
MultiLayerConfiguration conf = new NeuralNetConfiguration.Builder()
    .weightInit(WeightInit.XAVIER)
    .activation(Activation.RELU)
    .optimizationAlgo(OptimizationAlgorithm.STOCHASTIC_GRADIENT_DESCENT)
    .updater(new Sgd(0.05))
    // ... other hyperparameters
    .list()
    .backprop(true)
    .build();
```

使用 Deeplearning4j，您可以通过在 NeuralNetConfiguration.Builder() 上调用 layer 来添加一个层，指定它的层顺序（下面的零索引层是输入层）、输入和输出节点的数量、nIn 和 nOut ，以及类型：DenseLayer。

```java
.layer(0, new DenseLayer.Builder().nIn(784).nOut(250).build())
```

配置好网络后，您可以使用 `model.fit` 训练模型。

# 在您自己的项目中使用 DL4J：配置 POM.xml 文件

要在您自己的项目中运行 DL4J，我们强烈建议为 Java 用户使用 Maven，或者为 Scala 使用 SBT 等工具。 

基本的依赖集及其版本如下所示。 这包括：

deeplearning4j-core，包含神经网络实现

nd4j-native-platform，为 DL4J 提供支持的 ND4J 库的 CPU 版本

datavec-api - Datavec 是我们的库矢量化和加载数据

每个 Maven 项目都有一个 POM 文件。以下是运行示例时 POM 文件的显示方式。

在 IntelliJ 中，您需要选择要运行的第一个 Deeplearning4j 示例。

我们建议使用 MLPClassifierLinear，因为您几乎会立即在我们的 UI 中看到网络对两组数据进行分类。 Github 上的文件可以在这里找到。

要运行该示例，请右键单击它并选择下拉菜单中的绿色按钮。

您将在 IntelliJ 的底部窗口中看到一系列分数。最右边的数字是网络分类的错误分数。如果您的网络正在学习，那么随着时间的推移，这个数字会随着它处理的每个批次而减少。

最后，这个窗口会告诉你你的神经网络模型变得多么准确：

![](../../.gitbook/assets/mlp_classifier_results%20(4).png)

在另一个窗口中，将出现一个图表，向您展示多层感知器 (MLP) 如何对示例中的数据进行分类。它看起来像这样：

恭喜！您刚刚使用 Deeplearning4j 训练了您的第一个神经网络。

# 参考资料

https://deeplearning4j.konduit.ai/deeplearning4j/tutorials/quick-start

* any list
{:toc}