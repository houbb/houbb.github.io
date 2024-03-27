---
layout: post
title:  dl4j doc-03-Deeplearning4j 官方 template 本地测试验证 入门 MINIST 实战测试
date:  2017-04-16 12:03:32 +0800
categories: [Deep Learning]
tags: [AI, DL, dl4j, neural network]
published: true
---


# 快速入门模板

现在您已经学会了如何运行不同的示例，我们为您提供了一个模板，其中包含一个带有简单评估代码的基本MNIST训练器。

快速入门模板可在 https://github.com/eclipse/deeplearning4j-examples/tree/master/mvn-project-template 上找到。

也可以下下载压缩包，然后倒入。

这个项目相对比较简单。

## 备份

或者直接在 [https://github.com/houbb/dl4j-template](https://github.com/houbb/dl4j-template) 下载。

# 整体测试

## 整体的 maven 依赖

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.github.houbb</groupId>
    <artifactId>dl4j-template</artifactId>
    <version>1.0-SNAPSHOT</version>

    <!-- Properties Section. Change ND4J versions here, if required -->
    <properties>
        <dl4j-master.version>1.0.0-M2.1</dl4j-master.version>
        <logback.version>1.2.3</logback.version>
        <java.version>11</java.version>
        <maven-shade-plugin.version>2.4.3</maven-shade-plugin.version>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>


    <dependencies>
        <!-- deeplearning4j-core: contains main functionality and neural networks -->
        <dependency>
            <groupId>org.deeplearning4j</groupId>
            <artifactId>deeplearning4j-core</artifactId>
            <version>${dl4j-master.version}</version>
        </dependency>

        <!--
        ND4J backend: every project needs one of these. The backend defines the hardware on which network training
        will occur. "nd4j-native-platform" is for CPUs only (for running on all operating systems).
        -->
        <dependency>
            <groupId>org.nd4j</groupId>
            <artifactId>nd4j-native</artifactId>
            <version>${dl4j-master.version}</version>
        </dependency>

        <!-- CUDA: to use GPU for training (CUDA) instead of CPU, uncomment this, and remove nd4j-native-platform -->
        <!-- Requires CUDA to be installed to use. Change the version (8.0, 9.0, 9.1) to change the CUDA version -->


        <!-- Optional, but recommended: if you use CUDA, also use CuDNN. To use this, CuDNN must also be installed -->
        <!-- See: https://deeplearning4j.konduit.ai/config/backends/config-cudnn#using-deeplearning-4-j-with-cudnn -->


        <dependency>
            <groupId>ch.qos.logback</groupId>
            <artifactId>logback-classic</artifactId>
            <version>${logback.version}</version>
        </dependency>
    </dependencies>



    <build>
        <plugins>
            <!-- Maven compiler plugin: compile for Java 8 -->
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <version>3.5.1</version>
                <configuration>
                    <source>${java.version}</source>
                    <target>${java.version}</target>
                </configuration>
            </plugin>


            <!--
            Maven shade plugin configuration: this is required so that if you build a single JAR file (an "uber-jar")
            it will contain all the required native libraries, and the backends will work correctly.
            Used for example when running the following commants

            mvn package
            cd target
            java -cp deeplearning4j-examples-1.0.0-beta-bin.jar org.deeplearning4j.LenetMnistExample
            -->
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-shade-plugin</artifactId>
                <version>${maven-shade-plugin.version}</version>
                <configuration>
                    <shadedArtifactAttached>true</shadedArtifactAttached>
                    <shadedClassifierName>bin</shadedClassifierName>
                    <createDependencyReducedPom>true</createDependencyReducedPom>
                    <filters>
                        <filter>
                            <artifact>*:*</artifact>
                            <excludes>
                                <exclude>org/datanucleus/**</exclude>
                                <exclude>META-INF/*.SF</exclude>
                                <exclude>META-INF/*.DSA</exclude>
                                <exclude>META-INF/*.RSA</exclude>
                            </excludes>
                        </filter>
                    </filters>
                </configuration>

                <executions>
                    <execution>
                        <phase>package</phase>
                        <goals>
                            <goal>shade</goal>
                        </goals>
                        <configuration>
                            <transformers>
                                <transformer implementation="org.apache.maven.plugins.shade.resource.AppendingTransformer">
                                    <resource>reference.conf</resource>
                                </transformer>
                                <transformer implementation="org.apache.maven.plugins.shade.resource.ServicesResourceTransformer"/>
                                <transformer implementation="org.apache.maven.plugins.shade.resource.ManifestResourceTransformer">
                                </transformer>
                            </transformers>
                        </configuration>
                    </execution>
                </executions>
            </plugin>
        </plugins>
    </build>


</project>
```

## 完整的 java 代码

```java
package com.github.houbb.dl4j.template;

/*******************************************************************************
 *
 *
 *
 * This program and the accompanying materials are made available under the
 * terms of the Apache License, Version 2.0 which is available at
 * https://www.apache.org/licenses/LICENSE-2.0.
 *  See the NOTICE file distributed with this work for additional
 *  information regarding copyright ownership.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 ******************************************************************************/

import org.datavec.api.io.labels.ParentPathLabelGenerator;
import org.datavec.api.split.FileSplit;
import org.datavec.image.loader.NativeImageLoader;
import org.datavec.image.recordreader.ImageRecordReader;
import org.deeplearning4j.datasets.datavec.RecordReaderDataSetIterator;
import org.deeplearning4j.nn.conf.MultiLayerConfiguration;
import org.deeplearning4j.nn.conf.NeuralNetConfiguration;
import org.deeplearning4j.nn.conf.inputs.InputType;
import org.deeplearning4j.nn.conf.layers.ConvolutionLayer;
import org.deeplearning4j.nn.conf.layers.DenseLayer;
import org.deeplearning4j.nn.conf.layers.OutputLayer;
import org.deeplearning4j.nn.conf.layers.SubsamplingLayer;
import org.deeplearning4j.nn.multilayer.MultiLayerNetwork;
import org.deeplearning4j.nn.weights.WeightInit;
import org.deeplearning4j.optimize.listeners.ScoreIterationListener;
import org.deeplearning4j.util.ModelSerializer;
import org.nd4j.evaluation.classification.Evaluation;
import org.nd4j.linalg.activations.Activation;
import org.nd4j.linalg.dataset.api.iterator.DataSetIterator;
import org.nd4j.linalg.dataset.api.preprocessor.DataNormalization;
import org.nd4j.linalg.dataset.api.preprocessor.ImagePreProcessingScaler;
import org.nd4j.linalg.learning.config.Nesterovs;
import org.nd4j.linalg.lossfunctions.LossFunctions;
import org.nd4j.linalg.schedule.MapSchedule;
import org.nd4j.linalg.schedule.ScheduleType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

/**
 * Implementation of LeNet-5 for handwritten digits image classification on MNIST dataset (99% accuracy)
 * <a href="http://yann.lecun.com/exdb/publis/pdf/lecun-01a.pdf">[LeCun et al., 1998. Gradient based learning applied to document recognition]</a>
 * Some minor changes are made to the architecture like using ReLU and identity activation instead of
 * sigmoid/tanh, max pooling instead of avg pooling and softmax output layer.
 * <p>
 * This example will download 15 Mb of data on the first run.
 *
 * @author hanlon
 * @author agibsonccc
 * @author fvaleri
 * @author dariuszzbyrad
 */
public class LeNetMNISTReLu {
    private static final Logger LOGGER = LoggerFactory.getLogger(LeNetMNISTReLu.class);
    //    private static final String BASE_PATH = System.getProperty("java.io.tmpdir") + "/mnist";

    // 直接文件下载，并且解压到这个路径。
    private static final String BASE_PATH = "C:\\Users\\dh\\.deeplearning4j\\data\\MNIST";

    public static void main(String[] args) throws Exception {
        // 图片高度
        int height = 28;    // height of the picture in px
        // 图片宽度
        int width = 28;     // width of the picture in px
        // 通道 1 表示 黑白
        int channels = 1;   // single channel for grayscale images
        // 可能出现的结果数量 0-9 10个数字
        int outputNum = 10; // 10 digits classification
        // 批处理数量
        int batchSize = 54; // number of samples that will be propagated through the network in each iteration
        // 迭代次数
        int nEpochs = 1;    // number of training epochs
        // 随机数生成器
        int seed = 1234;    // number used to initialize a pseudorandom number generator.
        Random randNumGen = new Random(seed);

        LOGGER.info("Data vectorization...");
        // vectorization of train data
        File trainData = new File(BASE_PATH + "/mnist_png/training");
        FileSplit trainSplit = new FileSplit(trainData, NativeImageLoader.ALLOWED_FORMATS, randNumGen);
        ParentPathLabelGenerator labelMaker = new ParentPathLabelGenerator(); // use parent directory name as the image label
        ImageRecordReader trainRR = new ImageRecordReader(height, width, channels, labelMaker);
        trainRR.initialize(trainSplit);
        // MNIST中的数据
        DataSetIterator trainIter = new RecordReaderDataSetIterator(trainRR, batchSize, 1, outputNum);

        // pixel values from 0-255 to 0-1 (min-max scaling)
        DataNormalization imageScaler = new ImagePreProcessingScaler();
        imageScaler.fit(trainIter);
        trainIter.setPreProcessor(imageScaler);

        // vectorization of test data
        File testData = new File(BASE_PATH + "/mnist_png/testing");
        FileSplit testSplit = new FileSplit(testData, NativeImageLoader.ALLOWED_FORMATS, randNumGen);
        ImageRecordReader testRR = new ImageRecordReader(height, width, channels, labelMaker);
        testRR.initialize(testSplit);
        DataSetIterator testIter = new RecordReaderDataSetIterator(testRR, batchSize, 1, outputNum);
        testIter.setPreProcessor(imageScaler); // same normalization for better results

        LOGGER.info("Network configuration and training...");
        // reduce the learning rate as the number of training epochs increases
        // iteration #, learning rate
        Map<Integer, Double> learningRateSchedule = new HashMap<>();
        learningRateSchedule.put(0, 0.06);
        learningRateSchedule.put(200, 0.05);
        learningRateSchedule.put(600, 0.028);
        learningRateSchedule.put(800, 0.0060);
        learningRateSchedule.put(1000, 0.001);

        MultiLayerConfiguration conf = new NeuralNetConfiguration.Builder()
                .seed(seed)
                .l2(0.0005) // ridge regression value
                .updater(new Nesterovs(new MapSchedule(ScheduleType.ITERATION, learningRateSchedule)))
                .weightInit(WeightInit.XAVIER)
                .list()
                .layer(new ConvolutionLayer.Builder(5, 5)
                        .nIn(channels)
                        .stride(1, 1)
                        .nOut(20)
                        .activation(Activation.IDENTITY)
                        .build())
                .layer(new SubsamplingLayer.Builder(SubsamplingLayer.PoolingType.MAX)
                        .kernelSize(2, 2)
                        .stride(2, 2)
                        .build())
                .layer(new ConvolutionLayer.Builder(5, 5)
                        .stride(1, 1) // nIn need not specified in later layers
                        .nOut(50)
                        .activation(Activation.IDENTITY)
                        .build())
                .layer(new SubsamplingLayer.Builder(SubsamplingLayer.PoolingType.MAX)
                        .kernelSize(2, 2)
                        .stride(2, 2)
                        .build())
                .layer(new DenseLayer.Builder().activation(Activation.RELU)
                        .nOut(500)
                        .build())
                .layer(new OutputLayer.Builder(LossFunctions.LossFunction.NEGATIVELOGLIKELIHOOD)
                        .nOut(outputNum)
                        .activation(Activation.SOFTMAX)
                        .build())
                .setInputType(InputType.convolutionalFlat(height, width, channels)) // InputType.convolutional for normal image
                .build();

        MultiLayerNetwork net = new MultiLayerNetwork(conf);
        net.init();
        net.setListeners(new ScoreIterationListener(10));
        LOGGER.info("Total num of params: {}", net.numParams());

        // evaluation while training (the score should go down)
        for (int i = 0; i < nEpochs; i++) {
            net.fit(trainIter);
            LOGGER.info("Completed epoch {}", i);
            Evaluation eval = net.evaluate(testIter);
            LOGGER.info(eval.stats());

            trainIter.reset();
            testIter.reset();
        }

        File ministModelPath = new File(BASE_PATH + "/minist-model.zip");
        ModelSerializer.writeModel(net, ministModelPath, true);
        LOGGER.info("The MINIST model has been saved in {}", ministModelPath.getPath());
    }
}
```

## 测试

```
c.g.h.d.t.LeNetMNISTReLu - Data vectorization...
o.d.i.r.BaseImageRecordReader - ImageRecordReader: 10 label classes inferred using label generator ParentPathLabelGenerator
o.d.i.r.BaseImageRecordReader - ImageRecordReader: 10 label classes inferred using label generator ParentPathLabelGenerator
c.g.h.d.t.LeNetMNISTReLu - Network configuration and training...
o.n.l.f.Nd4jBackend - Loaded [CpuBackend] backend
o.n.n.NativeOpsHolder - Number of threads used for linear algebra: 12
o.n.l.c.n.CpuNDArrayFactory - Binary level Generic x86 optimization level AVX/AVX2
o.n.n.Nd4jBlas - Number of threads used for OpenMP BLAS: 12
o.n.l.a.o.e.DefaultOpExecutioner - Backend used: [CPU]; OS: [Windows 11]
o.n.l.a.o.e.DefaultOpExecutioner - Cores: [16]; Memory: [3.9GB];
o.n.l.a.o.e.DefaultOpExecutioner - Blas vendor: [OPENBLAS]
o.n.l.c.n.CpuBackend - Backend build information:
 GCC: "12.1.0"
STD version: 201103L
DEFAULT_ENGINE: samediff::ENGINE_CPU
HAVE_FLATBUFFERS
HAVE_OPENBLAS
o.d.n.m.MultiLayerNetwork - Starting MultiLayerNetwork with WorkspaceModes set to [training: ENABLED; inference: ENABLED], cacheMode set to [NONE]
c.g.h.d.t.LeNetMNISTReLu - Total num of params: 431080
o.d.o.l.ScoreIterationListener - Score at iteration 0 is 2.502639936559319
....
o.d.o.l.ScoreIterationListener - Score at iteration 1110 is 0.1872431450436695
c.g.h.d.t.LeNetMNISTReLu - Completed epoch 0
c.g.h.d.t.LeNetMNISTReLu - 

========================Evaluation Metrics========================
 # of classes:    10
 Accuracy:        0.9892
 Precision:       0.9891
 Recall:          0.9892
 F1 Score:        0.9891
Precision, recall & F1: macro-averaged (equally weighted avg. of 10 classes)


=========================Confusion Matrix=========================
    0    1    2    3    4    5    6    7    8    9
---------------------------------------------------
  972    0    0    0    0    0    0    3    3    2 | 0 = 0
    0 1128    0    3    0    2    1    1    0    0 | 1 = 1
    1    1 1018    2    1    0    0    5    4    0 | 2 = 2
    0    0    1 1002    0    3    0    3    1    0 | 3 = 3
    0    0    2    0  972    0    3    1    1    3 | 4 = 4
    2    0    1    3    0  883    1    1    1    0 | 5 = 5
    5    2    0    0    2    4  945    0    0    0 | 6 = 6
    0    1    6    1    0    0    0 1014    1    5 | 7 = 7
    1    0    1    1    0    2    0    0  964    5 | 8 = 8
    0    2    0    4    6    2    0    0    1  994 | 9 = 9

Confusion matrix format: Actual (rowClass) predicted as (columnClass) N times
==================================================================
c.g.h.d.t.LeNetMNISTReLu - The MINIST model has been saved in C:\Users\dh\.deeplearning4j\data\MNIST\minist-model.zip
```

这里把训练的模型，放在 `C:\Users\dh\.deeplearning4j\data\MNIST\minist-model.zip`


这个结果是对模型性能进行评估的指标，针对一个分类问题，通常使用准确率（Accuracy）、精确率（Precision）、召回率（Recall）、F1分数（F1 Score）等指标来评价模型的性能。

- **Accuracy（准确率）：** 是指分类正确的样本数占总样本数的比例。在这个结果中，准确率为0.9892，表示模型对测试数据中的样本进行分类的准确率为98.92%。

- **Precision（精确率）：** 是指模型预测为正例的样本中，真正为正例的比例。在这个结果中，精确率为0.9891，表示模型在预测正例时的准确率为98.91%。

- **Recall（召回率）：** 是指所有真正为正例的样本中，模型成功预测为正例的比例。在这个结果中，召回率为0.9892，表示模型对于真正为正例的样本，成功预测为正例的比例为98.92%。

- **F1 Score（F1分数）：** 是精确率和召回率的调和平均数，用于综合评价模型的性能。在这个结果中，F1分数为0.9891，表示模型的综合性能为98.91%。

最后一行是指标的平均值，其中Precision, recall & F1: macro-averaged 表示精确率、召回率和F1分数采用宏平均（macro-averaged）计算方式，即对每个类别的指标进行计算后取平均值。


这个是混淆矩阵（Confusion Matrix），用于评估分类模型的性能，特别是在多类别分类问题中。

它展示了模型在每个类别上的分类情况，帮助我们了解模型在不同类别上的预测表现。

混淆矩阵的行表示实际类别（Actual），列表示模型预测的类别（Predicted）。

每个单元格中的数字表示模型将属于实际类别的样本预测为属于预测类别的次数。

在这个例子中：

- 第一行表示实际类别为0的样本。模型将972个实际为0的样本正确预测为0，将3个实际为0的样本错误预测为7，将3个实际为0的样本错误预测为8，将2个实际为0的样本错误预测为9，没有将实际为0的样本错误预测为其他类别。

- 第一列表示模型预测为0的样本。模型将0预测为0的样本有972次，将1预测为0的样本有0次，将2预测为0的样本有1次，依次类推。

最后一列中的数字表示每个类别的实际样本数目。

混淆矩阵是评估模型性能的重要工具，可以通过混淆矩阵计算准确率、精确率、召回率、F1分数等指标。

## 测试验证

```java
package com.github.houbb.dl4j.template;

import org.datavec.image.loader.NativeImageLoader;
import org.deeplearning4j.nn.multilayer.MultiLayerNetwork;
import org.nd4j.linalg.api.ndarray.INDArray;
import org.nd4j.linalg.dataset.api.preprocessor.DataNormalization;
import org.nd4j.linalg.dataset.api.preprocessor.ImagePreProcessingScaler;

import java.io.File;
import java.io.IOException;

/**
 * @description:
 * @author: Mr.Fang
 * @create: 2023-07-14 15:06
 **/

public class VerifyMNSIT {

    public static void main(String[] args) throws IOException {

        // 加载训练好的模型
        File modelFile = new File("C:\\Users\\dh\\.deeplearning4j\\data\\MNIST\\minist-model.zip");
        MultiLayerNetwork model = MultiLayerNetwork.load(modelFile, true);

        // 加载待验证的图像
        File imageFile = new File("C:\\Users\\dh\\.deeplearning4j\\data\\MNIST\\mnist_png\\testing\\0\\3.png");

        //在这个例子中，图像被调整为28x28像素的大小，并且是单通道的灰度图像。NativeImageLoader是DL4J中用于加载本地图像文件的工具类。
        NativeImageLoader loader = new NativeImageLoader(28, 28, 1);
        // 使用NativeImageLoader加载图像文件并将其转换为INDArray对象。INDArray是DL4J中用于表示多维数组的数据结构。在这里，图像文件被转换成了一个INDArray对象，表示了图像的像素值。
        INDArray image = loader.asMatrix(imageFile);
        // 用于对图像进行数据归一化处理。是DL4J中用于对图像进行预处理的类，它将图像的像素值缩放到指定的范围内。在这个例子中，将像素值缩放到0到1之间。
        DataNormalization scaler = new ImagePreProcessingScaler(0, 1);
        // 对加载的图像数据进行归一化处理。这一步将之前加载的图像数据INDArray对象应用了归一化处理，使得图像的像素值在0到1之间。
        scaler.transform(image);

        // 对图像进行预测
        INDArray output = model.output(image);
        int predictedLabel = output.argMax().getInt();
        // 在这行代码中，`output.argMax()`用于找到`output`中具有最大值的索引。`output`是一个包含模型的输出概率的NDArray对象。对于MNIST模型，输出是一个长度为10的向量，表示数字0到9的概率分布。
        //
        //`.argMax()`方法返回具有最大值的索引。例如，如果`output`的值为[0.1, 0.3, 0.2, 0.05, 0.25, 0.05, 0.05, 0.1, 0.05, 0.05]，则`.argMax()`将返回索引1，因为在位置1处的值0.3是最大的。
        //
        //最后，`.getInt()`方法将获取`.argMax()`的结果并将其转换为一个整数，表示预测的标签。在这个例子中，`predictedLabel`将包含模型预测的数字标签。
        //
        //简而言之，这行代码的作用是找到输出中概率最高的数字标签，以进行预测。
        System.out.println("Predicted label: " + predictedLabel);
    }
}
```

输出结果：

```
o.n.l.f.Nd4jBackend - Loaded [CpuBackend] backend
o.n.n.NativeOpsHolder - Number of threads used for linear algebra: 12
o.n.l.c.n.CpuNDArrayFactory - Binary level Generic x86 optimization level AVX/AVX2
o.n.n.Nd4jBlas - Number of threads used for OpenMP BLAS: 12
o.n.l.a.o.e.DefaultOpExecutioner - Backend used: [CPU]; OS: [Windows 11]
o.n.l.a.o.e.DefaultOpExecutioner - Cores: [16]; Memory: [3.9GB];
o.n.l.a.o.e.DefaultOpExecutioner - Blas vendor: [OPENBLAS]
o.n.l.c.n.CpuBackend - Backend build information:
 GCC: "12.1.0"
STD version: 201103L
DEFAULT_ENGINE: samediff::ENGINE_CPU
HAVE_FLATBUFFERS
HAVE_OPENBLAS
o.d.n.m.MultiLayerNetwork - Starting MultiLayerNetwork with WorkspaceModes set to [training: ENABLED; inference: ENABLED], cacheMode set to [NONE]
Predicted label: 0
```

# 泛化能力测试

发现这个模型测试测试集合，正确率比较高。

但是测试随便的一个图片正确率很低。

一个原因是原来的训练数据是黑底白字。

# 报错

## 1. jdk 版本

运行官方的 template 报错：

```
java: 无法访问org.deeplearning4j.datasets.iterator.impl.MnistDataSetIterator
  错误的类文件: /C:/Users/dh/.m2/repository/org/deeplearning4j/deeplearning4j-datasets/1.0.0-M2.1/deeplearning4j-datasets-1.0.0-M2.1.jar!/org/deeplearning4j/datasets/iterator/impl/MnistDataSetIterator.class
    类文件具有错误的版本 55.0, 应为 52.0
    请删除该文件或确保该文件位于正确的类路径子目录中。
```

### 错误原因

这个错误表明你的Java版本与你使用的DeepLearning4J库编译的Java版本不匹配。错误消息中提到类文件的版本是55.0，这意味着它是使用Java 11编译的，而你的项目可能在Java 8或更早版本上运行。

解决这个问题的方法之一是确保你的项目使用与DeepLearning4J编译时相同版本的Java。

你可以通过以下步骤之一来解决这个问题：

1. **升级Java版本：** 将你的项目升级到Java 11或更高版本。这样做可能需要更新你的开发环境和构建工具以支持新的Java版本。

2. **降级DeepLearning4J版本：** 使用与你当前Java版本兼容的DeepLearning4J版本。你可以尝试在`pom.xml`中使用较旧的DeepLearning4J版本。你可以尝试更改`deeplearning4j-datasets`依赖的版本，例如：

```xml
<dependency>
    <groupId>org.deeplearning4j</groupId>
    <artifactId>deeplearning4j-datasets</artifactId>
    <version>1.0.0-M1</version>
</dependency>
```

3. **设置Java编译器版本：** 如果你使用的是Maven或Gradle等构建工具，你可以尝试在项目配置中指定编译器版本。例如，对于Maven项目，在`pom.xml`中添加以下配置：

```xml
<properties>
    <maven.compiler.source>1.8</maven.compiler.source>
    <maven.compiler.target>1.8</maven.compiler.target>
</properties>
```

这将指定使用Java 8编译器进行编译，与DeepLearning4J编译的Java版本匹配。

根据你的实际情况选择其中一种方法来解决问题。

这里选择的升级 jdk 版本到 jdk11。

## 报错2-文件不存在

```
c.g.h.d.t.LeNetMNIST - Load data....
o.n.c.r.Downloader - Error extracting train-images-idx3-ubyte.gz files from file C:\Users\dh\.deeplearning4j\train-images-idx3-ubyte.gz - retrying...
java.io.EOFException: Unexpected end of ZLIB input stream
	at java.base/java.util.zip.InflaterInputStream.fill(InflaterInputStream.java:245)
	at java.base/java.util.zip.InflaterInputStream.read(InflaterInputStream.java:159)
	at java.base/java.util.zip.GZIPInputStream.read(GZIPInputStream.java:118)
	at java.base/java.io.FilterInputStream.read(FilterInputStream.java:107)
	at org.apache.commons.io.IOUtils.copyLarge(IOUtils.java:1127)
```

### 解决方式1

默认的路径：

```java
System.out.println(DL4JResources.getDirectory(ResourceType.DATASET, "MNIST").getAbsolutePath());
```

结果未：

```
C:\Users\dh\.deeplearning4j\data\MNIST
```


把下载的 minst 文件放在这个文件夹下面, 并且解压：

```
 C:\Users\dh\.deeplearning4j\data\MNIST\mnist_png 的目录

2015/12/11  08:55    <DIR>          .
2024/03/27  16:06    <DIR>          ..
2015/12/11  08:55    <DIR>          testing
2015/12/11  08:55    <DIR>          training
```

traning 对应训练数据集

testing 对应测试数据集

### 解决方式2（未验证）

在Windows环境下，你可以从以下位置获取MNIST数据集：

1. **训练数据集：** 你可以从[官方网站](http://yann.lecun.com/exdb/mnist/)下载训练图像和标签数据集，然后将它们放在你的项目目录中的一个文件夹中。

2. **测试数据集：** 同样，你也可以从相同的官方网站下载测试图像和标签数据集，然后将它们放在另一个文件夹中。

在你的代码中，你可以指定这些文件的路径。假设你将训练和测试数据集放在项目目录下的名为`data`的文件夹中，你可以这样加载数据集：

```java
String trainDataPath = "data/train-images.idx3-ubyte"; // 训练图像数据文件路径
String trainLabelsPath = "data/train-labels.idx1-ubyte"; // 训练标签数据文件路径
String testDataPath = "data/t10k-images.idx3-ubyte"; // 测试图像数据文件路径
String testLabelsPath = "data/t10k-labels.idx1-ubyte"; // 测试标签数据文件路径

/*
    Create an iterator using the batch size for one iteration
*/
log.info("Load data....");
DataSetIterator mnistTrain = new MnistDataSetIterator(batchSize, true, 12345,
        new MnistDataSetIterator.Builder()
                .useNormalizedData(true)
                .trainFilePath(trainDataPath)
                .labelsFilePath(trainLabelsPath)
                .build());
DataSetIterator mnistTest = new MnistDataSetIterator(batchSize, false, 12345,
        new MnistDataSetIterator.Builder()
                .useNormalizedData(true)
                .testFilePath(testDataPath)
                .labelsFilePath(testLabelsPath)
                .build());
```

在这个例子中，`trainDataPath`和`trainLabelsPath`分别是训练图像和标签数据文件的路径，`testDataPath`和`testLabelsPath`分别是测试图像和标签数据文件的路径。请确保替换这些路径为你实际存放数据集的路径。

MNIST数据集是公开可用的，无需账户或注册即可下载。你可以通过以下链接访问官方网站来获取MNIST数据集：[http://yann.lecun.com/exdb/mnist/](http://yann.lecun.com/exdb/mnist/)

在该网站上，你会找到MNIST数据集的各个部分的直接链接，可以通过点击这些链接来下载数据集。例如，你可以下载训练图像、训练标签、测试图像和测试标签数据集。

# 参考资料

[DL4J无法下载MNIST数据集解决 Server returned HTTP response code: 403 for URL解决方法](https://blog.csdn.net/m0_46948660/article/details/134167829)

MNIST数据下载地址: http://github.com/myleott/mnist_png/raw/master/mnist_png.tar.gz

GitHub示例地址: https://github.com/deeplearning4j/deeplearning4j-examples/blob/master/dl4j-examples/src/main/java/org/deeplearning4j/examples/quickstart/modeling/convolution/LeNetMNISTReLu.java


# 参考资料

https://deeplearning4j.konduit.ai/multi-project/tutorials/quickstart


* any list
{:toc}
