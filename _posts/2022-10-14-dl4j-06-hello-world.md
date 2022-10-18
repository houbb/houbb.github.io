---
layout: post
title: DeepLearning4j-06-Hello world 入门教程
date:  2022-10-14 09:22:02 +0800
categories: [AI]
tags: [ai, dl4j, ml, sh]
published: true
---

# 入门

深度学习的入门例子。

## 准备工作

maven 3+

jdk11 安装。

ps: 官方给定的 demo，依赖的 jar 是 11 的版本。所以需要安装 jdk11。

## pom.xml

引入对应的 maven 包。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <!-- Group-ID, artifact ID and version of the project. You can modify these as you want -->
    <groupId>org.deeplearning4j</groupId>
    <artifactId>deeplearning4j-example-sample</artifactId>
    <version>1.0.0-M2</version>

    <!-- Properties Section. Change ND4J versions here, if required -->
    <properties>
        <dl4j-master.version>1.0.0-M2.1</dl4j-master.version>
        <logback.version>1.2.3</logback.version>
        <java.version>1.8</java.version>
        <maven-shade-plugin.version>2.4.3</maven-shade-plugin.version>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>


    <dependencies>
        <dependency>
            <groupId>org.deeplearning4j</groupId>
            <artifactId>deeplearning4j-core</artifactId>
            <version>${dl4j-master.version}</version>
        </dependency>

        <dependency>
            <groupId>org.nd4j</groupId>
            <artifactId>nd4j-native</artifactId>
            <version>${dl4j-master.version}</version>
            <classifier>windows-x86_64-avx2</classifier>
        </dependency>

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

## logback.xml

日志文件的配置：

```xml
<configuration>
    <appender name="FILE" class="ch.qos.logback.core.FileAppender">
        <file>logs/application.log</file>
        <encoder>
            <pattern>%date - [%level] - from %logger in %thread
                %n%message%n%xException%n</pattern>
        </encoder>
    </appender>

    <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern> %logger{15} - %message%n%xException{5}
            </pattern>
        </encoder>
    </appender>

    <logger name="org.deeplearning4j" level="INFO" />
    <logger name="org.datavec" level="INFO" />
    <logger name="org.nd4j" level="INFO" />



    <root level="ERROR">
        <appender-ref ref="STDOUT" />
        <appender-ref ref="FILE" />
    </root>

</configuration>
```

## 入门代码

- LeNetMNIST.java

手写数字的测试。

```java
package org.deeplearning4j.examples.sample;

import org.apache.commons.io.FilenameUtils;
import org.bytedeco.javacpp.Loader;
import org.deeplearning4j.datasets.iterator.impl.MnistDataSetIterator;
import org.deeplearning4j.nn.conf.MultiLayerConfiguration;
import org.deeplearning4j.nn.conf.NeuralNetConfiguration;
import org.deeplearning4j.nn.conf.inputs.InputType;
import org.deeplearning4j.nn.conf.layers.*;
import org.deeplearning4j.nn.multilayer.MultiLayerNetwork;
import org.deeplearning4j.nn.weights.WeightInit;
import org.deeplearning4j.optimize.api.InvocationType;
import org.deeplearning4j.optimize.listeners.EvaluativeListener;
import org.deeplearning4j.optimize.listeners.ScoreIterationListener;
import org.nd4j.linalg.activations.Activation;
import org.nd4j.linalg.cpu.nativecpu.bindings.Nd4jCpu;
import org.nd4j.linalg.dataset.api.iterator.DataSetIterator;
import org.nd4j.linalg.learning.config.Adam;
import org.nd4j.linalg.lossfunctions.LossFunctions;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;

/**
 * Created by agibsonccc on 9/16/15.
 *
 * 为啥启动报错：
 *
 * https://blog.csdn.net/svenhuayuncheng/article/details/79073883
 */
public class LeNetMNIST {
    private static final Logger log = LoggerFactory.getLogger(LeNetMNIST.class);

    public static void main(String[] args) throws Exception {

        try {
            Loader.load(Nd4jCpu.class);
        } catch (UnsatisfiedLinkError e) {
            String path = Loader.cacheResource(Nd4jCpu.class, "windows-x86_64/jniNd4jCpu.dll").getPath();
            new ProcessBuilder("c:/path/to/depends.exe", path).start().waitFor();
        }

        int nChannels = 1; // Number of input channels
        int outputNum = 10; // The number of possible outcomes
        int batchSize = 64; // Test batch size
        int nEpochs = 1; // Number of training epochs
        int seed = 123; //

        /*
            Create an iterator using the batch size for one iteration
         */
        log.info("Load data....");
        DataSetIterator mnistTrain = new MnistDataSetIterator(batchSize,true,12345);
        DataSetIterator mnistTest = new MnistDataSetIterator(batchSize,false,12345);

        /*
            Construct the neural network
         */
        log.info("Build model....");

        MultiLayerConfiguration conf = new NeuralNetConfiguration.Builder()
                .seed(seed)
                .l2(0.0005)
                .weightInit(WeightInit.XAVIER)
                .updater(new Adam(1e-3))
                .list()
                .layer(new ConvolutionLayer.Builder(5, 5)
                        //nIn and nOut specify depth. nIn here is the nChannels and nOut is the number of filters to be applied
                        .nIn(nChannels)
                        .stride(1,1)
                        .nOut(20)
                        .activation(Activation.IDENTITY)
                        .build())
                .layer(new SubsamplingLayer.Builder(PoolingType.MAX)
                        .kernelSize(2,2)
                        .stride(2,2)
                        .build())
                .layer(new ConvolutionLayer.Builder(5, 5)
                        //Note that nIn need not be specified in later layers
                        .stride(1,1)
                        .nOut(50)
                        .activation(Activation.IDENTITY)
                        .build())
                .layer(new SubsamplingLayer.Builder(PoolingType.MAX)
                        .kernelSize(2,2)
                        .stride(2,2)
                        .build())
                .layer(new DenseLayer.Builder().activation(Activation.RELU)
                        .nOut(500).build())
                .layer(new OutputLayer.Builder(LossFunctions.LossFunction.NEGATIVELOGLIKELIHOOD)
                        .nOut(outputNum)
                        .activation(Activation.SOFTMAX)
                        .build())
                .setInputType(InputType.convolutionalFlat(28,28,1)) //See note below
                .build();

        /*
        Regarding the .setInputType(InputType.convolutionalFlat(28,28,1)) line: This does a few things.
        (a) It adds preprocessors, which handle things like the transition between the convolutional/subsampling layers
            and the dense layer
        (b) Does some additional configuration validation
        (c) Where necessary, sets the nIn (number of input neurons, or input depth in the case of CNNs) values for each
            layer based on the size of the previous layer (but it won't override values manually set by the user)

        InputTypes can be used with other layer types too (RNNs, MLPs etc) not just CNNs.
        For normal images (when using ImageRecordReader) use InputType.convolutional(height,width,depth).
        MNIST record reader is a special case, that outputs 28x28 pixel grayscale (nChannels=1) images, in a "flattened"
        row vector format (i.e., 1x784 vectors), hence the "convolutionalFlat" input type used here.
        */

        MultiLayerNetwork model = new MultiLayerNetwork(conf);
        model.init();

        log.info("Train model...");
        model.setListeners(new ScoreIterationListener(10), new EvaluativeListener(mnistTest, 1, InvocationType.EPOCH_END)); //Print score every 10 iterations and evaluate on test set every epoch
        model.fit(mnistTrain, nEpochs);

        String path = FilenameUtils.concat(System.getProperty("java.io.tmpdir"), "lenetmnist.zip");

        log.info("Saving model to tmp folder: "+path);
        model.save(new File(path), true);

        log.info("****************Example finished********************");
    }
}
```

### windows 启动报错问题

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

官方文档：[using-dependency-walker](https://github.com/bytedeco/javacpp-presets/wiki/Debugging-UnsatisfiedLinkError-on-Windows#using-dependency-walker)

#### 原因

该问题是由于操作系统无法加载某些必要的类库导致。

#### 解决方式

这里可以使用Dependency Walker来解决问题。

1、 首先下载类库：[Dependency Walker 2.2 for x64](http://www.dependencywalker.com/depends22_x64.zip)，并解压。

2、 引入类包：

```java
import org.bytedeco.javacpp.Loader;
import org.nd4j.nativeblas.Nd4jCpu;
```

3、在 main() 方法之前，或者在初始化对象之前，插入以下代码。

```java
try {
    Loader.load(Nd4jCpu.class);
} catch (UnsatisfiedLinkError e) {
    String path = Loader.cacheResource(Nd4jCpu.class, "windows-x86_64/jniNd4jCpu.dll").getPath();
    new ProcessBuilder("c:/path/to/depends.exe", path).start().waitFor();
}
```

ps: "c:/path/to/depends.exe" 是我本地存储的地址，可以根据自己的位置修改。


## 启动日志

直接运行 main，日志如下：

```
o.d.e.s.LeNetMNIST - Load data....
o.d.e.s.LeNetMNIST - Build model....
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
o.d.e.s.LeNetMNIST - Train model...
o.d.o.l.ScoreIterationListener - Score at iteration 0 is 2.4743150434186543
o.d.o.l.ScoreIterationListener - Score at iteration 10 is 1.1818027856870121
o.d.o.l.ScoreIterationListener - Score at iteration 20 is 0.5705571103633293
o.d.o.l.ScoreIterationListener - Score at iteration 30 is 0.6281973756740101
o.d.o.l.ScoreIterationListener - Score at iteration 40 is 0.42112611437444736
o.d.o.l.ScoreIterationListener - Score at iteration 50 is 0.4008099047571695
o.d.o.l.ScoreIterationListener - Score at iteration 60 is 0.5216449826506526
o.d.o.l.ScoreIterationListener - Score at iteration 70 is 0.46064872620354924
o.d.o.l.ScoreIterationListener - Score at iteration 80 is 0.37945662023275634
o.d.o.l.ScoreIterationListener - Score at iteration 90 is 0.2886434107942748
o.d.o.l.ScoreIterationListener - Score at iteration 100 is 0.47475979636611143
o.d.o.l.ScoreIterationListener - Score at iteration 110 is 0.29471433202716646
o.d.o.l.ScoreIterationListener - Score at iteration 120 is 0.18219162758148033
o.d.o.l.ScoreIterationListener - Score at iteration 130 is 0.39608426880414527
o.d.o.l.ScoreIterationListener - Score at iteration 140 is 0.31713815684827235
o.d.o.l.ScoreIterationListener - Score at iteration 150 is 0.3065815953249406
o.d.o.l.ScoreIterationListener - Score at iteration 160 is 0.3274653795528
o.d.o.l.ScoreIterationListener - Score at iteration 170 is 0.25758795818864233
o.d.o.l.ScoreIterationListener - Score at iteration 180 is 0.30814531898187436
o.d.o.l.ScoreIterationListener - Score at iteration 190 is 0.20500374258795923
o.d.o.l.ScoreIterationListener - Score at iteration 200 is 0.2294096584338096
o.d.o.l.ScoreIterationListener - Score at iteration 210 is 0.19561414086208564
o.d.o.l.ScoreIterationListener - Score at iteration 220 is 0.287958870913971
o.d.o.l.ScoreIterationListener - Score at iteration 230 is 0.28474479804042513
o.d.o.l.ScoreIterationListener - Score at iteration 240 is 0.21070656087069745
o.d.o.l.ScoreIterationListener - Score at iteration 250 is 0.3322749725016636
o.d.o.l.ScoreIterationListener - Score at iteration 260 is 0.2597257487092671
o.d.o.l.ScoreIterationListener - Score at iteration 270 is 0.1956160487387317
o.d.o.l.ScoreIterationListener - Score at iteration 280 is 0.46285171778812845
o.d.o.l.ScoreIterationListener - Score at iteration 290 is 0.23368815870462978
o.d.o.l.ScoreIterationListener - Score at iteration 300 is 0.21849869561295238
o.d.o.l.ScoreIterationListener - Score at iteration 310 is 0.3079159021153775
o.d.o.l.ScoreIterationListener - Score at iteration 320 is 0.17230954431779077
o.d.o.l.ScoreIterationListener - Score at iteration 330 is 0.25173860954967464
o.d.o.l.ScoreIterationListener - Score at iteration 340 is 0.19153975302888773
o.d.o.l.ScoreIterationListener - Score at iteration 350 is 0.27611253301126826
o.d.o.l.ScoreIterationListener - Score at iteration 360 is 0.35023234378070006
o.d.o.l.ScoreIterationListener - Score at iteration 370 is 0.3027737095867488
o.d.o.l.ScoreIterationListener - Score at iteration 380 is 0.15351514300815036
o.d.o.l.ScoreIterationListener - Score at iteration 390 is 0.19508257987262578
o.d.o.l.ScoreIterationListener - Score at iteration 400 is 0.22758474214382962
o.d.o.l.ScoreIterationListener - Score at iteration 410 is 0.3001054097544875
o.d.o.l.ScoreIterationListener - Score at iteration 420 is 0.2959664178022582
o.d.o.l.ScoreIterationListener - Score at iteration 430 is 0.17942605986884985
o.d.o.l.ScoreIterationListener - Score at iteration 440 is 0.32150761267310385
o.d.o.l.ScoreIterationListener - Score at iteration 450 is 0.15320041437082121
o.d.o.l.ScoreIterationListener - Score at iteration 460 is 0.13213304013682023
o.d.o.l.ScoreIterationListener - Score at iteration 470 is 0.1619542346297797
o.d.o.l.ScoreIterationListener - Score at iteration 480 is 0.22516764649236434
o.d.o.l.ScoreIterationListener - Score at iteration 490 is 0.14541589118793832
o.d.o.l.ScoreIterationListener - Score at iteration 500 is 0.17896793533037392
o.d.o.l.ScoreIterationListener - Score at iteration 510 is 0.29393610001371084
o.d.o.l.ScoreIterationListener - Score at iteration 520 is 0.13634369683212075
o.d.o.l.ScoreIterationListener - Score at iteration 530 is 0.2504146736498269
o.d.o.l.ScoreIterationListener - Score at iteration 540 is 0.17982113434722277
o.d.o.l.ScoreIterationListener - Score at iteration 550 is 0.18531079322712124
o.d.o.l.ScoreIterationListener - Score at iteration 560 is 0.16513515950069654
o.d.o.l.ScoreIterationListener - Score at iteration 570 is 0.15340335100327512
o.d.o.l.ScoreIterationListener - Score at iteration 580 is 0.14324000125474307
o.d.o.l.ScoreIterationListener - Score at iteration 590 is 0.15914309960498768
o.d.o.l.ScoreIterationListener - Score at iteration 600 is 0.19068763388056342
o.d.o.l.ScoreIterationListener - Score at iteration 610 is 0.19720809707201586
o.d.o.l.ScoreIterationListener - Score at iteration 620 is 0.20483820151931348
o.d.o.l.ScoreIterationListener - Score at iteration 630 is 0.11955573062030718
o.d.o.l.ScoreIterationListener - Score at iteration 640 is 0.1458343228827556
o.d.o.l.ScoreIterationListener - Score at iteration 650 is 0.22830866879668216
o.d.o.l.ScoreIterationListener - Score at iteration 660 is 0.2313399764490361
o.d.o.l.ScoreIterationListener - Score at iteration 670 is 0.21007482613816175
o.d.o.l.ScoreIterationListener - Score at iteration 680 is 0.16992682974460777
o.d.o.l.ScoreIterationListener - Score at iteration 690 is 0.1154395355716863
o.d.o.l.ScoreIterationListener - Score at iteration 700 is 0.1229107678019902
o.d.o.l.ScoreIterationListener - Score at iteration 710 is 0.1120372525103405
o.d.o.l.ScoreIterationListener - Score at iteration 720 is 0.12553570807312692
o.d.o.l.ScoreIterationListener - Score at iteration 730 is 0.13182302263791051
o.d.o.l.ScoreIterationListener - Score at iteration 740 is 0.2679648938724218
o.d.o.l.ScoreIterationListener - Score at iteration 750 is 0.1319686517384269
o.d.o.l.ScoreIterationListener - Score at iteration 760 is 0.17791958997307455
o.d.o.l.ScoreIterationListener - Score at iteration 770 is 0.14382089162711842
o.d.o.l.ScoreIterationListener - Score at iteration 780 is 0.1170356982939261
o.d.o.l.ScoreIterationListener - Score at iteration 790 is 0.1227926388682924
o.d.o.l.ScoreIterationListener - Score at iteration 800 is 0.1441403891817825
o.d.o.l.ScoreIterationListener - Score at iteration 810 is 0.10648804522231502
o.d.o.l.ScoreIterationListener - Score at iteration 820 is 0.17500264492563855
o.d.o.l.ScoreIterationListener - Score at iteration 830 is 0.13749083492135605
o.d.o.l.ScoreIterationListener - Score at iteration 840 is 0.14247922568616356
o.d.o.l.ScoreIterationListener - Score at iteration 850 is 0.2247421917778224
o.d.o.l.ScoreIterationListener - Score at iteration 860 is 0.1791194868447905
o.d.o.l.ScoreIterationListener - Score at iteration 870 is 0.14604622020038627
o.d.o.l.ScoreIterationListener - Score at iteration 880 is 0.10652035666891858
o.d.o.l.ScoreIterationListener - Score at iteration 890 is 0.15853413482361273
o.d.o.l.ScoreIterationListener - Score at iteration 900 is 0.16757895528107009
o.d.o.l.ScoreIterationListener - Score at iteration 910 is 0.09514697089290988
o.d.o.l.ScoreIterationListener - Score at iteration 920 is 0.23466423425299773
o.d.o.l.ScoreIterationListener - Score at iteration 930 is 0.14243293480263844
o.d.o.l.EvaluativeListener - Starting evaluation nr. 1
o.d.o.l.EvaluativeListener - Reporting evaluation results:
o.d.o.l.EvaluativeListener - Evaluation:


========================Evaluation Metrics========================
 # of classes:    10
 Accuracy:        0.9856
 Precision:       0.9858
 Recall:          0.9853
 F1 Score:        0.9855
Precision, recall & F1: macro-averaged (equally weighted avg. of 10 classes)


=========================Confusion Matrix=========================
    0    1    2    3    4    5    6    7    8    9
---------------------------------------------------
  969    0    3    0    0    0    3    2    2    1 | 0 = 0
    0 1128    2    0    0    1    3    1    0    0 | 1 = 1
    1    0 1027    0    0    0    0    4    0    0 | 2 = 2
    0    0    4 1004    0    0    0    1    1    0 | 3 = 3
    0    0    1    0  973    0    1    0    0    7 | 4 = 4
    2    0    1   19    0  866    1    2    1    0 | 5 = 5
    4    1    2    0    4    2  942    0    3    0 | 6 = 6
    1    2    9    4    2    0    0 1005    0    5 | 7 = 7
    1    0    3    4    2    2    0    1  953    8 | 8 = 8
    0    2    0    8    6    0    0    4    0  989 | 9 = 9

Confusion matrix format: Actual (rowClass) predicted as (columnClass) N times
==================================================================
o.d.e.s.LeNetMNIST - Saving model to tmp folder: C:\Users\dh\AppData\Local\Temp\lenetmnist.zip
o.d.e.s.LeNetMNIST - ****************Example finished********************

Process finished with exit code 0
```

## 代码地址

为了便于学习，代码放在 github 上：

> [github](https://github.com/houbb/dl4j-learn2022/tree/release_1.0.0)

# 小结

虽然可以看到所有的实现，流程也跑起来了。

但是有介个问题：

1. 为什么？原理是啥？

2. 有什么应用，比如实现一个手写数字的识别程序？

3. 数据的获取，如何使用？

# 参考资料

https://deeplearning4j.konduit.ai/multi-project/explanation/configuration/backends

* any list
{:toc}