---
layout: post
title: Commons Math Statistics 统计-01
date:  2019-5-10 11:08:59 +0800
categories: [Math]
tags: [math, apache, overview, sh]
published: true
---

# 概观

统计软件包提供了基本描述性统计，频率分布，双变量回归以及t-，卡方和ANOVA测试统计的框架和实现。

描述性统计

频率分布

简单回归

多重回归

排名转换

协方差和相关性

统计检验

# 描述性统计（Descriptive statistics）

stat包包含以下描述性统计信息的框架和默认实现：

算术和几何手段

方差和标准差

总和，乘积，对数和，平方和的总和

最小值，最大值，中位数和百分位数

偏斜和峰度

第一，第二，第三和第四时刻

除百分位数和中位数外，所有这些统计数据都可以在不保留内存中输入数据值的完整列表的情况下进行计算。 stat包提供不需要值存储的接口和实现，以及对存储值数组进行操作的实现。

顶级界面是UnivariateStatistic。此接口由所有统计信息实现，由evaluate（）方法组成，这些方法将double []数组作为参数并返回统计信息的值。 

StorelessUnivariateStatistic扩展了此接口，它添加了increment（），getResult（）和相关方法，以支持使用increment（）方法添加值时维护计数器，总和或其他状态信息的“无存储”实现。

顶级接口的抽象实现分别在AbstractUnivariateStatistic和AbstractStorelessUnivariateStatistic中提供。

每个统计信息都作为一个单独的类实现，在一个子包（时刻，等级，摘要）中，每个都扩展了上面的一个抽象类（取决于是否需要值存储来计算统计数据）。有几种方法可以实例化和使用统计信息。可以直接实例化和使用统计信息，但使用提供的聚合，DescriptiveStatistics和SummaryStatistics访问统计信息通常更方便（也更有效）。

DescriptiveStatistics 将输入数据保存在内存中，并且能够生成从最近添加的值组成的“窗口”计算的“滚动”统计数据。

SummaryStatistics 不会将输入数据值存储在内存中，因此此聚合中包含的统计信息仅限于可以在一次传递数据时计算的统计信息，而无需访问完整的值数组。

```
Aggregate	        Statistics      Included	Values stored?	"Rolling" capability?
DescriptiveStatistics	min, max, mean, geometric mean, n, sum, sum of squares, standard deviation, variance, percentiles, skewness, kurtosis, median	Yes	Yes
SummaryStatistics	min, max, mean, geometric mean, n, sum, sum of squares, standard deviation, variance	No	No
```

可以使用AggregateSummaryStatistics聚合SummaryStatistics。 

此类可用于同时收集多个数据集的统计信息以及包含所有数据的组合样本。

MultivariateSummaryStatistics 类似于 SummaryStatistics 但处理n元组值而不是标量值。 

它还可以计算输入数据的完整协方差矩阵。

DescriptiveStatistics 和 SummaryStatistics 都不是线程安全的。 

SynchronizedDescriptiveStatistics 和 SynchronizedSummaryStatistics 分别为需要多个线程并发访问统计聚合的应用程序提供线程安全版本。 

SynchronizedMultivariateSummaryStatistics 提供线程安全的 MultivariateSummaryStatistics。

还有一个实用程序类StatUtils，它提供了直接从double []数组计算统计信息的静态方法。

以下是一些示例，说明如何计算描述性统计信息。

# 计算双精度值列表的汇总统计信息

## 使用DescriptiveStatistics聚合（值存储在内存中）：




# 参考资料

[Apache Commons Math-Overview](http://commons.apache.org/proper/commons-math/userguide/overview.html)

* any list
{:toc}