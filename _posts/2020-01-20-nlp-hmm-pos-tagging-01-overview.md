---
layout: post
title: 隐马尔可夫（HMM）实现中文词性标注
date:  2020-1-28 10:09:32 +0800
categories: [Math]
tags: [math, ml, ai, nlp, sh]
published: true
---

# 词性标注

词性标注（Part-of-Speech tagging 或 POS tagging)是指对于句子中的每个词都指派一个合适的词性，也就是要确定每个词是名词、动词、形容词或其他词性的过程，又称词类标注或者简称标注。

词性标注是自然语言处理中的一项基础任务，在语音识别、信息检索及自然语言处理的许多领域都发挥着重要的作用。

因此，在关于自然语言处理的书籍中，都会将词性标注单列一章重点讲解，对此有兴趣的读者可参考《自然语言处理综论》第一版第8章或《统计自然语言处理基础》第10章，本文部分内容也参考自这两本自然语言处理的经典书籍。

## 例子

我们以Brown语料库中的句子为例，词性标注的任务指的是，对于输入句子：

```
The Fulton County Grand Jury said Friday an investigation of Atlanta's recent primary election produced `` no evidence '' that any irregularities took place .
```

需要为句子中的每个单词标上一个合适的词性标记，既输出含有词性标记句子：

```
The/at-tl Fulton/np-tl County/nn-tl Grand/jj-tl Jury/nn-tl said/vbd Friday/nr an/at investigation/nn of/in Atlanta's/np$ recent/jj primary/jj election/nn produced/vbn ``/`` no/at evidence/nn ''/'' that/cs any/dti irregularities/nns took/vbd place/nn ./.
```

# 核心流程

## 1. 标记集

在进行词性标注时，前提条件之一便是选择什么样的标记集？

Brown语料库标记集有87个，而英语中其他标记集多数是从Brown语料库中的标记集发展而来的，如最常用的Penn Treebank标记集，包含45个标记，是小标记集。

汉语标记集中常用的有北大《人民日报》语料库词性标记集、计算所汉语词性标记集等。

## 2. 开始词性标注

在确定使用某个标记集之后，下一步便是如何进行词性标注了！

如果每个单词仅仅对应一个词性标记，那么词性标注就非常容易了。

但是语言本身的复杂性导致了并非每一个单词只有一个词性标记，而存在一部分单词有多个词性标记可以选择，如book这个单词，既可以是动词（book that flight)，也可以是名词(hand me that book)，因此，**词性标注的关键问题就是消解这样的歧义，也就是对于句子中的每一个单词在一定的上下文中选择恰如其分的标记**。

关于词性标注歧义问题，对Brown语料库进行统计，按歧义程度排列的词型数目（The number of word types in Brown corpus by degree of ambiguity）DeRose(1988)给出了如下的标记歧义表：

```
无歧义（Unambiguous）只有1个标记： 35,340
歧义（Ambiguous） 有2-7个标记： 4,100
2个标记：3,764
3个标记：264
4个标记：61
5个标记：12
6个标记：2
7个标记：1
```

可见英语中的大多数单词都是没有歧义的，也就是这些单词只有一个单独的标记。

但是，英语中的最常用单词很多都是有歧义的，因此，任何一个词性标注算法的关键归根结底还是如何解决词性标注中的歧义消解问题。

## 3. 标注算法

大多数的标注算法可以归纳为三类：

一类是基于规则的标注算法（rule-based tagger)，一类是随机标注算法（stochastic tagger)，最后一类是混合型的标注算法。

基于规则的标注算法一般都包括一个手工制作的歧义消解规则库；

随机标注算法一般会使用一个训练语料库来计算在给定的上下文中某一给定单词具有某一给定标记的概率，如基于HMM的标注算法；

而混合型标注算法具有上述两种算法的特点，如TBL标注算法。


# 基于 HMM 词性标注

HMM是一个生成模型，由隐藏状态序列生成观测序列。

HMM有三个重要知识点：HMM的三个参数：初始概率，状态转移概率，和观测概率。

HMM三个任务：预测问题(计算观测序列的概率)，解码问题(已知观测序列求最可能产生该观测序列的状态序列)，以及学习问题(学习HMM的三个参数)。

HMM两个假设：齐次马尔可夫假设（当前状态只与前一状态有关）和观测独立假设（当前观测只与当前状态有关）。

HMM详细的介绍可以参照《统计学习方法》的第十章。

这里我就简单介绍一下HMM如何用于词性标注（POS tagging）。

## 扯一下数学建模

回顾完HMM，这里暂且先放下词性标注，瞎扯一下数学建模。

记得以前在大学里参加数学建模竞赛，本着拿奖的目的，稀里糊涂的就和几个同学一起组队参加，并没有仔细考虑过数学建模的本质到底是什么。

反正感觉和平常作数学题不同，数学题都是定义好的，只需给出一个解答就行，而数学建模给的问题都很实际，并没有按数学题的形式出题，不仅要把这个实际问题转化为一个合理的数学问题，还要给出一个解答，由于自己概括问题的能力有限，在数学建模竞赛上也基本毫无建树。

我在Google上搜索了一下数学建模的定义，有好几种解释，觉得下面这个最符合本质：

**把现实世界中的实际问题加以提炼，抽象为数学模型，求出模型的解，验证模型的合理性，并用该数学模型所提供的解答来解释现实问题，我们把数学知识的这一应用过程称为数学建模。**

## 词性标注的数学建模

好了，这就是数学建模，如果把词性标注问题作为一个数学建模的题目来出，该如何作答？

套用上面的定义，可以解释为：

1、对词性标注问题进行提炼：词性标注本质上是一个分类问题，对于句子中的每一个单词W，找到一个合适的词类类别T，也就是词性标记，不过词性标注考虑的是整体标记的好坏，既整个句子的序列标记问题；

2、抽象为数学模型：对于分类问题，有很多现成的数学模型和框架可以套用，譬如HMM、最大熵模型、条件随机场、SVM等等；

3、求出模型的解：上述模型和框架一旦可以套用，如何求解就基本确定好了，就像HMM中不仅描述了三大基本问题，并相应的给出了求解方案一样；

4、验证模型的合理性：就是词性标注的准确率等评测指标了，在自然语言处理中属于必不可少的评测环节；

5、解释现实问题：如果词性标注的各项指标够好，就可以利用该数学模型构造一个词性标注器来解决某种语言的标注问题了！

词性标注的数学建模就这样了，自然语言处理中的多数分类问题与此相似。

这里讲得是HMM的应用，所以其他模型暂且不表，以后有机会有条件了我们再说。

## 如何建模？

如何建立一个与词性标注问题相关联的HMM模型？

首先必须确定HMM模型中的隐藏状态和观察符号，也可以说成观察状态，由于我们是根据输入句子输出词性序列，因此可以将词性标记序列作为隐藏状态，而把句子中的单词作为观察符号，那么对于Brown语料库来说，就有87个隐藏状态（标记集）和将近4万多个观察符号（词型）。

确定了隐藏状态和观察符号，我们就可以根据训练语料库的性质来学习HMM的各项参数了。

如果训练语料已经做好了标注，那么学习这个HMM模型的问题就比较简单，只需要计数就可以完成HMM各个模型参数的统计，如标记间的状态转移概率可以通过如下公式求出：

```
P（Ti|Tj) = C(Tj,Ti)/C(Tj)
```

而每个状态（标记）随对应的符号（单词）的发射概率可由下式求出：

```
P（Wm|Tj) = C(Wm,Tj)/C(Tj)
```

其中符号C代表的是其括号内因子在语料库中的计数。

如果训练语料库没有标注，那么HMM的第三大基本问题“学习”就可以派上用处了，通过一些辅助资源，如词典等，利用前向－后向算法也可以学习一个HMM模型，不过这个模型比之有标注语料库训练出来的模型要差一些。

总之，我们已经训练了一个与语料库对应的HMM词性标注模型，那么如何利用这个模型来解决词性标注问题呢？

当然是采用维特比算法解码了， HMM模型第二大基本问题就是专门来解决这个问题的。

说完了如何建模，下一节我们将利用 UMDHMM 这个HMM工具包来实现一个toy版本的HMM词性标注器。

# 任务描述

```
输入序列 O：I love NLP.
输出序列 T：PRP VB NN
```

其中PRP是人称代词， VB是动词原形，NN是名词。

这里只是举个例子，实际任务中的POS tag会复杂很多。

对应于HMM模型，状态序列对应了序列T，也就是词性标签序列；而观测序列对应了序列O。

## 解码问题

因此词性标注可以理解为HMM三大问题中的第三个问题：解码问题。

因此，我们的目标是得到最符合原句子词性的组合序列，即：

`T=argmaxT P(T∣O)`

其中：

```
O = {O1, O2, O3, ..., ON} ，是观测序列。

T = {T1, T2, T3, ..., TN} ，是状态/标签序列。

Ti ∈ all POS tags
```

## 贝叶斯转换

根据贝叶斯公式：

```
P(T|O) = P(O|T) P(T) / P(O)
```

首先，由于对于给定的观测序列P(O)是固定不变的，因此我们可以省略分母。

其次，在贝叶斯公式中 `P(O|T)` 被称为似然函数，P(T)被称为先验概率。

对应到我们的任务，`P(O|T)` 是“已知状态序列T求观测序列O的概率”，P(T)则是状态序列本身的概率,因此任务变成了：

```
T = argmaxT * P(T∣O)=argmaxT * P(O∣T)P(T)
```

![image](https://user-images.githubusercontent.com/18375710/76058588-ceb76200-5fb7-11ea-9645-2677534ea5c1.png)


# 简单版的代码实现 

原计划这一节讲解如何利用UMDHMM这个HMM工具包来实现一个toy版本的HMM词性标注器，自己也写了几个相关的小脚本，不过由于处理过程中需要借用Philip Resnik教授写的另外几个小脚本，所以这里先介绍一下他的工作。

## HMM 的介绍

Resnik教授利用UMDHMM写了一个关于如何使用隐马尔科夫模型的介绍和练习，主要目标包括以下四个方面：

1、 在一个“似英语”的文本上训练一个HMM模型（Train an HMM on a sample of English-like text ）；

2、对于训练好的模型进行检测（Inspect the resulting model）；

3、根据训练好的模型随机生成句子（Generate sentences at random from the model）；

4、对于测试句子寻找最可能隐藏状态序列（Create test sentences and find the most likely hidden state sequence）。

我的工作和Resnik教授的主要区别再于，他的训练集没有进行词性标注，利用了前向－后向算法生成HMM模型，并且需要读者有一定想象能力来作虚拟词性标注；

而我所用的训练集是有标注的，主要是通过统计的方法生成HMM模型，并且对于测试集标注是直观的。

但是，殊途同归，都是为了建立一个HMM模型，都是为了能利用UMDHMM。

## 下载和使用

关于如何下载和使用这个工具包具体请参考 [Exercise: Using a Hidden Markov Model](http://users.umiacs.umd.edu/~resnik/nlstat_tutorial_summer1998/Lab_hmm.html)，这里我主要讲解一些要点和一个例子。

主要包括几个perl脚本，UMDHMM编译后生成的几个可执行程序以及两个样例文件夹，需要注意的是，几个perl脚本需要根据你所使用的环境修改perl的执行路径，另外UMDHMM的几个可执行程序是Resnik教授在Solaris 5.5系统下编译的，并不适用于其他操作系统，因此最好自己单独编译一下UMDHMM，关于UMDHMM的编译和使用，不太清楚的读者可以先看一下我之前写得一点介绍：UMDHMM。

对于这几个perl脚本，需要作一点预处理，第一使其可执行：chmod u+x *.pl 或 chmod 755 *.pl；第二，修改每个脚本的perl解释器目录，由于我用的是ubuntu9.04，所以处理的方法是，注释掉第一行，将第二行”/usr/local/bin/perl5“修改为“/usr/bin/perl”。

修改完毕perl脚本使其可执行之后，就可以进入example0目录进行练习了：cd example0

example0目录下有一个example0.train文件，只有一行，但是包含了一百句英语句子，这一百句英语句子只用了11个单词和两个标点符号”.”和“？”生成，是一个“似英语”句子生成器生成的，主目录下有这个程序，是lisp程序写的，我不明白怎么使用。

如下所示部分句子：

```
the plane can fly . the typical plane can see the plane . a typical fly can see . who might see ? the large can might see a can . the can can destroy a large can …
```

对于这个训练集，Resnik教授建议读者写一个简单的词性列表，并尝试为每一个单词分配一个词性标记，并且同一个单词可以有不同的标记。

注意这个练习并不是要在这个文件中进行，可以在别的地方，譬如纸上或者心里都可以，不做也行的。

我就偷懒了，因为不知道如何标记，并且手工标记的工作量较大，我用了一个基于Brown语料库训练的词性标注器标注了一下，这个之后再详细说明。

由于UMDHMM这个工具包处理的都是数字而非符号，所以需要先将这个训练集转换为数字序列，由create_key.pl这个脚本完成：

```
../create_key.pl example0.key < example0.train > example0.seq
```

这一步生成两个文件：example0.key及example0.seq，前者主要将训练集中出现的单词符号映射为数字编号,如：

```
1 the
2 plane
8 a
4 fly
3 can
7 see
12 large
11 ?
10 might
9 who
6 typical
5 .
13 destroy
```

后者主要根据example0.key中的编号对训练集进行转换，并且形式为UMDHH中的训练集输入形式，如：

```
T= 590
1 2 3 4 5 1 6 2 3 7 1 2 5 8 6 4 3 7 5 9 10 7 11 1 12 3 10 7 8 3 5 1 3 3 13 8 12 3 5 9 10 7 11 9 10 4 11 9 3 4 11 1 3 10 7 5 1 2 3 4 8 6 4 5 9 3 4 11 1 12 4 3 4 5 9 3 7 11 9 3 7 8 3 11...
```

其中 T 代表了训练集中的单词符号数目。

## 格式转换

在将训练集转换成UMDHMM需要的形式后，就可以利用UMDHMM中编译好的可执行程序esthmm来训练HMM模型了。

esthmm的作用是，对于给定的观察符号序列，利用BaumWelch算法（前向-后向算法）学习隐马尔科夫模型HMM。

这里采用如下的命令训练HMM模型：

```
../esthmm -N 7 -M 13 example0.seq > example0.hmm
```

其中 N指示的隐藏状态数目，这里代表词性标记，这个例子中可以随便选，我选的是7，下一节会用到。

注意Resnik教授给出的命令：

```
esthmm 6 13 example0.seq > example0.hmm
```

是错误的，需要加上”-N”和“-M”。

example0.hmm的部分形式如下：

```
M= 13
N= 7
A:
0.001002 0.001003 0.001000 0.001000 0.462993 0.001000 0.538002
...
B:
0.001000 0.366300 0.420021 0.215676 0.001000 0.001001 0.001001 0.001000 0.001001 0.001000 0.001000 0.001001 0.001000
...
pi:
0.001000 0.001000 0.001005 0.001000 0.001000 0.999995 0.001000
```

抛开这个HMM模型的效果如何，这里不得不感叹前向－后向算法或者EM算法的神奇。

当然这里只是一个练习，实际处理中需要加上一些辅助手段，譬如词典之类的，这种无监督的学习是非常有难度的。

有了这个HMM模型，就可以作些练习了。

首先我们利用genseq来随机生成句子：

```
../genseq -T 10 example0.hmm > example0.sen.seq
```

其中T指示的是输出序列的长度，如下所示：

```
T= 10
8 12 4 5 9 3 7 5 9 3
```

注意 Resink教授给出的命令仍然是错的，上面的输出结果可读性不好，读者可以对照着example0.key将这个句子写出来，不过Resnik教授写了一个ints2words.pl的脚本，帮助我们完成了这件事：

```
../ints2words.pl example0.key < example0.sen.seq > example0.sen
```

example0.sen中包含的就是这个HMM模型随机生成的句子：

```
a large fly . who can see . who can
```

虽然不是一句整句，但是局部还是可读的，注意这两步可以利用管道命令合并在一起：

```
../genseq -T 10 example0.hmm | ../ints2words.pl example0.key
```

注意每次的结果并不相同。

最后一个练习也是最重要的一个：对于一个测试句子寻找其最可能的隐藏状态序列（Finding the Hidden State Sequence for a Test Sentence），对于本文来说，也就是词性序列了。

我们使用testvit来完成这个任务，当然，前提是先准备好测试句子。

可以根据exampl0.key中的单词和标点自己组织句子，也可以利用上一个练习随机生成一个句子，不过我选择了训练集中的第91句，比较典型：

```
the can can destroy the typical fly .
```

虽然违背了自然语言处理中实验的训练集与测试集分离的原则，不过考虑到这只是一个练习，另外也是为下一节做个小准备，我们就以此句话为例建立一个文件example0.test.words。

不过UMDHMM还是只认数字，所以Resnik教授有为我们写了一个words2seq.pl处理此事：

```
../words2seq.pl example0.key < example0.test.words > example0.test
```

example0.test就是UMDHMM可以使用的测试集了，如下所示：

```
T= 8
1 3 3 13 1 6 4 5
```

现在就可以使用testvit，这次Resnik教授没有写错：

```
../testvit example0.hmm example0.test
```

看到结果了吗？我们得到了一个隐藏状态序列：

```
…
Optimal state sequence:
T= 8
6 1 5 2 6 3 1 7
…
```

如果之前你已经建立好了隐藏状态与词性标记的一一映射，那么就可以把它们所对应的词性标记一个一个写出来了！

这个词性标注结果是否与你的期望一样？

如果你还没有建立这个映射，那么就可以好好发挥一下想象力了！

无论如何，恭喜你和52nlp一起完成了Philip Resnik教授布置的这个练习。

# 词性标注

## 回顾

上一节我们谈完了Resnik教授基于UMDHMM设计的词性标注的练习，不过自始至终，还没有见到一个词性标记的影子。

虽然这一过程展示了自然语言处理中EM算法在无监督学习任务中的重要作用，但是这类方法的标注准确性还相对较低，在实际应用中多是那些建立在有词性标注训练集基础上的机器学习算法，如最大熵模型、决策树等，所学习的词性标注器能获得较高的标注准确率。

本节我们就以一个标注好的训练集为基础，来学习一个最简单的HMM词性标注器。

首先就是准备训练集，作为一个练习，52nlp也本着尽量简单的原则，所以这里仍然选用Resnik教授所使用的example0.train，这个训练集虽然包含了一百句“似英语”的句子，但是只有一行，所以我们首先做一个断句处理，不过这些句子只采用了“.”和“?”作为句尾标志，因此断句相对简单。不过实际处理中英文断句问题比较麻烦，也有很多学者这方面做了很多研究工作。这里52nlp写了一个简单的sentsplit.pl脚本来处理这个训练集：

```
./sentsplit.pl example0.train example0.sentences
```

example0.sentences就成了每一句为一行的训练集，如下所示：

```
the plane can fly .
the typical plane can see the plane .
a typical fly can see .
who might see ?
the large can might see a can .
the can can destroy a large can .
```

但是，这个训练集只包含纯粹的单词句子，因此需要做一下词性标注，当然人工标注并检查是最好的了，但是我不懂，于是找了一个开源的词性标注工具对这些句子进行了标注，关于这个词性标注器的细节，下一节我会具体介绍，先来看标注后得到的包含词性标记的训练集example0.all，部分示例如下：

```
the/at plane/nn can/md fly/vb ./.
the/at typical/jj plane/nn can/md see/vb the/at plane/nn ./.
a/at typical/jj fly/nn can/md see/vb ./.
who/wps might/md see/vb ?/.
the/at large/jj can/nn might/md see/vb a/at can/nn ./.
```

无论什么方法，建立HMM词性标注器的关键就是根据这个训练集来学习一个合适的HMM模型了。

我们先来确定HMM模型中的隐藏状态（词性标记）和观察符号（词型），这里只考察能从训练集中观察的到的词性标记和词型，因此上一节用到的create_key.pl这个脚本就可以派上用处了。

对于确定训练集中的词型，利用example0.sentences就可以:

```
../create_key.pl words.key < example0.sentences > example0.seq 　
```

所得到的words.key就包含了训练集中的词型及其数字编号：

```
1 the
2 plane
8 a
4 fly
3 can
7 see
12 large
11 ?
10 might
9 who
6 typical
5 .
13 destroy
```

注意另一个副产品example0.seq在这一节里并不需要。同样我们也需要利用create_key.pl来确定训练集中的词性标记及其编号，不过这里我们需要先将example0.all中的词性标记序列抽取出来。这里52nlp写了一个简单的脚本extractpos.pl来处理此事：

```
./extractpos.pl example0.all example0.pos
```

所得到的example0.pos文件部分示例如下：

```
4 vb
6 jj
3 md
2 nn
7 wps
5 .
1 at
```

同样，另一个副产品example0.posseq这里也不需要。

确定好了该HMM模型中的隐藏状态（词性标记）和观察符号（词型）后，下一步便是要计算HMM模型中其他三个基本要素了，包括初始概率向量pi, 状态转移矩阵A，混淆矩阵B。

我们先预处理一下语料库，主要的目标是对一元词性、二元词性及词型与词性的组合进行计数，这里52nlp写了一个脚本pretrain.pl来处理此事：

```
./pretrain.pl example0.all lex ngram
```

所得到的lex文件主要是统计词型及其词性标记的组合在训练集中出现的次数：

```
typical jj 25
large jj 22
might md 42
fly nn 20
a at 58
? . 57
plane nn 34
the at 35
who wps 57
can nn 39
see vb 45
destroy vb 9
fly vb 46
. . 43
can md 58
```

ngram文件主要包含的是一元词性及二元词性在训练集中的出现次数：

```
vb 100
jj 47
md 100
nn 93
wps 57
. 100
at 93
vb . 50
md vb 100
vb at 50
at jj 47
wps md 57
nn . 50
at nn 46
jj nn 47
nn md 43
```

有了这几个预处理文件，我们就可以训练一个简单的HMM词性标注模型了,这里52nlp写了一个约100行的脚本hmmtrain.pl来处理此事：

```
./hmmtrain.pl words.key pos.key ngram lex example.hmm
```

其中前四个是输入（准备）文件，最后一个example.hmm是输出文件，也就是本节的核心目标：

## HMM 标注模型

一个合适的HMM词性标注模型，我们来简单看一下example.hmm：

```
M= 13
N= 7
A:
0.0100 0.4700 0.0100 0.0100 0.0100 0.4800 0.0100
...
B:
0.3396 0.0094 0.0094 0.0094 0.0094 0.0094 0.0094 0.5566 0.0094 0.0094 0.0094 0.0094 0.0094
...
pi:
0.1576 0.1576 0.1695 0.1695 0.1695 0.0797 0.0966
```

有兴趣的读者，可以对比一下上一节利用BaumWelch算法（前向-后向算法）所学习的HMM词性标注模型example0.hmm。

关于这个脚本，其中对于状态转移矩阵A，混淆矩阵B的计算采用了最简单的加一平滑来处理那些在训练集中的未出现事件， 关于加一平滑，不清楚读者可以在“MIT自然语言处理第三讲：概率语言模型（第四部分）” 中找到参考，或者任何一本自然语言处理书中关于ngram语言模型的章节都会介绍的。

现在我们就可以作上一节最后一个词性标注的练习了，仍然选择训练集中的第91句：

```
the can can destroy the typical fly .
```

可以利用Resnik教授的words2seq.pl来对此句进行转换，或者利用上一节已经处理好的UMDHMM可读的example0.test：

```
T= 8
1 3 3 13 1 6 4 5
```

现在就可以使用testvit及刚刚训练好的example.hmm来作词性标注了：

```
../testvit example.hmm example0.test
```

同样得到了一个隐藏状态序列：

```
…
Optimal state sequence:
T= 8
1 2 3 4 1 6 2 5
…
```

不过这次我们已经有了词性标记序列及其数字编号，可以对应着把它们写出来：

```
at nn md vb at jj nn .
```

与测试句子合在一起即是：

```
the/at can/nn can/md destroy/vb the/at typical/jj fly/nn ./.
```

对照example.all里的第91句：

```
the/at can/nn can/md destroy/vb the/at typical/jj fly/nn ./.
```

二者是一样的，不过这个绝不能说明此HMM词性标注器是100％正确的。

好了，本节就到此为止了，这一节的相关例子及小脚本可以单独按链接下载，也可以打包在这里供下载：52nlpexample.tar.gz

不过这套小工具还不足以处理实际问题中的词性标注问题，下一节我将介绍一个更加健壮的HMM词性标注开源工具。

# 开源词性标注工具

有一段时间没有谈HMM和词性标注了，今天我们继续这个系列的最后一个部分：

介绍一个开源的HMM词性标注工具并且利用Brown语料库构造一个英文词性标注器。

## n-gram 算法

上一节借用umdhmm构造的HMM词性标注工具是二元语法(bigram)标注器，因为我们只考虑了前一个词性标记和当前词性标记，算的上是最基本的马尔科夫模型标注器。

这个HMM词性标注器可以通过好几种方式进行扩展，一种方式就是考虑更多的上下文，不只考虑前面一个词性标记，而是考虑前面两个词性标记，这样的标注器称之为三元语法（trigram）标注器，是非常经典的一种词性标注方法，在《自然语言处理综论》及《统计自然语言处理基础》中被拿来介绍。

### TnT 

正因为经典， 所以老外已经做足了功课，包括paper以及开源工具，我查了一下，其中比较有名的一个是TnT。

作者既写了一篇 [TnT -- Statistical Part-of-Speech Tagging](http://www.xun6.com/file/ad4afd816/a00-1031.pdf.html)，被引用869次，又开发了一套开源工具(http://www.coli.uni-saarland.de/~thorsten/tnt/)，可谓“知行合一”。

但是要获得这个工具必须填一个表，并且传真给对方，比较麻烦。

不过幸好在英文维基百科关于词性标注的介绍页面上有替代品：[Part-of-speech_tagging](http://en.wikipedia.org/wiki/Part-of-speech_tagging).

### Citar

在这个页面的“External links（外部链接）”的最后一行，提到了一个名叫Citar的利用C++开发的隐马尔科夫模型（HMM）三元语法词性标注器：

“Citar LGPL C++ Hidden Markov Model trigram POS tagger, a Java port named Jitar is also available”

同时，它也提供Java版本的Jitar。

不过可惜，这个页面目前无法直接访问到。

以下是citar的简要介绍：

```
Citar is a simple part-of-speech tagger, based on a trigram Hidden Markov Model (HMM). 

It (partly) implements the ideas set forth in [1]. 

Citaris written in C++. There is also a Java/JDK counterpart named Jitar,

which is available at: http://code.google.com/p/jitar/
```

其中[1]指的是“TnT -- Statistical Part-of-Speech Tagging”，其具体的实现思想在这篇文章里描述的很细致，我觉得主要需要注意的几个地方是trigram的平滑算法，未登录词的处理方法（主要是针对英文的），以及柱搜索(beam search)解码算法。

编译citar直接make就可以了，生成三个可执行文件：train,tag,evaluate。

顾名思义，“train”是用来一些必要的文件的，tag则是进行标注的，而evaluate则是用来评价标注结果的。

## 使用演示

下面我们以Brown语料库为例来演示如何使用这三个可执行程序。

关于Brown语料库，我是从NLTK的包中得到的，NLTK提供了两个版本的语料库，一个是纯文本格式，另外一个是XML格式，都进行了词性标注，如果你对NLTK不熟悉，可以

从下面两个链接直接下载这两个语料库：

1、XML格式的brown语料库，带词性标注；

2、普通文本格式的brown语料库，带词性标注；

至于Brown语料库的具体介绍，大家可以参考这个页面：BROWN CORPUS MANUAL。

在这个练习中，我采用的是纯文本格式的brown语料库，但是这些文件是按照类别分布在很多小文件里，并且包含很多空行，所以我处理了一下这个文件，把它们合并到一个大的文件中，并且去除了行首的空格及空行，共得到57340个带词性标注的句子(brown.corpus)。

我们首先对这个语料库进行划分，从中选取前55340句作为训练集(brown.train)，选取剩余的2000句作为测试集(brown.test)，现在我们就来运行这三个命令。

### 首先利用train来训练：

```
../train brown.train brown.lex brown.ngram
```

其中输入文件是训练集brown.train，而输出文件是brown.lex及brown.ngram，如果大家还记着上一节里我也生成了两个前处理文件lex和ngram的话，那么就不难理解这两个文件的内容含义了。

事实上，我当时就是模仿citar的这个预处理思想做得，只是结果文件里的格式稍有不同而已。

### 标注

有了上述两个文件，就可以利用tag进行词性标注了，我们拿citar里的一个示例句子来实验一下：


```
echo "The cat is on the mat ." | ../tag brown.lex brown.ngram
```

得到如下的结果：

```
The/at cat/nn is/bez on/in the/at mat/nn ./.
```

如果对一个没有标注的文件进行标注，可以利用如下的命令：

```
../tag brown.lex brown.ngram < input > output
```

### 评分

最后，我利用evaluate来验证一下基于brown.train训练出来的词性标注器的准确率,在测试集brown.test上进行测试：

```
../evaluate brown.lex brown.ngram brown.test
```

得到如下的结果：

```
Accuracy (known): 0.964621
Accuracy (unknown): 0.740937
Accuracy (overall): 0.956389
```

说明这个词性标注器对于语料库中已存在的词的标注准确率是96.46%，对于未登录词的标注准确率是74.09%，而整体标注准确虑是95.63%。

好了，关于Citar我们就到此为止，有兴趣的读者可以找一些标注好的语料库来试试，包括中文的词性标注语料库，只不过它用于英文的未登录词处理方法对于中文并不合适而已。上面所提到的几个文件，包括处理好的brown.corpus,训练集brown.train,测试集brown.test及中间生成的brown.lex,brown.ngram我已经打包放在了网络硬盘里，可以在如下地址下载：browntest.zip

关于HMM在词性标注中的应用就说完了，再次回头说词性标注时，我会基于其他的模型来作相关的词性标注练习。

# 拓展阅读

晚上读了LDC的语料库自动采集系统（BITS）的论文，感觉其可操作性更大，可以考虑结合Strand的框架设计一个语料库收集工具的新的架构。

关于BITS的架构：

## 第一部分：搜集资源

1. 搜寻候选urls，它讲解的不详，可以考虑strand的方法，并且strand已提供了部分双语候选urls数据库，前期可以考虑直接利用这些数据库；

2. 识别网络语言种类：它使用N-Gram方法训练识别器，不错，可以借鉴；

3. 网页下载：和strand一样，都是利用wget，而wac和bootcat都有相似的方法，可以考虑直接利用；

4. html网页清洗和语言识别：BITS将html转换为纯text格式，linux下有html2text的软件，不过要根据需求进行清洗加工；

## 第二部分：寻找翻译对（重点加难点）

1. 语块识别：利用网页的路径名识别，strand也是利用了这个方法作为初步识别；不过BITS最重要的方法是基于内容的翻译对识别，其实就是利用双语词典，进行相似度计算，算法很简单，真正需要的是训练时间。这个方法的操作性很强，并且从篇章中抽句对齐的方法也可以利用词典，突然感觉基于词典的方法不错！这种方法可以做到初步的篇章，段落，甚至句子对齐。在作者的另一篇文章构建LDC文章中，他又使用了一种 Champollion 的句对齐方法，可以参考。

2. 关于句对齐，经典的是Gale and Church （1991）的基于长度的方法，但是从报告中来看，这种方法对近似语言比较好，对于远距离语言效果不太好，这样利用词典的方法就可以作为一个补充。

3. 同时发现了一个对齐工具箱：MTTK: An Alignment Toolkit for Statistical Machine Translation。它从文本对齐开始训练，可以达到语块对齐，句对齐，短语对齐及词对齐的水平。

还没试用，但是记住：**优秀的程序员写程序，伟大的程序员利用现有的资源。**

## 个人感受

技术是为业务服务的，全部自己实现，有时候返回会浪费时间。

除非你直接用实现赚钱。

视野要足够宽广，国内网站的爬虫+国外的网站爬虫。

# 基础资料

[关于 Brwon 语料库标记集的详细信息可参考](http://www.comp.leeds.ac.uk/amalgam/tagsets/brown.html)

[关于计算所汉语词性标记集的详细信息可参考](http://www.ictclas.org/ictclas_docs_003.html)

# 参考资料

《统计学习方法》，李航

《机器学习》，Tom M.Mitchell

《统计学自然语言处理》

## 词性标注

[代码实现-NLP自然语言处理之HMM词性标注](http://blog.sina.com.cn/s/blog_628cc2b70102wx92.html)

[【NLP】HMM 词性标注&中文分词](https://blog.csdn.net/u013166817/article/details/85805513)

[百度学术-词性标注](http://xueshu.baidu.com/usercenter/paper/show?paperid=85980a687b13fbec1f08dcda1b21cf02&site=xueshu_se)

## blogs

[52nlp-HMM在自然语言处理中的应用一：词性标注1](http://www.52nlp.cn/hmm-application-in-natural-language-processing-one-part-of-speech-tagging-1)

[一种基于HMM的词性标注方法与流程](http://www.xjishu.com/zhuanli/55/201710933336.html)

[隐马尔科夫模型（HMM）与词性标注问题](https://www.cnblogs.com/pinking/p/8531405.html)

[HMM 实现中文词性标注 以及 维特比算法原理](https://blog.csdn.net/amy_mm/article/details/89175135)

* any list
{:toc}