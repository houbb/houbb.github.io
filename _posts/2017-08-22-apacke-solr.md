---
layout: post
title:  Apache Solr
date:  2017-8-22 19:00:16 +0800
categories: [Apache]
tags: [apache, solr]
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

![apache-solr-index]({{ site.url }}/static/app/img/apache/solr/2017-08-23-apache-solr-index.png)


TBC...
