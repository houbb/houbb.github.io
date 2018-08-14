---
layout: post
title:  Apache Solr
date:  2017-8-22 19:00:16 +0800
categories: [Apache]
tags: [apache, solr, search]
published: true
---

# Apache Solr

[Solr](http://lucene.apache.org/solr/) is the popular, blazing-fast, open source enterprise search platform built on [Apache Lucene™](https://lucene.apache.org/).


- Lucene vs Solr

[Lucene vs Solr](http://www.lucenetutorial.com/lucene-vs-solr.html).

简而言之，Lucene 是引擎，Solr 是小汽车。

快速使用，可以使用 Solr, 自由装配可以使用 Lucene。


# Hello World

> [solr quick start](http://lucene.apache.org/solr/quickstart.html)

> [zh_CN base](http://www.yiibai.com/solr/)

一、Download & Unzip

[Download](http://www.apache.org/dyn/closer.lua/lucene/solr/6.6.0) solr here;

解压至任意文件夹。

二、Start

`D:\Learn\apache\solr\solr-6.6.0\bin` 至根目录下。

`solr start -e cloud -noprompt` 运行 solr

```
[c:\~]$ cd D:\Learn\apache\solr\solr-6.6.0\bin
[D:\Learn\apache\solr\solr-6.6.0\bin]$ solr start -e cloud -noprompt

Welcome to the SolrCloud example!

Starting up 2 Solr nodes for your example SolrCloud cluster.

Creating Solr home directory D:\Learn\apache\solr\solr-6.6.0\example\cloud\node1\solr
Cloning D:\Learn\apache\solr\solr-6.6.0\example\cloud\node1 into
                                                                   D:\Learn\apache\solr\solr-6.6.0\example\cloud\node2

Starting up Solr on port 8983 using command:
"D:\Learn\apache\solr\solr-6.6.0\bin\solr.cmd" start -cloud -p 8983 -s "D:\Learn\apache\solr\solr-6.6.0\example\cloud\node1\solr"

Waiting up to 30 to see Solr running on port 8983

Starting up Solr on port 7574 using command:
"D:\Learn\apache\solr\solr-6.6.0\bin\solr.cmd" start -cloud -p 7574 -s "D:\Learn\apache\solr\solr-6.6.0\example\cloud\node2\solr" -z localhost:9983

Started Solr server on port 8983. Happy searching!
Waiting up to 30 to see Solr running on port 7574
Started Solr server on port 7574. Happy searching!
INFO  - 2017-08-23 13:11:38.968; org.apache.solr.client.solrj.impl.ZkClientClusterStateProvider; Cluster at localhost:9983 ready

Connecting to ZooKeeper at localhost:9983 ...
INFO  - 2017-08-23 13:11:39.039; org.apache.solr.client.solrj.impl.ZkClientClusterStateProvider; Cluster at localhost:9983 ready
Uploading D:\Learn\apache\solr\solr-6.6.0\server\solr\configsets\data_driven_schema_configs\conf for config gettingstarted to ZooKeeper at localhost:9983

Creating new collection 'gettingstarted' using command:
                                                       http://localhost:8983/solr/admin/collections?action=CREATE&name=gettingstarted&numShards=2&replicationFactor=2&maxShardsPerNode=2&collection.configName=gettingstarted

{
   "responseHeader":{
                         "status":0,
                                        "QTime":8456},
                                                        "success":{
                                                                       "192.168.5.79:8983_solr":{
                                                                                                       "responseHeader":{
                                                                                                                                 "status":0,
                                                                                                                                                   "QTime":6691},
                           "core":"gettingstarted_shard2_replica1"},
                                                                        "192.168.5.79:7574_solr":{
                                                                                                        "responseHeader":{
                                                                                                                                  "status":0,
         "QTime":6874},
                             "core":"gettingstarted_shard1_replica2"}}}

Enabling auto soft-commits with maxTime 3 secs using the Config API

POSTing request to Config API: http://localhost:8983/solr/gettingstarted/config
{"set-property":{"updateHandler.autoSoftCommit.maxTime":"3000"}}
Successfully set-property updateHandler.autoSoftCommit.maxTime to 3000


SolrCloud example running, please visit: http://localhost:8983/solr 
```

三、Visit

访问 `http://localhost:8983/solr`

![apache-solr-index](https://raw.githubusercontent.com/houbb/resource/master/img/apache/solr/2017-08-23-apache-solr-index.png)


# Indexing Data

经过上面的操作，solr 服务已经启动，但是不包含任何数据。

(测试时系统切换至 MAC，所以路径有所调整)

```
houbinbindeMacBook-Pro:solr-6.6.0 houbinbin$ pwd
/Users/houbinbin/it/learn/solr/solr-6.6.0
houbinbindeMacBook-Pro:solr-6.6.0 houbinbin$ ls
CHANGES.txt		README.txt		docs
LICENSE.txt		bin			example
LUCENE_CHANGES.txt	contrib			licenses
NOTICE.txt		dist			server
```

## 包含各种文件的文件夹

官网的例子一上来就这么暴力，可以直接为包含各种类型文件的文件夹添加索引。(iHTML, PDF, Microsoft Office formats (such as MS Word), plain text and many other formats.)


运行：

```
$ bin/post -c gettingstarted docs/
```

命令行日志如下：

```
/Library/Java/JavaVirtualMachines/jdk1.8.0_91.jdk/Contents/Home/bin/java -classpath /Users/houbinbin/it/learn/solr/solr-6.6.0/dist/solr-core-6.6.0.jar -Dauto=yes -Dc=gettingstarted -Ddata=files -Drecursive=yes org.apache.solr.util.SimplePostTool docs/
SimplePostTool version 5.0.0
Posting files to [base] url http://localhost:8983/solr/gettingstarted/update...
Entering auto mode. File endings considered are xml,json,jsonl,csv,pdf,doc,docx,ppt,pptx,xls,xlsx,odt,odp,ods,ott,otp,ots,rtf,htm,html,txt,log
Entering recursive mode, max depth=999, delay=0s
Indexing directory docs (1 files, depth=0)
POSTing file index.html (text/html) to [base]/extract
Indexing directory docs/images (0 files, depth=1)
1 files indexed.
COMMITting Solr index changes to http://localhost:8983/solr/gettingstarted/update...
Time spent: 0:00:01.417
```

为了观察添加后的效果，在这个路径下面

```
http://localhost:8983/solr/#/gettingstarted/query
```

将 q 搜索框的内容 `*:*` 切换成 `solr`(内部会调用如下[http://localhost:8983/solr/gettingstarted/select?indent=on&q=solr&wt=json](http://localhost:8983/solr/gettingstarted/select?indent=on&q=solr&wt=json))

返回内容如下：

```json
{
  "responseHeader":{
    "zkConnected":true,
    "status":0,
    "QTime":10,
    "params":{
      "q":"solr",
      "indent":"on",
      "wt":"json"}},
  "response":{"numFound":1,"start":0,"maxScore":0.6017728,"docs":[
      {
        "id":"/Users/houbinbin/IT/learn/solr/solr-6.6.0/docs/index.html",
        "stream_size":[819],
        "x_parsed_by":["org.apache.tika.parser.DefaultParser",
          "org.apache.tika.parser.html.HtmlParser"],
        "stream_content_type":["text/html"],
        "dc_title":["Apache Solr 6.6.0 Documentation"],
        "content_encoding":["UTF-8"],
        "content_type_hint":["text/html; charset=UTF-8"],
        "resourcename":["/Users/houbinbin/IT/learn/solr/solr-6.6.0/docs/index.html"],
        "title":["Apache Solr 6.6.0 Documentation"],
        "content_type":["text/html; charset=UTF-8"],
        "_version_":1576527384909185024}]
  }}
```

## Indexing Solr XML

觉得这个及后面的是对各种文件类型的细化。

运行：

```
$ bin/post -c gettingstarted example/exampledocs/*.xml
```

命令行日志：

```
/Library/Java/JavaVirtualMachines/jdk1.8.0_91.jdk/Contents/Home/bin/java -classpath /Users/houbinbin/it/learn/solr/solr-6.6.0/dist/solr-core-6.6.0.jar -Dauto=yes -Dc=gettingstarted -Ddata=files org.apache.solr.util.SimplePostTool example/exampledocs/gb18030-example.xml example/exampledocs/hd.xml example/exampledocs/ipod_other.xml example/exampledocs/ipod_video.xml example/exampledocs/manufacturers.xml example/exampledocs/mem.xml example/exampledocs/money.xml example/exampledocs/monitor.xml example/exampledocs/monitor2.xml example/exampledocs/mp500.xml example/exampledocs/sd500.xml example/exampledocs/solr.xml example/exampledocs/utf8-example.xml example/exampledocs/vidcard.xml
SimplePostTool version 5.0.0
Posting files to [base] url http://localhost:8983/solr/gettingstarted/update...
Entering auto mode. File endings considered are xml,json,jsonl,csv,pdf,doc,docx,ppt,pptx,xls,xlsx,odt,odp,ods,ott,otp,ots,rtf,htm,html,txt,log
POSTing file gb18030-example.xml (application/xml) to [base]
POSTing file hd.xml (application/xml) to [base]
POSTing file ipod_other.xml (application/xml) to [base]
POSTing file ipod_video.xml (application/xml) to [base]
POSTing file manufacturers.xml (application/xml) to [base]
POSTing file mem.xml (application/xml) to [base]
POSTing file money.xml (application/xml) to [base]
POSTing file monitor.xml (application/xml) to [base]
POSTing file monitor2.xml (application/xml) to [base]
POSTing file mp500.xml (application/xml) to [base]
POSTing file sd500.xml (application/xml) to [base]
POSTing file solr.xml (application/xml) to [base]
POSTing file utf8-example.xml (application/xml) to [base]
POSTing file vidcard.xml (application/xml) to [base]
14 files indexed.
COMMITting Solr index changes to http://localhost:8983/solr/gettingstarted/update...
Time spent: 0:00:01.971
```

## Indexing JSON

（此处及后面的不再赘述）

```
$   bin/post -c gettingstarted example/exampledocs/books.json
```

```
/Library/Java/JavaVirtualMachines/jdk1.8.0_91.jdk/Contents/Home/bin/java -classpath /Users/houbinbin/it/learn/solr/solr-6.6.0/dist/solr-core-6.6.0.jar -Dauto=yes -Dc=gettingstarted -Ddata=files org.apache.solr.util.SimplePostTool example/exampledocs/books.json
SimplePostTool version 5.0.0
Posting files to [base] url http://localhost:8983/solr/gettingstarted/update...
Entering auto mode. File endings considered are xml,json,jsonl,csv,pdf,doc,docx,ppt,pptx,xls,xlsx,odt,odp,ods,ott,otp,ots,rtf,htm,html,txt,log
POSTing file books.json (application/json) to [base]/json/docs
1 files indexed.
COMMITting Solr index changes to http://localhost:8983/solr/gettingstarted/update...
Time spent: 0:00:00.389
```

## Indexing CSV

```
$ bin/post -c gettingstarted example/exampledocs/books.csv

/Library/Java/JavaVirtualMachines/jdk1.8.0_91.jdk/Contents/Home/bin/java -classpath /Users/houbinbin/it/learn/solr/solr-6.6.0/dist/solr-core-6.6.0.jar -Dauto=yes -Dc=gettingstarted -Ddata=files org.apache.solr.util.SimplePostTool example/exampledocs/books.csv
SimplePostTool version 5.0.0
Posting files to [base] url http://localhost:8983/solr/gettingstarted/update...
Entering auto mode. File endings considered are xml,json,jsonl,csv,pdf,doc,docx,ppt,pptx,xls,xlsx,odt,odp,ods,ott,otp,ots,rtf,htm,html,txt,log
POSTing file books.csv (text/csv) to [base]
1 files indexed.
COMMITting Solr index changes to http://localhost:8983/solr/gettingstarted/update...
Time spent: 0:00:00.100
```


# Updating Data

- numDocs

numDocs represents the number of searchable documents in the index (and will be larger than the number of XML, JSON, or CSV files since some files contained more than one document). 

- maxDoc

The maxDoc value may be larger as the maxDoc count includes logically deleted documents that have not yet been physically removed from the index. 


# Deleting Data

执行：

```
$   bin/post -c gettingstarted -d "<delete><id>SP2514N</id></delete>"

/Library/Java/JavaVirtualMachines/jdk1.8.0_91.jdk/Contents/Home/bin/java -classpath /Users/houbinbin/it/learn/solr/solr-6.6.0/dist/solr-core-6.6.0.jar -Dauto=yes -Dc=gettingstarted -Ddata=args org.apache.solr.util.SimplePostTool <delete><id>SP2514N</id></delete>
SimplePostTool version 5.0.0
POSTing args to http://localhost:8983/solr/gettingstarted/update...
COMMITting Solr index changes to http://localhost:8983/solr/gettingstarted/update...
Time spent: 0:00:00.051
```

# Searching 

可以尝试执行下面的命令。

```
$   curl "http://localhost:8983/solr/gettingstarted/select?indent=on&q=*:*&wt=json"
```

| 参数	   |  描述 |
|:---|:---|
| q	        | 这是Apache Solr的主要查询参数，文档根据它们与此参数中的术语的相似性来评分。|
| fq	    | 这个参数表示Apache Solr的过滤器查询，将结果集限制为与此过滤器匹配的文档。|
| start	    | start参数表示页面的起始偏移量，此参数的默认值为0。|
| rows	    | 这个参数表示每页要检索的文档的数量。此参数的默认值为10。|
| sort	    | 这个参数指定由逗号分隔的字段列表，根据该列表对查询的结果进行排序。|
| fl	    | 这个参数为结果集中的每个文档指定返回的字段列表。|
| wt	    | 这个参数表示要查看响应结果的写入程序的类型。|


<label class="label label-success">Tips</label>

内部实现仍为 lucene，可以参考 [kibana 使用的 lucene 查询语法](https://segmentfault.com/a/1190000002972420)

官方推荐 [Solr Reference Guide's Searching section](https://cwiki.apache.org/confluence/display/solr/Searching)

 
# Faceting

One of Solr's most popular features is faceting. 

Faceting allows the search results to be arranged into subsets (or buckets or categories), providing a count for each subset. 

There are several types of faceting: field values, numeric and date ranges, pivots (decision tree), and arbitrary query faceting.


执行 [http://localhost:8983/solr/gettingstarted/select?facet.field=author&facet=on&indent=on&q=solr&wt=json](http://localhost:8983/solr/gettingstarted/select?facet.field=author&facet=on&indent=on&q=solr&wt=json)

结果

```json
...

"facet_counts":{
    "facet_queries":{},
    "facet_fields":{
      "author":[
        "George R.R. Martin",0,
        "Glen Cook",0,
        "Isaac Asimov",0,
        "Jostein Gaarder",0,
        "Lloyd Alexander",0,
        "Michael McCandless",0,
        "Orson Scott Card",0,
        "Rick Riordan",0,
        "Roger Zelazny",0,
        "Steven Brust",0]},
    "facet_ranges":{},
    "facet_intervals":{},
    "facet_heatmaps":{}
}
```

查询的结果会根据 `facet.field=author` 进行分组。


# Cleanup

```
$   bin/solr stop -all
```

可以停止服务。


* any list
{:toc}


