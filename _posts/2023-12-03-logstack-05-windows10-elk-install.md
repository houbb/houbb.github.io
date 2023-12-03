---
layout: post
title: logstack 日志技术栈-05-windows10 elk install
date: 2023-10-30 21:01:55 +0800
categories: [Log]
tags: [log, elk, sh]
published: true
---

# 安装 Elasticsearch elasticsearch-8.11.1

## 下载

访问 [Elasticsearch 下载页面](https://www.elastic.co/downloads/elasticsearch)

解压下载的压缩文件到你选择的目录。

## 运行

进入 Elasticsearch 目录，运行 `bin/elasticsearch.bat` 启动 Elasticsearch。

## 验证

elaasticsearch的默认访问路径是localhost:9200，我们打开浏览器直接访问即可。

如果访问不了也没关系，我们可以先修改配置文件之后再进行访问。

注意：8.4.3我测试的无法直接打开默认网址，需要先进行配置（原因是：ES8默认开启了ssl认证，导致无法访问9200端口，elasticsearch.yml配置文件添加【xpack.security.enabled: false】即可）（https://zhuanlan.zhihu.com/p/504694531）

Elasticsearch在Windows下开启了安全认证，虽然started成功，但访问http://localhost:9200/失败（https://blog.csdn.net/zhangphil/article/details/124476717）

```
received plaintext traffic on an encrypted channel, closing connection Netty4TcpChannel
```

### 修改 elasticsearch.yml

原来是这样：

```yaml
# Enable security features
xpack.security.enabled: true

xpack.security.enrollment.enabled: true

# Enable encryption for HTTP API client connections, such as Kibana, Logstash, and Agents
xpack.security.http.ssl:
  enabled: true
  keystore.path: certs/http.p12

# Enable encryption and mutual authentication between cluster nodes
xpack.security.transport.ssl:
  enabled: true
  verification_mode: certificate
  keystore.path: certs/transport.p12
  truststore.path: certs/transport.p12
# Create a new cluster with the current node only
# Additional nodes can still join the cluster later
cluster.initial_master_nodes: ["PC-20230404XHIO"]

# Allow HTTP API connections from anywhere
# Connections are encrypted and require user authentication
http.host: 0.0.0.0
```

我们把几个安全的暂时都关闭掉。

```yaml
# Enable security features
xpack.security.enabled: false

xpack.security.enrollment.enabled: false

# Enable encryption for HTTP API client connections, such as Kibana, Logstash, and Agents
xpack.security.http.ssl:
  enabled: false
  keystore.path: certs/http.p12

# Enable encryption and mutual authentication between cluster nodes
xpack.security.transport.ssl:
  enabled: false
  verification_mode: certificate
  keystore.path: certs/transport.p12
  truststore.path: certs/transport.p12
# Create a new cluster with the current node only
# Additional nodes can still join the cluster later
cluster.initial_master_nodes: ["PC-20230404XHIO"]

# Allow HTTP API connections from anywhere
# Connections are encrypted and require user authentication
http.host: 0.0.0.0
```

重新启动 es。当然这只是为了演示关闭的，实际应用还是要注意安全问题。

PS: 我这里在启动日志中没有找到密码，按理说是有一个初始化密码的。

### 验证成功

此时访问 [http://localhost:9200/](http://localhost:9200/)


如下：

```json
{
  "name" : "PC-20230404XHIO",
  "cluster_name" : "elasticsearch",
  "cluster_uuid" : "gROAdkClQka3fHkZukU60A",
  "version" : {
    "number" : "8.11.1",
    "build_flavor" : "default",
    "build_type" : "zip",
    "build_hash" : "6f9ff581fbcde658e6f69d6ce03050f060d1fd0c",
    "build_date" : "2023-11-11T10:05:59.421038163Z",
    "build_snapshot" : false,
    "lucene_version" : "9.8.0",
    "minimum_wire_compatibility_version" : "7.17.0",
    "minimum_index_compatibility_version" : "7.0.0"
  },
  "tagline" : "You Know, for Search"
}
```

## 初始化与查询

1）创建 index

这会创建一个名为 `my_index` 的索引。

```
curl -X PUT "http://localhost:9200/my_index"
{"acknowledged":true,"shards_acknowledged":true,"index":"my_index"}
```

2) 添加一些文档

向刚刚创建的索引添加一些文档。使用 curl 或其他工具，发送一个 POST 请求。

例如：

这将在 `my_index` 索引中添加一个文档。


```
$ curl -X POST "http://192.168.1.13:9200/my_index/_doc/1" -H 'Content-Type: application/json' -d '{"title": "Hello", "content": "World"}'

{"_index":"my_index","_id":"1","_version":1,"result":"created","_shards":{"total":2,"successful":1,"failed":0},"_seq_no":0,"_primary_term":1}
```

PS: 192.168.1.13 这个是我的本机 IP

3) 最简单的查询：

1. **使用 curl 进行基本查询：**

查询整个索引的文档。

例如：

     ```bash
     curl -X GET "http://192.168.1.13:9200/my_index/_search"
     ```
   - 这将返回 `my_index` 索引中的所有文档。

如下：

```json
{"took":3,"timed_out":false,"_shards":{"total":1,"successful":1,"skipped":0,"failed":0},"hits":{"total":{"value":1,"relation":"eq"},"max_score":1.0,"hits":[{"_index":"my_index","_id":"1","_score":1.0,"_source":{"title": "Hello", "content": "World"}}]}}
```

2. **使用 Query DSL 进行更复杂的查询：**

   - 使用 Elasticsearch 的 Query DSL 进行更复杂的查询。
   
   例如，查询 `my_index` 索引中标题包含 "Hello" 的文档：

     ```bash
     curl -X GET "http://192.168.1.13:9200/my_index/_search" -H 'Content-Type: application/json' -d '{"query": {"match": {"title": "Hello"}}}'
     ```

结果如下：

```json
{"took":13,"timed_out":false,"_shards":{"total":1,"successful":1,"skipped":0,"failed":0},"hits":{"total":{"value":1,"relation":"eq"},"max_score":0.2876821,"hits":[{"_index":"my_index","_id":"1","_score":0.2876821,"_source":{"title": "Hello", "content": "World"}}]}}
```



# windows10 install kibana

## 下载

访问 [Kibana 下载页面](https://www.elastic.co/downloads/kibana)。

kibana-8.11.1-windows-x86_64.zip

解压

## 配置

进入 Kibana 目录，编辑 `config/kibana.yml` 文件，确保 `elasticsearch.hosts` 配置正确，指向你的 Elasticsearch 实例。

默认的配置如下：

```yaml
# =================== System: Elasticsearch ===================
# The URLs of the Elasticsearch instances to use for all your queries.
#elasticsearch.hosts: ["http://localhost:9200"]

# If your Elasticsearch is protected with basic authentication, these settings provide
# the username and password that the Kibana server uses to perform maintenance on the Kibana
# index at startup. Your Kibana users still need to authenticate with Elasticsearch, which
# is proxied through the Kibana server.
#elasticsearch.username: "kibana_system"
#elasticsearch.password: "pass"
```

我们暂时不修改.

## 启动

运行 `bin/kibana.bat` 启动 Kibana。

```
cd D:\tool\elk\kibana-8.11.1\bin
./kibana.bat
```


## 验证

在地址栏中输入 Kibana 的地址，默认情况下为 

[http://localhost:5601/](http://localhost:5601/)

然后再【Discover】中添加对应的数据信息。

把 index pattern 写成 【my_index】匹配我们前面 ES 中初始化的数据。

然后就可以看到这个对应的 index 页面了。

# 拓展

docker 安装？

# chat

## Q: ELK 技术栈 windows 如何安装？

在Windows上安装ELK（Elasticsearch, Logstash, Kibana）技术栈可以相对复杂，但以下是基本步骤，你可以按照这些步骤进行安装：

1. **安装 Java：**
   - ELK 技术栈的核心组件 Elasticsearch 和 Logstash 都需要 Java 运行环境。你可以从 Oracle 或 OpenJDK 下载并安装 Java。

2. **安装 Elasticsearch：**
   - 访问 [Elasticsearch 下载页面](https://www.elastic.co/downloads/elasticsearch)。
   - 下载适用于 Windows 的 Elasticsearch 安装包。
   - 解压下载的压缩文件到你选择的目录。
   - 进入 Elasticsearch 目录，运行 `bin/elasticsearch.bat` 启动 Elasticsearch。

3. **安装 Kibana：**
   - 访问 [Kibana 下载页面](https://www.elastic.co/downloads/kibana)。
   - 下载适用于 Windows 的 Kibana 压缩文件。
   - 解压下载的文件到你选择的目录。
   - 进入 Kibana 目录，编辑 `config/kibana.yml` 文件，确保 `elasticsearch.hosts` 配置正确，指向你的 Elasticsearch 实例。
   - 运行 `bin/kibana.bat` 启动 Kibana。

4. **安装 Logstash：**
   - 访问 [Logstash 下载页面](https://www.elastic.co/downloads/logstash)。
   - 下载适用于 Windows 的 Logstash 压缩文件。
   - 解压下载的文件到你选择的目录。
   - 进入 Logstash 目录，创建一个配置文件，例如 `logstash.conf`，配置 Logstash 的输入、过滤和输出。
   - 运行 `bin/logstash.bat -f logstash.conf` 启动 Logstash。

请注意，以上步骤提供了一个基本的安装和启动流程，你可能需要根据你的具体需求进行一些额外的配置。此外，确保你的系统符合 ELK 技术栈的版本要求，并在安装前检查相应的文档获取最新的信息。

此外，Windows 上还可以考虑使用 Elastic 提供的 MSI 安装程序，它提供了更便捷的安装过程。你可以在 Elastic 的官方网站上找到相应的 MSI 安装包。

## Q: ES 安装成功后，如何做最简单的数据初始化和查询？

一旦 Elasticsearch 安装成功，你可以进行最简单的数据初始化和查询以验证系统是否正常工作。以下是一些建议的步骤：

### 最简单的数据初始化：

1. **创建一个索引：**
   - 使用 curl 或者其他 HTTP 请求工具，向 Elasticsearch 发送一个 PUT 请求以创建一个索引。例如：
     ```bash
     curl -X PUT "http://localhost:9200/my_index"
     ```
   - 这会创建一个名为 `my_index` 的索引。

2. **添加一些文档：**
   - 向刚刚创建的索引添加一些文档。使用 curl 或其他工具，发送一个 POST 请求。例如：
     ```bash
     curl -X POST "http://localhost:9200/my_index/_doc/1" -H 'Content-Type: application/json' -d '{"title": "Hello", "content": "World"}'
     ```
   - 这将在 `my_index` 索引中添加一个文档。

### 最简单的查询：

1. **使用 curl 进行基本查询：**
   - 查询整个索引的文档。例如：
     ```bash
     curl -X GET "http://localhost:9200/my_index/_search"
     ```
   - 这将返回 `my_index` 索引中的所有文档。

2. **使用 Query DSL 进行更复杂的查询：**
   - 使用 Elasticsearch 的 Query DSL 进行更复杂的查询。例如，查询 `my_index` 索引中标题包含 "Hello" 的文档：
     ```bash
     curl -X GET "http://localhost:9200/my_index/_search" -H 'Content-Type: application/json' -d '{"query": {"match": {"title": "Hello"}}}'
     ```

3. **使用 Kibana 进行可视化查询：**
   - 打开 Kibana，连接到 Elasticsearch。
   - 在 Kibana 中，你可以使用图形用户界面（GUI）来构建和执行查询，以及查看数据的可视化效果。

请注意，以上只是一个入门的简单示例。在实际项目中，你可能会面对更复杂的数据建模、索引设置和查询需求。深入了解 Elasticsearch 的 Query DSL 和相关概念将有助于更有效地利用 Elasticsearch 的强大功能。在生产环境中，还需要考虑安全性、性能调优和数据管理等方面的问题。


## Q: 如何验证 kibana

一旦 Kibana 成功安装并启动，你可以通过浏览器访问 Kibana 的 Web 界面进行验证。以下是一些建议的步骤：

1. **打开浏览器：**
   - 打开你的 Web 浏览器（如 Chrome、Firefox、或 Edge）。

2. **访问 Kibana：**
   - 在地址栏中输入 Kibana 的地址，默认情况下为 `http://localhost:5601/`。

3. **登录 Kibana：**
   - 在第一次访问时，Kibana 通常会要求你设置初始密码。请按照提示进行设置。
   - 在登录页面输入用户名和密码登录。如果是第一次登录，使用设置的初始用户名和密码。

4. **验证 Kibana 主页：**
   - 一旦成功登录，你应该看到 Kibana 的主页。这个页面通常包含一些快速访问的面板，用于探索和可视化数据。

5. **创建索引模式：**
   - 在 Kibana 中，你需要创建一个索引模式来指定你想要在 Kibana 中探索的数据。
   - 转到 "Management"（管理）页面，选择 "Index Patterns"（索引模式），然后创建一个新的索引模式，指向你 Elasticsearch 中的索引。

6. **执行查询和创建仪表板：**
   - 转到 "Discover"（探索）页面，执行一些简单的查询，确保你可以在 Kibana 中看到数据。
   - 探索页面允许你执行查询并查看原始文档，而 "Visualize"（可视化）和 "Dashboard"（仪表板）页面则用于创建和展示数据可视化。

这些步骤应该帮助你验证 Kibana 是否正确安装并与 Elasticsearch 集成。

请注意，具体的步骤可能会根据你的 Kibana 版本和配置有所不同。如果遇到任何问题，请查看 Kibana 的日志文件以获取更多信息。

## 如何匹配 my_index

在 Kibana 中配置索引模式时，你需要确保模式能够正确匹配你的 Elasticsearch 索引。对于 `my_index` 这个例子，你可以按照以下步骤创建索引模式：

1. 打开 Kibana 并登录。

2. 转到 "Management"（管理）页面。

3. 选择 "Index Patterns"（索引模式）。

4. 点击 "Create index pattern"（创建索引模式）按钮。

5. 在 "Index pattern" 字段中输入 `my_index`。

6. Kibana 会尝试匹配以 `my_index` 开头的索引，选择正确的索引模式后，点击 "Next step"（下一步）。

7. 在 "Time Filter field name"（时间过滤字段名称）中选择一个适合的时间字段（如果你的索引包含时间信息）。这是可选的。

8. 点击 "Create index pattern"（创建索引模式）完成配置。

这样，你就成功创建了一个与 `my_index` 匹配的索引模式。在 Kibana 中，你现在可以使用该索引模式探索和可视化 `my_index` 中的数据。

请注意，索引模式的名称通常可以使用通配符，例如 `*`，以匹配多个索引。如果你的索引有时间戳，你还可以使用日期通配符，例如 `[my_index-]YYYY.MM.DD`，以按日期分割的索引命名规范来匹配。

如果有其他字段或特定配置在索引模式中需要处理，请根据实际情况进行调整。

# 参考资料

chat

https://www.cnblogs.com/hualess/p/11540477.html

https://www.cnblogs.com/djd66/p/16824935.html

* any list
{:toc}