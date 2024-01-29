---
layout: post
title: ETL-12-apache SeaTunnel Transform QA
date: 2024-01-05 21:01:55 +0800
categories: [ETL]
tags: [etl, sh]
published: true
---

# 1. 为什么我需要安装类似Spark或Flink的计算引擎？

SeaTunnel目前使用诸如Spark和Flink的计算引擎来完成资源调度和节点通信，这样我们可以专注于数据同步的易用性和高性能组件的开发。但这只是暂时的。

## 2. 我有一个问题，而且我自己解决不了。

在使用SeaTunnel时，我遇到了一个问题，而我自己解决不了。

我该怎么办？首先，在问题列表或邮件列表中搜索，看看是否有人已经提过同样的问题并得到了答案。如果找不到问题的答案，您可以通过以下方式与社区成员联系寻求帮助。

> [方式](https://github.com/apache/seatunnel#contact-us)

## 3. 如何声明一个变量？

您想知道如何在SeaTunnel的配置中声明一个变量，然后在运行时动态替换变量的值吗？

从v1.2.4开始，SeaTunnel支持在配置中进行变量替换。此功能通常用于定时或非定时的离线处理，以替换时间和日期等变量。使用方法如下：

在配置中配置变量名称。以下是sql transform的示例（实际上，配置文件中的“key = value”中的任何位置都可以使用变量替换）：

```yaml
...
transform {
  sql {
    query = "select * from user_view where city ='"${city}"' and dt = '"${date}"'"
  }
}
...
```

以Spark本地模式为例，启动命令如下：

```bash
./bin/start-seatunnel-spark.sh \
-c ./config/your_app.conf \
-e client \
-m local[2] \
-i city=shanghai \
-i date=20190319
```

您可以使用参数-i或--variable，后跟key=value来指定变量的值，其中key需要与配置中的变量名相同。

## 4. 如何在配置文件中编写多行文本的配置项？

当配置的文本非常长且需要换行时，您可以使用三个双引号表示其起始和结束：

```yaml
var = """
 whatever you want
"""
```

## 5. 如何在多行文本中实现变量替换？

在多行文本中进行变量替换有些繁琐，因为变量不能包含在三个双引号中：

```yaml
var = """
your string 1
"""${your_var}""" your string 2"""
```

请参考：[lightbend/config#456](https://github.com/lightbend/config/issues/456)。

## 6. SeaTunnel是否有配置多个源的案例，例如同时在source中配置elasticsearch和hdfs？

```yaml
env {
    ...
}

source {
  hdfs { ... }  
  elasticsearch { ... }
  jdbc {...}
}

transform {
    ...
}

sink {
    elasticsearch { ... }
}
```

## 7. SeaTunnel是否有HBase插件？

SeaTunnel有一个HBase输入插件，您可以从这里下载：[https://github.com/garyelephant/waterdrop-input-hbase](https://github.com/garyelephant/waterdrop-input-hbase)。

如何使用SeaTunnel将数据写入Hive？
```yaml
env {
  spark.sql.catalogImplementation = "hive"
  spark.hadoop.hive.exec.dynamic.partition = "true"
  spark.hadoop.hive.exec.dynamic.partition.mode = "nonstrict"
}

source {
  sql = "insert into ..."
}

sink {
    // 数据已通过sql源写入hive。这只是一个占位符，实际上并不起作用。
    stdout {
        limit = 1
    }
}
```

此外，在1.x分支的1.5.7版本之后，SeaTunnel实现了一个Hive输出插件；在2.x分支中，从2.0.5版本开始支持Spark引擎的Hive插件：[https://github.com/apache/seatunnel/issues/910](https://github.com/apache/seatunnel/issues/910)。


## 8. SeaTunnel如何将数据写入多个ClickHouse实例以实现负载均衡？

1. **直接写入分布式表（不推荐）:**
   直接写入分布式表，但这不是推荐的做法。

   ```yaml
   output {
       clickhouse {
           host = "ck-proxy.xx.xx:8123"
           # 本地表
           table = "table_name"
       }
   }
   ```

2. **在多个ClickHouse实例前添加代理或域名（DNS）:**
   配置中添加代理或域名，如下所示：

   ```yaml
   output {
       clickhouse {
           host = "ck1:8123,ck2:8123,ck3:8123"
           # 本地表
           table = "table_name"
       }
   }
   ```

3. **使用集群模式:**
   使用集群模式，配置只需指定一个主机，如下所示：

   ```yaml
   output {
       clickhouse {
           # 仅配置一个主机
           host = "ck1:8123"
           cluster = "clickhouse_cluster_name"
           # 本地表
           table = "table_name"
       }
   }
   ```

请根据您的具体需求和环境选择适当的配置方式。在第二种和第三种配置中，多个实例或集群的配置可以提供负载均衡和容错能力。

## 9. 解决SeaTunnel在消费Kafka时出现OOM的问题通常是因为没有对消费进行速率限制。解决方案如下：

对于当前Spark消费Kafka的限制：

假设使用KafkaStream消费Kafka Topic 1的分区数为N。

假设Topic 1的消息生产者（Producer）的消息生产速度为K条/秒，写入消息到分区的速度必须是均匀的。

假设经过测试，发现每个Spark Executor每核每秒的处理能力为M。

可以得出以下结论：

- 如果希望Spark对Topic 1的消费跟上其生产速度，那么需要配置 `spark.executor.cores * spark.executor.instances >= K / M`。

- 当发生数据延迟时，如果希望消费速度不要太快，导致Spark Executor出现OOM，那么需要配置 `spark.streaming.kafka.maxRatePerPartition <= (spark.executor.cores * spark.executor.instances) * M / N`。

通常情况下，M和N都是已知的，可以从第2个结论中得出结论：`spark.streaming.kafka.maxRatePerPartition` 的大小与 `spark.executor.cores * spark.executor.instances` 的大小呈正相关关系，可以在增加资源的同时增加 `maxRatePerPartition` 的大小以加快消费速度。

![kafka](https://seatunnel.apache.org/assets/images/kafka-301f0a97a236a8f8d50d0594d05e4a3e.png)

## 10. 如何解决异常 "Exception in thread 'main' java.lang.NoSuchFieldError: INSTANCE"？

这个错误通常是由于Spark的CDH版本附带的httpclient.jar版本较低，而ClickHouse JDBC所依赖的httpclient版本是4.5.2，导致包版本冲突。

解决方法是将CDH附带的httpclient.jar包替换为版本为4.5.2的httpclient。

## 11. 我Spark集群的默认JDK版本是JDK7。在安装JDK8后，如何指定SeaTunnel使用JDK8启动？

在SeaTunnel的配置文件中，可以通过以下配置指定使用JDK8启动：

```yaml
spark {
  ...
  spark.executorEnv.JAVA_HOME="/your/java_8_home/directory"
  spark.yarn.appMasterEnv.JAVA_HOME="/your/java_8_home/directory"
  ...
}
```

在上述配置中，将`/your/java_8_home/directory`替换为你实际安装JDK8的目录路径。

这样SeaTunnel在启动时将使用指定的JDK8版本。

## 12. 如何为SeaTunnel在Yarn上指定不同的JDK版本？

例如，如果要将JDK版本设置为JDK8，有两种情况：

1. **Yarn集群已部署了JDK8，但默认JDK不是JDK8：**
   在SeaTunnel配置文件中添加两个配置：

    ```yaml
    env {
        ...
        spark.executorEnv.JAVA_HOME="/your/java_8_home/directory"
        spark.yarn.appMasterEnv.JAVA_HOME="/your/java_8_home/directory"
        ...
    }
    ```

   将`/your/java_8_home/directory`替换为实际安装JDK8的目录路径。这样SeaTunnel在Yarn上启动时将使用指定的JDK8版本。

2. **Yarn集群未部署JDK8：**
   在这种情况下，可以使用已安装的JDK8启动SeaTunnel。详细操作请参考[这里](https://www.cnblogs.com/jasondan/p/spark-specific-jdk-version.html)。

## 13. 如果在Spark的本地模式（local[*]）下运行SeaTunnel时一直出现OOM，该怎么办？

如果在本地模式下运行，您需要修改`start-seatunnel.sh`启动脚本。

在`spark-submit`之后，添加一个参数 `--driver-memory 4g`。在正常情况下，本地模式不会在生产环境中使用。

因此，在Yarn上通常不需要设置此参数。详细信息请参考[Application Properties](https://spark.apache.org/docs/latest/configuration.html#application-properties)。

## 14. 在SeaTunnel中，如何加载自己编写的插件或第三方jdbc.jars？

将Jar包放置在指定的插件目录结构下：

```bash
cd SeaTunnel
mkdir -p plugins/my_plugins/lib
cp third-part.jar plugins/my_plugins/lib
```

这里的`my_plugins`可以是任意字符串，而`third-part.jar`代表第三方JAR文件。

SeaTunnel-v1（Spark）中如何配置与日志相关的参数？

有三种配置日志相关参数的方式（例如日志级别）：

1. **[不推荐] 更改默认的 $SPARK_HOME/conf/log4j.properties。**
   这会影响通过 $SPARK_HOME/bin/spark-submit 提交的所有程序。

2. **[不推荐] 直接在SeaTunnel的Spark代码中修改与日志相关的参数。**
   这等同于写死代码，每次更改都需要重新编译。

3. **[推荐] 使用以下方法在SeaTunnel配置文件中更改日志配置（此更改仅在 SeaTunnel >= 1.5.5 时生效）:**

```yaml
env {
    spark.driver.extraJavaOptions = "-Dlog4j.configuration=file:<file path>/log4j.properties"
    spark.executor.extraJavaOptions = "-Dlog4j.configuration=file:<file path>/log4j.properties"
}
source {
  ...
}
transform {
 ...
}
sink {
  ...
}
```

参考以下是log4j配置文件的内容：

```bash
$ cat log4j.properties
log4j.rootLogger=ERROR, console

# 为这些组件设置日志级别
log4j.logger.org=ERROR
log4j.logger.org.apache.spark=ERROR
log4j.logger.org.spark-project=ERROR
log4j.logger.org.apache.hadoop=ERROR
log4j.logger.io.netty=ERROR
log4j.logger.org.apache.zookeeper=ERROR

# 向控制台添加 ConsoleAppender 以将日志写入控制台
log4j.appender.console=org.apache.log4j.ConsoleAppender
log4j.appender.console.layout=org.apache.log4j.PatternLayout
# 使用简单的消息格式
log4j.appender.console.layout.ConversionPattern=%d{yyyy-MM-dd HH:mm:ss} %-5p %c{1}:%L - %m%n
```



## 15. 如何配置SeaTunnel-v2（Spark、Flink）中与日志相关的参数？

目前，无法直接设置这些参数，您需要修改SeaTunnel的启动脚本。相关参数是在任务提交命令中指定的。有关具体参数，请参考官方文档：

- Spark 官方文档：[http://spark.apache.org/docs/latest/configuration.html#configuring-logging](http://spark.apache.org/docs/latest/configuration.html#configuring-logging)
- Flink 官方文档：[https://ci.apache.org/projects/flink/flink-docs-stable/monitoring/logging.html](https://ci.apache.org/projects/flink/flink-docs-stable/monitoring/logging.html)

参考链接：

- [Stack Overflow: How to stop info messages displaying on Spark console](https://stackoverflow.com/questions/27781187/how-to-stop-info-messages-displaying-on-spark-console)
- [Spark 官方文档: Configuring Logging](http://spark.apache.org/docs/latest/configuration.html#configuring-logging)
- [Medium: Spark Logging Configuration in YARN](https://medium.com/@iacomini.riccardo/spark-logging-configuration-in-yarn-faf5ba5fdb01)

## 16. 在向ClickHouse写入数据时出现ClassCastException的错误，该如何解决？

在SeaTunnel中，数据类型不会被主动转换。在Input读取数据后，需要严格匹配字段类型，并在写入ClickHouse时解决类型不匹配的问题。可以通过以下两个插件实现数据转换：

1. Filter Convert plugin
2. Filter Sql plugin

更详细的数据类型转换参考：[ClickHouse Data Type Check List](https://clickhouse.com/docs/en/sql-reference/data-types/)

关于如何访问启用Kerberos身份验证的HDFS、YARN、Hive等资源，请参考：[Issue #590](https://github.com/apache/seatunnel/issues/590)

## 17. 如何排查NoClassDefFoundError、ClassNotFoundException等问题？

出现这些问题的高概率原因是Java类路径中加载了多个不同版本的相应Jar包类，由于加载顺序的冲突，而不是因为真的缺少Jar。

通过在spark-submit提交部分添加以下参数，通过输出日志详细调试。

```bash
spark-submit --verbose
    ...
   --conf 'spark.driver.extraJavaOptions=-verbose:class'
   --conf 'spark.executor.extraJavaOptions=-verbose:class'
    ...
```



## 18. 如何使用 SeaTunnel 在 HDFS 集群之间同步数据？

只需正确配置 `hdfs-site.xml` 即可。参考链接：[https://www.cnblogs.com/suanec/p/7828139.html](https://www.cnblogs.com/suanec/p/7828139.html)。

## 19. 我想学习 SeaTunnel 的源代码。从哪里开始？

SeaTunnel 的源代码实现非常抽象和结构化，很多人选择使用 SeaTunnel 作为学习 Spark 的一种方式。你可以从主程序入口 `SeaTunnel.java` 开始学习源代码。

## 20. 当 SeaTunnel 开发人员开发自己的插件时，他们需要理解 SeaTunnel 的代码吗？这些插件是否需要集成到 SeaTunnel 项目中？

开发人员开发的插件与 SeaTunnel 项目无关，不需要将插件代码包含在 SeaTunnel 项目中。

插件可以完全独立于 SeaTunnel 项目，因此您可以使用 Java、Scala、Maven、sbt、Gradle 或任何您喜欢的方式进行编写。这也是我们建议开发人员开发插件的方式。

## 21. 当我导入一个项目时，编译器报错 "class not found org.apache.seatunnel.shade.com.typesafe.config.Config" 怎么办？

首先运行 `mvn install`。在 `seatunnel-config/seatunnel-config-base` 子项目中，`com.typesafe.config` 包已经被重新定位为 `org.apache.seatunnel.shade.com.typesafe.config` 并安装到了 `seatunnel-config/seatunnel-config-shade` 子项目中的 Maven 本地仓库。

# 参考资料

https://seatunnel.apache.org/docs/2.3.3/faq

* any list
{:toc}