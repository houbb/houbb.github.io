---
layout: post
title: Logstash 日志处理转换 ETL 入门介绍 
date:  2016-10-16 10:04:46 +0800
categories: [Log]
tags: [etl, log]
published: true
---


# 拓展阅读

[日志开源组件（一）java 注解结合 spring aop 实现自动输出日志](https://houbb.github.io/2023/08/06/auto-log-01-overview)

[日志开源组件（二）java 注解结合 spring aop 实现日志traceId唯一标识](https://houbb.github.io/2023/08/06/auto-log-02-trace-id)

[日志开源组件（三）java 注解结合 spring aop 自动输出日志新增拦截器与过滤器](https://houbb.github.io/2023/08/06/auto-log-03-filter)

[日志开源组件（四）如何动态修改 spring aop 切面信息？让自动日志输出框架更好用](https://houbb.github.io/2023/08/06/auto-log-04-dynamic-aop)

[日志开源组件（五）如何将 dubbo filter 拦截器原理运用到日志拦截器中？](https://houbb.github.io/2023/08/06/auto-log-05-dubbo-interceptor)

[日志开源组件（六）Adaptive Sampling 自适应采样](https://mp.weixin.qq.com/s/9JH3WfR6Y474LCbY2mZxZQ)

[高性能日志脱敏组件（一）java 日志脱敏框架 sensitive，优雅的打印脱敏日志](https://mp.weixin.qq.com/s/xzQNDF7s705iurk7N0uheQ)

[高性能日志脱敏组件（二）金融用户敏感数据如何优雅地实现脱敏？](https://mp.weixin.qq.com/s/ljChFiNLzV6GLaUDjehA0Q)

[高性能日志脱敏组件（三）日志脱敏之后，无法根据信息快速定位怎么办？](https://mp.weixin.qq.com/s/tZqOH_8QTKrD1oaclNoewg)

[高性能日志脱敏组件（四）基于 log4j2 插件实现统一日志脱敏，性能远超正则替换](https://mp.weixin.qq.com/s/ZlWRqT7S92aXFuy-l9Uh3Q)

[高性能日志脱敏组件（五）已支持 log4j2 和 logback 插件](https://mp.weixin.qq.com/s/3ARK6PW7pyUhAbO2ctnndg)

# Logstash

收集、丰富和传输数据。

Logstash 是一个灵活的、开源的数据收集、丰富和传输管道，旨在高效处理日志、事件和非结构化数据源的不断增长，以便将其分发到各种输出，包括 Elasticsearch。

> [Logstash](https://www.elastic.co/products/logstash)

# Install in Mac

## 安装需要

- Logstash 2.x 需要 **Java 7 或更高版本**

```
houbinbindeMacBook-Pro:bin houbinbin$ java -version
java version "1.8.0_91"
Java(TM) SE Runtime Environment (build 1.8.0_91-b14)
Java HotSpot(TM) 64-Bit Server VM (build 25.91-b14, mixed mode)
```

## 下载

[下载](https://www.elastic.co/downloads/logstash) 并解压缩

```
houbinbindeMacBook-Pro:Downloads houbinbin$ tar -zxf logstash-all-plugins-2.4.0.tar.gz
```

将其移动到 **tools** 包中

```
houbinbindeMacBook-Pro:Downloads houbinbin$ ls | grep -i logstash
logstash-2.4.0
logstash-all-plugins-2.4.0.tar.gz
houbinbindeMacBook-Pro:Downloads houbinbin$ mv logstash-2.4.0 ~/it/tools/logstash
```

## 配置

准备配置文件 ```logstash.conf```

```
houbinbindeMacBook-Pro:Downloads houbinbin$ cd ~/it/tools/logstash/
houbinbindeMacBook-Pro:logstash houbinbin$ ls
CHANGELOG.md		Gemfile			LICENSE			bin			vendor
CONTRIBUTORS		Gemfile.jruby-1.9.lock	NOTICE.TXT		lib
houbinbindeMacBook-Pro:logstash houbinbin$ mkdir conf
houbinbindeMacBook-Pro:logstash houbinbin$ cd conf/
houbinbindeMacBook-Pro:config houbinbin$ ls
houbinbindeMacBook-Pro:config houbinbin$ vi logstash.conf
houbinbindeMacBook-Pro:config houbinbin$ ls
logstash.conf
```

[编辑](http://www.jianshu.com/p/4e1d34adb83b) 其内容如下以进行测试：

```conf
input {
      stdin{}
}
# 过滤器是可选的
#filter {
#}
output {
    stdout{
        codec => rubydebug
    }
}
```

## 运行

```
houbinbindeMacBook-Pro:logstash houbinbin$ bin/logstash -f conf/logstash.conf
Settings: Default pipeline workers: 8
Pipeline main started
```

在终端中输入内容 ```testing``` 进行测试：

```conf
testing
{
       "message" => "testing",
      "@version" => "1",
    "@timestamp" => "2016-10-16T03:45:01.064Z",
          "host" => "houbinbindeMacBook-Pro.local"
}
```

# 使用

## 显示插件列表

```
$   bin/plugin list
使用 bin/plugin 是不推荐的，并将在以后的版本中移除。请使用 bin/logstash-plugin

houbinbindeMacBook-Pro:logstash houbinbin$ bin/logstash-plugin
Usage:
    bin/logstash-plugin [OPTIONS] SUBCOMMAND [ARG] ...

Parameters:
    SUBCOMMAND                    子命令
    [ARG] ...                     子命令参数

Subcommands:
    install                       安装插件
    uninstall                     卸载插件
    update                        更新插件
    pack                          打包当前已安装的插件
    unpack                        解压已打包的插件
    list                          列出所有已安装的插件
    generate                      为新插件创建基础。
```

因此，我们可以使用 ```bin/logstash-plugin list``` 来显示插件列表。

注意：默认情况下，它有一个名为 ```logstash-input-log4j``` 的插件，它是用于 **log4j** 而不是 **log4j2**

## 安装

- 安装 [log4j2 的插件](https://github.com/jurmous/logstash-log4j2)

注意: 

1、遗憾的是，此插件仅支持 logstash 版本 (1.5+, 2.1]

2、在安装此插件之前，您应该**先启动 logstash**

> 启动 logstash

```
houbinbindeMacBook-Pro:logstash houbinbin$ bin/logstash -f conf/logstash.conf
Settings: Default pipeline workers: 8
Pipeline main started
```

> 安装

```
houbinbindeMacBook-Pro:logstash houbinbin$ bin/logstash-plugin install logstash-input-log4j2
LogStash::GemfileError: duplicate gem logstash-filter-date
         add_gem at /Users/houbinbin/it/tools/logstash/lib/pluginmanager/gemfile.rb:102
             gem at /Users/houbinbin/it/tools/logstash/lib/pluginmanager/gemfile.rb:200
          (eval) at (eval):109
   instance_eval at org/jruby/RubyBasicObject.java:1598
           parse at /Users/houbinbin/it/tools/logstash/lib/pluginmanager/gemfile.rb:188
            load at /Users/houbinbin/it/tools/logstash/lib/pluginmanager/gemfile.rb:19
         gemfile at /Users/houbinbin/it/tools/logstash/lib/pluginmanager/command.rb:4
  verify_remote! at /Users/houbinbin/it/tools/logstash/lib/pluginmanager/install.rb:50
         execute at /Users/houbinbin/it/tools/logstash/lib/pluginmanager/install.rb:28
             run at /Users/houbinbin/it/tools/logstash/vendor/bundle/jruby/1.9/gems/clamp-0.6.5/lib/clamp/command.rb:67
         execute at /Users/houbinbin/it/tools/logstash/vendor/bundle/jruby/1.9/gems/clamp-0.6.5/lib/clamp/subcommand/execution.rb:11
             run at /Users/houbinbin/it/tools/logstash/vendor/bundle/jruby/1.9/gems/clamp-0.6.5/lib/clamp/command.rb:67
             run at /Users/houbinbin/it/tools/logstash/vendor/bundle/jruby/1.9/gems/clamp-0.6.5/lib/clamp/command.rb:132
          (root) at /Users/houbinbin/it/tools/logstash/lib/pluginmanager/main.rb:43
```

嗯，这是个问题... 似乎我们应该另辟蹊径 ==!

# 构建日志系统

> [ELK 博客中文](https://my.oschina.net/itblog/blog/547250)

> [Log4j2+ELK 中文](http://blog.csdn.net/zheng0518/article/details/50453215)

我们想要使用 [log4j2](http://logging.apache.org/log4j/2.x) 和 ELK(ElasticSearch+Logstash+Kibana) 构建日志系统。

## Log4j2 配置

- ```log4j2.xml```

整个项目演示在 [这里](https://github.com/houbb/log4j2.git)

关于 [SocketAppender](http://logging.apache.org/log4j/2.x/manual/appenders.html#SocketAppender) 的信息

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Configuration status="WARN">
    <Appenders>
        <Console name="Console" target="SYSTEM_OUT">
            <PatternLayout pattern="%d{HH:mm:ss.SSS} [%t] %-5level %logger{36} - %msg%n"/>
        </Console>
        <Socket name="Logstash" host="127.0.0.1" port="7000" protocol="TCP">
            <PatternLayout pattern="%d{HH:mm:ss.SSS} [%t] %-5level %logger{36} - %msg%n"/>
        </Socket>
    </Appenders>

    <Loggers>
        <Root level="info">
            <AppenderRef ref="Console"/>
            <AppenderRef ref="Logstash"/>
        </Root>
    </Loggers>
</Configuration>
```

## java 代码

- ```LogService.java```

简单的日志：

```java
public class LogService {
  static final Logger logger = LogManager.getLogger(LogService.class);

  public static void main(String[] args) {
    logger.info("log test...");
  }
}
```

## LogStatsh 处理

- 添加 ```micro_wiki.conf```

```conf
input {
  tcp {
    host => "0.0.0.0"
    port => "7000"
    mode => "server"
    type => "microwiki"
    add_field => {
      "name" => "Ryo"
    }
  }
}
filter {
}
output {
  stdout {
    codec => rubydebug
  }
}
```

## 运行

- 运行 Logstash

```
houbinbindeMacBook-Pro:logstash-2.4.0 houbinbin$ bin/logstash -f conf/micro_wiki.conf
Settings: Default pipeline workers: 8
Pipeline main started
```

- 运行 Java

```
{
       "message" => "16:44:10.428 [main] INFO  com.ryo.service.LogService - log test...",
      "@version" => "1",
    "@timestamp" => "2016-10-16T08:44:10.430Z",
          "host" => "127.0.0.1",
          "port" => 53150,
          "type" => "microwiki",
          "name" => "Ryo"
}
```

## ElasticSearch

- 编辑 ```micro_wiki.conf```

为了让 **Logstash** 的日志传输到 **ElasticSearch**，我们编辑 **Logstash** 的 ```micro_wiki.conf```，如下所示：

```
input {
  tcp {
    host => "0.0.0.0"
    port => "7000"
    mode => "server"
    type => "microwiki"
    add_field => {
      "name" => "Ryo"
    }
  }
}
filter {
}
output {
  stdout {
    codec => rubydebug
  }
  elasticsearch {
    hosts => ["127.0.0.1:9200"]
    action => "index"
    codec => rubydebug
    index => "microwiki-%{+YYYY.MM.dd}"
    template_name => "microwiki"
  }
}
```

编辑完成后，我们应该**重新启动 logstash**，您可能会遇到如下错误：

```
Could not start TCP server: Address in use {:host=>"0.0.0.0", :port=>7000, :level=>:error}
Pipeline aborted due to error {:exception=>"Errno::EADDRINUSE", :backtrace=>["org/jruby/ext/socket/RubyTCPServer.java:118:in `initialize'",
"org/jruby/RubyIO.java:871:in `new'", "/Users/houbinbin/it/tools/logstash/logstash-2.4.0/vendor/bundle/jruby/1.9/gems/logstash-input-tcp-3.0.6/lib/logstash/inputs/tcp.rb:244:in
`new_server_socket'", "/Users/houbinbin/it/tools/logstash/logstash-2.4.0/vendor/bundle/jruby/1.9/gems/logstash-input-tcp-3.0.6/lib/logstash/inputs/tcp.rb:79:in `register'",
"/Users/houbinbin/it/tools/logstash/logstash-2.4.0/vendor/bundle/jruby/1.9/gems/logstash-core-2.4.0-java/lib/logstash/pipeline.rb:330:in `start_inputs'",
"org/jruby/RubyArray.java:1613:in `each'", "/Users/houbinbin/it/tools/logstash/logstash-2.4.0/vendor/bundle/jruby/1.9/gems/logstash-core-2.4.0-java/lib/logstash/pipeline.rb:329:in
`start_inputs'", "/Users/houbinbin/it/tools/logstash/logstash-2.4.0/vendor/bundle/jruby/1.9/gems/logstash-core-2.4.0-java/lib/logstash/pipeline.rb:180:in `start_workers'",
"/Users/houbinbin/it/tools/logstash/logstash-2.4.0/vendor/bundle/jruby/1.9/gems/logstash-core-2.4.0-java/lib/logstash/pipeline.rb:136:in `run'",
"/Users/houbinbin/it/tools/logstash/logstash-2.4.0/vendor/bundle/jruby/1.9/gems/logstash-core-2.4.0-java/lib/logstash/agent.rb:491:in `start_pipeline'"],
:level=>:error}
```

使用命令 ```lsof -n -P| grep 7000```

```
idea      4138 houbinbin  txt      REG                1,4   1257000  100928 /Library/Fonts/Copperplate.ttc
Google    4142 houbinbin  txt      REG                1,4   1257000  100928 /Library/Fonts/Copperplate.ttc
java      6699 houbinbin    9u    IPv6 0xf1b9bfa3b241e019       0t0     TCP *:7000 (LISTEN)
```

使用命令 ```sudo kill -9 id``` 来终止它。

最后，启动 logstash ```bin/logstash -f conf/micro_wiki.conf ```

- 编辑 ```elasticsearch.yml```

```
cluster.name: MicroWiki-Cluster
node.name: microwiki-node1
network.host: 127.0.0.1
http.port: 9200
```

- 运行 Elasticsearch

使用 ```bin/elasticsearch -d``` 在后台启动 Elasticsearch


- 运行 Java 并使用 Elasticsearch 进行搜索

```java
LOGGER.info("日志测试，时间为 2016-10-16 17:06:02...");
```

在浏览器中输入 [http://localhost:9200/microwiki-2016.10.16/_search](http://localhost:9200/microwiki-2016.10.16/_search)，并获取：

```json
{
    "took":21,
    "timed_out":false,
    "_shards":{
        "total":5,
        "successful":5,
        "failed":0
    },
    "hits":{
        "total":1,
        "max_score":1,
        "hits":[
            {
                "_index":"microwiki-2016.10.16",
                "_type":"microwiki",
                "_id":"AVfMvhC_IjTkofXOa5qh",
                "_score":1,
                "_source":{
                    "message":"17:06:30.417 [main] INFO com.ryo.service.LogService - log test with 2016-10-16 17:06:02...",
                    "@version":"1",
                    "@timestamp":"2016-10-16T09:06:30.421Z",
                    "host":"127.0.0.1",
                    "port":53511,
                    "type":"microwiki",
                    "name":"Ryo"
                }
            }
        ]
    }
}
```

## Kibana

### 编辑 ```kibana.yml```

将 Kibana 连接到 Elasticsearch。

```yml
# Kibana由后端服务器提供服务。这控制要使用的端口。
# server.port: 5601
server.port: 5601

# 绑定服务器的主机。
# server.host: "0.0.0.0"
server.host: 127.0.0.1

# 如果您正在运行Kibana在代理后面，并希望将其挂载在路径上，
# 在这里指定该路径。basePath不能以斜杠结尾。
# server.basePath: ""

# 来自传入服务器请求的最大有效负载大小（以字节为单位）。
# server.maxPayloadBytes: 1048576

# 用于所有查询的Elasticsearch实例。
elasticsearch.url: "http://localhost:9200"
```

### Run

```
  houbinbindeMacBook-Pro:kibana houbinbin$ bin/kibana

  log   [17:15:05.664] [info][status][plugin:kibana@1.0.0] Status changed from uninitialized to green - Ready
  log   [17:15:05.688] [info][status][plugin:elasticsearch@1.0.0] Status changed from uninitialized to yellow - Waiting for Elasticsearch
  log   [17:15:05.704] [info][status][plugin:kbn_vislib_vis_types@1.0.0] Status changed from uninitialized to green - Ready
  log   [17:15:05.721] [info][status][plugin:markdown_vis@1.0.0] Status changed from uninitialized to green - Ready
  log   [17:15:05.724] [info][status][plugin:metric_vis@1.0.0] Status changed from uninitialized to green - Ready
  log   [17:15:05.726] [info][status][plugin:spyModes@1.0.0] Status changed from uninitialized to green - Ready
  log   [17:15:05.739] [info][status][plugin:statusPage@1.0.0] Status changed from uninitialized to green - Ready
  log   [17:15:05.745] [info][status][plugin:table_vis@1.0.0] Status changed from uninitialized to green - Ready
  log   [17:15:05.749] [info][listening] Server running at http://127.0.0.1:5601
  log   [17:15:10.753] [info][status][plugin:elasticsearch@1.0.0] Status changed from yellow to yellow - No existing Kibana index found
  log   [17:15:13.332] [info][status][plugin:elasticsearch@1.0.0] Status changed from yellow to green - Kibana index ready
```

### Visit

浏览器直接访问 [localhost:5601](localhost:5601)，可以看到首页。

默认为 ```logstash-*```, 可以修改为 ```microwiki-*``` 即可。

可关注是否有log4j2的插件,不用如此麻烦。

# More

> [logstash learn zh_CN](http://udn.yyuap.com/doc/logstash-best-practice-cn/get_start/index.html)

> [logstash api zh_CN](http://kibana.logstash.es/content/logstash/)

* any list
{:toc}