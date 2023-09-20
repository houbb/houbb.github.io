---
layout: post
title:  ElasticSearch知识体系详解-21备份和迁移
date:   2015-01-01 23:20:27 +0800
categories: [ElasticSearch知识体系详解]
tags: [ElasticSearch知识体系详解, other]
published: true
---



21 备份和迁移
## 方案

### 离线方案

* Snapshot
* Reindex
* Logstash
* ElasticSearch-dump
* ElasticSearch-Exporter

### 增量备份方案

* logstash

## 使用快照进行备份

### 配置信息

注册前要注意配置文件加上: elasticsearch.yml
path.repo: ["/opt/elasticsearch/backup"]

### 创建仓库

注册一个仓库，存放快照，记住，这里不是生成快照，只是注册一个仓库
 
curl -XPUT 'http://10.11.60.5:9200/_snapshot/repo_backup_1' -H 'Content-Type: application/json' -d '{ "type": "fs", "settings": { "location": "/opt/elasticsearch/backup", "max_snapshot_bytes_per_sec": "20mb", "max_restore_bytes_per_sec": "20mb", "compress": true } }'

查看仓库信息:

curl -XGET 'http://10.11.60.5:9200/_snapshot/repo_backup_1?pretty'

返回内容

[root@STOR-ES elasticsearch]/# curl -XGET 'http://10.11.60.5:9200/_snapshot/repo_backup_1?pretty' { "repo_backup_1" : { "type" : "fs", "settings" : { "location" : "/opt/elasticsearch/backup", "max_restore_bytes_per_sec" : "20mb", "compress" : "true", "max_snapshot_bytes_per_sec" : "20mb" } } }

### 创建快照

curl -XPUT 'http://10.11.60.5:9200/_snapshot/repo_backup_1/snapshot_1?wait_for_completion=true&pretty' -H 'Content-Type: application/json' -d '{ "indices": "bro-2019-09-14,bro-2019-09-15,wmi-2019-09-14,wmi-2019-09-15,syslog-2019-09-14,sylog-2019-09-15", "rename_pattern": "bro_(.+)", "rename_replacement": "dev_bro_$1", "ignore_unavailable": true, "include_global_state": true }'

执行

{ "snapshot" : { "snapshot" : "snapshot_1", "version_id" : 2040399, "version" : "2.4.3", "indices" : [ "bro-2019-09-14", "bro-2019-09-15", "wmi-2019-09-15", "syslog-2019-09-14", "wmi-2019-09-14" ], "state" : "SUCCESS", "start_time" : "2019-09-18T05:58:08.860Z", "start_time_in_millis" : 1568786288860, "end_time" : "2019-09-18T06:02:18.037Z", "end_time_in_millis" : 1568786538037, "duration_in_millis" : 249177, "failures" : [ ], "shards" : { "total" : 25, "failed" : 0, "successful" : 25 } } }

### 恢复数据

## 方案使用场景

## 迁移考虑的问题

* 版本问题，从低版本到高版本数据的迁移
* 多租户的适配问题
多个工厂的数据进入不同index, 原有的数据bro-2019-09-15的数据需要进入factorycode-bro-2019-09-15

* 多次或者分批迁移数据
* 数据在迁移时候富化
* FieldMapping 和 数据信息 分离?




# 参考资料

https://learn.lianglianglee.com/%e4%b8%93%e6%a0%8f/ElasticSearch%e7%9f%a5%e8%af%86%e4%bd%93%e7%b3%bb%e8%af%a6%e8%a7%a3/21%20%e5%a4%87%e4%bb%bd%e5%92%8c%e8%bf%81%e7%a7%bb.md

* any list
{:toc}
