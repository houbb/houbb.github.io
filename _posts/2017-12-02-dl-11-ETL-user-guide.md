---
layout: post
title:  DL4j-11-ETL User Guide
date:  2017-12-02 20:12:40 +0800
categories: [Deep Learning]
tags: [AI, DL, data & ETL]
header-img: "static/app/res/img/kon-bg.jpeg"
published: true
---

# ETL


神经网络需要处理的数据有许多种不同的来源和类型，例如日志文件、文本文档、表格数据、图像、视频等。

神经网络数据加工的目标是**将各类数据转换为一系列存放于多维数组（Multi-Dimensional Array）中的值**。

数据可能还需要进行各种预处理，包括转换、缩放、标准化、变换、合并、划分为定型与测试数据集、随机排序等。本页主要介绍目前可用的数据加工工具及其使用方法。

- 记录读取器

- 标准化器

- 转换


> 个人启示

很多东西，都需要统一转化为标准的程序可识别的数据。这个过程很麻烦，比如数据的抓取。


![现有ETL路径的流程图](https://raw.githubusercontent.com/houbb/resource/master/img/DL/ETL/2017-12-02-etl-struct.svg)


# 记录读取器

记录读取器是Skymind团队开发的ETL流程管理库 DataVec 中的一种类，名称为 `RecordReader`。

> [可用记录读取器](https://deeplearning4j.org/cn/etl-userguide)


# 图像基础

为神经网络读取图像时，所有的图像数据在某一时刻必须都缩放至相同的尺寸。图像的初始缩放由 `ImageRecordReader` 完成。

在定型、测试或推断之前加载一系列数据记录的方法如以下代码所示。读取灰阶图像时请将 `channels` 设定为1。

```java
ImageRecordReader recordReader = new ImageRecordReader(height,width,channels);
```

加载单幅图像用于推断：

```java
NativeImageLoader loader = new NativeImageLoader(height, width, channels); // 加载和缩放
INDArray image = loader.asMatrix(file);     // 创建INDarray
INDArray output = model.output(image);      // 获得模型对图像的预测
```


# 图像数据增强

如果您的图像数据不足以完成神经网络的定型，您可以将现有的图像转换、采样或裁剪，生成额外的有效输入，增加可用的定型数据。

## 添加标签

在构建分类器时，标签是您想要预测的输出值，而与这些标签相关联的数据是输入。就CSV文件而言，标签可能就是数据记录本身的一部分，与相关输入紧邻着存放在同一行。CSVRecordReader让您可以把特定的字段指定为标签。

DataVec转换流程可将文本标签变换为数值。标签可能需要依据文件路径生成，比如图像分别存放在一系列目录中，目录名称代表了图像的标签。标签也有可能由文件名本身表示，此时就需要从文件所在的目录内部收集数据。

您可以用 [ParentPathLabelGenerator](https://github.com/deeplearning4j/DataVec/blob/master/datavec-api/src/main/java/org/datavec/api/io/labels/ParentPathLabelGenerator.java) 和
[PathLabelGenerator](https://github.com/deeplearning4j/DataVec/blob/master/datavec-api/src/main/java/org/datavec/api/io/labels/PathLabelGenerator.java) 
这两个DataVec中的类来添加标签。

依据父目录名称对图像进行标记的示例如下。

```java
ParentPathLabelGenerator labelMaker = new ParentPathLabelGenerator();
ImageRecordReader recordReader = new ImageRecordReader(height, width, channels, labelMaker);
```

## 图像转换

图像会被系统作为像素值的数组读取。像素值通常是8比特，因此一幅包括一黑一白2个像素的图像的数组是`[0,255]`。

虽然神经网络可以直接用原始数据来定型，但最好还是先将数据标准化。“零均值单位方差”即让所有的值减去实际平均值，然后缩放至-1与1之间，以0为平均值。

图像定型数据可以通过旋转样例或倾斜图像来增强。

> [可用的图像转换方法](https://deeplearning4j.org/cn/etl-userguide)

## 数据转换

通过 DataVec 摄取数据时，可以用包含多个步骤的转换流程来转换数据。

> [DataVec 现有的数据转换](https://deeplearning4j.org/cn/etl-userguide)

# 缩放和标准化

通过 `RecordReader` 获取的数据通常会传递给一个数据集迭代器，迭代器会遍历数据并对其进行预加工，以便输入神经网络。
可以摄取的数据已经变为一个多维数组（INDarray），不再是用迭代器读取一个数据记录序列的形式。
该阶段也有一系列转换和缩放的工具。由于数据已经是INDarray，此处介绍的工具都属于Skymind的科学计算库ND4J的一部分。
文档参见[此处](http://nd4j.org/doc/org/nd4j/linalg/dataset/api/preprocessor/DataNormalization.html)

```java
DataNormalization scaler = new ImagePreProcessingScaler(0,1);
    scaler.fit(dataIter);
    dataIter.setPreProcessor(scaler);
```

## 可用的ND4J预处理器


| ND4J数据集预处理器	            | 用途 |
|:---|:----|
| ImagePreProcessingScaler	| 指定最大值、最小值的缩放，可设定区间。像素值可以从0->255缩放至minRange->maxRange的区间内，默认minRange = 0，maxRange = 1 |
| NormalizerMinMaxScaler	| 指定最大值、最小值的缩放，可设定区间：X -> (X - min/(max-min)) * (given_max - given_min) + given_mi |
| NormalizerStandardize	    | 标准缩放器，计算列的移动方差与均值 |

## 图像转换 

使用JavaCV、OpenCV和ffmpeg滤镜的图像转换

ffmpeg和OpenCV是用于过滤、转换图像及视频的开源库。在7.2及以上版本中获取ffmpeg过滤器的方法是向pom.xml文件中添加下列代码，将依赖项替换为当前版本。

```xml
<dependency> 
    <groupId>org.bytedeco</groupId> 
    <artifactId>javacv-platform</artifactId> 
    <version>1.3</version> 
</dependency>
```

- [javacv](https://github.com/bytedeco/javacv)

- [opencv](https://opencv.org/)

- [ffmpeg](https://ffmpeg.org/)


## 时间序列或序列数据

循环神经网络可用于分析序列和时间序列数据。DataVec提供的 `CSVSequenceReader` 类可以从文件中读取序列数据。`UCISequenceClassificationExample` 就是一个很好的例子。

数据被分为测试和定型两个数据集，因此代码分别为每个数据集创建了一个迭代器。

这一数据集中共有六种标签。特征目录中每个包含数据的文件都有一个对应的标签文件，位于标签目录下。标签文件中仅有单个项，而特征文件则包含了相应设备的活动序列记录。

```java
private static File baseDir = new File("src/main/resources/uci/");
private static File baseTrainDir = new File(baseDir, "train");
private static File featuresDirTrain = new File(baseTrainDir, "features");
private static File labelsDirTrain = new File(baseTrainDir, "labels");
private static File baseTestDir = new File(baseDir, "test");
private static File featuresDirTest = new File(baseTestDir, "features");
private static File labelsDirTest = new File(baseTestDir, "labels");
```

`NumberedFileInputFormat` 用 `String.Format` 从文件名中提取索引。数据目录包含文件0.csv->449.csv

```java
SequenceRecordReader trainFeatures = new CSVSequenceRecordReader();
        trainFeatures.initialize(new NumberedFileInputSplit(featuresDirTrain.getAbsolutePath() + "/%d.csv", 0, 449));
        SequenceRecordReader trainLabels = new CSVSequenceRecordReader();
        trainLabels.initialize(new NumberedFileInputSplit(labelsDirTrain.getAbsolutePath() + "/%d.csv", 0, 449));
```

## 摄取图像数据并输入预定型的模型

`NativeImageLoader` 可以读取一幅图像并将其转变为一个INDArray。请注意，您需要用网络定型时调整尺寸、缩放、标准化的方式来缩放和调整导入的图像。

![2017-12-02-ETL_single_image.svg](https://raw.githubusercontent.com/houbb/resource/master/img/DL/ETL/2017-12-02-ETL_single_image.svg)

* any list
{:toc}

