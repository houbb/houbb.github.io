---
layout: post
title:  Apache Hadoop v3.3.6-21-Enabling Dapper-like Tracing in Hadoop
date:  2017-12-06 05:47:35 +0800
categories: [Apache]
tags: [apache, big-data, hadoop]
published: true
---

# **Hadoop中的Dapper风格跟踪**

**HTrace**
HDFS-5274在HDFS中增加了对请求进行跟踪的支持，使用了开源跟踪库Apache HTrace。设置跟踪相当简单，但需要对客户端代码进行一些非常小的更改。

**SpanReceivers**
跟踪系统通过收集名为"Spans"的结构中的信息来工作。您可以通过使用HTrace捆绑的SpanReceiver接口的实现或自行实现该接口来选择如何接收此信息。

HTrace提供了一些选项，例如：

- FlumeSpanReceiver
- HBaseSpanReceiver
- HTracedRESTReceiver
- ZipkinSpanReceiver

请参阅core-default.xml以获取HTrace配置键的描述。在某些情况下，您还需要将包含正在使用的SpanReceiver的jar添加到每个节点上的Hadoop的类路径中（在上面的示例中，LocalFileSpanReceiver包含在与Hadoop捆绑的htrace-core4 jar中）。

```bash
$ cp htrace-htraced/target/htrace-htraced-4.1.0-incubating.jar $HADOOP_HOME/share/hadoop/common/lib/
```

# **动态更新跟踪配置**

您可以使用`hadoop trace`命令查看和更新每个服务器的跟踪配置。必须通过 `-host` 选项指定namenode或datanode的IPC服务器地址。如果要更新所有服务器的配置，则需要对所有服务器运行该命令。

`hadoop trace -list` 显示与id关联的加载的跨度接收器列表。

```bash
$ hadoop trace -list -host 192.168.56.2:9000
ID  CLASS
1   org.apache.htrace.core.LocalFileSpanReceiver

$ hadoop trace -list -host 192.168.56.2:9867
ID  CLASS
1   org.apache.htrace.core.LocalFileSpanReceiver
```

`hadoop trace -remove` 从服务器中删除跨度接收器。 `-remove` 选项以跨度接收器的id作为参数。

```bash
$ hadoop trace -remove 1 -host 192.168.56.2:9000
Removed trace span receiver 1
```

`hadoop trace -add` 将跨度接收器添加到服务器。您需要通过 `-class` 选项的参数指定跨度接收器的类名。您可以通过 `-Ckey=value` 选项指定与跨度接收器关联的配置。

```bash
$ hadoop trace -add -class org.apache.htrace.core.LocalFileSpanReceiver -Chadoop.htrace.local.file.span.receiver.path=/tmp/htrace.out -host 192.168.56.2:9000
Added trace span receiver 2 with configuration hadoop.htrace.local.file.span.receiver.path = /tmp/htrace.out

$ hadoop trace -list -host 192.168.56.2:9000
ID  CLASS
2   org.apache.htrace.core.LocalFileSpanReceiver
```

如果集群已启用Kerberos，则必须使用 `-principal` 选项指定服务主体名称。例如，显示namenode的跨度接收器列表：

```bash
$ hadoop trace -list -host NN1:8020 -principal namenode/NN1@EXAMPLE.COM
```

或者，显示datanode的跨度接收器列表：

```bash
$ hadoop trace -list -host DN2:9867 -principal datanode/DN1@EXAMPLE.COM
```

# **使用HTrace API开始跟踪跨度**

为了进行跟踪，您需要将被跟踪的逻辑包装在跟踪跨度中，如下所示。当有运行中的跟踪跨度时，跟踪信息将随着RPC请求传播到服务器。

```java
import org.apache.hadoop.hdfs.HdfsConfiguration;
import org.apache.htrace.core.Tracer;
import org.apache.htrace.core.TraceScope;

...

...

TraceScope ts = tracer.newScope("Gets");
try {
  ... // 被跟踪的逻辑
} finally {
  ts.close();
}
```

# **使用HTrace API进行跟踪的示例代码**

下面的`TracingFsShell.java`是FsShell的包装器，在调用HDFS shell命令之前启动跟踪跨度。

```java
import org.apache.hadoop.fs.FileSystem;
import org.apache.hadoop.fs.Path;
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.conf.Configured;
import org.apache.hadoop.tracing.TraceUtils;
import org.apache.hadoop.util.Tool;
import org.apache.hadoop.util.ToolRunner;
import org.apache.htrace.core.Tracer;
import org.apache.htrace.core.TraceScope;

public class Sample extends Configured implements Tool {
  @Override
  public int run(String argv[]) throws Exception {
    FileSystem fs = FileSystem.get(getConf());
    Tracer tracer = new Tracer.Builder("Sample").
        conf(TraceUtils.wrapHadoopConf("sample.htrace.", getConf())).
        build();
    int res = 0;
    try (TraceScope scope = tracer.newScope("sample")) {
      Thread.sleep(1000);
      fs.listStatus(new Path("/"));
    }
    tracer.close();
    return res;
  }
  
  public static void main(String argv[]) throws Exception {
    ToolRunner.run(new Sample(), argv);
  }
}
```

您可以按照下面的方式编译和执行此代码。

```bash
$ javac -cp `hadoop classpath` Sample.java
$ java -cp .:`hadoop classpath` Sample \
    -Dsample.htrace.span.receiver.classes=LocalFileSpanReceiver \
    -Dsample.htrace.sampler.classes=AlwaysSampler
```

这段代码演示了如何使用HTrace API对逻辑进行跟踪。在这个例子中，我们使用了`LocalFileSpanReceiver`和`AlwaysSampler`。您可以根据需要更改这些配置。

# **通过文件系统Shell启动跟踪跨度**

文件系统Shell可以通过配置属性启用跟踪。

在core-site.xml或命令行中通过属性`fs.client.htrace.sampler.classes`和`fs.client.htrace.spanreceiver.classes`配置跨度接收器和采样器。

```bash
$ hdfs dfs -Dfs.shell.htrace.span.receiver.classes=LocalFileSpanReceiver \
           -Dfs.shell.htrace.sampler.classes=AlwaysSampler \
           -ls /
```

# **通过配置为HDFS客户端启动跟踪跨度**

DFSClient可以在内部启用跟踪。这允许您在不修改客户端源代码的情况下使用HTrace。

通过属性`fs.client.htrace.sampler.classes`和`fs.client.htrace.spanreceiver.classes`在hdfs-site.xml中配置跨度接收器和采样器。

`fs.client.htrace.sampler.classes`的值可以是`NeverSampler`、`AlwaysSampler`或`ProbabilitySampler`。

- `NeverSampler`：对于所有对namenodes和datanodes的请求，HTrace处于关闭状态；
- `AlwaysSampler`：对于所有对namenodes和datanodes的请求，HTrace处于打开状态；
- `ProbabilitySampler`：对于namenodes和datanodes的某个百分比%的请求，HTrace处于打开状态。

```xml
<property>
  <name>hadoop.htrace.span.receiver.classes</name>
  <value>LocalFileSpanReceiver</value>
</property>
<property>
  <name>fs.client.htrace.sampler.classes</name>
  <value>ProbabilitySampler</value>
</property>
<property>
  <name>fs.client.htrace.sampler.fraction</name>
  <value>0.01</value>
</property>
```

这些配置用于在HDFS客户端中启用跟踪。

在这个例子中，我们使用了`LocalFileSpanReceiver`作为跨度接收器，并使用了`ProbabilitySampler`进行采样，采样的百分比是0.01。

您可以根据需要更改这些配置。

# 参考资料

https://hadoop.apache.org/docs/stable/hadoop-project-dist/hadoop-common/Tracing.html

* any list
{:toc}