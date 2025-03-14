---
layout: post
title: NLP 中文拼写检测纠正论文-04-Learning from the Dictionary Heterogeneous Knowledge Guided Fine-tuning for Chinese Spell Checking 论文翻译
date:  2020-1-20 10:09:32 +0800
categories: [Data-Struct]
tags: [chinese, nlp, algorithm, sh]
published: true
---

# 拼写纠正系列

[NLP 中文拼写检测实现思路](https://houbb.github.io/2020/01/20/nlp-chinese-spelling-correct-01-intro)

[NLP 中文拼写检测纠正算法整理](https://houbb.github.io/2020/01/20/nlp-chinese-spelling-correct-02)

[NLP 英文拼写算法，如果提升 100W 倍的性能？](https://houbb.github.io/2020/01/20/nlp-chinese-spelling-correct-03-100w-faster)

[NLP 中文拼写检测纠正 Paper](https://houbb.github.io/2020/01/20/nlp-chinese-spelling-correct-paper)

[java 实现中英文拼写检查和错误纠正？可我只会写 CRUD 啊！](https://houbb.github.io/2020/01/20/nlp-chinese-word-checker-01-intro)

[一个提升英文单词拼写检测性能 1000 倍的算法？](https://houbb.github.io/2020/01/20/nlp-chinese-word-checker-02-1000x)

[单词拼写纠正-03-leetcode edit-distance 72.力扣编辑距离](https://houbb.github.io/2020/01/20/nlp-chinese-word-checker-03-edit-distance-intro)

# NLP 开源项目

[nlp-hanzi-similar 汉字相似度](https://github.com/houbb/nlp-hanzi-similar)

[word-checker 中英文拼写检测](https://github.com/houbb/word-checker)

[pinyin 汉字转拼音](https://github.com/houbb/pinyin)

[opencc4j 繁简体转换](https://github.com/houbb/opencc4j)

[sensitive-word 敏感词](https://github.com/houbb/sensitive-word)

# 前言

大家好，我是老马。

下面学习整理一些其他优秀小伙伴的设计、论文和开源实现。

# 感受

这一篇和我的理念很类似，其实就是汉字的三个部分：音 形 义

字典是学习一个字符如何发音、书写和使用的参考书籍

其实本质上还是类似的。

TODO: 不过目前义（使用）这个部分我做的还比较弱，考虑添加一个关于单个字/词的解释词库。

# 论文+实现

论文地址: https://arxiv.org/pdf/2210.10320v1

源码地址：https://github.com/geekjuruo/lead

# 摘要

中文拼写检查（CSC）旨在检测和纠正中文拼写错误。

近年来的研究从预训练语言模型的知识出发，并将多模态信息引入CSC模型，以提高性能。

然而，它们忽视了字典中丰富的知识，字典是学习一个字符如何发音、书写和使用的参考书籍。

本文提出了LEAD框架，使CSC模型能够从字典中学习异质知识，涵盖语音、视觉和语义方面的内容。

LEAD首先根据字典中的字符语音、字形和定义的知识构建正负样本。

然后，采用统一的对比学习训练方案来细化CSC模型的表示。大量实验和对SIGHAN基准数据集的详细分析验证了我们提出方法的有效性。

# 1 引言

作为一项重要的中文处理任务，中文拼写检查（CSC）旨在检测和纠正中文拼写错误（Wu等，2013a），这些错误主要由发音或字形相似的字符引起（Liu等，2010）。

最近的研究提出引入语音和视觉信息，以帮助预训练语言模型（PLM）处理混淆字符（Liu等，2021；Xu等，2021；Huang等，2021）。

然而，CSC任务具有挑战性，因为它不仅需要语音/视觉信息，还需要复杂的定义知识来帮助找到真正正确的字符。如表1所示，“货(huò)”和“火(huo)”在发音上相似，并且两者都可以与“车”搭配。但如果模型关注关键词“铁轨（railway）”并理解“火车（train）”的意思，那么它就不会被“货”干扰，能够做出正确的判断。

相同的情况也出现在视觉上。对于这些难度较大的样本，PLM表现不佳，因为掩蔽语言建模目标决定了它们预训练的语义知识更多地是关于字符的搭配，而不是它们的定义。

因此，如果模型能够理解单词的意义，它就可以进一步增强以处理更多困难样本，并提高性能。

为了帮助人们学习中文，汉字和词汇的含义已被组织成字典中的定义句子。

字典包含了大量有用的中文拼写检查（CSC）知识，包括字符的语音、字形和定义。

它也是学习如何发音、书写和使用一个字符的中文初学者最重要的资源。受到此启发，我们着眼于利用字典中的丰富知识来提高CSC的性能。

本文提出了LEAD框架，这是一个统一的微调框架，旨在指导CSC模型从字典中学习异质知识。总体来说，LEAD具有一个训练范式，但除了传统的CSC目标外，还有三个不同的训练目标。这使得模型能够学习三种不同类型的知识，即语音、视觉和定义知识。具体而言，我们根据不同知识的各自特点构建了各种正负样本，然后利用这些生成的样本对模型进行训练，采用我们设计的统一对比学习范式。

通过优化LEAD，微调后的模型能够处理各种发音/字形相似的字符错误，并且与之前的多模态模型一样，进一步借助字典中包含的定义知识来处理更多的混淆错误。此外，LEAD是一个模型无关的微调框架，它对微调模型没有限制。在实践中，我们使用LEAD对BERT和一个更复杂的多模态CSC模型（Xu等，2021）进行了微调，实验结果显示，LEAD在SIGHAN数据集上的表现一致优于其他方法。

总结来说，我们工作的贡献有三方面：  

1. 我们关注字典知识对于CSC任务的重要性，这对未来的CSC研究具有指导意义。  

2. 我们提出了LEAD框架，该框架以统一的方式微调模型，使其学习对CSC任务有益的异质知识。  

3. 我们在广泛使用的SIGHAN数据集上进行了广泛的实验和详细分析，LEAD超越了之前的最先进方法。

- T1

![csc-t1](https://houbb.github.io/static/img/2024-12-22-csc-dict-t1.png)

# 2 相关工作

## 2.1 中文拼写检查（CSC）

近年来，基于深度学习的模型逐渐成为中文拼写检查（CSC）方法的主流（Wang等，2018；Hong等，2019；Zhang等，2020；Li等，2022b）。

SpellGCN（Cheng等，2020）使用图卷积网络（GCN）（Kipf和Welling，2017）将具有相似发音和字形的字符嵌入融合在一起，明确建模字符之间的关系。

GAD（Guo等，2021）提出了一种全局注意力解码器方法，并通过混淆集引导替换策略对BERT（Devlin等，2019）进行了预训练。

Li等（2021）提出了一种方法，通过持续识别模型的薄弱环节生成更多有价值的训练样本，并应用任务特定的预训练策略来增强模型。此外，许多CSC相关工作关注了多模态知识对于CSC的重要性。

DCN（Wang等，2021）、MLM-phonetics（Zhang等，2021）和SpellBERT（Ji等，2021）都利用了语音特征来提高CSC性能。PLOME（Liu等，2021）设计了一种基于混淆集的掩蔽策略，并引入了语音和笔画信息。REALISE（Xu等，2021）和PHMOSpell（Huang等，2021）都使用编码器来学习多模态知识。

与之前的工作不同，我们的工作首次引入了来自字典的定义知识，以增强CSC模型。

## 2.2 对比学习

对比学习是一种广泛应用于自然语言处理（NLP）和计算机视觉（CV）的表示学习方法（Chen等，2020；He等，2020a；Gao等，2021）。对比学习的主要动机是在某个空间中将正样本拉近、负样本推远（Hadsell等，2006；Chen等，2020；Khosla等，2020）。

在NLP领域，已研究了各种对比学习方法，用于学习更好的表示，例如实体（Li等，2022a）、句子（Kim等，2021）和关系（Qin等，2021）。

据我们所知，我们是首个利用对比学习思想来学习更好的语音、视觉和定义知识以增强CSC的工作。

# 3 方法论

在本节中，我们首先介绍LEAD框架的概述，如图1所示，并描述我们为异质字典知识设计的统一对比学习机制。

然后，对于每个知识引导的微调，我们解释其动机、正/负样本构建以及用于对比学习机制的表示度量。

- f1

![f1](https://houbb.github.io/static/img/2024-12-22-csc-dict-f1.png)

## 3.1 LEAD框架概述

在LEAD中，除了使用CSC样本训练传统的CSC目标外，还生成了用于对比学习的各种正负样本对，涵盖三种知识（即语音、视觉和定义）。具体来说，对于特定知识 \( K \)，为了实现训练小批量，我们构建一个正样本对 \((x_o^K, x_p^K)\) 和N个负样本对 \(\{(x_o^K, x_{ni}^K)\}_{i=0}^{N-1}\)，其中 \( K \in \{P, V, D\} \) 代表“语音、视觉、定义”知识。需要注意的是，原始样本 \( x_o^K \) 来自CSC样本，正样本 \( x_p^K \) 和负样本 \(\{x_{ni}^K\}\) 根据知识 \( K \) 的特点从 \( x_o^K \) 中生成。

然后，对于正负句子（即 \( x_p^K \) 和 \(\{x_{ni}^K\}\)）的长度为T，我们使用各种编码器（即 \( E_K \in \{E_P, E_V, E_D\} \)）将它们映射为表示序列： \( k_p = [k_p^1, \dots, k_p^T] \)， \(\{k_{ni}\} = \{[k_{ni}^1, \dots, k_{ni}^T]\}\)，其中 \( k_p^j, k_{ni}^j \in \mathbb{R}^h \)，\( h \) 是 \( E_K \) 隐藏状态的维度：

\[
k_p = E_K(x_p^K), k_p \in \{p_p, v_p, d_p\}, \tag{1}
\]
\[
\{k_{ni}\} = \{E_K(x_{ni}^K)\}, k_{ni} \in \{p_{ni}, v_{ni}, d_{ni}\}. \tag{2}
\]

对于原始句子 \( x_o^K \)，我们利用CSC模型的编码器（即 \( E_C \)）获取其句子表示 \( k_o = [k_o^1, \dots, k_o^T] \)，其中 \( k_o^j \in \mathbb{R}^h \)，\( E_C \) 的隐藏状态维度与 \( E_K \) 相同：

\[
k_o = E_C(x_o^K), k_o \in \{p_o, v_o, d_o\}. \tag{3}
\]

在获得生成的句子对的表示之后，按照广泛使用的InfoNCE（van den Oord等，2018），我们以对比方式训练这些样本对：

\[
L_K = - \log f_K(k_o, k_p, s) + \sum_{i=0}^{N-1} f_K(k_o, k_{ni}, s), \tag{4}
\]

其中，\( L_K \) 是知识 \( K \) 的训练目标，\( f_K \) 是各自知识空间中的表示度量函数，后续将介绍。在小批量中，所有句子的长度为T，且其第s个字符是拼写错误。

值得强调的是，这三个知识编码器（即 \( E_P \), \( E_V \), 和 \( E_D \)）是冻结的，而 \( E_C \) 在训练过程中接收来自多个维度的梯度并进行优化。此外，我们提出的LEAD是模型无关的，因此我们可以任意配置 \( E_P \), \( E_V \), \( E_D \)，并轻松地使用先前的CSC模型作为 \( E_C \)。我们在实验中使用的各种编码器的实现细节见附录A.2。

简而言之，我们提出的LEAD**通过特定的对比微调引导异质知识，从而将各种有益的信息引入CSC模型，提升其性能**。

在3.2至3.4节中，我们将详细介绍为每种知识设计的正负样本对构建和表示度量。


## 3.2 语音引导微调

根据语音知识，汉字通常通过拼音表示。因此，为了使模型更好地处理语音错误，我们旨在引导模型更多地关注拼音相似的字符。为此，我们提出了语音引导微调（Phonetics Guided Fine-tuning），其目标是精细调整模型学习的表示空间，使得拼音相似的字符的表示更加接近，而拼音不同的字符的表示则被推远。这样，在处理拼音拼写错误时，模型将优先与拼音相似的字符关联。

### 正负样本构建

对于语音知识，我们将拼音相似的字符视为正样本，将拼音不同的字符视为负样本。如图1所示，给定一个训练样本 \( x_o^P \) “那时天起(qǐ, rise)非常好”，其中包含一个语音拼写错误，我们通过将“起(qǐ, rise)”替换为其拼音相似的字符“奇(qí, strange)”来生成正样本 \( x_p^P \)。为了生成负样本集 \(\{x_{ni}^P\}\)，我们随机选择N个拼音不同的字符，如“色(sè, color)”，替换掉“起(qǐ, rise)”。最终，我们得到一个正样本对 \((x_o^P, x_p^P)\) 和N个负样本对 \(\{(x_o^P, x_{ni}^P)\}_{i=0}^{N-1}\)，用以构建小批量进行语音知识的微调。

### 表示度量

需要注意的是，语音引导微调的动机是在语音知识的约束下，精细调整CSC模型的字符级表示，因此我们只需要拼写错误位置的表示，即第 \( s \) 个字符。因此，语音引导微调的表示度量（即 \( f_P \)）计算为点积函数：

\[
f_P(p_o, p_p, s) = \exp(p_o^T p_p^s), \tag{5}
\]
\[
f_P(p_o, p_{ni}, s) = \exp(p_o^T p_{ni}^s). \tag{6}
\]

## 3.3 视觉引导微调

类似于语音引导微调，我们提出了视觉引导微调（Vision Guided Fine-tuning），旨在获得更好的视觉表示，并提升模型的视觉错误修正能力。具体来说，基于汉字由笔画组成的事实，视觉知识的目的是训练模型在视觉表示空间中将笔画相似的字符表示得更近，将笔画不同的字符表示得更远。

### 正负样本构建

基于字符之间的视觉相似性，对于特定的汉字，我们直接从之前的工作中广泛使用的预定义混淆集（Wang et al., 2019; Cheng et al., 2020; Zhang et al., 2020）中获取与之笔画相似的字符。

例如，如图1所示，对于训练样本 \( x_o^V \) “街上正在晒(shài, bask)水”，我们通过将“晒(shài, bask)”替换为“栖(qī, habitat)”来生成正样本 \( x_p^V \)。类似于语音引导微调，我们随机选择笔画不同的字符生成负样本集 \(\{x_{ni}^V\}\)。

### 表示度量

与 \( f_P \) 类似，我们也使用点积度量来衡量视觉空间中的表示距离：

\[
f_V(v_o, v_p, s) = \exp(v_o^T v_p^s), \tag{7}
\]
\[
f_V(v_o, v_{ni}, s) = \exp(v_o^T v_{ni}^s). \tag{8}
\]

## 3.4 定义引导微调

如第1节所述，结构化词典中的词语意义在拼写错误无法仅通过语音和视觉信息纠正时，对于人工拼写检查非常有用。为了更好地利用定义知识，我们专门设计了定义引导微调（Definition Guided Fine-tuning），使模型更好地理解词语的含义。得益于定义知识的增强，我们的模型将像人类一样，看到拼写错误并将其与定义联系起来，然后基于原始词义做出合理的修正。

#### 正负样本构建

如图1所示，给定一个随机训练样本 \( x_o^D \) “举办一个误会”及其真实标签句子 \( x_g^D \) “举办一个舞会”。为了获取词语意义，我们必须首先获取包含错误位置 \( s \) 的原始单词。因此，我们将 \( x_g^D \) 分词为“举办/一个/舞会”，并在词典中查找原始单词（即“舞会”）以获取其对应的定义句子作为正样本 \( x_p^D \)。至于负样本集 \(\{x_{ni}^D\}\)，我们将随机选择N个其他单词的定义句子。

考虑到一些单词有多个定义，我们设计了以下几种词语定义选择策略：

1. **随机选择定义**：最简单的方法是从多个定义句子中随机选择一个句子。
2. **选择第一个定义**：通过对词典的初步分析，我们发现当一个单词有多个定义时，位于前面的定义通常是该单词最常用的含义。基于这一观察，我们提出选择第一个定义作为词语的意义。
3. **选择最相似的定义**：直观地说，词语的意义可以通过其上下文来揭示。因此，我们可以通过计算句子 \( x_g^D \) 与定义句子之间的相似度来判断选择哪个定义句子。更实际的方法是通过像BERT这样的编码器获取句子表示，然后使用余弦相似度等距离度量来计算句子表示之间的相似性。

不同词语定义选择策略的效果将在第4.6.2节中进行分析。

#### 表示度量

当我们对 \( x_g^D \) 进行分词时，我们同时获得原始单词在句子中的索引位置。假设原始单词的索引位置为 [s, ..., s + w]，其中 \( s + w \leq T \)，那么我们计算表示之间的距离如下：

\[
f_D(d_o, d_p, s) = \text{cos}\left(\text{avg}([d_o^s, ..., d_o^{s+w}]), \text{avg}(d_p)\right), \tag{9}
\]
\[
f_D(d_o, d_{ni}, s) = \text{cos}\left(\text{avg}([d_o^s, ..., d_o^{s+w}]), \text{avg}(d_{ni})\right). \tag{10}
\]

其中，\( \text{cos}(y_1, y_2) \) 表示余弦距离，\( \text{avg}([r_n, ..., r_m]) \) 是均值池化操作，计算 [\( r_n, ..., r_m \)] 的平均值。换句话说，\( \text{avg}([d_o^s, ..., d_o^{s+w}]) \) 是句子 \( x_o^D \) 中位置 [\( s, ..., s + w \)] 的表示，\( \text{avg}(d_p) \)，\( \{\text{avg}(d_{ni})\} \) 是 \( x_p^D \)，\( \{x_{ni}^D\} \) 的句子表示。

## 3.5 方法概述**

在上述的3.2-3.4节中，我们详细描述了为三种知识类型设计的对比学习目标。

这三种对比学习目标的目的是让CSC模型学习语音学、视觉和定义的外部知识，并最终提高模型的CSC性能。

此外，由于该模型将用于CSC任务，因此仍然需要使用CSC训练数据训练CSC训练目标LCSC。因此，最终我们有以下的训练损失：

\[
L = \lambda_1 L_{CSC} + \lambda_2 L_P + \lambda_3 L_V + \lambda_4 L_D, \tag{11}
\]

其中，\(\lambda_i\)是任务的权重。LCSC是传统的CSC目标，\(L_P\)、\(L_V\)、\(L_D\)是我们分别为“语音学（Phonetics）”，“视觉（Vision）”，“定义（Definition）”知识设计的对比目标。

# 4 实验

在本节中，我们首先介绍实验设置和LEAD的主要性能。然后，我们进行详细的讨论和分析，以验证我们提出方法的有效性。

## 4.1 数据集

**训练数据**  

在我们的所有实验中，我们使用大多数先前工作的广泛使用的训练数据（Zhang et al., 2020；Liu et al., 2021；Xu et al., 2021），包括来自SIGHAN13（Wu et al., 2013b）、SIGHAN14（Yu et al., 2014）、SIGHAN15（Tseng et al., 2015）的训练句子，以及生成的训练句子（这一部分数据的大小为271K，我们在论文中将其表示为Wang271K）（Wang et al., 2018）。

**测试数据**  

为了确保实验的公平性，我们使用与基准方法完全相同的测试数据，这些数据来自SIGHAN13/14/15测试数据集。我们在实验中使用的训练/测试数据的详细信息见附录A.1。

## 4.2 基准方法

为了评估LEAD的性能，我们选择了几种最新的CSC模型作为我们的基准，包括在SIGHAN13/14/15数据集上之前的最新方法：

- **BERT**（Devlin et al., 2019）：仅在训练数据上通过交叉熵进行微调。  
- **SpellGCN**（Cheng et al., 2020）：通过GCN引入混淆集信息。  
- **GAD**（Guo et al., 2021）：结合全球注意力解码器与BERT，并在混淆集引导的替换策略下训练模型。  
- **Two-Ways**（Li et al., 2021）：持续识别模型的薄弱点以生成更有价值的训练句子。  
- **DCN**（Wang et al., 2021）：利用拼音增强候选生成器，并提出动态连接网络来建立依赖关系。  
- **MLM-phonetics**（Zhang et al., 2021）：将语音特征引入ERNIE（Sun et al., 2020），并使用增强版ERNIE模型进行CSC。  
- **PLOME**（Liu et al., 2021）：通过基于混淆集的掩蔽策略对BERT进行预训练，并利用GRU（Dey和Salem, 2017）对语音/笔画进行编码。  
- **REALISE**（Xu et al., 2021）：一个多模态模型，将语义、语音和图形信息混合以提高模型性能。

以下是这段技术文档的中文翻译：

---

**表2：LEAD与基准方法的性能。**  

对于每个数据集，我们根据最重要的指标（即纠正级别的F1分数）对基准方法进行从低到高的排名。

请注意，所有基准方法的结果均直接来自已发布的论文。

我们下划线标出了之前的最新性能，方便进行比较。

| 数据集 | 方法 | 检测级别 Pre | 检测级别 Rec | 检测级别 F1 | 纠正级别 Pre | 纠正级别 Rec | 纠正级别 F1 |
|--------|------|--------------|--------------|-------------|--------------|--------------|-------------|
| **SIGHAN13** | SpellGCN (Cheng et al., 2020) | 80.1 | 74.4 | 77.2 | 78.3 | 72.7 | 75.4 |
| | MLM-phonetics (Zhang et al., 2021) | 82.0 | 78.3 | 80.1 | 79.5 | 77.0 | 78.2 |
| | DCN (Wang et al., 2021) | 86.8 | 79.6 | 83.0 | 84.7 | 77.7 | 81.0 |
| | GAD (Guo et al., 2021) | 85.7 | 79.5 | 82.5 | 84.9 | 78.7 | 81.6 |
| | REALISE (Xu et al., 2021) | 88.6 | 82.5 | 85.4 | 87.2 | 81.2 | 84.1 |
| | Two-Ways (Li et al., 2021) | - | - | 84.9 | - | - | 84.4 |
| | BERT (Xu et al., 2021) | 85.0 | 77.0 | 80.8 | 83.0 | 75.2 | 78.9 |
| | **LEAD** | 88.3 | 83.4 | 85.8 | 87.2 | 82.4 | 84.7 |
| **SIGHAN14** | SpellGCN (Cheng et al., 2020) | 65.1 | 69.5 | 67.2 | 63.1 | 67.2 | 65.3 |
| | DCN (Wang et al., 2021) | 67.4 | 70.4 | 68.9 | 65.8 | 68.7 | 67.2 |
| | GAD (Guo et al., 2021) | 66.6 | 71.8 | 69.1 | 65.0 | 70.1 | 67.5 |
| | REALISE (Xu et al., 2021) | 67.8 | 71.5 | 69.6 | 66.3 | 70.0 | 68.1 |
| | Two-Ways (Li et al., 2021) | - | - | 70.4 | - | - | 68.6 |
| | MLM-phonetics (Zhang et al., 2021) | 66.2 | 73.8 | 69.8 | 64.2 | 73.8 | 68.7 |
| | BERT (Xu et al., 2021) | 64.5 | 68.6 | 66.5 | 62.4 | 66.3 | 64.3 |
| | **LEAD** | 70.7 | 71.0 | 70.8 | 69.3 | 69.6 | 69.5 |
| **SIGHAN15** | SpellGCN (Cheng et al., 2020) | 74.8 | 80.7 | 77.7 | 72.1 | 77.7 | 75.9 |
| | DCN (Wang et al., 2021) | 77.1 | 80.9 | 79.0 | 74.5 | 78.2 | 76.3 |
| | PLOME (Liu et al., 2021) | 77.4 | 81.5 | 79.4 | 75.3 | 79.3 | 77.2 |
| | MLM-phonetics (Zhang et al., 2021) | 77.5 | 83.1 | 80.2 | 74.9 | 80.2 | 77.5 |
| | REALISE (Xu et al., 2021) | 77.3 | 81.3 | 79.3 | 75.9 | 79.9 | 77.8 |
| | Two-Ways (Li et al., 2021) | - | - | 80.0 | - | - | 78.2 |
| | BERT (Xu et al., 2021) | 74.2 | 78.0 | 76.1 | 71.6 | 75.3 | 73.4 |
| | **LEAD** | 79.2 | 82.8 | 80.9 | 77.6 | 81.2 | 79.3 |


以下是这段技术文档的中文翻译：

---

## 4.3 实验设置

字符级和句子级的指标都在CSC任务中使用。

根据句子级指标，只有当测试句子中的所有错误字符都被成功检测和纠正时，该句子才会被判断为正确。

因此，句子级指标比字符级指标更严格，因为有些句子可能包含多个错误字符。

因此，我们在所有实验中报告句子级指标，这一设置在以往的工作中也广泛使用（Li et al., 2021；Liu et al., 2021；Xu et al., 2021）。更具体地说，我们报告了检测级别和纠正级别的精确度、召回率和F1分数。  

- 在检测级别，测试样本中所有错误字符的位置都应正确检测。  

- 在纠正级别，要求模型不仅检测到错误字符，还能纠正所有拼写错误。  

此外，我们实验的其他实现细节见附录A.2。

## 4.4 主要结果

从表2中我们可以观察到：  

1. 由于LEAD本质上是BERT的微调框架，因此其直接基准应该是BERT。LEAD与BERT的比较结果表明，LEAD在SIGHAN13/14/15数据集上显著优于BERT，这验证了我们提出的异构知识引导微调方法的有效性。  

2. 与之前的最新模型（即Two-Ways、REALISE和MLM-phonetics）相比，我们的模型仅利用了一个精简版的BERT作为主体，就实现了更好的性能，而REALISE和MLM-phonetics都显式地将多模态信息引入推理过程中，这证明了我们提出的方法具有竞争力。 

3. 考虑到不同知识的影响，LEAD是在语音、视觉和定义知识的指导下进行训练的，而大多数基准模型（如SpellGCN、DCN和PLOME）也使用不同机制来利用语音和视觉知识。我们的模型优于这些基准模型，表明我们所关注的独特定义知识对于CSC任务非常重要。

## 4.5 消融研究

通过进行消融研究，我们探索了LEAD中每个对比学习目标的有效性，使用不同的变体进行实验。

具体地，在表3中，MODEL + K，其中K ∈ {P, V, D}，表示我们使用CSC训练目标LCSC和相应的对比训练目标LK来训练模型。此外，由于REALISE有自己使用视觉/语音特征的方法，这使得LV和LP没有意义，因此我们只对REALISE进行了LD实验。  

从使用单一训练目标（即BERT+V/P/D）的三行结果中，我们可以知道，每个我们提出的对比学习策略在单独应用于BERT时都显著提高了性能。

特别地，BERT+P在纠正级别上优于BERT+V，符合现实场景中83%的错误属于语音错误，48%的错误属于视觉错误（Liu et al., 2021）。

此外，我们还看到，所有方法，包括之前的最新模型（即REALISE），在加入我们提出的定义引导微调目标后，都取得了进一步的改善，这证明了我们关注的定义信息对增强CSC模型非常有用。

![t3-f2](https://houbb.github.io/static/img/2024-12-22-csc-dict-t3-f2.png)

## 4.6 分析与讨论

### 4.6.1 更好的语音/视觉表示的可视化

我们提出的语音/视觉引导微调的关键动机是为了优化模型在不同知识维度上对字符的表示。

我们希望通过语音/视觉引导微调，能够让模型将具有相似拼音/笔画的字符表示得更接近，而具有不同拼音/笔画的字符表示得更远。

因此，有必要对模型结合我们的方法前后的字符表示进行可视化。具体地，我们随机选择两组语音/视觉上相似的字符（例如，拼音相似的“ji/zhi”和笔画相似的“新/营”），然后应用BERT和BERT+P/V来获得它们的表示。最后，我们使用t-SNE来可视化这些高维的字符表示。

图2展示了BERT和BERT+P/V对于语音/视觉相似字符的表示分布。

从图2(a)和图2(b)的比较可以看出，图2(a)中的字符表示是杂乱的，而在图2(b)中，甚至可以看到两类字符之间有明显的边界，这表明在语音引导微调优化后，模型确实将语音相似的字符表示得更为接近。

同样，在视觉比较中，我们看到图2(c)中的两种颜色的点分布明显更加分散，而图2(d)则更加有序，这也验证了我们提出视觉引导微调的动机。

![t4-t5](https://houbb.github.io/static/img/2024-12-22-csc-t4-t5.png)

以下是这段技术文档的中文翻译：

### 4.6.2 不同词语定义选择策略的效果

如第3.4节所述，我们为定义引导微调设计了三种不同的词语定义选择策略，分别是“选择随机定义”（Random）、“选择第一个定义”（First）和“选择最相似的定义”（Similar）。为了进一步从经验上解释我们提出的这些策略为何有效，我们进行了如表4所示的分析。

我们在SIGHAN15数据集上应用了不同策略的LEAD，并观察了性能的变化。

从表4可以看出，LEAD (Similar)的表现最佳，其次是LEAD (First)，LEAD (Random)的改进最小。

这些结果与这些策略的机制一致。LEAD (First)优于LEAD (Random)的表现表明我们的词典观察是正确的，即在多个定义中，第一个定义通常在大多数情况下最具代表性。此外，LEAD (Similar)的最佳表现也证明了我们基于句子相似度设计的选择策略的有效性。

值得注意的是，尽管这三种策略对模型性能的影响不同，但它们都相较于基线方法（即BERT）带来了稳定的性能提升。

## 4.7 案例研究
从表5中的第一个/第二个案例可以看出，我们的LEAD能够感知中文字符的语音和视觉相似性，从而准确检测错误位置并进行合理的修正。特别是对于第一个例子，如果忽略语音相似性，还有其他候选字符如“乐(lè)”和“敢(yòng)”等。但LEAD的输出是最合适的修正，因为它更符合CSC的本质。此外，在第三个例子中，“固(gù)”和“困(kùn)”在语音和视觉上都不相似，而LEAD成功地修正了这个案例，因为它感知到了词典中“困难”的定义。如果没有定义的帮助，我们可能会将“固(gù)”替换成与之在语音上更相似的“苦(kǔ)”。然而，在日常中文使用中，“克服”和“苦难”的组合并不常见。因此，这个例子恰恰反映了我们关注的定义知识对于CSC的重要性。

# 5 结论

本文提出通过利用字典中包含的各种知识来促进CSC任务的研究。

我们介绍了LEAD，一个统一的微调框架，旨在进行三种异构知识的对比学习。

大量实验和实证分析验证了我们研究的动机以及我们提出的方法的有效性。我们关注的字典知识不仅对CSC有益，对于其他中文文本处理任务也至关重要。

因此，未来我们将继续挖掘字典中包含的知识，以改进其他中文文本处理任务。

# 6 限制性

在本节中，我们详细讨论了我们工作的限制，并提出了我们认为可行的相应解决方案。

## 6.1 语言限制

我们的工作和提出的方法主要聚焦于中文拼写检查（CSC）任务。中文的语言特点与其他语言（如英语）有很大不同。

例如，中文中的语音或视觉相似的字符是CSC的一个巨大挑战，而在英语中并不存在这种现象。

因此，语言特点的限制使得我们的方法无法直接转移到英语场景中。

然而，我们仍然认为我们关注的字典中的定义知识对英语文本纠错仍然具有重要的意义。

##  6.2 编码器选择

我们提出的LEAD框架是一个统一的微调框架，旨在引导CSC模型学习异构知识。

统一的框架使得LEAD对所使用的各种编码器没有严格的限制。

为了验证LEAD的有效性，在我们的实验中，我们只选择了简单的配置，如EP、EV、ED（见附录A.2）。

未来，我们建议可以使用更复杂的模型和配置，以实现更多的性能提升。

## 6.3 运行效率

作为学术验证实验，我们并未在具体代码实现中考虑我们提出的方法的运行效率。

具体来说，在1个V100 GPU上完成训练过程大约需要10小时，且占用最多24G的GPU内存。我们认为至少有两种解决方案可以提高效率：（1）将模型训练过程部署到多个GPU上，使用数据并行操作可以增加训练批量大小并缩短训练时间。（2）将在线正负样本构建改为离线构建，即提前构建并存储用于训练的各种正负样本对，这也可以大大节省训练过程中的时间成本。

# 致谢

本研究得到中国国家自然科学基金（项目编号：62276154 和 62011540405）、北京人工智能研究院（BAAI）、广东省自然科学基金（项目编号：2021A1515012640）、深圳市基础研究基金（项目编号：JCYJ20210324120012033 和 JCYJ20190813165003837）以及清华深圳国际研究生院海外合作研究基金（项目编号：HW2021008）的支持。


# 参考资料

https://arxiv.org/pdf/2210.10320v1

* any list
{:toc}