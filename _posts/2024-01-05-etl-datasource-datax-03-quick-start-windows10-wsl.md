---
layout: post
title: ETL-03-数据同步之 DataX 快速入门实战笔记
date: 2024-01-05 21:01:55 +0800
categories: [ETL]
tags: [etl, in-action, sh]
published: true
---

# DataX

DataX 是阿里巴巴集团内被广泛使用的离线数据同步工具/平台，实现包括 MySQL、SQL Server、Oracle、PostgreSQL、HDFS、Hive、HBase、OTS、ODPS 等各种异构数据源之间高效的数据同步功能。

## Features

DataX本身作为数据同步框架，将不同数据源的同步抽象为从源头数据源读取数据的Reader插件，以及向目标端写入数据的Writer插件，理论上DataX框架可以支持任意数据源类型的数据同步工作。

同时DataX插件体系作为一套生态系统, 每接入一套新数据源该新加入的数据源即可实现和现有的数据源互通。

# 准备工作

- Linux

- JDK(1.8以上，推荐1.8)

- Python(2或3都可以)

- Apache Maven 3.x (Compile DataX)

此处为了方便，直接使用 windows WSL

```
$ java -version
openjdk version "1.8.0_302"
OpenJDK Runtime Environment (Zulu 8.56.0.21-CA-linux64) (build 1.8.0_302-b08)
OpenJDK 64-Bit Server VM (Zulu 8.56.0.21-CA-linux64) (build 25.302-b08, mixed mode)
```

此处不进行源码编译，所以 maven 可选。

## 安装 python3

``
```bash
sudo apt install python3

$ python3 --version
Python 3.10.12
```

# 实战笔记

## 下载

直接下载DataX工具包：[DataX下载地址](https://datax-opensource.oss-cn-hangzhou.aliyuncs.com/202309/datax.tar.gz)

```sh
wget https://datax-opensource.oss-cn-hangzhou.aliyuncs.com/202309/datax.tar.gz
```

解压

```bash
cd /home/houbinbin/datax
tar -zxvf datax.tar.gz
```

效果

```
$ pwd
/home/houbinbin/datax/datax

$ ls
bin  conf  job  lib  plugin  script  tmp
```

## 配置一个流读取

```bash
vi stream2stream.json 
```

内容如下：

```json
{
  "job": {
    "content": [
      {
        "reader": {
          "name": "streamreader",
          "parameter": {
            "sliceRecordCount": 10,
            "column": [
              {
                "type": "long",
                "value": "10"
              },
              {
                "type": "string",
                "value": "hello world-DataX"
              }
            ]
          }
        },
        "writer": {
          "name": "streamwriter",
          "parameter": {
            "encoding": "UTF-8",
            "print": true
          }
        }
      }
    ],
    "setting": {
      "speed": {
        "channel": 5
       }
    }
  }
}
```

## 运行任务

```sh
python3 bin/datax.py stream2stream.json
```

我这里是 python3

日志如下：

```
2024-01-27 20:57:02.262 [job-0] INFO  JobContainer - PerfTrace not enable!
2024-01-27 20:57:02.263 [job-0] INFO  StandAloneJobContainerCommunicator - Total 50 records, 950 bytes | Speed 95B/s, 5 records/s | Error 0 records, 0 bytes |  All Task WaitWriterTime 0.000s |  All Task WaitReaderTime 0.002s | Percentage 100.00%
2024-01-27 20:57:02.264 [job-0] INFO  JobContainer -
任务启动时刻                    : 2024-01-27 20:56:52
任务结束时刻                    : 2024-01-27 20:57:02
任务总计耗时                    :                 10s
任务平均流量                    :               95B/s
记录写入速度                    :              5rec/s
读出记录总数                    :                  50
读写失败总数                    :                   0
```

# 小结

datax 其实本身作为一个同步工具，功能还是非常强大的，包含了很多常见的数据信息。

不过目前并不支持 mysql cdc 之类的，有点是架构简单，不过缺点是单机存在瓶颈。

如果你需要 mysql cdc，可以看一下阿里的 canal

> [canal-03-canal windows10 wsl 实战笔记](https://houbb.github.io/2019/02/13/database-cdc-mysql-binlog-canal-03-quick-start)

# 参考资料

https://github.com/alibaba/DataX/blob/master/userGuid.md

* any list
{:toc}