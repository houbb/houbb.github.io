---
layout: post
title: 数据库变化监听 database Change Data Capture cdc-02-Maxwell's daemon, a mysql-to-json kafka producer
date:  2019-2-13 09:48:27 +0800
categories: [Database]
tags: [database, sharding, mysql, cdc, canal, sh]
published: true
---

# 拓展阅读

[Debezium-01-为捕获数据更改(change data capture,CDC)提供了一个低延迟的流式处理平台。](https://houbb.github.io/2019/02/13/database-sharding-cdc-debezium)

[logstash 日志处理-06-Apache NiFi](https://houbb.github.io/2023/10/30/logstash-06-apache-nifi)

[canal 阿里巴巴 MySQL binlog 增量订阅&消费组件](https://houbb.github.io/2019/02/13/database-sharding-deploy-canal)

[ETL-01-DataX 是阿里云DataWorks数据集成的开源版本。](https://houbb.github.io/2024/01/05/etl-datasource-datax-02-crud)

# 入门

这是Maxwell的守护程序，是一个变更数据捕获应用程序，它读取MySQL二进制日志，并将数据变更以JSON格式写入Kafka、Kinesis和其他流式平台。

## 用途是什么？

- 各种ETL操作

- 维护数据库所有更改的审计日志

- 缓存构建/过期

- 搜索索引

- 服务间通信

## 效果

```
  mysql> update `test`.`maxwell` set mycol = 55, daemon = 'Stanislaw Lem';
  maxwell -> kafka: 
  {
    "database": "test",
    "table": "maxwell",
    "type": "insert",
    "ts": 1449786310,
    "data": { "id":1, "daemon": "Stanislaw Lem", "mycol": 55 },
    "old": { "mycol":, 23, "daemon": "what once was" }
  }
```

# 快速开始

## 下载

下载二进制发行版: [https://github.com/zendesk/maxwell/releases/download/v1.41.0/maxwell-1.41.0.tar.gz](https://github.com/zendesk/maxwell/releases/download/v1.41.0/maxwell-1.41.0.tar.gz)
源代码和错误跟踪可在 GitHub 上找到: [https://github.com/zendesk/maxwell](https://github.com/zendesk/maxwell)

使用curl:

```bash
curl -sLo - https://github.com/zendesk/maxwell/releases/download/v1.41.0/maxwell-1.41.0.tar.gz \
       | tar zxvf -
cd maxwell-1.41.0
```

使用Docker:

```bash
docker pull zendesk/maxwell
```

使用Homebrew:

```bash
brew install maxwell
```

## 配置MySQL

- config file

```
# /etc/my.cnf

[mysqld]
# maxwell needs binlog_format=row
binlog_format=row
server_id=1 
log-bin=master
```

- mysql

```sql
mysql> CREATE USER 'maxwell'@'%' IDENTIFIED BY 'XXXXXX';
mysql> CREATE USER 'maxwell'@'localhost' IDENTIFIED BY 'XXXXXX';

mysql> GRANT ALL ON maxwell.* TO 'maxwell'@'%';
mysql> GRANT ALL ON maxwell.* TO 'maxwell'@'localhost';

mysql> GRANT SELECT, REPLICATION CLIENT, REPLICATION SLAVE ON *.* TO 'maxwell'@'%';
mysql> GRANT SELECT, REPLICATION CLIENT, REPLICATION SLAVE ON *.* TO 'maxwell'@'localhost';
```

# Run Maxwell

## Command line

```
bin/maxwell --user='maxwell' --password='XXXXXX' --host='127.0.0.1' --producer=stdout
```

## Docker

```
docker run -it --rm zendesk/maxwell bin/maxwell --user=$MYSQL_USERNAME \
    --password=$MYSQL_PASSWORD --host=$MYSQL_HOST --producer=stdout
```

## Kafka

Boot kafka as described here: http://kafka.apache.org/documentation.html#quickstart, then:

```
bin/maxwell --user='maxwell' --password='XXXXXX' --host='127.0.0.1' \
   --producer=kafka --kafka.bootstrap.servers=localhost:9092 --kafka_topic=maxwell
```

(or docker):


```
docker run -it --rm zendesk/maxwell bin/maxwell --user=$MYSQL_USERNAME \
    --password=$MYSQL_PASSWORD --host=$MYSQL_HOST --producer=kafka \
    --kafka.bootstrap.servers=$KAFKA_HOST:$KAFKA_PORT --kafka_topic=maxwell
```

## Kinesis

```
docker run -it --rm --name maxwell -v `cd && pwd`/.aws:/root/.aws zendesk/maxwell sh -c 'cp /app/kinesis-producer-library.properties.example /app/kinesis-producer-library.properties && echo "Region=$AWS_DEFAULT_REGION" >> /app/kinesis-producer-library.properties && bin/maxwell --user=$MYSQL_USERNAME --password=$MYSQL_PASSWORD --host=$MYSQL_HOST --producer=kinesis --kinesis_stream=$KINESIS_STREAM'
```

## Nats

```
bin/maxwell --user='maxwell' --password='XXXXXX' --host='127.0.0.1' \
    --producer=nats --nats_url=='0.0.0.0:4222'
```

## Google Cloud Pub/Sub

```
bin/maxwell --user='maxwell' --password='XXXXXX' --host='127.0.0.1' \
  --producer=pubsub --pubsub_project_id='$PUBSUB_PROJECT_ID' \
  --pubsub_topic='maxwell'
```

## Google Cloud Bigquery

```
bin/maxwell --user='maxwell' --password='XXXXXX' --host='127.0.0.1' \
  --producer=bigquery --bigquery_project_id='$BIGQUERY_PROJECT_ID' \
  --bigquery_dataset='$BIGQUERY_DATASET' \
  --bigquery_table='$BIGQUERY_TABLE'
```

## RabbitMQ

```
bin/maxwell --user='maxwell' --password='XXXXXX' --host='127.0.0.1' \
    --producer=rabbitmq --rabbitmq_host='rabbitmq.hostname'
```

## Redis

```
bin/maxwell --user='maxwell' --password='XXXXXX' --host='127.0.0.1' \
    --producer=redis --redis_host=redis.hostname
```

## SNS

```
bin/maxwell --user='maxwell' --password='XXXXXX' --host='127.0.0.1' \
    --producer=sns --sns_topic=sns.topic --sns_attrs=database,table
```

# 参考资料 

https://github.com/zendesk/maxwell

https://maxwells-daemon.io/quickstart/

* any list
{:toc}