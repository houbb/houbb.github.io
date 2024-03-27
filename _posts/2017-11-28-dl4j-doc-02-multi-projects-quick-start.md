---
layout: post
title:  dl4j doc-01-Deeplearning4j 快速开始
date:  2017-04-16 12:03:32 +0800
categories: [Deep Learning]
tags: [AI, DL, dl4j, neural network]
published: true
---


# 入门指南

这是您运行DL4J示例并开始自己的项目所需的一切。

我们建议您加入我们的社区论坛。在那里，您可以请求帮助并提供反馈，但请在询问我们以下已回答的问题之前使用本指南。

如果您是深度学习的新手，我们已包含了初学者的路线图，其中包含了课程、阅读材料和其他资源的链接。

查看必需依赖项以了解dl4j库在不同平台上的支持。

如果您只是想开始，请考虑阅读我们的核心工作流指南。

我们目前正在重新制作入门指南。

如果您发现在此跟随时有困难，请查看Konduit博客，因为它提供了一些来自社区的入门指南。

# 快速概述

Deeplearning4j起初是一个领域特定语言，用于配置深度神经网络，逐渐发展成为开发人员用于从Java训练模型到将模型部署到生产环境的一套工具。

用例包括：

1. 数值计算。请参阅：https://github.com/eclipse/deeplearning4j-examples/tree/master/nd4j-ndarray-examples

2. 使用类似于tensorflow/pytorch的界面定义和训练模型。请参阅：https://github.com/eclipse/deeplearning4j-examples/tree/master/samediff-examples

3. 模型导入和部署。请参阅：https://github.com/eclipse/deeplearning4j-examples/tree/master/tensorflow-keras-import-examples

4. 在spark上运行模型。请参阅：https://github.com/eclipse/deeplearning4j-examples/tree/master/dl4j-distributed-training-examples

5. 用于运行数学代码的小型独立库。请参阅：https://github.com/eclipse/deeplearning4j/tree/master/libnd4j

还有其他用例可用，请随时查看更多示例

# 先决条件

Java（开发者版本）11或更高版本（仅支持64位版本）

Apache Maven 3.x，不是4（自动构建和依赖管理）

IntelliJ IDEA或Eclipse

Git

您应该安装这些内容以使用此快速入门指南。DL4J面向的是熟悉生产部署、集成开发环境和自动化构建工具的专业Java开发人员。如果您已经具有这方面的经验，那么使用DL4J将会更加容易。

如果您是Java新手或不熟悉这些工具，请阅读以下详细信息以获取安装和设置帮助。否则，请跳转至DL4J示例。

## Java

如果您没有Java 11或更高版本，请在此处下载当前的Java开发工具包（JDK）。我们建议使用eclipse temurin或oracle jdk的替代版本。来自其他供应商（如Microsoft、Amazon或Eclipse）的JDK预构建版本是免费的。要检查是否安装了兼容的Java版本，请使用以下命令：

```sh
java -version
```

请确保已安装64位版本的Java，因为如果您决定尝试使用32位版本，则会看到一个告诉您在java.library.path中找不到jnind4j的错误。请确保设置了JAVA_HOME环境变量。请使用jdk 11或17。8已不再得到官方支持，但仍可正常工作。

## Apache Maven

Maven是Java项目的依赖管理和自动构建工具。它与IntelliJ等IDE很好地配合，让您轻松安装DL4J项目库。按照他们系统的说明安装或更新Maven到最新版本。要检查是否安装了最新版本的Maven，请输入以下命令：

```sh
mvn --version
```

如果您使用的是Mac，可以直接在命令行中输入以下内容：

```sh
brew install maven
```

Maven在Java开发人员中被广泛使用，并且对于使用DL4J来说几乎是强制性的。如果您来自不同的背景，并且对Maven还不熟悉，请查看Apache的Maven概述和我们的Maven介绍给非Java程序员，其中包含一些额外的故障排除提示。其他构建工具，如Ivy和Gradle，也可以使用，但我们最好支持Maven。

Paul Dubs的Maven指南

Maven五分钟教程

## IntelliJ IDEA

集成开发环境（IDE）允许您使用我们的API并在几个步骤中配置神经网络。我们强烈建议使用IntelliJ，它与Maven通信以处理依赖关系。IntelliJ的社区版是免费的。

还有其他流行的IDE，如Eclipse和Netbeans。但是，我们更推荐使用IntelliJ，如果您需要帮助，使用它将使您更容易在社区论坛上找到帮助。

## Git

安装最新版本的Git。如果您已经有Git，则可以使用Git本身更新到最新版本：

```sh
$ git clone git://git.kernel.org/pub/scm/git/git.git
```

Mac的Mojave OS的最新版本破坏了git，会产生以下错误消息：

xcrun: error: invalid active developer path (/Library/Developer/CommandLineTools), missing xcrun at: /Library/Developer/CommandLineTools/usr/bin/xcrun

这可以通过运行以下命令来修复：

```sh
xcode-select --install
```

# 几个简单步骤中的DL4J示例

使用命令行输入以下内容：

```sh
git clone https://github.com/eclipse/deeplearning4j-examples.git
```

ps: 可能会失败，也可以直接浏览器访问 [https://github.com/deeplearning4j/deeplearning4j-examples](https://github.com/deeplearning4j/deeplearning4j-examples)

打开IntelliJ并选择导入项目。然后选择dl4j-examples目录。

选择“从外部模型导入项目”，并确保选择了Maven。

继续完成向导的选项。选择以jdk开头的SDK。（您可能需要单击加号符号才能查看您的选项...）然后点击完成。稍等片刻，直到IntelliJ下载所有依赖项。您将在右下角看到水平条正在工作。

在左侧的文件树中选择一个示例。右键单击文件以运行。

示例存储库包含多个示例项目，这些项目根据不同的功能级别进行分组。您刚刚打开的dl4j-examples项目有最简单的示例，但是请随意探索其他项目！

在您自己的项目中使用DL4J：配置POM.xml文件
要在自己的项目中运行DL4J，我们强烈建议Java用户使用Maven，或者Scala用户使用类似SBT的工具。下面是基本的依赖关系集及其版本。这包括：

deeplearning4j-core，其中包含神经网络实现

nd4j-native-platform，驱动DL4J的ND4J库的CPU版本

datavec-api - Datavec是我们的库，用于向量化和加载数据

每个Maven项目都有一个POM文件。当您运行示例时，POM文件应该如何显示。

在IntelliJ中，您需要选择要运行的第一个Deeplearning4j示例。我们建议选择MLPClassifierLinear，因为您几乎可以立即在我们的UI中看到网络对数据的两组分类。Github上的文件可以在此处找到。

要运行示例，请右键单击它，并在下拉菜单中选择绿色按钮。您将在IntelliJ的底部窗口中看到一系列分数。最右边的数字是网络分类的错误分数。如果您的网络正在学习，则此数字将随着它处理的每批数据而随时间减少。最后，此窗口将告诉您您的神经网络模型变得多么准确：

在另一个窗口中，将显示一个图表，显示多层感知器（MLP）如何对示例中的数据进行分类。它将如下所示：

恭喜！您刚刚使用Deeplearning4j训练了您的第一个神经网络。

## 下一步

加入我们的社区论坛，网址是community.konduit.ai。

阅读深度神经网络简介。

查看更详细的全面设置指南。

Python爱好者：如果您计划在Deeplearning4j上运行基准测试，将其与著名的Python框架[x]进行比较，请阅读有关如何优化JVM上的堆空间、垃圾收集和ETL的说明。遵循这些说明，您将在训练时间上看到至少10倍的加速。

## 其他链接

Maven中央仓库上的Deeplearning4j构件

Maven中央仓库上的ND4J构件

Maven中央仓库上的Datavec构件

UCI笔记本的Scala代码

## 故障排除

问：我正在Windows上使用64位Java，但仍然出现了java.library.path错误，指出没有jnind4j

答：您的路径上可能有不兼容的DLL。要告诉DL4J忽略这些DLL，您必须将以下内容作为VM参数添加（在IntelliJ中运行->编辑配置->VM选项）：

```sh
-Djava.library.path=""
```

问：Spark问题我正在运行示例，并且在基于Spark的示例（如分布式训练或datavec转换选项）中遇到问题。

答：您可能缺少一些Spark需要的依赖项。请查看此Stack Overflow讨论以讨论可能的依赖关系问题。Windows用户可能需要来自Hadoop的winutils.exe。

从以下链接下载winutils.exe：https://github.com/steveloughran/winutils，并将其放入null/bin/winutils.exe（或创建一个hadoop文件夹并将其添加到HADOOP_HOME）。

故障排除：在Windows上调试UnsatisfiedLinkError

Windows用户可能会看到类似以下的信息：

```
Exception in thread "main" java.lang.ExceptionInInitializerError
at org.deeplearning4j.nn.conf.NeuralNetConfiguration$Builder.seed(NeuralNetConfiguration.java:624)
at org.deeplearning4j.examples.feedforward.anomalydetection.MNISTAnomalyExample.main(MNISTAnomalyExample.java:46)
Caused by: java.lang.RuntimeException: org.nd4j.linalg.factory.Nd4jBackend$NoAvailableBackendException: Please ensure that you have an nd4j backend on your classpath. Please see: http://nd4j.org/getstarted.html
at org.nd4j.linalg.factory.Nd4j.initContext(Nd4j.java:5556)
at org.nd4j.linalg.factory.Nd4j.(Nd4j.java:189)
... 2 more
Caused by: org.nd4j.linalg.factory.Nd4jBackend$NoAvailableBackendException: Please ensure that you have an nd4j backend on your classpath. Please see: http://nd4j.org/getstarted.html
at org.nd4j.linalg.factory.Nd4jBackend.load(Nd4jBackend.java:259)
at org.nd4j.linalg.factory.Nd4j.initContext(Nd4j.java:5553)
... 3 more
```

如果是这个问题，请查看此页面。

在这种情况下，将其替换为“Nd4jCpu”。

# 快速入门模板

现在您已经学会了如何运行不同的示例，我们为您提供了一个模板，其中包含一个带有简单评估代码的基本MNIST训练器。

快速入门模板可在https://github.com/eclipse/deeplearning4j-examples/tree/master/mvn-project-template 上找到。

## 要使用该模板：

将示例项目中的standalone-sample-project复制到您的项目名称。

将文件夹导入IntelliJ。

## 开始编码！

关于Eclipse Deeplearning4j的更多信息

Deeplearning4j是一个框架，让您可以从一开始就选择任何东西。

我们不是Tensorflow（一个具有自动差分的低级数值计算库）或Pytorch。Deeplearning4j有几个子项目，使构建端到端应用程序变得相对容易。

如果您想要将模型部署到生产环境中，您可能会喜欢我们从Keras导入的模型。

Deeplearning4j有几个子模块。这些子模块从可视化UI到Spark上的分布式训练都有涵盖。有关这些模块的概述，请查看Github上的Deeplearning4j示例。

如果您想要更高级的神经网络，请考虑使用Tutorials框架。

要使用简单的桌面应用程序并运行更简单的神经网络，您需要两样东西：一个nd4j后端和deeplearning4j-nn。有关更多代码，请参见简化示例子模块。

如果您想要灵活的深度学习API，有两种方法可供选择。您可以使用nd4j独立看看我们的nd4j示例或计算图API以及上述的教程。

如果您想在Spark上进行分布式训练，请查看我们的Spark页面。请记住，我们不能为您设置Spark。如果您想设置分布式Spark和GPU，那基本上是由您自己决定的。Deeplearning4j只是将作为JAR文件部署在现有的Spark集群上。

如果您想在移动设备上部署，请查看我们的Android页面。

我们会针对各种硬件架构原生优化代码。我们使用基于C++的循环，就像其他人一样。有关此信息，请参见我们的C++框架libnd4j。

Deeplearning4j还有另外两个值得注意的组件：

DataVec：用于机器学习数据管道的内置ETL

Deeplearning4j旨在成为构建真实应用程序的端到端平台，而不仅仅是具有自动差分的张量库。

如果您想要一个具有自动差分的张量库，请查看ND4J和Samediff。Samediff仍处于测试阶段，但如果您想要做出贡献，请加入我们的社区论坛。

最后，如果您正在对Deeplearning4j进行基准测试，请考虑来到我们的社区论坛并寻求建议。

Deeplearning4j拥有所有的旋钮，但其中一些可能不像Python框架那样完美地工作。

感谢您阅读我们的快速入门指南！如果您有任何疑问或需要进一步的帮助，请随时联系我们的社区。祝您在深度学习之旅中取得成功！

# 参考资料

https://deeplearning4j.konduit.ai/multi-project/tutorials/quickstart


* any list
{:toc}
