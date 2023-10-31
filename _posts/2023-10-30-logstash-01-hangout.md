---
layout: post
title: logstash java 实现 hangout-01-overview
date: 2023-10-30 21:01:55 +0800
categories: [Log]
tags: [log, sh]
published: true
---


# 说明

模仿[logstash](https://www.elastic.co/products/logstash)做的一个应用.  

现在我们迁移到了 [https://github.com/childe/gohangout](https://github.com/childe/gohangout) , 这个项目基本上停止更新了.

最近在将部分内容进行代码上的优化。

This product includes GeoLite2 data created by MaxMind, available from
[http://www.maxmind.com](http://www.maxmind.com)

我们一直用logstash从Kafka消费数据进ES, 随着数据量的越来越大, 需要的logstash实例和机器也越来越多. 

于是就拿java实现了一下目前我们用到的Logstash的插件.   做为java初学者, 肯定有很多地方写的不好.

- input
	 * stdin
	 * kafka
	 * newKafka
- output
	* elastickseach
	* kafka
	* stdout  
- filter
	* Grok
	* Date 
	* Json
	* Gsub
	* Drop
	* Trim
	* Translate
	* Rename
	* Lowercase
	* Uppercase
	* Remove
	* Add
	* KV
	* URLDecode
	* GeoIP2
	* Filters
	
用一个典型配置做测试, 包括Grok Date AddField If条件判断等, 吞吐量是Logstash的5倍左右 .

不压测吞吐量, 正常消费的情况下, CPU使用率大概是Logstash的50%到25%.



# 本地运行实战


``

## 如何安装

> [如何安装](https://github.com/childe/hangout/issues/2)

简单说的话

如果是想自己从源码编译, git clone之后, mvn package 打包. 

```sh
mvn package  -DskipTests=true
```

然后运行:

```
java -cp target/hangout-0.1.2-with-dependencies.jar -f app.yml -l /var/log/hangout/app.yml.log
```

也有我打包好的, 你可以直接下载 https://github.com/childe/hangout/releases. 下载解压后运行

bin/hangout -f app.yml -l /var/log/hangout/app.yml.log

## windows10 实际运行笔记

我们下在 release 文件，并且解压

文件夹

```
PS D:\tool\hangout-dist-0.4.0-release-bin> ls


    目录: D:\tool\hangout-dist-0.4.0-release-bin


Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
d-----         2018/8/16     15:59                bin
d-----         2018/8/16     13:43                conf
d-----          2018/9/7     16:24                libs
d-----          2018/9/7     16:24                modules
-a----          2017/5/3     17:01           1100 LICENSE
-a----         2017/9/12     17:45            362 log4j2.xml
-a----         2018/8/16     15:59          15774 README.MD
```

然后运行命令

```sh
bin/hangout.cmd -f simpletest.yml
```


### 报错1

```
program files is not a xxx
```

这个是 jdk 目录包含空格导致的。


解决思路：移除 jdk 的空格。

JAVA_HOME 调整：

```
C:\Program Files\Java\jdk1.8.0_192
```

改为

```
D:\tools\jdk\jdk1.8.0_192
```

避免出现空格。

### 报错 2

```
Hangout  Version:0.4.0  Copyright @Ctrip   Author : childe@github, gnuhpc@github
2023-10-30 23:58:54,505 [main] ERROR com.ctrip.ops.sysdev.cmd.Main - failed to pares config file : simpletest.yml
java.io.FileNotFoundException: simpletest.yml (系统找不到指定的文件。)
        at java.io.FileInputStream.open0(Native Method) ~[?:1.8.0_192]
        at java.io.FileInputStream.open(FileInputStream.java:195) ~[?:1.8.0_192]
        at java.io.FileInputStream.<init>(FileInputStream.java:138) ~[?:1.8.0_192]
        at config.HangoutConfig.parse(HangoutConfig.java:28) ~[hangout-cmd-0.4.0.jar:?]
        at com.ctrip.ops.sysdev.cmd.Main.main(Main.java:40) [hangout-cmd-0.4.0.jar:?]
```

对应的配置文件找不到。

```sh
bin/hangout.cmd -f conf/simpletest.yml
```

### 报错 3

```
java.lang.reflect.InvocationTargetException
        at sun.reflect.NativeConstructorAccessorImpl.newInstance0(Native Method)
        at sun.reflect.NativeConstructorAccessorImpl.newInstance(NativeConstructorAccessorImpl.java:62)
        at sun.reflect.DelegatingConstructorAccessorImpl.newInstance(DelegatingConstructorAccessorImpl.java:45)
        at java.lang.reflect.Constructor.newInstance(Constructor.java:423)
        at com.ctrip.ops.sysdev.cmd.TopologyBuilder.lambda$null$2(TopologyBuilder.java:94)
        at java.util.Iterator.forEachRemaining(Iterator.java:116)
        at java.util.Spliterators$IteratorSpliterator.forEachRemaining(Spliterators.java:1801)
        at java.util.stream.ReferencePipeline$Head.forEach(ReferencePipeline.java:580)
        at com.ctrip.ops.sysdev.cmd.TopologyBuilder.lambda$buildFilters$3(TopologyBuilder.java:78)
        at java.util.ArrayList$ArrayListSpliterator.forEachRemaining(ArrayList.java:1382)
        at java.util.stream.ReferencePipeline$Head.forEach(ReferencePipeline.java:580)
        at com.ctrip.ops.sysdev.cmd.TopologyBuilder.buildFilters(TopologyBuilder.java:77)
        at com.ctrip.ops.sysdev.cmd.TopologyBuilder.buildTopology(TopologyBuilder.java:182)
        at com.ctrip.ops.sysdev.cmd.Main.main(Main.java:58)
Caused by: java.lang.NoClassDefFoundError: org/apache/logging/log4j/util/ReflectionUtil
        at org.apache.logging.slf4j.Log4jLoggerFactory.getContext(Log4jLoggerFactory.java:42)
        at org.apache.logging.log4j.spi.AbstractLoggerAdapter.getLogger(AbstractLoggerAdapter.java:47)
        at org.apache.logging.slf4j.Log4jLoggerFactory.getLogger(Log4jLoggerFactory.java:29)
        at org.slf4j.LoggerFactory.getLogger(LoggerFactory.java:358)
        at freemarker.log.SLF4JLoggerFactory.getLogger(SLF4JLoggerFactory.java:28)
        at freemarker.log.Logger.getLogger(Logger.java:357)
        at freemarker.template.Configuration.<clinit>(Configuration.java:125)
        at com.ctrip.ops.sysdev.render.FreeMarkerRender.<init>(FreeMarkerRender.java:17)
        at com.ctrip.ops.sysdev.baseplugin.BaseFilter.<init>(BaseFilter.java:37)
        at com.ctrip.ops.sysdev.filters.Filters.<init>(Filters.java:15)
        ... 14 more
Caused by: java.lang.ClassNotFoundException: org.apache.logging.log4j.util.ReflectionUtil
        at java.net.URLClassLoader.findClass(URLClassLoader.java:382)
        at java.lang.ClassLoader.loadClass(ClassLoader.java:424)
        at java.lang.ClassLoader.loadClass(ClassLoader.java:357)
        ... 24 more
Stdin Input shutdown...
```

这里应该是配置的 slf4j 和 Log4j2 根本就不匹配导致的。

正常启动如下：

```
l likely be removed in a future release
Java HotSpot(TM) 64-Bit Server VM warning: UseCMSCompactAtFullCollection is deprecated and will likely be removed in a future release.
Hangout  Version:0.4.0  Copyright @Ctrip   Author : childe@github, gnuhpc@github
123456465465465
{addfield1=field1content, addfield2=field2content, hostname=PC-20230404XHIO, @timestamp=2023-10-31T00:07:49.748+08:00, message=123456465465465, type=stdin1}
45646465465464654654
{addfield1=field1content, addfield2=field2content, hostname=PC-20230404XHIO, @timestamp=2023-10-31T00:07:53.003+08:00, message=45646465465464654654, type=stdin1}
```








# 本地如何 debug 启动

## 命令

我们可以看到启动日志中的 jvm 参数：

```sh
D:\github\hangout\hangout-dist-0.4.0-release-bin>D:\tool\jdk\jdk-1.8\bin\java.exe  -server -Xms2g -Xmx2g -Xmn1g -XX:MetaspaceSize=128m -XX:MaxMetaspaceSize=320m -XX:+UseConcMarkSweepGC -XX:+UseCMSCompactAtFullCollection -XX:CMSInitiatingOccupancyFraction=70 -XX:+CMSParallelRemarkEnabled -XX:SoftRefLRUPolicyMSPerMB=0 -XX:+CMSClassUnloadingEnabled -XX:SurvivorRatio=8 -XX:-UseParNewGC -verbose:gc -Xloggc:"C:\Users\dh\hangout.log" -XX:+PrintGCDetails -XX:-OmitStackTraceInFastThrow -XX:-UseLargePages -Djava.ext.dirs=D:\github\hangout\hangout-dist-0.4.0-release-bin\libs;D:\github\hangout\hangout-dist-0.4.0-release-bin\modules -cp .;D:\tool\jdk\jdk-1.8\lib;D:\tool\jdk\jdk-1.8\lib\tools.jar com.ctrip.ops.sysdev.cmd.Main -f conf/simpletest.yml
```

这里一些是 jvm 的配置，我们可以本地启动时简化一下：

```sh
-Djava.ext.dirs=D:\github\hangout\hangout-dist-0.4.0-release-bin\libs;D:\github\hangout\hangout-dist-0.4.0-release-bin\modules  -f conf/simpletest.yml
```


## idea 配置

我们首先编译项目：

```
mvn package  -DskipTests=true
```

然后找到 `com.ctrip.ops.sysdev.cmd.Main` 这个启动类，直接运行缺少参数会失败。

我们配置一下。Main=>【Edit Configration】

1）添加 vm 参数

```sh
-Djava.ext.dirs=D:\github\hangout\hangout-dist-0.4.0-release-bin\libs;D:\github\hangout\hangout-dist-0.4.0-release-bin\modules  
```



如果是本地的项目，可以：

`D:\code\github\hangout\hangout-dist\target\hangout-dist-0.4.0-release-bin.zip` 解压：

```
D:\code\github\hangout\hangout-dist\target\hangout-dist-0.4.0-release-bin
```

可以修改 vm 参数为

```sh
-Djava.ext.dirs=D:\code\github\hangout\hangout-dist\target\hangout-dist-0.4.0-release-bin\libs;D:\code\github\hangout\hangout-dist\target\hangout-dist-0.4.0-release-bin\modules
```


2) 添加项目配置文件指定  program argumens

```
-f conf/simpletest.yml
```

![配置](https://img-blog.csdnimg.cn/b7b0dd06742f47be9a99ebcbfa7afd8c.png#pic_center)

3）启动 java Main

然后和启动 java 程序一样，直接 debug 启动。

## debug 信息

我们再去 debug 信息，命令行输入 hello

Stdout 对应的 Map event 信息是：

```
"addfield1" -> "field1content"
"addfield2" -> "field2content"
"hostname" -> "d"
"@timestamp" -> {DateTime@2519} "2023-10-31T09:46:13.881+08:00"
"message" -> "hello"
"type" -> "stdin1"
```

对应的效果如下：

```
hello
{addfield1=field1content, addfield2=field2content, hostname=d, @timestamp=2023-10-31T09:46:13.881+08:00, message=hello, type=stdin1}
```

下面是官方文档：


# 运行

```
bin/hangout -f app.yml
```

日志库使用的[log4j2](https://logging.apache.org/log4j/2.x/). 默认的配置文件就是Hangout目录下的log4j2.xml  
默认日志记录是info级别, 环境变量HO_LOG_LEVEL可以更改日志级别. `export HO_LOG_LEVEL=error`更改到error


# 配置
配置在一定程度上也是模仿logstash, 但用的是通用的yaml格式.
因为能力有限, 不能实现logstash的那套语法, if是用了另外的格式.
[可以参考一个配置的示例](https://github.com/childe/hangout/blob/master/conf/example.yml)

## 嵌套字段举例:
1. 将x.y的值赋值给name.first
2. 将metadata.time 做Date Filter处理.

```
- Add:
  fields:
    '[name][first]': '[x][y]'

- Date:
    src: '[metadata][time]'
    formats:
        - 'ISO8601'
```

## Input

input plugin中可以配置type, 会添加到每一条消息中, 完整例子参考 [https://github.com/childe/hangout/blob/master/conf/simpletest.yml#L5](https://github.com/childe/hangout/blob/master/conf/simpletest.yml#L5)

```
type: nginx
```

### Stdin

    - Stdin:
        codec: plain
        hostname: true # if add hostname to event; default false

### Kafka
从Kafka读数据. 下面示例是说, 开2个线程取app这个topic的数据, 编码格式为plain纯文本.  consumer_settings中的参数, 参考[kafka]官方文档](http://kafka.apache.org/documentation.html#consumerconfigs), 所有参数都可以在这里配置. 比较重要的是group.id, zookeeper.connect这两个, 一定要有.   zookeeper.connect的格式为 hostname1:port1,hostname2:port2,hostname3:port3.

    - Kafka:
        topic:
          app: 2
        consumer_settings:
          group.id: hangout
          zookeeper.connect: 192.168.1.200:2181
          auto.commit.interval.ms: "1000"
          socket.receive.buffer.bytes: "1048576"
          fetch.message.max.bytes: "1048576"
        codec: plain

支持白名单匹配，使用topic_pattern指定正则表达式来匹配topic名称，如果指定此参数，topic参数会被忽略。

    - topic_pattern: #pattern has high priority,if specified, topic will be ignored
        test.*: 3

目前引用的 kafka 客户端版本是0.9.0.1,如果和服务端的kafka版本不一致可能会导致消费不正常. 可以尝试手动下载相应版本的kafka_${version}-${version}.jar以及kafka-clients-${version}.jar替换jar包。

### newKafka
新的kafka api.[http://kafka.apache.org/documentation.html#newconsumerapi](http://kafka.apache.org/documentation.html#newconsumerapi)

    - NewKafka:
        topic:
            nginx: 1
        codec: json
        consumer_settings:
            bootstrap.servers: 192.168.0.1:9092
            value.deserializer: org.apache.kafka.common.serialization.StringDeserializer
            key.deserializer: org.apache.kafka.common.serialization.StringDeserializer
            group.id: hangout

所有可以配置的参数[http://kafka.apache.org/documentation.html#newconsumerconfigs](http://kafka.apache.org/documentation.html#newconsumerconfigs)

## Filter
### Grok
Grok是为了把一个字符串切割成多个field, 用的是[Joni库](https://github.com/jruby/joni), 不完全支持logstash里面的patterns语法,%{INT:bytes:int}这种语法不支持, 只支持%{INT:bytes},字段类型需要在ES中定义.

具体文档可以参考logstash的文档[https://www.elastic.co/guide/en/logstash/current/plugins-filters-grok.html](https://www.elastic.co/guide/en/logstash/current/plugins-filters-grok.html)

正则的语法可以参考 [https://www.elastic.co/guide/en/logstash/current/plugins-filters-grok.html](https://www.elastic.co/guide/en/logstash/current/plugins-filters-grok.html)

会依次匹配match中的正则, 直到有一个成功的.

**注意, 如果正则中的groupname和已有的字段一样, 原来的字段被覆盖**

	src: message #default message
	match:
		- '(?<logtime>\S+) (?<user>\S+) (-|(?<level>\w+))'
		- '(?<logtime>\S+\s+\S+) (?<user>\S+) (-|(?<level>\w+))'
	remove_fields: ['message']
	tag_on_failure: grokfail #default grokfail

可以添加自己的Grok Pattern:

    pattern_paths:
        - '/opt/hangout/grokpatternpaths'
    match:
        - '(%{NGINXACCESSLOG})'

### Date
Date是用的[jona-time](http://www.joda.org/joda-time/)做解析和格式化.

会依次匹配formats里面的格式, 直到成功.

	src: logtime # default logtime
	formats:
		- 'ISO8601'
		- 'UNIX'
		- 'UNIX_MS'
		- 'YYYY-MM-dd HH:mm:ss.SSS'
	remove_fields: ['logtime']
	tag_on_failure: datefail # default datefail

### Json
解析json字符串, **如果json里面的字段和原有的字段重复, 原有字段会被覆盖!**

    - Json:
        field: message # required

### GeoIP2
geoip2用的是maxmind公司的开源数据和算法.
This product includes GeoLite2 data created by MaxMind, available from
[http://www.maxmind.com](http://www.maxmind.com)

geoip2里面可以获取的数据也比较多, 目前我只是用到了country_code country_name city_name latitude longitude location 6个字段.

据[ELKstack-guide](https://github.com/garyelephant/ELKstack-guide-cn/blob/99550ba5cc4be177db1b6b62037fb77ce55c304f/logstash/develop_logstash_filter_geoip2.md), 速度比GeoIP有速倍的提升.

maxmind也提供了数据的下载 [http://dev.maxmind.com/geoip/geoip2/geolite2/](http://dev.maxmind.com/geoip/geoip2/geolite2/)


    - GeoIP2:
        source: message # required
        target: geoip # default geoip
        database: '/tmp/GeoLite2-City.mmdb'
        country_code: false # default true
        country_name: false # default true
        country_isocode: false # default true
        subdivision_name: false # default true
        city_name: false # default true
        latitude: false # default true
        longitude: false # default true
        location: false # default true

### Drop
没有额外参数, 配合if使用.

	if:
		- '<#if user?matches("huhan3")>true</#if>'

### IF
应用于filter. 是一个列表, 需要满足列表中的每一个条件, 使用[freemarker](http://freemarker.org/) 模板引擎. 

下面这个例子是添加一个target字段, target的值为url字段的第5个部分(下标从0开始).  
只有在满足以下2个条件的时候才会触发添加字段这个行为.

1. 日志含有url字段
2.  url中包含 "http://images4.c-ctrip.com/target/" 或者 ".c-ctrip.com/images/" 字符串.

```
- Add:
   fields:
     target: '<#assign a=url?split("/")>${a[4]}'
   if:
     - '<#if url??>true</#if>'
     - '<#if url?contains("http://images4.c-ctrip.com/target/")>true<#elseif url?contains(".c-ctrip.com/images/")>true</#if>'
```

### Translate
每隔一段时间, 会重新加载字典. 字典是yaml格式.
用的[snakeyaml](https://bitbucket.org/asomov/snakeyaml)加载yaml文件的, 如果key是整数类型,会首先尝试转换成Integer, 超出Integer范围才会尝试Long.  
但是Json格式的日志会被直接转成Long类型的, 导致不能匹配.

所以yaml里面需要这么写:

	!!java.lang.Long 123: 信用卡
	!!java.lang.Long 345: 借记卡

Tranlate 配置：

	source: user
	target: nick
	dictionary_path: /user-nick.yml
	refresh_interval: 300 # default 300 seconds

### KV
将 a=1&b=2, 或者name=app id=123 type=nginx 这样的字符串拆分成{a:1,b:2}  {name:app, id:123, type:nginx} 等多个字段, 放到日志里面去.

配置如下.  
如果targete有定义, 会把拆分出来字段放在这个字段中, 如果没有定义,放到在顶层.  
trim 是把拆分出来的字段内容做前后修整. 将不需要的字符去掉. 下面的示例就是说把双引号和tag都去掉.   
trimkey和trim类似, 处理的是字段名称.

    - KV:
        source: msg # default message
        target: kv   # default null
        field_split: ' '  # default " "
        value_split: '='  # default "="
        trim: '\t\"'  #default null
        trimkey: '\"'  # default null
        tag_on_failure: "KVfail" # default "KVfail"
        remove_fields: ['msg']

### Filters
    可以在一个If条件下,顺序的执行多个filters, 而不用每次都执行If判断.

### 其它filter
配置都比较简单, 可以参考[配置文件示例](https://github.com/childe/hangout/blob/master/conf/example.yml)

### freemarker
If 条件和addfileds等插件使用[freemarker](http://freemarker.org/)模板引擎, 速度快, 功能强大.

[在线测试工具](http://freemarker-online.kenshoo.com/)


## Output
### Elasticsearch
使用[bulk api](https://www.elastic.co/guide/en/elasticsearch/reference/current/docs-bulk.html) 批量将数据写入ES.

插入失败的时候, 只对 TOO_MANY_REQUESTS, SERVICE_UNAVAILABLE 这两种错误重试.

参数含义参考[java client bulk api](https://www.elastic.co/guide/en/elasticsearch/client/java-api/current/bulk.html)

concurrent_requests设置成大于0的数, 意思着多线程处理, 以我应用的经验,还有是一定OOM风险的. 因为在执行bulk的时候, bulkProcessor还在继续接收新的文档, 如果bulk失败了, 会把失败的actionrequest继续放到bulkProcessor里面. 一段时间内, 由于各种原因一直失败的话, 内存就会越用越多. 

sniff设置为true的话, 会把hosts当做一个入口, 然后去寻找真正的data nodes写数据. 如果设置成false,数据就直接写在配置的hosts列表机器上,可以缓解data node上面的流量压力和小部分CPU压力.

```
cluster: prod # cluster name, required
hosts: # required
  - 192.168.1.100
  - 192.168.1.200:9301
index: 'hangout-%{+YYYY.MM.dd}'
index_type: logs # default logs
bulk_actions: 20000 # default 20000
bulk_size: 15	#default 15
flush_interval: 10	#default 10
concurrent_requests: 0	#default 0
sniff: false #default true
```

注意: index的配置**部分**兼容logstash配置, 但是如果需要使用`@timestamp`之外的字段做渲染, 需要如下配置:

  index: '${topicindex}-${@timestamp.toString("YYYY")}'

一些高级写法:

```
index_type: ${EsIndexType!"logs"}  # 使用EsIndexType字段, 如果没有, 刚使用logs. 这个是freemarker的渲染模板
document_id: '[id]'
```

### ElasticsearchHTTP
使用[rest api](https://www.elastic.co/guide/en/elasticsearch/reference/current/docs-bulk.html) 批量将数据写入ES.
目前在es2.4.0 和es 5.2.0 上进行过初步测试

       - ElasticsearchHTTP:
            cluster: elasticsearch
            hosts:
              - 192.168.145.128
            index: 'myindex'
            # set user & password for basic auth
	          # user: admin
            # password: 123456
            index_type: "mytype" # default logs
            bulk_actions: 5 #default 20000
            sniff: false #default true

### Kafka
	#bootstrap_servers format is host1:port1,host2:port2, and the list can be a subset of brokers or a VIP pointing to a subset of brokers.
	bootstrap_servers: 192.168.1.100:9092 # required
	topic: test # required

可以设置输出格式, 参考上面的嵌套字段写法:

	#bootstrap_servers format is host1:port1,host2:port2, and the list can be a subset of brokers or a VIP pointing to a subset of brokers.
	bootstrap_servers: 192.168.1.100:9092 # required
	topic: test # required
	format: '[message]'

### Stdout
主要测试用吧. 因为配置是yml格式, 所以没有其它条件的话, 需要写成 

    - Stdout: {}

也可以参考上面的嵌套字段写法:

    - Stdout:
        format: '[message]'

## Metrics
为了实现对各个agent的统一性能和运行情况监控，在input/filter/output之外又提供了种叫Metrics的plugin, 用来监控应用的指标, 目前(0.4.0)提供了两种插件, 一种写一些性能数据到Graphit, 一种是restful接口提供性能监控、探活.

```
metrics:
    - Graphit:
        port: 2004  # graphit port
        host: 10.0.0.100  # graphit host
        prefix: hangout
        metrics:
            com.codahale.metrics.JvmAttributeGaugeSet: [] # empty list will register all metrics in it
            com.codahale.metrics.jvm.MemoryUsageGaugeSet: []
            com.codahale.metrics.jvm.ThreadStatesGaugeSet: []
            com.codahale.metrics.jvm.GarbageCollectorMetricSet: []

    - Watcher:
        host: 0.0.0.0
        port: 8080
```

metric count, 可以记录流经每个plugin的数据多少, 开发新的plugin可以参考stdin-input和stdout-output里面的计数方法. 

在使用的时候需要注意, yml配置文件中需要指明meter_name才可以记录.

```
- Stdin:
  meter_name: stdin1
```

# 开发:

当然可以在hangout的结构上继续开发, 可以参考项目结构中baseplugin和input,output,filters等插件.  

也可以开一个独立的项目. 我写了几个简单的例子做为教程, 供大家参考.

1. 一个最简单的filter [https://github.com/childe/hangout-filter-reverse](https://github.com/childe/hangout-filter-reverse)

2. 操作json结构中的深层数据. [https://github.com/childe/hangout-filter-reverse/tree/multilevel](https://github.com/childe/hangout-filter-reverse/tree/multilevel)

3. 对消息做聚合, 额外输出聚合后的新消息. 聚合访问日志,统计一定时间段内每个Url的响应时间(平均值,最小最大值,条数等信息), 然后输出给下游. [https://github.com/childe/hangout-filter-statmetric](https://github.com/childe/hangout-filter-statmetric)

4. output.  示例3中的聚合数据如果需要告警, 比如Url的响应时间过高, 可以通过邮件发送出去. [https://github.com/childe/hangout-output-mail](https://github.com/childe/hangout-output-mail)

5. input. TODO
 
# 目前第三方插件：

1. 使用Hangout将数据清洗写入ClickHouse

https://github.com/RickyHuo/hangout-output-clickhouse

2. 流式聚合https://github.com/childe/hangout-filter-linkmetric

# 参考资料

https://github.com/childe/hangout

* any list
{:toc}