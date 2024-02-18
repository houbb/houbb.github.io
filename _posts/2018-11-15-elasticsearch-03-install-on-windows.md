---
layout: post
title: Elasticsearch-03-es install on windows
date:  2018-11-15 08:38:35 +0800
categories: [Search]
tags: [apache, search, index, es, sh]
published: true
---

# ES WSL 安装实战笔记

## 准备工作

```
$ java -version
openjdk version "11.0.12" 2021-07-20 LTS
OpenJDK Runtime Environment Zulu11.50+19-CA (build 11.0.12+7-LTS)
OpenJDK 64-Bit Server VM Zulu11.50+19-CA (build 11.0.12+7-LTS, mixed mode)
```

## 下载

```
mkdir es
cd es

wget https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-7.15.0-linux-x86_64.tar.gz 
tar -xzvf elasticsearch-7.15.0-linux-x86_64.tar.gz
```

效果:

```
$ cd elasticsearch-7.15.0/

$ ls
LICENSE.txt  NOTICE.txt  README.asciidoc  bin  config  jdk  lib  logs  modules  plugins
```

## 编辑配置

```
vi config/elasticsearch.yml
```

配置network.host，确保Elasticsearch可以在WSL之外的环境中访问：

```
network.host: 0.0.0.0
```

## 启动

```
bin/elasticsearch
```


启动失败：

```
ing indices will not be automatically detected or imported and must be managed manually
[2024-02-01T11:45:48,354][INFO ][o.e.n.Node               ] [d] initialized
[2024-02-01T11:45:48,355][INFO ][o.e.n.Node               ] [d] starting ...
[2024-02-01T11:45:48,386][INFO ][o.e.x.s.c.f.PersistentCache] [d] persistent cache index loaded
[2024-02-01T11:45:48,479][INFO ][o.e.t.TransportService   ] [d] publish_address {172.17.0.1:9300}, bound_addresses {[::]:9300}
[2024-02-01T11:45:48,624][INFO ][o.e.b.BootstrapChecks    ] [d] bound or publishing to a non-loopback address, enforcing bootstrap checks

ERROR: [2] bootstrap checks failed. You must address the points described in the following [2] lines before starting Elasticsearch.
bootstrap check failure [1] of [2]: max virtual memory areas vm.max_map_count [65530] is too low, increase to at least [262144]
bootstrap check failure [2] of [2]: the default discovery settings are unsuitable for production use; at least one of [discovery.seed_hosts, discovery.seed_providers, cluster.initial_master_nodes] must be configured
ERROR: Elasticsearch did not exit normally - check the logs at /home/dh/es/elasticsearch-7.15.0/logs/elasticsearch.log
[2024-02-01T11:45:48,631][INFO ][o.e.n.Node               ] [d] stopping ...
[2024-02-01T11:45:48,656][INFO ][o.e.n.Node               ] [d] stopped
[2024-02-01T11:45:48,656][INFO ][o.e.n.Node               ] [d] closing ...
[2024-02-01T11:45:48,668][INFO ][o.e.n.Node               ] [d] closed
[2024-02-01T11:45:48,671][INFO ][o.e.x.m.p.NativeController] [d] Native controller process has stopped - no new native processes can be started
```

参考 https://stackoverflow.com/questions/42300463/elasticsearch-bootstrap-checks-failing

### 解释

Elasticsearch 进程的最大文件描述符数 [4096] 过低，请增加至至少 [65536]

```
ulimit -n 65536
```

或在 /etc/security/limits.conf 中将 nofile 设置为 65536

用户 [xxx] 的最大线程数 [1024] 过低，请增加至至少 [2048]

```
ulimit -u 2048
```

或在启动 Elasticsearch 前，在 /etc/security/limits.conf 中将 nproc 值设置为 2048 或更高

虚拟内存区域的最大数量 vm.max_map_count [65530] 过低，请增加至至少 [262144]

在 /etc/sysctl.conf 中设置 vm.max_map_count=262144，然后执行 


```
sudo sysctl -p
```

如果你希望在开发环境中运行 Elasticsearch 而忽略启动引导检查失败：

在你的 vi /config/elasticsearch.yml 中设置以下内容：

```
transport.host: 127.0.0.1
http.host: 0.0.0.0
```

请注意在开发模式下无法形成集群。不要在生产环境中使用无法通过引导检查的 Elasticsearch！

### 测试

重新运行

```
bin/elasticsearch
```

or

```
/home/dh/es/elasticsearch-7.15.0/bin/elasticsearch
```


打开浏览器，访问 http://localhost:9200/，如果一切正常，应该能看到Elasticsearch的信息。

返回日志：

```json
{
  "name" : "d",
  "cluster_name" : "elasticsearch",
  "cluster_uuid" : "oI184RDVQgqv6Pyac2lKng",
  "version" : {
    "number" : "7.15.0",
    "build_flavor" : "default",
    "build_type" : "tar",
    "build_hash" : "79d65f6e357953a5b3cbcc5e2c7c21073d89aa29",
    "build_date" : "2021-09-16T03:05:29.143308416Z",
    "build_snapshot" : false,
    "lucene_version" : "8.9.0",
    "minimum_wire_compatibility_version" : "6.8.0",
    "minimum_index_compatibility_version" : "6.0.0-beta1"
  },
  "tagline" : "You Know, for Search"
}
```


# 操作

## 初始化数据

```
$ curl -X POST "localhost:9200/your_index/_doc/1" -H 'Content-Type: application/json' -d'
     {
       "field1": "value1",
       "field2": "value2"
     }
     '
```

响应：

```json
{"_index":"your_index","_type":"_doc","_id":"1","_version":1,"result":"created","_shards":{"total":2,"successful":1,"failed":0},"_seq_no":0,"_primary_term":1}
```

## 如何检索


### 直接查询：

```
curl -X GET "localhost:9200/your_index/_doc/1"
```

返回：

```json
{"_index":"your_index","_type":"_doc","_id":"1","_version":1,"_seq_no":0,"_primary_term":1,"found":true,"_source":
     {
       "field1": "value1",
       "field2": "value2"
     }
}
```

### 匹配检索

```
curl -X GET "localhost:9200/your_index/_search" -H 'Content-Type: application/json' -d'
{
  "query": {
    "match": {
      "field1": "value1"
    }
  }
}
'
```

返回

```json
{"took":4,"timed_out":false,"_shards":{"total":1,"successful":1,"skipped":0,"failed":0},"hits":{"total":{"value":1,"relation":"eq"},"max_score":0.2876821,"hits":[{"_index":"your_index","_type":"_doc","_id":"1","_score":0.2876821,"_source":
     {
       "field1": "value1",
       "field2": "value2"
     }
}]}}
```

### query string 

```
curl -X GET "localhost:9200/your_index/_search?q=field2:value2"
```

返回

```json
{"took":14,"timed_out":false,"_shards":{"total":1,"successful":1,"skipped":0,"failed":0},"hits":{"total":{"value":1,"relation":"eq"},"max_score":0.2876821,"hits":[{"_index":"your_index","_type":"_doc","_id":"1","_score":0.2876821,"_source":
     {
       "field1": "value1",
       "field2": "value2"
     }
     }]}}
```


# next

我们试一下 java jdk 如何访问 ES。

# chat

## 如何初始化数据？

在Elasticsearch启动之后，你可以通过不同的方式初始化数据。以下是一些常见的方法：

### 1. **使用Elasticsearch索引API:**
   - 使用Elasticsearch的索引API（Index API）手动插入文档数据。你可以使用`POST`请求将文档添加到指定的索引。

     ```bash
     curl -X POST "localhost:9200/your_index/_doc/1" -H 'Content-Type: application/json' -d'
     {
       "field1": "value1",
       "field2": "value2"
     }
     '
     ```

   - 通过脚本、程序或任何能够发送HTTP请求的工具，你可以将大量数据插入到Elasticsearch中。

### 2. **使用Elasticsearch Bulk API:**
   - Bulk API允许你一次性发送多个文档，以提高插入效率。使用`_bulk`终端点，可以在单个请求中插入或更新多个文档。

     ```bash
     curl -X POST "localhost:9200/your_index/_bulk" -H 'Content-Type: application/json' --data-binary @your_bulk_data.json
     ```

   - Bulk数据应该是一个包含多个文档操作的JSON文件。每个文档操作都包括`index`或`create`指令，以及文档的实际内容。

### 3. **使用Logstash:**
   - 如果你有大量的数据需要从其他数据源导入到Elasticsearch，Logstash是一个强大的工具，可以用于数据收集、转换和加载（ETL）。

     1. 配置Logstash管道，定义数据源和输出到Elasticsearch的目标。
     2. 运行Logstash，它将读取数据源，转换数据并将其索引到Elasticsearch。

     ```bash
     bin/logstash -f your_logstash_config.conf
     ```

### 4. **使用Elasticsearch工具或客户端:**
   - Elasticsearch有许多官方或第三方的工具和客户端，可以帮助你进行数据初始化和管理。例如，可以使用Elasticsearch官方提供的Kibana工具或Elasticsearch客户端库（如elasticsearch-py）。

### 5. **使用Elasticsearch Snapshot和Restore:**
   - 如果你已经有数据的备份快照，你可以使用Elasticsearch的快照和还原功能进行初始化。这对于将生产数据导入到开发或测试环境中是一种有效的方法。

     1. 创建Elasticsearch快照。
     2. 在新的Elasticsearch实例上还原快照。

     ```bash
     # 创建快照
     curl -X PUT "localhost:9200/_snapshot/your_repository/your_snapshot" -H 'Content-Type: application/json' -d'
     {
       "indices": "your_index",
       "ignore_unavailable": true,
       "include_global_state": false
     }
     '

     # 还原快照
     curl -X POST "localhost:9200/_snapshot/your_repository/your_snapshot/_restore" -H 'Content-Type: application/json' -d'
     {
       "indices": "your_index",
       "ignore_unavailable": true,
       "include_global_state": false
     }
     '
     ```

这些方法可以根据你的需求和场景进行选择。如果你只需要初始化一些简单的数据，直接使用Index API可能会更方便。如果你处理大量数据，考虑使用Bulk API或Logstash。根据具体情况，选择合适的方法进行数据初始化。

## Q: 如何查询

在Elasticsearch中，你可以使用各种查询方式来检索初始化的数据。以下是一些常见的查询示例：

### 1. **基本的GET请求:**
可以使用curl或者浏览器，通过GET请求来检索文档。以下是一个使用curl的例子：

```bash
curl -X GET "localhost:9200/your_index/_doc/1"
```

这将返回ID为1的文档的详细信息。

### 2. **使用Search API:**
使用Search API来执行更复杂的查询。以下是一个简单的例子，搜索包含特定值的字段：

```bash
curl -X GET "localhost:9200/your_index/_search" -H 'Content-Type: application/json' -d'
{
  "query": {
    "match": {
      "field1": "value1"
    }
  }
}
'
```

这个例子使用`match`查询来找到字段`field1`中包含"value1"的文档。

### 3. **使用Query String:**
你还可以使用查询字符串来执行简单的查询。以下是一个例子，查找`field2`等于"value2"的文档：

```bash
curl -X GET "localhost:9200/your_index/_search?q=field2:value2"
```

### 4. **使用Kibana:**
如果你安装了Kibana，你可以通过Kibana的图形用户界面（GUI）来执行查询。在Kibana的"Dev Tools"或"Discover"界面中，你可以输入类似于上述查询的DSL（领域特定语言）查询。

```json
GET /your_index/_search
{
  "query": {
    "match": {
      "field1": "value1"
    }
  }
}
```

这些只是查询的简单示例，Elasticsearch提供了丰富的查询语言和功能，包括范围查询、聚合、过滤等。

你可以根据具体的需求使用不同的查询方式。详细的查询语法和功能，请参考Elasticsearch的官方文档。



# 参考资料

https://mp.weixin.qq.com/s/PlQRorBV03oqcnjWvE-uRg

* any list
{:toc}