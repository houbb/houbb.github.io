---
layout: post
title:  DL4j-13-data pipeline
date:  2017-12-04 19:57:50 +0800
categories: [Deep Learning]
tags: [AI, DL, data & ETL]
header-img: "static/app/res/img/kon-bg.jpeg"
published: true
---



# 构建数据管道

Deeplearning4j示例所使用的基准数据集不会对数据加工管道造成任何障碍，因为我们已通过抽象化将这些障碍去除。
但在实际工作中，用户接触的是未经处理的杂乱数据，需要先预处理、向量化，再用于定型神经网络，进行聚类或分类。

DataVec是我们的机器学习向量化库，可以按神经网络的学习需求定制数据预加工方法。（[DataVec Javadoc](https://deeplearning4j.org/datavecdoc/)）

## 加载标签

> [ImagePipelineExample.java](https://github.com/deeplearning4j/dl4j-examples/blob/master/dl4j-examples/src/main/java/org/deeplearning4j/examples/dataexamples/ImagePipelineExample.java)

我们的示例存储库有一个使用 `ParentPathLabelGenerator` 的示例

```java
File parentDir = new File(System.getProperty("user.dir"), "dl4j-examples/src/main/resources/DataExamples/ImagePipeline/");
//Files in directories under the parent dir that have "allowed extensions" plit needs a random number generator for reproducibility when splitting the files into train and test
FileSplit filesInDir = new FileSplit(parentDir, allowedExtensions, randNumGen);

//You do not have to manually specify labels. This class (instantiated as below) will
//parse the parent dir and use the name of the subdirectories as label/class names
ParentPathLabelGenerator labelMaker = new ParentPathLabelGenerator();
```

## 读取记录，对数据进行迭代

以下代码可将原始图像转换为 DL4J 和 ND4J 相兼容的格式：

```java
// 将RecordReader实例化。指定图像的高和宽。
ImageRecordReader recordReader = new ImageRecordReader(height,width,channels,labelMaker);

// 通道指图像的色彩深度，1为灰阶，3为RGB

// 指向数据路径。 
recordReader.initialize(new FileSplit(new File(parentDir)));
```

RecordReader 是 DataVec 中的一个类，可以帮助将字节式输入转换为记录式的数据，亦即一组数值固定并以独特索引ID加以标识的元素。向量化是将数据转换为记录的过程。
记录本身是一个向量，每个元素是一项特征。

[ImageRecordReader](https://github.com/deeplearning4j/DataVec/blob/master/datavec-data/datavec-data-image/src/main/java/org/datavec/image/recordreader/ImageRecordReader.java)
是RecordReader的子类，用于自动载入28 x 28像素的图像。
你可以改变输入ImageRecordReader的参数，将尺寸改为自定义图像的大小，但务必要调整超参数 `nIn`，使之等于图像高与宽的乘积。
如需加载大小为28 x 28的图像，MultiLayerNetwork的配置中应当包含 `.nIn(28 * 28)`

如果使用LabelGenerator，则调用ImageRecordReader时，其参数应包括labelGenerator。 

```java
ImageRecordReader(int height, int width, int channels, PathLabelGenerator labelGenerator)
```

DataSetIterator 是用于遍历列表元素的一个Deeplearning4J类。迭代器按顺序访问数据列表中的每个项目，同时通过指向当前的元素来记录进度，在遍历过程中每前进一步就自动指向下一个元素。

```java
// 从DataVec到DL4J
DataSetIterator dataIter = new RecordReaderDataSetIterator(recordReader,batchSize,1,outputNum);
// 参数包括：DataVec recordReader的类型、批次大小、标签的索引值、标签类别的数量
```

DataSetIterator 对输入数据集进行迭代，每次迭代均抓取一个或多个（batchSize）新样例，将其载入神经网络可以识别的DataSet（INDArray）对象。
上述代码还指示 [RecordReaderDataSetIterator](https://github.com/deeplearning4j/deeplearning4j/blob/master/deeplearning4j-core/src/main/java/org/deeplearning4j/datasets/datavec/RecordReaderDataSetIterator.java) 
将图像转换为一条元素的直线（向量），而非一个28 x 28的网格（矩阵）；此外还指定了标签的配置。

`RecordReaderDataSetIterator` 的参数可以设置任意特定的 recordReader（针对图像或声音等数据类型）和批次大小。
进行有监督学习时，还可指定标签的索引值，设置输入样例的标签可能有多少种不同的类别（LFW数据集共有5749种标签）。

## 配置模型

以下是一个神经网络的配置示例。[NeuralNetConfiguration类的术语表](https://deeplearning4j.org/cn/neuralnet-configuration.html)对许多超参数都已作了说明，
所以此处仅对一些比较特殊的参数设置进行简要概述。

- optimizationAlgo 依赖LINE_GRADIENT_DESCENT，而不是LBFGS。

- nIn 设定为784，让每个图像像素成为一个输入节点。如果你的图像尺寸改变（即总像素数发生变化），则nIn也应当改变。

- list 操作符设为4，表明有三个受限玻尔兹曼机（RBM）隐藏层和一个输出层。一个以上的RBM组成一个深度置信网络（DBN）。

- lossFunction 设为RMSE，即均方根误差。这种损失函数用于定型网络，使之能正确地重构输入。

## 模型的建立和定型

配置结束时，调用build并将网络的配置传递给一个MultiLayerNetwork对象。

```java
}).build();
    MultiLayerNetwork network = new MultiLayerNetwork(conf);
```

可以用下列代码示例之一来设定在神经网络定型时显示性能并帮助进行调试的监听器：

```java
network.setListeners(Arrays.<IterationListener>asList(new ScoreIterationListener(10), new GradientPlotterIterationListener(10)));
```

or

```java
network.setListeners(Collections.singletonList((IterationListener) new ScoreIterationListener(listenerFreq)));
```


## 模型定型

数据加载后，模型框架构建完成，用数据对模型进行定型。对数据迭代器调用next，让迭代器读取下一批数据，每次将按批次大小返回一定量的数据。
以下的代码显示了如何用数据集迭代器来进行循环，随后对模型运行fit，用数据定型模型。

```java
// 定型
while(iter.hasNext()){
    DataSet next = iter.next();
    network.fit(next);
}
```

## 评估模型

模型定型完毕后，再将数据输入其中进行测试，评估模型的性能。通常较好的做法是采用交叉验证，事先将数据集分为两部分，用模型未曾见过的数据进行测试。
以下的例子展示了如何重置当前的迭代器，初始化evaluation对象，再将数据输入其中以获得性能信息。

```java
// 用同样的定型数据作为测试数据。 
iter.reset();
Evaluation eval = new Evaluation();
while(iter.hasNext()){
    DataSet next = iter.next();
    INDArray predict2 = network.output(next.getFeatureMatrix());
    eval.eval(next.getLabels(), predict2);
}

System.out.println(eval.stats());
```

在这一过程中使用交叉验证的另一方法是加载全部数据，将其分为一个定型集和一个测试集。鸢尾花数据集足够小，可以载入全部的数据，再完成划分。
但许多用于生产型神经网络的数据集并非如此。在本例中可通过以下代码使用替代方法：

```java
SplitTestAndTrain testAndTrain = next.splitTestAndTrain(splitTrainNum, new Random(seed));
    DataSet train = testAndTrain.getTrain();
    DataSet test = testAndTrain.getTest();
```

如要将较大的数据集分为测试集和定型集，则必须对测试和定型两个数据集都进行迭代。这一操作就暂且交由读者自己思考。





# 自定义图像管道

本页的教程将介绍如何加载图像数据集并对其进行转换操作。为求简明易懂，本教程仅使用牛津花卉数据集中的三个类别，各有十幅图像。
下列代码片段仅供参考，请勿直接复制粘贴使用。
 
> [ImagePipelineExample](https://github.com/deeplearning4j/dl4j-examples/blob/master/dl4j-examples/src/main/java/org/deeplearning4j/examples/dataexamples/ImagePipelineExample.java)


简而言之，数据集中的图像必须按类别/标签存放在不同的目录下，而标签/类别目录则位于父目录下。

- 下载数据集。

- 建立父目录。

- 在父目录中创建子目录，按相应的标签/类别名称命名。

- 将所有属于某一类别/标签的图像移动到相应的目录下。

通常需要采用的目录结构如下图所示。

```
parentDir
                            /   / | \  \
                           /   /  |  \  \
                          /   /   |   \  \
                         /   /    |    \  \
                        /   /     |     \  \
                       /   /      |      \  \
                 label_0 label_1....label_n-1 label_n
```

本例子目录结构如下：

parentDir（父目录）对应 `$PWD/src/main/resources/DataExamples/ImagePipeline/`，而子目录labelA、labelB、labelC（标签A、B、C）下各有十幅图像。

```
├── ImagePipeline
│   ├── labelA
│   │   ├── image_0010.jpg
│   │   ├── image_0011.jpg
│   │   ├── image_0012.jpg
│   │   ├── image_0013.jpg
│   │   ├── image_0014.jpg
│   │   ├── image_0015.jpg
│   │   ├── image_0016.jpg
│   │   ├── image_0017.jpg
│   │   ├── image_0018.jpg
│   │   └── image_0019.jpg
│   ├── labelB
│   │   ├── image_0110.jpg
│   │   ├── image_0111.jpg
│   │   ├── image_0112.jpg
│   │   ├── image_0113.jpg
│   │   ├── image_0114.jpg
│   │   ├── image_0115.jpg
│   │   ├── image_0116.jpg
│   │   ├── image_0117.jpg
│   │   ├── image_0118.jpg
│   │   └── image_0119.jpg
│   └── labelC
│       ├── image_0410.jpg
│       ├── image_0411.jpg
│       ├── image_0412.jpg
│       ├── image_0413.jpg
│       ├── image_0414.jpg
│       ├── image_0415.jpg
│       ├── image_0416.jpg
│       ├── image_0417.jpg
│       ├── image_0418.jpg
│       └── image_0419.jpg
```

- ImagePipelineExample.java

```java
import org.datavec.api.io.filters.BalancedPathFilter;
import org.datavec.api.io.labels.ParentPathLabelGenerator;
import org.datavec.api.split.FileSplit;
import org.datavec.api.split.InputSplit;
import org.datavec.api.util.ClassPathResource;
import org.datavec.image.loader.BaseImageLoader;
import org.datavec.image.recordreader.ImageRecordReader;
import org.datavec.image.transform.ImageTransform;
import org.datavec.image.transform.MultiImageTransform;
import org.datavec.image.transform.ShowImageTransform;
import org.deeplearning4j.datasets.datavec.RecordReaderDataSetIterator;
import org.nd4j.linalg.dataset.DataSet;
import org.nd4j.linalg.dataset.api.iterator.DataSetIterator;
import java.io.File;
import java.util.Random;

/**
 * Created by susaneraly on 6/9/16.
 */
public class ImagePipelineExample {

    //Images are of format given by allowedExtension -
    private static final String [] allowedExtensions = BaseImageLoader.ALLOWED_FORMATS;

    private static final long seed = 12345;

    private static final Random randNumGen = new Random(seed);

    private static final int height = 50;
    private static final int width = 50;
    private static final int channels = 3;

    public static void main(String[] args) throws Exception {

        //=================== 加载图像前的详细设置
        //DIRECTORY STRUCTURE:
        //Images in the dataset have to be organized in directories by class/label.
        //In this example there are ten images in three classes
        //Here is the directory structure
        //                                    parentDir
        //                                  /    |     \
        //                                 /     |      \
        //                            labelA  labelB   labelC
        //
        //Set your data up like this so that labels from each label/class live in their own directory
        //And these label/class directories live together in the parent directory
        //
        // 1.1 指定包含已标记图像的各个目录所在的父目录路径：
        File parentDir = new ClassPathResource("DataExamples/ImagePipeline/").getFile();   
        
        //Files in directories under the parent dir that have "allowed extensions" split needs 
        // a random number generator for reproducibility when splitting the files into train and test
        // 1.2 指定将数据集分为测试集和定型集时允许的扩展名和需要使用的随机数生成器。
        FileSplit filesInDir = new FileSplit(parentDir, allowedExtensions, randNumGen); 

        //You do not have to manually specify labels. This class (instantiated as below) will
        //parse the parent dir and use the name of the subdirectories as label/class names
        // 1.3 设置一个标签生成器，这样就无需手动指定标签。生成器会将子目录名称用作标签/类别的名称。
        ParentPathLabelGenerator labelMaker = new ParentPathLabelGenerator();   
        
        //The balanced path filter gives you fine tune control of the min/max cases to load for each class
        //Below is a bare bones version. Refer to javadoc for details
        // 1.4 指定路径筛选器，以便精确控制每种类别所要加载的最小/最大样例数。以下是最基本的代码。有关细节请参阅javadoc。
        BalancedPathFilter pathFilter = new BalancedPathFilter(randNumGen, allowedExtensions, labelMaker);  

        //Split the image files into train and test. Specify the train test split as 80%,20%
        // 1.5 指定测试集与定型集的比例，此处为80%和20%
        InputSplit[] filesInDirSplit = filesInDir.sample(pathFilter, 80, 20);
        InputSplit trainData = filesInDirSplit[0];
        //InputSplit testData = filesInDirSplit[1];  //The testData is never used in the example, commenting out.

        //=================== 图像数据加工管道的详细设置
        //Specifying a new record reader with the height and width you want the images to be resized to.
        //Note that the images in this example are all of different size
        //They will all be resized to the height and width specified below
        // 2.1 为图像记录加载器指定高度和宽度，调整数据集中所有图像的尺寸。
        // 请注意：数据集中的图像不必都是相同的尺寸。DataVec可以调整图像尺寸。本示例中的图像均为不同尺寸，它们都会被调整为指定的高度和宽度
        ImageRecordReader recordReader = new ImageRecordReader(height,width,channels,labelMaker);

        //Often there is a need to transforming images to artificially increase the size of the dataset
        //DataVec has built in powerful features from OpenCV
        //You can chain transformations as shown below, write your own classes that will say detect a face and crop to size
        /*ImageTransform transform = new MultiImageTransform(randNumGen,
            new CropImageTransform(10), new FlipImageTransform(),
            new ScaleImageTransform(10), new WarpImageTransform(10));
            */

        //You can use the ShowImageTransform to view your images
        //Code below gives you a look before and after, for a side by side comparison
        //2.2 指定转换操作 
        // 通过转换图像来人为地扩大数据集规模可能会带来益处
        ImageTransform transform = new MultiImageTransform(randNumGen,new ShowImageTransform("Display - before "));

        //Initialize the record reader with the train data and the transform chain
        //2.3 用定型数据和转换操作链对记录加载器进行初始化
        recordReader.initialize(trainData,transform);
        int outputNum = recordReader.numLabels();
        
        //convert the record reader to an iterator for training - Refer to other examples for how to use an iterator
        int batchSize = 10; // Minibatch size. Here: The number of images to fetch for each call to dataIter.next().
        int labelIndex = 1; // Index of the label Writable (usually an IntWritable), as obtained by recordReader.next()
        // List<Writable> lw = recordReader.next();
        // then lw[0] =  NDArray shaped [1,3,50,50] (1, heightm width, channels)
        //      lw[0] =  label as integer.
        // 2.4 以下是用图像记录加载器构建数据集迭代器的方法。
        // DataSetIterator通过recordReader对输入数据集进行迭代，每次迭代均抓取一个或多个新样例，将其载入神经网络可以识别的DataSet对象。
        DataSetIterator dataIter = new RecordReaderDataSetIterator(recordReader, batchSize, labelIndex, outputNum);
        while (dataIter.hasNext()) {
            DataSet ds = dataIter.next();
            System.out.println(ds);
            try {
                Thread.sleep(3000);                 //1000 milliseconds is one second.
            } catch(InterruptedException ex) {
                Thread.currentThread().interrupt();
            }
        }
    }
}
```

## 缩放DataSet

由DataIterator传入的DataSet将包含一个或多个像素值数组。例如，假设我们指定RecordReader的高度为10，宽度为10， 通道为1，即灰阶图像

```java
ImageRecordReader(height,width,channels)
```

那么返回的DataSet将是一个10 x 10的矩阵，其元素为0到255之间的数值。0代表黑色像素，255代表白色像素。100则代表灰色。如果图像是彩色的，就会有三个通道。

将图像像素值的范围从0～255缩放到0～1可能会更有帮助。

这可以通过以下的代码来实现。

```java
DataNormalization scaler = new ImagePreProcessingScaler(0,1);
        scaler.fit(dataIter);
        dataIter.setPreProcessor(scaler);
```


* any list
{:toc}