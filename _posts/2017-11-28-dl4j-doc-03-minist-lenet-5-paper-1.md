---
layout: post
title:  dl4j doc-03-minist 手写识别 Lenet-5 paper 论文学习 《Gradient-Based Learning Applied to Document Recognition》II
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



标题：基于梯度的学习应用于文档识别

作者：Yann LeCun, Léon Bottou, Yoshua Bengio 和 Patrick Haffner

# 摘要：

多层神经网络通过反向传播算法进行训练，是迄今为止最成功的基于梯度学习技术的例子。

给定一个合适的网络架构，基于梯度的学习算法可以用于合成一个复杂的决策面，这个决策面能够对高维模式如手写字符进行分类，而且几乎不需要预处理。

本文回顾了应用于手写字符识别的各种方法，并在标准手写数字识别任务上比较了它们的表现。

特别是为处理2D形状的可变性而设计的卷积神经网络，在所有其他技术中表现出色。

关键词：神经网络，OCR，文档识别，机器学习，梯度学习，卷积神经网络，图变换网络，有限状态转换器，支持向量方法，虚拟支持向量机。

## 术语表

GT 图形转换器 
GTN 图形转换器网络 
HMM 隐马尔可夫模型 
HOS 启发式分段 
KNN K最近邻居 
NN 神经网络 
OCR 光学字符识别 
PCA 主成分分析 
RBF 径向基函数 
RSSVM 缩减集支持向量方法 
SDNN 空间位移神经网络 
SVM 支持向量方法 
TDNN 时间延迟神经网络 
VSVM 虚拟支持向量方法

# 引言：

在过去的几年中，机器学习技术，特别是应用于神经网络的技术，已经在模式识别系统的设计中扮演了越来越重要的角色。

实际上，可以说学习技术的有效性是最近连续语音识别和手写识别应用成功的关键因素之一。本文的主要信息是，通过更多依赖自动学习和更少依赖手工设计的启发式方法，可以构建更好的模式识别系统。

这得益于最近在机器学习和计算机技术方面的进展。使用字符识别作为案例研究，我们展示了通过精心设计的学习能力直接在像素图像上操作的学习机器，可以优势地替代手工提取的特征。

使用文档理解作为一个案例研究，我们展示了通过统一和原则化的设计范式——称为图变换网络（GTN），可以替代手动集成单独设计的模块构建的识别系统，以优化全局性能标准。

自从模式识别的早期日子以来，就已经知道，自然数据的可变性和丰富性——无论是语音的符号还是其他类型的模式——使得几乎不可能仅通过手工构建一个准确的识别系统。

因此，大多数模式识别系统是使用自动学习技术和手工算法的组合构建的。

通常识别单个模式的方法包括将系统分成两个主要模块，如图1所示。

由于图1在原文中是以图形的形式展现，ASCII图形可能无法精确表达原图的所有细节，但我可以尝试为您提供一个简化的ASCII版本的图示。

- F1

```
+--------------+     +-----------------+
| 特征提取器    |     | 分类器         |
+--------------+     +-----------------+
  |                     |
  v                     v
+--------------+     +-----------------+
| 原始输入      |---->| 特征向量        |
+--------------+     +-----------------+
  |                     |
  v                     v
+--------------+     +-----------------+
| 特征提取      |     | 分类决策        |
+--------------+     +-----------------+
```

这是一个简化的ASCII版本的图1，展示了传统模式识别系统中的两个主要模块：特征提取器和分类器。原始输入图像首先通过特征提取器转化为特征向量，然后特征向量被送入分类器进行分类决策。

请注意，这个ASCII图示仅用于示意，可能无法完全反映原始图形的所有细节和特征。

历史上，为了适当地识别单个模式，通常需要将系统分成两个主要模块，如图1所示。

第一个模块，称为特征提取器，转换输入模式，以便它们可以被表示为低维向量或短的符号串，这些向量或符号串应该具有以下特性：

a) 它们可以容易地匹配或与输入模式相同类别的符号进行比较；

b) 它们相对于不改变输入模式本质的输入模式的变换和扭曲是相对不变的。

特征提取器包含了大部分的先验知识和是特定于任务的。它也是设计工作的重点，因为它通常是完全手工制作的。

分类器，另一方面，通常是通用的并且可训练的。一个主要的问题是，识别的准确性在很大程度上取决于设计者提出适当特征集的能力。

这被证明是一个艰巨的任务，不幸的是，每个新问题都必须重新完成。大量的模式识别文献致力于描述和比较特定任务的不同特征集。

历史上，由于学习技术的限制，特征提取器的使用变得必要，因为分类器所使用的学习技术仅限于低维空间，并且容易分离的类别。

组合这三个因素已经改变了这种观点。

首先，低成本的机器配备有快速的算术单元，使得我们能够更多地依赖蛮力数值方法，而不是算法改进。

第二，大型数据库的可用性，针对具有大量市场和广泛兴趣的问题，如手写识别，使得设计者能够更多地依赖于实际数据，而不是手工制作的特征提取。

第三个，也是非常重要的因素，是强大的机器学习技术的可用性，它们可以处理高维输入，并且在处理这些大型数据集时能够生成复杂的决策功能。

可以认为，最近语音和手写识别系统准确性的进步在很大程度上归功于学习技术和大型训练数据集的增加依赖。

作为证据，现代商业OCR系统的大部分使用某种形式的多层神经网络，通过反向传播训练。




在这项研究中，我们考虑了手写字符识别的任务（见第一节和第二节），并比较了几种学习技术在手写数字识别的基准数据集上的性能（见第三节）。虽然更多的自动学习是有益的，但没有一种学习技术可以在没有对任务的最小先验知识的情况下成功。在多层神经网络的情况下，将知识纳入其架构的一种好方法是根据任务定制其架构。

在第二节介绍的卷积神经网络是一种特殊的神经网络架构的例子，它通过使用局部连接模式和对权重施加约束来整合对三维形状不变性的知识。

第三节介绍了对几种孤立手写数字识别方法的比较。从识别单个字符到识别文档中的单词和句子，第四节介绍了将多个模块组合起来以减少整体错误的想法。使用多模块系统识别可变长度对象（如手写单词）最好是如果模块操作有向图，这导致了可训练图形转换器网络（GTN）的概念。

第五节描述了用于识别单词或其他字符串的启发式超分割的现代经典方法。第六节介绍了在单词级别训练识别器的区分和非区分梯度基于技术，而不需要手动分割和标记。

第七节介绍了有前景的空间位移神经网络方法，通过在输入上的所有可能位置扫描识别器来消除分割启发式的需要。第八节展示了可训练的图形转换器网络可以被制定为基于一般图形组合算法的多个广义转导。GTN与语音识别中常用的隐马尔可夫模型之间的联系也在此处理。

第九节描述了用于识别笔记本电脑输入的手写识别全局训练GTN系统的问题。这个问题被称为在线手写识别，因为机器必须在用户书写时提供即时反馈。该系统的核心是卷积神经网络。结果清楚地证明了在单词级别训练识别器的优势，而不是在预分割、手动标记的孤立字符上进行训练。第十节描述了一个完整的基于GTN的系统，用于读取手写和机器打印的银行支票。该系统的核心是第二节中描述的LeNet卷积神经网络。

该系统在 NCR 公司的银行业支票识别系统中商业应用中。它每个月在美国几家银行读取数百万张支票。


## A 从数据中学习

自动机器学习有几种方法，但是最成功的方法之一，近年来被神经网络社区广泛采用的方法，可以称为数值或梯度学习。

学习机器计算一个函数 Y_p = F(Z_p; W)，其中 Z_p 是第 p 个输入模式，W 表示系统中的可调参数集合。在模式识别设置中，输出 Y_p 可以被解释为模式 Z_p 的识别类标签，或者是与每个类别相关的得分或概率。

损失函数 E_p = D(D_p; F(W; Z_p)) 衡量了 D_p（模式 Z_p 的正确或期望输出）与系统产生的输出之间的差异。

平均损失函数 E_train(W) 是在训练集中一组带标签的示例上的错误 Ep 的平均值，称为训练集 f(Z, D) = {Z_1, D_1, ..., Z_P, D_P}。在最简单的设置中，学习问题在于找到最小化 E_train(W) 的 W 的值。

在实践中，系统在训练集上的性能并不重要。更相关的度量是系统在实际使用中的领域中的错误率。

通过在与训练集不相交的样本集上测量准确性来估计这种性能，称为测试集。

许多理论和实验工作表明，测试集上的期望错误率 E_test 与训练集上的错误率 E_train 之间的差距随着训练样本数的增加而减小，大约按照 E_test - E_train ≈ k / sqrt(P)，其中 P 是训练样本数，h 是机器的有效容量或复杂度的度量，k 是一个常数。当训练样本数增加时，这个差距总是减小的。此外，随着容量 h 的增加，E_train 也会减小。

因此，当增加容量 h 时，存在着 E_train 减小和差距增加之间的权衡，容量 h 的最佳值可以实现最低的泛化误差 E_test。

大多数学习算法尝试最小化 E_train 以及某种差距的估计。这种形式的正式化称为结构风险最小化，它基于定义一系列容量逐渐增加的学习机器，对应于一系列参数空间的子集，使得每个子集都是前一个子集的超集。

在实际中，结构风险最小化通过最小化 E_train + λH(W) 来实现，其中函数 H(W) 被称为正则化函数，λ 是一个常数。

选择 H(W) 的方式是，它在属于参数空间高容量子集的参数 W 上取大值。最小化 H(W) 实际上限制了参数空间可访问子集的容量，从而控制了最小化训练误差和最小化期望差距之间的权衡。


## B 梯度下降学习

在计算机科学中，最小化一组参数的函数的一般问题是许多问题的根源。

梯度下降学习依赖于这样一个事实：通常更容易最小化一个相当平滑、连续的函数，而不是一个离散的组合函数。损失函数可以通过估计参数值的微小变化对损失函数的影响来最小化。这可以通过损失函数相对于参数的梯度来衡量。当梯度向量可以通过解析计算时，可以设计出有效的学习算法，与通过扰动进行数值计算相比。这是许多基于梯度的学习算法的基础，其中参数具有连续值。

在本文描述的过程中，参数集 W 是一个实值向量，E(W) 对其连续，并且在几乎所有地方都可微。在这样的设置中，最简单的最小化过程是梯度下降算法，其中 W 如下迭代调整：

W_k = W_k - α * ∇E(W_k)

在最简单的情况下，α 是一个标量常数。更复杂的过程使用可变的 α，或者用对角矩阵替换它，或者用 Hessian 矩阵的逆的估计替换它，如牛顿或准牛顿方法。共轭梯度法也可以使用。然而，附录 B 显示，尽管文献中对此提出了许多不同的观点，但这些二阶方法对于大型学习机的实用性非常有限。

一种流行的最小化过程是随机梯度算法，也称为在线更新。它包括使用噪声的或近似的平均梯度版本来更新参数向量。

在最常见的情况下，W 基于单个样本进行更新。使用这种过程，参数向量围绕一个平均轨迹波动，但通常比常规梯度下降和二阶方法在具有冗余样本的大型训练集上（如在语音或字符识别中遇到的情况）收敛得更快。

其原因在附录 B 中有解释。自上世纪六十年代以来，已经对这种应用于学习的算法的性质进行了理论研究，但直到八十年代中期才在非平凡任务中取得了实际成功。


## C 梯度反向传播

自从上世纪六十年代末以来，基于梯度的学习过程已经被使用，但它们大多限于线性系统。

对于复杂的机器学习任务，这种简单的梯度下降技术的出人意料的有用性直到以下三个事件发生后才被广泛认识到。

第一个事件是意识到，尽管早期警告相反，损失函数中的局部极小值似乎在实践中并不是一个主要问题。当人们注意到局部极小值似乎并没有成为早期非线性梯度学习技术（如玻尔兹曼机）成功的主要障碍时，这一点变得明显。

第二个事件是由Rumelhart、Hinton和Williams等人推广的一个简单而高效的程序——反向传播算法，用于计算由多层处理层组成的非线性系统中的梯度。

第三个事件是证明了应用于带有Sigmoid单元的多层神经网络的反向传播过程可以解决复杂的学习任务。

反向传播的基本思想是可以通过从输出到输入的传播来高效地计算梯度。这个想法在六十年代早期的控制理论文献中被描述过，但是在机器学习中的应用当时并不普遍。

有趣的是，在神经网络学习的背景下，反向传播的早期推导并没有使用梯度，而是使用了中间层单元的虚拟目标或最小干扰参数的论证。控制理论文献中使用的Lagrange形式提供了推导反向传播的最严格方法，以及推导反向传播到递归网络和异构模块网络的概括的最佳方法。在第IE节中给出了用于通用多层系统的简单推导。对于多层神经网络来说，局部极小值似乎不是一个问题，这在某种程度上是一个理论上的谜团。

人们推测，如果网络对于任务来说过大（这在实践中通常是这样的情况），参数空间中的额外维度会降低不可达到区域的风险。反向传播是目前最广泛使用的神经网络学习算法，也可能是任何形式中使用最广泛的学习算法。


## D 实时手写识别系统中的学习

在文献中，孤立的手写字符识别已经得到了广泛研究，是神经网络的早期成功应用之一。关于个别手写数字识别的比较实验在第三节中报告。它们显示使用基于梯度的学习训练的神经网络在相同数据上的性能优于所有其他方法。最佳的神经网络，称为卷积网络，被设计成直接从像素图像中提取相关特征。

然而，手写识别中最困难的问题之一不仅仅是识别单个字符，而且还要将字符从单词或句子中分离出来，这个过程被称为分割。现在已经成为标准的技术叫做**启发式过分割**。

它包括使用启发式图像处理技术生成大量潜在的字符之间的分割，并根据识别器为每个候选字符给出的分数选择最佳的分割组合。在这样的模型中，系统的准确性取决于启发式生成的分割的质量，以及识别器正确区分被分割的字符块、多个字符或其他错误分割的字符的能力。

训练识别器执行此任务是一个重大挑战，因为很难创建一个带有错误分割字符的标记数据库。

第一个解决方案是在第五节中描述的，它包括在整个字符串级别而不是字符级别对系统进行训练。梯度下降学习的概念可以用于这个目的。系统被训练以最小化一个整体损失函数，该函数衡量错误答案的概率。第五节探讨了确保损失函数可微分的各种方法，因此适合使用基于梯度的学习方法。第五节介绍了使用带有数字信息的有向无环图来表示替代假设的想法，并引入了GTN的概念。

第二个解决方案在第七节中描述，是完全消除分割。其思想是在输入图像上的每个可能位置上扫描识别器，并依赖于识别器的字符定位属性，即在输入字段中正确识别中心对齐的字符，即使在其旁边存在其他字符，同时拒绝包含没有中心对齐字符的图像。

然后将识别器在输入上进行扫描获得的识别器输出序列馈送到一个考虑语言约束的图形转换网络，最终提取最有可能的解释。

这种GTN与隐马尔可夫模型（HMM）有些相似，这使得这种方法让人想起经典的语音识别。

尽管在一般情况下这种技术可能会非常昂贵，但使用卷积神经网络使其特别具有吸引力，因为它可以在计算成本上实现显著的节省。



## E 全局可训练系统

正如前面所述，大多数实际的模式识别系统由多个模块组成。

例如，文档识别系统由字段定位器（提取感兴趣区域）、字段分割器（将输入图像切分为候选字符图像）、识别器（对每个候选字符进行分类和评分）和上下文后处理器（通常基于随机语法，从识别器生成的假设中选择最佳的语法正确答案）等组成。

在大多数情况下，从模块到模块传递的信息最好表示为具有数值信息附加到弧上的图。

例如，识别器模块的输出可以表示为一个无环图，其中每条弧包含候选字符的标签和分数，每条路径表示输入字符串的一个替代解释。通常，每个模块都是手动优化的，有时在其上下文之外进行训练。例如，字符识别器将在预分割字符的标记图像上进行训练。然后，组装完整系统，并手动调整模块的参数子集以最大化整体性能。这最后一步是极其繁琐、耗时的，几乎肯定是次优的。

更好的替代方案是**以某种方式训练整个系统，以使全局错误度量（例如文档级别的字符错误分类概率）最小化**。

理想情况下，我们希望找到此全局损失函数的良好最小值，以及对系统中的所有参数。

如果度量性能的损失函数 E 可以使系统的可调参数 W 可微分，我们可以使用基于梯度的学习来找到 E 的局部最小值。然而，乍一看，系统的庞大规模和复杂性似乎会使这个过程难以处理。

为了确保全局损失函数 E_p（Z_p，W）可微分，整个系统被构建为一个由可微分模块组成的前馈网络。

每个模块实现的函数必须与模块的内部参数（例如神经网络字符识别器的权重）以及模块的输入几乎处处连续和可微分。如果是这种情况，那么就可以使用简单的反向传播过程的一种简单的推广来高效地计算系统中所有参数的损失函数的梯度。

例如，让我们考虑一个由模块级联构建的系统，每个模块实现一个函数 X_n = F_n(W_n, X_n)，其中 X_n 是表示模块输出的向量，W_n 是模块中的可调参数向量（W 的子集），X_n 是模块的输入向量，以及上一个模块的输出向量。第一个模块的输入 X_1 是输入模式 Z_p。如果 Ep 对 X_n 的偏导数已知，则可以使用向后递归计算 Ep 对 W_n 和 X_n 的偏导数。第一个方程计算 Ep 对 W 的梯度的一些项，而第二个方程生成了向后递归，就像对于神经网络的众所周知的反向传播过程一样。

我们可以对训练模式的梯度进行平均，以获得完整的梯度。

有趣的是，在许多情况下，没有必要显式计算雅可比矩阵。上述公式使用雅可比矩阵与偏导数向量的乘积，并且通常更容易直接计算这个乘积，而不是事先计算雅可比矩阵。与普通的多层神经网络类似，在上述简单模块级联的情况下，除了最后一个模块之外，所有模块都被称为隐藏层，因为它们的输出从外部不可见。

在比上面描述的简单模块级联更复杂的情况下，偏导数符号变得有些模糊和笨拙。在更一般的情况下进行完全严格的推导可以使用拉格朗日函数。传统的多层神经网络是上述情况的特例，其中状态信息 X_n 用固定大小的向量表示，模块是由矩阵乘法层（权重）和分量sigmoid函数（神经元）交替的层组成。然而，正如前面所述，复杂识别系统中的状态信息最好由附加到弧上的数值信息的图形表示。在这种情况下，每个模块被称为图变换器，它将一个或多个图作为输入，并产生一个图作为输出。这些模块的网络称为**图变换器网络（GTN）**。

第四、六和八节发展了GTN的概念，并展示了基于梯度的学习可以用来训练系统中所有模块的所有参数，以使全局损失函数最小化。

梯度可以在状态信息由本质上离散对象（如图形）表示时计算出来似乎有些自相矛盾，但正如后文所示，这个困难可以被规避。



# II. 用于孤立字符识别的卷积神经网络

使用梯度下降训练的多层网络能够从大量示例中学习复杂、高维、非线性映射，因此它们是图像识别任务的明显候选者。在传统的模式识别模型中，手工设计的特征提取器从输入中收集相关信息并消除不相关的变异性。然后，一个可训练的分类器将得到的特征向量分类到类别中。在这种方案中，标准的全连接多层网络可以用作分类器。一个可能更有趣的方案是尽可能多地依赖特征提取器本身的学习。在字符识别的情况下，网络可以接受几乎原始的输入（例如，大小归一化的图像）。虽然可以使用普通的全连接前馈网络在诸如字符识别等任务中获得一定成功，但存在问题。

首先，典型的图像通常很大，通常有几百个变量（像素）。例如，在第一层有一百个隐藏单元的全连接网络中，第一层已经包含了数万个权重。这么多的参数增加了系统的容量，因此需要更大的训练集。此外，存储如此多的权重的内存需求可能排除了某些硬件实现。但是，无结构网络在图像或语音应用中的主要缺陷是，它们对于输入的平移或局部扭曲没有内置的不变性。

在被发送到神经网络的固定大小输入层之前，字符图像或其他二维或三维信号必须近似进行大小归一化和中心化。不幸的是，这样的预处理不可能完美地执行：手写通常在单词级别进行规范化，这可能导致个别字符的大小、倾斜和位置变化。再加上书写风格的可变性，将导致输入对象中显著特征的位置变化。原则上，一个足够大的全连接网络可以学习产生对这些变化不变的输出。然而，学习这样的任务可能会导致多个具有类似权重模式的单元分布在输入的各个位置，以便在任何位置检测到显著特征。学习这些权重配置需要大量的训练实例来覆盖可能的变化空间。在下面描述的卷积网络中，通过强制在空间上复制权重配置来自动获得平移不变性。

其次，全连接架构的一个缺点是完全忽略了输入的拓扑结构。输入变量可以以任意固定顺序呈现，而不影响训练的结果。相反，图像（或语音的时间频率表示）具有强烈的二维局部结构：空间或时间上相邻的变量（或像素）高度相关。局部相关性是在识别空间或时间对象之前提取和组合局部特征的众所周知优势的原因，因为相邻变量的配置可以被分类为少量类别（例如，边缘、角等）。卷积网络通过将隐藏单元的感受野限制为局部，强制提取局部特征。




## A. 卷积网络

卷积网络结合了三种架构思想，以确保在一定程度上具有平移、尺度和失真不变性：局部感受野、共享权重或权重复制以及空间或时间下采样。一个用于识别字符的典型卷积网络，名为LeNet，如图所示。

- Fig Architecture of LeNet a Convolutional Neural Network here for digits recognition Each plane is a feature map is a set of units
whose weights are constrained to be identical

![F2](https://img-blog.csdnimg.cn/direct/d48b509bdf6e4349915dff26246eafd3.png#pic_center)

输入平面接收字符图像，这些图像大致经过尺寸归一化和居中处理。每个层中的单元接收来自前一层中小邻域内的一组单元的输入。将单元连接到输入的局部感受野的思想可以追溯到20世纪50年代的感知器，几乎与Hubel和Wiesel在猫的视觉系统中发现的局部敏感的取向选择性神经元同时出现。

局部连接在视觉学习的神经模型中已被多次使用。

通过局部感受野，神经元可以提取基本的视觉特征，例如取向边缘、端点、角点或其他信号中的类似特征，如语音频谱图。然后，这些特征由后续层组合以检测高阶特征。如前所述，输入的失真或平移可能导致显著特征的位置变化。此外，对图像的一部分有用的基本特征检测器可能在整个图像上都有用。通过强制一组单元，其感受野位于图像的不同位置，具有相同的权重向量，可以应用此知识。

层中的单元组织在平面内，其中所有单元共享相同的权重集。这种平面上单元的输出集被称为特征映射。特征映射中的单元都受限于对图像的不同部分执行相同的操作。完整的卷积层由多个特征映射组成，具有不同的权重向量，因此可以在每个位置提取多个特征。LeNet的第一层就是这种情况，如图所示。LeNet的第一个隐藏层中的单元组织成3个平面，每个平面都是一个特征映射。

特征映射中的一个单元有 `4*4` 的输入，连接到输入中的一个4*4区域，称为该单元的感受野。每个单元有16个输入，因此有16个可训练系数加上一个可训练偏置。特征映射中相邻单元的感受野位于前一层中相应的相邻单元上。因此，相邻单元的感受野会有重叠。例如，在LeNet的第一个隐藏层中，水平相邻单元的感受野会有2列和2行的重叠。如前所述，特征映射中的所有单元共享相同的16个权重和相同的偏置，因此它们在输入的所有可能位置上都会检测相同的特征。层中的其他特征映射使用不同的权重和偏置，因此可以提取不同类型的局部特征。在LeNet的情况下，每个输入位置提取出6种不同类型的特征，这是由6个位于6个特征映射中相同位置的单元完成的。特征映射的顺序实现将使用具有局部感受野的单个单元扫描输入图像，并将该单元的状态存储在特征映射中相应的位置。这个操作等同于卷积，然后是加性偏置和压缩函数，因此得名卷积网络。卷积的核心是特征映射中的单元使用的连接权重集。卷积层的一个有趣特性是，如果输入图像发生了平移，特征映射的输出也会发生相同量的平移，但否则会保持不变。这个特性是卷积网络对输入的平移和失真具有鲁棒性的基础。


这段技术文档描述了特征检测和子采样层的工作原理。

特征被检测到后，其精确位置变得不那么重要，只有相对于其他特征的大致位置才相关。通过减少特征地图的空间分辨率，可以降低特征位置的精度。子采样层通过局部平均和子采样的方式来实现这一点，从而降低输出对位移和失真的敏感度。

LeNet的第二个隐藏层是一个子采样层，具有六个特征地图，每个特征地图对应前一层的一个特征地图。接下来的卷积和子采样层通常交替出现，每一层的特征地图数量增加，空间分辨率减小。由于所有权重都是通过反向传播学习的，卷积网络可以被看作是合成它们自己的特征提取器。固定大小的卷积网络已经应用于许多应用领域，包括手写体识别、机器打印字符识别、在线手写体识别和人脸识别。

固定大小的共享权重沿着单一时间维度的卷积网络被称为时延神经网络（TDNNs），已被用于音素识别、口语识别、在线识别孤立手写字符和签名验证。



## B LeNet

这里详细描述了LeNet-5的架构，LeNet-5是实验中使用的卷积神经网络。LeNet-5包含14个层，不包括输入层，所有层都包含可训练参数（权重）。输入是一个28x28像素的图像，这比数据库中最大的字符要大得多，最大为32x32像素，位于一个32x32的区域内。原因是希望潜在的显著特征，如笔画端点或角落，可以出现在最高级特征检测器的感受野中心。在LeNet-5中，最后一个卷积层（C5）感受野的中心形成一个14x14的区域，位于输入的中心。输入像素的值被归一化，使背景水平（白色）对应于值255，前景（黑色）对应于值0。这使得输入的平均值大约为127，方差大约为127，加快了学习速度。

接下来，卷积层被标记为C1至C5，子采样层被标记为S1至S4，全连接层被标记为F6和输出层。C1是一个具有6个特征图的卷积层，每个特征图中的每个单元与输入中的5x5邻域相连，特征图的大小为28x28，以防止输入的连接超出边界。C1包含156个可训练参数和1224个连接。

S2是一个具有6个大小为14x14的特征图的子采样层，每个特征图中的每个单元与C1中对应的特征图中的2x2邻域相连。S2中单元的四个输入相加，然后乘以一个可训练系数，加上一个可训练偏置，结果通过一个S型函数。2x2的感受野不重叠，因此S2中的特征图行和列的数量是C1中的一半。S2具有12个可训练参数和48个连接。

C3是一个具有16个特征图的卷积层，每个特征图中的每个单元连接到S2的一些特征图中相同位置的3x3邻域。表I显示了每个C3特征图组合的S2特征图集合。为什么不将每个S2特征图连接到每个C3特征图呢？原因有两个。首先，非完全连接方案保持了连接数量在合理范围内。更重要的是，它强制打破了网络中的对称性，不同的特征图被迫提取不同的（希望是互补的）特征，因为它们得到了不同的输入集合。表I中连接方案背后的理论是，前六个C3特征图接收来自S2的每个连续的三个特征图子集的输入，接下来的六个接收来自每个连续的四个特征图子集的输入，再接下来的三个接收来自一些不连续的四个特征图子集的输入，最后一个接收来自所有S2特征图的输入。C3层有1516个可训练参数和34800个连接。

S4是一个具有16个大小为5x5的特征图的子采样层，每个特征图中的每个单元与C3中对应的特征图中的2x2邻域相连。S4中单元的四个输入相加，然后乘以一个可训练系数，加上一个可训练偏置，结果通过一个S型函数。S4具有1612个可训练参数和800个连接。

C5是一个具有120个特征图的卷积层，每个单元与S4的每个特征图中的5x5邻域相连。C5层有48120个可训练参数和4800个连接。

F6是一个包含84个单元的全连接层，完全连接到C5。F6层有10164个可训练参数。

输出层具有10个单元，对应于10个数字类别。输出层完全连接到F6。


与经典神经网络中的层中的单元一样，直到全连接层（F6）的单元计算它们的输入向量和它们的权重向量之间的点积，然后加上一个偏置。对于单元i，这个加权和，表示为ai，然后通过sigmoid压缩函数传递，以产生单元i的状态，用xi表示：`xi = f(ai)`，其中f(ai)表示压缩函数。

压缩函数是一个缩放的双曲正切函数：`f(a) = A * tanh(Sa)`，其中A是函数的振幅，S确定其在原点的斜率。函数f是奇函数，具有水平渐近线在-A和A处。常数A被选择为1.7159，S是2/3。关于选择这种压缩函数的理由在附录A中给出。

最后，输出层由欧几里得径向基函数单元（RBF）组成，每个类别一个，每个具有固定数量的输入。

每个RBF单元yi的输出计算如下：

`yi = Σj(xj * wij)`，其中j表示每个输入的索引，wij表示连接权重。


换句话说，每个输出的RBF单元计算其输入向量与其参数向量之间的欧几里德距离。

输入离参数向量越远，RBF输出越大。一个特定的RBF的输出可以解释为度量输入模式与与RBF相关联的类的模型之间的匹配程度的惩罚项。从概率角度来看，RBF输出可以解释为高斯分布在F6层配置空间中的非归一化负对数似然。给定一个输入模式，损失函数应设计成使F6层的配置尽可能接近与该模式所对应的RBF参数向量的目标向量。这些单元的参数向量是手动选择的，并保持固定，至少在最初时是这样。这些参数向量的组成部分被设置为0或1。尽管它们可以以相等的概率随机选择为0或1，甚至可以选择形成纠错码，但它们实际上被设计成代表对应字符类别的简化图像，绘制在14x14的位图上，因此有14x14个参数。这种表示对于识别孤立的数字并不特别有用，但对于识别来自完整可打印ASCII集的字符字符串却很有用。其理论基础在于相似的字符（因此容易混淆），如大写字母O、小写字母o和零，或小写字母l、数字1、方括号和大写字母I，将具有相似的输出编码。如果系统与一个能够纠正此类混淆的语言后处理器结合使用，这将特别有用。由于混淆类的代码相似，对于模糊字符，对应的RBF的输出将相似，后处理器将能够选择合适的解释。

图中给出了完整ASCII集的输出代码。使用这种分布式编码的另一个原因是，与输出中更常见的N位码（也称为位置编码或祖母细胞编码）相比，分布式编码更具优势，因为当类的数量大于几十时，非分布式编码往往表现不佳。原因在于非分布式编码中的输出单元必须大部分时间都处于非活跃状态。这对于sigmoid单元来说是非常困难的。

另一个原因是分类器通常不仅用于识别字符，还用于拒绝非字符。具有分布式编码的RBF更适用于这种情况，因为与sigmoid不同，它们在其输入空间的一个明确区域内被激活，非典型模式更有可能落在该区域之外。RBF的参数向量起着F6层的目标向量的作用。值得指出的是，这些向量的分量为0或1，这在sigmoid的范围内是可以接受的，因此可以防止这些sigmoid过于饱和。

事实上，0和1是sigmoid的最大曲率点。这迫使F6单元在其最大非线性范围内运行。必须避免sigmoid的饱和，因为已知这会导致收敛速度缓慢和损失函数的病态。

- F3 Initial parameters of the output RBFs for recognizing the full ASCII set

![F3](https://img-blog.csdnimg.cn/direct/4a61d0e65d004278a5ac199a4236cf22.png#pic_center)



## 损失函数(Loss function)

可以与上述网络一起使用的最简单的输出损失函数是最大似然估计标准（MLE），在我们的情况下等同于最小均方误差（MSE）。

对于一组训练样本，该标准简单地是：

E(W) = (1/N) * Σ_p ||y^(D_p) - Z_p||^2

其中，y^(D_p) 是第p个RBF单元的输出，即与输入模式的正确类别相对应的RBF单元的输出，Z_p 是该类别的参数向量。尽管这个成本函数对于大多数情况都是合适的，但它缺少三个重要的属性。首先，如果我们允许RBF的参数适应，E(W) 会有一个微不足道但完全不可接受的解。


在这个解中，所有的RBF参数向量都相等，而F6的状态是常数且等于该参数向量。在这种情况下，网络愉快地忽略输入，而所有的RBF输出都等于零。如果不允许RBF权重适应，这种崩溃现象就不会发生。第二个问题是没有类别之间的竞争。这样的竞争可以通过使用更具有区分性的训练标准来获得，称为最大后验（MAP）标准，类似于有时用于训练HMMs的最大互信息标准。

它对应于最大化正确类别Dp的后验概率，或者最小化给定输入图像可能来自其中一个类别或来自一个背景垃圾类别的概率的对数。

就惩罚而言，除了像MSE标准那样降低正确类别的惩罚之外，这个标准还提高了错误类别的惩罚。这种歧视性标准防止了先前提到的崩溃效应，因为当RBF参数被学习时，它将保持RBF中心相互分离。在第六部分中，我们提出了这个标准的一个推广，用于学习将多个对象分类到输入中，例如单词或文档中的字符。

计算损失函数对所有卷积网络层中所有权重的梯度是通过反向传播完成的。标准算法必须稍微修改以考虑权重共享。

一种实现的简单方法是首先计算损失函数对每个连接的偏导数，就像网络是一个没有权重共享的常规多层网络一样。然后，将所有共享相同参数的连接的偏导数相加，形成对该参数的导数。这样一个庞大的架构可以非常有效地训练，但这样做需要使用一些技术，这些技术在附录A中进行了描述。附录的第A部分描述了诸如使用的特定sigmoid以及权重初始化等细节。

第B和C部分描述了使用的最小化程序，这是对 Levenberg-Marquardt 程序的对角近似的随机版本。








# 参考资料

[DL4J无法下载MNIST数据集解决 Server returned HTTP response code: 403 for URL解决方法](https://blog.csdn.net/m0_46948660/article/details/134167829)

MNIST数据下载地址: http://github.com/myleott/mnist_png/raw/master/mnist_png.tar.gz

GitHub示例地址: https://github.com/deeplearning4j/deeplearning4j-examples/blob/master/dl4j-examples/src/main/java/org/deeplearning4j/examples/quickstart/modeling/convolution/LeNetMNISTReLu.java


# 参考资料

https://deeplearning4j.konduit.ai/multi-project/tutorials/quickstart


* any list
{:toc}
