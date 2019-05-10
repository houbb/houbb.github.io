---
layout: post
title: Druid
date:  2019-5-10 11:08:59 +0800
categories: [SQL]
tags: [sql, database, big-data, sh]
published: false
---

# Druid

[Apache Druid (incubating)](http://druid.io/) is a high performance real-time analytics database.


# 数据存储

Druid将数据组织成Read-Optimized的结构，而这也是Druid能够支持交互式查询的关键。

Druid中的数据存储在被称为datasource中，类似RDMS中的table。

每个datasource按照时间划分，如果你有需求也可以进一步按其它属性划分。

每个时间范围称为一个chunk(比如你按天分区，则一个chunk为一天)。

在chunk中数据由被分为一个或多个segment(segment是数据实际存储结构，Datasource、Chunk只是一个逻辑概念)，每个segment都是一个单独的文件，通常包含几百万行数据，这些segment是按照时间组织成的chunk，所以在按照时间查询数据时，效率非常高。

# 数据分区

任何分布式存储/计算系统，都需要对数据进行合理的分区，从而实现存储和计算的均衡，以及数据并行化。

而Druid本身处理的是事件数据，每条数据都会带有一个时间戳，所以很自然的就可以使用时间进行分区。

比如上图，我们指定了分区粒度为为天，那么每天的数据都会被单独存储和查询(一个分区下有多个Segment的原因往下看)。

使用时间分区我们很容易会想到一个问题，就是很可能每个时间段的数据量是不均衡的(想一想我们的业务场景)，而Duid为了解决这种问题，提供了“二级分区”，每一个二级分区称为一个Shard(这才是物理分区)。

通过设置每个Shard的所能存储的目标值和Shard策略，来完成shard的分区。

Druid目前支持两种Shard策略：Hash(基于维值的Hash)和Range(基于某个维度的取值范围)。

上图中，2000-01-01和2000-01-03的每个分区都是一个Shard，由于2000-01-02的数据量比较多，所以有两个Shard。

# Segment

Shard经过持久化之后就称为了Segment，Segment是数据存储、复制、均衡(Historical的负载均衡)和计算的基本单元了。

Segment具有不可变性，一个Segment一旦创建完成后(MiddleManager节点发布后)就无法被修改，只能通过生成一个新的Segment来代替旧版本的Segment。

## Segment 内部存储结构

接下来我们可以看下 Segment 文件的内部存储结构。

因为 Druid 采用列式存储，所以每列数据都是在独立的结构中存储(并不是独立的文件，是独立的数据结构，因为所有列都会存储在一个文件中)。

Segment中的数据类型主要分为三种：时间戳、维度列和指标列。

![分类](https://upload-images.jianshu.io/upload_images/4120356-83e0a515fd80b7e9.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1000/format/webp)

对于时间戳列和指标列，实际存储是一个数组，Druid采用LZ4压缩每列的整数或浮点数。

当收到查询请求后，会拉出所需的行数据(对于不需要的列不会拉出来)，并且对其进行解压缩。解压缩完之后，在应用具体的聚合函数。

对于维度列不会像指标列和时间戳这么简单，因为它需要支持filter和group by，所以Druid使用了字典编码(Dictionary Encoding)和位图索引(Bitmap Index)来存储每个维度列。

每个维度列需要三个数据结构：

需要一个字典数据结构，将维值(维度列值都会被认为是字符串类型)映射成一个整数ID。

使用上面的字典编码，将该列所有维值放在一个列表中。

对于列中不同的值，使用bitmap数据结构标识哪些行包含这些值。

Druid针对维度列之所以使用这三个数据结构，是因为：

使用字典将字符串映射成整数ID，可以紧凑的表示结构2和结构3中的值。

使用Bitmap位图索引可以执行快速过滤操作(找到符合条件的行号，以减少读取的数据量)，因为Bitmap可以快速执行AND和OR操作。

对于group by和TopN操作需要使用结构2中的列值列表。

我们以上面"Page"维度列为例，可以具体看下Druid是如何使用这三种数据结构存储维度列：

```
1. 使用字典将列值映射为整数
{
"Justin Bieher":0,
"ke$ha":1
}
2. 使用1中的编码，将列值放到一个列表中
[0,0,1,1]
3. 使用bitmap来标识不同列值
value = 0: [1,1,0,0] //1代表该行含有该值，0标识不含有
value = 1: [0,0,1,1]
```

前两种存储结构在最坏情况下会根据数据量增长而成线性增长(列数据中的每行都不相同)，而第三种由于使用Bitmap存储(本身是一个稀疏矩阵)，所以对它进行压缩，可以得到非常客观的压缩比。

Druid而且运用了Roaring Bitmap(http://roaringbitmap.org/)能够对压缩后的位图直接进行布尔运算，可以大大提高查询效率和存储效率(不需要解压缩)。


# Segment命名

高效的数据查询，不仅仅体现在文件内容的存储结构上，还有一点很重要，就是文件的命名上。

试想一下，如果一个Datasource下有几百万个Segment文件，我们又如何快速找出我们所需要的文件呢？

答案就是通过文件名称快速索引查找。

Segment 的命名包含四部分：数据源(Datasource)、时间间隔(包含开始时间和结束时间两部分)、版本号和分区(Segment有分片的情况下才会有)。

```
test-datasource_2018-05-21T16:00:00.000Z_2018-05-21T17:00:00.000Z_2018-05-21T16:00:00.000Z_1
数据源名称_开始时间_结束时间_版本号_分区
```

分片号是从0开始，如果分区号为0，则可以省略：test-datasource_2018-05-21T16:00:00.000Z_2018-05-21T17:00:00.000Z_2018-05-21T16:00:00.000Z
还需要注意如果一个时间间隔segment由多个分片组成，则在查询该segment的时候，需要等到所有分片都被加载完成后，才能够查询(除非使用线性分片规范(linear shard spec)，允许在未加载完成时查询)。


| 字段 | 是否必须 |  描述 |
|:---|:---|:---|
| datasource | 是 |  segment所在的Datasource |
| 开始时间 | 是 | 该Segment所存储最早的数据，时间格式是ISO 8601。开始时间和结束时间是通过segmentGranularity设置的时间间隔 |
| 结束时间 | 是 | 该segment所存储最晚的数据，时间格式是ISO 8601 |
| 版本号 | 是 | 因为Druid支持批量覆盖操作，当批量摄入与之前相同数据源、相同时间间隔数据时，数据就会被覆盖，这时候版本号就会被更新。Druid系统的其它部分感知到这个信号后，就会把就旧数据删除，使用新版本的数据(这个切换很快)。版本号也是是用的ISO 8601时间戳，但是这个时间戳代表首次启动的时间 |
| 分区号 | 否 | segment如果采用分区，才会有该标识 |


# Segment物理存储实例

## 例子

下面我们以一个实例来看下Segment到底以什么形式存储的，我们以本地导入方式将下面数据导入到Druid中。

```
{"time": "2018-11-01T00:47:29.913Z","city": "beijing","sex": "man","gmv": 20000}
{"time": "2018-11-01T00:47:33.004Z","city": "beijing","sex": "woman","gmv": 50000}
{"time": "2018-11-01T00:50:33.004Z","city": "shanghai","sex": "man","gmv": 10000}
```

我们以单机形式运行Druid，这样Druid生成的Segment文件都在${DRUID_HOME}/var/druid/segments 目录下。

segment通过datasource_beginTime_endTime_version_shard用于唯一标识，在实际存储中是以目录的形式表现的。

可以看到Segment中包含了Segment描述文件(descriptor.json)和压缩后的索引数据文件(index.zip)，我们主要看的也是index.zip这个文件，对其进行解压缩。

首先看下factory.json这个文件，这个文件并不是segment具体存储段数据的文件。

因为Druid通过使用MMap(一种内存映射文件的方式)的方式访问Segment文件，通过查看这个文件内容来看，貌似是用于MMap读取文件所使用的(不太了解MMap)?

# 应用

Druid/ES+Flink+Kafka/脉冲星

# 个人总结

1. 压缩算法。大量数据的读取。

2. MMAP 内存映射访问

3. 感觉原理是类似的。

提升性能的方式：无锁+零拷贝+索引

并行计算：map==>reduece

这里有一个特别的应用，压缩。

# 拓展阅读

[roaringbitmap 压缩算范](http://roaringbitmap.org/)

# 参考资料

[最火实时大数据 OLAP 技术原理和实践](http://www.raincent.com/content-10-9760-1.html)

[Druid高效架构](https://www.jianshu.com/p/7a26d9153455)

* any list
{:toc}