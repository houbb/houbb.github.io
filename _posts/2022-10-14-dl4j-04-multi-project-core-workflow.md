---
layout: post
title: DeepLearning4j-04-Multi Project 核心流程
date:  2022-10-14 09:22:02 +0800
categories: [AI]
tags: [ai, dl4j, ml, sh]
published: true
---

# 介绍

端到端工作流程涉及以下内容：

- 准备数据

- 正则化

- 建立模型

- 调整模型

- 准备部署

此页面将尝试涵盖每个工作流程的注意事项，并链接到其他资源，以了解如何处理可能特定于特定人员的每个步骤。 

# 准备数据

数据总是需要进行预处理。 这意味着将数据从不同数据类型的原始源转换为要由神经网络处理的 ndarray。 在 deeplearning4j 套件中，有几种方法可以做到这一点：
datavec 模块：使用记录读取器抽象，可以通过数据集迭代器批量读取数据以训练模型

在python4j中使用嵌入python代码的预处理：使用pandas和python opencv等python生态系统，可以嵌入python脚本，输出numpy数组进行训练

自定义 java 代码：使用 3rd 方库，例如 tableaw 和 javacv

对于各种数据类型，我们建议如下：

CSV：如果您有大量数据，datavec 中的 CSV 记录阅读器非常适合。原因是记录阅读器假设您使用的数据太大而无法放入内存。如果您有一个可以放入内存的较小数据集，您可以查看我们的表锯示例。如果您有大量 CSV 数据，那么我们这里的示例应该可以正常工作。

图像：基于 javacv 的原生图像加载器和图像记录读取器处理加载任何格式的图像，并且可以轻松转换为标记的图像数据集。我们在这里有一个全面的图像示例。

NLP：DL4J 套件有一个核心标记器 api，用户可以在其中提供一个标记器并从中构建一个迭代器。该接口和我们的 BERT 迭代器之类的组合允许使用最新的转换器模型。如果您正在寻找 word2vec，那么我们在这里也有相关示例。

音频：我们这里有一个 midi 示例。音频应被视为时间序列。对于您的工作流程，javacpp（我们的 ndarray 库 nd4j 内部支持）具有 ffmpeg 绑定。由于项目的许可限制（基本上没有gpl代码）我们不能直接在项目中包含ffmpeg，但欢迎您在社区论坛提问。

视频：Dl4j 不直接支持视频，但确实有 3d 卷积层用于处理视频帧。建议使用上面提到的 javacv 或 ffmpeg 处理视频并将其转换为帧。请使用我们的论坛获得更多支持。

弄清楚如何转换数据后，您将需要弄清楚如何将其拆分为训练集和验证集。 Dl4j 允许您以几种方式执行此操作。

如果您所有的数据都在内存中，您可以使用我们的数据集 api 的拆分测试和训练 api。

可以在此处找到该工作流程的示例。 

如果您的数据可能不适合内存，那么可能值得研究我们的 minibatch 管道以及在 minibatch 上创建测试列车拆分的方法。 

我们的图像示例涵盖了这一点。 

对于图像等较大的输入数据，强烈建议对数据进行小批量分区。

# 正则化（Normalization）

创建输入数据并将其转换为 ndarray 后，您仍然需要决定如何规范化数据。 

DL4J 有一组涵盖标准预处理的规范化器，包括：

- [零均值单位方差](https://github.com/eclipse/deeplearning4j-examples/blob/165f406763330d5e7f8ce842e76d4376e24ff0d1/dl4j-examples/src/main/java/org/deeplearning4j/examples/wip/quickstart/modelling/AnimalClassifier.java#L108)

- [将 0 缩放到 1 - 请注意，这也可以用于缩放到最小值和最大值，例如在本例中介于 1 和 255 之间的图像](https://github.com/eclipse/deeplearning4j-examples/blob/165f406763330d5e7f8ce842e76d4376e24ff0d1/dl4j-examples/src/main/java/org/deeplearning4j/examples/quickstart/modeling/feedforward/regression/CSVDataModel.java#L78)

规范化器，如即将推出的模型，可以作为管道的一部分保存和加载。 即使在部署期间，模型也必须具有随附的规范化器。 可以在此处找到序列化规范器的示例。

# 建立模型

一旦您弄清楚如何将数据序列化为 ndarray，您需要弄清楚您将如何构建模型。

构建模型时，您可以选择以下选项之一：

使用更高级别的 dl4j 接口训练模型。一个简单的例子可以在这里找到。

使用 samediff 训练模型：级别较低但更灵活。一个例子可以在这里找到。

从其他框架导入模型，例如 tensorflow、keras 或 pytorch。

如果要导入模型，需要注意一些事项。

Tensorflow 导入：这使用了samediff。 Samediff 有 2 种形式的 tensorflow 导入。新版本是使用更具扩展性的模型导入框架的推荐路径。

Pytorch：目前需要通过onnx导入pytorch模型。请使用 pytorch 的 onnx 模型导出将 pytorch 模型导入 deeplearning4j

Keras：keras h5 格式集成有点老，使用更高级别的 dl4j 接口。非顺序模型的 Keras 模型导入使用计算图。一个例子可以在这里找到。序列模型可以在这里找到。

对于更高级的模型，建议用户选择 samediff 框架。 展望未来，这将是训练和运行模型的首选方式。

保存模型时，请确保保存它。 请注意，更高级别的 dl4j 接口和 samediff 也有不同的文件格式。 

保存模型时，请注意上面的规范化器是单独保存的。 

建议分别保存。

# 调整模型

调整模型可能很困难。 我们的调整指南可以帮助您解决这个问题。 

它使用 deeplearning4j ui 来监控梯度并确保它们快速收敛。 建议在单独的进程中运行 dl4j ui 以避免依赖冲突。 可以在此处找到如何在单独的进程中运行 UI 服务器的示例。

在评估模型时，建议将此处的工作流程与上述数据集拆分注意事项配对。 

我们的评估 API 接受 ndarray 并以位为单位跟踪评估。 可以在此处显示更高级别 dl4j 接口的评估调用的示例。

samediff 模型也有类似的评估调用。 在 samediff 中，您将评估对象传递给训练配置。 验证集的结果将流式传输到此对象。 

一个例子可以在这里找到。

# 部署模型

在部署机器学习模型时，首先要考虑的是要弄清楚你正在部署什么。

通常，模型部署包含：

在推理期间加载和使用的规范化器文件

模型文件（dl4j zip 文件或 samediff flatbuffers 文件）

数据管道代码，将原始数据从生产转换为适当的格式（通常是 ndarrays）以供神经网络使用。

部署的这三个方面都应该像代码一样被视为软件资产并进行版本控制。可选地，用户可能想要考虑如何实现版本化部署。有许多工具可以处理这个问题。

在构建和部署模型后，通常用户想要做的下一件事是设置模型运行的环境。一个直接的建议是优化您的依赖关系。

由于整个 deeplearning4j 套件严重依赖 javacpp 的底层依赖关系，因此建议您阅读本指南作为优化二进制文件的后续步骤。

另一个考虑因素是性能。根据您选择的 nd4j 后端和您正在部署的 CPU，您可能能够添加专门的性能提升，例如：

1. 助手：加速库，用于更快的平台特定数学例程，包括 onednn、armcompute 和 cudnn。

2. Avx：我们为特定的英特尔 CPU 预编译二进制文件，包括 avx2 和 avx512。 各种分类器可供开发人员使用，可在此处找到。

3. 兼容性：如果您需要在非常旧的 linux 上运行，我们还提供了一个与 centos 6 兼容的兼容分类器。

对于构建部署管道，建议使用基于相同技术构建的 konduit-serving，通常与 deeplearning4j 一起发布。

如果您只是要部署嵌入在应用程序中的模型，那么在为您的微服务包含资源时，请记住上述模型部署的工件。

# 参考资料

https://deeplearning4j.konduit.ai/multi-project/tutorials/quickstart

* any list
{:toc}