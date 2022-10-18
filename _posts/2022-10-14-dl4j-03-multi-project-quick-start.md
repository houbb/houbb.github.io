---
layout: post
title: DeepLearning4j-03-Multi Project Quick start 快速开始
date:  2022-10-14 09:22:02 +0800
categories: [AI]
tags: [ai, dl4j, ml, sh]
published: true
---

# 开始使用

这是运行 DL4J 示例和开始您自己的项目所需的一切。

我们建议您加入我们的社区论坛。 

您可以在那里请求帮助并提供反馈，但请在提出我们在下面回答的问题之前使用本指南。 

如果您不熟悉深度学习，我们为初学者提供了路线图，其中包含课程、阅读材料和其他资源的链接。

如果您只是想开始，请考虑阅读我们的核心工作流程指南。

## 快速概览

Deeplearning4j 最初是一种用于配置深度神经网络的特定领域语言，后来演变成一套工具，开发人员可以使用它来完成从 Java 中的训练模型到部署模型到生产的所有工作。

用例包括：

1. 数值计算。 请参阅：https://github.com/eclipse/deeplearning4j-examples/tree/master/nd4j-ndarray-examples

2. 使用类似 tensorflow/pytorch 的界面定义和训练模型。 请参阅：https://github.com/eclipse/deeplearning4j-examples/tree/master/samediff-examples

3. 模型导入和部署。 请参阅：https://github.com/eclipse/deeplearning4j-examples/tree/master/tensorflow-keras-import-examples

4. 在 spark 上运行模型。 请参阅：https://github.com/eclipse/deeplearning4j-examples/tree/master/dl4j-distributed-training-examples

5. 一个用于运行数学代码的小型自包含库。 见：https://github.com/eclipse/deeplearning4j/tree/master/libnd4j

其他用例也可用，请随时查看我们的更多示例

# 先决条件

Java（开发者版本）1.8 或更高版本（仅支持 64 位版本）

Apache Maven（自动构建和依赖管理器）

IntelliJ IDEA 或 Eclipse

GIT

ps: 这4个我相信 java 开发者都很熟悉，此处不做展开。

您应该安装这些以使用本快速入门指南。 

DL4J 面向熟悉生产部署、IDE 和自动化构建工具的专业 Java 开发人员。 如果您已经有这些经验，那么使用 DL4J 将是最容易的。

如果您是 Java 新手或不熟悉这些工具，请阅读以下详细信息以获取安装和设置帮助。 

否则，请跳至 DL4J 示例。

# 快速开始模板

现在您已经了解了如何运行不同的示例，我们为您提供了一个模板，其中包含一个带有简单评估代码的基本 MNIST 训练器。

快速入门模板位于 https://github.com/eclipse/deeplearning4j-examples/tree/master/mvn-project-template。

要使用模板：

从示例中复制standalone-sample-project 并将其命名为您的项目名称。

将文件夹导入 IntelliJ。

开始编码！


# 获取代码

## git clone

下载代码到本地。

```
git clone https://github.com/eclipse/deeplearning4j-examples.git
```

## 打开

使用 idea 打开项目。

虽然找一个例子运行。

ps: 官方的 demo 文档太大太重了。不如来一个 hello word 入门简单。

# 在你的项目中使用 dl4j


要在您自己的项目中运行 DL4J，我们强烈建议为 Java 用户使用 Maven，或者为 Scala 使用 SBT 等工具。基本的依赖集及其版本如下所示。这包括：

deeplearning4j-core，包含神经网络实现

nd4j-native-platform，为 DL4J 提供支持的 ND4J 库的 CPU 版本

datavec-api - Datavec 是我们的库矢量化和加载数据

每个 Maven 项目都有一个 POM 文件。以下是运行示例时 POM 文件的显示方式。

在 IntelliJ 中，您需要选择要运行的第一个 Deeplearning4j 示例。我们建议使用 MLPClassifierLinear，因为您几乎会立即在我们的 UI 中看到网络对两组数据进行分类。 Github 上的文件可以在这里找到。

要运行该示例，请右键单击它并选择下拉菜单中的绿色按钮。您将在 IntelliJ 的底部窗口中看到一系列分数。最右边的数字是网络分类的错误分数。如果您的网络正在学习，那么随着时间的推移，这个数字会随着它处理的每个批次而减少。最后，这个窗口会告诉你你的神经网络模型变得多么准确：

在另一个窗口中，将出现一个图表，向您展示多层感知器 (MLP) 如何对示例中的数据进行分类。它看起来像这样：

恭喜！您刚刚使用 Deeplearning4j 训练了您的第一个神经网络。

# 下一步

加入我们在 [community.konduit.ai](https://community.konduit.ai/) 上的社区论坛。

阅读[深度神经网络简介](https://skymind.ai/wiki/neural-network)。

查看更详细的综合设置指南。

# 更多关于 Eclipse Deeplearning4j

Deeplearning4j 是一个框架，可让您从一开始就选择所有可用的东西。

我们不是 Tensorflow（具有自动微分功能的低级数值计算库）或 Pytorch。 

Deeplearning4j 有几个子项目，可以轻松构建端到端应用程序。

如果您想将模型部署到生产环境，您可能会喜欢我们从 Keras 导入的模型。

Deeplearning4j 有几个子模块。这些范围从可视化 UI 到 Spark 上的分布式培训。有关这些模块的概述，请查看 Github 上的 Deeplearning4j 示例。

要开始使用简单的桌面应用程序，您需要两件事：nd4j 后端和 deeplearning4j-core。有关更多代码，请参阅更简单的示例子模块。

如果你想要一个灵活的深度学习 API，有两种方法可以走。您可以独立使用 nd4j 请参阅我们的 nd4j 示例或计算图 API。

如果您想在 Spark 上进行分布式培训，可以查看我们的 Spark 页面。请记住，我们无法为您设置 Spark。如果您想设置分布式 Spark 和 GPU，这在很大程度上取决于您。 

Deeplearning4j 只是在现有 Spark 集群上部署为 JAR 文件。

如果您想要使用 GPU 的 Spark，我们建议使用带有 Mesos 的 Spark。

如果您想在移动设备上部署，您可以查看我们的 Android 页面。

我们为各种硬件架构本地部署优化代码。我们像其他人一样使用基于 C++ 的 for 循环。

为此，请参阅我们的 C++ 框架 libnd4j。

Deeplearning4j 还有两个值得注意的组件：

Arbiter：超参数优化和模型评估

DataVec：用于机器学习数据管道的内置 ETL

Deeplearning4j 旨在成为构建真实应用程序的端到端平台，而不仅仅是具有自动微分功能的张量库。

如果你想要一个带有 autodiff 的张量库，请参阅 ND4J 和 Samediff。 Samediff 仍处于测试阶段，但如果您想贡献，请加入我们的社区论坛。

最后，如果您正在对 Deeplearnin4j 进行基准测试，请考虑加入我们的社区论坛并寻求建议。 

Deeplearning4j 拥有所有的旋钮，但有些可能不像 Python 框架那样工作。



# 参考资料

https://deeplearning4j.konduit.ai/multi-project/tutorials/quickstart

* any list
{:toc}