---
layout: post
title:  DL4j-08-Deep Auto Encoder
date:  2017-11-30 21:07:44 +0800
categories: [Deep Learning]
tags: [AI, DL, dl4j, neural network]
header-img: "static/app/res/img/kon-bg.jpeg"
published: true
---


# 深度自动编码器

深度自动编码器由两个对称的[深度置信网络](https://deeplearning4j.org/cn/deepbeliefnetwork.html)组成，
其中一个深度置信网络通常有四到五个浅层，构成负责编码的部分，另一个四到五层的网络则是解码部分。

这些层都是[受限玻尔兹曼机（RBM）](https://deeplearning4j.org/cn/restrictedboltzmannmachine.html)，即构成深度置信网络的基本单元，
它们有一些特殊之处，我们将在下文中介绍。以下是简化的深度自动编码器架构示意图，下文会作具体说明。

![2017-11-30-deep-autoencoder.png](https://raw.githubusercontent.com/houbb/resource/master/img/DL/autoencoder/2017-11-30-deep-autoencoder.png)

这种算法的大致思想是：

将神经网络的隐含层看成是一个编码器和解码器，输入数据经过隐含层的编码和解码，到达输出层时，确保输出的结果尽量与输入数据保持一致。
也就是说，隐含层是尽量保证输出数据等于输入数据的。  

这样做的一个好处是，**隐含层能够抓住输入数据的特点，使其特征保持不变**。

例如，假设输入层有100个神经元，隐含层只有50个神经元，输出层有100个神经元，通过自动编码器算法，
我们只用隐含层的50个神经元就找到了100个输入层数据的特点，能够保证输出数据和输入数据大致一致，就大大降低了隐含层的维度。


# 编码


让我们用以下的示例来描绘一个编码器的大致结构：

```
784 (输入) ----> 1000 ----> 500 ----> 250 ----> 100 -----> 30
```

假设进入网络的输入是784个像素（MNIST数据集中28 x 28像素的图像），那么深度自动编码器的第一层应当有1000个参数，即相对较大。

这可能会显得有违常理，因为参数多于输入往往会导致神经网络过拟合。

在这个例子当中， 增加参数从某种意义上来看也就是增加输入本身的特征，而这将使经过自动编码的数据最终能被解码。

其原因在于每个层中用于变换的 sigmoid 置信单元的表示能力。sigmoid 置信单元无法表示与实数数据等量的信息和差异，而补偿方法之一就是扩张第一个层。

各个层将分别有1000、500、250、100个节点，直至网络最终生成一个30个数值长的向量。这一30个数值的向量是深度自动编码器负责预定型的前半部分的最后一层，
由一个普通的RBM生成，而不是一个通常会出现在深度置信网络末端的 Softmax 或逻辑回归分类输出层。


# 解码

这 30 个数值是 28 x 28 像素图像被编码后的版本。深度自动编码器的后半部分会学习如何解码这一压缩后的向量，将其作为输入一步步还原。

深度自动编码器的解码部分是一个前馈网络，它的各个层分别有 100、250、500 和 1000 个节点。 层的权重以随机方式初始化。

# 定型细节

在解码器的反向传播阶段，学习速率应当降低，减慢速度：大约取在1e-3和1e-6之间，具体取决于处理的是二进制数据还是连续数据（分别对应区间的两端）。


# 应用案例

## 图像搜索

如上文所述，深度自动编码器可以将图像压缩为30个数值的向量。

因此图像搜索的过程就变成：上传图像，搜索引擎将图像压缩为30个数值，然后将这个向量与索引中的所有其他向量进行比较。

包含相似数值的向量将被返回，再转换为与之匹配的图像，成为搜索查询的结果。


## 数据压缩

图像压缩更广泛的应用是**数据压缩**。正如 [Geoff Hinton](https://www.cs.utoronto.ca/~rsalakhu/papers/semantic_final.pdf) 在这篇论文中所述，深度自动编码器可用于语义哈希。


## 主题建模和信息检索（IR）

深度自动编码器可用于主题建模，即以统计学方式对分布于一个文档集合中的抽象主题建模。

这是沃森等问答系统的一个重要环节。

简而言之，集合中的每篇文档会被转换为一个词袋（即一组词频），而这些词频会被缩放为0到1之间的小数，可以视之为词在文档中出现的概率。

缩放后的词频被输入由受限玻尔兹曼机堆叠构成的深度置信网络，而受限玻尔兹曼机本身就是一种前馈式反向传播自动编码器。这些深度置信网络（DBN）通过一系列sigmoid变换将文档映射至特征空间，从而把每篇文档压缩为10个数值。

每篇文档的数值组，即向量会被引入同一个向量空间，测量它到其他各个文档向量的距离。彼此接近的文档向量大致上可以归为同一个主题。

例如，一篇文档可能是“问题”，而其他的文档可能是“回答”，软件可以通过在向量空间中测量距离来完成这样的匹配。



# Example

> [DeepAutoEncoderExample.java](https://github.com/deeplearning4j/dl4j-examples/blob/master/dl4j-examples/src/main/java/org/deeplearning4j/examples/unsupervised/deepbelief/DeepAutoEncoderExample.java)



- code

```java
public class DeepAutoEncoderExample {

    private static Logger log = LoggerFactory.getLogger(DeepAutoEncoderExample.class);

    public static void main(String[] args) throws Exception {
        final int numRows = 28;
        final int numColumns = 28;
        int seed = 123;
        int numSamples = MnistDataFetcher.NUM_EXAMPLES;
        int batchSize = 1000;
        int iterations = 1;
        int listenerFreq = iterations/5;

        log.info("Load data....");
        DataSetIterator iter = new MnistDataSetIterator(batchSize,numSamples,true);

        log.info("Build model....");
        MultiLayerConfiguration conf = new NeuralNetConfiguration.Builder()
                .seed(seed)
                .iterations(iterations)
                .optimizationAlgo(OptimizationAlgorithm.LINE_GRADIENT_DESCENT)
                .list()
                .layer(0, new RBM.Builder().nIn(numRows * numColumns).nOut(1000).lossFunction(LossFunctions.LossFunction.KL_DIVERGENCE).build())
                .layer(1, new RBM.Builder().nIn(1000).nOut(500).lossFunction(LossFunctions.LossFunction.KL_DIVERGENCE).build())
                .layer(2, new RBM.Builder().nIn(500).nOut(250).lossFunction(LossFunctions.LossFunction.KL_DIVERGENCE).build())
                .layer(3, new RBM.Builder().nIn(250).nOut(100).lossFunction(LossFunctions.LossFunction.KL_DIVERGENCE).build())
                .layer(4, new RBM.Builder().nIn(100).nOut(30).lossFunction(LossFunctions.LossFunction.KL_DIVERGENCE).build()) //encoding stops
                .layer(5, new RBM.Builder().nIn(30).nOut(100).lossFunction(LossFunctions.LossFunction.KL_DIVERGENCE).build()) //decoding starts
                .layer(6, new RBM.Builder().nIn(100).nOut(250).lossFunction(LossFunctions.LossFunction.KL_DIVERGENCE).build())
                .layer(7, new RBM.Builder().nIn(250).nOut(500).lossFunction(LossFunctions.LossFunction.KL_DIVERGENCE).build())
                .layer(8, new RBM.Builder().nIn(500).nOut(1000).lossFunction(LossFunctions.LossFunction.KL_DIVERGENCE).build())
                .layer(9, new OutputLayer.Builder(LossFunctions.LossFunction.MSE).activation(Activation.SIGMOID).nIn(1000).nOut(numRows*numColumns).build())
                .pretrain(true).backprop(true)
                .build();

        MultiLayerNetwork model = new MultiLayerNetwork(conf);
        model.init();

        model.setListeners(new ScoreIterationListener(listenerFreq));

        log.info("Train model....");
        while(iter.hasNext()) {
            DataSet next = iter.next();
            model.fit(new DataSet(next.getFeatureMatrix(),next.getFeatureMatrix()));
        }

    }

}
```

- log

```
o.d.e.u.d.DeepAutoEncoderExample - Load data....
o.d.e.u.d.DeepAutoEncoderExample - Build model....
o.n.l.f.Nd4jBackend - Loaded [CpuBackend] backend
o.n.n.NativeOpsHolder - Number of threads used for NativeOps: 4
o.n.n.Nd4jBlas - Number of threads used for BLAS: 4
o.n.l.a.o.e.DefaultOpExecutioner - Backend used: [CPU]; OS: [Mac OS X]
o.n.l.a.o.e.DefaultOpExecutioner - Cores: [8]; Memory: [3.6GB];
o.n.l.a.o.e.DefaultOpExecutioner - Blas vendor: [OPENBLAS]
o.d.n.m.MultiLayerNetwork - Starting MultiLayerNetwork with WorkspaceModes set to [training: NONE; inference: SEPARATE]
o.d.e.u.d.DeepAutoEncoderExample - Train model....
o.d.o.l.ScoreIterationListener - Score at iteration 0 is 63.2408125
...
o.d.o.l.ScoreIterationListener - Score at iteration 599 is 0.22896193399234693

Process finished with exit code 0
```



* any list
{:toc}