---
layout: post
title:  dl4j doc-00-overview Deeplearning4j 入门概览
date:  2017-04-16 12:03:32 +0800
categories: [Deep Learning]
tags: [AI, DL, dl4j, neural network]
published: true
---



# 中文教程

https://mgubaidullin.github.io/deeplearning4j-docs/cn/tutorials

# 简介

Eclipse Deeplearning4j 是一套在 JVM 上运行深度学习的工具套件。

它是唯一一个允许您在 Java 中训练模型，同时通过我们的 cpython 绑定实现与 Python 生态系统的互操作性，支持模型导入，并支持其他运行时环境（如 tensorflow-java 和 onnxruntime）互操作的框架。

考虑查看我们的快速入门，了解如何开始。如果您遇到依赖问题，请使用我们的必需依赖指南。

使用案例包括导入和重新训练模型（Pytorch、Tensorflow、Keras），并在 JVM 微服务环境、移动设备、物联网设备和 Apache Spark 中部署。它是您 Python 环境的极好补充，用于在 Python 中构建的模型在其他环境中运行、部署或打包。

Deeplearning4j 有几个子模块，包括：

Samediff：类似于 TensorFlow/PyTorch 的执行复杂图形的框架。该框架较低级，但非常灵活。它还是运行 onnx 和 TensorFlow 图形的基础 API。

Nd4j：Java 的 numpy++。包含一系列 numpy 操作和 TensorFlow/PyTorch 操作。

Libnd4j：一个轻量级、独立的 C++ 库，使数学代码能够在不同设备上运行。可优化以在各种设备上运行。

Python4j：一个 Python 脚本执行框架，简化了将 Python 脚本部署到生产环境中。

Apache Spark 集成：与 Apache Spark 框架集成，实现在 Spark 上执行深度学习管道。

Datavec：一个数据转换库，将原始输入数据转换为适合在神经网络上运行的张量。

# 如何使用本网站

该网站遵循Divio框架布局。本网站有几个部分的文档遵循这个布局。以下是站点各部分的概述：

Multi project 包含所有跨项目文档，如端到端训练和其他整个项目相关文档。这应该是刚开始的人的默认入口点。

Deeplearning4j 包含与核心deeplearning4j API相关的所有文档，如多层网络和计算图。将其视为构建神经网络的高级框架。如果您想要像tensorflow或pytorch这样的较低级别的东西，请考虑使用Samediff。

Samediff 包含与ND4j的Samediff子模块相关的所有文档。Samediff是用于构建类似于pytorch或tensorflow的神经网络的较低级别API，具有内置的自动微分功能。

Datavec 包含与我们的数据转换库Datavec相关的所有文档。

Python4j 包含与我们的cpython执行框架Python4j相关的所有文档。

Libnd4j 包含与我们的底层C++框架Libnd4j相关的所有文档。

Apache Spark 包含与我们的Apache Spark集成相关的所有文档。

Concepts/Theory 包含与理解框架各个方面所需的一般数学或计算机科学理论相关的所有文档。

## 开源

这些库完全开源，Apache 2.0许可，由Eclipse基金会进行开放式管理。Eclipse Deeplearning4j项目欢迎所有贡献。查看我们的社区和贡献指南以加入。

JVM/Python/C++

Deeplearning4j可以作为现有Python和C++工作流程的补充，也可以作为一个独立的库用于构建和部署模型。使用您发现有用的组件。



* any list
{:toc}
