---
layout: post
title: 流式计算-storm trident-06
date:  2019-5-10 11:08:59 +0800
categories: [Stream]
tags: [stream, sh]
published: true
---

# Apache Storm Trident

Trident是Storm的延伸。像Storm，Trident也是由Twitter开发的。开发Trident的主要原因是在Storm上提供高级抽象，以及状态流处理和低延迟分布式查询。

Trident使用spout和bolt，但是这些低级组件在执行之前由Trident自动生成。 

Trident具有函数，过滤器，联接，分组和聚合。

Trident将流处理为一系列批次，称为事务。通常，这些小批量的大小将是大约数千或数百万个元组，这取决于输入流。这样，Trident不同于Storm，它执行元组一元组处理。

批处理概念非常类似于数据库事务。每个事务都分配了一个事务ID。该事务被认为是成功的，一旦其所有的处理完成。然而，处理事务的元组中的一个的失败将导致整个事务被重传。

对于每个批次，Trident将在事务开始时调用beginCommit，并在结束时提交。

# 认识storm trident

trident可以理解为storm批处理的高级抽象,提供了分组、分区、聚合、函数等操作,提供一致性和恰好一次处理的语义。

1)元祖被作为batch处理

2)每个batch的元祖都被指定唯一的一个事物id,如果因为处理失败导致batch重发,也和保证和重发前一样的事物id

3)数据更新操作严格有序,比如batch1必须在batch2之前被成功处理,且如果batch1失败了,后面的处理也会失败。

假如: 

batch1处理1--20

batch2处理21--40

batch1处理失败，那么batch2也会失败

虽然数据更新操作严格有序，但是数据处理阶段也可以并行的,只是最后的持久化操作必须有序。

## trident state

trident的状态具有仅仅处理一次,持续聚合的语义,使用trident来实现恰好一次的语义不需要开发人员去处理事务相关的工作,因为trident state已经帮我们封装好了,只需要编写类似于如下的代码：

```java
topology.newStream("sentencestream", spout)  
              .each(new Fields("sentence"), new Split(), new Fields("word"))  
              .groupBy(new Fields("word"))  
              .persistentAggregate(new MyHbaseState.HbaseFactory(options), new Count(), new Fields("count"))  
              .parallelismHint(3);
```

所有处理事务逻辑都在MyHbaseState.HbaseFactory中处理了(这个是我自己定义的,trident支持在内存里面处理,类似于MemachedState.opaque)。

trident提供了一个StateFactory用来创建State对象的实例,行如:

```java
public final class XFactory implements StateFactory{  
     public State makeState(Map conf,int partitonIndex,int numPartitions){  
          return new State();  
     }  
}  
```

## persistentAggregate

persistentAggregate是trident中用来更新来源的状态,如果前面是一个分好组的流,trident希望你提供的状态实现MapState接口,其中key是分组的字段,而聚合结果是状态的值。

## 实现MapStates

trident中实现MapState非常简单,只需要为这个类提供一个IBackingMap的接口实现接口。

# 组成元素

## Trident拓扑

Trident API公开了一个简单的选项，使用“TridentTopology”类创建Trident拓扑。

基本上，Trident拓扑从流出接收输入流，并对流上执行有序的操作序列（滤波，聚合，分组等）。

Storm元组被替换为Trident元组，bolt被操作替换。

一个简单的Trident拓扑可以创建如下 

```java
TridentTopology topology = new TridentTopology();
```

## Trident Tuples

Trident Tuples是一个命名的值列表。TridentTuple接口是Trident拓扑的数据模型。TridentTuple接口是可由Trident拓扑处理的数据的基本单位。

## Trident Spout

Trident spout与类似于Storm spout，附加选项使用Trident的功能。

实际上，我们仍然可以使用IRichSpout，我们在Storm拓扑中使用它，但它本质上是非事务性的，我们将无法使用Trident提供的优点。

具有使用Trident的特征的所有功能的基本spout是“ITridentSpout”。它支持事务和不透明的事务语义。

其他的spouts是IBatchSpout，IPartitionedTridentSpout和IOpaquePartitionedTridentSpout。

除了这些通用spouts，Trident有许多样品实施trident spout。

其中之一是FeederBatchSpout输出，我们可以使用它发送trident tuples的命名列表，而不必担心批处理，并行性等。

FeederBatchSpout创建和数据馈送可以如下所示完成 

```java
TridentTopology topology = new TridentTopology();
FeederBatchSpout testSpout = new FeederBatchSpout(
   ImmutableList.of("fromMobileNumber", "toMobileNumber", “duration”));
topology.newStream("fixed-batch-spout", testSpout)
testSpout.feed(ImmutableList.of(new Values("1234123401", "1234123402", 20)));
```

## Trident操作

Trident依靠“Trident操作”来处理trident tuples的输入流。

Trident API具有多个内置操作来处理简单到复杂的流处理。

这些操作的范围从简单验证到复杂的trident tuples分组和聚合。

让我们经历最重要和经常使用的操作。

# 过滤

过滤器是用于执行输入验证任务的对象。

Trident过滤器获取trident tuples字段的子集作为输入，并根据是否满足某些条件返回真或假。

如果返回true，则该元组保存在输出流中;否则，从流中移除元组。

过滤器将基本上继承自BaseFilter类并实现isKeep方法。

## 示例

这里是一个滤波器操作的示例实现 

```java
public class MyFilter extends BaseFilter {
   public boolean isKeep(TridentTuple tuple) {
      return tuple.getInteger(1) % 2 == 0;
   }
}
```

```
input

[1, 2]
[1, 3]
[1, 4]

output

[1, 2]
[1, 4]
```

## each 方法

可以使用“each”方法在拓扑中调用过滤器功能。

“Fields”类可以用于指定输入（trident tuple的子集）。

示例代码如下 

```java
TridentTopology topology = new TridentTopology();
topology.newStream("spout", spout).each(new Fields("a", "b"), new MyFilter())
```

# 函数

函数是用于对单个trident tuple执行简单操作的对象。

它需要一个trident tuple字段的子集，并发出零个或多个新的trident tuple字段。

函数基本上从BaseFunction类继承并实现execute方法。

## 示例

下面给出了一个示例实现：

```java
public class MyFunction extends BaseFunction {
   public void execute(TridentTuple tuple, TridentCollector collector) {
      int a = tuple.getInteger(0);
      int b = tuple.getInteger(1);
      collector.emit(new Values(a + b));
   }
}
```

```
input

[1, 2]
[1, 3]
[1, 4]

output

[1, 2, 3]
[1, 3, 4]
[1, 4, 5]
```

## 拓扑

与过滤操作类似，可以使用每个方法在拓扑中调用函数操作。

示例代码如下 

```java
TridentTopology topology = new TridentTopology();
topology.newStream("spout", spout)
   .each(new Fields(“a, b"), new MyFunction(), new Fields(“d")));
```

# 聚合

聚合是用于对输入批处理或分区或流执行聚合操作的对象。

## 三种类型

Trident有三种类型的聚合。

他们如下

aggregate -单独聚合每批trident tuple。在聚合过程期间，首先使用全局分组将元组重新分区，以将同一批次的所有分区组合到单个分区中。

partitionAggregate -聚合每个分区，而不是整个trident tuple。分区集合的输出完全替换输入元组。分区集合的输出包含单个字段元组。

persistentaggregate -聚合所有批次中的所有trident tuple，并将结果存储在内存或数据库中。

## 例子

```java
TridentTopology topology = new TridentTopology();

// aggregate operation
topology.newStream("spout", spout)
   .each(new Fields(“a, b"), new MyFunction(), new Fields(“d”))
   .aggregate(new Count(), new Fields(“count”))
    
// partitionAggregate operation
topology.newStream("spout", spout)
   .each(new Fields(“a, b"), new MyFunction(), new Fields(“d”))
   .partitionAggregate(new Count(), new Fields(“count"))
    
// persistentAggregate - saving the count to memory
topology.newStream("spout", spout)
   .each(new Fields(“a, b"), new MyFunction(), new Fields(“d”))
   .persistentAggregate(new MemoryMapState.Factory(), new Count(), new Fields("count"));
```


可以使用CombinerAggregator，ReducerAggregator或通用Aggregator接口创建聚合操作。

上面例子中使用的“计数”聚合器是内置聚合器之一，它使用“CombinerAggregator”实现，实现如下 

```java
public class Count implements CombinerAggregator<Long> {
   @Override
   public Long init(TridentTuple tuple) {
      return 1L;
   }
    
   @Override
   public Long combine(Long val1, Long val2) {
      return val1 + val2;
   }
    
   @Override
   public Long zero() {
      return 0L;
   }
}
```

## 分组

分组操作是一个内置操作，可以由groupBy方法调用。

groupBy方法通过在指定字段上执行partitionBy来重新分区流，然后在每个分区中，它将组字段相等的元组组合在一起。

通常，我们使用“groupBy”以及“persistentAggregate”来获得分组聚合。

示例代码如下 -

```java
TridentTopology topology = new TridentTopology();

// persistentAggregate - saving the count to memory
topology.newStream("spout", spout)
   .each(new Fields(“a, b"), new MyFunction(), new Fields(“d”))
   .groupBy(new Fields(“d”)
   .persistentAggregate(new MemoryMapState.Factory(), new Count(), new Fields("count"));
```

# 合并和连接

合并和连接可以分别通过使用“合并”和“连接”方法来完成。

合并组合一个或多个流。加入类似于合并，除了加入使用来自两边的trident tuple字段来检查和连接两个流的事实。

此外，加入将只在批量级别工作。

示例代码如下 

```java
TridentTopology topology = new TridentTopology();
topology.merge(stream1, stream2, stream3);
topology.join(stream1, new Fields("key"), stream2, new Fields("x"), 
   new Fields("key", "a", "b", "c"));
```

# 状态维护

## Trident提供了状态维护的机制。

状态信息可以存储在拓扑本身中，否则也可以将其存储在单独的数据库中。

原因是维护一个状态，如果任何元组在处理过程中失败，则重试失败的元组。

这会在更新状态时产生问题，因为您不确定此元组的状态是否已在之前更新过。

如果在更新状态之前元组已经失败，则重试该元组将使状态稳定。

然而，如果元组在更新状态后失败，则重试相同的元组将再次增加数据库中的计数并使状态不稳定。

需要执行以下步骤以确保消息仅处理一次

## 小批量处理元组。

为每个批次分配唯一的ID。如果重试批次，则给予相同的唯一ID。

状态更新在批次之间排序。例如，第二批次的状态更新将不可能，直到第一批次的状态更新完成为止。

# 分布式RPC

分布式RPC用于查询和检索Trident拓扑结果。 

Storm有一个内置的分布式RPC服务器。

分布式RPC服务器从客户端接收RPC请求并将其传递到拓扑。

拓扑处理请求并将结果发送到分布式RPC服务器，分布式RPC服务器将其重定向到客户端。

Trident的分布式RPC查询像正常的RPC查询一样执行，除了这些查询并行运行的事实。

# 什么时候使用Trident？

在许多使用情况下，如果要求是只处理一次查询，我们可以通过在Trident中编写拓扑来实现。

另一方面，在Storm的情况下将难以实现精确的一次处理。

因此，Trident将对那些需要一次处理的用例有用。

**Trident不适用于所有用例，特别是高性能用例，因为它增加了Storm的复杂性并管理状态。**

# Trident的工作实例

我们将把上一节中制定的呼叫日志分析器应用程序转换为Trident框架。

由于其高级API，Trident应用程序将比普通风暴更容易。

Storm基本上需要执行Trident中的Function，Filter，Aggregate，GroupBy，Join和Merge操作中的任何一个。

最后，我们将使用LocalDRPC类启动DRPC服务器，并使用LocalDRPC类的execute方法搜索一些关键字。

## 格
式化呼叫信息
FormatCall类的目的是格式化包括“呼叫者号码”和“接收者号码”的呼叫信息。

完整的程序代码如下

```java
import backtype.storm.tuple.Values;

import storm.trident.operation.BaseFunction;
import storm.trident.operation.TridentCollector;
import storm.trident.tuple.TridentTuple;

public class FormatCall extends BaseFunction {
   @Override
   public void execute(TridentTuple tuple, TridentCollector collector) {
      String fromMobileNumber = tuple.getString(0);
      String toMobileNumber = tuple.getString(1);
      collector.emit(new Values(fromMobileNumber + " - " + toMobileNumber));
   }
}
```

## CSVSplit

CSVSplit类的目的是基于“comma（，）”拆分输入字符串，并发出字符串中的每个字。

此函数用于解析分布式查询的输入参数。

完整的代码如下

```java
import backtype.storm.tuple.Values;

import storm.trident.operation.BaseFunction;
import storm.trident.operation.TridentCollector;
import storm.trident.tuple.TridentTuple;

public class CSVSplit extends BaseFunction {
   @Override
   public void execute(TridentTuple tuple, TridentCollector collector) {
      for(String word: tuple.getString(0).split(",")) {
         if(word.length() > 0) {
            collector.emit(new Values(word));
         }
      }
   }
}
```

## 日志分析器

这是主要的应用程序。

最初，应用程序将使用FeederBatchSpout初始化TridentTopology并提供调用者信息。

Trident拓扑流可以使用TridentTopology类的newStream方法创建。

类似地，Trident拓扑DRPC流可以使用TridentTopology类的newDRCPStream方法创建。

可以使用LocalDRPC类创建一个简单的DRCP服务器。

LocalDRPC有execute方法来搜索一些关键字。

完整的代码如下。

```java
import java.util.*;

import backtype.storm.Config;
import backtype.storm.LocalCluster;
import backtype.storm.LocalDRPC;
import backtype.storm.utils.DRPCClient;
import backtype.storm.tuple.Fields;
import backtype.storm.tuple.Values;

import storm.trident.TridentState;
import storm.trident.TridentTopology;
import storm.trident.tuple.TridentTuple;

import storm.trident.operation.builtin.FilterNull;
import storm.trident.operation.builtin.Count;
import storm.trident.operation.builtin.Sum;
import storm.trident.operation.builtin.MapGet;
import storm.trident.operation.builtin.Debug;
import storm.trident.operation.BaseFilter;

import storm.trident.testing.FixedBatchSpout;
import storm.trident.testing.FeederBatchSpout;
import storm.trident.testing.Split;
import storm.trident.testing.MemoryMapState;

import com.google.common.collect.ImmutableList;

public class LogAnalyserTrident {
   public static void main(String[] args) throws Exception {
      System.out.println("Log Analyser Trident");
      TridentTopology topology = new TridentTopology();
        
      FeederBatchSpout testSpout = new FeederBatchSpout(ImmutableList.of("fromMobileNumber",
         "toMobileNumber", "duration"));

      TridentState callCounts = topology
         .newStream("fixed-batch-spout", testSpout)
         .each(new Fields("fromMobileNumber", "toMobileNumber"), 
         new FormatCall(), new Fields("call"))
         .groupBy(new Fields("call"))
         .persistentAggregate(new MemoryMapState.Factory(), new Count(), 
         new Fields("count"));

      LocalDRPC drpc = new LocalDRPC();

      topology.newDRPCStream("call_count", drpc)
         .stateQuery(callCounts, new Fields("args"), new MapGet(), new Fields("count"));

      topology.newDRPCStream("multiple_call_count", drpc)
         .each(new Fields("args"), new CSVSplit(), new Fields("call"))
         .groupBy(new Fields("call"))
         .stateQuery(callCounts, new Fields("call"), new MapGet(), 
         new Fields("count"))
         .each(new Fields("call", "count"), new Debug())
         .each(new Fields("count"), new FilterNull())
         .aggregate(new Fields("count"), new Sum(), new Fields("sum"));

      Config conf = new Config();
      LocalCluster cluster = new LocalCluster();
      cluster.submitTopology("trident", conf, topology.build());
      Random randomGenerator = new Random();
      int idx = 0;
        
      while(idx < 10) {
         testSpout.feed(ImmutableList.of(new Values("1234123401", 
            "1234123402", randomGenerator.nextInt(60))));

         testSpout.feed(ImmutableList.of(new Values("1234123401", 
            "1234123403", randomGenerator.nextInt(60))));

         testSpout.feed(ImmutableList.of(new Values("1234123401", 
            "1234123404", randomGenerator.nextInt(60))));

         testSpout.feed(ImmutableList.of(new Values("1234123402", 
            "1234123403", randomGenerator.nextInt(60))));

         idx = idx + 1;
      }

      System.out.println("DRPC : Query starts");
      System.out.println(drpc.execute("call_count","1234123401 - 1234123402"));
      System.out.println(drpc.execute("multiple_call_count", "1234123401 -
         1234123402,1234123401 - 1234123403"));
      System.out.println("DRPC : Query ends");

      cluster.shutdown();
      drpc.shutdown();

      // DRPCClient client = new DRPCClient("drpc.server.location", 3772);
   }
}
```

# 参考资料

- 官方

[Apache Storm 官方文档 —— Trident State](http://ifeve.com/storm-trident-state/)

[Apache Storm 官方文档 —— Trident 教程](http://ifeve.com/storm-trident-tutorial/)

- other

[storm trident实战 trident state](https://www.iteye.com/blog/workman666-2347168)

[Apache Storm Trident](https://www.jianshu.com/p/78df6483110b)

[Apache Storm技术实战之3 -- TridentWordCount](https://www.cnblogs.com/hseagle/p/3516458.html)


* any list
{:toc}