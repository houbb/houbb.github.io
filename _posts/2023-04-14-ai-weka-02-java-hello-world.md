---
layout: post
title: Weka 入门学习-02-weka java hello world 入门例子
date:  2023-04-14 +0800
categories: [AI]
tags: [ai, weka, sh]
published: true
---

# Q: java 使用 weka 的入门例子

以下是一个使用Weka进行分类的Java入门示例：

1. 准备数据集

首先，你需要准备一个数据集文件。你可以使用Weka自带的数据集或者创建自己的数据集文件。假设你已经准备好了一个名为“iris.arff”的数据集文件，它包含了鸢尾花数据集的属性和实例信息。

2. 导入Weka库

在你的Java代码中，你需要导入Weka库，以便你可以使用Weka提供的各种类和方法。你可以使用以下代码导入Weka库：

```java
import weka.core.Instances;
import weka.core.converters.ConverterUtils.DataSource;
import weka.classifiers.functions.SMO;
import weka.classifiers.Evaluation;
```

3. 加载数据集

在你的Java代码中，你需要加载数据集文件并将其转换为Weka中的Instances对象，以便你可以对数据集进行分类分析。你可以使用以下代码加载数据集：

```java
DataSource source = new DataSource("iris.arff");
Instances data = source.getDataSet();
if (data.classIndex() == -1) {
    data.setClassIndex(data.numAttributes() - 1);
}
```

4. 构建分类器

在你的Java代码中，你需要选择一个分类算法并构建一个分类器。在这个例子中，我们选择SMO分类器作为我们的分类算法。你可以使用以下代码构建分类器：

```java
SMO smo = new SMO();
smo.buildClassifier(data);
```

5. 进行分类预测

在你的Java代码中，你可以使用分类器对新数据进行分类预测。你可以使用以下代码对一个新数据样本进行分类预测：

```java
Instance newData = new DenseInstance(4);
newData.setValue(0, 5.1);
newData.setValue(1, 3.5);
newData.setValue(2, 1.4);
newData.setValue(3, 0.2);
newData.setDataset(data);
double predicted = smo.classifyInstance(newData);
```

6. 评估分类器性能

在你的Java代码中，你可以使用Weka提供的Evaluation类评估分类器的性能。你可以使用以下代码评估分类器的性能：

```java
Evaluation eval = new Evaluation(data);
eval.evaluateModel(smo, data);
System.out.println(eval.toSummaryString());
```

上述代码会输出分类器的性能统计信息，包括准确率、召回率、F1值等。

这是一个简单的Weka入门示例，它展示了如何使用Weka对数据集进行分类分析。在实际应用中，你可能需要更多的数据预处理、特征工程、交叉验证等技术来提高分类器的性能。


## maven 导入

以下是一个可以使用Weka和JDK8的Maven依赖配置：

```xml
<dependency>
    <groupId>nz.ac.waikato.cms.weka</groupId>
    <artifactId>weka-stable</artifactId>
    <version>3.8.5</version>
</dependency>
```

你可以将上述代码添加到你的Maven项目的pom.xml文件中，然后使用Maven构建你的项目。这个依赖配置将会下载Weka 3.8.5版本的JAR文件，并将其添加到你的项目的classpath中，以便你可以使用Weka进行数据挖掘和机器学习任务。

注意，这个依赖配置仅适用于使用JDK8及以上版本的项目。如果你的项目使用旧版本的JDK，请使用适当的Weka版本，以避免兼容性问题。

## 完整的入门例子

### 数据集

这里使用的是鸢尾花的数据集，我们下载一下。

直接下载 [https://prdownloads.sourceforge.net/weka/datasets-UCI.jar](https://prdownloads.sourceforge.net/weka/datasets-UCI.jar)

然后解压，找到 `iris.arff` 文件。

### java 例子

以下是一个使用Weka进行分类的完整Java入门示例：

```java
import weka.classifiers.Classifier;
import weka.classifiers.Evaluation;
import weka.classifiers.bayes.NaiveBayes;
import weka.core.Instance;
import weka.core.Instances;
import weka.core.converters.ConverterUtils.DataSource;
import java.io.File;

public class WekaExample {

    public static void main(String[] args) throws Exception {

        // 加载数据集
        DataSource source = new DataSource("iris.arff");
        Instances data = source.getDataSet();
        if (data.classIndex() == -1) {
            data.setClassIndex(data.numAttributes() - 1);
        }

        // 构建分类器
        Classifier classifier = new NaiveBayes();
        classifier.buildClassifier(data);

        // 进行分类预测
        Instance newData = data.instance(0);
        double predicted = classifier.classifyInstance(newData);
        System.out.println("Predicted class: " + data.classAttribute().value((int) predicted));

        // 评估分类器性能
        Evaluation eval = new Evaluation(data);
        eval.evaluateModel(classifier, data);
        System.out.println(eval.toSummaryString());

    }
}
```

在这个例子中，我们使用了Weka自带的鸢尾花数据集进行分类分析。首先，我们加载数据集并设置分类属性。然后，我们选择朴素贝叶斯算法作为分类算法，并构建一个分类器。接下来，我们对数据集中的一个样本进行分类预测，并输出预测结果。最后，我们使用Weka提供的Evaluation类对分类器进行性能评估，并输出性能统计信息。

你可以将上述代码保存到一个名为“WekaExample.java”的文件中，然后使用Java编译器编译它。

然后，你可以在命令行中运行编译后的类文件，以运行这个Weka入门例子。请确保你已经将Weka库添加到你的classpath中，以便你可以成功编译和运行这个例子。

### 测试日志

我们直接运行代码，输出日志如下。

```
Predicted class: Iris-setosa

Correctly Classified Instances         144               96      %
Incorrectly Classified Instances         6                4      %
Kappa statistic                          0.94  
Mean absolute error                      0.0324
Root mean squared error                  0.1495
Relative absolute error                  7.2883 %
Root relative squared error             31.7089 %
Total Number of Instances              150     
```

## Q：解释一下 weka 分类器的性能统计信息

在Weka中，分类器的性能可以通过Evaluation类进行评估，该类提供了一系列性能统计信息，用于衡量分类器的准确性和可靠性。

以下是一些常见的Weka分类器性能统计信息及其含义：

1. 准确率（Accuracy）：分类器正确分类的样本数占总样本数的比例。准确率越高，分类器的性能越好。

2. 错误率（Error Rate）：分类器错误分类的样本数占总样本数的比例。错误率越低，分类器的性能越好。

3. 精确率（Precision）：分类器正确分类为正类别的样本数占分类器总预测为正类别的样本数的比例。精确率越高，分类器将负类别误判为正类别的可能性越小。

4. 召回率（Recall）：分类器正确分类为正类别的样本数占真实正类别的总样本数的比例。召回率越高，分类器将正类别误判为负类别的可能性越小。

5. F1值（F1 Score）：精确率和召回率的加权平均值，用于综合衡量分类器的准确性和可靠性。

除了以上这些性能统计信息，Weka的Evaluation类还可以提供其他一些评估指标，如AUC（ROC曲线下面积）和Kappa系数等，用于更全面地评估分类器的性能。

需要注意的是，Weka的性能统计信息只是一些简单的指标，不能完全反映分类器的实际性能。在实际应用中，还需要根据具体问题和需求进行选择和优化分类器，并进行更全面和细致的性能评估。


# 参考资料


* any list
{:toc}